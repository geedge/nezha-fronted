import enLocale from 'element-ui/lib/locale/lang/en' //引入element语言包
const en = {
  overall:{
    dashboard:'Dashboard',
    project:'Projects',
    alert: "Alert",
    asset:'Assets',
    config:'Config',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    esc: 'Esc',
    cancel: 'Cancel',
    save: 'Save',
    search: 'Search',
    add: "Add",
    option: "Option",
    clearAll: "Clear All",
    clear: "Clear",
    name: 'Name',
    cover: 'Cover',
    signOut: 'Sign Out',
    select: 'Select',
    ok: 'Ok',
    all: 'All',
    other: "Other"
  },
  dashboard:{
    title:'Dashboard',
    panel:{
      title:'Panel',
      searchItem:{
        name:'name'
      },
      //面板-侧滑框
      createPanelTitle: "Create Panel",
      selectPanelTitle:"Select Panel",
      createPanelTitleSec:"Create New Panel",
      editPanelTitle: "Panel",
      panelForm:{
        panelName:"Panel Name",
        panelId:"ID"
      },
      //图表-侧滑框
      createChartTitle: "Create Chart",
      editChartTitle: "Edit Chart",
      chartForm:{
        chartId:"ID",
        chartName:"Chart Name",
        type:"Type",
        typeVal:{
          line:{
            label:"Line"
          },
          bar:{
            label:"Bar"
          },
          table:{
            label:"Table"
          }
        },
        width:"Width",
        high:"High",
        metric:"Metric",
        addMetric:"Add Metric",
      },
      chartTableColumn:{
        metric:'metric',
        label:'label',
        time:'time',
        value:'value',
      },
      startTime:'startTime',
      endTime:'endTime',
      to:'To',
      recOne:'recent hour',
      recFour:'recent 4 hours',
      recOneDay:'recent day',
      yesterday:'yesterday',
      recSevenDay:'recent week',
      recOneMonth:'recent month',
      curMonth:'this month',
      lastMonth:'last month',
      refreshInterval:{
        never:'never',
        oneMinute:'1 min',
        threeMinutes:'3 mins',
        fiveMinutes:'5 mins',
        tenMinutes:'10 mins',
      },
      view:'View',
      confirm:'Ok',
      cancel:'Cancel'
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
    required: 'Required',
    number: 'Must be a number',
    email:'E-mail is invalid',
    tel:'Phone number is invalid',
    host:'IP Address is invalid',
    fileSize:'upload file is too large',
    port:'Port is invalide',
    special:'Has special characters',
    config: {
      account: {

      }
    }
  },
  search: {
    searchTip: 'Press Enter or click to search',
    recentSearch: 'Recent Searches',
    noRecentSearch: 'No Recent Searches'
  },
  tip: {
    confirmDelete: "Confirm Delete?",
    assetConfirmDelete: 'The associated Endpoints and Alerts will also be deleted, confirm delete?',
    yes: "Yes",
    no: "No",
    deleteSuccess: "Successfully Deleted",
    saveSuccess: "Successfully Saved",
    coverSuccess: 'Successfully Covered',
    refreshLater:'Please refresh later'
  },
  asset:{
    asset: 'Asset',
    EditAsset:'Edit Asset',
    createAssetTab:{
      title:'Create Asset',
      sn:'SN',
      host:'Host',
      state:'State',
      selectTip:'please select',
      inStock: 'In Stock',
      notInStock: 'Not In Stock',
      assetInfo:'Asset Info',
      assetType:'Asset Type',
      assetTypeTab:{
        assetType:'Asset Type',
        addAssetType:'Add Asset Type',
        existAssetType:'Exist Asset Type'
      },
      vendor:'Vendor/Model',
      vendorTab:{
        vendor:'Vendor/Model',
        vendorName:'New Vendor',
        existVendor:'Exist Vendor',
        modelName:'New Model',
        existModel:'Exist Model'
      },
      purchaseDate:'Purchase',
      dataSelectTip:'please select data',
      dc:'DC',
      dcName:'DC Name',
      AddIdcTab:{
        title:'Add DC',
        dcName:'DC Name',
        location:'Location',
        principal:'Principal',
        tel:'Tel'
      },
      editIdcTab:{
        title:'Edit IDC',
        dcName:'DC Name',
        location:'Location',
        principal:'Principal',
        tel:'Tel'
      },
      location:'Location',
      principal:'Principal',
      tel:'Tel',
      cabinet: 'Cabinet',
      AddCabinetTab:{
        title:'Add Cabinet',
        name:'Name',
        uSize:'U Size',
        remark:'Desc',
        DC:'DC',
      },
      editCabinetTab:{
        title:'Edit Cabinet',
        name:'Name',
        uSize:'U Size',
        remark:'Desc',
        DC:'DC',
      },
      uSize:'U Size',
      remark:'Desc',
      cli:'CLI Account',
      loginType:'Login Type',
      password:'Password',
      ssh:'SSH-Key',
      account:'Account',
      port:'Port',
      upload:'Upload',
      clickToUpload:'Upload',
      clickToCover:'Cover',
      sshKeyWasConfig:'SSH-KEY has been configured',
      exporter:'Exporter'
    },
    editAssetTab:{
      title:'Create Asset',
      sn:'SN',
      host:'Host',
      state:'State',
      modelId:'ModelId',
      alert:'Alert',
      assetInfo:'资产信息',
      assetType:'资产类型',
      vendor:'厂商/型号',
      vendorTab:{
        vendor:'厂商/型号',
        vendorName:'新厂商名称',
        existVendor:'已有厂商',
        modelName:'新型号名称',
        existModel:'已有型号'
      },
      purchaseDate:'Purchase',
      dataSelectTip:'please select data',
      dc:'DC',
      dcName:'DC Name',
      AddIdcTab:{
        title:'+Add IDC',
        dcName:'DC Name',
        location:'Location',
        principal:'负责人',
        tel:'Tel'
      },
      editIdcTab:{
        title:'Edit IDC',
        dcName:'DC Name',
        location:'Location',
        principal:'负责人',
        tel:'Tel'
      },
      location:'Location',
      principal:'负责人',
      tel:'Tel',
      cabinet: '机柜',
      AddCabinetTab:{
        title:'+Add机柜',
        name:'Name',
        uSize:'U Size',
        remark:'Desc',
        DC:'DC',
      },
      editCabinetTab:{
        title:'Edit Cabinet',
        name:'Name',
        uSize:'U Size',
        remark:'Desc',
        DC:'DC',
      },
      uSize:'U Size',
      remark:'Desc',
      cli:'CLI Account',
      loginType:'登录方式',
      password:'password',
      ssh:'SSH私钥',
      account:'Account',
      port:'Port',
      upload:'Upload',
      clickToUpload:'点击上传'
    },
    tableTitle: {
      id: 'ID',
      assetType: 'Asset Type',
      device: 'SN',
      host: 'Host',
      assetState: 'State',
      modules: 'Modules',
      alerts: 'Alerts',
      dataCenter: 'Data Center',
      cabinet: 'Cabinet',
      model: 'Model',
      manufacturer: 'Vendor',
      procurementDate: 'Purchase',
      principal: 'Principal',
      principalTel: 'Tel',
      option: "Option"
    },
    tagTableTitle: {
      projectName: '项目名称',
      moduleName: 'Module Name',
      endPoint: 'EndPoint',
      alert: 'alert',
    },

  },
  config: {
    config: "Config",
    account: {
      accountList: "Account List",
      //列表表头
      account: "Account",
      language: "Language",
      receiver: "Receiver",
      createTime: "Create Time",
      enable: "Enable",
      option: "Option",

      //侧滑框
      accountId: "Accound ID",
      createAccount: "Create Account",
      editAccount: "Edit Account",
      notCurrentlySupport: 'Not currently supported',
      password: 'Password'
    },
    promServer: {
      promServerList: "Prometheus Server",
      //侧滑框
      promId: "Prometheus Server ID",
      createProm: "Create Prometheus Server",
      editProm: "Edit Prometheus Server",
      type: "Type"
    },
  },
  alert: {
    alert: "Alert",
    message: 'Message',
    rule: 'Rule',
    alertList: "Alert Message",
    alertConfig: "Alert Rule",
    alertName: "Alert Name",
    severity: "Severity",
    description: "Desc",
    summary: "Summary",
    startAt: "Start Time",
    endAt: "End Time",
    list: {
      //表头
      linked: "Linked",
      type: "Type",
      state: "Status",
      charts: "Charts",

      //表内容
      projectAlert: "Project Alert",
      moduleAlert: "Module Alert",
      deviceAlert: "Device Alert",
      pending: "Pending",
      expired: "Expired"
    },
    config: {
      name: "Name",
      receiver: "Receiver",
      expr: "Expr",
      for: "For (s)",
      link: 'Link',
      option: "Option",
      alertConfig: "Alert Rule",
      createAlertConfig: "Create Alert Rule",
      editAlertConfig: "Edit Alert Rule",
      medium: "Medium",
      high: "High",
      low: "Low",
      typeOption: {
        project: 'Project',
        module: 'Module',
        asset: 'Asset'
      }
    }
  },
  project: {
    project: {
      project: "Project",
      projectName: "Project Name",
      editProject: "Edit Project",
      description: "Description",
      createProject: "Create Project"
    },
    module: {
      module: "Module",
      moduleName: "Module Name",
      editModule: "Edit Module",
      description: "Description",
      createModule: "Create Module",
      tip: {
        defaultEndpointSet: "Default Endpoint Set",
        relation: "Endpoints associated with Module will reference Port/Path/Param by default"
      }
    },
    endpoint: {
      createEndpoint: "Create Endpoint",
      editEndpoint: "Edit Endpoint",
      endpoint: "Endpoint",
      endpointId: "Endpoint ID",
      host: "Host",
      port: "Port",
      param: "Param",
      path: "Path",
      asset: "Asset",
      lastUpdate: "Last Update",
      moduleParameter: "Module's Parameter"
    },
    metrics: {
      metrics: "Metrics",
      name: 'Name',
      type: 'Type',
      description: 'Desc'
    }
  },
  ...enLocale
}

export default en;
