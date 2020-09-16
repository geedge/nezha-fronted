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
      this.quill = new Quill(this.$refs.editor, this.options);
      let $temp=this;
      this.quill.on('text-change',function(delta, oldDelta, source){
        if(source == 'user'){
          if(delta.ops[0]=='{'){
            $temp.quill.
          }
        }
      })
    }
  }
</script>

<style scoped>

</style>
