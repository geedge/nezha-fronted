<style scoped>
  .prom {
    height: 100%;
  }
</style>
<template>
  <div class="prom">
    <left-menu >
    <div slot="content-left" class="slot-content">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="prom-jump-account">
          {{$t('config.account.account')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active">{{$t('config.promServer.promServerList')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('dc')" id="prom-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('model')" id="prom-jump-model">
          {{$t('config.model.model')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('mib')" id="prom-jump-mib">
          {{$t('config.mib.mib')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('system')" id="prom-jump-system">
          {{$t('config.system.system')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('terminallog')" id="prom-jump-terminallog">
          {{$t('config.terminallog.terminallog')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('operationlog')" id="account-jump-operation">
          {{$t('config.operationlog.operationlog')}}
        </div>
      </div>
    </div>
    <div slot="content-right"class="slot-content">
      <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': showSubList}">
        <div class="top-tools" v-show="mainResizeShow">
          <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': showSubList}">
            <div class="top-tool-search">
              <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" :inTransform="inTransform"></search-input>
            </div>
            <button type="button" @click="toAdd" :title="$t('overall.createPrometheusServer')"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="prom-add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </div>
          <div class="pagination-top pagination-top-hide display-none"></div>
        </div>
        <!--<div class="top-tools">
          <div class="top-tool-main-right">
            <div class="top-tool-search">
              <search-input :searchMsg="searchMsg" @search="search"></search-input>
            </div>
            <button @click="toAdd" class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20"  :title="$t('overall.createPrometheusServer')"
                    id="prom-add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
          </div>
        </div>-->
        <el-table :data="tableData" border v-show="mainResizeShow" :height="mainTableHeight" style="width: 100%;"
                  v-loading="loading" ref="promTable" class="nz-table" v-scrollBar:el-table="'large'">
          <el-table-column :resizable="false" v-for="(item, index) in tablelable" v-if="item.show" :width="item.width"
                           :key="`col-${index}`" :label="item.label">
            <template slot-scope="scope" :column="item">
              <span v-if="item.prop == 'idc'" >{{scope.row[item.prop]?scope.row[item.prop].name:'-'}}</span>

              <span v-else-if="item.prop == 'type'">
                  {{scope.row[item.prop] == '1' ? 'Global' : ''}}
                  {{scope.row[item.prop] == '2' ? 'Per-Datacenter' : ''}}
              </span>
              <span v-else-if="item.prop == 'status'">
                <el-popover placement="right" width="200" trigger="hover" :content="$t('asset.assetStatPre')+(scope.row.checkTime?scope.row.checkTime:$t('asset.assetStatDown'))">
                  <div slot="reference" style="width: 20px">
                    <div :class="{'active-icon green':scope.row[item.prop] == '1','active-icon red':scope.row[item.prop] == '0' || scope.row[item.prop] == '-1' || scope.row[item.prop] == '-2'}"></div>
                  </div>
                </el-popover>
              </span>
              <div v-else-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'prom-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
                &nbsp;
                <span :title="$t('overall.edit')" @click="toEdit(scope.row)" class="content-right-option" :id="'prom-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
                &nbsp;
                <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'prom-del-'+scope.row.id"><i class="el-icon-delete"></i></span>
              </div>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <template v-else>-</template>
            </template>
          </el-table-column>
          <el-table-column width="28" :resizable="false">
            <template slot="header" slot-scope="scope">
              <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
                <i class="nz-icon nz-icon-gear"></i>
              </span>
            </template>
            <template v-slot="scope">
              <button v-if="scope.$index == 0" class="to-top" :style="{top: toTopBtnTop}" :class="{'to-top-is-hover': tableHover}" v-show="showTopBtn && mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bottom" v-show="!showSubList">
          <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>
      </div>
      <bottom-box v-if="showSubList" :show-sub-list="showSubList" :subResizeShow="subResizeShow" :obj="promServer" :isFullScreen="isFullScreen" :from="'promServer'" :targetTab.sync="targetTab" :detail="promDetail"
                  @closeSubList="showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
    </div>
    </left-menu>
    <transition name="right-box">
      <div class="right-box right-box-prom" v-if="rightBox.show" v-clickoutside="clickos">
        <!-- begin--顶部按钮-->
        <div class="right-box-top-btns">
          <button type="button" v-if="rightBox.isEdit && promServer.id != ''" @click="del(promServer)"
                  id="prom-edit-del"
                  class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
            <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
            <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
          </button>
          <button v-if="!rightBox.isEdit" type="button" @click="saveOrToEdit"
                  class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82"
                  id="prom-edit-save">
            <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-edit"></i></span>
            <span class="right-box-top-btn-txt">{{$t('overall.edit')}}</span>
          </button>
        </div>
        <!-- end--顶部按钮-->

        <!-- begin--标题-->
        <div class="right-box-title">{{rightBox.title}}</div>
        <!-- end--标题-->

        <!-- begin--表单-->
        <el-scrollbar class="right-box-form-box">
          <el-form class="right-box-form" :model="promServer" label-position="top" label-width="80px" :rules="rules"
                   ref="promServerForm">
            <!--DC start-->
            <el-form-item :label="$t('config.dc.dc')" prop="idc.name">
              <div class="right-box-form-content">
                <el-select  value-key="id" popper-class="config-dropdown"
                            v-model="promServer.idc" placeholder="" v-if="rightBox.isEdit" size="small">
                  <el-option @click.native="blurEditIdc()" v-for="item in idcData" :key="item.id" :label="item.name"
                             :value="item" :id="'prom-edit-idc-op-'+item.id">
                    <span class="config-dropdown-label-txt">{{item.name}}</span>
                  </el-option>
                </el-select>
                <div class="right-box-form-content-txt" v-if="!rightBox.isEdit">{{promServer.idc.name}}</div>
              </div>
            </el-form-item>
            <!--DC end-->

            <!--host-->
            <el-form-item label="Host" prop="host">
              <el-input type="text" v-if="rightBox.isEdit" placeholder="" v-model="promServer.host"
                        size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{promServer.host}}</div>
            </el-form-item>
            <!--Port-->
            <el-form-item label="Port" prop="port">
              <el-input type="text" v-if="rightBox.isEdit" placeholder="" v-model.number="promServer.port"
                        size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{promServer.port}}</div>
            </el-form-item>
            <!--type-->
            <el-form-item :label="$t('config.promServer.type')" prop="type">
              <el-select popper-class="config-dropdown" v-model="promServer.type" placeholder="" v-if="rightBox.isEdit"
                         size="small">
                <el-option v-for="item in typeData" :key="item.key" :label="item.value" :value="item.key"
                           :id="'prom-edit-type-op-'+item.key"></el-option>
              </el-select>
              <div v-for="item in typeData" v-if="!rightBox.isEdit && item.key == promServer.type"
                   :id="'prom-edit-type-op-del-'+item.key" class="right-box-form-content-txt">{{item.value}}
              </div>
            </el-form-item>
          </el-form>
        </el-scrollbar>
        <!-- end--表单-->

        <!--底部按钮-->
        <div class="right-box-bottom-btns">
          <button @click="esc" id="prom-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
            <span>{{$t('overall.cancel')}}</span>
          </button>
          <button v-if="rightBox.isEdit" @click="saveOrToEdit" id="prom-save"
                  class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
            <span>{{$t('overall.save')}}</span>
          </button>
        </div>
      </div>
    </transition>
    <element-set
      v-clickoutside="elementsetHide"
      :table-title="tableTitle"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      ref="elementset"
    ></element-set>
  </div>

</template>
<script>
  import {host} from '../../common/js/validate';
  import {port} from '../../common/js/validate';
  import bus from '../../../libs/bus';
  var vm;
  export default {
    name: "prom",
    data() {
      vm = this;
      return {
        //底部上滑框相关
        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        showSubList: false, //是否展示二级列表
        targetTab: '', //展示二级列表中的哪个页签
        showElementSet: false, //控制自定义列的弹框
        inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        mainResizeShow: true, //dom高度改变时部分内容是否展示
        subResizeShow: true,
        isFullScreen: false,
        promDetail: [],
        //底部上滑框相关end

        toTopBtnTop: this.$tableHeight.toTopBtnTop, //to-top按钮的top属性
        tableHover: false, //控制滚动条和top按钮同时出现

        tableId: 'promTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
        rightBox: { //弹出框相关
          show: false,
          isEdit: false, //false查看，true编辑
          title: ''
        },
        loading: false,
        promServer: {
          id: '',
          host: '',
          port: 9090,
          idc: {id: '', name: '', location: ''}
        },
        rules: {
          'idc.name': [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
          host: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'},
            {validator: host, trigger: 'blur'}
          ],
          port: [
            {validator: port, trigger: 'blur'},
            {required: true, message: this.$t('validate.required')}
          ],
          type: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'},
          ]
        },
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        tableTitle: [
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: 'DC',
            prop: 'idc',
            show: true,
          }, {
            label: 'Host',
            prop: 'host',
            show: true,
          }, {
            label: 'Port',
            prop: 'port',
            show: true,
          }, {
            label: this.$t("config.promServer.type"),
            prop: 'type',
            show: true,
          }, {
            label: this.$t('asset.createAssetTab.state'),
            prop: 'status',
            show: true
          }, {
            label: this.$t('config.promServer.checkTime'),
            prop: 'checkTime',
            show: false
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tablelable: [],
        dropCol: [],
        tableData: [],
        idcData: [],
        typeData: [
          {
            key: 1,
            value: 'Global'
          }, {
            key: 2,
            value: 'Per-Datacenter'
          }
        ],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 5,
            name: 'DC',
            type: 'dc',
            label: 'dc',
            disabled: false
          }, {
            id: 6,
            name: this.$t('config.promServer.type'),
            type: 'select',
            label: 'promType',
            disabled: false
          }, {
            id: 8,
            name: this.$t('project.endpoint.host'),
            type: 'input',
            label: 'host',
            disabled: false
          }, {
            id: 9,
            name: this.$t('project.endpoint.port'),
            type: 'input',
            label: 'port',
            disabled: false
          }],
        },
        searchLabel: {}, //搜索参数
        idcSelectedData: {
          id: '',
          name: '',
          location: '',
          principal: '',
          tel: ''
        },
        addIdcData: {
          id: '',
          name: '',
          location: '',
          principal: '',
          tel: ''
        },
        popIdcData: {
          id: '',
          name: '',
          location: '',
          principal: '',
          tel: ''
        },
        idcUserData: '',
      }
    },
    methods: {
      // 全屏
      fullScreen() {
        this.$bottomBoxWindow.fullScreen(vm);
      },
      // 退出全屏
      exitFullScreen() {
        this.$bottomBoxWindow.exitFullScreen(vm);
      },
      // 鼠标拖动二级列表
      listResize(e) {
        this.$bottomBoxWindow.listResize(vm, e);
      },
      convertToDetail(obj) {
        let detail = [];
        detail.push({label: this.$t("config.dc.dc"), value: obj.idc.name});
        detail.push({label: "Host", value: obj.host});
        detail.push({label: "Port", value: obj.port});
        let type = "";
        for (let i = 0; i < this.typeData.length; i++) {
          if (obj.key == this.typeData[i].type) {
            type = this.typeData[i].value;
            break;
          }
        }
        detail.push({label: this.$t('config.promServer.type'), value: type});
        detail.push({
          label: this.$t('asset.createAssetTab.state'),
          value: obj.status,
          type: 'status',
          msg: this.$t('asset.assetStatPre')+(obj.checkTime ? obj.checkTime : this.$t('asset.assetStatDown'))
        });
        return detail;
      },
      elementsetShow(s, e) {
        var eventfixed = {
          shezhi: 0,
          screen: 0
        };
        eventfixed[s] = 1;
        e.preventDefault();
        this.$store.commit('setHeaderTable', this.tablelable);
        this.$store.commit('setEventfixed', eventfixed);
        const h = document.documentElement.clientHeight;
        const w = document.documentElement.clientWidth;
        const dw = this.$refs.elementset.$el.offsetWidth;
        const dh = this.$refs.elementset.$el.offsetHeight;
        let positionx =
          e.clientX + dw <= w - 10 ? e.clientX + 14 : e.clientX + 14 - dw;
        let positiony =
          e.clientY + dh <= h - 10
            ? e.clientY + 20
            : e.clientY + 20 - (e.clientY + dh - h);
        this.$store.commit('setPosition', {positionx, positiony});
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        this.$refs.elementset.elementsetHide();
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
      },
      clickos() {
        this.rightBox.show = false;
      },
      toEdit: function (u) {
        this.promServer = Object.assign({}, u);
        this.rightBox.isEdit = true;
        this.rightBox.title = this.$t("config.promServer.editProm") + "  ID：" + u.id;
        this.rightBox.show = true;
      },
      del: function (u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("promServer?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      detail: function (u) {
        this.promServer = Object.assign({}, u);
        /*this.rightBox.isEdit = false;
        this.rightBox.title = "Prometheus Server ID：" + u.id;
        this.rightBox.show = true;*/
        this.targetTab = "detail";
        this.showSubList = true;
      },
      toAdd: function () {
        this.cleanPromServer();
        this.rightBox.isEdit = true;
        this.rightBox.title = this.$t("config.promServer.createProm");
        this.rightBox.show = true;
      },
      save: function () {
        this.$refs.promServerForm.validate((valid => {
          if (valid) {
            if (this.promServer.id) {
              this.$put('promServer', this.promServer).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.getTableData();
                  this.rightBox.isEdit = false;
                  this.esc();
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('promServer', this.promServer).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.getTableData();
                  this.rightBox.isEdit = false;
                  this.esc();
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            return false;
          }
        }))
      },
      saveOrToEdit: function () {
        if (!this.rightBox.isEdit) {
          this.toEdit(this.promServer);
        } else {
          this.save();
        }
      },
      toEditIdc: function (item) {
        if (!item.isEdit) {
          //如果不在编辑状态，那么其他项如果有改动，则还原改动，最后开始编辑
          this.blurEditIdc();
          item.isEdit = true;
        } else {
          //如果已在编辑状态，判断name是否有变更，有变更则发请求
          if (item.name != item.oldName) {
            this.$put('idc', item).then(response => {
              if (response.code === 200) {
                item.errorMessage = '';
                item.oldName = item.name;
                item.isEdit = false;
                this.getIdcData();
              } else {
                this.$set(item, 'errorMessage', response.msg);
              }
            })
          } else {
            item.errorMessage = '';
            item.isEdit = false;
          }
        }
      },
      blurEditIdc: function () {
        for (var i = 0; i < this.idcData.length; i++) {
          if (this.idcData[i].isEdit) {
            this.idcData[i].name = this.idcData[i].oldName;
            this.idcData[i].isEdit = false;

            this.idcData[i].errorMessage = '';
            break;
          }
        }
      },
      toDelIdc: function (item) {
        this.blurEditIdc();
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("idc?ids=" + item.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
              this.getIdcData();
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      getIdcData: function () {
        this.$get('idc', this.pageObj).then(response => {
          if (response.code === 200) {
            this.idcData = response.data.list;
            for (var i = 0; i < this.idcData.length; i++) {
              this.$set(this.idcData[i], 'oldName', this.idcData[i].name);
              this.$set(this.idcData[i], 'isEdit', false);
              this.$set(this.idcData[i], this.idcData[i].name, false)
            }
            this.getTableData();
          }
        })

      },
      esc: function () {
        this.rightBox.show = false;
      },
      jumpTo(data, id) {
        bus.$emit("menu-change", data);
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      getTableData: function () {
        this.tableData = [];
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.loading = true;
        this.$get('promServer', this.searchLabel).then(response => {
          this.loading = false;
          if (response.code === 200) {
            for (var i = 0; i < response.data.list.length; i++) {
              for (var j = 0; j < this.idcData.length; j++) {
                if (response.data.list[i].idcId == this.idcData[j].id) {
                  response.data.list[i].idc = Object.assign({}, this.idcData[j]);
                  break;
                }
              }
            }
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
      },
      cleanPromServer: function () {
        this.promServer = {
          id: '',
          host: '',
          port: 9090,
          idcId: '',
          idc: {id: '', name: '', location: ''}
        }
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getTableData();
      },
      search: function (searchObj) {
        this.pageObj.pageNo = 1;
        this.searchLabel = {};
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getTableData();
      },
      addNewData(type) {
        if (type === 'IDC') {
          this.$post('idc', this.addIdcData).then(res => {
            if (res.code === 200) {
              const h = this.$createElement;
              this.$notify({
                message: h('i', {style: 'color: teal'}, '添加成功'),
                duration: 2000
              });
              this.getIdcData()
            } else {
              const h = this.$createElement;
              this.$notify({
                message: h('i', {style: 'color: teal'}, res.msg),
                duration: 2000
              });
            }
          })
        }
      },
      getSingleIDCData(data, item) {
        if (item !== 'edit') {
          this.idcSelectedData = '';
          this.idcData.forEach(item => {
            if (item.id === data) {
              this.idcSelectedData = item
            }
          });
        } else {
          this.idcData.forEach(item => {
            if (item.id === data) {
              this.popIdcData.name = item.name
              this.popIdcData.location = item.location
              this.popIdcData.principal = item.principal
              this.popIdcData.tel = item.tel
            }
          });
        }
      },
      getUserData() {
        this.$get('sys/user/list').then(response => {

          if (response.code === 200) {
            this.idcUserData = response.data.list
          }
        })
      },
      editData(data, id, item) {
        item.id = id;
        this.$put(data, item).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '修改成功'),
              duration: 2000
            })
          } else {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            })
          }
        })
      },
      closeAllPop: function () {
        this.$refs.idcConfigBox.forEach((item) => {
          item.show(false)
        })
      },
    },
    mounted: function () {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize
      }

      this.getIdcData();
      this.getUserData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.promTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });
          el.addEventListener("mouseenter", () => {
            this.tableHover = true;
          });
          el.addEventListener("mouseleave", () => {
            this.tableHover = false;
          });
        }
      });
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    },

    watch: {
      'promServer.idc': function (n, o) {
        this.promServer.idcId = n.id;
      },
      promServer: {
        deep: true,
        handler(n) {
          this.promDetail = this.convertToDetail(n);
        }
      },
      showSubList(n) {
        this.$bottomBoxWindow.showSubListWatch(vm, n);
      }
    }
  }
</script>
