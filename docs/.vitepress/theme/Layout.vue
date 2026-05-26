<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import PlumeDemo from './components/PlumeDemo.vue'

const { Layout } = DefaultTheme
const { lang } = useData()
</script>

<template>
  <Layout>
    <!-- Compact live editor right under the hero on the home page. -->
    <template #home-hero-after>
      <div class="home-demo">
        <div class="home-demo__inner">
          <ClientOnly>
            <PlumeDemo compact :locale="lang === 'tr' ? 'tr' : 'en'" />
          </ClientOnly>
        </div>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.home-demo {
  padding: 0 24px;
}
.home-demo__inner {
  max-width: 960px;
  margin: 8px auto 0;
}
</style>
