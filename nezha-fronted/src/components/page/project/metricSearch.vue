<template>
  <div class="new-search" >
    <div class="search-input-all input-position" @click="">
      <!--            历史记录-->
      <div class="search-history">
        <el-popover placement="bottom"
                    v-model="historyShow"
        >
          <div>
            <div class="history-title">
              <span >{{$t('search.recentSearch')}}</span>
            </div>

            <ul>
              <li v-for="(item,index) in queryHistory" class="history-li"  @click="pickHistory(item)">{{item}}</li>
            </ul>
          </div>

          <div slot="reference" @click.prevent.stop=""  class="search-input-history" ><i class="el-icon-time"  id="search-view-history"></i></div>
        </el-popover>

      </div>
      <!--            搜索框-->
      <div class="input-center-box" id="input-center-box">
        <el-autocomplete
          id="query-expression"
          class="inline-input"
          v-model="queryExpression"
          size="mini"
          :fetch-suggestions="querySearch"
          :placeholder="$t('project.endpoint.promExpr')"
          @select="handleSelect"
          ref="queryExpression"
        >
          <template slot-scope="{ item }">
            <el-popover
              trigger="hover"
              placement="left"
            >
              <span><span class="tip-line-font">[{{item.type}}]&nbsp;</span>{{ item.key }}</span>
              <span slot="reference">{{ item.key }}<!--:{{item.type}}--></span>
            </el-popover>

          </template>
        </el-autocomplete>
      </div>
      <!--            清空内容-->
      <div class="clear-search" @click="clearInput">
        <i class="el-icon-close"></i>
      </div>
    </div>
    <button @click="filterTabelData" type="button" class="nz-btn nz-btn-size-normal nz-btn-style-light float-right" id="search-input-search"><i class="el-icon-search"></i></button>
  </div>
  <!--<div class="metric-search-box margin-r-20" :class="componetStyle">
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
        <template slot-scope="{ item }">
          <span>{{ item.key }}&lt;!&ndash;:{{item.type}}&ndash;&gt;</span>
        </template>
      </el-autocomplete><button class="nz-btn nz-btn-size-normal nz-btn-style-light" @click="filterTabelData"><i class="el-icon-search"></i></button>
    </div>
  </div>-->

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
          if(this.queryHistory.length>10){
            this.queryHistory.splice(10,this.queryHistory.length-10);
          }
          localStorage.setItem(this.localStorageHistoryKey,JSON.stringify(this.queryHistory));
        },
        pickHistory:function(expression){
          this.queryExpression=expression;
          this.filterTabelData();
          this.historyShow=false;
        },
        clearInput:function(){
          this.queryExpression=this.saveExpression='';
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
              this.metricSet=false;
              this.labelSet=false;
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

<style scoped lang="scss">
  @import '../../../assets/stylus/index';
  /*  .search-input-history{
    display: inline-block;
    border:1px solid  #e5e5e5;
    border-radius: 10%;
  }
  .search-input{
    display: inline-block;
  }
  .metric-search-box {
    display: inline-block;
  }*/
  .history-title{
    width: 100%;
    height: 40px;
    line-height: 40px;
    line-height: 40px;
    text-align: center;
    position: relative;
    border-bottom: 1px solid #dfdfdf;
    color: #2e2e2e;
  }
  .history-li{
    padding: 5px 10px;
    line-height: 20px;
  }
  .history-li:hover{
    background: #f0f0f0;
    cursor:pointer;
  }
  .tip-line-font{
    color:$header-text-color;
  }
 .new-search{
   display: flex;
   position: relative;
   line-height: 25px;
   border-radius: 4px;
   border: 1px solid #D8D8D8;
   /*box-shadow: inset 0 0 5px 0 rgba(184,184,184,0.80);*/
 }
.new-search .nz-btn {
  box-shadow: 0 0 1px 1px #d8d8d8;
  border-radius: 0 4px 4px 0;
}
.new-search .search-input-all{
  width: 240px;
  background-color: $content-right-background-color;
  color: rgba(0,0,0,.55);
  height: 24px;
  line-height: 24px;
  border-bottom-left-radius: 5px;
  border-top-left-radius: 5px;
  display: flex;
  position: relative;

}
input {
  background-color: $content-right-background-color;
}
.search-input-all .btn-retract{
  padding: 0px 4px;
  text-align: center;
}
.search-input-all .search-history{
  padding: 0px 7px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border-right: 1px solid #e5e5e5;
  margin-top: 4px;
  position: relative;
}
.search-input-all .input-center-box{
  flex: 1;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}
.input-center-box::-webkit-scrollbar {/*滚动条整体样式*/
  width: 4px;     /*高宽分别对应横竖滚动条的尺寸*/
  height: 6px;
}
.input-center-box::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
  border-radius: 3px;
  -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  background: rgba(0,0,0,0.2);
}
.input-center-box::-webkit-scrollbar-track {/*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
  border-radius: 0;
  background: rgba(0,0,0,0.1);
}
.search-input-all .clear-search{
  padding: 0 5px;
  text-align: center;
  font-size: 12px;
}
.dataBackG{
  background: #f0f0f0;
}
.none{
  display: none !important;
}
.new-search-btn {
  padding: 0 4px;
  cursor: pointer;
}
.search-text{
  display: inline-block;
  margin-right: 20px;
}
.sreach_box{
  position: relative;
  width: 80%;
  height: 25px;
  padding: 20px;
  background: #fff;
  margin: 200px auto;
}
.keyring_sreach_right_btn{
  width: 18%;
  height: 25px;
  float: right;
  line-height: 25px;
  text-align: center;
  border: 1px solid #dfdfdf;
}
.keyring_sreach_right_btn .right-btn-group{
  float: left;
  width: 80%;
  border-right: 1px solid #dfdfdf;
  box-sizing: border-box;
}
.keyring_sreach_right_btn .right-btn-icon{
  float: left;
  width: 19%;
}
.sreach_box .close_zhezhao{
  position: absolute;
  right: 0;
  top: -50px;
  width: 24px;
  height: 25px;
  border-radius: 50%;
  background: #fff;
  text-align: center;
  line-height: 28px;
  font-size: 12px;
}

.localStorage_list_box{
  position: absolute;
  left: 10px;
  top: 36px;
  width: auto;
  min-width:250px;
  max-width: 350px;
  height: auto;
  border: 1px solid #dfdfdf;
  background: #fff;
  color: #2e2e2e;
  text-align: left;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 9999;
  font-size: 12px;
}
.localStorage_list_box .list_box_title{
  width: 100%;
  height: 40px;
  line-height: 40px;
  line-height: 40px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid #dfdfdf;
  color: #2e2e2e;
}
.localStorage_list_box .list_box_title i{
  position: absolute;
  right: 10px;
}
.localStorage_list_box .list_box_content{
  text-align: left;
  padding: 5px 0;
  box-sizing: border-box;
  border-bottom: 1px solid #dfdfdf;
}
.localStorage_list_box ul li{
  padding: 5px 10px;
  line-height: 20px;
}
.localStorage_list_box ul li:hover{
  background: #f0f0f0;
  cursor:pointer;
}

.localStorage_list_box ul li span{
  color: #2e2e2e;
}
.localStorage_list_box ul li .value{
  font-weight: 600;
}
.localStorage_list_box .list_box_clear{
  padding-left: 10px;
  line-height: 40px;
}
.localStorage_list_box .list_box_clear:hover{
  background: #f0f0f0;
  cursor:pointer;
}
.input-center-box .sreach_fixe_left{
  width: auto;
  display: flex;
  height: 100%;
  min-width: 100%;
}
.sreach_list{
  display: flex;
  justify-content:flex-start;
  height: 100%;
  padding-left: 10px;
}
.sreach_fixe_left .selectinfo_box{
  display: flex;
  flex-shrink: 0;
  width: auto;
  height: auto;
  margin: 3px 2px;
  font-size: 12px;
}
.selectinfo_box .select_condition{
  float:left;
  height: 13px;
  padding: 3px;
  background:#f8f8f8;
  line-height: 13px;
  color: rgba(0,0,0,.55);
}
.selectinfo_box .select_content{
  float: left;
  line-height: 13px;
  height: 13px;
  padding: 3px;
  background: #f0f0f0;
  color: rgba(0,0,0,0.85);
  display: flex;
}
.select_input{
  height: 100%;
  flex: 1;
  float: left;
  min-width: 100px;
}
.select_input input{
  width: 100%;
  height: 100%;
  border: none;
  float: left;
  padding-left: 5px !important;
  box-sizing: border-box;
}
.select_input input:focus {
  border:none;
  box-shadow:none;
}
.select_input .select_info_list{
  position: absolute;
  left: 100px;
  top: 36px;
  height: auto;
  width: auto;
  max-height: 240px;
  padding: 5px 0;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-y: auto;
  z-index: 9999;
}
.select_info_list ul li{
  padding: 5px 10px;
  line-height: 20px;
}
.select_info_list ul li:hover{
  background: #f0f0f0;
  cursor: pointer;
}
.sreach_input .input{
  flex: 1;
  height: 100%;
  padding-left: 10px !important;
  box-sizing: border-box;
  position: relative;
}
.sreach_input .input input{
  width: 100%;
  height: 100%;
  border: none;
  padding: 0 !important;
  float: left;
}
.sreach_box input:focus {
  outline: none;
  border-color: transparent;
  box-shadow: none;
}
.sreach_input input::placeholder{
  color: rgba(0,0,0,0.55)
}
.input_list{
  position: absolute;
  left: 47px;
  top: 36px;
  width: auto;
  max-width: 400px;
  max-height: 240px;
  min-width: 300px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 9;
  overflow-y: auto;
  font-size: 12px;
}
.input_list ul{
  padding: 4px 0;
}
.input_list ul li{
  padding: 4px 10px;
  line-height: 16px;
  height: 20px;
}
.input_list ul li:hover{
  background: #f0f0f0;
  cursor:pointer;
}
.search-style-ind{
  background: #f0f0f0;
  cursor:pointer;
}
.sreach_fixe>i{
  margin-right: 15px;
}
.is-disabled{
  color: #C0C4CC;
  cursor: not-allowed !important;
  background: #fff !important;
}
li {
  list-style: none;
}
</style>
