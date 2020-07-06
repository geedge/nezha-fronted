<template>
  <div class="header">
    <div class="logo link" @click="jumpTo('overview')"><img height="45" src="../../assets/img/logo.png"/></div>
    <el-menu
      class="nz-menu float-right"
      mode="horizontal"
      active="1"
      unique-opened
    >
      <el-submenu :index="'-1'" class="icon-menu-item" popper-class="display-none">
        <div slot="title" class="el-submenu__title" @click="cli()" >
          <i class="nz-icon nz-icon-cli"></i>
          <div class="right-tip" v-show="$store.state.consoleCount>0">{{$store.state.consoleCount<=10?$store.state.consoleCount:'10+'}}</div>
        </div>
      </el-submenu>
      <el-submenu index="0" popper-class="nz-submenu" class="icon-menu-item">
        <template slot="title">
         <i class="nz-icon-create-square nz-icon"></i>
        </template>
        <template v-for="(item, index) in createMenu">
          <el-menu-item :index="'0-' + index">
            <div @click="createBox(item)">
              <span>{{item.label}}</span>
            </div>
          </el-menu-item>
        </template>
      </el-submenu>
      <el-menu-item :index="'-2'" >
        <div class="vertical-line" ></div>
      </el-menu-item>
      <el-submenu index="1" popper-class="nz-submenu">
        <template slot="title">
          <div @click="jumpTo('overview')" :class ="(activeIndex == 'overview' ||activeIndex == 'panel' || activeIndex == 'explore') ? 'menu-active' :'' " >
            {{$t('overall.dashboard')}}
          </div>
        </template>
        <el-menu-item index="1-0">
          <div @click="jumpTo('overview')" :class="{'menu-item-active' :activeIndex == 'overview'}" >{{$t('dashboard.overview.title')}}</div>
        </el-menu-item>
        <el-menu-item index="1-1">
          <div @click="jumpTo('panel')" :class="{'menu-item-active' :activeIndex == 'panel'}" >{{$t('dashboard.panel.title')}}</div>
        </el-menu-item>
        <el-menu-item index="1-2">
          <div @click="jumpTo('explore')" :class="{'menu-item-active' :activeIndex == 'explore'}">{{$t('dashboard.metricPreview.title')}}</div>
        </el-menu-item>
      </el-submenu>

      <el-submenu index="2" popper-class="nz-submenu">
        <template slot="title">
          <div v-if="projectData.length == 0">{{$t('overall.project')}}</div>
          <div v-else @click="jumpToProject(projectData[0], 0)" :class ="activeIndex == 'project' ? 'menu-active' :''" >{{$t('overall.project')}}</div>
        </template>
        <template>
          <el-menu-item v-if="projectData.length == 0" index="2-0"><div @click="createBox({type: 1})"><i class="nz-icon nz-icon-create-square header-dropdown-add"></i>&nbsp;&nbsp;{{$t("overall.createProject")}}</div></el-menu-item>
          <template v-else>
            <el-menu-item :index="'2-' + index" v-for="(item, index) in projectData" :key="index">
              <div @mouseenter="hoverItemIndex = '2-' + index" @mouseleave="hoverItemIndex = ''" @click="jumpToProject(item)" >
                <span class="too-long-split" style="width: 135px;">{{item.name}}</span>
                <div v-show="hoverItemIndex == '2-' + index && item.buildIn != 1" @click.stop="toEditProject(item)" class="menu-edit"><i class="nz-icon nz-icon-edit"></i></div>
              </div>
            </el-menu-item>
          </template>
        </template>
      </el-submenu>
      <el-submenu index="3" popper-class="nz-submenu">
        <template slot="title">
          <div v-if="assetData.length == 0">{{$t('overall.asset')}}</div>
          <div v-else @click="jumpTo('asset')" :class="{'menu-active' : activeIndex == 'asset'}">{{$t('overall.asset')}}</div>
        </template>
        <template>
          <el-menu-item v-if="assetData.length == 0" index="3-0"><div @click="createBox({type: 6})"><i class="nz-icon nz-icon-create-square header-dropdown-add"></i>&nbsp;&nbsp;{{$t("overall.createDatacenter")}}</div></el-menu-item>
          <template v-else>
            <el-menu-item :index="'3-' + index" v-for="(item, index) in assetData" :key="index">
              <div @mouseenter="hoverItemIndex = '3-' + index" @mouseleave="hoverItemIndex = ''" @click="jumpToAsset(item.id)" >
                <span class="too-long-split" style="width: 130px;">{{item.name}}</span>
              </div>
            </el-menu-item>
          </template>
        </template>
      </el-submenu>
      <el-submenu index="4-0" popper-class="nz-submenu">
        <template slot="title">
          <div @click="jumpTo('alertList')" :class ="activeIndex == 'alertList' || activeIndex == 'alertConfig' ? 'menu-active' :''">{{$t('overall.alert')}}</div>
        </template>
        <el-menu-item index="4-1">
          <div @click="jumpTo('alertList')" :class ="activeIndex == 'alertList' ? 'menu-item-active' :''">{{$t('alert.message')}}</div>
        </el-menu-item>
        <el-menu-item index="4-2">
          <div @click="jumpTo('alertConfig')" :class ="activeIndex == 'alertConfig' ? 'menu-item-active' :''">{{$t('alert.rule')}}</div>
        </el-menu-item>
      </el-submenu>
      <el-submenu index="5" popper-class="nz-submenu">
        <template slot="title">
          <div @click="jumpTo('account')" :class ="activeIndex == 'account' || activeIndex == 'promServer' || activeIndex == 'dc' || activeIndex == 'model' || activeIndex == 'mib' || activeIndex == 'system' || activeIndex == 'terminallog' || activeIndex == 'operationlog' ? 'menu-active' :''">{{$t('overall.config')}}</div>
        </template>
        <el-menu-item index="5-0">
          <div @click="jumpTo('account')" :class="{'menu-item-active' :(activeIndex == 'account' )}">{{$t('config.account.account')}}</div>
        </el-menu-item>
        <el-menu-item index="5-1">
          <div @click="jumpTo('promServer')" :class="{'menu-item-active' :(activeIndex == 'promServer' )}">{{$t('config.promServer.promServerList')}}</div>
        </el-menu-item>
        <el-menu-item index="5-2">
          <div @click="jumpTo('dc')" :class="{'menu-item-active' :(activeIndex == 'dc' )}">{{$t('config.dc.dc')}}</div>
        </el-menu-item>
        <el-menu-item index="5-3">
          <div @click="jumpTo('model')" :class="{'menu-item-active' :(activeIndex == 'model' )}">{{$t('config.model.model')}}</div>
        </el-menu-item>
        <el-menu-item index="5-4">
          <div @click="jumpTo('mib')" :class="{'menu-item-active' :(activeIndex == 'mib' )}">{{$t('config.mib.mib')}}</div>
        </el-menu-item>
        <el-menu-item index="5-5">
          <div @click="jumpTo('system')" :class="{'menu-item-active' :(activeIndex == 'system' )}">{{$t('config.system.system')}}</div>
        </el-menu-item>
        <el-menu-item index="5-6">
          <div @click="jumpTo('terminallog')" :class="{'menu-item-active' :(activeIndex == 'terminallog' )}">{{$t('config.terminallog.terminallog')}}</div>
        </el-menu-item>
        <el-menu-item index="5-7">
          <div @click="jumpTo('operationlog')" :class="{'menu-item-active' :(activeIndex == 'operationlog' )}">{{$t('config.operationlog.operationlog')}}</div>
        </el-menu-item>
      </el-submenu>
      <el-submenu index="6" popper-class="nz-submenu">
        <template slot="title">
          <div class='nz-user'>{{username}}<i class="el-icon-arrow-down"></i></div>
        </template>
        <el-menu-item index="6-0">
          <div :style="language=='en'?'color:#f90':''" @click="changeLocal('en')">English</div>
        </el-menu-item>
        <el-menu-item index="6-1">
          <div :style="language=='cn'?'color:#f90':''" @click="changeLocal('cn')">中文</div>
        </el-menu-item>
        <el-menu-item class="nz-menu-line" @click.stop index="6-2">
          <div style="height: 1px; width: 100%; background-color: #cccccc;"></div>
        </el-menu-item>
        <el-menu-item index="6-3">
          <div @click="showPwdDialog">{{$t('overall.changePwd')}}</div>
        </el-menu-item>
        <el-menu-item index="6-4">
          <div @click="logout">{{$t('overall.signOut')}}</div>
        </el-menu-item>
      </el-submenu>
    </el-menu>

    <panel-box :panel="editPanel" @reload="panelListReload" @reloadForDel="" ref="panelBox"></panel-box>
    <project-box :project="editProject" ref="projectBox"></project-box>
    <module-box :currentProject="currentProject" :module="editModule" @reload="" ref="moduleBox"></module-box>
    <add-endpoint-box :currentProject="currentProject" :currentModule="currentModule" @reload=""
                      ref="addEndpointBox"></add-endpoint-box>
    <!--<asset-add-unit :add-unit-show='addUnitShow' @refreshData="refreshAsset" ref="assetAddUnit"
                    @sendStateData="closeAsset"></asset-add-unit>-->
    <asset-box :edit-unit-show='addUnitShow' @refreshData="refreshAsset" @sendStateData="closeAsset" v-if="assetBoxShow"
               ref="assetAddUnit"></asset-box>
    <dc-box ref="dcBox" :dc="currentDc" :user-data="userDatas" @reload="getAssetData"></dc-box>
    <alert-config-box :parentAlertRule="alertRule" @reload="" ref="alertConfigBox"></alert-config-box>
    <change-password :cur-user="username" :show-dialog="showChangePwd" @click="showPwdDialog" @dialogClosed="dialogClosed"></change-password>
  </div>
