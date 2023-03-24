/*
* value:yAxis 默认第一个参数  传递的数值
* index:yAxis 默认第二个参数 y轴的位置
* type:自定义参数，用于区分是y轴调用还是tooltip调用,以设置不同精度  type =1 y轴调用 type=2 tooltip调用
* */
import bus from '../../libs/bus'
import { formatScientificNotation } from '@/components/common/js/tools'
function none (value, index) {
  const scientificNotationValue = formatScientificNotation(value, 2)
  if (!numberWithEConvent(scientificNotationValue)) {
    return scientificNotationValue
  }
  return keepDoubleNumber(value)
}
function short (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, [' ', 'K', 'Mil', 'Bil', 'Til', 'Quadrillion', 'Quintillion'], 0)
  } else if (type == -1) {
    return asciiCompute(value, 1000, [' ', 'K', 'Mil', 'Bil', 'Til', 'Quadrillion', 'Quintillion'], dot)
  } else {
    return asciiCompute(value, 1000, [' ', 'K', 'Mil', 'Bil', 'Til', 'Quadrillion', 'Quintillion'], 2)
  }
}
function percent01 (value, index) {
  const scientificNotationValue = formatScientificNotation(value, 2)
  if (!numberWithEConvent(scientificNotationValue)) {
    return `${scientificNotationValue} %`
  }
  value = parseFloat((Number(value)).toFixed(2))
  return `${value} %`
}
function percent02 (value, index) {
  const scientificNotationValue = formatScientificNotation(value, 2)
  if (!numberWithEConvent(scientificNotationValue)) {
    return `${scientificNotationValue} %`
  }
  value = parseFloat((Number(value) * 100).toFixed(2))
  return `${value} %`
}
function localFormat (value, index) {
  const scientificNotationValue = formatScientificNotation(value, 2)
  if (!numberWithEConvent(scientificNotationValue)) {
    return `${scientificNotationValue} %`
  }
  let num = (value || 0).toString()
  let result = ''
  while (num.length > 3) {
    result = ',' + num.slice(-3) + result
    num = num.slice(0, num.length - 3)
  }
  if (num) { result = num + result }
  return result
}
function bits (value, index, type = 1, dot = 0) {
  if (type == 1) {
    return asciiCompute(value, 1024, ['b', 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], 0)
  } else if (type == -1) {
    return asciiCompute(value, 1024, ['b', 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], dot)
  } else {
    return asciiCompute(value, 1024, ['b', 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], 2)
  }
}
function bytes (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1024, ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], 0)
  } else if (type == -1) {
    return asciiCompute(value, 1024, ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], dot)
  } else {
    return asciiCompute(value, 1024, ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], 2)
  }
}
function kilobytes (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1024, ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], 0)
  } else if (type == -1) {
    return asciiCompute(value, 1024, ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], dot)
  } else {
    return asciiCompute(value, 1024, ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], 2)
  }
}
function megabytes (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1024, ['MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], 0)
  } else if (type == -1) {
    return asciiCompute(value, 1024, ['MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], dot)
  } else {
    return asciiCompute(value, 1024, ['MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], 2)
  }
}
function gigabytes (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1024, ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], 0)
  } else if (type == -1) {
    return asciiCompute(value, 1024, ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], dot)
  } else {
    return asciiCompute(value, 1024, ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], 2)
  }
}
function terabytes (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1024, ['TB', 'PB', 'EB', 'ZB', 'YB'], 0)
  } else if (type == -1) {
    return asciiCompute(value, 1024, ['TB', 'PB', 'EB', 'ZB', 'YB'], dot)
  } else {
    return asciiCompute(value, 1024, ['TB', 'PB', 'EB', 'ZB', 'YB'], 2)
  }
}
function petabytes (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1024, ['PB', 'EB', 'ZB', 'YB'], 0)
  } else if (type == -1) {
    return asciiCompute(value, 1024, ['PB', 'EB', 'ZB', 'YB'], dot)
  } else {
    return asciiCompute(value, 1024, ['PB', 'EB', 'ZB', 'YB'], 2)
  }
}
function packetsSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps', 'Ppps', 'Epps', 'Zpps', 'Ypps'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps', 'Ppps', 'Epps', 'Zpps', 'Ypps'], dot)
  } else {
    return asciiCompute(value, 1000, ['pps', 'Kpps', 'Mpps', 'Gpps', 'Tpps', 'Ppps', 'Epps', 'Zpps', 'Ypps'], 2)
  }
}
function bitsSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Epps', 'Zpps', 'Ypps'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Epps', 'Zpps', 'Ypps'], dot)
  } else {
    return asciiCompute(value, 1000, ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Epps', 'Zpps', 'Ypps'], 2)
  }
}
function bytesSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['Bs', 'KBs', 'MBs', 'GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['Bs', 'KBs', 'MBs', 'GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], dot)
  } else {
    return asciiCompute(value, 1000, ['Bs', 'KBs', 'MBs', 'GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], 2)
  }
}
function kilobytesSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['KBs', 'MBs', 'GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['KBs', 'MBs', 'GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], dot)
  } else {
    return asciiCompute(value, 1000, ['KBs', 'MBs', 'GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], 1)
  }
}
function kilobitsSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], dot)
  } else {
    return asciiCompute(value, 1000, ['Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], 2)
  }
}
function megabytesSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['MBs', 'GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['MBs', 'GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], dot)
  } else {
    return asciiCompute(value, 1000, ['MBs', 'GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], 2)
  }
}
function megabitsSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], dot)
  } else {
    return asciiCompute(value, 1000, ['Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], 2)
  }
}
function gigabytesSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], dot)
  } else {
    return asciiCompute(value, 1000, ['GBs', 'TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], 2)
  }
}
function gigabitsSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], dot)
  } else {
    return asciiCompute(value, 1000, ['Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], 2)
  }
}
function terabytesSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], dot)
  } else {
    return asciiCompute(value, 1000, ['TBs', 'PBs', 'EBs', 'ZBs', 'YBs'], 2)
  }
}
function terabitsSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], dot)
  } else {
    return asciiCompute(value, 1000, ['Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'], 2)
  }
}
function petabytesSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['PBs', 'EBs', 'ZBs', 'YBs'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['PBs', 'EBs', 'ZBs', 'YBs'], dot)
  } else {
    return asciiCompute(value, 1000, ['PBs', 'EBs', 'ZBs', 'YBs'], 2)
  }
}
function petabitsSec (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['Pbps', 'Ebps', 'Zbps', 'Ybps'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['Pbps', 'Ebps', 'Zbps', 'Ybps'], dot)
  } else {
    return asciiCompute(value, 1000, ['Pbps', 'Ebps', 'Zbps', 'Ybps'], 2)
  }
}
function Hertz (value, index, type = 1, dot) {
  if (type == 1) {
    return asciiCompute(value, 1000, ['Hz', 'KHz', 'MHz', 'GHz', 'THz', 'PHz', 'EHz', 'ZHz', 'YHz'], 1)
  } else if (type == -1) {
    return asciiCompute(value, 1000, ['Hz', 'KHz', 'MHz', 'GHz', 'THz', 'PHz', 'EHz', 'ZHz', 'YHz'], dot)
  } else {
    return asciiCompute(value, 1000, ['Hz', 'KHz', 'MHz', 'GHz', 'THz', 'PHz', 'EHz', 'ZHz', 'YHz'], 2)
  }
}
function nanoseconds (value, index, type = 1, dot) {
  if (type == 1) {
    return timeCompute(value, 'ns')
  } else if (type == -1) {
    return timeCompute(value, 'ns', dot)
  } else {
    return timeCompute(value, 'ns', 2)
  }
}
function microseconds (value, index, type = 1, dot) {
  if (type == 1) {
    return timeCompute(value, 'us')
  } else if (type == -1) {
    return timeCompute(value, 'us', dot)
  } else {
    return timeCompute(value, 'us', 2)
  }
}
function milliseconds (value, index, type = 1, dot) {
  if (type == 1) {
    return timeCompute(value, 'ms')
  } else if (type == -1) {
    return timeCompute(value, 'ms', dot)
  } else {
    return timeCompute(value, 'ms', 2)
  }
}
function seconds (value, index, type = 1, dot) {
  if (type == 1) {
    return timeCompute(value, 's')
  } else if (type == -1) {
    return timeCompute(value, 's', dot)
  } else {
    return timeCompute(value, 's', 2)
  }
}
function minutes (value, index, type = 1, dot) {
  if (type == 1) {
    return timeCompute(value, 'm')
  } else if (type == -1) {
    return timeCompute(value, 'm', dot)
  } else {
    return timeCompute(value, 'm', 2)
  }
}
function hours (value, index, type = 1, dot) {
  if (type == 1) {
    return timeCompute(value, 'h')
  } else if (type == -1) {
    return timeCompute(value, 'h', dot)
  } else {
    return timeCompute(value, 'h', 2)
  }
}
function days (value, index, type = 1, dot) {
  if (type == 1) {
    return timeCompute(value, 'day')
  } else if (type == -1) {
    return timeCompute(value, 'day', dot)
  } else {
    return timeCompute(value, 'day', 3)
  }
}
function numberWithEConvent (num) {
  if (num) {
    if ((('' + num).indexOf('E') !== -1) || (('' + num).indexOf('e') !== -1)) {
      const regExp = /'^((\\d+.?\\d+)[Ee]{1}(\\d+))$', 'ig'/
      let result = regExp.exec(num)
      let resultValue = ''
      let power
      if (result != null) {
        resultValue = result[2]
        power = result[3]
        result = regExp.exec(num)
      }

      if (resultValue) {
        if (power) {
          const powVer = Math.pow(10, power)
          resultValue = resultValue * powVer
          return resultValue
        }
      }
    } else {
      return num
    }
  }
  return 0
}
/*
* 一般数值格式化方法
* num: 需要格式化的值
* ascii:进制，比如数据为1024
* units：单位列表
* dot：保留的小数位，
* */
function asciiCompute (num, ascii, units, dot = 2) {
  const scientificNotationValue = formatScientificNotation(num, dot)
  if (!numberWithEConvent(scientificNotationValue)) {
    return scientificNotationValue
  }
  if (!num && num !== 0 && num !== '0') {
    return ''
  }
  num = Number(num)
  const SIGN = num > 0 ? 1 : -1
  num = Math.abs(num)
  let carry = 0
  if (num > 1) {
    const log = Math.log(num) / Math.log(ascii)
    carry = parseInt(log)
    num = num / Math.pow(ascii, carry)
  }
  if (Number.isInteger(num)) {
    return num * SIGN + ' ' + units[carry]
  } else {
    return num.toFixed(dot) * SIGN + ' ' + units[carry]
  }
}
// eslint-disable-next-line no-unused-vars
function asciiCompute2 (num, ascii, units, dot = 2, unitIndex = 0) {
  num = Number(num)
  const quotient = num / ascii
  if (unitIndex <= units.length - 1) {
    if (quotient < 1) { // 不足以进位
      const toFixed = parseFloat(num.toFixed(dot))
      if (toFixed == 0) {
        return `${num} ${units[unitIndex]}`
      } else {
        return `${num.toFixed(dot)} ${units[unitIndex]}`
      }
    } else if (quotient >= 1 && quotient < 10) { // 可以进位，但是又不足以更进一位
      if (unitIndex >= units.length - 1) {
        unitIndex++
        return asciiCompute(num, ascii, units, dot, unitIndex)
      } else {
        unitIndex++
        return `${quotient.toFixed(dot)} ${units[unitIndex]}`
      }
    } else { // 可以更进一位
      if (unitIndex >= units.length - 1) {
        unitIndex++
        return asciiCompute(num, ascii, units, dot, unitIndex)
      } else {
        unitIndex++
        num = quotient
        return asciiCompute(num, ascii, units, dot, unitIndex)
      }
    }
  } else {
    return `${num.toFixed(2)} ${units[units.length - 1]}`
  }
}
/*
* 时间格式化方法
* value:需要格式化的数值
* unit:设置的单位
* */
function timeCompute (value, unit, dot = 0) {
  if (isNaN(value)) {
    return `0 ${unit}`
  }
  if (unit == 'year') {
    return `${value.toFixed(dot)} ${unit}`
  }
  const units = [
    { unit: 'ns', ascii: 1000 },
    { unit: 'us', ascii: 1000 },
    { unit: 'ms', ascii: 1000 },
    { unit: 's', ascii: 60 },
    { unit: 'm', ascii: 60 },
    { unit: 'h', ascii: 24 },
    { unit: 'day', ascii: 7 },
    { unit: 'week', ascii: 52 },
    { unit: 'year', ascii: '' }
  ]
  for (let i in units) {
    const u = units[i]
    if (u.unit == unit) { // 找到最小单位
      const result = (time, minUnit) => {
        if (minUnit.unit == 'year') {
          if (Number.isInteger(time)) {
            dot = 0
          }
          return `${time.toFixed(dot)} ${minUnit.unit}`
        }
        const quotient = time / minUnit.ascii
        if (quotient < 1) {
          if (Number.isInteger(time)) {
            dot = 0
          }
          return `${Number(time).toFixed(dot)} ${minUnit.unit}`
        } else {
          minUnit = units[++i]
          return result(quotient, minUnit)
        }
      }
      return result(value, u)
    }
  }
}
// 保留两位有效数字
function keepDoubleNumber (num) {
  const decimal = num.toString()
  let returnNum = ''
  if (num == 0) {
    return 0
  }
  const arr = decimal.split('.')
  if (arr.length > 1) {
    returnNum = arr[0] + '.'
    let validNum = 0
    arr[1].split('').forEach(item => {
      if (validNum < 1 && item > 0) {
        validNum++
        returnNum += item
      } else if (validNum === 0) {
        returnNum += item
      } else if (validNum === 1) {
        validNum++
        returnNum += item
      }
    })
    if (validNum === 1) {
      returnNum += '0'
    }
    return returnNum
  } else {
    return decimal
  }
}
function timeFormat34 (value) {
  return bus.timeFormate(parseInt(value), 'YYYY-MM-DD HH:mm:ss')
}
function timeFormat35 (value) {
  return bus.timeFormate(parseInt(value), 'MM/DD/yyyy h:mm:ss a')
}
// unit转化配置信息
/*
* value:传递给数据库的值
* label：下拉选显示的名字
* compute：用于格式化计算的方法，返回一个string类型的串
* */
const unitOptions = [
  { // Misc start
    value: 'Misc',
    label: 'Misc',
    children: [
      {
        value: 1,
        compute: none,
        label: 'none'
      },
      {
        value: 2,
        compute: short,
        label: 'short'
      },
      {
        value: 3,
        compute: percent01,
        label: 'percent(0-100)'
      },
      {
        value: 4,
        compute: percent02,
        label: 'percent(0.0-1.0)'
      },
      {
        value: 5,
        compute: localFormat,
        label: 'local format'
      }
    ]
  }, // Misc end
  { // Data start
    value: 'Data',
    label: 'Data',
    children: [
      {
        value: 6,
        compute: bits,
        label: 'bits'
      },
      {
        value: 7,
        compute: bytes,
        label: 'bytes'
      },
      {
        value: 8,
        compute: kilobytes,
        label: 'kilobytes'
      },
      {
        value: 9,
        compute: megabytes,
        label: 'megabytes'
      },
      {
        value: 10,
        compute: gigabytes,
        label: 'gigabytes'
      },
      {
        value: 11,
        compute: terabytes,
        label: 'terabytes'
      },
      {
        value: 12,
        compute: petabytes,
        label: 'petabytes'
      }
    ]
  }, // Data end
  { // DataRate start
    value: 'DataRate',
    label: 'DataRate',
    children: [
      {
        value: 13,
        compute: packetsSec,
        label: 'packets/sec'
      },
      {
        value: 14,
        compute: bitsSec,
        label: 'bits/sec'
      },
      {
        value: 15,
        compute: bytesSec,
        label: 'bytes/sec'
      },
      {
        value: 16,
        compute: kilobytesSec,
        label: 'kilobytes/sec'
      },
      {
        value: 17,
        compute: kilobitsSec,
        label: 'kilobits/sec'
      },
      {
        value: 18,
        compute: megabytesSec,
        label: 'megabytes/sec'
      },
      {
        value: 19,
        compute: megabitsSec,
        label: 'megabits/sec'
      },
      {
        value: 20,
        compute: gigabytesSec,
        label: 'gigabytes/sec'
      },
      {
        value: 21,
        compute: gigabitsSec,
        label: 'gigabits/sec'
      },
      {
        value: 22,
        compute: terabytesSec,
        label: 'terabytes/sec'
      },
      {
        value: 23,
        compute: terabitsSec,
        label: 'terabits/sec'
      },
      {
        value: 24,
        compute: petabytesSec,
        label: 'petabytes/sec'
      },
      {
        value: 25,
        compute: petabitsSec,
        label: 'petabits/sec'
      }
    ]
  }, // DataRate end
  { // Time start
    value: 'Time',
    label: 'Time',
    children: [
      {
        value: 26,
        compute: Hertz,
        label: 'Hertz (1/s)',
        ascii: 1
      },
      {
        value: 27,
        compute: nanoseconds,
        label: 'nanoseconds (ns)',
        ascii: 1000
      },
      {
        value: 28,
        compute: microseconds,
        label: 'microseconds (us)',
        ascii: 1000
      },
      {
        value: 29,
        compute: milliseconds,
        label: 'milliseconds (ms)',
        ascii: 60
      },
      {
        value: 30,
        compute: seconds,
        label: 'seconds (s)',
        ascii: 60
      },
      {
        value: 31,
        compute: minutes,
        label: 'minutes (m)',
        ascii: 60
      },
      {
        value: 32,
        compute: hours,
        label: 'hours (h)',
        ascii: 24
      },
      {
        value: 33,
        compute: days,
        label: 'days (d)',
        ascii: 7
      }
    ]
  }, // Time end
  {
    value: 'Date&Time',
    label: 'Date & Time',
    children: [
      {
        value: 34,
        compute: timeFormat34,
        label: 'YYYY-MM-DD HH:mm:ss'
      },
      {
        value: 35,
        compute: timeFormat35,
        label: 'MM/DD/YYYY h:mm:ss a'
      }
    ]
  }
]
const units = []
window.addEventListener('load', function () {
  if (units.length < 1) {
    unitOptions.forEach((item, index) => {
      item.children.forEach((n, i) => {
        units.push({ ...n, type: item.label })
      })
    })
  }
})
export default {
  unitOptions: function () {
    return unitOptions
  },
  getUnit: function (index) {
    if (units.length < 1) {
      unitOptions.forEach((item, index) => {
        item.children.forEach((n, i) => {
          units.push({ ...n, type: item.label })
        })
      })
    }
    return units[index - 1]
  },
  formatData: function (value, unit) {
    return this.getUnit(unit).compute(value, null, 2)
  },
  formatDatas: function (value, type, flow = 'ceil', ascii) {
    let pow = 0
    if (value < 1 && value != 0) {
      while (value < 1) {
        pow++
        value = value * 10
      }
      return Math.floor(value + 1) / Math.pow(10, pow)
    }
    if (type === 'Time') {
      return value
    }

    if (type === 'Data') {
      if (value > 1) {
        while (value > 1024) {
          pow++
          value = value / 1024
        }

        if (flow === 'ceil') {
          const length = JSON.stringify(Math.ceil(value)).length
          value = value / Math.pow(10, length - 1)
          return Math.ceil(value) * Math.pow(1024, pow) * Math.pow(10, length - 1)
        } else if (flow === 'floor') {
          const length = JSON.stringify(Math.floor(value)).length
          value = value / Math.pow(10, length - 1)
          return Math.floor(value) * Math.pow(1024, pow) * Math.pow(10, length - 1)
        }
      } else {
        return value
      }
    }

    if (type === 'Misc' || type === 'DataRate') {
      if (value > 1) {
        while (value > 1000) {
          pow++
          value = value / 1000
        }

        if (flow === 'ceil') {
          const length = JSON.stringify(Math.ceil(value)).length
          value = value / Math.pow(10, length - 1)
          return Math.ceil(value) * Math.pow(1000, pow) * Math.pow(10, length - 1)
        } else if (flow === 'floor') {
          const length = JSON.stringify(Math.floor(value)).length
          value = value / Math.pow(10, length - 1)
          return Math.floor(value) * Math.pow(1000, pow) * Math.pow(10, length - 1)
        }
      } else {
        return value
      }
    }

    return value
  },
  copies: function (value) {
    switch (parseInt(value)) {
      case 1: return 5
      case 2: return 4
      case 3: return 3
      case 4: return 4
      case 5: return 5
      case 6: return 3
      case 7: return 7
      case 8: return 4
      case 9: return 3
      case 10: return 5
    }
  },
  Interval: function (value, copies, type, interValType) {
    if (!copies) {
      copies = 1
    }
    if (interValType === 'max' && value < 1) {
      if (value < 1) {
        value = 1
      }
      return value || 1
    }

    if (value < 1024 && type === 'Data') {
      let interVal = value / copies
      interVal = !isNaN(interVal) ? interVal : 1
      return interVal
    }
    if (value < 1000 && (type === 'DataRate' || type === 'Misc')) {
      let interVal = value / copies
      interVal = !isNaN(interVal) ? interVal : 1
      return interVal
    }
    if (type === 'Data') {
      let interVal = value / copies
      let pow = 0
      if (interVal) {
        while (interVal > 1024) {
          pow++
          interVal = interVal / 1024
        }
        interVal = Math.ceil(interVal) * Math.pow(1024, pow)
      }
      interVal = !isNaN(interVal) ? interVal : 1
      return interVal
    }
    if (type === 'DataRate' || type === 'Misc') {
      let interVal = value / copies
      let pow = 0
      if (interVal) {
        while (interVal > 1000) {
          pow++
          interVal = interVal / 1000
        }
        interVal = Math.ceil(interVal) * Math.pow(1000, pow)
      }
      interVal = !isNaN(interVal) ? interVal : 1
      return interVal
    }
    return 1
    // let interVal=value/copies;
    // interVal = interVal || 1;
    // return interVal
  }
}
