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
            <span class="flex-align-center">
                <span class="user-name-top">{{item.name}}</span>
                <el-tag size="mini" v-if="mfaEnable == '1' || item.mfaLevel > 0" style="margin-left: 5px">2FA</el-tag>
              </span>
          </div>
          <div class="asset-name">
            <span>@{{item.username}}</span>
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
export default {
  name: 'userDetail',
  mixins: [detailViewLeftMixin],
  components: {
    alertLabel
  },
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('config.user.name'),
          prop: 'name',
          show: true,
          width: 600,
          sortable: 'custom'
        },
        // {
        //   label: this.$t('config.user.username'),
        //   prop: 'username',
        //   show: true,
        //   width: 150
        // },
        {
          label: this.$t('config.user.roles'),
          prop: 'roles',
          show: true,
          width: 150
        }, {
          label: 'E-mail',
          prop: 'email',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('config.user.lastLoginTime'),
          prop: 'lastLoginTime',
          show: true,
          width: 200
        }, {
          label: this.$t('config.user.lastLoginIp'),
          prop: 'lastLoginIp',
          show: true,
          width: 150
        }, {
          label: this.$t('config.user.source'),
          prop: 'source',
          show: true,
          width: 150
        }, {
          label: this.$t('config.user.language'),
          prop: 'lang',
          show: true,
          width: 150
        }, {
          label: this.$t('config.user.enable'),
          prop: 'status',
          show: true,
          width: 100
        }
      ],
      mfaEnable: localStorage.getItem('nz-mfa-enable')
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
    getStatusText () {
      return function (status) {
        return terminalLog.status[status]
      }
    }
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
      /*padding-left: 22px;*/
      /*width: calc(100% - 22px);*/
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
