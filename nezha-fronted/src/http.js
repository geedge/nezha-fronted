import { getUUID } from './components/common/js/common'
import axios from 'axios'
const CancelToken = axios.CancelToken // 申明CancelToken
export const requestsArr = []
// 清除掉请求完成的实例 防止占用内存
const removePending = (config) => {
  if (!config) {
    return false
  }
  for (const i in requestsArr) {
    if (requestsArr[i].id === config.id) {
      requestsArr.splice(i, 1)
    }
  }
}
axios.interceptors.request.use(
  config => {
    const source = CancelToken.source() // 申明CancelToken,也可new CancelToken.source()实例一个
    config.cancelToken = source.token // 将实例对象的token赋予该请求
    const id = getUUID() // 添加唯一识别id 在请求完成时清除requestsArr
    config.id = id
    requestsArr.push({
      id,
      cancel: source.cancel
    }) // 将该实例添加到队列中
    const token = localStorage.getItem('nz-token')
    if (token) {
      config.headers.Authorization = token // 请求头token
    }
    const lang = localStorage.getItem('nz-language')
    if (lang) {
      config.headers.Language = lang // 请求头token
    }
    return config
  }, err => {
    Promise.reject(err)
  }
)
const accountErrorCode = [518003, 518004, 518005, 518006, 518007, 518008] // 账号锁定等
const licenceErrorCode = [711001]
const noJumpPath = ['#/', '#/login']

// 若get请求的url中带问号，则将url上的参数截取，改为对象形式传参
axios.interceptors.request.use(
  config => {
    const url = config.url
    const index = url.indexOf('/mock')
    if (index > -1) {
      let arr = url.split('/mock')
      arr[0] = 'https://www.fastmock.site/mock/24d362bd12f55ec96f707ee6acad1901/nz-admin'
      arr = arr.join('')
      config.url = arr
    }
    if (config.method === 'get') {
      const url = config.url
      const index = url.indexOf('?')
      if (index > -1) {
        const pre = url.substring(0, index)
        const suf = url.substring(index + 1, url.length)
        const paramsArr = suf.split('&')
        const params = {}
        paramsArr.forEach(p => {
          const i = p.indexOf('=')
          if (i > -1) {
            params[p.substring(0, i)] = p.substring(i + 1, p.length)
          } else {
            params[p] = ''
          }
        })
        config = { ...config, url: pre, params: params }
      }
    }
    return config
  }
)
axios.interceptors.response.use(
  response => {
    if (response.config.url.indexOf('ui') !== -1) {
      removePending(response.config)
      return response
    }
    if (licenceErrorCode.indexOf(response.data.code) !== -1 && noJumpPath.indexOf(window.location.hash) == -1) {
      window.location.href = '/'
    } else if (response.status === 200) {
      if (accountErrorCode.indexOf(response.data.code) !== -1 && noJumpPath.indexOf(window.location.hash) == -1) {
        window.location.href = '/'
      }
    } else {
      removePending(response.config)
      return response
    }
    // 请求完成在数组中移除
    removePending(response.config)
    return response
  },
  error => {
    // 请求完成在数组中移除
    removePending(error.config)
    return Promise.reject(error)
  }
)
export function get (url, params, responseType) {
  const config = {
    params: params
  }
  if (responseType) {
    config.responseType = responseType
  }
  return new Promise((resolve) => {
    axios.get(url, config).then(response => {
      if (url.indexOf('/sys/license/token') !== -1) {
        resolve({
          data: response.data,
          headers: response.headers
        })
      }
      resolve(response.data)
    }).catch(err => {
      if (err.response) {
        resolve(err.response.data)
      } else if (err.message) {
        if (err.message !== 'cancel') { // 判断是否是路由跳转取消的请求（是的话没必要提示message）
          resolve(err.message)
        }
      } else {
        resolve(err)
      }
    })
  })
}

export function post (url, params, headers) {
  return new Promise(resolve => {
    axios.post(url, params, { headers: headers }).then(response => {
      if (url.indexOf('/sys/license/gen') !== -1) {
        resolve({
          data: response.data,
          headers: response.headers
        })
      }
      resolve(response.data, response)
    }).catch(err => {
      if (err.response) {
        resolve(err.response.data)
      } else if (err.message) {
        resolve(err.message)
      } else {
        resolve(err)
      }
    })
  })
}

export function put (url, params, headers) {
  return new Promise((resolve) => {
    axios.put(url, params, { headers: headers }).then(response => {
      resolve(response.data, response)
    }).catch(err => {
      if (err.response) {
        resolve(err.response.data)
      } else if (err.message) {
        resolve(err.message)
      } else {
        resolve(err)
      }
    })
  })
}

export function del (url, params) {
  return new Promise((resolve) => {
    axios.delete(url, params).then(response => {
      resolve(response.data, response)
    }).catch(err => {
      if (err.response) {
        resolve(err.response.data)
      } else if (err.message) {
        resolve(err.message)
      } else {
        resolve(err)
      }
    })
  })
}
