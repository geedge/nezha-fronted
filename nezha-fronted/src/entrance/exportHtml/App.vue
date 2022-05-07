<template>
  <div id="entrance" class="theme-light body container list-page" style="height: 100%">
    <div class="main-list">
      <div id="tableList" class="table-list" style='overflow-y: unset'>
        <div class="table-list-box">
          <div style="display: flex;justify-content: space-between;padding: 0 20px;box-sizing: border-box;align-items: center">
            <span style="font-size: 16px;font-weight: 600;color: #333"> {{dataJson.panel.name}} </span>

            <span>
              {{timeFormate(dataJson.start)}} - {{timeFormate(dataJson.start)}}
            </span>
          </div>
          <div  id="dashboardScrollbar" class="box-content"  ref="dashboardScrollbar" style='overflow-y: auto'>
            <chartList
              ref="chartList"
              name="panel"
              :panelId="'export'"
              :class="{'show-top': true}"
              :data-list="dataJson.charts.data.list"
              :dataJson = "dataJson.chartsData"
              :is-export-html="true"
              :nowTimeType="nowTimeType"
              :from="'panel'"
              :time-range="searchTime"
              @edit-chart="editChart"
              @on-refresh-time="refreshTime"
              @on-remove-chart="delChart"
              @on-add-group-item-chart="addGroupItem"
              @refreshPanel="refreshPanel"
              :loading="chartListLoading"
            />
          </div>
        </div>
      </div>

    </div>
    <span class="temp-dom"></span>
  </div>
</template>

