import vm from '../../../main'

export function host(rule, value, callback) {
  console.log("callback:")
  console.log(callback)
  console.log(typeof callback)

  if(!value || value == ''){
    callback(new Error(vm.$t('validate.required')))
  }
  const hostReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  setTimeout(() => {
    if (hostReg.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('validate.host')))
    }

  }, 100)
}

export function phone(rule, value, callback) {
  if(!value || value == ''){
    callback()
  }
  const phoneReg = /^1[3|4|5|7|8][0-9]{9}$/
  setTimeout(() => {
    if (!Number.isInteger(+value)) {
      callback(new Error(vm.$t('validate.tel')))
    } else {
      if (phoneReg.test(value)) {
        callback()
      } else {
        callback(new Error(vm.$t('validate.tel')))
      }
    }
  }, 100)
}

export function port(rule, value, callback) {
  if(!value || value == ''){
    callback(new Error(vm.$t('validate.required')))
  }
  setTimeout(() => {
    if(typeof value != 'number'){
      callback(new Error(vm.$t('validate.number')))
    }
    if(value < 1 ||value > 65535){
      callback(new Error(vm.$t('validate.port')))
    }
  }, 100)
}
