<template>
  <el-table
    :data="tableData">
    <el-table-column
      :resizable="false"
      align="center"
      type="selection"
      width="55">
    </el-table-column>
    <el-table-column v-for="item in tableData" :label="item.label" :key="item.id" :prop="item.prop">
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'profileTable',
  data () {
    return {
      tableData: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.name'),
          prop: 'name',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.gname'),
          prop: 'gname',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.expression'),
          prop: 'expression',
          show: true
        },
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.name'),
          prop: 'name',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.gname'),
          prop: 'gname',
          show: true,
          sortable: 'custom'
        }, {
          label: this.$t('config.exprTemp.expression'),
          prop: 'expression',
          show: true
        }
      ]
    }
  }
}
</script>
