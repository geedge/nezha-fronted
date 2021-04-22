<template>
  <el-table
    id="assetMetaTable"
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
      :width="`${item.width}`"
      class="data-column"
    >
      <template slot="header">
        <span>{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <div v-if="item.prop === 'group'">
          {{scope.row[item.prop] ? scope.row[item.prop].name : '-'}}
        </div>
        <div v-else-if=" item.prop === 'display' ">
          <el-switch
            v-model="scope.row[item.prop]"
            :active-value="1"
            :inactive-value="0"
            active-color="#ee9d3f"
            @change="putMeta(scope.row)">
          </el-switch>
        </div>
        <div v-else-if=" item.prop === 'search' ">
          <el-switch
            v-model="scope.row[item.prop]"
            :active-value="1"
            :inactive-value="0"
            active-color="#ee9d3f"
            @change="putMeta(scope.row)">
          </el-switch>
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
        <button class="table-operation-item" @click="$refs.dataList.showBottomBox('operationLog', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-has="'asset_label_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'asset_label_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
export default {
  name: 'roleTable',
  mixins: [table],
  data () {
    return {
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.assetMeta.name'),
          prop: 'name',
          show: true
        }, {
          label: this.$t('config.assetMeta.key'),
          prop: 'metaKey',
          show: true
        }, {
          label: this.$t('config.assetMeta.group'),
          prop: 'group',
          show: true
        }, {
          label: this.$t('config.assetMeta.search'),
          prop: 'search',
          show: true
        }, {
          label: this.$t('config.assetMeta.display'),
          prop: 'display',
          show: true
        }, {
          label: this.$t('config.assetMeta.type'),
          prop: 'type',
          show: true
        }, {
          label: this.$t('config.assetMeta.params'),
          prop: 'param',
          show: false
        }
      ]
    }
  },
  methods: {
    putMeta (row) {
      this.tools.loading = true
      this.$put('asset/field/meta', row).then(response => {
        this.prevent_opt.save = false
        if (response.code === 200) {
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(response.msg)
        }
        this.getTableData()
      })
    }
  }
}
</script>
