<template>
  <el-table
    id="endpointTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
    @row-dblclick="(row)=>{$emit('showBottomBox', 'panelTab', row)}"
  >
    <el-table-column
      :resizable="false"
      align="center"
      type="selection"
      width="55">
    </el-table-column>
    <el-table-column
      v-for="(item, index) in customTableTitle"
      v-if="item.show"
      :key="`col-${index}`"
      :fixed="item.fixed"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :sort-orders="['ascending', 'descending']"
      :sortable="item.sortable"
      :width="`${item.width}`"
      class="data-column"
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop === 'name'">
          {{scope.row[item.prop]}}
        </template>
        <template v-else-if="item.prop === 'type'">
          {{scope.row.module.type}}
        </template>
        <template v-else-if="item.prop === 'project'">
          <span
            class="pointer"
            @mouseenter="labelHover(scope.row, item.prop, true, $event)"
            @mouseleave="labelHover(scope.row, item.prop, false)"
          >
            {{scope.row[item.prop].name}}
          </span>
          <alertLabel
            v-if="scope.row[item.prop] && scope.row[item.prop].loading"
            :id="scope.row[item.prop].id"
            :that="scope.row[item.prop]"
            :type="'project'"
          ></alertLabel>
        </template>
        <template v-else-if="item.prop === 'module'">
          <span
            class="pointer"
            @mouseenter="labelHover(scope.row, item.prop, true, $event)"
            @mouseleave="labelHover(scope.row, item.prop, false)"
          >
            <i style="cursor: pointer" class="nz-icon nz-icon-overview-module monitorColor"/>
          {{scope.row[item.prop].name}}
          </span>
          <alertLabel
            v-if="scope.row[item.prop] && scope.row[item.prop].loading"
            :id="scope.row[item.prop].id"
            :that="scope.row[item.prop]"
            :type="'module'"
          ></alertLabel>
        </template>
        <template v-else-if="item.prop === 'alerts'">
          <span class="alert-num" @click="showBottomBox('endpointAlertMessage', scope.row)">
            <i class="nz-icon nz-icon-overview-alert" :class="scope.row.alertNum>0?'colorEF7458':'color23BF9A'"/>
            {{scope.row.alertNum}}
          </span>
        </template>
        <template v-else-if="item.prop === 'asset'">
          <span
            class="pointer"
            @mouseenter="labelHover(scope.row, item.prop, true, $event)"
            @mouseleave="labelHover(scope.row, item.prop, false)"
          >
            <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i>
            {{scope.row.asset.name}}
          </span>
          <alertLabel
            v-if="scope.row[item.prop] && scope.row[item.prop].loading"
            :id="scope.row[item.prop].id"
            :that="scope.row[item.prop]"
            :type="'asset'"
          ></alertLabel>
        </template>
        <template v-else-if="item.prop === 'configs'">
<!--          <el-tooltip placement="left" effect="light" :popper-class="'endpointConfigsTips'" v-if="scope.row.configs[0].enable">-->
<!--            <span class="configs-endpoint metrics">{ Metrics }</span>-->
<!--            <div class="endpointConfigsTips" slot="content">-->
<!--              <span class="copy-value-content"> <i class="nz-icon nz-icon-override" @click="copyValue(scope.row.configs[0].config)"></i></span>-->
<!--              <pre >{{JSON.stringify(scope.row.configs[0].config,null,2)}}</pre>-->
<!--            </div>-->
<!--          </el-tooltip>-->
<!--          <el-tooltip placement="right" effect="light" :popper-class="'endpointConfigsTips'" v-if="scope.row.configs[1].enable">-->
<!--            <span class="configs-endpoint logs">{ Logs }</span>-->
<!--            <div class="endpointConfigsTips" slot="content">-->
<!--              <span class="copy-value-content"> <i class="nz-icon nz-icon-override" @click="copyValue(scope.row.configs[1].config)"></i></span>-->
<!--              <pre >{{JSON.stringify(scope.row.configs[1].config,null,2)}}</pre>-->
<!--            </div>-->
<!--          </el-tooltip>-->

          <el-tooltip placement="left" effect="light" :popper-class="'endpointConfigsTips'" v-if="scope.row.configs[0].enable || scope.row.configs[1].enable">
            <span class="configs-endpoint metrics">[{{scope.row.configs[0].enable ?  'Metrics':''}}{{scope.row.configs[0].enable&&scope.row.configs[1].enable?',':''}}{{scope.row.configs[1].enable ?  'logs' : ''}}]</span>
            <div class="endpointConfigsTips" slot="content">
              <span class="copy-value-content"> <i class="nz-icon nz-icon-override" @click="copyValue(clConfigs(scope.row))"></i></span>
              <pre >{{JSON.stringify(clConfigs(scope.row),null,2)}}</pre>
            </div>
          </el-tooltip>
        </template>
        <template v-else-if="item.prop === 'state'">
          <el-popover placement="left" trigger="hover" width="100" :popper-class="''" :disabled="scope.row.configs[0].state<2">
            <div>
              <div v-html="suspendedStr(scope.row.configs[0].state)"></div>
            </div>
            <span slot="reference" style="width: auto">
              <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics colorFA901C" /> {{$t('project.endpoint.metrics')}} </span>
              <span v-if="scope.row.configs[0].state===0">
                <span class="active-icon red-bg inline-block"></span>
              </span>
              <span v-else-if="scope.row.configs[0].state===1">
                <span class="active-icon green-bg inline-block"></span>
              </span>
              <span v-else-if="scope.row.configs[0].state">
                <span class="active-icon gray-bg inline-block"></span>
              </span>
            </span>
          </el-popover>
          <el-popover placement="right" trigger="hover" width="100" :popper-class="''" :disabled="scope.row.configs[1].state<2">
            <div>
              <div v-html="suspendedStr(scope.row.configs[1].state)"></div>
            </div>
            <span slot="reference" style="width: auto">
              <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs colorFA901C" /> {{$t('project.endpoint.logs')}} </span>
              <span v-if="scope.row.configs[1].state===0">
                <span class="active-icon red-bg inline-block"></span>
              </span>
              <span v-else-if="scope.row.configs[1].state===1">
                <span class="active-icon green-bg inline-block"></span>
              </span>
              <span v-else-if="scope.row.configs[1].state">
                <span class="active-icon gray-bg inline-block"></span>
              </span>
            </span>
          </el-popover>
        </template>
        <template v-else-if="item.prop === 'enabled'">
          <span v-if="scope.row[item.prop] === 1">{{$t('project.endpoint.enable')}}</span>
          <span v-else>{{$t('project.endpoint.disable')}}</span>
        </template>
        <span v-else>{{scope.row[item.prop] ? scope.row[item.prop] : ''}}</span>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      v-if="showOption"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button v-if="endpointTab"  class="table-operation-item" v-has="'model_edit'" @click="$emit('edit', scope.row)"><i class="nz-icon nz-icon-edit"></i></button>
        <button v-else class="table-operation-item"  @click="$emit('showBottomBox', 'panelTab', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
        <el-dropdown size="medium" v-has="['monitor_endpoint_edit','monitor_endpoint_delete']" trigger="hover" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!endpointTab" :command="['endpointQuery', scope.row]"><i class="nz-icon nz-icon-search"></i><span class="operation-dropdown-text">{{$t('overall.query')}}</span></el-dropdown-item>
            <el-dropdown-item v-if="!endpointTab" v-has="'monitor_endpoint_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'monitor_endpoint_delete'" :command="['delete', scope.row, `sys/endpoint?ids=${scope.row.id}`]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'alertSilence_add'" :command="['fastSilence', scope.row, 'endpoint']"><i class="nz-icon nz-icon-fast-silence"></i><span class="operation-dropdown-text">{{$t('overall.silenceAlert')}}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-table-column>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
