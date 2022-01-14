<template>
  <div class="global-search-bac" v-if="globalShow" @click.self="close">
    <div class="global-search-box" :class="firstShow? '' : 'search-after'" @click.self="close">
      <div class="global-search-input" :class="firstShow? '' : 'search-after'">
        <i class="nz-icon nz-icon-search" v-loading="loading"></i>
        <el-input v-model="searchStr" @input="searchAll" ref="searchStr" :placeholder="$t('globalSearch.placeholder')"  clearable></el-input>
        <div @click="close" class="global-search-cancel">
          Cancel
        </div>
      </div>
      <div v-loading="loading" class="global-search-content" v-if="!firstShow">
        <div class="global-search-content-content" v-if="tableData.length">
          <div class="global-search-content-left">
            <ul
              class="list"
              ref="list"
              v-infinite-scroll="load"
              infinite-scroll-disabled="disabled">
              <!-- 添加 tabindex 实现focus的效果 -1 - -4 已被使用 所以从-5 开始 -->
              <li
                v-for="(item,index) in tableData"
                class="list-item"
                :class="index === selectIndex ? 'lise-item-active' : ''"
                :key="index"
                :ref="'item'+ index"
                @mouseenter="changeSelectIndex(index)"
                :tabindex="(selectIndex+5) * -1"
              >
                <div class="list-item-content">
                  <i class="nz-icon" :class="selectIcon(item)" />
                  <HighlightText ref="searchStr" :queries="searchStr" :highlightClass="'list-item-highlight'" style="vertical-align: middle" :title="item.name">{{item.name}}</HighlightText>
                </div>
                <div class="list-item-sub" v-if="item.sub">
                  {{ item.sub }}
                </div>
              </li>
              <li class="list-item" v-if="nextLoading" v-loading="nextLoading"></li>
<!--              <li  class="list-item" v-if="noMore&&!nextLoading">没有更多了</li>-->
            </ul>
          </div>
          <div class="global-search-content-right">
            <searchItemInfo v-if="tableData[selectIndex]" :obj="tableData[selectIndex]" :severityData="severityData"></searchItemInfo>
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
            <div class="scope-box" v-for="item in scope" :class="item.isSelect ? 'is-select' : ''" :key="item.type" @click="scopeChange(item)">
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
      console.log((this.pageObj.pageNo * this.pageObj.pageSize) >= this.pageObj.total)
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
      selectIndex: '',
      tableData: [],
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
          type: 'asseet',
          isSelect: true
        }, {
          type: 'datacenter',
          isSelect: true
        }, {
          type: 'project',
          isSelect: true
        }, {
          type: 'module',
          isSelect: true
        }, {
          type: 'endpoint',
          isSelect: true
        }, {
          type: 'alertrule',
          isSelect: true
        }
      ],
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
      this.tableData = []
      this.$store.commit('setGlobalShow', false)
      this.scope.forEach((item) => {
        item.isSelect = true
      })
      this.unbindEvent()
    },
    selectIcon (item) {
      // console.log(item)
      switch (item.type) {
        case 'asset' : return 'nz-icon-overview-project'
        case 'datacenter' : return 'nz-icon-model'
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
      // const ulBox = this.$refs.list
      const liBox = this.$refs['item' + this.selectIndex][0]
      // const liHeight = liBox.clientHeight
      // const height = ulBox.clientHeight - liHeight
      // const offsetTop = liBox.offsetTop
      liBox.focus()
      // if ((this.selectIndex + 1) * liHeight > height) {
      //   ulBox.scrollTop = (this.selectIndex + 1) * liHeight - height
      // } else {
      //   ulBox.scrollTop = 0
      // }
      // console.log(height, liHeight, offsetTop, ulBox.scrollTop)
    },
    changeSelectIndex (index) {
      console.log('changeSelectIndex', this.isKeyDown)
      if (this.isKeyDown) {
        this.getItemInfo()
        return
      }
      this.selectIndex = index
      this.getItemInfo()
    },
    keyDown (e) {
      console.log('keyDown')
      // console.log(e, e.target, e.keyCode)
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

    },
    getItemInfo () {
      this.obj = {}
    },
    searchAll () {
      if (this.searchTimer) {
        clearInterval(this.searchTimer)
        this.searchTimer = null
      }
      this.loading = true
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
      }
      this.$get('/stat/search', param).then(res => {
        this.firstShow = false
        this.nextLoading = false
        if (res.code === 200) {
          this.tableData = this.tableData.concat(res.data.list)
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
  destroyed () {
    window.removeEventListener('keydown', this.keyDown)
  }
}
</script>

<style scoped>

</style>
