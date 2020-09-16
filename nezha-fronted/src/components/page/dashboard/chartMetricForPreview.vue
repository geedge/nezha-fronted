<style scoped>
  .without-bottom {
    margin-bottom: 0;
  }
  .ivu-select-dropdown {
    max-height: 100px;
  }
  .error-info-text {
    position: absolute;
    top: 100%;
    left: 0;
    line-height: 1;
    padding-top: 6px;
    color: #ed3f14;
    white-space: nowrap;
    word-wrap: normal;
  }
  .error-text {
    color: #ed3f14;
    line-height: 1.5;
  }
  .nz-btn-style-higher{
    line-height: 22px;
  }
  /* .li-list-part {
     width: 90%;
     height: 130px;
     border: 1px solid #cfcfcf;
     overflow-y: auto;
   }
    .li-list-part-label-val-list {
      width: 100%;
      height: 145px;
      border: 1px solid #cfcfcf;
      overflow-y: auto;
      margin-top: 20px;/*21*/
      /* border: 0px;
     } */
  .li-list-part {
    height: 200px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px 12px;
    color: #666;
    width:90%;
   }
  .li-list-part-label-val-list {
    height: 280px;
    /*border: 1px solid #dcdfe6;*/
    border-radius: 4px;
    box-sizing:border-box;
    padding: 7px 0 10px 15px;
    margin-bottom:0px !important;
  }

  .no-list-style{
   list-style: none;
  }
  .li-cursor{
    cursor: pointer;
    padding: 3px 0;
    font-size: 14px;
  }
  .activeColor {
    background-color: #409EFF;
  }
  .metric-title-label{
    margin-bottom: 20px;
  }
  .metric-title-position{
    margin-bottom:-5px;
  }
  .metric-title-row-position{
    margin-top:-10px;
  }
  /* .star-red{
    /* color:#ff1818; */
  /* }  */
  .full-width{
    width:100%;
  }
  .mt1{
    margin-top:1px;
  }
  .symbol-area {
    position: relative;
    height: 111px;
  }
  .symbol-equal {
    position: absolute;
    bottom: 0;
    left: 5px;
    color: #c0c4cc;
    font-size: 24px;
  }
  .symbol-delete {
    padding-left: 8px;
    cursor: pointer;
  }
  .symbol-delete i {
    color: #c0c4cc;
   }
  .el-scrollbar__wrap{
    /* overflow: auto !important; */
    box-sizing:border-box;
    margin:0 auto;
    margin-bottom:0px !important;
   }
  .el-input .el-input__inner{
    /* width:80%; */
    /* display:flex; */
   }
  .metric-title-position{
    margin-bottom:2px;

  }
   /* .right-box-form-content-left{
     line-height: 32px;
     text-align: left;
     width: 100%;
     padding:0 10px;
   } */
   
  .el-form-item__content{
    padding-left:15px;
    margin:0 auto;

  }
  .li-list-part-label-val-list .metric-title-position .el-form-item__label {
    font-size: 14px;
    height: 10px;
    color: #666;
    line-height: 14px;
    margin:0 auto;

}
  .li-list-part-label-val-list .el-select--mini {
    width: calc(100% - 15px);/*calc(100% - 45px);*/
    margin:0 auto;

  } 

</style>
<style>
  .li-list-part-label-val-list .metric-title-position .el-form-item__label {
    font-size: 14px;
    height: 15px;
    color: #666;
    line-height: 14px;
    text-align: left;
    width: 100px;
  }
  .li-list-part-label-val-list .el-select--mini {
    width: calc(100% - 15px);
  }
  .li-list-part-label-val-list .el-scrollbar__wrap{
    /* overflow: auto !important; */
    box-sizing:border-box;
    margin:0 auto;
    margin-bottom:0px !important;
  }
  .nz-tab-chart-item-box{
    padding:0;
    display: inline-block;
  }
  .nz-tab-chart-style-left{
    margin-left:40px;
  }
