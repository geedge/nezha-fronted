<template key="metricPrePanelBox">
  <transition name="right-box">
    <div class="right-box right-box-panel z-top" v-if="rightBox.show">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button type="button" @click="save" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
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
      <div class="right-box-form">
          <el-form :model="chartSaveInfo" ref="chartSaveInfo">
            <el-form-item  label="Chart Name" prop="title" :rules="{ required: true, type: 'string', message: '请输入图表名称', trigger: 'change' }">
              <el-input size="small" maxlength="64" show-word-limit v-model="chartSaveInfo.title"></el-input>
            </el-form-item>
            <el-form-item v-if="isCreatePanel"  label="Panel Name" prop="name" :rules="{ required: true, type: 'string', message: '请输入看板名称', trigger: 'change' }">
              <el-input size="small" maxlength="64" show-word-limit v-model="chartSaveInfo.name"></el-input>
            </el-form-item>
            <el-form-item v-else  label="Select Panel" prop="panelId" :rules="{ required: true, type: 'number', message: '请选择看板', trigger: 'change' }">
              <el-select ref="panelSelect"  width="100%" v-model="chartSaveInfo.panelId"
                         popper-class="" placeholder="" size="small"
                         @change="panelSelect"
                         filterable>
                <el-option v-for="(item, index) in panelList"
                           :key="index"
                           :value="item.id"
                           :label="item.name">{{item.name}}</el-option>
              </el-select>
            </el-form-item>
          </el-form>
      </div>

      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <!--
      <div class="right-box-bottom-btns">
        <div @click="esc()" :class="{'right-box-bottom-btn-50': true}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div @click="save()"  class="right-box-bottom-btn right-box-bottom-btn-50">{{panel.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
      </div>
      -->
      <!-- end--底部按钮-->

    </div>
  </transition>
</template>
<script>
  import bus from '../../../libs/bus';
  export default {
    name: "metricPrePanelBox",
    props: {
      chartInfo: Object,
      elementTarget:Object,
      seriesData:Object,
      chartCount:Object
    },
    data() {
      return {
        rightBox: { //面板弹出框相关
          show: false,
          title: this.$t('dashboard.panel.createPanelTitle')
        },
        isCreatePanel: false,
        // 创建看板信息
        chartSaveInfo: {
          title: '', // 图表名称
          name: '', // panel名称
          panelId: '', // 选择以后panelId
        },
        panelList: [],
        panelItem: {}, // 保存看板信息
        panelId: 0,
        createChartList: [], // 创建多个图表的图表信息
      }
    },
    methods: {
      show(show) {
        this.rightBox.show = show;
      },
      setTitle(title) {
        this.rightBox.title = title;
      },
      setIsCreatePanel(isCreate) {
        this.isCreatePanel = isCreate;
      },
      setChartTitle(title){
        this.chartSaveInfo.title = title;
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
      // 生成图表的时候,使用该函数,汇总创建图表参数
      getOptions() {
        //this.$refs.chartInfo.validate((valid) => {
          const params = {
            //panelId: this.panelId,
            // title: this.chartSaveInfo.title,
            type: this.chartInfo.type,
            span: this.chartInfo.span,
            height: this.chartInfo.height,
          };
          // 多图模式
          if (this.chartCount === 'multiple') {
            this.createChartList = [];
            //alert(JSON.stringify(this.seriesData));
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
                expression: this.elementTarget.metric,
                type: this.elementTarget.type,
              });
              soleParam.elements = elements;
              //if (valid) {
                this.addMultipleChart(soleParam);
              //}
            });
          } else if (this.chartCount === 'single') {
            params.title = this.chartSaveInfo.title;
            const elements = [];
            if(this.elementTarget.type==='normal'){
              const metricStr = bus.tagsToString(this.elementTarget.metric,this.elementTarget.selectedTagList);
              elements.push({
                expression: metricStr,
                type: this.elementTarget.type,
              });
            }else if(this.elementTarget.type==='expert'){
              elements.push({
                expression: this.elementTarget.expression,
                type: this.elementTarget.type,
              });
            }
            params.elements = elements;
            //if (valid) {
              this.addCharts(params);
            //}
          }
        //});
      },
      // 新建单个图表single
      addCharts(params) {
        this.$post('panel/'+this.panelId+'/charts', params).then(response => {
          if (response.code === 200) {
            this.elementTarget = {};
            //this.saveDisabled = true; // 创建成功后,不能再次创建??
            this.$emit('reload');
            this.esc();
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            /*
            this.$confirm(this.$t("tip.confirmDelete"), {
              confirmButtonText: this.$t("tip.yes"),
              cancelButtonText: this.$t("tip.no"),
              type: 'warning'
            }).then(() => {

            });
            */
            /*
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
            */
          } else {
            this.$message.error(response.msg);
          }
        });
      },

      save: function() {
        this.$refs.chartSaveInfo.validate((flag) => {
          if (flag) { // 再判断弹出窗口内内容是否正确
            if (this.isCreatePanel) { // 创建看板
              this.panelItem.name = this.chartSaveInfo.name;
              this.$post('panel', this.panelItem).then(response => {
                if (response.code === 200) {
                  this.panelId = response.data.panel.id;
                  this.panelItem = response.data.panel;
                  this.getOptions();
                  //this.esc();
                  //this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  //this.$emit("reload");----询问是否去查看
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else { // 选择看板
              this.panelId = this.chartSaveInfo.panelId;
              this.getOptions();
            }
          }
        });
      },
      esc: function() {
        this.rightBox.show = false;
        // 取消创建modal
        this.panelList = [];
        this.chartSaveInfo.panelId = ''; // 选择panel
        this.chartSaveInfo.name = ''; // panel名称创建
        if (this.$refs.chartSaveInfo) {
          this.$refs.chartSaveInfo.resetFields();
        }
        if (this.$refs.panelSelect) {
          this.$refs.panelSelect.reset();
        }
      },
      getTableData: function() {
        this.$get('panel?pageNo=1&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.panelList = response.data.list;
          }else {
            this.panelList = [];
          }
        })
      },
    },
    created() {

    },
    mounted: function() {

    },
    watch: {

    }
  }
</script>


<style scoped>
  .z-top{
    z-index: 50;
  }
</style>
