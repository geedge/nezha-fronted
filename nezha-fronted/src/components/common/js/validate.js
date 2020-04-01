import vm from '../../../main'

export function host(rule, value, callback) {
  const hostReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\:\d{0,5})?$/
  setTimeout(() => {
    if (hostReg.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('validate.host')))
    }
  }, 100)
}

export function phone(rule, value, callback) {
  const phoneReg = /^1[3|4|5|7|8][0-9]{9}$/
  setTimeout(() => {
    if (!value) {
      callback()
    } else if (!Number.isInteger(+value)) {
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
  setTimeout(() => {
    if (!value) {
      callback();
    } else if(Number(value) == 'NaN'){
      callback(new Error(vm.$t('validate.number')))
    }else{
      if(value < 1 ||value > 65535){
        callback(new Error(vm.$t('validate.port')))
      }else{
        callback();
      }
    }
  }, 100)
}

export function noSpecialChar(rule, value, callback){
  const charReg = /\w+/;
  setTimeout(() => {
    if (charReg.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('validate.special')))
    }
  }, 100)
}

export function positiveInteger(rule, value, callback){
  setTimeout(() => {
    if(Number(value) == 'NaN'){
      callback(new Error(vm.$t('validate.number')))
    }else{
      if(Number(value) >=0 ){
        callback();
      }else{
        callback(new Error(vm.$t('validate.positiveInteger')))
      }
    }
  }, 100)
}

export function domain(rule, value, callback){
  let urlReg=/^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
  setTimeout(() => {
    if (urlReg.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('validate.domain')))
    }
  }, 100)
}

