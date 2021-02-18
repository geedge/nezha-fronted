<template>
  <div style="height: 100%;">
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">ID：{{obj.id}}</div><div
        @click="changeTab('replay')" class="sub-list-tab">{{$t("config.terminallog.replay")}}</div><div
        class="sub-list-tab sub-list-tab-active">{{$t("config.terminallog.record.record")}}</div>
      </div>
    </div>
    <div class="record-container">
      <div class="record-container--record">
        <div class="record--title">{{$t('config.terminallog.record.history')}}</div>
        <div class="record--list">
          <template v-for="(record, index) in records">
            <template v-for="item in record.list">
              <div class="detail--time"><span>{{calcTime(item.time)}}</span></div>
              <div class="detail--cmd"><span :class="matchBgColor(item.cmd)">{{item.cmd}}</span></div>
            </template>
          </template>
        </div>
        <div class="record--more" v-if="hasNext">
          <span @click="loadMore" class="nz-btn nz-btn-size-small nz-btn-style-light"><i class="nz-icon nz-icon-arrow-down"></i></span>
        </div>
      </div>

      <div class="record-container--record record-container--record__tip">
        <div class="record--title">{{$t('config.terminallog.record.legendTip')}}</div>
        <div class="record--list">
          <div class="detail--time"><span>yyyy-MM-dd HH:mm:ss</span></div>
          <div class="detail--cmd"><span class="detail--cmd__red">{{$t("config.terminallog.record.dangerTip")}}</span></div>
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
          uuid: this.obj.uuid,
          cmd: "",
          time: "",
          size: 200
        },
        records: [ // 加载更多时有多个record，否则只有一个

        ],
        /*record: { // cmd记录，含hasNext、time(最后一条时间)、total和list
          total: 4,
          hasNext: true,
          time: 9889,
          list: [
            {
              id: 1,
              uuid: 1,
              time: 1024,
              cmd: "ls -ef|grep java"
            },
            {
              id: 2,
              uuid: 2,
              time: 3824,
              cmd: "su root ls -ef|grep java|afaewrafaser aolewr | awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|ls -ef|grep java|afaewrafaser aolewr | awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|ls -ef|grep java|afaewrafaser aolewr | awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|ls -ef|grep java|afaewrafaser aolewr | awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|ls -ef|grep java|afaewrafaser aolewr | awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|ls -ef|grep java|afaewrafaser aolewr | awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|ls -ef|grep java|afaewrafaser aolewr | awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|awk fajpoerja;welkrjfa;wle|"
            },
            {
              id: 3,
              uuid: 3,
              time: 7740,
              cmd: "rm -rf /"
            },
            {
              id: 4,
              uuid: 4,
              time: 9889,
              cmd: "exit"
            },
          ]
        }*/
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
        }
      },
    },
    mounted() {
      this.initData(this.filter);
    },
  }
</script>

<style lang="scss">
.record-container {
  height: calc(100% - 50px);
  overflow: auto;
}
.record-container--record {
  background-color: white;
  width: calc(50% - 14px);
  padding: 16px 15px 14px 15px;
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
    font-size: 12px;
    color: #333;
    padding-left: 16px;

    .detail--time {
      line-height: 18px;
      grid-column: 1/span 1;
      display: flex;
      align-items: flex-start;

      span {
        background-color: #ECECEC;
        border-radius: 3px;
        padding: 2px 5px;
      }
    }

    .detail--cmd {
      line-height: 18px;
      grid-column: 2/span 1;
      display: flex;

      span {
        border-radius: 3px;
        padding: 2px 5px;
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

  }
}
.record-container--record.record-container--record__tip {
  margin-top: 10px;
  min-height: unset;
}
</style>
