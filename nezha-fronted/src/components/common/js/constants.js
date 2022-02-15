import i18n from '../i18n'

export const defaultPageSize = 20

export const agent = {
  theData: [
    {
      label: 'Federation',
      value: 'federation',
      children: [
        {
          label: 'Global',
          value: 1,
          text: 'Global'
        },
        {
          label: 'Per-datacenter',
          value: 2,
          text: 'Per-datacenter'
        }
        // {
        //   label: 'Loki',
        //   value: 11,
        //   text: 'Loki'
        // }
      ]
    },
    {
      label: 'Thanos',
      value: 'Thanos',
      children: [
        {
          label: 'Query',
          value: 3,
          text: 'Thanos-Query'
        },
        {
          label: 'Rule',
          value: 4,
          text: 'Thanos-Rule'
        },
        {
          label: 'Sidecar',
          value: 5,
          text: 'Thanos-Sidecar'
        },
        {
          label: 'Store',
          value: 6,
          text: 'Thanos-Store'
        },
        {
          label: 'Compactor',
          value: 7,
          text: 'Thanos-Compactor'
        }
      ]
    }
  ]

}
export const agent2 = {
  theData: [
    {
      label: 'Global',
      value: 1,
      text: 'Global'
    },
    {
      label: 'Per-datacenter',
      value: 2,
      text: 'Per-datacenter'
    }
    // {
    //   label: 'Loki',
    //   value: 11,
    //   text: 'Loki'
    // }
  ],
  theDataGroup: [
    {
      label: 'Metrics',
      option: [
        {
          label: 'Global',
          value: 1,
          text: 'Global'
        },
        {
          label: 'Per-datacenter',
          value: 2,
          text: 'Per-datacenter'
        }
      ]
    },
    {
      label: 'Logs',
      option: [
        {
          label: 'Loki',
          value: 11,
          text: 'Loki'
        }
      ]
    }
  ],
  protocol: [
    {
      label: 'http',
      value: 'http'
    },
    {
      label: 'https',
      value: 'https'
    }
  ]

}
export const asset = {
  pingData: [
    { value: 1, label: 'up' },
    { value: 0, label: 'down' }
  ],
  stateData: [
    { value: 1, label: i18n.t('asset.inStock') },
    { value: 2, label: i18n.t('asset.notInStock') },
    { value: 3, label: i18n.t('asset.suspended') }
  ],
  assetType: {
    authProtocolOptions: [
      { value: 0, label: 'nothing' },
      { value: 1, label: 'SSH' },
      { value: 2, label: 'TELNET' }
    ],
    authProtocolData: {
      non: 0,
      ssh: 1,
      telnet: 2
    }
  },
  authProtocolOptions: [
    { value: 1, label: 'SSH' },
    { value: 2, label: 'TELNET' }
  ],
  authProtocolData: {
    ssh: 1,
    telnet: 2
  },
  authTypeOptions: [
    { value: 1, label: 'Username' },
    { value: 2, label: 'Key' }
  ],
  authTypeData: {
    username: 1,
    key: 2
  },
  editTypeOptions: [
    { value: 1, label: i18n.t('overall.account') },
    { value: 2, label: 'Label' },
    { value: 3, label: i18n.t('asset.state') },
    { value: 4, label: i18n.t('asset.snmpCredential') }
  ],
  editTypeData: {
    account: 1,
    label: 2,
    state: 3,
    snmpCredential: 4
  },
  labelTypeData: {
    TEXT: 'TEXT',
    MULTITEXT: 'MULTITEXT',
    TEXTAREA: 'TEXTAREA',
    RADIO: 'RADIO',
    CHECKBOX: 'CHECKBOX',
    SELECT: 'SELECT',
    INTEGER: 'INTEGER',
    DOUBLE: 'DOUBLE',
    DATETIME: 'DATETIME',
    EMAIL: 'EMAIL'
  },
  labelSubTypeData: {
    date: 'date',
    time: 'time',
    dateTime: 'dateTime'
  }
}

