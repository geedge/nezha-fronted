<template>
  <div class="system">
    <div class="system-config-form">
      <div class="system-title">backup configurations</div>
      <nz-data-list
        ref="dataList"
        id="modelTable"
        :data="tableData"
        border
        from="backups"
      >
        <template v-slot="slotProps">
          <backups-table
          ref="backupsTable"
            :custom-table-title="customTableTitle"
            :is-configurations="true"
            :is-state ='isState'
            @edit="edit"
          >
          </backups-table>
        </template>
      </nz-data-list>
    </div>

    <div class="system-config-form">
      <div class="system-title">Recent backup</div>
      <nz-data-list
        ref="dataList"
        id="modelTable"
        :data="tableData2"
        border
        from="backups"
      >
        <template v-slot="slotProps">
          <backups-table
          ref="backupsTable"
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
import nzDataList from "@/components/common/table/nzDataList";
import backupsTable from "@/components/common/table/settings/backupsTable";
import backupsBox from '@/components/common/rightBox/administration/backupsBox'


export default {
  name: "backups",
  mixins: [],
  props: [""],
  data() {
    return {
        
      url: "/sys/backup/list",
      customTableTitle: [
        { label: "Frequency", prop: "repeat" },
        { label: "Backup Retention", prop: "retention" },
        { label: "Last backup at", prop: "last" },
        { label: "Enable", prop: "state" },
      ],
      customTableTitle2: [
        { label: "Date", prop: "time" },
        { label: "File", prop: "fileName" },
        { label: "Size", prop: "size" },
        { label: "Description", prop: "Description" },
      ],
      tableData: [
        {
          retention: "",
          state: "",
          schedule: {},
        },
      ],
      tableData2: [
        {
          list: {},
        },
      ],
      rightBoxshow:false,
      isState:'',
      isRefresh:''
    };
  },

  components: { nzDataList, backupsTable,backupsBox },

  computed: {},

  created() {},

  mounted() {},

  methods: {
      edit(row){
          this.object = { ...row }
          this.object.name = `Edit backup configurations`
          if(this.object.schedule){
              for(let i in this.object.schedule){
                  this.object[i]=this.object.schedule[i]
              }
          }
          this.rightBoxshow = true
      },
      closeRightBox(refresh){
          if(refresh){
              this.$refs.backupsTable.$emit('getData')
          }
          this.rightBoxshow = false
      },
      statechange(Boolean){
          this.isState = Boolean
      }
  },

  watch: {},
};
</script>