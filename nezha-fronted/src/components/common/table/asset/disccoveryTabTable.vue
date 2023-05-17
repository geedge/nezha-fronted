<template>
  <div style="height: 100%">
    <el-table
      id="userTable"
      ref="dataTable"
      class="user-table"
      :data="tableData"
      :height="height"
      border
      :default-sort="orderBy"
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
          <span class="data-column__span" :class="{'margin-l-10': item.prop === 'name'}">{{item.label}}</span>
          <div class="col-resize-area"></div>
        </template>
        <template slot-scope="scope" :column="item">
          <template v-if="item.prop === 'ip'">
            <copy :copyData='scope.row.ip' :showInfo='scope.row.ip'>
              <template slot="copy-text">
                {{scope.row ? scope.row.ip : '-'}}
              </template>
            </copy>
          </template>
          <template v-else-if="item.prop === 'dc'">
            <div>{{scope.row[item.prop] ? scope.row[item.prop].name : '-'}}</div>
          </template>
          <template v-else-if="item.prop === 'model'">
            <div>{{scope.row[item.prop] ? scope.row[item.prop].name : '-'}}</div>
          </template>
          <template v-else-if="item.prop === 'state'">
            <div>{{typeToStr(scope.row[item.prop])}}</div>
          </template>
          <template v-else-if="item.prop === 'imported'">
            <span v-if="scope.row[item.prop] == 1">{{$t('tip.yes')}}</span>
            <span v-else>{{$t('tip.no')}}</span>
          </template>
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
          <button class="table-operation-item" @click="tableOperation(['uploadAsset', scope.row])" :title="$t('overall.upload')"><i class="nz-icon nz-icon-Upload1"></i></button>
        </div>
      </el-table-column>
      <template slot="empty">
        <div  v-if="!loading" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
    </el-table>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
import copy from '@/components/common/copy'

export default {
  name: 'disccoveryTabTable',
  mixins: [table],
  components: { copy },
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: 'IP',
          prop: 'ip',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('asset.hostName'),
          prop: 'sysName',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        },
        {
          label: this.$t('overall.dc'),
          prop: 'dc',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('overall.type'),
          prop: 'state',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('asset.model'),
          prop: 'model',
          show: true,
          minWidth: 200
        }, {
          label: this.$t('asset.objectID'),
          prop: 'sysObjectId',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('asset.imported'),
          prop: 'imported',
          show: true,
          minWidth: 150
        }
      ],
      mfaEnable: localStorage.getItem('nz-mfa-enable')
    }
  },
  methods: {
    typeToStr (type) {
      switch (type) {
        case 1:
          return 'Server'
      }
    }
  }
}
</script>

<style scoped>

</style>
