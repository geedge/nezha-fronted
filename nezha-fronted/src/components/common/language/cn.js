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
  asset:{
    tableTitle:[
      {
        label: 'ID',
        prop: 'ID',
        show: true,
      }, {
        label: '资产类型',
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
        label: '项目名称',
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
