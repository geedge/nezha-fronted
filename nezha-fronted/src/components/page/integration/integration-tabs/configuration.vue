<template>
  <div class="integration-configuration">
    <div class="integration-configuration-scroll">
      <v-md-preview :text="configuration"></v-md-preview>
    </div>
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
