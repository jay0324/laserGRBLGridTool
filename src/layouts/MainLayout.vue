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

        <q-btn
          round
          color="red"
          href="https://github.com/jay0324/laserGRBLGridTool"
          target="_blank"
          class="q-ml-sm"
          icon="help"
          :title="$t('help')"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />

      <!-- 加入 Google 廣告 -->
      <!-- <GoogleAd /> -->
    </q-page-container>
  </q-layout>
</template>

<script>
import LanguageSwitcher from 'src/components/LanguageSwitcher.vue'
// import GoogleAd from 'src/components/GoogleAd.vue'

export default {
  components: {
    LanguageSwitcher,
    // GoogleAd,
  },
}
</script>
