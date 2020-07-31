import i18n from "../i18n";

export const promServer = {
  typeData: [
    {value: 1, label: 'Global'},
    {value: 2, label: 'Per-Datacenter'}
  ],
};

export const asset = {
  pingData: [
    {value: 1, label: 'up'},
    {value: 0, label: 'down'},
  ],
  stateData: [
    {value: 1, label: i18n.t('asset.inStock')},
    {value: 2, label: i18n.t('asset.notInStock')}
  ],
};

export const alertMessage = {
  severityData: [
    {value: 'medium', label: i18n.t("alert.config.medium")},
    {value: 'high', label: i18n.t("alert.config.high")},
    {value: 'low', label: i18n.t("alert.config.low")}
  ],
  typeData: [
    {value: 1, label: i18n.t('alert.config.typeOption.project')},
    {value: 2, label: i18n.t('alert.config.typeOption.module')},
    {value: 3, label: i18n.t('alert.config.typeOption.asset')}
  ],
  levels:[
    {value: 'medium', label: i18n.t("alert.config.medium")},
    {value: 'high', label: i18n.t("alert.config.high")},
    {value: 'low', label: i18n.t("alert.config.low")}
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
