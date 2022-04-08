<template>
  <div class="system">
    <div class="system-config-form system-config-backup">
      <div class="system-title">{{$t('backup.configurations')}}</div>
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
            :is-state ='isState'
            @edit="edit"
          >
          </backups-table>
        </template>
      </nz-data-list>
    </div>

    <div class="system-config-form system-config-backup">
      <div class="system-title">{{$t('backup.recent')}}</div>
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
          >
          </backups-table>
        </template>
      </nz-data-list>
    </div>
    <transition name="right-box">
      <backups-box v-if="rightBoxshow"  :obj="object" @close="closeRightBox" @statechange='statechange'></backups-box>
    </transition>
  </div>
</template>

<script>
import nzDataList from '@/components/common/table/nzDataList'
import backupsTable from '@/components/common/table/settings/backupsTable'
import backupsBox from '@/components/common/rightBox/administration/backupsBox'

export default {
  name: 'backups',
  mixins: [],
  props: [''],
  data () {
    return {

      url: '/sys/backup/list',
      customTableTitle: [
        { label: this.$t('backup.frequency'), prop: 'repeat' },
        { label: this.$t('backup.backupRetention'), prop: 'retention' },
        { label: this.$t('backup.last'), prop: 'last' },
        { label: this.$t('backup.Enable'), prop: 'state' }
      ],
      customTableTitle2: [
        { label: this.$t('backup.Date'), prop: 'time' },
        { label: this.$t('backup.File'), prop: 'fileName' },
        { label: this.$t('backup.size'), prop: 'size' },
        { label: this.$t('backup.Description'), prop: 'Description' }
      ],
      tableData: [
        {
          retention: '',
          state: '',
          schedule: {}
        }
      ],
      tableData2: [
        {
          list: {
              
          }
        }
      ],
      rightBoxshow: false,
      isState: '',
      isRefresh: ''
    }
  },

  components: { nzDataList, backupsTable, backupsBox },

  computed: {},

  created () {},

  mounted () {},

  methods: {
    edit (row) {
      this.object = { ...row ,
      checkDay:'',
      checkDays:'',
      datepicker:''
      }
      this.object.name = this.$t('backup.edit')
      if (this.object.schedule) {
        for (const i in this.object.schedule) {
          this.object[i] = this.object.schedule[i]
        }
      }
      this.rightBoxshow = true
    },
    closeRightBox (refresh) {
      if (refresh) {
        this.$refs.backupsTable1.getTableData('backupsTable1')
      }
      this.rightBoxshow = false
    },
    statechange (Boolean) {
      this.isState = Boolean
    }
  },

  watch: {}
}
</script>
