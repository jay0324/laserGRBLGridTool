export default () => {
  const script = document.createElement('script')
  script.setAttribute('async', '')
  script.setAttribute(
    'src',
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2095779196503999',
  )
  script.setAttribute('crossorigin', 'anonymous')
  document.head.appendChild(script)
}
