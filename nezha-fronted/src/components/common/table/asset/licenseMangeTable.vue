<template>
  <div style="height: 100%">
    <el-table
      id="softwareTypeTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
      :default-sort="orderBy"
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      @row-dblclick="(row)=>{}"
    >
      <el-table-column
        :resizable="false"
        align="center"
        type="expand"
        width="55">
        <template slot-scope="scope">
          <div class="license-mange-expand" style="" v-if="scope.row.sessions.length">
            <div v-for="(item,index) in scope.row.sessions" :key="index" class="license-mange-expand-item">
              {{item}}
            </div>
          </div>
          <div v-else class="table-no-data" style="text-align: center;padding: 10px;box-sizing: border-box;">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#nz-icon-no-data-list"></use>
            </svg>
            <div class="table-no-data__title">No results found</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item, index) in customTableTitle"
        v-if="item.show"
        :key="`col-${index}-${item.prop}`"
        :fixed="item.fixed"
        :label="item.label"
        :min-width="`${item.minWidth}`"
        :prop="item.prop"
        :resizable="true"
        :sort-orders="['ascending', 'descending']"
        :sortable="item.sortable"
        :width="`${item.width}`"
      >
        <template slot="header">
          <span class="data-column__span">{{item.label}}</span>
          <div class="col-resize-area"></div>
        </template>
        <template slot-scope="scope" :column="item">
          <template v-if="item.prop === 'name' || item.prop === 'typename'">
            <div class="document-copy-block">
              <span class="document-copy-text" :title="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <i v-if="scope.row[item.prop]" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row.name)" :title="$t('overall.copyText')"></i>
            </div>
          </template>
          <template v-else-if="item.prop === 'category'">
            <div>
              {{scope.row.type ? scope.row.type.category : '-'}}
            </div>
          </template>
          <template v-else-if="item.prop === 'loginlimit'">
            <div v-if="scope.row.loginlimit">
              {{scope.row.loginlimit == -1 ? '∞': scope.row.loginlimit}}
            </div>
            <div v-else>
              '-'
            </div>
          </template>
          <span v-else-if="item.prop === 'production_date' || item.prop === 'expiration_date'">{{ scope.row[item.prop] ? momentTz(scope.row[item.prop] * 1000) : '-'}}</span>
          <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        :resizable="false"
        :width="operationWidth"
        fixed="right">
        <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
        <div slot-scope="scope" class="table-operation-items">
          <!-- <button class="table-operation-item" v-has="'softwareAsset_edit'" @click="$emit('edit', scope.row)" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button> -->
          <button class="table-operation-item" @click="exportLicense(scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-download1"></i></button>
        </div>
      </el-table-column>
      <template slot="empty">
        <div v-if="!loading" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
    </el-table>
    <alertLabel
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :type="alertLabelType"
    ></alertLabel>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
import copy from '@/components/common/copy'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
export default {
  name: 'licenseMangeTable',
  mixins: [table, alertLabelMixin],
  components: { copy },
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: this.$t('licenseMange.product'),
          prop: 'name',
          show: true,
          width: 350
          // sortable: 'custom'
        }, {
          label: this.$t('licenseMange.keyType'),
          prop: 'typename',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('licenseMange.keyId'),
          prop: 'haspid',
          show: true,
          width: 350
        }, {
          label: this.$t('licenseMange.dateIssue'),
          prop: 'production_date',
          show: true,
          minWidth: 200
        },
        {
          label: this.$t('licenseMange.dateExpire'),
          prop: 'expiration_date',
          minWidth: 200,
          show: true
        },
        {
          label: this.$t('licenseMange.concurrency'),
          prop: 'loginlimit',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('licenseMange.logins'),
          prop: 'logincount',
          minWidth: 200,
          show: true
        }
      ]
    }
  },
  methods: {
    copyValue (item) {
      const str = item
      this.$copyText(JSON.stringify(str)).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    },
    exportLicense (row) {
      this.$emit('export', { haspid: row.haspid, name: row.name + '.c2v' })
    }
  },
  created () {
  },
  computed: {

  }
}
</script>
