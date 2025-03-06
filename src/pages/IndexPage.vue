<template>
  <q-page>
    <div class="column">
      <div class="q-pa-md col self-start" style="width: 20vw">
        <q-input v-model="row" :label="$t('labelRow')" type="number" min="0" class="q-mb-sm" />
        <q-input v-model="col" :label="$t('labelCol')" type="number" min="0" class="q-mb-sm" />
        <q-btn
          :label="$t('labelGrid')"
          type="submit"
          color="primary"
          class="q-mb-sm q-mt-sm full-width"
          @click="createGrid()"
        />

        <q-input
          v-model="row_offset"
          class="q-mb-sm"
          type="number"
          min="0"
          :label="$t('labelYOffset')"
        />
        <q-input
          v-model="col_offset"
          class="q-mb-sm"
          type="number"
          min="0"
          :label="$t('labelXOffset')"
        />
        <!-- 隱藏的 file input -->
        <input
          type="file"
          ref="shareFileRef"
          style="display: none"
          accept=".nc"
          @change="handleShareFileUpload"
        />
        <q-btn
          :label="$t('labelUploadSameFile')"
          color="primary"
          class="q-mb-sm full-width"
          @click="openShareFile"
          :loading="isProcessingUpload"
        >
          {{ buttonUploadLabel }}
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            {{ $t('progress') }}
          </template>
        </q-btn>
        <q-btn
          :label="$t('labelMergeGrid')"
          color="primary"
          class="q-mb-sm full-width"
          @click="writeNCFile()"
          :loading="isProcessing"
        >
          {{ buttonLabel }}
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            {{ $t('progress') }}
          </template>
        </q-btn>
        <q-btn
          :label="$t('labelSimulate')"
          color="primary"
          class="q-mb-sm full-width"
          @click="gCodeSimulate('open', { content: outputContent })"
        />
        <q-input v-model="fileName" :label="$t('labelExportFileName')" class="q-mb-sm" />
        <q-btn
          :label="$t('labelExportFile')"
          color="secondary"
          @click="exportNCFile"
          class="q-mb-sm full-width"
        />
      </div>
    </div>

    <!-- 動態產生的按鈕 & 文字框 -->
    <div class="canvas-container full-height">
      <div class="canvas">
        <div class="grid-container">
          <div v-for="(rowItem, rowIndex) in files" :key="`row-${rowIndex}`" class="grid-row">
            <div v-for="(colItem, colIndex) in rowItem" :key="`col-${colIndex}`" class="grid-item">
              <q-label>
                {{
                  $t('gridPannel', {
                    x: colIndex * col_offset,
                    y: rowIndex * row_offset,
                  })
                }}
              </q-label>

              <q-label>{{
                $t('fileName', {
                  name: colItem.fileName ?? '未添加',
                })
              }}</q-label>

              <!-- 隱藏的 file input -->
              <input
                type="file"
                :ref="(el) => setFileRef(el, rowIndex, colIndex)"
                accept=".nc"
                style="display: none"
                @change="handleFileUpload($event, rowIndex, colIndex)"
              />

              <!-- 開啟 .nc 檔案按鈕 -->
              <q-btn
                :label="$t('labelAddNcFile')"
                color="primary"
                @click="openFile(rowIndex, colIndex)"
                class="q-mb-xs"
                size="md"
              />

              <q-btn-group class="q-mb-xs">
                <q-btn
                  :label="$t('labelCheckCode')"
                  color="primary"
                  size="sm"
                  @click="gCodeViewer('open', colItem)"
                />
                <q-btn
                  :label="$t('labelSimulate')"
                  color="primary"
                  size="sm"
                  @click="gCodeSimulate('open', colItem)"
                />
              </q-btn-group>

              <q-btn
                :label="$t('labelClearArea')"
                color="red"
                @click="clearZone(rowIndex, colIndex)"
                class="q-mb-xs"
                size="md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="showGCode">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">{{ $t('labelCheckGcode') }}</div>
        </q-card-section>

        <div class="q-ma-md row no-wrap">
          <q-card bordered class="col my-card q-ma-sm">
            <q-card-section> {{ $t('originalGCode') }} </q-card-section>

            <q-separator inset />

            <q-card-section>
              <q-scroll-area
                visible
                :thumb-style="thumbStyle"
                :bar-style="barStyle"
                style="height: 200px"
                class="col"
                ref="firstRef"
              >
                <pre>{{ GcodeViewer.content }}</pre>
              </q-scroll-area>
            </q-card-section>
          </q-card>

          <q-card bordered class="col my-card q-ma-sm">
            <q-card-section> {{ $t('modifyGCode') }} </q-card-section>

            <q-separator inset />

            <q-card-section>
              <q-scroll-area
                visible
                :thumb-style="thumbStyle"
                :bar-style="barStyle"
                style="height: 200px"
                class="col"
                ref="secondRef"
              >
                <pre>{{ GcodeViewer.contentEdit }}</pre>
              </q-scroll-area>
            </q-card-section>
          </q-card>
        </div>

        <q-card-actions class="close-btn">
          <q-btn flat :label="$t('closed')" color="primary" @click="gCodeViewer('close', null)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showGSD">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">{{ $t('labelSimulate') }}</div>
        </q-card-section>

        <q-card-section class="column flex-center">
          <GCodeViewer
            :gcode="gcodeText"
            @progress-updated="handleProgressUpdated"
            @processing-complete="handleProcessingComplete"
          />
        </q-card-section>

        <q-card-actions class="close-btn">
          <q-btn flat :label="$t('closed')" color="primary" @click="gCodeSimulate('close', null)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import GCodeViewer from 'components/GCodeViewer.vue'
