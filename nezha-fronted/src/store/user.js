import { post, get } from '@/http'
import router from '../router'
import bus from '../libs/bus'
import { returnMenuCode, sortByOrderNum } from '@/permission'
import moment from 'moment-timezone'
import { theme } from '@/components/common/js/constants'

const noJumpPath = ['/', '/login', '/ui/login']
const user = {
  state: {
    menuList: [],
    buttonList: [],
    roleList: [],
    language: localStorage.getItem('nz-language'),
    severityData: localStorage.getItem('nz-severityData') ? JSON.parse(localStorage.getItem('nz-severityData')) : [],
    severityDataWeight: localStorage.getItem('nz-severityDataWeight') ? JSON.parse(localStorage.getItem('nz-severityDataWeight')) : []
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
    setSeverityData (state, severityData) {
      localStorage.setItem('nz-severityData', JSON.stringify(severityData))
      state.severityData = [...severityData]
      const arr = JSON.parse(JSON.stringify(severityData.reverse()))
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          if (arr[i].weight < arr[j].weight) {
            const temp = arr[i]
            arr[i] = arr[j]
            arr[j] = temp
          }
        }
      }
      localStorage.setItem('nz-severityDataWeight', JSON.stringify(arr))
      state.severityDataWeight = arr
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
    },
    severityData (state) {
      return state.severityData
    },
    severityDataWeight (state) {
      return state.severityDataWeight
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
      localStorage.setItem('nz-unsaved-change', res.data.unsavedChange)
      localStorage.setItem('nz-mfa-enable', Number(res.data.mfaAuthEnable) ? 1 : 0)
      localStorage.setItem('nz-history-size', res.data.history_size ? res.data.history_size : 100)
      store.commit('setLanguage', res.data.user.lang || defaultAppearance.language)
      store.commit('setTimeFormatMain', localStorage.getItem('nz-default-dateFormat') || 'YYYY-MM-DD HH:mm:ss')
      // 获取可选语言
      get('/sys/dict/all?type=lang').then(response => {
        if (response.code === 200) {
          const langList = response.data.map(lang => ({ name: lang.name, value: lang.value }))
          store.commit('setLangList', langList)
          localStorage.setItem('nz-language-list', JSON.stringify(langList))
        }
      })
      post('/sys/user/permissions', { token: res.data.token }).then(res => {
        const menuList = sortByOrderNum(res.data.menus)
        // localStorage.setItem('nz-user-permissions', JSON.stringify(res.data.buttons))
        store.commit('setMenuList', menuList)
        const arr = []
        returnMenuCode(menuList, arr)
        store.commit('setButtonList', arr)
        store.commit('setRoleList', res.data.roles)
        bus.$emit('login')
        const path = []
        if (menuList) {
          menuList.forEach(e => {
            if (e.route) {
              path.push(e.route)
            } else {
              if (e.children) {
                e.children.forEach(e => {
                  if (e.route) {
                    path.push(e.route)
                  } else {
                    if (e.children) {
                      e.children.forEach(e => {
                        if (e.route) {
                          path.push(e.route)
                        }
                      })
                    }
                  }
                })
              }
            }
          })
        }
        // 登录成功后跳回到原来页面
        if (sessionStorage.getItem('nz-previous-page') && noJumpPath.indexOf(sessionStorage.getItem('nz-previous-page')) === -1) {
          const route = sessionStorage.getItem('nz-previous-page')
          router.push({
            path: route,
            query: {
              t: +new Date()
            }
          }).then(() => {
            sessionStorage.removeItem('nz-previous-page')
          })
        } else {
          sessionStorage.removeItem('nz-previous-page')
          router.push({
            path: path[0],
            query: {
              t: +new Date()
            }
          })
        }
      })
      get('/sys/user/profile').then(response => {
        if (response.code === 200) {
          const user = response.user
          // 保存当前用户的 userId
          localStorage.setItem('nz-user-id', user.id)
          // 保存当前用户 name
          localStorage.setItem('nz-username', user.name)
        }
      })
      get('alert/severity', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          store.commit('setSeverityData', response.data.list)
        }
      })
    },
    logoutSuccess (store, res) {
      localStorage.removeItem('nz-username')
      localStorage.removeItem('nz-username')
      localStorage.removeItem('nz-token')
      localStorage.removeItem('nz-user-id')
      store.commit('closeTerminal')
    }
  }
}
export default user
