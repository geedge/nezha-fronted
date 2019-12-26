<template>
    <div class="header">
        <div class="submenu">
            <el-menu
                    class="el-menu-demo"
                    mode="horizontal"
                    background-color="#ffffff"
                    unique-opened
            >
                <el-submenu index="0">
                    <template slot="title">
                        <div class="menu-create">
                            &nbsp;&nbsp;<i class="el-icon-plus"></i>
                            <div>{{$t('overall.create')}}</div>
                        </div>
                    </template>
                    <template v-for="(item, index) in createMenu">
                        <el-menu-item :index="'0-' + index">
                            <div @click="createBox(item)">
                                <span>{{item.label}}</span>
                            </div>
                        </el-menu-item>
                    </template>
                </el-submenu>
                <el-menu-item index="1" @click="jumpTo('dashboard')">
                    <div>
                        {{$t('overall.dashboard')}}
                    </div>
                </el-menu-item>
                <el-submenu index="2">
                    <template slot="title">
                        <div @click="jumpToProject(projectData[0])">{{$t('overall.project')}}</div>
                    </template>
                    <template v-for="(item, index) in projectData">
                        <el-menu-item :index="'2-' + index">
                            <div @click="jumpToProject(item)">
                                <span>{{item.name}}</span>
                                <div @click.stop="toEditProject(item)" class="menu-edit"><i
                                        class="el-icon-edit-outline"></i></div>
                            </div>
                        </el-menu-item>
                    </template>
                </el-submenu>
                <el-submenu index="3">
                    <template slot="title">
                        <div @click="jumpTo('asset')">{{$t('overall.asset')}}</div>
                    </template>
                    <template v-for="(item, index) in assetData">
                        <el-menu-item :index="'3-' + index">
                            <div @click="jumpToAsset('asset',item.id)">
                                <span>{{item.name}}</span>
                                <el-popover
                                        placement="bottom"
                                        v-model="item[item.name]"
                                        trigger="click"
                                >
                                    <div class="pop-window-assetType-content">
                                        <div class="right-box-top-btns">
                                            <div class="right-box-top-btn right-box-top-btn-full"
                                                 @click="item[item.name] = false">
                                                <div class="right-box-btn-icon">
                                                    <i class="el-icon-close"></i>
                                                </div>
                                                <span>{{$t('overall.esc')}}</span>
                                            </div>
                                        </div>
                                        <div class="pop-window">
                                            <span style="display: block;padding-bottom: 20px">标题</span>
                                            <div style="padding-top: 10px;padding-left: 20px">
                                                <div>
                                                    <label style="font-size: 12px">DN name</label>
                                                    <input class='sidebar-pop-input' v-model="addIdcData.name"/>
                                                </div>
                                                <div style="padding-top: 40px">
                                                    <label style="font-size: 12px">Loaction</label>
                                                    <input class='sidebar-pop-input' v-model="addIdcData.location"/>
                                                </div>
                                                <div style="padding-top: 40px">
                                                    <label style="font-size: 12px;padding-right: 20px">负责人</label>
                                                    <select class='sidebar-pop-input-select'
                                                            style="margin-left:-40px "
                                                            v-model="addIdcData.principal"
                                                            clearable>
                                                        <option
                                                                v-for="item in idcUserData"
                                                                :key="item.key"
                                                                :label="item.username"
                                                                :value="item.userId"
                                                        >
                                                        </option>
                                                    </select>
                                                </div>
                                                <div style="padding-top: 40px">
                                                    <label style="font-size: 12px">Tel</label>
                                                    <input class='sidebar-pop-input' v-model="addIdcData.tel"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="right-box-bottom-btns">
                                        <div class="right-box-bottom-btn right-box-bottom-btn-cancel"
                                             @click.stop="item[item.name]= false">
                                            {{$t('overall.cancel')}}
                                        </div>
                                        <div class="right-box-bottom-btn right-box-bottom-btn-50"
                                             @click="editData('idc',item.id)">
                                            {{$t('overall.save')}}
                                        </div>
                                    </div>
                                    <div @click.stop="getIDCOptionData(item.id)" slot="reference" class="menu-edit">
                                        <i class="el-icon-edit-outline"></i>
                                    </div>
                                </el-popover>
                            </div>
                        </el-menu-item>
                    </template>
                </el-submenu>
                <el-submenu index="4-0">
                    <template slot="title">
                        <div @click="jumpTo('alertList')">{{$t('overall.alert')}}</div>
                    </template>
                    <el-menu-item index="4-1">
                        <div @click="jumpTo('alertList')">{{$t('alert.alertList')}}</div>
                    </el-menu-item>
                    <el-menu-item index="4-2">
                        <div @click="jumpTo('alertConfig')">{{$t('alert.alertConfig')}}</div>
                    </el-menu-item>
                </el-submenu>
                <el-submenu index="5">
                    <template slot="title">
                        <div @click="jumpTo('account')">{{$t('overall.config')}}</div>
                    </template>
                    <el-menu-item index="5-0">
                        <div @click="jumpTo('account')">{{$t('config.account.account')}}</div>
                    </el-menu-item>
                    <el-menu-item index="5-1">
                        <div @click="jumpTo('promServer')">{{$t('config.promServer.promServerList')}}</div>
                    </el-menu-item>
                </el-submenu>
            </el-menu>
        </div>
        <div class="header-right">
            <div class="header-user-con">
                <div class="flagselect">
                </div>
                <el-popover
                        placement="bottom"
                        title=""
                        width="200"
                        trigger="hover"
                >
                    <div class="userout">
                        <div :style="language!='en'?'color:#a6a6a6':''" @click="changeLocal('en')">
                            <p>English</p>
                        </div>
                        <div :style="language=='cn'?'':'color:#a6a6a6'" @click="changeLocal('cn')">
                            <p>简体</p>
                        </div>
                        <div style="cursor:no-drop;color:#a6a6a6">
                            <p>русский</p>
                        </div>
                    </div>
                    <div class="SignOut" @click="jumpTo('')">
                        退出登录
                    </div>
                    <div slot="reference" class="user-avator">
                        <span>用户名</span>
                        <i class="el-submenu__icon-arrow el-icon-arrow-down header-name-jiantou"></i>
                    </div>
                </el-popover>
            </div>
        </div>
        <!--        <project-box :project="editProject" @reload="projectReload" ref="projectBox"></project-box>-->
        <module-box :currentProject="currentProject" :module="editModule" @reload="" ref="moduleBox"></module-box>
        <!--<add-endpoint-box :currentProject="currentProject" :currentModule="currentModule" @reload="" ref="addEndpointBox"></add-endpoint-box>-->
    </div>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      addIdcData: {
        id: '',
        name: '',
        location: '',
        principal: '',
        tel: ''
      },
      idcUserData: '',
      IDCOptionData: [],
      language: localStorage.getItem("language"),
      assetData: [],
      projectData: [], //顶部菜单project列表中的数据
      editProject: {id: '', name: '', remark: ''}, //新增/编辑的project
      currentProject: {id: '', name: '', remark: ''}, //module/endpoint弹框用来回显project
      editModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //新增/编辑的module
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
      createMenu: [ //新增按钮内容
        {
          label: this.$t('project.project.createProject'),
          url: 'project',
          type: 1
        },
        {
          label: this.$t('project.module.createModule'),
          url: 'project',
          type: 2
        },
        {
          label: this.$t('project.endpoint.createEndpoint'),
          url: 'project',
          type: 3
        },
        {
          label: this.$t('asset.createAsset'),
          url: 'asset',
          type: 4
        },
        {
          label: this.$t('alert.config.createAlertConfig'),
          url: 'alertConfig',
          type: 5
        }
      ]
    }
  },
  methods: {
    getUserData() {
      this.$get('sys/user/list').then(response => {
        if (response.code === 200) {
          this.idcUserData = response.data.list
        }
      })
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
        }else{
          this.$notify({
            message: h('i', {style: 'color: teal'}, res.msg),
            duration: 2000
          })
        }
      })
    },
    jumpTo(data) {
      this.$router.push({
        path: "/" + data,
        query: {
          t: +new Date()
        }
      });
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
      this.$get('idc', this.pageObj).then(response => {
        if (response.code == 200) {
          this.assetData = response.data.list
          this.assetData.forEach(item => {
            this.$set(item, item.name, false)
          })
        }
      })
    },
    createBox(item) {
      if (item.type == 1) {
        this.$refs.projectBox.show(true);
        this.editProject = {id: '', name: '', remark: ''};
      } else if (item.type == 2) {
        this.$refs.moduleBox.show(true);
        this.editModule = {
          id: '',
          name: '',
          project: this.$store.state.currentProject,
          port: '',
          path: '',
          param: '',
          paramObj: []
        };
      } else if (item.type == 3) {
        this.$refs.addEndpointBox.show(true);
      }
    },
    jumpToAsset(data, id) {
      this.$store.state.assetData.moduleData = data;
      this.$store.state.assetData.selectedData = id;
      this.jumpTo(data);
    },
    jumpToProject(p) {
      this.$store.commit('setProject', p);
      this.jumpTo('project');
    },
    changeLocal(lang) {
      localStorage.setItem("language", lang);
      window.location.reload();
    },
    getProjectList() {
      this.$get('project', {}).then(response => {
        if (response.code == 200) {
          this.projectData = response.data.list;
        }
      })
    },
    toEditProject(p) {
      this.$refs.projectBox.show(true);
      this.editProject = Object.assign({}, p);
    },
    projectReload() {
      this.getProjectList();
    }
  },
  mounted() {
    this.getUserData();
    this.getAssetData();
    this.getProjectList();
  }
  ,
  computed: {
    projectListReloadWatch() {
      return this.$store.state.projectListReload;
    },
    getIdcData() {
      return this.$store.state.assetData.idcData
    }
  }
  ,
  watch: {
    getIdcData:{
      handler(newVal, oldVal) {
        this.getAssetData()
      },
      deep: true,
    },
    projectListReloadWatch(n, o) {
      if (n) {
        this.getProjectList();
        this.$store.commit('projectListChange', false);
      }
    }
  }
}
</script>

