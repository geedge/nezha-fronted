<template>
  <div class="about" v-my-loading='loading'>
    <div class="app">
       <div class="app-header">
      <div class="header-logo"><img width="60" height="60" src="../../../assets/img/logo1-2.png"></div>
      <div class="header-title">
        <div class="app-name">{{version.nezha.name}}</div>
        <div class="app-version"><span class="about-label">{{$t("overall.version")}}&nbsp;&nbsp;&nbsp;</span><span>{{version.nezha.version}}</span></div>
      </div>
    </div>
    <div class="app-component">
      <div class="component-content">
        <div class="app-component-row" v-for="(item, index) in version.components" :key="index">
          <div class="component-name">{{item.name}}</div>
          <div class="component-version">{{item.version}}</div>
        </div>
      </div>
    </div>
    </div>
    <div class="time-line">
      <div class="time-line-title">{{$t('about.releaseNotes')}}</div>
      <div class="time-line-body">
        <el-timeline>
          <el-timeline-item
           v-for="(item, index) in activities"
           :key="index"
           :timestamp="item.timestamp ? item.timestamp : ''"
            placement="top"
            >
              <div class="about-summary" v-for="(val,index) in item.content" :key="index">
                <span class="dot"></span>
                <div class="about-summary-text">{{language === "en" ? val.english :val.chinese}}</div>
              </div>
            </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'about',
  data () {
    return {
      noData: false,
      timeLineData: [],
      // language: '',
      loading: false,
      version: {
        nezha: { name: '', version: '' },
        components: [{ name: '', version: '' }]
      },
      activities: [{
        timestamp: 'Release 22.10 - Oct 2022',
        content: [{
          id: 1,
          chinese: '[FEATURE] 新增TSG appliance vsys配置同步',
          english: '[FEATURE] Add the configuration synchronization of TSG appliance vsys '
        }, {
          id: 2,
          chinese: '[FEATURE] 资产支持添加评论',
          english: '[FEATURE] Assets support adding comments'
        }, {
          id: 3,
          chinese: '[FEATURE] 增加记录规则，便于用户预先计算经常使用或计算量大的表达式，并将其结果保存为一组新的时序数据',
          english: '[FEATURE] Add recording rules, to facilitate users to calculate frequently used or compute-intensive expressions in advance, and save the results as a new set of time series'
        }, {
          id: 4,
          chinese: '[FEATURE] 新增图表类型：气泡图，桑基图，排行图',
          english: '[FEATURE] Add chart types: bubble chart, Sankey diagram and ranking chart'
        }, {
          id: 5,
          chinese: '[ENHANCEMENT] 优化页面加载动画效果',
          english: '[ENHANCEMENT] Optimize the animation of page loading'
        }, {
          id: 6,
          chinese: '[ENHANCEMENT] 优化地址栏显示，便于用户分享查询信息',
          english: '[ENHANCEMENT] Optimize the display of the browser address bar, to facilitate users’ sharing of queried information'
        }]
      }, {
        timestamp: 'Release 22.07 - Aug 2022',
        content: [{
          id: 1,
          chinese: '[FEATURE] 仪表盘增加快照导出功能',
          english: '[FEATURE] Add snapshot export to dashboards'
        }, {
          id: 2,
          chinese: '[FEATURE] 仪表盘支持定义变量，变量可以在chart表达式中使用',
          english: '[FEATURE] Dashboards support defining variables, which can be used in chart expressions'
        }, {
          id: 3,
          chinese: '[FEATURE] 仪表盘支持定时生成报告并通过邮件发送给接收人',
          english: '[FEATURE] Dashboards support scheduled generation of reports, which will be sent to receivers via email'
        }, {
          id: 4,
          chinese: '[FEATURE] 列表文字支持快捷复制到剪切板',
          english: '[FEATURE] Texts on the list can be copied to clipboard using shortcuts'
        }, {
          id: 5,
          chinese: '[ENHANCEMENT] 图表表达式增加是否启用配置项',
          english: '[ENHANCEMENT] Add whether to enable the configuration item for chart expressions'
        }, {
          id: 6,
          chinese: '[ENHANCEMENT] 增加新增资产、新增业务系统等完成后的使用提示',
          english: '[ENHANCEMENT] Add a prompt that appears after an asset or a project is created'
        }]
      }, {
        timestamp: 'Release 22.05 - May 2022',
        content: [{
          id: 7,
          chinese: '[FEATURE] Endpoint支持批量修改标签，是否启用采集',
          english: '[FEATURE] Endpoints support batch modification of label and whether to enable data gathering'
        }, {
          id: 8,
          chinese: '[FEATURE] 仪表盘增加查看模式切换',
          english: '[FEATURE] Add view mode switch to dashboards'
        }, {
          id: 9,
          chinese: '[FEATURE] 仪表盘增加用户收藏功能 ',
          english: '[FEATURE] Add user favorites to dashboards'
        }, {
          id: 10,
          chinese: '[FEATURE] 分布式Ping，traceroute功能',
          english: '[FEATURE] Support distributed Ping and Traceroute'
        }, {
          id: 11,
          chinese: '[ENHANCEMENT] 丰富告警消息详情页面显示内容',
          english: '[ENHANCEMENT] Enrich the content displayed in the alert details page'
        }]
      }, {
        timestamp: 'Release 22.02 - Feb 2022',
        content: [{
          id: 12,
          chinese: '[FEATURE] 新增 密码策略 配置，支持密码长度，复杂度，有效性，重试次数等配置项',
          english: '[FEATURE] Add Password Policy configuration and support the configuration items including password length, complexity, effectiveness and retry times'
        }, {
          id: 13,
          chinese: '[FEATURE] 丰富图表类型，新增hexgon, treemap, topology 等图表',
          english: '[FEATURE] Increase chart types, such as hexgon, treemap, and topology'
        }, {
          id: 14,
          chinese: '[FEATURE] 支持自定义日期显示格式',
          english: '[FEATURE] Support custom date display format'
        }, {
          id: 15,
          chinese: '[FEATURE] 新增license管理功能',
          english: '[FEATURE] Add license management'
        }, {
          id: 16,
          chinese: '[FEATURE] 新增IP地址管理功能',
          english: '[FEATURE] Add IP address management'
        }, {
          id: 17,
          chinese: '[FEATURE] 新增全局搜索功能',
          english: '[FEATURE] Add global search'
        }, {
          id: 18,
          chinese: '[ENHANCEMENT] 优化表格图表类型配置及显示，支持多个表达式结果关联显示在同一个表格中',
          english: '[ENHANCEMENT] Improve the configuration and display for tables and support multiple expression results being associated and displayed in a same table'
        }, {
          id: 19,
          chinese: '[ENHANCEMENT] 优化折线图，面积图图表类型显示，支持是否启用堆叠',
          english: '[ENHANCEMENT] Optimize the display of line charts and area charts, and support whether to enable stacking'
        }]
      }, {
        timestamp: 'Release 21.11 - Nov 2021',
        content: [{
          id: 20,
          chinese: '[FEATURE] 资产、告警规则、模块等增加详细视图',
          english: '[FEATURE] Add detailed views to assets, alert rules and modules'
        }, {
          id: 21,
          chinese: '[FEATURE] 增加个人中心，支持查看本人操作记录等信息',
          english: '[FEATURE] Add personal center and allow for viewing one’s own operational record, etc.'
        }, {
          id: 22,
          chinese: '[ENHANCEMENT] 重构告警规则实现，统一指标、日志和SNMP trap告警规则定义',
          english: '[ENHANCEMENT] Reconstruct alert rule implementation and unify the alert rule definition of metrics, logs and SNMP trap'
        }, {
          id: 23,
          chinese: '[ENHANCEMENT] 资产支持批量修改标签，密码等',
          english: '[ENHANCEMENT] Assets support batch modification of tags and passwords'
        }]
      }, {
        timestamp: 'Release 21.09 - Sep 2021',
        content: [{
          id: 24,
          chinese: '[FEATURE] 集中的日志数据观测',
          english: '[FEATURE] Centralized observation of log data'
        }, {
          id: 25,
          chinese: '[FEATURE] 资产支持父子数据关联',
          english: '[FEATURE] Assets support parent-child data association'
        }, {
          id: 26,
          chinese: '[[FEATURE] 双因素认证',
          english: '[FEATURE] Two-factor Authentication'
        }, {
          id: 27,
          chinese: '[FEATURE] 支持创建图表模板',
          english: '[FEATURE] Support creating chart templates'
        }, {
          id: 28,
          chinese: '[ENHANCEMENT] 优化折线图表类型显示效果',
          english: '[ENHANCEMENT] Improve the display of line charts'
        }, {
          id: 29,
          chinese: '[ENHANCEMENT] 优化图表排列方式',
          english: '[ENHANCEMENT] Optimize chart layout'
        }]
      }, {
        timestamp: 'Release 21.07 - Jul 2021',
        content: [{
          id: 30,
          chinese: '[FEATURE] 系统初始化配置功能，方便用户首次部署配置',
          english: '[FEATURE] Initialize system configuration to make users’ first deployment configuration easier'
        }, {
          id: 31,
          chinese: '[FEATURE] 使用向导功能',
          english: '[FEATURE] Add usage wizard'
        }, {
          id: 32,
          chinese: '[FEATURE] NZ-AGENT组件实现一键部署',
          english: '[FEATURE] Allow for one-touch deployment of NZ-AGENT'
        }, {
          id: 33,
          chinese: '[ENHANCEMENT] UI界面优化',
          english: '[ENHANCEMENT] Enhance UI'
        }]
      }, {
        timestamp: 'Release 21.04 - Apr 2021',
        content: [{
          id: 34,
          chinese: '[FEATURE] UI界面重构',
          english: '[FEATURE] Reconstruct UI'
        }, {
          id: 35,
          chinese: '[FEATURE] 系统拓扑图功能',
          english: '[FEATURE] Add the system topology map'
        }, {
          id: 36,
          chinese: '[FEATURE] 堡垒机操作录像及回放功能',
          english: '[FEATURE] Support the recording and playback of bastion host’s operations'
        }, {
          id: 37,
          chinese: '[ENHANCEMENT] 优化堡垒机命令解析方式，使命令解析结果更准确',
          english: '[ENHANCEMENT] Optimize the parsing method of bastion host’s commands for the parsed results to be more accurate'
        }]
      }, {
        timestamp: 'Release 2.0 - Jul 2020',
        content: [{
          id: 38,
          chinese: '[FEATURE] 系统概览功能',
          english: '[FEATURE] Add system overview'
        }, {
          id: 39,
          chinese: '[FEATURE] 告警规则查看详情',
          english: '[FEATURE] Add a detail view to alert rules'
        }, {
          id: 40,
          chinese: '[FEATURE] 列表数据批量导入导出功能',
          english: '[FEATURE] The lists can be imported and exported in batch'
        }, {
          id: 41,
          chinese: '[ENHANCEMENT] 列表字段支持排序',
          english: '[ENHANCEMENT] Support field ranking list'
        }, {
          id: 42,
          chinese: '[ENHANCEMENT] 图表实现调整位置和大小',
          english: '[ENHANCEMENT] The position and size of charts can be adjusted'
        }]
      }]
    }
  },
  methods: {
    getVersion () {
      this.loading = true
      this.$get('/about').then(response => {
        // this.language = localStorage.getItem('nz-language') || 'en'
        this.version = response.data
        this.loading = false
      })
    }
  },
  mounted () {
    this.getVersion()
  },
  computed: {
    language () {
      return this.$store.getters.getLanguage
    }
  }
}
</script>
