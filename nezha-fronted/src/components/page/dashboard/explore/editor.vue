<template>
  <div class="metric-editor">
    <div :id="id" ref="editor"></div>
    <div class="metric-editor-popper" :style="{left:popperPos.left+'px'}">
      <div class="metric-popper-main" >
          <el-scrollbar style="height: 100%" class="ps-scroll-small" ref="scroll">
            <div v-for="(value, key, index) in showSuggestions" >
              <div v-html="key" class="popper-group"></div>
              <div class="popper-item" v-for="(item,i) in value" v-html="item.label" :key="item.insertText" :type="key" :value="item.insertText" @click.stop="handleItemClick(key,item,$event)"></div>
            </div>
          </el-scrollbar>
      </div>
      <div class="metric-popper-desc">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
    </div>
  </div>
</template>

<script>
  import 'quill/dist/quill.snow.css'
  import Quill from 'quill'
  import {del} from "../../../../http";
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
        cursorIndex:0,
        pivotalCursorIndex:0,//用于记录输入特殊符号后当前光标的位置，方便选择后覆盖
        noStyleSuggestions:{},//存储最原始的item数据
        showSuggestions:{},//存储显示的item数据，包含mark样式
        storedSuggestions:[],//存储每个item的dom
        toggleSelectIndex:-1,
        content:'',
        popperPos:{left:'20px'},
        options: {
          theme: 'snow',
          modules: {
            toolbar: null
          },
          placeholder: 'Insert text here ...'
        },
        labelValues:{},
      }
    },
    created(){
      this.queryMetrics();
    },
    methods:{
      userChange:function(char,operation,newContent,oldContent){
        this.dealSpecilChar(char,operation);
        if(this.pivotalCursorIndex!=0){
          console.log('pivotalCursorIndex',this.pivotalCursorIndex,'cursorIndex',this.cursorIndex)
          newContent=newContent.substring(this.pivotalCursorIndex,this.cursorIndex);
        }
        this.filterItems(newContent);
      },
      dealSpecilChar:function(char,operation){
        if(/^[\{\(\[]$/g.test(char)){
          if(operation=='insert'){
            if(char == '{'){
              this.insertTextAtIndex('}',this.cursorIndex)
              this.quill.setSelection(this.cursorIndex)
              this.changeSuggestions('label')
            }else if(char == '('){
              this.insertTextAtIndex(')',this.cursorIndex)
              this.quill.setSelection(this.cursorIndex)
            }else if(char == '['){
              this.insertTextAtIndex(']',this.cursorIndex)
              this.quill.setSelection(this.cursorIndex)
            }
          }else{
            this.quill.deleteText(this.cursorIndex,1,'api')
          }
        }else if(/^[=]/g.test(char)){
          if(operation=='insert'){
            let labelValuesReg=/\{((\w*?=.*?,{0,1})+?)\}/
            let labelValues=labelValuesReg.exec(this.content)[0];



            console.log('labelValues',labelValues,'cursor',cursor);

          }else{

          }
        }
      },
      changeSuggestions:function(type){
        if(type == 'label'){
          this.queryLabels();
        }
      },
      queryLabels:function(){
        let metric=/([a-zA-Z_]\w*)\b(?=\{)/.exec(this.content)[0];
        let timeRange=this.getDefaultTimeRange();
        this.$get('/prom/api/v1/series?match[]={__name__="'+metric+'"}&start='+timeRange[0]+"&end="+timeRange[1]).then(response=>{
          if(response.status=='success'){
            let result=new Map();
            response.data.forEach(item=>{
              for(let key in item){
                let value=item[key];
                let values=result.get(key)
                if(values){
                  values.add(value)
                }else{
                  values=new Set();
                  values.add(value)
                }
                result.set(key,values);
              }
            })
            for(let key of result.keys()){
              let values=result.get(key)
              values=Array.from(values).map(item=>{
                return {label:item,insertText:item};
              })
              result.set(key,values)
            }

            this.labelValues=result;

            let labels=Array.from(this.labelValues.keys()).map(item=>{
              return {label:item,insertText:item}
            })

            this.noStyleSuggestions={labels:labels}
            this.showSuggestions=this.deepClone(this.noStyleSuggestions);
            this.storeSuggestions();
          }else{
            this.noStyleSuggestions={};
            this.showSuggestions=this.deepClone(this.noStyleSuggestions)
            this.storeSuggestions();
          }
        })
      },
      getDefaultTimeRange:function(){
        let end=new Date();
        let start=new Date();
        start.setHours(new Date().getHours()-1);
        return[(start.getTime()/1000).toFixed(0),(end.getTime()/1000).toFixed(0)]
      },
      handleItemClick:function(type,item,event){
        console.log(type,item,event)
        if(type=='metrics'){
          this.handleMetricClick(item)
        }else if(type == 'labels'){
          this.handleLabelClick(item)
        }
      },
      handleMetricClick:function(item){
        this.clearContent();
        this.$nextTick(()=>{
          this.insertTextAtIndex(item.insertText);
        })
        this.moveCursorToEnd();
      },
      handleLabelClick:function(item){
        this.quill.setSelection(this.pivotalCursorIndex,this.cursorIndex-this.pivotalCursorIndex,'api');
        this.deleteTextInRange(this.pivotalCursorIndex,this.cursorIndex-this.pivotalCursorIndex)
        this.insertTextAtIndex(item.insertText+'',this.pivotalCursorIndex)
        this.storeCursor().then(()=>{
           this.insertTextAtIndex('=',null,'user')
           this.quill.setSelection(this.cursorIndex+1)
           this.changeSuggestions('value')
        })
      },
      toggleSelect:function(event){//上下键选择
        if(!this.storedSuggestions||this.storedSuggestions.length<1){
          this.storeSuggestions()
        }
        if(event.code=='ArrowDown'||event.keyCode==40){
          if(this.toggleSelectIndex != -1){
            let oldSuggestion=this.storedSuggestions[this.toggleSelectIndex];
            oldSuggestion.classList='popper-item'
          }
          let suggestion=this.storedSuggestions[this.toggleSelectIndex>=this.storedSuggestions.length-1?this.storedSuggestions.length-1:++this.toggleSelectIndex];
          let classList=suggestion.classList;
          suggestion.classList=classList+' toggle-bg'
          this.moveScroll();
        }else if(event.code=='ArrowUp'||event.keyCode==38){
          if(this.toggleSelectIndex >=1){
            let oldSuggestion=this.storedSuggestions[this.toggleSelectIndex];
            oldSuggestion.classList='popper-item'
            let suggestion=this.storedSuggestions[this.toggleSelectIndex<=0?0:--this.toggleSelectIndex];
            let classList=suggestion.classList;
            suggestion.classList=classList+' toggle-bg'
            this.moveScroll();
          }
        }
      },
      pickItem:function(event){//Tab键 获取选择
        if(event.code=='Tab'||event.code=='Enter'||event.keyCode==13||event.keyCode==9){
          let selectedItem=this.storedSuggestions[this.toggleSelectIndex];
          if(selectedItem){
            let type=selectedItem.getAttribute('type');
            let insertText=selectedItem.getAttribute('value');
            if(type == 'metrics'){
              this.handleMetricClick({insertText:insertText})
            }

          }
        }
      },

      filterItems:function(input){
        let suggestions=this.deepClone(this.noStyleSuggestions)

        for(let key in suggestions){
          let typeValues=suggestions[key];
          typeValues=typeValues.filter(item=>{
            let index=item.insertText.toLowerCase().indexOf(input.toLowerCase());
            console.log('index',index,'input',input)
            if(index != -1){
              // console.log('item',item.label,'input',input)
              // item.label=item.label.replace(input,`<mark>${input}</mark>`);
              let label=item.label;
              let pre=label.substring(0,index)
              let middle=label.substring(index,index+input.length)
              let suf=label.substring(index+input.length,label.length)
              item.label=`${pre}<mark>${middle}</mark>${suf}`
            }
            return index != -1;
          })
          if(typeValues.length<1){
            delete suggestions[key]
          }else{
            suggestions[key]=typeValues;
          }
        }

        this.showSuggestions=this.deepClone(suggestions)
        this.storeSuggestions();
      },
      storeSuggestions:function(){
          this.$nextTick(()=>{
            let suggestions=document.querySelectorAll('.popper-item');
            this.storedSuggestions=[...suggestions];
            console.log('storedSuggestions->',suggestions)
          })
      },
      clearContent:function(){
        this.quill.deleteText(0,this.quill.getLength(),'api')
        this.cursorIndex=0;
      },
      insertTextAtIndex:function(content,index,source='api'){
        this.quill.insertText(index?index:this.cursorIndex,content,source)
      },
      deleteTextInRange(from,to){
        this.quill.deleteText(from,to,'api')
      },
      setCursor:function(offset){
        this.$nextTick(()=>{
          if(!this.quill.hasFocus){
            this.quill.focus();
          }
          this.quill.setSelection(this.cursorIndex+offset,this.cursorIndex+offset,'api')
          this.storeCursor();
        })
      },
      storeCursor:function(char){
        let $temp=this;
        return new Promise(function(resolve,reject){
          $temp.$nextTick(()=>{
            let range=$temp.quill.getSelection();
            if(range&&range.length == 0){
              $temp.cursorIndex=range.index;
              console.log('current cursor-->',$temp.cursorIndex)

              if(/^[\{\(\[,="]$/g.test(char)){
                $temp.pivotalCursorIndex=$temp.cursorIndex;
              }
              resolve();
            }
          })
        })
      },
      moveCursorToEnd:function(){
        setTimeout(()=>{
          this.$nextTick(()=>{
            let offset=this.quill.getLength();
            this.setCursor(offset)
          },200)
        })
      },
      moveScroll:function(){
        let scroll=this.$refs.scroll.wrap;
        console.log('scroll',scroll)
        if(scroll){
          let curScroll=scroll.scrollTop;//滚动条当前位置
          let scrollLen=scroll.scrollHeight;//滚动条总长
          let mainDom=this.$el.querySelector('.metric-popper-main');
          let windowHeight=mainDom.clientHeight;
          let highlightItem=this.storedSuggestions[this.toggleSelectIndex];
          let itemHeight=highlightItem.clientHeight;
          let itemPos=highlightItem.offsetTop; //高亮item距离父div顶部的距离
          // console.log('curScroll',curScroll,'scrollLen',scrollLen,'windowHeight',windowHeight,'itemPos',itemPos,'itemHeight',itemHeight)
          if(itemPos + itemHeight*2 > windowHeight){  //提前两个位置
            scroll.scrollTop=itemPos-windowHeight+itemHeight*2
          }else{
            let interval = windowHeight/10;
            let intervalFunc = setInterval(function(){ //花200ms分10次回到顶部，模拟动画效果
              if (curScroll == 0) {
                clearInterval(intervalFunc);
              } else {
                curScroll = (curScroll - interval) < interval*0.5 ? 0 : curScroll - interval;
                scroll.scrollTop = curScroll;
              }
            }, 20);
          }
        }


      },
      getContent(from,to){
        let content=this.quill.getText(from,to);
        content=content.substring(0,content.length-1)
        return content;
      },
      getPosition:function(){
        this.$nextTick(()=>{
          this.popperPos=this.quill.getBounds(this.cursorIndex)
          console.log('position:',this.popperPos)
        })
      },
      guid() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
      },
      registerKeydown:function(){
        let $temp=this;
        document.addEventListener('keydown',function(event){
          console.log('keydown',event)
          $temp.toggleSelect(event);
          $temp.pickItem(event)
        })

        /*this.quill.keyboard.addBinding({
          key:13,
        },function(range,context){
          console.log('quill binding',range,context)
        })

        this.quill.keyboard.addBinding({ key: 'tab' }, function(range) {
          console.log('quill tab binding',range,context)
          return false;
        });*/
      },
      deepClone:function(source){
        return JSON.parse(JSON.stringify(source))
      },
      queryMetrics:function(){
        this.$get('/prom/api/v1/label/__name__/values').then(response=>{
          if(response.status == 'success'){
            let metrics=response.data.map(item=>{
              return {label:item,insertText:item};
            })
            this.$set(this.noStyleSuggestions,'metrics',metrics)
            this.showSuggestions=this.deepClone(this.noStyleSuggestions)
          }
        })
      },
    },
    computed: {

    },
    mounted() {
      this.quill = new Quill(this.$refs.editor, this.options);
      let $temp=this;
      this.quill.on('text-change',function(delta, oldDelta, source){
        console.log('delta',delta,'oldDelta',oldDelta,'source',source)
        let char='',operation='';
        let oldContent=oldDelta.ops[0].insert.substring(0,oldDelta.ops[0].insert.length-1);
        if(delta.ops.length==1){
          if(delta.ops[0].insert){
            char=delta.ops[0].insert
            operation='insert';
          }else if(delta.ops[0].delete){
            char=oldContent;
            operation='delete';
          }else{
            console.error('unknow operation')
          }
        }else{
          if(delta.ops[1].insert){
            char=delta.ops[1].insert
            operation='insert';
          }else if(delta.ops[1].delete){
            char=oldContent.substring(delta.ops[0].retain,delta.ops[0].retain+delta.ops[1].delete);
            operation='delete';
          }else{
            console.error('unknow operation')
          }
        }
        let promise=$temp.storeCursor(char);
        if(source == 'user'){
          console.log(delta,oldDelta,oldContent)
          let newContent=$temp.getContent()
          promise.then(()=>{ //存储完光标后再进行后面的操作
            $temp.userChange(char,operation,newContent,oldContent)
          })
        }
        $temp.content=$temp.getContent();
        console.log('current content-->',$temp.content)
        $temp.getPosition();
      })
      this.storeSuggestions();
      this.registerKeydown();
    }
  }
</script>

<style scoped>
  .metric-editor{
    position: relative;
  }
  .metric-editor-popper{
    position: absolute;
    height: 600px;
    padding: 10px;
    margin-top: 5px;
    overflow: hidden;
  }
  .metric-editor-popper .metric-popper-main{
    display: inline-block;
    box-sizing: border-box;
    border: 1px solid lightgrey;
    height: 100%;
    max-width: 66%;
    min-width: 100px;
    float: left;
    border-radius: 3px;
    box-shadow: 0 5px 10px 0 #dde4ed;
    color: #52545c;
    padding: 5px;
  }
  .metric-editor-popper .metric-popper-desc{
    display: inline-block;
    box-sizing: border-box;
    border-top: 1px solid lightgrey;
    border-bottom: 1px solid lightgrey;
    border-right: 1px solid lightgrey;
    max-width: 44%;
    height: 100%;
    border-radius: 3px;
    box-shadow: 0 5px 10px 0 #dde4ed;
    color: #52545c;
    padding: 5px;
  }
  .metric-editor-popper .popper-item{
    height: 20px;
    line-height: 20px;
    font-size: 12px !important;
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 8px 8px 8px 16px;
    transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) 0s, border-color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) 0s, background 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) 0s, padding 0.15s cubic-bezier(0.645, 0.045, 0.355, 1) 0s;
  }
  .metric-editor-popper .popper-group{
    height: 20px;
    line-height: 20px;
    font-size: 16px !important;
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 8px 8px 8px 8px;
    border-bottom: 1px solid #dcdcdc;
  }
  .toggle-bg{
    background-color:rgb(233, 237, 242) ;
  }
</style>
<style>
  mark{
    color: rgb(255, 133, 27);
    border-bottom: 1px solid rgb(255, 133, 27);
    padding: inherit;
    background: inherit;
    padding: 0;
  }
</style>
