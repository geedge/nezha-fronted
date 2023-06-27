<template>
  <span style="position: relative">
    <el-select
      id="module-box-logs-pipeline-type"
      class="right-box__select right-box__select-pipeline"
      placeholder=""
      popper-class="right-box-select-top prevent-clickoutside pipeline"
      size="small"
      ref="select"
      v-model="pipelineOptionValue"
      @change="(val)=>{addPipeline(val)}"
      style="width: 0;height: 0;opacity: 0;z-index: -1">
      <el-option-group
        v-for="group in option"
        :key="group.label"
        :label="group.label">
        <el-option
          v-for="item in group.pipelineOption"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-option-group>
    </el-select>
    <i class="nz-icon nz-icon-plus" @click="addPipelineShow" :title="$t('tip.add')" style="top: 2px"></i>
  </span>
</template>

<script>
export default {
  name: 'pepelineSelect',
  props: {
    fatherPipeline: {
      type: Array
    },
    index: {
      type: Number
    },
    type: {
      type: String
    }
  },
  data () {
    return {
      pipelineOption: [
        {
          label: 'Parsing stages',
          pipelineOption: [
            {
              value: 'regex',
              label: 'Regex'
            }, {
              value: 'json',
              label: 'Json'
            }
          ]
        },
        {
          label: 'Transform stages',
          pipelineOption: [
            {
              value: 'template',
              label: 'Template'
            }
          ]
        },
        {
          label: 'Action stages',
          pipelineOption: [
            {
              value: 'timestamp',
              label: 'Timestamp'
            },
            {
              value: 'labels',
              label: 'Labels'
            },
            {
              value: 'output',
              label: 'Output'
            }
          ]
        }],
      option: [],
      pipelineOptionValue: ''
    }
  },
  watch: {
    fatherPipeline: {
      deep: true,
      immediate: true,
      handler (n) { // 共6种添加的情况 0-0 0-1 0-2 1-1 1-2 2-2
        const prev = n[this.index - 1]
        const now = n[this.index]
        if (!now) {
          this.option = this.pipelineOption
        }
        const prevTypeIndex = this.getTypeindex(prev)
        const nowTypeIndex = this.getTypeindex(now)
        if (this.type === 'push') { // 向后添加
          if (nowTypeIndex === 0) {
            this.option = [...this.pipelineOption]
          } else if (nowTypeIndex === 1) {
            this.option = [this.pipelineOption[1], this.pipelineOption[2]]
          } else if (nowTypeIndex === 2) {
            this.option = [this.pipelineOption[2]]
          }
        } else if (this.type === 'splice') {
          if (prevTypeIndex === nowTypeIndex) { // 判断为0-0 1-1 2-2的情况
            this.option = [this.pipelineOption[nowTypeIndex]]
          } else
          if (prevTypeIndex === 0 && nowTypeIndex === 2) { // 判断为0-2的情况
            this.option = [...this.pipelineOption]
          } else { // 判断为0-1 1-2的情况
            this.option = [this.pipelineOption[prevTypeIndex], this.pipelineOption[nowTypeIndex]]
          }
        }
      }
    }
  },
  methods: {
    addPipeline (val) {
      let obj = ''
      this.pipelineOptionValue = ''
      if (val === 'regex') {
        obj = {
          type: 'regex',
          expression: '',
          source: ''
        }
      } else if (val === 'json') {
        obj = {
          type: 'json',
          expressions: [
            {
              key: '',
              value: ''
            }
          ],
          source: ''
        }
      } else if (val === 'template') {
        obj = {
          type: 'template',
          template: '',
          source: ''
        }
      } else if (val === 'timestamp') {
        obj = {
          type: 'timestamp',
          format: '',
          source: ''
        }
      } else if (val === 'labels') {
        obj = {
          type: 'labels',
          labels: [{ key: '', value: '' }]
        }
      } else if (val === 'output') {
        obj = {
          type: 'output',
          source: ''
        }
      }
      this.$emit('addPipeline', this.index, obj)
    },
    addPipelineShow () {
      this.$refs.select.visible = true
    },
    getTypeindex (item) {
      if (!item || item.type === 'regex' || item.type === 'json') {
        return 0
      }
      if (item.type === 'template') {
        return 1
      }
      if (item.type === 'timestamp' || item.type === 'labels' || item.type === 'output') {
        return 2
      }
    }
  }
}
</script>
