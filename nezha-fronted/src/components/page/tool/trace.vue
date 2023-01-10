<template>
    <nz-data-list
      ref="dataList"
      :layout="[]"
      :from="fromRoute.trace"
      class="radar-box"
    >
    <template v-slot:top-tool-left>
        <div class="tools-header">
          <div class="tools-header-left">
            <span>{{$t('config.operationlog.ip')}}</span>
            <vue-tags-input
              class="ipInput"
              v-model="ip"
              :placeholder="$t('overall.placeHolder')+' IP'"
              :add-from-paste="false"
              :tags="tags"
              @tags-changed="newTags => tags = newTags"
              @before-adding-tag="value => beforeAddTag(value)"
              @adding-duplicate="value => addDuplicate(value)"
            />
          </div>

          <div  class="tools-header-center">
            <el-form size="small" ref="ruleForm" :model="ruleForm" :rules="formRules" label-position="right" label-width="150px">
              <!-- Data centers -->
              <el-form-item style="margin-bottom:14px" :label="$t('config.dc.dc')">
                <!--            <el-select v-model="checked" multiple @change="checkedChange"  >-->
                <!--              <el-option-->
                <!--                :key="item.id"-->
                <!--                v-for="item in dataCenter"-->
                <!--                :label="item.name"-->
                <!--                :value="item.id">-->
                <!--              </el-option>-->
                <!--            </el-select>-->
                <el-popover
                  placement="bottom"
                  width="220"
                  trigger="manual"
                  v-model="visible"
                  v-clickoutside="close"
                  popper-class="no-style-class ping-popover nz-el-dropdown-menu"
                >
                  <el-form-item style="margin-bottom:0px">
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
                  <div slot="reference" class="choose-box"  @click.stop="triggerVisible">
                    <div v-if="checkAll" style="flex: 1">All</div>
                    <div v-else style="width: 100%;flex: 1">
                    <span class="choose" v-for="item in dataCenter" :key="item.id" v-if="checked.indexOf(item.id) !== -1">
                      <span> {{item.name}} <i class="nz-icon nz-icon-close" @click="removeCheckedItem(item.id)" :title="$t('overall.close')"/></span>
                    </span>
                    </div>
                    <i class="nz-icon nz-icon-arrow-down6"/>
                  </div>
                </el-popover>
              </el-form-item>
              <!-- Maximum hops -->
              <el-form-item prop="maxHops" style="margin-bottom:14px" :label="$t('trace.maxHops')">
                <div class="wrap" style="height:32px">
                  <el-input v-model.number="ruleForm.maxHops" placeholder=""></el-input>
                </div>
              </el-form-item>
              <!-- Timeout -->
              <el-form-item prop="timeout" style="margin-bottom:14px" :label="$t('ping.timeout')">
                <div class="wrap" style="height:32px">
                  <el-input v-model.number="ruleForm.timeout" placeholder="">
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
              <div class="tools-header-right-title right-content-text">{{$t('dashboard.panel.chartForm.statistics')}}</div>
              <div class="right-content-text right-content-box" >
                <span class="margin-l-5">{{$t('asset.total')}}:<span class="margin-l-10 margin-r-30">{{total}}</span></span>
                <span>{{$t('ping.done')}}:<span class="margin-l-10 margin-r-30">{{done}}</span></span>
                <span>{{$t('ping.progress')}}:<span class="margin-l-10 margin-r-30">{{process}}%</span></span>
              </div>
              <el-button class="nz-btn nz-btn-size-normal nz-btn-style-normal" v-if="!isStart" @click="startTask">
                {{$t('ping.trace')}}
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
          <el-step>
            <span class="msg" slot="icon">Trace</span>
            <p class="txt" slot="title">Trace {{$t('tools.cmd')}}</p>
          </el-step>
        </el-steps>
      </div>
      <!-- 存在任务id时展示表格 -->
      <div class="data-wrap" v-show="tid!==undefined">
        <div class="data-bottom">
          <trace-table
            ref="dataTable"
            :loading="loading"
            v-my-loading="loading"
            :custom-table-title="tools.customTableTitle"
            :height="mainTableHeight"
            :table-data="tableData"
            >
          </trace-table>
        </div>
      </div>
    </template>
  </nz-data-list>
</template>

<script>
import bus from '@/libs/bus'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import traceTable from '@/components/common/table/tool/traceTable'
import VueTagsInput from '@johmun/vue-tags-input'
import { timeoutValidator, maxHopsValidator } from '../../common/js/validate'
const ipv4 = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\:\d{0,5})?$/
const ipv6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
export default {
  mixins: [dataListMixin],
  components: {
    nzDataList,
    traceTable,
    VueTagsInput
  },
  data () {
    return {
      tableId: 'trace',
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
      // 复选框选中的值
      checked: [],
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
      ruleForm: {
        // 最大跃点数
        maxHops: 30,
        // 超时时间
        timeout: 100
      },
      formRules: {
        timeout: [{ validator: timeoutValidator, trigger: 'blur' }],
        maxHops: [{ validator: maxHopsValidator, trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getDataCenter()
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
    // 开始任务
    startTask () {
      if (!this.flag) {
        return false
      }
      setTimeout(() => {
        if (this.ip) {
          // 校验ip格式
          if (!ipv4.test(this.ip) && !ipv6.test(this.ip)) {
            return this.validateHost()
          }
          // 判断ip是否重复
          if (this.tags.some(item => item.text === this.ip)) {
            return this.validateDuplicate()
          }
        } else if (!this.tags.length) {
          return this.validateHost()
        }
        // 表单校验输入内容是否合法
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            this.flag = false
            this.getId()
          }
        })
      })
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
      this.loading = true
      const ipArr = this.tags.map(item => item.text)
      const params = {
        ips: ipArr.join(','),
        dcIds: this.checked.join(','),
        maxHops: this.ruleForm.maxHops,
        timeout: this.ruleForm.timeout
      }
      this.$get('/tool/traceroute', params).then(response => {
        // 清空上一次任务的数据
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
      })
    },
    // 请求表格数据
    getData () {
      const currentId = this.tid
      this.$get('/tool/traceroute/result/' + this.tid).then(response => {
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
      await this.$get('/tool/traceroute/cancel/' + this.tid)
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
