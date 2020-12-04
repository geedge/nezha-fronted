import i18n from "../i18n";

export const staticMenus = {
  settings: {
    title: i18n.t('overall.config'),
    menu: [
      {route: '/account', name: i18n.t('config.account.account')},
      {route: '/promServer', name: i18n.t('config.promServer.promServerList')},
      {route: '/dc', name: i18n.t('config.dc.dc')},
      {route: '/model', name: i18n.t('config.model.model')},
      {route: '/mib', name: i18n.t('config.mib.mib')},
      {route: '/system', name: i18n.t('config.system.system')},
      {route: '/terminalLog', name: i18n.t('config.terminallog.terminallog')},
      {route: '/operationLog', name: i18n.t('config.operationlog.operationlog')},
      {route: '/about', name: i18n.t('overall.about')},
    ],
  },
  alerts: {
    title: i18n.t('alert.alert'),
      menu: [
      {route: '/alertList', name: i18n.t('alert.alertList')},
      {route: '/alertConfig', name: i18n.t('alert.alertConfig')},
    ],
  },
  dashboards: {
    title: i18n.t('dashboard.title'),
      menu: [
      {route: '/overview', name: i18n.t('dashboard.overview.title')},
      {route: '/panel', name: i18n.t('dashboard.panel.title')},
      {route: '/explore', name: i18n.t('dashboard.metricPreview.title')},
    ],
  },
};

export const promServer = {
  theData:[
    {
      label:'Federation',
      value:'federation',
      children:[
        {
          label:'Global',
          value:1,
          text:'Global',
        },
        {
          label:'Per-datacenter',
          value:2,
          text:'Per-datacenter',
        }
      ]
    },
    {
      label:'Thanos',
      value:'Thanos',
      children:[
        {
          label:'Query',
          value:3,
          text:'Thanos-Query'
        },
        {
          label:'Rule',
          value:4,
          text:'Thanos-Rule'
        },
        {
          label:'Sidecar',
          value:5,
          text:'Thanos-Sidecar'
        },
        {
          label:'Store',
          value:6,
          text:'Thanos-Store'
        },
        {
          label:'Compactor',
          value:7,
          text:'Thanos-Compactor'
        }
      ]
    }
  ]

};

export const asset = {
  pingData: [
    {value: 1, label: 'up'},
    {value: 0, label: 'down'},
  ],
  stateData: [
    {value: 1, label: i18n.t('asset.inStock')},
    {value: 2, label: i18n.t('asset.notInStock')},
    {value: 3, label: i18n.t('asset.suspended')},
  ],
};

export const alertMessage = {
  severityData: [
    {value: 'P1', label: i18n.t("alert.config.P1")},
    {value: 'P2', label: i18n.t("alert.config.P2")},
    {value: 'P3', label: i18n.t("alert.config.P3")}
  ],
  typeData: [
    {value: 1, label: i18n.t('alert.config.typeOption.project')},
    {value: 2, label: i18n.t('alert.config.typeOption.module')},
    {value: 3, label: i18n.t('alert.config.typeOption.asset')}
  ],
  levels:[
    {value: 'P1', label: i18n.t("alert.config.P1")},
    {value: 'P2', label: i18n.t("alert.config.P2")},
    {value: 'P3', label: i18n.t("alert.config.P3")}
  ],
  states:[
    {value: '1', label: i18n.t('alert.list.pending')},
    {value: '2', label: i18n.t('alert.list.expired')}
  ],
};

export const statisticsList = [
  {value: "min", label: i18n.t("dashboard.panel.chartForm.statisticsVal.min")},
  {value: "max", label: i18n.t("dashboard.panel.chartForm.statisticsVal.max")},
  {value: "average", label: i18n.t("dashboard.panel.chartForm.statisticsVal.average")},
  {value: "total", label: i18n.t("dashboard.panel.chartForm.statisticsVal.total")},
  {value: "first", label: i18n.t("dashboard.panel.chartForm.statisticsVal.first")},
  {value: "last", label: i18n.t("dashboard.panel.chartForm.statisticsVal.last")},
  {value: "range", label: i18n.t("dashboard.panel.chartForm.statisticsVal.range")},
  {value: "different", label: i18n.t("dashboard.panel.chartForm.statisticsVal.different")},
];

export const intervalList = [
  {value: -1, label: i18n.t("dashboard.panel.refreshInterval.never")},
  {value: 30, label: '30s'},
  {value: 60, label: '1m'},
  {value: 300, label: '5m'},
  {value: 900, label: '15m'},
  {value: 1800, label: '30m'}
];

export const setting = {
    DcState:[
      {value:'ON',label: i18n.t('config.dc.usable')},
      {value:'OFF',label: i18n.t('config.dc.suspended')}
    ]
};
