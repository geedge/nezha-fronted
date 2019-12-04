import axios from 'axios'
import qs from 'qs' //引入数据格式化

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
      reject(err.response.data)
    })
  })
}
