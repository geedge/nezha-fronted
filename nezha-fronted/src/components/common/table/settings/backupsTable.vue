<template>
  <el-table :data="isConfigurations ? tableData : tableData2" border>
    <el-table-column
      class="table-column__head"
      v-for="(item, index) in customTableTitle"
      :key="`col-${index}`"
      :label="item.label"
      :prop="item.prop"
      :resizable="true"
    >
      <template slot="header">
        <span class="data-column__span">{{ item.label }}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <span v-if="item.prop === 'repeat'">
          {{ tableData[0].schedule && tableData[0].schedule.repeat }}
        </span>
        <span v-if="item.prop === 'retention'">
          {{ tableData[0].retention }}
        </span>
        <span v-if="item.prop === 'last'">
          {{ tableData[0].schedule && utcTimeToTimezoneStr(tableData[0].schedule.stime) }}
        </span>
        <span v-if="item.prop === 'state'">
          <el-switch class="switch" v-model="switchStatus"> </el-switch>
        </span>
        <span v-if="item.prop === 'time'">
          {{ scope.row.time ? scope.row.time : "-" }}
        </span>
        <span v-if="item.prop === 'size'">
          {{ scope.row.size ? scope.row.size : "" }}
        </span>
        <span v-if="item.prop === 'fileName'"> {{ scope.row.fileName }} </span>
      </template>
    </el-table-column>
    <el-table-column :resizable="false" fixed="right">
      <div
        slot-scope="scope"
        class="table-operation-items"
        v-if="isConfigurations"
      >
        <button class="table-operation-button" @click="backupNow(scope.row)">
          backup now
        </button>
        <el-dropdown size="medium" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu
            slot="dropdown"
            class="right-box-select-top right-public-box-dropdown-top"
          >
            <el-dropdown-item command="edit"
              ><i class="nz-icon nz-icon-edit"></i
              ><span class="operation-dropdown-text">{{
                $t("overall.edit")
              }}</span></el-dropdown-item
            >
            <el-dropdown-item @click="tableOperation('del', scope.row)"
              ><i class="nz-icon nz-icon-delete"></i
              ><span class="operation-dropdown-text">{{
                $t("overall.delete")
              }}</span></el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div slot-scope="scope" v-else class="table-operation-items">
        <button class="table-operation-button" @click="Restore(scope.row)">
          Restore
        </button>
        <button class="table-operation-del" @click="del(scope.row)">
          <i class="nz-icon nz-icon-delete"></i>
        </button>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import { get, post } from '@/http'
import lodash from 'lodash'
import bus from '@/libs/bus'

export default {
  name: 'backupsTable',
  mixins: [],

  props: {
    loading: Boolean,
    customTableTitle: Array,
    isConfigurations: Boolean,
    isState: Boolean
  },
  data () {
    return {
      switchStatus: true,
      tableData: [
        {
          retention: '',
          state: '',
          schedule: {
            repeat: '',
            stime: '',
            type: '',
            nums: []
          }
        }
      ],
      tableData2: [
        {
          fileName: '',
          time: '',
          size: ''
        }
      ]
    }
  },

  components: {},

  computed: {},

  created () {},

  mounted () {
    this.getTableData()
    this.monitoring()
  },

  methods: {
    monitoring () {
      this.$on('getData', (res) => {
        console.log('getdata')
        this.getTableData()
        window.location.reload()
      })
    },
    async getTableData () {
      await get('/sys/backup').then((res) => {
        if (res.code === 200) {
          if (res.data) {
            this.tableData[0].retention = res.data.retention
            this.tableData[0].state = res.data.state
            this.switchStatus = res.data.state === 1
            for (const i in res.data.schedule) {
              this.tableData[0].schedule[i] = res.data.schedule[i]
            }
          }
        }
      })
      await post('/sys/backup/list').then((res) => {
        if (res.code === 200) {
          if (res.data) {
            for (const i in res.data) {
              this.tableData2[i].fileName = res.data[i].fileName
              this.tableData2[i].size = bus.getNumStr(res.data[i].size)
              this.tableData2[i].time = res.data[i].time
            }
          }
        }
      })
    },
    backupNow (item) {
      post('/sys/backup').then((res) => {
        console.log(res)
      })
    },
    tableOperation (command) {
      if (command) {
        if (command === 'edit') {
          this.$emit('edit', this.tableData[0])
        } else if (command === 'del') {
        }
      }
    }
  },

  watch: {
    isState: {
      deep: true,
      handler (n) {
        this.switchStatus = n
        this.tableData[0].state = n === true ? 1 : 0
      }
    },
    switchStatus: {
      deep: true,
      handler (n) {
        this.tableData[0].state = n === true ? 1 : 0
      }
    }
  }
}
</script>
<style lang='' scoped>
</style>
