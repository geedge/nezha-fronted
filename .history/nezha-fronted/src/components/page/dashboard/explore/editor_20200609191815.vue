<template>
  <div>
    <div :id="id"></div>
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
      
    }
  }
</script>

<style scoped>

</style>
