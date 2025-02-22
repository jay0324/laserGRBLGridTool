<template>
  <q-page class="flex flex-center">
    <GCodeViewer :gcode="gcode" />
  </q-page>
</template>

<script>
import GCodeViewer from 'components/GCodeViewer.vue'

export default {
  name: 'IndexPage',
  components: {
    GCodeViewer,
  },
  data() {
    return {
      gcode: `
G0 X0 Y0
G1 X100.123 Y-50.456
G0 X-200 Y300
G1 X300.789 Y100.123
      `,
    }
  },
}
</script>
