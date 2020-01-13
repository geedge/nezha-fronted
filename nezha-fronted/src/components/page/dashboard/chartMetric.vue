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
  .li-list-part {
     width: 90%;
     height: 130px;
     border: 1px solid #cfcfcf;
     overflow-y: auto;
   }
    .li-list-part-label-val-list {
      width: 100%;
      height: 165px;
      border: 1px solid #cfcfcf;
      overflow-y: auto;
      margin-top: -10px;/*21*/
      border: 0px;
    }
  .no-list-style{
   list-style: none;
  }
  .li-cursor{
    cursor: pointer;
  }
  .activeColor {
    background-color: #409EFF;
  }
  .metric-title-label{
    margin-bottom:8px;
  }
  .metric-title-position{
    margin-bottom:-5px;
  }
  .metric-title-row-position{
    margin-top:-10px;
  }
  .star-red{
    color:#ff1818;
  }
</style>
<template>
  <el-form :model="elementInfo" ref="elementInfo"   >
    <el-row>
      <el-col span="16">
        <span  class="star-red">*</span>&nbsp;{{$t('dashboard.panel.chartForm.metric')}}
      </el-col>
      <el-col span="8">
        <div class="nz-btn-group float-left"  v-show="tableShow == 2">
          <button @click="clickTabelShow(1,'normal')" class="nz-btn nz-btn-size-small nz-btn-style-light float-left">
            <span>{{$t('dashboard.metric.normal')}}</span>
          </button>
          <button @click="" class="nz-btn nz-btn-size-small nz-btn-disabled nz-btn-style-normal float-left">
            <span>{{$t('dashboard.metric.expert')}}</span>
          </button>
        </div>
        <div class="nz-btn-group float-left"  v-show="tableShow == 1">
          <button @click="" class="nz-btn nz-btn-size-small nz-btn-disabled nz-btn-style-normal float-left">
            <span>{{$t('dashboard.metric.normal')}}</span>
          </button>
          <button @click="clickTabelShow(2,'expert')" class="nz-btn nz-btn-size-small nz-btn-style-light float-left">
            <span>{{$t('dashboard.metric.expert')}}</span>
          </button>
        </div>
      </el-col>
    </el-row>
    <el-row  v-if="tableShow == 2">
      <el-col span="22">
        <el-form-item prop="expression" :rules="{ required: true,  message:$t('validate.required'), trigger: 'blur' }"><!--expression和metric的验证只能有一个，不能同时存在？？:rules="{ required: true, type: 'string', message: '', trigger: 'change' }"-->
          <el-input size="mini" ref="metricExpression" type="textarea" maxlength="1024" show-word-limit v-model="elementInfo.expression" :placeholder="this.$t('dashboard.metric.expertTip')" ></el-input>
        </el-form-item>
      </el-col>
      <el-col  span="2">
        &nbsp;&nbsp;<button type="button" v-if="countTotal > 1" @click="deleteTarget"  class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square nz-btn-style-higher"><span class="top-tool-btn-txt"><i class="el-icon-close"></i></span></button>
      </el-col>
    </el-row>
    <el-row  v-if="tableShow == 1">
      <el-col span="22">
        <el-form-item :label-width="80"  prop="metric" :rules="{ required: true,  message: $t('validate.required'), trigger: 'blur' }"><!--:rules="{ required: true, type: 'string', message: '', trigger: 'change' }"-->
              <el-select ref="metricSelect"  filterable placeholder="" popper-class="" size="small" v-model="elementInfo.metric"  @change="selectMetric">
                <el-option v-for="(item, index) in metricShowList.arr" :key="item.metric + index"
                :value="item.metric">{{item.metric}}</el-option>
              </el-select>
              <span v-if="metricShowList.text" class="error-info-text">{{metricShowList.text}}</span>
        </el-form-item>
      </el-col>
      <el-col  span="2">
        &nbsp;&nbsp;<button type="button" v-if="countTotal > 1" @click="deleteTarget"  class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square nz-btn-style-higher"><span class="top-tool-btn-txt"><i class="el-icon-close"></i></span></button>
      </el-col>
    </el-row>

    <el-row v-if="elementInfo.metric && tableShow == 1"><!--v-if="elementInfo.tagList.length > 0"-->
      <el-col span="12">
        <div class="metric-title-label">{{elementInfo.metric}}</div>
        <div class="li-list-part">
          <ul class="no-list-style">
            <li class="li-cursor" v-if="!item.isSelect"
                v-for="(item,index) in elementInfo.tagList"
                @click="getLidata(index,item)"
                :key="index">
              <div>
                <span >{{ item.name }}</span>
              </div>
            </li>
          </ul>
        </div>
      </el-col>
      <el-col span="12">
        <div class="li-list-part-label-val-list" >
          <el-form-item class="metric-title-position"   v-for="(item, index) in elementInfo.selectedTagList" :key="index" :label="item.name" :label-width="100" :ref="'tagItem' + index" :prop="'tagList.' + index + '.value'" >
            <el-row class="metric-title-row-position" >
            <!--多选列表 -->
              <el-col span="20" >
                <el-select  v-model="item.value" ref="tagSelect" size="small"
                            placeholder=""
                            collapse-tags
                            filterable
                            multiple>
                  <el-option v-for="(op, j) in elementInfo.selectedTagList[index].list" :key="op + j"  :value="op">{{op}}</el-option>
                </el-select>
              </el-col>
              <el-col span="4" >
                &nbsp;&nbsp;<button type="button"  @click="deleteMetricLabel(item,index)"  class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square nz-btn-style-higher"><span class="top-tool-btn-txt"><i class="el-icon-close"></i></span></button>
              </el-col>
            </el-row>
          </el-form-item>
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
          this.$refs.metricSelect.reset();
        }
        this.clickTabelShow(1,'normal');
      }
    },


    // (最后整体保存添加的图标的时候执行)保存, chartdata点击确认后保存本身数据并返回给chartdata
    saveTarget(pointer) {
      if (this.pointer === pointer) {
        this.$refs.elementInfo.validate((valid) => {
          if (valid) {//根据设置的rules进行验证，验证通过，则返回，继续进行保存（每个el-form-item都需要验证）
            this.$emit('on-add-target-success', this.elementInfo, pointer);
          }
        });
      }
    },


    // 选择metric
    selectMetric() {
      if (this.elementInfo.metric) {//选择了metric，则设置tagList，否则设置为空
        this.getSuggestTags(this.elementInfo.metric);
      } else {
        this.elementInfo.tagList = [];
      }
    },
    // 选择主机
    /*
    selectHost(arr, index) {
      this.elementInfo.tagList[index].value = arr;
      if (this.$refs.elementInfo && this.$refs[`tagItem${index}`]) {
        this.$refs.elementInfo.validateField(`tagList.${index}.value`);
      }
    },
    */
    /*
    selectTag(index) {//多选列表改变时的操作：为了* 的操作，此处不需要
      const arr = this.elementInfo.tagList[index].value;
      if (arr.length > 0 && arr.indexOf('*') > -1) {
        this.elementInfo.tagList[index].value = ['*'];
      }
    },
    */
    // 获取tags列表
    getSuggestTags(metric) {
      this.$get('metric/labelName?metric='+metric).then(response => {
        this.elementInfo.selectedTagList = [];
        this.elementInfo.tagList = [];
        if (response.code === 200) {
          if(response.data.list){
            //this.elementInfo.tagList = response.data.list;
            response.data.list.forEach((item) => {
              const tagObj = {
                name: item.name,
                isSelect:false//当前元素是否被选中，默认都未选中
              };
              this.elementInfo.tagList.push(tagObj);
            });
          }else{
            response.data.forEach((item) => {
              const tagObj = {
                name: item.name,
                isSelect:false //当前元素是否被选中，默认都未选中
              };
              this.elementInfo.tagList.push(tagObj);
            });
          }
          //this.elementInfo.tagList = response.data.list;
        }else {
          this.elementInfo.tagList = [];
        }
      });
    },
    getStyles(width) {
      return `width: ${width}px;`;
    },
    filterMethod(value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
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
        this.$refs.metricSelect.reset();
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
