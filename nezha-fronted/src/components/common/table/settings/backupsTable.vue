<template>
<div class="backups-table">
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
          {{ tableData[0].schedule && utcTimeToTimezoneStr(tableData[0].schedule.stime) ?utcTimeToTimezoneStr(tableData[0].schedule.stime):'' }}
        </span>
        <span v-if="item.prop === 'state'">
          <el-switch class="switch" v-model="tableData[0].state" disabled> </el-switch>
        </span>
        <span v-if="item.prop === 'time'">
          {{ scope.row.time ? changeDate(scope.row.time ) : "" }}
        </span>
        <span v-if="item.prop === 'size'">
          {{ scope.row.size ? getNum(scope.row.size) : "" }}
        </span>
        <span v-if="item.prop === 'fileName'"> {{ scope.row.fileName }} </span>
      </template>
    </el-table-column>
    <el-table-column :resizable="false" fixed="right" 
    width="165px"
    >
      <div
        slot-scope="scope"
        class="table-operation-items"
        v-if="isConfigurations"
      >
        <button class="table-operation-button" @click="backupNow(scope.row)">
          {{$t('backup.backupNow')}}
        </button>
        <button class="table-operation-edit" @click="edit(scope.row)">
         <i class="nz-icon-gear nz-icon"></i>
        </button>
      </div>

      <div slot-scope="scope" v-else class="table-operation-items">
        <button class="table-operation-button" @click="Restore(scope.row)">
          {{$t('backup.Restore')}}
        </button>
        <button class="table-operation-edit" @click="del(scope.row)">
          <i class="nz-icon nz-icon-delete" style="font-size='12px'"></i>
        </button>
      </div>
    </el-table-column>
  </el-table>
</div>
</template>

<script>
import { get, post ,put} from '@/http'
import lodash from 'lodash'
import bus from '@/libs/bus'


export default {
  name: 'backupsTable',
  mixins: [],

  props: {
    loading: Boolean,
    customTableTitle: Array,
    isConfigurations: Boolean,
  },
  data () {
    return {
        
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
  },

  methods: {
      Restore(row){
          put('/sys/backup/restore',{filename:row.fileName}).then(res=>{
            if(res.code == 200){
                this.getTableData('backup')
            }
        })
      },
      del(item){
          console.log(item);
      },
      changeDate(item){
          let time =Date.parse(item)
          let time1 = this.timeFormate(time)
          return time1
      },
      getNum(item){
          return bus.getNumStr(item)
      },
    async getTableData (item) {
        if(!item){
            await get('/sys/backup').then((res) => {
              if (res.code === 200) {
                if (res.data) {
                  this.tableData[0].retention = res.data.retention
                  this.tableData[0].state = res.data.state == 1? true :false
                  for (const i in res.data.schedule) {
                    this.tableData[0].schedule[i] = res.data.schedule[i]
                  }
                }
              }
            })
            await post('/sys/backup/list').then((res) => {
              if (res.code === 200) {
                if (res.data) {
                    this.tableData2 = res.data
                    
                }
              }
            })
        }else if(item == 'backup'){
             get('/sys/backup').then((res) => {
              if (res.code === 200) {
                if (res.data) {
                  this.tableData[0].retention = res.data.retention
                  this.tableData[0].state = res.data.state == 1? true :false
                  for (const i in res.data.schedule) {
                    this.tableData[0].schedule[i] = res.data.schedule[i]
                  }
                }
              }
            })
      this.$forceUpdate();

        }else if(item == 'recent'){
             post('/sys/backup/list').then((res) => {
              if (res.code === 200) {
                if (res.data) {
                    this.tableData2 = res.data
                    
                }
              }
            })
      this.$forceUpdate();

        }
    },
    backupNow (item) {
      post('/sys/backup').then((res) => {
        console.log(res)
      })
    },
    edit () {
          this.$emit('edit', this.tableData[0])
    }
  },

  watch: {
  }
}
</script>
<style lang='' scoped>
</style>