export const alertMessage = {
  severityData: [
    { value: 'P1', label: i18n.t('alert.config.P1') },
    { value: 'P2', label: i18n.t('alert.config.P2') },
    { value: 'P3', label: i18n.t('alert.config.P3') }
  ],
  typeData: [
    { value: 1, label: i18n.t('alert.config.typeOption.project') },
    { value: 2, label: i18n.t('alert.config.typeOption.module') },
    { value: 3, label: i18n.t('alert.config.typeOption.asset') }
  ],
  levels: [
    { value: 'P1', label: i18n.t('alert.config.P1') },
    { value: 'P2', label: i18n.t('alert.config.P2') },
    { value: 'P3', label: i18n.t('alert.config.P3') }
  ],
  states: [
    { value: '1', label: i18n.t('overall.active') },
    { value: '2', label: i18n.t('overall.silence') },
    { value: '3', label: i18n.t('alert.list.expired') }
  ]
}

export const statisticsList = [
  { value: 'min', label: i18n.t('dashboard.panel.chartForm.statisticsVal.min') },
  { value: 'max', label: i18n.t('dashboard.panel.chartForm.statisticsVal.max') },
  { value: 'average', label: i18n.t('dashboard.panel.chartForm.statisticsVal.average') },
  { value: 'total', label: i18n.t('dashboard.panel.chartForm.statisticsVal.total') },
  { value: 'first', label: i18n.t('dashboard.panel.chartForm.statisticsVal.first') },
  { value: 'last', label: i18n.t('dashboard.panel.chartForm.statisticsVal.last') },
  { value: 'range', label: i18n.t('dashboard.panel.chartForm.statisticsVal.range') },
  { value: 'different', label: i18n.t('dashboard.panel.chartForm.statisticsVal.different') }
]

export const alignList = [
  { value: 'left', label: i18n.t('dashboard.panel.chartForm.alignList.left') },
  { value: 'center', label: i18n.t('dashboard.panel.chartForm.alignList.center') },
  { value: 'right', label: i18n.t('dashboard.panel.chartForm.alignList.right') }
]

export const lockList = [
  { value: 1, label: i18n.t('dashboard.panel.chartForm.lockList.on') },
  { value: 0, label: i18n.t('dashboard.panel.chartForm.lockList.off') }
]

export const chart = {
  varType: [
    { value: '1', label: i18n.t('asset.asset') },
    { value: '2', label: i18n.t('asset.endpoint') }
  ],
  type: [
    {
      value: 'line',
      label: i18n.t('dashboard.panel.chartForm.typeVal.line.label')
    },
    {
      value: 'stackArea',
      label: i18n.t('dashboard.panel.chartForm.typeVal.stackArea.label')
    },
    {
      value: 'bar',
      label: i18n.t('dashboard.panel.chartForm.typeVal.bar.label')
    },
    {
      value: 'singleStat',
      label: i18n.t('dashboard.panel.chartForm.typeVal.singleStat.label')
    },
    {
      value: 'pie',
      label: i18n.t('dashboard.panel.chartForm.typeVal.pie.label')
    },
    {
      value: 'table',
      label: i18n.t('dashboard.panel.chartForm.typeVal.table.label')
    },
    {
      value: 'alertList',
      label: i18n.t('dashboard.panel.chartForm.typeVal.alertList.label')
    },
    {
      value: 'text',
      label: i18n.t('dashboard.panel.chartForm.typeVal.text.label')
    },
    {
      value: 'url',
      label: i18n.t('dashboard.panel.chartForm.typeVal.url.label')
    },
    {
      value: 'group',
      label: i18n.t('dashboard.panel.chartForm.typeVal.group.label')
    },
    {
      value: 'logs',
      label: i18n.t('dashboard.panel.chartForm.typeVal.logs.label')
    },
    {
      value: 'diagram',
      label: i18n.t('dashboard.panel.chartForm.typeVal.diagram.label')
    }
  ]
}

export const intervalList = [
  { value: -1, label: i18n.t('dashboard.panel.refreshInterval.never') },
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 300, label: '5m' },
  { value: 900, label: '15m' },
  { value: 1800, label: '30m' }
]

