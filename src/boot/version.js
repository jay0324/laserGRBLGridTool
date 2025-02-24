// src/boot/version.js
import packageJson from '../../package.json'

export default ({ app }) => {
  app.config.globalProperties.$appVersion = packageJson.version
}
