import router from './router'
import store from './store'
import { get, post } from './http'
import ElementUI from 'element-ui'
import Vue from 'vue'
import i18n, { loadI18n } from './components/common/i18n'
import VueResource from 'vue-resource'

Vue.use(VueResource)

const loginWhiteList = ['/setup', '/sys/license/upload', '/sys/license/state'] // 免登陆白名单
const permissionWhiteList = ['/profile', '/menu', ...loginWhiteList] // 权限白名单

router.beforeEach((to, from, next) => {
  const configUrl = 'static/config.json?Timestamp=' + new Date().getTime()
  if (to.path === '/login') { // 拦截登录页面，系统初始化检查
    Vue.http.get(configUrl).then(config => {
      get(config.body.baseUrl + 'setup/inited').then(res => {
        if (res.code === 200) {
          if (res.inited === 0) {
            next({ path: '/setup' })
          } else {
            if (localStorage.getItem('nz-token')) {
              next({
                path: 'overview',
                query: {
                  t: +new Date()
                }
              })
            } else {
              next()
            }
          }
        }
      })
      if (!store.getters.i18nIsReady) {
        get(config.body.baseUrl + 'sys/i18n/lang').then(res => {
          if (res.code === 200) {
            loadI18n(res.data)
            store.commit('i18nReady', true)
          }
        })
      }
    })
  } else if (localStorage.getItem('nz-token')) {
    const i18nRequest = new Promise(resolve => {
      // 从localStorage加载i18n
      if (!store.getters.i18nIsReady) {
        const langList = localStorage.getItem('nz-language-list')
        if (langList) {
          store.commit('setLangList', JSON.parse(langList))
        }
        Vue.http.get(configUrl).then(config => {
          get(config.body.baseUrl + 'sys/i18n/lang').then(response => {
            if (response.code === 200) {
              loadI18n(response.data)
              store.commit('i18nReady', true)
              resolve()
            }
          })
        })
      } else {
        resolve()
      }
    })
    const permissionRequest = new Promise(resolve => {
      if (store.getters.menuList.length === 0) {
        Vue.http.get(configUrl).then(config => {
          post(config.body.baseUrl + 'sys/user/permissions', { token: localStorage.getItem('nz-token') }).then(res => {
            if (res.code === 200) {
              store.commit('setMenuList', sortByOrderNum(res.data.menus))
              store.commit('setButtonList', res.data.buttons)
              store.commit('setRoleList', res.data.roles)
              resolve()
            } else {
              localStorage.removeItem('nz-token')
              next({ path: '/login' })
            }
          })
        })
      } else {
        resolve()
      }
    })
    Promise.all([i18nRequest, permissionRequest]).then(response => {
      if (to.path) {
        if (permissionWhiteList.indexOf(to.path) !== -1) {
          next()
        } else if (hasMenu(store.getters.menuList, to.path)) {
          next()
        } else {
          if (to.path === '/monitor/monitor/project' || to.path === '/monitor/monitor/module' || to.path === '/monitor/monitor/endpoint') {
            return
          }
          ElementUI.Message.error(i18n.t('tip.noAccess'))
        }
      }
    })
  } else {
    if (loginWhiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next({ path: '/login' })
    }
  }
})

// menuList中是否包含route权限
export function hasMenu (menuList, route) {
  return menuList.some(menu => {
    if (menu.route == route) {
      return true
    } else {
      if (menu.children) {
        if (hasMenu(menu.children, route)) {
          return true
        }
      }
    }
    return false
  })
}

export function hasButton (buttonList, code) {
  return buttonList.some(button => button == code)
}

// 用法 v-has="code" | v-has="[code...]" 任意匹配一个 | v-has:all="[code...]" 全匹配
export const hasPermission = {
  install (Vue, options) {
    Vue.directive('has', {
      inserted: (el, binding, vnode) => {
        // 节点权限处理
        const buttonCode = binding.value
        const arg = binding.arg
        if (buttonCode) {
          if (buttonCode instanceof Array) {
            let has = true
            if (arg && arg === 'all') { // 全匹配
              buttonCode.forEach(button => {
                if (has) {
                  has = hasButton(store.getters.buttonList, button)
                }
              })
            } else { // 任意匹配
              has = buttonCode.some(button => {
                return hasButton(store.getters.buttonList, button)
              })
            }
            if (!has) {
              el.parentNode.removeChild(el)
            }
          } else { // 单个匹配
            if (!hasButton(store.getters.buttonList, buttonCode)) {
              el.parentNode.removeChild(el)
            }
          }
        }
      }
    })
  }
}

// 根据orderNum排序
export function sortByOrderNum (menuList) {
  const r = menuList.sort((a, b) => {
    return a.orderNum - b.orderNum
  })
  r.forEach(menu => {
    if (menu.children && getChildMenu(menu).length > 0) {
      menu.children = menu.children.sort((a, b) => {
        return a.orderNum - b.orderNum
      })
    }
  })
  return r
}

function getChildMenu (menu) {
  return menu.children.filter(m => m.type == 1)
}
