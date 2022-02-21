import _ from 'lodash'
export const connection = 'connection'
export const condition = 'condition'
export const columnType = {
  fullText: 'fullText',
  string: 'string',
  long: 'long',
  number: 'number',
  array: 'array'
}
export default class Meta {
  // meta元数据有两种，一是condition，表示字段、操作符、值的组合，二是connection，是condition之间的连接符，AND | OR
  constructor (type) {
    switch (type) {
      case connection: {
        this.newConnection()
        break
      }
      default: {
        this.newCondition()
        break
      }
    }
  }

  newConnection () {
    this.meta = connection
    this.value = 'AND'
    this.isEditing = false
  }

  newCondition () {
    this.meta = condition
    this.name = ''
    this.nameIsEditing = false
    this.oper = ''
    this.operIsEditing = false
    this.value = ''
    this.valueIsEditing = false
  }

  isEmpty () {
    if (this.meta === condition) {
      return _.isEmpty(this.name)
    } else {
      return true
    }
  }

  // 取消editing状态
  cancelEditing () {
    if (this.meta === condition) {
      this.nameIsEditing = false
      this.operIsEditing = false
      this.valueIsEditing = false
    }
    if (this.meta === connection) {
      this.isEditing = false
    }
  }

  // 是否是完整的condition
  isCompleteCondition () {
    return this.name && this.oper && this.value
  }

  resetOperator () {
    this.oper = ''
    this.operIsEditing = false
  }

  resetValue () {
    this.value = ''
    this.valueIsEditing = false
  }
}
