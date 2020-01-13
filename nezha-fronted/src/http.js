import axios from 'axios'
import router from './router'

import qs from 'qs'
import he from "element-ui/src/locale/lang/he"; //引入数据格式化
//axios.defaults.baseURL = 'http://localhost:8088/nz-admin';
// axios.defaults.baseURL = 'http://192.168.41.101:8088/nz-admin';
//axios.defaults.baseURL = 'http://192.168.40.247:8080/nz-admin';

axios.interceptors.request.use(config => {
      // config.headers = {
      //   "Content-Type": 'application/x-www-form-urlencoded',
      // }
      // config.data = qs.stringify(config.data);
      let token = sessionStorage.getItem('nz-token')
      if (token) {
        config.headers['Authorization'] = token //请求头token
      }
      return config;
    },
    err => Promise.reject(err)
);
axios.interceptors.response.use(
    response => {
      if(response.status === 200){
        if(response.data.code == 101007){
          router.push({
            path: "/login"
          })
        }
      }
      return response
    },
    error => {
      return Promise.reject(error)
    }
)
export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: params
    }).then(response => {
      resolve(response.data)
    }).catch(err => {
      if(err.response){
        resolve(err.response.data);
      }else if(err.message){
        resolve(err.message);
      }
    })
  })
}

export function post(url, params,headers) {
  return new Promise((resolve, reject) => {
    axios.post(url, params,{headers:headers}).then(response => {
      resolve(response.data)
    }).catch(err => {
      resolve(err.response.data);
    })
  })
}

export function put(url, params,headers) {
  return new Promise((resolve, reject) => {
    axios.put(url, params,{headers:headers}).then(response => {
      resolve(response.data)
    }).catch(err => {
      console.info(err)
      resolve(err.response.data);
    })
  })
}

export function del(url, params) {
  return new Promise((resolve, reject) => {
    axios.delete(url, params).then(response => {
      resolve(response.data)
    }).catch(err => {
      console.info(err)
      resolve(err.response.data)
    })
  })
}
