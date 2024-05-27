---
map:
  path: /
---

## 简介
1. 开发规范 https://docs.geedge.net/pages/viewpage.action?pageId=8034494
2. 思维导图 https://docs.geedge.net/pages/viewpage.action?pageId=67209306 可以查看解压后的纯文字版Html
3. 字体图标替换 https://docs.geedge.net/pages/viewpage.action?pageId=67214849


# 目录结构
```
│  http.js
│  permission.js
│
├─assets
│  ├─css
│  │  │  animate.css
│  │  │  common.scss
│  │  │  font.scss
│  │  │  index.scss
│  │  │  main.scss
│  │  │  nzIcon.css
│  │  │  THEME_README.md
│  │  │
│  │  ├─common
│  │  │      button.scss
│  │  │      checkbox.scss
│  │  │      index.scss
│  │  │      loading.scss
│  │  │      maplibre-gl.css
│  │  │      rightBoxCommon.scss
│  │  │      tableCommon.scss
│  │  │      tooltip.scss
│  │  │
│  │  ├─components
│  │  │  │  index.scss
│  │  │  │
│  │  │  ├─chart
│  │  │  │      chart.scss
│  │  │  │
│  │  │  ├─charts
│  │  │  │      chart-list.scss
│  │  │  │      chart.scss
│  │  │  │
│  │  │  ├─cli
│  │  │  │      fileDirectory.scss
│  │  │  │      fileListState.scss
│  │  │  │      webSSH.scss
│  │  │  │      webSSHNew.scss
│  │  │  │
│  │  │  ├─common
│  │  │  │  │  browserWindowZoom.scss
│  │  │  │  │  chartUnit.scss
│  │  │  │  │  configSync.scss
│  │  │  │  │  deleteButton.scss
│  │  │  │  │  diagnosisTab.scss
│  │  │  │  │  elementSet.scss
│  │  │  │  │  intro.scss
│  │  │  │  │  latIngPicker.scss
│  │  │  │  │  loading.scss
│  │  │  │  │  login.css
│  │  │  │  │  login.scss
│  │  │  │  │  multipleTime.scss
│  │  │  │  │  nezhaColor.scss
│  │  │  │  │  nzTransfer.scss
│  │  │  │  │  pagination.scss
│  │  │  │  │  searchBox.scss
│  │  │  │  │  searchInput.scss
│  │  │  │  │  selectTable.scss
│  │  │  │  │  timePicker.scss
│  │  │  │  │  v-md-editor.scss
│  │  │  │  │
│  │  │  │  ├─alert
│  │  │  │  │      alertDaysInfo.scss
│  │  │  │  │      alertLabel.scss
│  │  │  │  │      alertMessageInfo.scss
│  │  │  │  │      alertRuleInfo.scss
│  │  │  │  │      alertStateInfo.scss
│  │  │  │  │      selectAlertSilence.scss
│  │  │  │  │
│  │  │  │  ├─bottomBox
│  │  │  │  │      bottomBox.scss
│  │  │  │  │      dashboardTab.scss
│  │  │  │  │      issueTab.scss
│  │  │  │  │      terminalLogCMDTab.scss
│  │  │  │  │      terminalLogMonitorTab.scss
│  │  │  │  │      terminalLogRecordTab.scss
│  │  │  │  │
│  │  │  │  ├─detailView
│  │  │  │  │  │  detailView.scss
│  │  │  │  │  │  detailViewTopSearch.scss
│  │  │  │  │  │
│  │  │  │  │  ├─list
│  │  │  │  │  │      common.scss
│  │  │  │  │  │
│  │  │  │  │  └─view
│  │  │  │  │          detailRightTop.scss
│  │  │  │  │          detailViewRight.scss
│  │  │  │  │
│  │  │  │  ├─filterSearch
│  │  │  │  │      filterSearch.scss
│  │  │  │  │
│  │  │  │  ├─globalSearch
│  │  │  │  │      globalSearch.scss
│  │  │  │  │      searchItemInfo.scss
│  │  │  │  │
│  │  │  │  ├─labelFilter
│  │  │  │  │      clickSearch.scss
│  │  │  │  │
│  │  │  │  ├─panel
│  │  │  │  │      panelVariables.scss
│  │  │  │  │
│  │  │  │  ├─paramBpx
│  │  │  │  │      paramBox.scss
│  │  │  │  │
│  │  │  │  ├─picker
│  │  │  │  │      picker.scss
│  │  │  │  │
│  │  │  │  ├─popBox
│  │  │  │  │      guide.scss
│  │  │  │  │      selectAssetMetaGroup.scss
│  │  │  │  │      selectAssetType.scss
│  │  │  │  │      selectDashboard.scss
│  │  │  │  │      selectPanel.scss
│  │  │  │  │      selectWalk.scss
│  │  │  │  │      snapshotProgress.scss
│  │  │  │  │
│  │  │  │  ├─project
│  │  │  │  │  │  chart.scss
│  │  │  │  │  │  meta2dHeader.scss
│  │  │  │  │  │  meta2dMain.scss
│  │  │  │  │  │  meta2dProps.scss
│  │  │  │  │  │  topology.scss
│  │  │  │  │  │  topologyL5.scss
│  │  │  │  │  │
│  │  │  │  │  ├─L5
│  │  │  │  │  │  │  CanvasContextMenu.scss
│  │  │  │  │  │  │  CanvasProps.scss
│  │  │  │  │  │  │  topologyTopTool.scss
│  │  │  │  │  │  │  topoTooltip.scss
│  │  │  │  │  │  │
│  │  │  │  │  │  └─popData
│  │  │  │  │  │          common.scss
│  │  │  │  │  │
│  │  │  │  │  └─popData
│  │  │  │  │          Info.scss
│  │  │  │  │
│  │  │  │  ├─rightBox
│  │  │  │  │  │  addEndpointBox.scss
│  │  │  │  │  │  alertRuleBox.scss
│  │  │  │  │  │  alertSilenceBox.scss
│  │  │  │  │  │  assetBactchEditBox.scss
│  │  │  │  │  │  assetMetaBox.scss
│  │  │  │  │  │  assetStateBox.scss
│  │  │  │  │  │  backupsBox.scss
│  │  │  │  │  │  batchAddEndpoint.scss
│  │  │  │  │  │  batchModifyEndpoint.scss
│  │  │  │  │  │  editEndpointBoxNew.scss
│  │  │  │  │  │  ipam.scss
│  │  │  │  │  │  issueBox.scss
│  │  │  │  │  │  locationCascader.scss
│  │  │  │  │  │  menuBox.scss
│  │  │  │  │  │  mibBox.scss
│  │  │  │  │  │  moduleBox.scss
│  │  │  │  │  │  panelBox.scss
│  │  │  │  │  │  pipelineSelect.scss
│  │  │  │  │  │  recordRuleBox.css
│  │  │  │  │  │  recordRuleBox.scss
│  │  │  │  │  │
│  │  │  │  │  ├─asset
│  │  │  │  │  │      assetBox.scss
│  │  │  │  │  │      assetDiscoveryBox.scss
│  │  │  │  │  │
│  │  │  │  │  ├─chartRightBox
│  │  │  │  │  │      chartRightBox.scss
│  │  │  │  │  │
│  │  │  │  │  └─trafficSetting
│  │  │  │  │          subBox.scss
│  │  │  │  │          trafficSettingTab.scss
│  │  │  │  │
│  │  │  │  ├─table
│  │  │  │  │  ├─alert
│  │  │  │  │  │      alertMessageTable.scss
│  │  │  │  │  │      alertRuleTable.scss
│  │  │  │  │  │      alertSilenceTable.scss
│  │  │  │  │  │
│  │  │  │  │  ├─asset
│  │  │  │  │  │      assetTable.scss
│  │  │  │  │  │
│  │  │  │  │  ├─settings
│  │  │  │  │  │      backupsTable.scss
│  │  │  │  │  │      cortexDetailTable.scss
│  │  │  │  │  │      endpointTable.scss
│  │  │  │  │  │      switchTab.scss
│  │  │  │  │  │      userTable.scss
│  │  │  │  │  │
│  │  │  │  │  └─special
│  │  │  │  │          endpointQuery.scss
│  │  │  │  │
│  │  │  │  ├─threshold
│  │  │  │  │      threshold.scss
│  │  │  │  │
│  │  │  │  └─v-selectpagenew
│  │  │  │          selectpage.scss
│  │  │  │
│  │  │  ├─introjs
│  │  │  │      introjs-dark.scss
│  │  │  │      introjs.scss
│  │  │  │
│  │  │  ├─layout
│  │  │  │      container.scss
│  │  │  │      header.scss
│  │  │  │      home.scss
│  │  │  │      leftMenu.scss
│  │  │  │
│  │  │  └─page
│  │  │      ├─alert
│  │  │      │      alertMessage.scss
│  │  │      │      nzAlertTag.scss
│  │  │      │
│  │  │      ├─config
│  │  │      │  │  about.scss
│  │  │      │  │  agent.scss
│  │  │      │  │  assetMeta.scss
│  │  │      │  │  backups.scss
│  │  │      │  │  licenseGen.scss
│  │  │      │  │  mibBrowser.scss
│  │  │      │  │  operationRecord.scss
│  │  │      │  │  profile.scss
│  │  │      │  │  profileChangePin.scss
│  │  │      │  │  setup.scss
│  │  │      │  │  system.scss
│  │  │      │  │
│  │  │      │  └─system
│  │  │      │          license.scss
│  │  │      │          notifyMethodTab.scss
│  │  │      │
│  │  │      ├─dashboard
│  │  │      │  │  chartBox.scss
│  │  │      │  │  panel.scss
│  │  │      │  │
│  │  │      │  ├─explore
│  │  │      │  │      explore.scss
│  │  │      │  │      exploreHistory.scss
│  │  │      │  │      logTab.scss
│  │  │      │  │      promqlInput.scss
│  │  │      │  │      queryPrompt.scss
│  │  │      │  │
│  │  │      │  └─overview
│  │  │      │          chart.scss
│  │  │      │          overview2.scss
│  │  │      │
│  │  │      ├─integration
│  │  │      │      integration.scss
│  │  │      │
│  │  │      ├─monitor
│  │  │      │  └─project
│  │  │      │          project.scss
│  │  │      │
│  │  │      ├─notebook
│  │  │      │      notebook.scss
│  │  │      │
│  │  │      ├─softwareType
│  │  │      │      softwareType.scss
│  │  │      │
│  │  │      └─tool
│  │  │              ping.scss
│  │  │              trace.scss
│  │  │
│  │  ├─font
│  │  │      iconfont.css
│  │  │      iconfont.eot
│  │  │      iconfont.js
│  │  │      iconfont.json
│  │  │      iconfont.svg
│  │  │      iconfont.ttf
│  │  │      iconfont.woff
│  │  │      iconfont.woff2
│  │  │      Inter-Regular.ttf
│  │  │      metricPreview.scss
│  │  │      NotoSans-Regular.ttf
│  │  │      NunitoSans-Regular.ttf
│  │  │
│  │  └─themes
│  │      │  common.scss
│  │      │  theme-dark.scss
│  │      │  theme-light.scss
│  │      │
│  │      └─src
│  │          │  alert.scss
│  │          │  aside.scss
│  │          │  autocomplete.scss
│  │          │  avatar.scss
│  │          │  backtop.scss
│  │          │  badge.scss
│  │          │  base.scss
│  │          │  breadcrumb-item.scss
│  │          │  breadcrumb.scss
│  │          │  button-group.scss
│  │          │  button.scss
│  │          │  calendar.scss
│  │          │  card.scss
│  │          │  carousel-item.scss
│  │          │  carousel.scss
│  │          │  cascader-panel.scss
│  │          │  cascader.scss
│  │          │  checkbox-button.scss
│  │          │  checkbox-group.scss
│  │          │  checkbox.scss
│  │          │  col.scss
│  │          │  collapse-item.scss
│  │          │  collapse.scss
│  │          │  color-picker.scss
│  │          │  container.scss
│  │          │  date-picker.scss
│  │          │  descriptions-item.scss
│  │          │  descriptions.scss
│  │          │  dialog.scss
│  │          │  display.scss
│  │          │  divider.scss
│  │          │  drawer.scss
│  │          │  dropdown-item.scss
│  │          │  dropdown-menu.scss
│  │          │  dropdown.scss
│  │          │  empty.scss
│  │          │  footer.scss
│  │          │  form-item.scss
│  │          │  form.scss
│  │          │  header.scss
│  │          │  icon.scss
│  │          │  image.scss
│  │          │  index.scss
│  │          │  infinite-scroll.scss
│  │          │  infiniteScroll.scss
│  │          │  input-number.scss
│  │          │  input.scss
│  │          │  link.scss
│  │          │  loading.scss
│  │          │  main.scss
│  │          │  menu-item-group.scss
│  │          │  menu-item.scss
│  │          │  menu.scss
│  │          │  message-box.scss
│  │          │  message.scss
│  │          │  notification.scss
│  │          │  option-group.scss
│  │          │  option.scss
│  │          │  page-header.scss
│  │          │  pagination.scss
│  │          │  popconfirm.scss
│  │          │  popover.scss
│  │          │  popper.scss
│  │          │  progress.scss
│  │          │  radio-button.scss
│  │          │  radio-group.scss
│  │          │  radio.scss
│  │          │  rate.scss
│  │          │  reset.scss
│  │          │  result.scss
│  │          │  row.scss
│  │          │  scrollbar.scss
│  │          │  select-dropdown.scss
│  │          │  select.scss
│  │          │  skeleton-item.scss
│  │          │  skeleton.scss
│  │          │  slider.scss
│  │          │  spinner.scss
│  │          │  step.scss
│  │          │  steps.scss
│  │          │  submenu.scss
│  │          │  switch.scss
│  │          │  tab-pane.scss
│  │          │  table-column.scss
│  │          │  table.scss
│  │          │  tabs.scss
│  │          │  tag.scss
│  │          │  time-picker.scss
│  │          │  time-select.scss
│  │          │  timeline-item.scss
│  │          │  timeline.scss
│  │          │  tooltip.scss
│  │          │  transfer.scss
│  │          │  tree.scss
│  │          │  upload.scss
│  │          │
│  │          ├─common
│  │          │      popup.scss
│  │          │      transition.scss
│  │          │      var.scss
│  │          │
│  │          ├─date-picker
│  │          │      date-picker.scss
│  │          │      date-range-picker.scss
│  │          │      date-table.scss
│  │          │      month-table.scss
│  │          │      picker-panel.scss
│  │          │      picker.scss
│  │          │      time-picker.scss
│  │          │      time-range-picker.scss
│  │          │      time-spinner.scss
│  │          │      year-table.scss
│  │          │
│  │          ├─fonts
│  │          │      element-icons.ttf
│  │          │      element-icons.woff
│  │          │
│  │          └─mixins
│  │                  config.scss
│  │                  function.scss
│  │                  mixins.scss
│  │                  utils.scss
│  │                  _button.scss
│  │
│  ├─img
│  │      dc.png
│  │      dc1.png
│  │      dc2.png
│  │      dc3.png
│  │      down.png
│  │      explore-tab-logo.png
│  │      favicon.ico
│  │      jj.png
│  │      jj1.png
│  │      jj3.png
│  │      loading.gif
│  │      login-background.png
│  │      logo-big.png
│  │      logo.svg
│  │      logo1-2.png
│  │      starCloud1.svg
│  │      starCloud2.svg
│  │      starCloud3.svg
│  │      starCloud4.svg
│  │      starCloud5.svg
│  │      starCloud6.svg
│  │      starCloud7.svg
│  │      system-sound-settings.gif
│  │      up.png
│  │
│  └─stylus
│          index.scss
│          main.scss
│
├─components
│  ├─chart
│  │  │  assetInfoData.js
│  │  │  chart.vue
│  │  │  chartDataFormat.js
│  │  │  chartDetail.vue
│  │  │  chartDetailNew.vue
│  │  │  chartFormat.js
│  │  │  chartHeader.vue
│  │  │  chartHeaderMixin.js
│  │  │  chartList.vue
│  │  │  chartMixin.js
│  │  │  ChartScreenHeader.vue
│  │  │  chartTempData.js
│  │  │  defaultLineData.js
│  │  │  defaultLogData.js
│  │  │  defaultTableData.js
│  │  │  endpointInfoData.js
│  │  │  logContext.vue
│  │  │  logsData.js
│  │  │  markdownEditor.vue
│  │  │  panelChart.vue
│  │  │  renderChart.js
│  │  │  richTextEditor.vue
│  │  │  tempGroup.js
│  │  │
│  │  └─chart
│  │      │  chart-table.vue
│  │      │  chartAssetInfo.vue
│  │      │  chartAutotopology.vue
│  │      │  chartBar.vue
│  │      │  chartBubble.vue
│  │      │  chartClock.vue
│  │      │  chartDiagram.vue
│  │      │  chartDoughnut.vue
│  │      │  chartEndpointInfo.vue
│  │      │  chartFunnel.vue
│  │      │  chartGauge.vue
│  │      │  chartGroup.vue
│  │      │  chartHexagonD3.vue
│  │      │  chartLog.vue
│  │      │  chartMap.vue
│  │      │  chartNoData.vue
│  │      │  chartPie.vue
│  │      │  chartRank.vue
│  │      │  chartRose.vue
│  │      │  chartSankey.vue
│  │      │  chartStat.vue
│  │      │  chartTable.vue
│  │      │  chartText.vue
│  │      │  chartTimeSeries.vue
│  │      │  chartTopology.vue
│  │      │  chartTreemap.vue
│  │      │  chartUrl.vue
│  │      │  legend.vue
│  │      │  line-chart-block.vue
│  │      │  mapStyle.js
│  │      │  tools.js
│  │      │
│  │      ├─grid
│  │      │      aspectRatio.js
│  │      │      CustomDragElement.vue
│  │      │      DOM.js
│  │      │      draggableUtils.js
│  │      │      GridItem.vue
│  │      │      GridLayout.vue
│  │      │      index.js
│  │      │      responsiveUtils.js
│  │      │      TestElement.vue
│  │      │      utils.js
│  │      │
│  │      ├─options
│  │      │      chartBar.js
│  │      │      chartClock.js
│  │      │      chartGauge.js
│  │      │      chartHexagonD3.js
│  │      │      chartPie.js
│  │      │      chartSparkline.js
│  │      │      chartTimeSeries.js
│  │      │      chartTreemap.js
│  │      │      fontWidth.js
│  │      │
│  │      └─uplot
│  │              chartTimeSeries.vue
│  │              chartTimeSeriesMixin.js
│  │              stack.js
│  │              testData.js
│  │
│  ├─cli
│  │      console.vue
│  │      consoleNew.vue
│  │      fileDirectory.vue
│  │      fileListState.vue
│  │      terminal.vue
│  │      webSSH.vue
│  │      webSSHNew.vue
│  │
│  ├─common
│  │  │  browserWindowZoom.vue
│  │  │  chartUnit.vue
│  │  │  configSync.vue
│  │  │  copy.vue
│  │  │  deleteButton.vue
│  │  │  diagnosisTab.vue
│  │  │  elementSet.vue
│  │  │  i18n.js
│  │  │  intro.vue
│  │  │  latlngPicker.vue
│  │  │  loading.vue
│  │  │  login.vue
│  │  │  metaData.vue
│  │  │  multipleTime.vue
│  │  │  nezhaColor.vue
│  │  │  nzTransfer.vue
│  │  │  pagination.vue
│  │  │  pickTime.vue
│  │  │  playlist.vue
│  │  │  searchInput.vue
│  │  │  searchSelectInfo.js
│  │  │  selectTable.vue
│  │  │  timePicker.vue
│  │  │
│  │  ├─alert
│  │  │      alertDaysInfo.vue
│  │  │      alertDetail.vue
│  │  │      alertLabel.vue
│  │  │      alertLabel2.vue
│  │  │      alertLabel3.vue
│  │  │      alertMessageInfo.vue
│  │  │      alertMessageInfoDetail.vue
│  │  │      alertMessageInfoTab.vue
│  │  │      alertMessageInfoTimeLine.vue
│  │  │      alertMessageLabelMixin.js
│  │  │      alertRuleInfo.vue
│  │  │      alertRuleInfo2.vue
│  │  │      alertStateInfo.vue
│  │  │      nzTooltip.vue
│  │  │      selectAlertSilence.vue
│  │  │      terminalLogInfo.vue
│  │  │      trendMixins.js
│  │  │
│  │  ├─bottomBox
│  │  │  │  bottomBox.vue
│  │  │  │  nzBottomDataList.vue
│  │  │  │
│  │  │  └─tabs
│  │  │          alertMessageTab.vue
│  │  │          alertMessageTabNew.vue
│  │  │          alertRuleEvalLog.vue
│  │  │          assetSubTab.vue
│  │  │          assetTab.vue
│  │  │          cabinetTab.vue
│  │  │          commentsBottomTab.vue
│  │  │          cortexDetail.vue
│  │  │          dashboardTab.vue
│  │  │          discoveryTab.vue
│  │  │          endpointQuery.vue
│  │  │          endpointTabNew.vue
│  │  │          IpDetails.vue
│  │  │          issueTab.vue
│  │  │          licenseManagementTab.vue
│  │  │          logBottomTab.vue
│  │  │          lokiStatus.vue
│  │  │          networkBottomTab.vue
│  │  │          notebookTab.vue
│  │  │          operationLogTab.vue
│  │  │          processBottomTab.vue
│  │  │          recordRuleEvalLog.vue
│  │  │          recordRulesQuery.vue
│  │  │          rolesTab.vue
│  │  │          scrapeEndpoint.vue
│  │  │          softwareAssetTab.vue
│  │  │          terminalLogCMDTab.vue
│  │  │          terminalLogMonitorTab.vue
│  │  │          terminalLogRecordTab.vue
│  │  │          terminalLogSftpTab.vue
│  │  │          terminalLogTab.vue
│  │  │          vsysBottomTab.vue
│  │  │
│  │  ├─copy-code
│  │  │  │  copy-code.css
│  │  │  │  index.js
│  │  │  │  preview.js
│  │  │  │
│  │  │  └─utils
│  │  │          markdown-it-copy-code.js
│  │  │
│  │  ├─detailView
│  │  │  │  detailViewTopSearch.vue
│  │  │  │  nzDetailView.vue
│  │  │  │
│  │  │  ├─list
│  │  │  │  ├─alertRule
│  │  │  │  │      alertRuleDetail.vue
│  │  │  │  │
│  │  │  │  ├─asset
│  │  │  │  │      assetDetail.vue
│  │  │  │  │
│  │  │  │  ├─dc
│  │  │  │  │      dcDetail.vue
│  │  │  │  │
│  │  │  │  ├─endpoint
│  │  │  │  │      endpointDetail.vue
│  │  │  │  │
│  │  │  │  ├─module
│  │  │  │  │      moduleDetail.vue
│  │  │  │  │
│  │  │  │  ├─notebook
│  │  │  │  │      notebookDetail.vue
│  │  │  │  │
│  │  │  │  ├─terminalLogDetail
│  │  │  │  │      terminalLogDetail.vue
│  │  │  │  │
│  │  │  │  └─userDetail
│  │  │  │          userDetail.vue
│  │  │  │
│  │  │  └─view
│  │  │      │  detailViewRight.vue
│  │  │      │
│  │  │      └─detailRightTop
│  │  │              detailRightTop.vue
│  │  │
│  │  ├─elSelect
│  │  │      MyElSelect.vue
│  │  │
│  │  ├─filterSearch
│  │  │      filterSearch.vue
│  │  │      filterSearchData.js
│  │  │
│  │  ├─globalSearch
│  │  │      globalSearch.vue
│  │  │      searchItemInfo.vue
│  │  │
│  │  ├─js
│  │  │  │  common.js
│  │  │  │  constants.js
│  │  │  │  divResize.js
│  │  │  │  example.js
│  │  │  │  htmlToPdf.js
│  │  │  │  iconList.js
│  │  │  │  tools.js
│  │  │  │  validate.js
│  │  │  │  Xterm.js
│  │  │  │
│  │  │  └─radomcolor
│  │  │          color.txt
│  │  │          randomcolor.js
│  │  │
│  │  ├─labelFilter
│  │  │      clickSearch.vue
│  │  │      clickSearchNew.vue
│  │  │      dropdown.vue
│  │  │
│  │  ├─language
│  │  │      cn.js
│  │  │      en.js
│  │  │      index.js
│  │  │      newcn.js
│  │  │      newen.js
│  │  │
│  │  ├─message
│  │  │  │  index.js
│  │  │  │
│  │  │  └─src
│  │  │          main.js
│  │  │          main.vue
│  │  │
│  │  ├─mixin
│  │  │  │  alertLabelMixin.js
│  │  │  │  beforeMeta2d.js
│  │  │  │  chartDataList.js
│  │  │  │  dataList.js
│  │  │  │  detailViewLeftMixin.js
│  │  │  │  detailViewMixin.js
│  │  │  │  detailViewRightMixin.js
│  │  │  │  editRigthBox.js
│  │  │  │  exportHtml.js
│  │  │  │  globalVariables.js
│  │  │  │  htmlToPdfMixin.js
│  │  │  │  mainMixinFun.js
│  │  │  │  promqlInput.js
│  │  │  │  routerPathParams.js
│  │  │  │  subDataList.js
│  │  │  │  table.js
│  │  │  │
│  │  │  └─system
│  │  │          systemMixin.js
│  │  │
│  │  ├─myDatePicker
│  │  │  │  index.js
│  │  │  │
│  │  │  └─src
│  │  │      │  picker.vue
│  │  │      │
│  │  │      ├─basic
│  │  │      │      date-table.vue
│  │  │      │      month-table.vue
│  │  │      │      time-spinner.vue
│  │  │      │      year-table.vue
│  │  │      │
│  │  │      ├─panel
│  │  │      │      date-range.vue
│  │  │      │      date.vue
│  │  │      │      month-range.vue
│  │  │      │      time-range.vue
│  │  │      │      time-select.vue
│  │  │      │      time.vue
│  │  │      │
│  │  │      └─picker
│  │  │              date-picker.js
│  │  │              time-picker.js
│  │  │              time-select.js
│  │  │
│  │  ├─overView
│  │  │      messageAsset.vue
│  │  │
│  │  ├─panel
│  │  │      panelVariables.vue
│  │  │
│  │  ├─popBox
│  │  │      guide.vue
│  │  │      selectAssetMetaGroup.vue
│  │  │      selectAssetType.vue
│  │  │      selectDashboard.vue
│  │  │      selectPanel.vue
│  │  │      selectWalk.vue
│  │  │      topToolMoreOptions.vue
│  │  │
│  │  ├─project
│  │  │  │  topoData.js
│  │  │  │  topologyMixin.js
│  │  │  │
│  │  │  ├─image
│  │  │  │      emptyData.png
│  │  │  │
│  │  │  ├─L5
│  │  │  │      topoTooltip.vue
│  │  │  │
│  │  │  ├─meta2d
│  │  │  │  │  CanvasContextMenu.vue
│  │  │  │  │  meta2dCanvas.vue
│  │  │  │  │  meta2dData.vue
│  │  │  │  │  meta2dElement.vue
│  │  │  │  │  meta2dHeader.vue
│  │  │  │  │  meta2dMain.vue
│  │  │  │  │  meta2dProps.vue
│  │  │  │  │  meta2dSelectImage.vue
│  │  │  │  │  meta2dTooltip.vue
│  │  │  │  │  topologyTopTool.vue
│  │  │  │  │
│  │  │  │  └─js
│  │  │  │          defaultIcon.js
│  │  │  │          defaultPenLineData.js
│  │  │  │          meta2dMainCalc.js
│  │  │  │          meta2dStore.js
│  │  │  │          topoUtil.js
│  │  │  │
│  │  │  └─popData
│  │  │          alertTable.vue
│  │  │          assetTable.vue
│  │  │          endpointTable.vue
│  │  │          expressionInfo.vue
│  │  │          Info.vue
│  │  │          Main.vue
│  │  │
│  │  ├─rightBox
│  │  │  │  addEndpointBox.vue
│  │  │  │  agentBox.vue
│  │  │  │  alertRuleBox.vue
│  │  │  │  alertSilenceBox.vue
│  │  │  │  apiKeyBox.vue
│  │  │  │  assetMetaBox.vue
│  │  │  │  assetMetaGroup.vue
│  │  │  │  assetStateBox.vue
│  │  │  │  batchAddEndpoint.vue
│  │  │  │  batchEditEndpoint.vue
│  │  │  │  batchModifyEndpoint.vue
│  │  │  │  cabinetBox.vue
│  │  │  │  chartTempBox.vue
│  │  │  │  dashboardTempBox.vue
│  │  │  │  dcBox.vue
│  │  │  │  editEndpointBoxNew.vue
│  │  │  │  exprTmplBox.vue
│  │  │  │  ipamBox.vue
│  │  │  │  ipDetailsBox.vue
│  │  │  │  issueBox.vue
│  │  │  │  locationCascader.vue
│  │  │  │  menuBox.vue
│  │  │  │  mibBox.vue
│  │  │  │  moduleBox.vue
│  │  │  │  panelBox.vue
│  │  │  │  pipelineSelect.vue
│  │  │  │  playlistBox.vue
│  │  │  │  profileBox.vue
│  │  │  │  projectBox.vue
│  │  │  │  recordRuleBox.vue
│  │  │  │  snmpCredentialBox.vue
│  │  │  │
│  │  │  ├─administration
│  │  │  │      assetTypeBox.vue
│  │  │  │      backupsBox.vue
│  │  │  │      modelBox.vue
│  │  │  │      roleBox.vue
│  │  │  │      userBox.vue
│  │  │  │
│  │  │  ├─asset
│  │  │  │      assetBatchEditBox.vue
│  │  │  │      assetBox.vue
│  │  │  │      assetDiscoveryBox.vue
│  │  │  │
│  │  │  ├─chart
│  │  │  │      chartConfig.vue
│  │  │  │      chartRightBox.vue
│  │  │  │      chartTypeShow.js
│  │  │  │      otherChartConfig.vue
│  │  │  │      publicConfig.js
│  │  │  │      systemChartConfig.vue
│  │  │  │
│  │  │  ├─setting
│  │  │  │      cabinetBox.vue
│  │  │  │      globalizationBox.vue
│  │  │  │
│  │  │  ├─software
│  │  │  │      softwareAssetBox.vue
│  │  │  │      softwareTypeBox.vue
│  │  │  │
│  │  │  └─trafficSetting
│  │  │          subBox.vue
│  │  │          trafficSettingBox.vue
│  │  │          trafficSettingTab.vue
│  │  │
│  │  ├─searchBox
│  │  │      searchBox.vue
│  │  │      searchBoxInfo.js
│  │  │
│  │  ├─snapshotProgress
│  │  │      snapshotProgress.vue
│  │  │
│  │  ├─table
│  │  │  │  nzDataList.vue
│  │  │  │
│  │  │  ├─alert
│  │  │  │      alertMessageTable.vue
│  │  │  │      alertRuleEvalLogTable.vue
│  │  │  │      alertRuleTable.vue
│  │  │  │      alertSilenceTable.vue
│  │  │  │
│  │  │  ├─asset
│  │  │  │      assetCommentTable.vue
│  │  │  │      assetDiscoveryTable.vue
│  │  │  │      assetMetaTable.vue
│  │  │  │      assetNetworkTable.vue
│  │  │  │      assetProcessTable.vue
│  │  │  │      assetTable.vue
│  │  │  │      assetVsysTable.vue
│  │  │  │      disccoveryTabTable.vue
│  │  │  │      licenseMangeTable.vue
│  │  │  │
│  │  │  ├─settings
│  │  │  │      agentTable.vue
│  │  │  │      assetTypeTable.vue
│  │  │  │      backupsTable.vue
│  │  │  │      cabinetTable.vue
│  │  │  │      chartTmplTable.vue
│  │  │  │      cortexDetailTable.vue
│  │  │  │      credentialsTable.vue
│  │  │  │      dashboardTmplTable.vue
│  │  │  │      dcTable.vue
│  │  │  │      endpointTable.vue
│  │  │  │      exprTmplTable.vue
│  │  │  │      globalizationTable.vue
│  │  │  │      ipamTable.vue
│  │  │  │      ipDetailsTable.vue
│  │  │  │      issueTable.vue
│  │  │  │      lokiStatusTable.vue
│  │  │  │      menuTable.vue
│  │  │  │      mibTable.vue
│  │  │  │      modelTable.vue
│  │  │  │      moduleTable.vue
│  │  │  │      notebookTable.vue
│  │  │  │      operationLogTable.vue
│  │  │  │      projectTable.vue
│  │  │  │      recordRuleEvalLogTable.vue
│  │  │  │      recordRuleTable.vue
│  │  │  │      roleTable.vue
│  │  │  │      scrapeEndpointTable.vue
│  │  │  │      softwareAssetTable.vue
│  │  │  │      softwareTypeTable.vue
│  │  │  │      terminalLogSftpTable.vue
│  │  │  │      terminalLogTable.vue
│  │  │  │      userTable.vue
│  │  │  │      userTabTable.vue
│  │  │  │
│  │  │  ├─special
│  │  │  │      endpointQueryTab.vue
│  │  │  │      recordRulesQueryTab.vue
│  │  │  │
│  │  │  └─tool
│  │  │          pingTable.vue
│  │  │          traceTable.vue
│  │  │
│  │  ├─v-selectpagenew
│  │  │  │  index.js
│  │  │  │  methods.js
│  │  │  │  Pagination.js
│  │  │  │  Selectpage.js
│  │  │  │  Table.js
│  │  │  │
│  │  │  └─css
│  │  │          selectPage.css
│  │  │
│  │  └─vueQR
│  │      └─packages
│  │              index.js
│  │              readAsArrayBuffer.js
│  │              util.js
│  │              vue-qr.vue
│  │
│  ├─layout
│  │      container.vue
│  │      header.vue
│  │      home.vue
│  │      leftMenu.vue
│  │
│  └─page
│      │  uPlot.vue
│      │
│      ├─alert
│      │      alertMessage.vue
│      │      alertRule.vue
│      │      alertSilence.vue
│      │      nzAlertTag.vue
│      │
│      ├─asset
│      │  │  asset.vue
│      │  │  assetDiscovery.vue
│      │  │
│      │  ├─components
│      │  │      alert.vue
│      │  │      assetTagEx.vue
│      │  │      endpoint.vue
│      │  │      ping.vue
│      │  │
│      │  └─software
│      │          softwareAsset.vue
│      │          softwareType.vue
│      │
│      ├─config
│      │  │  about.vue
│      │  │  agent.vue
│      │  │  assetMeta.vue
│      │  │  assetState.vue
│      │  │  assetType.vue
│      │  │  backups.vue
│      │  │  basic.vue
│      │  │  credentials.vue
│      │  │  dc.vue
│      │  │  email.vue
│      │  │  globalization.vue
│      │  │  ipam.vue
│      │  │  issue.vue
│      │  │  ldap.vue
│      │  │  licenseGen.vue
│      │  │  menus.vue
│      │  │  mib.vue
│      │  │  mibBrowser.vue
│      │  │  model.vue
│      │  │  monitor.vue
│      │  │  operationLog.vue
│      │  │  operationRecord.vue
│      │  │  profile.vue
│      │  │  profileChangePin.vue
│      │  │  recordRule.vue
│      │  │  roles.vue
│      │  │  setup.vue
│      │  │  snmp.vue
│      │  │  system.vue
│      │  │  terminal.vue
│      │  │  terminalLog.vue
│      │  │  user.vue
│      │  │
│      │  ├─system
│      │  │      apiKeyTab.vue
│      │  │      apiKeyTable.vue
│      │  │      license.vue
│      │  │      licenseData.js
│      │  │      linkTab.vue
│      │  │      linkTable.vue
│      │  │      notifyMethodTab.vue
│      │  │      notifyMethodTable.vue
│      │  │      selfApiKeyTab.vue
│      │  │      selfApiKeyTable.vue
│      │  │      systemCommon.js
│      │  │
│      │  └─template
│      │          chartTemp.vue
│      │          dashboardTemp.vue
│      │          exprTemp.vue
│      │          index.vue
│      │
│      ├─dashboard
│      │  │  alertChartParam.vue
│      │  │  dashboard.vue
│      │  │
│      │  ├─explore
│      │  │  │  CMTheme.tsx
│      │  │  │  explore.vue
│      │  │  │  exploreItem.vue
│      │  │  │  exploreItemHtml.vue
│      │  │  │  exploreItemMixin.js
│      │  │  │  logqlHint.js
│      │  │  │  logTab.vue
│      │  │  │  promqlInput.vue
│      │  │  │  suggestions.vue
│      │  │  │
│      │  │  ├─histoyrComponent
│      │  │  │      exploreHistory.vue
│      │  │  │
│      │  │  ├─logql
│      │  │  │      getTimeRange.js
│      │  │  │      lezerConfig.js
│      │  │  │      logql.vue
│      │  │  │      logqlMixin.js
│      │  │  │      monacoConfig.js
│      │  │  │      setError.js
│      │  │  │      situation.js
│      │  │  │
│      │  │  ├─logqlparser
│      │  │  │      logqloarser.go
│      │  │  │
│      │  │  ├─MonacoVue
│      │  │  │      vue-monaco.js
│      │  │  │
│      │  │  ├─promqlparser
│      │  │  │      go.mod
│      │  │  │      go.sum
│      │  │  │      promqlparser.go
│      │  │  │      promqlparser.wasm
│      │  │  │      wasm_exec.js
│      │  │  │
│      │  │  └─queryPrompt
│      │  │          queryPrompt.vue
│      │  │
│      │  └─overview
│      │          chart.vue
│      │          chartConfig.vue
│      │
│      ├─integration
│      │  │  integration.vue
│      │  │
│      │  └─integration-tabs
│      │          alert.vue
│      │          automatic.vue
│      │          configuration.vue
│      │          dashboard.vue
│      │          integration-tabs.vue
│      │          manual.vue
│      │          metric.vue
│      │
│      ├─monitor
│      │  ├─endpoint
│      │  │      endpointList.vue
│      │  │
│      │  ├─module
│      │  │      moduleList.vue
│      │  │
│      │  └─project
│      │          index.vue
│      │          project.vue
│      │          projectList.vue
│      │
│      ├─notebook
│      │      notebook.vue
│      │      notebookAdd.vue
│      │      notebookList.vue
│      │
│      └─tool
│              assetDiscovery.vue
│              ping.vue
│              trace.vue
│
├─entrance
│  ├─app
│  │      App.vue
│  │      index.html
│  │      lodashInfo.md
│  │      main.js
│  │
│  └─exportHtml
│          App.vue
│          exportHtml.html
│          exportHtml.js
│          i18nData.js
│
├─libs
│      bus.js
│
├─router
│  │  index.js
│  │
│  └─exportHtmlRouter
│          index.js
│
└─store
        exportHtml.js
        index.js
        panel.js
        terminalFile.js
        timePicker.js
        topology.js
        user.js
```