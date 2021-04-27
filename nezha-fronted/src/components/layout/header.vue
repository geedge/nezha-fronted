<template>
  <div class="header">
    <el-breadcrumb class="nz-breakcrumb" separator="/">
      <el-breadcrumb-item v-for="crumb in breadcrumb" :key="crumb.code">{{$t(crumb.i18n)}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="header-menu">
      <el-dropdown>
        <div class="header-menu&#45;&#45;item"><i class="nz-icon nz-icon-more-app"></i></div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item, index) in linkData" :key="index" :index="'0-' + index">
            <span class="link-title"><a :href='item.url' :title="item.name" rel="noopener norefferrer" target="_blank">{{item.name}}</a></span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown>
        <el-dropdown-menu slot="dropdown"></el-dropdown-menu>
        <div id="header-open-cli" @click="cli">
          <div class="header-menu&#45;&#45;item"><i class="nz-icon nz-icon-terminal"></i></div>
          <span v-show="$store.state.consoleCount>0" class="right-tip">{{$store.state.consoleCount<=10?$store.state.consoleCount:'10+'}}</span>
        </div>
      </el-dropdown>
      <el-dropdown>
        <div class="header-menu&#45;&#45;item"><i class="nz-icon nz-icon-create-square"></i></div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item, createIndex) in createMenu" :key="createIndex" v-has="item.permission" :index="`${createIndex}`">
            <div :id="'create-box-'+createIndex" @click="createBox(item)">
              <span>{{item.label}}</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!--个人操作-->
    <div class="personal">
      <el-dropdown>
        <div class="header-menu--item">
          <i class="nz-icon nz-icon-language-change"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <div id="header-to-english" :style="language=='en'?'color:#f90':''" @click="changeLocal('en')"><i class="nz-icon nz-icon-lang-en"></i>English</div>
          </el-dropdown-item>
          <el-dropdown-item>
            <div id="header-to-chinese" :style="language=='cn'?'color:#f90':''" @click="changeLocal('cn')"><i class="nz-icon nz-icon-lang-zh"></i>中文</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown>
        <div class='login-user header-menu--item'>{{username}}&nbsp;<i class="nz-icon nz-icon-arrow-down"></i></div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <div id="header-to-changepwd" @click="showPwdDialog">{{$t('overall.changePwd')}}</div>
          </el-dropdown-item>
          <el-dropdown-item>
            <div id="header-to-logout" @click="logout">{{$t('overall.signOut')}}</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <transition name="right-box">
      <project-box v-if="rightBox.project.show" ref="projectBox" :project="editProject" @close="closeProjectRightBox"></project-box>
    </transition>
    <transition name="right-box">
      <module-box v-if="rightBox.module.show" ref="moduleBox" :currentProject="currentProject" :module="editModule" @close="closeModuleRightBox"></module-box>
    </transition>
    <transition name="right-box">
      <add-endpoint-box v-if="rightBox.endpoint.show" ref="addEndpointBox" :currentModule="currentModule" :currentProject="currentProject" @close="closeEndpointRightBox"></add-endpoint-box>
    </transition>
    <transition name="right-box">
      <asset-box v-if="rightBox.asset.show" ref="assetAddUnit" :asset="editAsset" @close="closeAssetRightBox"></asset-box>
    </transition>
    <transition name="right-box">
      <alert-config-box v-if="rightBox.alertRule.show" ref="alertConfigBox" :alert-rule="editAlertRule" @close="closeAlertRuleRightBox"></alert-config-box>
    </transition>
    <transition name="right-box">
      <dc-box v-if="rightBox.dc.show" :dc="dc" :user-data="userData" @close="closeDcBox" @reload="getAssetData"></dc-box>
    </transition>
    <change-password :cur-user="username" :show-dialog="showChangePwd" @click="showPwdDialog" @dialogClosed="dialogClosed"></change-password>
  </div>
</template>

