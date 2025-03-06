<template>
  <div class="full-height full-width column flex-center">
    <!-- 載入訊息的 div -->
    <div v-if="isProcessing" class="column flex-center q-mb-md absolute-center">
      <q-linear-progress :value="progress" class="q-mt-md" style="width: 300px" />
      <q-banner class="bg-blue-1 q-mt-md">
        {{ $t('progressMsg', { percent: Math.round(progress * 100) }) }}
      </q-banner>
    </div>

    <!-- Canvas 元素 -->
    <canvas ref="canvas" class="gcode-viewer"></canvas>
  </div>
</template>

<script>
export default {
  name: 'GCodeViewer',
  props: {
    gcode: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isProcessing: false, // 是否正在處理
      progress: 0, // 進度值（0 到 1）
      paths: [], // 存儲所有路徑段，每個路徑段包含起點、終點和顏色
      scale: 1, // 縮放比例，動態計算
      lineWidth: 0.5,
      canvas: {
        width: 800,
        height: 800,
      },
      colors: {
        G0: '#ff0000', // G0 路徑顏色（黑色）
        G1: '#000000', // G1 路徑顏色（紅色）
      },
    }
  },
  mounted() {
    this.startProcessing()
  },
  methods: {
    async startProcessing() {
      this.isProcessing = true
      this.progress = 0

      // 模擬進度更新
      const updateProgress = (progress) => {
        this.progress = progress
        this.$emit('progress-updated', progress) // 將進度傳遞給父元件
      }

      // 模擬處理過程
      for (let progress = 0; progress <= 1; progress += 0.1) {
        await new Promise((resolve) => setTimeout(resolve, 500)) // 每 0.5 秒更新一次
        updateProgress(progress)
      }

      // 執行原本的 method（渲染 canvas）
      await this.parseGCode(this.gcode)
      await this.renderPath()

      this.isProcessing = false
      this.$emit('processing-complete') // 通知父元件處理完成
    },

    // 解析 G-code
    async parseGCode(gcode) {
      // 去除空白行
      const lines = gcode
        .split('\n')
        .filter((line) => line.trim() !== '' || line.trim().startsWith('M'))
      let currentX = 0
      let currentY = 0
      let previousCommand = null // 前一個指令
      let previousX = 0
      let previousY = 0

      // 遍歷每一行 G-code
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim() // 去除空白字符

        if (line.startsWith('G0') || line.startsWith('G1')) {
          // 提取 X, Y 座標
          const xMatch = line.match(/X(-?\d+(\.\d{1,3})?)/) // 支持負號和小數點
          const yMatch = line.match(/Y(-?\d+(\.\d{1,3})?)/) // 支持負號和小數點

          // 如果匹配到值，則更新當前座標；否則保持不變
          currentX = xMatch ? parseFloat(xMatch[1]) / 10 : currentX // 縮小到 0.1mm
          currentY = yMatch ? parseFloat(yMatch[1]) / 10 : currentY // 縮小到 0.1mm

          // 如果有前一個指令，則生成路徑段
          if (previousCommand !== null) {
            const color = previousCommand.startsWith('G1') ? this.colors.G0 : this.colors.G1
            this.paths.push({
              start: { x: previousX, y: previousY },
              end: { x: currentX, y: currentY },
              color,
            })
          }

          // 更新前一個指令和座標
          previousCommand = line
          previousX = currentX
          previousY = currentY
        }
      }
    },

    // 渲染路徑
    async renderPath() {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')

      // 設置 canvas 大小為 600x600
      canvas.width = this.canvas.width
      canvas.height = this.canvas.width

      // 清空畫布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 計算所有路徑的邊界
      const bounds = this.calculateBounds(this.paths)

      // 計算縮放比例和平移偏移量
      this.scale = this.calculateScale(bounds, canvas.width, canvas.height)
      const [offsetX, offsetY] = this.calculateOffset(bounds, canvas.width, canvas.height)

      // 繪製原點標記
      this.drawOriginMarker(ctx, offsetX, offsetY)

      // 繪製所有路徑段
      this.paths.forEach((path) => {
        this.drawPath(ctx, path.start, path.end, offsetX, offsetY, path.color)
      })
    },

    // 計算路徑的邊界
    calculateBounds(paths) {
      if (paths.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0, centerX: 0, centerY: 0 }
      }

      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      // 使用迴圈計算邊界
      paths.forEach((path) => {
        const { start, end } = path
        minX = Math.min(minX, start.x, end.x)
        minY = Math.min(minY, start.y, end.y)
        maxX = Math.max(maxX, start.x, end.x)
        maxY = Math.max(maxY, start.y, end.y)
      })

      return {
        minX,
        minY,
        maxX,
        maxY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
      }
    },

    // 計算縮放比例
    calculateScale(bounds, canvasWidth, canvasHeight) {
      const scaleX = canvasWidth / (bounds.maxX - bounds.minX)
      const scaleY = canvasHeight / (bounds.maxY - bounds.minY)
      return Math.min(scaleX, scaleY) * 0.8 // 縮小一點，避免路徑超出畫布
    },

    // 計算平移偏移量
    calculateOffset(bounds, canvasWidth, canvasHeight) {
      return [
        canvasWidth / 2 - bounds.centerX * this.scale,
        canvasHeight / 2 - bounds.centerY * this.scale,
      ]
    },

    // 繪製單一路徑
    drawPath(ctx, start, end, offsetX, offsetY, color) {
      // 獲取 Canvas 元素
      const canvas = this.$refs.canvas

      // 設置繪製樣式
      ctx.strokeStyle = color
      ctx.lineWidth = this.lineWidth // 線條寬度改為 0.2

      // 計算起點和終點的座標
      const startX = start.x * this.scale + offsetX
      const startY = canvas.height - (start.y * this.scale + offsetY) // Y 軸取反，從上往下繪製
      const endX = end.x * this.scale + offsetX
      const endY = canvas.height - (end.y * this.scale + offsetY) // Y 軸取反，從上往下繪製

      // 開始繪製路徑
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)

      // 結束繪製並描邊
      ctx.stroke()
    },

    // 繪製原點標記
    drawOriginMarker(ctx, offsetX, offsetY) {
      const canvas = this.$refs.canvas

      // 原點座標
      const originX = 0 * this.scale + offsetX
      const originY = canvas.height - (0 * this.scale + offsetY)

      // 繪製 Y 軸箭頭
      ctx.strokeStyle = '#0000ff' // 藍色
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(originX, originY)
      ctx.lineTo(originX, originY - 20) // 向上
      ctx.moveTo(originX, originY - 20)
      ctx.lineTo(originX - 5, originY - 15) // 箭頭左側
      ctx.moveTo(originX, originY - 20)
      ctx.lineTo(originX + 5, originY - 15) // 箭頭右側
      ctx.stroke()

      // 繪製 X 軸箭頭
      ctx.strokeStyle = '#00ff00' // 綠色
      ctx.beginPath()
      ctx.moveTo(originX, originY)
      ctx.lineTo(originX + 20, originY) // 向右
      ctx.moveTo(originX + 20, originY)
      ctx.lineTo(originX + 15, originY - 5) // 箭頭上側
      ctx.moveTo(originX + 20, originY)
      ctx.lineTo(originX + 15, originY + 5) // 箭頭下側
      ctx.stroke()

      // 標記文字
      ctx.fillStyle = '#0000ff' // 藍色
      ctx.font = '12px Arial'
      ctx.fillText('Y', originX - 15, originY - 25)

      ctx.fillStyle = '#00ff00' // 綠色
      ctx.fillText('X', originX + 25, originY + 15)
    },
  },
}
</script>

<style scoped>
.gcode-viewer {
  width: 600px;
  height: 600px;
  border: 1px solid #ccc;
}
.full-height {
  height: 100%;
}
.full-width {
  width: 100%;
}
.gcode-viewer {
  max-width: 100%;
  max-height: 100%;
  display: block;
  margin: auto; /* 確保 canvas 居中 */
}
</style>
