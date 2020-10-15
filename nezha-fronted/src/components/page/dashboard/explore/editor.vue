<template>
  <div class="metric-editor" v-clickoutside="clickout" :class="{'metric-editor-rb': styleType == 2}">
    <div :id="id" class="editor-core" ref="editor" :style="{height: styleType == 2 ? 'auto' : ''}"></div>
    <span class="nz-input-append editor-clear" style="display: none" @click="clearContent"><i class="nz-icon nz-icon-circle-close"></i></span>
    <div class="metric-editor-popper" :style="{left:popperPos.left+'px'}">
      <div class="metric-popper-main" v-show="showType">
        <el-scrollbar style="height: 100%;width:100%" class="el-scrollbar-small" ref="scroll">
          <div v-for="(key, index) in orders" >
            <div v-html="key" class="popper-group" v-show="showSuggestions[key]"></div>
            <div class="popper-item" v-for="(item,i) in showSuggestions[key]" v-html="item.label" :key="item.insertText" :type="key" :value="item.insertText" @click.stop="handleItemClick(key,item,$event)" @mouseover="itemHover(item)" @mouseout="itemOut(item)"></div>
          </div>
        </el-scrollbar>
      </div>
      <div class="metric-popper-desc" v-if="showType&&Object.keys(showSuggestions).length>0&&showDescription && detailItem && detailItem.documentation">
        <div><b>{{detailItem.insertText}}</b></div>
        <hr/>
        <div>{{detailItem.documentation}}</div>
      </div>
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
      value: String,
      metricList:{type:Array},
      styleType: Number,
      historyParam:Object
    },
    model:{
      prop:'value',
      event:'expression-change'
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
        orders:['history','operators','functions','metrics','labels','values','range'],
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
          placeholder: this.$t('dashboard.metricPreview.inputTip')
        },
        labelValues:{},
        tempStoreMetric:{},
        showType:false,
        showDescription:false,
        detailItem:{},
        formatTimer:null,
        userChangeTimer:null,
        filterTimer:null,
      }
    },
    created(){
      this.queryMetrics();
    },
    methods:{
      userChange:function(char,operation,newContent,oldContent){
        this.changeSuggestions('type')
        this.dealSpecilChar(char,operation);

        if(this.pivotalCursorIndex!=0){
          //console.log('pivotalCursorIndex',this.pivotalCursorIndex,'cursorIndex',this.cursorIndex)
          newContent=newContent.substring(this.pivotalCursorIndex,this.cursorIndex);
        }
        clearTimeout(this.filterTimer)
        this.filterTimer=setTimeout(()=>{
          this.filterItems(newContent);
        },200)
      },
      dealSpecilChar:function(char,operation){//控制括号的成对添加和删除
        // console.log('specil char',char)
        if(/^[\{\(\[\,]$/g.test(char)){
          if(operation=='insert'){
            if(char == '{'||char==','){
              if(char == '{'){
                this.addDoubleChar('}')
              }
              this.changeSuggestions('label')
            }else if(char == '('){
              this.addDoubleChar(')')
              this.queryTypeInfos()
            }else if(char == '['){
              this.addDoubleChar(']')
              this.changeSuggestions('range')
            }
          }else{
            this.delDoubleChar(char);
          }
        }else if(/^[(=|!=|=~|!~)\"]/g.test(char)){
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
        let tempIndex=this.pivotalCursorIndex;
        let tempStart,tempChar=this.content.charAt(tempIndex-1);

        //向前查找，找到边界
        while(!/[\{\(\[,= ]/.test(tempChar)&&tempIndex>0){
          tempIndex--;
          tempChar=this.content.charAt(tempIndex);
        }
        // console.log('tempIndex =====',tempIndex)
        this.pivotalCursorIndex=tempIndex==0?-1:tempIndex+1;

        //console.log('after del double char',this.pivotalCursorIndex)
      },
      changeSuggestions:function(type){
        if(type == 'label'){
          this.queryLabels();
        }else if(type == 'values'){
          this.queryValues();
        }else if(type  == 'type'){
          this.packageTypeInfo();
        }else if(type == 'range'){
          this.noStyleSuggestions={range:suggestions.getRateRange()}
        }
      },
      packageTypeInfo:function(){
        let functionReg=/[a-zA-Z_]\w*?\(.*?\)/g
        if(functionReg.test(this.content)){
          functionReg.lastIndex=0;
          let funcMatch=functionReg.exec(this.content);
          let funcContent=funcMatch[0]
          let funcReg=/\(.*\)/g
          let match=funcReg.exec(funcContent);

          let funcBody=match[0].substring(1,match[0].length-1);

          this.matchMetric(funcBody,funcMatch.index+match.index)
        }else{
          this.matchMetric()
        }
      },
      formatContent:function(){

        let punctuationReg=/[\{\}\(\)\[\]]/g;
        this.formatText(punctuationReg,{'color':'#ff7941'})

        let labelKeyReg=/[a-z_]\w*(?=\s*(=|!=|=~|!~))/g
        this.formatText(labelKeyReg,{'color':'#3274d9'})

        let labelValueReg= /"(?:\\.|[^\\"])*"/g
        this.formatText(labelValueReg,{'color':'#3eb15b'})

        let metricReg= /([A-Za-z:][\w:]*)\b(?![\(\]{=!",])/g;
        this.formatText(metricReg,{'color':'#52545c'})

        // let rangeReg=/(?<=\[)\b\d+[smdwy]\b(?=\])/ig
        // this.formatText(rangeReg,{'color':'#9954bb'})
        let rangeReg=/\[\b(\d+[smdwy])\b\]/ig
        if(rangeReg.test(this.content)){
          let matchs=this.globalMatch(rangeReg,this.content);
          //console.log('matchs',matchs)
          matchs.forEach(item=>{
            this.quill.formatText(item.index+1,item[1].length,{'color':'#9954bb'},'silent')
          })
        }
      },
      formatText:function(pattern,style){
        if(pattern.test(this.content)){
          let matchs=this.globalMatch(pattern,this.content);
          matchs.forEach(item=>{
            this.quill.formatText(item.index,item[0].length,style,'silent')
          })
        }
      },
      matchMetric:function(){
        let metricReg=/[a-zA-Z_]\w*?\b\{.*?\}/g
        if(metricReg.test(this.content)){
          let match=this.globalMatch(metricReg,this.content)
          if(match&&match.length>0){
            let isInnerExpression=false;
            let editExpression=null;
            match.forEach(item=>{
              let content=item[0];
              let index=item.index
              let length=content.length;
              if(index < this.cursorIndex && index+length>this.cursorIndex){ //判断是否在一个完整子表达式中
                isInnerExpression=true;
                editExpression=item;
              }
            })
            //console.log('match',match,'isInnerExpress',isInnerExpression)
            if(isInnerExpression&&editExpression){
              let expression=editExpression[0];
              let labelValuesReg=/\{((\w*?(=|!=|=~|!~).*?,{0,1})+?)\}/
              if(labelValuesReg.test(expression)){
                let match=labelValuesReg.exec(expression);
                if(editExpression.index+match.index>this.cursorIndex){
                  this.queryTypeInfos();
                }
              }
            }else{
              let tempIndex=this.cursorIndex;
              let tempStart,tempChar=this.content.charAt(tempIndex-1);

              //向前查找，找到边界
              while(tempIndex>0&&/[a-zA-Z_]/.test(tempChar)){
                tempIndex--;
                tempChar=this.content.charAt(tempIndex);
              }

              this.queryTypeInfos();
            }

          }
        }else{
          //console.log('mo match metric')
          this.queryTypeInfos();
        }
      },
      queryTypeInfos:function(){
        this.noStyleSuggestions={};
        if(this.historyParam&&this.historyParam.useHistory){
          let username=sessionStorage.getItem("nz-username");
          let historyJson=localStorage.getItem(this.historyParam.key);
          if(historyJson && historyJson != 'undefined' && historyJson != ''){
            let historyObj=JSON.parse(historyJson);
            let history = historyObj[username];
            history=history.filter(item=>{
              return item.time + item.expire >= new Date().getTime();
            })
            this.$set(this.noStyleSuggestions,'history',history.slice(0,10));
          }
        }
        this.$set(this.noStyleSuggestions,'metrics',this.tempStoreMetric)
        // this.$set(this.noStyleSuggestions,'operators',suggestions.getOperators())
        this.$set(this.noStyleSuggestions,'functions',suggestions.getFunctions())
      },
      queryValues:function(){
        let labelValuesReg=/\{((\w*?(=|!=|=~|!~).*?,{0,1})+?)\}/
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
              if(/(=|!)/.test(char)){
                equalIndex=tempCounter;
              }

              if(char==','||char == '{'){
                boundaryIndex=tempCounter+1;
                break;
              }

              tempCounter--;
            }
            let label=this.content.substring(boundaryIndex,equalIndex);
            //console.log('label',this.content.substring(boundaryIndex,equalIndex))

            let values=this.labelValues.get(label);

            this.noStyleSuggestions={values:values}
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

        let metricReg=/([a-zA-Z_]\w*)\b\{.*?\}/g;
        let editMetricExpression='';
        let match=this.globalMatch(metricReg,this.content);
        if(match&&match.length>0){
          for(let i=0;i<match.length;i++){
            let temp=match[i];
            if(temp.index<this.cursorIndex && temp.index + temp[0].length > this.cursorIndex){
              editMetricExpression=temp[0]
              break;
            }
          }
        }
        //console.log('query metric',editMetricExpression)
        let metric=/([a-zA-Z_]\w*)\b(?=\{)/.exec(editMetricExpression)[0];
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
            //console.log('change labels',this.showSuggestions)
          }else{
            this.noStyleSuggestions={};
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
        //console.log(type,item,event)
        if(type=='metrics'){
          this.handleMetricClick(item)
        }else if(type == 'labels'){
          this.handleLabelClick(item)
        }else if(type == 'values'){
          this.handleValueClick(item);
        }else if(type == 'operators'){
          this.handleOperatorClick(item);
        }else if(type == 'functions'){
          this.handleFunctionClick(item);
        }else if(type  == 'range'){
          this.handleRangeClick(item);
        }else if(type == 'history'){
          this.handleHistoryClick(item)
        }
      },
      handleHistoryClick:function(item){
        this.setContent(item.insertText);

        this.showType=false;
        this.quill.blur();
        this.$nextTick(()=>{
          this.$emit('on-blur');
        })
      },
      handleRangeClick:function(item){
        this.quill.setSelection(this.pivotalCursorIndex,this.cursorIndex-this.pivotalCursorIndex,'api');
        this.deleteTextInRange(this.pivotalCursorIndex,this.cursorIndex)
        this.insertTextAtIndex(item.insertText,this.pivotalCursorIndex)
        this.showType=false;
      },
      handleOperatorClick:function(item){
        this.deleteTextInRange(this.pivotalCursorIndex,this.cursorIndex)
        this.$nextTick(()=>{
          this.insertTextAtIndex(item.insertText,this.pivotalCursorIndex,'user');
          this.quill.setSelection(this.pivotalCursorIndex+item.insertText.length);
          this.storeCursor()
        })
        this.showType=false;
      },
      handleFunctionClick:function(item){
        this.deleteTextInRange(this.pivotalCursorIndex,this.cursorIndex)
        this.$nextTick(()=>{
          this.insertTextAtIndex(item.insertText,this.pivotalCursorIndex,'user');
          this.quill.setSelection(this.pivotalCursorIndex+item.insertText.length);
          this.storeCursor()
        })
        this.showType=false;
      },
      handleMetricClick:function(item){
        this.deleteTextInRange(this.pivotalCursorIndex,this.cursorIndex)
        this.$nextTick(()=>{
          this.insertTextAtIndex(item.insertText,this.pivotalCursorIndex,'user');
          this.quill.setSelection(this.pivotalCursorIndex+item.insertText.length);
          this.storeCursor()
        })
        this.showType=false;
      },
      handleLabelClick:function(item){
        this.quill.setSelection(this.pivotalCursorIndex,this.cursorIndex-this.pivotalCursorIndex,'api');
        this.deleteTextInRange(this.pivotalCursorIndex,this.cursorIndex)
        this.insertTextAtIndex(item.insertText+'',this.pivotalCursorIndex)
        this.storeCursor().then(()=>{
           this.insertTextAtIndex('=',null,'user')
           this.quill.setSelection(this.cursorIndex+1)
           this.changeSuggestions('value')
        })
        this.showType=true;
      },
      handleValueClick:function(item){
        let preChar=this.content.substring(this.pivotalCursorIndex-1,this.pivotalCursorIndex);
        this.quill.setSelection(this.pivotalCursorIndex,this.cursorIndex-this.pivotalCursorIndex,'api');
        this.deleteTextInRange(this.pivotalCursorIndex,this.cursorIndex)
        if(preChar == '='){
          this.insertTextAtIndex('"'+item.insertText+'"',this.pivotalCursorIndex)
        }else{
          this.insertTextAtIndex(item.insertText,this.pivotalCursorIndex)
        }
        this.showType=false;
      },
      toggleSelect:function(event){//上下键选择
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
        let item=this.findItemByToggleIndex();
        if(item &&item.documentation){
          this.showDescription=true;
          this.detailItem=this.deepClone(item);
        }else{
          this.showDescription=false;
          this.detailItem={};
        }
      },
      findItemByToggleIndex:function(){
        let selectedItem=this.storedSuggestions[this.toggleSelectIndex];
        if(selectedItem){
          let type=selectedItem.getAttribute('type');
          let insertText=selectedItem.getAttribute('value');
          let keys=Object.keys(this.noStyleSuggestions);
          for(let i=0;i<keys.length;i++){
            let items=this.noStyleSuggestions[keys[i]];
            let item=items.find(t=>{
              return t.insertText == insertText;
            })
            if(item){
              return item;
              break ;
            }
          }
        }
        return null;
      },
      pickItem:function(){//Tab键 获取选择
        let selectedItem=this.storedSuggestions[this.toggleSelectIndex];
        if(selectedItem){
          let type=selectedItem.getAttribute('type');
          let insertText=selectedItem.getAttribute('value');
          if(type == 'metrics'){
            this.handleMetricClick({insertText:insertText})
          }else if(type == 'labels'){
            this.handleLabelClick({insertText:insertText});
          }else if(type=='values'){
            this.handleValueClick({insertText:insertText});
          }else if(type == 'operators'){
            this.handleOperatorClick({insertText:insertText})
          }else if(type == 'range'){
            this.handleRangeClick({insertText:insertText})
          }else if(type == 'functions'){
            this.handleFunctionClick({insertText:insertText})
          }else if(type ==  'history'){
            this.handleHistoryClick({insertText:insertText})
          }

        }
      },

      filterItems:function(input){ //过滤下拉选显示
        let suggestions=this.deepClone(this.noStyleSuggestions)
        new Promise((resolve => {
          let start = new Date().getTime();
          let result={};
          this.orders.forEach(key=>{
            let typeValues=suggestions[key];
            result[key]=[];
            typeValues&&typeValues.forEach(item=>{
              let index=item.insertText.toLowerCase().indexOf(input.toLowerCase());
              //console.log('index',index,'input',input)
              if(index != -1){
                // console.log('item',item.label,'input',input)
                // item.label=item.label.replace(input,`<mark>${input}</mark>`);
                let label=item.label;
                let pre=label.substring(0,index)
                let middle=label.substring(index,index+input.length)
                let suf=label.substring(index+input.length,label.length)
                item.label=`${pre}<mark>${middle}</mark>${suf}`
                result[key].push(item);
              }
            });
            if(result[key].length<1){
              delete result[key]
            }
          })
          this.showSuggestions=result;
          let end = new Date().getTime();
          resolve();
        })).then(()=>{
          if(Object.keys(this.showSuggestions).length>0){
            this.showType=true;
          }else{
            this.showType=false
          }
        })

        let scroll=this.$refs.scroll.wrap;
        scroll.scrollTop=0;
      },
      storeSuggestions:function(){
          this.$nextTick(()=>{
            let suggestions=this.$el.querySelectorAll('.popper-item');
            this.storedSuggestions=[...suggestions];
            //console.log('storedSuggestions->',suggestions)
          })
      },
      setContent:function(value){
        this.clearContent();
        this.quill.setText(value);
      },
      clearContent:function(){
        this.quill.deleteText(0,this.quill.getLength(),'api')
        this.cursorIndex=0;
        this.pivotalCursorIndex=0;
      },
      insertTextAtIndex:function(content,index,source='api'){
        this.quill.insertText(index?index:this.cursorIndex,content,source)
      },
      deleteTextInRange(from,to){
       return  this.quill.deleteText(from,to-from,'api')
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
            //console.log('range',range)
            if(range&&range.length == 0){
              $temp.cursorIndex=range.index;
              //console.log('current cursor-->',$temp.cursorIndex)

              if(/^[\{\(\[,= "]$/g.test(char)){
                $temp.pivotalCursorIndex=$temp.cursorIndex;
                //console.log('store pivotalCursorIndex',$temp.pivotalCursorIndex)
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
          },100)
        })
      },
      moveScroll:function(){
        let scroll=this.$refs.scroll.wrap;
        //console.log('scroll',scroll)
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
      clickout:function(){
        if(this.quill&&this.quill.hasFocus()){
          this.$emit('on-blur')
        }
        this.showType=false
      },
      itemHover:function(item){
        if(item&&item.documentation){
          this.showDescription=true;
          this.detailItem=this.deepClone(item);
        }
      },
      itemOut:function(item){
        if(this.toggleSelectIndex != -1){
          let tempItem=this.findItemByToggleIndex();
          if(tempItem&&tempItem.documentation){
            this.showDescription=true;
            this.detailItem=this.deepClone(tempItem);
          }else{
            this.showDescription=false;
            this.detailItem={};
          }
        }else{
          this.showDescription=false;
          this.detailItem={};
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
          //console.log('position:',this.popperPos)
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
        $temp.$el.addEventListener('keydown',function(event){
          //console.log('keydown',event)
          $temp.toggleSelect(event);
        })

        this.quill.keyboard.addBinding({
          key:'DOWN'
        },function(range,context){
          return false;
        })
        this.quill.keyboard.addBinding({
          key:'UP'
        },function(range,context){
          return false;
        })

        // this.quill.keyboard.addBinding({ key:'backspace'}, function(range,content) {
        //   console.log('quill tab binding',range,content)
        //   return false;
        // });
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
        if(this.metricList&&this.metricList.length>0){
          this.tempStoreMetric=this.deepClone(this.metricList)
          this.queryTypeInfos();
        }else{
          this.$get('/prom/api/v1/label/__name__/values').then(response=>{
            if(response.status == 'success'){
              let metrics=response.data.map(item=>{
                return {label:item,insertText:item};
              })

              this.tempStoreMetric=this.deepClone(metrics);
              this.queryTypeInfos();
            }
          })
        }
      },
    },
    computed: {

    },
    mounted() {
      let $temp=this;
      let bindings = { // quill默认的键只能通过这种方式覆盖
        tab: {
          key: 9,
          handler: function(range,content) {
            $temp.pickItem();
          }
        },
        enter:{
          key:13,
          handler:function(range,content){
            if(!$temp.showType){
              $temp.showType=false;
              $temp.quill.blur();
              $temp.$emit('on-enter')
              return false;
            }else{
              $temp.pickItem();
            }
          }
        }
      };
      this.options.modules.keyboard={};
      this.options.modules.keyboard.bindings=bindings;
      this.quill = new Quill(this.$refs.editor, this.options);
      $temp.$el.addEventListener('paste', function(even) {
        let text='';
        setTimeout(()=>{
          text=$temp.getContent();
        },100)//此值必须小于userChangeTimer的值
        setTimeout(()=>{
          $temp.setContent(text);
          $temp.quill.setSelection($temp.cursorIndex+text.length);
        },200)//此值必须大于userChangeTimer的值
      })
      this.quill.on('text-change',function(delta, oldDelta, source){
        if(source != 'silent'){
          // console.log('delta',delta,'oldDelta',oldDelta,'source',source)
          let char='',operation='';
          let oldContent='';
          oldDelta.ops.forEach((item,index)=>{
            if(index != oldDelta.ops.length-1){
              oldContent+=item.insert;
            }
          })
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
            //console.log(delta,oldDelta,oldContent)
            // clearTimeout($temp.userChangeTimer)
            // $temp.userChangeTimer=setTimeout(()=>{
              let newContent=$temp.getContent()
              promise.then(()=>{ //存储完光标后再进行后面的操作
                  $temp.userChange(char,operation,newContent,oldContent)
              })
            // },100)
          }
          $temp.content=$temp.getContent();
          //console.log('current content-->',$temp.content)
          $temp.getPosition();
          /*clearTimeout($temp.formatTimer)
          $temp.formatTimer=setTimeout($temp.formatContent,100)*/
          $temp.formatContent()
        }
        //监听文本区域的高度
        let lineHeight = 16;

      });
      this.registerKeydown();
    },
    watch:{
      content:function(n,o){
        this.$emit('expression-change',n)
        if(!n || n == ''){
          this.cursorIndex=0;
          this.pivotalCursorIndex=0;
        }
      },
      showSuggestions:{
        immediate:true,
        deep:true,
        handler(n,o){
          this.toggleSelectIndex=-1;
          this.storeSuggestions();
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .metric-editor{
    position: relative;
    height: 36px;
  }

  .metric-editor-popper{
    position: absolute;
    height: 600px;
    padding: 10px;
    margin-top: 5px;
    overflow: hidden;
    z-index:2001;
  }
  .metric-editor-popper .metric-popper-main{
    display: inline-block;
    box-sizing: border-box;
    border: 1px solid lightgrey;
    height: 100%;
    /*max-width: 66%;*/
    min-width: 200px;
    float: left;
    border-radius: 3px;
    box-shadow: 0 5px 10px 0 #dde4ed;
    color: #52545c;
    padding: 5px;
    background-color: white;
    overflow-x: hidden;
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
    background-color: white;
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
  .editor-core:hover + .editor-clear{
    display: inline-block !important;
  }
  .editor-clear {
    padding-top: 8px;
  }
  .editor-clear:hover{
    display: inline-block !important;
  }
</style>
<style lang="scss">
  mark{
    color: rgb(255, 133, 27);
    border-bottom: 1px solid rgb(255, 133, 27);
    padding: inherit;
    background: inherit;
    padding: 0;
  }
  .ql-editor{
    padding:7px 10px 10px 10px !important;
    overflow: hidden;
  }
  .metric-editor.metric-editor-rb {
    min-height: 32px;
    border-radius: 4px;
    height: auto;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    .editor-clear {
      padding-top: 4px;
    }
    .ql-container.ql-snow {
      border: none;
      .ql-editor {
        padding: 5px 0 !important;
        >p {
          padding: 0 26px 0 15px;
          font-size: 12px;
          color: rgb(96, 98, 102);
        }
      }
    }

  }
</style>
