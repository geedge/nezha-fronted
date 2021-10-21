<template>
  <div class="detail-left-box">
    <div class="order-box">
      <el-select v-model="orderBy" size="small" :placeholder="$t('asset.detail.orderBy')" popper-class="right-box-select-top" class="detail-select">
        <el-option
          v-for="item in tableTitle"
          v-if="item.sortable==='custom'"
          :key="item.prop"
          :label="$t('asset.detail.orderByLabel',{label:item.label})"
          :value="item.prop">
          {{item.label}}
        </el-option>
      </el-select>
      <button @click="orderTypeChange" size="small" class="detail-button top-tool-btn table-column-setting margin-l-10">
        <i class="nz-icon nz-icon-arrow-up1" v-if="orderType=='ascending'" />
        <i class="nz-icon nz-icon-arrow-down2" v-if="orderType=='descending'" />
      </button>
    </div>
    <ul class="detail-row-box" ref="dataTable">
      <li
        v-for="(item,index) in tableData"
        :key="index"
        class="detail-row"
        :class="item.id === detailViewRightObj.id ? 'selected' : ''"
        @click="detailViewRightShow(item)"
      >
        <div class="detail-row-info">
          <div class="asset-manageIp">
            <el-tooltip effect="light" placement="right">
              <div slot="content">
                {{getStatusText(item.status)}}
              </div>
              <span><i class="nz-icon" :class="statusClass(item.status)"/></span>
            </el-tooltip>
            <span>{{getRemoteText(item)}}</span>
          </div>
          <div class="asset-name">
            <span>{{item.username?item.username:'-'}}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>

import detailViewLeftMixin from '@/components/common/mixin/detailViewLeftMixin'
import alertLabel from '@/components/common/alert/alertLabel'
import { terminalLog } from '@/components/common/js/constants'
import {calcDurationByStringTimeB} from "@/components/common/js/tools";
export default {
  name: 'terminalLogDetail',
  mixins: [detailViewLeftMixin],
  components: {
    alertLabel
  },
  computed: {
    getStatusText () {
      return function (status) {
        return terminalLog.status[status]
      }
    },
    getRemoteText () {
      return function (record) {
        return `${record.loginUser}@${record.host}:${record.port}`
      }
    },
    statusClass () {
      return function (status) {
        switch (status) {
          case 0:
            return 'nz-icon-connecting color23bf9a'
          case 1:
            return 'nz-icon-failed colorffa416'
          case 2:
            return 'nz-icon-over color999999'
          case 3:
            return 'nz-icon-stop colorec7f66'
          case 4:
            return 'nz-icon-unknown-error color535b64'
        }
      }
    }
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('config.terminallog.id'),
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('config.terminallog.SessionID'),
          prop: 'uuid',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('config.terminallog.username'),
          prop: 'username',
          minWidth: 200,
          show: true
        },
        {
          label: this.$t('config.terminallog.source'),
          prop: 'sourceIp',
          minWidth: 115,
          show: true,
          sortable: 'custom'
        },
        {
          label: this.$t('config.terminallog.remote'),
          prop: 'remote',
          show: true
        },
        {
          label: this.$t('config.terminallog.protocol'),
          prop: 'protocol',
          show: true
        },
        {
          label: this.$t('config.terminallog.startTime'),
          prop: 'startTime',
          minWidth: 100,
          show: true
        },
        {
          label: this.$t('config.terminallog.duration'),
          prop: 'duration',
          show: true
        },
        {
          label: this.$t('config.terminallog.authtype'),
          prop: 'authType',
          minWidth: 100,
          show: false
        },
        {
          label: this.$t('config.terminallog.status'), // killusername鼠标悬停形式
          prop: 'state',
          show: true,
          width: 150,
          sortable: 'custom'
        }
      ]
    }
  },
  methods: {
    // label 鼠标划入
    labelHover (item, type, loading, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item, 'position', position)
      }
      this.$set(item, 'loading', loading)
      // this.$set(this.tableData,index,item);// 调用父组件
    },
  }
}
</script>

<style scoped lang="scss">
  .order-box{
    display: flex;
    height:40px;
    padding: 0 15px;
    line-height: 40px;
    align-items: center;
    /*.detail-select{*/
    /*  height: 30px;*/
    /*  line-height: 30px;*/
    /*  flex: 1;*/
    /*  /deep/ .el-input--small{*/
    /*    height: 30px;*/
    /*    line-height: 30px;*/
    /*    background-color: rgba(9,30,66,0.08);*/
    /*    border: none;*/
    /*    color: #344563;*/
    /*    input{*/
    /*      height: 30px;*/
    /*      line-height: 30px;*/
    /*      background-color: rgba(9,30,66,0.08);*/
    /*      border: none;*/
    /*      color: #344563;*/
    /*    }*/
    /*  }*/
    /*}*/
    /*.detail-select:hover{*/
    /*  /deep/ .el-input--small{*/
    /*    input{*/
    /*      background-color: rgba(9,30,66,0.13);*/
    /*    }*/
    /*  }*/
    /*}*/
    /*.detail-button{*/
    /*  height: 28px;*/
    /*  line-height: 28px;*/
    /*  background-color: rgba(9,30,66,0.08);*/
    /*  border: none;*/
    /*  .nz-icon{*/
    /*    color: #344563;*/
    /*  }*/
    /*}*/
    /*.detail-button:hover{*/
    /*  background-color: rgba(9,30,66,0.13);*/
    /*}*/
  }
  .detail-row-box{
    height: calc(100% - 40px);
    overflow: hidden;
    overflow-y: auto;
  }
  .detail-row{
    width: 245px;
    padding: 0px 0 0px 15px;
    height: 60px;
    border-bottom: 1px solid #E7EAED;
    cursor: pointer;
  }
  .detail-row:last-of-type{
    border-bottom: none
  }
  .detail-row-info{
    display: flex;
    height: 100%;
    width: calc(100% - 15px);
    justify-content:center;
    flex-direction: column;
    > div{
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  .asset-manageIp{
    font-size: 16px;
    color: #333333;
    font-weight: 400;
  }
    .asset-name {
      padding-left: 22px;
      width: calc(100% - 22px);
      font-size: 14px;
      color: #999999;
      font-weight: 400;
    }
  }
  .selected{
    background: #FFFBF6;
  }
  .colorEF7458{
    color: #EF7458;
  }
  .color23BF9A{
    color: #23BF9A;
  }
  .colorFA901C{
    color: #fa901c;
  }
</style>
