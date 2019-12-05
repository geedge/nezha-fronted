import enLocale from 'element-ui/lib/locale/lang/en' //引入element语言包
const en = {
  overall:{
    dashboard:'dashboard',
    project:'project',
    asset:'asset',
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
      assetType: 'assetType',
      Device: 'Device SN',
      IP: 'IP',
      assetState: 'assetState',
      Module: 'Module',
      Alarm: 'Alarm',
      dataCenter: 'dataCenter',
      cabinet: 'cabinet',
      model: 'model',
      manufacturer: 'manufacturer',
      procurementDate: '采购日期',
      warrantyDate: '保修截止期',
      deviceDuty: '设备责任人',
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
    }
  },
  ...enLocale
}

export default en;
