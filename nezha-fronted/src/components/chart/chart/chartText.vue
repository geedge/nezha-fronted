<template>
 <div class="mt-10 rich-text-container" v-cloak style="height: 100%;width: 100%;">
   <div :id="'chartContainer' + chartInfo.id"  ref="chartContainer" class="text-content" >
     <el-scrollbar style="height: 100%;" class="el-scrollbar-normal">
        <v-md-preview v-if="chartInfo.param.editorType==='markdown'" :text="text"></v-md-preview>
        <div v-else class="el-scrollbar-normal__color" style="height: 100%;" v-html="text"></div>
     </el-scrollbar>
   </div>
 </div>
</template>

<script>
export default {
  name: 'chart-text',
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
  methods: {
    resize () {

    }
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
