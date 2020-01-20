<style lang="scss">
  @import 'metricSet';
</style>
<template>
  <div class="metric-set"  >
    <div class="metric-form">
      <el-row class="element-item" >
          <chart-metric ref="chartTag"
          :metric-list="metricList"
          :metricCascaderList="metricCascaderList"
          @on-add-target-success="getTarget"
          @on-change-condition="getCondition"
          ></chart-metric>
      </el-row>
      
      <el-row class="pt-5 pb-5 ml-3">

        <button type="primary" @click="preview" :disabled="loading" class="nz-btn nz-btn-size-normal nz-btn-style-normal ">{{$t('dashboard.metric.previewChart')}}</button>
        <button :disabled="saveDisabled || loading" type="primary" @click="preview('change')"
                :class="{'nz-btn nz-btn-disabled nz-btn-size-normal nz-btn-style-light nz-btn-min-width-75 btn-disabled-cursor-not-allowed' : (saveDisabled || loading), 'nz-btn nz-btn-size-normal nz-btn-style-normal' : !(saveDisabled || loading)}"
        >{{chartSwitchWord}}</button>
        
        <!-- <Button type="primary" @click="addTarget">添加指标</Button> -->
      </el-row>

      <el-row class="operate-area">
        <div class="operate-area-title">{{$t('dashboard.metric.saveChartToPanel')}}:</div>

        <button :disabled="saveDisabled" type="primary" @click="createNew"
                :class="{'nz-btn nz-btn-disabled nz-btn-size-normal nz-btn-style-light  btn-disabled-cursor-not-allowed' : saveDisabled , 'nz-btn nz-btn-size-normal nz-btn-style-normal' : !saveDisabled}"
        >{{$t('dashboard.metric.createPanel')}}</button>
        <button :disabled="saveDisabled" type="primary" @click="selectPanel"
                :class="{'nz-btn nz-btn-disabled nz-btn-size-normal nz-btn-style-light nz-btn-min-width-75 btn-disabled-cursor-not-allowed' : saveDisabled , 'nz-btn nz-btn-size-normal nz-btn-style-normal' : !saveDisabled}"
        >{{$t('dashboard.metric.selectPanel')}}</button>

      </el-row>

      <el-row class="mt-10">
        <el-checkbox :disabled="saveDisabled" v-model="isSave">options</el-checkbox>
      </el-row>
      <el-form :model="chartInfo" ref="chartInfo" v-show="isSave">
        <el-row>
          <div class="common-float-left">
            <el-form-item  label-width="80px" :label="$t('dashboard.panel.chartForm.width')" prop="span"
            :rules="{ required: true, type: 'number', trigger: 'change' }">
              <el-select class="w-select" size="small" v-model="chartInfo.span" transfer>
                <el-option v-for="item in spanList" :key="item" :label="'span-' + item" :value="item">
                  span-{{item}}
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-row>
        <el-row>
          <div class="common-float-left">
            <el-form-item label-width="80px" :label="$t('dashboard.panel.chartForm.high')" prop="height"
            :rules="{ required: true, type: 'number', trigger: 'change' }">

              <el-input-number :min="400" size="small" v-model="chartInfo.height" class="w-select" placeholder=""></el-input-number>px

            </el-form-item>
          </div>
        </el-row>
        <el-row>
          <div class="common-float-left">
            <el-form-item  label-width="80px" :label="$t('dashboard.panel.chartForm.type')" prop="type"
              :rules="{ required: true,   trigger: 'change' }">
              <el-select transfer class="w-select" v-model="chartInfo.type" size="small">
                <el-option v-for="item in typeList"
                  :key="item.id" 
                  :label="item.name" 
                  :value="item.id">
                  {{item.name}}
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-row>
      </el-form>
    </div>
    <metric-pre-panel-box :chartInfo="chartInfo"  :elementTarget="elementTarget" :seriesData="seriesData" :series="series" :chartCount="chartCount" @reload="reload"  ref="panelBox"></metric-pre-panel-box>

  </div>
