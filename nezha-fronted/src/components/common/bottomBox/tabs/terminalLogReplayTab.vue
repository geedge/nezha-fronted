<template>
  <div style="height: 100%;">
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">ID：{{obj.id}}</div><div
        class="sub-list-tab sub-list-tab-active">{{$t("config.terminallog.replay")}}</div><div
        @click="changeTab('record')" class="sub-list-tab">{{$t("config.terminallog.record.record")}}</div>
      </div>
    </div>
    <div class="replay-container">
      <div class="replay-operate">
        <button @click="pause" class="nz-btn nz-btn-style-light nz-btn-size-large">暂停</button>
        <button @click="play" class="nz-btn nz-btn-style-light nz-btn-size-large">播放</button>
        <button @click="restart" class="nz-btn nz-btn-style-light nz-btn-size-large">重新播放</button>
        <el-tag>{{progress}}</el-tag>
      </div>
      <div class="replay-console">
        <div :id="obj.uuid" class="replay-terminal"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import Terminal from '../../js/Xterm';

  export default {
    name: "terminalLogReplayTab",
    components: {
      Terminal
    },
    props: {
      obj: Object, //关联的实体对象
    },
    data() {
      return {
        filter: {
          size: 1,
          uuid: ""
        },
        operate: {
          pause: false, // 是否暂停

        },
        terminal: null,

        recordData: [],
        isNeedStop: false, // 是否需要停止
        playedCount: 0, // 当前已经播放完的数量
        isPlaying: true, // 是否正在播放
        isFinish: false, //是否已结束
        recordTick: 50, // 输出间隔时间ms，默认50
        playerTimer: null, // 定时器
        playerCurrentTime: 0, // 当前时间进度
        speedTable: [ // 快进倍速选项
          {speed: 1, name: 'Normal'},
          {speed: 2, name: 'x2'},
          {speed: 4, name: 'x4'},
          {speed: 8, name: 'x8'},
          {speed: 16, name: 'x16'}
        ],
        speedOffset: 0, // 快进倍数index
        progress: 0, // 进度条进度
        needSkip: false, // 需要时间刻度，即是否跳过无操作时间，为true时表示需要，即不跳过无操作时间
        timeUsed: 0,
      }
    },
    methods: {
      // 切换tab
      changeTab(tab) {
        this.$emit('changeTab', tab);
      },

      getReplayData() {
        return new Promise(resolve => {
          this.$get("/terminal/record", this.filter).then(res => {
            if (res.code === 200) {
              this.recordData = res.data.list;
              this.timeUsed = res.data.endTime;
            }
            resolve();
          });
        });
      },

      initAndPlay() {
        // terminal初始化
        if (!this.terminal) {
          this.terminal = new Terminal(
            {
              cols: 70,
              rows: 28
            }
          );
        } else {
          this.terminal.destroy();
        }

        setTimeout(() => {
          this.terminal.open(document.getElementById(this.obj.uuid));
          this.terminal.resize(70, 28);

          this.$nextTick(() => {
            if (this.recordData.length > 0) {
              this.isNeedStop = false;
              this.isPlaying = true;
              this.isFinished = false;
              this.playedCount = 0;
              this.doPlay();
            } else {
              let req = this.getReplayData();
              req.then(() => {
                if (this.recordData.length > 0) {
                  // 请求得到数据后，开始播放
                  this.isNeedStop = false;
                  this.isPlaying = true;
                  this.isFinished = false;
                  this.playedCount = 0;
                  this.doPlay();
                }
              });
            }
          });
        }, 800);
      },

      /*原理：利用setTimeout和数据的时间偏移量来模拟实现视频播放效果*/
      doPlay() {
        if (this.isNeedStop) {
          this.isPlaying = false;
          return;
        }

        if (this.recordData.length <= this.playedCount) {
          this.playerTimer = setTimeout(this.doPlay, this.recordTick);
          return;
        }
        this.playerCurrentTime += this.recordTick * this.speedTable[this.speedOffset].speed;

        let recordTick = this.recordTick;

        let playData;
        for (let i = this.playedCount; i < this.recordData.length; i++) {
          if (this.isNeedStop) {
            break;
          }
          playData = this.recordData[i];
          if (playData.t < this.playerCurrentTime) {
            this.terminal.write(playData.c);

            if ((this.playedCount + 1) === this.recordData.length) {
              //播放完成
              this.progress = 100;
              this.isFinished = true;
              this.isPlaying = false;
              return;
            } else {
              this.playedCount++;
            }

          } else {
            break;
          }
        }
        if (this.isNeedStop) {
          return;
        }

        if (this.needSkip) {
          if (playData.t - this.playerCurrentTime > 800) {
            this.playerCurrentTime = playData.t; // - this.record_tick * this.speed_table[this.speed_offset].speed;
            recordTick = 800;
          }
        }
        // 同步进度条
        this.progress = parseInt(this.playerCurrentTime * 100 / this.timeUsed);

        if (this.playedCount >= this.recordData.length) {
          this.progress = 100;
          //播放完成
          this.isFinished = true;
          this.isPlaying = false;
        } else {
          if (!this.isNeedStop)
            this.playerTimer = setTimeout(this.doPlay, recordTick);
        }

      },
      play() {
        if (this.isPlaying) {
          return;
        }

        if (this.isFinished) {
          this.restart();
          return;
        }

        this.isNeedStop = false;
        this.isPlaying = true;
        this.playerTimer = setTimeout(this.doPlay, this.recordTick);
      },

      pause() {
        if (this.playerTimer) {
          clearTimeout(this.playerTimer);
        }
        this.isNeedStop = true;
        this.isPlaying = false;
      },

      restart() {
        if (this.playerTimer) {
          clearTimeout(this.playerTimer);
        }
        this.playerCurrentTime = 0;
        this.initAndPlay();
      },

      dateFormat(time) {
        if (!time) {
          return '-';
        }
        let date = new Date(time * 1000);
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
      // 入口，监听terminal session的变化，开始功能
      obj: {
        immediate: true,
        deep: true,
        handler(n) {
          if (n.uuid) {
            this.filter.uuid = n.uuid;
            this.initAndPlay();
          }
        }
      },
    },
    mounted() {

    },
  }
</script>

<style lang="scss">
.replay-console {
  width: 660px;
  height: 480px;
  padding: 10px 4px 10px 10px;
  background-color: black;
}
</style>
