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
