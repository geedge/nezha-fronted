import enLocale from 'element-ui/lib/locale/lang/en' //引入element语言包
const en = {
  overall:{
    dashboard:'dashboard',
    project:'project',
    asset:'asset'
  },
  asset:{
    tableTitle:[
      {
        label: 'ID',
        prop: 'ID',
        show: true,
      }, {
        label: 'Asset Type',
        prop: '资产类型',
        show: true,
      }, {
        label: 'Device SN',
        prop: 'Device SN',
        show: true,
      }, {
        label: 'IP',
        prop: 'IP',
        show: true,
      }, {
        label: '资产状态',
        prop: '资产状态',
        show: true,
      }, {
        label: 'Module',
        prop: 'Module',
        show: true,
      }, {
        label: 'Alarm',
        prop: 'Alarm',
        show: true,
      }, {
        label: '数据中心',
        prop: '数据中心',
        show: true,
      }, {
        label: '机柜',
        prop: '机柜',
        show: true,
      }, {
        label: '型号',
        prop: '型号',
        show: true,
      }, {
        label: '厂商',
        prop: '厂商',
        show: true,
      }, {
        label: '采购日期',
        prop: '采购日期',
        show: true,
      }, {
        label: '保修截止期',
        prop: '保修截止期',
        show: true,
      }, {
        label: '设备责任人',
        prop: '设备责任人',
        show: true,
      }
    ],
    tagTableTitle: [
      {
        label: 'Project Name',
        prop: 'projectName',
        show: true,
      }, {
        label: 'Module Name',
        prop: 'moduleName',
        show: true,
      }, {
        label: 'EndPoint',
        prop: 'endPoint',
        show: true,
      }, {
        label: 'Alarm',
        prop: 'alarm',
        show: true,
      },
    ]
  },
  ...enLocale
}

export default en;