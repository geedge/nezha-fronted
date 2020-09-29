<template>
  <div class="expressionInfo" :style="{top:expressionsInfoPosition.y+'px',left:expressionsInfoPosition.x+'px'}" v-if="expressionsData.length">
    <el-tooltip v-model="show" class="item" effect="light" content="Right Bottom 提示文字" placement="right-start" >
      <div slot="content"  class="main-box">
        <div v-if="total>10" class="more-title-other">
          {{$t('dashboard.panel.moreTitleOther')}}{{$t('dashboard.panel.showAllOther')}} {{ total}}
        </div>
        <div  v-for="(item,index) in expressionsData" class="expressions-box" :key="index">
          <span class="expressions-box-title">{{item.name}}</span>
          <div class="expressions-box-content"  v-if="item.value.length!==0">
            <div v-for="(item1,index2) in item.value" class="expressions-metric" :key="index2">
              <div v-if="item1.metric">
                <span class="expressions-box-label">{{legendFormat(item.metric,item.legend,item1.metric)}} :</span>
                <span class="expressions-box-value">{{ dataFormat(item.unit,item1)}}</span>
              </div>
              <div v-if="!item1.metric&&index2%2">
                <span class="expressions-box-label">{{legendFormat(item.metric,item.legend,item1.metric)}} :</span>
                <span class="expressions-box-value">{{ dataFormat(item.unit,item1)}}</span>
              </div>
            </div>
          </div>
          <div v-if="item.value.length===0" class="expressions-box-content">
            NoData
          </div>
        </div>
      </div>
      <div></div>
    </el-tooltip>
  </div>
</template>

<script>
  import chartDataFormat from "@/components/charts/chartDataFormat";
  export default {
    name:"expressionInfo",
    props:{
      lineId:{required:true},
      edgesArray:{},
      expressionsInfoPosition:{},
    },
    watch:{
      expressionsInfoPosition:{
        deep:true,
        immediate: true,
        handler(n){
          this.show=false;
          this.expressionsInfoPosition=n;
          this.$nextTick(()=>{
            this.show=true;
          })
        }
      }
    },
    data(){
      return{
        expressionsData:[],
        show:true,
        total:0,
      }
    },
    mounted(){
      let index=0;
      let arr=this.edgesArray.find(item=>item.id===this.lineId).expressions;
      if(arr.length===0){return};
      arr.forEach((item,i)=>{
        if(index<11){
          this.expressionsData.push({...item,value:[]})
        }
        item.value=item.value || [];
        item.value.forEach((item1,j)=>{
          index++;
          if(index<11){
            this.expressionsData[i].value.push(item1)
          }
        })
      });
      this.total=index;
    },
    methods:{
      dataFormat(unit,value){
        if(value.value){
          value=value.value[1]
        }else{
          value=value
        }
        return chartDataFormat.getUnit(unit?unit:2).compute(value)
      },
      legendFormat:function(legend,expression,metric){
        if(/\{\{.+\}\}/.test(expression)&&expression){
          let labelValue=expression.replace(/(\{\{.+?\}\})/g,function(i){
            let label=i.substr(i.indexOf('{{')+2,i.indexOf('}}')-i.indexOf('{{')-2);
            let reg=new RegExp(label+'=".+?"');
            let value=null;
            if(reg.test(legend)){
              let find=legend.match(reg)[0];
              value=find.substr(find.indexOf('"')+1,find.lastIndexOf('"')-find.indexOf('"')-1);
            }
            return value?(' '+value + ' '):(' '+label + ' ');
          });
          if(Object.keys(metric).length>0){
            let arr=labelValue.split(' ');
            labelValue='';
            arr.forEach((item)=>{
              if(metric[item]){
                labelValue+=metric[item] + ' '
              }else{
                labelValue+=item + ' '
              }
            });
          }
          return labelValue
        }else{
          return expression?expression:legend;
        }

      },
    }
  }
</script>

<style scoped>
  .expressionInfo{
    position: absolute;
    transform: translateX(20px);
    min-height: 20px;
    max-height: 200px;
    overflow: hidden;
  }
  .item{
    background: #FFFFFF;
    box-shadow: 1px 2px 8px 0 rgba(0,0,0,0.11);
    border-radius: 4px;
  }
  .more-title-other{
    margin-top: 5px;
    margin-bottom: 5px;
    font-size: 14px;
    color: #FA901C;
  }
  .main-box{
    min-width: 150px;
    padding: 0 5px 5px 5px;
  }
  .expressions-box{
    min-width: 100px;
  }
  .main-box .expressions-box:not(:last-child){
    border-bottom: 1px dashed #ebeef5;
    padding-bottom: 5px;
  }
  .expressions-box-title{
    margin-bottom: 5px;
    margin-top: 10px;
    display: inline-block;
    font-weight: bold;
    font-size: 14px;
    color: #333333;
  }
  .expressions-box-label{
    font-size: 14px;
    color: #666666;
    padding: 3px;
    min-width:60px;
    text-align: left;
  }
  .expressions-box-value{
    font-size: 14px;
    color: #3C92F1;
    padding: 3px 3px 3px 5px;
    min-width:40px;
  }
  .expressions-box-content{
    border-bottom: none;
  }
  .expressions-metric{
    display: flex;
  }
  .expressions-metric > span{
    /*width: 50%;*/
    /*overflow: hidden;*/
    /*text-overflow:ellipsis;*/
    /*white-space: nowrap;*/
    /*text-align: left;*/
  }
  .expressions-metric > span:not(:first-child){
  }
</style>
