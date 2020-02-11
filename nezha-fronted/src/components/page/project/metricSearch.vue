<template>
  <div :class="componetStyle">
    <el-popover placement="bottom"
                width="200"
                v-model="historyShow"
                >
      <ul>
        <li v-for="(item,index) in queryHistory" class="history-li" @click="pickHistory(item)">{{item}}</li>
      </ul>
      <div slot="reference" @click.prevent.stop=""  class="search-input-history" ><i class="el-icon-time"/></div>
    </el-popover>

    <div class="search-input">
      <el-autocomplete
        id="query-expression"
        class="inline-input"
        v-model="queryExpression"
        size="mini"
        width="300"
        :fetch-suggestions="querySearch"
        :placeholder="$t('project.endpoint.promExpr')"
        @select="handleSelect"
        ref="queryExpression"
      >
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
        <template slot-scope="{ item }">
          <span>{{ item.key }}<!--:{{item.type}}--></span>
        </template>
      </el-autocomplete>
      <button class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="filterTabelData">GO</button>
    </div>
  </div>

</template>

<script>
    import en from "../../common/language/en";

    export default {
      name: "metricSearch",
      props:{
        metrics:{type:Array},
        labels:{type:Array},
        componetStyle:{type:String}
      },
      created() {
      },
      data:function(){
        return {
          queryExpression:'',//输入框显示的表达式
          saveExpression:'',
          filter:null, //filter
          metricSet:false,//是否设置了metric
          labelSet:false,//是否设置了label
          suggestionArray:[], //提示下拉选的数组
          inputElment:null,//输入框的html元素,
          caretIndex:-1, //选中后光标的位置
          localStorageHistoryKey:'endpoint_query_history',
          queryHistory:[],
          historyShow:false,
        }
      },
      methods:{
        querySearch(queryString, cb) {
          // 调用 callback 返回建议列表的数据
          let results=queryString?this.suggestionArray.filter(this.filter(queryString)):this.suggestionArray;
          cb(results)
        },
        handleSelect(item) {
          let temp=this;
          console.log(temp.queryExpression)
          if(item.type==='metric'){
            temp.queryExpression=item.key+'{}';
            temp.saveExpression=temp.queryExpression;
            temp.filter=this.labelFilter;
            temp.metricSet=true;
            temp.suggestionArray=temp.labels;
            this.foucsAndMoveCaret();
          }else if(item.type==='label' && this.metricSet){
            temp.queryExpression=temp.saveExpression.substr(0,temp.caretIndex)+item.key+'='+temp.saveExpression.substr(temp.caretIndex,temp.saveExpression.length);
            temp.saveExpression=temp.queryExpression;
            temp.suggestionArray=[];
            temp.foucsAndMoveCaret();
          }else if(item.type==='label' && !this.metricSet && !temp.labelSet){
            temp.queryExpression="{"+item.key+"=}";
            temp.saveExpression=temp.queryExpression;
            temp.suggestionArray=[];
            temp.labelSet=true;
            temp.foucsAndMoveCaret();
          }else if(item.type=='label'&& !this.metricSet && temp.labelSet){
            temp.queryExpression=temp.saveExpression.substr(0,temp.caretIndex)+item.key+'='+temp.saveExpression.substr(temp.caretIndex,temp.saveExpression.length);
            temp.saveExpression=temp.queryExpression;
            temp.suggestionArray=[];
            temp.foucsAndMoveCaret();
          }
        },
        initFilter(queryString) {
          return (suggestion) => {
            return (suggestion.key.toLowerCase().indexOf(queryString.toLowerCase()) != -1);
          };
        },
        labelFilter(queryString){
          let caretPos = this.inputElment.selectionEnd;
          queryString=queryString.substr(this.caretIndex,caretPos-this.caretIndex);
          return (suggestion) => {
            return (suggestion.key.toLowerCase().indexOf(queryString.toLowerCase()) != -1);
          };
        },
        foucsAndMoveCaret(){
          let temp=this;
          temp.$refs.queryExpression.focus();
          setTimeout(function(){
            temp.caretIndex=temp.queryExpression.length-1
            temp.inputElment.setSelectionRange(temp.caretIndex,temp.caretIndex);
          },100);
        },
        filterTabelData:function(){
          this.$emit('expression-change',this.queryExpression);
          this.queryHistory.unshift(this.queryExpression);
          localStorage.setItem(this.localStorageHistoryKey,JSON.stringify(this.queryHistory));
        },
        pickHistory:function(expression){
          this.queryExpression=expression;
          this.filterTabelData();
          this.historyShow=false;
        }
      },
      mounted() {
        this.filter=this.initFilter;
        this.suggestionArray=this.labels.concat(this.metrics);
        this.inputElment=document.getElementById('query-expression');
        this.queryHistory=JSON.parse(localStorage.getItem(this.localStorageHistoryKey))?JSON.parse(localStorage.getItem(this.localStorageHistoryKey)):[];
      },
      watch:{
        queryExpression:function(n,o){
          if(o.length<n.length){
            if(n&&/\w*\{.*\}.*/i.test(n)){
              let caretPos=this.inputElment.selectionEnd;
              console.log('caretPos:'+caretPos+" lastOf:"+n.lastIndexOf('}'))
              if(caretPos <= n.lastIndexOf('}')&&n.substr(caretPos-1,1)==','){
                this.suggestionArray=this.labels;
                this.saveExpression=n;
                this.filter=this.labelFilter;
                this.foucsAndMoveCaret();
              }
            }
          }else{
            this.saveExpression=n;
            this.caretIndex=this.inputElment.selectionEnd;
            if(n.length==0){
              this.filter=this.initFilter;
              this.suggestionArray=this.labels.concat(this.metrics);
            }
            if(n.length>0 && n.indexOf('{')==-1){
              this.filter=this.initFilter;
              this.suggestionArray=this.metrics;
            }
          }
        }

      }
    }
</script>

<style scoped>
  .search-input-history{
    display: inline-block;
    border:1px solid  #e5e5e5;
    border-radius: 10%;
  }
  .search-input{
    display: inline-block;
  }
  .history-li:hover{
    background-color: #e5e5e5;
  }
</style>
