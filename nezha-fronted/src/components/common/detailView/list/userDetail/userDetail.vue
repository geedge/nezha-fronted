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
        <i class="nz-icon nz-icon-arrow-up1" v-if="orderType=='ascending'"  :title="$t('dashboard.explore.ascending')"/>
        <i class="nz-icon nz-icon-arrow-down2" v-if="orderType=='descending'"  :title="$t('dashboard.explore.descending')"/>
      </button>
    </div>
    <ul class="detail-row-box" ref="dataTable">
      <li
        v-for="(item,index) in tableData"
        :key="index"
       class="detail-row"
        :id="'globalSearch' + item.id"
        :class="item.id === detailViewRightObj.id ? 'selected' : ''"
        @click="detailViewRightShow(item)"
      >
        <div class="detail-row-info" :title="item.name" @mouseenter="labelHover(item, 'user', true, false, $event)"
             @mouseleave="labelHover(item, 'user', false, false,)">
          <div class="asset-manageIp">
             <div class="user-name-td">
               <span class="flex-align-center">
                 <span v-if="item.status" >
                   <span :class="{'active-icon green-bg':item.status == 1,'active-icon gray-bg':item.status == 0}"></span>
                 </span>
                 <span v-else style="display: inline-block;width: 13px"></span>
                 <span class="user-name-top">{{item.name}}</span>
                 <el-tag size="mini" v-if="mfaEnable == '1' || item.mfaLevel > 0" style="margin-left: 5px">2FA</el-tag>
               </span>
             </div>
          </div>
          <div class="asset-name">
            <span>@{{item.username}}</span>
          </div>
        </div>
      </li>
    </ul>
     <alertLabel
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :type="alertLabelType"
      :detail-list="true"
    ></alertLabel>
  </div>
</template>

<script>

import detailViewLeftMixin from '@/components/common/mixin/detailViewLeftMixin'
import alertLabel from '@/components/common/alert/alertLabel'
import { terminalLog } from '@/components/common/js/constants'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
export default {
  name: 'userDetail',
  mixins: [detailViewLeftMixin, alertLabelMixin],
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
        //   label: this.$t('login.username'),
        //   prop: 'username',
        //   show: true,
        //   width: 150
        // },
        {
          label: this.$t('profile.role'),
          prop: 'roles',
          show: true,
          width: 150
        }, {
          label: 'E-mail',
          prop: 'email',
          show: true,
          minWidth: 150
        }, {
          label: this.$t('profile.lastLoginTime'),
          prop: 'lastLoginTime',
          show: true,
          width: 200
        }, {
          label: this.$t('profile.lastLoginIp'),
          prop: 'lastLoginIp',
          show: true,
          width: 150
        }, {
          label: this.$t('profile.source'),
          prop: 'source',
          show: true,
          width: 150
        }, {
          label: this.$t('config.user.language'),
          prop: 'lang',
          show: true,
          width: 150
        }, {
          label: this.$t('overall.enabled'),
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
    // labelHover (item, type, loading, e) {
    //   if (e) {
    //     const dom = e.currentTarget
    //     const position = dom.getBoundingClientRect()
    //     this.$set(item, 'position', position)
    //   }
    //   this.$set(item, 'loading', loading)
    //   // this.$set(this.tableData,index,item);// 调用父组件
    // },
    getStatusText () {
      return function (status) {
        return terminalLog.status[status]
      }
    }
  }
}
</script>
