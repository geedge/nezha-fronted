<template>
  <div class="about">
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
        <el-timeline v-my-loading="loading">
          <!-- v-if="!noData && timeLineData.length" -->
          <el-timeline-item
           v-for="(item) in activities"
           :key="item.id"
           :timestamp="item.timestamp ? item.timestamp : ''"
            placement="top"
            >
              <div class="about-summary" v-for="(val) in item.content" :key="val.chinese">
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
      language: '',
      version: {
        nezha: { name: '', version: '' },
        components: [{ name: '', version: '' }]
      },
      activities: [{
        timestamp: 'Release 22.08 - Aug 2022',
        content: [{
          id: 1,
          chinese: '[FEATURE] 仪表盘增加快照导出功能'
        }, {
          id: 2,
          chinese: '[FEATURE] 仪表盘支持定义变量，变量可以在chart表达式中使用'
        }, {
          id: 3,
          chinese: '[FEATURE] 仪表盘支持定时生成报告并通过邮件发送给接收人'
        }, {
          id: 4,
          chinese: '[FEATURE] 列表文字支持快捷复制到剪切板'
        }, {
          id: 5,
          chinese: '[ENHANCEMENT] 图表表达式增加是否启用配置项'
        }, {
          id: 6,
          chinese: '[ENHANCEMENT] 增加新增资产、新增业务系统等完成后的使用提示'
        }]
      }, {
        timestamp: 'Release 22.05 - May 2022',
        content: [{
          id: 7,
          chinese: '[FEATURE] Endpoint支持批量修改标签，是否启用采集'
        }, {
          id: 8,
          chinese: '[FEATURE] 仪表盘增加查看模式切换'
        }, {
          id: 9,
          chinese: '[FEATURE] 仪表盘增加用户收藏功能 '
        }, {
          id: 10,
          chinese: '[FEATURE] 分布式Ping，traceroute功能'
        }, {
          id: 11,
          chinese: '[ENHANCEMENT] 丰富告警消息详情页面显示内容'
        }]
      }, {
        timestamp: 'Release 22.02 - Feb 2022',
        content: [{
          id: 12,
          chinese: '[FEATURE] 新增 密码策略 配置，支持密码长度，复杂度，有效性，重试次数等配置项'
        }, {
          id: 13,
          chinese: '[FEATURE] 丰富图表类型，新增hexgon, treemap, topology 等图表'
        }, {
          id: 14,
          chinese: '[FEATURE] 支持自定义日期显示格式'
        }, {
          id: 15,
          chinese: '[FEATURE] 新增license管理功能'
        }, {
          id: 16,
          chinese: '[FEATURE] 新增IP地址管理功能'
        }, {
          id: 17,
          chinese: '[FEATURE] 新增全局搜索功能'
        }, {
          id: 18,
          chinese: '[ENHANCEMENT] 优化表格图表类型配置及显示，支持多个表达式结果关联显示在同一个表格中'
        }, {
          id: 19,
          chinese: '[ENHANCEMENT] 优化折线图，面积图图表类型显示，支持是否启用堆叠'
        }]
      }, {
        timestamp: 'Release 21.11 - Nov 2021',
        content: [{
          id: 20,
          chinese: '[FEATURE] 资产、告警规则、模块等增加详细视图'
        }, {
          id: 21,
          chinese: '[FEATURE] 增加个人中心，支持查看本人操作记录等信息'
        }, {
          id: 22,
          chinese: '[ENHANCEMENT] 重构告警规则实现，统一指标、日志和SNMP trap告警规则定义'
        }, {
          id: 23,
          chinese: '[ENHANCEMENT] 资产支持批量修改标签，密码等'
        }]
      }, {
        timestamp: 'Release 21.09 - Sep 2021',
        content: [{
          id: 24,
          chinese: '[FEATURE] 集中的日志数据观测'
        }, {
          id: 25,
          chinese: '[FEATURE] 资产支持父子数据关联'
        }, {
          id: 26,
          chinese: '[[FEATURE] 双因素认证'
        }, {
          id: 27,
          chinese: '[FEATURE] 支持创建图表模板'
        }, {
          id: 28,
          chinese: '[ENHANCEMENT] 优化折线图表类型显示效果'
        }, {
          id: 29,
          chinese: '[ENHANCEMENT] 优化图表排列方式'
        }]
      }, {
        timestamp: 'Release 21.07 - Jul 2022',
        content: [{
          id: 30,
          chinese: '[FEATURE] 系统初始化配置功能，方便用户首次部署配置'
        }, {
          id: 31,
          chinese: '[FEATURE] 使用向导功能'
        }, {
          id: 32,
          chinese: '[FEATURE] NZ-AGENT组件实现一键部署'
        }, {
          id: 33,
          chinese: '[ENHANCEMENT] UI界面优化'
        }]
      }, {
        timestamp: 'Release 21.04 - Apr 2021',
        content: [{
          id: 34,
          chinese: '[FEATURE] UI界面重构'
        }, {
          id: 35,
          chinese: '[FEATURE] 系统拓扑图功能'
        }, {
          id: 36,
          chinese: '[FEATURE] 堡垒机操作录像及回放功能'
        }, {
          id: 37,
          chinese: '[ENHANCEMENT] 优化堡垒机命令解析方式，使命令解析结果更准确'
        }]
      }, {
        timestamp: 'Release 2.0 - Jul 2020',
        content: [{
          id: 38,
          chinese: '[FEATURE] 系统概览功能'
        }, {
          id: 39,
          chinese: '[FEATURE] 告警规则查看详情'
        }, {
          id: 40,
          chinese: '[FEATURE] 列表数据批量导入导出功能'
        }, {
          id: 41,
          chinese: '[ENHANCEMENT] 列表字段支持排序'
        }, {
          id: 42,
          chinese: '[ENHANCEMENT] 图表实现调整位置和大小'
        }, {
          id: 43,
          chinese: '[ENHANCEMENT] 列表字段支持排序'
        }]
      }]
    }
  },
  methods: {
    getVersion () {
      this.$get('/about').then(response => {
        this.version = response.data
      })
    }
  },
  mounted () {
    this.getVersion()
    this.language = localStorage.getItem('nz-language') || 'en'
  }
}
</script>