export const setting = {
  DcState: [
    { value: 'ON', label: i18n.t('config.dc.usable') },
    { value: 'OFF', label: i18n.t('config.dc.suspended') }
  ]
}
export const snmpProtocolTypes = [
  // {label:'V1',value:1},
  { label: 'V2', value: 2 },
  { label: 'V3', value: 3 }
]
export const snmpAuthMethod = [
  { label: 'None', value: '' },
  { label: 'MD5', value: 'MD5' },
  { label: 'SHA', value: 'SHA' }
]
export const snmpEncryptionMethod = [
  { label: 'None', value: '' },
  { label: 'DES', value: 'DES' },
  { label: 'AES-128', value: 'AES-128' },
  { label: 'AES-192', value: 'AES-192' },
  { label: 'AES-256', value: 'AES-256' }
]
export const terminalLog = {
  status: {
    0: i18n.t('config.terminallog.statusItem.connecting'),
    1: i18n.t('config.terminallog.statusItem.connectionFailed'),
    2: i18n.t('config.terminallog.statusItem.over'),
    3: i18n.t('config.terminallog.statusItem.kickedOut'),
    4: i18n.t('config.terminallog.statusItem.unknownError')
  },
  dangerCmd: ['chmod', 'chown', 'kill', 'rm', 'su', 'sudo'],
  infoCmd: ['exit']
}
export const theme = [
  { label: 'light', value: 1 },
  { label: 'dark', value: 2 }
]
// 需要隐藏的内置label
export const sameLabels = ['instance', 'module', 'project', 'asset', 'endpoint', 'datacenter', 'datacenter_id', 'endpoint_id', 'module_id', 'nz_agent_id', 'project_id']
// 公共组件的跳转来源
export const fromRoute = {
  panel: 'panel',
  explore: 'explore',
  alertMessage: 'alertMessage',
  alertRule: 'alertRule',
  alertSilence: 'alertSilence',
  model: 'model',
  mib: 'mib',
  credential: 'credential',
  asset: 'asset',
  assetType: 'assetType',
  assetState: 'assetState',
  assetLabel: 'assetLabel',
  expressionTemplate: 'expressionTemplate',
  user: 'user',
  agent: 'agent',
  dc: 'dc',
  role: 'role',
  project: 'project',
  module: 'module',
  endpoint: 'endpoint',
  endpointQuery: 'endpointQuery',
  terminalLog: 'terminalLog',
  operationLog: 'operationLog',
  menus: 'menus',
  notify: 'notify',
  link: 'link',
  apiKey: 'apiKey',
  chartTemp: 'chartTemp'
}

export const chartdatasource = [
  {
    label: 'metrics',
    value: 1
  },
  {
    label: 'logs',
    value: 2
  },
  {
    label: 'misc',
    value: 4
  },
  {
    label: 'system',
    value: 3
  }
]

export const chartType = {
  line: 'line',
  area: 'area',
  point: 'point',
  bar: 'bar',
  table: 'table',
  stat: 'stat',
  guage: 'guage',
  pie: 'pie',
  treemap: 'treemap',
  log: 'log',
  text: 'text',
  url: 'url',
  clock: 'clock',
  group: 'group',
  diagram: 'diagram',
  assetInfo: 'assetInfo',
  endpointInfo: 'endpointInfo',
  topology: 'topology',
  map: 'map',
  hexagon: 'hexagon'
}

export const chartLegendPlacement = {
  hidden: 'hidden',
  left: 'left',
  right: 'right',
  bottom: 'bottom'
}

export const stackIconSvg = 'path://M538.112 998.4a25.6 25.6 0 0 1-11.776-2.88L39.424 743.232a25.6 25.6 0 1 1 23.552-45.44l474.368 245.824 422.592-245.248a25.6 25.6 0 0 1 25.728 44.288l-434.688 252.288a25.728 25.728 0 0 1-12.864 3.456z,M538.112 789.888a25.6 25.6 0 0 1-11.776-2.88L39.424 534.72a25.6 25.6 0 1 1 23.552-45.44l474.368 245.824 422.592-245.248a25.6 25.6 0 1 1 25.728 44.288l-434.688 252.288a25.728 25.728 0 0 1-12.864 3.456z,M538.112 581.312a25.6 25.6 0 0 1-11.776-2.88L39.424 326.144a25.6 25.6 0 0 1-1.088-44.928L473.088 28.928a25.344 25.344 0 0 1 24.64-0.576l486.848 252.288a25.6 25.6 0 0 1 1.088 44.928L550.976 577.856a25.728 25.728 0 0 1-12.864 3.456zM104.384 302.208l432.96 224.384 382.208-221.824-432.96-224.384-382.208 221.824z'
