<template>
  <div class="promqlInput">
    <div class="query-row">
      <!--explore页面的样式-->
      <template v-if="styleType == 1">
        <div v-if="plugins.indexOf('metric-selector') > -1">
          <el-dropdown class="metric-selector">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <button
              class="top-tool-btn top-tool-btn--text"
              type="button"
              @click="toggleDropdown"
            >
              {{
                type === "log" ? $t("overall.logLabels") : $t("overall.metric")
              }}
              <i class="nz-icon nz-icon-arrow-down" style="font-size: 12px"></i>
            </button>
            <el-cascader-panel
              v-show="dropDownVisible"
              ref="metricSelector"
              slot="dropdown"
              v-model="cascaderValue"
              v-clickoutside="closeDropdown"
              v-my-loading="tempBoxShowLoading"
              :loading="loading"
              :options="metricOptions"
              v-if="type !== 'log'"
              :props="cascaderProps"
              @change="metricChangeNew"
              style="margin-top: 5px"
            >
              <template slot-scope="{ node, data }">
                <div
                  :class="[
                    'nz-cascade',
                    data.temp && !data.child ? 'nz-cascade-temp' : '',
                    data.more ? 'cascader-panel-more' : '',
                  ]"
                  @click="
                    () => {
                      lazyLoad(node, data);
                    }
                  "
                  :title="data.label"
                >
                  <i class="nz-icon nz-icon-template2"></i>
                  {{ data.label }}
                  <i v-if="data.more" class="nz-icon nz-icon-arrow-down"></i>
                </div>
              </template>
            </el-cascader-panel>
            <el-cascader-panel
              v-else
              v-show="dropDownVisible"
              ref="metricSelector"
              slot="dropdown"
              v-model="cascaderValue"
              v-clickoutside="closeDropdown"
              v-my-loading="tempBoxShowLoading"
              :loading="loading"
              :props="cascaderProps"
              @change="logLabelChange"
              style="margin-top: 5px"
            >
              <template slot-scope="{ node, data }">
                <div :title="data.label" class="nz-cascade">
                  {{ data.label }}
                </div>
              </template>
            </el-cascader-panel>
          </el-dropdown>
        </div>
        <div
          v-if="plugins.indexOf('metric-input') > -1"
          class="input-box"
          @click="dropDownVisible = false"
        >
        <div id="editor"
        >
        </div>
          <!-- <el-input
            :id="inputId"
            v-model="expressionList[index]"
            :autosize="{ minRows: 1, maxRows: 6 }"
            class="not-fixed-height no-resize"
            type="textarea"
            @input="metricKeyDown"
            @keyup.enter.native="expressionChange"
            ref="elInput"
          ></el-input> -->

          <div v-if="errorMsg" class="append-msg error">
            <span>{{ errorMsg }}</span>
          </div>
          <div v-if="appendMsg" class="append-msg error">
            <span>{{ appendMsg }}</span>
          </div>
        </div>
        <div class="top-tool-btn-group">
          <button
            v-if="plugins.indexOf('add') > -1"
            class="top-tool-btn"
            @click="addExpression"
          >
            <i class="nz-icon nz-icon-plus"></i>
          </button>
          <button
            v-if="plugins.indexOf('copy') > -1"
            class="top-tool-btn"
            @click="copyExpression"
          >
            <i class="nz-icon nz-icon-override"></i>
          </button>
          <button
            v-if="plugins.indexOf('remove') > -1"
            class="top-tool-btn"
            @click="removeExpression"
          >
            <i class="nz-icon nz-icon-minus"></i>
          </button>
        </div>
      </template>
      <!--right-box里的样式-->
      <template v-if="styleType === 2 || styleType === 3">
        <el-row
          v-if="
            plugins.indexOf('metric-input') > -1 ||
            plugins.indexOf('metric-selector') > -1
          "
          style="width: 100%"
        >
          <el-col
            :class="[
              plugins.indexOf('metric-selector') > -1
                ? 'metric-selector-title'
                : 'metric-null-title',
            ]"
          >
            <el-dropdown
              class="metric-selector"
              v-if="plugins.indexOf('metric-selector') > -1"
            >
              <el-dropdown-menu style="display: none"></el-dropdown-menu>
              <span
                :class="{ 'expr-title': projectRightBox }"
                style="cursor: pointer"
                @click="toggleDropdown"
                >{{
                  type === "log"
                    ? $t("overall.logLabels")
                    : $t("overall.metric")
                }}<i
                  class="nz-icon nz-icon-arrow-down"
                  style="
                    font-size: 14px;
                    -webkit-transform: scale(0.75);
                    display: inline-block;
                  "
                ></i
              ></span>
              <el-cascader-panel
                v-my-loading="tempBoxShowLoading"
                v-show="dropDownVisible"
                v-clickoutside="closeDropdown"
                v-model="cascaderValue"
                style="text-align: left; margin-top: 5px"
                slot="dropdown"
                ref="metricSelector"
                v-if="type !== 'log'"
                :props="{ emitPath: false }"
                :options="metricOptions"
                @change="metricChangeNew"
              >
                <template slot-scope="{ node, data }">
                  <div
                    :class="[
                      'nz-cascade',
                      data.temp && !data.child ? 'nz-cascade-temp' : '',
                      data.more ? 'cascader-panel-more' : '',
                    ]"
                    @click="
                      () => {
                        lazyLoad(node, data);
                      }
                    "
                    :title="data.label"
                  >
                    <i class="nz-icon nz-icon-template2"></i>
                    {{ data.label }}
                    <i v-if="data.more" class="nz-icon nz-icon-arrow-down"></i>
                  </div>
                </template>
              </el-cascader-panel>
              <el-cascader-panel
                v-else
                v-show="dropDownVisible"
                ref="metricSelector"
                slot="dropdown"
                v-model="cascaderValue"
                v-clickoutside="closeDropdown"
                v-my-loading="tempBoxShowLoading"
                :loading="loading"
                :props="cascaderProps"
                @change="logLabelChange"
              >
                <template slot-scope="{ node, data }">
                  <div :title="data.label" class="nz-cascade">
                    {{ data.label }}
                  </div>
                </template>
              </el-cascader-panel>
            </el-dropdown>
          </el-col>
          <el-col
            :class="
              plugins.indexOf('metric-selector') > -1
                ? 'metric-selector-input-box'
                : 'metric-null-input-box'
            "
            :style="{ height: '100%' }"
          >

            <div
              class="input-box"
              @click="dropDownVisible = false"
              v-if="plugins.indexOf('metric-input') > -1"
            >
            <div id="editor"
            class="not-fixed-height no-resize"
                ref="elInput"

            ></div>
              <!-- <el-input
                v-model="expressionList[index]"
                @input="metricKeyDown"
                type="textarea"
                :maxlength="styleType === 3 ? 512 : 4096"
                show-word-limit
                :autosize="{ minRows: 1, maxRows: 6 }"
                class="not-fixed-height no-resize"
                ref="elInput"
              ></el-input> -->
              <div class="append-msg error" v-if="errorMsg">
                <span>{{ errorMsg }}</span>
              </div>
              <div class="append-msg error" v-if="appendMsg">
                <span>{{ appendMsg }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </template>
    </div>
    <div v-if="styleType == 2 && showRemove">
      <div
        class="option"
        @click="addExpression"
        v-if="plugins.indexOf('add') > -1"
      >
        <i class="nz-icon nz-icon-plus"></i>
      </div>
      <div
        class="option"
        style="margin-left: 5px; line-height: 32px"
        @click="removeExpression"
        v-if="plugins.indexOf('remove') > -1"
      >
        <i class="nz-icon nz-icon-minus"></i>
      </div>
    </div>

    <el-dialog
      :visible.sync="tempBoxShow"
      :append-to-body="true"
      :width="'auto'"
      :custom-class="'nz-temp-box'"
      :destroy-on-close="true"
      @closed="tempBoxClose"
      center
    >
      <el-form
        v-model="tempBox"
        class="temp-form-box"
        ref="tempFormBox"
        v-if="tempBoxShow"
      >
        <span class="temp-form-box-title">Expression</span>
        <el-form-item prop="expression">
          <el-input
            class="temp-form-box-input"
            v-model="tempBox.expression"
            size="small"
            disabled
          ></el-input>
        </el-form-item>
        <span class="temp-form-box-title" v-if="tempBox.vars.length"
          >Variable</span
        >
        <el-form-item
          v-for="(item, index) in tempBox.vars"
          :prop="item"
          :key="index"
        >
          <el-row>
            <el-col :span="7" class="temp-form-box-col">
              <el-input
                class="temp-form-box-input"
                v-model="tempBox.vars[index]"
                :id="'tempBox' + index"
                size="small"
                :disabled="true"
              ></el-input>
            </el-col>
            <el-col :span="16" v-if="format(item).key">
              <select-alert-silence
                :filter-silence="filterSilence"
                :silence-data="format(item).arr"
                :panel-lock="false"
                :placement="'bottom-start'"
                :typeContentLoading="typeContentLoading"
                @selectSilence="
                  (val) => {
                    silenceChange(val, item);
                  }
                "
                ref="selectPanel"
                style="width: 240px"
              >
                <template v-slot:header>
                  <div class="explore-select-header">
                    <el-input
                      :placeholder="$t('overall.search')"
                      clearable
                      size="mini"
                      style="width: 300px; padding: 0 10px"
                      v-model="filterSilence"
                      id="panel-list-search"
                    ></el-input>
                  </div>
                </template>

                <template v-slot:trigger>
                  <el-input
                    class="panel-name"
                    placeholder=""
                    readonly="readonly"
                    v-model="tempBox[item]"
                    size="small"
                  >
                    <span
                      slot="suffix"
                      class="
                        el-input__icon
                        el-icon-circle-close
                        el-input__clear
                      "
                      @click.stop="clearValue(item)"
                    ></span>
                  </el-input>
                </template>
              </select-alert-silence>
            </el-col>
            <el-col :span="17" v-else>
              <el-input
                v-model="tempBox[item]"
                :id="'tempBox' + item"
                size="small"
              ></el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <button
          id="temp-box-esc"
          class="nz-btn nz-btn-size-normal nz-btn-style-light"
          @click="tempBoxShowChange(false)"
        >
          <span>{{ $t("overall.cancel") }}</span>
        </button>
        <button
          id="chart-box-save"
          v-has="`expressionTemplate_add`"
          :disabled="prevent_opt.save"
          class="nz-btn nz-btn-size-normal nz-btn-style-normal"
          @click="tempBoxShowChange(true)"
        >
          <span>{{ $t("overall.save") }}</span>
        </button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import selectAlertSilence from '../../../common/alert/selectAlertSilence'
import { get } from '@/http'
import { PromQLExtension } from 'codemirror-promql'
import { basicSetup } from '@codemirror/basic-setup'
// import { EditorState } from '@codemirror/state';
import { highlightSelectionMatches } from '@codemirror/search'
import { EditorState, Prec, Compartment } from '@codemirror/state'
import { indentOnInput, syntaxTree } from '@codemirror/language'
import { EditorView, highlightSpecialChars, keymap, ViewUpdate, placeholder } from '@codemirror/view'
import { history, historyKeymap } from '@codemirror/history'
import { bracketMatching } from '@codemirror/matchbrackets'
import { defaultKeymap, insertNewlineAndIndent } from '@codemirror/commands'
import { commentKeymap } from '@codemirror/comment'
import { lintKeymap } from '@codemirror/lint'
import { baseTheme, promqlHighlighter } from './CMTheme.tsx'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { autocompletion, completionKeymap, CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import Vue from 'vue'

export default {
  name: 'promqlInput',
  components: {
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
    },
    type: {
      type: String // metric和log两种，为空时视为metric
    }
    // metricOptions: {type: Array},
    // metricStore: {type: Array}
  },
  data () {
    return {
      a: 'a',
      dropDownVisible: false,
      // metricStore:[],
      metricOptions: [],
      cascaderValue: '',
      errorMsg: null,
      appendMsg: null,
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
  computed: {
    cascaderProps () {
      if (this.type === 'log') {
        return {
          lazy: true,
          lazyLoad (node, resolve) {
            const { level } = node
            if (level === 0) {
              get('/logs/loki/api/v1/labels').then(res => {
                if (res.data) {
                  const nodes = res.data.sort().map(d => ({
                    value: d,
                    label: d,
                    leaf: false
                  }))
                  resolve(nodes)
                } else {
                  resolve([])
                }
              })
            } else if (level === 1) {
              get(`/logs/loki/api/v1/label/${node.value}/values`).then(res => {
                if (res.data) {
                  const nodes = res.data.sort().map(d => ({
                    value: d,
                    label: d,
                    leaf: true
                  }))
                  resolve(nodes)
                } else {
                  resolve([])
                }
              })
            }
          }
        }
      } else {
        return { emitPath: false }
      }
    }
  },
  mounted () {
    const self = this
    const promQL = new PromQLExtension().setComplete(
      {
        remote: {
          url: 'http://192.168.40.42:8080/prom',
          fetchFn: this.fetchFn,
          cache: {
            initialMetricList: [
              'ALERTS',
              'ALERTS_FOR_STATE',
              'alertmanager_alerts',
              'alertmanager_alerts_invalid_total',
              'alertmanager_alerts_received_total',
              'nz-agent'
            ]
          }
        }
      }
    )
    const dynamicConfigCompartment = new Compartment()
    const dynamicConfig = [
      promqlHighlighter,
      promQL.asExtension(),
      baseTheme
    ]
    // const dynamicConfigCompartment = new Compartment();
    const EditorViewstate = EditorState.create({
      extensions: [
        baseTheme,
        highlightSpecialChars(),
        history(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        highlightSelectionMatches(),
        EditorView.lineWrapping,
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...commentKeymap,
          ...completionKeymap,
          ...lintKeymap
        ]),
        placeholder('Expression (press Shift+Enter for newlines)'),
        dynamicConfigCompartment.of(dynamicConfig),
        // This keymap is added without precedence so that closing the autocomplete dropdown
        // via Escape works without blurring the editor.
        keymap.of([
          {
            key: 'Escape',
            run: (v) => {
              v.contentDOM.blur()
              return false
            }
          }
        ]),
        Prec.override(
          keymap.of([
            {
              key: 'Enter',
              run: (v) => {
                self.newChange()
                return true
              }
            },
            {
              key: 'Shift-Enter',
              run: insertNewlineAndIndent
            }
          ])
        ),
        EditorView.updateListener.of((update) => {
          self.newChange(update.state.doc.toString())
        })
      ],
      doc: self.a
    })
    new EditorView({
      state: EditorViewstate,
      parent: document.getElementById('editor')
    })
    if (!this.fromFatherData && this.type !== 'logs') {
      this.queryMetrics()
    }
  },
  methods: {
    newChange (val) {
      console.log(val)
    },
    newDoc (val) {
      console.log(val)
    },
    getHint (val, params, b, c, d) {
      if (params) {
        console.log(val, params, b, c, d, 123123123)
        console.log(JSON.stringify(params.body))
        return this.sendAjax('', params)
      } else {
        return this.sendAjax('http://192.168.44.61:10091/api/v1/series', {})
      }

      // this.$post('api/v1/series')
    },
    fetchFn (a, b) {
      if (b) {
        const form = new FormData()
        console.log(b.body)
        form.append('match[]', b.body.getAll('match[]'))
        return this.$post(a, form)
      } else {
        return this.$get(a)
      }
    },
    sendAjax (url, body) {
      // 构造表单数据
      return new Promise(resolve => {
        const nowUrl = url
        const formData = new FormData()
        formData.append('username', 'johndoe')
        formData.append('id', 123456)
        // 创建xhr对象
        const xhr = {
          ...new XMLHttpRequest(),
          ...body
        }

        // 设置xhr请求的超时时间
        xhr.timeout = 3000
        // 设置响应返回的数据格式
        xhr.responseType = ''
        // 创建一个 post 请求，采用异步
        xhr.open('post', nowUrl, true)
        xhr.setRequestHeader('Authorization', localStorage.getItem('nz-token'))
        // 注册相关事件回调处理函数
        xhr.onload = function (e) {
          if (this.status == 200 || this.status == 304) {
            // alert(this.responseText)
            resolve(JSON.parse(this.responseText))
          }
        }
        xhr.onerror = function (e) { console.log(e) }
        // 发送数据
        xhr.send()
      })
    },
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
      this.expressionList[this.index] = value
      this.dropDownVisible = false
      this.$emit('change', value)
      this.$forceUpdate()
      this.cascaderValue = ''
    },
    metricChangeNew (value) {
      if (!value) return
      this.insertText(value)
      this.dropDownVisible = false
      this.$emit('change', value)
      this.$forceUpdate()
      this.cascaderValue = ''
    },
    logLabelChange (value) {
      if (!value || value.length === 0) return
      this.expressionList[this.index] = `{${value[0]}="${value[1]}"}`
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
      } else if (data.children && !data.children.length && this.type !== 'log') {
        this.metricOptions.forEach(item => {
          if (!item.temp && item.children && item.value != data.value) {
            item.children = []
          }
        })
        setTimeout(() => {
          new Promise(resolve => {
            const children = this.$store.state.metricsList.find(item => item.value === data.value).children
            resolve(children)
          }).then((children) => {
            const childrenCopy = JSON.parse(JSON.stringify(children))
            this.metricOptions.find(item => item.label === data.label).children = childrenCopy
            // if (childrenCopy.length > 100) {
            //   childrenCopy.splice(100, children.length)
            //   childrenCopy.push({
            //     label: 'More',
            //     value: false,
            //     parent: data.label,
            //     more: true
            //   })
            //   this.metricOptions.find(item => item.label === data.label).children = childrenCopy
            // } else {
            //   this.metricOptions.find(item => item.label === data.label).children = childrenCopy
            // }
          })
        })
      } else if (data.more) {
        setTimeout(() => {
          new Promise(resolve => {
            const children = this.$store.state.metricsList.find(item => item.label === data.parent).children
            resolve(children)
          }).then((children) => {
            this.metricOptions.find(item => item.label === data.parent).children = children
          })
        })
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
    dropDownVisible (n, o) {
      if (this.$refs.metricSelector) {
        this.$refs.metricSelector.dropDownVisible = n
        if (!this.expressionList[this.index] || this.expressionList[this.index] == '') {
          this.cascaderValue = ''
        }
      }
    },
    a () {
      console.log(this.a)
    },
    metricOptionsParent: {
      deep: true,
      immediate: true,
      handler (n, o) {
        if (n) {
          this.metricOptions = JSON.parse(JSON.stringify(n))
        }
      }
    }
  }
}
</script>
<style>
.input-box .el-input__inner {
  height: 30px;
}
.nz-temp-box /deep/ .el-dialog__body {
  padding: 10px 20px 0 20px;
}
.nz-temp-box /deep/ .el-dialog__footer {
  margin-top: 0;
}
.nz-temp-box .nz-btn-style-light {
  margin-right: 10px;
}
.nz-temp-box .nz-btn-style-normal {
  margin-left: 10px;
}
</style>
