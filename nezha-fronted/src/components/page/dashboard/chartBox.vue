
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
  }
  /*metric样式--end*/
  .label-center{
    vertical-align: middle;
    line-height: 34px;
  }

  .z-top {
    z-index: 2900;
  }
</style>
<template key="chartBox">
  <div v-clickoutside="clickos">
    <panel-box :panel="panel" @reload="panelReload" ref="panelBox2" v-if="!showPanel.type"></panel-box>

    <transition name="right-box">
      <div class="right-box right-box-add-chart z-top right-box-chart" v-if="rightBox.show" >
        <!-- begin--顶部按钮-->
        <div class="right-box-top-btns">
          <button id="chart-box-delete" type="button" v-if="chart.id != ''" @click="del(chart)" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
            <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
            <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
          </button>
        </div>
        <!-- end--顶部按钮-->

        <!-- begin--标题-->
        <div class="right-box-title">{{rightBox.title}}</div>
        <!-- end--标题-->

        <!-- begin--表单-->
        <el-scrollbar class="right-box-form-box" ref="scrollbar">
          <el-form class="right-box-form" :model="chart"  :rules="rules" ref="chartForm">
            <el-form-item :label="$t('dashboard.panel.title')" prop="panel" v-if="!showPanel.type">
              <el-autocomplete
                :fetch-suggestions="panelSuggestion"
                v-model.trim="panelName2"
                placeholder=""
                size="small"
                value-key="name"
                v-if="!chart.id"
                popper-class="chart-box-autocomplete no-style-class"
              >
              </el-autocomplete>
              <el-input size="small" v-if="chart.id" readonly="readonly" :value="panelName2"></el-input>
              <!--<el-select popper-class="chart-box-dropdown"
                         v-model="panelId" placeholder="" v-if="rightBox.show" size="small">
                <el-option v-for="item in panelData" :key="item.id" :label="item.name"
                           :value="item.id" :id="'chart-box-panel-'+item.id">
                  <span class="config-dropdown-label-txt">{{item.name}}</span>
                  <div class="config-dropdown-label-icons">
                  <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="deletePanel(item)"
                        :id="'chart-box-panel-op-del-'+item.id"><i class="el-icon-delete"></i></span>
                    <span class="config-dropdown-btn" @click.stop="editPanel(item)"
                          :id="'chart-box-panel-op-edit-'+item.id"><i class="nz-icon nz-icon-edit"></i></span>
                  </div>
                </el-option>
              </el-select>

              <div class="right-box-row-btn" v-if="rightBox.show" @click="toAddPanel">
                <i class="el-icon-plus" id="chart-box-panel-plus"></i>
              </div>-->

            </el-form-item>
            <el-form-item :label='$t("dashboard.panel.chartForm.chartName")' prop="title">
              <el-input size="small" maxlength="64" show-word-limit v-model="chart.title"></el-input>
            </el-form-item>

            <div class="right-box-sub-title">{{$t('dashboard.panel.chartForm.option')}}</div>
            <div class="line-100"></div>

            <!-- type unit start-->
            <el-row :gutter="10" style="padding-top:20px">
              <el-col :span="2" >
                <div class="label-center" >{{$t('dashboard.panel.chartForm.type')}}</div>
              </el-col>
              <el-col :span="10" >
                <div class="grid-content ">
                  <el-form-item prop="type">
                    <el-select class="right-box-row-with-btn" @change="chartTypeChange" value-key="chartType" popper-class="chart-box-dropdown-small" v-model="chart.type" placeholder="" size="mini">
                      <el-option v-for="item in chartTypeList" :key="item.id" :label="item.name" :value="item.id">
                        <span class="panel-dropdown-label-txt" >{{item.name}}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
              <el-col v-show="!isUrl&&!isAlert" :span="2" >
                <div class="label-center" >{{$t('dashboard.panel.chartForm.unit')}}</div>
              </el-col>
              <el-col v-show="!isUrl&&!isAlert" :span="10">
                <el-cascader filterable placeholder="" popper-class="dc-dropdown" size="mini"
                             :options="unitOptions"
                             :props="{ expandTrigger: 'hover',emitPath:false }"
                             :show-all-levels="false"
                             v-model="chart.unit"
                             @change="unitSelected"
                >
                </el-cascader>
              </el-col>
            </el-row>
            <!--type unit end-->

            <el-row :gutter="10">
              <el-col :span="2" >
                <div class="label-center"  >{{$t('dashboard.panel.chartForm.width')}}</div>
              </el-col>
              <el-col :span="10" >
                <div class="grid-content ">
                  <el-form-item prop="span">
                    <el-select class="right-box-row-with-btn"  value-key="chartSpan" popper-class="chart-box-dropdown-mini" v-model="chart.span" placeholder="" size="mini">
                      <el-option v-for="item in spanList" :key="item" :label="'span-' + item" :value="item">
                        <span class="panel-dropdown-label-txt" > span-{{item}}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :span="2" >
                <div class="label-center" >{{$t('dashboard.panel.chartForm.high')}}</div>
              </el-col>
              <el-col :span="10" >
                <div class="grid-content" >
                  <el-form-item prop="height">
                    <!--                  <el-input label="" v-model="chart.height" placeholder="" size="mini"></el-input>-->
                    <el-autocomplete
                      v-model="chart.height"
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
                </div>
              </el-col>
            </el-row>

            <el-form-item :label="$t('dashboard.panel.chartForm.sync')" v-if="showPanel.type && showPanel.type == 'model'">
              <el-switch class="exporter-switch" v-model="chart.sync" active-color="#ee9d3f" :active-value="1" :inactive-value="0"></el-switch>
            </el-form-item>

            <el-form-item v-if="isUrl" :label='$t("dashboard.panel.chartForm.url")' prop="param.url" :rules="{ required: true,  message: $t('validate.required'), trigger: 'blur' }">
              <el-input size="small" type="textarea" maxlength="1024" show-word-limit v-model="chart.param.url"></el-input>
            </el-form-item>

            <el-form-item v-if="chart.type == 'line' || chart.type == 'bar' || chart.type == 'stackArea'" :label='$t("dashboard.panel.chartForm.threshold")' prop="param.threshold" >
              <el-input size="small" type="input"  v-model="chart.param.threshold"></el-input>
            </el-form-item>

            <div v-if="!isUrl&&!isAlert" class="right-box-sub-title">{{$t('dashboard.panel.chartForm.metric')}}</div>
            <div v-if="isAlert" class="right-box-sub-title">{{$t('dashboard.panel.chartForm.alertParam.param')}}</div>
            <div v-if="!isUrl" class="line-100"></div>

            <el-row v-if="isAlert" class="element-item">
              <alert-chart-param ref="alertParamBox" @on-enter-complate="getAlertParam"></alert-chart-param>
            </el-row>

            <el-row v-if="!isUrl && !isSingleStat&&!isAlert" class="element-item" v-for="(elem, index) in elements" :key="'ele' + index">
              <chart-metric ref="chartTag"
                            :pointer="index"
                            :metric-list="metricList"
                            :metricCascaderList="metricCascaderList"
                            :metricAllData="metricAllData"
                            :count-total="elements.length"
                            @on-delete-target="deleteTarget"
                            @sub-save-ok="subOk"
                            @on-add-target-success="getTarget"
              ></chart-metric>
            </el-row>

            <el-row v-if="isSingleStat" class="element-item" v-for="(elem, index) in elements" :key="'ele' + index">
              <chart-metric ref="chartTag"
                            :has-legend="false"
                            :is-single-stat="true"
                            :pointer="index"
                            :metric-list="metricList"
                            :metricCascaderList="metricCascaderList"
                            :metricAllData="metricAllData"
                            :count-total="elements.length"
                            @on-delete-target="deleteTarget"
                            @sub-save-ok="subOk"
                            @on-add-target-success="getTarget"
              ></chart-metric>
            </el-row>
