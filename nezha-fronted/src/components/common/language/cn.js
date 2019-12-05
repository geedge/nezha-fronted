import zhLocale from 'element-ui/lib/locale/lang/zh-CN' //引入element语言包
const cn = {
  overall: {
    dashboard: '仪表盘',
    project: '工程',
    asset: '资产',
    alarm: '警告'
  },
  asset: {
    tableTitle: {
      id: 'ID',
      assetType: '资产类型',
      Device: 'Device SN',
      IP: 'IP',
      assetState: '资产状态',
      Module: 'Module',
      Alarm: 'Alarm',
      dataCenter: '数据中心',
      cabinet: '机柜',
      model: '型号',
      manufacturer: '厂商',
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
  ...zhLocale
}

export default cn;