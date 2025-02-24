<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-avatar>
          <img src="~assets/logo.svg" />
        </q-avatar>
        <q-toolbar-title> LaserGRBL Grid Tool </q-toolbar-title>

        <div>v{{ $appVersion }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
