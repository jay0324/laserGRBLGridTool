<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar>
          <img src="~assets/logo.svg" />
        </q-avatar>
        <q-toolbar-title>
          {{ $t('appName') }}
          <span class="text-overline">v{{ $appVersion }}</span>
        </q-toolbar-title>
        <LanguageSwitcher />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import LanguageSwitcher from 'src/components/LanguageSwitcher.vue'

export default {
  components: {
    LanguageSwitcher,
  },
}
</script>