import alertLabel from '../../alert/alertLabel'
export default {
  name: 'endpointTable',
  components: {
    alertLabel
  },
  mixins: [table],
  props: {
    showOption: {
      type: Boolean,
      default: true
    },
    endpointTab: Boolean
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
          show: false
        },
        {
          label: this.$t('project.endpoint.alerts'),
          prop: 'alerts',
          show: true,
          sortable: 'custom'
        },
        {
          label: this.$t('project.endpoint.state'),
          prop: 'state',
          show: true,
          minWidth: 200,
          width: 200,
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
    copyValue (item) {
      const str = item
      console.log(str)
      const domUrl = document.createElement('input')
      domUrl.value = JSON.stringify(str)
      domUrl.id = 'creatDom'
      document.body.appendChild(domUrl)
      domUrl.select() // 选择对象
      document.execCommand('Copy') // 执行浏览器复制命令
      const creatDom = document.getElementById('creatDom')
      creatDom.parentNode.removeChild(creatDom)
      this.$message.success(this.$t('overall.copySuccess'))
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
    // label 鼠标划入
    labelHover (item, type, loading, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item[type], 'position', position)
      }
      this.$set(item[type], 'loading', loading)
      // this.$set(this.tableData,index,item);// 调用父组件
    },
    clConfigs (item) {
      const str = []
      if (item.configs[0].enable) {
        str.push(item.configs[0])
      }
      if (item.configs[1].enable) {
        str.push(item.configs[1])
      }
      return str
    }
  },
  computed: {}
}
</script>
<style scoped>
  .endpoint-num{
    padding: 0 3px;
    cursor: pointer;
    border-radius: 2px;
  }
  .bagEF7458{
    background: #EF7458;
    color: #fff;
  }
  .bag23BF9A{
    background: #23BF9A;
    color: #fff;
  }
  .configs-endpoint{
    border-radius: 4px;
    padding: 2px 7px;
    color: #3C92F1;
  }
  .configs-endpoint.metrics{
    color: #3C92F1;
  }
  .configs-endpoint.logs{
    color: #25BF9A;
  }
  .colorEF7458{
    color: #EF7458;
  }
  .color23BF9A{
    color: #23BF9A;
  }
  .endpoint-num, .alert-num{
    cursor: pointer;
  }
  .inline-block{
    display: inline-block;
  }
  .pointer{
    cursor: pointer;
  }
  .state-box{
    display: flex;
    flex-wrap: wrap;
    border: 1px solid #E7EAED;
    border-bottom: none;
  }
  .state-box-content{
    padding: 0 5px;
    width: 50%;
    border-bottom: 1px solid #E7EAED;
  }
  .state-box-content:nth-of-type(odd){
    border-right: 1px solid #E7EAED;
  }
  .state-content-text{
    width:64px;text-align:left;margin-right: 5px;display: inline-block
  }
  .colorFA901C{
    color: #fa901c;
  }
  .endpoint-cell-left{
    /*display: inline-block;*/
    /*width: 70px;*/
  }
</style>
<style>
  .endpointConfigsTips{
    height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .copy-value-content{
    position: absolute;
    right: 1px;
    top: 4px;
  }
</style>
