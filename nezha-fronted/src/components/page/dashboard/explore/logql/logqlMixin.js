import { languageConfiguration, monarchlanguage } from './monacoConfig'
import { parser, formatLokiQuery } from './lezerConfig'
import { getSituation } from './situation'
export default {
  data () {
    return {
      code: '',
      LANGUAGE_SETUP_STARTED: false,
      parser,
      MONACO_EDITOR_OPTIONS: {
        automaticLayout: true,
        formatOnType: true,
        formatOnPaste: true,
        codeLens: false,
        contextmenu: false,
        // we need `fixedOverflowWidgets` because otherwise in grafana-dashboards
        // the popup is clipped by the panel-visualizations.
        fixedOverflowWidgets: true,
        folding: false,
        fontSize: 14,
        lineDecorationsWidth: 8, // used as "padding-left"
        lineNumbers: 'off',
        minimap: { enabled: false },
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        padding: {
          // these numbers were picked so that visually this matches the previous version
          // of the query-editor the best
          top: 10,
          bottom: 5
        },
        renderLineHighlight: 'none',
        scrollbar: {
          // vertical: 'hidden',
          verticalScrollbarSize: 8, // used as "padding-right"
          horizontal: 'hidden',
          horizontalScrollbarSize: 0
        },
        scrollBeyondLastLine: false,
        suggest: {
          showWords: true,
          /**
           * Enable custom contextmenu.
           * Defaults to false.
           */
          contextmenu: true,
          /**
           * The number of spaces a tab is equal to.
           * This setting is overridden based on the file contents when `detectIndentation` is on.
           * Defaults to 4.
           */
          tabSize: 4,
          /**
           * Show code lens
           * Defaults to false.
           */
          codeLens: true,
          /**
           * Control the width of line numbers, by reserving horizontal space for rendering at least an amount of digits.
           * Defaults to 4.
           */
          lineNumbersMinChars: 4,
          /**
           * The width reserved for line decorations (in px).
           * Line decorations are placed between line numbers and the editor content.
           * You can pass in a string in the format floating point followed by "ch". e.g. 1.3ch.
           * Defaults to 1 * theme.spacing.gridSize.
           */
          // lineDecorationsWidth?: number | string;
          /**
           * Controls if a border should be drawn around the overview ruler.
           * Defaults to `false`.
           */
          overviewRulerBorder: false,
          /**
           * Enable that the editor will install an interval to check if its container dom node size has changed.
           * Enabling this might have a severe performance impact.
           * Defaults to true.
           */
          automaticLayout: true
        },
        suggestFontSize: 12,
        wordWrap: 'on',
        placeHolderScopedVars: {
          __interval: { text: '1s', value: '1s' },
          __auto: { text: '1s', value: '1s' },
          __interval_ms: { text: '1000', value: 1000 },
          __range_ms: { text: '1000', value: 1000 },
          __range_s: { text: '1', value: 1 },
          __range: { text: '1s', value: '1s' }
        },
      },
      monacoEditorHeight: 30,
      templateSrv: ''
    }
  },
  methods: {
    handleChange (value, event) {
      this.heightChange()
    },
    heightChange () {
      const dom = this.$refs.monacoEditor.$el
      const el = dom.getElementsByClassName('view-line')
      const height = 11 + el.length * 19
      if (this.monacoEditorHeight !== height) {
        this.monacoEditorHeight = height
      }
    },
    handleMount (editor) {
      // const dom = this.$refs.monacoEditor.$el
      // const el = dom.getElementsByClassName('view-lines')
      // if (el && el[0]) {
      //   el[0].addEventListener('DOMNodeInserted', this.heightChange)
      // }
    },
    handelBeforeMount (monaco) {
      const LANG_ID = 'logql'
      const self = this
      if (!window.LANGUAGE_SETUP_STARTED) {
        window.LANGUAGE_SETUP_STARTED = true
        // console.log(monaco)
        monaco.languages.register({ id: LANG_ID })
        monaco.languages.setLanguageConfiguration(LANG_ID, languageConfiguration)
        monaco.languages.setMonarchTokensProvider(LANG_ID, monarchlanguage)
        monaco.editor.defineTheme('nz', {
          base: 'vs',
          inherit: true,
          colors: {
            'editor.background': '#ffffff',
            'minimap.background': '#f9f9f9'
          },
          // fallback syntax highlighting for languages that microsoft doesn't handle (ex cloudwatch's metric math)
          rules: [
            { token: 'predefined', foreground: '#FF6600' },
            { token: 'operator', foreground: '#009966' },
            { token: 'tag', foreground: '#006699' }
          ]
        })
        monaco.languages.registerCompletionItemProvider('logql', {
          provideCompletionItems: (model, position) => {
            const suggestions = [
              ...monarchlanguage.keywords.map(k => {
                // console.log(k)
                return {
                  label: k,
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: k
                }
              })
            ]
            return { suggestions: suggestions }
          }
        })
      }
    },
    nzSuggest (model, position) {
      // console.log(model, position)
      const suggestions = []
      // console.log(parser.parse(this.code))
      return suggestions
    },
    suggest (model, position) {
      const monaco = this.$refs.monacoEditor.monaco
      const self = this
      const word = model.getWordAtPosition(position)
      const INSERT_AS_SNIPPET_ENUM_VALUE = 4
      console.log(monaco.Range.fromPositions(position))
      const range = monaco.Range.fromPositions(position)
      // documentation says `position` will be "adjusted" in `getOffsetAt`
      // i don't know what that means, to be sure i clone it
      const positionClone = {
        column: position.column,
        lineNumber: position.lineNumber
      }
      const offset = model.getOffsetAt(positionClone)
      console.log(offset)
      const situation = getSituation(model.getValue(), offset)
      console.log(situation)
      const completionsPromise = situation != null ? Promise.resolve([]) : Promise.resolve([])
      return completionsPromise.then((items) => {
        // monaco by default alphabetically orders the items.
        // to stop it, we use a number-as-string sortkey,
        // so that monaco keeps the order we use
        const maxIndexDigits = items.length.toString().length
        const suggestions = items.map((item, index) => ({
          kind: self.getMonacoCompletionItemKind(item.type, monaco),
          label: item.label,
          insertText: item.insertText,
          insertTextRules: item.isSnippet ? INSERT_AS_SNIPPET_ENUM_VALUE : undefined,
          detail: item.detail,
          documentation: item.documentation,
          sortText: index.toString().padStart(maxIndexDigits, '0'), // to force the order we have
          range,
          command: item.triggerOnInsert
            ? {
              id: 'editor.action.triggerSuggest',
              title: ''
            }
            : undefined
        }))
        return { suggestions }
      })
    },
    getMonacoCompletionItemKind (type, monaco) {
      switch (type) {
        case 'DURATION':
          return monaco.languages.CompletionItemKind.Unit
        case 'FUNCTION':
          return monaco.languages.CompletionItemKind.Variable
        case 'HISTORY':
          return monaco.languages.CompletionItemKind.Snippet
        case 'LABEL_NAME':
          return monaco.languages.CompletionItemKind.Enum
        case 'LABEL_VALUE':
          return monaco.languages.CompletionItemKind.EnumMember
        case 'PATTERN':
          return monaco.languages.CompletionItemKind.Constructor
        case 'PARSER':
          return monaco.languages.CompletionItemKind.Class
        case 'LINE_FILTER':
          return monaco.languages.CompletionItemKind.TypeParameter
        case 'PIPE_OPERATION':
          return monaco.languages.CompletionItemKind.Interface
        default:
          return `Unexpected case in switch statement: ${JSON.stringify(type)}`
      }
    },
    interpolateString (string, scopedVars) {
      return this.interpolate(string, scopedVars, this.interpolateQueryExpr)
    },
    interpolateQueryExpr (value, variable) {
      // if no multi or include all do not regexEscape
      if (!variable.multi && !variable.includeAll) {
        return this.lokiRegularEscape(value)
      }

      if (typeof value === 'string') {
        return this.lokiSpecialRegexEscape(value)
      }

      const escapedValues = this.$lodash.map(value, this.lokiSpecialRegexEscape)
      return escapedValues.join('|')
    },
    lokiRegularEscape (value) {
      if (typeof value === 'string') {
        return value.replace(/'/g, "\\\\'")
      }
      return value
    },
    lokiSpecialRegexEscape (value) {
      if (typeof value === 'string') {
        return this.lokiRegularEscape(value.replace(/\\/g, '\\\\\\\\').replace(/[$^*{}\[\]+?.()|]/g, '\\\\$&'))
      }
      return value
    },
    setPlaceholder  (monaco, editor) {
      const placeholderDecorators = [
        {
          range: new monaco.Range(1, 1, 1, 1),
          options: {
            className: 'nz-eqweqwe',
            isWholeLine: true
          }
        }
      ]

      let decorators = []

      const checkDecorators = () => {
        const model = editor.getModel()

        if (!model) {
          return
        }

        const newDecorators = model.getValueLength() === 0 ? placeholderDecorators : []
        decorators = model.deltaDecorations(decorators, newDecorators)
      }

      checkDecorators()
      editor.onDidChangeModelContent(checkDecorators)
    },
    interpolate (target, scopedVars, format, interpolations) {
      if (scopedVars && scopedVars.__sceneObject) {
        return sceneGraph.interpolate(
          scopedVars.__sceneObject.value,
          target,
          scopedVars,
          format
        )
      }

      if (!target) {
        return target || ''
      }

      this.regex.lastIndex = 0

      return this._replaceWithVariableRegex(target, format, (match, variableName, fieldPath, fmt) => {
        const value = this._evaluateVariableExpression(match, variableName, fieldPath, fmt, scopedVars)

        // If we get passed this interpolations map we will also record all the expressions that were replaced
        if (interpolations) {
          interpolations.push({ match, variableName, fieldPath, format: fmt, value, found: value !== match })
        }

        return value
      })
    },
    sceneInterpolator (sceneObject, target, scopedVars, format) {
      const VARIABLE_REGEX = /\$(\w+)|\[\[(\w+?)(?::(\w+))?\]\]|\${(\w+)(?:\.([^:^\}]+))?(?::([^\}]+))?}/g
      if (!target) {
        return target != null ? target : ''
      }
      VARIABLE_REGEX.lastIndex = 0
      return target.replace(VARIABLE_REGEX, (match, var1, var2, fmt2, var3, fieldPath, fmt3) => {
        const variableName = var1 || var2 || var3
        const fmt = fmt2 || fmt3 || format
        const variable = this.lookupFormatVariable(variableName, match, scopedVars, sceneObject)
        if (!variable) {
          return match
        }
        return this.formatValue(variable, variable.getValue(fieldPath), fmt)
      })
    },
    formatValue (variable, value, formatNameOrFn) {
      if (value === null || value === 0) {
        return ''
      } else {
        return value
      }
    },
    lookupFormatVariable (name, match, scopedVars, sceneObject) {
      console.log(name, match, scopedVars, sceneObject)
      return null
    }
  },
  beforeDestroy () {
  }
}
