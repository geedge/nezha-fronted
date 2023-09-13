<template>
  <div class="explore-history-box"   v-clickoutside="hideMe" >
    <div class="explore-history-box-header">
      <span class="header-text">{{$t('terminal.history')}}</span>
      <el-input
        class="header-search"
        size="mini"
        v-model="searchStr"
        @input="changeSearchStr"
        :placeholder="$t('overall.search')"
        suffix-icon="nz-icon nz-icon-search"
      />
    </div>
    <div
      class="explore-history-box-content"
      v-if="historyArr.length"
      infinite-scroll-disabled="disabled"
      v-loadMore="{
           load: loadNextData,
           hasMore: hasMore,
        }"
    >
      <div v-for="(item, index) in historyArr" :key="index" :title="item.value" class="explore-history-item" @click="selectHistory(item)">
        <div class="explore-history-item-content text-ellipsis" :title="item.queryValue">
          {{item.queryValue}}
        </div>
        <div class="explore-history-item-icon">
          <i class="nz-icon nz-icon-override" @click.stop="copyHistoryItem(item)"></i>
          <i class="nz-icon nz-icon-delete" @click.stop="deleteHistoryItem(item)"></i>
        </div>
      </div>
      <div v-if="pageObj.total > historyArr.length" v-my-loading.scaleMin="loading" class="explore-history-item no-more">
        {{$t('el.select.loading')}}...
      </div>
      <div v-else class="explore-history-item no-more">
        {{$t('overall.noMoreData')}}
      </div>
    </div>
    <div v-else class="explore-history-box-content nodata">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#nz-icon-no-data-list"></use>
      </svg>
      <div class="table-no-data__title">{{$t('overall.noDataAvailable')}}</div>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'

export default {
  name: 'exploreHistory',
  props: {
    type: {
      type: String,
      default: 'metrics'
    }
  },
  computed: {
  },
  data () {
    return {
      historyArr: [],
      firstLoading: false,
      loading: true,
      searchStr: '',
      pageObj: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      hasMore: true
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init (pageSize) {
      this.firstLoading = true
      this.historyArr = []
      this.pageObj = {
        pageNo: 1,
        pageSize: pageSize || 10,
        total: 0
      }
      this.total = 0
      this.getExploreHistory()
    },
    loadNextData () {
      this.pageObj.pageNo++
      this.getExploreHistory()
    },
    changeSearchStr: bus.debounce(function (val) {
      this.init()
    }, 300),
    getExploreHistory () {
      const params = {
        ...this.pageObj,
        queryValue: this.searchStr,
        orderBy: 'uts'
      }
      if (this.type === 'metric') {
        params.queryKey = 'explore-metric'
      } else {
        params.queryKey = 'explore-log'
      }
      delete params.total
      this.$get('/sys/user/queryHistory', params).then(res => {
        if (res.code === 200) {
          this.historyArr = [...this.historyArr, ...res.data.list]
          this.pageObj.total = res.data.total
          if (this.pageObj.total > this.historyArr.length) {
            this.hasMore = true
          } else {
            this.hasMore = false
          }
          this.pageObj.pageSize = 10
        } else {
          this.$message.error(res.msg || res.error)
        }
      })
    },
    hideMe () {
      setTimeout(() => {
        this.$emit('close')
      }, 100)
    },
    copyHistoryItem (item) {
      this.$copyText(item.queryValue).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    },
    deleteHistoryItem (item) {
      this.$delete('/sys/user/queryHistory?ids=' + item.id).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('tip.deleteSuccess'))
          this.firstLoading = true
          setTimeout(() => {
            this.deleteAfter(this.historyArr.length)
          }, 100)
          // this.pageObj.total--
          // this.historyArr = this.historyArr.filter(historyItem => historyItem.id !== item.id)
        } else {
          this.$message.error(res.msg || res.error)
        }
      })
    },
    deleteAfter (pageSize) {
      const params = {
        pageNo: 1,
        queryValue: this.searchStr,
        orderBy: 'uts',
        pageSize
      }
      if (this.type === 'metric') {
        params.queryKey = 'explore-metric'
      } else {
        params.queryKey = 'explore-log'
      }
      delete params.total
      this.$get('/sys/user/queryHistory', params).then(res => {
        if (res.code === 200) {
          this.firstLoading = false
          this.historyArr = res.data.list
          this.pageObj.total = res.data.total
          if (this.pageObj.total > this.historyArr.length) {
            this.hasMore = true
          } else {
            this.hasMore = false
          }
          this.pageObj.pageSize = 10
        } else {
          this.$message.error(res.msg || res.error)
        }
      })
    },
    selectHistory (item) {
      this.$emit('selectHistory', item.queryValue)
    }
  }
}
</script>

<style scoped>

</style>