</template>
<script>
//import axios from 'axios';
import bus from '../../../libs/bus';
import chartMetric from "./chartMetricForPreview";
import metricPrePanelBox from "../../common/rightBox/metricPrePanelBox";

export default {
  name: 'metricSet',
  props: {
  },
  components: {
    'chart-metric':chartMetric,
    'metric-pre-panel-box':metricPrePanelBox
  },
  data() {
    return {
      total: 0,
      loading: false, // 加载中
      chartModal: false, // 展示弹出框
      // 新建信息
      chartInfo: {
        title: '', // 名称
        span: 12, // 宽度
        height: 400, // 高度
        type: 'line', // 类型
      },
      chartId: 0,
      elements: [1], // 指标部分 tarNum
      elementTarget: {}, // 获取chartTag数据后保存
      // 宽度列表
      spanList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      typeList: [
        {
          id:"line",
          name:this.$t("dashboard.panel.chartForm.typeVal.line.label")
        },
        {
          id:"bar",
          name:this.$t("dashboard.panel.chartForm.typeVal.bar.label")
        }
      ],
      //productId: 0,
      panelId: 0,
      metricList: [], // metric列表
      metricCascaderList:[],//metric级联列表
      isSave: false, // 是否要保存
      saveDisabled: true, // 不可保存
      createModal: false, // 创建看板panel
      panelList: [],
      // 创建看板信息
      chartSaveInfo: {
        title: '', // 图表名称
        name: '', // panel名称
        panelId: '', // 选择以后panelId
      }, // 保存看板
      isCreatePanel: false,
      createModalTitle: '',
      chartCount: 'single', // multiple多图,single单图
      metricInfo: {}, // 保存从chartTag中获取的seriesData
      createChartList: [], // 创建多个图表的图表信息
      seriesData: [], // 查询图表后生成的series信息,用于生成多个图表时提供图表title
      series:[],//组织好的数据
      panelItem: {}, // 保存看板信息
    };
  },
  computed: {
    chartSwitchWord() {
      const word = this.chartCount === 'single' ? this.$t('dashboard.metric.multiChartsShow'): this.$t('dashboard.metric.singleChartShow');
      return word;
    },
  },
  watch: {},
  methods: {
    // 父级调用保存series,作为多个图表生成title
    setSeries(data,series) {
      this.seriesData = data;
      this.series = series;
    },
    // 默认打开
    initOpen() {
      this.getSuggestMetric();
    },
    // chart-tag中条件更改时,触发不能创建
    getCondition() {
      this.saveDisabled = true;
    },
    reload(){
      this.saveDisabled = true;
      this.elementTarget = {};
    },
    // 创建看板
    createNew() {
      this.$refs.panelBox.show(true);
      //this.panel = {id: '', name: ''};
      this.$refs.panelBox.setTitle(this.$t("dashboard.panel.createPanelTitle"));
      this.$refs.panelBox.setIsCreatePanel(true);
      this.$refs.panelBox.setChartTitle(this.metricInfo.metric);
    },
    // 选择看板
    selectPanel() {
      this.$refs.panelBox.show(true);
      this.$refs.panelBox.setTitle(this.$t("dashboard.panel.selectPanelTitle"));
      this.$refs.panelBox.setIsCreatePanel(false);
      this.$refs.panelBox.setChartTitle(this.metricInfo.metric);
      this.$refs.panelBox.getTableData();
    },
    /*
    // 取消创建modal
    cancel() {
      this.panelList = [];
      this.chartSaveInfo.panelId = ''; // 选择panel
      this.chartSaveInfo.name = ''; // panel名称创建
      if (this.$refs.chartSaveInfo) {
        this.$refs.chartSaveInfo.resetFields();
      }
      if (this.$refs.panelSelect) {
        this.$refs.panelSelect.reset();
      }
      this.createModal = false;
    },
    */
    /*
    // 重置已选择的看板
    initSaveInfo() {
      this.chartSaveInfo.name = ''; // panel名称创建
      this.chartSaveInfo.panelId = ''; // 选择panel
    },

    close() {
      this.elementTarget = {}; // 初始化清空参数
      this.initInfo();
      this.chartModal = false;
    },
    */
    // 初始化信息
    initInfo() {
      this.chartInfo.title = '';
      this.chartInfo.type = 1;
      this.chartInfo.span = 12;
      this.chartInfo.height = 400;
      this.elements = [1];
      this.elementTarget = {};
    },
    // 生成预览图表
    preview(params) {
      if (params === 'change') {
        this.chartCount = this.chartCount === 'single' ? 'multiple' : 'single';
      }
      this.elementTarget = {}; // 初始化清空参数
      // 触发每个tag组件内部进行校验
      this.$refs.chartTag.saveTarget(); // => getTartget
      // 保存图表时进行参数认证
      if (this.isSave) {
        this.$refs.chartInfo.validate();
      }
    },
    // 获取每个tag组件内部校验后数据,点击生成图表时触发
    getTarget(target) {
      // 由于条件限制，每次其实只有一个target
      this.elementTarget = JSON.parse(JSON.stringify(target));
      this.$refs.chartInfo.validate((valid) => {
        if (valid) {
          this.loading = true;
          // 保存图表到看板
          const params = Object.assign({}, this.chartInfo);

          //params.tags = this.tagsToString(this.elementTarget.tagList);
          const elements = [];
          //params.elementTargetType = this.elementTarget.type;
          if(this.elementTarget.type==='normal'){
            const metricStr = bus.tagsToString(this.elementTarget.metric,this.elementTarget.selectedTagList);
            //params.expression = metricStr;
            elements.push({
              expression: metricStr,
              type: this.elementTarget.type,
            });
            params.metric = this.elementTarget.metric;
          }else if(this.elementTarget.type==='expert'){
            //params.expression = this.elementTarget.expression;
            elements.push({
              expression: this.elementTarget.expression,
              type: this.elementTarget.type,
            });
            params.metric = this.elementTarget.expression;
          }
          params.elements = elements;
          //params.expression
          this.metricInfo = params;
          this.saveDisabled = false; // 查询成功以后,可以进行保存操作
          // 将参数返回,进行查询
          this.$emit('on-view-chart', params, this.chartCount);
        }
      });
    },
    /*
    // 确认创建图表
    createConfirm() {
      this.$refs.chartInfo.validate((valid) => {
        if (valid) { // 先判断参数正确与否
          this.$refs.chartSaveInfo.validate((flag) => {
            if (flag) { // 再判断弹出窗口内内容是否正确
              if (this.isCreatePanel) { // 创建看板
                this.addPanels();
              } else { // 选择看板
                this.panelId = this.chartSaveInfo.panelId;
                this.getOptions();
              }
            }
          });
        }
      });
    },
    // 创建看板接口
    addPanels() {
      addPanels({
        productId: this.productId,
        name: this.chartSaveInfo.name,
      }).then((res) => {
        if (res.status === 200 && res.data.code === 200) {
          this.panelId = res.data.panel.id;
          this.panelItem = res.data.panel;
          this.getOptions();
        } else {
          this.$Message.warning('创建看板失败');
        }
      });
    },

    // 选择看板
    panelSelect(id) {
      if (id) {
        const panel = this.panelList.find(p => p.id === id);
        if (panel) {
          this.panelItem = panel;
        }
      }
    },
    */
    /*
    // 生成图表的时候,使用该函数,汇总创建图表参数
    getOptions() {
      this.$refs.chartInfo.validate((valid) => {
        const params = {
          productId: this.productId,
          panelId: this.panelId,
          // title: this.chartSaveInfo.title,
          type: this.chartInfo.type,
          span: this.chartInfo.span,
          height: this.chartInfo.height,
        };
        // 多图模式
        if (this.chartCount === 'multiple') {
          this.createChartList = [];
          this.seriesData.forEach((queryItem) => {
            const soleParam = Object.assign({}, params);
            const elements = [];
            let tagStr = ''; // tag字符串
            let host = `${queryItem.metric}, `; // 名称
            const tagsArr = Object.keys(queryItem.tags);
            // 根据图表展示时获取的tag进行组装名称以及tag字符串
            tagsArr.forEach((tag) => {
              if (tag !== 'uuid') {
                host += `${tag}=${queryItem.tags[tag]}, `;
                if (tagStr) {
                  tagStr += `,${tag}=${queryItem.tags[tag]}`;
                } else {
                  tagStr += `${tag}=${queryItem.tags[tag]}`;
                }
              }
            });
            // 图表中每条线的名字,去掉最后的逗号与空格
            host = host.substring(0, host.length - 2);
            soleParam.title = host;
            elements.push({
              metric: this.elementTarget.metric,
              tags: tagStr,
            });
            soleParam.elements = elements;
            if (valid) {
              this.addMultipleChart(soleParam);
            }
          });
        } else if (this.chartCount === 'single') {
          params.title = this.chartSaveInfo.title;
          const elements = [];
          const tagStr = this.tagsToString(this.elementTarget.tagList);
          elements.push({
            metric: this.elementTarget.metric,
            tags: tagStr,
          });
          params.elements = elements;
          if (valid) {
            this.addCharts(params);
          }
        }
      });
    },
    // 新建单个图表single
    addCharts(params) {
      addCharts(params).then((res) => {
        if (res.status === 200) {
          if (res.data.code === 200) {
            this.$Message.success('添加成功');
            this.createModal = false;
            this.elementTarget = {};
            this.saveDisabled = true; // 创建成功后,不能再次创建
            // this.initInfo();
            this.$Modal.confirm({
              title: '创建成功',
              content: `是否前去看板：${this.panelItem.name}，查看创建的图表`,
              onOk: () => {
                this.$router.push({
                  path: `/console/panel/detail/${this.panelId}/${this.productId}`,
                  query: {
                    product: this.$route.query.product,
                    panel: this.panelItem.name,
                  },
                });
              },
              onCancel: () => {
                this.cancel();
              },
            });
          } else {
            this.$Message.error(`创建失败：${res.data.message || res.statusText}`);
          }
        }
      });
    },
    // 创建多个图表
    addMultipleChart(params) {
      this.createChartList.push(params);
      if (this.seriesData.length === this.createChartList.length) {
        const api = [];
        this.createChartList.forEach((item) => {
          api.push(addCharts(item));
        });
        axios.all(api).then((res) => {
          let successFlag = true;
          res.forEach((item) => {
            if (item.data.code !== 200) {
              successFlag = false;
            }
          });
          if (successFlag) {
            this.saveDisabled = true; // 创建成功后,不能再次创建
            this.$Message.success('添加成功');
            this.createModal = false;
            this.elementTarget = {};
            this.createChartList = [];
            this.$Modal.confirm({
              title: '创建成功',
              content: `是否前去看板：${this.panelItem.name}，查看创建的图表`,
              onOk: () => {
                this.$router.push({
                  path: `/console/panel/detail/${this.panelId}/${this.productId}`,
                  query: {
                    product: this.$route.query.product,
                    panel: this.panelItem.name,
                  },
                });
              },
            });
          } else {
            this.$Message.error('添加失败');
          }
        });
      }
    },

    // 增加指标,tarNum
    addTarget() {
      this.elements.push(1);
    },
    */
    // 获取metric列表
    getSuggestMetric(id) {
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
      return width;
    },
    /*
    // 创建打开
    createData(panelId) {
      this.panelId = panelId;
      this.elementTarget = {}; // 初始化清空参数
      this.initInfo(); // 初始化图表信息
      this.chartModal = true;
      this.initOpen(); // 获取metric
      this.elements = [1];
    },
    */
    /*
    tagsToString(arr) {
      let str = '';
      arr.forEach((item, index) => {
        if (index === 0) {
          str += item.value.indexOf('*') > -1 ? `${item.name}=*` : `${item.name}=${item.value.join('|')}`;
        } else {
          str += item.value.indexOf('*') > -1 ? `,${item.name}=*` : `,${item.name}=${item.value.join('|')}`;
        }
      });
      return str;
    },
    */
  },
  mounted() {
    this.initOpen();
    /*
    bus.$on('on-shrink-change', () => {
      this.preview();
    });
    */
  },
  beforeDestroy() {
    /*
    bus.$off('on-shrink-change');

     */
  },
};

</script>
