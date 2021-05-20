<template>
  <el-table
    id="alertSilenceTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
  >
    <el-table-column
      :resizable="false"
      align="center"
      type="selection"
      width="55">
    </el-table-column>
    <el-table-column
      v-for="(item, index) in customTableTitle"
      v-if="item.show"
      :key="`col-${index}`"
      :fixed="item.fixed"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :sort-orders="['ascending', 'descending']"
      :sortable="item.sortable"
      :width="`${item.width}`"
      class="data-column"
    >
      <template slot="header">
        <span>{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'duration'">
          <el-tooltip :disabled="!scope.row.endAt" effect="light" placement="right">
            <div slot="content">
              {{$t('config.terminallog.endTime')}}<br/>
              {{utcTimeToTimezoneStr(scope.row.endAt)}}
            </div>
            <span>{{getDuration(scope.row)}}</span>
          </el-tooltip>
        </template>
        <template v-else-if="item.prop === 'matchers'">
<!--          <div class="nz-silence-tag-box">-->
<!--              <span v-if="scope.row.linkId!==-1" class="nz-silence-tag blue">-->
<!--              <span class="nz-silence-tag-title">{{scope.row.type}}</span>-->
<!--              <span :title="scope.row.linkName" class="nz-silence-tag-content">{{scope.row.linkName}}</span>-->
<!--            </span>-->
<!--            <span v-if="scope.row.ruleId!==-1" class="nz-silence-tag rule-gray">-->
<!--              <span class="nz-silence-tag-title">Alert rule</span>-->
<!--              <span :title="scope.row.ruleName" class="nz-silence-tag-content">{{scope.row.ruleName}}</span>-->
<!--            </span>-->
<!--          </div>-->
          <span v-for="(item1, i) in labelsSort(scope.row.matchers)" :key="i">
              <span >
                <nz-alert-tag
                  :key="i" :cursor-point="tagType(item1.name) !== 'info'"
                  :label="item1.name"
                  :type="tagType(item1.name)"
                  :regex="item1.regex"
                  style="margin: 5px 0 5px 5px;"
                >
                 {{item1.value}}
                </nz-alert-tag>
              </span>
            </span>
        </template>
        <template v-else-if="item.prop === 'state'">
          <span v-if="scope.row.state===1" class="silence-active">active</span>
          <span v-if="scope.row.state===2" class="silence-pending">pending</span>
          <span v-if="scope.row.state===3" class="silence-expired">expired</span>
        </template>
        <template v-else-if="item.prop === 'utime'">
          {{utcTimeToTimezoneStr(scope.row[item.prop])}}
        </template>
        <template v-else-if="item.prop === 'startAt'">
          {{utcTimeToTimezoneStr(scope.row[item.prop])}}
        </template>
        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop] || '-'}}</span>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" v-has="'alertSilence_edit'"  @click="$emit('edit', scope.row)"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" v-has="['alertSilence_expire']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
<!--            <el-dropdown-item :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>-->
            <el-dropdown-item v-has="'alertSilence_expire'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('buttons.expired')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
import { calcDurationByStringTimeB } from '@/components/common/js/tools'
import nzAlertTag from '../../../page/alert/nzAlertTag'
import { sameLabels } from '@/components/common/js/constants'
export default {
  name: 'alertSilenceTable',
  components: {
    nzAlertTag
  },
  mixins: [table],
  data () {
    return {
      /* 表格相关 */
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        },
        {
          label: this.$t('alert.silence.name'),
          prop: 'name',
          show: true,
          width: 150
        }, {
          label: this.$t('alert.silence.matchers'),
          prop: 'matchers',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('alert.silence.startTime'),
          prop: 'startAt',
          show: true,
          width: 300,
          sortable: 'custom'
        }, {
          label: this.$t('config.terminallog.duration'),
          prop: 'duration',
          show: true,
          width: 120
        }, {
          label: this.$t('alert.silence.remark'),
          prop: 'remark',
          show: true,
          width: 120
        }, {
          label: this.$t('alert.silence.upTime'),
          prop: 'utime',
          show: false,
          width: 120
        }, {
          label: this.$t('alert.silence.state'),
          prop: 'state',
          show: true,
          width: 120
        }
      ]
    }
  },
  computed: {
    getDuration () {
      return function (record) {
        if (record.endAt) {
          return calcDurationByStringTimeB(record.startAt, record.endAt)
        }
        return calcDurationByStringTimeB(record.startAt, this.utcTimeToTimezoneStr(this.nowTime))
      }
    },
    tagType () {
      return (key) => {
        if (sameLabels.find(item => item === key)) {
          return 'normal'
        } else {
          return 'info'
        }
      }
    }
  },
  methods: {
    labelsSort (obj) {
      obj = obj || []
      const buildIn = sameLabels
      if (typeof obj === 'string') obj = JSON.parse(obj)
      const labels = JSON.parse(JSON.stringify(obj))
      const result = []
      const result2 = []
      for (const key of buildIn) {
        labels.forEach(item => {
          if (item.name === key) {
            result.push(item)
          }
        })
      }
      labels.forEach(item => {
        if (buildIn.indexOf(item.name) === -1) {
          result2.push(item)
        }
      })
      console.log([...result, ...result2])
      return [...result, ...result2]
    }
  }
}
</script>
<style lang="scss" scoped>
.nz-silence-tag-box{
  width: 100%;
  height: 100%;
  .nz-silence-tag{
    /*float: left;*/
    /*margin-top: 5px;*/
  }
}
.nz-silence-tag{
  min-width: 80px;
  margin-right: 5px;
  border-radius: 4px;
  display: inline-flex;
  width: auto;
  height: 20px;
  line-height: 20px;
  .nz-silence-tag-title{
    color: #fff;
    text-align: center;
    padding: 0 5px;
  }
  .nz-silence-tag-content{
    padding: 0 10px;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }
}
.nz-silence-tag.blue{
  border: 1px solid #3C92F1;
  .nz-silence-tag-title{
    background: #3C92F1;
  }
}
.nz-silence-tag.rule-gray{
  border: 1px solid #7F8696;
  .nz-silence-tag-title{
    background: #7F8696;
  }
}

.silence-active{
  background: #E3F2D9;
  border-radius: 4px;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #0AB000;
  line-height: 14px;
  font-weight: 400;
  padding: 0 5px;
}
.silence-pending{
  background: #FFECD9;
  border-radius: 4px;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #FA901C;
  line-height: 20px;
  font-weight: 400;
  padding: 0 5px;
}
.silence-expired{
  background: #9e9c98;
  border-radius: 4px;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #ffffff;
  line-height: 14px;
  font-weight: 400;
  padding: 0 5px;
}
</style>
