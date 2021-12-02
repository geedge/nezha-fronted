const data = [{
  name: 'asset',
  datasql: 'SELECT t.*,atc.vm,atc.vmh,atc.NAME as type,assc.NAME as state,ab.NAME as brand,am.NAME as model,dc.NAME as datacenterName,cabinet.NAME as cabinet,ap.`status` as ping FROM asset_asset t LEFT JOIN asset_type_conf atc ON t.type_id = atc.id LEFT JOIN asset_state_conf assc ON t.state_id = assc.id LEFT JOIN asset_brand ab ON t.brand_id = ab.id LEFT JOIN asset_model am ON t.model_id = am.id LEFT JOIN dc ON t.dc_id = dc.id LEFT JOIN cabinet ON t.cabinet_id = cabinet.id LEFT JOIN asset_ping ap ON t.id = ap.asset_id',
  group: [
    {
      name: 'datacenter',
      expr: 'datacenterName',
      type: 2
    }, {
      name: 'name',
      expr: 'name',
      type: 2
    }, {
      name: 'vm',
      expr: 'vm',
      type: 2
    }, {
      name: 'vmh',
      expr: 'vmh',
      type: 2
    }, {
      name: 'type',
      expr: 'type',
      type: 2
    }, {
      name: 'state',
      expr: 'state',
      type: 2
    }, {
      name: 'brand',
      expr: 'brand',
      type: 2
    }, {
      name: 'model',
      expr: 'model',
      type: 2
    }, {
      name: 'cabinet',
      expr: 'cabinet',
      type: 2
    }, {
      name: 'status',
      expr: 'ping',
      type: 2
    }
  ],
  select: [{
    name: 'count',
    expr: 'count(1)',
    type: 1
  }
  ]
}, {
  name: 'datacenter',
  datasql: 'select t.* from dc t',
  group: [{
    name: 'name',
    expr: 'name',
    type: 2
  }
  ],
  select: [{
    name: 'count',
    expr: 'count(1)',
    type: 1
  }
  ]
}, {
  name: 'project',
  datasql: 'select t.* from monitor_project t',
  group: [{
    name: 'name',
    expr: 'name',
    type: 2
  }
  ],
  select: [{
    name: 'count',
    expr: 'count(1)',
    type: 1
  }
  ]
}, {
  name: 'module',
  datasql: 'select t.*,mp.name as project from monitor_module t left join monitor_project mp on t.project_id = mp.id',
  group: [{
    name: 'name',
    expr: 'name',
    type: 2
  }, {
    name: 'project',
    expr: 'project',
    type: 2
  }
  ],
  select: [{
    name: 'count',
    expr: 'count(1)',
    type: 1
  }
  ]
}, {
  name: 'endpoint',
  datasql: 'select t.*,mm.name as module,mp.name as project,dc.name as datacenter,aa.name as asset,atc.vm,atc.vmh,atc.name as type,assc.name as state,ab.name as brand,am.name as model,cabinet.name as cabinet from monitor_endpoint t left join monitor_module mm on t.module_id = mm.id left join monitor_project mp on mm.project_id = mp.id left join asset_asset aa on t.asset_id = aa.id left join asset_type_conf atc on aa.type_id = atc.id left join asset_state_conf assc on aa.state_id = assc.id left join asset_brand ab on aa.brand_id = ab.id left join asset_model am on aa.model_id = am.id left join dc on aa.dc_id = dc.id left join cabinet on aa.cabinet_id = cabinet.id left join asset_ping ap on aa.id = ap.asset_id',
  group: [{
    name: 'name',
    expr: 'name',
    type: 2
  }, {
    name: 'module',
    expr: 'module',
    type: 2
  }, {
    name: 'project',
    expr: 'project',
    type: 2
  }, {
    name: 'datacenter',
    expr: 'datacenter',
    type: 2
  }, {
    name: 'asset',
    expr: 'asset',
    type: 2
  }, {
    name: 'vm',
    expr: 'vm',
    type: 2
  }, {
    name: 'vmh',
    expr: 'vmh',
    type: 2
  }, {
    name: 'type',
    expr: 'type',
    type: 2
  }, {
    name: 'state',
    expr: 'state',
    type: 2
  }, {
    name: 'brand',
    expr: 'brand',
    type: 2
  }, {
    name: 'model',
    expr: 'model',
    type: 2
  }, {
    name: 'cabinet',
    expr: 'cabinet',
    type: 2
  }
  ],
  select: [{
    name: 'count',
    expr: 'count(1)',
    type: 1
  }
  ]
}, {
  name: 'alertRule',
  datasql: 'select t.*,alsc.name as severity from alert_rule t left join alert_severity_conf alsc on t.severity_id = alsc.id',
  group: [{
    name: 'name',
    expr: 'name',
    type: 2
  }, {
    name: 'type',
    expr: 'name',
    type: 2
  }, {
    name: 'state',
    expr: 'state',
    type: 2
  }, {
    name: 'severity',
    expr: 'severity',
    type: 2
  }
  ],
  select: [{
    name: 'count',
    expr: 'count(1)',
    type: 1
  }
  ]
}, {
  name: 'agent',
  datasql: 'select t.*,dc.name as datacenter from prom_server t left join dc on t.dc_id = dc.id',
  group: [{
    name: 'name',
    expr: 'name',
    type: 2
  }, {
    name: 'type',
    expr: 'type',
    type: 2
  }, {
    name: 'state',
    expr: 'status',
    type: 2
  }, {
    name: 'protocol',
    expr: 'protocol',
    type: 2
  }, {
    name: 'datacenter',
    expr: 'datacenter',
    type: 2
  }
  ],
  select: [{
    name: 'count',
    expr: 'count(1)',
    type: 1
  }
  ]
}, {
  name: 'alertMessage',
  datasql: 'select t.*,alsc.name as severity,ar.name as alert,ar.type as alertType,mp.name as project,mm.name as module,me.name as endpoint,aa.name as asset,atc.vm as vm ,atc.vmh as vmh ,atc.name as assetType,assc.name as assetState,ab.name as brand,am.name as model,cabinet.name as cabinet,dc.name as datacenter from alert_message_active t left join alert_rule ar on t.rule_id = ar.id left join monitor_project mp on t.project_id = mp.id left join monitor_module mm on t.module_id = mm.id left join monitor_endpoint me on t.endpoint_id = me.id left join asset_asset aa on t.asset_id = aa.id left join asset_type_conf atc on aa.type_id = atc.id left join asset_state_conf assc on aa.state_id = assc.id left join asset_brand ab on aa.brand_id = ab.id left join asset_model am on aa.model_id = am.id left join dc on t.dc_id = dc.id left join cabinet on aa.cabinet_id = cabinet.id left join asset_ping ap on t.id = ap.asset_id left join alert_severity_conf alsc on t.severity_id = alsc.id',
  group: [{
    name: 'name',
    expr: 'name',
    type: 2
  }, {
    name: 'severity',
    expr: 'severity',
    type: 2
  }, {
    name: 'alert',
    expr: 'alert',
    type: 2
  }, {
    name: 'alertType',
    expr: 'alertType',
    type: 2
  }, {
    name: 'project',
    expr: 'project',
    type: 2
  }, {
    name: 'module',
    expr: 'module',
    type: 2
  }, {
    name: 'endpoint',
    expr: 'endpoint',
    type: 2
  }, {
    name: 'asset',
    expr: 'asset',
    type: 2
  }, {
    name: 'vm',
    expr: 'vm',
    type: 2
  }, {
    name: 'vmh',
    expr: 'vmh',
    type: 2
  }, {
    name: 'assetType',
    expr: 'assetType',
    type: 2
  }, {
    name: 'assetState',
    expr: 'assetState',
    type: 2
  }, {
    name: 'brand',
    expr: 'brand',
    type: 2
  }, {
    name: 'model',
    expr: 'model',
    type: 2
  }, {
    name: 'cabinet',
    expr: 'cabinet',
    type: 2
  }, {
    name: 'datacenter',
    expr: 'datacenter',
    type: 2
  }
  ],
  select: [{
    name: 'count',
    expr: 'count(1)',
    type: 1
  }
  ]
}
]
export default data
