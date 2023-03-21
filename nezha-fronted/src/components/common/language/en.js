import enLocale from 'element-ui/lib/locale/lang/en' // 引入element语言包
const en = {
// 命名原则
// 创建使用New
// 表示创建状态用Created，如创建时间Created Time
// 告警使用Alert，而不是Alarm
// 账号用Account，username、password等都属于account的一部分
// A user is the person who uses the account, the account is an inanimate object that is merely registered to an e-mail address.
  overall: {
    uploadCustomPicture: 'Upload custom picture',
    customPicture: 'Custom picture',
    endpointTemplate: 'Endpoint template',
    AddByTemplate: 'Add by template',
    checkAssetAge: 'Input field too long',
    exprTemp: 'Expr temp',
    oneHour: '1 hour',
    twoHour: '2 hours',
    sixHour: '6 hours',
    twelveHour: '12 hours',
    oneDay: '1 day',
    twoDay: '2 days',
    week: '1 week',
    time: 'Time',
    folder: 'Folder',
    key: 'Key',
    logs: 'Logs',
    state: 'State',
    projectName: 'Project name',
    startTime: 'Start time',
    endTime: 'End time',
    metric: 'Metric',
    locked: 'Locked',
    unlocked: 'Unlocked',
    dashboard: 'Dashboards', // '仪表盘'
    project: 'Project', // '系统'
    monitor: 'Monitor', // 监控
    alert: 'Alert', // "告警"
    alertRuleEvalLog: 'Eval log',
    asset: 'Asset', // '资产'
    config: 'Setting', // '设置'
    administration: 'Administration',
    configuration: 'configuration',
    create: 'New', // '新增'
    createLabel: 'New label',
    edit: 'Edit', // '编辑'
    delete: 'Delete', // '删除'
    view: 'View',
    type: 'Type',
    esc: 'Cancel', // '取消'
    cancel: 'Cancel', // '取消'
    save: 'Save', // '保存'
    download: 'Download', // 下载
    preview: 'Preview', // 预览
    search: 'Search', // '搜索'
    add: 'Create', // "新增"
    addProject: 'Add',
    addAssetList: 'Add',
    batchEdit: 'Batch Edit',
    option: 'Operation', // "操作"
    remark: 'Description',
    clear: 'Clear', // "清除"
    name: 'Name', // '名称'
    version: 'Version', // 版本
    components: 'Components', // 组件
    cover: 'Override', // '覆盖'
    signOut: 'Logout', // '登出'
    select: 'Select', // '选择'
    ok: 'Ok', // OK
    entity: 'Entity',
    all: 'All', // '全选'
    value: 'Value',
    other: 'Others', // "其他"
    about: 'About', // 关于
    detail: 'Detail', // 详情
    query: 'Query', // 查询
    logLabels: 'Log labels',
    account: 'Account',
    back: 'Back', // 返回
    unavailable: 'Unavailable',
    available: 'Available',
    changePin: 'Change password', // 修改密码
    createChart: 'New chart',
    createProject: 'New project',
    createEndpoint: 'New endpoint',
    batchEndpoint: 'Batch modify endpoint',
    batchAddEndpoint: 'Batch new endpoint',
    batchAdd: 'Batch add',
    createAsset: 'New asset',
    createAlertRule: 'New alert rule',
    createAlertSilence: 'New alert silence',
    createUser: 'New user',
    createRole: 'New role',
    createPrometheusServer: 'New agent',
    createDatacenter: 'New Data center',
    createCabinet: 'New cabinet',
    createModel: 'New model',
    createModule: 'New module',
    createMib: 'New MIB',
    createdCredentials: 'New credential',
    createAssetType: 'New asset type',
    createAssetState: 'New asset state',
    createTemplate: 'New template',
    exportExcel: 'Export',
    importExcel: 'Import',
    importExcelLower: 'import',
    exportExcelLower: 'export',
    rollbackImport: 'Undo',
    exportCur: 'Current page',
    exportAll: 'All',
    importFile: 'Please upload file',
    importTip: 'Only allowed xlsx/xls file',
    importTipImg: 'Only allowed jpg/png file',
    dragFileTip: 'Drag file here',
    or: 'or',
    clickUpload: 'Click to upload',
    upload: 'upload',
    template: 'Template',
    active: 'Active',
    result: {
      total: 'Total',
      failed: 'Fail',
      success: 'Success',
      failedDetail: 'Failed Detail',
      line: 'Line {0}:',
      successNum: '{successNum} records imported successfully',
      failedNum: '{failedNum} out of {total} records failed to import',
      successfully: 'Import completed successfully!',
      imported: 'You have imported',
      records: 'records'
    },
    reset: 'Reset',
    submit: 'Save',
    limit: 'Limit',
    noData: 'No data',
    tag: 'Tag',
    placeHolder: 'Please enter',
    syncChart: 'Synchronize chart',
    toolBox: {
      zoom: 'Area scaling',
      back: 'Area scaling restore',
      stack: 'Show stack chart',
      stackBack: 'Back to original chart'
    },
    SyncSave: 'Save&Sync',
    copySuccess: 'Copy success',
    parent: 'Parent asset',
    children: 'Children asset',
    assetSubTab: 'Children asset',
    dc: 'Data center',
    manageIp: 'Manage IP',
    cabinet: 'Cabinet',
    brand: 'Brand',
    model: 'Model',
    location: 'Location',
    module: 'Module',
    labels: 'Label',
    moreOption: 'More option',
    copy: 'Copy',
    duplicate: 'Duplicate',
    silence: 'Silence',
    editType: 'Type',
    searchCondition: 'Search condition',
    batchDel: 'Batches delete',
    tempPrev: 'Template preview',
    silenceAlert: 'silence alert',
    quickSilent: 'Quick silent',
    configEndpoint: 'Config',
    generate: 'Generate',
    personalCenter: 'Profile',
    operationRecord: 'Operation record',
    changePassword: 'Change password',
    relabelConfigRegex: 'Default is (.*) ',
    relabelConfigReplacement: 'Default is $1',
    oid: 'OID format check error',
    normal: 'Up',
    unusual: 'Down',
    AuthenticationFailed: 'Authentication failed',
    clearAllSelect: 'Clear the selection',
    disabled: 'Disabled',
    enabled: 'Enabled',
    close: 'Close',
    records: 'Records',
    fileFormat: 'File format',
    allData: 'All data',
    selectRecords: 'Select records',
    current: 'Current page'
  },
  pageSize: '/page',
  setup: {
    step0: 'Welcome',
    step1: 'Database',
    step2: 'Redis',
    step3: 'System',
    host: 'Host',
    port: 'Port',
    language: 'Language',
    welcome: {
      header: 'Welcome to Nezha setup wizard!',
      guid: 'What will the wizard do for you?',
      guid_1: 'Create a basic configuration',
      guid_2: 'Tries to find problems within your Database and Redis setup',
      toContinue: 'To continue',
      creatFile: 'For security reasons you need to authenticate for the installation by creating the file',
      createFileTip: 'This can be done by executing the following command',
      next: "Click the 'Next' button when you've finished."
    },
    database: {
      configTitle: 'Configure DB connection',
      configTip: "Please create database manually,and set the configuration parameters for connection to this database,Press 'Next' button when done"
    },
    redis: {
      configTitle: 'Configure Redis connection',
      configTip: "Please set the configuration parameters for connection to this redis,Press 'Next' button when done"
    },
    system: {
      configTitle: 'System configuration',
      configTip: 'Please enter username and password for administrator ,and set the Nezha WEB module install information,like IP:port',
      federation: 'Federation',
      federationEnable: 'Enable',
      federationDisable: 'Disable'

    },
    name: 'Database name',
    username: 'Username',
    pin: 'Password',
    alertPath: 'Site URL',
    alertPrefix: 'Alert prefix',
    haMode: 'HA mode',
    haVip: 'Virtual IP',
    next: 'Next',
    back: 'Back',
    finish: 'Finish',
    invalidDb: 'There may be some errors in the configuration of the database',
    invalidRedis: 'There may be some errors in the configuration of the Redis',
    invalidPin: "Redis's password may be wrong",
    requirePin: 'The password may be required by the Redis',
    wait: 'The configuration has been saved, please wait patiently for it to take effect',
    reloadTimeout: 'It took too much time to restart the server, there may be some problems when you install',
    hadConfig: 'Someone has started to configure the system',
    invalidCode: "The authentication is invalid ,please follow the description in {page} 'To continue'",
    welcomePage: 'Welcome page',
    inited: 'The system has been initialized'
  },
  webshell: {
    shellTitle: 'Local Shell',
    upload: 'Upload',
    download: 'DownLoad',
    uploadTitle: 'Upload',
    downloadTitle: 'DownLoad',
    uploadButtonTitle: 'Upload',
    fileSelect: 'select',
    downloadButtonTitle: 'Download',
    filePath: 'File path',
    closeTip: 'All connections will be closed, are you sure you want to close the window?',
    remember: 'Remember my decision',
    protocol: 'Protocol',
    authType: 'Auth type',
    host: 'Host',
    port: 'Port',
    authUsername: 'Username',
    authPin: 'Password',
    authUserTip: 'Username prompt',
    authPinTip: 'Password prompt',
    authPriKey: 'Key'
  },
  login: {
    username: 'Username',
    pin: 'Password',
    login: 'Login',
    upload: 'Upload license',
    verify: 'Verify code',
    verifyDialogTitle: 'Two Factor Authentication Set Up',
    verifyTitle: 'Two-Factor Authentication',
    verifyContent: 'Enter the code from the two -factor app on your mobile device. If you\' ve lost your device, you may enter one of your recovery codes.',
    verifyPlaceholder: 'verify code',
    bindFail: 'Binding failure'
  },
  dashboard: {
    title: 'Dashboard',
    addChartTemp: 'Add chart temp',
    connect: ' Open terminal',
    panel: {
      title: 'Panel', // '面板'
      searchItem: {
        name: 'name'
      },
      chartTotal: 'total',
      // 面板-侧滑框
      createPanelTitle: 'New panel', // "新增面板"
      selectPanelTitle: 'Select', // "选择面板"
      createPanelTitleSec: 'New panel', // "新增面板"
      editPanelTitle: 'Edit panel', // "面板"
      singleStatErrorTip: 'Only queries that return single series/table is supported',
      dashboardForm: {
        panelName: 'Panel name', // "面板名称"
        dashboardId: 'ID' // ID
      },
      // 图表-侧滑框
      createChartTitle: 'New chart', // "新增图表"
      createChartTempTitle: 'New chart template', // "新增图表"
      createChartByTemp: 'New chart by template',
      editChartTitle: 'Edit chart', // "编辑图表""
      editChartTempTitle: 'Edit chart template', // "编辑图表""
      chartForm: {
        chartId: 'ID',
        chartName: 'Chart Name',
        type: 'Type',
        unit: 'Unit',
        url: 'URL',
        name: 'Name',
        legend: 'Legend',
        statistics: 'Statistics',
        legendTip: 'Controls the name of the time series, using name or pattern. For example {{hostname}} will be replaced with label value for the label hostname.',
        valueMappingTip: 'Use {{name}} and {{value}} to display the original name and value\n' +
          'For example: Total Alive: {{value}}\n' +
          'The result is: Total Alive: 100',
        sync: 'Sync to assets',
        last: 'Last',
        threshold: 'Threshold',
        thresholds: 'Thresholds',
        group: 'Group',
        remark: 'Description',
        lock: 'Lock',
        align: 'Align',
        collapse: 'Default collapse',
        typeVal: {
          line: {
            label: 'Line Chart' // "曲线图"
          },
          bar: {
            label: 'Bar Chart' // "柱状图"
          },
          table: {
            label: 'Table' // "表格"
          },
          stackArea: {
            label: 'Stack Area'
          },
          url: {
            label: 'URL',
            staticTip: 'The content in the double curly braces will be replaced on the Asset page'
          },
          singleStat: {
            label: 'Single value'
          },
          pie: {
            label: 'Pie Chart'
          },
          alertList: {
            label: 'Alert list'
          },
          text: {
            label: 'Text'
          },
          diagram: {
            label: 'Diagram'
          },
          group: {
            label: 'Group'
          },
          logs: {
            label: 'Logs'
          }
        },
        statisticsVal: {
          min: 'Min',
          max: 'Max',
          avg: 'Avg',
          total: 'Total',
          first: 'First',
          last: 'Last',
          range: 'Range',
          different: 'Different',
          null: 'None'
        },
        alignList: {
          left: 'Left',
          right: 'Right',
          center: 'Center'
        },
        lockList: {
          on: 'ON',
          off: 'OFF'
        },
        width: 'Width', // "宽"
        high: 'Height', // "高"
        metric: 'Metric', // "指标"
        option: 'Option',
        addMetric: 'Add metric', // "添加指标"
        alertParam: {
          param: 'Parameters',
          select: 'Select',
          alertRule: 'Alert rule',
          level: 'Priority',
          state: 'State'
        },
        valMapping: {
          name: 'Value mapping',
          from: 'From',
          to: 'To',
          text: 'Text',
          value: 'Value',
          range: 'Range'
        },
        legendValue: 'Legend option',
        content: 'Content',
        tooltip: 'Tooltip',
        displayChart: 'Display chart',
        aggregation: 'Aggregation',
        varType: 'Variable type',
        pid: 'Chart template',
        selectAsset: 'Please select the Asset',
        selectEndpoint: 'Please select the Endpoint',
        time: 'Time',
        descending: 'Descending',
        wrapLines: 'Wrap lines',
        limit: 'Limit'
      },
      chartTableColumn: {
        metric: 'Metric', // '指标'
        label: 'Label', // '标签'
        element: 'Element',
        time: 'Time', // '时间'
        value: 'Value' // '值'
      },
      startTime: 'Start time', // '开始时间'
      endTime: 'End time', // '结束时间'
      to: 'to', // To
      recOne: 'Last 1 hour', // '最近1小时'
      recFour: 'Last 4 hours', // '最近4小时'
      recOneDay: 'Last 1 day', // '最近1日'
      yesterday: 'Yesterday', // '昨日'
      recSevenDay: 'Last 7 day', // Last 7 days
      recOneMonth: 'Last 1 month', // '最近1月'
      curMonth: 'This month', // '本月'
      lastMonth: 'Last month', // '上月'
      customTimeRange: 'Custom time range',
      noDate: 'Empty',
      lastFiveMin: 'Last 5 minutes',
      lastFifteenMin: 'Last 15 minutes',
      lastThirtyMin: 'Last 30 minutes',
      lastOneHour: 'Last 1 hour',
      lastThreeHour: 'Last 3 hours',
      lastSixHour: 'Last 6 hours',
      lastTwelveHour: 'Last 12 hours',
      lastTwentyFourHour: 'Last 24 hours',
      lastTwoDay: 'Last 2 days',
      lastSevenDay: 'Last 7 days',
      lastThirtyDay: 'Last 30 days',
      beforeFiveMin: 'Previous 5 minutes',
      beforeFifteenMin: 'Previous 15 minutes',
      beforeThirtyMin: 'Previous 30 minutes',
      beforeOneHour: 'Previous 1 hour',
      beforeThreeHour: 'Previous 3 hours',
      beforeSixHour: 'Previous 6 hours',
      beforeTwelveHour: 'Previous 12 hours',
      beforeTwentyFourHour: 'Previous 24 hours',
      beforeTwoDay: 'Previous 2 days',
      beforeSevenDay: 'Previous 7 days',
      beforeThirtyDay: 'Previous 30 days',
      refreshInterval: {
        never: 'Off', // '从不'
        oneMinute: '1 minute', // 1 minute
        threeMinutes: '3 minutes', // '3分钟'
        fiveMinutes: '5 minutes', // '5分钟'
        tenMinutes: '10 minutes' // '10分钟'
      },
      view: 'View', // '查看'
      confirm: 'Ok', // OK
      cancel: 'Cancel', // '取消',
      moreTitle: 'Showing only 20 time series. ',
      moreTitleOther: 'Showing only 10 the data. ',
      showAll: 'Show all ',
      showAllOther: 'All Data',
      addChartTemp: 'addChartTemp'
    },
    metric: {
      name: 'Metric name', // "指标名称"
      normal: 'Normal', // "普通"
      expert: 'Expert', // Expert
      label: 'Label', // "指标标签"
      addMetric: 'Add metric', // "添加指标"
      expertTip: 'Add expression', // "请输入表达式"
      goPanelTip: 'View created panel?', // View created panel?
      previewChart: 'Preview', // "预览图表"
      singleChartShow: 'Signle chart', // "单图展示"
      multiChartsShow: 'Multiple charts', // "多图展示"
      createPanel: 'New panel', // "创建面板"
      selectPanel: 'Exist panel', // "选择已有面板"
      saveChart: 'Save chart',
      saveChartToPanel: 'Save chart to panel'// Save chart to panel.
    },
    metricPreview: {
      title: 'Explore',
      inputTip: 'Enter a PromQL query',
      runQuery: 'Run query',
      historyTip: 'Queried {time} times in the last {hour}h'
    },
    refresh: 'Refresh', // '刷新'
    edit: 'Edit', // '编辑'
    Connect: 'Connect', // 连接
    delete: 'Delete', // '删除'
    screen: 'Full screen', // '全屏',
    duplicate: 'Duplicate', // 复制
    overview: {
      title: 'Overview',
      contentTitle: 'Nezha Management System',
      traffic: 'Traffic',
      projectTopoLogy: 'Project Topology',
      asset: {
        title: 'Asset',
        assetType: 'Asset type',
        assetState: 'Asset state',
        modelStat: 'Model',
        dcStat: 'Data center',
        num: 'Num',
        alert: 'Alert',
        alertTotal: 'Total',
        alertP3: 'P3',
        alertP2: 'P2',
        alertP1: 'P1',
        inStock: 'In stock',
        outStock: 'Out stock',
        pingUp: 'Up',
        pingDown: 'Down',
        host: 'Host',
        dropDownLabel: {
          type: 'type',
          model: 'model',
          dc: 'data center'
        },
        ok: 'OK',
        alarm: 'Alarm',
        total: 'Total'
      },
      project: {
        project: 'Project',
        name: 'Name',
        module: 'Module',
        endpoint: 'Endpoint'
      },
      module: {
        module: 'Module'
      },
      endpoint: {
        endpoint: 'Endpoint'
      },
      dataCenter: {
        dataCenter: 'Data center',
        cabinet: 'Cabinet',
        promServer: 'Prom server'
      },
      alert: {
        alertMessage: 'Alert message',
        level: 'Priority',
        alertRule: 'Alert rule',
        ruleNum: 'Rule num',
        alertNum: 'Alert',
        alertRuleTopN: 'Top10 alert message',
        assetTopN: 'Top alert message by Asset',
        moduleTopN: 'Top alert message by Module',
        top: 'Top',
        chart: {
          chartTitle: 'Alert Trend'
        }
      },
      mapTooltip: {
        asset: 'asset',
        state: 'state',
        ping: 'ping',
        inStock: 'In stock',
        outStock: 'Out stock',
        active: 'active',
        inactive: 'inactive',
        alert: 'alert',
        P1: 'P1',
        P2: 'P2',
        P3: 'P3',
        endpoint: 'endpoint',
        total: 'total',
        up: 'up',
        down: 'down',
        prometheus: 'prometheus'
      }
    },
    explore: {
      descending: 'Descending',
      wrapLines: 'Wrap lines'
    }
  },
  validate: { // 校验规则
    required: 'Required', // '必填项'
    number: 'Numberic', // '必须是数字'
    integer: 'Integer',
    positiveInteger: 'Positive integer',
    email: 'Invalid email', // '不合法的E-mail地址'
    tel: 'Invalid phone number', // '不合法的电话号码'
    telephone: 'Phone number cannot be empty',
    host: 'Invalid Host', // '不合法的Host'
    domain: 'Invalid domain',
    usize: 'Must be number(1 - 47)',
    fileSize: 'File exceed max size', // File exceed max size.
    port: 'Invalid port',
    special: 'Cannot contain special characters',
    url: 'Invalid URL',
    uSize: 'Must be number(1 - 47)',
    requiredIdc: 'dc is required',
    key: 'Invalid key',
    repeat: 'Repeat',
    tooLong: 'Too long content',
    onlyWord: 'only input a-z、A-Z、0-9、"_" ',
    mobile: 'Invalid mobile'
  },
  search: {
    searchTip: 'Enter to search', // '点击或回车执行搜索'
    recentSearch: 'Search history', // '搜索记录'
    noRecentSearch: 'No Recent Search'// '无搜索记录'
  },
  tip: {
    confirmDelete: 'Are you sure you want to delete?', // Are you sure you want to delete?
    confirmExpired: 'Are you sure you want to expired?',
    confirmOvertime: "Are you sure it's off?",
    killTerm: 'Are you sure you want to kill terminal?',
    resetPrompt: 'Are you sure to reset?',
    resetMfa: 'Are you sure to reset 2FA?',
    confirmBatchDelete: 'Are you sure to delete these {0} pieces of data',
    assetConfirmDelete: 'Related endpoints and alerts will be removed, are you sure you want to delete this asset?', // Related endpoints and alerts will be removed, are you sure you want to delete this asset?
    zoomStatusPrompt: 'Your browser is currently in zoom state, the page may appear dislocation, the proposed 100% size.',
    doNotAskAgain: 'Do not ask again',
    yes: 'Yes', // "是"
    no: 'No', // No
    deleteSuccess: 'Delete success', // "删除成功"
    saveSuccess: 'Save success', // "保存成功"
    addSuccess: 'Add success', // "保存成功"
    duplicateSuccess: 'Duplicate success', // "复制成功"
    coverSuccess: 'Override success', // '覆盖成功'
    refreshLater: 'Refresh later', // '请稍后刷新'
    testSuccess: 'Test success',
    downloadSuccess: 'Download success',
    uploadSuccess: 'Upload success',
    pressEnterToAdd: 'Press enter to add new line',
    resetSuccess: 'Reset success',
    syncSuccess: 'Synchronize success',
    syncTip: 'This operation may cause the original data or chart to be overwritten. Are you sure to synchronize?',
    noImportFile: 'No import file found',
    noAccess: 'No access',
    confirmDuplicate: 'Are you sure to duplicate this chart?',
    confirmCancel: 'Changes you made are not saved?',
    copySuccess: 'Copy success',
    lnglatError: 'Wrong format of latitude and longitude',
    tagError: 'Does not conform to regular expressions /^[a-zA-Z_][a-zA-Z0-9_]*/!',
    syntaxError: 'Syntax error',
    errorInRow: 'There are some syntax errors in rows'
  },
  asset: {
    asset: 'Asset ',
    talonPrompt: 'Talon is a client program responsible for log collection.',
    userName: 'User name',
    username: 'Username',
    address: 'Address',
    assets: 'Asset', // '资产'
    editAsset: 'Edit asset', // '编辑资产'
    createAsset: 'New asset', // '编辑资产'
    batchEditAsset: 'Edit asset in bulk',
    selectAsset: 'Selected assets',
    host: 'Host',
    state: 'State', // '状态'
    pingActive: 'active', // 可ping通
    assetStatPre: 'Last reply:',
    assetStatDown: 'Never',
    remark: 'Description', // '描述'
    cli: 'CLI account', // 'CLI账号'
    loginType: 'Login type', // '登录类型'
    pin: 'Password', // '密码'
    ssh: 'SSH key', // 'SSH-Key'
    sshAccount: 'SSH account',
    protocol: 'Protocol',
    sshProtocol: 'SSH',
    telnetProtocol: 'Telnet',
    userTip: 'User tip', // 用户名提示
    pinTip: 'Password tip', // 密码提示
    reloginPinTip: 'Relogin tip', // 密码提示
    userPinIntroduce: 'Please specify a user name and password so that the telenet login process can automatically log in',
    reLoginPinIntroduce: 'Please specify the password prompt so that the login process can run automatically',
    port: 'Port', // '端口'
    upload: 'Upload', // '上传'
    clickToUpload: 'Upload', // '上传'
    clickToCover: 'Cover', // '覆盖'
    sshKeyWasConfig: 'SSH-KEY configured', // 'SSH-KEY已配置'
    exporter: 'Exporter',
    pingInactive: 'inactive',
    assetInfo: 'Asset information', // '资产信息'
    vendorModel: 'Vendor/Model', // '厂商/型号'
    purchaseDate: 'Purchase date', // '购买日期'
    location: 'Location', // '地区'
    sn: 'SN',
    uSize: 'U size',
    inStock: 'In stock', // '在库'
    notInStock: 'Not in stock', // '出库'
    suspended: 'Suspended',
    assetType: 'Asset type', // '资产类型'
    principal: 'Administrator', // '负责人'
    tel: 'Telephone', // '电话'
    featureTitle: 'Attribute',
    endpoint: 'Endpoint',
    endpointUpNum: 'It\'s a normal number',
    endpointNum: 'Represents the total quantity',
    active: 'Alive', // "存活",
    total: 'Total', // "总数",
    down: 'Down',
    brand: 'Brand',
    model: 'Model',
    cabinet: 'Cabinet',
    alertNum: 'Alert',
    endpointNum2: 'Endpoint',
    manageIp: 'Manage IP',
    number: 'Number',
    brandAndModel: 'Brand & Model',
    authType: 'Auth type',
    privateKey: 'Private key',
    usernamePrompt: 'Username prompt',
    pinPrompt: 'Password prompt',
    snmpCredential: 'SNMP credential',
    authProtocol: 'Auth protocol',
    id: 'ID', // ID
    device: 'SN', // SN
    assetState: 'State', // '状态'
    assetPing: 'Ping',
    lastReply: 'Ping last reply',
    modules: 'Endpoint', // '组件'
    alerts: 'Alert', // '告警信息'
    dataCenter: 'Data center', // DC
    vendor: 'Vendor', // '厂商'
    procurementDate: 'Purchase date', // '购买日期'
    principalTel: 'Telephone', // '电话'
    option: 'Operation', // "操作"
    name: 'Name',
    dc: 'DataCenter',
    type: 'Types',
    pingInfo: 'Ping',
    detail: {
      list: 'List view',
      detail: 'Detail view',
      orderBy: 'OrderBy',
      orderByLabel: 'Order by  {label}'
    }
  },
  config: {
    config: 'Setting', // "设置"
    assetMeta: {
      addGroup: 'Add group',
      editGroup: 'Edit group'
    },
    user: {
      userList: 'User list', // "用户列表"
      user: 'User',
      state: 'State',
      // 列表表头
      name: 'Name', // "用户"
      username: 'Username', // 登录名
      roles: 'Role',
      language: 'Language', // "语言"
      receiver: 'Receiver', // "用户组"
      createTime: 'New time', // "创建时间"
      enable: 'Enable', // "可用"
      option: 'Operation', // "操作"
      lastLoginTime: 'Last login time', // 最后登录时间
      lastLoginIp: 'Last login IP', // 最后登录IP
      source: 'Source',
      // 侧滑框//
      userId: 'User ID', // "用户ID"
      createUser: 'New user', // "新增用户"
      editUser: 'Edit user', // "编辑用户"
      notCurrentlySupport: 'Not available', // '暂不支持'
      pin: 'Password', // '密码'
      oldPin: 'Old password',
      inputOldPin: 'Please input old password',
      newPin: 'New password',
      inputNewPin: 'Please input new password',
      confirmPin: 'Confirm password',
      inputConfirmPin: 'Please input confirm password',
      invalidPin: 'invalide password,the length at least 6',
      confirmPinErr: 'The two passwords are inconsistent',
      reinputPin: 'Enter password again',
      notification: 'Notification',
      mobile: 'Mobile',
      disable: 'Disable',
      enableMfa: 'Enable',
      forceEnable: 'Force enable',
      mfaTitle: 'Two-Factor Authentication',
      resetMfa: 'Reset 2FA'
    },
    roles: {
      roles: 'Role',
      name: 'Name',
      description: 'Description',
      option: 'Operation', // "操作"
      permission: 'Permission',
      menu: 'Menu',
      createRole: 'New role',
      editRole: 'Edit role',
      remark: 'Remark'
    },
    menus: {
      menus: 'Menus',
      name: 'Name',
      remark: 'Remark',
      option: 'Operation', // "操作",
      code: 'Code',
      i18n: 'I18n',
      type: 'Type',
      route: 'Route',
      perms: 'Permission',
      button: 'Button',
      menu: 'Menu',
      tab: 'Tab',
      parent: 'Previous menu',
      mainMenu: 'Primary menu',
      createMenu: 'New menu',
      editMenu: 'Edit menu',
      orderNum: 'Order',
      icon: 'Icon'
    },
    agent: {
      // 侧滑框
      promId: 'Agent ID', // "Prometheus Server ID"
      createProm: 'New agent', // "新增Prometheus Server"
      editProm: 'Edit agent', // "修改Prometheus Server"
      type: 'Type', // "类别"
      checkTime: 'Check time',
      dataCenter: 'Data center',
      name: 'Name',
      up: 'UP',
      down: 'Down',
      host: 'Host',
      port: 'Port',
      protocol: 'Protocol',
      agent: {
        agent: 'Agent',
        title: 'Download agent',
        download: 'Download',
        osType: 'OS type',
        autoScript: 'Auto install script',
        type: 'Agent type'
      }
    },
    dc: {
      dc: 'Data center',
      area: 'Area',
      dcName: 'Data center name',
      selectArea: 'Select area',
      description: 'Description',
      cabinetNum: 'Cabinet',
      assets: 'Asset',
      remark: 'Description',
      cabinets: 'Cabinet',
      createDc: 'New data center',
      editDc: 'Edit data center',
      editCabinet: 'Edit cabinet',
      alert: 'Alert',
      createPanel: 'Create panel',
      traffic: {
        title: 'Traffic Setting',
        add: 'Add',
        direction: 'Direction',
        tags: 'Tags',
        snmpSetting: 'SNMP setting'
      },
      usable: 'Usable',
      suspended: 'Suspended',
      state: 'State',
      longitude: 'Longitude',
      latitude: 'Latitude',
      lnglat: 'Coordinate'
    },
    cabinet: {
      editCabinet: 'Edit Cabinet',
      createCabinet: 'New Cabinet'
    },
    model: {
      model: 'Asset model',
      brand: 'Brand',
      name: 'Name',
      titleName: 'Name',
      titleType: 'Type',
      ChartTemplate: 'Chart template',
      assetNum: 'Asset',
      editModel: 'Edit model',
      createModel: 'New model',
      remark: 'Description',
      type: 'Type'
    },
    terminallog: {
      terminallog: 'Terminal log',
      status: 'State', // "状态"
      username: 'User',
      SessionID: 'Session ID',
      authtype: 'AuthType',
      statusItem: {
        connecting: 'Connecting',
        connectionFailed: 'Failed',
        over: 'Close',
        kickedOut: 'Stopped',
        unknownError: 'Unknown error'
      },
      option: 'Operation', // "操作",
      host: 'Host',
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
      pin: 'Password',
      key: 'Key',
      endTime: 'EndTime',
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
      fail: 'Fail',
      startTime: 'Start time',
      duration: 'Duration',
      remote: 'Remote',
      log: 'Log',
      source: 'Source IP',
      killErrorTip: 'Killing failed',
      monitor: { monitor: 'monitoring' },
      cmd: {
        cmd: 'Command',
        history: 'History command',
        dangerTip: 'This command may be dangerous',
        legendTip: 'Legend description'
      },
      record: {
        record: 'Record',
        pause: 'Pause',
        play: 'Play',
        replay: 'Replay',
        skipTip: 'Skip no operation time'
      },
      loginHost: 'Login host',
      loginUser: 'Login user',
      sourceIp: 'Source IP',
      sourceUser: 'Source user',
      SessionId: 'Session ID',
      stop: 'Stop'
    },
    operationlog: {
      operationlog: 'Operation log',
      id: 'ID',
      username: 'User',
      operation: 'Operation',
      type: 'Type',
      createDate: 'Time',
      ip: 'IP',
      userId: 'UserId',
      operaId: 'Resources',
      time: 'Duration',
      params: 'Params',
      state: 'State',
      response: 'Response',
      operations: {
        add: 'add',
        query: 'query',
        update: 'update',
        import: 'import',
        export: 'export',
        delete: 'delete',
        reset: 'reset',
        unknown: 'unknown',
        login: 'login',
        logout: 'logout'
      }
    },
    mib: {
      mib: 'MIB file',
      fileName: 'File name',
      description: 'Description',
      updateUser: 'Update user',
      updateAt: 'Update time',
      editMib: 'Edit MIB',
      models: 'Model',
      modelTip: 'Please select models',
      createMib: 'New MIB',
      mibFiles: 'MIB file',
      uploadTip: 'Please upload MIB file',
      requiredMibFile: 'MIB file is required',
      vendor: 'Vendor',
      type: 'Type',
      mibBrowser: 'MIB browser',
      credentials: 'Credential',
      noData: 'No Data',
      credential: {
        type: 'Protocol type',
        port: 'Port',
        remark: 'Description',
        edit: 'Edit credential',
        create: 'Create credential',
        auth: 'Authentication',
        method: 'Method',
        encryption: 'Encryption',
        pin: 'Password',
        ReadCommunity: 'Read community',
        writeCommunity: 'Write community',
        username: 'Username',
        contextName: 'Context name'
      }
    },
    system: {
      system: 'System',
      basic: {
        title: 'Basic info',
        basic: 'Basic',
        alertApi: 'Alert API',
        assetPingSwith: 'Asset ping',
        assetPingInterval: 'Ping interval',
        exporterTarget: 'Exporter path',
        scrapeInterval: 'Scrape interval',
        storageRetention: 'Local retention',
        systemName: 'System name',
        curUrl: 'Current site URL',
        timezone: 'Timezone',
        defaultCabinetUsize: 'Cabinet U size',
        second: 'second',
        day: 'day',
        sessionTimeout: 'Session timeout',
        minute: 'minute',
        maxSeries: 'Query max series',
        unsaved: 'Unsaved prompt',
        mapConfig: 'Map center',
        mapTitle: 'Configurate map',
        lat: 'latitude',
        lng: 'longitude',
        zoom: 'zoom',
        lnglat: 'coordinate',
        sysLogo: 'System logo',
        scrapeTimeout: 'Scrape timeout',
        snmpTrapPort: 'SNMP trap port',
        logoTip: 'Logo format only can be jpg、jpeg、png,and less than 2M',
        mfa: 'Two-Factor Authentication',
        TwoFactorAuthentication: 'Require all users to set up Two-factor authentication'
      },
      monitor: {
        monitor: 'Monitor',
        metricsTitle: 'Metrics configuration',
        logsTitle: 'Logs configuration',
        alertApi: 'Alert api',
        prometheusFederation: 'Federation',
        asset_ping_from: 'Ping from',
        metrics_storage_retention: 'Retention days',
        metrics_storage_type: 'Storage backend',
        metrics_storage_s3_endpoint: 'Endpoint',
        metrics_storage_s3_bucket: 'Bucket',
        metrics_storage_s3_access_key: 'Access key',
        metrics_storage_s3_secret_access_key: 'Secret key',
        logs_storage_retention: 'Retention days',
        logs_storage_type: 'Storage backend',
        logs_storage_s3_endpoint: 'Endpoint',
        logs_storage_s3_bucket: 'Bucket',
        logs_storage_s3_access_key: 'Access key',
        logs_storage_s3_secret_access_key: 'Secret key',
        logs_query_range_default_limit: 'Query line limit',
        local: 'LocalStorage',
        s3: 'S3 object storage'
      },
      email: {
        email: 'Email',
        enable: 'Enable email',
        smtpHost: 'SMTP host',
        smtpPort: 'SMTP port',
        smtpAccount: 'SMTP account',
        smtpPin: 'SMTP password',
        sendAccount: 'Send account',
        timeout: 'Timeout',
        testAccount: 'Test account',
        useSSL: 'SSL',
        useTLS: 'TLS',
        testConnection: 'Test connection',
        pinTip: 'Tip:Some email providers need to enter token',
        sendAccountTip: 'Tip:The SMTP account is used as the sending account by default',
        testAccountTip: 'Tip:Used only as test mail recipient',
        sslTip: 'If the SMTP port is 465, you usually need to enable SSL',
        tlsTip: 'If the SMTP port is 587, you usually need to enable TLS',
        securityType: 'Security type'
      },
      terminal: {
        terminal: 'Terminal',
        terminalNum: 'Max terminal number',
        timeout: 'Timeout',
        userTip: 'Telnet user prompt',
        pinTip: 'Ternet password prompt',
        localRetention: 'Local retention'
      },
      ldap: {
        ldap: 'LDAP',
        address: 'LDAP address',
        dn: 'Bind DN',
        pin: 'Password',
        ou: 'User OU',
        ouTip: 'Use the "|" symbol to separate OU',
        filter: 'User filter',
        filterTip: 'The possible options are: (cn or uid or sAMAccountName=%(user)s)',
        map: 'Attribute mapping',
        mapTip: 'Attribute mapping represents how to map LDAP user attributes to NEZHA users; username,email are the attributes of NEZHA',
        active: 'LDAP authentication',
        timeout: 'Timeout'
      },
      link: {
        link: 'Link',
        name: 'Name',
        url: 'Url',
        operation: 'Operation',
        add: 'Add',
        update: 'Update',
        del: 'Delete',
        nameMaxLength: 'The length should be less than 64',
        uriRequired: 'Please fill in the correct url',
        create: 'Creator'
      },
      notification: {
        notification: 'Notification',
        name: 'Name',
        filePath: 'File path',
        operation: 'Operation',
        account: 'Account',
        state: 'Enable',
        buildIn: 'Build in',
        add: 'Add',
        update: 'Update',
        del: 'Delete',
        nameMaxLength: 'The length should be less than 64',
        uriRequired: 'Required',
        filePathReg: 'Please enter the correct file path',
        create: 'New notification',
        invalid: 'Invalid',
        valid: 'Valid'
      },
      reset: {
        reset: 'Reset',
        type: 'Type',
        pin: 'Password',
        metric: 'Metric',
        alert: 'Alert',
        sysConfig: 'System config',
        pinTip: 'Please input your password',
        promptTitle: 'Confirm',
        yes: 'Yes',
        no: 'No'
      },
      apiKey: {
        apiKey: 'API key',
        role: 'Role',
        create: 'Creator',
        creatAt: 'Create at',
        expireAt: 'Expire at',
        noExpire: 'No expiration date'
      }
    },
    assetType: {
      assetType: 'Asset Type',
      type: 'Asset Type',
      name: 'Name',
      vm: 'VM',
      vmh: 'VMH',
      authProtocol: 'AuthProtocol',
      snmpEnable: 'SnmpEnable',
      snmpCollect: 'SnmpCollect',
      createModel: 'New Type',
      sshCollect: 'SshCollect',
      sshCollectScript: 'SshCollectScript',
      parent: 'Parent',
      pname: 'Parent name',
      editAssetType: 'Edit asset type',
      createAssetType: 'New asset type'
    },
    assetState: {
      assetState: 'Asset State',
      monitor: 'Monitor',
      alert: 'Alert',
      assetTotal: 'Total assets',
      createAssetState: 'New asset state',
      editAssetState: 'Edit asset state'
    },
    assetLabel: {
      addMeta: 'Add label',
      example: 'Example',
      editMeta: 'Edit lable',
      assetLabel: 'Asset label',
      all: 'All',
      addGroup: 'Add group',
      editGroup: 'Edit group',
      addLabel: 'Create label',
      editLabel: 'Edit label',
      groupName: 'Name',
      key: 'Key',
      name: 'Name',
      group: 'Group',
      search: 'Search',
      display: 'Display',
      type: 'Type',
      params: 'Params',
      updateLabel: 'Update label',
      deleteLabel: 'Delete label',
      infoLabel: 'Label Info',
      text: 'TEXT',
      multitext: 'MULTITEXT',
      textarea: 'TEXTAREA',
      radio: 'RADIO',
      checkbox: 'CHECKBOX',
      select: 'SELECT',
      integer: 'INTEGER',
      double: 'DOUBLE',
      datetime: 'DATETIME',
      email: 'EMAIL',
      option: 'Options',
      isCheck: 'Is check',
      operate: 'Operate',
      default: 'Default',
      dateType: 'Date type',
      date: 'Date',
      time: 'Time',
      datetimes: 'Date + Time',
      interval: 'Interval',
      decimals: 'Decimals',
      moreOptionsError: 'There are up to 20 options',
      onlyOptionError: 'You need at least one option',
      labelOptionNull: 'Please input option'
    },
    exprTemp: {
      exprTemp: 'Expression template',
      exprTempInfo: 'Expression template Info',
      exprTempRender: 'expression template render',
      exprTempDown: 'expression template download',
      exprTempImport: 'expression template import',
      exprTempExport: 'expression template export',
      exprTempImportCancel: 'expression template import rollback',
      copy: 'Duplicate',
      name: 'Name',
      gname: 'Group',
      expression: 'Expression',
      remark: 'Description',
      errorStr: 'Please fill in the {errorStr} value',
      edit: 'Edit expression template',
      create: 'New expression template',
      expressionError: 'Please fill in the "expression" value',
      type: 'Type',
      varType: 'Variable type'
    },
    chartTemp: {
      chartTemp: 'Chart template',
      type: 'Type',
      varType: 'Variable type'
    }
  },
  alert: {
    alert: 'Alert', // "告警"
    message: 'Message', // '信息'
    rule: 'Rule', // '规则'
    alertMessage: 'Alert message', // "告警信息"
    alertRule: 'Alert rule', // "告警规则"
    alertRuleMessage: 'Message',
    alertName: 'Name', // "告警名称"
    method: 'Method', // "告警名称"
    severity: 'Priority', // "等级"
    description: 'Description', // "描述"
    summary: 'Summary', // "概要"
    startAt: 'Start time', // "开始时间"
    notify: 'Notification', // "通知方式"
    endAt: 'End time', // "结束时间"
    name: 'Name',
    state: 'State',
    type: 'Type',
    alertNum: 'Alert',
    list: {
      // 表头
      linked: 'Linked', // "关联"
      type: 'Type', // "类别"
      state: 'State', // "状态"
      charts: 'Charts', // "图表"
      // 表内容
      projectAlert: 'Project alert', // "系统告警"
      moduleAlert: 'Module alert', // "组件告警"
      deviceAlert: 'Device alert', // "设备告警"
      pending: 'Pending', // "待处理"
      expired: 'Expired', // "已过期"
      labels: 'Label',
      current: 'Current',
      remark: 'Remark',
      id: 'ID'
    },
    config: {
      name: 'Name', // "名称"
      receiver: 'Receiver', // "用户组"
      expr: 'Expression/OID', // "表达式"
      exprBox: 'Expression',
      for: 'Duration (s)', // For (s)
      second: 'second',
      link: 'Link', // '关联'
      option: 'Operation', // "操作"
      alertConfig: 'Alert rule', // "告警规则"
      createAlertConfig: 'New alert rule', // "新增告警规则"
      editAlertConfig: 'Edit alert rule', // "修改告警规则"
      alertNum: 'Alert', // 告警信息数量
      P1: 'P1',
      P2: 'P2',
      P3: 'P3',
      typeOption: {
        project: 'Project', // '系统'
        module: 'Module', // '组件'
        asset: 'Device'// '设备'
      },
      operator: 'Operator',
      threshold: 'Threshold',
      unit: 'Unit',
      chart: {
        alertRuleInfo: 'Alert rule information',
        alertNumTrend: 'Alert num trend',
        affectEntity: 'Affect entity'
      },
      timeout: 'Timeout(s)',
      inr: 'Evaluation interval ',
      inrPlaceholder: 'Default global scrape interval',
      inrError: 'Evaluation Interval cannot be less than 15',
      autoExpired: 'Automatic expired',
      state: 'State',
      schedEnable: 'Schedule',
      schedDays: 'Effective time',
      more: 'More',
      effectiveConfig: 'Effective configuration',
      notificationConfig: 'Notification configuration',
      notifyActive: 'Active Notification',
      notifyExpired: 'Expired notification',
      trbShot: 'Trouble shooting'
    },
    silence: {
      name: 'Name',
      silence: 'Alert silence',
      create: 'New alert silence',
      edit: 'Edit alert silence',
      time: 'Time',
      matchers: 'Matcher',
      remark: 'Description',
      selectTime: 'Please select time',
      selectMather: 'Required',
      datacenter: 'datacenter',
      project: 'project',
      module: 'module',
      endpoint: 'endpoint',
      asset: 'asset',
      timeError: 'The end time must be greater than the start time',
      state: 'State',
      startTime: 'Start time',
      upTime: 'Update Time'
    },
    P1Rule: 'P1: Critical, alert that can cause business paralysis',
    P2Rule: 'P2: Major, alert that requires urgent attention, but does not affect the business yet',
    P3Rule: 'P3: Minor, alert that needs to be dealt with, but not urgent'
  },
  project: {
    chart: {
      basicTitle: 'Basic info',
      alertStat: 'Alert state',
      endpointStat: 'Endpoint state',
      projectInfo: 'Project information',
      endpointInfo: 'Endpoint information'
    },
    topo: {
      list: 'List',
      update: 'Update',
      icon: {
        list: 'List',
        delete: 'Delete',
        save: 'Save',
        info: 'Info'
      }
    },
    project: {
      project: 'Name', // "系统"
      projectName: 'Project', // "系统名称"
      editProject: 'Edit project', // "编辑系统"
      description: 'Description', // "描述"
      createProject: 'New project'// "新增系统"
    },
    module: {
      module: 'Module', // "组件"
      moduleName: 'Name', // "组件名称"
      editModule: 'Edit module', // "编辑组件"
      description: 'Description', // "描述"
      createModule: 'New module', // "新增组件"
      version: 'Version',
      walk: 'Walk',
      type: 'Type',
      maxRepetitions: 'Max repetitions',
      retries: 'Retries',
      timeout: 'Timeout',
      community: 'Community',
      securityLevel: 'Security level',
      authProtocol: 'Auth protocol',
      privProtocol: 'Priv protocol',
      contextName: 'Context name',
      privpin: 'Priv password',
      alerts: 'Alert',
      asset: 'Asset',
      editEndpoint: 'Edit endpoint',
      createEndpoint: 'New endpoint',
      batchEndpoint: 'Batch endpoint',
      batchAddEndpoint: 'Batch new endpoint',
      batchAdd: 'Batch add',
      endpointName: 'Endpoint',
      name: 'Name',
      tip: {
        defaultEndpointSet: 'Default endpoint settings', // "默认的Endpoint设置"
        relation: 'Module associated Endpoint will configure the following ports/paths/parameters by default'// "组件关联的Endpoint将默认配置以下端口/路径/参数"
      }
    },
    endpoint: {
      createEndpoint: 'New endpoint', // "新增Endpoint"
      editEndpoint: 'Edit endpoint', // "编辑Endpoint"
      endpoint: 'Endpoint ', // "Endpoint"
      endpoints: 'Endpoint',
      endpointName: 'Endpoint name',
      endpointId: 'Endpoint ID', // "Endpoint ID"
      list: 'List',
      host: 'Host', // "Host"
      port: 'Port', // "端口"
      param: 'Parameter', // "参数"
      path: 'Path', // "路径"
      asset: 'Asset', // "设备"
      lastUpdate: 'Last reply', // "最后更新时间"
      moduleParameter: 'Module', // "组件参数"
      addGraph: 'View graph', // 添加图标
      element: 'Element',
      value: 'Value',
      promExpr: 'Please input expression',
      dialogTitle: 'History value', // endpoint 弹出dialog 标题,
      hideSameLabels: 'Hide same labels',
      stateInfo_230009: 'Promserver unavailable',
      stateInfo_230010: 'Promserver can be used',
      stateInfo_230011: 'Endpoint connection refused',
      alerts: 'Alert',
      labels: 'Label',
      pattern: 'Name pattern',
      credentials: 'Credentials',
      scrape_interval: 'Scrape interval',
      scrape_interval_placeholder: 'default global scrape interval',
      scrape_timeout: 'Scrape timeout',
      scrape_timeout_placeholder: 'default global scrape timeout',
      protocol: 'Protocol',
      type: 'Type',
      bearer_token: 'bearer token',
      username: 'Username',
      pin: 'Password',
      authTypeNull: 'None',
      authTypeWord: 'basic auth',
      authTypeToken: 'bearer token',
      name: 'Name',
      configs: 'Configuration',
      state: 'State',
      allselect: 'The current page has all been selected',
      enable: 'Enable',
      disable: 'Disable',
      status: 'Endpoint status',
      basicTypeFile: 'Path',
      basicTypeJournal: 'Unit',
      basicTypeSyslog: 'Listen address',
      basicAppName: 'App name',
      metrics: 'Metrics',
      logs: 'Logs',
      parameter: 'Parameter',
      labels2: 'Labels',
      relabel: 'Relabel',
      auth: 'Auth',
      basic: 'Basic',
      pipeline: 'Pipeline'
    },
    metrics: {
      metrics: 'Metrics', // "指标"
      name: 'Name', // '名称'
      type: 'Type', // '类型'
      description: 'Description'// '描述'
    },
    topology: {
      module: 'Module element',
      add: 'Add',
      selTwoNode: 'Please select two module',
      save: 'Save',
      cancel: 'Cancel',
      exit: 'Exit',
      preview: 'Preview',
      addLine: 'Add line',
      editLine: 'Edit line',
      lineName: 'Line Name',
      width: 'Width',
      height: 'Height',
      dashes: 'dotted line',
      option: 'Option',
      arrows: 'arrows',
      color: 'color',
      chartName: 'Name',
      unit: 'Unit',
      addModule: 'Add module',
      editModule: 'Edit module',
      edit: 'edit',
      refresh: 'refresh',
      endpoint: 'Endpoint',
      asset: 'Asset',
      total: 'Chart',
      info: 'Module Info',
      alert: 'Alert Message',
      lineType: 'Line type',
      straight: 'straight',
      upload: 'upload',
      requiredName: 'The name of the required',
      imgFormat: 'Upload picture can only be JPG/ PNG format!',
      imgSize: 'Upload image size should not exceed 2MB!',
      imgMeasure: 'The width and height of uploaded pictures must be greater than 100!',
      data: 'Data',
      style: 'Style',
      title: 'Title',
      level: 'Level',
      value: 'Value',
      animation: 'Animation',
      animationType: 'Animation type',
      animationColor: 'Animation color',
      link: 'Link',
      fill: 'Fill',
      lines: 'Line',
      text: 'Text',
      name: 'Name',
      bac: 'Background',
      bacImage: 'Background image',
      defaultLineWidth: 'Default line width',
      defaultLineType: 'Default line type',
      lineWidth: 'Line width',
      grids: 'Grids',
      gridSize: 'Grid Size',
      gridColor: 'Grid Color',
      rule: 'Ruler',
      ruleColor: 'Rule Color',
      defaultStartArrow: 'Default start arrow',
      defaultEndArrow: 'Default end arrow',
      positionAndSize: 'Position&Size',
      circularBead: 'Circular bead',
      rotate: 'Rotate',
      pl: 'Padding left',
      pt: 'Padding top',
      pr: 'Padding right',
      pb: 'Padding bottom',
      gradient: 'Gradient',
      lineStyle: 'Line dash',
      lineColor: 'Line color',
      lineDash: 'lineDash',
      fromArrow: 'From arrow',
      toArrow: 'To arrow',
      arrowColor: 'Arrow color',
      fontSize: 'Font Size',
      fontColor: 'Font Color',
      align: 'Align',
      opacity: 'Opacity',
      bounce: 'bounce',
      shakeX: 'shakeX',
      swing: 'swing',
      heartBeat: 'heartBeat',
      flash: 'flash',
      fade: 'fade',
      flow: 'flow',
      beads: 'beads',
      dot: 'dot',
      comet: 'comet',
      curve: 'curve',
      polyline: 'polyline',
      line: 'line',
      placeholderImg: 'Please enter name',
      unitError: 'Please select the folder',
      imgError: 'Please upload pictures',
      folder: 'Folder',
      selMod: 'Please bind module for all nodes',
      none: 'None',
      previewExit: 'Continue',
      iconColor: 'Icon color',
      maxWidth: 'Max width',
      maxCount: 'Max count',
      nodeWidth: 'Node width',
      nodeHeight: 'Node height',
      spaceWidth: 'Space width',
      spaceHeight: 'Space height',
      onLayout: 'Layout',
      top: 'Top',
      bottom: 'Bottom',
      delete: 'Delete',
      cut: 'Cut',
      copy: 'Copy',
      paste: 'Paste',
      textContent: 'Text content',
      textAlign: 'Text align',
      textBaseline: 'Text baseline',
      textOffsetX: 'Text offsetX',
      textOffsetY: 'Text offsetY',
      left: 'left',
      center: 'center',
      right: 'right',
      topOffsetY: 'top',
      middleOffsetY: 'middle',
      bottomOffsetY: 'bottom',
      transparency: 'Transparency',
      composing: 'Composing'
    },
    update: 'Update'
  },
  date: {
    week: {
      one: 'MON',
      two: 'TUE',
      three: 'WED',
      four: 'THU',
      five: 'FRI',
      six: 'SAT',
      seven: 'SUN'
    }
  },
  guide: {
    title: 'Get started in 6 steps',
    dc: 'Datacenter',
    dcTip: 'Data center associated with Prometheus servers contains cabinets and assets; cabinet is a container for assets.',
    addDc: 'Add datacenter',
    addCabinet: 'Add cabinet',
    agent: 'Agent',
    agentTip: 'The Prometheus service (agent) is the core of the system, including two types: "Global" and "Per-datacenter". The former collects data and sends out alert messages, while the latter collects data from Endpoint. You must configure both.',
    addAgent: 'Add agent',
    downloadAgent: 'Download agent',
    asset: 'Asset',
    assetTip: 'Assets are the main part monitored by the system',
    addAsset: 'Add asset',
    importAsset: 'Import asset',
    webTerminal: 'Web terminal',
    monitor: 'Monitor',
    monitorTip: 'Help user to monitor components and contents based on project requirement',
    addProject: 'Add project',
    addModule: 'Add module',
    addEndpoint: 'Add endpoint',
    importEndpoint: 'Import endpoint',
    visualization: 'Visualization',
    visualizationTip: 'Panels consist of different sets of customized charts. You can create several panels and switch between them.',
    addPanel: 'Add panel',
    addChart: 'Add chart',
    alert: 'Alert',
    alertTip: 'User can create alert rule by configuring expression, threshold, duration, etc.',
    addAlertRule: 'Add alert rule'
  },
  buttons: {
    view: 'View',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    expired: 'Expired',
    panel: {
      addChart: 'Add chart',
      editChart: 'Edit chart',
      deleteChart: 'Delete chart'
    },
    asset: {
      view: 'View',
      connect: 'Connect'
    },
    snmp: {
      view: 'View',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      mibBrowser: 'Mib browser'
    },
    credential: {
      view: 'View',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete'
    },
    system: {
      basic: 'Basic',
      email: 'Email',
      terminal: 'Terminal',
      ldap: 'LDAP',
      apiKey: {
        add: 'Add',
        edit: 'Edit',
        delete: 'Delete'
      }
    },
    terminalLog: {
      kill: 'Kill',
      monitor: 'Monitor'
    }
  },
  system: {
    notification: {
      notification: 'Notification'
    },
    reset: {
      reset: 'Reset'
    },
    apikey: {
      apiKey: 'Api Key'
    }
  },
  profile: {
    profile: 'Profile',
    close: 'disable',
    clear: 'Clear',
    enable: 'Enable',
    update: 'Update',
    edit: 'Edit profile',
    editProfile: 'Edit Profile',
    username: 'User name',
    name: 'Name',
    language: 'Language',
    operationRecord: 'Operation log',
    changePassword: 'Change password',
    oldPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    lastLoginIp: 'Last login IP',
    lastLoginTime: 'Last login time',
    role: 'Role',
    email: 'Email',
    mobile: 'Mobile',
    source: 'Source',
    twoFactorAuthentication: 'Two-Factor Authentication'
  },
  week: {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
    MonAbbreviation: 'Mon',
    TueAbbreviation: 'Tue',
    WedAbbreviation: 'Wed',
    ThuAbbreviation: 'Thu',
    FriAbbreviation: 'Fri',
    SatAbbreviation: 'Sat',
    SunAbbreviation: 'Sun'
  },
  ...enLocale
}

export default en
