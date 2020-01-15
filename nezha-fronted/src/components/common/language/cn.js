import zhLocale from 'element-ui/lib/locale/lang/zh-CN' //引入element语言包
const cn = {
  overall:{
    dashboard:'仪表盘',
    project:'系统',
    alert: "告警",
    asset:'资产',
    config:'设置',
    create: '新增',
    edit: '编辑',
    delete: '删除',
    esc: '取消',
    cancel: '取消',
    save: '保存',
    search: '搜索',
    add: "新增",
    option: "操作",
    clearAll: "清空",
    clear: "清除",
    name: '名称',
    cover: '覆盖',
    signOut: '登出',
    select: '选择',
    ok: 'Ok',
    all: '全选',
    other: "其他"
  },
  dashboard:{
    title:'仪表盘',
    panel:{
      title:'面板',
      searchItem:{
        name:'名称'
      },
      //面板-侧滑框
      createPanelTitle: "新增面板",
      selectPanelTitle:"选择面板",
      createPanelTitleSec:"新增面板",
      editPanelTitle: "面板",
      panelForm:{
        panelName:"面板名称",
        panelId:"ID"
      },
      //图表-侧滑框
      createChartTitle: "新增图表",
      editChartTitle: "编辑图表",
      chartForm:{
        chartId:"ID",
        chartName:"图表名称",
        type:"类别",
        typeVal:{
          line:{
            label:"线"
          },
          bar:{
            label:"柱"
          },
          table:{
            label:"表格"
          }
        },
        width:"宽",
        high:"高",
        metric:"Metric",
        addMetric:"新增Metric",
      },
      chartTableColumn:{
        metric:'metric',
        label:'标签',
        time:'时间',
        value:'值',
      },
      startTime:'开始时间',
      endTime:'结束时间',
      to:'至',
      recOne:'最近1小时',
      recFour:'最近4小时',
      recOneDay:'最近1天',
      yesterday:'昨天',
      recSevenDay:'最近1星期',
      recOneMonth:'最近1月',
      curMonth:'本月',
      lastMonth:'上月',
      refreshInterval:{
        never:'从不',
        oneMinute:'1 分',
        threeMinutes:'3 分',
        fiveMinutes:'5 分',
        tenMinutes:'10 分',
      },
      view:'查看',
      confirm:'Ok',
      cancel:'取消'
    },
    metric:{
      name:"Metric",
      normal:"Normal",
      expert:"Expert",
      label:"MetricLabel",
      addMetric:"Create Metric",
      expertTip:"Please enter an expression",
      goPanelTip:"Go to the panel to view the created chart ?",
      previewChart:"Preview Chart",
      singleChartShow:"Single Graph Display",
      multiChartsShow:"Multi Graph Display",
      createPanel:"Create Panel",
      selectPanel:"Select Panel",
      saveChartToPanel:"Save Chart To Panel"
    },
    metricPreview:{
      title:'Metric Preview',
    },
    refresh:'refresh',
    edit:'edit',
    delete:'delete',
    screen:'fullScreen'

  },
  validate: { //校验规则
    required: '必填项',
    number: '必须是数字',
    email:'不合法的E-mail地址',
    tel:'不合法的电话号码',
    host:'不合法的IP',
    fileSize:'文件过大',
    config: {
      account: {

      }
    }
  },
  search: {
    searchTip: '点击或回车执行搜索',
    recentSearch: '搜索记录',
    noRecentSearch: '无搜索记录'
  },
  tip: {
    confirmDelete: "确认删除吗？",
    assetConfirmDelete: '关联的Endpoint和告警将会被删除，确认删除吗？',
    yes: "是",
    no: "否",
    deleteSuccess: "删除成功",
    saveSuccess: "保存成功",
    coverSuccess: '覆盖成功',
    refreshLater:'请稍后刷新'
  },
  asset:{
    asset: '资产',
    EditAsset:'Edit Asset',
    createAssetTab:{
      title:'新增资产',
      sn:'SN',
      host:'Host',
      state:'状态',
      selectTip:'请选择',
      inStock: '在库',
      notInStock: '出库',
      assetInfo:'资产信息',
      assetType:'资产类型',
      assetTypeTab:{
        assetType:'资产类型',
        addAssetType:'新增资产类型',
        existAssetType:'已存在的资产类型'
      },
      vendor:'厂商/型号',
      vendorTab:{
        vendor:'厂商/型号',
        vendorName:'新厂商',
        existVendor:'已有厂商',
        modelName:'新型号',
        existModel:'已有型号'
      },
      purchaseDate:'购买日期',
      dataSelectTip:'请选择日期',
      dc:'DC',
      dcName:'DC名称',
      AddIdcTab:{
        title:'新增DC',
        dcName:'DC名称',
        location:'地区',
        principal:'负责人',
        tel:'电话'
      },
      editIdcTab:{
        title:'编辑DC',
        dcName:'DC名称',
        location:'地区',
        principal:'负责人',
        tel:'电话'
      },
      location:'地区',
      principal:'负责人',
      tel:'电话',
      cabinet: '机柜',
      AddCabinetTab:{
        title:'新增机柜',
        name:'名称',
        uSize:'U位',
        remark:'描述',
        DC:'DC',
      },
      editCabinetTab:{
        title:'编辑机柜',
        name:'名称',
        uSize:'U位',
        remark:'描述',
        DC:'DC',
      },
      uSize:'U位',
      remark:'描述',
      cli:'CLI账号',
      loginType:'登录类型',
      password:'密码',
      ssh:'SSH-Key',
      account:'用户名',
      port:'端口',
      upload:'上传',
      clickToUpload:'上传',
      clickToCover:'覆盖',
      sshKeyWasConfig:'SSH-KEY已配置'
    },
    editAssetTab:{
      title:'新增资产',
      sn:'SN',
      host:'Host',
      state:'状态',
      modelId:'组件',
      alert:'告警信息',
      assetInfo:'资产信息',
      assetType:'资产类型',
      vendor:'厂商/型号',
      vendorTab:{
        vendor:'厂商/型号',
        vendorName:'新厂商',
        existVendor:'已有厂商',
        modelName:'新型号',
        existModel:'已有型号'
      },
      purchaseDate:'购买日期',
      dataSelectTip:'请选择日期',
      dc:'DC',
      dcName:'DC名称',
      AddIdcTab:{
        title:'新增DC',
        dcName:'DC名称',
        location:'地区',
        principal:'负责人',
        tel:'电话'
      },
      editIdcTab:{
        title:'编辑DC',
        dcName:'DC名称',
        location:'地区',
        principal:'负责人',
        tel:'电话'
      },
      location:'地区',
      principal:'负责人',
      tel:'电话',
      cabinet: '机柜',
      AddCabinetTab:{
        title:'新增机柜',
        name:'名称',
        uSize:'U位',
        remark:'描述',
        DC:'DC',
      },
      editCabinetTab:{
        title:'编辑机柜',
        name:'名称',
        uSize:'U位',
        remark:'描述',
        DC:'DC',
      },
      uSize:'U位',
      remark:'描述',
      cli:'CLI账号',
      loginType:'登录类型',
      password:'密码',
      ssh:'SSH-Key',
      account:'用户名',
      port:'端口',
      upload:'上传',
      clickToUpload:'上传',
    },
    tableTitle: {
      id: 'ID',
      assetType: '资产类型',
      device: 'SN',
      host: 'Host',
      assetState: '状态',
      modules: '组件',
      alerts: '告警信息',
      dataCenter: 'DC',
      cabinet: '机柜',
      model: '型号',
      manufacturer: '厂商',
      procurementDate: '购买日期',
      principal: '负责人',
      principalTel: '电话',
      option: "操作"
    },
    tagTableTitle: {
      projectName: '系统名称',
      moduleName: '组件名称',
      endPoint: 'EndPoint',
      alert: '告警',
    },

  },
  config: {
    config: "设置",
    account: {
      accountList: "用户列表",
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
      editAccount: "编辑用户",
      notCurrentlySupport: '暂不支持',
      password: '密码'
    },
    promServer: {
      promServerList: "Prometheus Server",
      //侧滑框
      promId: "Prometheus Server ID",
      createProm: "新增Prometheus Server",
      editProm: "修改Prometheus Server",
      type: "类别"
    },
  },
  alert: {
    alert: "告警",
    message: '信息',
    rule: '规则',
    alertList: "告警信息",
    alertConfig: "告警规则",
    alertName: "告警名称",
    severity: "等级",
    description: "描述",
    summary: "概要",
    startAt: "开始时间",
    endAt: "结束时间",
    list: {
      //表头
      linked: "关联",
      type: "类别",
      state: "状态",
      charts: "图表",

      //表内容
      projectAlert: "系统告警",
      moduleAlert: "组件告警",
      deviceAlert: "设备告警",
      pending: "待处理",
      expired: "已过期"
    },
    config: {
      name: "名称",
      receiver: "用户组",
      expr: "表达式",
      for: "For (s)",
      link: '关联',
      option: "操作",
      alertConfig: "告警规则",
      createAlertConfig: "新增告警规则",
      editAlertConfig: "修改告警规则",
      medium: "中",
      high: "高",
      low: "低",
      typeOption: {
        project: '系统',
        module: '组件',
        asset: '设备'
      }
    }
  },
  project: {
    project: {
      project: "系统",
      projectName: "系统名称",
      editProject: "编辑系统",
      description: "描述",
      createProject: "新增系统"
    },
    module: {
      module: "组件",
      moduleName: "组件名称",
      editModule: "编辑组件",
      description: "描述",
      createModule: "新增组件",
      tip: {
        defaultEndpointSet: "默认的Endpoint设置",
        relation: "组件关联的Endpoint将默认配置以下端口/路径/参数"
      }
    },
    endpoint: {
      createEndpoint: "新增Endpoint",
      editEndpoint: "编辑Endpoint",
      endpoint: "Endpoint",
      endpointId: "Endpoint ID",
      host: "Host",
      port: "端口",
      param: "参数",
      path: "路径",
      asset: "设备",
      lastUpdate: "最后更新时间",
      moduleParameter: "组件参数"
    },
    metrics: {
      metrics: "Metrics",
      name: '名称',
      type: '类型',
      description: '描述'
    }
  },
  ...zhLocale
}

export default cn;
