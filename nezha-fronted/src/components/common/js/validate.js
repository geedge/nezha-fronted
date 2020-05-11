import vm from '../../../main'
import ca from "element-ui/src/locale/lang/ca";
//ipv4 ip校验
export function host(rule, value, callback) {
  if(!value || value.trim() ==''){
    callback();
  }
  const hostReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\:\d{0,5})?$/
  setTimeout(() => {
    if (hostReg.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('validate.host')))
    }
  }, 100)
}
export function hostPlus(rule,value,callback){
  if(!value || value.trim() ==''){
    callback();
  }
  const ipv4 = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\:\d{0,5})?$/
  const ipv6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
  const domin = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;

  setTimeout(() => {
    if (ipv4.test(value) || ipv6.test(value) || domin.test(value)) {
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
    } else if(isNaN(Number(value))){
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

export function nzNumber(rule, value, callback) {
  setTimeout(() => {
    if (!value) {
      callback();
    } else if(isNaN(Number(value))){
      callback(new Error(vm.$t('validate.number')))
    }else{
      callback();
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

export function integer(rule, value, callback){
  setTimeout(() => {
    if(isNaN(Number(value))){
      callback(new Error(vm.$t('validate.number')))
    }else{
      if(Number.isInteger(Number(value))){
        callback();
      }else{
        callback(new Error(vm.$t('validate.integer')));
      }

    }
  }, 100)
}

export function positiveInteger(rule, value, callback){
  setTimeout(() => {
    if(isNaN(Number(value))){
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

export function uSize(rule, value, callback){

  setTimeout(() => {
    if(isNaN(Number(value))){
      callback(new Error(vm.$t('validate.number')))
    }else{
      let num=Number(value);
      if(num<0 || num > 49 ){
        callback(new Error(vm.$t('validate.usize')))
      }else{
        callback();
      }
    }
  }, 100)
}

