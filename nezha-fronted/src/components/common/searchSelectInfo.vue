<script>
  import i18n from './i18n';
  const searchSelectInfo = { // value: 传给后台的值；label：显示给用户看的值
    severity: [ //告警级别
      {
        value: 'medium',
        label: i18n.t("alert.config.medium")
      },
      {
        value: 'high',
        label: i18n.t("alert.config.high")
      },
      {
        value: 'low',
        label: i18n.t("alert.config.low")
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
        label: i18n.t('asset.createAssetTab.inStock')
      }, {
        value: 2,
        label: i18n.t('asset.createAssetTab.notInStock')
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
        label: i18n.t('overall.add')
      },
      {
        value: 'update',
        label: i18n.t('overall.edit')
      },
      {
        value: 'query',
        label: i18n.t('overall.query')
      },
      {
        value: 'import',
        label: i18n.t('overall.importExcelLower')
      },
      {
        value: 'export',
        label: i18n.t('overall.exportExcelLower')
      },
      {
        value: 'reset',
        label: i18n.t('overall.reset')
      }
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
