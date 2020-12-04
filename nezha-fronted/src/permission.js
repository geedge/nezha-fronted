import Vue from 'vue';
import router from './router';
import store from './store';
import {post} from './http';

const loginWhiteList = ['/login']; // 免登陆白名单
const permissionWhiteList = ['/login']; // 权限白名单

router.beforeEach((to, from, next) => {
  if (sessionStorage.getItem('nz-token')) {
    if (loginWhiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      new Promise(resolve => {
        if (store.getters.menuList.length === 0) {
          post("/sys/user/permissions", {token: sessionStorage.getItem("nz-token")}).then(res => {
            store.commit("setMenuList", res.data.menus);
            store.commit("setButtonList", res.data.buttons);
            store.commit("setRoleList", res.data.roles);
            resolve();
          });
        } else {
          resolve();
        }
      }).then(res => {
        let has = hasMenu(store.getters.menuList, to.path);
        if (has) {
          next();
        } else {
          next({ path: '/login'})
        }
      });
    }
  } else {
    if (permissionWhiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      next({path: '/login'})
    }
  }
});

function hasMenu(menuList, route) {
  return menuList.some(menu => {
    if (menu.route == route) {
      return true;
    } else {
      if (menu.children) {
        hasMenu(menu.children, route);
      }
    }
  });
}
