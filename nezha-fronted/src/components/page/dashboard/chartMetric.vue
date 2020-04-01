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
  .symbol-area {
    position: relative;
    height: 100px;
  }
  .symbol-equal {
    position: absolute;
    bottom: 0;
    left: 13px;
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
  .li-list-part {
     height: 170px;
     border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px 12px;
    color: #666;
   }
  .li-list-part-label-val-list {
    height: 248px;
   /* border: 1px solid #dcdfe6;*/
    border-radius: 4px;
    padding: 0px 0 10px 15px;
    margin-bottom:0px !important;
    width:100%;
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
    margin-bottom:8px;
  }

  .metric-title-position{
    margin-bottom: 8px;
  }
  .metric-title-row-position{
    margin-top:-10px;
  }
  .star-red{
    color:#f56c6c;
  }
  .full-width{
    width:100%;
  }
  .mt1{
    margin-top:1px;
  }
  .chart-metric-box-dropdown{
    width: 619px;
    z-index: 2950 !important;
  }
</style>
<style>
  .li-list-part-label-val-list .metric-title-position .el-form-item__label {
    font-size: 14px;
    height: 10px;
    color: #666;
    line-height: 14px;
    text-align: left;
    width: 100px;
  }
  .li-list-part-label-val-list .el-select--mini {
    width: calc(100% - 15px) ;
  }

  .nz-tab-chart-item-box{
    padding:0;
    display: inline-block;
  }
  .nz-tab-chart-style-left{
    margin-left:40px;
  }
  .dashboard-metric-dropdown .el-scrollbar__wrap{
    margin-bottom: 0px !important;
  }
</style>
<template>
  <el-form :model="elementInfo" ref="elementInfo"   >
    <el-row >
      <el-col :span="16">
        <span class="label-center">{{$t('dashboard.panel.chartForm.metric')}}</span>
      </el-col>

      <el-col :span="8">
        <div class="nz-tab-chart-item-box">
          <div @click="clickTabelShow(1,'normal')" class="nz-tab-style nz-tab-chart-style-left" :class="{'nz-tab-style-light' : tableShow == 1}">
            <span>{{$t('dashboard.metric.normal')}}</span>
          </div>
          <div @click="clickTabelShow(2,'expert')" class="nz-tab-style nz-tab-style-light-right "  :class="{'nz-tab-style-light' : tableShow == 2}">
            <span>{{$t('dashboard.metric.expert')}}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <template  v-if="tableShow == 2">
      <el-form-item class="right-box-form-content" prop="expression" :rules="{ required: true,  message:$t('validate.required'), trigger: 'blur' }"><!--expression和metric的验证只能有一个，不能同时存在？？:rules="{ required: true, type: 'string', message: '', trigger: 'change' }"-->
        <el-input size="mini"  :class="{'right-box-row-with-btn': countTotal > 1, 'full-width': countTotal <= 1}" ref="metricExpression" type="textarea" rows="7" maxlength="1024" show-word-limit v-model="elementInfo.expression" :placeholder="this.$t('dashboard.metric.expertTip')" ></el-input>
        <div @click="deleteTarget" class="right-box-row-btn" v-if="countTotal > 1" style="vertical-align: top">
          <i class="el-icon-minus"></i>
        </div>
      </el-form-item>
    </template>
    <template v-if="tableShow == 1">
      <el-form-item class="right-box-form-content" label-width="80"  prop="metric" :rules="{ required: true,  message: $t('validate.required'), trigger: 'blur' }"><!--:rules="{ required: true, type: 'string', message: '', trigger: 'change' }"-->
        <el-cascader ref="metricSelect"  :class="{'right-box-row-with-btn': countTotal > 1, 'full-width': countTotal <= 1}" filterable placeholder="" popper-class="chart-box-dropdown dashboard-metric-dropdown" size="small"
                     :id="'cascader'+this.pointer"
                     v-model="elementInfo.metric"
                     :options="metricCascaderList"
                     :props="{ expandTrigger: 'click' }"
                     :show-all-levels="false"
                     @change="selectMetric"
                     @expand-change="handleItemChange"
        >
        </el-cascader>
        <span v-if="metricShowList.text" class="error-info-text">{{metricShowList.text}}</span>
        <div @click="deleteTarget" class="right-box-row-btn" v-if="countTotal > 1">
          <i class="el-icon-minus"></i>
        </div>
      </el-form-item>
    </template>

<!-- create chart组件显示框 -->
    <el-row v-if="elementInfo.metric && tableShow == 1"><!--v-if="elementInfo.tagList.length > 0"-->
<!--
      <el-col :span="8">
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

      <el-col :span="2" class="symbol-area"><span class="symbol-equal">=</span></el-col>
-->
      <el-col :span="24">
        <div class="li-list-part-label-val-list" :id="'scrollDiv'+this.pointer">
          <el-scrollbar ref="scrollbar" style="height: 100%">
            <el-form-item style="width:99%;" class="metric-title-position right-box-form-content" v-for="(item, index) in elementInfo.selectedTagList" :key="index"  :ref="'tagItem' + index" :prop="'tagList.' + index + '.value'" >
              <el-row :gutter="10" >
                <el-col :span="4" >
                  <div style="text-align:right;padding-right:5px;">{{item.name}}</div>
                </el-col>
                <el-col :span="20" >
                  <el-select  v-model="item.value" ref="tagSelect" size="mini"
                              placeholder=""
                              collapse-tags
                              popper-class="metric-dropdown"
                              filterable
                              multiple>
                    <el-option v-for="(op, j) in elementInfo.selectedTagList[index].list" :key="op + j"  :value="op">{{op}}</el-option>
                  </el-select>
                </el-col>
                <!--
                <span class="symbol-delete" @click="deleteMetricLabel(item,index)"><i class="nz-icon nz-icon-minus-square"></i></span>
                -->
              </el-row>
            </el-form-item>
          </el-scrollbar>
        </div>
      </el-col>

    </el-row>
    <el-form-item prop="legend" >
      <el-row :gutter="4">
        <el-col :span="4">
          {{$t('dashboard.panel.chartForm.legend')}}&nbsp;
          <el-popover :content="$t('dashboard.panel.chartForm.legendTip')" placement="top" width="150" trigger="hover">
            <i slot="reference" class="nz-icon nz-icon-info-normal" style="font-size: 12px; -webkit-transform:scale(0.75);display:inline-block;" @mouseover="resetZIndex"></i>
          </el-popover>
        </el-col>
        <el-col :span="20"><el-input v-model="elementInfo.legend" type="text" size="small"></el-input></el-col>
      </el-row>
<!--      <el-input v-model="elementInfo.legend" type="text" size="small"></el-input>-->
    </el-form-item>
  </el-form>
</template>
<script>
import bus from '../../../libs/bus';
import {resetZIndex} from "../../common/js/common";
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
        expression:'',
        legend:''
      },
      metricLabelValInfo:new Map,//用于存放所有的metric，label，val
      metricLoading: false,
      keydataList: [], // tag标签键列表
      target: null, // 获取到的数据
      tagSet: null, // 根据你metric获取的tags信息
      setDataFlag: false, // true时为获取数据,编辑状态
      vendorCount: '',
      labelSort:['project','module','endpoint','datacenter','asset'],
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
    saveTarget(pointer,optType) {
      if (this.pointer === pointer) {
        this.$refs.elementInfo.validate((valid) => {
          if (valid) {//根据设置的rules进行验证，验证通过，则返回，继续进行保存（每个el-form-item都需要验证）
            if(this.elementInfo.expression){
              this.elementInfo.expression = this.elementInfo.expression.replace(/\s+|&nbsp;/ig,'');
            }
            this.$emit('on-add-target-success', this.elementInfo, pointer,optType);
          }
        });
      }
    },
    setLabelDivHeight(count){
        if (count === 0) {
          const chartBox = document.getElementById('scrollDiv' + this.pointer);
          chartBox.style.height = `${10}px`;
        } else if (count < 6) {//小于6个需要调整容器的高度
          const chartBox = document.getElementById('scrollDiv' + this.pointer);
          chartBox.style.height = `${(248 / 6) * count + 10}px`;
        } else {
          const chartBox = document.getElementById('scrollDiv' + this.pointer);
          chartBox.style.height = `${248}px`;
        }

    },
    //动态加载第三级选项metric及label
    handleItemChange(val) {
      if(val && val.length===2) {//点击二级菜单，才进行查询
        let proTmp = val[0];
        let module = val[1];
        let project = proTmp.substring(0, proTmp.length - 4);
        this.metricCascaderList.map((item, index) => {
          if(item.value===proTmp){//选择的project
            item.children.map((innerItem, innerIndex) => {
              if (innerItem.value === module && innerItem.children.length === 0) {//不重复加载
                // 当二级分类的的child为空时才请求一次数据
                let match = '{project="'+project+'",module="'+module+'"}';
                this.$get('/prom/api/v1/series?match[]='+match).then(res => {
                  console.log("==="+JSON.stringify(res));
                //this.$get('http://192.168.40.247:9090/api/v1/series?match[]='+match).then(res => {
                  if (res.status === 'success') {
                    let queryItem = res.data;//[]设置  metric和label
                    let metricArr = [];
                    let metricArrTmp = [];
                    res.data.forEach((tag, i) => {
                      let metricName = tag.__name__;
                      if(metricArrTmp.indexOf(metricName)===-1){
                        const childOption = {
                          value: metricName,//+"_par",
                          label: metricName
                        };
                        metricArrTmp.push(metricName);
                        metricArr.push(childOption);
                      }
                      this.$set(item.children[innerIndex], 'children', metricArr);

                      const tagsArr = Object.keys(tag);//["__name__","asset","idc","instance","job","module","project"]
                      let labelValList = [];

                      tagsArr.forEach((tagName) => {
                        if (tagName !== '__name__') {
                          const tagObj = {
                            name: tagName,
                            list:[],
                            value:[]//最终选择的值
                          };
                          let tagValue = tag[tagName];
                          const tagItem = labelValList.find(item => item.name === tagName);
                          if(tagItem){//metric对应的label已添加
                            if(tagItem.list.indexOf(tagValue)===-1){//label对于value是否添加，没有添加，则添加
                              tagItem.list .push(tagValue);
                            }
                          }else {//metric对于的label未添加
                            tagObj.list.push(tagValue);
                            labelValList.push(tagObj);
                          }
                        }
                      });
                      if(this.metricLabelValInfo.has(metricName)){
                        let existMetricLabelList =  this.metricLabelValInfo.get(metricName);
                        labelValList.forEach((labelItem,index)=>{
                          const existTagItem = existMetricLabelList.find(item => item.name === labelItem.name);
                          if(existTagItem){//label已添加
                            labelItem.list.forEach((valueItem,valIndex)=>{
                              if(existTagItem.list.indexOf(valueItem)===-1){//value未添加
                                existTagItem.list.push(valueItem);
                              }
                            })
                          }else {//label未添加
                            existMetricLabelList.push(labelItem);
                          }
                        })
                      }else {
                        this.metricLabelValInfo.set(metricName,labelValList);
                      }
                    });
                  }
                })
              }
            })
          }
        });
      }
    },
    // 选择metric
    selectMetric() {
      if (this.elementInfo.metric) {//选择了metric，则设置tagList，否则设置为空
        this.getSuggestTags(this.elementInfo.metric);
        this.elementInfo.metric = this.elementInfo.metric[2];

      } else {
        this.elementInfo.tagList = [];
        this.setLabelDivHeight(0);
      }
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.scrollbar.update();
        }, 100);
      });

    },
    // 获取tags列表
    getSuggestTags(metricArr) {
      let metric = metricArr[2];
      let proTmp = metricArr[0];
      let project = proTmp.substring(0, proTmp.length - 4);
      let module = metricArr[1];
      this.elementInfo.selectedTagList = [];
      if(this.metricLabelValInfo.has(metric)){
        let tagListTmp = [];
        tagListTmp = [...this.metricLabelValInfo.get(metric)];//[...this.metricList],
        //console.log(metric+'!!!!!!!!!!!!!!!!!!!'+JSON.stringify(tagListTmp));
        tagListTmp.forEach((item) => {
          if(item.name==='project'){
            item.value.push(project);
          }else if(item.name==='module'){
            item.value.push(module);
          }
        });

        this.labelSort.forEach((sortItem) => {
          let itemIndex = -1;
          tagListTmp.forEach((item,i) => {
            if(sortItem===item.name){//labelSort:['project','module','endpoint','datacenter','asset'],
              this.elementInfo.selectedTagList.push(item);
              itemIndex = i;
            }
          });
          if(itemIndex!==-1){
            tagListTmp.splice(itemIndex,1);
          }
        });
        tagListTmp.forEach((item,i) => {
          this.elementInfo.selectedTagList.push(item);
        });

        let tagNum = this.elementInfo.selectedTagList.length;
        this.$nextTick(() => {
          this.setLabelDivHeight(tagNum);
        });
      }else{
        this.elementInfo.selectedTagList = [];
        this.setLabelDivHeight(0);
      }
      /*
      this.$get('/metric/series?match[]='+metric).then(response => {
        this.elementInfo.selectedTagList = [];
        let tagListTmp = [];
        if (response.code === 200) {
          const objList = Object.entries(response.data);
          objList.forEach((item) => {
            const tagObj = {
              name: item[0],
              list:item[1],
              value:[]//最终选择的值
            };
            if(item[0]==='project'){
              tagObj.value.push(project);
            }else if(item[0]==='module'){
              tagObj.value.push(module);
            }
            tagListTmp.push(tagObj);
          });
          this.labelSort.forEach((sortItem) => {
            let itemIndex = -1;
            tagListTmp.forEach((item,i) => {
              if(sortItem===item.name){//labelSort:['project','module','endpoint','datacenter','asset'],
                this.elementInfo.selectedTagList.push(item);
                itemIndex = i;
              }
            });
            if(itemIndex!==-1){
              tagListTmp.splice(itemIndex,1);
            }
          });
          tagListTmp.forEach((item,i) => {
            this.elementInfo.selectedTagList.push(item);
          });

          let tagNum = this.elementInfo.selectedTagList.length;
          this.setLabelDivHeight(tagNum);
        }else {
          this.elementInfo.selectedTagList = [];
          this.setLabelDivHeight(0);
        }
      });*/
    },
    getStyles(width) {
      return `width: ${width}px;`;
    },
    filterMethod(value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
    },
    getMetricLabelValue(metric,othersParams){
      let match = '{__name__="'+metric+'"}';
      this.$get('/prom/api/v1/series?match[]='+match).then(res => {
        console.log("==="+JSON.stringify(res));
        //this.$get('http://192.168.40.247:9090/api/v1/series?match[]='+match).then(res => {
        if (res.status === 'success') {
          let queryItem = res.data;//[]设置  metric和label
          let metricArr = [];
          let metricArrTmp = [];
          res.data.forEach((tag, i) => {
            let metricName = tag.__name__;
            if(metricArrTmp.indexOf(metricName)===-1){
              const childOption = {
                value: metricName,//+"_par",
                label: metricName
              };
              metricArrTmp.push(metricName);
              metricArr.push(childOption);
            }
            const tagsArr = Object.keys(tag);//["__name__","asset","idc","instance","job","module","project"]
            let labelValList = [];

            tagsArr.forEach((tagName) => {
              if (tagName !== '__name__') {
                const tagObj = {
                  name: tagName,
                  list:[],
                  value:[]//最终选择的值
                };
                let tagValue = tag[tagName];
                const tagItem = labelValList.find(item => item.name === tagName);
                if(tagItem){//metric对应的label已添加
                  if(tagItem.list.indexOf(tagValue)===-1){//label对于value是否添加，没有添加，则添加
                    tagItem.list .push(tagValue);
                  }
                }else {//metric对于的label未添加
                  tagObj.list.push(tagValue);
                  labelValList.push(tagObj);
                }
              }
            });
            if(this.metricLabelValInfo.has(metricName)){
              let existMetricLabelList =  this.metricLabelValInfo.get(metricName);
              labelValList.forEach((labelItem,index)=>{
                const existTagItem = existMetricLabelList.find(item => item.name === labelItem.name);
                if(existTagItem){//label已添加
                  labelItem.list.forEach((valueItem,valIndex)=>{
                    if(existTagItem.list.indexOf(valueItem)===-1){//value未添加
                      existTagItem.list.push(valueItem);
                    }
                  })
                }else {//label未添加
                  existMetricLabelList.push(labelItem);
                }
              })
            }else {
              this.metricLabelValInfo.set(metricName,labelValList);
            }
          });

          this.elementInfo.selectedTagList = [];
          if(this.metricLabelValInfo.has(metric)){
            let tagListTmp = [];
            tagListTmp = [...this.metricLabelValInfo.get(metric)];//[...this.metricList],
            //设置选择的值
            let labArr = othersParams.split(',');
            tagListTmp.forEach((tagItem) => {
              let labelName = tagItem.name;
              labArr.forEach((item, index) => {//b=~'1|2|3'
                let labNameTmp = item.substring(0,item.indexOf('='));//project   module   dc
                if(labNameTmp===labelName){
                  let labVal = item.substring(item.indexOf('=')+1,item.length);
                  if(labVal.indexOf('~')!=-1){
                    labVal = labVal.substring(2,labVal.length-1);
                    let valArr = labVal.split('|');
                    valArr.forEach((labItem, labIndex) => {
                      tagItem.value.push(labItem);
                    });
                  }else {
                    labVal = labVal.substring(1,labVal.length-1);
                    tagItem.value.push(labVal);
                  }
                }
              });
            });
            //排序label顺序
            this.sortLabel(tagListTmp,this.elementInfo.selectedTagList);

            let tagNum = this.elementInfo.selectedTagList.length;
            this.$nextTick(() => {
              this.setLabelDivHeight(tagNum);
            });
          }else{
            this.$nextTick(() => {
              this.elementInfo.selectedTagList = [];
              this.setLabelDivHeight(0);
            });
          }

        }
      })
    },
    sortLabel(tagListTmp,rltList){
      this.labelSort.forEach((sortItem) => {
        let itemIndex = -1;
        tagListTmp.forEach((item,i) => {
          if(sortItem===item.name){//labelSort:['project','module','endpoint','datacenter','asset'],
            //this.elementInfo.selectedTagList.push(item);
            rltList.push(item);
            itemIndex = i;
          }
        });
        if(itemIndex!==-1){
          tagListTmp.splice(itemIndex,1);
        }
      });
      tagListTmp.forEach((item,i) => {
        //this.elementInfo.selectedTagList.push(item);
        rltList.push(item);
      });
    },

    // 编辑已有图表状态时，先填充数据
    setMdata(data) {
      this.setDataFlag = true;
      this.target = Object.assign({}, data);
      //this.pointer =
      if(this.target.type==='expert'){
        this.tableShow = 2;
        this.elementInfo.type = this.target.type;
        this.elementInfo.expression = this.target.expression;
        this.elementInfo.legend=this.target.legend;
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
        // 当该项metric为空时，重置一下
        if (this.$refs.metricSelect) {
          let cascaderDiv = document.querySelector('#cascader'+this.pointer);
          if(cascaderDiv){
            let cascaderInput = cascaderDiv.firstElementChild;
            if(cascaderInput && cascaderInput.firstElementChild){
              cascaderInput.firstElementChild.value = this.elementInfo.metric;
            }
          }
        }

        this.elementInfo.legend=this.target.legend;
        let labelValList = expression.substring(expression.indexOf('{')+1,expression.indexOf('}'));
        this.getMetricLabelValue(this.elementInfo.metric,labelValList);//获得metric及对应label级value
        /*
        this.$get('/metric/series?match[]='+this.elementInfo.metric).then(response => {
          this.elementInfo.selectedTagList = [];
          if (response.code === 200) {
              const objList = Object.entries(response.data);
              objList.forEach((item) => {
                const tagObj = {
                  name: item[0],
                  list:item[1],
                  value:[]//最终选择的值
                };
                let labelName = item[0];
                let labelValList = expression.substring(expression.indexOf('{')+1,expression.indexOf('}'));
                let labArr = labelValList.split(',');
                labArr.forEach((item, index) => {//b=~'1|2|3'
                    let labNameTmp = item.substring(0,item.indexOf('='));
                    if(labNameTmp===labelName){
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
                    }
                });

                this.elementInfo.selectedTagList.push(tagObj);
              });
              let tagNum = this.elementInfo.selectedTagList.length;
              this.setLabelDivHeight(tagNum);
          }else {
            this.elementInfo.selectedTagList = [];
            this.setLabelDivHeight(0);
          }
        });*/
      }
      setTimeout(() => {
        this.$refs.scrollbar.update();
      }, 1000);
    },

    /*
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
   */

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
    },
    resetZIndex,
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
