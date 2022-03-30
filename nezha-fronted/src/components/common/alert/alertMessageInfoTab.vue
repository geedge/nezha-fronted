<template>
  <div>
    <el-tabs v-model="activeName" type="card" v-if="nodata">
      <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
      <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
      <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
      <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
    </el-tabs>
    <div v-else class="table-no-data">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#nz-icon-no-data-list"></use>
      </svg>
      <div class="table-no-data__title">No results found</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'alertMessageInfoTab',
  props: {
    id: {
      type: Number
    }
  },
  data () {
    return {
      activeName: '',
      nodata: false,
      cardNames: [{
        key: 'detail',
        label: this.$t('overall.detail')
      }]
    }
  },
  mounted () {
    this.getAlertMessageInfo()
  },
  methods: {
    getAlertMessageInfo () {
      this.nodata = false
      this.$get('/alert/message/' + this.id).then(res => {
        if (res.code === 200) {
          console.log(res)
        } else {
          this.nodata = true
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
