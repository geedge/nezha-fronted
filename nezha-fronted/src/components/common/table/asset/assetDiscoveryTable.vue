<template>
  <el-table
    id="assetLabelTable"
    ref="dataTable"
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
        <div v-if="item.prop === 'name'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
        </div>
        <div v-else-if="item.prop === 'uts'">
          {{momentTz(scope.row[item.prop])}}
        </div>
        <div v-else-if="item.prop === 'snmpCredentialIds'">
          {{snmpCredentialIdToStr(scope.row[item.prop])}}
        </div>
        <div v-else-if="item.prop === 'schedule'">
          {{scheduleToStr(scope.row[item.prop])}}
        </div>
        <div v-else-if="item.prop === 'status'">
          <i class="nz-icon" :class="selectIcon(scope.row[item.prop])"/>
          {{statusToStr(scope.row[item.prop])}}
        </div>
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
<!--        <button class="table-operation-item" @click.stop><i class="nz-icon nz-icon-view1"></i></button>-->
        <button class="table-operation-item"  @click="$emit('showBottomBox', 'assetDiscoveryTab', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['asset_label_edit','asset_label_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'asset_label_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
<!--            <el-dropdown-item v-has="'asset_label_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>-->
            <el-dropdown-item v-has="'asset_label_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
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
import deleteButton from '@/components/common/deleteButton'
import copy from '@/components/common/copy'
export default {
  name: 'assetLabelTable',
  mixins: [table],
  components: { deleteButton, copy },
  props: {
    loading: Boolean
  },
  data () {
    return {
      credentialData: [],
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          minWidth: 250,
          sortable: 'custom'
        }, {
          label: this.$t('asset.ipSubnet'),
          prop: 'subnet',
          show: true,
          minWidth: 250,
          sortable: 'custom'
        }, {
          label: this.$t('config.mib.credentials'),
          prop: 'snmpCredentialIds',
          show: true,
          minWidth: 250,
          sortable: 'custom'
        }, {
          label: this.$t('alert.config.schedEnable'),
          prop: 'schedule',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('asset.lastExecuteTime'),
          prop: 'uts',
          show: true,
          minWidth: 250,
          sortable: 'custom'
        }, {
          label: this.$t('config.terminallog.duration'),
          prop: 'duration',
          show: true,
          minWidth: 160,
          sortable: 'custom'
        }, {
          label: this.$t('overall.state'),
          prop: 'status',
          show: true,
          minWidth: 250,
          sortable: 'custom'
        }, {
          label: this.$t('asset.discoveryHosts'),
          prop: 'total',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }
      ]
    }
  },
  created () {
    this.getCredentialData()
  },
  methods: {
    getCredentialData () {
      this.$get('snmp/credential', { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.credentialData = response.data.list
        }
      })
    },
    snmpCredentialIdToStr (str) {
      const arr = str.split(',')
      let retrunStr = ''
      arr.forEach(item => {
        const findItem = this.credentialData.find(credential => credential.id == item)
        if (findItem) {
          retrunStr += findItem.name + ','
        }
      })
      retrunStr = retrunStr.substr(0, retrunStr.length - 1)
      return retrunStr
    },
    scheduleToStr (schedule) {
      if (!schedule || !schedule.type) {
        return '-'
      } else {
        switch (schedule.type) {
          case 1:
            return 'One time only'
          case 2:
            return 'Daily'
          case 3:
            return 'Weekly'
          case 4:
            return 'Monthly'
        }
      }
    },
    selectIcon (status) {
      switch (status) {
        case '1' :
          return 'nz-icon-over color999999'
        case '2' :
          return 'nz-icon-over color999999'
        case '3' :
          return 'nz-icon-over color999999'
        case '4' :
          return 'nz-icon-over colorEF7458'
        case '5' :
          return 'nz-icon-over color23BF9A'
      }
    },
    statusToStr (status) {
      switch (status) {
        case '1' :
          return 'Saving'
        case '2' :
          return 'Running'
        case '3' :
          return 'Scheduled'
        case '4' :
          return 'Failed'
        case '5' :
          return 'Finished'
      }
    }
  }
}
</script>
