<template>
  <div>
    <div v-if="type==='text'">
      <el-input v-model="inputValue" size="small" maxlength="128"/>
    </div>
    <div v-else-if="type==='multitext'">
      <el-row v-for="(item, index) in inputArr" :key="index" style="margin-bottom: 10px">
        <el-col :span="20"><el-input v-model="item.value"  size="small" maxlength="128"/></el-col>
        <el-col :span="2" style="text-align: center">
        <span class="nz-icon-minus-medium" :title="$t('overall.delete')">
          <i @click="deleteInput(index)" class="nz-icon nz-icon-minus"></i>
        </span>
        </el-col>
        <el-col :span="2" style="text-align: center">
          <span v-if=" index=== inputArr.length-1" @click="addInput" style="display: inline-block;">
      <span class="create-square-box" :title="$t('tip.add')">
        <i style="font-size: 17px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i>
      </span>
    </span>
        </el-col>
      </el-row>
    </div>
    <div v-else-if="type==='textarea'">
      <el-input v-model="inputValue" size="small" type="textarea" show-word-limit maxlength="512" :rows="2"/>
    </div>
    <div v-else-if="type==='radio'">
      <el-radio-group v-model="optionValue" >
        <el-radio v-for="(item,index) in option.items" :label="item.name" :key="index">{{item.name}}</el-radio>
      </el-radio-group>
    </div>
    <div v-else-if="type==='checkbox'">
      <el-checkbox-group v-model="checkOption" >
        <el-checkbox  v-for="(item,index) in option.items" :label="item.name" :key="index">{{item.name}}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div v-else-if="type==='select'">
      <el-select v-model="optionValue" :popper-append-to-body="false" size="small">
        <el-option  v-for="(item,index) in option.items" :label="item.name" :value="item.name" :key="index"></el-option>
      </el-select>
    </div>
    <div v-else-if="type==='integer'">
      <el-input-number v-model="inputValue" size="small" maxlength="64" :controls="false"></el-input-number>
    </div>
    <div v-else-if="type==='double'">
      <el-input-number  v-model="inputValue" size="small" :precision="param.decimals" :controls="false"></el-input-number>
    </div>
    <div v-else-if="type==='datetime'">
      <div v-if="param.subType==='date'">
        <my-date-picker
          size="small"
          :type="param.interval?'daterange':'date'"
          :range-separator="$t('dashboard.dashboard.to')"
          :placeholder="$t('alert.silence.selectTime')"
          :start-placeholder="$t('overall.startTime')"
          :end-placeholder="$t('overall.endTime')"
          :value-format="timeFormatStrToDatePickFormat(timeFormatMain)"
          :format="timeFormatStrToDatePickFormat(timeFormatMain)"
        >
        </my-date-picker>
      </div>
      <div v-if="param.subType==='time'">
        <el-time-picker
          size="small"
          :is-range="param.interval"
          :range-separator="$t('dashboard.dashboard.to')"
          :placeholder="$t('alert.silence.selectTime')"
          :start-placeholder="$t('overall.startTime')"
          :end-placeholder="$t('overall.endTime')"
        >
        </el-time-picker>
      </div>
      <div v-if="param.subType==='datetime'">
        <my-date-picker
          size="small"
          :type="param.interval?'datetimerange':'datetime'"
          :range-separator="$t('dashboard.dashboard.to')"
          :placeholder="$t('alert.silence.selectTime')"
          :start-placeholder="$t('overall.startTime')"
          :end-placeholder="$t('overall.endTime')"
          :value-format="timeFormatStrToDatePickFormat(timeFormatMain)"
          :format="timeFormatStrToDatePickFormat(timeFormatMain)">
        </my-date-picker>
      </div>
    </div>
    <div v-else-if="type==='email'" :class="emailError?'emailError':''">
      <el-input v-model="inputValue" size="small" @blur="emailChange"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'assetTagEx',
  props: {
    type: {},
    option: {
      type: Object,
      default: () => {
        return {
          items: [{ name: 'option 1', check: true }, { name: 'option 2', check: false }]
        }
      }
    },
    param: {
      type: Object
    },
    value: {}
  },
  components: {},
  data () {
    return {
      inputArr: [{ value: '' }],
      optionValue: '',
      checkOption: [],
      daterange: [],
      date: null,
      emailError: false,
      inputValue: ''
    }
  },
  watch: {
    option: {
      immediate: true,
      handler (n) {
        if (n) {
          if (this.type === 'radio' || this.type === 'select') {
            n.items.forEach(item => {
              if (item.check) {
                this.optionValue = item.name
              }
            })
          } else if (this.type === 'checkbox') {
            n.items.forEach(item => {
              if (item.check) {
                this.checkOption.push(item.name)
              }
            })
          }
        }
      }
    },
    param: {
      immediate: true,
      deep: true,
      handler (n) {
        if (this.type === 'datetime') {
        }
      }
    }
  },
  mounted () {},
  methods: {
    addInput () {
      this.inputArr.push({ value: '' })
    },
    deleteInput (index) {
      if (this.inputArr.length <= 1) {
        this.$message.error(this.$t('config.assetMeta.onlyOptionError'))
        return
      }
      this.inputArr.splice(index, 1)
    },
    emailChange () {
      const reg = /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/
      this.emailError = !reg.test(this.inputValue)
    }
  }
}
</script>

<style scoped>
.emailError /deep/ .el-input__inner{
  border-color: #F56C6C;
}
</style>