<style>
.el-menu.el-menu--horizontal {
    border-bottom: 0px
}

.el-submenu__title .el-submenu__icon-arrow {
    display: none;
}

.el-menu--horizontal > .el-menu-item.is-active {
    border-bottom: 0px
}

.el-menu--horizontal > .el-submenu.is-active .el-submenu__title {
    border-bottom: 0px
}
</style>

<style scoped>
.submenu {
    padding-left: 50%;
    width: 500px;
    float: left;
    font-size: 22px;
}

.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 60px;
    background-color: #ffffff;
    z-index: 510;
    box-shadow: 0px 20px 13px -19px #5E5E5E;
}

.header-right {
    float: right;
    padding-right: 5px;
}

.header-user-con {
    display: flex;
    height: 50px;
    align-items: center;
}

.user-avator {
    padding: 0 5px 3px 0;
    margin-left: 20px;
    line-height: 30px;
    cursor: pointer;
}

.user-avator:hover {
    border-radius: 2px;
    background: rgba(255, 255, 255, .3);
}

.user-avator span {
    font-size: 16px;
    margin: 0 5px;
}

.user-avator i.iconfont {
    color: #fff;
    font-size: 25px;
    transform: translateY(2.5px);
    display: inline-block;
    line-height: 30px;
}

.userout {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.userout > div {
    width: 33.3%;
    color: rgba(51, 137, 185, 1);
    cursor: pointer;
    text-align: center;
}

.SignOut {
    width: 100%;
    height: 30px;
    color: #fff;
    text-align: center;
    line-height: 30px;
    background: rgba(51, 137, 185, 1);
    margin-top: 20px;
    cursor: pointer;
}

.SignOut:hover {
    opacity: .8;
}

.header-name-jiantou {
    position: static !important;
}

.el-menu-demo > li:first-of-type {
    position: fixed;
    left: 40%;
    top: 0;
}

.menu-create {
    line-height: 15px;
    text-align: center;
    padding-top: 15px;
}

.menu-create .el-icon-plus {
    font-size: 12px;
    line-height: 12px;
}

.menu-edit {
    line-height: 36px;
    float: right;
}

.pop-window-assetType-content {
    padding: 1px 15px 15px 20px;
}

.pop-window {
    height: 370px;
    width: 400px;
}

.right-box-top-btns {
    text-align: center;
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
