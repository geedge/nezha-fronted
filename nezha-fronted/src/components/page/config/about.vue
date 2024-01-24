<template>
  <div class="about" v-my-loading='loading'>
    <div class="app">
       <div class="app-header">
      <div class="header-logo"><img width="60" height="60" :src="imgUrl"></div>
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
import imgUrl from '@/assets/img/logo1-2.png'
export default {
  name: 'about',
  data () {
    return {
      imgUrl,
      noData: false,
      timeLineData: [],
      // language: '',
      loading: false,
      version: {
        nezha: { name: '', version: '' },
        components: [{ name: '', version: '' }]
      },
      activities: [
        {
          timestamp: 'Release 24.01 - Jan 2024',
          content: [{
            chinese: '[FEATURE] 新增软件资产管理功能',
            english: '[FEATURE] Added software asset management function'
          }, {
            chinese: '[FEATURE] 支持Active-Active高可用部署',
            english: '[FEATURE] Support Active-Active high availability deployment'
          }, {
            chinese: '[FEATURE] 新增告警消息通知，当有新消息时发出告警音',
            english: '[FEATURE] Added alert message notification, an alarm sound will be emitted when there is a new message'
          }, {
            chinese: '[ENHANCEMENT] 仪表盘样式优化，图表新增配色方案配置项',
            english: '[ENHANCEMENT] Dashboard style optimization, new color scheme configuration items for charts'
          }, {
            chinese: '[ENHANCEMENT] 时序图表重构，支持鼠标框选缩放',
            english: '[ENHANCEMENT] Time series chart reconstruction, support mouse frame selection zooming'
          }]
        }, {
          timestamp: 'Release 23.10 - Oct 2023',
          content: [{
            chinese: '[FEATURE] 笔记本功能允许您将多种图表组合起来，以构建可共享的、数据丰富的文档。使用笔记本，您可以对事件进行故障排除，创建事后分析，并构建运行手册',
            english: '[FEATURE] The notebook feature allows you to combine multiple charts to build shareable, data-rich documents. Using notebooks, you can troubleshoot incidents, create postmortems, and build runbooks'
          }, {
            chinese: '[FEATURE] 系统备份功能允许您将系统的配置保存到磁盘，以便在需要的时候恢复数据',
            english: '[FEATURE] The backup feature allows you to save the system configuration to disk so you can recover the configuration when needed'
          },
          //   {
          //   chinese: '[FEATURE] 通过软件资产管理功能可以集中管理软件资产，统计软件的使用情况',
          //   english: '[FEATURE] The software asset management feature can centrally manage software assets and count software usage'
          // },
          {
            chinese: '[ENHANCEMENT] 告警消息详情页面增加显示相关资产仪表板并支持快照导出',
            english: '[ENHANCEMENT] The alarm message details page now displays the related asset dashboard and supports snapshot export'
          }, {
            chinese: '[ENHANCEMENT] 时序图表优化用户体验',
            english: '[ENHANCEMENT] Time series charts optimize user experience'
          }, {
            chinese: '[ENHANCEMENT] 探索日志数据支持查看上下文',
            english: '[ENHANCEMENT] Exploring log data supports viewing context'
          }]
        }, {
          timestamp: 'Release 23.07 - Jul 2023',
          content: [{
            chinese: '[FEATURE] 新增资产发现功能',
            english: '[FEATURE] Added Asset Discovery feature'
          }, {
            chinese: '[FEATURE] 图表支持数据链接，构建链接时可以使用变量',
            english: '[FEATURE] Charts support data links, and variables can be used when building links'
          }, {
            chinese: '[ENHANCEMENT] 告警消息页面检索功能增强，支持模糊匹配，正向筛选，反向筛选',
            english: '[ENHANCEMENT] The retrieval function of the alert message page is enhanced, supporting fuzzy matching, forward filtering, and reverse filtering'
          }, {
            chinese: '[ENHANCEMENT] 探索页面支持表格、原始两种查看模式',
            english: '[ENHANCEMENT] The explore page supports table and raw viewing modes'
          }, {
            chinese: '[ENHANCEMENT] 表格列表显示顺序支持用户自定义',
            english: '[ENHANCEMENT] Table list display order supports user-defined'
          }]
        }, {
          timestamp: 'Release 23.04 - Apr 2023',
          content: [{
            chinese: '[FEATURE] 通过集成，您可以便捷的实现对新组件的指标采集和可视化',
            english: '[FEATURE] With integration, you can easily collect and visualize metrics for new modules'
          }, {
            chinese: '[FEATURE] 告警规则支持配置多个阈值',
            english: '[FEATURE] Alert rules support configuration multiple thresholds'
          }, {
            chinese: '[FEATURE] 您可以通过播放列表实现多个仪表盘循环播放',
            english: '[FEATURE] You can achieve multiple dashboard loop playback through the playlist'
          }, {
            chinese: '[ENHANCEMENT] 业务系统拓扑图优化，简化操作以及支持更丰富的配置参数',
            english: '[ENHANCEMENT] Project topology optimization, simplifying operations and supporting more configuration parameters'
          }, {
            chinese: '[ENHANCEMENT] 仪表盘图表功能增强，如时序图表支持配置多个Y轴，统计图支持同比配置',
            english: '[ENHANCEMENT] Dashboard charts have been enhanced, such as timing charts that support multiple Y-axis configurations, and statistical charts that support year-on-year configurations'
          }]
        }, {
          timestamp: 'Release 23.01 - Jan 2023',
          content: [{
            chinese: '[FEATURE] SFTP文件管理功能，支持记录文件操作日志',
            english: '[FEATURE] SFTP file management function, support recording file operation log'
          }, {
            chinese: '[FEATURE] 仪表盘模板功能',
            english: '[FEATURE] Dashboard template features'
          }, {
            chinese: '[FEATURE] 仪表盘支持根据变量动态创建图表组',
            english: '[FEATURE] Dashboard supports dynamically creating chart groups based on variables'
          }, {
            chinese: '[FEATURE] 探索结果支持快照导出',
            english: '[FEATURE] Explore results support snapshot export'
          }, {
            chinese: '[ENHANCEMENT] 日志监控支持kubernetes服务发现',
            english: '[ENHANCEMENT] Log monitoring supports kubernetes service discovery'
          }, {
            chinese: '[ENHANCEMENT] 仪表盘快照导出优化',
            english: '[ENHANCEMENT] Dashboard snapshot export optimization'
          }]
        }, {
          timestamp: 'Release 22.10 - Oct 2022',
          content: [{
            chinese: '[FEATURE] 新增TSG appliance vsys配置同步',
            english: '[FEATURE] Add the configuration synchronization of TSG appliance vsys'
          }, {
            chinese: '[FEATURE] 资产支持添加评论',
            english: '[FEATURE] Assets support adding comments'
          }, {
            chinese: '[FEATURE] 增加记录规则，便于用户预先计算经常使用或计算量大的表达式，并将其结果保存为一组新的时序数据',
            english: '[FEATURE] Add recording rules, to facilitate users to calculate frequently used or compute-intensive expressions in advance, and save the results as a new set of time series'
          }, {
            chinese: '[FEATURE] 新增图表类型：气泡图，桑基图，排行图',
            english: '[FEATURE] Add chart types: bubble chart, Sankey diagram and ranking chart'
          }, {
            chinese: '[ENHANCEMENT] 优化页面加载动画效果',
            english: '[ENHANCEMENT] Optimize the animation of page loading'
          }, {
            chinese: '[ENHANCEMENT] 优化地址栏显示，便于用户分享查询信息',
            english: '[ENHANCEMENT] Optimize the display of the browser address bar, to facilitate users’ sharing of queried information'
          }]
        }, {
          timestamp: 'Release 22.07 - Aug 2022',
          content: [{
            chinese: '[FEATURE] 仪表盘增加快照导出功能',
            english: '[FEATURE] Add snapshot export to dashboards'
          }, {
            chinese: '[FEATURE] 仪表盘支持定义变量，变量可以在chart表达式中使用',
            english: '[FEATURE] Dashboards support defining variables, which can be used in chart expressions'
          }, {
            chinese: '[FEATURE] 仪表盘支持定时生成报告并通过邮件发送给接收人',
            english: '[FEATURE] Dashboards support scheduled generation of reports, which will be sent to receivers via email'
          }, {
            chinese: '[FEATURE] 列表文字支持快捷复制到剪切板',
            english: '[FEATURE] Texts on the list can be copied to clipboard using shortcuts'
          }, {
            chinese: '[ENHANCEMENT] 图表表达式增加是否启用配置项',
            english: '[ENHANCEMENT] Add whether to enable the configuration item for chart expressions'
          }, {
            chinese: '[ENHANCEMENT] 增加新增资产、新增业务系统等完成后的使用提示',
            english: '[ENHANCEMENT] Add a prompt that appears after an asset or a project is created'
          }]
        }, {
          timestamp: 'Release 22.05 - May 2022',
          content: [{
            chinese: '[FEATURE] Endpoint支持批量修改标签，是否启用采集',
            english: '[FEATURE] Endpoints support batch modification of label and whether to enable data gathering'
          }, {
            chinese: '[FEATURE] 仪表盘增加查看模式切换',
            english: '[FEATURE] Add view mode switch to dashboards'
          }, {
            chinese: '[FEATURE] 仪表盘增加用户收藏功能 ',
            english: '[FEATURE] Add user favorites to dashboards'
          }, {
            chinese: '[FEATURE] 分布式Ping，traceroute功能',
            english: '[FEATURE] Support distributed Ping and Traceroute'
          }, {
            chinese: '[ENHANCEMENT] 丰富告警消息详情页面显示内容',
            english: '[ENHANCEMENT] Enrich the content displayed in the alert details page'
          }]
        }, {
          timestamp: 'Release 22.02 - Feb 2022',
          content: [{
            chinese: '[FEATURE] 新增 密码策略 配置，支持密码长度，复杂度，有效性，重试次数等配置项',
            english: '[FEATURE] Add Password Policy configuration and support the configuration items including password length, complexity, effectiveness and retry times'
          }, {
            chinese: '[FEATURE] 丰富图表类型，新增hexgon, treemap, topology 等图表',
            english: '[FEATURE] Increase chart types, such as hexgon, treemap, and topology'
          }, {
            chinese: '[FEATURE] 支持自定义日期显示格式',
            english: '[FEATURE] Support custom date display format'
          }, {
            chinese: '[FEATURE] 新增license管理功能',
            english: '[FEATURE] Add license management'
          }, {
            chinese: '[FEATURE] 新增IP地址管理功能',
            english: '[FEATURE] Add IP address management'
          }, {
            chinese: '[FEATURE] 新增全局搜索功能',
            english: '[FEATURE] Add global search'
          }, {
            chinese: '[ENHANCEMENT] 优化表格图表类型配置及显示，支持多个表达式结果关联显示在同一个表格中',
            english: '[ENHANCEMENT] Improve the configuration and display for tables and support multiple expression results being associated and displayed in a same table'
          }, {
            chinese: '[ENHANCEMENT] 优化折线图，面积图图表类型显示，支持是否启用堆叠',
            english: '[ENHANCEMENT] Optimize the display of line charts and area charts, and support whether to enable stacking'
          }]
        }, {
          timestamp: 'Release 21.11 - Nov 2021',
          content: [{
            chinese: '[FEATURE] 资产、告警规则、模块等增加详细视图',
            english: '[FEATURE] Add detailed views to assets, alert rules and modules'
          }, {
            chinese: '[FEATURE] 增加个人中心，支持查看本人操作记录等信息',
            english: '[FEATURE] Add personal center and allow for viewing one’s own operational record, etc.'
          }, {
            chinese: '[ENHANCEMENT] 重构告警规则实现，统一指标、日志和SNMP trap告警规则定义',
            english: '[ENHANCEMENT] Reconstruct alert rule implementation and unify the alert rule definition of metrics, logs and SNMP trap'
          }, {
            chinese: '[ENHANCEMENT] 资产支持批量修改标签，密码等',
            english: '[ENHANCEMENT] Assets support batch modification of tags and passwords'
          }]
        }, {
          timestamp: 'Release 21.09 - Sep 2021',
          content: [{
            chinese: '[FEATURE] 集中的日志数据观测',
            english: '[FEATURE] Centralized observation of log data'
          }, {
            chinese: '[FEATURE] 资产支持父子数据关联',
            english: '[FEATURE] Assets support parent-child data association'
          }, {
            chinese: '[[FEATURE] 双因素认证',
            english: '[FEATURE] Two-factor Authentication'
          }, {
            chinese: '[FEATURE] 支持创建图表模板',
            english: '[FEATURE] Support creating chart templates'
          }, {
            chinese: '[ENHANCEMENT] 优化折线图表类型显示效果',
            english: '[ENHANCEMENT] Improve the display of line charts'
          }, {
            chinese: '[ENHANCEMENT] 优化图表排列方式',
            english: '[ENHANCEMENT] Optimize chart layout'
          }]
        }, {
          timestamp: 'Release 21.07 - Jul 2021',
          content: [{
            chinese: '[FEATURE] 系统初始化配置功能，方便用户首次部署配置',
            english: '[FEATURE] Initialize system configuration to make users’ first deployment configuration easier'
          }, {
            chinese: '[FEATURE] 使用向导功能',
            english: '[FEATURE] Add usage wizard'
          }, {
            chinese: '[FEATURE] NZ-AGENT组件实现一键部署',
            english: '[FEATURE] Allow for one-touch deployment of NZ-AGENT'
          }, {
            chinese: '[ENHANCEMENT] UI界面优化',
            english: '[ENHANCEMENT] Enhance UI'
          }]
        }, {
          timestamp: 'Release 21.04 - Apr 2021',
          content: [{
            chinese: '[FEATURE] UI界面重构',
            english: '[FEATURE] Reconstruct UI'
          }, {
            chinese: '[FEATURE] 系统拓扑图功能',
            english: '[FEATURE] Add the system topology map'
          }, {
            chinese: '[FEATURE] 堡垒机操作录像及回放功能',
            english: '[FEATURE] Support the recording and playback of bastion host’s operations'
          }, {
            chinese: '[ENHANCEMENT] 优化堡垒机命令解析方式，使命令解析结果更准确',
            english: '[ENHANCEMENT] Optimize the parsing method of bastion host’s commands for the parsed results to be more accurate'
          }]
        }, {
          timestamp: 'Release 2.0 - Jul 2020',
          content: [{
            chinese: '[FEATURE] 系统概览功能',
            english: '[FEATURE] Add system overview'
          }, {
            chinese: '[FEATURE] 告警规则查看详情',
            english: '[FEATURE] Add a detail view to alert rules'
          }, {
            chinese: '[FEATURE] 列表数据批量导入导出功能',
            english: '[FEATURE] The lists can be imported and exported in batch'
          }, {
            chinese: '[ENHANCEMENT] 列表字段支持排序',
            english: '[ENHANCEMENT] Support field ranking list'
          }, {
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
