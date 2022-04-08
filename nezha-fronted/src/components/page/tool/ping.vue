<template>
    <nz-data-list
      ref="dataList"
      :layout="[]"
      :from="fromRoute.ping"
    >
    <template v-slot:top-tool-left>
      <el-input v-model="ip" @focus="ipFocus=true" size='medium' style="width:250px" :placeholder="$t('overall.placeHolder')+' IP/Hostname'"></el-input>
      <el-popover
        placement="bottom"
        width="220"
        trigger="manual"
        v-model="visible"
        v-clickoutside="close"
        popper-class="no-style-class"
        >
        <el-form size="small" ref="ruleForm" label-position="top" :model="ruleForm" :rules="formRules">
          <el-form-item style="margin-bottom:0px">
            <p class="pop-tit">{{$t('overall.dc')}}</p>
            <ul class="pop-list-wrap">
              <li class="el-dropdown-menu__item">
                <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">{{$t('overall.all')}}</el-checkbox>
              </li>
              <ul class="pop-list">
                <el-checkbox-group v-model="checked" @change="checkedChange">
                  <li class="el-dropdown-menu__item" v-for="item in dataCenter" :key="item.id">
                    <el-checkbox :label="item.id">{{item.name}}</el-checkbox>
                  </li>
                </el-checkbox-group>
              </ul>
            </ul>
          </el-form-item>
          <el-form-item prop="timeout" style="margin-bottom:10px">
            <div class="pop-tit">{{$t('ping.timeOut')}}</div>
            <div class="wrap" style="height:32px">
              <el-input v-model.number="ruleForm.timeout" placeholder="" >
                <template slot="append">{{$t('config.system.basic.second')}}</template>
              </el-input>
            </div>
          </el-form-item>
        </el-form>
        <el-button slot="reference" class="top-tool-btn margin-l-10 choose" @click="triggerVisible">
          <i class="el-icon-more"></i>
        </el-button>
      </el-popover>

      <el-button class="top-tool-btn btn" v-if="!flag" @click="startTask">
        <i class="el-icon-caret-right"></i>
      </el-button>
      <el-button class="top-tool-btn btn" v-else @click="clearTask">
        <i class="quadrate"></i>
      </el-button>
    </template>

    <template v-slot:default>
      <!-- 初始展示的内容 ip输入框聚焦后消失 -->
      <div class="empty" v-if="!ipFocus">
        <el-steps align-center>
          <el-step>
            <span class="nz-icon nz-icon-edit" slot="icon"></span>
            <p class="txt" slot="title">{{$t('overall.placeHolder')}} IP/Hostname</p>
          </el-step>
          <el-step>
            <span class="el-icon-more" slot="icon"></span>
            <p class="txt" slot="title">{{$t('ping.filter')}}</p>
          </el-step>
          <el-step>
            <span class="msg" slot="icon">Ping</span>
            <p class="txt" slot="title">Ping {{$t('config.terminallog.cmd.cmd')}}</p>
          </el-step>
        </el-steps>
      </div>
      <!-- 存在任务id时展示表格 -->
      <div class="data-wrap" v-show="tid">
        <div class="data-top">
          <span>IP {{$t('ping.total')}}:{{total}}</span>
          <span>{{$t('ping.done')}}:{{tableData.length}}</span>
          <span>{{$t('ping.progress')}}:{{parseInt(tableData.length/total*100)}}%</span>
        </div>
        <div class="data-bottom">
          <ping-table
            ref="dataTable"
            :loading="loading"
            v-my-loading="loading"
            :custom-table-title="tools.customTableTitle"
            :height="mainTableHeight"
            :table-data="tableData"
            >
          </ping-table>
        </div>
      </div>
    </template>
  </nz-data-list>
</template>

<script>
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import pingTable from '@/components/common/table/settings/pingTable'
import { positiveInteger } from '../../common/js/validate'
export default {
  mixins: [dataListMixin],
  components: {
    nzDataList,
    pingTable
  },
  data () {
    return {
      loading: false,
      // 弹出框是否显示
      visible: false,
      ip: '',
      // ip输入框是否聚焦
      ipFocus: false,
      // 是否全选
      checkAll: true,
      isIndeterminate: false,
      // 数据中心
      dataCenter: [],
      // 复选框选中的值
      checked: [],
      // 是否正在请求数据
      flag: false,
      // 定时器id
      timer: null,
      // 任务id
      tid: 0,
      // 表格总数据
      total: 0,
      // 表格数据
      tableData: [],
      ruleForm: {
        // 超时时间
        timeout: ''
      },
      formRules: {
        timeout: [{ validator: positiveInteger, trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getDataCenter()
  },
  methods: {
    close () {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.visible = false
        }
      })
    },
    // 切换弹框显示隐藏
    triggerVisible () {
      if (!this.visible) {
        this.visible = true
      } else {
        this.close()
      }
    },
    // 点击全选
    checkAllChange (value) {
      const allId = this.dataCenter.map(item => {
        return item.id
      })
      this.checked = value ? allId : []
      this.isIndeterminate = false
    },
    // 点击单个选中
    checkedChange (value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.dataCenter.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.dataCenter.length
    },
    // 开始任务
    startTask () {
      const ipv4 = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\:\d{0,5})?$/
      const ipv6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
      if (!ipv4.test(this.ip) && !ipv6.test(this.ip)) {
        return this.$message.error(this.$t('validate.host'))
      }
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      // 标记正在请求中
      this.flag = true
      this.getId()
    },
    // 请求dataCenter
    getDataCenter () {
      this.$get('/dc?pageSize=-1').then(response => {
        this.dataCenter = response.data.list
        // 默认全选
        this.checked = this.dataCenter.map(item => {
          return item.id
        })
      })
    },
    // 请求任务id
    async getId () {
      this.tableData = []
      const params = {
        ip: this.ip,
        dcIds: this.checked.join(','),
        timeout: this.ruleForm.timeout
      }
      this.$get('/tool/ping', params).then(response => {
        // this.tid = response.data
        this.tid = 111
        this.total = 30
        this.timer = setInterval(() => {
          if (this.tableData.length < this.total) {
            this.getData()
          } else {
            this.clearTask()
          }
        }, 1000)
      })
    },
    // 请求表格数据
    getData () {
      this.$get('/tool/ping/result/' + this.tid).then(response => {
        this.tableData.push({
          dataCenter: '数据中心',
          source: '192.168.40.1',
          ip: '192.168.40.2',
          state: 1,
          rate: 20.0,
          avg: 30,
          min: 23,
          max: 44,
          raw: '正在 Ping 127.0.0.1 具有 32 字节的数据:\r\n来自 127.0.0.1 的回复: 字节=32 时间<1ms TTL=64\r\n来自 127.0.0.1 的回复: 字节=32 时间<1ms TTL=64\r\n来自 127.0.0.1 的回复: 字节=32 时间<1ms TTL=64\r\n来自 127.0.0.1 的回复: 字节=32 时间<1ms TTL=64\r\n\r\n127.0.0.1 的 Ping 统计信息:\r\n    数据包: 已发送 = 4，已接收 = 4，丢失 = 0 (0% 丢失)，\r\n往返行程的估计时间(以毫秒为单位):\r\n    最短 = 0ms，最长 = 0ms，平均 = 0ms'
        })
      })
    },
    // 清除任务
    async clearTask () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      await this.$get('/tool/ping/cancel/' + this.tid)
      this.flag = false
    }
  },
  // 离开页面的时候触发
  async beforeRouteLeave (to, from, next) {
    await this.clearTask()
    next()
  }
}
</script>

<style lang="scss" scoped>

</style>
