<style scoped>
  .el-row {
    margin-bottom: 20px;
  }
  .el-row:last-child  {
    margin-bottom: 0;
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple {
    background: white;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }

  .common-float-left {
    float: left;
    display:inline-block;
  }

  .el-inner {
    width: 200px;
    border-top-width: 0px;
    border-left-width: 0px;
    border-right-width: 0px;
    border-bottom-width: 10px;
    border-color:red;
    /*outline: medium;*/
  }

  .element-bottom-border {
    padding-bottom: 5px;
    border-bottom: 1px solid #dfe7f2;
    margin-top: 15px;
  }
  /*metric样式--begin*/
  .element-item {
    padding: 20px 0;
    border-bottom: 1px dashed #dfe7f2;
    width: 100%;
  }
  /*metric样式--end*/
  .label-center{
    vertical-align: middle;
    line-height: 34px;
  }

  .z-top {
    /*z-index: 2900;*/
  }
  .save-chart-box{
    z-index: 2900;
  }
</style>
<template key="chartBox">
  <div v-clickoutside="clickOutside" class="right-box right-box-add-chart z-top right-box-chart" :class="boxClass">
    <transition name="right-box">
      <panel-box :panel="panel" @reload="panelReload" ref="panelBox2" v-if="!showPanel.type"></panel-box>
    </transition>

    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns">
      <button id="chart-box-delete" type="button" v-if="editChart.id" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editChart.id ? $t("dashboard.panel.editChartTitle") : $t("dashboard.panel.createChartTitle")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box" ref="scrollbar">
      <el-form class="right-box-form  right-box-form-left" :model="editChart" label-width="120px" label-position="right" :rules="rules" ref="chartForm">
        <el-form-item :label="$t('dashboard.panel.title')" prop="panelName" v-if="showPanel.type != 'dashboard' && showPanel.type != 'project' && showPanel.type != 'asset' && showPanel.type != 'model'">
          <el-autocomplete
            :fetch-suggestions="panelSuggestion"
            v-model.trim="editChart.panelName"
            placeholder=""
            size="small"
            value-key="name"
            v-if="!editChart.id"
            popper-class="chart-box-autocomplete no-style-class"
          >
          </el-autocomplete>
          <el-input size="small" v-if="editChart.id" readonly="readonly" :value="editChart.panelName"></el-input>

        </el-form-item>
        <el-form-item :label='$t("dashboard.panel.chartForm.chartName")' prop="title">
          <el-input size="small" maxlength="64" show-word-limit v-model="editChart.title"></el-input>
        </el-form-item>

        <div class="right-box-sub-title">{{$t('dashboard.panel.chartForm.option')}}</div>
        <div class="line-100" style="margin-bottom: 20px;"></div>

        <!-- type unit start-->
        <el-form-item :label="$t('dashboard.panel.chartForm.type')" prop="type" class="half-form-item">
          <el-select class="right-box-row-with-btn" @change="chartTypeChange" value-key="chartType" popper-class="chart-box-dropdown-small" v-model="editChart.type" placeholder="" size="mini">
            <el-option v-for="item in chartTypeList" :key="item.id" :label="item.name" :value="item.id">
              <span class="panel-dropdown-label-txt" >{{item.name}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('dashboard.panel.chartForm.unit')" prop="unit" class="half-form-item" style="width: 415px;">
          <el-cascader filterable placeholder="" popper-class="dc-dropdown" size="mini"  style="width: 100%"
                       :options="unitOptions"
                       :props="{ expandTrigger: 'hover',emitPath:false }"
                       :show-all-levels="false"
                       v-model="editChart.unit"
                       @change="unitSelected"
          >
          </el-cascader>
        </el-form-item>
        <!--type unit end-->

        <el-form-item :label="$t('dashboard.panel.chartForm.width')" prop="span" class="half-form-item">
          <el-select class="right-box-row-with-btn"  value-key="chartSpan" popper-class="chart-box-dropdown-mini" v-model="editChart.span" placeholder="" size="mini">
            <el-option v-for="item in spanList" :key="item" :label="'span-' + item" :value="item">
              <span class="panel-dropdown-label-txt" > span-{{item}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('dashboard.panel.chartForm.high')" prop="hight"  class="half-form-item" style="width: 415px;">
          <el-autocomplete
            v-model="editChart.height"
            :fetch-suggestions="querySearch"
            placeholder=""
            size="mini"
            popper-class="popper-z-index no-style-class"
            @select="handleSelect">
            <template slot-scope="{ item }">
              <div class="name">{{ item }}</div>
            </template>
          </el-autocomplete>
          <span class="nz-input-append">px</span>
        </el-form-item>


        <el-form-item :label="$t('dashboard.panel.chartForm.sync')" v-if="showPanel.type && showPanel.type == 'model'">
          <el-switch class="exporter-switch" v-model="editChart.sync" active-color="#ee9d3f" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>

        <el-form-item v-if="isUrl" :label='$t("dashboard.panel.chartForm.url")' prop="param.url" :rules="{ required: true,  message: $t('validate.required'), trigger: 'blur' }">
          <el-input size="small" type="textarea" maxlength="1024" show-word-limit v-model="editChart.param.url"></el-input>
        </el-form-item>

        <el-form-item v-if="editChart.type == 'line' || editChart.type == 'bar' || editChart.type == 'stackArea'" :label='$t("dashboard.panel.chartForm.threshold")' prop="param.threshold"  class="half-form-item">
          <el-input size="mini" type="input" v-model="editChart.param.threshold"></el-input>
        </el-form-item>

        <div v-if="!isUrl&&!isAlert" class="right-box-sub-title">
          <span>{{$t('alert.config.expr')}}</span>
          <span v-if="!isSingleStat" class="float-right" @click="addExpression"><i style="font-size: 16px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i></span>
        </div>
        <div v-if="isAlert" class="right-box-sub-title">{{$t('dashboard.panel.chartForm.alertParam.param')}}</div>
        <div v-if="!isUrl" class="line-100"></div>

        <el-row v-if="isAlert" class="element-item">
          <alert-chart-param ref="alertParamBox" @on-enter-complate="getAlertParam"></alert-chart-param>
        </el-row>

        <el-row v-if="!isUrl &&!isAlert" class="element-item" style="" v-for="index of promqlKeys.length" :key="'ele' + index">
          <promql-input
            :ref="'promql-'+(index-1)"
            :id="promqlKeys[index-1]"
            :key="promqlKeys[index-1]"
            :expression-list="expressions"
            :index="index-1"
            :styleType="2"
            :plugins="['metric-selector', 'metric-input', 'remove']"
            @change="expressionChange"
            @removeExpression="removeExpression"
          ></promql-input>
          <el-row>
            <template v-if="editChart.type != 'singleStat'">
              <el-col style="width: 120px; padding-right: 20px; text-align: right; color: #666">
                {{$t('dashboard.panel.chartForm.legend')}}&nbsp;
                <el-popover :content="$t('dashboard.panel.chartForm.legendTip')" placement="top" width="150" trigger="hover">
                  <i slot="reference" class="nz-icon nz-icon-info-normal" style="font-size: 12px; -webkit-transform:scale(0.75);display:inline-block;" @mouseover="rz"></i>
                </el-popover>
              </el-col>
              <el-col style="width: calc(100% - 120px);">
                <el-input v-model="legends[index-1]" type="text" size="small"></el-input>
              </el-col>
            </template>
            <template v-else>
              <el-col style="width: 120px; padding-right: 20px; text-align: right; color: #666">
                {{$t('dashboard.panel.chartForm.statistics')}}&nbsp;
              </el-col>
              <el-col style="width: calc(100% - 120px);">
                <el-select popper-class="chart-box-dropdown-mini" v-model="statistics" placeholder="" size="small">
                  <el-option v-for="item in statisticsList" :key="item.value" :label="item.label" :value="item.value">
                    <span class="panel-dropdown-label-txt" >{{item.label}}</span>
                  </el-option>
                </el-select>
              </el-col>
            </template>
          </el-row>
        </el-row>
        <!--value mapping start-->
        <div  class="right-box-sub-title" v-if="editChart.type == 'singleStat'">
          <span>{{$t('dashboard.panel.chartForm.valMapping.name')}}</span>
          <span  class="float-right" @click="addMapping"><i style="font-size: 16px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i></span>
        </div>
        <div class="line-100" style="margin-bottom: 20px;" v-if="editChart.type == 'singleStat'"></div>
        <el-form-item :label="$t('dashboard.panel.chartForm.type')" prop="span" v-if="editChart.type == 'singleStat'">
          <el-radio-group v-model="editChart.param.valueMapping.type" fill="#FA901C" text-color="#FA901C" size="small" class="val-mapping-type"  @change="valueMappingChange">
            <el-radio-button label="value" border class="no-fill">{{$t('dashboard.panel.chartForm.valMapping.value')}}</el-radio-button>
            <el-radio-button label="range" border class="no-fill">{{$t('dashboard.panel.chartForm.valMapping.range')}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <template v-if="editChart.type == 'singleStat'&&editChart.param.valueMapping.type == 'value'">
          <template  v-for="(mapping,index) in editChart.param.valueMapping.mapping">
            <el-form-item :label="$t('dashboard.panel.chartForm.valMapping.value')" prop="span" class="half-form-item" >
              <el-input size="mini" type="input" v-model="mapping.value"></el-input>
            </el-form-item>
            <el-form-item :label="$t('dashboard.panel.chartForm.valMapping.text')" prop="span" class="half-form-item" style="width: 415px;">
              <el-input size="mini" type="input" v-model="mapping.text" style="display: inline-block;width:calc(100% - 21px);"></el-input>
              <div  @click="delMapping(index)" style="display: inline-block"><i class="nz-icon nz-icon-minus"></i></div>
            </el-form-item>
          </template>
        </template>
        <template v-if="editChart.type == 'singleStat'&&editChart.param.valueMapping.type == 'range'">
          <template  v-for="(mapping,index) in editChart.param.valueMapping.mapping">
            <div class="half-form-item">
              <el-form-item :label="$t('dashboard.panel.chartForm.valMapping.from')" prop="span" class="one-third-form-item-left" >
                <el-input size="mini" type="input" v-model="mapping.from"></el-input>
              </el-form-item>
              <el-form-item :label="$t('dashboard.panel.chartForm.valMapping.to')" prop="span" class="one-third-form-item-right" >
                <el-input size="mini" type="input" v-model="mapping.to"></el-input>
              </el-form-item>
            </div>
            <el-form-item :label="$t('dashboard.panel.chartForm.valMapping.text')" prop="span" class="half-form-item" style="width: 415px;">
              <el-input size="mini" type="input" v-model="mapping.text" style="display: inline-block;width:calc(100% - 21px);" ></el-input>
              <div @click="delMapping(index)" style="display: inline-block"><i class="nz-icon nz-icon-minus"></i></div>
            </el-form-item>
          </template>
        </template>

        <!--value mapping end-->
        <template v-if="editChart.type == 'line' || editChart.type == 'bar' || editChart.type == 'stackArea'">
          <div  class="right-box-sub-title" >
            <span>{{$t('dashboard.panel.chartForm.legendValue')}}</span>
          </div>
          <div class="line-100" style="margin-bottom: 20px;" ></div>
          <div style="display: flex;">
            <span style="margin-left: 50px;"></span>
            <template v-for="item in sortedOptionKeys">
              <div style="flex: 1">
                <span style="margin-right: 10px;">{{item.label}}</span>
                <el-switch
                  v-model="editChart.param.legendValue[item.key]"
                  active-value="on"
                  inactive-value="off"
                  active-color="#ee9d3f"
                  @change="">
                </el-switch>
              </div>
            </template>
          </div>
        </template>

      </el-form>
    </el-scrollbar>

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc" id="chart-box-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="preview" id="chart-box-preview" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
        <span>{{$t('overall.preview')}}</span>
      </button>
      <button @click="confirmAdd" id="chart-box-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
    <!--preview -->
    <chart-preview :panelId="panelId" ref="chartsPreview" ></chart-preview>
  </div>
</template>

<script>
  import bus from '../../../libs/bus';
  import ChartMetric from "./chartMetric";
  import chartDataFormat from '../../charts/chartDataFormat';
  import chartPreview from '../../charts/chartPreview';
  import {getUUID, resetZIndex} from "../../common/js/common";
  import alertChartParam from "./alertChartParam";
  import promqlInput from "./explore/promqlInput";
  var rz = {
    methods: {
      rz(e) {
        resetZIndex(e);
      }
    }
  };
  export default {
    name: "chartBox",
    props: {
      boxClass:String,
      panelData: Array,
      showPanel: Object,
      chart: Object
    },
    mixins: [rz],
    data() {
      return {
        editChart: {},

        statisticsList: this.$CONSTANTS.statisticsList,

        promqlCount: 1,
        promqlKeys: [],
        elementIds: [],
        expressions: [],
        legends: [],
        statistics: "",

        editInfo: {},
        isUrl:false,
        isSingleStat:false,
        isAlert:false,
        rules: {
          panelName: [
            {required: true,  message: this.$t('validate.required'),  trigger: 'change'}
          ],
          title: [
            {required: true,  message: this.$t('validate.required'),  trigger: 'blur'}
          ],
          url: [
            {required: true,  message: this.$t('validate.required'),  trigger: 'blur'}
          ]
        },
        chartTypeList: [
          {
            id:"line",
            name:this.$t("dashboard.panel.chartForm.typeVal.line.label")
          },
          {
            id:'stackArea',
            name:this.$t("dashboard.panel.chartForm.typeVal.stackArea.label")
          },
          {
            id:"bar",
            name:this.$t("dashboard.panel.chartForm.typeVal.bar.label")
          },
          {
            id:'singleStat',
            name:this.$t("dashboard.panel.chartForm.typeVal.singleStat.label")
          },
          {
            id:"table",
            name:this.$t("dashboard.panel.chartForm.typeVal.table.label")
          },
          {
            id:'alertList',
            name:this.$t("dashboard.panel.chartForm.typeVal.alertList.label")
          },
          {
            id:'url',
            name:this.$t("dashboard.panel.chartForm.typeVal.url.label")
          },
        ],
        elements: [1], // 指标部分 tarNum
        elementTarget: [], // 本地保存数据
        alertParams:{},
        spanList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        // 是否为编辑已有信息
        isedit: false,
        //productId: 0,//不需要这个参数，可以删除
        panelId: 0,
        panelName: '',
        selectFirstPanel: false,
        metricList: [], // metric列表
        metricCascaderList:[],//metric级联列表
        metricAllData:new Map(),//存放所有的project-module-metric-labelValue，避免重复加载
        deleteIndex: '', // 要删除的指标模块
        subCount: 0, // subSave保存data到bus计数器
        panel: {
          id: '',
          name: ''
        },
        heightSuggestions:['300','400','500','600'],
        unitOptions:chartDataFormat.unitOptions(),
        sortedOptionKeys:[{key:'min',label:'Min'},{key:'max',label:'Max'},{key:'avg',label:'Avg'},{key:'last',label:'Current'},{key:'total',label:'Total'}]
      }
    },
    components:{
      'chart-metric':ChartMetric,
      'chart-preview':chartPreview,
      'alert-chart-param':alertChartParam,
      'promql-input': promqlInput,
    },
    mounted() {
      this.$nextTick(() => {
        this.initElements();
      });
    },
    methods: {
      clickOutside() {
        this.esc(false);
      },
      toAddPanel() {
        this.$refs.panelBox2.show(true);
        this.panel = {
          id: '',
          name: ''
        };
        this.$refs.panelBox2.setTitle(this.$t("dashboard.panel.createPanelTitle"));
      },
      panelReload(panelName) { //刷新panel下拉框
        if (panelName) {
          this.panelName = panelName;
        }
        this.$emit("reloadOnlyPanel");
      },
      deletePanel(panel) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel?ids=" + panel.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              if (this.panelId == panel.id) {
                this.selectFirstPanel = true;
                this.$emit('reload', true);
              } else {
                this.$emit('reload');
              }
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      editPanel(panel) {
        this.$refs.panelBox2.show(true);
        this.panel = Object.assign({}, panel);
        this.$refs.panelBox2.setTitle(this.$t("dashboard.panel.editPanelTitle"));
      },
      setUnit(unit) {
        this.$set(this.editChart,'unit',Number.parseInt(unit))
      },
      expressionChange: function () {

      },
      addExpression() {
        this.expressions.push('');
        this.legends.push('');
        this.promqlKeys.push(getUUID());
        this.elementIds.push("");
        this.promqlCount++;
      },
      removeExpression(index) {
        if (this.promqlCount > 1) {
          this.expressions.splice(index, 1);
          this.legends.splice(index, 1);
          this.promqlKeys.splice(index, 1);
          this.elementIds.splice(index, 1);
          this.promqlCount--;
          this.$nextTick(() => {
            this.expressions.forEach((ex, index) => {
              if (ex) {
                this.$refs[`promql-${index}`][0].metricChange(ex);
              }
            });
          });
        }
      },
      save() {
        this.$refs['chartForm'].validate((valid) => {
          if (valid) {
            if (this.editChart.id) {//修改
              this.$put('panel/'+this.editChart.id+'/charts').then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {//新增
              this.$post('panel/charts', this.editChart).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      del(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel/" + this.panelId + "/charts?ids=" + u.id).then(response => {
            if (response.code === 200) {
              if(this.$refs.chartForm){
                this.$refs.chartForm.resetFields();//清空表单
              }
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      //----------------------------------

      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },

      /*metric部分相关方法--begin*/
      // 增加指标,tarNum
      addTarget() {
        this.elements.push(1);
        this.$nextTick(() => {
          this.$refs.scrollbar.update();
        });
      },
      // 删除指标,第一步, 新方法
      deleteTarget(index) {
        //alert('box第一步，循环所有的metric，为什么要循环？？');
        this.deleteIndex = index;
        // alert('box第一步，循环所有的metric，循环前metric,循环次数='+this.$refs.chartTag.length);
        this.$refs.chartTag.forEach((item) => {
          // 子组件保存内容到bus
          item.subSave();
        });
        this.$nextTick(() => {
          this.$refs.scrollbar.update();
        });
      },
      // subSave保存成功后回调,第二步
      subOk() {
        // 每个模块均有返回,当全部模块返回完成时,将sub计数器重置
        //alert('box第二步，subCount和元素个数一样了，就从deleteIndex开始删除一个元素，this.subCount='+this.subCount);
        this.subCount += 1;
        if (this.subCount === this.elements.length) {
          this.subCount = 0;
          // 保存完成,进行删除操作
          //('box第二步，deleteIndex='+this.deleteIndex+'=开始删除一个元素')
          //console.log('box第二步，删除之前，elements='+JSON.stringify(this.elements)+'  elementTarget='+JSON.stringify(this.elementTarget)+'  bus='+JSON.stringify(bus.chartAddInfo.metricTarget));
          this.elements.splice(this.deleteIndex, 1);
          this.elementTarget.splice(this.deleteIndex, 1);//没有作用，此处是[]
          bus.chartAddInfo.metricTarget.splice(this.deleteIndex, 1);
          //console.log('box第二步，删除完毕，elements='+JSON.stringify(this.elements),'  elementTarget='+JSON.stringify(this.elementTarget),'  bus='+JSON.stringify(bus.chartAddInfo.metricTarget));

          this.$nextTick(() => {
            this.$refs.chartTag.forEach((item, index) => {
              item.setSubdata(index); // 将数据从bus重新赋值
            });
          });
        }
      },
      // 格式化tag为字符串表达式
      /*
      tagsToString(metric,arr) {
        let str = metric;
        let sepStr = '';
        arr.forEach((item, index) => {
          if (index === 0) {
            str +="{"
            if(item.value.length===1){
              str +=  `${item.name}='${item.value.join('|')}'`;
              sepStr = ',';
            }else if(item.value.length>1){
              str +=  `${item.name}=~'${item.value.join('|')}'`;
              sepStr = ',';
            }
          } else {
            if(item.value.length===1){
              str += sepStr+`${item.name}='${item.value.join('|')}'`;
              sepStr = ',';
            }else if(item.value.length>1){
              str += sepStr+`${item.name}=~'${item.value.join('|')}'`;
              sepStr = ',';
            }
          }
        });
        if(str.indexOf('{')>-1){
          str +="}";
        }
        if(str.endsWith('{}')){
          str = str.substring(0,str.indexOf('{'));
        }
        return str;
      },
       */
      autocompleteExist(string) {
        let result = false;
        for (let i = 0; i < this.panelData.length; i++) {
          if (this.panelData[i].name.toLowerCase() == string.toLowerCase()) {
            result = this.panelData[i].id;
            break;
          }
        }
        return result;
      },
      // 新建图表
      addCharts(params) {
        let panelId;
        //先处理panel
        if (this.panelId) {
          panelId = this.panelId;
        } else if (this.showPanel && this.showPanel.type != "dashboard") {
          panelId = this.panelData[0].id;
        } else {
          panelId = this.autocompleteExist(this.editChart.panelName);
          if (!panelId) {
            this.$post('panel', {name: this.editChart.panelName}).then(response => {
              if (response.code === 200) {
                this.$emit("reloadOnlyPanel");
                this.$store.commit('panelListChange', true);
                panelId = this.autocompleteExist(this.editChart.panelName);
              } else {
                if(response.msg){
                  this.$message.error(response.msg);
                }else {
                  this.$message.error(response);
                }
              }
            });
          }
        }

        let intervalTime = 1; //设置3秒超时
        let interval = setInterval(() => {
          if (panelId) {
            this.panelId = panelId;
            this.$post('panel/' + this.panelId + '/charts', params ? params : this.editChart).then(response => {
              if (response.code === 200) {
                this.esc();
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                this.$refs.chartForm.resetFields();//清空表单
                let panel = this.panelData.find(p => p.id === this.panelId);
                this.$emit('on-create-success', 'create', response.data, params, panel);
              } else {
                if(response.msg){
                  this.$message.error(response.msg);
                }else {
                  this.$message.error(response);
                }
              }
            });
            clearInterval(interval);
          } else if (intervalTime > 15) {
            this.$message.error("Time out");
            clearInterval(interval);
          } else {
            intervalTime++;
          }
        }, 200);
      },
      // 更新图表
      updateCharts(params) {
        this.$put('panel/' + this.panelId + '/charts', params ? params : this.editChart).then(response2 => {
          if (response2.code === 200) {
            this.esc();
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.$refs.chartForm.resetFields();//清空表单
            this.$emit('on-create-success', 'update', response2.data, params);
          } else {
            if(response2.msg){
              this.$message.error(response2.msg);
            }else {
              this.$message.error(response2);
            }
          }
        });
      },
      // 获取每个tag组件内部校验后数据,点击生成图表时触发
      getTarget(target,pointer,optType) {
        this.elementTarget.push(target);
        if (this.elementTarget.length === this.elements.length) {
          this.$refs.chartForm.validate((valid) => {
            const params = {
              // productId: this.productId,
              //panelId: this.panelId,
              title: this.editChart.title,//this.editChart
              span: this.editChart.span,
              height: this.editChart.height,
              type: this.editChart.type,
              unit:this.editChart.unit,
              param:{

              },
              sync: this.editChart.sync
            };
            if(this.editChart.type === 'singleStat'){
              params.param.statistics=this.statistics;
            } else {
              delete params.param.statistics;
            }
            if(this.editChart.type==='line'||this.editChart.type==='bar'||this.editChart.type==='stackArea'){
              params.param.threshold=this.editChart.param.threshold;
            } else {
              delete params.param.threshold;
            }
            //生成指标数组
            const elements = [];
            this.elementTarget.forEach((elem,index) => {
              if(elem.type==='normal'){
                const metricStr = bus.tagsToString(elem.metric,elem.selectedTagList);
                elements.push({
                  //id:index+1,
                  //metric: elem.metric,//指标名称
                  expression: metricStr,//指标对应Label及Value组成的表达式字符串
                  type:elem.type,//指标类型
                  legend:elem.legend,//配置的legend
                });
              }else if(elem.type==='expert'){
                elements.push({
                  //id:index+1,
                  //metric: elem.metric,//指标名称
                  expression: elem.expression,//指标对应Label及Value组成的表达式字符串
                  type:elem.type,//指标类型
                  legend:elem.legend,//配置的legend
                });
              }
            });
            params.elements = elements;
            if (valid) {
              if(optType==='preview') {
                if (this.isedit) {
                  params.id = this.editChart.id;
                }
                this.$refs.chartsPreview.show(params);
              }else{
                if (this.isedit) {
                  params.id = this.editChart.id;
                  this.updateCharts(params);
                } else {
                  this.addCharts(params);
                }
              }
            }
          });
        }
      },
      getAlertParam:function(param,opType){
        this.$refs.chartForm.validate((valid) => {
          const params = {
            title: this.editChart.title,//this.editChart
            span: this.editChart.span,
            height: this.editChart.height,
            type: this.editChart.type,
            unit:this.editChart.unit,
            param:param,
            sync: this.editChart.sync,
          };
          if (valid) {
            if(opType==='preview') {
              if (this.isedit) {
                params.id = this.editChart.id;
              }
              this.$refs.chartsPreview.show(params);
            }else{
              if (this.isedit) {
                params.id = this.editChart.id;
                this.updateCharts(params);
              } else {
                this.addCharts(params);
              }
            }
          }
        })
      },
      confirmAdd() {
        this.elementTarget = []; // 初始化清空参数
        if(this.editChart.type!=='url'){
          /*if(this.editChart.type == 'alertList'){
            this.$refs.alertParamBox.saveParam();
          }else{
            this.$refs.chartTag.forEach((item, index) => {//循环指标列表
              // 触发每个tag组件内部进行校验
              item.saveTarget(index);
            });
          }*/
          if(this.editChart.type == 'alertList'){
            this.$refs.alertParamBox.saveParam();
            return ;
          }
          if(this.editChart.type == 'singleStat'){
            this.$set(this.editChart.param, "statistics", this.statistics);
          } else {
            delete this.editChart.param.statistics;
          }
          if (this.expressions[0]) {
            this.editChart.elements = [];
            this.expressions.forEach((expr, i) => {
              this.editChart.elements.push({id: this.elementIds[i], expression: expr, type: "expert", legend: this.legends[i]});
            });
          }
          if (this.editChart.id) {
            this.updateCharts();
          } else {
            this.addCharts();
          }
        }else {
          this.$refs.chartForm.validate((valid) => {
            const params = {
              title: this.editChart.title,//this.editChart
              span: this.editChart.span,
              height: this.editChart.height,
              type: this.editChart.type,
              unit:this.editChart.unit,
              param:{
                url:this.editChart.param.url,
              },
              sync: this.editChart.sync
            };

            if (valid) {
              params.elements = [];
              if (this.isedit) {
                params.id = this.editChart.id;
                this.updateCharts(params);
              } else {
                this.addCharts(params);
              }
            }
          });
        }
      },
      // 获取metric列表
      getSuggestMetric() {
        //this.$get('/prom/api/v1/label/__name__/values').then(response => {
        this.$get('/module?pageSize=-1').then(response => {
          if (response.code === 200) {
            this.metricList = response.data.list;
            const cascaderMap = new Map();
            this.metricList.forEach((item,index) => {
              let projectName = item.project.name;
              let moduleName = item.name;
              const childOption = {
                value: moduleName,
                label: moduleName,
                children:[],
              };
              if(cascaderMap.has(projectName)){
                cascaderMap.get(projectName).push(childOption);
              }else {
                let childArr = [];
                childArr.push(childOption);
                cascaderMap.set(projectName,childArr);
              }

              //缓存全局数据
              const moduleItem = {
                name:moduleName,
                metricMap:new Map()
              };
              if(this.metricAllData.has(projectName)){
                let moduleGroup = this.metricAllData.get(projectName);
                this.metricAllData.get(projectName).push(moduleItem);
              }else {
                let moduleList = [];
                moduleList.push(moduleItem);
                this.metricAllData.set(projectName,moduleList);
              }
            });
            let metricCascaderArr = [];
            cascaderMap.forEach(function(value,index){
              const option = {
                value: index+"_par",
                label: index,
                children:value,
              };
              metricCascaderArr.push(option);
            });

            this.metricCascaderList = metricCascaderArr;
          }else {
            this.metricList = [];
            this.metricCascaderList = [];
          }
        })
      },
      // 创建打开
      createData(panelId, elementInfo) {
        if (panelId == -1) {
          let p = this.panelData[0];
          this.editChart.panelName = p.name;
        } else {
          this.panelId = panelId;
        }
        if (elementInfo) {
          if (elementInfo.elements.length > 1) {

            this.$nextTick(() => {
              this.elements = [];
              elementInfo.elements.forEach((item, index) => {
                this.elements.push(index);
              });
              let dSet = this.$refs.chartTag;
              this.$nextTick(() => {
                dSet.forEach((item, index) => {
                  item.setMdata(elementInfo.elements[index]);
                });
              });
            });

          } else {
            this.$nextTick(() => {
              this.$refs.chartTag[0].setMdata(elementInfo.elements[0]);
            });
          }
        }
        this.isedit = false;
        this.initInfo(); // 初始化图表信息
        //this.editChartModal = true;//????控制弹出框显示和隐藏的，不需要了
        this.initOpen(); // 获取metric, productId数据
      },
      setIsUrl(){
        this.isUrl = true;
        this.isSingleStat = false;
        this.isAlert = false;
      },
      setIsSingleStat(){
        this.isUrl = false;
        this.isSingleStat = true;
        this.isAlert=false;
      },
      setIsAlertList(){
        this.isAlert = true;
        this.isUrl = false;
        this.isSingleStat = false;
      },
      setIsOtherChart(){
        this.isSingleStat = false;
        this.isUrl = false;
        this.isAlert=false;
      },
      // 编辑chart时使用, set_tdata
      editData(data, panelId) {
        if (!panelId) {
          this.panelId = 0;
        } else {
          this.panelId = panelId;
          let temp = this.panelData.filter((item) => {
            return item.id == panelId;
          });
        }
        this.isedit = true;
        this.editInfo = data;
        // 图表信息获取
        this.editChart.id = data.id;
        this.editChart.title = data.title;
        this.editChart.span = data.span;
        this.editChart.height = data.height+'';
        this.editChart.type = data.type;
        this.editChart.unit=data.unit;
        this.editChart.elements = data.elements;
        if(this.editChart.type==='url'){
          this.editChart.param.url = data.param.url;
          this.setIsUrl();
          //this.elements = [1];
        }else if(this.editChart.type==='alertList'){
          this.editChart.param = data.param;
          this.setIsAlertList();
          this.$nextTick(()=>{
            this.$refs.alertParamBox.setData(data)
          })
          //this.elements=[1];
        }else{
          if((this.editChart.type==='line'||this.editChart.type==='bar'||this.editChart.type==='stackArea'||this.editChart.type==='singleStat')&&data.param){
            this.editChart.param.threshold=data.param.threshold;
            this.editChart.param.statistics = this.statistics = data.param.statistics;
          }else{
            this.editChart.param.threshold='';
          }
          this.setIsOtherChart();
          //this.getSuggestMetric();//获得指标列表
          // 指标
          /*this.elements = [];
          bus.chartAddInfo.metricTarget = [];
          data.elements.forEach((item, index) => {
            this.elements.push(index);
          });
          this.$nextTick(() => {
            if(this.editChart.type==='alertList'){
              this.setIsAlertList();
              this.$nextTick(()=>{
                this.$refs.alertParamBox.setData(data);
              })
            }else{
              const cSet = this.$refs.chartTag;
              // 派发charttag数据
              cSet.forEach((item, index) => {
                item.setMdata(data.elements[index]);
              });
            }
          });*/
        }
      },

      // 初始化信息
      initInfo() {
        this.editChart.title = '';
        this.editChart.type = 'line';
        this.editChart.span = 12;
        this.editChart.height = 400+'';
        this.editChart.unit=2;
        let param = {};
        param.url='';
        param.threshold='';
        param.valueMapping={type:'text',mapping:[{value:'',text:''}]};
        param.legendValue={min:'off',max:'off',avg:'off',last:'off',total:'off'}
        this.$set(this.editChart, "param", param);
        this.elements = [1];
        this.elementTarget = [];
        bus.chartAddInfo.metricTarget = [];
        this.setIsOtherChart();
      },
      // 创建时打开,用于清空chart-tag数据
      initOpen() {
        //bus.$emit('clear_history');
        /*  项目不需要produce
        if (this.$route.params.productId) {
          this.productId = parseInt(this.$route.params.productId, 10);
        }
        */
        //this.getSuggestMetric();
      },

      /*metric部分相关方法--end*/
      querySearch(queryString, cb) {
        let suggestions = this.heightSuggestions;
        let results=queryString&&(suggestions.includes(queryString)||suggestions.filter(this.createFilter(queryString)).length>0)?suggestions:[];
        cb(results);
      },
      createFilter(queryString) {
        return (suggestion) => {
          return (suggestion.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      handleSelect:function(item){
        this.editChart.height=item;
      },
      unitSelected:function(value){
        //this.editChart.unit=value[value.length-1];
      },
      chartTypeChange(){
        let chartType = this.editChart.type;
        this.editChart.param.url='';
        if(chartType==='url'){
          this.setIsUrl();
          /*if(this.$refs.chartTag){
            this.$refs.chartTag.forEach((item, index) => {
              item.setNotSingleStat();
            });
          }*/
        }else if(chartType === 'alertList'){
          this.setIsAlertList();
        }else if(chartType === 'singleStat'){
          this.setIsSingleStat();
          this.resetElements();
          this.statistics='',
          this.editChart.param={
            statistics:'',
            valueMapping:{
              type:'value',
              mapping:[{text:'',value:''}]
            }
          }
        }else {
          this.setIsOtherChart();
          if(chartType === 'bar'||chartType === 'line'||chartType === 'stackArea'){
            this.editChart.param={threshold:''}
          }
          /*if(this.$refs.chartTag){
            this.$refs.chartTag.forEach((item, index) => {
              item.setNotSingleStat();
            });
          }*/
        }
      },
      resetElements() {
        this.promqlKeys = [""];
        this.expressions = [""];
        this.legends = [];
        this.elementIds = [];
      },
      /*panel搜索建议*/
      panelSuggestion(queryString, callback) {
        let data = [];
        if (!queryString) {
          data = this.panelData;
        } else {
          for (let i = 0; i < this.panelData.length; i++) {
            if (this.panelData[i].name.toLowerCase().indexOf(queryString.toLowerCase()) != -1) {
              data.push(this.panelData[i]);
            }
          }
        }
        callback(data);
      },

      //preview -start
      //预览图表
      preview(){
        //验证图表数据是否合法？？，合法了再显示预览窗口
        this.elementTarget = []; // 初始化清空参数
        this.alertParams={};
        if(this.editChart.type!=='url'){
          if(this.editChart.type == 'alertList'){
            this.$refs.alertParamBox.saveParam('preview');
          }else{
            /*this.$refs.chartTag.forEach((item, index) => {//循环指标列表
              // 触发每个tag组件内部进行校验
              item.saveTarget(index,'preview');
            });*/
            this.$refs.chartForm.validate((valid) => {
              const params = {
                // productId: this.productId,
                //panelId: this.panelId,
                title: this.editChart.title,//this.editChart
                span: this.editChart.span,
                height: this.editChart.height,
                type: this.editChart.type,
                unit:this.editChart.unit,
                param:{

                },
                sync: this.editChart.sync
              };
              if(this.editChart.type === 'singleStat'){
                params.param.statistics=this.statistics;
                params.param.valueMapping=this.editChart.param.valueMapping;
              } else {
                delete params.param.statistics;
              }
              if(this.editChart.type==='line'||this.editChart.type==='bar'||this.editChart.type==='stackArea'){
                params.param.threshold=this.editChart.param.threshold;
                params.param.legendValue=this.editChart.param.legendValue;
              } else {
                delete params.param.threshold;
              }
              //生成指标数组
              const elements = [];
              this.expressions.forEach((expr, index) => {
                elements.push({
                  expression: expr,
                  type: 'expert',
                  legend: this.legends[index],
                });
              });
              //console.info(elements)
              params.elements = elements;
              if (valid) {
                this.$refs.chartsPreview.show(params);
              }
            });
          }
        }else {
          this.$refs.chartForm.validate((valid) => {
            const params = {
              title: this.editChart.title,//this.editChart
              span: this.editChart.span,
              height: this.editChart.height,
              type: this.editChart.type,
              unit:this.editChart.unit,
              param:{
                url:this.editChart.param.url,
              }
            };

            if (valid) {
              if (this.isedit) {
                params.id = this.editChart.id;
              }
              this.$refs.chartsPreview.show(params);
            }
          });
        }
      },
      //preview--end
      initElements() {
        if (!this.editChart.elements || this.editChart.elements.length == 0) {
          this.editChart.elements = [{expression: "", legend: "", type: "expert", id: ""}];
        }
        this.editChart.elements.forEach(element => {
          if(element&&element!=''){
            this.promqlKeys.push(getUUID());
            this.expressions.push(element.expression);
            this.legends.push(element.legend);
            this.elementIds.push(element.id);
          }
        });
        this.promqlCount=this.editChart.elements.length;
        this.$nextTick(() => {
          this.expressions.forEach((ex, index) => {
            if (ex) {
              this.$refs[`promql-${index}`][0].metricChange(ex);
            }
          });
        });
      },
      valueMappingChange:function(value){
        if(this.editChart.param.valueMapping.type == 'value'){
          this.editChart.param.valueMapping.mapping =[{text:'',value:''}];
        }else{
          this.editChart.param.valueMapping.mapping =[{from:'',to:'',text:''}];
        }
      },
      addMapping:function(){
        if(this.editChart.param.valueMapping.type == 'value'){
          this.editChart.param.valueMapping.mapping .push({text:'',value:''});
        }else{
          this.editChart.param.valueMapping.mapping .push({from:'',to:'',text:''});
        }
      },
      delMapping:function(index){
        this.editChart.param.valueMapping.mapping.splice(index,1)
      }
    },
    created() {
      this.getSuggestMetric();
    },
    watch: {
      chart: {
        deep: true,
        immediate: true,
        handler(n) {
          this.editChart = JSON.parse(JSON.stringify(n));
          if (n.type === 'url') {
            this.setIsUrl();
          } else if(n.type === 'alertList'){
            this.setIsAlertList();
          } else if(n.type === 'singleStat'){
            n.param&&!n.param.valueMapping&&this.$set(this.editChart.param,'valueMapping',{type:'value',mapping:[{text:'',value:''}]})
            this.setIsSingleStat();
          } else {
            this.setIsOtherChart();
            n.param&&!n.param.legendValue&&this.$set(this.editChart.param,'legendValue',{min:'off',max:'off',avg:'off',last:'off',total:'off'})
          }
          //console.info(this.showPanel);
          this.$set(this.editChart, "panelName", this.showPanel.name);
          if (this.showPanel.id) {
            this.panelId = this.showPanel.id;
          }
          if (n.id) {
            this.editData(this.editChart, this.showPanel.id);
          } else {
            this.createData(this.showPanel.id);
          }
        }
      },
      editChart: {
        deep: true,
        immediate: true,
        handler(n) {
          console.info((JSON.parse(JSON.stringify(n))))
          let panel = this.panelData.find(p => {
            return p.name == n.panelName;
          });
          panel && (this.panelId = panel.id);
        }
      }
      /*panelData: {
        deep: true,
        immediate: true,
        handler(n, o) {
          if(this.showPanel){
            if (!this.showPanel.type) {
              if (this.selectFirstPanel) {
                this.selectFirstPanel = false;
                this.panelId = n[0].id;
              } else if (this.panelName) {
                for (let i = 0; i < n.length; i++) {
                  if (n[i].name == this.panelName) {
                    this.panelId = n[i].id;
                  }
                }
              }
            }
          }
        }
      }*/
    },
    beforeDestroy() {
      if(this.$refs.chartTag){
        this.$refs.chartTag.forEach((item, index) => {//循环指标列表
          item.clearSelectedTagList();
        });
      }
      this.isUrl = false;
    },
  }
</script>
<style>
  .popper-z-index{
    z-index: 99999999 !important;
  }
  .right-box-add-chart .el-autocomplete {
    width: 100%;
  }
  .chart-box-autocomplete {
    z-index: 3000 !important;
  }
  .val-mapping-type .no-fill span{
    background-color: unset !important;
  }
</style>

