<template>
  <div>
    <div :id="id" ref="editor"></div>
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
      
      guid() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
      },
    },
    computed: {
      
    },
    mounted() {

      this.quill = new Quill(this.$el, {
        theme: 'snow',
        modules: {
            toolbar: this.toolbar
        },
        placeholder: '请输入正文',
    });
    }
  }
</script>

<style scoped>

</style>
