<template>
  <div class="integration-configuration">
    <v-md-preview :text="configuration"></v-md-preview>
  </div>
</template>

<script>
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

  }
}
</script>