</style>
<template>
  <el-form :model="elementInfo" ref="elementInfo"   >
    <el-row >
      <el-col :span="16">
        <!-- <span  class="star-red">*</span>&nbsp; -->
        {{$t('dashboard.panel.chartForm.metric')}}
      </el-col>
      <el-col :span="8" style="text-align: right;">
        <div class="nz-tab-item-box"  v-show="tableShow == 1">
          <div @click="" class="nz-tab-style nz-tab-style-light">
            <span>{{$t('dashboard.metric.normal')}}</span>
          </div>
          <div  @click="clickTabelShow(2,'expert')" class="nz-tab-style nz-tab-style-light-right ">
            <span>{{$t('dashboard.metric.expert')}}</span>
          </div>
        </div>
        <div @click="clickTabelShow(1,'normal')" class="nz-tab-item-box"  v-show="tableShow == 2">
           <div  class="nz-tab-style">
            <span>{{$t('dashboard.metric.normal')}}</span>
          </div>

          <div @click="" class="nz-tab-style nz-tab-style-light nz-tab-style-light-right  ">
            <span>{{$t('dashboard.metric.expert')}}</span>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row  v-if="tableShow == 2">
      <el-col :span="24" class="mt1">
        <el-form-item prop="expression" :rules="{ required: true,  message:$t('validate.required'), trigger: 'blur' }"><!--expression和metric的验证只能有一个，不能同时存在？？:rules="{ required: true, type: 'string', message: '', trigger: 'change' }"-->
          <el-input size="mini" rows="7" @input="changeExpression" class="full-width" ref="metricExpression" type="textarea" maxlength="1024" show-word-limit v-model="elementInfo.expression" :placeholder="this.$t('dashboard.metric.expertTip')" ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row  v-if="tableShow == 1">
      <el-col :span="24" >
        <el-form-item style="margin-bottom:0px;" label-width="80"  prop="metric" :rules="{ required: true,  message: $t('validate.required'), trigger: 'blur' }"><!--:rules="{ required: true, type: 'string', message: '', trigger: 'change' }"-->
              <!--
              <el-select  ref="metricSelect" class="full-width"  filterable placeholder="" popper-class="" size="small" v-model="elementInfo.metric"  @change="selectMetric">
                <el-option v-for="(item, index) in metricShowList.arr" :key="item.metric + index"
                :value="item.metric">{{item.metric}}</el-option>
              </el-select>
              -->
              <el-cascader ref="metricSelect" class="full-width"  filterable placeholder="" popper-class="" size="small"
                v-model="elementInfo.metric"
                :options="metricCascaderList"
                :props="{ expandTrigger: 'hover' }"
                :show-all-levels="false"
                @change="selectMetric"></el-cascader>
              <span v-if="metricShowList.text" class="error-info-text">{{metricShowList.text}}</span>
        </el-form-item>
      </el-col>
    </el-row>
    <!--create chart组件显示框  -->
    <el-row v-if="elementInfo.metric && tableShow == 1"><!--v-if="elementInfo.tagList.length > 0"-->
      <!--
      <el-col :span="9" style="margin-bottom: 20px;">
        <div class="li-list-part">
          <el-scrollbar style="height: 100%">
              <div class="li-cursor" v-if="!item.isSelect"
                  v-for="(item,index) in elementInfo.tagList"
                  @click="getLidata(index,item)"
                  :key="index">
                {{item.name}}
              </div>
          </el-scrollbar>
        </div>
      </el-col>

      <el-col :span="1" class="symbol-area"><span class="symbol-equal">=</span></el-col>
-->
      <el-col :span="24">
        <div class="li-list-part-label-val-list" id="scrollDiv">
          <el-scrollbar style="height: 100%">
            <el-form-item style="width:99%;" class="metric-title-position right-box-form-content" v-for="(item, index) in elementInfo.selectedTagList" :key="index"  label-width="100" :ref="'tagItem' + index" :prop="'tagList.' + index + '.value'" >
              <el-row :gutter="10" >
                <el-col :span="4" >
                  <div style="text-align:right;padding-right:5px;">{{item.name}}</div>
                </el-col>
                <el-col :span="20" >
                  <el-select  v-model="item.value" ref="tagSelect" size="mini"
                              placeholder=""
                              filterable
                              @change="changeTag"
                              multiple>
                    <el-option v-for="(op, j) in elementInfo.selectedTagList[index].list" :key="op + j"  :value="op">{{op}}</el-option>
                  </el-select>
                </el-col>
              <!--
              <span class="symbol-delete" @click="deleteMetricLabel(item,index)"><i class="nz-icon nz-icon-shanchu1"></i></span>
              -->
                </el-row>
            </el-form-item>
          </el-scrollbar>
        </div>
      </el-col>

    </el-row>
  </el-form>
