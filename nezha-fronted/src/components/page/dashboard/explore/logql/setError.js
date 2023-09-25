import lodash from 'lodash'
const VARIABLE_REGEX = /\$(\w+)|\[\[(\w+?)(?::(\w+))?\]\]|\${(\w+)(?:\.([^:^\}]+))?(?::([^\}]+))?}/g
class ScopedVarsVariable {
  constructor (name, value) {
    this.state = { name, value, type: 'scopedvar' }
  }

  getValue (fieldPath) {
    const { value } = this.state
    let realValue = value.value
    if (fieldPath) {
      realValue = getFieldAccessor(fieldPath)(value.value)
    } else {
      realValue = value.value
    }
    if (realValue === 'string' || realValue === 'number' || realValue === 'boolean') {
      return realValue
    }
    return String(realValue)
  }

  getValueText () {
    const { value } = this.state
    if (value.text != null) {
      return String(value.text)
    }
    return String(value)
  }
}
export const DataLinkBuiltInVars = {
  keepTime: '__url_time_range',
  timeRangeFrom: '__from',
  timeRangeTo: '__to',
  includeVars: '__all_variables',
  seriesName: '__series.name',
  fieldName: '__field.name',
  valueTime: '__value.time',
  valueNumeric: '__value.numeric',
  valueText: '__value.text',
  valueRaw: '__value.raw',
  // name of the calculation represented by the value
  valueCalc: '__value.calc'
}
class AllVariablesMacro {
  constructor (name, sceneObject) {
    this.state = { name, type: 'url_variable' }
    this._sceneObject = sceneObject
  }

  getValue () {
    const allVars = collectAllVariables(this._sceneObject)
    const format = formatRegistry.get(schema.VariableFormatID.QueryParam)
    const params = []
    for (const name of Object.keys(allVars)) {
      const variable = allVars[name]
      const value = variable.getValue()
      if (!value) {
        continue
      }
      if (isCustomVariableValue(value)) {
        params.push(value.formatter(schema.VariableFormatID.QueryParam))
      } else {
        params.push(format.formatter(value, [], variable))
      }
    }
    return new SkipFormattingValue(params.join('&'))
  }

  getValueText () {
    return ''
  }
}
const macrosIndex = {
  __all_variables: AllVariablesMacro,
  __url_time_range: UrlTimeRangeMacro,
  __value: ValueMacro,
  __data: DataMacro,
  __series: SeriesMacro,
  __field: FieldMacro,
  __url: UrlMacro,
  __from: TimeFromAndToMacro,
  __to: TimeFromAndToMacro,
  __timezone: TimezoneMacro
}
const sceneGraph = {
  // getVariables,
  // getData,
  // getTimeRange,
  // getLayout,
  interpolate
  // lookupVariable,
  // hasVariableDependencyInLoadingState,
  // findObject
}
function interpolate (sceneObject, value, scopedVars, format) {
  if (value === '' || value == null) {
    return ''
  }
  return sceneInterpolator(sceneObject, value, scopedVars, format)
}
function sceneInterpolator (sceneObject, target, scopedVars, format) {
  if (!target) {
    return target != null ? target : ''
  }
  VARIABLE_REGEX.lastIndex = 0
  return target.replace(VARIABLE_REGEX, (match, var1, var2, fmt2, var3, fieldPath, fmt3) => {
    const variableName = var1 || var2 || var3
    const fmt = fmt2 || fmt3 || format
    const variable = lookupFormatVariable(variableName, match, scopedVars, sceneObject)
    if (!variable) {
      return match
    }
    return formatValue(variable, variable.getValue(fieldPath), fmt)
  })
}
function lookupFormatVariable (name, match, scopedVars, sceneObject) {
  const scopedVar = scopedVars == null ? 0 : scopedVars[name]
  if (scopedVar) {
    return getSceneVariableForScopedVar(name, scopedVar)
  }
  const variable = lookupVariable(name, sceneObject)
  if (variable) {
    return variable
  }
  if (macrosIndex[name]) {
    return new macrosIndex[name](name, sceneObject, match, scopedVars)
  }
  return null
}
let scopedVarsVariable
function getSceneVariableForScopedVar (name, value) {
  if (!scopedVarsVariable) {
    scopedVarsVariable = new ScopedVarsVariable(name, value)
  } else {
    scopedVarsVariable.state.name = name
    scopedVarsVariable.state.value = value
  }
  return scopedVarsVariable
}
const fieldAccessorCache = {}
function getFieldAccessor (fieldPath) {
  const accessor = fieldAccessorCache[fieldPath]
  if (accessor) {
    return accessor
  }
  return (fieldAccessorCache[fieldPath] = lodash.property(fieldPath))
}
function lookupVariable (name, sceneObject) {
  const variables = sceneObject.state.$variables
  if (!variables) {
    if (sceneObject.parent) {
      return lookupVariable(name, sceneObject.parent)
    } else {
      return null
    }
  }
  const found = variables.getByName(name)
  if (found) {
    return found
  } else if (sceneObject.parent) {
    return lookupVariable(name, sceneObject.parent)
  }
  return null
}
export default sceneGraph