import { useI18n } from 'vue-i18n'

export default {
  components: {
    GCodeViewer,
  },
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      $q: useQuasar(),
      row: 0,
      col: 0,
      row_offset: 0,
      col_offset: 0,
      shareFile: {},
      fileNameDefault: 'layout',
      fileName: '',
      files: [], // 存放 G-code 內容
      fileRefs: {}, // 存放動態的 file input 參考
      showGCode: false,
      GcodeViewer: {
        content: '',
        contentEdit: '',
      },
      showGSD: false,
      gcodeText: '',
      outputContent: '',
      progress: 0, // 進度值（0 到 1）
      isProcessing: false, // 控制是否顯示加載狀態
      isProcessingUpload: false,
    }
  },
  computed: {
    buttonLabel() {
      return this.isProcessing ? this.t('mergeInProgress') : ''
    },
    buttonUploadLabel() {
      return this.isProcessingUpload ? this.t('uploadGridInProgress') : ''
    },
  },
  mounted() {
    this.fileName = `${this.fileNameDefault}_${this.row}x${this.col}.nc`
  },
  methods: {
    // 處理進度更新事件
    handleProgressUpdated(progress) {
      this.progress = progress
    },
    // 模擬完成事件
    handleProcessingComplete() {
      this.$q.notify({
        type: 'positive',
        message: this.t('simulateDone'),
      })
    },
    openShareFile() {
      //重製檔案
      this.shareFile = {}
      this.$refs.shareFileRef.click()
    },
    handleShareFileUpload(event) {
      this.isProcessingUpload = true // 開始處理，顯示加載狀態
      this.$q.notify({
        type: 'warning',
        message: this.t('gridInProgress'),
      })

      // 等待 UI 更新完成
      setTimeout(async () => {
        this.processShareFileUpload(event)
      }, 100)
    },

    async processShareFileUpload(event) {
      const file = event.target.files[0]
      if (!file) {
        this.$q.notify({
          type: 'negative',
          message: this.t('noFile'),
        })
        this.isProcessingUpload = false // 處理結束，隱藏加載狀態
        return
      }

      const reader = new FileReader()
      this.shareFile.fileName = file.name

      try {
        reader.onload = (e) => {
          // 將讀取的檔案內容存到共用變數中
          this.shareFile.content = e.target.result

          // 把資料帶入所有的項目中
          this.files.forEach((row, row_index) => {
            row.forEach((col, col_index) => {
              // 更新每個項目的屬性
              col.fileName = this.shareFile.fileName
              col.content = this.shareFile.content
              col.row = row_index
              col.col = col_index
              col.contentEdit = this.modifyGCode(col) // 假設 modifyGCode 是一個處理內容的方法
            })
          })
        }

        reader.readAsText(file)
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.t('gridFail', { msg: error.message }),
        })
        this.isProcessingUpload = false // 處理結束，隱藏加載狀態
      } finally {
        this.$q.notify({
          type: 'positive',
          message: this.t('gridDone'),
        })
        this.isProcessingUpload = false // 處理結束，隱藏加載狀態
      }
    },

    createGrid() {
      const generateUniqueId = () => Math.random().toString(36).slice(2, 9) // 產生不重複 ID

      this.files = Array.from({ length: this.row }, (row, row_index) =>
        Array.from({ length: this.col }, (col, col_index) => ({
          id: generateUniqueId(),
          fileName: null,
          content: '',
          contentEdit: '',
          row: row_index,
          col: col_index,
        })),
      )
      this.fileRefs = {} // 清空舊的 refs

      this.fileName = `${this.fileNameDefault}_${this.row}x${this.col}.nc`
    },

    setFileRef(el, rowIndex, colIndex) {
      if (!this.fileRefs[rowIndex]) {
        this.fileRefs[rowIndex] = {}
      }
      this.fileRefs[rowIndex][colIndex] = el
    },

    // 觸發對應的 input[type="file"]
    openFile(rowIndex, colIndex) {
      const fileInput = this.fileRefs?.[rowIndex]?.[colIndex]
      if (fileInput) {
        fileInput.click()
      } else {
        console.error(`Can't find linked fileInput (row: ${rowIndex}, col: ${colIndex})`)
      }
    },

    // 讀取 .nc 檔案內容
    handleFileUpload(event, rowIndex, colIndex) {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      let target = this.files[rowIndex][colIndex]
      target.fileName = file.name
      reader.onload = (e) => {
        let tmp = e.target.result
        target.content = tmp
        target.contentEdit = this.modifyGCode(target)
      }
      reader.readAsText(file)
    },

    //匯出檔案
    exportNCFile() {
      // 建立 Blob 物件
      const blob = new Blob([this.outputContent], { type: 'text/plain' })

      // 建立下載連結
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = this.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    gCodeViewer(action, item) {
      if (action === 'open') {
        this.showGCode = true
        this.GcodeViewer.content = item.content
        this.GcodeViewer.contentEdit = item.contentEdit
      } else {
        this.showGCode = false
        this.GcodeViewer.content = ''
        this.GcodeViewer.contentEdit = ''
      }
    },

    //產出檔案
    async writeNCFile() {
      this.isProcessing = true // 開始處理，顯示加載狀態
      this.$q.notify({
        type: 'warning',
        message: this.t('mergeInProgress'),
      })

      // 等待 UI 更新完成
      setTimeout(async () => {
        this.processCombineFileProcess()
      }, 100)
    },
    async processCombineFileProcess() {
      try {
        // 模擬一個耗時的操作
        await this.updateGCode()
        await this.combineGCode()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.t('mergeFail', { msg: error.message }),
        })
        this.isProcessingUpload = false // 處理結束，隱藏加載狀態
      } finally {
        this.$q.notify({
          type: 'positive',
          message: this.t('mergeDone'),
        })
        this.isProcessing = false // 處理結束，隱藏加載狀態
      }
    },

    //合併編輯後的G碼
    async combineGCode() {
      this.outputContent = ''

      // **按照行優先排序 (左上 -> 右上 -> 左下 -> 右下)**
      for (let row of this.files) {
        for (let cell of row) {
          cell.contentEdit = this.modifyGCode(cell)
          this.outputContent += cell.contentEdit + '\n'
        }
      }

      //合併最後回到原點
      this.outputContent += 'G0 X0 Y0\n'
    },

    //更新編輯後的G碼
    async updateGCode() {
      for (let row of this.files) {
        for (let cell of row) {
          cell.contentEdit = this.modifyGCode(cell)
        }
      }
    },

    // 解析 G-code，將 X 數值 +10
    modifyGCode(item) {
      const rege = /([XY])(-?\d+\.?\d*)/g // 正則表達式匹配 X或Y 數字
      return item.content.replace(rege, (match, axis, value) => {
        let newValue = parseFloat(value)
        if (axis === 'X') {
          newValue += item.col * this.col_offset
        } else if (axis === 'Y') {
          newValue += item.row * this.row_offset
        }
        return `${axis}${newValue.toFixed(3)}` // 保留 3 位小數
      })
    },

    gCodeSimulate(action, item) {
      if (action === 'open') {
        this.showGSD = true
        this.gcodeText = item.content
      } else {
        this.showGSD = false
        this.gcodeText = ''
      }
    },

    clearZone(row, col) {
      let target = this.files[row][col]
      target.fileName = null
      target.content = ''
      target.contentEdit = ''
    },
  },
}
</script>

<style scoped>
.canvas-container {
  width: 80vw;
  position: absolute;
  top: 0;
  right: 5px;
  padding: 10px;
}
.canvas {
  border: 1px solid black;
  width: 100%;
  height: 100%;
}
.grid-container {
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.grid-row {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  padding: 10px;
  margin: 5px;
  background-color: lightblue;
  height: 180px;
  width: 180px;
}

/* 設定 Dialog 的固定高度 */
.dialog-card {
  width: 700px;
  max-width: 80vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 內容區域：兩欄 */
.content-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  height: 100%;
  padding: 10px;
}

/* 左右區塊 */
.left-section,
.right-section {
  flex: 1;
  display: flex;
}

/* 關閉按鈕固定在右下角 */
.close-btn {
  justify-content: flex-end; /* 右對齊 */
  padding-right: 16px; /* 讓按鈕貼齊右側 */
}
</style>
