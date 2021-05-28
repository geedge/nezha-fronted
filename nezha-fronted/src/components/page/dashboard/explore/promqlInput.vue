<template>
  <div class="promqlInput">
    <div class="query-row">
      <!--explore页面的样式-->
      <template v-if="styleType == 1">
        <div v-if="plugins.indexOf('metric-selector') > -1">
          <el-dropdown class="metric-selector">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <button class="top-tool-btn top-tool-btn--text" type="button" @click="toggleDropdown">{{ $t("overall.metric") }}
              &nbsp;<i class="nz-icon nz-icon-arrow-down" style="font-size: 12px"></i></button>
            <el-cascader-panel v-show="dropDownVisible" ref="metricSelector" slot="dropdown" v-model="cascaderValue"
                               v-clickoutside="closeDropdown" v-loading="tempBoxShowLoading" :loading="loading" :options="metricOptions"
                               :props="{emitPath:false,}" @change="metricChangeNew">

              <template slot-scope="{ node, data }">
                <div :class="['nz-cascade',data.temp&&!data.child?'nz-cascade-temp':'']" @click="()=>{lazyLoad(node,data)}">
                  <i class="nz-icon nz-icon-template2"></i>
                  {{data.label}}
                </div>
              </template>

            </el-cascader-panel>
          </el-dropdown>
        </div>
        <div v-if="plugins.indexOf('metric-input') > -1" class="input-box" @click="dropDownVisible=false">
          <el-input :id="inputId" v-model="expressionList[index]" :autosize="{ minRows: 1, maxRows: 6}"
                    class="not-fixed-height no-resize" type="textarea"
                    @input="metricKeyDown" @keyup.enter.native="expressionChange" ref="elInput"></el-input>
          <div v-if="errorMsg" class="append-msg error"><span>{{errorMsg}}</span></div>
          <div v-if="appendMsg" class="append-msg error"><span>{{appendMsg}}</span></div>
        </div>
        <div class="top-tool-btn-group">
          <button v-if="plugins.indexOf('add') > -1" class="top-tool-btn"
               @click="addExpression"><i class="nz-icon nz-icon-plus"></i></button>
          <button v-if="plugins.indexOf('copy') > -1" class="top-tool-btn"
               @click="copyExpression"><i class="nz-icon nz-icon-override"></i></button>
          <button v-if="plugins.indexOf('remove') > -1" class="top-tool-btn"
               @click="removeExpression"><i class="nz-icon nz-icon-minus"></i></button>
        </div>
      </template>
      <!--right-box里的样式-->
      <template v-if="styleType == 2">
          <el-row v-if="plugins.indexOf('metric-input') > -1 || plugins.indexOf('metric-selector') > -1"
                  style="width: 100%;">
            <el-col
              :class="[plugins.indexOf('metric-selector') > -1 ?'metric-selector-title':'metric-null-title']">
              <el-dropdown class="metric-selector" v-if="plugins.indexOf('metric-selector') > -1">
                <el-dropdown-menu style="display: none"></el-dropdown-menu>
                <span :class="{'expr-title':projectRightBox}" style="cursor: pointer;" @click="toggleDropdown">{{$t("overall.metric")}}&nbsp;<i
                  class="nz-icon nz-icon-arrow-down"
                  style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i></span>
                <el-cascader-panel v-loading="tempBoxShowLoading" v-if="dropDownVisible" v-clickoutside="closeDropdown" v-model="cascaderValue"
                                   style="text-align: left;" slot="dropdown" ref="metricSelector"
                                   :props="{emitPath:false}" :options="metricOptions" @change="metricChangeNew">

                  <template slot-scope="{ node, data }">
                    <div :class="['nz-cascade',data.temp&&!data.child?'nz-cascade-temp':'']" @click="()=>{lazyLoad(node,data)}">
                      <i class="nz-icon nz-icon-template2"></i>
                      {{data.label}}
                    </div>
                  </template>

                </el-cascader-panel>
              </el-dropdown>
            </el-col>
            <el-col
              :class="plugins.indexOf('metric-selector') > -1 ?'metric-selector-input-box':'metric-null-input-box'"
              :style="{'width':plugins.indexOf('metric-selector') > -1 ? 'calc(100% - 160px)':'100%',height: '100%',}">
              <div class="input-box" @click="dropDownVisible=false" v-if="plugins.indexOf('metric-input') > -1">
                <!--<editor :styleType="styleType" :metric-list="metricStore" :historyParam="historyParam" v-model="expressionList[index]" ref="editor" @on-enter="expressionChange" @on-blur="expressionChange" ></editor>-->
                <el-input maxlength="4096" show-word-limit v-model="expressionList[index]" @input="metricKeyDown"   type="textarea"
                          :autosize="{ minRows: 1, maxRows: 6}" class="not-fixed-height no-resize" ref="elInput"></el-input>
                <div class="append-msg error" v-if="errorMsg"><span>{{errorMsg}}</span></div>
                <div class="append-msg error" v-if="appendMsg"><span>{{appendMsg}}</span></div>
              </div>
            </el-col>
          </el-row>
        </template>
    </div>
    <div v-if="styleType == 2&&showRemove">
      <div class="option" @click="addExpression" v-if="plugins.indexOf('add') > -1"><i class="nz-icon nz-icon-plus"></i>
      </div>
      <div class="option" style="margin-left: 5px; line-height: 32px;" @click="removeExpression"
           v-if="plugins.indexOf('remove') > -1"><i class="nz-icon nz-icon-minus"></i></div>
    </div>

    <el-dialog
      :visible.sync="tempBoxShow"
      :append-to-body="true"
      :width="'auto'"
      :custom-class="'nz-temp-box'"
      :destroy-on-close="true"
      @closed="tempBoxClose"
      center>
      <el-form v-model="tempBox" class="temp-form-box" ref="tempFormBox" v-if="tempBoxShow">
        <span class="temp-form-box-title">Expression</span>
        <el-form-item prop="expression">
          <el-input v-model="tempBox.expression" size="small" disabled></el-input>
        </el-form-item>
        <span class="temp-form-box-title" v-if="tempBox.vars.length">Variable</span>
        <el-form-item v-for="(item,index) in tempBox.vars"  :prop="item" :key="index">
          <el-row>
            <el-col :span="6" class="temp-form-box-col">
              <el-input v-model="tempBox.vars[index]" :id="'tempBox'+index"  size="small" :disabled="true"></el-input>
            </el-col>
            <el-col :span="17" v-if="format(item).key">
              <!--<el-input v-model="tempBox[item]" :id="'tempBox'+item"  size="small"></el-input>-->
              <!--<el-select v-model="tempBox[item]" size="small" style="width: 100%" :popper-class="'nz-temp-box'">-->
                <!--<el-option v-for="(item1,index) in format(item).arr" :key="index" :label="item1[format(item).value]" :value="item1[format(item).value]">-->
                <!--</el-option>-->
              <!--</el-select>-->
              <select-alert-silence :filter-silence="filterSilence" :silence-data="format(item).arr" :panel-lock="false" :placement="'bottom-start'" :typeContentLoading="typeContentLoading"
                                    @selectSilence="(val)=>{silenceChange(val,item)}" ref="selectPanel" style="width: 300px;">
                <template v-slot:header>
                  <div class="panel-select-header">
                    <el-input :placeholder="$t('overall.search')" clearable size="mini" style="width: 340px; margin-right: 5px;" v-model="filterSilence" id="panel-list-search"></el-input>
                  </div>
                </template>

                <template v-slot:trigger>
                  <el-input class="panel-name" placeholder="" readonly="readonly" v-model="tempBox[item]" size="small">
                    <span slot="suffix" class="el-input__icon el-icon-circle-close el-input__clear" @click.stop="clearValue(item)"></span>
                  </el-input>
                </template>
              </select-alert-silence>
            </el-col>
            <el-col :span="17" v-else>
              <el-input v-model="tempBox[item]" :id="'tempBox'+item"  size="small"></el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <button id="temp-box-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" @click="tempBoxShowChange(false)">
          <span>{{$t('overall.cancel')}}</span>
        </button>
      <button :disabled="prevent_opt.save" @click="tempBoxShowChange(true)" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="chart-box-save" v-has="`expressionTemplate_add`" >
        <span>{{$t('overall.save')}}</span>
      </button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import selectAlertSilence from '../../../common/alert/selectAlertSilence'
