<template>
  <div style="height: 100%;">
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">ID：{{obj.id}}</div><div
        @click="changeTab('record')" class="sub-list-tab">{{$t("config.terminallog.record.record")}}</div><div
        class="sub-list-tab sub-list-tab-active">{{$t("config.terminallog.cmd.cmd")}}</div>
      </div>
    </div>
    <div class="record-container">
      <div class="record-container--record-tip">
        <span class="record--title">{{$t('config.terminallog.cmd.legendTip')}}:</span>
        <span class="detail--cmd"><span class="detail--cmd__red"><i class="nz-icon nz-icon-jinggao" style="color: #f35844; margin-right: 8px"></i>{{$t("config.terminallog.cmd.dangerTip")}}</span></span>
      </div>
      <div class="record-container--record">
        <div class="record--title">{{$t('config.terminallog.cmd.history')}}</div>
        <div class="record--list">
          <template v-for="(record, index) in records">
            <template v-for="item in record.list">
              <div class="detail--time"><span>{{calcTime(item.time)}}</span></div>
              <div class="detail--cmd"><span :class="matchBgColor(item.cmd)">{{item.cmd}}</span></div>
            </template>
          </template>
        </div>
        <div :style="{visibility: hasNext ? 'visible' : 'hidden'}" class="record--more">
          <span @click="loadMore" class="more-btn"><i class="nz-icon nz-icon-drop-down"></i></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "terminalLogRecordTab",
    components: {
    },
    props: {
      obj: Object, //关联的实体对象
    },
    computed: {
      calcTime() {
        return function(time) {
          if (this.obj.startTime) {
            let startTime = new Date(this.obj.startTime).getTime();
            if (startTime) {
              let thisTime = startTime+time;
              return this.dateFormat(thisTime);
            }
          }
          return "-";
        }
      },
      matchBgColor() {
        return function(cmd) {
          let className = "";
          let dangerCmd = this.$CONSTANTS.terminalLog.dangerCmd;
          let infoCmd = this.$CONSTANTS.terminalLog.infoCmd;
          let cmdSplit = cmd.split(" ");
          if (this.intersection(infoCmd, cmdSplit).length > 0) {
            className = "detail--cmd__green";
          }
          if (this.intersection(dangerCmd, cmdSplit).length > 0) {
            className = "detail--cmd__red";
          }
          return className;
        }
      },
      hasNext() {
        if (this.records.length > 0) {
          return this.records[this.records.length-1].hasNext;
        }
        return false;
      }
    },
    data() {
      return {
        filter: {
          uuid: "",
          cmd: "",
          time: "",
          size: 200
        },
        records: [ // 加载更多时有多个record，否则只有一个

        ],
      }
    },
    methods: {
      initData(filter) {
        this.$get("/terminal/cmd", filter).then(res => {
          if (res.code === 200) {
            this.records.push(res.data);
          } else {
            this.$message.error(res.msg);
          }
        });
      },
      loadMore() {
        let filter = Object.assign({}, this.filter);
        filter.time = this.records[this.records.length-1].time;
        this.initData(filter);
      },
      // 切换tab
      changeTab(tab) {
        this.$emit('changeTab', tab);
      },
      intersection(a, b) {
        let s = new Set(b);
        return a.filter(x => s.has(x));
      },
      dateFormat(time) {
        if (!time) {
          return '-';
        }
        let date = new Date(time);
        let year = date.getFullYear();
        let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
      },
      formatUpdateTime(date) {
        let time=new Date(date);
        let hours=time.getHours()>9?time.getHours():'0'+time.getHours();
        let minutes=time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes();

        return hours+':'+minutes;
      },
    },
    watch: {
      obj: {
        immediate: true,
        deep: true,
        handler(n) {
          this.records = [];
          this.filter.uuid = n.uuid;
          this.initData(this.filter);
        }
      },
    },
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
