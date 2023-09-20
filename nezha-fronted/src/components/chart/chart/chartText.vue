<template>
  <div class="mt-10 rich-text-container" v-cloak style="height: 100%;width: 100%;">
    <div class="notebook-editor" v-if="from==='notebook'&&chartInfo.param.isEdit" >
      <markdownEditor :edit-data="text" @textChange="textChange"></markdownEditor>
      <div class="notebook-editor-btn">
        <button class="nz-btn nz-btn-size-normal nz-btn-style-light margin-r-10" @click="cancel">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="save">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
    </div>
    <div v-else :id="'chartContainer' + chartInfo.id" ref="chartContainer" class="text-content">
      <el-scrollbar style="height: 100%;" class="el-scrollbar-normal">
        <v-md-preview v-if="chartInfo.param.editorType==='markdown'" :text="text"></v-md-preview>
        <div v-else class="el-scrollbar-normal__color" style="height: 100%;" v-html="text"></div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import markdownEditor from '@/components/chart/markdownEditor'
export default {
  name: 'chart-text',
  components: {
    markdownEditor
  },
  props: {
    chartInfo: {},
    chartData: {},
    from: String
  },
  data () {
    return {
      text: ''
    }
  },
  created () {
    if (this.from === 'notebook') {
      this.chartInfo.param.oldText = this.text
    }
  },
  methods: {
    save () {
      this.chartInfo.param.oldText = this.chartInfo.param.text
      this.chartInfo.param.isEdit = false
    },
    cancel () {
      this.chartInfo.param.text = this.chartInfo.param.oldText
      this.chartInfo.param.isEdit = false
    },
    textChange (val) {
      this.chartInfo.param.text = val
    },
    resize () {}
  },
  watch: {
    chartInfo: {
      deep: true,
      immediate: true,
      handler (n) {
        this.text = n.param.text
      }
    }
  }
}
</script>
