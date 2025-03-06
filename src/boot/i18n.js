import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

const userLang = localStorage.getItem('user-lang') || 'en'

const i18n = createI18n({
  locale: userLang, // 預設語言
  fallbackLocale: 'en', // 備用語言
  messages,
})

export default ({ app }) => {
  app.use(i18n)
}

export { i18n }