<script>
import chartList from '@/components/chart/chartList.vue'
import { loadI18n } from '@/components/common/i18n'
import i18nData from '@/entrance/exportHtml/i18nData'
const dataJson = window.dataJson || {
  panel: { id: 1487, name: 'Overview', createBy: 1, type: 'dashboard', link: 0, pid: 0, weight: 0, buildIn: 1, seq: 'v3.2-buildin', children: [], parent: null, chartNum: 18 },
  language: 'zh',
  start: 1651833659000,
  end: 1651833659000,
  charts: {
    msg: 'success',
    code: 200,
    data: {
      total: 1,
      pageSize: -1,
      pages: 1,
      pageNo: 1,
      list: [{
        id: 10341,
        name: 'Last Slave',
        panelId: 675,
        groupId: 0,
        span: 4.0,
        height: 4.0,
        updateBy: 106,
        updateAt: '2022-04-26 01:53:21',
        type: 'line',
        unit: 2,
        weight: 0,
        param: { stack: 0, thresholds: [{ color: '#06a041' }], thresholdShow: true, legend: { values: ['range','last'], show: true, placement: 'bottom' }, enable: { thresholds: false, legend: true, valueMapping: false }, link: '', valueMapping: [], nullType: 'null' },
        pid: null,
        buildIn: 0,
        remark: '',
        seq: null,
        x: 0.0,
        y: 12.0,
        elements: [{ id: 16051, chartId: 10341, expression: 'redis_rdb_last_save_timestamp_seconds', type: 'expert', legend: '', buildIn: 0, seq: null, name: 'A', state: 1 }],
        sync: null,
        panel: { id: 675, name: 'NZ Mariadb', createBy: null, type: null, link: null, pid: null, weight: null, buildIn: null, seq: null, children: null, parent: null, chartNum: null },
        group: { id: 0, name: null, panelId: null, groupId: null, span: null, height: null, updateBy: null, updateAt: null, type: null, unit: null, weight: null, param: null, pid: null, buildIn: null, remark: null, seq: null, x: null, y: null, elements: null, sync: null, panel: null, group: null, children: null, chartNums: null, asset: null, varType: null, varId: null, varName: null, datasource: null },
        children: null,
        chartNums: null,
        asset: null,
        varType: null,
        varId: null,
        varName: null,
        datasource: 'metrics'
      }]
    },
    time: '2022-05-05 07:26:03'
  },
  chartsData: {
    '10341_0': { data: { result: [{ metric: { endpoint: '7400-192.168.40.165-MCN0-MAAT', module_id: '293', nz_agent_id: '75', __name__: 'redis_rdb_last_save_timestamp_seconds', project_id: '25', module: 'MCN0-MAAT', endpoint_id: '253', project: '7400', datacenter: 'xin_xi_gang_DC', asset_id: '29', asset: '7400-192.168.40.165', datacenter_id: '4' }, values: [[1651735328, '1651735257'], [1651735343, '1651735257'], [1651735358, '1651735257'], [1651735373, '1651735257'], [1651735388, '1651735257'], [1651735403, '1651735257'], [1651735418, '1651735257'], [1651735433, '1651735257'], [1651735448, '1651735257'], [1651735463, '1651735257'], [1651735478, '1651735257'], [1651735493, '1651735257'], [1651735508, '1651735257'], [1651735523, '1651735257'], [1651735538, '1651735257'], [1651735553, '1651735257'], [1651735568, '1651735257'], [1651735583, '1651735257'], [1651735598, '1651735257'], [1651735613, '1651735257'], [1651735628, '1651735257']] }, { metric: { endpoint: 'CM-Sync-Redis-Bifang-CM-Server', module_id: '173', nz_agent_id: '73', __name__: 'redis_rdb_last_save_timestamp_seconds', project_id: '19', module: 'CM-Sync-Redis', endpoint_id: '433', project: 'Bifang-CM', datacenter: 'xin_xi_gang_DC', asset_id: '127', asset: 'Bifang-CM-Server', datacenter_id: '4' }, values: [[1651735328, '1651735396'], [1651735343, '1651735396'], [1651735358, '1651735396'], [1651735373, '1651735396'], [1651735388, '1651735396'], [1651735403, '1651735396'], [1651735418, '1651735396'], [1651735433, '1651735396'], [1651735448, '1651735396'], [1651735463, '1651735396'], [1651735478, '1651735396'], [1651735493, '1651735396'], [1651735508, '1651735396'], [1651735523, '1651735396'], [1651735538, '1651735396'], [1651735553, '1651735396'], [1651735568, '1651735396'], [1651735583, '1651735396'], [1651735598, '1651735396'], [1651735613, '1651735396'], [1651735628, '1651735396']] }, { metric: { endpoint: 'CM-Sync-Redis-Bifang-CM-Server1', module_id: '173', nz_agent_id: '75', __name__: 'redis_rdb_last_save_timestamp_seconds', project_id: '19', module: 'CM-Sync-Redis', endpoint_id: '435', project: 'Bifang-CM', datacenter: 'xin_xi_gang_DC', asset_id: '129', asset: 'Bifang-CM-Server1', datacenter_id: '4' }, values: [[1651735328, '1651735396'], [1651735343, '1651735396'], [1651735358, '1651735396'], [1651735373, '1651735396'], [1651735388, '1651735396'], [1651735403, '1651735396'], [1651735418, '1651735396'], [1651735433, '1651735396'], [1651735448, '1651735396'], [1651735463, '1651735396'], [1651735478, '1651735396'], [1651735493, '1651735396'], [1651735508, '1651735396'], [1651735523, '1651735396'], [1651735538, '1651735396'], [1651735553, '1651735396'], [1651735568, '1651735396'], [1651735583, '1651735396'], [1651735598, '1651735396'], [1651735613, '1651735396'], [1651735628, '1651735396']] }, { metric: { endpoint: 'CM-Redis-192.168.44.18', module_id: '173', nz_agent_id: '75', __name__: 'redis_rdb_last_save_timestamp_seconds', project_id: '19', module: 'CM-Sync-Redis', endpoint_id: '57', project: 'Bifang-CM', datacenter: 'xin_xi_gang_DC', asset_id: '11', asset: 'Bifang-CM-Server2', datacenter_id: '4' }, values: [[1651735328, '1651735371'], [1651735343, '1651735371'], [1651735358, '1651735371'], [1651735373, '1651735371'], [1651735388, '1651735371'], [1651735403, '1651735371'], [1651735418, '1651735371'], [1651735433, '1651735371'], [1651735448, '1651735371'], [1651735463, '1651735371'], [1651735478, '1651735371'], [1651735493, '1651735371'], [1651735508, '1651735371'], [1651735523, '1651735371'], [1651735538, '1651735371'], [1651735553, '1651735371'], [1651735568, '1651735371'], [1651735583, '1651735371'], [1651735598, '1651735371'], [1651735613, '1651735371'], [1651735628, '1651735371']] }], resultType: 'matrix' }, status: 'success' },
    '1_1': { data: { result: [], resultType: 'matrix' }, status: 'success' },
    '[id]_[index]': {}
  }
}
export default {
  name: 'Entrance',
  data () {
    return {
      dataJson: dataJson,
      searchTime: ['29/04/2022 10:00:54', '29/04/2022 11:00:54'],
      nowTimeType: { start_time: '[native Date Fri Apr 29 2022 10:00:54 GMT+0800 (中国标准时间)]', end_time: '[native Date Fri Apr 29 2022 11:00:54 GMT+0800 (中国标准时间)]' }
    }
  },
  components: {
    chartList: chartList
  },
  created () {
    this.$i18n.locale = this.dataJson.language
    console.log(this.$i18n.locale, this.dataJson.language)
    loadI18n(i18nData)
  },
  mounted () {
  },
  methods: {
    editChart () {},
    refreshTime () {},
    delChart () {},
    addGroupItem () {},
    chartListLoading () {},
    refreshPanel () {}
  }
}
</script>

<style>
  #entrance {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    color: #2c3e50;
    margin-top: 10px;
    padding-bottom: 20px;
  }
</style>