<!--
            <el-form-item prop="param.statistics" v-show="isSingleStat">
              <el-row :gutter="4">
                <el-col :span="4">
                  {{$t('dashboard.panel.chartForm.statistics')}}&nbsp;
                </el-col>
                <el-col :span="20">
                  <el-select class="right-box-row-with-btn" popper-class="chart-box-dropdown-mini" v-model="chart.param.statistics" placeholder="" size="small">
                    <el-option v-for="item in statisticsList" :key="item.id" :label="item.name" :value="item.id">
                      <span class="panel-dropdown-label-txt" >{{item.name}}</span>
                    </el-option>
                  </el-select>
                </el-col>
              </el-row>
            </el-form-item>
-->
            <button v-if="!isUrl && !isSingleStat&& !isAlert" type="button" @click="addTarget" class="nz-btn nz-btn-size-normal nz-btn-style-light" style="margin-left: 1px;">
              <span class="top-tool-btn-txt">{{$t('dashboard.panel.chartForm.addMetric')}}</span>
            </button>
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
      </div>
    </transition>
    <!--preview -->
    <chart-preview :panelId="panelId" ref="chartsPreview" ></chart-preview>
  </div>
</template>

<script>
  import bus from '../../../libs/bus';
  import ChartMetric from "./chartMetric";
  import chartDataFormat from '../../charts/chartDataFormat';
  import chartPreview from '../../charts/chartPreview';
  import alertChartParam from "./alertChartParam";
  export default {
    name: "chartBox",
    props: {
      panelData: Array,
      showPanel: Object
    },
    data() {
      return {
        rightBox: {
          show: false,
          title: this.$t('dashboard.panel.createChartTitle'),
        },
        editInfo: {},
        chart: {
          id:'',
          title: '',
          type:'line',
          span:12,
          height:'400',
          unit:2,
          param:{
            url:'',
            threshold:'',
          },
          elements:{
            id: '',
            expression: '',
            type: '',
            legend:'',
          },
          panel: '',
          sync: 0
        },
        isUrl:false,
        isSingleStat:false,
        isAlert:false,
        rules: {
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
            id:"bar",
            name:this.$t("dashboard.panel.chartForm.typeVal.bar.label")
          },
          {
            id:"table",
            name:this.$t("dashboard.panel.chartForm.typeVal.table.label")
          },
          {
            id:'stackArea',
            name:this.$t("dashboard.panel.chartForm.typeVal.stackArea.label")
          },
          {
            id:'url',
            name:this.$t("dashboard.panel.chartForm.typeVal.url.label")
          },
          {
            id:'singleStat',
            name:this.$t("dashboard.panel.chartForm.typeVal.singleStat.label")
          },
          {
            id:'alertList',
            name:this.$t("dashboard.panel.chartForm.typeVal.alertList.label")
          }
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
        panelName2: '',
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
      }
    },
    components:{
      'chart-metric':ChartMetric,
      'chart-preview':chartPreview,
      'alert-chart-param':alertChartParam
    },
    mounted() {

    },
    methods: {
      show(show) {
        if(this.showPanel){
          this.panelName2 = this.showPanel.name;
        }
        this.rightBox.show = show;
        this.isUrl = false;
        this.isSingleStat = false;
      },
      clickos() {
        this.esc();
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
      setTitle(title) {
        this.rightBox.title = title;
      },
      setUnit:function(unit){
        this.$set(this.chart,'unit',Number.parseInt(unit))
      },
      save() {
        this.$refs['chartForm'].validate((valid) => {
          if (valid) {
            if (this.chart.id) {//修改
              this.$put('panel/'+this.chart.id+'/charts').then(response => {
                if (response.code === 200) {
                  this.esc();
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {//新增
              this.$post('panel/charts', this.chart).then(response => {
                if (response.code === 200) {
                  this.esc();
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
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
      del: function(u) {
        let cloneChart=JSON.parse(JSON.stringify(u))
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel/"+this.panelId+"/charts?ids="+cloneChart.id).then(response => {
            if (response.code === 200) {
              if(this.$refs.chartForm){
                this.$refs.chartForm.resetFields();//清空表单
                this.panelName2 = '';
              }
              this.esc();
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              //this.getTableData();//删除相关图表后，刷新面板数据---调用panel的方法刷新
              this.chart.id='';//不清除，再次打开创建图表，会显示删除按钮
              this.$emit('on-delete-success');
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      //----------------------------------

      /*关闭弹框*/
      esc() {
        if (this.rightBox.show) {
          this.rightBox.show = false;
          //this.editParamBox.show = false;
          this.$refs.chartForm.resetFields();//清空表单
          this.panelName2 = '';
          this.chart.id='';//不清除，再次打开创建图表，会显示删除按钮
        }
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
        if (this.showPanel&&this.showPanel.type) {
          panelId = this.panelData[0].id;
        } else {
          panelId = this.autocompleteExist(this.panelName2);
          if (!panelId) {
            this.$post('panel', {name: this.panelName2}).then(response => {
              if (response.code === 200) {
                this.$emit("reloadOnlyPanel");
                this.$store.commit('panelListChange', true);
                panelId = this.autocompleteExist(this.panelName2);
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
            this.$post('panel/' + this.panelId + '/charts', params).then(response => {
              if (response.code === 200) {
                this.esc();
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                this.$refs.chartForm.resetFields();//清空表单
                this.panelName2 = '';
                let panel = this.panelData.find(p => p.id === this.panelId);
                this.$emit('on-create-success', 'create', response.data,params, panel);
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
        this.$put('panel/' + this.panelId + '/charts', params).then(response2 => {
          if (response2.code === 200) {
            this.esc();
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.$refs.chartForm.resetFields();//清空表单
            this.panelName2 = '';
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
              title: this.chart.title,//this.chart
              span: this.chart.span,
              height: this.chart.height,
              type: this.chart.type,
              unit:this.chart.unit,
              param:{

              },
              sync: this.chart.sync
            };
            if(this.chart.type === 'singleStat'){
              params.param.statistics=target.statistics;
            }
            if(this.chart.type==='line'||this.chart.type==='bar'||this.chart.type==='stackArea'){
              params.param.threshold=this.chart.param.threshold;
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
                  params.id = this.chart.id;
                }
                this.$refs.chartsPreview.show(params);
              }else{
                if (this.isedit) {
                  params.id = this.chart.id;
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
            title: this.chart.title,//this.chart
            span: this.chart.span,
            height: this.chart.height,
            type: this.chart.type,
            unit:this.chart.unit,
            param:param,
            sync: this.chart.sync
          };
          if (valid) {
            if(opType==='preview') {
              if (this.isedit) {
                params.id = this.chart.id;
              }
              this.$refs.chartsPreview.show(params);
            }else{
              if (this.isedit) {
                params.id = this.chart.id;
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
        if(this.chart.type!=='url'){
          if(this.chart.type == 'alertList'){
            this.$refs.alertParamBox.saveParam();
          }else{
            this.$refs.chartTag.forEach((item, index) => {//循环指标列表
              // 触发每个tag组件内部进行校验
              item.saveTarget(index);
            });
          }
        }else {
          this.$refs.chartForm.validate((valid) => {
            const params = {
              title: this.chart.title,//this.chart
              span: this.chart.span,
              height: this.chart.height,
              type: this.chart.type,
              unit:this.chart.unit,
              param:{
                url:this.chart.param.url,
              },
              sync: this.chart.sync
            };

            if (valid) {
              params.elements = [];
              if (this.isedit) {
                params.id = this.chart.id;
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
          this.panelId = this.panelData[0].id;
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
            console.log(this.$refs)
            this.$nextTick(() => {

              this.$refs.chartTag[0].setMdata(elementInfo.elements[0]);
            });
          }
        }
        this.isedit = false;
        this.initInfo(); // 初始化图表信息
        //this.chartModal = true;//????控制弹出框显示和隐藏的，不需要了
        this.initOpen(); // 获取metric, productId数据
      },
      setIsUrl(){
        this.isUrl = true;
        this.isSingleStat = false;
        this.isAlert=false;
      },
      setIsSingleStat(){
        this.isUrl = false;
        this.isSingleStat = true;
        this.isAlert=false;
      },
      setIsAlertList(){
        this.isAlert=true;
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
        //alert('data='+JSON.stringify(data)+"=="+panelId);
        this.panelId = panelId;
        let temp = this.panelData.filter((item) => {
          return item.id == panelId;
        });
        this.panelName2 = temp[0].name;
        this.isedit = true;
        //this.chartModal = true;
        this.editInfo = data;
        // 图表信息获取
        this.chart.id = data.id;
        this.chart.title = data.title;
        this.chart.span = data.span;
        this.chart.height = data.height+'';
        this.chart.type = data.type;
        this.chart.unit=data.unit;
        if(this.chart.type==='url'){
          this.chart.param.url = data.param.url;
          this.setIsUrl();
          this.elements = [1];
        }else if(this.chart.type==='singleStat'){
          this.setIsSingleStat();
          this.elements = [];
          bus.chartAddInfo.metricTarget = [];
          data.elements.forEach((item, index) => {
            this.elements.push(index);
          });
          this.$nextTick(() => {
            const cSet = this.$refs.chartTag;
            // 派发charttag数据
            cSet.forEach((item, index) => {
              item.setMdata(data.elements[index],data.param.statistics);
            });
          });
        }else if(this.chart.type==='alertLine'){
          this.chart.param=data.param;
          this.setIsAlertList();
          this.elements=[1];
        }else{
          if((this.chart.type==='line'||this.chart.type==='bar'||this.chart.type==='stackArea')&&data.param){
            this.chart.param.threshold=data.param.threshold;
          }else{
            this.chart.param.threshold='';
          }
          this.setIsOtherChart();
          //this.getSuggestMetric();//获得指标列表
          // 指标
          this.elements = [];
          bus.chartAddInfo.metricTarget = [];
          data.elements.forEach((item, index) => {
            this.elements.push(index);
          });
          this.$nextTick(() => {
            if(this.chart.type==='alertList'){
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
          });
        }
      },

      // 初始化信息
      initInfo() {
        this.chart.title = '';
        this.chart.type = 'line';
        this.chart.span = 12;
        this.chart.height = 400+'';
        this.chart.unit=2;
        this.chart.param.url='';
        this.chart.param.threshold='';
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
        this.chart.height=item;
      },
      unitSelected:function(value){
        //this.chart.unit=value[value.length-1];
      },
      chartTypeChange(){
        let chartType = this.chart.type;
        this.chart.param.url='';
        if(chartType==='url'){
          this.setIsUrl();
          /*if(this.$refs.chartTag){
            this.$refs.chartTag.forEach((item, index) => {
              item.setNotSingleStat();
            });
          }*/
        }else if(chartType==='singleStat'){
          this.elements = [1];
          this.setIsSingleStat();
          /*if(this.$refs.chartTag){
            this.$refs.chartTag.forEach((item, index) => {
              item.setSingleStat();
            });
          }*/
        }else if(chartType === 'alertList'){
          this.setIsAlertList();
        }else {
          this.setIsOtherChart();
          if(chartType === 'bar'||chartType === 'line'||chartType === 'stackArea'){
            this.chart.param={threshold:''}
          }
          /*if(this.$refs.chartTag){
            this.$refs.chartTag.forEach((item, index) => {
              item.setNotSingleStat();
            });
          }*/
        }
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
        if(this.chart.type!=='url'){
          if(this.chart.type == 'alertList'){
            this.$refs.alertParamBox.saveParam('preview');
          }else{
            this.$refs.chartTag.forEach((item, index) => {//循环指标列表
              // 触发每个tag组件内部进行校验
              item.saveTarget(index,'preview');
            });
          }
        }else {
          this.$refs.chartForm.validate((valid) => {
            const params = {
              title: this.chart.title,//this.chart
              span: this.chart.span,
              height: this.chart.height,
              type: this.chart.type,
              unit:this.chart.unit,
              param:{
                url:this.chart.param.url,
              }
            };

            if (valid) {
              if (this.isedit) {
                params.id = this.chart.id;
              }
              this.$refs.chartsPreview.show(params);
              /*
                if (this.isedit) {
                  params.id = this.chart.id;
                  this.updateCharts(params);
                } else {
                  this.addCharts(params);
                }
              */
            }
          });
        }
        //this.$refs.chartForm.validate();
      },
      //preview--end

    },
    created() {
      this.getSuggestMetric();
    },
    watch: {
      panelData: {
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
      }
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
</style>

