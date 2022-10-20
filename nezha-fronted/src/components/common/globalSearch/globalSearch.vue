<template>
  <div class="global-search-bac" v-if="globalShow" @click.self="close">
    <div class="global-search-box" :class="firstShow? '' : 'search-after'" @click.self="close">
      <div class="global-search-input" :class="firstShow? '' : 'search-after'">
        <i class="nz-icon nz-icon-search" v-my-loading:circle3.scaleMin.icon="loading"></i>
        <el-input v-model="searchStr" @input="searchAll" ref="searchStr" :placeholder="$t('globalSearch.placeholder')" @keydown.native="inputKeydown" clearable></el-input>
        <div @click="close" class="global-search-cancel">
          {{$t('overall.cancel')}}
        </div>
      </div>
      <div class="global-search-content" v-if="!firstShow">
        <div class="global-search-content-content" v-if="!isNoData">
          <div class="global-search-content-left">
            <el-skeleton :loading="loading" animated  class="list">
              <template slot="template">
                  <li
                    v-for="(item,index) in skeletonArr"
                    class="list-item"
                    :key="index"
                    :ref="'item'+ index"
                  >
                    <div class="list-item-content">
                      <el-skeleton-item
                        style="width: 16px; height: 16px;display: inline-block"
                      />
                      <el-skeleton-item variant="h3" style="width: 50%;display: inline-block;margin-left: 15px" />
                    </div>
                    <div class="list-item-sub">
                      <el-skeleton-item variant="text" style="" />
                    </div>
                  </li>
              </template>
              <template>
                <ul
                  class="list"
                  ref="list"
                  v-infinite-scroll="load"
                  infinite-scroll-disabled="disabled">
                  <li
                    v-for="(item,index) in tableData"
                    class="list-item"
                    :class="index === selectIndex ? 'lise-item-active' : ''"
                    :key="index"
                    :ref="'item'+ index"
                    @mouseenter="changeSelectIndex(index)"
                    @click="jumpTo"
                  >
                    <div class="list-item-content">
                      <i class="nz-icon" :class="selectIcon(item)" />
                      <HighlightText ref="searchStr" :queries="searchStr" :highlightClass="'list-item-highlight'" style="vertical-align: middle" :title="item.name">{{item.name}}</HighlightText>
                    </div>
                    <div class="list-item-sub" v-if="item.sub">
                      {{ item.sub }}
                    </div>
                    <div class="is-jump" v-my-loading:circle3.scaleMin.icon="jumpLoading">
                      <i class="nz-icon nz-icon-huiche"></i>
                    </div>
                  </li>
                  <li class="list-item" v-if="nextLoading" v-my-loading="nextLoading"></li>
                  <!--              <li  class="list-item" v-if="noMore&&!nextLoading">没有更多了</li>-->
                </ul>
              </template>
            </el-skeleton>
          </div>
          <div class="global-search-content-right">
            <searchItemInfo v-if="tableData[selectIndex] || loading" :obj="tableData[selectIndex]" :severityData="severityData" :faLoading="loading"></searchItemInfo>
          </div>
        </div>
        <div v-else class="global-search-content" style="justify-content: center">
          <div class="table-no-data">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#nz-icon-no-data-list"></use>
            </svg>
            <div class="table-no-data__title">No results found</div>
          </div>
        </div>
        <div class="global-search-footer">
          <div class="global-search-footer-left">
            <div class="keyboard">
              <i class="nz-icon nz-icon-huiche" />
            </div>
            {{$t('globalSearch.toSelect')}}
            <div class="keyboard" style="margin-left: 20px">
              <i class="nz-icon nz-icon-xiangshang" />
            </div>
            <div class="keyboard">
              <i class="nz-icon nz-icon-xiangxia" />
            </div>
            {{$t('globalSearch.toNavigate')}}
            <div class="keyboard" style="margin-left: 20px">
              <i class="nz-icon nz-icon-esc"  style="font-size: 12px;"/>
            </div>
            {{$t('globalSearch.toEsc')}}
          </div>
          <div class="global-search-footer-right">
            <div class="scope-box" v-for="item in scope" :class="item.isSelect ? 'is-select' : ''" :key="item.type" @click="scopeChange(item)" :title="item.title">
              <i class="nz-icon" :class="selectIcon(item)" />
              {{stat[item.type] || 0}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HighlightText from 'vue-text-highlight'
import searchItemInfo from './searchItemInfo'

export default {
  name: 'globalSearch',
  components: {
    HighlightText,
    searchItemInfo
  },
  computed: {
    globalShow () {
      return this.$store.getters.getGlobalShow
    },
    noMore () {
      return (this.pageObj.pageNo * this.pageObj.pageSize) >= this.pageObj.total
    },
    disabled () {
      return this.loading || this.noMore
    }
  },
  data () {
    return {
      firstShow: true,
      searchStr: '',
      loading: false,
      nextLoading: false,
      jumpLoading: false,
      selectIndex: '',
      tableData: [],
      isNoData: false,
      pageObj: {
        pageNo: 1,
        pageSize: 50,
        total: 50
      },
      obj: {},
      severityData: {},
      // scope: ['asset', 'datacenter', 'project', 'module', 'endpoint', 'alertrule'],
      scope: [
        {
          type: 'datacenter',
          isSelect: true,
          title: this.$t('overall.dc')
        }, {
          type: 'asset',
          isSelect: true,
          title: this.$t('asset.asset')
        }, {
          type: 'project',
          isSelect: true,
          title: this.$t('project.project.projectName')
        }, {
          type: 'module',
          isSelect: true,
          title: this.$t('overall.module')
        }, {
          type: 'endpoint',
          isSelect: true,
          title: this.$t('asset.endpoint')
        }, {
          type: 'alertrule',
          isSelect: true,
          title: this.$t('alert.rule')
        }
      ],
      skeletonArr: 20,
      timer: null,
      searchTimer: null,
      scopeChangeTimer: null,
      isKeyDown: false,
      stat: {

      }
    }
  },
  watch: {
    globalShow: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.bindEvent()
        }
      }
    }
  },
  methods: {
    close () {
      this.searchStr = ''
      this.firstShow = true
      this.selectIndex = 0
      this.pageObj.pageNo = 1
      this.jumpLoading = false
      this.tableData = []
      this.$store.commit('setGlobalShow', false)
      this.scope.forEach((item) => {
        item.isSelect = true
      })
      this.unbindEvent()
    },
    selectIcon (item) {
      switch (item.type) {
        case 'asset' : return 'nz-icon-overview-project'
        case 'datacenter' : return 'nz-icon-Datacenter2'
        case 'project' : return 'nz-icon-project'
        case 'module' : return 'nz-icon-overview-module'
        case 'endpoint' : return 'nz-icon-overview-endpoint'
        case 'alertrule' : return 'nz-icon-Alertrule'
      }
      return 'nz-icon-module5'
    },
    bindEvent () {
      window.addEventListener('keydown', this.keyDown)
      window.addEventListener('keyup', this.keyup)
    },
    unbindEvent () {
      this.selectIndex = ''
      window.removeEventListener('keydown', this.keyDown)
      window.removeEventListener('keyup', this.keyup)
    },
    scroll () {
      const ulBox = this.$refs.list
      const liBox = this.$refs['item' + this.selectIndex][0]
      const liHeight = liBox.clientHeight
      const height = ulBox.clientHeight
      const offsetTop = liBox.offsetTop - ulBox.offsetTop
      const scrollTop = ulBox.scrollTop
      // liBox.focus()
      if (offsetTop - scrollTop < 0) {
        ulBox.scrollTop = offsetTop
      } else if (offsetTop - scrollTop >= height - liHeight) {
        ulBox.scrollTop = offsetTop - height + liHeight
      }
    },
    changeSelectIndex (index) {
      if (this.jumpLoading) {
        return
      }
      if (this.isKeyDown) {
        this.getItemInfo()
        return
      }
      this.selectIndex = index
      this.getItemInfo()
    },
    inputKeydown (e) {
      if (e.keyCode === 40 || e.keyCode === 38) {
        event.preventDefault()
      }
    },
    keyDown (e) {
      window.event ? window.event.cancelBubble = true : e.stopPropagation()
      if (this.jumpLoading) {
        return
      }
      if (e.keyCode === 13) {
        this.jumpTo()
      }
      this.isKeyDown = true
      if (e.keyCode === 40) {
        if (this.selectIndex === this.tableData.length - 1) {
          this.isKeyDown = false
          return
        }
        this.selectIndex++
        this.scroll()
        this.changeSelectIndex(this.selectIndex)
      }
      if (e.keyCode === 38) {
        if (this.selectIndex === 0) {
          this.isKeyDown = false
          return
        }
        this.selectIndex--
        this.scroll()
        this.changeSelectIndex(this.selectIndex)
      }
      if (e.keyCode === 27) {
        this.close()
      }
    },
    keyup () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        this.isKeyDown = false
      }, 300)
    },
    jumpTo () {
      this.jumpLoading = true
      const routerPath = this.getRouterPath()
      const params = {
        table: this.tableData[this.selectIndex].type,
        id: this.tableData[this.selectIndex].id,
        pageSize: routerPath.pageSize
      }
      this.$get('/stat/rownum', params).then(res => {
        if (res.code === 200) {
          this.close()
          this.$store.commit('setGlobalSearchId', params.id)
          this.$router.push({
            path: routerPath.route,
            query: {
              pageNo: res.data.pageNo,
              pageSize: res.data.pageSize,
              rownum: res.data.rownum
            }
          })
          if (routerPath.route === this.$route.path) {
            this.$store.commit('setIsRouteLive')
            // this.routeReload()
          }
        } else {
          this.$message.error(res.msg)
          this.jumpLoading = false
        }
      })
    },
    getRouterPath () {
      const type = this.tableData[this.selectIndex].type
      let tableId = ''
      let route = '/'
      if (type === 'datacenter') {
        tableId = 'dcTable'
        route += 'dc'
      } else if (type === 'alertRule' || type === 'alertrule') {
        tableId = 'alertRuleTable'
        route += 'alertRule'
      } else if (type === 'asset') {
        tableId = type + 'Table'
        route += 'asset'
      } else {
        tableId = type + 'Table'
        route += type
      }
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + tableId)
      if (!(pageSize && pageSize !== 'undefined')) {
        pageSize = 20
      }
      return {
        pageSize,
        route
      }
    },
    getItemInfo () {
      this.obj = {}
    },
    searchAll (e) {
      // this.getSeverityData()
      if (this.searchTimer) {
        clearInterval(this.searchTimer)
        this.searchTimer = null
      }
      this.loading = true
      this.firstShow = false
      this.searchTimer = setTimeout(() => {
        this.selectIndex = 0
        this.pageObj.pageNo = 1
        this.tableData = []
        this.getData()
      }, 500)
    },
    load () {
      this.pageObj.pageNo++
      this.nextLoading = true
      this.getData()
    },
    scopeChange (scope) {
      if (this.scopeChangeTimer) {
        clearInterval(this.scopeChangeTimer)
        this.scopeChangeTimer = null
      }
      this.loading = true
      const isSelectArr = this.scope.filter(item => item.isSelect)
      if (isSelectArr.length === this.scope.length) {
        this.scope.forEach(item => {
          item.isSelect = false
        })
        scope.isSelect = !scope.isSelect
      } else if (isSelectArr.length === 1 && isSelectArr[0].type === scope.type) {
        this.scope.forEach(item => {
          item.isSelect = true
        })
      } else {
        scope.isSelect = !scope.isSelect
      }
      this.scopeChangeTimer = setTimeout(() => {
        this.pageObj.pageNo = 1
        this.tableData = []
        this.selectIndex = 0
        this.getData()
      }, 100)
    },
    getData () {
      this.isNoData = false
      const param = {
        pageNo: this.pageObj.pageNo,
        pageSize: this.pageObj.pageSize,
        scope: this.scope.filter(item => item.isSelect).map(item => item.type).join(','),
        q: this.searchStr
      }
      if (!this.searchStr) {
        this.firstShow = true
        this.loading = false
        this.nextLoading = false
        return
      } else {
        this.firstShow = false
      }
      this.$get('/stat/search', param).then(res => {
        this.firstShow = false
        this.nextLoading = false
        this.jumpLoading = false
        if (res.code === 200) {
          this.tableData = this.tableData.concat(res.data.list)
          if (!this.tableData.length) {
            this.isNoData = true
          }
          this.pageObj.total = res.data.total
          this.stat = res.stat
        } else {
          this.$message.error(res.msg)
        }
        this.loading = false
      })
    },
    getSeverityData () {
      this.$get('alert/severity', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.severityData = response.data.list
        }
      })
    }
  },
  mounted () {
    this.getSeverityData()
  },
  destroyed () {
    window.removeEventListener('keydown', this.keyDown)
  }
}
</script>

<style scoped>

</style>
