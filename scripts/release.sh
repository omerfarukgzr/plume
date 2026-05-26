#!/usr/bin/env bash
#
# One-command release: changeset → version bump → build → publish → commit → tag → push.
#
#   pnpm ship "Short summary of the change"
#
# Bumps all three packages (they're a changesets `fixed` group) by a `patch` by
# default; pass `minor` / `major` as the 2nd arg for a bigger bump:
#
#   pnpm ship "New v-model API" minor
#
# Auth: publishing needs an npm token that bypasses 2FA. Either
#   • store one once in ~/.npmrc:  //registry.npmjs.org/:_authToken=npm_XXXX
#   • or run with it inline:       NPM_TOKEN=npm_XXXX pnpm ship "msg"
#
set -euo pipefail
cd "$(dirname "$0")/.."

MSG="${1:-}"
BUMP="${2:-patch}"
if [ -z "$MSG" ]; then
  echo "usage: pnpm ship \"summary of the change\" [patch|minor|major]" >&2
  exit 1
fi
case "$BUMP" in patch|minor|major) ;; *) echo "bump must be patch|minor|major, got: $BUMP" >&2; exit 1 ;; esac

# Refuse to release a dirty tree — surprises in the published tarball are worse
# than a one-line "commit/stash first".
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty. Commit or stash your changes first." >&2
  exit 1
fi

# Auth preflight: token in env, or already-authed ~/.npmrc.
TMPRC=""
if [ -n "${NPM_TOKEN:-}" ]; then
  TMPRC="$(mktemp)"
  printf '//registry.npmjs.org/:_authToken=%s\n' "$NPM_TOKEN" > "$TMPRC"
  export NPM_CONFIG_USERCONFIG="$TMPRC"
fi
cleanup() { [ -n "$TMPRC" ] && rm -f "$TMPRC"; }
trap cleanup EXIT
if ! npm whoami >/dev/null 2>&1; then
  echo "Not authenticated to npm. Put a token in ~/.npmrc or set NPM_TOKEN=npm_XXXX." >&2
  exit 1
fi
echo "→ npm user: $(npm whoami)"

# 1. changeset describing the bump (consumed by the version step).
CS=".changeset/ship-$(date +%s).md"
cat > "$CS" <<EOF
---
'@useplume/core': $BUMP
'@useplume/react': $BUMP
'@useplume/vue': $BUMP
---

$MSG
EOF

# 2. version bump + CHANGELOGs (consumes the changeset).
pnpm version-packages
VER="$(node -p "require('./packages/core/package.json').version")"
echo "→ releasing v$VER ($BUMP)"

# 3. build the publishable packages.
pnpm turbo run build "--filter=./packages/*"

# 4. commit the version bump + your already-committed source change.
git add -A
git commit -m "release: v$VER — $MSG"

# 5. publish. pnpm rewrites the `workspace:^` deps to real versions; already
#    published versions are skipped, so re-running is safe.
pnpm -r publish --access public --no-git-checks

# 6. tag each package (matches the convention used by changesets CI) and push.
for pkg in core react vue; do git tag "@useplume/$pkg@$VER"; done
git push origin HEAD --follow-tags

echo "✓ Shipped v$VER and pushed to $(git rev-parse --abbrev-ref HEAD)."
