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
      const defaultAppearance = {
        system_name: localStorage.getItem('nz-sys-name'),
        system_logo: localStorage.getItem('nz-sys-logo'),
        system_favicon: localStorage.getItem('nz-sys-favicon'),
        language: localStorage.getItem('nz-language'),
        timezone: localStorage.getItem('nz-sys-timezone'),
        theme: localStorage.getItem('nz-default-theme'),
        system_bgImg: localStorage.getItem('nz-sys-bgImg'),
        dateFormat: localStorage.getItem('nz-default-dateFormat')
      }
      localStorage.setItem('nz-token', res.data.token)
      localStorage.setItem('nz-sys-name', res.data.systemName || defaultAppearance.system_name)
      if (res.systemLogo || defaultAppearance.system_logo) {
        localStorage.setItem('nz-sys-logo', res.data.systemLogo || defaultAppearance.system_logo)
      }
      localStorage.setItem('nz-sys-timezone', res.data.timezone || defaultAppearance.timezone)

      const currentTheme = res.data.user.theme ? theme.find(t => t.value === res.data.user.theme).label : defaultAppearance.theme
      localStorage.setItem(`nz-user-${res.data.user.id}-theme`, currentTheme)
      const body = document.getElementsByTagName('body')[0]
      body.setAttribute('class', `theme-${currentTheme}`)

      localStorage.setItem('timezoneOffset', moment.tz(res.data.timezone || defaultAppearance.timezone).format('Z'))
      localStorage.setItem('nz-sys-default-cabinet-usize', res.data.defaultCabinetUsize)
      localStorage.setItem('nz-sys-max-terminal-num', res.data.maxTerminalNum)
      localStorage.setItem('nz-sys-asset-ping-switch', res.data.assetPingSwitch)
      localStorage.setItem('nz-unnsaved-change', res.data.unsavedChange)
      localStorage.setItem('nz-mfa-enable', Number(res.data.mfaAuthEnable) ? 1 : 0)
      store.commit('setLanguage', res.data.user.lang || defaultAppearance.language)
      post('/sys/user/permissions', { token: res.data.token }).then(res => {
        const menuList = sortByOrderNum(res.data.menus)
        store.commit('setMenuList', menuList)
        store.commit('setButtonList', res.data.buttons)
        store.commit('setRoleList', res.data.roles)
        bus.$emit('login')
        router.push({
          path: menuList[0].children[0].route,
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
      localStorage.removeItem('nz-username')
      localStorage.removeItem('nz-username')
      localStorage.removeItem('nz-token')
    }
  }
}
export default user
