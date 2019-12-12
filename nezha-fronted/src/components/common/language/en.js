import enLocale from 'element-ui/lib/locale/lang/en' //引入element语言包
const en = {
  overall:{
    dashboard:'Dashboard',
    project:'Projects',
    alert: "Alert",
    asset:'Assets',
    config:'Config',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    esc: 'Esc',
    cancel: 'Cancel',
    save: 'Save',
    search: 'Search',
    add: "Add",
    option: "Option"
  },
  asset:{
    tableTitle: {
      id: 'ID',
      assetType: '资产类型',
      device: 'SN',
      host: 'Host',
      assetState: 'State',
      module: 'Module',
      alert: 'Alert',
      dataCenter: '数据中心',
      cabinet: '机柜',
      model: '型号',
      manufacturer: '厂商',
      procurementDate: '购买日期',
      principal: '责任人',
      principalTel: '责任人电话',
      option: "Option"
    },
    tagTableTitle: {
      projectName: '项目名称',
      moduleName: 'Module Name',
      endPoint: 'EndPoint',
      alert: 'alert',
    },
  },
  config: {
    config: "Config",
    account: {
      accountList: "Account List",
      //列表表头
      account: "Account",
      language: "Language",
      receiver: "Receiver",
      createTime: "Create Time",
      enable: "Enable",
      option: "Option",

      //侧滑框
      accountId: "Accound ID",
      createAccount: "Create Account",
      editAccount: "Edit Account",
      notCurrentlySupport: 'Not currently supported'
    },
    promServer: {
      promServerList: "Prometheus Server",
      //侧滑框
      promId: "Prometheus Server ID",
      createProm: "Create Prometheus Server",
      editProm: "Edit Prometheus Server"
    },
  },
  alert: {
    alert: "Alert",
    alertList: "Alert List",
    alertConfig: "Alert Config",
    alertName: "Alert Name",
    severity: "Severity",
    description: "Desc",
    summary: "Summary",
    startAt: "Time",
    endAt: "End Time",
    list: {
      //表头
      linkedId: "Linked ID",
      type: "Type",
      state: "Status",
      charts: "Charts",

      //表内容
      projectalert: "Project Alert",
      modulealert: "Module Alert",
      devicealert: "Device Alert",
      pending: "Pending",
      expired: "Expired"
    },
    config: {
      name: "Name",
      receiver: "Receiver",
      expr: "Expr",
      for: "For",
      option: "Option",
      alertConfig: "Alert Config",
      createalertConfig: "Create Alert Config",
      editalertConfig: "Edit Alert Config",
    }
  },
  project: {
    endpoint: {
      createEndpoint: "Create Endpoint",
      editEndpoint: "Edit Endpoint",
      endpoint: "Endpoint",
      endpointId: "Endpoint ID",
      host: "Host",
      port: "Port",
      param: "Param",
      path: "Path",
      asset: "Asset",
      lastUpdate: "Last Update",
    },
    metrics: "Metrics"
  },
  ...enLocale
}

export default en;
