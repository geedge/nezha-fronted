<template>
  <div>
    <div
  </div>
</template>

<script>
  import 'quill/dist/quill.snow.css'
  import Quill from 'quill'
  export default {
    name: "editor",
    props: {
      value: Object
    },
    components:{
      quillEditor
    },
    data(){
      return{
        id:'editor-'+this.guid(),
        cursorIndex:0,
        content:'',
        options: {
          theme: 'snow',
          modules: {
            toolbar: null
          },
          placeholder: 'Insert text here ...'
        }
      }
    },
    methods:{
      onEditorBlur(quill) {
        console.log('editor blur!', quill)
      },
      onEditorFocus(quill) {
        console.log('editor focus!', quill)
      },
      onEditorReady(quill) {
        console.log('editor ready!', quill)
      },
      onEditorChange({ quill, html, text }) {
        let range=quill.getSelection();
        if(range&&range.length == 0){
          this.cursorIndex=range.index;
        }

        if(/.*\{/.test(text)){
          this.content=text+"}fdsafasf"
        }
      },
      guid() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
      },
    },
    computed: {
      editor() {
        return this.$refs.myQuillEditor.quill
      }
    },
    mounted() {
      console.log('this is current quill instance object', this.editor)
    }
  }
</script>

<style scoped>

</style>
