<template>
  <nz-data-list
    ref="dataList"
    :layout="[]"
    :from="fromRoute.ping"
    class="radar-box"
  >
    <template v-slot:top-tool-left>
      <div class="tools-header">
        <div style="width: 360px;" class="nz-select-tag">
          <span style="vertical-align: top">{{$t('overall.IPAM')}}</span>
          <el-select
            v-model="discoveryForm.subnetIds"
            class="right-box__select"
            popper-class="right-box-select-top prevent-clickoutside"
            multiple placeholder="请选择"
            style="width: 240px"
            size="small">
            <el-option
              v-for="item in ipamData"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </div>

        <div  class="tools-header-center">
          <el-form size="small" ref="discoveryForm" :model="discoveryForm" :rules="formRules" label-position="right" label-width="150px">
            <el-form-item :label='$t("config.mib.credentials")' prop="snmpCredentialIds">
              <el-select
                v-model="discoveryForm.snmpCredentialIds"
                class="right-box__select"
                popper-class="right-box-select-top prevent-clickoutside"
                multiple placeholder="请选择"
                size="small">
                <el-option
                  v-for="item in credentialData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <!-- retries -->
            <el-form-item prop="retries" style="margin-bottom:14px" :label="$t('Retries')">
              <div class="wrap" style="height:32px">
                <el-input v-model.number="discoveryForm.retries" placeholder="">
                </el-input>
              </div>
            </el-form-item>
            <!-- Timeout -->
            <el-form-item prop="timeout" style="margin-bottom:14px" :label="$t('ping.timeout')">
              <div class="wrap" style="height:32px">
                <el-input v-model.number="discoveryForm.timeout" placeholder="">
                  <template slot="append">{{$t('overall.ms')}}</template>
                </el-input>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="tools-header-right">
          <div class="radar">
            <div class="first-circle"></div>
            <div class="second-circle"></div>
            <div class="third-circle"></div>
            <div class="sector" :class="isStart?'active':''"></div>
            <div class="radar-line"></div>
          </div>
          <div class="tools-header-right-content">
            <div class="tools-header-right-title right-content-text">{{$t('dashboard.dashboard.chartForm.statistics')}}</div>
            <div class="right-content-text right-content-box">
              <span class="margin-l-5">{{$t('asset.total')}}:<span class="margin-l-10 margin-r-30">{{total}}</span></span>
              <span>{{$t('ping.done')}}:<span class="margin-l-10 margin-r-30">{{done}}</span></span>
              <span>{{$t('ping.progress')}}:<span class="margin-l-10 margin-r-30">{{process}}%</span></span>
            </div>
            <el-button class="nz-btn nz-btn-size-normal nz-btn-style-normal" v-if="!isStart" @click="startTask">
              {{$t('Discovery')}}
            </el-button>
            <el-button class="nz-btn nz-btn-size-normal nz-btn-style-normal" v-else @click="clearTask">
              {{$t('config.terminallog.stop')}}
            </el-button>
          </div>
        </div>
        <div class="tools-header-title">{{$t('overall.config')}}</div>
      </div>
    </template>

    <template v-slot:default>
      <!-- 初始展示的内容 -->
      <div class="empty" v-if="tid===undefined">
        <el-steps align-center>
          <el-step>
            <span class="nz-icon nz-icon-edit" slot="icon"></span>
            <p class="txt" slot="title">{{$t('overall.placeHolder')}} IP</p>
          </el-step>
          <!-- <el-step>
            <span class="el-icon-more" slot="icon"></span>
            <p class="txt" slot="title">{{$t('ping.filter')}}</p>
          </el-step> -->
          <el-step>
            <span class="nz-icon nz-icon-search" slot="icon"></span>
            <p class="txt" slot="title">Discovery asset</p>
          </el-step>
        </el-steps>
      </div>
      <!-- 存在任务id时展示表格 -->
      <div class="data-wrap" v-show="tid!==undefined">
        <span>{{$t('ping.results')}}</span>
        <div class="data-bottom">
          <disccoveryTabTable
            ref="dataTable"
            :loading="loading"
            v-my-loading="loading"
            :height="'calc(100% - 80px)'"
            :custom-table-title="tools.customTableTitle"
            :table-data="tableData"
            :api="url"
            :orderByFa="orderBy"
          >
          </disccoveryTabTable>
        </div>
      </div>
    </template>
  </nz-data-list>
</template>

