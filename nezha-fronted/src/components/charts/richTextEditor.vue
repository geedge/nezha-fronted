<template>
    <div style="position: relative" class="rich-text-editor" :class="{'rich-text-editor-error':tooLong}">
      <div :id="id" class="editor-core" ref="editor" style="height:350px;"></div>
      <div class="text-too-long" v-if="tooLong">{{$t('validate.tooLong')}}</div>
    </div>
</template>

<script>
  import 'quill/dist/quill.snow.css'
  import Quill from 'quill'
  export default {
    name: "richTextEditor",
    props:{
      editData:String,
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
        maxLength:0,//记录最大长度
        tooLong:false,
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
          this.quill.on('text-change',function(delta, oldDelta, source){
            let length=$self.getHtml().length;
            if(length>60000){
              $self.quill.deleteText($self.maxLength-1,$self.quill.getText().length-1,'api')
              $self.tooLong=true;
            }else{
              $self.maxLength=$self.quill.getText().length;
              $self.tooLong=false;
            }
          })
          this.$nextTick(()=>{
            this.$emit('after-init')
          })
        }
      },
      getHtml:function(){
        let html=`<div  class="editor-core ql-container ql-snow"><div class="ql-editor">${this.quill.root.innerHTML}</div></div>`;
        return html;
      },
      getContent:function(){
        if(this.tooLong){
          return false;
        }else{
          return this.getHtml();
        }
      },
      guid() {
        function S4() {
          return (((1 + window.crypto.getRandomValues()) * 0x10000) | 0).toString(16).substring(1);
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
    },
    beforeDestroy(){
      this.quill.off('selection-change');
      this.quill.off('text-change');
    }
  }
</script>

<style>
  .rich-text-editor .ql-editor{
    overflow: auto !important;
  }
  .text-too-long{
    color: #F56C6C;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
  }
  .rich-text-editor-error  {
    border: 1px solid #F56C6C;
  }
  .rich-text-editor-error .ql-container.ql-snow {
    border: unset !important
  }

  .rich-text-editor-error .ql-toolbar.ql-snow{
    border-top: unset !important;
    border-left: unset !important;
    border-right: unset !important;
  }

</style>
