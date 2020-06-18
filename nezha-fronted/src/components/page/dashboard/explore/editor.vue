<template>
  <div class="metric-editor">
    <div :id="id" ref="editor"></div>
    <div class="metric-editor-popper" :style="{left:popperPos.left+'px'}">
      <div class="metric-popper-main" >
          <el-scrollbar style="height: 100%" class="ps-scroll-small" ref="scroll">
            <div v-for="(key, index) in orders" >
              <div v-html="key" class="popper-group" v-show="showSuggestions[key]"></div>
              <div class="popper-item" v-for="(item,i) in showSuggestions[key]" v-html="item.label" :key="item.insertText" :type="key" :value="item.insertText" @click.stop="handleItemClick(key,item,$event)"></div>
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
  import suggestions from "./suggestions";
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
        newExpressionIndex:0,
        editRange:{start:0,end:0},
        noStyleSuggestions:{},//存储最原始的item数据
        orders:['history','operators','functions','metrics','labels','values'],
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
        tempStoreMetric:{},
      }
    },
    created(){
      this.queryMetrics();
    },
    methods:{
      userChange:function(char,operation,newContent,oldContent){
        this.dealSpecilChar(char,operation);
        this.changeSuggestions('type')

        if(this.pivotalCursorIndex>this.editRange.start && this.pivotalCursorIndex < this.editRange.end){
          if(this.pivotalCursorIndex!=0){
            console.log('pivotalCursorIndex',this.pivotalCursorIndex,'cursorIndex',this.cursorIndex)
            newContent=newContent.substring(this.pivotalCursorIndex,this.cursorIndex);
          }
        }else{
          newContent=newContent.substring(this.editRange.start,this.editRange.end)
        }
        this.filterItems(newContent);
      },
      dealSpecilChar:function(char,operation){
        if(/^[\{\(\[\,]$/g.test(char)){
          if(operation=='insert'){
            if(char == '{'||char==','){
              if(char == '{'){
                this.addDoubleChar('}')
              }
              this.changeSuggestions('label')
            }else if(char == '('){
              this.addDoubleChar(')')
            }else if(char == '['){
              this.addDoubleChar(']')
            }
          }else{
            this.delDoubleChar(char);
          }
        }else if(/^[=\"]/g.test(char)){
          if(operation=='insert'){
            if(char == '"'){
              this.addDoubleChar('"');
            }
            this.changeSuggestions('values')

          }else{
            if(char == '"'){
              this.delDoubleChar(char);
            }
          }
        }
      },
      addDoubleChar:function(char){
        this.insertTextAtIndex(char,this.cursorIndex);
        this.quill.setSelection(this.cursorIndex)
      },
      delDoubleChar:function(leftChar){
        let char=this.content.charAt(this.cursorIndex);
        let temp=leftChar+char;

        if(/(\{\})|(\(\))|(\[\])|(\"\")/.test(temp)){
          this.quill.deleteText(this.cursorIndex,1,'api');
        }
        if(leftChar == '{'){
          this.pivotalCursorIndex=0;
        }
      },
      changeSuggestions:function(type){
        if(type == 'label'){
          this.queryLabels();
        }else if(type == 'values'){
          this.queryValues();
        }else if(type  == 'type'){
          this.packageTypeInfo();
        }
      },
      packageTypeInfo:function(){
        let metricReg=/[a-zA-Z_]\w*?\b\{.*?\}/g
        let functionReg=/[a-zA-Z_]\w*?\(.*?\)/g
        if(functionReg.test(this.content)){
          let tempIndex=this.cursorIndex;
          let tempStart,tempChar=this.content.charAt(tempIndex-1);

          //向前查找，找到边界
          while(tempIndex>0&&/[a-zA-Z_]/.test(tempChar)){
            tempIndex--;
            tempChar=this.content.charAt(tempIndex);
          }

          this.editRange.start=tempIndex+1;
          this.editRange.end=this.cursorIndex;
        }else{
          if(metricReg.test(this.content)){
            let match=this.globalMatch(metricReg,this.content)
            if(match&&match.length>0){
              let isInnerExpression=false;
              let editExpression=null;
              match.forEach(item=>{
                let content=item[0];
                let index=item.index;
                let length=content.length;
                if(index < this.cursorIndex && index+length>this.cursorIndex){ //判断是否在一个完整子表达式中
                  isInnerExpression=true;
                  editExpression=item;
                }
              })
              console.log('match',match,'isInnerExpress',isInnerExpression)
              if(isInnerExpression&&editExpression){
                let expression=editExpression[0];
                let labelValuesReg=/\{((\w*?=.*?,{0,1})+?)\}/
                if(labelValuesReg.test(expression)){
                  let match=labelValuesReg.exec(expression);
                  if(editExpression.index+match.index>this.cursorIndex){
                    this.queryTypeInfos();
                  }
                }
                this.editRange.start=editExpression.index;
                this.editRange.end=editExpression.index+expression.length;
              }else{
                let tempIndex=this.cursorIndex;
                let tempStart,tempChar=this.content.charAt(tempIndex-1);

                //向前查找，找到边界
                while(tempIndex>0&&/[a-zA-Z_]/.test(tempChar)){
                  tempIndex--;
                  tempChar=this.content.charAt(tempIndex);
                }

                this.editRange.start=tempIndex+1;
                this.editRange.end=this.cursorIndex;

                console.log('multi expression',this.editRange)

                this.queryTypeInfos();
              }

            }
          }else{
            console.log('mo match metric')
            this.editRange.start=0;
            this.editRange.end=this.cursorIndex;
            this.queryTypeInfos();
          }
        }
      },
      queryTypeInfos:function(){
        this.noStyleSuggestions={};
        this.$set(this.noStyleSuggestions,'metrics',this.tempStoreMetric)
        this.$set(this.noStyleSuggestions,'operators',suggestions.getOperators())
        this.$set(this.noStyleSuggestions,'functions',suggestions.getFunctions())
        this.showSuggestions=this.deepClone(this.noStyleSuggestions)
      },
      queryValues:function(){
        let labelValuesReg=/\{((\w*?=.*?,{0,1})+?)\}/
        if(labelValuesReg.test(this.content)){
          let match=labelValuesReg.exec(this.content);
          let labelValues=match[0]
          let index=match.index;
          if(labelValues){
            let tempCounter=this.cursorIndex;
            let equalIndex=-1;
            let boundaryIndex=-1;
            while(tempCounter>=index){
              let char=this.content.charAt(tempCounter);
              if(char=='='){
                equalIndex=tempCounter;
              }

              if(char==','||char == '{'){
                boundaryIndex=tempCounter+1;
                break;
              }

              tempCounter--;
            }
            let label=this.content.substring(boundaryIndex,equalIndex);
            console.log('label',this.content.substring(boundaryIndex,equalIndex))

            let values=this.labelValues.get(label);

            this.noStyleSuggestions={values:values}
            this.showSuggestions=this.deepClone(this.noStyleSuggestions)
          }
        }
      },
      queryLabels:function(){
        let labels=/\{.*\}/;
        if(labels.test(this.content)){
          let match=labels.exec(this.content);
          let index=match.index;
          let matchContent=match[0];
          if(this.cursorIndex<index || this.cursorIndex>index + matchContent.length){
            return ;
          }
        }else{
          this.queryTypeInfos();
          return;
        }
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
            console.log('change labels',this.showSuggestions)
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
        }else if(type == 'values'){
          this.handleValueClick(item);
        }else if(type == 'operators'){
          this.handleOperatorClick(item);
        }
      },
      handleOperatorClick:function(item){
        this.deleteTextInRange(this.editRange.start,this.cursorIndex)
        this.insertTextAtIndex(item.insertText,this.editRange.start == 0?this.editRange.start-1:this.editRange.start);
        this.quill.setSelection(this.cursorIndex+item.insertText.length);
        this.storeCursor().then(()=>{
          this.insertTextAtIndex('(',this.cursorIndex,'user')
          this.quill.setSelection(this.cursorIndex+1)
          this.editRange.start=this.cursorIndex;
          this.editRange.end=this.cursorIndex;
        })
      },
      handleMetricClick:function(item){
        this.deleteTextInRange(this.editRange.start,this.cursorIndex)
        this.$nextTick(()=>{
          this.insertTextAtIndex(item.insertText,this.editRange.start==0?this.editRange.start-1:this.editRange.start);
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
      handleValueClick:function(item){
        let preChar=this.content.substring(this.pivotalCursorIndex-1,this.pivotalCursorIndex);
        this.quill.setSelection(this.pivotalCursorIndex,this.cursorIndex-this.pivotalCursorIndex,'api');
        this.deleteTextInRange(this.pivotalCursorIndex,this.cursorIndex-this.pivotalCursorIndex)
        if(preChar == '='){
          this.insertTextAtIndex('"'+item.insertText+'"',this.pivotalCursorIndex)
        }else{
          this.insertTextAtIndex(item.insertText,this.pivotalCursorIndex)
        }
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
            console.log('range',range)
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
      globalMatch:function(pattern,content){
        let result=[];
        let temp;
        pattern.lastIndex=0;
        while ((temp = pattern.exec(content)) != null) {
          result.push(temp)
        }

        return result;
      },
      queryMetrics:function(){
        this.$get('/prom/api/v1/label/__name__/values').then(response=>{
          if(response.status == 'success'){
            let metrics=response.data.map(item=>{
              return {label:item,insertText:item};
            })

            this.tempStoreMetric=this.deepClone(metrics);
            this.queryTypeInfos();
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
    },
    watch:{
      content:function(n,o){

      }
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
