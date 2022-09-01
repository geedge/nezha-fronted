import router from './router'
import store from './store'
import { get, post, requestsArr } from './http'
import ElementUI from 'element-ui'
import Vue from 'vue'
import i18n, { loadI18n } from './components/common/i18n'
import VueResource from 'vue-resource'
import bus from '@/libs/bus'
Vue.use(VueResource)

const loginWhiteList = ['/setup', '/sys/license/upload', '/sys/license/state', '/sys/appearance', '/i18n'] // 免登陆白名单
const permissionWhiteList = ['/profile', '/menu', ...loginWhiteList] // 权限白名单
router.beforeEach((to, from, next) => {
  if (window.entrance) {
    next()
    return
  }
  if (store.getters.getNowPath !== to.path && store.getters.getNowPath !== '/login') {
    requestsArr.forEach(xhr => xhr.cancel('cancel'))
  }
  store.commit('setNowPath', to.path)
  const configUrl = 'static/config.json?Timestamp=' + new Date().getTime()
  if (to.path === '/login') { // 拦截登录页面，现货区外观设置 再系统初始化检查
    Vue.http.get(configUrl).then(config => {
      const appearance = new Promise(resolve => {
        get(config.body.baseUrl + 'sys/appearance').then(res => {
          if (res.code === 200) {
            localStorage.setItem('nz-sys-name', res.data.system_name || '')
            localStorage.setItem('nz-sys-logo', res.data.system_logo || '')
            localStorage.setItem('nz-sys-favicon', res.data.system_favicon || '')
            localStorage.setItem('nz-language', res.data.language || '')
            store.commit('setLanguage', res.data.language)
            localStorage.setItem('nz-sys-timezone', res.data.timezone || '')
            localStorage.setItem('nz-sys-bgImg', res.data.system_bgImg || '')
            localStorage.setItem('nz-default-theme', res.data.theme || '')
            localStorage.setItem('nz-default-dateFormat', res.data.dateFormat || '')
            changeFavicon(res.data.system_favicon)
          }
          resolve()
        })
      })
      appearance.then(() => {
        get(config.body.baseUrl + 'setup/inited').then(res => {
          if (res.code === 200) {
            if (res.inited === 0) {
              next({ path: '/setup' })
            } else {
              if (localStorage.getItem('nz-token')) {
                store.commit('i18nReady', false)
                post('/sys/user/permissions', { token: localStorage.getItem('nz-token') }).then(res => {
                  if (res.code === 200) {
                    const menuList = sortByOrderNum(res.data.menus)
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
                    router.push({
                      path: path[0],
                      query: {
                        t: +new Date()
                      }
                    })
                  } else {
                    localStorage.setItem('nz-token', '')
                    next()
                  }
                })
              } else {
                const langList = localStorage.getItem('nz-language-list')
                if (langList) {
                  store.commit('setLangList', JSON.parse(langList))
                }
                if (!store.getters.i18nIsReady) {
                  get(config.body.baseUrl + 'sys/i18n/lang').then(res => {
                    if (res.code === 200) {
                      loadI18n(res.data)
                      store.commit('i18nReady', true)
                    }
                  })
                }
                next()
              }
            }
          }
        })
      })
    })
  } else if (localStorage.getItem('nz-token')) {
    const i18nRequest = new Promise(resolve => {
      // 从localStorage加载i18n
      const langList = localStorage.getItem('nz-language-list')
      if (langList) {
        store.commit('setLangList', JSON.parse(langList))
      }
      if (!store.getters.i18nIsReady) {
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
              const arr = []
              returnMenuCode(res.data.menus, arr)
              store.commit('setButtonList', arr)
              store.commit('setRoleList', res.data.roles)
              if (localStorage.getItem('nz-user-id')) {
                const theme = localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`) || 'light'
                document.getElementsByTagName('body')[0].setAttribute('class', 'theme-' + theme)
              }
              resolve()
            } else {
              localStorage.removeItem('nz-token')
              sessionStorage.setItem('nz-previous-page', to.fullPath)
              next({ path: '/login' })
            }
          })
        })
      } else {
        if (localStorage.getItem('nz-user-id')) {
          const theme = localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`) || 'light'
          document.getElementsByTagName('body')[0].setAttribute('class', 'theme-' + theme)
        }
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
      sessionStorage.setItem('nz-previous-page', to.fullPath)
      next({ path: '/login' })
    }
  }
})
router.afterEach((to, from) => {
  // store.commit('setNowPath', '')
})

// menuList中是否包含route权限
export function hasMenu (menuList, route) {
  let flag = false
  menuList.forEach(menu => {
    if (menu.route == route) {
      flag = true
    } else {
      if (menu.children && !flag) {
        flag = hasMenu(menu.children, route)
      }
    }
  })
  return flag
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
export function returnMenuCode (menuList, arr) {
  menuList.forEach(item => {
    arr.push(item.code)
    if (item.children) {
      returnMenuCode(item.children, arr)
    }
  })
}
function getChildMenu (menu) {
  return menu.children.filter(m => m.type == 1)
}
function changeFavicon (link) { // 设置网页标签的图片
  let $favicon = document.querySelector('link[rel="icon"]')
  // If a <link rel="icon"> element already exists,
  // change its href to the given link.
  if ($favicon !== null) {
    $favicon.href = link
    // Otherwise, create a new element and append it to <head>.
  } else {
    $favicon = document.createElement('link')
    $favicon.rel = 'icon'
    $favicon.href = link
    document.head.appendChild($favicon)
  }
}
