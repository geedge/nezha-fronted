import zhLocale from 'element-ui/lib/locale/lang/zh-CN' //引入element语言包
const cn = {
  overall: {
    dashboard: '仪表盘',
    project: '工程',
    alert: "告警",
    asset: '资产',
    config: '设置',
    create: '新增',
    edit: '修改',
    delete: '删除',
    esc: '取消',
    cancel: '取消',
    save: '保存',
    search: '搜索',
    add: '新增',
    option: "操作"
  },
  dashboard:{
    title:'仪表盘',
    panel:{
      title:'看板',
      searchItem:{
        name:'标题'
      },
      //面板-侧滑框
      createPanelTitle: "创建面板",
      selectPanelTitle:"选择面板",
      createPanelTitleSec:"创建新面板",
      editPanelTitle: "编辑面板",
      panelForm:{
        panelName:"面板名称" ,
        panelId:"ID"
      } ,
      //图表-侧滑框
      createChartTitle: "Create Chart",
      editChartTitle: "Edit Chart",
      chartForm:{
        chartId:"ID",
        chartName:"图表名称",
        type:"类型",
        typeVal:{
          line:{
            label:"曲线"
          },
          bar:{
            label:"柱状图"
          },
          table:{
            label:"表格",
          }
        },
        width:"宽度",
        high:"高度",
        metric:"指标",
        addMetric:"添加指标",
      },
      chartTableColumn:{
        metric:'指标',
        label:'标签',
        time:'时间',
        value:'值',
      },
      startTime:'开始时间',
      endTime:'结束时间',
      to:'至',
      recOne:'近1小时',
      recFour:'近4小时',
      recOneDay:'近1日',
      yesterday:'昨日',
      recSevenDay:'近7日',
      recOneMonth:'近一个月',
      curMonth:'本月',
      lastMonth:'上月',
      refreshInterval:{
        never:'从不',
        oneMinute:'1分钟',
        threeMinutes:'3分钟',
        fiveMinutes:'5分钟',
        tenMinutes:'10分钟',
      },
      view:'查看',
      confirm:'确 定',
      cancel:'取 消'
    },
    metric:{
      name:"指标名称",
      normal:"Normal",
      expert:"Expert",
      label:"指标标签",
      addMetric:"添加指标",
      expertTip:"请输入表达式",
      goPanelTip:"是否前去看板,查看创建的图表？",
      previewChart:"预览图表",
      singleChartShow:"单图展示",
      multiChartsShow:"多图展示",
      createPanel:"创建面板",
      selectPanel:"选择已有面板",
      saveChartToPanel:"保存图表到看板"
    },
    metricPreview:{
      title:'指标预览',
    },
    refresh:'刷新',
    edit:'编辑',
    delete:'删除',
    screen:'全屏'
  },
  asset: {
    tableTitle: {
      id: 'ID',
      assetType: '资产类型',
      device: 'Device SN',
      ip: 'IP',
      assetState: '资产状态',
      module: 'Module',
      alert: 'alert',
      dataCenter: '数据中心',
      cabinet: '机柜',
      model: '型号',
      manufacturer: '厂商',
      procurementDate: '采购日期',
      warrantyDate: '保修截止期',
      deviceDuty: '设备责任人',
      option: '操作',
    },
    tagTableTitle: {
      projectName: '项目名称',
      moduleName: 'Module Name',
      endPoint: 'EndPoint',
      alert: 'alert',
    },
  },
  config: {
    account: {
      //列表表头
      account: "用户",
      language: "语言",
      receiver: "用户组",
      createTime: "创建时间",
      enable: "可用",
      option: "操作",

      //侧滑框
      accountId: "用户ID",
      createAccount: "新增用户",
      editAccount: "修改用户",
      notCurrentlySupport: '暂不支持'
    },
    promServer: {
      //侧滑框
      promId: "Prometheus Server ID",
      createProm: "新增Prometheus Server",
      editProm: "修改Prometheus Server"
    },
  },
  alert: {
    alert: "告警",
    alertList: "告警列表",
    alertConfig: "告警设置",
    list: {
      alertName: "告警名称",
      linkedId: "关联ID",
      severity: "告警级别",
      type: "类型",
      summary: "摘要",
      description: "描述",
      state: "状态",
      startAt: "时间",
      endAt: "消除时间",
      charts: "图表",

      //表内容
      projectalert: "Project Alert",
      modulealert: "Module Alert",
      devicealert: "Device Alert",
      pending: "Pending",
      expired: "Expired"
    }
  },
  project: {
    endpoint: {
      endpoint: "Endpoint",
      endpointId: "Endpoint ID",
      host: "Host",
      port: "Port",
      param: "Param",
      path: "Path",
      asset: "Asset",
      lastUpdate: "Last Update",
    },
    metrics: "Metrics",
  },
  ...zhLocale
}

export default cn;