<script>
import bus from '../../libs/bus'
import dcBox from '../common/rightBox/dcBox' // dc弹框
import { mapActions } from 'vuex'
import changePwd from '../page/config/changePwd'
export default {
  name: 'Header',
  components: {
    'change-password': changePwd,
    'dc-box': dcBox
  },
  data () {
    return {
      username: sessionStorage.getItem('nz-username'),
      language: localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en',

      // 顶部菜单相关
      /* activeIndex: '', */
      activeItemIndex: '',
      activeItemIndexes: [],
      hoverItemIndex: '',
      dc: {
        id: '',
        name: '',
        location: '',
        tel: '',
        principal: '',
        area: {
          id: 0,
          name: ''
        }
      },
      userData: [],
      assetData: [], // 顶部菜单asset的下拉内容

      // add侧滑相关
      rightBox: {
        project: { show: false },
        module: { show: false },
        endpoint: { show: false },
        asset: { show: false },
        alertRule: { show: false },
        dc: { show: false }
      },
      projectData: [], // 顶部菜单project列表中的数据
      editProject: { id: '', name: '', remark: '' }, // 新增/编辑的project
      currentProject: { id: '', name: '', remark: '' }, // module/endpoint弹框用来回显project
      editModule: { type: 'http', name: '', project: {}, port: 9100, path: '', param: '', paramObj: [], labelModule: [], labels: '' }, // 新增/编辑的module
      currentModule: { id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: [], labels: '', labelModule: [] }, // endpoint弹框用来回显module，此处固定为空对象
      editEndpoint: { // 新增/编辑的endpoint
        id: '',
        host: '',
        port: '',
        param: '',
        path: '',
        asset: { id: '', name: '', host: '' },
        project: { id: '', name: '' },
        module: { id: '', name: '', param: '', paramObj: {}, projectId: '', labelModule: [], labels: '' },
        moduleId: '',
        assetId: '',
        labelModule: []
      },
      editAsset: {
        id: '',
        sn: '',
        host: '',
        state: 1,
        purchaseDate: '',
        idcId: '',
        cabinetId: '',
        modelId: '',
        model: { type: { code: '' } },
        assetType: '',
        impi: {
          host: '',
          port: ''
        },
        tags: [],
        accounts: []
      },
      editAlertRule: {
        id: '',
        alertName: '',
        linkObject: { id: '', name: '' },
        expr: '',
        unit: 2,
        operator: '>',
        last: 60,
        severity: 'P2',
        summary: '',
        description: ''
      },
      createMenu: [ // 新增按钮内容
        {
          label: this.$t('project.project.project'),
          url: 'project',
          type: 1,
          permission: 'header_add_project'
        },
        {
          label: this.$t('project.module.module'),
          url: 'project',
          type: 2,
          permission: 'header_add_module'
        },
        {
          label: this.$t('project.endpoint.endpoint'),
          url: 'project',
          type: 3,
          permission: 'header_add_endpoint'
        },
        {
          label: this.$t('asset.asset'),
          url: 'asset',
          type: 4,
          permission: 'header_add_asset'
        },
        {
          label: this.$t('alert.config.alertConfig'),
          url: 'alertConfig',
          type: 5,
          permission: 'header_add_rule'
        }
      ],
      showChangePwd: false
    }
  },
  methods: {
    ...mapActions(['logoutSuccess']),
    cli () {
      this.$store.commit('openConsole')
    },

    /**
       * @param route 路由地址
       * @param parentMenu 菜单大类
       * */
    jumpTo (route) {
      if (route != 'asset') {
        this.activeItemIndexes = []
      }
      this.$router.push({
        path: route,
        query: {
          t: +new Date()
        }
      })
    },
    getLinkData () {
      /* this.$get('link').then(response => {
        this.$store.commit('setLinkData', response.data)
      }) */
    },
    createBox (item) {
      if (item.type == 1) {
        this.rightBox.project.show = true
        this.editProject = { id: '', name: '', remark: '' }
      } else if (item.type == 2) {
        this.rightBox.module.show = true
        this.editModule = {
          name: '',
          project: {},
          port: 9100,
          path: '',
          param: '',
          labels: '',
          type: 'http',
          paramObj: [],
          snmpParam: '',
          labelModule: [],
          // snmp setting 下划线命名是因为业务需求
          walk: [],
          version: 2, // 2/3
          max_repetitions: 25,
          retries: 3,
          timeout: 10, // s
          community: 'public',
          username: '',
          security_level: 'noAuthNoPriv', // noAuthNoPriv/authNoPriv/authPriv
          password: '',
          auth_protocol: 'MD5', // MD5/SHA
          priv_protocol: 'DES', // DES/AES
          priv_password: '',
          context_name: ''
        }
      } else if (item.type == 3) {
        this.rightBox.endpoint.show = true
      } else if (item.type == 4) {
        this.rightBox.asset.show = true
      } else if (item.type == 5) {
        this.rightBox.alertRule.show = true
      } else if (item.type == 6) {
        this.rightBox.dc.show = true
      }
    },
    jumpToAsset (dc) {
      if (dc) {
        this.activeItemIndex = dc.id
        this.$store.commit('setCurrentDc', dc.id)
        bus.$emit('header-dc-change', dc.id) // 发送给leftMenu，顶部dc条件改变了
      } else {
        this.activeItemIndex = ''
        this.$store.commit('setCurrentDc', '')
        bus.$emit('clear-asset-filter') // 清除leftMenu左侧菜单过滤条件
      }
      this.jumpTo('/asset')
    },
    jumpToProject (p) {
      if (!this.hasButton('project_view')) {
        return
      }
      this.currentProject = p
      if (p.id !== this.$store.state.currentProject.id) {
        bus.$emit('project-page-type', 'project')
      }
      this.$store.commit('currentProjectChange', p)
      this.activeItemIndex = p.id
      this.jumpTo('/project')
    },
    getAssetData () {
      this.$get('idc', { pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.assetData = response.data.list
          this.assetData.forEach(item => {
            this.$set(item, item.name, false)
          })
          this.$store.commit('setIdcArr', this.assetData)
        }
      })
    },
    changeLocal (lang) {
      if (lang != localStorage.getItem('nz-language')) {
        localStorage.setItem('nz-language', lang)
        this.$i18n.locale = lang
        window.location.reload()
      }
    },
    getProjectList () {
      this.$get('monitor/project', { pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.projectData = response.data.list
          let flag = false
          // 如果currentProject不在新取到的数据里，说明它被删了
          for (let i = 0; i < this.projectData.length; i++) {
            if (this.projectData[i].id == this.currentProject.id) {
              flag = true
              break
            }
          }
          if (!flag && this.projectData.length > 0) {
            this.currentProject = this.projectData[0]
            this.activeItemIndex = this.currentProject.id
            this.$store.commit('currentProjectChange', this.currentProject)
          }
        }
      })
    },
    getUserData () {
      return new Promise(resolve => {
        this.$get('sys/user', { pageSize: -1, pageNo: 1 }).then(response => {
          if (response.code === 200) {
            this.userData = response.data.list
          }
          resolve()
        })
      })
    },
    closeProjectRightBox (refresh) {
      this.rightBox.project.show = false
      if (refresh) {
        this.getProjectList()
        bus.$emit('project-list-change')
      }
    },
    closeModuleRightBox (refresh) {
      this.rightBox.module.show = false
      if (refresh) {
        bus.$emit('module-list-change')
      }
    },
    closeEndpointRightBox (refresh) {
      this.rightBox.endpoint.show = false
      if (refresh) {
        bus.$emit('endpoint-list-change')
      }
    },
    closeAssetRightBox (refresh) {
      this.rightBox.asset.show = false
      if (refresh) {
        bus.$emit('asset-list-change')
      }
    },
    closeAlertRuleRightBox (refresh) {
      this.rightBox.alertRule.show = false
      if (refresh) {
        bus.$emit('alert-rule-list-change')
      }
    },
    closeDcBox (refresh) {
      this.rightBox.dc.show = false
      if (refresh) {
        this.getAssetData()
        bus.$emit('dc-list-change')
      }
    },
    toEditProject (p) {
      this.editProject = Object.assign({}, p)
      this.rightBox.project.show = true
    },
    logout () {
      this.$get('logout').then(() => {
        this.logoutSuccess()
        document.location.href = '/'
      })

      // this.jumpTo('/login');
    },
    refreshLang () {
      this.language = localStorage.getItem('nz-language')
      this.$i18n.locale = this.language
      this.$nextTick(() => {
        window.location.reload()
      })
    },
    showPwdDialog () {
      this.showChangePwd = true
    },
    dialogClosed () {
      this.showChangePwd = false
    },
    cancel () {
      this.jumpTo(this.$route.path.slice(1, this.$route.path.length))
    },

    initEvent () {
      bus.$on('login', () => {
        this.username = sessionStorage.getItem('nz-username')
        this.refreshLang()
      })
      bus.$on('dc-list-change', () => { // dc.vue增删改dc时刷新顶部菜单dc列表
        this.getAssetData()
      })
      bus.$on('current-project-change', project => {
        this.currentProject = project
        this.activeItemIndex = project.id
      })
      if (window.history && window.history.pushState) {
        history.pushState(null, null, document.URL)
        window.addEventListener('popstate', this.cancel, false)
      }
    }
  },
  mounted () {
    this.$i18n.locale = this.language
    if (sessionStorage.getItem('nz-token')) {
      this.initEvent()
      this.getAssetData()
      this.getUserData()
      this.getProjectList()
      this.getLinkData()
    }
    // 刷新后有高亮
    /* let activePath = this.$route.path.slice(1);
      this.activeIndex = activePath; */
  },
  computed: {
    linkData () {
      return this.$store.getters.getLinkData
    },
    route () {
      return this.$route.path
    },
    overViewProject () {
      return this.$store.getters.getOverViewProject
    },
    menuIsActive () {
      return function (menu, isParent) {
        if (isParent) {
          const isCurrent = menu.children.some(sub => {
            return sub.route == this.route
          })
          if (isCurrent) {
            return 'menu-active'
          } else {
            return ''
          }
        } else {
          if (menu.route == this.route) {
            return 'menu-item-active'
          } else {
            return ''
          }
        }
      }
    },
    breadcrumb () {
      const vm = this
      const menuList = this.$store.getters.menuList
      const breadcrumb = []
      getBreadCrumb(menuList, breadcrumb)
      function getBreadCrumb (list, crumb) {
        for (let i = 0; i < list.length; i++) {
          if (list[i].route === vm.$route.path) {
            crumb.unshift(list[i])
            return true
          } else {
            if (getBreadCrumb(list[i].children, crumb)) {
              crumb.unshift(list[i])
              return true
            }
          }
        }
      }
      return breadcrumb
    }
  },
  watch: {
    overViewProject (n) {
      if (n) {
        this.jumpToProject(n)
      }
    }
  },
  beforeDestroy () {
    bus.$off('login')
    bus.$off('dc-list-change')
    bus.$off('current-project-change')
  },
  destroyed () {
    window.removeEventListener('popstate', this.cancel, false)
  }
}
</script>

