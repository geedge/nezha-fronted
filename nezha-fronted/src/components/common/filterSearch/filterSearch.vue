<template>
  <div class="tag-search">
    <div class="tag-search__meta"
         v-for="(meta, index) in metaList"
         :key="index"
         :class="`tag-search__meta--${meta.meta}`"
    >
      <template v-if="meta.meta === condition">
        <!-- 删除按钮 -->
        <div class="condition__delete" @click="removeCondition(index)"><i class="el-icon-error"></i></div>
        <!-- 字段选择 -->
        <div class="condition__column">
          <div v-if="meta.nameIsEditing">
            <el-select
              allow-create
              filterable
              size="mini"
              v-model="meta.name"
              ref="columnSelect"
              :placeholder="meta.name || ''"
              @blur="columnBlur(meta, index)"
              @change="columnChange(meta,index)"
            >
              <el-option
                v-for="(column, index) in keyList"
                :key="index"
                :label="column.label"
                :value="column.name"
              ></el-option>
            </el-select>
          </div>
          <span v-show="!meta.nameIsEditing" @click="columnClick(meta, index)" class="cursor-pointer">{{meta.name}}</span>
        </div>
        <!-- 操作符选择 -->
        <div class="condition__column">
          <div v-if="meta.operIsEditing">
            <el-select
              allow-create
              filterable
              size="mini"
              v-model="meta.oper"
              ref="operSelect"
              :placeholder="meta.oper || ''"
              @blur="operBlur(meta, index)"
              @change="operChange(meta,index)"
            >
              <el-option
                v-for="(column, index) in compareList"
                :key="index"
                :label="column.name"
                :value="column.name"
              ></el-option>
            </el-select>
          </div>
          <span class="condition__operator cursor-pointer" v-show="!meta.operIsEditing" @click="operatorClick(meta,index)">{{meta.oper}}</span>
        </div>
        <!-- 值 -->
        <div class="condition__value">
          <div v-if="meta.valueIsEditing">
            <el-input v-model="meta.value" size="mini" @blur="valueBlur(meta,index)" ref="valueInput" @keyup.enter.native="valueEnter(meta,index)"></el-input>
          </div>
          <div v-else @click="valueClick(meta,index)" :style="`padding:${meta.value ? 0 : 10}px`">{{meta.value}}</div>
        </div>
      </template>
    </div>
    <div class="tag-search__add cursor-pointer" @click="addCondition()">{{$t('buttons.add')}}</div>
  </div>
</template>

<script>
import { connection, condition } from './filterSearchData.js'
export default {
  name: 'filterSearch',
  props: {
    valueList: Array,
    keyList: Array
  },
  data () {
    return {
      condition,
      connection,
      compareList: [],
      metaList: [],
      rule: [],
      meta: {
        meta: condition,
        name: '',
        nameIsEditing: false,
        oper: '',
        operIsEditing: false,
        value: '',
        valueIsEditing: false
      }
    }
  },
  mounted () {
    this.metaList = this.valueList.map(item => {
      return item
    })
  },
  methods: {
    // 新增条件
    addCondition (meta) {
      this.metaList.forEach(m => {
        this.nameIsEditing = false
        this.operIsEditing = false
        this.valueIsEditing = false
      })
      // 先判断上一个condition是否已填写完整，没有则删除；之后将当前所有meta的内容的isEditing置为false
      if (this.metaList.length > 0) {
        const prevMeta = this.metaList[this.metaList.length - 1]
        if (!(prevMeta.name && prevMeta.oper && prevMeta.value)) {
          this.metaList.splice(this.metaList.length - 1, 1)
        }
      }
      // 不是首个condition时，先增加一个connection，再增加一个新condition
      if (meta) {
        this.metaList.push(meta)
        this.$emit('metaList')
      } else {
        const self = this
        const newCondition = Object.assign({}, self.meta)
        newCondition.nameIsEditing = true
        this.metaList.push(newCondition)
        this.$forceUpdate()
        this.$emit('update:valueList', this.metaList)
        this.$emit('change')
        this.$nextTick(() => {
          this.$refs.columnSelect[0].focus()
        })
      }
    },
    removeCondition (index) {
      this.metaList.splice(index, 1)
      this.$emit('update:valueList', this.metaList)
      this.$emit('change')
    },
    columnBlur (meta, index, type) {
      setTimeout(() => {
        meta.name = meta.name.replace(/"/g, '')
        meta.nameIsEditing = false
        if (!meta.name) {
          this.metaList.splice(index, 1)
          this.$emit('update:valueList', this.metaList)
          this.$emit('change')
        }
      }, 200)
    },
    columnChange (meta, index) {
      meta.nameIsEditing = false
      const findTime = this.keyList.find(item => item.name === meta.name)
      this.compareList = findTime.opers
      this.rule = findTime.rule
      if (!meta.oper) {
        meta.operIsEditing = true
        this.$nextTick(() => {
          this.$refs.operSelect[0].focus()
        })
      }
      this.$emit('update:valueList', this.metaList)
      this.$emit('change')
    },
    columnClick (meta, index) {
      meta.nameIsEditing = true
      this.$nextTick(() => {
        this.$refs.columnSelect[0].focus()
      })
    },
    operBlur (meta, index, type) {
      setTimeout(() => {
        meta.operIsEditing = false
        if (!meta.oper && !meta.nameIsEditing) {
          this.metaList.splice(index, 1)
          this.$emit('update:valueList', this.metaList)
          this.$emit('change')
        }
      }, 200)
    },
    operChange (meta, index) {
      meta.operIsEditing = false
      if (!meta.value) {
        meta.valueIsEditing = true
        this.$nextTick(() => {
          this.$refs.valueInput[0].focus()
        })
      }
      this.$emit('update:valueList', this.metaList)
      this.$emit('change')
    },
    operatorClick (meta, index) {
      meta.operIsEditing = true
      this.compareList = this.keyList.find(item => item.name === meta.name).opers
      this.$nextTick(() => {
        this.$refs.operSelect[0].focus()
      })
    },
    valueEnter (meta, index) {
      console.log(123)
      meta.valueIsEditing = false
      for (let i = 0; i < this.rule.length; i++) {
        const item = this.rule[i]
        const reg = new RegExp(item.regex)
        if (!reg.test(meta.value)) {
          meta.value = ''
          // this.$message.error(this.$t('FILTER_PROJECT_IS_NULL'))
          break
        }
      }
      this.$emit('update:valueList', this.metaList)
      this.$emit('change')
    },
    valueBlur (meta, index, type) {
      console.log(456)
      meta.valueIsEditing = false
      for (let i = 0; i < this.rule.length; i++) {
        const item = this.rule[i]
        const reg = new RegExp(item.regex)
        if (!reg.test(meta.value)) {
          meta.value = ''
          this.$message.error(this.$t('FILTER_PROJECT_IS_NULL'))
          break
        }
      }
      this.$emit('update:valueList', this.metaList)
      this.$emit('change')
    },
    valueClick (meta, index) {
      meta.valueIsEditing = true
      this.$nextTick(() => {
        this.$refs.valueInput[0].focus()
      })
    }
  }
}
</script>

<style scoped>

</style>
