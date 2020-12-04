import axios from 'axios'

axios.interceptors.request.use(config => {
      let token = sessionStorage.getItem('nz-token');
      if (token) {
          config.headers['Authorization'] = token //请求头token
        }
        return config;
      },
      err => Promise.reject(err)
);
const accountErrorCode = [518003, 518004, 518005, 518006, 518007, 518008]; //账号锁定等
axios.interceptors.response.use(
    response => {
      if(response.status === 200){
        if(accountErrorCode.indexOf(response.data.code) != -1) {
          window.location.href = "/";
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
