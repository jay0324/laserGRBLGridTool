<template>
  <q-select
    v-model="currentLang"
    :options="languageOptions"
    bg-color="white"
    rounded
    outlined
    dense
    emit-value
    map-options
    @update:model-value="changeLanguage"
    style="width: 150px"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// 可用語言選項
const languageOptions = [
  { label: 'English', value: 'en' },
  { label: '繁體中文', value: 'zhTW' },
]

const currentLang = ref(locale.value) // 綁定當前語言

const changeLanguage = (lang) => {
  locale.value = lang // 更新 i18n 語言
  localStorage.setItem('user-lang', lang) // 存入 localStorage
}
</script>