</template>
<script>
import bus from '../../../libs/bus';

export default {
  name: 'chartTag',
  props: {
    // 序号
    pointer: {
      type: Number,
      default: 0,
    },
    // metric列表
    metricList: {
      type: Array,
      default: () => [],
    },
    metricCascaderList:Array,
    countTotal: {
      type: Number,
      default: 1,
    },
  },
  components: {
    //multipleSelect
  },
  data() {
    return {
      tableShow: 1, // 1.normal; 2.expert
      // 指标信息
      elementInfo: {
        metric: '',//当前选中的metric名称
        type:'normal',
        // name: '',
        tagList: [], // 标签列表
        selectedTagList:[],//已选中的标签列表
        expression:''
      },
      metricLoading: false,
      keydataList: [], // tag标签键列表
      target: null, // 获取到的数据
      tagSet: null, // 根据你metric获取的tags信息
      setDataFlag: false, // true时为获取数据,编辑状态
      vendorCount: '',
    };
  },
  watch: {},
  beforeDestroy() {},
  methods: {
    // (最后整体保存添加的图标的时候执行)保存, chartdata点击确认后保存本身数据并返回给chartdata
    saveTarget() {
      this.$refs.elementInfo.validate((valid) => {
        if (valid) {
          if(this.elementInfo.expression){
            this.elementInfo.expression = this.elementInfo.expression.replace(/\s+|&nbsp;/ig,'');
          }
          this.$emit('on-add-target-success', this.elementInfo);
        }
      });
    },
    // 删除该选项,第一步,传递要删除的参数
    deleteTarget() {
      //alert('metric第一步，删除的指针，之后回调box的第一个步'+this.pointer);
      this.$emit('on-delete-target', this.pointer);
    },
    // 第二步,on-delete-target回调，保存数据
    subSave() {
      //alert('metric第二步，bus.chartAddInfo.metricTarget,指针'+JSON.stringify(bus.chartAddInfo.metricTarget)+'==pointer'+this.pointer);
      bus.chartAddInfo.metricTarget[this.pointer] = this.elementInfo;
      //alert('metric第二步，保存信息到bus'+JSON.stringify(this.elementInfo))
      this.$emit('sub-save-ok');
    },
    // 第三步,将数据重新赋值,sub-save-ok回调
    setSubdata(index) {
      //alert('metric第三步，bus='+JSON.stringify(bus.chartAddInfo.metricTarget));
      //alert('metric第三步，bus('+this.pointer+')='+JSON.stringify(bus.chartAddInfo.metricTarget[this.pointer]));
      this.elementInfo = bus.chartAddInfo.metricTarget[this.pointer];
      //alert('metric第三步，index'+index+',如果index是当前pointer('+this.pointer+')，则继续，把bus中的值赋值给当前metric')
      //alert('metric第三步，elementInfo='+JSON.stringify(this.elementInfo));
      if(this.elementInfo.type==='expert'){
        //alert('metric第三步，expert');
        // 当该项expression为空时，重置一下
        if (!this.elementInfo.expression && this.$refs.metricExpression) {
          this.$refs.metricExpression.reset();
        }
        this.clickTabelShow(2,'expert');
      }else {
       // alert('metric第三步，normal');
        // 当该项metric为空时，重置一下
        if (!this.elementInfo.metric && this.$refs.metricSelect) {
          //this.$refs.metricSelect.reset();
        }
        this.clickTabelShow(1,'normal');
      }
    },

    setLabelDivHeight(count){
      if(count===0){
        const chartBox = document.getElementById('scrollDiv');
        chartBox.style.height = `${10}px`;
      }else if(count<6){//小于6个需要调整容器的高度
        const chartBox = document.getElementById('scrollDiv');
        chartBox.style.height = `${(280 / 6) * count+10}px`;
      }else {
        const chartBox = document.getElementById('scrollDiv');
        chartBox.style.height = `${280}px`;
      }
    },

    // 选择metric
    selectMetric() {
      if (this.elementInfo.metric) {//选择了metric，则设置tagList，否则设置为空
        this.elementInfo.metric = this.elementInfo.metric[1];
        this.getSuggestTags(this.elementInfo.metric);
      } else {
        this.elementInfo.selectedTagList = [];
        this.setLabelDivHeight(0);
      }
      this.$emit('on-change-condition');
    },
    // 获取tags列表
    getSuggestTags(metric) {
      //this.$get('metric/labelName?metric='+metric).then(response => {
      this.$get('/metric/series?match[]='+metric).then(response => {
        this.elementInfo.selectedTagList = [];
        //this.elementInfo.tagList = [];
        if (response.code === 200) {
          const objList = Object.entries(response.data);
          objList.forEach((item) => {
            const tagObj = {
              name: item[0],
              list:item[1],
              value:[]//最终选择的值
            };
            this.elementInfo.selectedTagList.push(tagObj);
          });
          let tagNum = this.elementInfo.selectedTagList.length;
          this.setLabelDivHeight(tagNum);
        }else {
          this.elementInfo.selectedTagList = [];
          this.setLabelDivHeight(0);
        }
      });
    },
    getStyles(width) {
      return `width: ${width}px;`;
    },
    filterMethod(value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
    },

    changeTag(){
      this.$emit('on-change-condition');
    },
    changeExpression(v){
      this.$emit('on-change-condition');
    },
    // 编辑已有图表状态时，先填充数据
    setMdata(data) {
      //alert('metricSetData'+JSON.stringify(data));
      this.setDataFlag = true;
      this.target = Object.assign({}, data);
      //this.pointer =
      if(this.target.type==='expert'){
        this.tableShow = 2;
        this.elementInfo.type = this.target.type;
        this.elementInfo.expression = this.target.expression;
      }else {
        this.tableShow = 1;
        this.elementInfo.type = this.target.type;
        //解析expression，=>标签列表，值列表（index对应），设置selectedTagList及tagList里的isSelect为true
        var expression = this.target.expression;
        //alert('expression=='+expression);
        if(expression.indexOf('{')>-1){
          this.elementInfo.metric = expression.substring(0,expression.indexOf('{'));
        }else {
          this.elementInfo.metric = expression;
        }

        //alert(this.elementInfo.metric);
        //this.selectMetric(); // 获取tag
        this.$get('metric/labelName?metric='+this.elementInfo.metric).then(response => {
          this.elementInfo.selectedTagList = [];
          this.elementInfo.tagList = [];
          if (response.code === 200) {
              //this.elementInfo.tagList = response.data.list;
              if(response.data.list){
                response.data.list.forEach((item) => {
                  const tagObj = {
                    name: item.name,
                    isSelect:false//当前元素是否被选中，默认都未选中
                  };
                  this.elementInfo.tagList.push(tagObj);
                });
              }else {
                response.data.forEach((item) => {
                  const tagObj = {
                    name: item.name,
                    isSelect:false//当前元素是否被选中，默认都未选中
                  };
                  this.elementInfo.tagList.push(tagObj);
                });
              }
            if(expression.indexOf('{')>-1){
              let labValArrStr = expression.substring(expression.indexOf('{')+1,expression.indexOf('}'));
              this.stringToTags(labValArrStr);
            }
          }else {
            this.elementInfo.tagList = [];
          }
        });
      }
    },
    //字符串格式化为对象metric{a='1',b=~'2|3|4'}===>a='1',b=~'2|3|4'
    stringToTags(str) {
      let labArr = str.split(',');
      labArr.forEach((item, index) => {//b=~'1|2|3'
        let labName = item.substring(0,item.indexOf('='));
        this.elementInfo.tagList.every((tagItem,index) => {
          if(tagItem.name===labName){
            tagItem.isSelect = true;
            return false;
          }else {
            return true;
          }
        });

        //查询metricLabel名称对应的LabelValue
        this.$get('metric/labelVal?metric='+this.elementInfo.metric+"&name="+labName).then(response => {
          const tagObj = {
            name:labName,//选中的metricLabel名称
            list:[],//metricLabel名称对应的LabelValue
            value:[]//最终选择的值
          };
          let labVal = item.substring(item.indexOf('=')+1,item.length);
          if(labVal.indexOf('~')!=-1){
            labVal = labVal.substring(2,labVal.length-1);
            let valArr = labVal.split('|');
            valArr.forEach((labItem, labIndex) => {
              tagObj.value.push(labItem);
            });
          }else {
            labVal = labVal.substring(1,labVal.length-1);
            tagObj.value.push(labVal);
          }
          if (response.code === 200) {
            if(response.data.list){
              response.data.list.forEach((resItem) => {
                tagObj.list.push(resItem.value)
              });
              this.elementInfo.selectedTagList.push(tagObj);
            }else{
              response.data.forEach((resItem) => {
                tagObj.list.push(resItem.value)
              });
              this.elementInfo.selectedTagList.push(tagObj);
            }
          }else {
            this.elementInfo.selectedTagList.push(tagObj);
          }
        });
      });
    },

    clearHistory() {
      this.elementInfo.metric = '';
      this.setDataFlag = false;
      if (this.$refs.elementInfo) {
        this.$refs.elementInfo.resetFields();//???
      }
      if (this.$refs.metricSelect) {
        //this.$refs.metricSelect.reset();
      }
      this.elementInfo.tagList = [];
    },
    // 获取文本宽度
    getWidth(str) {
      const sensor = document.createElement('pre');
      sensor.innerHTML = str;
      sensor.style.display = 'inline-block';
      sensor.style.width = 'auto';
      sensor.style.visibility = 'hidden';
      sensor.style.height = 0;
      sensor.style.position = 'relative';
      sensor.style['z-index'] = -10;
      document.body.appendChild(sensor);
      const width = sensor.offsetWidth;
      document.body.removeChild(sensor);
      const widthL = width > 180 ? width : 180;
      return widthL;
    },
    // 将tag添加到相应框内
    proTags(data) {
      const dou = data.indexOf(',');
      // 只有一组tag
      if (dou === -1) {
        const set = data.split('=');
        const tagValueArr = set[1].indexOf('|') > -1 ? set[1].split('|') : [set[1]];
        const tagIndex = this.elementInfo.tagList.findIndex(t => t.name === set[0]);
        if (tagIndex > -1) {
          this.elementInfo.tagList[tagIndex].value = tagValueArr;
        }
      } else { // 多组tag
        const mid = data.split(','); // ['key=v1','key=v2|v3',....]
        mid.forEach((item) => {
          const setInner = item.split('=');
          const innerValueArr = setInner[1].indexOf('|') > -1 ?
          setInner[1].split('|') : [setInner[1]];
          const tagIndex = this.elementInfo.tagList.findIndex(t => t.name === setInner[0]);
          if (tagIndex > -1) {
            this.elementInfo.tagList[tagIndex].value = innerValueArr;
          }
        });
      }
    },
    //metricLabelName单击事件
    getLidata(index, item) {
      if(!item.isSelect){
        this.vendorCount = index;
        //查询metricLabel名称对应的LabelValue
        this.$get('metric/labelVal?metric='+this.elementInfo.metric+"&name="+item.name).then(response => {
          const tagObj = {
            name: item.name,//选中的metricLabel名称
            list:[],//metricLabel名称对应的LabelValue
            value:[]//最终选择的值
          };
          //this.elementInfo.selectedTagList = [];
          if (response.code === 200) {
            if(response.data.list){
              response.data.list.forEach((item) => {
                tagObj.list.push(item.value)
              });
              this.elementInfo.selectedTagList.push(tagObj);
            }else{
              response.data.forEach((item) => {
                tagObj.list.push(item.value)
              });
              this.elementInfo.selectedTagList.push(tagObj);
            }
          }else {
            this.elementInfo.selectedTagList.push(tagObj);
          }
        });
        item.isSelect = true;
      }
      this.$emit('on-change-condition');
    },
    //删除MetricLabel时，需要将tagList中的isSelect设置为false，并删除elementInfo.selectedTagList里对应的元素
    deleteMetricLabel(item,index) {
      this.elementInfo.tagList.forEach((tagItem) => {
        if(tagItem.name===item.name){
          tagItem.isSelect = false;
        }
      });
      this.elementInfo.selectedTagList.splice(index,1);
      //this.$emit('on-delete-target', this.pointer);
      this.$emit('on-change-condition');
    },
    clickTabelShow(val,type){
      this.tableShow = val;
      this.elementInfo.type = type;
      if(val===2){
        this.elementInfo.metric='';
      }
      if(val===1){
        this.elementInfo.expression='';
      }
      this.$emit('on-change-condition');
    }
  },
  computed: {
    metricShowList() {
      const obj = {
        arr: [...this.metricList],
        text: '',
      };
      return obj;
    },
  },
  mounted() {
    bus.$on('clear_history', () => {
      this.clearHistory();
    });
  },
};

</script>
