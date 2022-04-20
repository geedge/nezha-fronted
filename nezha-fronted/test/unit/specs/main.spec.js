import main from '@/main'
describe('时间函数', () => {
  // 测试代码可读性最好
  // 分组
  // const str = 'node_load1{module="node-exporter",endpoint_id="69",project="Common",datacenter="xin_xi_gang_DC",asset_id="11",endpoint="node-exporter-192.168.44.18",module_id="165",nz_agent_id="75",project_id="17",olap="node_exporter_nacos",asset="Bifang-CM-Server2",datacenter_id="4"} '
  // it('正常替换一个', () => {
  //   expect(dealLegendAlias(str, '{{module}}')).toBe('node-exporter')
  // })
  localStorage.setItem('nz-sys-timezone', 'Asia/Shanghai')
  it('utc时间转系统时间 返回时间戳', () => {
    expect(main.utcTimeToTimezone(1650006960000)).toBe(1650035760000)
  })
  it('utc时间转系统时间 返回时间戳', () => {
    expect(main.utcTimeToTimezone('2022-04-15 15:16:00')).toBe(1650035760000)
  })
  it('utc时间转系统时间 返回时间字符串', () => {
    expect(main.utcTimeToTimezoneStr(1650006960000)).toBe('2022-04-15 23:16:00')
  })
  it('utc时间转系统时间 返回时间字符串', () => {
    expect(main.utcTimeToTimezoneStr('2022-04-15 15:16:00')).toBe('2022-04-15 23:16:00')
  })
})
