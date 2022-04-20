// import { mount, createLocalVue } from '@vue/test-utils'
// import Vue from 'vue'
// import ElementUI from 'element-ui'

import bus from '@/libs/bus'
import moment from 'moment-timezone'
// const localVue = createLocalVue()
// localVue.use(ElementUI)

describe('bus时间函数', () => {
  localStorage.setItem('nz-sys-timezone', 'America/Danmarkshavn')
  // 测试代码可读性最好
  // 分组
  it('文字替换', function () {
    // console.log(bus)
    expect(bus.timeFormate('2022-04-15 15:16:00')).toBe('2022-04-15 15:16:00')
  })
})
describe('bus getStep', () => {
  // 测试代码可读性最好
  // 分组
  it('15s', function () {
    // console.log(bus)
    expect(bus.getStep('2022-04-15 15:16:00', '2022-04-15 16:16:00')).toBe('15s')
  })
  it('5m', function () {
    // console.log(bus)
    expect(bus.getStep('2022-04-15 15:16:00', '2022-04-16 16:16:00')).toBe('5m')
  })
  it('10m', function () {
    // console.log(bus)
    expect(bus.getStep('2022-04-15 15:16:00', '2022-04-23 16:16:00')).toBe('10m')
  })
  it('30m', function () {
    // console.log(bus)
    expect(bus.getStep('2022-04-15 15:16:00', '2022-05-23 16:16:00')).toBe('30m')
  })
})