</template>

<script>
  import bus from '../../libs/bus';
  import changePwd from "../page/config/changePwd";
  export default {
    name: "Header",
    components: {
      'change-password':changePwd,
    },
    data() {
      return {
        username: sessionStorage.getItem("nz-username"),
        language: localStorage.getItem("nz-language") ? localStorage.getItem("nz-language") : 'en',
        assetData: [],
        activeIndex:'',
        activeItemIndex:'',
        activeItemIndexes: [],
        hoverItemIndex: '',
        editPanel:{//新增or编辑的panel
          id:'',
          name: ''
        },
        currentDc: {},
        projectData: [], //顶部菜单project列表中的数据
        editProject: {id: '', name: '', remark: ''}, //新增/编辑的project
        currentProject: {id: '', name: '', remark: ''}, //module/endpoint弹框用来回显project
        editModule: {id: '', type: 'http', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //新增/编辑的module
        currentModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //endpoint弹框用来回显module，此处固定为空对象
        editEndpoint: { //新增/编辑的endpoint
          id: '',
          host: '',
          port: '',
          param: '',
          path: '',
          asset: {id: '', name: '', host: ''},
          project: {id: '', name: ''},
          module: {id: '', name: '', param: '', paramObj: {}, projectId: ''},
          moduleId: '',
          assetId: ''
        },
        alertRule: {
          id: '',
          alertName: '',
          type: '',
          linkObject: {id: '', name: ''},
          linkId: '',
          expr: '',
          last: '',
          severity: '',
          summary: '',
          description: '',
          receiver: '',
        },
        createMenu: [ //新增按钮内容
          /*{
            label: this.$t('dashboard.panel.title'),
            url: 'panel',
            type: 0
          },*/
          {
            label: this.$t('project.project.project'),
            url: 'project',
            type: 1
          },
          {
            label: this.$t('project.module.module'),
            url: 'project',
            type: 2
          },
          {
            label: this.$t('project.endpoint.endpoint'),
            url: 'project',
            type: 3
          },
          {
            label: this.$t('asset.asset'),
            url: 'asset',
            type: 4
          },
          {
            label: this.$t('alert.config.alertConfig'),
            url: 'alertConfig',
            type: 5
          },
          // {
          //   label: this.$t('config.dc.dc'),
          //   url: 'dc',
          //   type: 6
          // }
        ],
        addIdcData: {
          id: '',
          name: '',
          location: '',
          principal: '',
          tel: ''
        },
        IDCOptionData: [],
        addUnitShow: false,
        assetBoxShow: false,
        userDatas:[],
        showChangePwd:false,
      }
    },
    methods: {
      closeAsset() {
        this.addUnitShow = false;
        this.assetBoxShow = false;
      },
      refreshAsset(flag) {
        if (flag && this.$route.path == "/asset") {
          window.location.reload();
        }
      },
      cli(){
        this.$store.commit('openConsole');
      },
      jumpTo(data) {
        if (data != "asset") {
          this.activeItemIndexes = [];
          this.$store.state.assetData = {selectedData: [], step: 0, type: -1};
        }
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
        this.activeIndex = data;
      },

      createBox(item) {
        if (item.type == 0) {
          this.$refs.panelBox.show(true);
          this.editPanel = {id: '', name: ''};
        }else  if (item.type == 1) {
          this.$refs.projectBox.show(true,true);
          this.editProject = {id: '', name: '', remark: ''};
        } else if (item.type == 2) {
          this.$refs.moduleBox.show(true,true);
          this.editModule = {
            id: '',
            name: '',
            project: this.$store.state.currentProject,
            port: '',
            path: '',
            param: '',
            type: '',
            paramObj: [],
            snmpParam: '',
            //snmp setting 下划线命名是因为业务需求
            walk: [],
            version: 2, //2/3
            max_repetitions: 25,
            retries: 3,
            timeout: 10, //s
            community: 'public',
            username: '',
            security_level: 'noAuthNoPriv', //noAuthNoPriv/authNoPriv/authPriv
            password: '',
            auth_protocol: 'MD5', //MD5/SHA
            priv_protocol: 'DES', //DES/AES
            priv_password: '',
            context_name: ''
          };
        } else if (item.type == 3) {
          this.$refs.addEndpointBox.show(true);
          this.$refs.addEndpointBox.clearEndpoints();
        } else if (item.type == 5) {
          this.$refs.alertConfigBox.show(true, true);
        } else if (item.type == 4) {
          this.assetBoxShow = true;
          this.$nextTick(() => {
            this.addUnitShow = true;
            this.$refs.assetAddUnit.resetAsset();
          });
        } else if (item.type == 6) {
          this.currentDc = {
            id: '',
            name: '',
            location: '',
            tel: '',
            principal: '',
            area: {
              id: '',
              name: ''
            }
          },
          this.$refs.dcBox.show(true, true);
        }
      },
      jumpToAsset(id) {
        let index = this.indOf(this.activeItemIndexes, id);
        this.activeItemIndexes=[];//2020-02-25 修改为单选
        this.activeItemIndexes.push(id);
        this.$store.state.assetData = {selectedData: this.activeItemIndexes, step: this.$store.state.assetData.step+1, type: 1};
        this.jumpTo('asset');
      },
      jumpToProject(p) {
        this.currentProject = p;
        this.$store.commit('setProject', p);
        this.activeItemIndex = p.id;
        this.jumpTo('project');
      },
      getIDCOptionData(data) {
        this.$get('idc?id=' + data).then(response => {
          if (response.code === 200) {
            this.addIdcData = response.data.list[0];
            this.clickFlush(this.addIdcData)
          }
        })
      },
      editData(data, Id) {
        let idcData = {
          id: '',
          name: '',
          location: '',
          principal: '',
          tel: ''
        }
        if (data === 'idc') {
          idcData.id = Id
          idcData.name = this.addIdcData.name
          idcData.location = this.addIdcData.location
          idcData.principal = this.addIdcData.principal
          idcData.tel = this.addIdcData.tel
        }
        this.$put(data, idcData).then(res => {
          const h = this.$createElement;
          if (res.code === 200) {
            this.$notify({
              message: h('i', {style: 'color: teal'}, '修改成功'),
              duration: 2000
            })
            this.$store.state.flushDataSign = true
          } else {
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            })
          }
        })
      },
      clickFlush(itemData) {
        for (let i = 0; i < this.assetData.length; i++) {
          const element = this.assetData[i];
          if (element.id === itemData.id) {
            setTimeout(() => {
              element[element.name] = true;
            }, 100)
          } else {
            element[element.name] = false
          }
        }
      },
      getAssetData() {
        this.$get('idc', {pageSize:-1}).then(response => {
          if (response.code == 200) {
            this.assetData = response.data.list
            this.assetData.forEach(item => {
              this.$set(item, item.name, false)
            })
          }
        })
      },
      changeLocal(lang) {
        if (lang != localStorage.getItem("nz-language")) {
          localStorage.setItem("nz-language", lang);
          this.$i18n.locale = lang;
          window.location.reload();
        }
      },
      closeAllPop:function(){
        this.$refs.idcConfigBox.forEach((item)=>{
          item.show(false)
        })
      },
      getProjectList() {
        this.$get('project', {pageSize:-1}).then(response => {
          if (response.code == 200) {
            this.projectData = response.data.list;
            let flag = false;
            //如果currentProject不在新取到的数据里，说明它被删了
            for (let i = 0; i < this.projectData.length; i++) {
              if (this.projectData[i].id == this.currentProject.id) {
                flag = true;
                break;
              }
            }
            if (!flag && this.projectData.length > 0) {
              this.currentProject = this.projectData[0];
              this.activeItemIndex = this.currentProject.id;
              this.$store.commit('setProject', this.currentProject);
            }
          }
        })
      },
      toEditProject(p) {
        this.$refs.projectBox.show(true,true);
        this.editProject = Object.assign({}, p);
      },
      indOf(a, b) {
        let c = [];
        for (let i = 0; i < a.length; i++) {
          c.push(a[i]);
        }
        return c.indexOf(b);
      },
      panelListReload(){
        if(this.$route.path==='/panel'){
          this.$store.commit('panelListChange',true);//新增panel之后,且当前页面为panel页面，则更新panel列表
        }
      },
      logout() {
        this.$get('logout');
        this.jumpTo('login');
      },
      getUserData() {
        this.$get('sys/user/list').then(response => {
          if (response.code === 200) {
            this.userDatas = response.data.list
          }
        })
      },
      refreshLang() {
        this.language = localStorage.getItem("nz-language");
        this.$i18n.locale = this.language;
        this.$nextTick(() => {
          window.location.reload();
        });
      },
      showPwdDialog:function(){
        this.showChangePwd=true;
      },
      dialogClosed:function(){
        this.showChangePwd=false;
      },
      cancel: function() {
        this.activeIndex = this.$route.path.slice(1, this.$route.path.length);
        console.info(this.activeIndex)
        //this.$router.go(-1);
      },
    },
    mounted() {
      this.$i18n.locale = this.language;
      this.getUserData();
      this.getAssetData();
      this.getProjectList();
      // 刷新后有高亮
      let activePath = this.$route.path.slice(1);
      this.activeIndex = activePath;
      bus.$on("menu-change", (menu) => {
        this.activeIndex = menu;
      });
      bus.$on('login', () => {
        this.username = sessionStorage.getItem("nz-username");
        this.refreshLang();
        this.activeIndex = 'overview';
      });

      if (window.history && window.history.pushState) {
        history.pushState(null, null, document.URL);
        window.addEventListener('popstate', this.cancel, false);
      }
    },
    computed: {
      projectListReloadWatch() {
        return this.$store.state.projectListChange;
      },
      getIdcData() {
        return this.$store.state.assetDcList;
      },
      getAssetDcData() {
        return this.$store.state.assetData;
      },
      currentProjectWatch(){
        return this.$store.state.currentProject;
      }
    },
    watch: {
      getAssetDcData: {
        handler(newVal) {
          if (newVal.type == 0) {
            this.activeItemIndexes = newVal.selectedData;
          }
        },
        deep: true,
        immediate: true
      },
      getIdcData: {
        handler(newVal, oldVal) {
          this.getAssetData()
        },
        deep: true,
      },
      projectListReloadWatch(n, o) {
        this.getProjectList();
      },
      currentProjectWatch(n,o){
        this.currentProject=n;
        this.activeItemIndex=n.id;
      }
    },
    destroyed() {
      window.removeEventListener('popstate', this.cancel, false);
    }
  }
