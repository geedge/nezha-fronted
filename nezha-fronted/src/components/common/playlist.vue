<template>
  <div class="top-tool-btn-group playlist">
    <el-tooltip
      effect="light"
      placement="bottom"
      :content="$t('dashboard.previous')">
      <button class="top-tool-btn previous" @click="goPrevious">
        <i class="nz-icon nz-icon-shangyibofang"></i>
      </button>
    </el-tooltip>
    <button class="top-tool-btn stopPlaylist" @click="stopPlaylist">{{$t('dashboard.stopPlaylist')}}</button>
    <el-tooltip
      effect="light"
      placement="bottom"
      :content="$t('dashboard.next')">
      <button class="top-tool-btn next" @click="goNext">
        <i class="nz-icon nz-icon-xiayibofang"></i>
      </button>
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'playlist',
  props: {
    playlistObj: {
      type: Object
    }
  },
  data () {
    return {
      dashboardList: [], // 轮播仪表盘列表
      timer: null,
      currentIndex: 0
    }
  },
  watch: {
    playlistObj: {
      immediate: true,
      async handler () {
        this.currentIndex = 0
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
        await this.getDashboard()
        this.startPlay()
      }
    }
  },

  methods: {
    // 开始轮播
    async startPlay () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.changePlay()
      const interval = this.playlistObj.intvl * 60 * 1000
      this.timer = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex === this.playlistObj.dashboardIds.length) {
          this.currentIndex = 0
        }
        this.changePlay()
      }, interval)
    },
    // 上一个
    goPrevious () {
      this.currentIndex--
      if (this.currentIndex === -1) {
        this.currentIndex = this.playlistObj.dashboardIds.length - 1
      }
      this.startPlay()
    },
    // 下一个
    goNext () {
      this.currentIndex++
      if (this.currentIndex === this.playlistObj.dashboardIds.length) {
        this.currentIndex = 0
      }
      this.startPlay()
    },
    // 停止轮播
    stopPlaylist () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.$emit('stopPlaylist')
    },
    changePlay () {
      let data = this.dashboardList[this.currentIndex]
      if (!data) {
        data = {
          id: this.playlistObj.dashboardIds[this.currentIndex],
          name: ''
        }
      }
      this.$emit('changePlay', data)
    },
    async getDashboard () {
      this.dashboardList = []
      const ids = this.playlistObj.dashboardIds.join(',')
      const res = await this.$get('visual/dashboard?ids=' + ids)
      this.playlistObj.dashboardIds.forEach(id => {
        const findItem = res.data.list.find(item => item.id == id)
        this.dashboardList.push(findItem)
      })
    }
  },
  beforeDestroy () {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
</script>
