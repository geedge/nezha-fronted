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
        @mouseenter="labelHover(item, 'endpoint', true, $event)"
        @mouseleave="labelHover(item, 'endpoint', false)">
        <div class="detail-row-info">
          <div class="asset-manageIp">
            <i class="nz-icon nz-icon-overview-alert" :class="item.alertNum>0?'colorEF7458':'color23BF9A'"/>
            {{item.name}}
          </div>
          <div class="asset-name">
            <el-popover placement="left" trigger="hover" width="100" :popper-class="''" :disabled="item.configs[0].state<2">
              <div>
                <div v-html="suspendedStr(item.configs[0].state)"></div>
              </div>
              <span slot="reference" style="width: auto">
              <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics colorFA901C" /> {{$t('project.endpoint.metrics')}} </span>
              <span v-if="item.configs[0].state===0 || !item.configs[0].state">
                <span class="active-icon red-bg inline-block"></span>
              </span>
              <span v-else-if="item.configs[0].state===1">
                <span class="active-icon green-bg inline-block"></span>
              </span>
              <span v-else-if="item.configs[0].state">
                <span class="active-icon gray-bg inline-block"></span>
              </span>
            </span>
            </el-popover>
            <el-popover placement="left" trigger="hover" width="100" :popper-class="''" :disabled="item.configs[1].state<2">
              <div>
                <div v-html="suspendedStr(item.configs[1].state)"></div>
              </div>
              <span slot="reference" style="width: auto">
              <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs colorFA901C" /> {{$t('project.endpoint.logs')}} </span>
              <span v-if="item.configs[1].state===0 || !item.configs[1].state">
                <span class="active-icon red-bg inline-block"></span>
              </span>
              <span v-else-if="item.configs[1].state===1">
                <span class="active-icon green-bg inline-block"></span>
              </span>
              <span v-else-if="item.configs[1].state">
                <span class="active-icon gray-bg inline-block"></span>
              </span>
            </span>
            </el-popover>
          </div>
        </div>
        <alertLabel
          v-if="item && item.loading"
          :id="item.id"
          :that="item"
          :type="'endpoint'"
        ></alertLabel>
      </li>
    </ul>
  </div>
</template>

<script>

import detailViewLeftMixin from '@/components/common/mixin/detailViewLeftMixin'
import alertLabel from '@/components/common/alert/alertLabel'
export default {
  name: 'endpointDetail',
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
          label: this.$t('project.endpoint.name'),
          prop: 'name',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('project.project.projectName'),
          prop: 'project',
          show: true,
          minWidth: 100,
          sortable: 'custom'
        },
        {
          label: this.$t('project.endpoint.asset'),
          prop: 'asset',
          show: true,
          minWidth: 90,
          sortable: 'custom'
        },
        {
          label: this.$t('project.module.module'),
          prop: 'module',
          show: true
        },
        {
          label: this.$t('project.endpoint.configs'),
          prop: 'configs',
          minWidth: 150,
          show: false
        },
        {
          label: this.$t('project.endpoint.alerts'),
          prop: 'alerts',
          show: true,
          minWidth: 150,
          sortable: 'custom'
        },
        {
          label: this.$t('project.endpoint.state'),
          prop: 'state',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }
        // {
        //   label: this.$t('project.endpoint.status'),
        //   prop: 'enabled',
        //   show: false
        // }
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
    suspendedStr (status) { // 10进制转为2进制 分别给对应的状态
      if (!status || status === 1 || status == 0) { return '' }
      const arr = status.toString(2).split('')
      while (arr.length < 4) {
        arr.unshift('0')
      }
      arr.pop()
      let str = ''
      arr.forEach((item, index) => {
        if (index === 0) {
          str += `<div><div class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></div> DC</div>`
        }
        if (index === 1) {
          str += `<div><div class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></div> ASSET</div>`
        }
        if (index === 2) {
          str += `<div><div class="active-icon inline-block ${item == '0' ? 'gray-bg' : 'green-bg'}"></div> ENDPOINT</div>`
        }
        // if (index === 3) {
        //   str += `<div>PROMETHEUS <div class="active-icon inline-block ${item == '0' ? 'red-bg' : 'green-bg'}"></div></div>`
        // }
      })
      return str
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