</script>

<style lang="scss">
  .logo {
    position: absolute;
    top: 5px;
    left: 18px;
  }
  .header {
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.30);
  }
  .header .el-menu {
    background-color: transparent;
  }
  .header .el-menu--horizontal>.el-submenu .el-submenu__title .menu-active{
    border-bottom: $global-text-color-active solid 2px;
    border-radius: 2px;
    height: 26px;
    line-height: 16px;
    display: inline-block;
    font-size: 16px;
    margin: 0 auto -8px;
    font-weight: 500;
    color: $header-text-color-active;
  }
  .header .el-menu--horizontal>.el-submenu .el-submenu__title i {
    color: inherit;
  }
  .el-submenu__title:hover {
    background-color: $header-background-color-hover !important;
  }
  .el-submenu__title{
    font-size: 16px;
  }
  .el-submenu__title .el-icon-arrow-down ,.el-submenu__title>.nz-user{
    font-size: 14px;
  }
  .nz-submenu .el-menu--popup {
    border-radius: 4px;
  }
  .header .el-menu--horizontal>.el-submenu .el-submenu__title {
    min-width: 120px;
    text-align: center;
    color:$header-text-color;
    padding: 0;
    height: 50px;
    line-height: 50px;
  }
  .header .el-menu--horizontal>.icon-menu-item .el-submenu__title {
    min-width: 50px !important;
    line-height: 46px;
    /*margin-right:20px;*/
  }
  .header .vertical-line{
    display:inline-block;
    border-left:solid 1px white;
    line-height:30px !important;
    height:30px !important;
    min-width:0px !important;
    color:white;
    margin-right: 8px;
    margin-left: 8px;
    margin-top: -8px;
  }
  .header .vertical-line:hover{
    cursor:default !important;
  }
  /* top el-menu-item sytle------start*/
  .header .el-menu--horizontal>.el-menu-item  {
    height: 50px;
  }
  .header .el-menu--horizontal>.el-menu-item >div {
    min-width: 50px;
    text-align: center;
    /*color:$header-text-color;*/
    padding: 0;
    height: 50px;
    line-height: 51px;
  }
  .header .el-menu--horizontal>.el-menu-item i {
    color: $header-text-color;
  }
  .header .el-menu--horizontal>.el-menu-item>div {
    padding-left: 0px !important;
  }
  .header .el-menu--horizontal>.el-menu-item>div:hover {
    background-color: $header-background-color-hover !important;
  }
  .header .el-menu--horizontal>.el-menu-item:not(.is-disabled):focus, .header .el-menu--horizontal>.el-menu-item:not(.is-disabled):hover {
    background-color:transparent !important;
  }
  .header .right-tip{
    vertical-align:middle;
    line-height: 15px;
    font-size:6px;
    background-color:#ba3939;
    opacity:0.9;
    border-radius:7px;
    min-width:25px;
    height:15px;
    position:absolute;
    left: 25px;
    bottom: 27px;
    color:white;
  }
  /* top el-menu-item sytle------end*/
  .el-menu.el-menu--horizontal {
    border-bottom: 0px;
  }

  .el-submenu__title .el-submenu__icon-arrow {
    display: none;
  }

  .el-menu--horizontal > .el-menu-item.is-active {
    border-bottom: 0px;
  }

