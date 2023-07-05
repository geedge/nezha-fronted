import vm from '../../../entrance/app/main'
import lodash from 'lodash'

// ipv4校验 不包括端口
export function ip (rule, value, callback) {
  if (!value || value.trim() == '') {
    callback()
  }
  const ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  setTimeout(() => {
    if (ipReg.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('validate.host')))
    }
  }, 100)
}
// ipv4 ip校验
export function host (rule, value, callback) {
  if (!value || value.trim() == '') {
    callback()
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
export function hostPlus (rule, value, callback) {
  if (!value || value.trim() == '') {
    callback()
  }
  const ipv4 = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\:\d{0,5})?$/
  const ipv6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
  const domin = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/

  setTimeout(() => {
    if (ipv4.test(value) || ipv6.test(value) || domin.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('validate.host')))
    }
  }, 100)
}

export function phone (rule, value, callback) {
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

export function port (rule, value, callback) {
  setTimeout(() => {
    if (!value) {
      callback()
    } else if (isNaN(Number(value))) {
      callback(new Error(vm.$t('validate.number')))
    } else {
      if (value < 1 || value > 65535) {
        callback(new Error(vm.$t('validate.port')))
      } else {
        callback()
      }
    }
  }, 100)
}

export function nzNumber (rule, value, callback) {
  setTimeout(() => {
    if (!value) {
      callback()
    } else if (isNaN(Number(value))) {
      callback(new Error(vm.$t('validate.number')))
    } else {
      callback()
    }
  }, 100)
}

export function noSpecialChar (rule, value, callback) {
  // eslint-disable-next-line no-control-regex
  const charReg = /^\S[\u0000-\uFFFF]*$/
  /// ^\S[\u0000-\uFFFF]*$/
  setTimeout(() => {
    if (!value) {
      callback(new Error(vm.$t('validate.required')))
    }
    if (charReg.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('validate.special')))
    }
  }, 100)
}

export function latlng (rule, value, callback) {
  const lngReg = /^[\-\+]?(0?\d{1,2}\.\d{1,7}|1[0-7]?\d{1}\.\d{1,7}|180\.0{1,7}|0?\d{1,2}|1[0-7]?\d{1}|180)$/ // 经度正则验证
  const latReg = /^[\-\+]?([1-8]?\d{1}\.\d{1,7}|90\.0{1,7}|[1-8]?\d{1}|90)$/ // 纬度正则验证
  setTimeout(() => {
    const lnglat = value.split(',')
    if (!lnglat || lnglat.length !== 2) {
      callback(new Error(vm.$t('tip.lnglatError')))
    } else if (!lngReg.test(lnglat[0]) || !latReg.test(lnglat[1])) {
      callback(new Error(vm.$t('tip.lnglatError')))
    } else {
      callback()
    }
  }, 100)
}

export function integer (rule, value, callback) {
  setTimeout(() => {
    if (isNaN(Number(value))) {
      callback(new Error(vm.$t('validate.number')))
    } else {
      if (Number.isInteger(Number(value))) {
        callback()
      } else {
        callback(new Error(vm.$t('validate.integer')))
      }
    }
  }, 100)
}

export function positiveInteger (rule, value, callback) {
  setTimeout(() => {
    if (isNaN(Number(value))) {
      callback(new Error(vm.$t('validate.number')))
    } else {
      if (Number(value) >= 0) {
        callback()
      } else {
        callback(new Error(vm.$t('validate.positiveInteger')))
      }
    }
  }, 100)
}

export function domain (rule, value, callback) {
  const urlReg = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
  setTimeout(() => {
    if (urlReg.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('validate.domain')))
    }
  }, 100)
}

export function uSize (rule, value, callback) {
  setTimeout(() => {
    if (isNaN(Number(value))) {
      callback(new Error(vm.$t('validate.number')))
    } else {
      const num = Number(value)
      if (num < 0 || num > 47) {
        callback(new Error(vm.$t('validate.uSize')))
      } else {
        callback()
      }
    }
  }, 100)
}

export function checkAssetAge (rule, value, callback) {
  setTimeout(() => {
    if (value.length > 128) {
      return callback(vm.$t('overall.checkAssetAge'))
    } else {
      callback()
    }
  }, 100)
}

export function checkExpressionAge (rule, value, callback) {
  setTimeout(() => {
    if (value.length > 64) {
      return callback(vm.$t('overall.checkAssetAge'))
    } else {
      callback()
    }
  }, 100)
}

