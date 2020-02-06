import enLocale from 'element-ui/lib/locale/lang/en' //引入element语言包
const en = {
//命名原则
//创建使用New
//表示创建状态用Created，如创建时间Created Time
//告警使用Alert，而不是Alarm
//账号用Account，username、password等都属于account的一部分
// A user is the person who uses the account, the account is an inanimate object that is merely registered to an e-mail address.
  overall:{
    dashboard:'Dashboards',//'仪表盘'
    project:'Projects',//'系统'
    alert: 'Alerts',//"告警"
    asset:'Assets', //'资产'
    config:'Settings', //'设置'
    create: 'New', //'新增'
    edit: 'Edit', //'编辑'
    delete: 'Delete', //'删除'
    view: 'View',
    esc: 'Cancel', //'取消'
    cancel: 'Cancel', //'取消'
    save: 'Save', //'保存'
    search: 'Search', //'搜索'
    add: 'Create', //"新增"
    option: 'Operation', //"操作"
    clearAll: 'Clear All', //"清空"
    clear: 'Clear', //"清除"
    name: 'Name', //'名称'
    cover: 'Override', //'覆盖'
    signOut: 'Logout',//'登出'
    select: 'Select',//'选择'
    ok: 'Ok',//OK
    all: 'All',//'全选'
    other: 'Others',//"其他"
    query: 'Query', //查询
    back: 'Back', //返回
    unavailable: 'Unavailable',
    available: 'Available'
  },
  dashboard:{
    title:'Dashboard',
    panel:{
      title:'Panel', //'面板'
      searchItem:{
        name:'name'
      },
      //面板-侧滑框
      createPanelTitle: 'New Panel', //"新增面板"
      selectPanelTitle:'Select', //"选择面板"
      createPanelTitleSec:'New Panel',//"新增面板"
      editPanelTitle: 'Panel', //"面板"
      panelForm:{
        panelName:'Panel Name', //"面板名称"
        panelId:"ID" //ID
      },
      //图表-侧滑框
      createChartTitle: 'New Chart', //"新增图表"
      editChartTitle: 'Edit',//"编辑图表"
      chartForm:{
        chartId:"ID",
        chartName:"Chart Name",
        type:"Type",
        typeVal:{
          line:{
            label:'Line Chart' //"曲线图"
          },
          bar:{
            label:'Histogram' //"柱状图"
          },
          table:{
            label:'Table' //"表格"
          }
        },
        width:'Width', //"宽"
        high:'High', //"高"
        metric:'Metric', //"指标"
        addMetric:'Add metric', //"添加指标"
      },
      chartTableColumn:{
        metric:'Metric', //'指标'
        label:'Label', //'标签'
        time:'Time', //'时间'
        value:'Value', //'值'
      },
      startTime:'Start time', //'开始时间'
      endTime:'End time',//'结束时间'
      to:'To', //To
      recOne:'Last 1 hour', //'最近1小时'
      recFour:'Last 4 hours',//'最近4小时'
      recOneDay:'Last 1 day',//'最近1日'
      yesterday:'Yesterday', //'昨日'
      recSevenDay:'最近7日',// Last 7 days
      recOneMonth:'Last 1 month',//'最近1月'
      curMonth:'This month',//'本月'
      lastMonth:'Last month',//'上月'
      refreshInterval:{
        never:'Never', //'从不'
        oneMinute:'1 minute', // 1 minute
        threeMinutes:'3 minutes', //'3分钟'
        fiveMinutes:'5 minutes', //'5分钟'
        tenMinutes:'10 minutes', //'10分钟'
      },
      view:'View',//'查看'
      confirm:'Ok',// OK
      cancel:'Cancel'//'取消'
    },
    metric:{
      name:'Metric Name', //"指标名称"
      normal:'Normal', //"普通"
      expert:"Expert",// Expert
      label:'Label', //"指标标签"
      addMetric:'Add Metric',//"添加指标"
      expertTip:'Add expression',//"请输入表达式"
      goPanelTip:"View created panel?",//View created panel?
      previewChart:'Preview',//"预览图表"
      singleChartShow:'Signle chart',//"单图展示"
      multiChartsShow:'Multiple charts',//"多图展示"
      createPanel:'New panel', //"创建面板"
      selectPanel:'Exist panel',//"选择已有面板"
      saveChartToPanel:"Save chart to panel"//Save chart to panel.
    },
    metricPreview:{
      title:'Metric preview',//'指标预览'
    },
    refresh:'Refresh',//'刷新'
    edit:'Edit',//'编辑'
    delete:'Delete',//'删除'
    screen:'Full screen'//'全屏'
  },
  validate: { //校验规则
    required: 'Required',//'必填项'
    number: 'Numberic',//'必须是数字'
    email:'Invalid email',//'不合法的E-mail地址'
    tel:'Invalid phone number',//'不合法的电话号码'
    host:'Invalid IP',//'不合法的IP'
    fileSize:'文件过大',//File exceed max size.
    port:'Invalid Port',
    config: {
      account: {

      }
    }
  },
  search: {
    searchTip: 'Enter to search',//'点击或回车执行搜索'
    recentSearch: 'Search history',//'搜索记录'
    noRecentSearch: 'No Recent Search'//'无搜索记录'
  },
  tip: {
    confirmDelete: "Are you sure you want to delete?", //Are you sure you want to delete?
    assetConfirmDelete: 'Related endpoints and alerts will be removed, are you sure you want to delete this asset?',//Related endpoints and alerts will be removed, are you sure you want to delete this asset?
    yes: 'Yes', //"是"
    no: "No",//No
    deleteSuccess: 'Delete success',//"删除成功"
    saveSuccess: 'Save success', //"保存成功"
    coverSuccess: 'Override success',//'覆盖成功'
    refreshLater:'Refresh later'//'请稍后刷新'
  },
  asset:{
    asset: 'Asset',//'资产'
    EditAsset:'Edit asset',//'编辑资产'
    createAssetTab:{
      title:'New asset',//'新增资产'
      sn:'SN',//SN
      host:'Host',//'Host'
      state:'Status',//'状态'
      selectTip:'Please select',//'请选择'
      inStock: 'In stock',//'在库'
      notInStock: 'Not in stock',//'出库'
      assetInfo:'Asset information',//'资产信息'
      assetType:'Asset type',//'资产类型'
      assetTypeTab:{
        assetType:'Asset type',//'资产类型'
        addAssetType:'New asset type',//'新增资产类型'
        existAssetType:'Existed asset type'//'已存在的资产类型'
      },
      vendor:'Vendor',//'厂商/型号'
      vendorTab:{
        vendor:'Vendor/Model',//'厂商/型号'
        vendorName:'New vendor',//'新厂商'
        existVendor:'Existed vendor',//'已有厂商'
        modelName:'New model',//'新型号'
        existModel:'Existed model'//'已有型号'
      },
      purchaseDate:'Purchase date',//'购买日期'
      dataSelectTip:'Please select date',//'请选择日期'
      dc:'DC',
      dcName:'Datacenter name',//'DC名称'
      AddIdcTab:{
        title:'New Datacenter',//'新增DC'
        dcName:'Datacenter name',//'DC名称'
        location:'Location',//'地区'
        principal:'Principal',//'负责人'
        tel:'Telephone'//'电话'
      },
      editIdcTab:{
        title:'Edit Datacenter',//'编辑DC'
        dcName:'Datacenter name',//'DC名称'
        location:'Location',//'地区'
        principal:'Principal',//'负责人'
        tel:'Telephone'//'电话'
      },
      location:'Location',//'地区'
      principal:'Principal',//'负责人'
      tel:'Telephone',//'电话'
      cabinet: 'Cabinet',//'机柜'
      AddCabinetTab:{
        title:'New cabinet',//'新增机柜'
        name:'Name',//'名称'
        uSize:'U size',//'U位'
        remark:'Description',//'描述'
        DC:'DC',
      },
      editCabinetTab:{
        title:'Edit cabinet',//'编辑机柜'
        name:'Name',//'名称'
        uSize:'U size',//'U位'
        remark:'Description',//'描述'
        DC:'DC',
      },
      uSize:'U size',//'U位'
      remark:'Description',//'描述'
      cli:'CLI account',//'CLI账号'
      loginType:'Login type',//'登录类型'
      password:'Password',//'密码'
      ssh:'SSH key',//'SSH-Key'
      account:'User name',//'用户名'
      port:'Port',//'端口'
      upload:'Upload',//'上传'
      clickToUpload:'Upload',//'上传'
      clickToCover:'Cover',//'覆盖'
      sshKeyWasConfig:'SSH-KEY configured',//'SSH-KEY已配置'
      exporter:'Exporter'
    },
    editAssetTab:{
      title:'New asset',//'新增资产'
      sn:'SN',//SN
      host:'Host',//'Host'
      state:'State',//'状态'
      modelId:'Module',//'组件'
      alert:'Alert information',//'告警信息'
      assetInfo:'Asset information',//'资产信息'
      assetType:'Asset type',//'资产类型'
      vendor:'Vendor',//'厂商/型号'
      vendorTab:{
        vendor:'Vendor/Model',//'厂商/型号'
        vendorName:'New vendor',//'新厂商'
        existVendor:'Existed vendor',//'已有厂商'
        modelName:'New model',//'新型号'
        existModel:'Existed model'//'已有型号'
      },
      purchaseDate:'Purchase date',//'购买日期'
      dataSelectTip:'Please select date',//'请选择日期'
      dc:'DC',
      dcName:'DC name',//'DC名称'
      AddIdcTab:{
        title:'New Datacenter',//'新增DC'
        dcName:'DC name',//'DC名称'
        location:'Location',//'地区'
        principal:'Principal',//'负责人'
        tel:'Telephone'//'电话'
      },
      editIdcTab:{
        title:'Edit DC',//'编辑DC'
        dcName:'DC name',//'DC名称'
        location:'Location',//'地区'
        principal:'Principal',//'负责人'
        tel:'Telephone'//'电话'
      },
      location:'Location',//'地区'
      principal:'Principal',//'负责人'
      tel:'Telephone',//'电话'
      cabinet: 'Cabinet',//'机柜'
      AddCabinetTab:{
        title:'New cabinet',//'新增机柜'
        name:'Name',//'名称'
        uSize:'U size',//'U位'
        remark:'Description',//'描述'
        DC:'DC',//DC
      },
      editCabinetTab:{
        title:'Edit cabinet',//'编辑机柜'
        name:'Name',//'名称'
        uSize:'U size',//'U位'
        remark:'Description',//'描述'
        DC:'DC',//DC
      },
      uSize:'U size',//'U位'
      remark:'Description',//'描述'
      cli:'CLI account',//'CLI账号'
      loginType:'Login type',//'登录类型'
      password:'Password',//'密码'
      ssh:'SSH-Key',//'SSH-Key'
      account:'Username',//'用户名'
      port:'Port',//'端口'
      upload:'Upload',//'上传'
      clickToUpload:'Upload',//'上传'
    },
    tableTitle: {
      id: 'ID',//ID
      assetType: 'Asset type',//'资产类型'
      device: 'SN',//SN
      host: 'Host',//'Host'
      assetState: 'State',//'状态'
      modules: 'Module',//'组件'
      alerts: 'Alert information',//'告警信息'
      dataCenter: 'DC',//DC
      cabinet: 'Cabinet',//'机柜'
      model: 'Model',//'型号'
      manufacturer: 'Manufacturer',//'厂商'
      procurementDate: 'Purchase date',//'购买日期'
      principal: 'Principal',//'负责人'
      principalTel: 'Telephone',//'电话'
      option: 'Operation'//"操作"
    },
    tagTableTitle: {
      projectName: 'Project name',//'系统名称'
      moduleName: 'Module name',//'组件名称'
      endPoint: 'End point',//'EndPoint'
      alert: 'Alert',//'告警'
    },

  },
  config: {
    config: 'Settings',//"设置"
    account: {
      accountList: 'Account list',//"用户列表"
      //列表表头
      account: 'Account',//"用户"
      language: 'Language',//"语言"
      receiver: 'Account group',//"用户组"
      createTime: 'Create time',//"创建时间"
      enable: 'Available',//"可用"
      option: 'Operation',//"操作"
      //侧滑框//
      accountId: 'Account ID',//"用户ID"
      createAccount: 'New account',//"新增用户"
      editAccount: 'Edit account',//"编辑用户"
      notCurrentlySupport: 'Not available',//'暂不支持'
      password: 'Password'//'密码'
    },
    promServer: {
      promServerList: 'Prometheus server',//"Prometheus Server"
      //侧滑框
      promId: 'Prometheus server ID',//"Prometheus Server ID"
      createProm: 'New prometheus server',//"新增Prometheus Server"
      editProm: 'Edit prometheus server',//"修改Prometheus Server"
      type: 'Type',//"类别"
      checkTime: 'Check time'
    },
  },
  alert: {
    alert: 'Alert',//"告警"
    message: 'Message',//'信息'
    rule: 'Rule',//'规则'
    alertList: 'Alert information',//"告警信息"
    alertConfig: 'Alert rule',//"告警规则"
    alertName: 'Alert name',//"告警名称"
    severity: 'Level',//"等级"
    description: 'Description',//"描述"
    summary: 'Summary',//"概要"
    startAt: 'Start time',//"开始时间"
    endAt: 'End time',//"结束时间"
    list: {
      //表头
      linked: 'Linked',//"关联"
      type: 'Type',//"类别"
      state: 'State',//"状态"
      charts: 'Charts',//"图表"
      //表内容
      projectAlert: 'Project alert',//"系统告警"
      moduleAlert: 'Module alert',//"组件告警"
      deviceAlert: 'Device alert',//"设备告警"
      pending: 'Pending',//"待处理"
      expired: 'Expired'//"已过期"
    },
    config: {
      name: 'Name',//"名称"
      receiver: 'User group',//"用户组"
      expr: 'Expression',//"表达式"
      for: "For (s)",//For (s)
      link: 'Link',//'关联'
      option: 'Operation',//"操作"
      alertConfig: 'Alert rule',//"告警规则"
      createAlertConfig: 'New alert rule',//"新增告警规则"
      editAlertConfig: 'Edit alert rule',//"修改告警规则"
      medium: 'Medium',//"中"
      high: 'High',//"高"
      low: 'Low',//"低"
      typeOption: {
        project: 'Project',//'系统'
        module: 'Module',//'组件'
        asset: 'Device'//'设备'
      }
    }
  },
  project: {
    project: {
      project: 'Project',//"系统"
      projectName: 'Project name',//"系统名称"
      editProject: 'Edit project',//"编辑系统"
      description: 'Description',//"描述"
      createProject: 'New project'//"新增系统"
    },
    module: {
      module: 'Module',//"组件"
      moduleName: 'Module name',//"组件名称"
      editModule: 'Edit module',//"编辑组件"
      description: 'Description',//"描述"
      createModule: 'New module',//"新增组件"
      tip: {
        defaultEndpointSet: 'Default endpoint settings',//"默认的Endpoint设置"
        relation: 'Module associated Endpoint will configure the following ports/paths/parameters by default'//"组件关联的Endpoint将默认配置以下端口/路径/参数"
      }
    },
    endpoint: {
      createEndpoint: 'New Endpoint',//"新增Endpoint"
      editEndpoint: 'Edit Endpoint',//"编辑Endpoint"
      endpoint: 'Endpoint',//"Endpoint"
      endpointId: 'Endpoint ID',//"Endpoint ID"
      host: 'Host',//"Host"
      port: 'Port',//"端口"
      param: 'Parameter',//"参数"
      path: 'Path',//"路径"
      asset: 'Device',//"设备"
      lastUpdate: 'Last update time',//"最后更新时间"
      moduleParameter: 'Module parameter',//"组件参数"
      addGraph: 'View Graph', //添加图标
      element: 'Element',
      value: 'Value',
      promExpr: 'Please input expression',
      dialogTitle:'View', //endpoint 弹出dialog 标题
    },
    metrics: {
      metrics: 'Metrics',//"指标"
      name: 'Name',//'名称'
      type: 'Type',//'类型'
      description: 'Description'//'描述'
    }
  },
  ...enLocale
}

export default en;
