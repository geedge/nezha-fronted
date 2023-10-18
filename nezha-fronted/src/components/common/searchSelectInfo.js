import i18n from '@/components/common/i18n'
export default {
  data () {
    return {
      searchSelectInfo: { // value: 传给后台的值；label：显示给用户看的值
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
            label: i18n.t('overall.global')
          },
          {
            value: 2,
            label: 'Per-Datacenter'
          }
        ],
        alertType: [ // 告警类型
          {
            value: 1,
            label: i18n.t('project.project.projectName')
          },
          {
            value: 2,
            label: i18n.t('overall.module')
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
            label: i18n.t('config.agent.up')
          }, {
            value: 0,
            label: i18n.t('asset.down')
          }, {
            value: 2,
            label: i18n.t('asset.suspended')
          }
        ],
        promState: [
          {
            value: 1,
            label: i18n.t('config.agent.up')
          }, {
            value: '0,-1',
            label: i18n.t('asset.down')
          }
        ],
        ipamState: [
          {
            value: 1,
            label: i18n.t('overall.ipam.available')
          }, {
            value: 2,
            label: i18n.t('overall.ipam.transient')
          }, {
            value: 3,
            label: i18n.t('overall.ipam.used')
          }

        ],
        pingStatus: [
          {
            value: '0',
            label: i18n.t('license.inactive')
          },
          {
            value: '1',
            label: i18n.t('overall.active')
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
            label: i18n.t('buttons.add')
          },
          {
            value: 'update',
            label: i18n.t('profile.update')
          },
          {
            value: 'query',
            label: i18n.t('overall.query')
          },
          {
            value: 'import',
            label: i18n.t('overall.importExcel')
          },
          {
            value: 'export',
            label: i18n.t('overall.exportExcel')
          },
          {
            value: 'delete',
            label: i18n.t('overall.delete')
          },
          {
            value: 'reset',
            label: i18n.t('overall.reset')
          },
          {
            value: 'unknown',
            label: i18n.t('config.operationlog.operations.unknown')
          },
          {
            value: 'login',
            label: i18n.t('login.login')
          },
          {
            value: 'logout',
            label: i18n.t('overall.signOut')
          },
          {
            value: 'cancel',
            label: i18n.t('operationlog.cancel')
          },
          {
            value: 'upload',
            label: i18n.t('overall.upload')
          },
          {
            value: 'download',
            label: i18n.t('overall.download')
          },
          {
            value: 'createTask',
            label: i18n.t('operationlog.createTask')
          },
          {
            value: 'sync',
            label: i18n.t('operationlog.sync')
          },
          {
            value: 'diagnosis',
            label: i18n.t('overall.diagnosis')
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
            label: i18n.t('asset.telnetProtocol')
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
            label: i18n.t('overall.enabled')
          },
          {
            value: 'OFF',
            label: i18n.t('overall.disabled')
          }
        ],
        recordState: [
          {
            value: 1,
            label: i18n.t('overall.enabled')
          },
          {
            value: 0,
            label: i18n.t('overall.disabled')
          }
        ],
        starrd: [
          {
            value: 1,
            label: i18n.t('overall.starred')
          },
          {
            value: 0,
            label: i18n.t('overall.unstarred')
          }
        ],
        recordType: [
          {
            value: 1,
            label: i18n.t('overall.metric')
          },
          {
            value: 2,
            label: i18n.t('overall.logs')
          }
        ],
        // buildIn: [
        //   {
        //     value: 1,
        //     label: i18n.t('overall.buildIn')
        //   },
        //   {
        //     value: 0,
        //     label: i18n.t('overall.unbuildIn')
        //   }
        // ],
        ack: [
          {
            value: '1',
            label: i18n.t('tip.yes')
          },
          {
            value: '0',
            label: i18n.t('tip.no')
          }
        ],
        varType: [
          { value: '1', label: i18n.t('asset.asset') },
          { value: '2', label: i18n.t('asset.endpoint') }
        ],
        dashboardVarType: [
          { value: '0', label: i18n.t('project.topology.none') },
          { value: '1', label: i18n.t('asset.asset') },
          { value: '2', label: i18n.t('asset.endpoint') }
        ],
        chartType: [
          {
            value: 'line',
            label: i18n.t('dashboard.dashboard.chartForm.typeVal.line.label')
          },
          {
            value: 'stackArea',
            label: i18n.t('dashboard.dashboard.chartForm.typeVal.stackArea.label')
          },
          {
            value: 'bar',
            label: i18n.t('dashboard.dashboard.chartForm.typeVal.bar.label')
          },
          {
            value: 'singleStat',
            label: i18n.t('dashboard.dashboard.chartForm.typeVal.singleStat.label')
          },
          {
            value: 'pie',
            label: i18n.t('dashboard.dashboard.chartForm.typeVal.pie.label')
          },
          {
            value: 'table',
            label: i18n.t('dashboard.dashboard.chartForm.typeVal.table.label')
          },
          {
            value: 'alertList',
            label: i18n.t('dashboard.dashboard.chartForm.typeVal.alertList.label')
          },
          {
            value: 'text',
            label: i18n.t('dashboard.dashboard.chartForm.typeVal.text.label')
          },
          {
            value: 'url',
            label: i18n.t('dashboard.dashboard.chartForm.url')
          },
          {
            value: 'group',
            label: i18n.t('dashboard.dashboard.chartForm.group')
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
            name: i18n.t('overall.metric'),
            searchType: 'alertTypes'
          },
          {
            id: 2,
            name: i18n.t('overall.logs'),
            searchType: 'alertTypes'
          },
          {
            id: 3,
            name: i18n.t('overall.SNMPTrap'),
            searchType: 'alertTypes'
          }
        ],
        ipamType: [
          { label: 'IPV4', value: 4 },
          { label: 'IPV6', value: 6 }
        ],
        issueState: [
          {
            value: 1,
            label: i18n.t('issue.open')
          }, {
            value: 2,
            label: i18n.t('issue.hasBeenAssigned')
          }, {
            value: 3,
            label: i18n.t('issue.beingProcessed')
          }, {
            value: 4,
            label: i18n.t('issue.hangUp')
          }, {
            value: 5,
            label: i18n.t('issue.resolved')
          }, {
            value: 6,
            label: i18n.t('overall.close')
          }, {
            value: 7,
            label: i18n.t('overall.cancel')
          }
        ],
        silenceState: [
          {
            value: 1,
            label: i18n.t('silence.active')
          }, {
            value: 2,
            label: i18n.t('silence.pending')
          }, {
            value: 3,
            label: i18n.t('silence.expired')
          }
        ],
        priority: [
          {
            value: 1,
            label: i18n.t('dashboard.dashboard.chartForm.high')
          }, {
            value: 2,
            label: i18n.t('issue.middle')
          }, {
            value: 3,
            label: i18n.t('issue.low')
          }
        ]
      }
    }
  }
}