export function checkExprTempAge (rule, value, callback) {
  setTimeout(() => {
    if (value.length > 256) {
      return callback(vm.$t('overall.checkAssetAge'))
    } else {
      callback()
    }
  }, 100)
}

export function arrLength (rule, value, callback) { // 校验数组
  if (value.length > 0) {
    callback()
  } else {
    callback(new Error(vm.$t('validate.required')))
  }
}
export function datePicker (rule, value, callback) { // 校验时间选择
  if (value[0] && value[1]) {
    callback()
  } else {
    callback(new Error(vm.$t('validate.required')))
  }
}

export function sysObjectIdInput (rule, value, callback) {
  const sysId = /^(\d{1,9}\.){0,}[\d]+$/
  setTimeout(() => {
    if (value == '') return callback()
    if (sysId.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('overall.oid')))
    }
  }, 100)
}
export function longAndLat (rule, value, callback) { // 校验经纬度

}
export function dataValidate () {
  // const time = '([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$'
  // const YMD = '/((([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29))'
  // const DMY = '/((^(3[01]|[12][0-9]|0[1-9])(\\/)(10|12|0[13578])(\\/)((1[8-9]\\d{2})|([2-9]\\d{3}))$)|(^(30|[12][0-9]|0[1-9])(\\/)(11|0[469])(\\/)((1[8-9]\\d{2})|([2-9]\\d{3}))$)|(^(2[0-8]|1[0-9]|0[1-9])(\\/)(02)(\\/)((1[8-9]\\d{2})|([2-9]\\d{3}))$)|(^(29)(\\/)(02)(\\/)([2468][048]00)$)|(^(29)(\\/)(02)(\\/)([3579][26]00)$)|(^(29)(\\/)(02)(\\/)([1][89][0][48])$)|(^(29)(\\/)(02)(\\/)([2-9][0-9][0][48])$)|(^(29)(\\/)(02)(\\/)([1][89][2468][048])$)|(^(29)(\\/)(02)(\\/)([2-9][0-9][2468][048])$)|(^(29)(\\/)(02)(\\/)([1][89][13579][26])$)|(^(29)(\\/)(02)(\\/)([2-9][0-9][13579][26])$))/'
  // const MDY =
}

// 验证timeout
export function timeoutValidator (rule, value, callback) {
  setTimeout(() => {
    // 判断是否是数字
    if (isNaN(Number(value))) {
      callback(new Error(vm.$t('validate.number')))
    } else {
      // 判断是否是正整数
      if (Number(value) >= 0 && (String(value).indexOf('.') == -1)) {
        // 判断范围
        if (value >= 1 && value <= 60000) {
          callback()
        } else {
          callback(new Error(vm.$t('validate.timeout')))
        }
      } else {
        callback(new Error(vm.$t('validate.positiveInteger')))
      }
    }
  }, 100)
}

// 验证packageSize
export function packageSizeValidator (rule, value, callback) {
  setTimeout(() => {
    // 判断是否是数字
    if (isNaN(Number(value))) {
      callback(new Error(vm.$t('validate.number')))
    } else {
      // 判断是否是正整数
      if (Number(value) >= 0 && (String(value).indexOf('.') == -1)) {
        // 判断范围
        if (value >= 1 && value <= 4096) {
          callback()
        } else {
          callback(new Error(vm.$t('validate.packageSize')))
        }
      } else {
        callback(new Error(vm.$t('validate.positiveInteger')))
      }
    }
  }, 100)
}

// 验证maxHops
export function maxHopsValidator (rule, value, callback) {
  setTimeout(() => {
    // 判断是否是数字
    if (isNaN(Number(value))) {
      callback(new Error(vm.$t('validate.number')))
    } else {
      // 判断是否是正整数
      if (Number(value) >= 0 && (String(value).indexOf('.') == -1)) {
        // 判断范围
        if (value >= 1 && value <= 1000) {
          callback()
        } else {
          callback(new Error(vm.$t('validate.maxHops')))
        }
      } else {
        callback(new Error(vm.$t('validate.positiveInteger')))
      }
    }
  }, 100)
}
// 验证mac地址
export function validateMAC (rule, value, callback) {
  const macRule = /^([0-9a-fA-F]{2}(:|-)){5}[0-9a-fA-F]{2}$/
  setTimeout(() => {
    if (value == '') return callback()
    if (macRule.test(value)) {
      callback()
    } else {
      callback(new Error(vm.$t('validate.macError')))
    }
  }, 100)
}
