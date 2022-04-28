import mainMixin from '@/components/common/mixin/mainMixinFun'
import i18n from '@/components/common/i18n'
import moment from 'moment-timezone'
describe('时间函数', () => {
  localStorage.setItem('nz-sys-timezone', 'America/Danmarkshavn')
  it('utc时间转系统时间 返回时间戳', () => {
    expect(mainMixin.methods.utcTimeToTimezone(1650006960000)).toBe(1650006960000)
  })
  it('utc时间转系统时间 返回时间戳', () => {
    expect(mainMixin.methods.utcTimeToTimezone('2022-04-15 15:16:00')).toBe(1650006960000)
  })
  it('utc时间转系统时间 返回时间字符串', () => {
    expect(mainMixin.methods.utcTimeToTimezoneStr(1650006960000)).toBe('2022-04-15 15:16:00')
  })
  it('utc时间转系统时间 返回时间字符串', () => {
    expect(mainMixin.methods.utcTimeToTimezoneStr('2022-04-15 15:16:00')).toBe('2022-04-15 15:16:00')
  })
  it('utc时间转系统时间 返回时间字符串 指定时间格式', () => {
    expect(mainMixin.methods.utcTimeToTimezoneStr('2022-04-15 15:16:00', 'DD/MM/YYYY')).toBe('15/04/2022')
  })

  it('系统时间转utc时间转 返回时间戳', () => {
    expect(mainMixin.methods.timezoneToUtcTime(1650006960000)).toBe(1650006960000)
  })
  it('系统时间转utc时间转 返回时间戳', () => {
    expect(mainMixin.methods.timezoneToUtcTime('2022-04-15 15:16:00')).toBe(1650006960000)
  })
  it('系统时间转utc时间转  返回时间字符串', () => {
    expect(mainMixin.methods.timezoneToUtcTimeStr(1650006960000)).toBe('2022-04-15 15:16:00')
  })
  it('系统时间转utc时间转  返回时间字符串', () => {
    expect(mainMixin.methods.timezoneToUtcTimeStr('2022-04-15 15:16:00')).toBe('2022-04-15 15:16:00')
  })
  it('系统时间转utc时间转 返回时间字符串 指定时间格式', () => {
    expect(mainMixin.methods.timezoneToUtcTimeStr('2022-04-15 15:16:00', 'DD/MM/YYYY')).toBe('15/04/2022')
  })
  it('使用bus提供的 时间函数', () => {
    expect(mainMixin.methods.timeFormate('2022-04-15 15:16:00')).toBe('2022-04-15 15:16:00')
  })
})
describe('是否含有指数', () => {
  it('测试正常数字是否是指数显示', () => {
    expect(mainMixin.methods.numberWithEConvent(10)).toBe(10)
  })
  it('测试小数是否是指数显示', () => {
    expect(mainMixin.methods.numberWithEConvent(0.1)).toBe(0.1)
  })
  it('测试较小数字是否是指数显示', () => {
    expect(mainMixin.methods.numberWithEConvent(1.0000000000000004e-8)).toBe(0)
  })
  it('测试较大的数字是否是指数显示', () => {
    expect(mainMixin.methods.numberWithEConvent(1e+23)).toBe(0)
  })
})

describe('是否含有Button的权限', () => {
  const obj = {
    $store: {
      getters: {
        buttonList: ['main_add']
      }
    }
  }
  it('有', () => {
    expect(mainMixin.methods.hasButton.bind(obj)('main_add')).toBeTruthy()
  })
  it('无', () => {
    expect(mainMixin.methods.hasButton.bind(obj)('main_qwe')).toBeFalsy()
  })
})
describe('i18n的使用', () => {
  it('正常使用 匹配英文', () => {
    expect(mainMixin.methods.translation('overall.all')).toBe('All')
  })
  it('正常使用 匹配中文', () => {
    i18n.local = 'zh'
    expect(mainMixin.methods.translation('overall.all')).toBe('全部')
  })
  it('未匹配到', () => {
    expect(mainMixin.methods.translation('overall.asd')).toBe('overall.asd')
  })
})
describe('替换 moment 跟 elementui的时间格式', () => {
  // timeFormatStrToDatePickFormat
  it('正常替换', () => {
    expect(mainMixin.methods.timeFormatStrToDatePickFormat('YYYY-DD-MM HH:mm:ss')).toBe('yyyy-dd-MM HH:mm:ss')
  })
  it('不包含时分秒', () => {
    expect(mainMixin.methods.timeFormatStrToDatePickFormat('YYYY-DD-MM HH:mm:ss', true)).toBe('yyyy-dd-MM ')
  })
})
