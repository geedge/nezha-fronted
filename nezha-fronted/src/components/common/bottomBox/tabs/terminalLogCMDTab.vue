<template>
  <nz-bottom-data-list
    :layout="[]"
    :tabs="tabs"
    @changeTab="changeTab"
  >
    <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
    <template v-slot>
      <div class="record-container">
        <div class="record-container--record-tip">
          <span class="record--title">{{$t('config.terminallog.cmd.legendTip')}}:</span>
          <span class="detail--cmd"><span class="detail--cmd__red"><i class="nz-icon nz-icon-jinggao" style="color: #f35844; margin-right: 8px"></i>{{$t("config.terminallog.cmd.dangerTip")}}</span></span>
        </div>
        <div class="record-container--record">
          <div class="record--title">{{$t('config.terminallog.cmd.history')}}</div>
          <div class="record--list">
            <template v-for="record in records">
              <template v-for="(item, index) in record.list">
                <div :key="index" class="detail--time"><span>{{calcTime(item.time)}}</span></div>
                <div :key="index" class="detail--cmd"><span :class="matchBgColor(item.cmd)">{{item.cmd}}</span></div>
              </template>
            </template>
          </div>
          <div :style="{visibility: hasNext ? 'visible' : 'hidden'}" class="record--more">
            <span class="more-btn" @click="loadMore"><i class="nz-icon nz-icon-drop-down"></i></span>
          </div>
        </div>
      </div>
    </template>
  </nz-bottom-data-list>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'

export default {
  name: 'terminalLogRecordTab',
  mixins: [dataListMixin, subDataListMixin],
  components: {
    nzBottomDataList
  },
  computed: {
    calcTime () {
      return function (time) {
        if (this.obj.startTime) {
          const startTime = new Date(this.obj.startTime).getTime()
          if (startTime) {
            const thisTime = startTime + time
            return this.dateFormat(thisTime)
          }
        }
        return '-'
      }
    },
    matchBgColor () {
      return function (cmd) {
        let className = ''
        const dangerCmd = this.$CONSTANTS.terminalLog.dangerCmd
        const infoCmd = this.$CONSTANTS.terminalLog.infoCmd
        const cmdSplit = cmd.split(' ')
        if (this.intersection(infoCmd, cmdSplit).length > 0) {
          className = 'detail--cmd__green'
        }
        if (this.intersection(dangerCmd, cmdSplit).length > 0) {
          className = 'detail--cmd__red'
        }
        return className
      }
    },
    hasNext () {
      if (this.records.length > 0) {
        return this.records[this.records.length - 1].hasNext
      }
      return false
    }
  },
  data () {
    return {
      filter: {
        uuid: '',
        cmd: '',
        time: '',
        size: 200
      },
      records: [ // 加载更多时有多个record，否则只有一个

      ]
    }
  },
  methods: {
    initData (filter) {
      this.$get('/terminal/cmd', filter).then(res => {
        if (res.code === 200) {
          this.records.push(res.data)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    loadMore () {
      const filter = Object.assign({}, this.filter)
      filter.time = this.records[this.records.length - 1].time
      this.initData(filter)
    },
    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
    },
    intersection (a, b) {
      const s = new Set(b)
      return a.filter(x => s.has(x))
    },
    dateFormat (time) {
      if (!time) {
        return '-'
      }
      const date = new Date(time)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()

      return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
    },
    formatUpdateTime (date) {
      const time = new Date(date)
      const hours = time.getHours() > 9 ? time.getHours() : '0' + time.getHours()
      const minutes = time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes()

      return hours + ':' + minutes
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        this.records = []
        this.filter.uuid = n.uuid
        this.initData(this.filter)
      }
    }
  }
}
</script>

<style lang="scss">
.record-container {
  height: calc(100% - 50px);
  overflow: auto;
  position: relative;
}
.record-container--record {
  background-color: white;
  width: calc(100% - 6px);
  padding: 16px 15px 6px 15px;
  border: 1px solid #d8dce1;
  box-sizing: border-box;
  min-height: 100px;

  .record--title {
    color: #333;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
  }

  .record--list {
    display: grid;
    gap: 6px 12px;
    grid-template-columns: 150px auto;
    font-size: 14px;
    color: #333;

    .detail--time {
      line-height: 22px;
      grid-column: 1/span 1;
      display: flex;
      font-size: 12px;
      align-items: flex-start;

      span {
        background-color: #ECECEC;
        padding: 2px 10px;
      }
    }

    .detail--cmd {
      line-height: 22px;
      grid-column: 2/span 1;
      display: flex;

      span {
        padding: 2px 10px;
      }
    }

    .detail--cmd__green {
      background-color: #B4FDB1;
    }
    .detail--cmd__red {
      background-color: #FFD2C2;
    }
  }

  .record--more {
    text-align: center;
    margin-top: 15px;

    .more-btn {
      color: #999;
      cursor: pointer;

      .nz-icon {
        font-size: 14px;
      }
    }
  }
}
.record-container--record-tip {
  position: absolute;
  right: 20px;
  top: 17px;

  .record--title {
    color: #333;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
  }

  .detail--cmd {
    line-height: 22px;
    font-size: 14px;
    padding-left: 20px;

    span {
      padding: 3px 10px;
    }
  }

  .detail--cmd__green {
    background-color: #A7F29E;
  }
  .detail--cmd__red {
    background-color: #FBe2DE;
  }
}
</style>
