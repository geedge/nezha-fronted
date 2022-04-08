import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'
import { Loading } from 'element-ui' // 此处根据你实际使用的框架的loading进行引入
let loading
export default {
  install (Vue, options) {
    Vue.prototype.getPdf = function (dom, x, y) { // 传入需要导出的 dom
      const title = this.htmlTitle || 'pdf'
      // html2Canvas(document.querySelector('#pdfDom'), { //这是在界面上设置一个id
      // 只下载id为pdfDom的内容
      html2Canvas(dom, { // body是下载整个界面
        useCORS: true, // 是否尝试使用CORS从服务器加载图像
        allowTaint: true,
        dpi: 300, // 解决生产图片模糊
        // width: 490, //canvas宽度
        // height: 240, //canvas高度
        x: x || 0, // x坐标 需要计算
        y: y || 0, // y坐标 需要计算
        async: false, // 是否异步解析和呈现元素
        foreignObjectRendering: true // 是否在浏览器支持的情况下使用ForeignObject渲染
      }).then(function (canvas) {
        loading.close()
        document.body.style.height = '100%'
        document.getElementsByTagName('html')[0].style.overflow = 'hidden'
        const contentWidth = canvas.width
        const contentHeight = canvas.height
        const pageHeight = contentWidth / 592.28 * 841.89 // 一页pdf显示html页面生成的canvas高度;
        let leftHeight = contentHeight // 未生成pdf的html页面高度
        let position = 0 // pdf页面偏移
        // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
        const imgWidth = 595.28
        const imgHeight = 592.28 / contentWidth * contentHeight
        const pageData = canvas.toDataURL('image/jpeg', 1.0)
        const PDF = new JsPDF('', 'pt', 'a4')
        // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
        // 当内容未超过pdf一页显示的范围，无需分页
        if (leftHeight < pageHeight) {
          PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
        } else {
          while (leftHeight > 0) {
            PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
            leftHeight -= pageHeight
            position -= 841.89
            if (leftHeight > 0) {
              PDF.addPage()
            }
          }
        }
        PDF.save(title + '.pdf')
      })
    }
    Vue.prototype.showScreenLoading = function (flag) {
      if (flag) {
        loading = Loading.service({
          lock: true,
          text: this.$t('overall.downloadProgress') + 'pdf...',
          background: 'rgba(0,0,0,.3)'
        })
      } else {
        if (loading) {
          loading.close()
          document.body.style.height = '100%'
          document.getElementsByTagName('html')[0].style.overflow = 'hidden'
        }
      }
    }
  }
}
