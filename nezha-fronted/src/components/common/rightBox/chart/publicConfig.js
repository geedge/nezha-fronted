import chartDataFormat from '@/components/charts/chartDataFormat'

export default {
  data () {
    return {
      language: localStorage.getItem('nz-language'),
      chartConfig: {},
      promqlCount: 0,
      promqlKeys: [],
      elementIds: [],
      expressions: [],
      expressionsShow: [],
      spanList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      legends: [],
      unitOptions: chartDataFormat.unitOptions()
    }
  }
}