/*  .el-menu--horizontal > .el-submenu.is-active .el-submenu__title,
  .el-menu--horizontal > .el-menu-item.is-active,
  .el-menu--horizontal .el-menu-item:not(.is-disabled):focus, .el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
    border-bottom: 0px;
    color: white;
  }*/
  .el-submenu.is-active .el-submenu__title{
    border-bottom-color: transparent !important;
  }
  .menu-create .menu-icon-create .nz-icon:before{
    height: 20px;
    line-height: 20px;
    display: inline-block;
    font-size: 20px;
    margin-top:-4px;
    margin-bottom:6px;
  }
  .el-submenu__icon-arrow .el-icon-arrow-down{
    display: none;
  }
  .el-menu--horizontal.nz-submenu {
    border-top: none;
    top: 52px !important;

  }

  .nz-submenu .el-menu--popup {
    background-color: white !important;
  }

  .nz-submenu .el-menu--popup .el-menu-item {
    background-color: white !important;
  }
  .nz-submenu .el-menu--popup-bottom-start {
    margin-top: 0;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.2);
  }

  .nz-submenu.el-menu--horizontal .el-menu .el-menu-item {
    color: #444444 !important;
    transition: none;
  }
  .header-dropdown-add {
    position: absolute;
    left: 14px;
    top: 1px;
  }
  .nz-submenu.el-menu--horizontal   {
    color: $global-text-color-active !important;
  }

  .el-menu-item > div, .el-menu-item > div > div {
    font-size: 15px;
  }
  .nz-menu-line {
    cursor: default;
    display: flex;
    align-items: center;
    height: 18px !important;
  }
