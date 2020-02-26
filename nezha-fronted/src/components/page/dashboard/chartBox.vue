
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
    <panel-box :panel="panel" @reload="panelReload" ref="panelBox2"></panel-box>

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
        <el-scrollbar class="right-box-form-box">
          <el-form class="right-box-form" :model="chart" label-position="top" :rules="rules" ref="chartForm">
            <el-form-item :label="$t('dashboard.panel.title')">
              <div class="right-box-form-content">
                <el-select class="right-box-row-with-btn" popper-class="chart-box-dropdown"
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
                </div>
              </div>
            </el-form-item>
            <el-form-item :label='$t("dashboard.panel.chartForm.chartName")' prop="title">
              <el-input size="small" maxlength="64" show-word-limit v-model="chart.title"></el-input>
            </el-form-item>

            <el-row :gutter="10">
              <el-col :span="2" >
                <div class="label-center" >{{$t('dashboard.panel.chartForm.type')}}</div>
              </el-col>
              <el-col :span="6" style="margin-left:-7px;">
                <div class="grid-content ">
                  <el-form-item prop="type">
                    <el-select class="right-box-row-with-btn" value-key="chartType" popper-class="chart-box-dropdown-mini" v-model="chart.type" placeholder="" size="mini">
                      <el-option v-for="item in chartTypeList" :key="item.id" :label="item.name" :value="item.id">
                        <span class="panel-dropdown-label-txt" >{{item.name}}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-col>
              <el-col :span="2" style="margin-left: 7px;">
                <div class="label-center"  >{{$t('dashboard.panel.chartForm.width')}}</div>
              </el-col>
              <el-col :span="6" style="margin-left:0px;">
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
              <el-col :span="2" style="padding-left: 10px;">
                <div class="label-center" >{{$t('dashboard.panel.chartForm.high')}}</div>
              </el-col>
              <el-col :span="6" style="margin-left: 0px;">
                <div class="grid-content" >
                  <el-form-item prop="heigh">
                    <!--                  <el-input label="" v-model="chart.height" placeholder="" size="mini"></el-input>-->
                    <el-autocomplete
                      v-model="chart.height"
                      :fetch-suggestions="querySearch"
                      placeholder=""
                      size="mini"
                      popper-class="popper-z-index"
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

            <div class="right-box-sub-title">{{$t('dashboard.panel.chartForm.metric')}}</div>
            <div class="line-100"></div>

            <el-row  class="element-item" v-for="(elem, index) in elements" :key="'ele' + index">
              <chart-metric ref="chartTag"
                            :pointer="index"
                            :metric-list="metricList"
                            :metricCascaderList="metricCascaderList"
                            :count-total="elements.length"
                            @on-delete-target="deleteTarget"
                            @sub-save-ok="subOk"
                            @on-add-target-success="getTarget"
              ></chart-metric>

            </el-row>

            <button type="button" @click="addTarget" class="nz-btn nz-btn-size-normal nz-btn-style-light" style="margin-left: 1px;">
              <span class="top-tool-btn-txt">{{$t('dashboard.panel.chartForm.addMetric')}}</span>
            </button>

          </el-form>
        </el-scrollbar>

        <!--底部按钮-->
        <div class="right-box-bottom-btns">
          <button @click="esc" id="chart-box-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
            <span>{{$t('overall.cancel')}}</span>
          </button>
          <button @click="confirmAdd" id="chart-box-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
            <span>{{$t('overall.save')}}</span>
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
  import bus from '../../../libs/bus';
  import ChartMetric from "./chartMetric";

  export default {
    name: "chartBox",
    props: {
      panelData: Array
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
          elements:{
            id: '',
            expression: '',
            type: ''
          },
          panel: ''
        },
        rules: {
          title: [
            {required: true,  message: this.$t('validate.required'),  trigger: 'blur'}
          ]
          /*
           heigh: [
             {required: true, message: this.$t('validate.required'), trigger: 'blur'}
           ]
           */
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
          }
        ],
        elements: [1], // 指标部分 tarNum
        elementTarget: [], // 本地保存数据
        spanList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        // 是否为编辑已有信息
        isedit: false,
        //productId: 0,//不需要这个参数，可以删除
        panelId: 0,
        panelName: '',
        selectFirstPanel: false,
        metricList: [], // metric列表
        metricCascaderList:[],//metric级联列表
        deleteIndex: '', // 要删除的指标模块
        subCount: 0, // subSave保存data到bus计数器
        panel: {
          id: '',
          name: ''
        },
        heightSuggestions:['300','400','500','600']
      }
    },
    components:{
      'chart-metric':ChartMetric,
    },
    methods: {
      show(show) {
        this.rightBox.show = show;
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
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("panel/"+this.panelId+"/charts?ids="+u.id).then(response => {
            if (response.code === 200) {
              this.esc();
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              //this.getTableData();//删除相关图表后，刷新面板数据---调用panel的方法刷新
              this.$refs.chartForm.resetFields();//清空表单
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
        this.rightBox.show = false;
        //this.editParamBox.show = false;
        this.$refs.chartForm.resetFields();//清空表单
        this.chart.id='';//不清除，再次打开创建图表，会显示删除按钮
      },

      /*metric部分相关方法--begin*/
      // 增加指标,tarNum
      addTarget() {
        this.elements.push(1);
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
      },
      // subSave保存成功后回调,第二步
      subOk() {
        // 每个模块均有返回,当全部模块返回完成时,将sub计数器重置
        //alert('box第二步，subCount和元素个数一样了，就从deleteIndex开始删除一个元素，this.subCount='+this.subCount);
        this.subCount += 1;
        if (this.subCount === this.elements.length) {
          this.subCount = 0;
          // 保存完成,进行删除操作
          //alert('box第二步，deleteIndex='+this.deleteIndex+'=开始删除一个元素')
          //alert('box第二步，删除之前，elements='+JSON.stringify(this.elements)+'  elementTarget='+JSON.stringify(this.elementTarget)+'  bus='+JSON.stringify(bus.chartAddInfo.metricTarget));
          this.elements.splice(this.deleteIndex, 1);
          this.elementTarget.splice(this.deleteIndex, 1);//没有作用，此处是[]
          bus.chartAddInfo.metricTarget.splice(this.deleteIndex, 1);
          //alert('box第二步，删除完毕，elements='+JSON.stringify(this.elements)+'  elementTarget='+JSON.stringify(this.elementTarget)+'  bus='+JSON.stringify(bus.chartAddInfo.metricTarget));
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
      // 新建图表
      addCharts(params) {
        this.$post('panel/'+this.panelId+'/charts', params).then(response => {
          if (response.code === 200) {
            this.esc();
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.$refs.chartForm.resetFields();//清空表单
            let panel = this.panelData.find(p => p.id === this.panelId);
            this.$emit('on-create-success', 'create', response.data,params, panel);
          } else {
            this.$message.error(response.msg);
          }
        });
      },
      // 更新图表
      updateCharts(params) {
        this.$put('panel/'+this.panelId+'/charts', params).then(response => {
          if (response.code === 200) {
            this.esc();
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.$refs.chartForm.resetFields();//清空表单
            this.$emit('on-create-success', 'update', response.data,params);
          } else {
            this.$message.error(response.msg);
          }
        });
      },
      // 获取每个tag组件内部校验后数据,点击生成图表时触发
      getTarget(target) {
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
            };

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
                });
              }else if(elem.type==='expert'){
                elements.push({
                  //id:index+1,
                  //metric: elem.metric,//指标名称
                  expression: elem.expression,//指标对应Label及Value组成的表达式字符串
                  type:elem.type,//指标类型
                });
              }
            });
            params.elements = elements;
            if (valid) {
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
      // 生成图表
      confirmAdd() {
        this.elementTarget = []; // 初始化清空参数
        this.$refs.chartTag.forEach((item, index) => {//循环指标列表
          // 触发每个tag组件内部进行校验
          item.saveTarget(index);
        });
        this.$refs.chartForm.validate();
      },

      // 获取metric列表
      getSuggestMetric() {
        //this.$get('metric', {pageNo: 1, pageSize: -1}).then(response => {
        this.$get('/prom/api/v1/label/__name__/values').then(response => {
          //if (response.code === 200) {
          if (response.status === 'success') {
            this.metricList = response.data;
            const cascaderMap = new Map();
            this.metricList.forEach((item,index) => {
              let arr = [];
              let par = '';//父value
              //let metricTmp = item.metric;//子value
              let metricTmp = item;//子value
              if(metricTmp){
                arr  = metricTmp.split('_');
                par = arr[0];
              }
              const childOption = {
                value: metricTmp,
                label: metricTmp,
              };
              if(cascaderMap.has(par)){
                cascaderMap.get(par).push(childOption);
              }else {
                let childArr = [];
                childArr.push(childOption);
                cascaderMap.set(par,childArr);
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
      // 编辑chart时使用, set_tdata
      editData(data, panelId) {
        //alert('data='+JSON.stringify(data)+"=="+panelId);
        this.panelId = panelId;
        this.isedit = true;
        //this.chartModal = true;
        this.editInfo = data;
        // 图表信息获取
        this.chart.id = data.id;
        this.chart.title = data.title;
        this.chart.span = data.span;
        this.chart.height = data.height;
        this.chart.type = data.type;
        this.getSuggestMetric();//获得指标列表
        // 指标
        this.elements = [];
        bus.chartAddInfo.metricTarget = [];
        data.elements.forEach((item, index) => {
          this.elements.push(index);
        });
        this.$nextTick(() => {
          const cSet = this.$refs.chartTag;
          // 派发charttag数据
          cSet.forEach((item, index) => {
            item.setMdata(data.elements[index]);
          });
        });
      },

      // 初始化信息
      initInfo() {
        this.chart.title = '';
        this.chart.type = 'line';
        this.chart.span = 12;
        this.chart.height = 400+'';
        this.elements = [1];
        this.elementTarget = [];
        bus.chartAddInfo.metricTarget = [];
      },
      // 创建时打开,用于清空chart-tag数据
      initOpen() {
        //bus.$emit('clear_history');
        /*  项目不需要produce
        if (this.$route.params.productId) {
          this.productId = parseInt(this.$route.params.productId, 10);
        }
        */
        this.getSuggestMetric();//this.getSuggestMetric(this.productId);
      },

      /*metric部分相关方法--end*/
      querySearch(queryString, cb) {
        var suggestions = this.heightSuggestions;
        // var results = queryString ? suggestions.filter(this.createFilter(queryString)) : suggestions;
        var results=queryString&&(suggestions.includes(queryString)||suggestions.filter(this.createFilter(queryString)).length>0)?suggestions:[];
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      createFilter(queryString) {
        return (suggestion) => {
          return (suggestion.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      handleSelect:function(item){
        this.chart.height=item;
      }
    },
    created() {

    },
    watch: {
      panelData: {
        deep: true,
        immediate: true,
        handler(n, o) {
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
</script>
<style>
  .popper-z-index{
    z-index: 99999999 !important;
  }
</style>

