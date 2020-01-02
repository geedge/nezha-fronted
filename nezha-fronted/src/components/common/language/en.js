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
    signOut: 'Sign Out'
  },
  dashboard:{
    title:'Dashboard',
    panel:{
      title:'Panel',
      //侧滑框
      createPanelTitle: "Create Panel",
      createPanelTitleSec:"Create New Panel",
      editPanelTitle: "Panel",
      panelForm:{
        panelName:"Panel Name",
        panelId:"ID"
      }
    },
    metricPreview:{
      title:'MetricPreview',
    }
  },
  validate: { //校验规则
    required: 'Required',
    number: 'Must be a number',
    email:'E-mail is invalide',
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
    yes: "Yes",
    no: "No",
    deleteSuccess: "Successfully Deleted",
    saveSuccess: "Successfully Saved",
    coverSuccess: 'Successfully Covered'
  },
  asset:{
    asset: 'Asset',
    createAsset: "Create Asset",
    EditAsset:'Edit Asset',
    createAssetTab:{
      title:'Create Asset',
      sn:'SN',
      host:'host',
      state:'state',
      selectTip:'please select',
      assetInfo:'资产信息',
      assetType:'资产类型',
      assetTypeTab:{
        assetType:'资产类型',
        addAssetType:'新增资产类型',
        existAssetType:'已有资产类型'
      },
      vendor:'厂商/型号',
      vendorTab:{
        vendor:'厂商/型号',
        vendorName:'新厂商名称',
        existVendor:'已有厂商',
        modelName:'新型号名称',
        existModel:'已有型号'
      },
      purchaseDate:'购买日期',
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
        title:'Edit 机柜',
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
    editAssetTab:{
      title:'Create Asset',
      sn:'SN',
      host:'host',
      state:'state',
      selectTip:'please select',
      inStore:'在库',
      outStore:'出库',
      modelId:'ModelId',
      alert:'Alert',
      assetInfo:'资产信息',
      assetType:'资产类型',
      assetTypeTab:{
        assetType:'资产类型',
        addAssetType:'新增资产类型',
        existAssetType:'已有资产类型'
      },
      vendor:'厂商/型号',
      vendorTab:{
        vendor:'厂商/型号',
        vendorName:'新厂商名称',
        existVendor:'已有厂商',
        modelName:'新型号名称',
        existModel:'已有型号'
      },
      purchaseDate:'购买日期',
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
        title:'Edit 机柜',
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
      assetType: '资产类型',
      device: 'SN',
      host: 'Host',
      assetState: 'State',
      module: 'Module',
      alert: 'Alert',
      dataCenter: '数据中心',
      cabinet: '机柜',
      model: '型号',
      manufacturer: '厂商',
      procurementDate: '购买日期',
      principal: '责任人',
      principalTel: '责任人电话',
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
    alertList: "Alert List",
    alertConfig: "Alert Config",
    alertName: "Alert Name",
    severity: "Severity",
    description: "Desc",
    summary: "Summary",
    startAt: "Start Time",
    endAt: "End Time",
    list: {
      //表头
      linkedId: "Linked ID",
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
      alertConfig: "Alert Config",
      createAlertConfig: "Create Alert Config",
      editAlertConfig: "Edit Alert Config",
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
        relation: "Endpoints associated with Module will reference Port/Path/Param/Params by default"
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
      name: 'name',
      type: 'Type',
      description: 'Desc'
    }
  },
  ...enLocale
}

export default en;
