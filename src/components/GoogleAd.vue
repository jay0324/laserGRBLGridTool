<template>
  <div>
    <ins
      class="adsbygoogle"
      style="display: block"
      data-ad-client="ca-pub-2095779196503999"
      data-ad-slot="1219775803"
      data-ad-format="auto"
      data-full-width-responsive="true"
    >
    </ins>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  if (
    !document.querySelector(
      'script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
    )
  ) {
    const script = document.createElement('script')
    script.setAttribute('async', '')
    script.setAttribute(
      'src',
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2095779196503999',
    )
    script.setAttribute('crossorigin', 'anonymous')
    document.head.appendChild(script)
  }

  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch (e) {
    console.error('AdSense failed to load', e)
  }
})
</script>
