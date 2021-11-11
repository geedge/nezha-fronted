import { post, get } from '@/http'
import router from '../router'
import bus from '../libs/bus'
import { sortByOrderNum } from '@/permission'
import moment from 'moment-timezone'
import { theme } from '@/components/common/js/constants'

const user = {
  state: {
    menuList: [],
    buttonList: [],
    roleList: [],
    language: localStorage.getItem('nz-language')
  },
  mutations: {
    setLanguage (state, language) {
      state.language = language
    },
    setMenuList (state, menuList) {
      state.menuList = [...menuList]
    },
    setButtonList (state, buttonList) {
      state.buttonList = [...buttonList]
    },
    setRoleList (state, roleList) {
      state.roleList = [...roleList]
    },
    clean (state) {
      state.menuList = []
      state.buttonList = []
      state.roleList = []
    }
  },
  getters: {
    menuList (state) {
      return state.menuList
    },
    getLanguage (state) {
      return state.language
    },
    buttonList (state) {
      return state.buttonList
    },
    roleList (state) {
      return state.roleList
    }
  },
  actions: {
    loginSuccess (store, res) {
      sessionStorage.setItem('nz-token', res.data.token)
      localStorage.setItem('nz-sys-name', res.data.systemName)
      if (res.systemLogo) {
        localStorage.setItem('nz-sys-logo', res.data.systemLogo)
      }
      localStorage.setItem('nz-sys-timezone', res.data.timezone)

      const currentTheme = res.data.user.theme ? theme.find(t => t.value === res.data.user.theme).label : 'light'
      localStorage.setItem(`nz-user-${res.data.user.id}-theme`, currentTheme)
      const body = document.getElementsByTagName('body')[0]
      body.setAttribute('class', `theme-${currentTheme}`)

      localStorage.setItem('timezoneOffset', moment.tz(res.data.timezone).format('Z'))
      localStorage.setItem('nz-sys-default-cabinet-usize', res.data.defaultCabinetUsize)
      localStorage.setItem('nz-sys-max-terminal-num', res.data.maxTerminalNum)
      localStorage.setItem('nz-sys-asset-ping-switch', res.data.assetPingSwitch)
      localStorage.setItem('nz-unnsaved-change', res.data.unsavedChange)
      localStorage.setItem('nz-mfa-enable', Number(res.data.mfaAuthEnable) ? 1 : 0)
      store.commit('setLanguage', res.data.user.lang)
      console.log(res.data.user.lang)
      post('/sys/user/permissions', { token: res.data.token }).then(res => {
        const menuList = sortByOrderNum(res.data.menus)
        store.commit('setMenuList', menuList)
        store.commit('setButtonList', res.data.buttons)
        store.commit('setRoleList', res.data.roles)
        bus.$emit('login')
        router.push({
          path: 'overview',
          query: {
            t: +new Date()
          }
        })
      })
      get('/sys/user/profile').then(response => {
        if (response.code === 200) {
          const user = response.user
          // 保存当前用户的 userId
          localStorage.setItem('nz-user-id', user.id)
          // 保存当前用户 name
          localStorage.setItem('nz-user-name', user.name)
        }
      })
    },
    logoutSuccess (store, res) {
      sessionStorage.removeItem('nz-username')
      localStorage.removeItem('nz-username')
      sessionStorage.removeItem('nz-token')
    }
  }
}
export default user
