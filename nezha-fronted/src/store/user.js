import {post} from '../http';
import router from '../router';
import bus from '../libs/bus';
import {sortByOrderNum} from "../permission";
import store from "./index";

const user = {
  state: {
    menuList: [],
    buttonList: [],
    roleList: []
  },
  mutations: {
    setMenuList(state, menuList) {
      state.menuList = [...menuList];
    },
    setButtonList(state, buttonList) {
      state.buttonList = [...buttonList];
    },
    setRoleList(state, roleList) {
      state.roleList = [...roleList];
    }
  },
  getters: {
    menuList(state) {
      return state.menuList;
    },
    buttonList(state) {
      return state.buttonList;
    },
    roleList(state) {
      return state.roleList;
    },
  },
  actions: {
    loginSuccess(store, res) {
      sessionStorage.setItem("nz-token", res.data.token);
      localStorage.setItem('nz-sys-name',res.data.systemName);
      localStorage.setItem('nz-sys-timezone',res.data.timezone);
      localStorage.setItem('nz-sys-default-cabinet-usize',res.data.defaultCabinetUsize);
      localStorage.setItem('nz-sys-max-terminal-num',res.data.maxTerminalNum);
      localStorage.setItem('nz-sys-asset-ping-switch',res.data.assetPingSwitch);

      post("/sys/user/permissions", {token: res.data.token}).then(res => {
        let menuList = sortByOrderNum(res.data.menus);
        store.commit("setMenuList", menuList);
        store.commit("setButtonList", res.data.buttons);
        store.commit("setRoleList", res.data.roles);

        bus.$emit("login");
        router.push({
          path: menuList.find(menu => {return menu.route && menu.route != "/header"}).route,
          query: {
            t: +new Date()
          }
        });
      });
    }
  },
};
export default user;
