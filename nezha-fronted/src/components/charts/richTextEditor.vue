<template>
    <div >
      <div :id="id" class="editor-core" ref="editor" style="height:350px;"></div>
    </div>
</template>

<script>
  import 'quill/dist/quill.snow.css'
  import Quill from 'quill'
  export default {
    name: "richTextEditor",
    props:{
      editData:String
    },
    data(){
      return {
        id:'editor-'+this.guid(),
        quill:null,
        options:{
          theme: 'snow',
          modules:{
            toolbar:[
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              ['link','code-block'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
            ]
          }
        },
      }
    },
    created() {
    },
    methods:{
      initEditor:function(){
        let $self=this;
        if(!this.quill){
          this.quill = new Quill(this.$refs.editor, this.options);
          this.quill.on('selection-change',function(range, oldRange, source){
            let tooltip=$self.$el.querySelector('.ql-tooltip')
            if(tooltip){
              let left=tooltip.style.left;
              if(left&&/\-\d+\.?\d+?px/.test(left)){
                tooltip.style.left = '10px';
              }
            }
          })
          this.$nextTick(()=>{
            this.$emit('after-init')
          })
        }
      },
      getHtml:function(){
        let html=this.quill.root.innerHTML;
        return `<div  class="editor-core ql-container ql-snow"><div class="ql-editor">${html}</div></div>`;
      },
      guid() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
      },
    },
    watch:{
      editData:{
        immediate:true,
        handler(n,o){
          this.$nextTick(()=>{
            this.initEditor();
            this.quill.clipboard.dangerouslyPasteHTML(null,this.editData,'api')
          })
        }
      }
    },
    mounted() {
      this.initEditor();
    }
  }
</script>

<style>
  .ql-editor{
    overflow: auto;
  }
  .ql-tooltip{

  }
</style>
