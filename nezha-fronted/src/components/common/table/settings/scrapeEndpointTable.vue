<template>
  <el-table
  id="roleTable"
  ref="dataTable"
  :data="currentTableData"
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
      <span class="data-column__span">{{item.label}}</span>
      <div class="col-resize-area"></div>
    </template>
    <template slot-scope="scope" :column="item">
      <template v-if="item.prop === 'endpoint'">{{scope.row.discoveredLabels.endpoint}}</template>
      <template v-else-if="item.prop === 'labels'" class="labels">
          <span v-for="(item, i) in labelsSort(scope.row.labels)" :key="i">
            <div> {{scope.row[item.prop]}}</div>
            <span
              @mouseenter="labelHover(scope.row, item.label, true, $event)"
              @mouseleave="labelHover(scope.row, item.label, false)">
              <nz-alert-tag
                v-if="item.label !== 'alertname' && item.label !== 'severity'" :key="item.label" :cursor-point="tagType(item.label) !== 'info'"
                :label="item.label"
                :type="tagType(item.label)"
                style="margin: 5px 0 5px 5px;"
              >
               {{item.value}}
              </nz-alert-tag>
            </span>
            <alertLabel
              v-if="(item.label === 'asset' ||item.label === 'module' || item.label === 'project' || item.label === 'dc' ||item.label === 'endpoint' ||item.label === 'cpu' ||item.label === 'user' ||item.label === 'parent_asset') && scope.row[item.label] && scope.row[item.label].loading"
              :id="scope.row[item.label].id"
              :that="scope.row[item.label]"
              :type="item.label"
            ></alertLabel>
          </span>
      </template>
      <template v-else-if="item.prop === 'health'">
         <div slot="reference" v-if="scope.row[item.prop] === 'up'">
              <div class="active-icon green-bg inline-block"></div>UP
          </div>
          <div slot="reference" v-else-if="scope.row[item.prop] === 'down'">
            <div class="active-icon gray-bg inline-block"></div>DOWN
          </div>
      </template>
      <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
      <template v-else>-</template>
    </template>
  </el-table-column>
  <template  slot="empty">
    <div v-if="!loading" class="table-no-data">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#nz-icon-no-data-list"></use>
      </svg>
      <div class="table-no-data__title">No results found</div>
    </div>
    <div v-else>&nbsp;</div>
  </template>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
import { calcDurationByStringTimeB } from '@/components/common/js/tools'
import nzAlertTag from '@/components/page/alert/nzAlertTag'
import alertLabel from '@/components/common/alert/alertLabel'
export default {
  name: 'scrapeEndpointTab',
  props: {
    loading: Boolean,
    currentTableData: Array
  },
  mixins: [table],
  components: {
    nzAlertTag,
    alertLabel
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('config.scrapeEndpoint.endpoint'),
          prop: 'endpoint',
          show: true
        }, {
          label: this.$t('config.scrapeEndpoint.labels'),
          prop: 'labels',
          NotSet: true,
          show: true
        }, {
          label: this.$t('config.scrapeEndpoint.lastScrape'),
          prop: 'lastScrape',
          show: true
        }, {
          label: this.$t('config.scrapeEndpoint.scrapeDuration'),
          prop: 'lastScrapeDuration',
          show: true
        }, {
          label: this.$t('config.scrapeEndpoint.state'),
          prop: 'health',
          show: true
        }, {
          label: this.$t('config.scrapeEndpoint.error'),
          prop: 'lastError',
          show: true
        }
      ],
      exclusiveLabels: ['_id', 'severity', '__name__']
    }
  },
  computed: {
    tagType () {
      return (key) => {
        if (key == 'asset' || key == 'module' || key == 'project' || key == 'dc' || key == 'endpoint') {
          return 'normal'
        } else {
          return 'info'
        }
      }
    }
  },
  methods: {
    labelsSort (obj) {
      const buildIn = ['asset', 'endpoint', 'module', 'cpu', 'datacenter', 'project', 'parent_asset', 'user']
      if (typeof obj === 'string') obj = JSON.parse(obj)
      const labels = JSON.parse(JSON.stringify(obj))
      const result = []
      for (const key of this.exclusiveLabels) {
        Object.keys(labels).forEach(labelsKey => {
          if (labelsKey.indexOf(key) !== -1) {
            delete labels[labelsKey]
          }
        })
      }
      for (const key of buildIn) {
        if (key in labels) {
          if (key === 'datacenter') {
            result.push({ label: 'dc', value: labels.datacenter })
            delete labels.datacenter
          } else {
            result.push({ label: key, value: labels[key] })
          }
          delete labels[key]
        }
      }
      Object.keys(labels).sort().forEach(key => {
        result.push({ label: key, value: labels[key] })
        delete labels[key]
      })
      return result
    },
    // label tooltip是否显示
    labelToolTipDis (labelType) {
      switch (labelType) {
        case 'asset':
        case 'module':
        case 'endpoint':
        case 'project':
        case 'dc':
          return false
        default: return true
      }
    },
    // label 鼠标划入
    labelHover (item, type, loading, e) {
      if (this.labelToolTipDis(type)) {
        return
      }
      console.log(item, type, loading, e,type + '_id')
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        console.log(type)
        this.$set(item[type], 'position', position)
      }
      this.$set(item[type], 'loading', loading)
    }
  },
  mounted () {
  }
}
</script>
