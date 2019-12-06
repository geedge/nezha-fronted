import enLocale from 'element-ui/lib/locale/lang/en' //引入element语言包
const en = {
  overall:{
    dashboard:'dashboard',
    project:'project',
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
  ...enLocale
}

export default en;
