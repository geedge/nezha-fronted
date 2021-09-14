<script>
import i18n from './i18n'
const searchSelectInfo = { // value: 传给后台的值；label：显示给用户看的值
  severity: [ // 告警级别
    {
      value: 'P1',
      label: i18n.t('alert.config.P1')
    },
    {
      value: 'P2',
      label: i18n.t('alert.config.P2')
    },
    {
      value: 'P3',
      label: i18n.t('alert.config.P3')
    }
  ],
  promType: [ // promServer类型
    {
      value: 1,
      label: 'Global'
    },
    {
      value: 2,
      label: 'Per-Datacenter'
    }
  ],
  alertType: [ // 告警类型
    {
      value: 1,
      label: i18n.t('alert.config.typeOption.project')
    },
    {
      value: 2,
      label: i18n.t('alert.config.typeOption.module')
    },
    {
      value: 3,
      label: i18n.t('alert.config.typeOption.asset')
    }
  ],
  assetState: [ // 资产入库/出库状态
    {
      value: 1,
      label: i18n.t('asset.inStock')
    }, {
      value: 2,
      label: i18n.t('asset.notInStock')
    }, {
      value: 3,
      label: i18n.t('asset.suspended')
    }
  ],
  endpointState: [
    {
      value: 1,
      label: 'UP'
    }, {
      value: 0,
      label: 'DOWN'
    }, {
      value: 2,
      label: 'SUSPENDED'
    }
  ],
  promState: [
    {
      value: 1,
      label: 'UP'
    }, {
      value: 0,
      label: 'DOWN'
    }
  ],
  pingStatus: [
    {
      value: '0',
      label: i18n.t('asset.pingInactive')
    },
    {
      value: '1',
      label: i18n.t('asset.pingActive')
    }
  ],
  credentialType: [
    {
      value: 2,
      label: 'V2'
    }, {
      value: 3,
      label: 'V3'
    }
  ],
  operation: [
    {
      value: 'add',
      label: i18n.t('config.operationlog.operations.add')
    },
    {
      value: 'update',
      label: i18n.t('config.operationlog.operations.update')
    },
    {
      value: 'query',
      label: i18n.t('config.operationlog.operations.query')
    },
    {
      value: 'import',
      label: i18n.t('config.operationlog.operations.import')
    },
    {
      value: 'export',
      label: i18n.t('config.operationlog.operations.export')
    },
    {
      value: 'delete',
      label: i18n.t('config.operationlog.operations.delete')
    },
    {
      value: 'reset',
      label: i18n.t('config.operationlog.operations.reset')
    },
    {
      value: 'unknown',
      label: i18n.t('config.operationlog.operations.unknown')
    },
    {
      value: 'login',
      label: i18n.t('config.operationlog.operations.login')
    },
    {
      value: 'logout',
      label: i18n.t('config.operationlog.operations.logout')
    }
  ],
  alertMessageState: [
    {
      value: '1',
      label: i18n.t('alert.list.pending')
    },
    {
      value: '2',
      label: i18n.t('alert.list.expired')
    }
  ],
  protocol: [
    {
      value: 'SSH',
      label: i18n.t('config.terminallog.SSH')
    },
    {
      value: 'TELNET',
      label: i18n.t('config.terminallog.TELNET')
    }
  ],
  state: [
    {
      value: 'success',
      label: i18n.t('overall.result.success')
    },
    {
      value: 'fail',
      label: i18n.t('overall.result.failed')
    }
  ],
  dcState: [
    {
      value: 'ON',
      label: 'Enable'
    },
    {
      value: 'OFF',
      label: 'Disable'
    }
  ],
  varType: [
    { value: '1', label: i18n.t('asset.asset') },
    { value: '2', label: i18n.t('asset.endpoint') }
  ],
  chartType: [
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
    }
  ],
  terminalStatus: [
    {
      value: 0,
      label: i18n.t('config.terminallog.statusItem.connecting')
    }, {
      value: 1,
      label: i18n.t('config.terminallog.statusItem.connectionFailed')
    }, {
      value: 2,
      label: i18n.t('config.terminallog.statusItem.over')
    }, {
      value: 3,
      label: i18n.t('config.terminallog.statusItem.kickedOut')
    }, {
      value: 4,
      label: i18n.t('config.terminallog.statusItem.unknownError')
    }
  ],
  searchMetrics: [
    {
      id: 1,
      name: i18n.t('project.metrics.metrics'),
      searchType: 'alertTypes'
    },
    {
      id: 2,
      name: i18n.t('overall.logs'),
      searchType: 'alertTypes'
    },
    {
      id: 3,
      name: 'SNMP trap',
      searchType: 'alertTypes'
    }
  ]
}
export default searchSelectInfo
</script>
