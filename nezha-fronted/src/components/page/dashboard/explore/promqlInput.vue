<template>
  <div class="promqlInput" :class=" errorMsg || appendMsg ? 'mb10' : ''">
    <div class="query-row" ref="queryRow" style="position: relative">
      <!--explore页面的样式-->
      <template v-if="styleType == 1">
        <div
          v-if="plugins.indexOf('metric-input') > -1"
          class="input-box"
          style="margin-right: 0;"
          @click="dropDownVisible = false"
        >
          <div
            :id="pqid + 'editor'+index + type"
            class="not-fixed-height no-resize no-close"
            style="padding-right: 24px;box-sizing: border-box"
          >
          </div>
<!--          <div class="zy" style="position: relative;overflow-x: hidden;display: block;border: 1px solid #dedede;width: 100%"  v-if="type == 'log'">-->
<!--            <MonacoEditor-->
<!--              v-if="type == 'log'"-->
<!--              v-model="expressionList[index]"-->
<!--              theme="nz"-->
<!--              class="not-fixed-height no-resize"-->
<!--              ref="monacoEditor"-->
<!--              style="width: calc(100% - 24px)"-->
<!--              :style="{-->
<!--                height: monacoEditorHeight + 'px'-->
<!--              }"-->
<!--              language="logql"-->
<!--              :options="MONACO_EDITOR_OPTIONS"-->
<!--              @editorWillMount="handelBeforeMount"-->
<!--              @editorDidMount="handleMount"-->
<!--              @change="expressionChange"-->
<!--            />-->
<!--          </div>-->

          <div v-if="errorMsg" class="append-msg error" style="position: absolute">
            <span>{{ errorMsg }}</span>
          </div>
          <div v-if="appendMsg" class="append-msg error" style="position: absolute">
            <span>{{ appendMsg }}</span>
          </div>
          <i class="nz-icon nz-icon-sousuoliebiao" style="position: absolute; right: 6px" @click="queryPromptShowChange"/>
          <queryPrompt v-if="queryPromptShow" @close="queryPromptShowChange" :type="type" :width="queryPromptWidth" :position="queryPromptPosition" class="no-style-class" @selectMetric="selectMetric" @selectLog="selectLog"/>
        </div>
        <explore-history v-if="historyshow" :type="type" @close="showHistoryBox(false)" @selectHistory="selectHistory"/>
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
            :class="
              'metric-null-input-box'
            "
            :style="{ height: '100%' }"
          >

            <div
              class="input-box"
              @click="dropDownVisible = false"
              v-if="plugins.indexOf('metric-input') > -1"
            >
            <div
              :id="pqid + 'editor'+index + type"
              class="not-fixed-height no-resize no-close"
              style="padding-right: 24px;box-sizing: border-box"
            >
            </div>
