<template>
  <div class="system backup">
    <div class="system-config-form system-config-backup">
      <div class="system-title">{{ $t("backup.configurations") }}</div>
      <nz-data-list
        ref="dataList"
        id="modelTable"
        :data="tableData"
        border
        from="backups"
      >
        <template v-slot="slotProps">
          <backups-table
            ref="backupsTable1"
            :custom-table-title="customTableTitle"
            :is-configurations="true"
            :table-data="tableData"
            @edit="edit"
          >
          </backups-table>
        </template>
      </nz-data-list>
    </div>

    <div class="system-config-form system-config-backup">
      <div class="system-title">{{ $t("backup.recent") }}</div>
      <nz-data-list
        ref="dataList"
        id="modelTable"
        :data="tableData2"
        border
        from="backups"
      >
        <template v-slot="slotProps">
          <backups-table
            ref="backupsTable2"
            :custom-table-title="customTableTitle2"
            :is-configurations="false"
            key="backups2"
            :table-data2="tableData2"
            @getTableData="getTableData"
          >
          </backups-table>
        </template>
      </nz-data-list>
    </div>
    <transition name="right-box">
      <backups-box
        v-if="rightBoxshow"
        :obj="object"
        @close="closeRightBox"
        class="backup_box"
      ></backups-box>
    </transition>
  </div>
</template>

<script>
import nzDataList from '@/components/common/table/nzDataList'
import backupsTable from '@/components/common/table/settings/backupsTable'
import backupsBox from '@/components/common/rightBox/administration/backupsBox'
import bus from '@/libs/bus'

export default {
  name: 'backups',
  mixins: [],
  props: [''],
  data () {
    return {

      url: '/sys/backup',
      customTableTitle: [
        { label: this.$t('alert.config.schedEnable'), prop: 'schedule' },
        { label: this.$t('backup.backupRetention'), prop: 'retention' },
        { label: this.$t('overall.enabled'), prop: 'state' }
      ],
      customTableTitle2: [
        { label: this.$t('config.assetLabel.date'), prop: 'time', minwidth: 228 },
        { label: this.$t('backup.File'), prop: 'fileName', minwidth: 363 },
        { label: this.$t('backup.size'), prop: 'size', minwidth: 306 },
        { label: this.$t('overall.remark'), prop: 'Description', minwidth: 569 }
      ],
      tableData: [
        {
          retention: '',
          state: '',
          schedule: {}
        }
      ],
      tableData2: [
        // {
        //   list: {

        //   }
        // }
      ],
      rightBoxshow: false,
      isRefresh: ''
    }
  },
  provide () {
    return {
      getTableData: this.getTableData
    }
  },
  components: { nzDataList, backupsTable, backupsBox },

  computed: {},

  created () {},

  mounted () {
    this.getTableData()
    bus.$on('backupNow', this.getTableData)
  },

  methods: {

    getTableData (item) {
      if (!item) {
        this.$get('/sys/backup').then((res) => {
          if (res.code === 200) {
            if (res.data) {
              this.tableData[0].retention = res.data.retention
              this.tableData[0].state = res.data.state == 1
              for (const i in res.data.schedule) {
                this.tableData[0].schedule[i] = res.data.schedule[i]
              }
            }
          }
        })
        this.$get('/sys/backup/list').then((res) => {
          if (res.code === 200) {
            if (res.data) {
              this.tableData2 = res.data
            }
          }
        })
      } else if (item == 'backup') {
        this.$get('/sys/backup').then((res) => {
          if (res.code === 200) {
            if (res.data) {
              this.tableData[0].retention = res.data.retention
              this.tableData[0].state = res.data.state == 1
              for (const i in res.data.schedule) {
                this.tableData[0].schedule[i] = res.data.schedule[i]
              }
            }
          }
        })

        this.$get('/sys/backup/list').then((res) => {
          if (res.code === 200) {
            if (res.data) {
              this.tableData2 = res.data
            }
          }
        })
      } else if (item == 'recent') {
        this.$get('/sys/backup/list').then((res) => {
          if (res.code === 200) {
            if (res.data) {
              this.tableData2 = res.data
            } else {
              this.tableData2 = []
            }
          }
        })
      }
    },
    edit (row) {
      this.object = {
        ...this.$loadsh.cloneDeep(row),
        checkDay: '',
        checkDays: '',
        datepicker: ''
      }
      this.object.name = this.$t('backup.edit')
      if (this.object.schedule) {
        this.object.schedule.stime = this.utcTimeToTimezoneStr(this.object.schedule.stime, 'YYYY-MM-DD HH:mm:ss') || ''
        for (const i in this.object.schedule) {
          this.object[i] = this.object.schedule[i]
        }
      }
      this.rightBoxshow = true
    },
    closeRightBox (refresh) {
      if (refresh) {
        this.getTableData('backup')
      }
      this.rightBoxshow = false
    }
  },

  watch: {},
  beforeDestroy () {
    bus.$off('backupNow', this.getTableData)
  }
}
</script>
