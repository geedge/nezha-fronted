import { dealLegendAlias } from '@/components/common/js/tools'
describe('别名替换函数', () => {
  // 测试代码可读性最好
  // 分组
  it('正常替换一个', () => {
    expect(dealLegendAlias('{a:1,b:2}', '{{a}}')).toBe('1')
  })
  it('正常替换多个个', () => {
    expect(dealLegendAlias('{a:1,b:2}', '{{a}}{{b}}')).toBe('12')
  })
  it('匹配不到', () => {
    expect(dealLegendAlias('{a:1,b:2}', '{{c}}')).toBe('')
  })
  it('没有legend', () => {
    expect(dealLegendAlias('{a:1,b:2}', '')).toBe('{a:1,b:2}')
  })
})
