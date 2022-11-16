<template>
  <div>
    <div style="display: flex;width: 100%; justify-content: space-between">
      <span>Sftp {{fileDirectory}}</span>
      <span  style="color: #fff">
          <i class="nz-icon nz-icon-clock"></i>
          <i class="nz-icon nz-icon-projectTopology"></i>
        </span>
    </div>
    <div class="file-directory-content">
      <div v-for="(item,index) in fileList" :key="index">
        <i class="nz-icon" :class="selIcon(item.name)"/>
        {{item.name}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'fileDirectory',
  data () {
    return {
      fileDirectory: '/',
      fileList: []
    }
  },
  methods: {
    selIcon (name) {
      const hz = name.split('.')[1]
      switch (hz) {
        case 'txt' :
          return 'nz-icon-txt'
        default:
          return 'nz-icon-txt'
      }
    }
  }
}
</script>

<style scoped>

</style>
