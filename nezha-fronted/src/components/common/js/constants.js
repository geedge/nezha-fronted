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
}
