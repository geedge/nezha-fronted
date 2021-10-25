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
    padding: 0px 0 10px 0px;
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

  .mb22{
     margin-bottom:22px;
   }

  .metric-title-position{
    margin-bottom: 0px;
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

  .metric-box-dropdown{
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
    margin-left: 0;
  }
  .dashboard-metric-dropdown .el-scrollbar__wrap{
    margin-bottom: 0px !important;
  }
  .dashboard-metric-dropdown>.el-cascader-panel{
    height:200px !important;
  }
  .metric-dropdown>.el-cascader-panel{
    height:200px !important;
  }
  .dashboard-metric-dropdown .el-cascader-menu:nth-child(1){
    min-width:80px !important;
  }
  .dashboard-metric-dropdown .el-cascader-menu:nth-child(2){
    min-width:80px !important;
  }
  .dashboard-metric-dropdown .el-cascader-menu:nth-child(3){
    min-width:360px !important;
  }

  .label-cascader .el-cascader__tags{
    max-height:50px;
    overflow-y:auto;
    right:5px !important;

  }

  .label-cascader .el-input--suffix {/*
    max-height:50px;
    overflow-y:auto; */
  }

  .label-cascader .el-input__suffix{
    display:none !important;
  }

  .label-cascader .el-cascader__tags span:nth-child(-n+2)>i{
    display:none !important;
  }
</style>
<template>
  <el-form :model="elementInfo" ref="elementInfo"   >
    <el-row >
      <el-col :span="16">
        <span class="label-center">{{$t('dashboard.panel.chartForm.metric')}}</span>
      </el-col>

      <el-col :span="8" style="text-align: right;">
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
        <el-input size="mini"  @input="changeExpression" :class="{'right-box-row-with-btn': countTotal > 1, 'full-width': countTotal <= 1}" ref="metricExpression" type="textarea" rows="7" maxlength="1024" show-word-limit v-model="elementInfo.expression" :placeholder="this.$t('dashboard.metric.expertTip')" ></el-input>
        <div @click="deleteTarget" class="right-box-row-btn" v-if="countTotal > 1" style="vertical-align: top">
          <i class="nz-icon nz-icon-minus"></i>
        </div>
      </el-form-item>
    </template>
    <template v-if="tableShow == 1">
      <el-form-item class="right-box-form-content" label-width="80"  prop="metric" :rules="{ required: true,  message: $t('validate.required'), trigger: 'blur' }"><!--:rules="{ required: true, type: 'string', message: '', trigger: 'change' }"-->
        <!--@expand-change="handleItemChange"-->
        <el-cascader ref="metricSelect"  :class="{'right-box-row-with-btn': countTotal > 1, 'full-width': countTotal <= 1}" filterable placeholder="" popper-class="chart-box-dropdown dashboard-metric-dropdown" size="small"
                     :id="'cascader'+this.pointer"
                     v-model="elementInfo.metric"
                     :options="metricCascaderList"
                     :props="cascaderProps"
                     :show-all-levels="false"
                     @change="selectMetric"
        >
        </el-cascader>
        <span v-if="metricShowList.text" class="error-info-text">{{metricShowList.text}}</span>
        <div @click="deleteTarget" class="right-box-row-btn" v-if="countTotal > 1">
          <i class="nz-icon nz-icon-minus"></i>
        </div>
      </el-form-item>
    </template>

    <el-row v-if="elementInfo.metric && tableShow == 1" class="mb22" >
      <el-form-item class="metric-title-position right-box-form-content"  :key="this.pointer"  :ref="'tagItem' + this.pointer" :prop="'tagList.' + this.pointer + '.value'" >
        <el-cascader :key="'labelValueCascaderKey'+this.pointer" ref="labelValSelect"
                     class="label-cascader full-width"
                     size="small"
                     placeholder=""
                     popper-class="metric-dropdown "
                     v-model="labelValueCascaderVal"
                     :options="labelValueCascaderOptions"
                     :props="labelValueProps"
                     @change="changeTag"
                     clearable>
        </el-cascader>
      </el-form-item>
    </el-row>
    <!--
    <el-row v-if="elementInfo.metric && tableShow == 1">
      <el-col :span="24">
        <div class="li-list-part-label-val-list" :id="'scrollDiv'+this.pointer">

            <el-form-item style="width:99%;" class="metric-title-position right-box-form-content"  :key="this.pointer"  :ref="'tagItem' + this.pointer" :prop="'tagList.' + this.pointer + '.value'" >

            </el-form-item>
        </div>
      </el-col>
    </el-row>
    -->
    <!--
    <el-row v-if="elementInfo.metric && tableShow == 1">
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
              </el-row>
            </el-form-item>
          </el-scrollbar>
        </div>
      </el-col>
    </el-row>
    -->
    <el-form-item prop="legend" v-show="hasLegend">
      <el-row :gutter="4">
        <el-col :span="4">
          {{$t('dashboard.panel.chartForm.legend')}}&nbsp;
          <el-popover :content="$t('dashboard.panel.chartForm.legendTip')" placement="top" width="150" trigger="click">
            <i slot="reference" class="nz-icon nz-icon-info-normal" style="font-size: 12px; -webkit-transform:scale(0.75);display:inline-block;" @mouseover="resetZIndex"></i>
          </el-popover>
        </el-col>
        <el-col :span="20"><el-input v-model="elementInfo.legend" type="text" size="small"></el-input></el-col>
      </el-row>
    </el-form-item>

    <el-form-item prop="statistics" v-show="isSingleStat">
      <el-row :gutter="4">
        <el-col :span="4">
          {{$t('dashboard.panel.chartForm.statistics')}}&nbsp;
        </el-col>
        <el-col :span="20">
          <el-select class="right-box-row-with-btn" popper-class="chart-box-dropdown-mini" v-model="elementInfo.statistics" placeholder="" size="small">
            <el-option v-for="item in statisticsList" :key="item.id" :label="item.name" :value="item.id">
              <span class="panel-dropdown-label-txt" >{{item.name}}</span>
            </el-option>
          </el-select>
        </el-col>
      </el-row>
    </el-form-item>

  </el-form>
</template>
<script>
import bus from '../../../libs/bus'
import { resetZIndex } from '../../common/js/common'
export default {
  name: 'chartTag',
  props: {
    // 序号
    pointer: {
      type: Number,
      default: 0
    },
    // metric列表
    metricList: {
      type: Array,
      default: () => []
    },
    metricAllData: Map,
    metricCascaderList: Array,
    // metricCascaderListTmp:Array,//3级级联列表：project/module/metric，metric是在本页面动态获得，并设置本页面的metric对应的label级value（metricLabelValInfo列表，所以不可重复使用？？）
    // metricLabelValInfo:Map,//用于存放所有的metric，label，val
    countTotal: {
      type: Number,
      default: 1
    },
    hasLegend: {
      type: Boolean,
      default: true
    },
    isSingleStat: {
      type: Boolean,
      default: false
    }
  },
  components: {
    // multipleSelect
  },
  data () {
    return {
      tableShow: 1, // 1.normal; 2.expert
      // 指标信息
      elementInfo: {
        metric: '', // 当前选中的metric名称
        type: 'normal',
        // name: '',
        tagList: [], // 标签列表
        selectedTagList: [], // 已选中的标签列表
        expression: '',
        legend: '',
        statistics: 'last'
      },
      // isSingleStat:false,
      statisticsList: [
        {
          id: 'min',
          name: this.$t('dashboard.panel.chartForm.statisticsVal.min')
        },
        {
          id: 'max',
          name: this.$t('dashboard.panel.chartForm.statisticsVal.max')
        },
        {
          id: 'average',
          name: this.$t('dashboard.panel.chartForm.statisticsVal.average')
        },
        {
          id: 'total',
          name: this.$t('dashboard.panel.chartForm.statisticsVal.total')
        },
        {
          id: 'first',
          name: this.$t('dashboard.panel.chartForm.statisticsVal.first')
        },
        {
          id: 'last',
          name: this.$t('dashboard.panel.chartForm.statisticsVal.last')
        },
        {
          id: 'range',
          name: this.$t('dashboard.panel.chartForm.statisticsVal.range')
        },
        {
          id: 'different',
          name: this.$t('dashboard.panel.chartForm.statisticsVal.different')
        }
      ],
      labelValueCascaderOptions: [], // label及value改为级联后，显示用的待选label及value
      labelValueCascaderVal: [], // label及value改为级联后，选择的label及value
      // metricCascaderList:[],
      metricLabelValInfo: new Map(), // 用于存放所有的metric，label，val
      metricLoading: false,
      keydataList: [], // tag标签键列表
      target: null, // 获取到的数据
      tagSet: null, // 根据你metric获取的tags信息
      setDataFlag: false, // true时为获取数据,编辑状态
      vendorCount: '',
      labelSort: ['project', 'module', 'endpoint', 'datacenter', 'asset'],
      cascaderProps: {
        expandTrigger: 'click',
        lazy: true,
        that: this,
        lazyLoad (node, resolve) {
          /*
          1 第一次加载界面：node:{"root":true,"level":0,"loading":true}
          2 点击的一级节点，则直接从list中获得，如果点击的为二级节点，先看对应list里是否有，没有再从接口获得
          */
          const nodeLevel = node.level
          const _this = this.that
          if (nodeLevel === 1) {
            setTimeout(() => {
              resolve([])
            }, 100)
          } else if (nodeLevel === 2) {
            setTimeout(() => {
              const project = node.parent.data.label
              const module = node.data.label
              const metricArr = []
              const metricArrTmp = []

              let metricLabelValMap = new Map()
              const projectItem = _this.metricAllData.get(project)
              if (projectItem) {
                const moduleItem = projectItem.find(item => item.name === module)
                if (moduleItem) {
                  metricLabelValMap = moduleItem.metricMap
                }
              }
              if (metricLabelValMap.size > 0) {
                _this.metricLabelValInfo = metricLabelValMap
                metricLabelValMap.forEach((item, index) => {
                  const childOption = {
                    value: index,
                    label: index,
                    leaf: true
                  }
                  metricArr.push(childOption)
                })
                resolve(metricArr)
              } else {
                _this.metricCascaderList.forEach((item, index) => {
                  if (item.label === project) { // 选择的project
                    item.children.forEach((innerItem, innerIndex) => {
                      if (innerItem.value === module) {
                        if (innerItem.children.length === 0) { // 不重复加载
                          // 当二级分类的的child为空时才请求一次数据
                          const match = '{project="' + project + '",module="' + module + '"}'
                          _this.$get('/prom/api/v1/series?match[]=' + match).then(res => {
                            if (res.status === 'success') {
                              res.data.forEach((tag, i) => {
                                const metricName = tag.__name__
                                if (metricArrTmp.indexOf(metricName) === -1) {
                                  const childOption = {
                                    value: metricName, // +"_par",
                                    label: metricName,
                                    leaf: nodeLevel >= 2
                                  }
                                  metricArrTmp.push(metricName)
                                  metricArr.push(childOption)
                                }
                                const tagsArr = Object.keys(tag)// ["__name__","asset","idc","instance","job","module","project"]
                                const labelValList = []

                                tagsArr.forEach((tagName) => {
                                  if (tagName !== '__name__') {
                                    const tagObj = {
                                      name: tagName,
                                      list: [],
                                      value: []// 最终选择的值
                                    }
                                    const tagValue = tag[tagName]
                                    const tagItem = labelValList.find(item => item.name === tagName)
                                    if (tagItem) { // metric对应的label已添加
                                      if (tagItem.list.indexOf(tagValue) === -1) { // label对于value是否添加，没有添加，则添加
                                        tagItem.list.push(tagValue)
                                      }
                                    } else { // metric对于的label未添加
                                      tagObj.list.push(tagValue)
                                      labelValList.push(tagObj)
                                    }
                                  }
                                })
                                if (_this.metricLabelValInfo.has(metricName)) {
                                  const existMetricLabelList = _this.metricLabelValInfo.get(metricName)
                                  labelValList.forEach((labelItem, index) => {
                                    const existTagItem = existMetricLabelList.find(item => item.name === labelItem.name)
                                    if (existTagItem) { // label已添加
                                      labelItem.list.forEach((valueItem, valIndex) => {
                                        if (existTagItem.list.indexOf(valueItem) === -1) { // value未添加
                                          existTagItem.list.push(valueItem)
                                        }
                                      })
                                    } else { // label未添加
                                      existMetricLabelList.push(labelItem)
                                    }
                                  })
                                } else {
                                  _this.metricLabelValInfo.set(metricName, labelValList)
                                }
                                // 全局缓存数据设置
                                _this.cacheData(project, module, metricName, labelValList)
                              })
                              resolve(metricArr)
                            } else {
                              resolve([])
                            }
                          })
                        } else { // 已经加载过了
                          resolve([])
                        }
                      }
                    })
                  }
                })
              }
            }, 1000)
          }
          setTimeout(() => {
            _this.cascaderStyle()
          }, 100)
        }
      },
      labelValueProps: { multiple: true }
    }
  },
  methods: {
    // 删除该选项,第一步,传递要删除的参数
    deleteTarget () {
      // alert('metric第一步，删除的指针，之后回调box的第一个步'+this.pointer);
      this.$emit('on-delete-target', this.pointer)
    },
    // 第二步,on-delete-target回调，保存数据
    subSave () {
      this.convertLabelValueCascadeVal()
      // alert('metric第二步，bus.chartAddInfo.metricTarget,指针'+JSON.stringify(bus.chartAddInfo.metricTarget)+'==pointer'+this.pointer);
      bus.chartAddInfo.metricTarget[this.pointer] = this.elementInfo
      // alert('metric第二步，保存信息到bus'+JSON.stringify(this.elementInfo))
      this.$emit('sub-save-ok')
    },
    // 第三步,将数据重新赋值,sub-save-ok回调
    setSubdata (index) {
      // ('metric第三步，bus='+JSON.stringify(bus.chartAddInfo.metricTarget));
      // console.log('metric第三步，bus('+this.pointer+')='+JSON.stringify(bus.chartAddInfo.metricTarget[this.pointer]));
      this.elementInfo = bus.chartAddInfo.metricTarget[this.pointer]
      // console.log('metric第三步，index'+index+',如果index是当前pointer('+this.pointer+')，则继续，把bus中的值赋值给当前metric')
      // console.log('metric第三步，elementInfo='+JSON.stringify(this.elementInfo));
      if (this.elementInfo.type === 'expert') {
        // alert('metric第三步，expert');
        // 当该项expression为空时，重置一下
        if (!this.elementInfo.expression && this.$refs.metricExpression) {
          this.$refs.metricExpression.reset()
        }
        this.clickTabelShow(2, 'expert')
      } else {
        // alert('metric第三步，normal');
        // 当该项metric为空时，重置一下
        if (!this.elementInfo.metric && this.$refs.metricSelect) {
          this.$refs.metricSelect.reset()
        }
        this.setLabelValueCascader()
        this.clickTabelShow(1, 'normal')
      }
    },
    clearSelectedTagList () {
      this.elementInfo.selectedTagList.forEach((selectItem) => {
        selectItem.value = []// 清空值，再进行赋值
      })
    },
    convertLabelValueCascadeVal () {
      // 把级联选择label及value，转换为selectedTagList里的value
      this.clearSelectedTagList()
      this.labelValueCascaderVal.forEach((item) => { // [label,value]
        const casLabel = item[0]
        const casValue = item[1]
        this.elementInfo.selectedTagList.forEach((selectItem) => {
          const selectLabel = selectItem.name
          const selectValue = selectItem.value
          if (selectLabel === casLabel) {
            if (selectValue.indexOf(casValue) === -1) {
              selectValue.push(casValue)
            }
          }
        })
      })
    },
    setSingleStat () {
      this.hasLegend = false
      this.isSingleStat = true
    },
    setNotSingleStat () {
      this.hasLegend = true
      this.isSingleStat = false
    },
    // (最后整体保存添加的图标的时候执行)保存, chartdata点击确认后保存本身数据并返回给chartdata
    saveTarget (pointer, optType) {
      if (this.pointer === pointer) {
        this.$refs.elementInfo.validate((valid) => {
          if (valid) { // 根据设置的rules进行验证，验证通过，则返回，继续进行保存（每个el-form-item都需要验证）
            if (this.elementInfo.expression) {
              // this.elementInfo.expression = this.elementInfo.expression.replace(/\s+|&nbsp;/ig,'');
              // 只取消两端空格，中间空格保留
              this.elementInfo.expression = this.elementInfo.expression.trim()
            }
            if (this.elementInfo.type === 'normal' && this.elementInfo.metric instanceof Array) {
              this.elementInfo.metric = this.elementInfo.metric[2]
            }
            this.convertLabelValueCascadeVal()// 将label，value级联选择的值，转换为selectTagList里
            this.$emit('on-add-target-success', this.elementInfo, pointer, optType)
          }
        })
      }
    },
    setLableValueFromCache (project, module) {
      const projectItem = this.metricAllData.get(project)
      if (projectItem) {
        const moduleItem = projectItem.find(item => item.name === module)
        if (moduleItem) {
          this.metricLabelValInfo = moduleItem.metricMap
        }
      }
    },
    cacheData (project, module, metricName, labelValList) {
      const projectItem = this.metricAllData.get(project)
      if (projectItem) {
        const moduleItem = projectItem.find(item => item.name === module)
        if (moduleItem) {
          const metricAllMap = moduleItem.metricMap
          if (metricAllMap.has(metricName)) {
            const existMetricLabelList = metricAllMap.get(metricName)
            labelValList.forEach((labelItem, index) => {
              const existTagItem = existMetricLabelList.find(item => item.name === labelItem.name)
              if (existTagItem) { // label已添加
                labelItem.list.forEach((valueItem, valIndex) => {
                  if (existTagItem.list.indexOf(valueItem) === -1) { // value未添加
                    existTagItem.list.push(valueItem)
                  }
                })
              } else { // label未添加
                existMetricLabelList.push(labelItem)
              }
            })
          } else {
            moduleItem.metricMap.set(metricName, labelValList)
          }
        }
      }
    },
    setLabelDivHeight (count) {
      /*
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
*/
    },
    /*
    getMetricNodes(project,module) {
      let metricArr = [];
      let metricArrTmp = [];
      this.metricCascaderList.map((item, index) => {
        if(item.label===project){//选择的project
          item.children.map((innerItem, innerIndex) => {
            if (innerItem.value === module && innerItem.children.length === 0) {//不重复加载
              // 当二级分类的的child为空时才请求一次数据
              let match = '{project="'+project+'",module="'+module+'"}';
              this.$get('/prom/api/v1/series?match[]='+match).then(res => {
                if (res.status === 'success') {

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
                    //this.$set(item.children[innerIndex], 'children', metricArr);

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
      return metricArr;
    },
    */
    // 动态加载第三级选项metric及label
    /*
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
    */
    cascaderStyle () {
      const cascaderElem = document.querySelectorAll('.dashboard-metric-dropdown>.el-cascader-panel>.el-cascader-menu')
      if (cascaderElem[0]) {
        cascaderElem[0].style.minWidth = '80px'
      }
      if (cascaderElem[1]) {
        cascaderElem[1].style.minWidth = '80px'
      }
      if (cascaderElem[2]) {
        cascaderElem[2].style.minWidth = '360px'
      }
    },
    setLabelValueCascader () {
      this.labelValueCascaderOptions = []
      this.labelValueCascaderVal = []
      this.elementInfo.selectedTagList.forEach((item) => {
        const valList = item.list
        const labelOption = {
          value: item.name,
          label: item.name,
          children: []
        }
        if (valList && valList.length > 0) {
          valList.forEach((valuItem) => {
            let disabled = false
            if (item.name === 'project' || item.name === 'module') {
              disabled = true
            }
            const valOption = {
              value: valuItem,
              label: valuItem,
              disabled: disabled
            }
            labelOption.children.push(valOption)
          })
        }
        this.labelValueCascaderOptions.push(labelOption)

        if (item.value.length > 0) {
          item.value.forEach((valueItem) => {
            const labelVal = []
            labelVal.push(item.name)
            labelVal.push(valueItem)
            this.labelValueCascaderVal.push(labelVal)
          })
        }
      })
    },
    changeTag () {
      this.$emit('on-change-condition')
    },
    changeExpression (v) {
      this.$emit('on-change-condition')
    },
    // 选择metric
    selectMetric () {
      if (this.elementInfo.metric) { // 选择了metric，则设置tagList，否则设置为空
        this.getSuggestTags(this.elementInfo.metric)
        this.setLabelValueCascader()
        this.elementInfo.metric = this.elementInfo.metric[2]
      } else {
        this.elementInfo.tagList = []
        this.setLabelDivHeight(0)
      }
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.scrollbar.update()
        }, 100)
      })
      this.changeTag()
    },
    setLabelValue (tagListTmp, project, module) {
      tagListTmp.forEach((item) => {
        if (item.name === 'project') {
          if (item.value.indexOf(project) === -1) {
            item.value.push(project)
          }
        } else if (item.name === 'module') {
          if (item.value.indexOf(module) === -1) {
            item.value.push(module)
          }
        }
      })

      this.labelSort.forEach((sortItem) => {
        let itemIndex = -1
        tagListTmp.forEach((item, i) => {
          if (sortItem === item.name) { // labelSort:['project','module','endpoint','datacenter','asset'],
            this.elementInfo.selectedTagList.push(item)
            itemIndex = i
          }
        })
        if (itemIndex !== -1) {
          tagListTmp.splice(itemIndex, 1)
        }
      })
      tagListTmp.forEach((item, i) => {
        this.elementInfo.selectedTagList.push(item)
      })

      const tagNum = this.elementInfo.selectedTagList.length
      this.$nextTick(() => {
        this.setLabelDivHeight(tagNum)
      })
    },
    // 获取tags列表
    getSuggestTags (metricArr) {
      const metric = metricArr[2]
      const proTmp = metricArr[0]
      const project = proTmp.substring(0, proTmp.length - 4)
      const module = metricArr[1]
      this.elementInfo.selectedTagList = []
      if (this.metricLabelValInfo.has(metric)) {
        let tagListTmp = []
        tagListTmp = [...this.metricLabelValInfo.get(metric)]
        tagListTmp.forEach((selectItem) => {
          selectItem.value = []// 清空值，再进行赋值
        })
        this.setLabelValue(tagListTmp, project, module)
      } else {
        const projectItem = this.metricAllData.get(project)
        if (projectItem) {
          const moduleItem = projectItem.find(item => item.name === module)
          if (moduleItem) {
            const metricAllMap = moduleItem.metricMap
            if (metricAllMap.has(metric)) {
              const tagListTmp = metricAllMap.get(metric)
              this.setLabelValue(tagListTmp, project, module)
            }
          }
        }

        // this.elementInfo.selectedTagList = [];
        // this.$nextTick(() => {
        // this.setLabelDivHeight(0);
        // });
      }
    },
    getStyles (width) {
      return `width: ${width}px;`
    },
    filterMethod (value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1
    },
    getItemValue (labArr, itemName) {
      let itemVal = ''
      labArr.forEach((item, index) => {
        const labNameTmp = item.substring(0, item.indexOf('='))// project   module   dc
        if (labNameTmp === itemName) {
          let labVal = item.substring(item.indexOf('=') + 1, item.length)
          if (labVal.indexOf('~') != -1) {
            labVal = labVal.substring(2, labVal.length - 1)
            const valArr = labVal.split('|')
            itemVal = valArr[0]
          } else {
            labVal = labVal.substring(1, labVal.length - 1)
            itemVal = labVal
          }
        }
      })
      return itemVal
    },

    getMetricLabelValue (metric, othersParams) {
      const labArr = othersParams.split(',')
      const projectVal = this.getItemValue(labArr, 'project')
      const projectCascaderVal = projectVal + '_par'
      const moduleVal = this.getItemValue(labArr, 'module')
      this.elementInfo.metric = [projectCascaderVal, moduleVal, metric]
      // 先判断缓存中是否已经存在数据，无则再从后台获取
      let metricLabelValMap = new Map()
      const projectItem = this.metricAllData.get(projectVal)
      if (projectItem) {
        const moduleItem = projectItem.find(item => item.name === moduleVal)
        if (moduleItem) {
          metricLabelValMap = moduleItem.metricMap
        }
      }
      if (metricLabelValMap.size > 0) {
        // 设置labelValue列表
        this.metricLabelValInfo = metricLabelValMap
        // 设置3级级联metric选择的metric
        const metricArr = []
        metricLabelValMap.forEach((item, index) => {
          const childOption = {
            value: index,
            label: index,
            leaf: true
          }
          metricArr.push(childOption)
        })
        this.metricCascaderList.forEach((item, index) => {
          if (item.value === projectCascaderVal) { // 选择的project
            item.children.forEach((innerItem, innerIndex) => {
              if (innerItem.value === moduleVal && innerItem.children.length === 0) { // 不重复加载
                this.$set(innerItem, 'children', metricArr)
              }
            })
          }
        })

        this.elementInfo.selectedTagList = []
        if (this.metricLabelValInfo.has(metric)) {
          let tagListTmp = []
          tagListTmp = [...this.metricLabelValInfo.get(metric)]// [...this.metricList],
          tagListTmp.forEach((selectItem) => {
            selectItem.value = []// 清空值，再进行赋值
          })
          // 设置选择的值
          const labArr = othersParams.split(',')
          tagListTmp.forEach((tagItem) => {
            const labelName = tagItem.name
            labArr.forEach((item, index) => { // b=~'1|2|3'
              const labNameTmp = item.substring(0, item.indexOf('='))// project   module   dc
              if (labNameTmp === labelName) {
                let labVal = item.substring(item.indexOf('=') + 1, item.length)
                if (labVal.indexOf('~') != -1) {
                  labVal = labVal.substring(2, labVal.length - 1)
                  const valArr = labVal.split('|')
                  valArr.forEach((labItem, labIndex) => {
                    if (tagItem.value.indexOf(labItem) === -1) {
                      tagItem.value.push(labItem)
                    }
                  })
                } else {
                  labVal = labVal.substring(1, labVal.length - 1)
                  if (tagItem.value.indexOf(labVal) === -1) {
                    tagItem.value.push(labVal)
                  }
                }
              }
            })
          })
          // 排序label顺序
          this.sortLabel(tagListTmp, this.elementInfo.selectedTagList)
          this.setLabelValueCascader()
        }
      } else {
        const match = '{project="' + projectVal + '",module="' + moduleVal + '"}'
        this.$get('/prom/api/v1/series?match[]=' + match).then(res => {
          if (res.status === 'success') {
            const metricArr = []
            const metricArrTmp = []
            res.data.forEach((tag, i) => {
              const metricName = tag.__name__
              if (metricArrTmp.indexOf(metricName) === -1) {
                const childOption = {
                  value: metricName, // +"_par",
                  label: metricName,
                  leaf: true
                }
                metricArrTmp.push(metricName)
                metricArr.push(childOption)
              }
              this.metricCascaderList.forEach((item, index) => {
                if (item.value === projectCascaderVal) { // 选择的project
                  item.children.forEach((innerItem, innerIndex) => {
                    if (innerItem.value === moduleVal && innerItem.children.length === 0) { // 不重复加载
                      this.$set(innerItem, 'children', metricArr)
                    }
                  })
                }
              })

              const tagsArr = Object.keys(tag)// ["__name__","asset","idc","instance","job","module","project"]
              const labelValList = []

              tagsArr.forEach((tagName) => {
                if (tagName !== '__name__') {
                  const tagObj = {
                    name: tagName,
                    list: [],
                    value: []// 最终选择的值
                  }
                  const tagValue = tag[tagName]
                  const tagItem = labelValList.find(item => item.name === tagName)
                  if (tagItem) { // metric对应的label已添加
                    if (tagItem.list.indexOf(tagValue) === -1) { // label对于value是否添加，没有添加，则添加
                      tagItem.list.push(tagValue)
                    }
                  } else { // metric对于的label未添加
                    tagObj.list.push(tagValue)
                    labelValList.push(tagObj)
                  }
                }
              })
              if (this.metricLabelValInfo.has(metricName)) {
                const existMetricLabelList = this.metricLabelValInfo.get(metricName)
                labelValList.forEach((labelItem, index) => {
                  const existTagItem = existMetricLabelList.find(item => item.name === labelItem.name)
                  if (existTagItem) { // label已添加
                    labelItem.list.forEach((valueItem, valIndex) => {
                      if (existTagItem.list.indexOf(valueItem) === -1) { // value未添加
                        existTagItem.list.push(valueItem)
                      }
                    })
                  } else { // label未添加
                    existMetricLabelList.push(labelItem)
                  }
                })
              } else {
                this.metricLabelValInfo.set(metricName, labelValList)
              }
              // 缓存数据
              this.cacheData(projectVal, moduleVal, metricName, labelValList)
            })

            this.elementInfo.selectedTagList = []
            if (this.metricLabelValInfo.has(metric)) {
              let tagListTmp = []
              tagListTmp = [...this.metricLabelValInfo.get(metric)]// [...this.metricList],
              tagListTmp.forEach((selectItem) => {
                selectItem.value = []// 清空值，再进行赋值
              })
              // 设置选择的值
              const labArr = othersParams.split(',')
              tagListTmp.forEach((tagItem) => {
                const labelName = tagItem.name
                labArr.forEach((item, index) => { // b=~'1|2|3'
                  const labNameTmp = item.substring(0, item.indexOf('='))// project   module   dc
                  if (labNameTmp === labelName) {
                    let labVal = item.substring(item.indexOf('=') + 1, item.length)
                    if (labVal.indexOf('~') != -1) {
                      labVal = labVal.substring(2, labVal.length - 1)
                      const valArr = labVal.split('|')
                      valArr.forEach((labItem, labIndex) => {
                        if (tagItem.value.indexOf(labItem) === -1) {
                          tagItem.value.push(labItem)
                        }
                      })
                    } else {
                      labVal = labVal.substring(1, labVal.length - 1)
                      if (tagItem.value.indexOf(labVal) === -1) {
                        tagItem.value.push(labVal)
                      }
                    }
                  }
                })
              })
              // 排序label顺序
              this.sortLabel(tagListTmp, this.elementInfo.selectedTagList)
              this.setLabelValueCascader()
              // let tagNum = this.elementInfo.selectedTagList.length;
              // this.$nextTick(() => {
              // this.setLabelDivHeight(tagNum);
              // });
            } else {
              this.$nextTick(() => {
                this.elementInfo.selectedTagList = []
                // this.setLabelDivHeight(0);
              })
            }
          }
        })
      }
    },
    sortLabel (tagListTmp, rltList) {
      this.labelSort.forEach((sortItem) => {
        let itemIndex = -1
        tagListTmp.forEach((item, i) => {
          if (sortItem === item.name) { // labelSort:['project','module','endpoint','datacenter','asset'],
            // this.elementInfo.selectedTagList.push(item);
            rltList.push(item)
            itemIndex = i
          }
        })
        if (itemIndex !== -1) {
          tagListTmp.splice(itemIndex, 1)
        }
      })
      tagListTmp.forEach((item, i) => {
        // this.elementInfo.selectedTagList.push(item);
        rltList.push(item)
      })
    },

    // 编辑已有图表状态时，先填充数据
    setMdata (data, statistics) {
      this.setDataFlag = true
      this.target = Object.assign({}, data)

      this.elementInfo.statistics = statistics
      if (this.target.type === 'expert') {
        this.tableShow = 2
        this.elementInfo.type = this.target.type
        this.elementInfo.expression = this.target.expression
        this.elementInfo.legend = this.target.legend
      } else {
        this.tableShow = 1
        this.elementInfo.type = this.target.type
        // 解析expression，=>标签列表，值列表（index对应），设置selectedTagList及tagList里的isSelect为true
        const expression = this.target.expression
        // alert('expression=='+expression);
        if (expression.indexOf('{') > -1) {
          this.elementInfo.metric = expression.substring(0, expression.indexOf('{'))
        } else {
          this.elementInfo.metric = expression
        }
        // 设置metric显示的值
        /*
        if (this.$refs.metricSelect) {
          let cascaderDiv = document.querySelector('#cascader'+this.pointer);
          if(cascaderDiv){
            let cascaderInput = cascaderDiv.firstElementChild;
            if(cascaderInput && cascaderInput.firstElementChild){
              cascaderInput.firstElementChild.value = this.elementInfo.metric;
            }
          }
        } */

        this.elementInfo.legend = this.target.legend
        const labelValList = expression.substring(expression.indexOf('{') + 1, expression.indexOf('}'))
        this.getMetricLabelValue(this.elementInfo.metric, labelValList)// 获得metric及对应label及value
      }
      setTimeout(() => {
        this.$refs.scrollbar.update()
      }, 1000)
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

    clearHistory () {
      this.elementInfo.metric = ''
      this.setDataFlag = false
      if (this.$refs.elementInfo) {
        this.$refs.elementInfo.resetFields()// ???
      }
      if (this.$refs.metricSelect) {
        this.$refs.metricSelect.reset()
      }
      this.elementInfo.tagList = []
    },
    // 获取文本宽度
    getWidth (str) {
      const sensor = document.createElement('pre')
      sensor.innerHTML = str
      sensor.style.display = 'inline-block'
      sensor.style.width = 'auto'
      sensor.style.visibility = 'hidden'
      sensor.style.height = 0
      sensor.style.position = 'relative'
      sensor.style['z-index'] = -10
      document.body.appendChild(sensor)
      const width = sensor.offsetWidth
      document.body.removeChild(sensor)
      const widthL = width > 180 ? width : 180
      return widthL
    },
    // 将tag添加到相应框内
    proTags (data) {
      const dou = data.indexOf(',')
      // 只有一组tag
      if (dou === -1) {
        const set = data.split('=')
        const tagValueArr = set[1].indexOf('|') > -1 ? set[1].split('|') : [set[1]]
        const tagIndex = this.elementInfo.tagList.findIndex(t => t.name === set[0])
        if (tagIndex > -1) {
          this.elementInfo.tagList[tagIndex].value = tagValueArr
        }
      } else { // 多组tag
        const mid = data.split(',') // ['key=v1','key=v2|v3',....]
        mid.forEach((item) => {
          const setInner = item.split('=')
          const innerValueArr = setInner[1].indexOf('|') > -1
            ? setInner[1].split('|')
            : [setInner[1]]
          const tagIndex = this.elementInfo.tagList.findIndex(t => t.name === setInner[0])
          if (tagIndex > -1) {
            this.elementInfo.tagList[tagIndex].value = innerValueArr
          }
        })
      }
    },
    // metricLabelName单击事件
    getLidata (index, item) {
      if (!item.isSelect) {
        this.vendorCount = index
        // 查询metricLabel名称对应的LabelValue
        this.$get('metric/labelVal?metric=' + this.elementInfo.metric + '&name=' + item.name).then(response => {
          const tagObj = {
            name: item.name, // 选中的metricLabel名称
            list: [], // metricLabel名称对应的LabelValue
            value: []// 最终选择的值
          }
          // this.elementInfo.selectedTagList = [];
          if (response.code === 200) {
            if (response.data.list) {
              response.data.list.forEach((item) => {
                tagObj.list.push(item.value)
              })
              this.elementInfo.selectedTagList.push(tagObj)
            } else {
              response.data.forEach((item) => {
                tagObj.list.push(item.value)
              })
              this.elementInfo.selectedTagList.push(tagObj)
            }
          } else {
            this.elementInfo.selectedTagList.push(tagObj)
          }
        })
        item.isSelect = true
      }
    },
    // 删除MetricLabel时，需要将tagList中的isSelect设置为false，并删除elementInfo.selectedTagList里对应的元素
    deleteMetricLabel (item, index) {
      this.elementInfo.tagList.forEach((tagItem) => {
        if (tagItem.name === item.name) {
          tagItem.isSelect = false
        }
      })
      this.elementInfo.selectedTagList.splice(index, 1)
      // this.$emit('on-delete-target', this.pointer);
    },
    clickTabelShow (val, type) {
      this.tableShow = val
      this.elementInfo.type = type
      if (val === 2) {
        this.elementInfo.metric = ''
      }
      if (val === 1) {
        this.elementInfo.expression = ''
      }
    },
    resetZIndex
  },
  computed: {
    metricShowList () {
      const obj = {
        arr: [...this.metricList],
        text: ''
      }
      return obj
    }
  },
  mounted () {
    bus.$on('clear_history', () => {
      this.clearHistory()
    })
  },
  beforeDestroy () {
    bus.$off('clear_history')
  }

}

</script>
