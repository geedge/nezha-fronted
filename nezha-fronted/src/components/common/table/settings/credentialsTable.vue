<template>
  <el-table
    id="credentialTable"
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
        <template v-if="item.prop === 'id'">
          <template v-if="scope.row.id">
            {{scope.row.id}}
          </template>
          <template v-else>-</template>
        </template>
        <template v-if="item.prop === 'name'">
          <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
              </copy>
        </template>
        <template v-if="item.prop === 'type'">
          <template v-if="scope.row.type">
            {{$t($CONSTANTS.snmpProtocolTypes.find(t=>t.value == scope.row.type).label)}}
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
        <button class="table-operation-item" v-has="'credential_edit'" @click="tableOperation(['edit', scope.row])" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
        <el-dropdown size="medium" v-has="['credential_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <!-- <el-dropdown-item v-has="'credential_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item> -->
            <el-dropdown-item v-has="'credential_delete'" :command="['delete', scope.row]" :class="'nz-el-dropdown-menu-item'">
                  <delete-button
                  ref="deleteButton"
                  :from="'credentials'"
                  :forceDeleteShow="false"
                  :type="'link'"
                  :title="$t('overall.delete')"
                  id="mib-list-delete"
                  v-has="'credential_delete'"
                  :api="api"
                  :single="true"
                  :delete-objs="singleDelete"
                  @before="delFlag=true"
                  ></delete-button>
              </el-dropdown-item>
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
  name: 'credentialsTable',
  props: {
    loading: Boolean
  },
  components: { deleteButton, copy },
  mixins: [table],
  data () {
    return {
      tableTitle: [{
        label: 'ID',
        prop: 'id',
        show: true,
        width: 80,
        sortable: 'custom'
      }, {
        label: this.$t('overall.name'),
        prop: 'name',
        show: true,
        minWidth: 100,
        sortable: 'custom'
      }, {
        label: this.$t('config.mib.credential.type'),
        prop: 'type',
        show: true,
        minWidth: 160,
        sortable: 'custom'
      }, {
        label: this.$t('asset.port'),
        prop: 'port',
        show: true
      }, {
        label: this.$t('overall.remark'),
        prop: 'remark',
        minWidth: 160,
        show: true
      }]
    }
  }
}
</script>

<style scoped>

</style>
