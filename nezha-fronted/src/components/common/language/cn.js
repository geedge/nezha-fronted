import zhLocale from 'element-ui/lib/locale/lang/zh-CN' //引入element语言包
const cn = {
  overall: {
    dashboard: "仪表盘",
    project: "系统",
    alert: "告警",
    asset: "资产",
    config: "设置",
    create: "新增",
    edit: "编辑",
    delete: "删除",
    view: "查看",
    esc: "取消",
    cancel: "取消",
    save: "保存",
    preivew: "预览",
    download: "下载",
    upload: "上传",
    search: "搜索",
    add: "新增",
    option: "操作",
    clearAll: "清空",
    clear: "清除",
    name: "名称",
    cover: "覆盖",
    signOut: "登出",
    select: "选择",
    ok: "Ok",
    all: "全选",
    other: "其他",
    query: "查询",
    back: "返回",
    unavailable: "不可用",
    available: "可用",
    createChart: "新增图表",
    createProject: "新增项目",
    createAsset: "新增资产",
    createAlertRule: "新增告警规则",
    createAccount: "新增用户名",
    createPrometheusServer: "新增 prometheus server",
    createDatacenter: "新增DC",
    active: "活跃",
    type: "类别",
    preview: "预览",
    detail: "详细信息",
    changePwd: "修改密码",
    createCabinet: "创建机柜",
    createModel: "创建模型",
    createMib: "创建MIB",
    exportExcel: "导出",
    importExcel: "导入",
    importExcelLower: "导入",
    exportExcelLower: "导出",
    rollbackImport: "回滚",
    exportCur: "当前页",
    exportAll: "总计",
    importFile: "请上传文件",
    importTip: "只允许xlsx/xls格式文件",
    dragFileTip: "将文件拖到此处",
    or: "或",
    clickUpload: "点击上传",
    template: "模板",
    result: {
      total: "总计",
      failed: "失败",
      success: "成功",
      failedDetail: "失败详情"
    },
    reset: "重置",
    submit: "提交",
    noData:'没有数据',
    tag: '标签'
  },
  webshell: {
    shellTitle: "本地 Shell",
    upload: "上传",
    download: "下载",
    uploadTitle: "上传",
    downloadTitle: "下载",
    uploadButtonTitle: "上传",
    fileSelect: "选择",
    downloadButtonTitle: "下载",
    filePath: "文件路径",
    closeTip: "是否断开所有连接，关闭窗口？",
    remember: "记住我的决定"
  },
  pageSize: "条/页",
  login: {
    username: "登录名",
    password: "密码",
    login: "登录"
  },
  dashboard: {
    title: "仪表盘",
    panel: {
      title: "面板",
      searchItem: {
        name: "名称"
      },
      chartTotal:'总和',
      createPanelTitle: "新增面板",
      selectPanelTitle: "选择面板",
      createPanelTitleSec: "新增面板",
      editPanelTitle: "面板",
      panelForm: {
        panelName: "面板名称",
        panelId: "ID"
      },
      createChartTitle: "新增图表",
      editChartTitle: "编辑图表",
      chartForm: {
        chartId: "ID",
        chartName: "图表名称",
        type: "类型",
        url: "URL",
        typeVal: {
          line: {
            label: "曲线图"
          },
          bar: {
            label: "柱状图"
          },
          table: {
            label: "表格"
          },
          stackArea: {
            label: "面积图"
          },
          url: {
            label: "URL"
          }
        },
        width: "宽",
        high: "高",
        metric: "指标",
        addMetric: "添加指标",
        unit: "单位",
        legend: "图例",
        legendTip: "使用名称或表达式控制时间序列的名称。例如{{hostname}将替换为标签主机名的标签值。",
        option: "操作"
      },
      chartTableColumn: {
        metric: "指标",
        label: "标签",
        time: "时间",
        value: "值",
        element: "元素"
      },
      startTime: "开始时间",
      endTime: "结束时间",
      to: "至",
      recOne: "最近1小时",
      recFour: "最近4小时",
      recOneDay: "最近1日",
      yesterday: "昨日",
      recSevenDay: "最近7日",
      recOneMonth: "最近1月",
      curMonth: "本月",
      lastMonth: "上月",
      customTimeRange: "Custom time range",
      lastFiveMin: "最近5分钟",
      lastFifteenMin: "最近15分钟",
      lastThirtyMin: "最近30分钟",
      lastOneHour: "最近1小时",
      lastThreeHour: "最近3小时",
      lastSixHour: "最近6小时",
      lastTwelveHour: "最近12小时",
      lastTwentyFourHour: "最近24小时",
      lastTwo: "最近2天",
      lastSevenDay: "最近7天",
      lastThirtyDay: "最近30天",
      refreshInterval: {
        never: "关闭",
        oneMinute: "1分钟",
        threeMinutes: "3分钟",
        fiveMinutes: "5分钟",
        tenMinutes: "10分钟"
      },
      view: "查看",
      confirm: "Ok",
      cancel: "取消",
      lastTwoDay: "最近2天"
    },
    metric: {
      name: "指标名称",
      normal: "普通",
      expert: "专家",
      label: "指标标签",
      addMetric: "添加指标",
      expertTip: "请输入表达式",
      goPanelTip: "是否前去看板,查看创建的图表？",
      previewChart: "预览图表",
      singleChartShow: "单图展示",
      multiChartsShow: "多图展示",
      createPanel: "创建面板",
      selectPanel: "选择已有面板",
      saveChart: "保存图表",
      saveChartToPanel: "保存图表到看板"
    },
    metricPreview: {
      title: "探索",
      inputTip:'输入PromQL查询语句',
      runQuery:'查询',
    },
    refresh: "刷新",
    edit: "编辑",
    delete: "删除",
    screen: "全屏",
    overview: {
      title: "系统总览",
      contentTitle: "Nezha 管理系统",
      asset: {
        title: "资产",
        assetType: "资产类型",
        modelStat: "模型",
        dcStat: "数据中心",
        num: "数量",
        alert: "告警",
        alertTotal: "总计",
        alertLow: "低",
        alertMedium: "中",
        alertHigh: "高",
        inStock: "在库",
        outStock: "出库",
        pingUp: "Up",
        pingDown: "Down",
        host: "主机",
        dropDownLabel: {
          type: "类型",
          model: "模型",
          dc: "数据中心"
        }
      },
      project: {
        project: "项目",
        name: "名称",
        module: "组件",
        endpoint: "Endpoint"
      },
      dataCenter: {
        dataCenter: "数据中心",
        cabinet: "机柜",
        promServer: "prometheus 服务"
      },
      alert: {
        level: "级别",
        alertRule: "告警规则",
        ruleNum: "规则数量",
        alertNum: "告警数量",
        alertRuleTopN: "根据告警规则",
        assetTopN: "根据资产",
        top: "Top",
        chart: {
          chartTitle: "告警趋势"
        }
      },
      mapTooltip: {
        asset: "资产",
        state: "状态",
        ping: "ping",
        inStock: "在库",
        outStock: "出库",
        active: "在线",
        inactive: "宕机",
        alert: "告警",
        high: "高",
        medium: "中",
        low: "低",
        endpoint: "Endpoint",
        total: "总计",
        up: "up",
        down: "down",
        prometheus: "prometheus"
      }
    }
  },
  validate: {
    required: "必填项",
    number: "必须是数字",
    email: "不合法的E-mail地址",
    tel: "不合法的电话号码",
    host: "不合法的IP",
    fileSize: "文件过大",
    port: "不合法的端口",
    special: "不能包含特殊字符",
    config: {
      account: {}
    },
    integer: "必须是整数",
    positiveInteger: "必须是正整数",
    domain: "不合法的域名",
    usize: "必须是(1 - 49)的数字",
    url: "不合法的URL",
    uSize: "必须是(1 - 47)的数字",
    requiredIdc:'机房为必选项'
  },
  search: {
    searchTip: "点击或回车执行搜索",
    recentSearch: "搜索记录",
    noRecentSearch: "无搜索记录"
  },
  tip: {
    confirmDelete: "确认删除吗？",
    assetConfirmDelete: "关联的Endpoint和告警将会被删除，确认删除吗？",
    yes: "是",
    no: "否",
    deleteSuccess: "删除成功",
    saveSuccess: "保存成功",
    coverSuccess: "覆盖成功",
    refreshLater: "请稍后刷新",
    testSuccess: "测试成功",
    downloadSuccess: "下载成功",
    uploadSuccess: "上传成功",
    pressEnterToAdd: "回车添加新行",
    resetSuccess: "重置成功"
  },
  asset: {
    asset: "资产",
    EditAsset: "编辑资产",
    createAssetTab: {
      title: "新增资产",
      sn: "SN",
      host: "主机",
      state: "状态",
      selectTip: "请选择",
      inStock: "在库",
      notInStock: "出库",
      assetInfo: "资产信息",
      assetType: "资产类型",
      assetTypeTab: {
        assetType: "资产类型",
        addAssetType: "新增资产类型",
        existAssetType: "已存在的资产类型"
      },
      vendor: "厂商/型号",
      vendorTab: {
        vendor: "厂商/型号",
        vendorName: "新厂商",
        existVendor: "已有厂商",
        modelName: "新型号",
        existModel: "已有型号"
      },
      purchaseDate: "购买日期",
      dataSelectTip: "请选择日期",
      dc: "DC",
      dcName: "DC名称",
      AddIdcTab: {
        title: "新增DC",
        dcName: "DC名称",
        location: "地区",
        principal: "负责人",
        tel: "电话"
      },
      editIdcTab: {
        title: "编辑DC",
        dcName: "DC名称",
        location: "地区",
        principal: "负责人",
        tel: "电话"
      },
      location: "地区",
      principal: "负责人",
      tel: "电话",
      cabinet: "机柜",
      AddCabinetTab: {
        title: "新增机柜",
        name: "名称",
        uSize: "U位",
        remark: "描述",
        DC: "DC"
      },
      editCabinetTab: {
        title: "编辑机柜",
        name: "名称",
        uSize: "U位",
        remark: "描述",
        DC: "DC"
      },
      uSize: "U位",
      remark: "描述",
      cli: "CLI账号",
      loginType: "登录类型",
      password: "密码",
      ssh: "SSH-Key",
      account: "用户名",
      port: "端口",
      upload: "上传",
      clickToUpload: "上传",
      clickToCover: "覆盖",
      sshKeyWasConfig: "SSH-KEY已配置",
      impi: {
        title: "IPMI",
        host: "主机",
        port: "端口"
      },
      vendorModel: "厂商/模型",
      protocol: "协议",
      sshProtocol: "SSH",
      telnetProtocol: "Telnet",
      userTip: "用户名提示",
      passwordTip: "密码提示",
      reloginPasswordTip: "RELOGIN提示",
      userPwdIntroduce: "请指定用户名和密码提示以便TELNET登录过程可自动运行",
      reLoginPwdIntroduce: "请指定密码提示以便RELOGIN登录过程可自动运行",
      exporter: "Exporter"
    },
    editAssetTab: {
      title: "新增资产",
      sn: "SN",
      host: "主机",
      state: "状态",
      modelId: "组件",
      alert: "告警信息",
      assetInfo: "资产信息",
      assetType: "资产类型",
      vendor: "厂商/型号",
      vendorTab: {
        vendor: "厂商/型号",
        vendorName: "新厂商",
        existVendor: "已有厂商",
        modelName: "新型号",
        existModel: "已有型号"
      },
      purchaseDate: "购买日期",
      dataSelectTip: "请选择日期",
      dc: "DC",
      dcName: "DC名称",
      AddIdcTab: {
        title: "新增DC",
        dcName: "DC名称",
        location: "地区",
        principal: "负责人",
        tel: "电话"
      },
      editIdcTab: {
        title: "编辑DC",
        dcName: "DC名称",
        location: "地区",
        principal: "负责人",
        tel: "电话"
      },
      location: "地区",
      principal: "负责人",
      tel: "电话",
      cabinet: "机柜",
      AddCabinetTab: {
        title: "新增机柜",
        name: "名称",
        uSize: "U位",
        remark: "描述",
        DC: "DC"
      },
      editCabinetTab: {
        title: "编辑机柜",
        name: "名称",
        uSize: "U位",
        remark: "描述",
        DC: "DC"
      },
      uSize: "U位",
      remark: "描述",
      cli: "CLI账号",
      loginType: "登录类型",
      password: "密码",
      ssh: "SSH-Key",
      account: "用户名",
      port: "端口",
      upload: "上传",
      clickToUpload: "上传"
    },
    tableTitle: {
      id: "ID",
      assetType: "资产类型",
      device: "SN",
      host: "Host",
      assetState: "状态",
      modules: "组件",
      alerts: "告警信息",
      dataCenter: "DC",
      cabinet: "机柜",
      model: "型号",
      manufacturer: "厂商",
      procurementDate: "购买日期",
      principal: "负责人",
      principalTel: "电话",
      option: "操作",
      assetPing: "Ping",
      vendor: "厂商"
    },
    tagTableTitle: {
      projectName: "系统名称",
      moduleName: "组件名称",
      endPoint: "EndPoint",
      alert: "告警"
    },
    assets: "资产",
    pingActive: "存活",
    assetStatPre: "最后应答:",
    assetStatDown: "未Ping通",
    pingInactive: "宕机",
    left: {
      dataCenter: "数据中心",
      assetType: "资产类型",
      vendor: "厂商",
      ping: "Ping"
    }
  },
  config: {
    config: "设置",
    account: {
      accountList: "用户列表",
      account: "用户",
      language: "语言",
      receiver: "用户组",
      createTime: "创建时间",
      enable: "可用",
      option: "操作",
      accountId: "用户ID",
      createAccount: "新增用户",
      editAccount: "编辑用户",
      notCurrentlySupport: "暂不支持",
      password: "密码",
      oldPwd: "旧密码",
      inputOldPwd: "请输入旧密码",
      newPwd: "新密码",
      inputNewPwd: "请输入新密码",
      confirmPwd: "确认密码",
      inputConfirmPwd: "请再次输入密码",
      invalidPwd: "无效的密码，最少6个字符",
      confirmPwdErr: "两次密码输入不一致",
      reinputPwd: "请再次输入密码"
    },
    promServer: {
      promServerList: "Prometheus服务",
      promId: "Prometheus服务ID",
      createProm: "新增Prometheus服务",
      editProm: "修改Prometheus服务",
      type: "类别",
      checkTime: "检查时间"
    },
    terminallog: {
      terminallog: "终端日志",
      status: "状态",
      option: "操作",
      host: "主机",
      cmd: "命令",
      port: "端口",
      userId: "用户ID",
      protocol: "协议",
      user: "终端用户",
      detail: "终端日志详情",
      resize: "终端窗口调整",
      download: "终端文件下载",
      upload: "终端文件上传",
      selectFile: "选择文件",
      SSH: "SSH",
      TELNET: "TELNET",
      id: "ID",
      time: "时间",
      width: "窗口宽度",
      height: "窗口高度",
      cols: "显示的列数",
      rows: "显示的行数",
      uuid: "唯一标识",
      path: "路径",
      file: "文件",
      success: "成功",
      fail: "失败"
    },
    dc: {
      dc: "数据中心",
      area: "地区",
      selectArea: "选择地区",
      cabinetNum: "机柜数量",
      assets: "资产",
      remark: "备注",
      cabinets: "机柜"
    },
    model: {
      model: "资产模型",
      vendor: "厂商",
      assets: "资产",
      editModel: "编辑模型",
      createModel: "创建模型",
      remark: "备注",
      type: "类型"
    },
    operationlog: {
      operationlog: "操作日志",
      id: "ID",
      username: "用户名",
      operation: "操作",
      type: "类型",
      createDate: "操作时间",
      ip: "IP",
      userId: "UserId",
      operaId: "数据ID",
      time: "耗时",
      params: "请求参数",
      state: "请求结果"
    },
    mib: {
      mib: "SNMP MIB",
      fileName: "文件名称",
      remark: "备注",
      updateUser: "更新用户",
      updateAt: "更新时间",
      editMib: "编辑MIB",
      models: "模型",
      modelTip: "请选择模型",
      createMib: "添加MIB",
      mibFiles: "MIB文件",
      uploadTip: "请上传MIB文件",
      requiredMibFile: "必须上传MIB文件",
      vendor: "厂商",
      type: "类型",
      mibBrowser: "MIB浏览器",
      noData: "暂无数据"
    },
    system: {
      system: "系统设置",
      basic: {
        basic: "基础设置",
        alertApi: "告警API",
        assetPingSwith: "资产Ping开关",
        assetPingInterval: "间隔",
        exporterTarget: "Exporter路径",
        scrapeInterval: "获取数据间隔",
        storageRetention: "本地保留时间",
        systemName: "系统名称",
        curUrl: "网站URL",
        timezone: "时区",
        defaultCabinetUsize: "机柜默认U位"
      },
      email: {
        email: "邮件",
        enable: "使用Email",
        smtpHost: "SMTP主机",
        smtpPort: "SMTP端口",
        smtpAccount: "SMTP账号",
        smtpPwd: "SMTP密码",
        sendAccount: "发送账号",
        testAccount: "测试账号",
        useSSL: "SSL",
        useTLS: "TLS",
        testConnection: "测试连接",
        pwdTip: "提示：一些邮件提供商需要输入的是Token",
        sendAccountTip: "提示：发送邮件账号，默认使用SMTP账号作为发送账号",
        testAccountTip: "提示：仅用来作为测试邮件收件人",
        sslTip: "如果SMTP端口是465，通常需要启用SSL",
        tlsTip: "如果SMTP端口是587，通常需要启用TLS"
      },
      terminal: {
        terminal: "终端",
        terminalNum: "最大终端数量"
      },
      ldap: {
        ldap: "LDAP",
        address: "LDAP地址",
        dn: "Bind DN",
        pwd: "密码",
        ou: "用户OU",
        filter: "用户过滤器",
        map: "LDAP属性映射",
        active: "启用LDAP认证"
      },
      reset: {
        reset: "重置",
        type: "类型",
        pwd: "密码",
        metric: "指标",
        alert: "告警",
        sysConfig: "系统设置",
        pwdTip: "请输入密码",
        promptTitle: "确认密码",
        yes: "是",
        no: "否"
      }
    }
  },
  alert: {
    alert: "告警",
    message: "告警信息",
    rule: "告警规则",
    alertList: "告警信息",
    alertConfig: "告警规则",
    alertName: "告警名称",
    severity: "等级",
    description: "描述",
    summary: "概要",
    startAt: "开始时间",
    endAt: "结束时间",
    list: {
      linked: "关联",
      type: "类别",
      state: "状态",
      charts: "图表",
      projectAlert: "系统告警",
      moduleAlert: "组件告警",
      deviceAlert: "设备告警",
      pending: "待处理",
      expired: "已过期",
      labels: "标签"
    },
    config: {
      name: "名称",
      receiver: "用户组",
      expr: "表达式",
      for: "For (s)",
      link: "关联",
      option: "操作",
      alertConfig: "告警规则",
      createAlertConfig: "新增告警规则",
      editAlertConfig: "修改告警规则",
      medium: "中",
      high: "高",
      low: "低",
      typeOption: {
        project: "系统",
        module: "组件",
        asset: "设备"
      },
      alertNum: "告警数量"
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
      },
      version: "版本",
      walk: "Walk",
      maxRepetitions: "最大迭代次数",
      retries: "重试次数",
      timeout: "连接超时时间",
      community: "共享",
      securityLevel: "安全等级",
      authProtocol: "认证协议",
      privProtocol: "隐私协议",
      contextName: "内容名称",
      privPassword: "隐私密码"
    },
    endpoint: {
      createEndpoint: "新增Endpoint",
      editEndpoint: "编辑Endpoint",
      endpoint: "Endpoint",
      endpointId: "Endpoint ID",
      host: "主机",
      port: "端口",
      param: "参数",
      path: "路径",
      asset: "设备",
      lastUpdate: "最后更新时间",
      moduleParameter: "组件参数",
      addGraph: "查看图表",
      element: "元素",
      value: "值",
      promExpr: "请输入表达式",
      dialogTitle: "图表",
      hideSameLabels: "隐藏重复标签",
      stateInfo_230009: "无法获取prometheus服务",
      stateInfo_230010: "prometheus服务可用",
      stateInfo_230011: "prometheus服务不可用 "
    },
    metrics: {
      metrics: "指标",
      name: "名称",
      type: "类型",
      description: "描述"
    }
  },
  el: {
    colorpicker: {
      confirm: "确定",
      clear: "清空"
    },
    datepicker: {
      now: "此刻",
      today: "今天",
      cancel: "取消",
      clear: "清空",
      confirm: "确定",
      selectDate: "选择日期",
      selectTime: "选择时间",
      startDate: "开始日期",
      startTime: "开始时间",
      endDate: "结束日期",
      endTime: "结束时间",
      prevYear: "前一年",
      nextYear: "后一年",
      prevMonth: "上个月",
      nextMonth: "下个月",
      year: "年",
      month1: "1 月",
      month2: "2 月",
      month3: "3 月",
      month4: "4 月",
      month5: "5 月",
      month6: "6 月",
      month7: "7 月",
      month8: "8 月",
      month9: "9 月",
      month10: "10 月",
      month11: "11 月",
      month12: "12 月",
      weeks: {
        sun: "日",
        mon: "一",
        tue: "二",
        wed: "三",
        thu: "四",
        fri: "五",
        sat: "六"
      },
      months: {
        jan: "一月",
        feb: "二月",
        mar: "三月",
        apr: "四月",
        may: "五月",
        jun: "六月",
        jul: "七月",
        aug: "八月",
        sep: "九月",
        oct: "十月",
        nov: "十一月",
        dec: "十二月"
      },
      week: "周"
    },
    select: {
      loading: "加载中",
      noMatch: "无匹配数据",
      noData: "无数据",
      placeholder: "请选择"
    },
    cascader: {
      noMatch: "无匹配数据",
      loading: "加载中",
      placeholder: "请选择",
      noData: "暂无数据"
    },
    pagination: {
      goto: "前往",
      pagesize: "条/页",
      total: "共 {total} 条",
      pageClassifier: "页"
    },
    messagebox: {
      title: "提示",
      confirm: "确定",
      cancel: "取消",
      error: "输入的数据不合法!"
    },
    upload: {
      deleteTip: "按 delete 键可删除",
      delete: "删除",
      preview: "查看图片",
      continue: "继续上传"
    },
    table: {
      emptyText: "暂无数据",
      confirmFilter: "筛选",
      resetFilter: "重置",
      clearFilter: "全部",
      sumText: "合计"
    },
    tree: {
      emptyText: "暂无数据"
    },
    transfer: {
      noMatch: "无匹配数据",
      noData: "无数据",
      titles: [
        "列表 1",
        "列表 2"
      ],
      filterPlaceholder: "请输入搜索内容",
      noCheckedFormat: "共 {total} 项",
      hasCheckedFormat: "已选 {checked}/{total} 项"
    },
    image: {
      error: "加载失败"
    },
    pageHeader: {
      title: "返回"
    },
    popconfirm: {
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    }
  },
  ...zhLocale
}

export default cn;