import editor from './editor'
export default {
  name: 'promqlInput',
  components: {
    editor: editor,
    selectAlertSilence
  },
  props: {
    index: { type: Number },
    expressionList: {},
    plugins: { type: Array },
    styleType: Number,
    historyParam: { type: Object },
    showRemove: { type: Boolean, default: true },
    projectRightBox: { type: Boolean, default: false },
    metricOptionsParent: { type: Array },
    inputId: String,
    required: {
      type: Boolean, default: false
    },
    showTemp: {
      type: Boolean,
      default: true
    },
    typeContentLoading: {
      type: Boolean,
      default: false
    },
    fromFatherData: {
      type: Boolean,
      default: false
    }
    // metricOptions: {type: Array},
    // metricStore: {type: Array}
  },
  data () {
    return {
      dropDownVisible: false,
      // metricStore:[],
      metricOptions: [],
      cascaderValue: '',
      errorMsg: null,
      appendMsg: null,
      editorValue: '',
      firstAddEvent: true,
      tempBoxShow: false,
      tempBox: {
        expression: '',
        vars: []
      },
      tempBoxShowLoading: false,
      assetOption: [],
      moduleOption: [],
      endpointOption: [],
      datacenterOption: [],
      projectOption: [],
      filterSilence: '',
      tempBoxId: {},
      loading: false
    }
  },
  mounted () {
    if (!this.fromFatherData) {
      this.queryMetrics()
    }
  },
  methods: {
    closeDropdown () {
      this.dropDownVisible = false
    },
    clearExpression: function () {
      this.expressionChange()
      this.cascaderValue = ''
    },
    addExpression: function () {
      this.$emit('addExpression', this.index)
    },
    copyExpression () {
      this.$emit('copyExpression', this.index)
    },
    removeExpression: function () {
      this.$emit('removeExpression', this.index)
    },
    toggleDropdown () {
      this.dropDownVisible = !this.dropDownVisible
      this.getMetricOptions()
    },
    getMetricOptions () {
      if (!this.metricOptions.length) {
        this.queryMetrics()
      }
    },
    queryMetrics: function () {
      this.loading = true
      this.$get('prom/api/v1/label/__name__/values').then(response => {
        if (response.status == 'success') {
          const metrics = response.data.sort()
          const metricMap = new Map()
          metrics.forEach((item) => {
            let key = ''
            if (/^[a-zA-Z_:][a-zA-Z0-9_:]*/.test(item)) {
              key = item.split(/[_:]/, 1)[0]
            } else {
              key = item
            }
            if (metricMap.get(key)) {
              const values = metricMap.get(key)
              values.push({ label: item, value: item })
            } else {
              const values = [{ label: item, value: item }]
              metricMap.set(key, values)
            }
            // this.metricStore.push({label:item,value:item,insertText:item})
          })
          for (const key of metricMap.keys()) {
            const option = {
              label: key,
              value: key
            }
            if (metricMap.get(key) && metricMap.get(key).length > 1) {
              option.children = metricMap.get(key)
            }
            this.metricOptions.push(option)
          }
          if (this.showTemp) {
            this.getExprTemp()
          }
        }
      })
    },
    filterInput: function (queryString, cb) {
      const metrics = Object.assign([], this.metricStore)
      const result = queryString
        ? metrics.filter((item) => {
          return item.value.toLowerCase().indexOf(queryString.toLowerCase()) != -1
        })
        : metrics
      cb(result)
    },
    metricChange: function (value) {
      if (!value) return
      this.expressionList[this.index] = value
      // this.insertText(value)
      // this.$refs.editor.setContent(value)
      this.dropDownVisible = false
      this.$emit('change', value)
      this.$forceUpdate()
      this.cascaderValue = ''
    },
    metricChangeNew (value) {
      if (!value) return
      // this.expressionList[this.index] = value
      this.insertText(value)
      // this.$refs.editor.setContent(value)
      this.dropDownVisible = false
      this.$emit('change', value)
      this.$forceUpdate()
      this.cascaderValue = ''
    },
    metricKeyDown (val) {
      if (this.required) {
        this.metricChange(val)
      }
    },
    expressionChange: function () {
      this.$emit('change')
    },
    setError: function (errMsg) {
      // console.log(errMsg)
      this.errorMsg = errMsg
    },
    getExprTemp () {
      this.$get('/expression/tmpl/gname').then(res => {
        this.loading = false
        if (res.code === 200) {
          res.data.list.forEach(item => {
            this.metricOptions.unshift({
              label: item,
              value: item,
              children: [],
              temp: true,
              child: false
            })
          })
        }
      })
    },
    lazyLoad (node, data) {
      if (data.temp) {
        if (!data.child) {
          this.tempBoxShowLoading = true
          this.$get('/expression/tmpl?pageSize=-1&gname=' + data.value).then(res => {
            this.tempBoxShowLoading = false
            if (res.code === 200) {
              res.data.list.forEach(item => {
                item.label = item.name
                item.value = false
                item.temp = true
                item.child = true
              })
              this.metricOptions.find(item => item.value === data.value).children = res.data.list
            }
          })
        } else {
          this.dropDownVisible = false
          this.$get('/expression/tmpl/' + data.id).then(res => {
            if (res.code === 200) {
              if (!res.data.vars || !res.data.vars.length) {
                this.metricChange(data.expression)
                return
              }
              res.data.vars.forEach(item => {
                res.data[item] = ''
                const arr = item.split('.')
                const keyword = arr[0].toLowerCase()
                this.getAllOptins(keyword, keyword + 'Option')
              })
              this.tempBox = {
                ...this.tempBox,
                ...res.data
              }

              setTimeout(() => {
                this.tempBoxShow = true
              }, 100)
            }
          })
        }
      }
    },
    tempBoxShowChange (flag) {
      this.tempBoxShow = flag
      if (flag) {
        this.cascaderValue = ''
        const params = {}
        params.expression = this.tempBox.expression
        params.varsVal = {}
        let returnFlag = false
        let errorStr = ''
        this.tempBox.vars.forEach((item) => {
          params.varsVal[item] = this.tempBoxId[item] || this.tempBox[item]
          if (!this.tempBox[item]) {
            errorStr += item + ','
            returnFlag = true
          }
        })

        if (returnFlag) {
          this.$message({
            message: this.$t('config.exprTemp.errorStr', { errorStr: errorStr }),
            type: 'error'
          })
          return
        }

        if (this.tempBox.vars.length == 0) {
          this.tempBoxShow = false
          // eslint-disable-next-line vue/no-mutating-props
          // this.expressionList[this.index] = params.expression
          this.insertText(params.expression)
          this.$emit('change', params.expression)
          return
        }

        this.$post('/expression/tmpl/render', params).then(res => {
          if (res.code === 200) {
            this.tempBoxShow = false
            // this.expressionList[this.index] = res.data.expression
            this.insertText(res.data.expression)
            this.$emit('change', res.data.expression)
          }
        })
      } else {
        this.tempBox = {}
      }
    },

    format (str) {
      const arr = str.split('.')
      const keyword = arr[0].toLowerCase()
      switch (keyword) {
        case 'asset':
        case 'module':
        case 'endpoint':
        case 'datacenter':
        case 'project':
          return {
            arr: this[keyword + 'Option'],
            key: keyword,
            value: ((keyword == 'module' || keyword == 'project' || keyword == 'datacenter') ? 'name' : 'host')
          }
        default:
          return {
            key: false
          }
      }
    },
    getAllOptins (key, arr) {
      switch (key) {
        case 'asset':
          this.$get('asset/asset', { pageNo: 1, pageSize: -1 }).then(response => {
            if (response.code == 200) {
              const arr = []
              response.data.list.forEach(asset => {
                asset.name = asset.sn
                const dcF = arr.find(dc => dc.id === asset.dc.id)
                if (dcF) {
                  dcF.children.push(asset)
                } else {
                  const dc = { ...asset.dc }
                  dc.children = [asset]
                  arr.push(dc)
                }
              })
              this.assetOption = arr
            }
          })
          break
        case 'module':
          this.$get('monitor/module/tree', { pageNo: 1, pageSize: -1 }).then(response => {
            if (response.code == 200) {
              this.moduleOption = response.data.list
            }
          })
          break
        case 'endpoint':
          this.$get('monitor/endpoint/tree', { pageNo: 1, pageSize: -1 }).then(response => {
            if (response.code == 200) {
              this.endpointOption = response.data.list
            }
          })
          break
        case 'datacenter':
          this.$get('dc', { pageNo: 1, pageSize: -1 }).then(response => {
            if (response.code == 200) {
              this.datacenterOption = response.data.list
            }
          })
          break
        case 'project':
          this.$get('monitor/project', { pageNo: 1, pageSize: -1 }).then(response => {
            if (response.code == 200) {
              this.projectOption = response.data.list
            }
          })
          break
        default:
          break
      }
    },
    silenceChange (val, key) {
      this.tempBox[key] = val.name
      this.tempBoxId[key] = val.id
    },
    clearValue (key) {
      this.tempBox[key] = ''
    },
    tempBoxClose () {
      this.cascaderValue = ''
    },
    insertText (insertTxt) {
      // 获取el-input中的input元素
      const elInput = this.$refs.elInput.$el.firstElementChild
      // 获取el-input的值
      const txt = elInput.value
      // 获取选区开始位置
      const startPos = elInput.selectionStart
      // 获取选区结束位置
      const endPos = elInput.selectionEnd
      if (startPos === undefined || endPos === undefined) return

      // 将文本插入光标位置
      this.expressionList[this.index] = txt.substring(0, startPos) + insertTxt + txt.substring(endPos)
      // 将光标移至文本末尾
      elInput.focus()
      elInput.selectionStart = startPos + insertTxt.length
      elInput.selectionEnd = startPos + insertTxt.length
    }
    /* setMsg:function(){
        this.appendMsg
      } */
  },
  watch: {
    dropDownVisible: function (n, o) {
      if (this.$refs.metricSelector) {
        this.$refs.metricSelector.dropDownVisible = n
        if (!this.expressionList[this.index] || this.expressionList[this.index] == '') {
          this.cascaderValue = ''
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .promqlInput {
    position: relative;
    width: 100%;
    display: flex;
  }

  .promqlInput .query-row {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  .input-box .append-msg {
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
  }

  .input-box .error {
    color: #F56C6C;
  }

  .promqlInput .query-options {
    /*display: flex;*/
    /*justify-content: flex-start;*/
    /*width: 84px;*/
  }

  .query-options .option {
    /*border-right: 1px solid #dde4ed;*/
    /*border-radius: 3px;*/
    /*background-color: #dde4ed;*/
    width: 34px;
    height: 29px !important;
    line-height: 30px;
    text-align: center;
  }

  .query-options .option:focus, .query-options .option:hover {
    background-color:   rgb(247, 248, 250);
  }

  .query-row .input-box {
    flex: auto;
    margin-right: 10px;
  }

  .metric-btn {
    height: 29px !important;
    width: 105px;
    margin-left: 1px;
  }

  .metric-btn:hover, .metric-btn:focus {
    background-image:  linear-gradient(180deg, rgb(247, 248, 250) 0%, rgb(247, 248, 250) 100%);
    color: #606266;
  }

  .metric-selector .el-cascader-panel {
    height: 300px;
    position: absolute;
    z-index: 2100;
    background-color: #FFF;
  }

  .expr-title {
    width: 120px;
    padding-right: 20px;
    text-align: right;
    color: #666;
    font-size: 14px;
    letter-spacing: 0;
    line-height: 22px;
  }

  /deep/ .el-cascader-node {
    padding: 0;
  }

  /deep/ .el-cascader-menu:last-child .el-cascader-node, /deep/ .el-cascader-node__label {
    padding: 0;
  }
  .metric-selector-title{
  /*'width':plugins.indexOf('metric-selector') > -1 ? '110px':'100%',*/
  /*'padding': plugins.indexOf('metric-selector') > -1 ?'0 0 0 10px':'0 20px 0 0 ',*/
  /*'text-align':'left', 'color': '#666',*/
  /*'font-weight':plugins.indexOf('metric-selector') > -1 ?'400':'bold',*/
    width:100px;
    margin-right: 10px;
    height: 32px;
    text-align: left;
    padding: 0 0 0 10px;
    font-weight: 400;
    line-height: 33px;
    background: #E7EAED;
    border-radius: $--primary-border-radius;
    font-family: ArialMT;
    font-size: 14px;
    color: #333333;
    letter-spacing: 0;
  }
  .metric-selector-input-box{
    width: calc(100% - 160px);
  }
  .metric-null-input-box{
    width: 100%;
  }
  .metric-null-title{
    width:100%;
    font-weight: bold;
    letter-spacing: 0;
  }
  .nz-cascade {
    padding: 0 10px 0 25px;
    position: relative;
  }
  .nz-cascade .nz-icon-template2 {
    display: none;
  }

  .nz-cascade-temp .nz-icon-template2{
    display: inline-block;
    position: absolute;
    left: 5px;

    /*background: #F8F9FB;*/
  }
  .temp-form-box{
    width: 480px;
  }
  .temp-form-box .temp-form-box-title{
    font-family: PingFangSC-Medium;
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    font-weight: 600;
    margin-bottom: 5px;
  }
  .temp-form-box .temp-form-box-col{
    margin-right: 10px;
  }
</style>
<style>
  .metric-selector-pop {
    position: relative;
    z-index: 2100;
  }
  .input-box .el-input__inner {
    height: 30px;
  }
  .nz-temp-box /deep/ .el-dialog__body{
    padding: 10px 20px 0 20px;
  }
  .nz-temp-box /deep/ .el-dialog__footer{
    margin-top: 0;
  }
  .nz-temp-box .nz-btn-style-light-new{
    margin-right: 10px;
  }
  .nz-temp-box .nz-btn-style-normal-new{
    margin-left: 10px;
  }
</style>
