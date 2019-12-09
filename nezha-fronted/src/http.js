import axios from 'axios'
import qs from 'qs' //引入数据格式化
axios.defaults.baseURL = 'http://192.168.40.247:8080/nz-admin';
axios.interceptors.request.use(config => {
      config.headers = {
        "Content-Type": 'application/x-www-form-urlencoded',
      }
      config.data = qs.stringify(config.data);
      let token = sessionStorage.getItem('token')
      if (token) {
        config.headers['Authorization'] = token //请求头token
      }
      return config;
    },
    err => Promise.reject(err));

export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: params
    }).then(response => {
      resolve(response.data)
    }).catch(err => {
      reject(err.response.data)
    })
  })
}

export function post(url, params) {
  return new Promise((resolve, reject) => {
    axios.post(url, params).then(response => {
      resolve(response.data)
    }).catch(err => {
      console.info(err)
      reject(err.response.data)
    })
  })
}

export function put(url, params) {
  return new Promise((resolve, reject) => {
    //params = qs.stringify(Object.assign(params));
    //console.info(params);
    axios.put(url, params).then(response => {
      resolve(response.data)
    }).catch(err => {
      console.info(err)
      reject(err.response.data)
    })
  })
}

export function del(url, params) {
  return new Promise((resolve, reject) => {
    axios.delete(url, params).then(response => {
      resolve(response.data)
    }).catch(err => {
      console.info(err)
      reject(err.response.data)
    })
  })
}
