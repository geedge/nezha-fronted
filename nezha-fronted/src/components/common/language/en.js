import enLocale from 'element-ui/lib/locale/lang/en' //引入element语言包
const en = {
  overall:{
    dashboard:'dashboard',
    project:'project',
    alarm: "alarm",
    asset:'asset',
    config:'config',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    esc: 'Esc',
    cancel: 'Cancel',
    save: 'Save',
    search: 'Search'
  },
  asset:{
    tableTitle: {
      id: 'ID',
      assetType: '资产类型',
      device: 'Device SN',
      ip: 'IP',
      assetState: '资产状态',
      module: 'Module',
      alarm: 'Alarm',
      dataCenter: '数据中心',
      cabinet: '机柜',
      model: '型号',
      manufacturer: '厂商',
      procurementDate: '采购日期',
      warrantyDate: '保修截止期',
      deviceDuty: '设备责任人',
      option: "Option"
    },
    tagTableTitle: {
      projectName: '项目名称',
      moduleName: 'Module Name',
      endPoint: 'EndPoint',
      alarm: 'Alarm',
    },
  },
  config: {
    account: {
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
      //侧滑框
      promId: "Prometheus Server ID",
      createProm: "Create Prometheus Server",
      editProm: "Edit Prometheus Server"
    },
  },
  alarm: {
    alarmList: "Alarm List",
    alarmConfig: "Alarm Config",
    alarmName: "Alarm Name",
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
      projectAlarm: "Project Alarm",
      moduleAlarm: "Module Alarm",
      deviceAlarm: "Device Alarm",
      pending: "Pending",
      expired: "Expired"
    },
    config: {
      name: "Name",
      receiver: "Receiver",
      expr: "Expr",
      for: "For",
      option: "Option",
      alarmConfig: "Alarm Config",
      createAlarmConfig: "Create Alarm Config",
      editAlarmConfig: "Edit Alarm Config",
    }
  },
  ...enLocale
}

export default en;
