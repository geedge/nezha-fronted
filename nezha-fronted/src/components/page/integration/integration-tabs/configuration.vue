<template>
  <div class="integration-configuration">
    <pre class="integration-configuration-pre" v-html="converterData()"></pre>
  </div>
</template>

<script>
import showdown from 'showdown'
export default {
  name: 'integration-configuration',
  props: {
    configuration: String
  },
  data () {
    return {
    }
  },
  methods: {
    // 给页面插入markdown数据
    converterData () {
      const converter = new showdown.Converter()
      return converter.makeHtml(this.configuration)
    }
  }
}
</script>
