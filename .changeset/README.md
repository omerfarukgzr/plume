# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

When you make a change to one of the published packages (`@plume/core`,
`@plume/react`, `@plume/vue`), run:

```bash
pnpm changeset
```

Pick the affected packages and the semver bump (patch / minor / major), and
write a short summary. A markdown file describing the change is added here and
consumed by CI to version and publish the packages.