</style>

<style scoped>
  .menu-create-title {
    font-size: 14px;
  }
  .header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 50px;
    background-color: #232f3e;
    z-index: 510;
  }

  .menu-create {
    line-height: 11px;
    text-align: center;
    padding-top: 12px;
  }

  .menu-create .el-icon-plus {
    font-size: 12px;
    line-height: 12px;
  }

  .pop-window-assetType-content {
    padding: 1px 15px 15px 20px;
  }

  .pop-window {
    height: 370px;
    width: 400px;
  }

  .sidebar-pop-input {
    position: absolute;
    right: 50px;
    width: 200px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    color: #606266;
    display: inline-block;
    padding: 0px 15px;
  }

  .sidebar-pop-input-select {
    position: absolute;
    right: 83px;
    width: 200px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    color: #606266;
    display: inline-block;
    padding: 0px 15px;
  }

  .right-box-top-btn {
    border-radius: 0 0 9px 9px;
    float: right;
    color: #656565;
    height: 30px;
    font-size: 12px;
    padding: 3px 8px 1px 8px;
    border: 1px solid #aaaaaa;
    border-top: none;
    cursor: pointer;
    margin-left: 20px;
  }

  .right-box-bottom-btns {
    position: absolute;
    bottom: 0px;
    width: 100%;
    text-align: center;
  }

  .right-box-bottom-btn-cancel {
    background-color: #DADADA;
    color: #656565;
    width: 50%;
    border-bottom-left-radius: 8px;
  }

  .right-box-top-btn-full {
    background-color: #656565;
    border: 1px solid #656565;
    border-top: none;
    color: white;
  }

  .right-box-bottom-btn-50 {
    width: 50%;
    float: right;
    border-bottom-right-radius: 8px;
  }
</style>
<style>
  .nz-submenu .menu-edit {
    line-height: 36px;
    position: absolute;
    right: 15px;
    top: 0;
  }
  .nz-submenu .menu-edit i {
    font-size: 12px;
  }
  .el-menu-item {
    padding: 0;
  }
  .el-menu-item>div {
    padding-left: 30px;
  }
  .el-menu-item>div:hover {
    background-color: #eee;
  }
  .el-menu--horizontal .el-menu .el-menu-item, .el-menu--horizontal .el-menu .el-submenu__title {
    padding: 0;
  }
</style>
