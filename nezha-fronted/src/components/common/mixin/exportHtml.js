import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import Vue from 'vue'
export default {
  data () {
    return {
      fileName: 'panel'
    }
  },
  methods: {
    exportHtml () {
      // 创建一个JSZIP实例
      const zip = new JSZip()
      // 在zip压缩包中创建一个文件夹，用来放相关依赖
      const panel = zip.folder('panel')
      const packages = panel.folder('packages')
      const fileArr = []
      let filename = []
      // 引入含有html字符串的js文件，构造html文件
      this.returnHtml().then((modules) => {
        panel.file('index.html', modules)
        Vue.http.get('components/chart/panelTemp/jsData.json').then((res) => {
          filename = res.body.data
          for (const i in res.body.data) {
            fileArr.push(Vue.http.get(`components/chart/${res.body.data[i]}`))
          }
          Promise.all(fileArr).then((contents) => {
            for (const i in contents) {
              packages.file(filename[i], contents[i].data)
            }
            // console.log(chartList)
            // packages.file('vue/chartList.vue', chartList)
            zip.generateAsync({
              type: 'blob'
            }).then((content) => {
              // 此处采用file-saver的saveAs方法和直接创建a标签下载的效果是一样的，只是saveAs写起来更简便写
              saveAs(content, `${this.fileName}.zip`)
            })
          })
        })
      })
    },
    returnHtml (data) {
      data = [{
        id: 1
      }]
      let str = ''
      str += `<!DOCTYPE html>
              <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Panel</title>
                </head>
                <script src="./packages/panelTemp/js/vue.js"></script>
                <script src="./packages/panelTemp/js/echarts.js"></script>
                <script src="./packages/panelTemp/js/httpVueLoader.js"></script>
                <body>
                  <div id="app">
                  <div>
                    <chartList
                        :data-list="dataList"
                        :isExportHtml="true"
                    ></chartList>
                  </div>
                    {{message}}
                  </div>
                </body>
                <script type="text/javascript">
                var app = new Vue({
                  el: '#app',
                  components:{
                      chartList: httpVueLoader('/packages/chartList.vue')
                  },
                  data: {
                    message: 'Hello Vue!',
                    dataList: ${JSON.stringify(data)}
                  },
                  mounted () {
                    // axios.get('./data.json').then(res=>{
                    //   console.log(res)
                    // })
                  }
                })
              </script>
              </html>
                `
      return new Promise(resolve => {
        resolve(str)
      })
    }
  }
}
