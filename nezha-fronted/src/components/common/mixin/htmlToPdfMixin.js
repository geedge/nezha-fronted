export default {
  methods: {
    htmlToPdf () {
      const dom = document.getElementsByClassName(this.pdfId)[0]
      if (dom) {
        this.showScreenLoading(true)
        this.getPdf(dom)
      } else {
        this.showScreenLoading(false)
      }
    }
  }
}
