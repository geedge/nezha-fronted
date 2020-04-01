<style scoped>
  .terminallog {
    height: 100%;
  }
</style>
<template>
  <div class="terminallog">
    <div class="content-left">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="prom-jump-account">
          {{$t('config.account.account')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('promServer')" id="account-jump-promserver">
          {{$t('config.promServer.promServerList')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('dc')" id="terminallog-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('model')" id="terminallog-jump-model">
          {{$t('config.model.model')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active" @click="jumpTo('terminallog')" id="terminallog-jump-terminallog">
          {{$t('config.terminallog.terminallog')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('mib')" id="terminal-jump-mib">
          {{$t('config.mib.mib')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('system')" id="terminal-jump-system">
          {{$t('config.system.system')}}
        </div>
      </div>
    </div>
    <div class="content-right">
      <div class="top-tools">
        <div></div>
        <div>
          <button type="button" @click="resize"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light float-right margin-l-20" id="terminal-resize">
                  <i class="nz-icon-maxview nz-icon" ></i>
          </button>
          <button type="button" @click="toDownload"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light float-right margin-l-20" id="terminal-download">
            <i class="el-icon-download"></i>
          </button>
          <button type="button" @click="toUpload"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light float-right margin-l-20" id="terminal-upload">
            <i class="el-icon-upload2"></i>
          </button>
          <div class="top-tool-search float-right">
            <search-input :searchMsg="searchMsg" @search="search"></search-input>
          </div>
        </div>
      </div>
      <el-table
        class="nz-table"
        :data="tableData"
        border
        ref="terminalLogTable"
        :height="$tableHeight.normal"
        v-scrollBar:el-table
        style="width: 100%;">
        <el-table-column
          :resizable="false"
          v-for="(item, index) in tablelable"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
        >
          <template slot-scope="scope" :column="item">
            <div v-if="item.prop == 'option'" class="content-right-options" style="text-align: center">
              <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'terminallog-detail-'+scope.row.id" ><i class="nz-icon nz-icon-view"></i></span>
            </div>
            <span v-else-if="item.prop == 'lang'">
                            {{scope.row[item.prop] == 'en' ? 'English' : ''}}
                            {{scope.row[item.prop] == 'zh' ? '中文' : ''}}
                            {{scope.row[item.prop] == 'ru' ? 'русский' : ''}}
                        </span>
            <span v-else-if="item.prop == 'status'">
                            <el-switch
                              v-model="scope.row.status"
                              active-value="1"
                              inactive-value="0"
                              active-color="#ee9d3f">
                            </el-switch>
                        </span>
            <span v-else>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
        <el-table-column width="28">
          <template slot="header" slot-scope="scope">
            <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      <button class="to-top" v-show="showTopBtn" @click="$toTop"><i class="nz-icon nz-icon-top"></i></button>
    </div>

    <transition name="right-box">
      <div class="right-box right-box-account" v-if="rightBox.show" v-clickoutside="clickos">
        <!-- begin--顶部按钮-->
        <div class="right-box-top-btns">
          <button type="button" v-if="terminallog.id != '' && rightBox.isEdit" @click="del(terminallog)"
                  class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82"
                  id="account-edit-del">
            <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
            <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
          </button>
        </div>
        <!-- end--顶部按钮-->

        <!-- begin--标题-->
        <div class="right-box-title">{{rightBox.title}}</div>
        <!-- end--标题-->

        <!-- overview--表单-->
        <el-scrollbar class="right-box-form-box">
          <el-form class="right-box-form" :model="terminallog" label-position="top" >
            <el-form-item :label="$t('config.terminallog.host')" prop="host">
              <el-input v-if="rightBox.isEdit" type="text" placeholder="" v-model="terminallog.host" size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{terminallog.host}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.terminallog.port')" prop="port">
              <el-input v-if="rightBox.isEdit" type="text" placeholder="" v-model="terminallog.port" size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{terminallog.port}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.terminallog.protocol')" prop="protocol">
              <el-input v-if="rightBox.isEdit" type="text" placeholder="" v-model="terminallog.protocol" size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{terminallog.protocol}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.terminallog.user')" prop="user">
              <el-input v-if="rightBox.isEdit" type="text" placeholder="" v-model="terminallog.user" size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{terminallog.user}}</div>
            </el-form-item>
            <el-form-item label="AuthType" prop="authType">
              <el-input v-if="rightBox.isEdit" type="text" placeholder="" v-model="terminallog.authType" size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{terminallog.authType}}</div>
            </el-form-item>
            <el-form-item label="UserName" prop="userName">
              <el-input v-if="rightBox.isEdit" type="text" placeholder="" v-model="terminallog.userName" size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{terminallog.userName}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.terminallog.cmd')" prop="cmd">
              <el-input v-if="rightBox.isEdit" type="text" placeholder="" v-model="terminallog.cmd" size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{terminallog.cmd}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.terminallog.enable')">
              <el-switch v-model="terminallog.status" active-color="#ee9d3f" active-value="1"
                         inactive-value="0">
              </el-switch>
            </el-form-item>
            <el-form-item :label="$t('config.terminallog.time')">
              <div class="right-box-form-content-txt">{{terminallog.time}}</div>
            </el-form-item>
          </el-form>
        </el-scrollbar>
        <!-- end--表单-->
        <!--底部按钮-->
        <div class="right-box-bottom-btns">
          <button @click="esc" id="account-esc"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
            <span>{{$t('overall.cancel')}}</span>
          </button>
        </div>
      </div>
    </transition>
    <!--resize-->
    <transition name="right-box-resize">
      <div class="right-box right-box-terminallog" v-if="rightBoxResize.show" v-clickoutside="clickos">
        <!-- end--顶部按钮-->

        <!-- begin--标题-->
        <div class="right-box-title">{{rightBoxResize.title}}</div>
        <!-- end--标题-->

        <!-- begin--表单-->
        <el-scrollbar class="right-box-form-box">
          <el-form class="right-box-form" :model="terminalConfig" label-position="top" ref="resizeRef" :rules="rules">
            <el-form-item :label="this.$t('config.terminallog.height')" prop="height">
              <el-input v-if="rightBoxResize.isAdd" type="text" placeholder="" v-model="terminalConfig.height" size="small"></el-input>
              <div v-if="!rightBoxResize.isAdd" class="right-box-form-content-txt">{{terminalConfig.height}}</div>
            </el-form-item>
            <el-form-item :label="this.$t('config.terminallog.width')" prop="width">
              <el-input v-if="rightBoxResize.isAdd" type="text" placeholder="" v-model="terminalConfig.width" size="small"></el-input>
              <div v-if="!rightBoxResize.isAdd" class="right-box-form-content-txt">{{terminalConfig.width}}</div>
            </el-form-item>
            <el-form-item :label="this.$t('config.terminallog.cols')" prop="cols">
              <el-input v-if="rightBoxResize.isAdd" type="text" placeholder="" v-model="terminalConfig.cols" size="small"></el-input>
              <div v-if="!rightBoxResize.isAdd" class="right-box-form-content-txt">{{terminalConfig.cols}}</div>
            </el-form-item>
            <el-form-item :label="this.$t('config.terminallog.rows')" prop="rows">
              <el-input v-if="rightBoxResize.isAdd" type="text" placeholder="" v-model="terminalConfig.rows" size="small"></el-input>
              <div v-if="!rightBoxResize.isAdd" class="right-box-form-content-txt">{{terminalConfig.rows}}</div>
            </el-form-item>
          </el-form>
        </el-scrollbar>
        <!-- end--表单-->
        <!--底部按钮-->
        <div class="right-box-bottom-btns">
          <button @click="esc" id="terminallog-esc-resize"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
            <span>{{$t('overall.cancel')}}</span>
          </button>
          <button v-if="rightBoxResize.isAdd" @click="save" id="terminallog-resize"
                  class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
            <span>{{$t('overall.save')}}</span>
          </button>
        </div>
      </div>
    </transition>

    <!--download-->
    <transition name="right-box-download">
      <div class="right-box right-box-terminallog" v-if="rightBoxDownload.show" v-clickoutside="clickos">
        <!-- end--顶部按钮-->

        <!-- begin--标题-->
        <div class="right-box-title">{{rightBoxDownload.title}}</div>
        <!-- end--标题-->

        <!-- begin--表单-->
        <el-scrollbar class="right-box-form-box">
          <el-form class="right-box-form" :model="param" label-position="top" ref="downloadRef" :rules="downloadRules">
            <el-form-item :label="this.$t('config.terminallog.uuid')" prop="uuid">
              <el-input v-if="rightBoxDownload.isAdd" type="text" placeholder="" v-model="param.uuid" size="small"></el-input>
              <div v-if="!rightBoxDownload.isAdd" class="right-box-form-content-txt">{{param.uuid}}</div>
            </el-form-item>
            <el-form-item :label="this.$t('config.terminallog.path')" prop="path">
              <el-input v-if="rightBoxDownload.isAdd" type="text" placeholder="" v-model="param.path" size="small"></el-input>
              <div v-if="!rightBoxDownload.isAdd" class="right-box-form-content-txt">{{param.path}}</div>
            </el-form-item>
          </el-form>
        </el-scrollbar>
        <!-- end--表单-->
        <!--底部按钮-->
        <div class="right-box-bottom-btns">
          <button @click="esc" id="terminallog-esc-download"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
            <span>{{$t('overall.cancel')}}</span>
          </button>
          <button v-if="rightBoxDownload.isAdd" @click="download" id="terminallog-download"
                  class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
            <span>{{$t('overall.download')}}</span>
          </button>
        </div>
      </div>
    </transition>

    <!--upload-->
    <transition name="right-box-upload">
      <div class="right-box right-box-terminallog" v-if="rightBoxUpload.show" v-clickoutside="clickos">
        <!-- end--顶部按钮-->

        <!-- begin--标题-->
        <div class="right-box-title">{{rightBoxUpload.title}}</div>
        <!-- end--标题-->

        <!-- begin--表单-->
        <el-scrollbar class="right-box-form-box">
          <el-form class="right-box-form" :model="uploadParam" label-position="top" ref="uploadRef" :rules="downloadRules">
            <el-form-item :label="this.$t('config.terminallog.uuid')" prop="uuid">
              <el-input v-if="rightBoxUpload.isAdd" type="text" placeholder="" v-model="uploadParam.uuid" size="small"></el-input>
              <div v-if="!rightBoxUpload.isAdd" class="right-box-form-content-txt">{{uploadParam.uuid}}</div>
            </el-form-item>
            <el-form-item :label="this.$t('config.terminallog.path')" prop="path">
              <el-input v-if="rightBoxUpload.isAdd" type="text" placeholder="" v-model="uploadParam.path" size="small"></el-input>
              <div v-if="!rightBoxUpload.isAdd" class="right-box-form-content-txt">{{uploadParam.path}}</div>
            </el-form-item>
            <el-form-item :label="this.$t('config.terminallog.file')">
              <el-upload
                class="upload-demo"
                ref="upload"
                action=""
                :on-change="handleChange"
                :auto-upload="false"
                prop="file">
                <el-button size="small" type="primary">{{$t('config.terminallog.selectFile')}}</el-button>
              </el-upload>
              <div v-if="!rightBoxUpload.isAdd" class="right-box-form-content-txt">{{uploadParam.path}}</div>
            </el-form-item>
          </el-form>
        </el-scrollbar>
        <!-- end--表单-->
        <!--底部按钮-->
        <div class="right-box-bottom-btns">
          <button @click="esc" id="terminallog-esc-upload"
                  class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
            <span>{{$t('overall.cancel')}}</span>
          </button>
          <button v-if="rightBoxUpload.isAdd" @click="upload" id="terminallog-upload"
                  class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
            <span>{{$t('overall.upload')}}</span>
          </button>
        </div>
      </div>
    </transition>

    <element-set
      v-clickoutside="elementsetHide"
      :dropCol="dropCol"
      @tablelable="tablelabelEmit"
      :table-title="tableTitle"
      ref="elementset"
    ></element-set>
  </div>
</template>
<script>
  export default {
    name: "terminallog",
    data() {
      return {
        tableId: 'terminalLogTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
        rightBox: { //弹出框相关
          show: false,
          isEdit: false, //false查看，true编辑
          title: ''
        },
        rightBoxResize: { //resize弹出框相关
          show: false,
          isAdd: false, //false，true：resize
          title: ''
        },
        rightBoxDownload: { //下载弹出框相关
          show: false,
          isAdd: false, //false，true：resize
          title: ''
        },
        rightBoxUpload: { //上传弹出框相关
          show: false,
          isAdd: false, //false，true：resize
          title: ''
        },
        terminallog: {
          id: '',
          host: '',
          status: '1',
          time: '',
          protocol: '',
          port: '',
          user: '',
          cmd: '',
          authType: '',
          userName: ''
        },
        terminalConfig:  {
          height: '',
          width: '',
          cols: '',
          rows: ''
        },
        param: {
          uuid: '',
          path: ''
        },
        uploadParam: {
          uuid: '',
          path: '',
          file: ''
        },
        rules: {
          height: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          width: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          cols: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          rows: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ]
        },
        downloadRules: {
          uuid: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          path: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ]
        },
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        tableTitle: [
          {
            label: this.$t("config.terminallog.id"),
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t('config.terminallog.host'),
            prop: 'host',
            show: true,
          }, {
            label: this.$t('config.terminallog.port'),
            prop: 'port',
            show: true,
          },
          {
            label: this.$t('config.terminallog.protocol'),
            prop: 'protocol',
            show: true,
          },
          {
            label: this.$t('config.terminallog.user'),
            prop: 'user',
            show: true,
          },
          {
            label: 'AuthType',
            prop: 'authType',
            show: false
          },
          {
            label: this.$t('config.terminallog.cmd'),
            prop: 'cmd',
            show: true,
          },
          {
            label: 'UserName',
            prop: 'userName',
            show: false,
          },
          {
            label: this.$t('config.terminallog.time'),
            prop: 'time',
            show: true
          },
          {
            label: this.$t('config.terminallog.enable'),
            prop: 'status',
            show: true,
            width: 100
          }, {
            label: this.$t('config.terminallog.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tablelable: [],
        dropCol: [],
        tableData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [
          //   {
          //   id: 10,
          //   name: this.$t('config.terminallog.protocol'),
          //   type: 'selectString',
          //   label: 'terminalProtocol',
          //   disabled: false
          // },
            {
            id: 11,
            name: this.$t('config.terminallog.host'),
            type: 'input',
            label: 'host',
            disabled: false
          },{
            id: 12,
            name: this.$t('config.terminallog.user'),
            type: 'input',
            label: 'user',
            disabled: false
          },{
            id: 13,
            name: this.$t('config.terminallog.cmd'),
            type: 'input',
            label: 'cmd',
            disabled: false
          },{
            id: 14,
            name: this.$t('config.terminallog.userId'),
            type: 'input',
            label: 'userId',
            disabled: false
          }
          ],
        },
        searchLabel: {}, //搜索参数
      }
    },
    methods: {
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
        this.rightBoxResize.show = false;
        this.rightBoxDownload.show = false;
        this.rightBoxUpload.show = false
      },
      handleChange(file) {
        this.uploadParam.file = file.raw
      },
      detail: function (u) {
        this.terminallog = Object.assign({}, u);
        this.rightBox.isEdit = false;
        this.rightBox.title = this.$t("config.terminallog.terminallog") + "  ID：" + u.id;
        this.rightBox.show = true;
      },
      getTableData: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$get('terminal/log', this.searchLabel).then(response => {
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              response.data.list[i].status = response.data.list[i].status + "";
            }
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
      },
      save: function () {
        this.$refs.resizeRef.validate((valid) => {
          if (valid) {
            this.$post('terminal/resize', this.terminalConfig).then(response => {
              if (response.code === 200) {
                this.rightBoxResize.show = false;
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
              } else {
                this.$message.error(response.msg);
              }
              this.getTableData();
            });
          } else {
            return false;
          }
        })
      },
      resize: function () {
        this.cleanTerminalConfig()
        this.rightBoxResize.isAdd = true;
        this.rightBoxResize.title = this.$t("config.terminallog.resize") ;
        this.rightBoxResize.show = true
      },
      cleanTerminalConfig: function () {
        this.terminalConfig = {
          height: '',
          width: '',
          cols: '',
          rows: ''
        }
      },
      toDownload: function () {
        this.param.uuid = ''
        this.param.path = ''
        this.rightBoxDownload.isAdd = true;
        this.rightBoxDownload.title = this.$t("config.terminallog.download") ;
        this.rightBoxDownload.show = true
      },
      download: function() {
        this.$refs.downloadRef.validate((valid) => {
          debugger
          if (valid) {
            this.$post('terminal/download', this.param).then(response => {
              this.rightBoxDownload.show = false;
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.downloadSuccess")});
              this.getTableData();
            }).catch(response => {
              this.$message.error(response.msg);
            });
          } else {
            return false;
          }
        })
      },
      toUpload: function () {
        this.uploadParam.uuid = ''
        this.uploadParam.path = ''
        this.uploadParam.file = ''
        this.rightBoxUpload.isAdd = true;
        this.rightBoxUpload.title = this.$t("config.terminallog.upload") ;
        this.rightBoxUpload.show = true
      },
      upload() {
        let config = {headers: {"Content-Type": "multipart/form-data"}}
        let form = new FormData();
        form.append("uuid", this.uploadParam.uuid);
        form.append("path", this.uploadParam.path);
        form.append("file", this.uploadParam.file);
        this.$refs.uploadRef.validate((valid) => {
          if (valid) {
            this.$post('terminal/upload', form, config).then(res => {
              if (res.code === 200) {
                this.rightBoxUpload.show = false;
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.uploadSuccess")});
              } else {
                this.$message.error(res.msg);
              }
              this.getTableData();
            })
          } else {
            return false;
          }
        })
      },
      jumpTo(data, id) {
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      toEditReceiver: function (item) {
        if (!item.isEdit) {
          //如果不在编辑状态，那么其他项如果有改动，则还原改动，最后开始编辑
          this.blurEditReceiver();
          item.isEdit = true;
        } else {
          //如果已在编辑状态，判断name是否有变更，有变更则发请求
          if (item.name != item.oldName) {
            if (this.updateReceiverName(item) == 200) {
              item.isEdit = false;
            }
          } else {
            item.errorMessage = '';
            item.isEdit = false;
          }
        }
      },

      esc: function () {
        this.rightBox.show = false;
        this.rightBoxResize.show = false;
        this.rightBoxDownload.show = false;
        this.rightBoxUpload.show = false
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
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getTableData();
      }
    },
    computed: {
      isCurrentUser() {
        return function(username) {
          return localStorage.getItem('nz-username') == username;
        }
      }
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined') {
        this.pageObj.pageSize = pageSize
      }

      this.getTableData();
      this.$nextTick(() => {
        //绑定滚动条事件，控制top按钮
        let el = this.$refs.terminalLogTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 50) {
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });
        }
      });
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    }
  }
</script>
