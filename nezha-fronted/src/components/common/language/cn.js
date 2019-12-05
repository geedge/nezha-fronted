import zhLocale from 'element-ui/lib/locale/lang/zh-CN' //引入element语言包
const cn = {
  overall:{
    dashboard:'仪表盘',
    project:'工程',
    asset:'资产',
    create: '新增',
    edit: '修改',
    delete: '删除',
    esc: '取消',
    cancel: '取消',
    save: '保存',
    search: '搜索'
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
    }
  },
  ...zhLocale
}

export default cn;
