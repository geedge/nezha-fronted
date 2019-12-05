import enLocale from 'element-ui/lib/locale/lang/en' //引入element语言包
const en = {
  overall:{
    dashboard:'dashboard',
    project:'project',
    asset:'asset'
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
  ...enLocale
}

export default en;