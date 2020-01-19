
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
    margin-top:-25px;
  }
  /*metric样式--begin*/
  .element-item {
    padding-bottom: 20px;
    border-bottom: 1px dashed #dfe7f2;
  }
  /*metric样式--end*/
  .label-center{
    margin-top:6px;
  }
  .z-top{
    z-index: 50;
  }
</style>
<template key="chartBox">
  <transition name="right-box">
    <div class="right-box right-box-add-chart z-top" v-if="rightBox.show" >
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button type="button" v-if="chart.id != ''" @click="del(chart)" class="nz-btn nz-btn-size-normal nz-btn-style-light">
          <span class="top-tool-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button type="button" @click="confirmAdd" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
          <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
        </button>
        <button type="button" @click="esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
          <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box">
        <el-form class="right-box-form" :model="chart" label-position="top" :rules="rules" ref="chartForm">
          <el-form-item :label='$t("dashboard.panel.chartForm.chartName")' prop="title">
            <el-input size="mini" maxlength="64" show-word-limit v-model="chart.title"></el-input>
          </el-form-item>

          <el-row :gutter="10">
            <el-col :span="2" >
              <div class="label-center" >{{$t('dashboard.panel.chartForm.type')}}</div>
            </el-col>
            <el-col :span="4">
              <div class="grid-content ">
                  <el-form-item prop="type">
                    <el-select class="right-box-row-with-btn" value-key="chartType" popper-class="" v-model="chart.type" placeholder="" size="small">
                      <el-option v-for="item in chartTypeList" :key="item.id" :label="item.name" :value="item.id">
                        <span class="panel-dropdown-label-txt" >{{item.name}}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
              </div>
            </el-col>
            <el-col :span="2.1">
              <div class="label-center" >{{$t('dashboard.panel.chartForm.width')}}</div>
            </el-col>
            <el-col :span="5">
              <div class="grid-content ">
                <el-form-item prop="span">
                  <el-select class="right-box-row-with-btn" value-key="chartSpan" popper-class="" v-model="chart.span" placeholder="" size="small">
                    <el-option v-for="item in spanList" :key="item" :label="'span-' + item" :value="item">
                      <span class="panel-dropdown-label-txt" > span-{{item}}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
            </el-col>
            <el-col :span="2">
              <div class="label-center" >{{$t('dashboard.panel.chartForm.high')}}</div>
            </el-col>
            <el-col :span="8">
              <div class="grid-content ">
                <el-form-item  prop="heigh">
                  <el-input-number :min="400" label=""   v-model="chart.height" placeholder="" size="small"></el-input-number>px
                </el-form-item>
              </div>
            </el-col>
          </el-row>

          <el-row class="element-bottom-border" >
            <div >{{$t('dashboard.panel.chartForm.metric')}}</div>
          </el-row>

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

          <el-row :gutter="20">
            <el-col :span="20">
              <button type="button" @click="addTarget" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
                <span class="top-tool-btn-txt">{{$t('dashboard.panel.chartForm.addMetric')}}</span>
              </button>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="20">
             &nbsp;
            </el-col>
          </el-row>

        </el-form>
      </el-scrollbar>

      <!--
      <div class="right-box-form">

        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('dashboard.panel.chartForm.chartName')}}</div>
          <div class="right-box-form-content">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="chart.title" size="small"></el-input>
          </div>
        </div>

        <div class="right-box-form-row">
          <el-row :gutter="20">
            <el-col :span="8"><div class="grid-content bg-purple">1</div></el-col>
            <el-col :span="8"><div class="grid-content bg-purple">2</div></el-col>
            <el-col :span="8"><div class="grid-content bg-purple">3</div></el-col>
          </el-row>
        </div>

      </div>
      -->
      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <!--
      <div class="right-box-bottom-btns">
        <div @click="esc" class="right-box-bottom-btn right-box-bottom-btn-cancel right-box-bottom-btn-50">{{$t('overall.cancel')}}</div><div @click="save" class="right-box-bottom-btn right-box-bottom-btn-50">{{$t('overall.create')}}</div>
      </div>
      -->
      <!-- end--底部按钮-->

    </div>
  </transition>
</template>

<script>
  import bus from '../../../libs/bus';
  import ChartMetric from "./chartMetric";

  export default {
    name: "chartBox",
    props: {

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
          height:400,
          elements:{
            id: '',
            expression: '',
            type: ''
          }
        },
        rules: {
          title: [
            {required: true,  message: this.$t('validate.required'),  trigger: 'blur'}
          ],
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
        metricList: [], // metric列表
        metricCascaderList:[],//metric级联列表
        deleteIndex: '', // 要删除的指标模块
        subCount: 0, // subSave保存data到bus计数器
      }
    },
    components:{
      'chart-metric':ChartMetric
    },
    methods: {
      show(show) {
        this.rightBox.show = show;
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
            this.$emit('on-create-success', 'create', response.data,params);
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
        this.$get('metric', {pageNo: 1, pageSize: -1}).then(response => {
          if (response.code === 200) {
            this.metricList = response.data.list;
            const cascaderMap = new Map();
            this.metricList.forEach((item,index) => {
              let arr = [];
              let par = '';//父value
              let metricTmp = item.metric;//子value
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
                value: index,
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
      createData(panelId) {
        this.panelId = panelId;
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
        this.chart.height = 400;
        this.elements = [1];
        this.elementTarget = [];
        bus.chartAddInfo.metricTarget = [];
      },
      // 创建时打开,用于清空chart-tag数据
      initOpen() {
        bus.$emit('clear_history');
        /*  项目不需要produce
        if (this.$route.params.productId) {
          this.productId = parseInt(this.$route.params.productId, 10);
        }
        */
        this.getSuggestMetric();//this.getSuggestMetric(this.productId);
      },

      /*metric部分相关方法--end*/

    },
    created() {

    },
    watch: {

    }
  }
</script>

