const data = {
  msg: 'success',
  code: 200,
  data: {
    id: 'endpointID',
    name: 'template',
    project: {
      name: 'Nezha'
    },
    module: {
      name: 'node_exporter'
    },
    asset: {
      name: '联想物理机'
    },
    alert: [
      {
        priority: 'P1',
        num: 2
      },
      {
        priority: 'P2',
        num: 0
      },
      {
        priority: 'P3',
        num: 0
      }
    ],
    configs: [
      {
        id: 3,
        endpointId: 2,
        type: 'metrics',
        config: '{"basic_auth":{"pin":"","username":""},"bearer_token":"","scrape_timeout":"","params":{"a":["1"],"b":["1","2","3"]},"metrics_path":"/metrics","labels":{"ppp":"a|b|c","ddd":"abc","er":"6"},"protocol":"http","snmpCredentialsId":"","port":9100,"host":"192.168.44.13","relabel_config":[],"scrape_interval":"","walk":[]}',
        version: 12,
        enable: 1,
        hash: '7283547773012943786',
        seq: 'a49bbde7-6d18-4353-8176-43f18a369e93',
        ver: 12,
        state: 1,
        lastUpdate: '2023-03-10 07:45:00',
        asset: null,
        dc: null,
        stateConf: null
      },
      {
        id: 4,
        endpointId: 2,
        type: 'logs',
        config: '[{"pipeline":[],"fileName":"","relabel_config":[],"type":"file","labels":{}}]',
        version: 12,
        enable: 0,
        hash: '2871630644718992098',
        seq: 'a49bbde7-6d18-4353-8176-43f18a369e93',
        ver: 12,
        state: 8,
        lastUpdate: '2023-03-10 07:45:01',
        asset: null,
        dc: null,
        stateConf: null
      }
    ]
  }
}
export default data