<style lang="scss">
.header {
  display: flex;
  height: 50px;

  .header-menu {
    display: flex;
    justify-content: flex-end;
    flex-grow: 1;

    .el-dropdown {
      width: 60px;
      text-align: center;
      height: 36px;
      line-height: 50px;
    }
  }
  .header-menu--item {
    color: #778391;
    cursor: pointer;
    transition: color linear .2s;
    i {
      font-size: 18px;
    }
  }
  .header-menu--item:hover {
    color: #313336;
  }
  .personal {
    display: flex;
    .el-dropdown {
      margin: 0 10px 0 30px;
      height: 36px;
      line-height: 50px;
      text-align: center;
    }
    .login-user {
      color: #333;
      i {
        color: #999;
        font-size: 12px;
      }
    }
  }
  .right-tip {
    position: absolute;
    left: 30px;
    top: 10px;
    padding: 0 6px;
    line-height: 15px;
    height: 15px;
    background-color: #ba3939;
    opacity: .9;
    border-radius: 7px;
    color: white;
    font-size: 6px;
  }
}
.link-title a {
  color: inherit;
  text-decoration: none;
}
.nz-breakcrumb {
  padding-left: 20px;
  line-height: 50px;

  .el-breadcrumb__item .el-breadcrumb__inner {
    color: #999;
  }
}
</style>
