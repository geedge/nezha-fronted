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
    type: 'Type',
    esc: 'Cancel', //'取消'
    cancel: 'Cancel', //'取消'
    save: 'Save', //'保存'
    download: 'Download', //下载
    preview:'Preview',//预览
    search: 'Search', //'搜索'
    add: 'Create', //"新增"
    option: 'Operation', //"操作"
    remark: "Description",
    clear: 'Clear', //"清除"
    name: 'Name', //'名称'
    cover: 'Override', //'覆盖'
    signOut: 'Logout',//'登出'
    select: 'Select',//'选择'
    ok: 'Ok',//OK
    all: 'All',//'全选'
    value: 'Value',
    other: 'Others',//"其他"
    detail: 'Detail', //详情
    query: 'Query', //查询
    back: 'Back', //返回
    unavailable: 'Unavailable',
    available: 'Available',
    changePwd:'Change password',//修改密码
    createChart:'Create chart',
    createProject:'Create project',
    createEndpoint:'Create Endpoint',
    createAsset:'Create asset',
    createAlertRule:'Create alert rule',
    createAccount:'Create account',
    createPrometheusServer:'Create prometheus server',
    createDatacenter:'Create Data Center',
    createCabinet:'Create cabinet',
    createModel:'Create model',
    createMib:'Create MIB',
    exportExcel:'Export',
    importExcel:'Import',
    importExcelLower:'import',
    exportExcelLower:'export',
    rollbackImport:'rollback',
    exportCur:'current page',
    exportAll:'all',
    importFile:'please upload file',
    importTip:'only allowed xlsx/xls file',
    dragFileTip:'Drag file here',
    or:'or',
    clickUpload:'click to upload',
    upload:'upload',
    template:'Template',
    active: 'active',
    result:{
      total:'Total',
      failed:'Failed',
      success:'Success',
      failedDetail:'Failed Detail'
    },
    reset:'Reset',
    submit:'Submit',
    noData:'No data',
    tag: 'Tag',
    placeHolder:'please enter',
    syncChart:'Synchronize chart',
  },
  pageSize: '/page',
  webshell:{
    shellTitle:'Local Shell',
    upload:'Upload',
    download:'DownLoad',
    uploadTitle:'Upload',
    downloadTitle:'DownLoad',
    uploadButtonTitle:'Upload',
    fileSelect:'select',
    downloadButtonTitle:'Download',
    filePath:'File path',
    closeTip:'All connections will be closed, are you sure you want to close the window?',
    remember:'Remember my decision'
  },
  login: {
    username: 'Username',
    password: 'Password',
    login: 'Login'
  },
  dashboard:{
    title:'Dashboard',
    panel:{
      title:'Panel', //'面板'
      searchItem:{
        name:'name'
      },
      chartTotal:'total',
      //面板-侧滑框
      createPanelTitle: 'New panel', //"新增面板"
      selectPanelTitle:'Select', //"选择面板"
      createPanelTitleSec:'New panel',//"新增面板"
      editPanelTitle: 'Panel', //"面板"
      singleStatErrorTip:'Only queries that return single series/table is supported',
      panelForm:{
        panelName:'Panel name', //"面板名称"
        panelId:"ID" //ID
      },
      //图表-侧滑框
      createChartTitle: 'New chart', //"新增图表"
      editChartTitle: 'Edit',//"编辑图表"
      chartForm:{
        chartId:"ID",
        chartName:"Chart Name",
        type:"Type",
        unit:"Unit",
        url:"URL",
        legend:'Legend',
        statistics:'Statistics',
        legendTip:'Controls the name of the time series, using name or pattern. For example {{hostname}} will be replaced with label value for the label hostname.',
        sync: 'Sync to assets',
        threshold:'Threshold',
        typeVal:{
          line:{
            label:'Line Chart' //"曲线图"
          },
          bar:{
            label:'Histogram' //"柱状图"
          },
          table:{
            label:'Table' //"表格"
          },
          stackArea:{
            label:"Stack Area"
          },
          url:{
            label:"URL",
            staticTip:'The content in the double curly braces will be replaced on the Asset page',
          },
          singleStat:{
            label:"SingleStat"
          },
          alertList:{
            label:"Alert list"
          }
        },
        statisticsVal:{
          min:'Min',
          max:'Max',
          average:'Average',
          total:'Total',
          first:'First',
          last:'Last',
          range:'Range',
          different:'Different',
        },
        width:'Width', //"宽"
        high:'High', //"高"
        metric:'Metric', //"指标"
        option:'Option',
        addMetric:'Add metric', //"添加指标"
        alertParam:{
          param:'Parameters',
          select:'Select',
          alertRule:'Alert rule',
          level:'Level',
          state:'State'
        }
      },
      chartTableColumn:{
        metric:'Metric', //'指标'
        label:'Label', //'标签'
        element:'Element',
        time:'Time', //'时间'
        value:'Value', //'值'
      },
      startTime:'Start time', //'开始时间'
      endTime:'End time',//'结束时间'
      to:'to', //To
      recOne:'Last 1 hour', //'最近1小时'
      recFour:'Last 4 hours',//'最近4小时'
      recOneDay:'Last 1 day',//'最近1日'
      yesterday:'Yesterday', //'昨日'
      recSevenDay:'Last 7 day',// Last 7 days
      recOneMonth:'Last 1 month',//'最近1月'
      curMonth:'This month',//'本月'
      lastMonth:'Last month',//'上月'
      customTimeRange:'Custom time range',
      lastFiveMin:'Last 5 minutes',
      lastFifteenMin:'Last 15 minutes',
      lastThirtyMin:'Last 30 minutes',
      lastOneHour:'Last 1 hour',
      lastThreeHour:'Last 3 hours',
      lastSixHour:'Last 6 hours',
      lastTwelveHour:'Last 12 hours',
      lastTwentyFourHour:'Last 24 hours',
      lastTwoDay:'Last 2 days',
      lastSevenDay:'Last 7 days',
      lastThirtyDay:'Last 30 days',
      refreshInterval:{
        never:'Off', //'从不'
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
      name:'Metric name', //"指标名称"
      normal:'Normal', //"普通"
      expert:"Expert",// Expert
      label:'Label', //"指标标签"
      addMetric:'Add metric',//"添加指标"
      expertTip:'Add expression',//"请输入表达式"
      goPanelTip:"View created panel?",//View created panel?
      previewChart:'Preview',//"预览图表"
      singleChartShow:'Signle chart',//"单图展示"
      multiChartsShow:'Multiple charts',//"多图展示"
      createPanel:'New panel', //"创建面板"
      selectPanel:'Exist panel',//"选择已有面板"
      saveChart: 'Save chart',
      saveChartToPanel:"Save chart to panel"//Save chart to panel.
    },
    metricPreview:{
      title:'Explore',
      inputTip:'Enter a PromQL query',
      runQuery:'Run query',
    },
    refresh:'Refresh',//'刷新'
    edit:'Edit',//'编辑'
    delete:'Delete',//'删除'
    screen:'Full screen',//'全屏',
    duplicate:'Duplicate',//复制
    overview:{
      title:'Overview',
      contentTitle:'Nezha Management System',
      traffic: 'Traffic',
      asset:{
        title:'Asset',
        assetType:'Asset type',
        modelStat:'Model',
        dcStat:'Data center',
        num:'Num',
        alert:'Alert',
        alertTotal:'Total',
        alertLow:'Low',
        alertMedium:'Medium',
        alertHigh:'High',
        inStock:'In stock',
        outStock:'Out stock',
        pingUp:'Up',
        pingDown:'Down',
        host:'Host',
        dropDownLabel:{
          type:'type',
          model:'model',
          dc:'data center'
        },
      },
      project:{
        project:'Project',
        name:'Name',
        module:'Module',
        endpoint:'Endpoint',
      },
      module: {
        module: "Module",
      },
      endpoint: {
        endpoint: "Endpoint",
      },
      dataCenter:{
        dataCenter:'Data center',
        cabinet:'Cabinet',
        promServer:'Prom server',
      },
      alert:{
        alertMessage: 'Alert message',
        level:'Level',
        alertRule:'Alert rule',
        ruleNum:'Rule num',
        alertNum:'Alert num',
        alertRuleTopN: 'Top10 alert message',
        assetTopN: 'Top10 alert message by Asset',
        moduleTopN: 'Top10 alert message by Module',
        top:'Top',
        chart:{
          chartTitle:'Alert Trend'
        },
      },
      mapTooltip:{
        asset:'asset',
        state:'state',
        ping:'ping',
        inStock:'in stock',
        outStock:'out stock',
        active:'active',
        inactive:'inactive',
        alert:'alert',
        high:'high',
        medium:'medium',
        low:'low',
        endpoint:'endpoint',
        total:'total',
        up:'up',
        down:'down',
        prometheus:'prometheus',
      }
    }
  },
  validate: { //校验规则
    required: 'Required',//'必填项'
    number: 'Numberic',//'必须是数字'
    integer:'Integer',
    positiveInteger:'Positive integer',
    email:'Invalid email',//'不合法的E-mail地址'
    tel:'Invalid phone number',//'不合法的电话号码'
    host:'Invalid Host',//'不合法的Host'
    domain:'Invalid domain',
    usize:'Must be number(1 - 49)',
    fileSize:'File exceed max size',//File exceed max size.
    port:'Invalid port',
    url:'Invalid URL',
    uSize:'Must be number(1 - 47)',
    requiredIdc:'dc is required',
    key:'Invalid key',
    repeat:'Repeat'
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
    duplicateSuccess: 'Duplicate success', //"复制成功"
    coverSuccess: 'Override success',//'覆盖成功'
    refreshLater:'Refresh later',//'请稍后刷新'
    testSuccess:'Test success',
    downloadSuccess : 'Download success',
    uploadSuccess: 'Upload success',
    pressEnterToAdd: 'Press enter to add new此操作可能造成原有数据或图表被覆盖，确认同步吗？ line',
    resetSuccess:'Reset success',
    syncSuccess:'Synchronize success',
    syncTip:'This operation may cause the original data or chart to be overwritten. Are you sure to synchronize?',
  },
  asset:{
    asset: 'Asset',
    assets: 'Assets',//'资产'
    EditAsset:'Edit asset',//'编辑资产'
    pingActive: 'active',//可ping通
    assetStatPre:'Last reply:',
    assetStatDown:'Never',
    pingInactive:'inactive',
    left:{
      dataCenter:'Data center',
      assetType:'Asset type',
      vendor:'Vendor',
      ping:'Ping',
    },
    createAssetTab:{
      title:'New asset',//'新增资产'
      sn:'SN',//SN
      host:'Host',//'Host'
      state:'State',//'状态'
      selectTip:'Please select',//'请选择'
      inStock: 'In stock',//'在库'
      notInStock: 'Not in stock',//'出库'
      assetInfo:'Asset information',//'资产信息'
      assetType:'Asset type',//'资产类型'
      impi:{
        title:'IPMI',
        host:'Host',
        port:'Port',
      },
      assetTypeTab:{
        assetType:'Asset type',//'资产类型'
        addAssetType:'New asset type',//'新增资产类型'
        existAssetType:'Existed asset type'//'已存在的资产类型'
      },
      vendorModel:'Vendor/Model',//'厂商/型号'
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
      dcName:'Data Center name',//'DC名称'
      AddIdcTab:{
        title:'New Data Center',//'新增DC'
        dcName:'Data Center name',//'DC名称'
        location:'Location',//'地区'
        principal:'Administrator',//'负责人'
        tel:'Telephone'//'电话'
      },
      editIdcTab:{
        title:'Edit Data Center',//'编辑DC'
        dcName:'Data Center name',//'DC名称'
        location:'Location',//'地区'
        principal:'Administrator',//'负责人'
        tel:'Telephone'//'电话'
      },
      location:'Location',//'地区'
      principal:'Administrator',//'负责人'
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
      protocol:"Protocol",
      sshProtocol:"SSH",
      telnetProtocol:"Telnet",
      userTip:"UserTip",//用户名提示
      passwordTip:"PasswordTip",//密码提示
      reloginPasswordTip:"Relogin",//密码提示
      userPwdIntroduce:'Please specify a user name and password so that the telenet login process can automatically log in',
      reLoginPwdIntroduce:'Please specify the password prompt so that the login process can run automatically',
      account:'User name',//'用户名'
      port:'Port',//'端口'
      upload:'Upload',//'上传'
      clickToUpload:'Upload',//'上传'
      clickToCover:'Cover',//'覆盖'
      sshKeyWasConfig:'SSH-KEY configured',//'SSH-KEY已配置'
      exporter:'Exporter',
      basicTitle:'Basic info',
      featureTitle:'Feature',
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
        title:'New Data Center',//'新增DC'
        dcName:'DC name',//'DC名称'
        location:'Location',//'地区'
        principal:'Administrator',//'负责人'
        tel:'Telephone'//'电话'
      },
      editIdcTab:{
        title:'Edit DC',//'编辑DC'
        dcName:'DC name',//'DC名称'
        location:'Location',//'地区'
        principal:'Administrator',//'负责人'
        tel:'Telephone'//'电话'
      },
      location:'Location',//'地区'
      principal:'Administrator',//'负责人'
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
      assetPing: 'Ping',
      lastReply:'Ping last reply',
      modules: 'Endpoint',//'组件'
      alerts: 'Alerts',//'告警信息'
      dataCenter: 'DC',//DC
      cabinet: 'Cabinet',//'机柜'
      model: 'Model',//'型号'
      vendor: 'Vendor',//'厂商'
      procurementDate: 'Purchase date',//'购买日期'
      principal: 'Administrator',//'负责人'
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
      receiver: 'Receiver',//"用户组"
      createTime: 'Create time',//"创建时间"
      enable: 'Available',//"可用"
      option: 'Operation',//"操作"
      //侧滑框//
      accountId: 'Account ID',//"用户ID"
      createAccount: 'New account',//"新增用户"
      editAccount: 'Edit account',//"编辑用户"
      notCurrentlySupport: 'Not available',//'暂不支持'
      password: 'Password',//'密码'
      oldPwd:'Old password',
      inputOldPwd:'Please input old password',
      newPwd:'New password',
      inputNewPwd:'Please input new password',
      confirmPwd:'Confirm password',
      inputConfirmPwd:'Please input confirm password',
      invalidPwd:'invalide password,the length at least 6',
      confirmPwdErr:'The two passwords are inconsistent',
      reinputPwd:'Enter password again'
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
    dc: {
      dc: 'Data center',
      area: "Area",
      selectArea: 'Select area',
      cabinetNum: "Cabinet number",
      assets: "Assets",
      remark:'Remark',
      cabinets: "Cabinets",
      traffic:{
        title:'Traffic Setting',
        add:'Add',
        direction:'Direction',
        tags:'Tags'
      }
    },
    model: {
      model: 'Asset model',
      vendor: 'Vendor',
      assets: "Assets",
      editModel: 'Edit model',
      createModel: 'Create model',
      remark: 'Remark',
      type: 'Type'
    },
    terminallog: {
      terminallog: 'Terminal log',
      status: 'Status',//"状态"
      option: 'Operation',//"操作",
      host: 'Host',
      cmd: 'CMD',
      port: 'Port',
      userId: 'UserID',
      protocol: 'Protocol',
      user: 'User',
      detail: 'Terminal Log Detail',
      resize: 'Terminal resize',
      download: 'Terminal download',
      upload: 'Terminal upload',
      selectFile: 'Select file',
      SSH: 'SSH',
      TELNET: 'TELNET',
      id: 'ID',
      time: 'Time',
      width: 'Width',
      height: 'Height',
      cols: 'Cols',
      rows: 'Rows',
      uuid: 'UUID',
      path: 'Path',
      file: 'File',
      success: 'Success',
      fail: 'Fail'
    },
    operationlog: {
      operationlog: 'Operation log',
      id : 'ID',
      username: 'User',
      operation: 'Operation',
      type: 'Type',
      createDate: 'Time',
      ip: "IP",
      userId: "UserId",
      operaId: "Resources",
      time: "Duration",
      params: "Params",
      state: "State",
      response:"Response",
      operations:{
        add:'add',
        query:'query',
        update:'update',
        import:'import',
        export:'export',
        delete:'delete',
        reset:'reset',
        unknown:'unknown'
      }
    },
    mib:{
      mib:'SNMP MIB',
      fileName:'FileName',
      remark:'Remark',
      updateUser:'Update user',
      updateAt:'Update time',
      editMib:'Edit MIB',
      models:'Models',
      modelTip:'please select models',
      createMib:'Create MIB',
      mibFiles:'MIB file',
      uploadTip:'please upload MIB file',
      requiredMibFile:'MIB file is required',
      vendor:'Vendor',
      type:'Type',
      mibBrowser: 'MIB browser',
      noData: "No Data"
    },
    system:{
      system:'System',
      basic:{
        basic:'Basic',
        alertApi:'Alert API',
        assetPingSwith:'Asset ping',
        assetPingInterval:'Interval',
        exporterTarget:'Exporter path',
        scrapeInterval:'Scrape interval',
        storageRetention:'Local retention',
        systemName:'System name',
        curUrl:'Current site URL',
        timezone:'Timezone',
        defaultCabinetUsize:'Cabinet U Size'
      },
      email:{
        email:'Email',
        enable:'Enable email',
        smtpHost:'SMTP host',
        smtpPort:'SMTP port',
        smtpAccount:'SMTP account',
        smtpPwd:'SMTP password',
        sendAccount:'Send account',
        testAccount:'Test account',
        useSSL:'SSL',
        useTLS:'TLS',
        testConnection:'Test connection',
        pwdTip:'Tip:Some email providers need to enter token',
        sendAccountTip:'Tip:The SMTP account is used as the sending account by default',
        testAccountTip:'Tip:Used only as test mail recipient',
        sslTip:'If the SMTP port is 465, you usually need to enable SSL',
        tlsTip:'If the SMTP port is 587, you usually need to enable TLS'
      },
      terminal:{
        terminal:'Terminal',
        terminalNum:'Max Terminal Number'
      },
      ldap:{
        ldap:'LDAP',
        address:'LDAP address',
        dn:'Bind DN',
        pwd:'Password',
        ou:'User OU',
        filter:'User filter',
        map:'LDAP Field Mapping',
        active:'LDAP Authentication'
      },
      reset:{
        reset:'Reset',
        type:'Type',
        pwd:'Password',
        metric:'metric',
        alert:'alert',
        sysConfig:'System config',
        pwdTip:'Please input your password',
        promptTitle:'Confirm',
        yes:'Yes',
        no:'No',
      }
    }
  },
  alert: {
    alert: 'Alerts',//"告警"
    message: 'Message',//'信息'
    rule: 'Rule',//'规则'
    alertList: 'Alert message',//"告警信息"
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
      expired: 'Expired',//"已过期"
      labels: 'Labels',
      current: 'Current',
    },
    config: {
      name: 'Name',//"名称"
      receiver: 'Receiver',//"用户组"
      expr: 'Expression',//"表达式"
      for: "Duration (s)",//For (s)
      link: 'Link',//'关联'
      option: 'Operation',//"操作"
      alertConfig: 'Alert rule',//"告警规则"
      createAlertConfig: 'New alert rule',//"新增告警规则"
      editAlertConfig: 'Edit alert rule',//"修改告警规则"
      medium: 'Medium',//"中"
      alertNum: 'Alert number', //告警信息数量
      high: 'High',//"高"
      low: 'Low',//"低"
      typeOption: {
        project: 'Project',//'系统'
        module: 'Module',//'组件'
        asset: 'Device'//'设备'
      },
      operator:'Operator',
      threshold:'Threshold',
      unit:'Unit',
      chart: {
        alertRuleInfo: "Alert rule information",
        alertNumTrend: "Alert num trend"
      }
    }
  },
  project: {
    chart: {
      basicTitle: "Basic info",
      alertStat: "Alert state",
      endpointStat: "Endpoint state",
      projectInfo: "Project information",
      endpointInfo: "Endpoint information"
    },
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
      version: 'Version',
      walk: 'Walk',
      maxRepetitions: 'Max repetitions',
      retries: 'Retries',
      timeout: 'Timeout',
      community: 'Community',
      securityLevel: 'Security level',
      authProtocol: 'Auth protocol',
      privProtocol: 'Priv protocol',
      contextName: 'Context name',
      privPassword: 'Priv password',
      tip: {
        defaultEndpointSet: 'Default endpoint settings',//"默认的Endpoint设置"
        relation: 'Module associated Endpoint will configure the following ports/paths/parameters by default'//"组件关联的Endpoint将默认配置以下端口/路径/参数"
      }
    },
    endpoint: {
      createEndpoint: 'New endpoint',//"新增Endpoint"
      editEndpoint: 'Edit endpoint',//"编辑Endpoint"
      endpoint: 'Endpoint',//"Endpoint"
      endpointId: 'Endpoint ID',//"Endpoint ID"
      host: 'Host',//"Host"
      port: 'Port',//"端口"
      param: 'Parameter',//"参数"
      path: 'Path',//"路径"
      asset: 'Asset',//"设备"
      lastUpdate: 'Last reply',//"最后更新时间"
      moduleParameter: 'Module',//"组件参数"
      addGraph: 'View graph', //添加图标
      element: 'Element',
      value: 'Value',
      promExpr: 'Please input expression',
      dialogTitle:'History value', //endpoint 弹出dialog 标题,
      hideSameLabels:'Hide same labels',
      stateInfo_230009:'promserver unavailable',
      stateInfo_230010:'promserver can be used',
      stateInfo_230011:'promserver can not be used',

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
