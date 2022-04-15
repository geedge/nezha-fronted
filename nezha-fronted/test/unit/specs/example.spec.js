import { dealLegendAlias } from '@/components/common/js/example'

describe('别名替换函数', () => {
  // 测试代码可读性最好
  // 分组
  const str = 'node_load1{module="node-exporter",endpoint_id="69",project="Common",datacenter="xin_xi_gang_DC",asset_id="11",endpoint="node-exporter-192.168.44.18",module_id="165",nz_agent_id="75",project_id="17",olap="node_exporter_nacos",asset="Bifang-CM-Server2",datacenter_id="4"} '
  it('正常替换一个', () => {
    expect(dealLegendAlias(str, '{{module}}')).toBe('node-exporter')
  })
  it('正常替换多个个', () => {
    expect(dealLegendAlias(str, '{{module}}{{endpoint_id}}')).toBe('node-exporter69')
  })
  it('匹配不到', () => {
    expect(dealLegendAlias(str, '{{c}}')).toBe('')
  })
  it('没有legend', () => {
    expect(dealLegendAlias(str, '')).toBe(str)
  })
  it('legend没有变量', () => {
    expect(dealLegendAlias(str, 'c')).toBe('c')
  })
})

