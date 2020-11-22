<script>
  import i18n from './i18n';
  const searchSelectInfo = { // value: 传给后台的值；label：显示给用户看的值
    severity: [ //告警级别
      {
        value: 'P1',
        label: i18n.t("alert.config.P1")
      },
      {
        value: 'P2',
        label: i18n.t("alert.config.P2")
      },
      {
        value: 'P3',
        label: i18n.t("alert.config.P3")
      }
    ],
    promType: [ //promServer类型
      {
        value: 1,
        label: 'Global'
      },
      {
        value: 2,
        label: 'Per-Datacenter'
      }
    ],
    alertType: [ //告警类型
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
    assetState: [ //资产入库/出库状态
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
    endpointState: [ //资产入库/出库状态
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
    pingStatus:[
      {
        value: '0',
        label:i18n.t('asset.pingInactive')
      },
      {
        value: '1',
        label:i18n.t('asset.pingActive')
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
        value: 'reset',
        label: i18n.t('config.operationlog.operations.reset')
      },
      {
        value: 'unknown',
        label: i18n.t('config.operationlog.operations.unknown')
      },
    ],
    alertMessageState: [
      {
        value: '1',
        label:i18n.t('alert.list.pending')
      },
      {
        value: '2',
        label:i18n.t('alert.list.expired')
      }
    ],
    protocol:[
      {
        value: 'SSH',
        label: i18n.t('config.terminallog.SSH')
      },
      {
        value: 'TELNET',
        label: i18n.t('config.terminallog.TELNET')
      }
    ]
  };
  export default searchSelectInfo;
</script>
