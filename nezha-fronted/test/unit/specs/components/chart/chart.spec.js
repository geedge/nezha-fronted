import { shallowMount } from '@vue/test-utils'
import chart from '@/components/chart/chart.vue'

describe('Counter.vue', () => {
  it('increments count when button is clicked', () => {
    const wrapper = shallowMount(chart, {
      propsData: {
        chartInfo: {
          param: {}
        }
      }
    })
    expect(chart.methods.add(1, 2)).toBe(3)
  })
})
