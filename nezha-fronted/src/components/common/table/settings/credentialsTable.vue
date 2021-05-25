<template>
  <el-table
    id="credentialTable"
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
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'id'">
          <template v-if="scope.row.id">
            {{scope.row.id}}
          </template>
          <template v-else>-</template>
        </template>
        <template v-if="item.prop === 'name'">
          <template v-if="scope.row.name">
            {{scope.row.name}}
          </template>
          <template v-else>-</template>
        </template>
        <template v-if="item.prop === 'type'">
          <template v-if="scope.row.type">
            {{$CONSTANTS.snmpProtocolTypes.find(t=>t.value == scope.row.type).label}}
          </template>
          <template v-else>-</template>
        </template>
        <template v-if="item.prop === 'port'">
          <template v-if="scope.row.port">
            {{scope.row.port}}
          </template>
          <template v-else>-</template>
        </template>
        <template v-if="item.prop === 'remark'">
          <template v-if="scope.row.remark">
            {{scope.row.remark}}
          </template>
          <template v-else>-</template>
        </template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" v-has="'credential_edit'" @click="tableOperation(['edit', scope.row])"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" v-has="['credential_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-has="'credential_delete'" :command="['delete', scope.row]" :disabled="isBuiltIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'credentialsTable',
  mixins: [table],
  data () {
    return {
      tableTitle: [{
        label: 'ID',
        prop: 'id',
        show: true,
        width: 80,
        sortable:'custom'
      }, {
        label: this.$t('overall.name'),
        prop: 'name',
        show: true,
        sortable:'custom'
      }, {
        label: this.$t('config.mib.credential.type'),
        prop: 'type',
        show: true,
        sortable:'custom'
      }, {
        label: this.$t('config.mib.credential.port'),
        prop: 'port',
        show: true
      }, {
        label: this.$t('config.mib.credential.remark'),
        prop: 'remark',
        show: true
      }]
    }
  }
}
</script>

<style scoped>

</style>