<!--              <div class="zy" style="position: relative;overflow-x: hidden;display: block;border: 1px solid #dedede;width: 100%"  v-if="type == 'log'">-->
<!--                <MonacoEditor-->
<!--                  v-if="type == 'log'"-->
<!--                  v-model="expressionList[index]"-->
<!--                  theme="nz"-->
<!--                  class="not-fixed-height no-resize"-->
<!--                  ref="monacoEditor"-->
<!--                  style="width: calc(100% - 24px)"-->
<!--                  :style="{-->
<!--                    height: monacoEditorHeight + 'px'-->
<!--                  }"-->
<!--                  language="logql"-->
<!--                  :options="MONACO_EDITOR_OPTIONS"-->
<!--                  @editorWillMount="handelBeforeMount"-->
<!--                  @editorDidMount="handleMount"-->
<!--                  @change="expressionChange"-->
<!--                />-->
<!--              </div>-->
            </div>
            <div class="append-msg error" v-if="errorMsg">
              <span>{{ errorMsg }}</span>
            </div>
            <div class="append-msg error" v-if="appendMsg">
              <span>{{ appendMsg }}</span>
            </div>
          </el-col>
          <i class="nz-icon nz-icon-sousuoliebiao" style="position: absolute;right: 15px;height: 24px; width: 24px;line-height: 24px;" @click="queryPromptShowChange"/>
          <queryPrompt v-if="queryPromptShow" @close="queryPromptShowChange" :type="type" :width="queryPromptWidth" :position="queryPromptPosition" class="no-style-class" @selectMetric="selectMetric" @selectLog="selectLog"/>
        </el-row>
      </template>
    </div>
    <div v-if="styleType == 2 && showRemove">
      <div
        class="option"
        @click="addExpression"
        :title="$t('tip.add')"
        v-if="plugins.indexOf('add') > -1"
      >
        <i class="nz-icon nz-icon-plus"></i>
      </div>
      <div
        class="option"
        style="margin-left: 5px; line-height: 32px"
        @click="removeExpression"
        :title="$t('overall.delete')"
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
import { PromQLExtension } from '@prometheus-io/codemirror-promql'
import { baseTheme, promqlHighlighter, lightTheme } from './CMTheme.tsx'
import { newCompleteStrategy } from '@prometheus-io/codemirror-promql/dist/esm/complete'
import { analyzeCompletion, computeStartCompletePosition, ContextKind } from '@prometheus-io/codemirror-promql/dist/esm/complete/hybrid'
import { aggregateOpModifierTerms, aggregateOpTerms, atModifierTerms, binOpModifierTerms, binOpTerms, durationTerms, functionIdentifierTerms, matchOpTerms, numberTerms } from '@prometheus-io/codemirror-promql/dist/esm/complete/promql.terms'
// import {basicSetup} from '@codemirror/basic-setup';
import { EditorView, highlightSpecialChars, keymap, ViewUpdate, placeholder } from '@codemirror/view'
import { EditorState, Prec, Compartment } from '@codemirror/state'
import { bracketMatching, indentOnInput, syntaxHighlighting, syntaxTree } from '@codemirror/language'
import { defaultKeymap, history, historyKeymap, insertNewlineAndIndent } from '@codemirror/commands'
import { highlightSelectionMatches } from '@codemirror/search'
import { lintKeymap } from '@codemirror/lint'
import logqlHint from './logqlHint'
import {
  autocompletion,
  completionKeymap,
  CompletionContext,
  CompletionResult,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete'
import exploreHistory from '@/components/page/dashboard/explore/histoyrComponent/exploreHistory'
import MonacoEditor from '@/components/page/dashboard/explore/MonacoVue/vue-monaco'
import queryPrompt from '@/components/page/dashboard/explore/queryPrompt/queryPrompt'
import logqlMixin from '@/components/page/dashboard/explore/logql/logqlMixin'
import bus from '@/libs/bus'
export default {
  name: 'promqlInput',
  mixins: [logqlMixin],
  components: {
    selectAlertSilence,
    exploreHistory,
    MonacoEditor,
    queryPrompt
  },
  props: {
    index: { type: Number },
    pqid: {
      type: String, default: ''
    },
    expressionList: { type: Array },
    state: { type: Number },
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
    },
    isTopo: {
      type: Boolean,
      default: false
    }
    // metricOptions: {type: Array},
    // metricStore: {type: Array}
  },
  data () {
    return {
      oldcCodeLength: '',
      showPrompt: false,
      newView: null,
      codeMirrorValue: [],
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
      loading: false,
      firstInit: true,
      historyshow: false,
      queryPromptShow: false,
      queryPromptWidth: 0,
      queryPromptPosition: {
        top: 0,
        left: 0
      }
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
    // width () {
    //   return
    // }
  },
  mounted () {
    if (!this.fromFatherData && this.type !== 'log') {
      this.queryMetrics()
    }
    window.addEventListener('resize', this.resize)
  },
  methods: {
    async initCodeMirror () {
      const self = this
      let baseUrl = this.$axios.defaults.baseURL
      if (!baseUrl || baseUrl == '/') {
        baseUrl = window.location.protocol + '//' + window.location.host
      }
      const defaultHeaders = {
        Authorization: localStorage.getItem('nz-token')
      }

      let api = '/prom/'
      if (this.type === 'log') {
        api = '/logs/loki/'
      }
      const promqlExtension = new PromQLExtension()
      const completeStrategy = newCompleteStrategy({
        remote: {
          url: baseUrl + api,
          fetchFn: (resource, options = {}) => {
            const params = options.body?.toString()
            const search = params ? `?${params}` : ''
            return fetch(resource + search, {
              method: 'Get',
              headers: new Headers(
                defaultHeaders
              )
            })
          }
        },
        maxMetricsMetadata: 99999
      })
      if (this.type === 'log') {
        const autocompleteNodes = {
          matchOp: matchOpTerms,
          binOp: binOpTerms,
          duration: durationTerms,
          binOpModifier: [],
          atModifier: [],
          functionIdentifier: logqlHint.functions,
          aggregateOp: logqlHint.aggregateOp,
          aggregateOpModifier: aggregateOpModifierTerms,
          number: numberTerms
        }
        completeStrategy.promQL = function (context) {
          const { state, pos } = context
          const tree = syntaxTree(state).resolve(pos, -1)
          const contexts = analyzeCompletion(state, tree)
          let asyncResult = Promise.resolve([])
          let completeSnippet = false
          const span = true
          for (const context of contexts) {
            switch (context.kind) {
              case ContextKind.Aggregation:
                completeSnippet = true
                asyncResult = asyncResult.then((result) => {
                  return result.concat(autocompleteNodes.aggregateOp)
                })
                break
              case ContextKind.Function:
                completeSnippet = true
                asyncResult = asyncResult.then((result) => {
                  return result.concat(autocompleteNodes.functionIdentifier)
                })
                break
              case ContextKind.BinOpModifier:
                asyncResult = asyncResult.then((result) => {
                  return result.concat(autocompleteNodes.binOpModifier)
                })
                break
              case ContextKind.BinOp:
                asyncResult = asyncResult.then((result) => {
                  return result.concat(autocompleteNodes.binOp)
                })
                break
              case ContextKind.MatchOp:
                asyncResult = asyncResult.then((result) => {
                  return result.concat(autocompleteNodes.matchOp)
                })
                break
              case ContextKind.AggregateOpModifier:
                asyncResult = asyncResult.then((result) => {
                  return result.concat(autocompleteNodes.aggregateOpModifier)
                })
                break
              case ContextKind.Duration:
                span = false
                asyncResult = asyncResult.then((result) => {
                  return result.concat(autocompleteNodes.duration)
                })
                break
              case ContextKind.Offset:
                asyncResult = asyncResult.then((result) => {
                  return result.concat([{ label: 'offset' }])
                })
                break
              case ContextKind.Bool:
                asyncResult = asyncResult.then((result) => {
                  return result.concat([{ label: 'bool' }])
                })
                break
              case ContextKind.AtModifiers:
                asyncResult = asyncResult.then((result) => {
                  return result.concat(autocompleteNodes.atModifier)
                })
                break
              case ContextKind.Number:
                asyncResult = asyncResult.then((result) => {
                  return result.concat(autocompleteNodes.number)
                })
                break
              case ContextKind.MetricName:
                asyncResult = asyncResult.then((result) => {
                  return this.autocompleteMetricName(result, context)
                })
                break
              case ContextKind.LabelName:
                asyncResult = asyncResult.then((result) => {
                  return this.autocompleteLabelName(result, context)
                })
                break
              case ContextKind.LabelValue:
                asyncResult = asyncResult.then((result) => {
                  return this.autocompleteLabelValue(result, context)
                })
            }
          }
          return asyncResult.then((result) => {
            return arrayToCompletionResult(result, computeStartCompletePosition(tree, pos), pos, completeSnippet, span)
          })
        }
      }
      function arrayToCompletionResult (data, from, to, includeSnippet = false, span = true) {
        const options = data
        // options.push(...logqlHint);
        return {
          from: from,
          to: to,
          options: options,
          validFor: span ? /^[a-zA-Z0-9_:]+$/ : undefined
        }
      }
      // console.log(JSON.stringify(promqlExtension.promQL()))
      promqlExtension.activateCompletion(true)
        .activateLinter(!(this.type === 'log'))
        .setComplete({
          completeStrategy: new HistoryCompleteStrategy(completeStrategy)

        })
      function HistoryCompleteStrategy (CompleteStrategy) {
        const obj = {}
        obj.complete = CompleteStrategy
        obj.queryHistory = []
        obj.promQL = function (context) {
          return Promise.resolve(this.complete.promQL(context)).then((res) => {
            const { state, pos } = context
            const tree = syntaxTree(state).resolve(pos, -1)
            const start = res != null ? res.from : tree.from

            if (start !== 0) {
              return res
            }

            const historyItems = {
              from: start,
              to: pos,
              options: this.queryHistory.map((q) => ({
                label: q.length < 80 ? q : q.slice(0, 76).concat('...'),
                detail: 'past query',
                apply: q,
                info: q.length < 80 ? undefined : q
              })),
              span: /^[a-zA-Z0-9_:]+$/
            }
            // 过滤 非logs的函数
            if (res !== null) {
              historyItems.options = historyItems.options.concat(res.options)
            }
            return historyItems
          })
        }
        return obj
      }
      const highlighter = syntaxHighlighting(promqlHighlighter)
      const dynamicConfigCompartment = new Compartment()
      const dynamicConfig = [
        highlighter,
        promqlExtension.asExtension(),
        lightTheme
      ]
      if (!this.newView) {
        let placeholderStr = 'Metrics Expression (press Shift+Enter for newlines)'
        if (this.type === 'log') {
          placeholderStr = 'Logs Expression (press Shift+Enter for newlines)'
        }
        const EditorViewstate = EditorState.create({
          doc: self.codeMirrorValue[self.index],
          extensions: [
            // basicSetup,
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
            keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap, ...lintKeymap]),
            placeholder(placeholderStr),
            dynamicConfigCompartment.of(dynamicConfig),
            keymap.of([
              {
                key: 'Escape',
                run: (v) => {
                  v.contentDOM.blur()
                  return false
                }
              }
            ]),
            Prec.highest(
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
          editorState: {
            changeByRange: self.newChange,
            changes: self.newDoc,
            facet: self.newChange
          }
        })
        const view = new EditorView({
          state: EditorViewstate,
          // parent: document.getElementById('editor')
          parent: document.getElementById(this.pqid + 'editor' + self.index + this.type)
        })
        self.newView = view
      } else {
        const to = self.oldcCodeLength
        const from = self.oldcCodeLength
        self.newView.dispatch(
          self.newView.state.update({
            effects: dynamicConfigCompartment.reconfigure(dynamicConfig),
            changes: { from: 0, to, insert: self.codeMirrorValue[self.index] }
          })
        )
      }
    },
    newChange (val) {
      if (this.firstInit && this.isTopo) {
        return
      }
      if (val) {
        this.oldcCodeLength = val.length
        this.codeMirrorValue[this.index] = val
        // this.expressionList[this.index] = val
        this.$set(this.expressionList, this.index, val)
        this.metricKeyDown(val)
      } else {
        this.oldcCodeLength = 0
        this.codeMirrorValue[this.index] = ''
        // this.expressionList[this.index] = ''
        this.$set(this.expressionList, this.index, '')
        this.$emit('change', '')
      }
    },
    newDoc (val) {
      // console.log('doc', val)
    },
    promqlInputChange (val) {
      if (this.type === 'metrics') {
        try {
          const text = this.newView.state.doc.toString()
          this.newView.dispatch(
            this.newView.state.update({
              changes: { from: 0, to: text.length, insert: this.codeMirrorValue[this.index] }
            })
          )
        } catch (error) {}
      }
    },
    fetchFn (a, b) {
      const params = {}
      if (b) {
        params['match[]'] = b.body.get('match[]')
        params.start = b.body.get('start')
        params.end = b.body.get('end')
        a += '?match[]=' + b.body.get('match[]')
        return fetch(a, {
          ...b,
          // body: JSON.stringify(params),
          redirect: 'follow',
          headers: {
            Authorization: localStorage.getItem('nz-token'),
            'content-type': 'application/x-www-form-urlencoded'
          }
        })
      }
      return fetch(a, {
        ...b,
        headers: {
          Authorization: localStorage.getItem('nz-token')
        }
      })
    },
    closeDropdown () {
      this.dropDownVisible = false
    },
    clearExpression: function () {
      this.expressionChange()
      this.cascaderValue = ''
    },
    enableExpression: function () {
      this.$emit('enableExpression', this.index)
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
      this.codeMirrorValue[this.index] = value
      this.dropDownVisible = false
      this.$emit('change', value)
      // this.initCodeMirror()
      this.$forceUpdate()
      this.cascaderValue = ''
    },
    metricChangeNew (value) {
      // console.log(value)
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
      this.codeMirrorValue[this.index] = `{${value[0]}="${value[1]}"}`
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
      if (this.$refs.monacoEditor) {
        setTimeout(() => {
          this.heightChange()
        }, 100)
      }
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

              // el-cascader-panel监听到options变化 会触发scrollIntoView函数
              const temp = this.$refs.metricSelector.scrollIntoView
              this.$refs.metricSelector.scrollIntoView = function () {}
              this.$nextTick(() => {
                this.$refs.metricSelector.scrollIntoView = temp
              })
            }
          })
        } else {
          this.dropDownVisible = false
          this.$get('/expression/tmpl/' + data.id).then(res => {
            if (res.code === 200) {
              if (!res.data.vars || !res.data.vars.length) {
                this.metricChange(data.expression)
                this.initCodeMirror()
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
      } else if (data.children && (!data.children.length || data.children.length > 100) && this.type !== 'log') {
        setTimeout(() => {
          new Promise(resolve => {
            const children = this.$store.state.metricsList.find(item => item.value === data.value).children
            resolve(children)
          }).then((children) => {
            const childrenCopy = JSON.parse(JSON.stringify(children))
            const findChild = this.metricOptions.find(item => item.label === data.label)
            if (childrenCopy.length > 100) {
              childrenCopy.splice(100, childrenCopy.length)
              childrenCopy.push({
                label: 'More',
                value: false,
                parent: data.label,
                more: true
              })
              findChild.children = childrenCopy
            } else {
              findChild.children = childrenCopy
            }
            this.metricOptions.forEach(item => {
              if (!item.temp && item.children && item.value != data.value) {
                item.children = []
              }
            })

            // el-cascader-panel监听到options变化 会触发scrollIntoView函数
            const temp = this.$refs.metricSelector.scrollIntoView
            this.$refs.metricSelector.scrollIntoView = function () {}
            this.$nextTick(() => {
              this.$refs.metricSelector.scrollIntoView = temp
            })
          })
        })
      } else if (data.more) {
        setTimeout(() => {
          new Promise(resolve => {
            const children = this.$store.state.metricsList.find(item => item.label === data.parent).children
            resolve(children)
          }).then((children) => {
            let childrenCopy = JSON.parse(JSON.stringify(children))
            const findChild = this.metricOptions.find(item => item.label === data.parent)
            if (childrenCopy.length > 100) {
              childrenCopy = childrenCopy.splice(findChild.children.length, 100)
              findChild.children.splice(findChild.children.length - 1, 1)
              findChild.children.push(...childrenCopy)
              if (findChild.children.length < children.length - 1) {
                findChild.children.push({
                  label: 'More',
                  value: false,
                  parent: data.parent,
                  more: true
                })
              } else {
                findChild.children.splice(findChild.children.length - 1, 1)
              }
            } else {
              findChild.children = childrenCopy
            }

            // el-cascader-panel监听到options变化 会触发scrollIntoView函数
            const temp = this.$refs.metricSelector.scrollIntoView
            this.$refs.metricSelector.scrollIntoView = function () {}
            this.$nextTick(() => {
              this.$refs.metricSelector.scrollIntoView = temp
            })
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
    selectHistory (str) {
      this.insertText(str)
    },
    insertText (insertTxt) {
      // 获取el-input中的input元素
      // const elInput = this.$refs.elInput.$el.firstElementChild
      // 获取el-input的值
      // const txt = elInput.value
      // 获取选区开始位置
      // const startPos = elInput.selectionStart
      // 获取选区结束位置
      // const endPos = elInput.selectionEnd
      // if (startPos === undefined || endPos === undefined) return
      // 将文本插入光标位置
      // this.expressionList[this.index] = txt.substring(0, startPos) + insertTxt + txt.substring(endPos)
      // 将光标移至文本末尾
      // elInput.focus()
      // elInput.selectionStart = startPos + insertTxt.length
      // elInput.selectionEnd = startPos + insertTxt.length
      this.expressionList[this.index] = insertTxt
      this.codeMirrorValue[this.index] = insertTxt
      this.initCodeMirror()
    },
    /* setMsg:function(){
        this.appendMsg
      } */
    prettyCode () {
      this.$nextTick(() => {
        const text = this.newView.state.doc.toString()
        this.newView.dispatch(
          this.newView.state.update({
            changes: { from: 0, to: text.length, insert: this.codeMirrorValue[this.index] }
          })
        )
      })
    },
    showHistoryBox (flag) {
      this.historyshow = flag
    },
    queryPromptShowChange: bus.debounce(function (val) {
      if (!this.queryPromptShow) {
        this.setPosition()
      }
      this.queryPromptShow = !this.queryPromptShow
    }, 100),
    hideQueryPromptShow () {
      this.queryPromptShow = false
    },
    setPosition () {
      this.queryPromptWidth = this.$refs.queryRow.offsetWidth
      const position = this.$refs.queryRow.getBoundingClientRect() // 定位元素位置
      const windowWidth = window.innerWidth// 窗口宽度
      const windowHeight = window.innerHeight// 窗口高度
      const boxHeight = 400
      const parentHeight = this.$refs.queryRow.offsetHeight + 10
      let top = 0
      const left = position.left
      if (position.top + parentHeight + boxHeight > windowHeight - 100) {
        top = position.top - boxHeight - 10
      } else {
        top = position.top + parentHeight
      }
      this.queryPromptPosition = {
        top: top,
        left: left
      }
    },
    selectMetric (item) {
      if (!item.id) {
        this.metricChangeNew(item.name)
      } else if (item.id) {
        this.dropDownVisible = false
        this.$get('/expression/tmpl/' + item.id).then(res => {
          if (res.code === 200) {
            if (!res.data.vars || !res.data.vars.length) {
              this.metricChange(item.expression)
              this.initCodeMirror()
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
    },
    selectLog (item) {
      if (!item.id) {
        this.metricChangeNew(item.name)
      } else if (item.id) {
        this.dropDownVisible = false
        this.$get('/expression/tmpl/' + item.id).then(res => {
          if (res.code === 200) {
            if (!res.data.vars || !res.data.vars.length) {
              this.metricChange(item.expression)
              this.initCodeMirror()
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
    },
    resize () {
      this.setPosition()
    }
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
    metricOptionsParent: {
      deep: true,
      immediate: true,
      handler (n, o) {
        if (n) {
          this.metricOptions = JSON.parse(JSON.stringify(n))
        }
      }
    },
    expressionList: {
      deep: true,
      immediate: true,
      handler (n, o) {
        this.codeMirrorValue[this.index] = n[this.index]
        if (this.isTopo && this.firstInit) {
          setTimeout(() => {
            const text = this.newView.state.doc.toString()
            this.newView.dispatch(
              this.newView.state.update({
                changes: { from: 0, to: text.length, insert: this.codeMirrorValue[this.index] }
              })
            )
            this.firstInit = false
          }, 200)
        }
      }
    },

    // codeMirrorValue:{
    //   deep:true,
    //   imediate:true,
    //   handler(n){
    //     if(n){
    //       this.oldcCodeLength = n.length
    //     }
    //   }
    // }
    type: {
      deep: true,
      immediate: true,
      handler (n) {
        this.$nextTick(() => {
          this.initCodeMirror()
        })
      }
    }
  },
  beforeDestroy () {
    this.newView = null
    window.removeEventListener('resize', this.resize)
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
