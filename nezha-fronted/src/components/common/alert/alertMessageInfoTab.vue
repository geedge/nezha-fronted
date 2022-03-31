<template>
  <div>
    <el-tabs v-model="activeName" type="card" v-if="!nodata">
      <el-tab-pane v-for="item in cardNames" :label="item.label" :name="item.key" :key="item.key">
        {{item.key}}
        <div v-if="item.key === 'detail'">
          <alert-message-info-detail :info-data="infoData"/>
        </div>
      </el-tab-pane>
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
import alertMessageInfoDetail from '@/components/common/alert/alertMessageInfoDetail'
export default {
  name: 'alertMessageInfoTab',
  components: {
    alertMessageInfoDetail
  },
  props: {
    infoData: {
      type: Object
    }
  },
  data () {
    return {
      activeName: 'detail',
      nodata: false,
      cardNames: [{
        key: 'detail',
        label: this.$t('overall.detail')
      }],
      sysArr: [{
        key: 'dc',
        label: this.$t('overall.dc')
      }, {
        key: 'asset',
        label: this.$t('overall.asset')
      }, {
        key: 'alertRule',
        label: this.$t('alert.alertRule')
      }, {
        key: 'endpoint',
        label: this.$t('overall.endpoint')
      }, {
        key: 'module',
        label: this.$t('overall.module')
      }, {
        key: 'project',
        label: this.$t('overall.project')
      }]
    }
  },
  watch: {
    infoData: {
      immediate: true,
      handler (n) {
        if (n) {
          this.cardNames = [{
            key: 'detail',
            label: this.$t('overall.detail')
          }]
          this.sysArr.forEach(item => {
            if (n[item.key]) {
              this.cardNames.push(item)
            }
          })
        }
      }
    }
  },
  mounted () {

  },
  methods: {

  }
}
</script>

<style scoped>

</style>