<script>
import bus from '@/libs/bus'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import VueTagsInput from '@johmun/vue-tags-input'
import { timeoutValidator, retriesValidator } from '../../common/js/validate'
import disccoveryTabTable from '@/components/common/table/asset/disccoveryTabTable'
const ipv4 = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\:\d{0,5})?$/
const ipv6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
export default {
  mixins: [dataListMixin],
  components: {
    nzDataList,
    disccoveryTabTable,
    VueTagsInput
  },
  data () {
    return {
      url: '',
      tableId: 'discoveryAsset',
      // 防止用户重复点击
      flag: true,
      loading: false,
      // 弹出框是否显示
      visible: false,
      ip: '',
      tags: [],
      // 是否全选
      checkAll: true,
      isIndeterminate: false,
      // 数据中心
      dataCenter: [],
      // 实际选中的值
      checked: [],
      // 复选框选中的值
      oldChecked: [-1],
      // 是否正在请求数据
      isStart: false,
      // 定时器id
      timer: null,
      // 任务id
      tid: undefined,
      // 表格总数据
      total: 0,
      // 已完成
      done: 0,
      // 进度
      process: 0,
      // 表格数据
      tableData: [],
      discoveryForm: {
        // 超时时间
        timeout: 100,
        subnetIds: '',
        snmpCredentialIds: '',
        retries: 1
      },
      credentialData: [],
      formRules: {
        timeout: [{ validator: timeoutValidator, trigger: 'blur' }],
        retries: [{ validator: retriesValidator, trigger: 'blur' }]
      },
      ipamData: []
    }
  },
  created () {
    this.getCredentialData()
    this.getIpamData()
  },
  mounted () {
    const tiInput = document.getElementsByClassName('ti-input')[0]
    tiInput.addEventListener('click', (e) => {
      const event = e || window.event
      if (event && event.stopPropagation) {
        event.stopPropagation()
      } else {
        event.cancelBubble = true
      }
      if (event.path[0].className === 'ti-input') {
        const tiInputBox = document.getElementsByClassName('ti-new-tag-input')[0]
        tiInputBox.focus()
      }
    })
  },
  methods: {
    // 防止标签输入框失去焦点校验和开始任务校验重复(连续两次message提示)
    validateHost: bus.debounce(function () {
      this.$message.error(this.$t('validate.host'))
    }, 50),
    // 防止标签输入框失去焦点校验和开始任务校验重复(连续两次message提示)
    validateDuplicate: bus.debounce(function () {
      this.$message.error(this.$t('ping.duplicate') + ' IP')
    }, 50),
    // 添加标签之前
    beforeAddTag ({ tag, addTag }) {
      if (!ipv4.test(tag.text) && !ipv6.test(tag.text)) {
        return this.validateHost()
      }
      addTag()
    },
    // 添加重复的标签
    addDuplicate () {
      return this.validateDuplicate()
    },
    close () {
      this.visible = false
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
    // 删除选中
    removeCheckedItem (id, e) {
      const event = e || window.event
      if (event && event.stopPropagation) {
        event.stopPropagation()
      } else {
        event.cancelBubble = true
      }
      this.checked = this.checked.filter(dcId => dcId !== id)
    },
    getCredentialData () {
      this.$get('snmp/credential', { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.credentialData = response.data.list
        }
      })
    },
    getIpamData () {
      this.$get('ipam/subnet', { pageSize: -1, type: 4}).then(response => {
        if (response.code === 200) {
          this.ipamData = response.data.list
        }
      })
    },
    // 开始任务
    startTask () {
      if (!this.flag) {
        return false
      }
      setTimeout(() => {
        if (!this.discoveryForm.subnetIds) {
          return this.validateHost()
        }
        // 表单校验输入内容是否合法
        this.$refs.discoveryForm.validate((valid) => {
          if (valid) {
            this.flag = false
            this.getId()
          }
        })
      })
    },
    // 请求任务id
    async getId () {
      this.loading = true
      console.log(this.discoveryForm.snmpCredentialIds)
      const params = {
        subnetIds: this.discoveryForm.subnetIds.join(','),
        snmpCredentialIds: this.discoveryForm.snmpCredentialIds.join(','),
        timeout: this.discoveryForm.timeout,
        retries: this.discoveryForm.retries
      }
      this.$post('/tool/discovery', params).then(response => {
        // 清空上一次任务的数据
        if (response.code === 200) {
          this.done = 0
          this.total = 0
          this.process = 0
          this.tableData = []
          this.tid = response.data.tid
          this.isStart = true // 标记正在请求数据中
          this.flag = true
          this.timer = setInterval(() => {
            if (parseInt(this.process) < 100) {
              this.getData()
            } else {
              this.clearTask()
            }
          }, 300)
          // 如果没有数据，loading取消
          if (!response.data.task.total) {
            this.loading = false
          }
        } else {
          this.$message.error(response.msg || response.error)
        }
      })
    },
    // 请求表格数据
    getData () {
      const currentId = this.tid
      this.$get('/tool/discovery/' + this.tid).then(response => {
        if (response.code === 200) {
          if (currentId === this.tid && parseInt(this.process) < 100) {
            this.done = response.data.task.done
            this.total = response.data.task.total
            this.process = response.data.task.process
            this.tableData.push(...response.data.list)
            // 收到数据，loading取消
            if (this.tableData.length) {
              this.loading = false
            }
          }
        }else {
          this.$message.error(response.msg || response.error)
          this.clearTask()
        }
      })
    },
    // 清除任务
    async clearTask () {
      if (!this.flag) {
        return false
      }
      this.flag = false
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      await this.$delete('tool/discovery/' + this.tid)
      this.isStart = false
      this.flag = true
      this.loading = false
    },
    // 空函数 防止mixins中的函数执行
    getTableData () { }
  },
  // 离开页面的时候触发
  async beforeRouteLeave (to, from, next) {
    if (this.tid) {
      await this.clearTask()
    }
    next()
  }
}
</script>
