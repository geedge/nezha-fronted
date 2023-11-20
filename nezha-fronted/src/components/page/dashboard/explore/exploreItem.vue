<template>
  <div class="explore list-page" :class="'nz-explore-' + tabIndex" style="position:relative;">
    <div class="right-box__container main-list" style="padding: 0;">
      <div class="main-container explore-split-box" ref="exploreScrollbar" @mouseenter="tableHover = true" @mouseleave="tableHover = false">
        <!-- 关闭按钮 -->
        <div v-if="closable" class="explore-close">
          <span @click="split"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
        </div>
        <!-- 顶部工具栏 -->
        <div class="top-tools" style="z-index: 2">
          <el-row class="block-col-2" style="width: 300px;">
            <el-col>
              <el-dropdown trigger="click">
              <span class="el-dropdown-link explore-dropdown__item">
                <span><i :class="selectIcon"></i></span>
                <span>{{selectValue}}</span>
                <span><i class="el-icon-arrow-down el-icon--right"></i></span>
              </span>
                <el-dropdown-menu style="width: 118px" class="el-dropdown__width right-box-select-top right-public-box-dropdown-top" placement="bottom-end" slot="dropdown">
                  <el-dropdown-item
                    @click.native="selectMetricsLogs(item.label,item.icon, item.value)"
                    v-for="item in searchMetrics"
                    :key="item.value"><i class="nz-icon" :class="item.icon" style="margin-right: 5px"/>{{item.label}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>
          <div class="top-tool-right">
            <button v-if="!closable" class="top-tool-btn top-tool-btn--text margin-r-10" style="cursor: pointer;" type="button" @click="split">
              {{$t('overall.split')}}</button>
            <pick-time id="explore" ref="pickTime" v-model="filterTime" :class="{'margin-r-10': showMetrics}" :refresh-data-func="getExpression" @unitChange="chartUnitChange">
             <!-- <template slot="added-text">{{$t('dashboard.metricPreview.runQuery')}}</template> -->
              <template slot="added-text">{{$t('overall.query')}}</template>
            </pick-time>
            <el-dropdown trigger="click" :size="'medium'">
              <button id="more" class="top-tool-btn" :title="$t('overall.more')">
                <i class="nz-icon nz-icon-more2"></i>
              </button>
              <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
                <el-dropdown-item :disabled="saveDisabled" v-has="'main_add'">
                  <div>
                    <i class="nz-icon nz-icon-add" />
                    <span
                      v-if="showMetrics"
                      id="explore-save-chart"
                      :class="{'btn-disabled-cursor-not-allowed' : saveDisabled}"
                      :disabled="saveDisabled"
                      class="top-tool-btn top-tool-btn--text"
                      type="button"
                      @click="saveChart">
                      {{$t('dashboard.metric.saveChart')}}
                  </span>
                  <span
                    v-else
                    id="explore-save-chart-logs"
                    :class="{'btn-disabled-cursor-not-allowed' : saveDisabled}"
                    :disabled="saveDisabled"
                    class="top-tool-btn top-tool-btn--text"
                    type="button"
                    @click="saveChartLogs">
                    {{$t('dashboard.metric.saveChart')}}
                  </span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item>
                  <div id="chart-export-html" @click="exportToHtml"><i class="nz-icon nz-icon-kuaizhao"></i>{{ $t('overall.snapshoot') }}</div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <div id="explore-promql-box" class="top-tools chart-config" style="padding-top: 0; flex-wrap: wrap">
          <div class="metrics-input-box" style="width: 100%">
            <draggable
              v-model="promqlKeys"
              @start="start"
              @end="end"
              :scroll-sensitivity="150"
              :options="{
              dragClass:'drag-chart-class',
              fallbackClass:'fallback-class',
              forceFallback:true,
              ghostClass:'chart-ghost',
              chosenClass:'choose-class',
              scroll:true,
              filter: '.drag-disabled',
              animation: 150,
              handle: '.drag-sort'
          }">
              <el-row
                class="element-item form-row-item thresholds-from-item"
                style="margin-bottom: 10px !important"
                v-for="index of promqlKeys.length"
                v-if="expressionsShow[index-1]"
                :key="expressionsShow[index-1].id"
              >
                <div class="chart-title chart-title-config">
            <span
              class="chart-title-content el-form-item"
              :class="{
                'is-error' : expressionsShow[index-1].error,
                'hide-input': expressionsShow[index-1].hideInput
              }"
            >
              <i class="nz-icon nz-icon-arrow-down" :class="expressionsShow[index-1].show?'':'is-active'" @click.stop="showExpression(index)"></i>
              <el-input
                style="width: 90px"
                @mousedown.stop
                v-model="expressionName[index-1]"
                size="small"
                @input="(val)=>{expressionNameInput(val,index-1)}"
                @change="expressionNameChange(index-1)"
                @focus.stop="showInput(index-1,false)"
                @blur="showInput(index-1,true)"
              />
              <div v-if="expressionsShow[index-1].error" class="el-form-item__error" style="top: 30px;left: 25px">{{expressionsShow[index-1].error}}</div>
              <div class="text-ellipsis" style="flex-shrink: 0;width: calc(100% - 310px)" v-if="!expressionsShow[index-1].show" :title="expressions[index - 1]">
                {{expressions[index - 1]}}
              </div>
            </span>
                  <span>
              <!-- 显示隐藏 -->
              <span v-if="expressionsShow[index-1].state === 1" @click="()=>{switchExpression(index - 1,1)}" :title="$t('overall.visible')" style="margin-right: 5px;padding-left: 10px">
                <i class="nz-icon nz-icon-mimakejian"></i>
              </span>
              <span v-else @click="()=>{switchExpression(index - 1,0)}" :title="$t('overall.invisible')" style="margin-right: 5px;padding-left: 10px">
                <i class="nz-icon nz-icon-mimabukejian"></i>
              </span>
              <span @click="()=>{showHistoryBox(index - 1)}" style="margin-right: 5px" :title="$t('overall.history')">
                <i class="nz-icon nz-icon-time" style="fontSize:16px"></i>
              </span>
              <span @click="()=>{addExpression()}" style="margin-right: 5px" :title="$t('tip.add')">
                <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
              </span>
              <span @click="copyExpression(index - 1)" style="margin-right: 5px" :title="$t('overall.duplicate')">
                <i class="nz-icon nz-icon-override"></i>
              </span>
              <span @click="removeExpression(index - 1)" class="nz-icon-minus-medium" style="margin-right: 5px" :title="$t('overall.delete')">
                <i class="nz-icon nz-icon-minus"></i>
              </span>
              <span style="margin-right: 5px;fontSize:17px;cursor: grab;" class="drag-sort" :title="$t('dashboard.dashboard.chartForm.sort')">
                <i class="nz-icon nz-icon-sort" style="cursor: grab;"></i>
              </span>
            </span>
                </div>
<!--                <transition name="el-zoom-in-top">-->
                  <el-row v-show="expressionsShow[index-1].show">
                    <promql-input
                      :from-father-data="true"
                      :metricOptionsParent="metricOptions"
                      :id="promqlKeys[index-1].id"
                      :pqid="promqlKeys[index-1].id"
                      :key="promqlKeys[index-1].id"
                      :ref="'promql-'+(index-1)"
                      :expression-list="expressions"
                      :state="promqlKeys[index-1].state"
                      :index="index-1"
                      :plugins="['metric-selector', 'metric-input', 'add', 'remove', 'copy','enable', 'history']"
                      :styleType="1"
                      :type="promqlType"
                      @enableExpression="enableExpression"
                      @addExpression="addExpression"
                      @copyExpression="copyExpression"
                      @removeExpression="removeExpression"
                      @resetExpression="resetExpression"
                    ></promql-input>
                    <el-row style="margin-top: 18px;display: flex">
                      <div style="min-width: 310px;flex-shrink: 0;width: 50%">
                        <div class="legend-title-new">
                          <span class="legend-title__span">{{$t('dashboard.dashboard.chartForm.legend')}}&nbsp;</span>
                          <el-popover placement="top" trigger="hover" width="211" popper-class="prevent-clickoutside">
                            <div style="white-space: normal" :style="{'word-break':language!=='zh'?'keep-all':'break-all'}">{{$t('dashboard.dashboard.chartForm.legendTip')}}</div>
                            <!-- <div :style="{'word-break':language!=='cn'?'keep-all':'break-all'}">{{$t('dashboard.dashboard.chartForm.legendTip')}}</div> -->
                            <i @mouseover="rz" class="nz-icon nz-icon-info-normal" slot="reference" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                          </el-popover>
                        </div>
                        <div>
                          <el-input maxlength="512" size="small" type="text" v-model="expressionsShow[index-1].legend" @change="expressionChange"></el-input>
                        </div>
                      </div>
                      <div style="margin-left: 10px;width: 25%; flex: 1" v-if="showMetrics">
                        <div class="legend-title-new" style="width: 55px">
                          <span class="legend-title__span">{{$t('overall.type')}}&nbsp;</span>
                          <el-popover placement="top" trigger="hover" width="211" popper-class="prevent-clickoutside">
                            <div style="white-space: normal" :style="{'word-break':language!=='zh'?'keep-all':'break-all'}">{{$t('dashboard.dashboard.chartForm.queryTypeTip')}}</div>
                            <!-- <div :style="{'word-break':language!=='cn'?'keep-all':'break-all'}">{{$t('dashboard.dashboard.chartForm.legendTip')}}</div> -->
                            <i @mouseover="rz" class="nz-icon nz-icon-info-normal" slot="reference" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                          </el-popover>
                        </div>
                        <div style="flex: 1">
                          <el-select size="small" v-model="expressionsShow[index-1].queryType" @change="queryTypeChange(index - 1)" style="width: 100%;">
                            <el-option :label="$t('dashboard.dashboard.chartForm.valMapping.range')" :value="1">{{$t('dashboard.dashboard.chartForm.valMapping.range')}}</el-option>
                            <el-option :label="$t('overall.instant')" :value="2">{{$t('overall.instant')}}</el-option>
                          </el-select>
                        </div>
                      </div>
                      <div style="margin-left: 10px;width: 25%;flex: 1">
                        <div class="legend-title-new" style="margin-left: 10px;width: 55px">
                          <span class="legend-title__span">{{$t('overall.step')}}&nbsp;</span>
                        </div>
                        <div style="flex: 1">
                          <el-input-number
                            style="width: 100%;"
                            :disabled="expressionsShow[index-1].queryType == 2"
                            @change="expressionChange"
                            v-model="expressionsShow[index-1].step"
                            size="small"
                            :min="minStep"
                            :precision="0"
                            :controls="false"
                            :placeholder="$t('overall.auto')"
                          >
                          </el-input-number>
                        </div>
                      </div>
                    </el-row>
                  </el-row>
<!--                </transition>-->
              </el-row>
            </draggable>
          </div>
        </div>
        <div style="position: relative;z-index: 1;height: auto; padding: 0 20px 10px;">
          <el-collapse v-show="!showIntroduce" v-model="collapseValue" class="explore-collapse" @change="logsCollapseChange">
            <!--metric-->
            <template v-if="showMetrics">
              <el-collapse-item v-if="!allMatrix && showChart" name="1" :title="$t('explore.graph')" class="el-collapse-item__height">
                <div class="chart-room">
                  <chart ref="exploreChart" :unit="chartUnit" :timeRange="filterTime"></chart>
                </div>
              </el-collapse-item>
              <el-collapse-item class="el-collapse-item__height" name="2" title="Table" v-if="showTable">
                <div slot="title" class="explore-table-title">
                  <span>{{tableMode==='table'?$t('dashboard.dashboard.chartForm.typeVal.table.label'):$t('explore.row')}}</span>
                  <!-- 判断是否折叠 -->
                  <div class="tableMode" v-show="collapseValue.some(item=>item==2)">
                    <div class="tableMode-item" :class="{'active':tableMode==='table'}" @click.stop="tableMode='table'" tabindex="0">{{$t('dashboard.dashboard.chartForm.typeVal.table.label')}}</div>
                    <div class="tableMode-item" :class="{'active':tableMode==='row'}" @click.stop="tableMode='row'" tabindex="0">{{$t('explore.row')}}</div>
                  </div>
                  <i
                    v-if="tableMode==='table'"
                    class="nz-icon-gear nz-icon"
                    style="position: absolute;right: 0px;top: 0px"
                    @click.stop="tools.showCustomTableTitle = true"
                    :title="$t('overall.selectColumns')"
                    tabindex="0"
                  ></i>
                  <!-- 自定义table列 -->
                  <transition name="el-zoom-in-top">
                    <element-set
                      @click.stop="()=>{}"
                      v-if="tools.showCustomTableTitle"
                      :tableId="tableId"
                      ref="customTableTitle"
                      :custom-table-title="tools.customTableTitle"
                      :original-table-title="tableTitle"
                      :operation-true="true"
                      @close="tools.showCustomTableTitle = false"
                      @update="updateCustomTableTitle"
                    ></element-set>
                  </transition>
                </div>
                <!-- table模式 -->
                <template v-if="tableMode==='table'">
                  <div class="nz-table-list explore-table">
                    <el-table
                      ref="exploreTable"
                      v-my-loading="tools.loading"
                      class="metric-table"
                      :data="tableData"
                      :border="false"
                      :header-cell-class-name="({ column }) => column.property === 'gear' ? 'explore-table-gear' : ''"
                      tooltip-effect="light">
                      <el-table-column
                        v-for="(item, index) in tools.customTableTitle"
                        v-if="item.show"
                        :key="`col-${index}-${item.prop}`"
                        :label="item.label"
                        :prop="item.prop"
                        :resizable="false"
                        :min-width="110"
                        show-overflow-tooltip
                      >
                        <template slot-scope="scope" :column="item">
                          <template v-if="item.prop === 'time'">{{timeFormate(scope.row.time)}}</template>
                          <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
                          <template v-else>-</template>
                        </template>
                      </el-table-column>
                      <template slot="empty">
                        <div v-if="!tools.loading" class="table-no-data">
                          <svg class="icon" aria-hidden="true">
                            <use xlink:href="#nz-icon-no-data-list"></use>
                          </svg>
                          <div class="table-no-data__title">No results found</div>
                        </div>
                        <div v-else>&nbsp;</div>
                      </template>
                    </el-table>
                  </div>
                  <pagination ref="Pagination" :page-obj="pageObj" @pageNo='pageNo' @pageSize='pageSize'></pagination>
                </template>
                <!-- row模式 -->
                <template v-else>
                  <div class="expand-results">
                    <div>
                      <span>{{$t('explore.expandResults')}}</span>
                      <el-switch v-model="expandResults" @click.native.stop tabindex="0"></el-switch>
                    </div>
                    <span>{{$t('explore.resultSeries')}}：{{rowData.length}}</span>
                  </div>
                  <div class="nz-table-list explore-table">
                    <ul v-my-loading="tools.loading" class="row-table" :class="{'expand-results-table':expandResults}">
                      <li class="row-table-row" v-for="(row,index) in rowData" :key="index">
                        <div class="table-row-left">
                          <copy :copyData='row.element' :showInfo='row.element'>
                            <template slot="copy-text">
                              <span v-if="expandResults" v-html="row.expandElement"></span>
                              <span v-else v-html="row.colorElement"></span>
                            </template>
                          </copy>
                        </div>
                        <div class="table-row-right">
                          <h2 class="expand-value" v-if="expandResults">{{$t('overall.value')}}</h2>
                          <ul v-if="row.valueList" class="valueList">
                            <li v-for="item in row.valueList" :key="item.timestamp">
                              <span>{{item.value}}</span>
                              <span>{{item.timestamp}}</span>
                              <span>{{item.time}}</span>
                              <span>{{item.interval}}</span>
                            </li>
                          </ul>
                          <ul v-else class="valueList">
                            <li>
                              <span>{{row.value}}</span>
                              <span>{{row.timestamp}}</span>
                              <span>{{row.time}}</span>
                              <span style="opacity:0">+30</span>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <div v-if="!tools.loading&&!storedTableData.length" class="table-no-data">
                        <svg class="icon" aria-hidden="true">
                          <use xlink:href="#nz-icon-no-data-list"></use>
                        </svg>
                        <div class="table-no-data__title">No results found</div>
                      </div>
                    </ul>
                  </div>
                </template>
              </el-collapse-item>
            </template>
            <!--log-->
            <template v-else>
              <el-collapse-item v-if="showTab.indexOf('1') > -1" name="1" :title="$t('explore.graph')" class="el-collapse-item__height">
                <div class="chart-room">
                  <chart ref="logChart" :unit="chartUnit" v-my-loading="chartLoading" :timeRange="filterTime"></chart>
                </div>
              </el-collapse-item>
              <el-collapse-item v-if="showTab.indexOf('2') > -1" name="2" title="Logs">
                <log-tab
                  ref="logDetail"
                  :unit="chartUnit"
                  :timeRange="filterTime"
                  :log-data="logData"
                  :explore-log-table="logTabNoData"
                  :explore-item="true"
                  :tab-index="tabIndex"
                  @exportLog="exportLog"
                  @limitChange="queryLogData"
                  v-my-loading="chartLoading">
                </log-tab>
              </el-collapse-item>
            </template>
          </el-collapse>
          <!-- Metric -->
          <div v-if="showMetrics" v-show="showIntroduce" class="introduce-view">
            <!-- 英文 -->
             <div class="info-room title-heard" v-if="language == 'en'">
              <div class="col-md-9 logs-content">
                <!-- promql -->
                <h1 class="page-header" style="margin-Top:0px">PromQL: Prometheus Query Language<a class="header-anchor" href="https://prometheus.io/docs/prometheus/latest/querying/basics/" rel="noopener noreferrer" target="_blank"><i class="nz-icon nz-icon-link1" style="font-size: 16px;" :title="$t('overall.link')"></i></a></h1>
                <div class="title-heard__divider"></div>
                <!-- catalog 目录 -->
                <div class="catalog">
                  <ul class="catalog-square">
                  <!-- Querying prometheus -->
                  <li>
                    <div @click="jumpClick('#querying-prometheus')"><span>Querying prometheus</span></div>
                    <ul class="catalog-disc">
                      <li @click="jumpClick('#querying-prometheus-examples')"><span>Examples</span></li>
                      <li  @click="jumpClick('#expression-language-data-types')"><span>Expression language data types</span></li>
                      <li>
                        <div @click="jumpClick('#literals')"><span>Literals</span></div>
                         <ul>
                            <li @click="jumpClick('#string-literals')"><span>String literals</span></li>
                            <li @click="jumpClick('#float-literals')"><span>Float literals</span></li>
                        </ul>
                      </li>
                       <li>
                        <div @click="jumpClick('#time-series-selectors')"><span>Time series Selectors</span></div>
                         <ul>
                            <li @click="jumpClick('#instant-vector-selectors')"><span>Instant vector selectors</span></li>
                            <li @click="jumpClick('#range-vector-selectors')"><span>Range Vector Selectors</span></li>
                            <li @click="jumpClick('#time-durations')"><span>Time Durations</span></li>
                            <li @click="jumpClick('#offset-modifier')"><span>Offset modifier</span></li>
                            <li @click="jumpClick('#time-series-modifier')"><span>@ modifier</span></li>
                        </ul>
                      </li>
                      <li @click="jumpClick('#querying-prometheus-subquery')"><span>Subquery</span></li>
                      <li @click="jumpClick('#querying-prometheus-operators')"><span>Operators</span></li>
                      <li @click="jumpClick('#querying-prometheus-functions')"><span>Functions</span></li>
                      <li @click="jumpClick('#querying-prometheus-comments')"><span>Comments</span></li>
                       <li >
                        <div @click="jumpClick('#querying-prometheus-gotchas')"><span>Gotchas</span></div>
                         <ul>
                            <li @click="jumpClick('#gotchas-staleness')"><span>Staleness</span></li>
                            <li @click="jumpClick('#avoiding-slow-queries-and-overloads')"><span>Avoiding slow queries and overloads</span></li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <!-- Operators -->
                  <li>
                    <div @click="jumpClick('#operators')"><span>Operators</span></div>
                    <ul class="catalog-disc">
                      <li>
                        <div @click="jumpClick('#binary-operators')"><span>Binary operators</span></div>
                         <ul>
                            <li @click="jumpClick('#arithmetic-binary-operators')"><span>Arithmetic binary operators</span></li>
                            <li @click="jumpClick('#trigonometric-binary-operators')"><span>Trigonometric binary operators</span></li>
                            <li @click="jumpClick('#comparison-binary-operators')"><span>Comparison binary operators</span></li>
                            <li @click="jumpClick('#Logical-binary-operators')"><span>Logical/set binary operators</span></li>
                        </ul>
                      </li>
                      <li>
                        <div @click="jumpClick('#vector-matching')"><span>Vector matching</span></div>
                         <ul>
                            <li @click="jumpClick('#vector-matching-keywords')"><span>Vector matching keywords</span></li>
                            <li @click="jumpClick('#group-modifiers')"><span>Group modifiers</span></li>
                            <li @click="jumpClick('#one-to-one-vector-matches')"><span>One-to-one vector matches</span></li>
                            <li @click="jumpClick('#many-to-one')"><span>Many-to-one and one-to-many vector matches</span></li>
                        </ul>
                      </li>
                      <li @click="jumpClick('#aggregation-operators')"><span>Aggregation operators</span></li>
                      <li @click="jumpClick('#binary-operator-precedence')"><span>Binary operator precedence</span></li>
                    </ul>
                  </li>
                  <!-- Functions -->
                  <li>
                    <div @click="jumpClick('#functions')"><span>Functions</span></div>
                    <ul class="catalog-disc">
                      <li @click="jumpClick('#functions-abs')"><span>abs()</span></li>
                      <li @click="jumpClick('#functions-absent')"><span>absent()</span></li>
                      <li @click="jumpClick('#functions-absent_over_time')"><span>absent_over_time()</span></li>
                      <li @click="jumpClick('#functions-ceil')"><span>ceil()</span></li>
                      <li @click="jumpClick('#functions-changes')"><span>changes()</span></li>
                      <li @click="jumpClick('#functions-clamp')"><span>clamp()</span></li>
                      <li @click="jumpClick('#functions-clamp_max')"><span>clamp_max()</span></li>
                      <li @click="jumpClick('#functions-clamp_min')"><span>clamp_min()</span></li>
                      <li @click="jumpClick('#functions-day_of_month')"><span>day_of_month()</span></li>
                      <li @click="jumpClick('#functions-day_of_week')"><span>day_of_week()</span></li>
                      <li @click="jumpClick('#functions-day_of_year')"><span>day_of_year()</span></li>
                      <li @click="jumpClick('#functions-days_in_month')"><span>days_in_month()</span></li>
                      <li @click="jumpClick('#functions-delta')"><span>delta()</span></li>
                      <li @click="jumpClick('#functions-deriv')"><span>deriv()</span></li>
                      <li @click="jumpClick('#functions-exp')"><span>exp()</span></li>
                      <li @click="jumpClick('#functions-floor')"><span>floor()</span></li>
                      <li @click="jumpClick('#functions-histogram_quantile')"><span>histogram_quantile()</span></li>
                      <li @click="jumpClick('#functions-holt_winters')"><span>holt_winters()</span></li>
                      <li @click="jumpClick('#functions-hour')"><span>hour()</span></li>
                      <li @click="jumpClick('#functions-idelta')"><span>idelta()</span></li>
                      <li @click="jumpClick('#functions-increase')"><span>increase()</span></li>
                      <li @click="jumpClick('#functions-irate')"><span>irate()</span></li>
                      <li @click="jumpClick('#functions-label_join')"><span>label_join()</span></li>
                      <li @click="jumpClick('#functions-label_replace')"><span>label_replace()</span></li>
                      <li @click="jumpClick('#functions-ln')"><span>ln()</span></li>
                      <li @click="jumpClick('#functions-log2')"><span>log2()</span></li>
                      <li @click="jumpClick('#functions-log10')"><span>log10()</span></li>
                      <li @click="jumpClick('#functions-minute')"><span>minute()</span></li>
                      <li @click="jumpClick('#functions-month')"><span>month()</span></li>
                      <li @click="jumpClick('#functions-predict_linear')"><span>predict_linear()</span></li>
                      <li @click="jumpClick('#functions-rate')"><span>rate()</span></li>
                      <li @click="jumpClick('#functions-resets')"><span>resets()</span></li>
                      <li @click="jumpClick('#functions-round')"><span>round()</span></li>
                      <li @click="jumpClick('#functions-scalar')"><span>scalar()</span></li>
                      <li @click="jumpClick('#functions-sgn')"><span>sgn()</span></li>
                      <li @click="jumpClick('#functions-sort')"><span>sort()</span></li>
                      <li @click="jumpClick('#functions-sort_desc')"><span>sort_desc()</span></li>
                      <li @click="jumpClick('#functions-sqrt')"><span>sqrt()</span></li>
                      <li @click="jumpClick('#functions-time')"><span>time()</span></li>
                      <li @click="jumpClick('#functions-timestamp')"><span>timestamp()</span></li>
                      <li @click="jumpClick('#functions-vector')"><span>vector()</span></li>
                      <li @click="jumpClick('#functions-year')"><span>year()</span></li>
                      <li @click="jumpClick('#functions-aggregation')"><span>&lt;aggregation&gt;_over_time()</span></li>
                      <li @click="jumpClick('#functions-trigonometric')"><span>Trigonometric Functions</span></li>
                    </ul>
                  </li>
                  <!-- QUERY EXAMPLES -->
                  <li>
                    <div @click="jumpClick('#query-examples')"><span>Query examples</span></div>
                    <ul class="catalog-disc">
                      <li @click="jumpClick('#simple-time-series-selection')"><span>Simple time series selection</span></li>
                      <li @click="jumpClick('#query-examples-subquery')"><span>Subquery</span></li>
                      <li @click="jumpClick('#using-functions')"><span>Using functions, operators, etc.</span></li>
                    </ul>
                  </li>
                  </ul>
                </div>
                <!-- QUERYING PROMETHEUS -->
                <!-- start -->
                <div class="introduce-view__content">
                  <h1 class="page-header-one" id="querying-prometheus">Querying prometheus</h1>
                  <p>Prometheus provides a functional query language called PromQL (Prometheus Query Language) that lets the user select and aggregate time series data in real time. The result of an expression can either be shown as a graph, viewed as tabular data in Prometheus's expression browser, or consumed by external systems via the HTTP API.</p>
                </div>
                <!-- Examples -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="querying-prometheus-examples">Examples</h1>
                  <p>This document is meant as a reference. For learning, it might be easier to start with a couple of <b style="color: #3C92F1" @click="jumpClick('#query-examples')" class="log-link">examples</b>.</p>
                </div>
                <!-- Expression language data types -->
                <div >
                  <h1 class="page-header-two" id="expression-language-data-types">Expression language data types</h1>
                  <div class="introduce-view__content-label">
                    <p>In Prometheus's expression language, an expression or sub-expression can evaluate to one of four types:</p>
                    <ul>
                      <li><b>Instant vector</b> - a set of time series containing a single sample for each time series, all sharing the same timestamp</li>
                      <li><b>Range vector</b> - a set of time series containing a range of data points over time for each time series</li>
                      <li><b>Scalar</b> - a simple numeric floating point value</li>
                      <li><b>String</b> - a simple string value; currently unused</li>
                    </ul>
                    <p>Depending on the use-case (e.g. when graphing vs. displaying the output of an expression), only some of these types are legal as the result from a user-specified expression. For example, an expression that returns an instant vector is the only type that can be directly graphed.</p>
                  </div>
                </div>
                <!-- Literals -->
                <h1 class="page-header-two" id="literals">Literals</h1>
                <div class="introduce-view__content">
                  <h2 id="string-literals">String literals</h2>
                  <div class="introduce-view__content-label">
                    <p>Strings may be specified as literals in single quotes, double quotes or backticks.</p>
                    <p>PromQL follows the same escaping rules as Go. In single or double quotes a backslash begins an escape sequence, which may be followed by <code>a</code>, <code>b</code>, <code>f</code>, <code>n</code>, <code>r</code>, <code>t</code>, <code>v</code> or <code>\</code>. Specific characters can be provided using octal (<code>\nnn</code>) or hexadecimal (<code>\xnn</code>, <code>\unnnn</code> and <code>\Unnnnnnnn</code>).</p>
                    <p>No escaping is processed inside backticks. Unlike Go, Prometheus does not discard newlines inside backticks.</p>
                    <p>Example:</p>
                    <pre>"this is a string"
'these are unescaped: \n \\ \t'
`these are not unescaped: \n ' " \t`</pre>
                  </div>
                </div>
                <!-- Float literals -->
                <div class="introduce-view__content">
                  <h2 id="float-literals">Float literals</h2>
                  <div class="introduce-view__content-label">
                    <p>Scalar float values can be written as literal integer or floating-point numbers in the format (whitespace only included for better readability):</p>
                    <pre>[-+]?(
      [0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?
    | 0[xX][0-9a-fA-F]+
    | [nN][aA][nN]
    | [iI][nN][fF]
)</pre>
                    <p>Examples:</p>
                    <pre>23
-2.43
3.4e-9
0x8f
-Inf
NaN</pre>
                  </div>
                </div>
                <!-- Time series Selectors -->
                <h1 class="page-header-two" id="time-series-selectors">Time series Selectors</h1>
                <div class="introduce-view__content">
                  <h2 id="instant-vector-selectors">Instant vector selectors</h2>
                  <div class="introduce-view__content-label">
                    <div>
                        <p>Instant vector selectors allow the selection of a set of time series and a single sample value for each at a given timestamp (instant): in the simplest form, only a metric name is specified. This results in an instant vector containing elements for all time series that have this metric name.</p>
                        <p>This example selects all time series that have the <code>http_requests_total</code> metric name:</p>
                        <pre>http_requests_total</pre>
                        <p>It is possible to filter these time series further by appending a comma separated list of label matchers in curly braces (<code>{}</code>).</p>
                        <p>This example selects only those time series with the <code>http_requests_total</code> metric name that also have the <code>job</code> label set to <code>prometheus</code> and their <code>group</code> label set to <code>canary</code>:</p>
                        <pre>http_requests_total{job="prometheus",group="canary"}</pre>
                        <p>It is also possible to negatively match a label value, or to match label values against regular expressions. The following label matching operators exist:</p>
                        <ul>
                          <li><code>=</code>: Select labels that are exactly equal to the provided string.</li>
                          <li><code>!=</code>: Select labels that are not equal to the provided string.</li>
                          <li><code>=~</code>: Select labels that regex-match the provided string.</li>
                          <li><code>!~</code>: Select labels that do not regex-match the provided string.</li>
                        </ul>
                        <p>Regex matches are fully anchored. A match of <code>env=~"foo"</code> is treated as <code>env=~"^foo$"</code>.</p>
                        <p>For example, this selects all <code>http_requests_total</code> time series for <code>staging</code>, <code>testing</code>, and <code>development</code> environments and HTTP methods other than <code>GET</code>.</p>
                        <pre>http_requests_total{environment=~"staging|testing|development",method!="GET"}</pre>
                    </div>
                    <p>Label matchers that match empty label values also select all time series that do not have the specific label set at all. It is possible to have multiple matchers for the same label name.</p>
                    <p>Vector selectors must either specify a name or at least one label matcher that does not match the empty string. The following expression is illegal:</p>
                    <pre>{job=~".*"} # Bad!</pre>
                    <p>In contrast, these expressions are valid as they both have a selector that does not match empty label values.</p>
                    <pre>{job=~".+"}              # Good!
{job=~".*",method="get"} # Good!</pre>
                    <p>Label matchers can also be applied to metric names by matching against the internal <code>__name__</code> label. For example, the expression <code>http_requests_total</code> is equivalent to <code>{__name__="http_requests_total"}</code>. Matchers other than <code>=</code> (<code>!=</code>, <code>=~</code>, <code>!~</code>) may also be used. The following expression selects all metrics that have a name starting with <code>job:</code>:</p>
                    <pre>{__name__=~"job:.*"}</pre>
                    <p>The metric name must not be one of the keywords <code>bool</code>, <code>on</code>, <code>ignoring</code>, <code>group_left</code> and <code>group_right</code>. The following expression is illegal:</p>
                    <pre>on{} # Bad!</pre>
                    <p>A workaround for this restriction is to use the <code>__name__</code> label:</p>
                    <pre>{__name__="on"} # Good!</pre>
                    <p>All regular expressions in Prometheus use RE2 syntax.</p>
                  </div>
                </div>
                <!-- Range Vector Selectors -->
                 <div class="introduce-view__content">
                  <h2 id="range-vector-selectors">Range Vector Selectors</h2>
                  <div class="introduce-view__content-label">
                    <p>Range vector literals work like instant vector literals, except that they select a range of samples back from the current instant. Syntactically, a <b style="color: #3C92F1" @click="jumpClick('#time-durations')" class="log-link">time duration</b> is appended in square brackets (<code>[]</code>) at the end of a vector selector to specify how far back in time values should be fetched for each resulting range vector element.</p>
                    <p>In this example, we select all the values we have recorded within the last 5 minutes for all time series that have the metric name <code>http_requests_total</code> and a <code>job</code> label set to <code>prometheus</code>:</p>
                    <pre>http_requests_total{job="prometheus"}[5m]</pre>
                  </div>
                </div>
                <!-- Time Durations -->
                <div class="introduce-view__content">
                  <h2 id="time-durations">Time Durations</h2>
                  <div class="introduce-view__content-label">
                    <p>Time durations are specified as a number, followed immediately by one of the following units:</p>
                    <ul>
                      <li><code>ms</code> - milliseconds</li>
                      <li><code>s</code> - seconds</li>
                      <li><code>m</code> - minutes</li>
                      <li><code>h</code> - hours</li>
                      <li><code>d</code> - days - assuming a day has always 24h</li>
                      <li><code>w</code> - weeks - assuming a week has always 7d</li>
                      <li><code>y</code> - years - assuming a year has always 365d</li>
                    </ul>
                    <p>Time durations can be combined, by concatenation. Units must be ordered from the longest to the shortest. A given unit must only appear once in a time duration.</p>
                    <p>Here are some examples of valid time durations:</p>
                    <pre>5h
1h30m
5m
10s</pre>
                  </div>
                </div>
                <!-- Offset modifier -->
                 <div class="introduce-view__content">
                  <h2 id="offset-modifier">Offset modifier</h2>
                  <div class="introduce-view__content-label">
                    <p>The <code>offset</code> modifier allows changing the time offset for individual instant and range vectors in a query.</p>
                    <p>For example, the following expression returns the value of <code>http_requests_total</code> 5 minutes in the past relative to the current query evaluation time:</p>
                    <pre>http_requests_total offset 5m</pre>
                    <p>Note that the <code>offset</code> modifier always needs to follow the selector immediately, i.e. the following would be correct:</p>
                    <pre>sum(http_requests_total{method="GET"} offset 5m) // GOOD.</pre>
                    <p>While the following would be <i>incorrect</i>:</p>
                    <pre>sum(http_requests_total{method="GET"}) offset 5m // INVALID.</pre>
                    <p>The same works for range vectors. This returns the 5-minute rate that <code>http_requests_total</code> had a week ago:</p>
                    <pre>rate(http_requests_total[5m] offset 1w)</pre>
                    <p>For comparisons with temporal shifts forward in time, a negative offset can be specified:</p>
                    <pre>rate(http_requests_total[5m] offset -1w)</pre>
                    <p>Note that this allows a query to look ahead of its evaluation time.</p>
                  </div>
                </div>
                <!-- @ modifier -->
                 <div class="introduce-view__content">
                  <h2 id="time-series-modifier">@ modifier</h2>
                  <div class="introduce-view__content-label">
                    <p>The <code>@</code> modifier allows changing the evaluation time for individual instant and range vectors in a query. The time supplied to the <code>@</code> modifier is a unix timestamp and described with a float literal.</p>
                    <p>For example, the following expression returns the value of <code>http_requests_total</code> at <code>2021-01-04T07:40:00+00:00</code>:</p>
                    <pre>http_requests_total @ 1609746000</pre>
                    <p>Note that the <code>@</code> modifier always needs to follow the selector immediately, i.e. the following would be correct:</p>
                    <pre>sum(http_requests_total{method="GET"} @ 1609746000) // GOOD.</pre>
                    <p>While the following would be <i>incorrect</i>:</p>
                    <pre>sum(http_requests_total{method="GET"}) @ 1609746000 // INVALID.</pre>
                    <p>The same works for range vectors. This returns the 5-minute rate that <code>http_requests_total</code> had at <code>2021-01-04T07:40:00+00:00</code>:</p>
                    <pre>rate(http_requests_total[5m] @ 1609746000)</pre>
                    <p>The <code>@</code> modifier supports all representation of float literals described above within the limits of <code>int64</code>. It can also be used along with the <code>offset</code> modifier where the offset is applied relative to the <code>@</code> modifier time irrespective of which modifier is written first. These 2 queries will produce the same result.</p>
                    <pre># offset after @
http_requests_total @ 1609746000 offset 5m
# offset before @
http_requests_total offset 5m @ 1609746000</pre>
                    <p>Additionally, <code>start()</code> and <code>end()</code> can also be used as values for the <code>@</code> modifier as special values.</p>
                    <p>For a range query, they resolve to the start and end of the range query respectively and remain the same for all steps.</p>
                    <p>For an instant query, <code>start()</code> and <code>end()</code> both resolve to the evaluation time.</p>
                    <pre>http_requests_total @ start()
rate(http_requests_total[5m] @ end())</pre>
                    <p>Note that the <code>@</code> modifier allows a query to look ahead of its evaluation time.</p>
                  </div>
                </div>
                <!-- Subquery -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="querying-prometheus-subquery">Subquery</h1>
                  <div class="introduce-view__content-label">
                    <p>Subquery allows you to run an instant query for a given range and resolution. The result of a subquery is a range vector.</p>
                    <p>Syntax: <code>&lt;instant_query&gt; '[' &lt;range&gt; ':' [&lt;resolution&gt;] ']' [ @ &lt;float_literal&gt; ] [ offset &lt;duration&gt; ]</code></p>
                    <ul>
                      <li><code>&lt;resolution&gt;</code> is optional. Default is the global evaluation interval.</li>
                    </ul>
                  </div>
                </div>
                <!-- Operators -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="querying-prometheus-operators">Operators</h1>
                  <div class="introduce-view__content-label">
                    <p>Prometheus supports many binary and aggregation operators. These are described in detail in the <b style="color: #3C92F1" @click="jumpClick('#operators')" class="log-link">expression language operators</b> page.</p>
                  </div>
                </div>
                <!-- Functions -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="querying-prometheus-functions">Functions</h1>
                  <div class="introduce-view__content-label">
                    <p>Prometheus supports several functions to operate on data. These are described in detail in the <b style="color: #3C92F1" @click="jumpClick('#functions')" class="log-link">expression language functions</b> page.</p>
                  </div>
                </div>
                <!-- Comments -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="querying-prometheus-comments">Comments</h1>
                  <div class="introduce-view__content-label">
                    <p>PromQL supports line comments that start with <code>#</code>. Example:</p>
                    <pre>    # This is a comment</pre>
                  </div>
                </div>
                <!-- Gotchas -->
                 <h1 class="page-header-two" id="querying-prometheus-gotchas">Gotchas</h1>
                 <div class="introduce-view__content">
                  <h2 id="gotchas-staleness">Staleness</h2>
                  <div class="introduce-view__content-label">
                    <p>When queries are run, timestamps at which to sample data are selected independently of the actual present time series data. This is mainly to support cases like aggregation (<code>sum</code>, <code>avg</code>, and so on), where multiple aggregated time series do not exactly align in time. Because of their independence, Prometheus needs to assign a value at those timestamps for each relevant time series. It does so by simply taking the newest sample before this timestamp.</p>
                    <p>If a target scrape or rule evaluation no longer returns a sample for a time series that was previously present, that time series will be marked as stale. If a target is removed, its previously returned time series will be marked as stale soon afterwards.</p>
                    <p>If a query is evaluated at a sampling timestamp after a time series is marked stale, then no value is returned for that time series. If new samples are subsequently ingested for that time series, they will be returned as normal.</p>
                    <p>If no sample is found (by default) 5 minutes before a sampling timestamp, no value is returned for that time series at this point in time. This effectively means that time series "disappear" from graphs at times where their latest collected sample is older than 5 minutes or after they are marked stale.</p>
                    <p>Staleness will not be marked for time series that have timestamps included in their scrapes. Only the 5 minute threshold will be applied in that case.</p>
                  </div>
                </div>
                <!-- Avoiding slow queries and overloads -->
                 <div class="introduce-view__content">
                  <h2 id="avoiding-slow-queries-and-overloads">Avoiding slow queries and overloads</h2>
                  <div class="introduce-view__content-label">
                    <p>If a query needs to operate on a very large amount of data, graphing it might time out or overload the server or browser. Thus, when constructing queries over unknown data, always start building the query in the tabular view of Prometheus's expression browser until the result set seems reasonable (hundreds, not thousands, of time series at most). Only when you have filtered or aggregated your data sufficiently, switch to graph mode. If the expression still takes too long to graph ad-hoc, pre-record it via a recording rule.</p>
                    <p>This is especially relevant for Prometheus's query language, where a bare metric name selector like <code>api_http_requests_total</code> could expand to thousands of time series with different labels. Also keep in mind that expressions which aggregate over many time series will generate load on the server even if the output is only a small number of time series. This is similar to how it would be slow to sum all values of a column in a relational database, even if the output value is only a single number.</p>
                  </div>
                </div>
                <!-- OPERATORS -->
                <h1 class="page-header-one" id="operators">Operators</h1>
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="binary-operators">Binary operators</h1>
                  <p>Prometheus's query language supports basic logical and arithmetic operators. For operations between two instant vectors, the <b style="color: #3C92F1" @click="jumpClick('#vector-matching')" class="log-link">matching behavior</b> can be modified.</p>
                </div>
                <!-- Arithmetic binary operators -->
                 <div class="introduce-view__content">
                  <h2 id="arithmetic-binary-operators">Arithmetic binary operators</h2>
                  <div class="introduce-view__content-label">
                    <p>The following binary arithmetic operators exist in Prometheus:</p>
                    <ul>
                      <li><code>+</code> (addition)</li>
                      <li><code>-</code> (subtraction)</li>
                      <li><code>*</code> (multiplication)</li>
                      <li><code>/</code> (division)</li>
                      <li><code>%</code> (modulo)</li>
                      <li><code>^</code> (power/exponentiation)</li>
                    </ul>
                    <p>Binary arithmetic operators are defined between scalar/scalar, vector/scalar, and vector/vector value pairs.</p>
                    <p><b>Between two scalars</b>, the behavior is obvious: they evaluate to another scalar that is the result of the operator applied to both scalar operands.</p>
                    <p><b>Between an instant vector and a scalar</b>, the operator is applied to the value of every data sample in the vector. E.g. if a time series instant vector is multiplied by 2, the result is another vector in which every sample value of the original vector is multiplied by 2. The metric name is dropped.</p>
                    <p><b>Between two instant vectors</b>, a binary arithmetic operator is applied to each entry in the left-hand side vector and its matching element in the right-hand vector. The result is propagated into the result vector with the grouping labels becoming the output label set. The metric name is dropped. Entries for which no matching entry in the right-hand vector can be found are not part of the result.</p>
                  </div>
                </div>
                <!-- Trigonometric binary operators -->
                <div class="introduce-view__content">
                  <h2 id="trigonometric-binary-operators">Trigonometric binary operators</h2>
                  <div class="introduce-view__content-label">
                    <p>The following trigonometric binary operators, which work in radians, exist in Prometheus:</p>
                    <ul>
                      <li><code>atan2</code> (based on https://pkg.go.dev/math#Atan2)</li>
                    </ul>
                    <p>Trigonometric operators allow trigonometric functions to be executed on two vectors using vector matching, which isn't available with normal functions. They act in the same manner as arithmetic operators.</p>
                  </div>
                </div>
                <!-- Comparison binary operators -->
                <div class="introduce-view__content">
                  <h2 id="comparison-binary-operators">Comparison binary operators</h2>
                  <div class="introduce-view__content-label">
                    <p>The following binary comparison operators exist in Prometheus:</p>
                    <ul>
                      <li><code>==</code> (equal)</li>
                      <li><code>!=</code> (not-equal)</li>
                      <li><code>&gt;</code> (greater-than)</li>
                      <li><code>&lt;</code> (less-than)</li>
                      <li><code>&gt;=</code> (greater-or-equal)</li>
                      <li><code>&lt;=</code> (less-or-equal)</li>
                    </ul>
                    <p>Comparison operators are defined between scalar/scalar, vector/scalar, and vector/vector value pairs. By default they filter. Their behavior can be modified by providing <code>bool</code> after the operator, which will return <code>0</code> or <code>1</code> for the value rather than filtering.</p>
                    <p><b>Between two scalars</b>, the <code>bool</code> modifier must be provided and these operators result in another scalar that is either <code>0</code> (<code>false</code>) or <code>1</code> (<code>true</code>), depending on the comparison result.</p>
                    <p><b>Between an instant vector and a scalar</b>, these operators are applied to the value of every data sample in the vector, and vector elements between which the comparison result is <code>false</code> get dropped from the result vector. If the <code>bool</code> modifier is provided, vector elements that would be dropped instead have the value <code>0</code> and vector elements that would be kept have the value <code>1</code>. The metric name is dropped if the <code>bool</code> modifier is provided.</p>
                    <p><b>Between two instant vectors</b>, these operators behave as a filter by default, applied to matching entries. Vector elements for which the expression is not true or which do not find a match on the other side of the expression get dropped from the result, while the others are propagated into a result vector with the grouping labels becoming the output label set. If the <code>bool</code> modifier is provided, vector elements that would have been dropped instead have the value <code>0</code> and vector elements that would be kept have the value <code>1</code>, with the grouping labels again becoming the output label set. The metric name is dropped if the <code>bool</code> modifier is provided.</p>
                  </div>
                </div>
                <!-- Logical/set binary operators -->
                <div class="introduce-view__content">
                  <h2 id="Logical-binary-operators">Logical/set binary operators</h2>
                  <div class="introduce-view__content-label">
                    <p>These logical/set binary operators are only defined between instant vectors:</p>
                    <ul>
                      <li><code>and</code> (intersection)</li>
                      <li><code>or</code> (union)</li>
                      <li><code>unless</code> (complement)</li>
                    </ul>
                    <p><code>vector1 and vector2</code> results in a vector consisting of the elements of <code>vector1</code> for which there are elements in <code>vector2</code> with exactly matching label sets. Other elements are dropped. The metric name and values are carried over from the left-hand side vector.</p>
                    <p><code>vector1 or vector2</code> results in a vector that contains all original elements (label sets + values) of <code>vector1</code> and additionally all elements of <code>vector2</code> which do not have matching label sets in <code>vector1</code>.</p>
                    <p><code>vector1 unless vector2</code> results in a vector consisting of the elements of <code>vector1</code> for which there are no elements in <code>vector2</code> with exactly matching label sets. All matching elements in both vectors are dropped.</p>
                  </div>
                </div>
                <!-- Vector matching -->
                <h1 class="page-header-two" id="vector-matching">Vector matching</h1>
                 <div class="introduce-view__content">
                  <div class="introduce-view__content-label">
                    <p>Operations between vectors attempt to find a matching element in the right-hand side vector for each entry in the left-hand side. There are two basic types of matching behavior: One-to-one and many-to-one/one-to-many.</p>
                  </div>
                </div>
                <!-- Vector matching keywords -->
                 <div class="introduce-view__content">
                  <h2 id="vector-matching-keywords">Vector matching keywords</h2>
                  <div class="introduce-view__content-label">
                    <p>These vector matching keywords allow for matching between series with different label sets providing:</p>
                    <ul>
                      <li><code>on</code></li>
                      <li><code>ignoring</code></li>
                    </ul>
                    <p>Label lists provided to matching keywords will determine how vectors are combined. Examples can be found in <b style="color: #3C92F1" @click="jumpClick('#one-to-one-vector-matches')" class="log-link">One-to-one vector matches</b> and in <b style="color: #3C92F1" @click="jumpClick('#many-to-one')" class="log-link">Many-to-one and one-to-many vector matches</b></p>
                  </div>
                </div>
                <!-- Group modifiers -->
                 <div class="introduce-view__content">
                  <h2 id="group-modifiers">Group modifiers</h2>
                  <div class="introduce-view__content-label">
                    <p>These group modifiers enable many-to-one/one-to-many vector matching:</p>
                    <ul>
                      <li><code>group_left</code></li>
                      <li><code>group_right</code></li>
                    </ul>
                    <p>Label lists can be provided to the group modifier which contain labels from the "one"-side to be included in the result metrics.</p>
                    <p style="font-style:italic;">Many-to-one and one-to-many matching are advanced use cases that should be carefully considered. Often a proper use of <code>ignoring(&lt;labels&gt;)</code> provides the desired outcome.</p>
                    <p style="font-style:italic;">Grouping modifiers can only be used for <b style="color: #3C92F1" @click="jumpClick('#comparison-binary-operators')" class="log-link">comparison</b> and <b style="color: #3C92F1" @click="jumpClick('#arithmetic-binary-operators')" class="log-link">arithmetic</b>. Operations as <code>and</code>, <code>unless</code> and <code>or</code> operations match with all possible entries in the right vector by default.</p>
                  </div>
                </div>
                <!-- One-to-one vector matches -->
               <div class="introduce-view__content">
                  <h2 id="one-to-one-vector-matches">One-to-one vector matches</h2>
                  <div class="introduce-view__content-label">
                    <p><b>One-to-one</b> finds a unique pair of entries from each side of the operation. In the default case, that is an operation following the format <code>vector1 &lt;operator&gt; vector2</code>. Two entries match if they have the exact same set of labels and corresponding values. The <code>ignoring</code> keyword allows ignoring certain labels when matching, while the <code>on</code> keyword allows reducing the set of considered labels to a provided list:</p>
                    <pre>&lt;vector expr&gt; &lt;bin-op&gt; ignoring(&lt;label list&gt;) &lt;vector expr&gt;
&lt;vector expr&gt; &lt;bin-op&gt; on(&lt;label list&gt;) &lt;vector expr&gt;</pre>
                    <p>Example input:</p>
                    <pre>method_code:http_errors:rate5m{method="get", code="500"}  24
method_code:http_errors:rate5m{method="get", code="404"}  30
method_code:http_errors:rate5m{method="put", code="501"}  3
method_code:http_errors:rate5m{method="post", code="500"} 6
method_code:http_errors:rate5m{method="post", code="404"} 21

method:http_requests:rate5m{method="get"}  600
method:http_requests:rate5m{method="del"}  34
method:http_requests:rate5m{method="post"} 120</pre>
                    <p>Example query:</p>
                    <pre>method_code:http_errors:rate5m{code="500"} / ignoring(code) method:http_requests:rate5m</pre>
                    <p>This returns a result vector containing the fraction of HTTP requests with status code of 500 for each method, as measured over the last 5 minutes. Without <code>ignoring(code)</code> there would have been no match as the metrics do not share the same set of labels. The entries with methods <code>put</code> and <code>del</code> have no match and will not show up in the result:</p>
                    <pre>{method="get"}  0.04            //  24 / 600
{method="post"} 0.05            //   6 / 120</pre>
                  </div>
                </div>
                <!-- Many-to-one and one-to-many vector matches -->
                 <div class="introduce-view__content">
                  <h2 id="many-to-one">Many-to-one and one-to-many vector matches</h2>
                  <div class="introduce-view__content-label">
                    <p><b>Many-to-one</b> and <b>one-to-many</b> matchings refer to the case where each vector element on the "one"-side can match with multiple elements on the "many"-side. This has to be explicitly requested using the <code>group_left</code> or <code>group_right</code> modifiers, where left/right determines which vector has the higher cardinality.</p>
                    <pre>&lt;vector expr> &lt;bin-op&gt; ignoring(&lt;label list&gt;) group_left(&lt;label list&gt;) &lt;vector expr&gt;
&lt;vector expr&gt; &lt;bin-op&gt; ignoring(&lt;label list&gt;) group_right(&lt;label list&gt;) &lt;vector expr&gt;
&lt;vector expr&gt; &lt;bin-op&gt; on(&lt;label list&gt;) group_left(&lt;label list&gt;) &lt;vector expr&gt;
&lt;vector expr&gt; &lt;bin-op&gt; on(&lt;label list&gt;) group_right(&lt;label list&gt;) &lt;vector expr&gt;</pre>
                    <p>The label list provided with the group modifier contains additional labels from the "one"-side to be included in the result metrics. For <code>on</code> a label can only appear in one of the lists. Every time series of the result vector must be uniquely identifiable.</p>
                    <p>Example query:</p>
                    <pre>method_code:http_errors:rate5m / ignoring(code) group_left method:http_requests:rate5m</pre>
                    <p>In this case the left vector contains more than one entry per <code>method</code> label value. Thus, we indicate this using <code>group_left</code>. The elements from the right side are now matched with multiple elements with the same <code>method</code> label on the left:</p>
                    <pre>{method="get", code="500"}  0.04            //  24 / 600
{method="get", code="404"}  0.05            //  30 / 600
{method="post", code="500"} 0.05            //   6 / 120
{method="post", code="404"} 0.175           //  21 / 120</pre>
                  </div>
                </div>
                <!-- Aggregation operators -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="aggregation-operators">Aggregation operators</h1>
                  <div class="introduce-view__content-label">
                    <p>Prometheus supports the following built-in aggregation operators that can be used to aggregate the elements of a single instant vector, resulting in a new vector of fewer elements with aggregated values:</p>
                    <ul>
                      <li><code>sum</code> (calculate sum over dimensions)</li>
                      <li><code>min</code> (select minimum over dimensions)</li>
                      <li><code>max</code> (select maximum over dimensions)</li>
                      <li><code>avg</code> (calculate the average over dimensions)</li>
                      <li><code>group</code> (all values in the resulting vector are 1)</li>
                      <li><code>stddev</code> (calculate population standard deviation over dimensions)</li>
                      <li><code>stdvar</code> (calculate population standard variance over dimensions)</li>
                      <li><code>count</code> (count number of elements in the vector)</li>
                      <li><code>count_values</code> (count number of elements with the same value)</li>
                      <li><code>bottomk</code> (smallest k elements by sample value)</li>
                      <li><code>topk</code> (largest k elements by sample value)</li>
                      <li><code>quantile</code> (calculate φ-quantile (0 ≤ φ ≤ 1) over dimensions)</li>
                    </ul>
                    <p>These operators can either be used to aggregate over <b>all</b> label dimensions or preserve distinct dimensions by including a <code>without</code> or <code>by</code> clause. These clauses may be used before or after the expression.</p>
                    <pre>&lt;aggr-op&gt; [without|by (&lt;label list&gt;)] ([parameter,] &lt;vector expression&gt;)</pre>
                    <p>or</p>
                    <pre>&lt;aggr-op&gt;([parameter,] &lt;vector expression&gt;) [without|by (&lt;label list&gt;)]</pre>
                    <p><code>label list</code> is a list of unquoted labels that may include a trailing comma, i.e. both <code>(label1, label2)</code> and <code>(label1, label2,)</code> are valid syntax.</p>
                    <p><code>without</code> removes the listed labels from the result vector, while all other labels are preserved in the output. <code>by</code> does the opposite and drops labels that are not listed in the <code>by</code> clause, even if their label values are identical between all elements of the vector.</p>
                    <p><code>parameter</code> is only required for <code>count_values</code>, <code>quantile</code>, <code>topk</code> and <code>bottomk</code>.</p>
                    <p><code>count_values</code> outputs one time series per unique sample value. Each series has an additional label. The name of that label is given by the aggregation parameter, and the label value is the unique sample value. The value of each time series is the number of times that sample value was present.</p>
                    <p><code>topk</code> and <code>bottomk</code> are different from other aggregators in that a subset of the input samples, including the original labels, are returned in the result vector. <code>by</code> and <code>without</code> are only used to bucket the input vector.</p>
                    <p><code>quantile</code> calculates the φ-quantile, the value that ranks at number φ*N among the N metric values of the dimensions aggregated over. φ is provided as the aggregation parameter. For example, <code>quantile(0.5, ...)</code> calculates the median, <code>quantile(0.95, ...)</code> the 95th percentile. For φ = <code>NaN</code>, <code>NaN</code> is returned. For φ &lt; 0, -Inf is returned. For φ > 1, <code>+Inf</code> is returned.</p>
                    <p>Example:</p>
                    <p>If the metric <code>http_requests_total</code> had time series that fan out by <code>application</code>, <code>instance</code>, and <code>group</code> labels, we could calculate the total number of seen HTTP requests per application and group over all instances via:</p>
                    <pre>sum without (instance) (http_requests_total)</pre>
                    <p>Which is equivalent to:</p>
                    <pre> sum by (application, group) (http_requests_total)</pre>
                    <p>If we are just interested in the total of HTTP requests we have seen in <b>all</b> applications, we could simply write:</p>
                    <pre>sum(http_requests_total)</pre>
                    <p>To count the number of binaries running each build version we could write:</p>
                    <pre>count_values("version", build_version)</pre>
                    <p>To get the 5 largest HTTP requests counts across all instances we could write:</p>
                    <pre>topk(5, http_requests_total)</pre>
                  </div>
                </div>
                <!-- Binary operator precedence -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="binary-operator-precedence">Binary operator precedence</h1>
                  <div class="introduce-view__content-label binary-operator-precedence">
                    <p>The following list shows the precedence of binary operators in Prometheus, from highest to lowest.</p>
                    <ul>
                      <li><code>^</code></li>
                      <li><code>*</code>, <code>/</code>, <code>%</code>, <code>atan2</code></li>
                      <li><code>+</code>, <code>-</code></li>
                      <li><code>==</code>, <code>!=</code>, <code>&lt;=</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&gt;</code></li>
                      <li><code>and</code>, <code>unless</code></li>
                      <li><code>or</code></li>
                    </ul>
                    <p>Operators on the same precedence level are left-associative. For example, <code>2 * 3 % 2</code> is equivalent to <code>(2 * 3) % 2</code>. However <code>^</code> is right associative, so <code>2 ^ 3 ^ 2</code> is equivalent to <code>2 ^ (3 ^ 2)</code>.</p>
                  </div>
                </div>
                <!-- FUNCTIONS -->
                <h1 class="page-header-one" id="functions">Functions</h1>
                 <div class="introduce-view__content">
                  <div class="introduce-view__content-label">
                    <p>Some functions have default arguments, e.g. <code>year(v=vector(time()) instant-vector)</code>. This means that there is one argument v which is an instant vector, which if not provided it will default to the value of the expression <code>vector(time())</code>.</p>
                  </div>
                </div>
                <!-- abs() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-abs">abs()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>abs(v instant-vector)</code> returns the input vector with all sample values converted to their absolute value.</p>
                  </div>
                </div>
                <!-- absent() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-absent">absent()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>absent(v instant-vector)</code> returns an empty vector if the vector passed to it has any elements and a 1-element vector with the value 1 if the vector passed to it has no elements.</p>
                    <p>This is useful for alerting on when no time series exist for a given metric name and label combination.</p>
                    <pre>absent(nonexistent{job="myjob"})
# => {job="myjob"}

absent(nonexistent{job="myjob",instance=~".*"})
# => {job="myjob"}

absent(sum(nonexistent{job="myjob"}))
# => {}</pre>
                    <p>In the first two examples, <code>absent()</code> tries to be smart about deriving labels of the 1-element output vector from the input vector.</p>
                  </div>
                </div>
                 <!-- absent_over_time() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-absent_over_time">absent_over_time()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>absent_over_time(v range-vector)</code> returns an empty vector if the range vector passed to it has any elements and a 1-element vector with the value 1 if the range vector passed to it has no elements.</p>
                    <p>This is useful for alerting on when no time series exist for a given metric name and label combination for a certain amount of time.</p>
                    <pre>absent_over_time(nonexistent{job="myjob"}[1h])
# => {job="myjob"}

absent_over_time(nonexistent{job="myjob",instance=~".*"}[1h])
# => {job="myjob"}

absent_over_time(sum(nonexistent{job="myjob"})[1h:])
# => {}</pre>
                    <p>In the first two examples, <code>absent_over_time()</code> tries to be smart about deriving labels of the 1-element output vector from the input vector.</p>
                  </div>
                </div>
                 <!-- ceil() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-ceil">ceil()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>ceil(v instant-vector)</code> rounds the sample values of all elements in <code>v</code> up to the nearest integer.</p>
                  </div>
                </div>
                 <!-- changes() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-changes">changes()</h1>
                  <div class="introduce-view__content-label">
                    <p>For each input time series, <code>changes(v range-vector)</code> returns the number of times its value has changed within the provided time range as an instant vector.</p>
                  </div>
                </div>
                 <!-- clamp() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-clamp">clamp()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>clamp(v instant-vector, min scalar, max scalar)</code> clamps the sample values of all elements in <code>v</code> to have a lower limit of <code>min</code> and an upper limit of <code>max</code>.</p>
                    <p>Special cases: - Return an empty vector if <code>min > max</code> - Return <code>NaN</code> if <code>min</code> or <code>max</code> is <code>NaN</code></p>
                  </div>
                </div>
                 <!-- clamp_max() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-clamp_max">clamp_max()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>clamp_max(v instant-vector, max scalar)</code> clamps the sample values of all elements in <code>v</code> to have an upper limit of <code>max</code>.</p>
                  </div>
                </div>
                 <!-- clamp_min() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-clamp_min">clamp_min()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>clamp_min(v instant-vector, min scalar)</code> clamps the sample values of all elements in <code>v</code> to have a lower limit of <code>min</code>.</p>
                  </div>
                </div>
                 <!-- day_of_month() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-day_of_month">day_of_month()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>day_of_month(v=vector(time()) instant-vector)</code> returns the day of the month for each of the given times in UTC. Returned values are from 1 to 31.</p>
                  </div>
                </div>
                 <!-- day_of_week() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-day_of_week">day_of_week()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>day_of_week(v=vector(time()) instant-vector)</code> returns the day of the week for each of the given times in UTC. Returned values are from 0 to 6, where 0 means Sunday etc.</p>
                  </div>
                </div>
                 <!-- day_of_year() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-day_of_year">day_of_year()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>day_of_year(v=vector(time()) instant-vector)</code> returns the day of the year for each of the given times in UTC. Returned values are from 1 to 365 for non-leap years, and 1 to 366 in leap years.</p>
                  </div>
                </div>
                 <!-- days_in_month() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-days_in_month">days_in_month()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>days_in_month(v=vector(time()) instant-vector)</code> returns number of days in the month for each of the given times in UTC. Returned values are from 28 to 31.</p>
                  </div>
                </div>
                 <!-- delta() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-delta">delta()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>delta(v range-vector)</code> calculates the difference between the first and last value of each time series element in a range vector <code>v</code>, returning an instant vector with the given deltas and equivalent labels. The delta is extrapolated to cover the full time range as specified in the range vector selector, so that it is possible to get a non-integer result even if the sample values are all integers.</p>
                    <p>The following example expression returns the difference in CPU temperature between now and 2 hours ago:</p>
                    <pre>delta(cpu_temp_celsius{host="zeus"}[2h])</pre>
                    <p><code>delta</code> should only be used with gauges.</p>
                  </div>
                </div>
                 <!-- deriv() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-deriv">deriv()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>deriv(v range-vector)</code> calculates the per-second derivative of the time series in a range vector <code>v</code>, using simple linear regression. The range vector must have at least two samples in order to perform the calculation. When <code>+Inf</code> or <code>-Inf</code> are found in the range vector, the slope and offset value calculated will be <code>NaN</code>.</p>
                    <p><code>deriv</code> should only be used with gauges.</p>
                  </div>
                </div>
                 <!-- exp() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-exp">exp()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>exp(v instant-vector)</code> calculates the exponential function for all elements in <code>v</code>. Special cases are:</p>
                    <ul>
                      <li><code>Exp(+Inf) = +Inf</code></li>
                      <li><code>Exp(NaN) = NaN</code></li>
                    </ul>
                  </div>
                </div>
                 <!-- floor() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-floor">floor()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>floor(v instant-vector)</code> rounds the sample values of all elements in <code>v</code> down to the nearest integer.</p>
                  </div>
                </div>
                 <!-- histogram_quantile() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-histogram_quantile">histogram_quantile()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>histogram_quantile(φ scalar, b instant-vector)</code> calculates the φ-quantile (0 ≤ φ ≤ 1) from the buckets <code>b</code> of a histogram. (See histograms and summaries for a detailed explanation of φ-quantiles and the usage of the histogram metric type in general.) The samples in b are the counts of observations in each bucket. Each sample must have a label <code>le</code> where the label value denotes the inclusive upper bound of the bucket. (Samples without such a label are silently ignored.) The histogram metric type automatically provides time series with the <code>_bucket</code> suffix and the appropriate labels.</p>
                    <p>Use the <code>rate()</code> function to specify the time window for the quantile calculation.</p>
                    <p>Example: A histogram metric is called <code>http_request_duration_seconds</code>. To calculate the 90th percentile of request durations over the last 10m, use the following expression:</p>
                    <pre>histogram_quantile(0.9, rate(http_request_duration_seconds_bucket[10m]))</pre>
                    <p>The quantile is calculated for each label combination in <code>http_request_duration_seconds</code>. To aggregate, use the <code>sum()</code> aggregator around the <code>rate()</code> function. Since the <code>le</code> label is required by <code>histogram_quantile()</code>, it has to be included in the <code>by</code> clause. The following expression aggregates the 90th percentile by <code>job</code>:</p>
                    <pre>histogram_quantile(0.9, sum by (job, le) (rate(http_request_duration_seconds_bucket[10m])))</pre>
                    <p>To aggregate everything, specify only the <code>le</code> label:</p>
                    <pre>histogram_quantile(0.9, sum by (le) (rate(http_request_duration_seconds_bucket[10m])))</pre>
                    <p>The <code>histogram_quantile()</code> function interpolates quantile values by assuming a linear distribution within a bucket. The highest bucket must have an upper bound of <code>+Inf</code>. (Otherwise, <code>NaN</code> is returned.) If a quantile is located in the highest bucket, the upper bound of the second highest bucket is returned. A lower limit of the lowest bucket is assumed to be 0 if the upper bound of that bucket is greater than 0. In that case, the usual linear interpolation is applied within that bucket. Otherwise, the upper bound of the lowest bucket is returned for quantiles located in the lowest bucket.</p>
                    <p>If <code>b</code> has 0 observations, <code>NaN</code> is returned. If <code>b</code> contains fewer than two buckets, <code>NaN</code> is returned. For φ < 0, <code>-Inf</code> is returned. For φ > 1, <code>+Inf</code> is returned. For φ = <code>NaN</code>, <code>NaN</code> is returned.</p>
                  </div>
                </div>
                 <!-- holt_winters() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-holt_winters">holt_winters()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>holt_winters(v range-vector, sf scalar, tf scalar)</code> produces a smoothed value for time series based on the range in <code>v</code>. The lower the smoothing factor <code>sf</code>, the more importance is given to old data. The higher the trend factor <code>tf</code>, the more trends in the data is considered. Both <code>sf</code> and tf must be between 0 and 1.</p>
                    <p><code>holt_winters</code> should only be used with gauges.</p>
                  </div>
                </div>
                 <!-- hour() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-hour">hour()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>hour(v=vector(time()) instant-vector)</code> returns the hour of the day for each of the given times in UTC. Returned values are from 0 to 23.</p>
                  </div>
                </div>
                 <!-- idelta() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-idelta">idelta()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>idelta(v range-vector)</code> calculates the difference between the last two samples in the range vector <code>v</code>, returning an instant vector with the given deltas and equivalent labels.</p>
                    <p><code>idelta</code> should only be used with gauges.</p>
                  </div>
                </div>
                 <!-- increase() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-increase">increase()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>increase(v range-vector)</code> calculates the increase in the time series in the range vector. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for. The increase is extrapolated to cover the full time range as specified in the range vector selector, so that it is possible to get a non-integer result even if a counter increases only by integer increments.</p>
                    <p>The following example expression returns the number of HTTP requests as measured over the last 5 minutes, per time series in the range vector:</p>
                    <pre>increase(http_requests_total{job="api-server"}[5m])</pre>
                    <p><code>increase</code> should only be used with counters. It is syntactic sugar for <code>rate(v)</code> multiplied by the number of seconds under the specified time range window, and should be used primarily for human readability. Use <code>rate</code> in recording rules so that increases are tracked consistently on a per-second basis.</p>
                  </div>
                </div>
                 <!-- irate() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-irate">irate()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>irate(v range-vector)</code> calculates the per-second instant rate of increase of the time series in the range vector. This is based on the last two data points. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for.</p>
                    <p>The following example expression returns the per-second rate of HTTP requests looking up to 5 minutes back for the two most recent data points, per time series in the range vector:</p>
                    <pre>irate(http_requests_total{job="api-server"}[5m])</pre>
                    <p><code>irate</code> should only be used when graphing volatile, fast-moving counters. Use <code>rate</code> for alerts and slow-moving counters, as brief changes in the rate can reset the <code>FOR</code> clause and graphs consisting entirely of rare spikes are hard to read.</p>
                    <p>Note that when combining <code>irate()</code> with an aggregation operator (e.g. <code>sum()</code>) or a function aggregating over time (any function ending in <code>_over_time</code>), always take a <code>irate()</code> first, then aggregate. Otherwise <code>irate()</code> cannot detect counter resets when your target restarts.</p>
                  </div>
                </div>
                 <!-- label_join() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-label_join">label_join()</h1>
                  <div class="introduce-view__content-label">
                    <p>For each timeseries in <code>v</code>, <code>label_join(v instant-vector, dst_label string, separator string, src_label_1 string, src_label_2 string, ...)</code> joins all the values of all the <code>src_labels</code> using <code>separator</code> and returns the timeseries with the label <code>dst_label</code> containing the joined value. There can be any number of <code>src_labels</code> in this function.</p>
                    <p>This example will return a vector with each time series having a <code>foo</code> label with the value <code>a,b,c</code> added to it:</p>
                    <pre>label_join(up{job="api-server",src1="a",src2="b",src3="c"}, "foo", ",", "src1", "src2", "src3")</pre>
                  </div>
                </div>
                 <!-- label_replace() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-label_replace">label_replace()</h1>
                  <div class="introduce-view__content-label">
                    <p>For each timeseries in <code>v</code>, <code>label_replace(v instant-vector, dst_label string, replacement string, src_label string, regex string)</code> matches the regular expression <code>regex</code> against the value of the label <code>src_label</code>. If it matches, the value of the label <code>dst_label</code> in the returned timeseries will be the expansion of <code>replacement</code>, together with the original labels in the input. Capturing groups in the regular expression can be referenced with <code>$1</code>, <code>$2</code>, etc. If the regular expression doesn't match then the timeseries is returned unchanged.</p>
                    <p>This example will return timeseries with the values <code>a:c</code> at label <code>service</code> and <code>a</code> at label <code>foo</code>:</p>
                    <pre>label_replace(up{job="api-server",service="a:c"}, "foo", "$1", "service", "(.*):.*")</pre>
                  </div>
                </div>
                 <!-- ln() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-ln">ln()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>ln(v instant-vector)</code> calculates the natural logarithm for all elements in <code>v</code>. Special cases are:</p>
                    <ul>
                      <li><code>ln(+Inf) = +Inf</code></li>
                      <li><code>ln(0) = -Inf</code></li>
                      <li><code>ln(x &lt; 0) = NaN</code></li>
                      <li><code>ln(NaN) = NaN</code></li>
                    </ul>
                  </div>
                </div>
                 <!-- log2() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-log2">log2()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>log2(v instant-vector)</code> calculates the binary logarithm for all elements in <code>v</code>. The special cases are equivalent to those in <code>ln</code>.</p>
                  </div>
                </div>
                 <!-- log10() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-log10">log10()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>log10(v instant-vector)</code> calculates the decimal logarithm for all elements in <code>v</code>. The special cases are equivalent to those in <code>ln</code>.</p>
                  </div>
                </div>
                 <!-- minute() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-minute">minute()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>minute(v=vector(time()) instant-vector)</code> returns the minute of the hour for each of the given times in UTC. Returned values are from 0 to 59.</p>
                  </div>
                </div>
                 <!-- month() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-month">month()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>month(v=vector(time()) instant-vector)</code> returns the month of the year for each of the given times in UTC. Returned values are from 1 to 12, where 1 means January etc.</p>
                  </div>
                </div>
                 <!-- predict_linear() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-predict_linear">predict_linear()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>predict_linear(v range-vector, t scalar)</code> predicts the value of time series <code>t</code> seconds from now, based on the range vector <code>v</code>, using simple linear regression. The range vector must have at least two samples in order to perform the calculation. When <code>+Inf</code> or <code>-Inf</code> are found in the range vector, the slope and offset value calculated will be <code>NaN</code>.</p>
                    <p><code>predict_linear</code> should only be used with gauges.</p>
                  </div>
                </div>
                 <!-- rate() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-rate">rate()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>rate(v range-vector)</code> calculates the per-second average rate of increase of the time series in the range vector. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for. Also, the calculation extrapolates to the ends of the time range, allowing for missed scrapes or imperfect alignment of scrape cycles with the range's time period.</p>
                    <p>The following example expression returns the per-second rate of HTTP requests as measured over the last 5 minutes, per time series in the range vector:</p>
                    <pre>rate(http_requests_total{job="api-server"}[5m])</pre>
                    <p><code>rate</code> should only be used with counters. It is best suited for alerting, and for graphing of slow-moving counters.</p>
                    <p>Note that when combining <code>rate()</code> with an aggregation operator (e.g. <code>sum()</code>) or a function aggregating over time (any function ending in <code>_over_time</code>), always take a <code>rate()</code> first, then aggregate. Otherwise <code>rate()</code> cannot detect counter resets when your target restarts.</p>
                  </div>
                </div>
                 <!-- resets() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-resets">resets()</h1>
                  <div class="introduce-view__content-label">
                    <p>For each input time series, <code>resets(v range-vector)</code> returns the number of counter resets within the provided time range as an instant vector. Any decrease in the value between two consecutive samples is interpreted as a counter reset.</p>
                    <p><code>resets</code> should only be used with counters.</p>
                  </div>
                </div>
                 <!-- round() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-round">round()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>round(v instant-vector, to_nearest=1 scalar)</code> rounds the sample values of all elements in <code>v</code> to the nearest integer. Ties are resolved by rounding up. The optional <code>to_nearest</code> argument allows specifying the nearest multiple to which the sample values should be rounded. This multiple may also be a fraction.</p>
                  </div>
                </div>
                 <!-- scalar() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-scalar">scalar()</h1>
                  <div class="introduce-view__content-label">
                    <p>Given a single-element input vector, <code>scalar(v instant-vector)</code> returns the sample value of that single element as a scalar. If the input vector does not have exactly one element, <code>scalar</code> will return <code>NaN</code>.</p>
                  </div>
                </div>
                 <!-- sgn() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-sgn">sgn()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>sgn(v instant-vector)</code> returns a vector with all sample values converted to their sign, defined as this: 1 if v is positive, -1 if v is negative and 0 if v is equal to zero.</p>
                  </div>
                </div>
                 <!-- sort() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-sort">sort()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>sort(v instant-vector)</code> returns vector elements sorted by their sample values, in ascending order.</p>
                  </div>
                </div>
                 <!-- sort_desc() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-sort_desc">sort_desc()</h1>
                  <div class="introduce-view__content-label">
                    <p>Same as <code>sort</code>, but sorts in descending order.</p>
                  </div>
                </div>
                <!-- sqrt() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-sqrt">sqrt()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>sqrt(v instant-vector)</code> calculates the square root of all elements in <code>v</code>.</p>
                  </div>
                </div>
                <!-- time() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-time">time()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>time()</code> returns the number of seconds since January 1, 1970 UTC. Note that this does not actually return the current time, but the time at which the expression is to be evaluated.</p>
                  </div>
                </div>
                <!-- timestamp() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-timestamp">timestamp()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>timestamp(v instant-vector)</code> returns the timestamp of each of the samples of the given vector as the number of seconds since January 1, 1970 UTC.</p>
                  </div>
                </div>
                <!-- vector() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-vector">vector()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>vector(s scalar)</code> returns the scalar <code>s</code> as a vector with no labels.</p>
                  </div>
                </div>
                <!-- year() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-year">year()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>year(v=vector(time()) instant-vector)</code> returns the year for each of the given times in UTC.</p>
                  </div>
                </div>
                <!-- <aggregation>_over_time() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-aggregation">&lt;aggregation&gt;_over_time()</h1>
                  <div class="introduce-view__content-label">
                    <p>The following functions allow aggregating each series of a given range vector over time and return an instant vector with per-series aggregation results:</p>
                    <ul>
                      <li><code>avg_over_time(range-vector):</code> the average value of all points in the specified interval.</li>
                      <li><code>min_over_time(range-vector):</code> the minimum value of all points in the specified interval.</li>
                      <li><code>max_over_time(range-vector):</code> the maximum value of all points in the specified interval.</li>
                      <li><code>sum_over_time(range-vector):</code> the sum of all values in the specified interval.</li>
                      <li><code>count_over_time(range-vector):</code> the count of all values in the specified interval.</li>
                      <li><code>quantile_over_time(scalar, range-vector):</code> the φ-quantile (0 ≤ φ ≤ 1) of the values in the specified interval.</li>
                      <li><code>stddev_over_time(range-vector):</code> the population standard deviation of the values in the specified interval.</li>
                      <li><code>stdvar_over_time(range-vector):</code> the population standard variance of the values in the specified interval.</li>
                      <li><code>last_over_time(range-vector):</code> the most recent point value in specified interval.</li>
                      <li><code>present_over_time(range-vector):</code> the value 1 for any series in the specified interval.</li>
                    </ul>
                    <p>Note that all values in the specified interval have the same weight in the aggregation even if the values are not equally spaced throughout the interval.</p>
                  </div>
                </div>
                <!-- Trigonometric Functions -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-trigonometric">Trigonometric Functions</h1>
                  <div class="introduce-view__content-label">
                    <p>The trigonometric functions work in radians:</p>
                    <ul>
                      <li><code>acos(v instant-vector):</code> calculates the arccosine of all elements in v (special cases).</li>
                      <li><code>acosh(v instant-vector):</code> calculates the inverse hyperbolic cosine of all elements in v (special cases).</li>
                      <li><code>asin(v instant-vector):</code> calculates the arcsine of all elements in v (special cases).</li>
                      <li><code>asinh(v instant-vector):</code> calculates the inverse hyperbolic sine of all elements in v (special cases).</li>
                      <li><code>atan(v instant-vector):</code> calculates the arctangent of all elements in v (special cases).</li>
                      <li><code>atanh(v instant-vector):</code> calculates the inverse hyperbolic tangent of all elements in v (special cases).</li>
                      <li><code>cos(v instant-vector):</code> calculates the cosine of all elements in v (special cases).</li>
                      <li><code>cosh(v instant-vector):</code> calculates the hyperbolic cosine of all elements in v (special cases).</li>
                      <li><code>sin(v instant-vector):</code> calculates the sine of all elements in v (special cases).</li>
                      <li><code>sinh(v instant-vector):</code> calculates the hyperbolic sine of all elements in v (special cases).</li>
                      <li><code>tan(v instant-vector):</code> calculates the tangent of all elements in v (special cases).</li>
                      <li><code>tanh(v instant-vector):</code> calculates the hyperbolic tangent of all elements in v (special cases).</li>
                    </ul>
                    <p>The following are useful for converting between degrees and radians:</p>
                    <ul>
                      <li><code>deg(v instant-vector)</code>: converts radians to degrees for all elements in <code>v</code>.</li>
                      <li><code>pi()</code>: returns pi.</li>
                      <li><code>rad(v instant-vector)</code>: converts degrees to radians for all elements in <code>v</code>.</li>
                    </ul>
                  </div>
                </div>
                <!-- QUERY EXAMPLES -->
                <h1 class="page-header-one" id="query-examples">Query examples</h1>
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="simple-time-series-selection">Simple time series selection</h1>
                  <div class="introduce-view__content-label">
                    <p>Return all time series with the metric <code>http_requests_total</code>:</p>
                    <pre>http_requests_total</pre>
                    <p>Return all time series with the metric <code>http_requests_total</code> and the given <code>job</code> and <code>handler</code> labels:</p>
                    <pre>http_requests_total{job="apiserver", handler="/api/comments"}</pre>
                    <p>Return a whole range of time (in this case 5 minutes up to the query time) for the same vector, making it a <b style="color: #3C92F1" @click="jumpClick('#range-vector-selectors')" class="log-link">range vector</b>:</p>
                    <pre>http_requests_total{job="apiserver", handler="/api/comments"}[5m]</pre>
                    <p>Note that an expression resulting in a range vector cannot be graphed directly, but viewed in the tabular ("Console") view of the expression browser.</p>
                    <p>Using regular expressions, you could select time series only for jobs whose name match a certain pattern, in this case, all jobs that end with <code>server</code>:</p>
                    <pre>http_requests_total{job=~".*server"}</pre>
                    <p>All regular expressions in Prometheus use RE2 syntax.</p>
                    <p>To select all HTTP status codes except 4xx ones, you could run:</p>
                    <pre>http_requests_total{status!~"4.."}</pre>
                  </div>
                </div>
                <!-- Subquery -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="query-examples-subquery">Subquery</h1>
                  <div class="introduce-view__content-label">
                    <p>Return the 5-minute rate of the <code>http_requests_total</code> metric for the past 30 minutes, with a resolution of 1 minute.</p>
                    <pre>rate(http_requests_total[5m])[30m:1m]</pre>
                    <p>This is an example of a nested subquery. The subquery for the <code>deriv</code> function uses the default resolution. Note that using subqueries unnecessarily is unwise.</p>
                    <pre>max_over_time(deriv(rate(distance_covered_total[5s])[30s:5s])[10m:])</pre>
                  </div>
                </div>
                <!-- Using functions, operators, etc. -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="using-functions">Using functions, operators, etc.</h1>
                  <div class="introduce-view__content-label">
                    <p>Return the per-second rate for all time series with the <code>http_requests_total</code> metric name, as measured over the last 5 minutes:</p>
                    <pre>rate(http_requests_total[5m])</pre>
                    <p>Assuming that the <code>http_requests_total</code> time series all have the labels <code>job</code> (fanout by job name) and <code>instance</code> (fanout by instance of the job), we might want to sum over the rate of all instances, so we get fewer output time series, but still preserve the <code>job</code> dimension:</p>
                    <pre>sum by (job) (
  rate(http_requests_total[5m])
)</pre>
                    <p>If we have two different metrics with the same dimensional labels, we can apply binary operators to them and elements on both sides with the same label set will get matched and propagated to the output. For example, this expression returns the unused memory in MiB for every instance (on a fictional cluster scheduler exposing these metrics about the instances it runs):</p>
                    <pre>(instance_memory_limit_bytes - instance_memory_usage_bytes) / 1024 / 1024</pre>
                    <p>The same expression, but summed by application, could be written like this:</p>
                    <pre>sum by (app, proc) (
  instance_memory_limit_bytes - instance_memory_usage_bytes
) / 1024 / 1024</pre>
                    <p>If the same fictional cluster scheduler exposed CPU usage metrics like the following for every instance:</p>
                    <pre>instance_cpu_time_ns{app="lion", proc="web", rev="34d0f99", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="elephant", proc="worker", rev="34d0f99", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="turtle", proc="api", rev="4d3a513", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="fox", proc="widget", rev="4d3a513", env="prod", job="cluster-manager"}
...</pre>
                    <p>...we could get the top 3 CPU users grouped by application (<code>app</code>) and process type (<code>proc</code>) like this:</p>
                    <pre>topk(3, sum by (app, proc) (rate(instance_cpu_time_ns[5m])))</pre>
                    <p>Assuming this metric contains one time series per running instance, you could count the number of running instances per application like this:</p>
                    <pre>count by (app) (instance_cpu_time_ns)</pre>
                  </div>
                </div>
              </div>
             </div>
             <!-- 中文 -->
             <div class="info-room title-heard" v-else>
              <div class="col-md-9 logs-content">
                <!-- promql -->
                <h1 class="page-header" style="margin-Top:0px">PromQL: Prometheus 查询语言<a class="header-anchor" href="https://prometheus.io/docs/prometheus/latest/querying/basics/" rel="noopener noreferrer" target="_blank"><i class="nz-icon nz-icon-link1" style="font-size: 16px;" :title="$t('overall.link')"></i></a></h1>
                <div class="title-heard__divider"></div>
                <!-- catalog 目录 -->
                <div class="catalog">
                  <ul class="catalog-square">
                  <!-- Querying prometheus -->
                  <li>
                    <div @click="jumpClick('#querying-prometheus')"><span>查询 Prometheus</span></div>
                    <ul class="catalog-disc">
                      <li @click="jumpClick('#querying-prometheus-examples')"><span>示例</span></li>
                      <li  @click="jumpClick('#expression-language-data-types')"><span>表达式语言数据类型</span></li>
                      <li>
                        <div @click="jumpClick('#literals')"><span>字面量</span></div>
                         <ul>
                            <li @click="jumpClick('#string-literals')"><span>字符串字面量</span></li>
                            <li @click="jumpClick('#float-literals')"><span>浮点字面量</span></li>
                        </ul>
                      </li>
                       <li>
                        <div @click="jumpClick('#time-series-selectors')"><span>时间序列选择器</span></div>
                         <ul>
                            <li @click="jumpClick('#instant-vector-selectors')"><span>即时向量选择器</span></li>
                            <li @click="jumpClick('#range-vector-selectors')"><span>范围向量选择器</span></li>
                            <li @click="jumpClick('#time-durations')"><span>时间长度</span></li>
                            <li @click="jumpClick('#offset-modifier')"><span>offset 修饰符</span></li>
                            <li @click="jumpClick('#time-series-modifier')"><span>@ 修饰符</span></li>
                        </ul>
                      </li>
                      <li @click="jumpClick('#querying-prometheus-subquery')"><span>子查询</span></li>
                      <li @click="jumpClick('#querying-prometheus-operators')"><span>运算符</span></li>
                      <li @click="jumpClick('#querying-prometheus-functions')"><span>函数</span></li>
                      <li @click="jumpClick('#querying-prometheus-comments')"><span>注释</span></li>
                       <li >
                        <div @click="jumpClick('#querying-prometheus-gotchas')"><span>陷阱</span></div>
                         <ul>
                            <li @click="jumpClick('#gotchas-staleness')"><span>过时</span></li>
                            <li @click="jumpClick('#avoiding-slow-queries-and-overloads')"><span>避免缓慢的查询和过载</span></li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <!-- Operators -->
                  <li>
                    <div @click="jumpClick('#operators')"><span>运算符</span></div>
                    <ul class="catalog-disc">
                      <li>
                        <div @click="jumpClick('#binary-operators')"><span>二进制运算符</span></div>
                         <ul>
                            <li @click="jumpClick('#arithmetic-binary-operators')"><span>二进制算术运算符</span></li>
                            <li @click="jumpClick('#trigonometric-binary-operators')"><span>三角二进制运算符</span></li>
                            <li @click="jumpClick('#comparison-binary-operators')"><span>比较二进制运算符</span></li>
                            <li @click="jumpClick('#Logical-binary-operators')"><span>逻辑/集合二进制运算符</span></li>
                        </ul>
                      </li>
                      <li>
                        <div @click="jumpClick('#vector-matching')"><span>向量匹配</span></div>
                         <ul>
                            <li @click="jumpClick('#vector-matching-keywords')"><span>向量匹配关键词</span></li>
                            <li @click="jumpClick('#group-modifiers')"><span>分组修饰符</span></li>
                            <li @click="jumpClick('#one-to-one-vector-matches')"><span>一对一向量匹配</span></li>
                            <li @click="jumpClick('#many-to-one')"><span>多对一/一对多向量匹配</span></li>
                        </ul>
                      </li>
                      <li @click="jumpClick('#aggregation-operators')"><span>聚合运算符</span></li>
                      <li @click="jumpClick('#binary-operator-precedence')"><span>二进制运算符优先级</span></li>
                    </ul>
                  </li>
                  <!-- Functions -->
                  <li>
                    <div @click="jumpClick('#functions')"><span>函数</span></div>
                    <ul class="catalog-disc">
                      <li @click="jumpClick('#functions-abs')"><span>abs()</span></li>
                      <li @click="jumpClick('#functions-absent')"><span>absent()</span></li>
                      <li @click="jumpClick('#functions-absent_over_time')"><span>absent_over_time()</span></li>
                      <li @click="jumpClick('#functions-ceil')"><span>ceil()</span></li>
                      <li @click="jumpClick('#functions-changes')"><span>changes()</span></li>
                      <li @click="jumpClick('#functions-clamp')"><span>clamp()</span></li>
                      <li @click="jumpClick('#functions-clamp_max')"><span>clamp_max()</span></li>
                      <li @click="jumpClick('#functions-clamp_min')"><span>clamp_min()</span></li>
                      <li @click="jumpClick('#functions-day_of_month')"><span>day_of_month()</span></li>
                      <li @click="jumpClick('#functions-day_of_week')"><span>day_of_week()</span></li>
                      <li @click="jumpClick('#functions-day_of_year')"><span>day_of_year()</span></li>
                      <li @click="jumpClick('#functions-days_in_month')"><span>days_in_month()</span></li>
                      <li @click="jumpClick('#functions-delta')"><span>delta()</span></li>
                      <li @click="jumpClick('#functions-deriv')"><span>deriv()</span></li>
                      <li @click="jumpClick('#functions-exp')"><span>exp()</span></li>
                      <li @click="jumpClick('#functions-floor')"><span>floor()</span></li>
                      <li @click="jumpClick('#functions-histogram_quantile')"><span>histogram_quantile()</span></li>
                      <li @click="jumpClick('#functions-holt_winters')"><span>holt_winters()</span></li>
                      <li @click="jumpClick('#functions-hour')"><span>hour()</span></li>
                      <li @click="jumpClick('#functions-idelta')"><span>idelta()</span></li>
                      <li @click="jumpClick('#functions-increase')"><span>increase()</span></li>
                      <li @click="jumpClick('#functions-irate')"><span>irate()</span></li>
                      <li @click="jumpClick('#functions-label_join')"><span>label_join()</span></li>
                      <li @click="jumpClick('#functions-label_replace')"><span>label_replace()</span></li>
                      <li @click="jumpClick('#functions-ln')"><span>ln()</span></li>
                      <li @click="jumpClick('#functions-log2')"><span>log2()</span></li>
                      <li @click="jumpClick('#functions-log10')"><span>log10()</span></li>
                      <li @click="jumpClick('#functions-minute')"><span>minute()</span></li>
                      <li @click="jumpClick('#functions-month')"><span>month()</span></li>
                      <li @click="jumpClick('#functions-predict_linear')"><span>predict_linear()</span></li>
                      <li @click="jumpClick('#functions-rate')"><span>rate()</span></li>
                      <li @click="jumpClick('#functions-resets')"><span>resets()</span></li>
                      <li @click="jumpClick('#functions-round')"><span>round()</span></li>
                      <li @click="jumpClick('#functions-scalar')"><span>scalar()</span></li>
                      <li @click="jumpClick('#functions-sgn')"><span>sgn()</span></li>
                      <li @click="jumpClick('#functions-sort')"><span>sort()</span></li>
                      <li @click="jumpClick('#functions-sort_desc')"><span>sort_desc()</span></li>
                      <li @click="jumpClick('#functions-sqrt')"><span>sqrt()</span></li>
                      <li @click="jumpClick('#functions-time')"><span>time()</span></li>
                      <li @click="jumpClick('#functions-timestamp')"><span>timestamp()</span></li>
                      <li @click="jumpClick('#functions-vector')"><span>vector()</span></li>
                      <li @click="jumpClick('#functions-year')"><span>year()</span></li>
                      <li @click="jumpClick('#functions-aggregation')"><span>&lt;aggregation&gt;_over_time()</span></li>
                      <li @click="jumpClick('#functions-trigonometric')"><span>三角函数</span></li>
                    </ul>
                  </li>
                  <!-- QUERY EXAMPLES -->
                  <li>
                    <div @click="jumpClick('#query-examples')"><span>查询示例</span></div>
                    <ul class="catalog-disc">
                      <li @click="jumpClick('#simple-time-series-selection')"><span>简单的时间序列选择</span></li>
                      <li @click="jumpClick('#query-examples-subquery')"><span>Subquery 子查询</span></li>
                      <li @click="jumpClick('#using-functions')"><span>使用函数、运算符等</span></li>
                    </ul>
                  </li>
                  </ul>
                </div>
                <!-- QUERYING PROMETHEUS -->
                <!-- start -->
                <div class="introduce-view__content">
                  <h1 class="page-header-one" id="querying-prometheus">查询 Prometheus</h1>
                  <p>Prometheus 提供一种名为 PromQL（Prometheus Query Language）的函数式查询语言，允许用户实时选择和聚合时间序列数据。表达式的结果可以显示为图形，也可以作为表格数据在 Prometheus 表达式浏览器中查看，或通过 HTTP API 由外部系统使用。</p>
                </div>
                <!-- Examples -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="querying-prometheus-examples">示例</h1>
                  <p>本文件可作为参考。首先了解一些 <b style="color: #3C92F1" @click="jumpClick('#query-examples')" class="log-link">示例</b> 会对学习有帮助。</p>
                </div>
                <!-- Expression language data types -->
                <div>
                  <h1 class="page-header-two" id="expression-language-data-types">表达式语言数据类型</h1>
                  <div class="introduce-view__content-label">
                    <p>在 Prometheus 的表达式语言中，表达式或子表达式可以分为以下四种类型：</p>
                    <ul>
                      <li><b>即时向量：</b>一组时间序列，包含每个时间序列的单个样本，所有样本的时间戳相同</li>
                      <li><b>范围向量：</b>一组时间序列，包含每个时间序列在一段时间内的一系列数据点</li>
                      <li><b>标量：</b>简单的数字浮点值</li>
                      <li><b>字符串：</b>简单的字符串值；当前未使用</li>
                    </ul>
                    <p>根据使用情况（例如绘制或显示表达式输出结果时)，这些类型中只有一部分可以作为用户指定表达式的结果。例如，返回即时向量的表达式是唯一可以直接绘图的类型。</p>
                  </div>
                </div>
                <!-- Literals -->
                <h1 class="page-header-two" id="literals">字面量</h1>
                <div class="introduce-view__content">
                  <h2 id="string-literals">字符串字面量</h2>
                  <div class="introduce-view__content-label">
                    <p>字符串可以在单引号、双引号或反引号中指定为字面量。</p>
                    <p>PromQL 遵循与 Go 相同的 转义规则。 在单引号或双引号中，转义序列以反斜杠开头，其后可以是 <code>a</code>, <code>b</code>, <code>f</code>, <code>n</code>, <code>r</code>, <code>t</code>, <code>v</code> 或 <code>\</code>。 可以使用八进制 (<code>\nnn</code>) 十六进制 (<code>\xnn</code>, <code>\unnnn</code> 和 <code>\Unnnnnnnn</code>)来提供特定字符。</p>
                    <p>反引号内不处理任何转义。与 Go 不同，Prometheus 不丢弃反斜杠内的换行符。</p>
                    <p>示例:</p>
                    <pre>"this is a string"
'these are unescaped: \n \\ \t'
`these are not unescaped: \n ' " \t`</pre>
                  </div>
                </div>
                <!-- Float literals -->
                <div class="introduce-view__content">
                  <h2 id="float-literals">浮点字面量</h2>
                  <div class="introduce-view__content-label">
                    <p>标量浮点值可以按以下格式写成整数字面量或浮点数（空白的目的是提供更好的可读性）：</p>
                    <pre>[-+]?(
      [0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?
    | 0[xX][0-9a-fA-F]+
    | [nN][aA][nN]
    | [iI][nN][fF]
)</pre>
                    <p>示例:</p>
                    <pre>23
-2.43
3.4e-9
0x8f
-Inf
NaN</pre>
                  </div>
                </div>
                <!-- Time series Selectors -->
                <h1 class="page-header-two" id="time-series-selectors">时间序列选择器</h1>
                <div class="introduce-view__content">
                  <h2 id="instant-vector-selectors">即时向量选择器</h2>
                  <div class="introduce-view__content-label">
                    <div>
                        <p>即时向量选择器允许选择一组时间序列和在每个给定时间戳（即时）的单个样本值：在最简单的形式中，只需指定一个度量名称。这将产生一个即时向量，其中包含具有该度量名称的所有时间序列的元素。</p>
                        <p>此示例选择具有 <code>http_requests_total</code> 度量名称的所有时间序列：</p>
                        <pre>http_requests_total</pre>
                        <p>通过在大括号 (<code>{}</code>) 中附加一个逗号分隔的标签匹配器列表，可以进一步过滤这些时间序列。</p>
                        <p>此示例仅选择度量名称为 <code>http_requests_total </code> ，且 <code>job</code> 标签设置为 <code>prometheus</code> 、 <code>group</code> 标签设置为 <code>canary</code> 的时间序列：</p>
                        <pre>http_requests_total{job="prometheus",group="canary"}</pre>
                        <p>也能负匹配标签值，或者根据正则表达式匹配标签值。有以下标签匹配运算符：</p>
                        <ul>
                          <li><code>=</code>: 选择与提供的字符串完全相同的标签。</li>
                          <li><code>!=</code>: 选择与提供的字符串不相同的标签。</li>
                          <li><code>=~</code>: 选择与提供的字符串正则表达式匹配的标签。</li>
                          <li><code>!~</code>: 选择与提供的字符串正则表达式不匹配的标签。</li>
                        </ul>
                        <p>正则表达式匹配是完全锚定的。<code>env=~"foo"</code>  匹配被视为 <code>env=~"^foo$"</code>。</p>
                        <p>本示例将为 <code>staging</code>、<code>testing</code>and <code>development</code> 环境和除 <code>GET</code> 之外的 HTTP 方法选择所有 <code>http_requests_total</code> 的时间序列。</p>
                        <pre>http_requests_total{environment=~"staging|testing|development",method!="GET"}</pre>
                    </div>
                    <p>匹配空标签值的标签匹配器还能选择没有特定标签集的所有时间序列。同一个标签名称可以有多个匹配器。</p>
                    <p>向量选择器必须指定一个名称或至少一个与空字符串不匹配的标签匹配器。下面的表达式是非法的：</p>
                    <pre>{job=~".*"} # Bad!</pre>
                    <p>相反，下面这些表达式则是有效的，因为它们有与空标签值不匹配的选择器。</p>
                    <pre>{job=~".+"}              # Good!
{job=~".*",method="get"} # Good!</pre>
                    <p>标签匹配器也可以通过与内部 <code>__name__</code> 标签进行匹配而应用于指标名称。例如，表达式 <code>http_requests_total</code> 等效于 <code>{__name__="http_requests_total"}</code>。 除 <code>=</code> ( <code>!=</code>, <code>=~</code>, <code>!~</code> ) 以外的匹配器也可以使用。以下表达式选择名称以  <code>job:</code> 开头的所有度量：</p>
                    <pre>{__name__=~"job:.*"}</pre>
                    <p>度量名称不能为 <code>bool</code>、 <code>on</code>、 <code>ignoring</code>、 <code>group_left</code>、 <code>group_right</code>  等关键字，下面的表达式是非法的：</p>
                    <pre>on{} # Bad!</pre>
                    <p>使用 <code>__name__</code> 标签可以规避这一限制：</p>
                    <pre>{__name__="on"} # Good!</pre>
                    <p>Prometheus 中的所有正则表达式都使用 RE2 语法。</p>
                  </div>
                </div>
                <!-- Range Vector Selectors -->
                 <div class="introduce-view__content">
                  <h2 id="range-vector-selectors">范围向量选择器</h2>
                  <div class="introduce-view__content-label">
                    <p>范围向量字面量的使用与即时向量字面量类似，只是前者从当前的即时选择一个范围的样本。从语法上来说，在向量选择器的末尾，方括号 (<code>[]</code>) 中会附加一个 <b style="color: #3C92F1" @click="jumpClick('#time-durations')" class="log-link">时间长度</b>，以指定为每个结果范围向量元素获取过去多久的时间值。</p>
                    <p>在以下示例中，我们选择在过去5分钟内为度量名称为 <code>http_requests_total</code> 、 <code>job</code> 标签为 <code>prometheus</code> 的时间序列记录的所有值：</p>
                    <pre>http_requests_total{job="prometheus"}[5m]</pre>
                  </div>
                </div>
                <!-- Time Durations -->
                <div class="introduce-view__content">
                  <h2 id="time-durations">时间长度</h2>
                  <div class="introduce-view__content-label">
                    <p>时间长度指定为一个数字，其后单位如下：</p>
                    <ul>
                      <li><code>ms</code> - 毫秒</li>
                      <li><code>s</code> - 秒</li>
                      <li><code>m</code> - 分钟</li>
                      <li><code>h</code> - 小时</li>
                      <li><code>d</code> - 天 - 假设一天恒定为24小时</li>
                      <li><code>w</code> - 周 - 假设一周恒定为7天</li>
                      <li><code>y</code> - 年 - 假设一年恒定为365天</li>
                    </ul>
                    <p>时间长度可以连接组合，单位必须从大到小排序，给定的单位在一个时间长度里只能出现一次。</p>
                    <p>以下是一些有效的时间长度：</p>
                    <pre>5h
1h30m
5m
10s</pre>
                  </div>
                </div>
                <!-- Offset modifier -->
                 <div class="introduce-view__content">
                  <h2 id="offset-modifier">offset 修饰符</h2>
                  <div class="introduce-view__content-label">
                    <p><code>offset</code>（偏移）修饰符可以改变查询中各个即时向量和范围向量的时间偏移。</p>
                    <p>例如，以下表达式返回相对于当前查询评估时间的过去5分钟内 <code>http_requests_total</code> 的值：</p>
                    <pre>http_requests_total offset 5m</pre>
                    <p>注意 <code>offset</code>  修饰符需要紧跟选择器，以下表达式是正确的：</p>
                    <pre>sum(http_requests_total{method="GET"} offset 5m) // GOOD.</pre>
                    <p>而以下表达式则是的<i>错误</i>： </p>
                    <pre>sum(http_requests_total{method="GET"}) offset 5m // INVALID.</pre>
                    <p>范围向量也是一样。以下表达式返回一周前 <code>http_requests_total</code>  的5分钟速率：</p>
                    <pre>rate(http_requests_total[5m] offset 1w)</pre>
                    <p>为了与时间上的时间前移进行比较，可以指定负偏移：</p>
                    <pre>rate(http_requests_total[5m] offset -1w)</pre>
                    <p>注意：该表达式允许查询超过评估时间的数据。</p>
                  </div>
                </div>
                <!-- @ modifier -->
                 <div class="introduce-view__content">
                  <h2 id="time-series-modifier">@ 修饰符</h2>
                  <div class="introduce-view__content-label">
                    <p><code>@</code>  修饰符允许改变查询中各个即时和范围向量的评估时间。提供给 <code>@</code>  修饰符的时间是一个 unix 时间戳，用浮点字面量描述。 </p>
                    <p>例如，以下表达式返回 <code>http_requests_total</code> 在 <code>2021-01-04T07:40:00+00:00</code> 的值：</p>
                    <pre>http_requests_total @ 1609746000</pre>
                    <p>注意 <code>@</code> 修饰符需要紧跟选择器，以下表达式是正确的：</p>
                    <pre>sum(http_requests_total{method="GET"} @ 1609746000) // GOOD.</pre>
                    <p>以下表达式则是<i>错误</i>的：</p>
                    <pre>sum(http_requests_total{method="GET"}) @ 1609746000 // INVALID.</pre>
                    <p>范围向量也是一样。 以下的表达式返回 <code>http_requests_total</code> 在 <code>2021-01-04T07:40:00+00:00</code> 的五分钟速率：</p>
                    <pre>rate(http_requests_total[5m] @ 1609746000)</pre>
                    <p><code>@</code> 修饰符支持上述浮点字面量在  <code>int64</code> 范围内的所有表示。它还可以与 <code>offset</code>  修饰符一起使用，一起使用时，不论先写哪个修饰符，将应用相对于 <code>@</code>  修饰符时间的偏移。以下两个查询将产生相同的结果。</p>
                    <pre># offset after @
http_requests_total @ 1609746000 offset 5m
# offset before @
http_requests_total offset 5m @ 1609746000</pre>
                    <p>此外，<code>start()</code> 和 <code>end()</code> 也可以作为特殊值用作 <code>@</code> 修饰符的值。</p>
                    <p>对于范围查询，它们分别解析到范围查询的开始时间和结束时间，并在所有步骤中保持不变。</p>
                    <p>对于即时查询，<code>start()</code> 和 <code>end()</code>  都解析到评估时间。</p>
                    <pre>http_requests_total @ start()
rate(http_requests_total[5m] @ end())</pre>
                    <p>请注意，<code>@</code> 修饰符允许查询超过评估时间的数据。</p>
                  </div>
                </div>
                <!-- Subquery -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="querying-prometheus-subquery">子查询</h1>
                  <div class="introduce-view__content-label">
                    <p>子查询允许您针对给定的范围和分辨率运行即时查询。子查询的结果是一个范围向量。</p>
                    <p>语法：<code>&lt;instant_query&gt; '[' &lt;range&gt; ':' [&lt;resolution&gt;] ']' [ @ &lt;float_literal&gt; ] [ offset &lt;duration&gt; ]</code></p>
                    <ul>
                      <li><code>&lt;resolution&gt;</code> 为选填。默认为全局评估时间间隔。</li>
                    </ul>
                  </div>
                </div>
                <!-- Operators -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="querying-prometheus-operators">运算符</h1>
                  <div class="introduce-view__content-label">
                    <p>Prometheus 支持许多二进制和聚合运算符，这些运算符在 <b style="color: #3C92F1" @click="jumpClick('#operators')" class="log-link">表达式语言运算符</b> 页面中有详细描述。</p>
                  </div>
                </div>
                <!-- Functions -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="querying-prometheus-functions">函数</h1>
                  <div class="introduce-view__content-label">
                    <p>Prometheus 支持一些对数据进行运算的函数，这些函数在 <b style="color: #3C92F1" @click="jumpClick('#functions')" class="log-link">表达式语言函数</b> 页面有详细描述。</p>
                  </div>
                </div>
                <!-- Comments -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="querying-prometheus-comments">注释</h1>
                  <div class="introduce-view__content-label">
                    <p>PromQL 支持以 <code>#</code> 开头的行注释。示例：</p>
                    <pre>    # This is a comment</pre>
                  </div>
                </div>
                <!-- Gotchas -->
                 <h1 class="page-header-two" id="querying-prometheus-gotchas">陷阱</h1>
                 <div class="introduce-view__content">
                  <h2 id="gotchas-staleness">过时</h2>
                  <div class="introduce-view__content-label">
                    <p>当查询运行时，独立于当前实际时间序列数据来选择采样数据的时间戳。这主要是为了支持聚合 (<code>sum</code>, <code>avg</code>, 等)，其中多个聚合的时间序列在时间上不完全一致。由于其独立性， Prometheus 需要在这些时间戳上为每个相关的时间序列赋值，这一赋值是通过简单地获取该时间戳之前的最新样本来实现的。</p>
                    <p>如果目标抓取或规则评估不再返回先前存在的时间序列的样本，则该时间序列会被标记为过时。如果一个目标被删除，其先前返回的时间序列将很快被标记为过时。</p>
                    <p>如果在某个时间序列被标记为过时后，在采样时间戳处对查询进行评估，则不会为该时间序列返回任何值。如果该时间序列随后摄入了新样本，会正常返回值。</p>
                    <p>如果在采样时间戳之前5分钟（默认）没有找到样本，则不会为该时间点的时间序列返回任何值。这意味着当时间序列的最新收集样本超过5分钟或被标记为过时时，时间序列就会从图表中“消失”。</p>
                    <p>在抓取中包含时间戳的时间序列不会被标记为过时，而将只应用5分钟阈值。</p>
                  </div>
                </div>
                <!-- Avoiding slow queries and overloads -->
                 <div class="introduce-view__content">
                  <h2 id="avoiding-slow-queries-and-overloads">避免缓慢的查询和过载</h2>
                  <div class="introduce-view__content-label">
                    <p>如果一个查询需要对大量数据进行操作，那么绘图可能会超时或者导致服务器或浏览器过载。因此，当对未知数据构建查询时，应总是在 Prometheus 表达式浏览器的表格视图中开始构建查询，直到结果集是合理的（最多几百个，而不是几千个时间序列）。在充分过滤或聚合数据后，才能切换到图表模式。如果表达式仍然需要很长时间来绘制，则通过记录规则预先记录。</p>
                    <p>这对 Prometheus 的查询语言尤其重要，在 Prometheus 的查询语言中，像 <code>api_http_requests_total</code> 这样简单的度量名称选择器可以扩展成数千个带有不同标签的时间序列。还要注意，即使只输出了少量的时间序列，聚合多个时间序列的表达式也会在服务器上产生负载；就像在关系数据库中，即使输出值只是一个数字，对一列中的所有值求和也会很慢。</p>
                  </div>
                </div>
                <!-- OPERATORS -->
                <h1 class="page-header-one" id="operators">运算符</h1>
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="binary-operators">二进制运算符</h1>
                  <p>Prometheus 的查询语言支持基本的逻辑和算术运算符。对于两个即时向量之间的运算，可以修改 <b style="color: #3C92F1" @click="jumpClick('#vector-matching')" class="log-link">匹配行为</b>。</p>
                </div>
                <!-- Arithmetic binary operators -->
                 <div class="introduce-view__content">
                  <h2 id="arithmetic-binary-operators">二进制算术运算符</h2>
                  <div class="introduce-view__content-label">
                    <p>Prometheus 中有以下二进制算术运算符：</p>
                    <ul>
                      <li><code>+</code> (加法)</li>
                      <li><code>-</code> (减法)</li>
                      <li><code>*</code> (乘法)</li>
                      <li><code>/</code> (除法)</li>
                      <li><code>%</code> (取模)</li>
                      <li><code>^</code> (幂)</li>
                    </ul>
                    <p>二进制算术运算符支持标量/标量、向量/标量、以及向量/向量之间的运算。</p>
                    <p><b>标量/标量</b>, 行为是显而易见的：它们评估另一个标量，该标量是运算符应用于两个标量操作数的结果。</p>
                    <p><b>即时向量/标量</b>, 将运算符应用于向量中每个数据样本的值。 例如， 如果时间序列即时向量乘以2，则结果是另一个将原始向量的每个样本值乘以2的向量。度量名称被删除。</p>
                    <p><b>即时向量/即时向量</b>, 二进制算术运算符应用于左侧向量中的每个条目及其右侧向量中的匹配元素。结果将传播到结果向量中，分组标签成为输出标签集。度量名称被删除。 结果不包含在右侧向量中找不到匹配条目的条目。</p>
                  </div>
                </div>
                <!-- Trigonometric binary operators -->
                <div class="introduce-view__content">
                  <h2 id="trigonometric-binary-operators">三角二进制运算符</h2>
                  <div class="introduce-view__content-label">
                    <p>Prometheus 中有以下采用弧度制的三角二进制运算符：</p>
                    <ul>
                      <li><code>atan2</code> (基于 https://pkg.go.dev/math#Atan2)</li>
                    </ul>
                    <p>三角运算符允许使用向量匹配对两个向量运行三角函数，普通函数则不允许。三角运算符的运算方式与算术运算符相同。</p>
                  </div>
                </div>
                <!-- Comparison binary operators -->
                <div class="introduce-view__content">
                  <h2 id="comparison-binary-operators">比较二进制运算符</h2>
                  <div class="introduce-view__content-label">
                    <p>Prometheus 中有以下比较二进制运算符有：</p>
                    <ul>
                      <li><code>==</code> (等于)</li>
                      <li><code>!=</code> (不等于)</li>
                      <li><code>&gt;</code> (大于)</li>
                      <li><code>&lt;</code> (小于)</li>
                      <li><code>&gt;=</code> (大于等于)</li>
                      <li><code>&lt;=</code> (小于等于)</li>
                    </ul>
                    <p>比较二进制运算符支持标量/标量、向量/标量、以及向量/向量之间的运算。默认情况下过滤。 可以通过在运算符之后提供 <code>bool</code> 来修改其行为，从而为值返回 <code>0</code> 或 <code>1</code> 而不是过滤。</p>
                    <p><b>标量/标量</b>, 必须提供  <code>bool</code>  修饰符，这些运算符会产生另一个  <code>0</code> (<code>假</code>) 或 <code>1</code> (<code>真</code>) 的标量，具体取决于比较结果。</p>
                    <p><b>即时向量/标量</b>, 将这些运算符应用于向量中的每个数据样本的值，并且从结果向量中删除比较结果为<code>false</code>  的向量元素。 如果提供了 <code>bool</code> 修饰符，则将被删除的向量元素的值为<code>0</code>，将保留的向量元素的值为<code>1</code> 。如果提供了  <code>bool</code>  修饰符，度量名称将被删除。</p>
                    <p><b>即时向量/即时向量</b>, 这些运算符默认表现为过滤器，应用于匹配条目。 表达式不正确或在表达式的另一侧找不到匹配项的向量元素会被从结果中删除，其他元素则传播到结果向量中，分组标签成为输出标签集。 如果提供了 <code>bool</code> 修饰符，则将被删除的向量元素的值为<code>0</code> ，将保留的向量元素的值为<code>1</code>, 分组标签再次成为输出标签集。如果提供了 <code>bool</code>  修饰符，度量名称将被删除。</p>
                  </div>
                </div>
                <!-- Logical/set binary operators -->
                <div class="introduce-view__content">
                  <h2 id="Logical-binary-operators">逻辑/集合二进制运算符</h2>
                  <div class="introduce-view__content-label">
                    <p>逻辑/集合二进制运算符只支持即时向量之间的操作：</p>
                    <ul>
                      <li><code>and</code> (交集)</li>
                      <li><code>or</code> (并集)</li>
                      <li><code>unless</code> (补集)</li>
                    </ul>
                    <p><code>vector1 and vector2</code> 得到一个由 <code>vector1</code> 元素组成的向量，其中 <code>vector2</code> 中的元素具有完全匹配的标签集。 其他元素被删除。 度量名称和值从左侧向量转移。</p>
                    <p><code>vector1 or vector2</code> 得到包含<code>vector1</code>  的所有原始元素（标签集+值）的向量，以及在 <code>vector1</code> 中没有匹配标签集的 <code>vector2</code> 的所有元素。</p>
                    <p><code>vector1 unless vector2</code> 得到一个由 <code>vector1</code> 元素组成的向量， <code>vector2</code> 中没有元素的标签集与该向量完全匹配。 两个向量中的所有匹配元素都被删除。</p>
                  </div>
                </div>
                <!-- Vector matching -->
                <h1 class="page-header-two" id="vector-matching">向量匹配</h1>
                 <div class="introduce-view__content">
                  <div class="introduce-view__content-label">
                    <p>向量之间的操作尝试在左侧的每个条目的右侧向量中找到匹配元素。 有两种基本匹配行为：一对一和多对一/一对多。</p>
                  </div>
                </div>
                <!-- Vector matching keywords -->
                 <div class="introduce-view__content">
                  <h2 id="vector-matching-keywords">向量匹配关键词</h2>
                  <div class="introduce-view__content-label">
                    <p>向量匹配关键词允许具有不同标签集的序列之间的匹配，关键词有：</p>
                    <ul>
                      <li><code>on</code></li>
                      <li><code>ignoring</code></li>
                    </ul>
                    <p>提供给匹配关键词的标签列表将决定向量的组合方式。可以在 <b style="color: #3C92F1" @click="jumpClick('#one-to-one-vector-matches')" class="log-link">一对一向量匹配</b> 和 <b style="color: #3C92F1" @click="jumpClick('#many-to-one')" class="log-link">多对一/一对多向量匹配</b> 中找到示例。</p>
                  </div>
                </div>
                <!-- Group modifiers -->
                 <div class="introduce-view__content">
                  <h2 id="group-modifiers">分组修饰符</h2>
                  <div class="introduce-view__content-label">
                    <p>这些分组修饰符支持多对一/一对多向量匹配：</p>
                    <ul>
                      <li><code>group_left</code></li>
                      <li><code>group_right</code></li>
                    </ul>
                    <p>可以提供标签列表给分组修饰符，分组修饰符包含来自“一”方的标签，以将其纳入结果度量中。</p>
                    <p style="font-style:italic;">多对一/一对多匹配是应该仔细考虑的高级用例。通常，正确使用 <code>ignoring(&lt;labels&gt;)</code> 可以令您得到想要的结果。</p>
                    <p style="font-style:italic;">分组修饰符只能用于 <b style="color: #3C92F1" @click="jumpClick('#comparison-binary-operators')" class="log-link">比较</b> 和 <b style="color: #3C92F1" @click="jumpClick('#arithmetic-binary-operators')" class="log-link">算术</b>。像 <code>and</code>、 <code>unless</code> 和 <code>or</code> 这样的运算默认情况下与右向量中所有可能的条目匹配。</p>
                  </div>
                </div>
                <!-- One-to-one vector matches -->
               <div class="introduce-view__content">
                  <h2 id="one-to-one-vector-matches">一对一向量匹配</h2>
                  <div class="introduce-view__content-label">
                    <p><b>一对一</b>从操作的每一侧找到一对唯一条目。在默认情况下是格式 <code>vector1 &lt;operator&gt; vector2</code> 之后的运算。如果两个条目具有完全相同的标签集和相应的值，则这两个条目匹配。<code>ignoring</code> 关键词允许在匹配时忽略某些标签，而 <code>on</code> 关键词允许将所考虑的标签集减少为提供的列表：</p>
                    <pre>&lt;vector expr&gt; &lt;bin-op&gt; ignoring(&lt;label list&gt;) &lt;vector expr&gt;
&lt;vector expr&gt; &lt;bin-op&gt; on(&lt;label list&gt;) &lt;vector expr&gt;</pre>
                    <p>输入示例：</p>
                    <pre>method_code:http_errors:rate5m{method="get", code="500"}  24
method_code:http_errors:rate5m{method="get", code="404"}  30
method_code:http_errors:rate5m{method="put", code="501"}  3
method_code:http_errors:rate5m{method="post", code="500"} 6
method_code:http_errors:rate5m{method="post", code="404"} 21

method:http_requests:rate5m{method="get"}  600
method:http_requests:rate5m{method="del"}  34
method:http_requests:rate5m{method="post"} 120</pre>
                    <p>查询示例：</p>
                    <pre>method_code:http_errors:rate5m{code="500"} / ignoring(code) method:http_requests:rate5m</pre>
                    <p>这将为每个方法返回一个结果向量，包含在过去的5分钟内状态代码为500的 HTTP 请求部分。 没有 <code>ignoring(code)</code> 就没有匹配，因为度量不共享同一组标签。 方法 <code>put</code> 和 <code>del</code>  的条目没有匹配，不会在结果中显示：</p>
                    <pre>{method="get"}  0.04            //  24 / 600
{method="post"} 0.05            //   6 / 120</pre>
                  </div>
                </div>
                <!-- Many-to-one and one-to-many vector matches -->
                 <div class="introduce-view__content">
                  <h2 id="many-to-one">多对一/一对多向量匹配</h2>
                  <div class="introduce-view__content-label">
                    <p><b>多对一</b>/<b>一对多</b>匹配指“一”侧的每个向量元素都可以与“多”侧的多个元素匹配。必须使用 <code>group_left</code> 或 <code>group_right</code>  修饰符明确请求，其中 left/right 确定有更高基数的向量。</p>
                    <pre>&lt;vector expr> &lt;bin-op&gt; ignoring(&lt;label list&gt;) group_left(&lt;label list&gt;) &lt;vector expr&gt;
&lt;vector expr&gt; &lt;bin-op&gt; ignoring(&lt;label list&gt;) group_right(&lt;label list&gt;) &lt;vector expr&gt;
&lt;vector expr&gt; &lt;bin-op&gt; on(&lt;label list&gt;) group_left(&lt;label list&gt;) &lt;vector expr&gt;
&lt;vector expr&gt; &lt;bin-op&gt; on(&lt;label list&gt;) group_right(&lt;label list&gt;) &lt;vector expr&gt;</pre>
                    <p>随分组修饰符提供的标签列表包含来自“一”侧的其他标签，以将其纳入结果度量中。 对于 <code>on</code> ，一个标签只能出现在其中一个列表中。 每次结果向量的序列都必须是唯一可识别的。</p>
                    <p>查询示例：</p>
                    <pre>method_code:http_errors:rate5m / ignoring(code) group_left method:http_requests:rate5m</pre>
                    <p>在这种情况下，左向量每个 <code>method</code>  标签值包含多个条目。 因此，我们使用 <code>group_left</code> 来表明这一点。 右侧的元素现在与左侧具有相同的 <code>method</code> 标签的多个元素匹配：</p>
                    <pre>{method="get", code="500"}  0.04            //  24 / 600
{method="get", code="404"}  0.05            //  30 / 600
{method="post", code="500"} 0.05            //   6 / 120
{method="post", code="404"} 0.175           //  21 / 120</pre>
                  </div>
                </div>
                <!-- Aggregation operators -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="aggregation-operators">聚合运算符</h1>
                  <div class="introduce-view__content-label">
                    <p>Prometheus 支持以下内置聚合运算符，这些运算符可用于聚合单个即时向量的元素，生成具有聚合值的更少元素的新向量：</p>
                    <ul>
                      <li><code>sum</code> (在维度上求和)</li>
                      <li><code>min</code> (在维度上选择最小值)</li>
                      <li><code>max</code> (在维度上选择最大值)</li>
                      <li><code>avg</code> (在维度上求平均值)</li>
                      <li><code>group</code> (结果向量中的所有值都是1)</li>
                      <li><code>stddev</code> (在维度上求总体标准偏差)</li>
                      <li><code>stdvar</code> (在维度上求总体标准方差)</li>
                      <li><code>count</code> (统计向量元素的数量)</li>
                      <li><code>count_values</code> (统计有相同数据值的元素数量)</li>
                      <li><code>bottomk</code> (样本值最大的 k 个元素)</li>
                      <li><code>topk</code> (样本值最大的 k 个元素)</li>
                      <li><code>quantile</code> (在维度上统计 φ 分位数（0 ≤ φ ≤ 1）)</li>
                    </ul>
                    <p>这些运算符可以用于聚合<b>所有</b>标签维度，也可以通过包含 <code>without</code> 或 <code>by</code>  子句来保留不同的维度。这些子句可以在表达式之前或之后使用。</p>
                    <pre>&lt;aggr-op&gt; [without|by (&lt;label list&gt;)] ([parameter,] &lt;vector expression&gt;)</pre>
                    <p>或</p>
                    <pre>&lt;aggr-op&gt;([parameter,] &lt;vector expression&gt;) [without|by (&lt;label list&gt;)]</pre>
                    <p><code>label list</code>  是可以包括尾部逗号的、未加引号的标签列表，即 <code>(label1, label2)</code> 和 <code>(label1, label2,)</code> 都是有效的语法。</p>
                    <p><code>without</code> 从结果向量中删除列出的标签，而其他标签都保留在输出中。 <code>by</code> 则相反，它会删除 <code>by</code> 子句中未列出的标签，即使其标签值在向量的所有元素之间是相同的。</p>
                    <p><code>parameter</code> 仅用于 <code>count_values</code>、<code>quantile</code>、<code>topk</code> 和 <code>bottomk</code>。</p>
                    <p><code>count_values</code> 为每个唯一样本值输出一个时间序列。每个序列都有一个额外的标签，该标签的名称由聚合参数给出，该标签的值是唯一的样本值。每个时间序列的值是样本值出现的次数。</p>
                    <p><code>topk</code> 和 <code>bottomk</code>  与其他聚合器的不同之处在于它们在结果向量中返回输入样本的子集（包括原始标签）。 <code>by</code> 和 <code>without</code>  仅用于存储输入向量。</p>
                    <p><code>quantile</code> 计算 φ 分位数，即在聚合维度的 N 个度量值中排名第 φ * N 的值。提供 φ 作为聚合参数。例如， <code>quantile(0.5, ...)</code>  计算中位数， <code>quantile(0.95, ...)</code> 计算第 95 个百分位数。如果 φ = <code>NaN</code>, 返回 <code>NaN</code> 如果 φ &lt; 0, 返回 -Inf； 如果 φ > 1, 返回 <code>+Inf</code>。</p>
                    <p>示例：</p>
                    <p>如果度量 <code>http_requests_total</code> 具有按 <code>application</code>、<code>instance</code> 以及 <code>group</code> 扇出的时间序列，我们可以通过以下方式，计算每个应用程序和分组在所有实例上看到的 HTTP 请求总数：</p>
                    <pre>sum without (instance) (http_requests_total)</pre>
                    <p>等价于：</p>
                    <pre> sum by (application, group) (http_requests_total)</pre>
                    <p>如果我们只想得到在<b>所有</b>应用程序中看到的 HTTP 请求总数，我们可以写成：</p>
                    <pre>sum(http_requests_total)</pre>
                    <p>要计算运行每个构建版本的二进制文件的数量，我们可以写成：</p>
                    <pre>count_values("version", build_version)</pre>
                    <p>要在所有实例中获取最大的5个 HTTP 请求计数，我们可以写成：</p>
                    <pre>topk(5, http_requests_total)</pre>
                  </div>
                </div>
                <!-- Binary operator precedence -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="binary-operator-precedence">二进制运算符优先级</h1>
                  <div class="introduce-view__content-label binary-operator-precedence">
                    <p>以下列表从高到低显示了 Prometheus 中二进制运算符的优先级：</p>
                    <ul>
                      <li><code>^</code></li>
                      <li><code>*</code>, <code>/</code>, <code>%</code>, <code>atan2</code></li>
                      <li><code>+</code>, <code>-</code></li>
                      <li><code>==</code>, <code>!=</code>, <code>&lt;=</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&gt;</code></li>
                      <li><code>and</code>, <code>unless</code></li>
                      <li><code>or</code></li>
                    </ul>
                    <p>具有相同优先级的运算符为从左到右运算的。 例如，<code>2 * 3 % 2</code> 相当于 <code>(2 * 3) % 2</code>。 但 <code>^</code> 是从右到左运算的，所以 <code>2 ^ 3 ^ 2</code>  相当于 <code>2 ^ (3 ^ 2)</code>。</p>
                  </div>
                </div>
                <!-- FUNCTIONS -->
                <h1 class="page-header-one" id="functions">函数</h1>
                 <div class="introduce-view__content">
                  <div class="introduce-view__content-label">
                    <p>有些函数有默认参数，例如 <code>year(v=vector(time()) instant-vector)</code>。这意味着有一个即时向量：参数 v ，如果不提供该参数，将默认为 <code>vector(time())</code> 表达式的值。</p>
                  </div>
                </div>
                <!-- abs() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-abs">abs()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>abs(v instant-vector)</code>  返回输入向量的所有样本值都转换为了绝对值。</p>
                  </div>
                </div>
                <!-- absent() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-absent">absent()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>absent(v instant-vector)</code> 如果传递给它的向量含有元素，则返回一个空向量；如果传递给它的向量没有元素，则返回一个值为1的单元素向量。</p>
                    <p>这有助于在给定的度量名称和标签组合不存在时间序列时发出警报。</p>
                    <pre>absent(nonexistent{job="myjob"})
# => {job="myjob"}

absent(nonexistent{job="myjob",instance=~".*"})
# => {job="myjob"}

absent(sum(nonexistent{job="myjob"}))
# => {}</pre>
                    <p>在前两个例子中，<code>absent()</code>  试图从输入向量中导出单元素输出向量的标签。</p>
                  </div>
                </div>
                 <!-- absent_over_time() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-absent_over_time">absent_over_time()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>absent_over_time(v range-vector)</code> 如果传递给它的范围向量含有元素，则返回一个空向量；如果传递给它的范围向量没有元素，则返回一个值为1的单元素向量。</p>
                    <p>这有助于在给定的度量名称和标签组合不存在时间序列一段时间后发出警报。</p>
                    <pre>absent_over_time(nonexistent{job="myjob"}[1h])
# => {job="myjob"}

absent_over_time(nonexistent{job="myjob",instance=~".*"}[1h])
# => {job="myjob"}

absent_over_time(sum(nonexistent{job="myjob"})[1h:])
# => {}</pre>
                    <p>在前两个例子中，<code>absent_over_time()</code>  试图从输入向量中导出单元素输出向量的标签。</p>
                  </div>
                </div>
                 <!-- ceil() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-ceil">ceil()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>ceil(v instant-vector)</code> 将 <code>v</code> 中所有元素的样本值向上舍入为最接近的整数。</p>
                  </div>
                </div>
                 <!-- changes() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-changes">changes()</h1>
                  <div class="introduce-view__content-label">
                    <p>对于每个输入时间序列，<code>changes(v range-vector)</code> 返回该值在提供的时间范围内作为即时向量改变的次数。</p>
                  </div>
                </div>
                 <!-- clamp() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-clamp">clamp()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>clamp(v instant-vector, min scalar, max scalar)</code> 将 <code>v</code> 中所有元素的样本值钳制为下限 <code>min</code> 和上限 <code>max</code>。</p>
                    <p>特殊情况：如果 <code>min > max</code>，则返回一个空向量；如果 <code>min</code> 或 <code>max</code> 是 <code>NaN</code>， 返回<code>NaN</code>。</p>
                  </div>
                </div>
                 <!-- clamp_max() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-clamp_max">clamp_max()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>clamp_max(v instant-vector, max scalar)</code> 将 <code>v</code> 中所有元素的样本值钳制为上限 <code>max</code>。</p>
                  </div>
                </div>
                 <!-- clamp_min() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-clamp_min">clamp_min()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>clamp_min(v instant-vector, min scalar)</code> 将 <code>v</code> 中所有元素的样本值钳制为下限 <code>min</code>。</p>
                  </div>
                </div>
                 <!-- day_of_month() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-day_of_month">day_of_month()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>day_of_month(v=vector(time()) instant-vector)</code> 返回 UTC 中每个给定时间的月份中的某天。返回值的范围为1到31。</p>
                  </div>
                </div>
                 <!-- day_of_week() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-day_of_week">day_of_week()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>day_of_week(v=vector(time()) instant-vector)</code> 返回 UTC 中每个给定时间的星期中的某天。 返回值的范围为 0 到 6，其中 0 表示星期日。</p>
                  </div>
                </div>
                 <!-- day_of_year() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-day_of_year">day_of_year()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>day_of_year(v=vector(time()) instant-vector)</code>  返回 UTC 中每个给定时间的年中的某天。对于平年，返回值的范围为1到365，对于闰年，返回值的范围为1到366。</p>
                  </div>
                </div>
                 <!-- days_in_month() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-days_in_month">days_in_month()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>days_in_month(v=vector(time()) instant-vector)</code> 返回 UTC 中每个给定时间的一个月中的天数。返回值的范围为28到31。</p>
                  </div>
                </div>
                 <!-- delta() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-delta">delta()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>delta(v range-vector)</code> 计算范围向量 <code>v</code> 中每个时间序列元素的第一个值和最后一个值之间的差，返回具有给定 delta 和等效标签的即时向量。Delta 被外推以覆盖范围向量选择器中指定的完整时间范围，因此即使样本值都是整数，也有可能得到非整数结果。</p>
                    <p>下面的表达式返回现在和2小时前的 CPU 温度差：</p>
                    <pre>delta(cpu_temp_celsius{host="zeus"}[2h])</pre>
                    <p><code>delta</code> 应仅用于 gauge。</p>
                  </div>
                </div>
                 <!-- deriv() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-deriv">deriv()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>deriv(v range-vector)</code> 使用简单线性回归计算范围向量 <code>v</code> 中时间序列的每秒导数。范围向量必须至少有两个样本才能执行计算。当在范围向量中找到 <code>+Inf</code> 或 <code>-Inf</code>  时，所计算的斜率和偏移值将为 <code>NaN</code>。</p>
                    <p><code>deriv</code> 应仅用于 gauge。</p>
                  </div>
                </div>
                 <!-- exp() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-exp">exp()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>exp(v instant-vector)</code> 计算 <code>v</code> 中所有元素的指数函数。特殊情况有：</p>
                    <ul>
                      <li><code>Exp(+Inf) = +Inf</code></li>
                      <li><code>Exp(NaN) = NaN</code></li>
                    </ul>
                  </div>
                </div>
                 <!-- floor() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-floor">floor()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>floor(v instant-vector)</code> 将 <code>v</code> 中所有元素的样本值向下舍入到最接近的整数。</p>
                  </div>
                </div>
                 <!-- histogram_quantile() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-histogram_quantile">histogram_quantile()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>histogram_quantile(φ scalar, b instant-vector)</code> 从直方图的 <code>b</code> 桶计算 φ 分位数（0 ≤ φ ≤ 1）。（有关 φ- 分位数的详细解释和直方图度量类型的一般用法，请参见 直方图和总结。） b 中的样本是每个桶中的观察计数。每个样本必须具有标签 <code>le</code> ，该标签值表示桶的包含上限。（没有该标签的样本会被悄然忽略。）直方图度量类型自动为时间序列提供 <code>_bucket</code> 后缀和适当的标签。</p>
                    <p>使用 <code>rate()</code> 函数指定分位数计算的时间窗口。</p>
                    <p>示例：一个直方图度量的名称为 <code>http_request_duration_seconds</code> 。要计算过去10分钟内请求持续时间的第90个百分位数，请使用以下表达式：</p>
                    <pre>histogram_quantile(0.9, rate(http_request_duration_seconds_bucket[10m]))</pre>
                    <p>计算<code>http_request_duration_seconds</code> 中每个标签组合的分位数。若要聚合，请在 <code>rate()</code> 函数周围使用 <code>sum()</code>  聚合器。因为 <code>histogram_quantile()</code>  需要 <code>le</code> 标签，所以 <code>by</code> 子句必须包含该标签。以下表达式按 <code>job</code> 聚合第90个百分位数：</p>
                    <pre>histogram_quantile(0.9, sum by (job, le) (rate(http_request_duration_seconds_bucket[10m])))</pre>
                    <p>要聚合所有内容，仅指定 <code>le</code> 标签：</p>
                    <pre>histogram_quantile(0.9, sum by (le) (rate(http_request_duration_seconds_bucket[10m])))</pre>
                    <p><code>histogram_quantile()</code> 函数通过假设桶内的线性分布来内插分位数值。最高的存储桶必须有 <code>+Inf</code> 的上限（没有则返回<code>NaN</code> ）。如果分位数位于最高的桶中，则返回第二高桶的上限。如果最低桶的上限大于0，则该桶的下限被假定为0。在这种情况下，通常的线性插值会被应用于该桶。否则，为位于最低桶中的分位数返回最低桶的上限。</p>
                    <p>如果 <code>b</code> 有0个观察值，则返回 <code>NaN</code> 。如果 <code>b</code> 包含的桶少于两个，则返回 <code>NaN</code>。如果 φ &lt; 0，返回 <code>-Inf</code> 。如果 φ > 1，返回 <code>+Inf</code> 如果 φ = <code>NaN</code>, 返回 <code>NaN</code>。</p>
                  </div>
                </div>
                 <!-- holt_winters() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-holt_winters">holt_winters()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>holt_winters(v range-vector, sf scalar, tf scalar)</code> 基于 <code>v</code> 中的范围为时间序列生成平滑值。平滑因子 <code>sf</code> 越低，旧数据越重要。趋势因子 <code>tf</code> 越高，考虑的数据趋势越多。<code>sf</code> 和 tf 都必须介于0和1之间。</p>
                    <p><code>holt_winters</code> 应仅用于gauge。</p>
                  </div>
                </div>
                 <!-- hour() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-hour">hour()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>hour(v=vector(time()) instant-vector)</code> 返回 UTC 中每个给定时间的一天中的时刻。返回值的范围为0到23。</p>
                  </div>
                </div>
                 <!-- idelta() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-idelta">idelta()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>idelta(v range-vector)</code> 计算范围向量 <code>v</code>中最后两个样本之间的差，返回具有给定 delta 和等效标签的即时向量。</p>
                    <p><code>idelta</code> 应仅用于gauge。</p>
                  </div>
                </div>
                 <!-- increase() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-increase">increase()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>increase(v range-vector)</code> 计算范围向量中时间序列的 increase。会对单调性的中断（如由于目标重启导致的计数器重置）自动进行调整。Increase 被外推以覆盖范围向量选择器中指定的整个时间范围，因此即使计数器仅增加整数，也有可能得到非整数结果。</p>
                    <p>以下表达式返回范围向量中每个时间序列在过去5分钟内的 HTTP 请求数：</p>
                    <pre>increase(http_requests_total{job="api-server"}[5m])</pre>
                    <p><code>increase</code> 仅用于计数器。它是 <code>rate(v)</code> 乘以指定时间范围窗口下的秒数的语法糖，主要目的是提高可读性。在记录规则中使用 <code>rate</code> ，以持续跟踪每秒的 increase。</p>
                  </div>
                </div>
                 <!-- irate() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-irate">irate()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>irate(v range-vector)</code>  计算范围向量中时间序列的每秒瞬时增长率。计算基于最后两个数据点。会对单调性的中断（如由于目标重启导致的计数器重置）自动进行调整。</p>
                    <p>下面的表达式返回范围向量中每个时间序列里最近的两个数据点的每秒 HTTP 请求速率，最多可追溯5分钟：</p>
                    <pre>irate(http_requests_total{job="api-server"}[5m])</pre>
                    <p>只有在绘制易变的、快速移动的计数器时，才应使用 <code>irate</code> 。警报和慢速计数器应使用 <code>rate</code>，因为 rate 的短暂变化会重置 <code>FOR</code> 子句，完全由罕见峰值构成的图读起来很难。</p>
                    <p>请注意，当将 <code>irate()</code> 与聚合运算符 （如 <code>sum()</code> ）或随时间聚合的函数（任何以 <code>_over_time</code> 结尾的函数）结合使用时，始终先取 <code>irate()</code> ，然后再聚合。否则，当目标重启时，<code>irate()</code> 无法检测计数器重置。</p>
                  </div>
                </div>
                 <!-- label_join() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-label_join">label_join()</h1>
                  <div class="introduce-view__content-label">
                    <p>对于 <code>v</code> 中的每个时间序列，<code>label_join(v instant-vector, dst_label string, separator string, src_label_1 string, src_label_2 string, ...)</code> 用 <code>separator</code> 连接所有 <code>src_labels</code> 的所有值，并返回带有包含连接值的 <code>dst_label</code> 标签的时间序列。 此函数中可以有任意数量的 <code>src_labels</code>。</p>
                    <p>下面的表达式返回一个向量，该向量中的每个时间序列都有一个添加了值 <code>a,b,c</code> 的 <code>foo</code> 标签：</p>
                    <pre>label_join(up{job="api-server",src1="a",src2="b",src3="c"}, "foo", ",", "src1", "src2", "src3")</pre>
                  </div>
                </div>
                 <!-- label_replace() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-label_replace">label_replace()</h1>
                  <div class="introduce-view__content-label">
                    <p>对于 <code>v</code> 中的每个时间序列，<code>label_replace(v instant-vector, dst_label string, replacement string, src_label string, regex string)</code> 将正则表达式 <code>regex</code> 与标签 <code>src_label</code> 的值进行匹配。如果匹配成功，返回的时间序列中的标签 <code>dst_label</code> 的值将是 <code>replacement</code> 的扩展，以及输入中的原始标签。正则表达式中的捕获组可以用 <code>$1</code>, <code>$2</code> 等引用。如果正则表达式不匹配，则返回的时间序列不发生改变。</p>
                    <p>此表达式将返回带有值为 <code>a:c</code> 的 <code>service</code> 标签和值为 <code>a</code> 的 <code>foo</code> 标签的时间序列：</p>
                    <pre>label_replace(up{job="api-server",service="a:c"}, "foo", "$1", "service", "(.*):.*")</pre>
                  </div>
                </div>
                 <!-- ln() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-ln">ln()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>ln(v instant-vector)</code> 计算 <code>v</code> 中所有元素的自然对数。特殊情况有：</p>
                    <ul>
                      <li><code>ln(+Inf) = +Inf</code></li>
                      <li><code>ln(0) = -Inf</code></li>
                      <li><code>ln(x &lt; 0) = NaN</code></li>
                      <li><code>ln(NaN) = NaN</code></li>
                    </ul>
                  </div>
                </div>
                 <!-- log2() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-log2">log2()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>log2(v instant-vector)</code> 计算 <code>v</code>中所有元素的二进制对数。特殊情况与 <code>ln</code> 中的特殊情况相同。</p>
                  </div>
                </div>
                 <!-- log10() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-log10">log10()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>log10(v instant-vector)</code> 计算 <code>v</code>中所有元素的十进制对数。特殊情况与 <code>ln</code> 中的特殊情况相同。</p>
                  </div>
                </div>
                 <!-- minute() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-minute">minute()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>minute(v=vector(time()) instant-vector)</code> 返回 UTC 中每个给定时间的一小时内的分钟数。返回值的范围为0到59。</p>
                  </div>
                </div>
                 <!-- month() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-month">month()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>month(v=vector(time()) instant-vector)</code> 返回 UTC 中每个给定时间的一年中的月份数。返回值的范围为1到12，其中1表示一月。</p>
                  </div>
                </div>
                 <!-- predict_linear() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-predict_linear">predict_linear()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>predict_linear(v range-vector, t scalar)</code> 使用简单线性回归，基于范围向量 <code>v</code> 预测从现在起 <code>t</code> 秒后时间序列的值。范围向量必须有至少两个样本才能执行计算。当在范围向量中发现 <code>+Inf</code> 或 <code>-Inf</code>  时，计算的斜率和偏移值将为 <code>NaN</code>。</p>
                    <p><code>predict_linear</code> 应仅用于 gauge。</p>
                  </div>
                </div>
                 <!-- rate() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-rate">rate()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>rate(v range-vector)</code>  计算范围向量中时间序列的每秒平均增长率。会对单调性的中断（如由于目标重启导致的计数器重置）自动进行调整。此外，考虑到遗漏的抓取，或抓取周期与该范围时间段的不完全一致，计算会外推至时间范围的端点。</p>
                    <p>下面的表达式返回范围向量中的每个时间序列在过去5分钟内的每秒 HTTP 请求速率：</p>
                    <pre>rate(http_requests_total{job="api-server"}[5m])</pre>
                    <p><code>rate</code> 仅用于计数器。最适合于报警和绘制移动缓慢的计数器。</p>
                    <p>请注意，当将 <code>rate()</code> 与聚合运算符（如 <code>sum()</code> ）或随时间聚合的函数（任何以 <code>_over_time</code> 结尾的函数）结合使用时，始终先取 <code>rate()</code>，然后再聚合。否则，当目标重启时，<code>rate()</code> 无法检测计数器重置。</p>
                  </div>
                </div>
                 <!-- resets() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-resets">resets()</h1>
                  <div class="introduce-view__content-label">
                    <p>对于每个输入时间序列，<code>resets(v range-vector)</code>  将在给定时间范围内计数器重置的次数返回为一个即时向量。两个连续样本之间值的任何减少都会被看作计数器重置。</p>
                    <p><code>resets</code> 仅用于计数器。</p>
                  </div>
                </div>
                 <!-- round() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-round">round()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>round(v instant-vector, to_nearest=1 scalar)</code> 将 <code>v</code> 中所有元素的样本值舍入到最接近的整数。通过四舍五入来解决平局。可选的 <code>to_nearest</code> 参数允许指定样本值应舍入到的最接近倍数。这个倍数也可能是一个分数。</p>
                  </div>
                </div>
                 <!-- scalar() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-scalar">scalar()</h1>
                  <div class="introduce-view__content-label">
                    <p>输入一个单元素向量，<code>scalar(v instant-vector)</code> 将该单元素的样本值作为标量返回。如果输入的向量不是只有一个元素，则 <code>scalar</code> 返回 <code>NaN</code>。</p>
                  </div>
                </div>
                 <!-- sgn() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-sgn">sgn()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>sgn(v instant-vector)</code> 返回一个所有样本值都转换为其符号的向量，定义为：如果 v 为正，则为1；如果 v 为负，则为-1；如果 v 等于0，则为0。</p>
                  </div>
                </div>
                 <!-- sort() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-sort">sort()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>sort(v instant-vector)</code> 返回按样本值升序排序的向量元素。</p>
                  </div>
                </div>
                 <!-- sort_desc() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-sort_desc">sort_desc()</h1>
                  <div class="introduce-view__content-label">
                    <p>与 <code>sort</code> 相同，但按降序排序。</p>
                  </div>
                </div>
                <!-- sqrt() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-sqrt">sqrt()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>sqrt(v instant-vector)</code> 计算 <code>v</code> 中所有元素的平方根。</p>
                  </div>
                </div>
                <!-- time() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-time">time()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>time()</code> 返回自1970年1月1日（UTC）以来的秒数。请注意，该算法并不返回当前时间，而是返回表达式评估的时间。</p>
                  </div>
                </div>
                <!-- timestamp() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-timestamp">timestamp()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>timestamp(v instant-vector)</code> 将给定向量的每个样本的时间戳作为自1970年1月1日（UTC）以来的秒数返回。</p>
                  </div>
                </div>
                <!-- vector() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-vector">vector()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>vector(s scalar)</code> 将标量 <code>s</code> 作为不带标签的向量返回。</p>
                  </div>
                </div>
                <!-- year() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-year">year()</h1>
                  <div class="introduce-view__content-label">
                    <p><code>year(v=vector(time()) instant-vector)</code> 返回 UTC 中每个给定时间的年份。</p>
                  </div>
                </div>
                <!-- <aggregation>_over_time() -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-aggregation">&lt;aggregation&gt;_over_time()</h1>
                  <div class="introduce-view__content-label">
                    <p>以下函数允许聚合一段时间内给定范围向量的每个序列，并返回包含每个序列聚合结果的即时向量：</p>
                    <ul>
                      <li><code>avg_over_time(range-vector):</code> 指定间隔内所有点的平均值。</li>
                      <li><code>min_over_time(range-vector):</code> 指定间隔内所有点的最小值。</li>
                      <li><code>max_over_time(range-vector):</code> 指定间隔内所有点的最大值。</li>
                      <li><code>sum_over_time(range-vector):</code> 指定间隔内所有值的总和。</li>
                      <li><code>count_over_time(range-vector):</code> 指定间隔内所有值的计数。</li>
                      <li><code>quantile_over_time(scalar, range-vector):</code> 指定间隔内值的 φ 分位数（0 ≤ φ ≤ 1）。</li>
                      <li><code>stddev_over_time(range-vector):</code> 指定间隔内值的总体标准偏差。</li>
                      <li><code>stdvar_over_time(range-vector):</code> 指定间隔内值的总体标准方差。</li>
                      <li><code>last_over_time(range-vector):</code> 指定间隔内最近的点值。</li>
                      <li><code>present_over_time(range-vector):</code> 指定间隔内任何序列的值1。</li>
                    </ul>
                    <p>注意：指定间隔中的所有值在聚合中都具有相同的权重，即使这些值在整个间隔中的间距并不相同。</p>
                  </div>
                </div>
                <!-- Trigonometric Functions -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="functions-trigonometric">三角函数</h1>
                  <div class="introduce-view__content-label">
                    <p>The trigonometric functions work in radians:</p>
                    <ul>
                      <li><code>acos(v instant-vector):</code> 计算 v 中所有元素的反余弦值（特殊情况）。</li>
                      <li><code>acosh(v instant-vector):</code> 计算 v 中所有元素的反双曲余弦值（特殊情况）。</li>
                      <li><code>asin(v instant-vector):</code> 计算 v 中所有元素的反正弦值（特殊情况）。</li>
                      <li><code>asinh(v instant-vector):</code> 计算 v 中所有元素的反双曲正弦值（特殊情况）。</li>
                      <li><code>atan(v instant-vector):</code> 计算 v 中所有元素的反正切值（特殊情况）。</li>
                      <li><code>atanh(v instant-vector):</code> 计算 v 中所有元素的反双曲正切值（特殊情况）。</li>
                      <li><code>cos(v instant-vector):</code> 计算 v 中所有元素的余弦值（特殊情况）。</li>
                      <li><code>cosh(v instant-vector):</code> 计算 v 中所有元素的双曲余弦值（特殊情况）。</li>
                      <li><code>sin(v instant-vector):</code> 计算 v 中所有元素的正弦值（特殊情况）。</li>
                      <li><code>sinh(v instant-vector):</code> 计算 v 中所有元素的双曲正弦值（特殊情况）。</li>
                      <li><code>tan(v instant-vector):</code> 计算 v 中所有元素的正切值（特殊情况）。</li>
                      <li><code>tanh(v instant-vector):</code> 计算 v 中所有元素的双曲正切值（特殊情况）。</li>
                    </ul>
                    <p>以下函数可以对角度和弧度进行转换：</p>
                    <ul>
                      <li><code>deg(v instant-vector)</code>: 将 <code>v</code> 中所有元素的弧度转换为角度。</li>
                      <li><code>pi()</code>: 返回pi。</li>
                      <li><code>rad(v instant-vector)</code>: 将 <code>v</code> 中所有元素的角度转换为弧度。</li>
                    </ul>
                  </div>
                </div>
                <!-- QUERY EXAMPLES -->
                <h1 class="page-header-one" id="query-examples">查询示例</h1>
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="simple-time-series-selection">简单的时间序列选择</h1>
                  <div class="introduce-view__content-label">
                    <p>返回度量为 <code>http_requests_total</code> 的所有时间序列：</p>
                    <pre>http_requests_total</pre>
                    <p>返回带有度量 <code>http_requests_total</code> 和给定 <code>job</code> 和 <code>handler</code> 标签的时间序列：</p>
                    <pre>http_requests_total{job="apiserver", handler="/api/comments"}</pre>
                    <p>返回同一个向量的整个时间范围（该示例中为查询时间之前的5分钟），使其成为 <b style="color: #3C92F1" @click="jumpClick('#range-vector-selectors')" class="log-link">范围向量</b>：</p>
                    <pre>http_requests_total{job="apiserver", handler="/api/comments"}[5m]</pre>
                    <p>注意，产生范围向量的表达式不能被直接绘制成图形，而是要在表达式浏览器的表格（“控制台“）视图中查看</p>
                    <p>使用正则表达式，您可以只为名称符合特定模式的任务选择时间序列，本示例中要求作业以 <code>server</code> 结尾:</p>
                    <pre>http_requests_total{job=~".*server"}</pre>
                    <p>Prometheus 中的所有正则表达式都使用 RE2 语法。</p>
                    <p>要选择除 4xx 之外的所有 HTTP 状态代码，您可以运行：</p>
                    <pre>http_requests_total{status!~"4.."}</pre>
                  </div>
                </div>
                <!-- Subquery -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="query-examples-subquery">Subquery子查询</h1>
                  <div class="introduce-view__content-label">
                    <p>返回过去30分钟内 <code>http_requests_total</code> 度量的5分钟速率，分辨率为1分钟。</p>
                    <pre>rate(http_requests_total[5m])[30m:1m]</pre>
                    <p>这是嵌套子查询的一个示例。<code>deriv</code>  函数的子查询使用默认分辨率。注意应该在必要的时候才使用子查询。</p>
                    <pre>max_over_time(deriv(rate(distance_covered_total[5s])[30s:5s])[10m:])</pre>
                  </div>
                </div>
                <!-- Using functions, operators, etc. -->
                 <div class="introduce-view__content">
                  <h1 class="page-header-two" id="using-functions">使用函数、运算符等</h1>
                  <div class="introduce-view__content-label">
                    <p>返回度量名称为 <code>http_requests_total</code> 的所有时间序列在过去5分钟内的每秒速率：</p>
                    <pre>rate(http_requests_total[5m])</pre>
                    <p>假设 <code>http_requests_total</code> 时间序列都有标签 <code>job</code>（按任务名扇出）和 <code>instance</code>（按任务实例扇出），我们可能会对所有实例的速率求和，这样我们得到较少的输出时间序列，但仍然保留 <code>job</code> 这一维度：</p>
                    <pre>sum by (job) (
  rate(http_requests_total[5m])
)</pre>
                    <p>如果我们有两个具有相同维度标签的不同度量，我们可以对其应用二进制运算符，则两侧具有相同标签集的元素将匹配并传播到输出。例如，该表达式返回每个实例在 MiB 中未使用的内存（在一个虚构的集群调度程序上公开有关其所运行实例的度量)：</p>
                    <pre>(instance_memory_limit_bytes - instance_memory_usage_bytes) / 1024 / 1024</pre>
                    <p>同样的表达式由应用程序求和，则可以写为：</p>
                    <pre>sum by (app, proc) (
  instance_memory_limit_bytes - instance_memory_usage_bytes
) / 1024 / 1024</pre>
                    <p>如果相同的虚拟群集调度程序针对每个实例公开了如下 CPU 使用度量：</p>
                    <pre>instance_cpu_time_ns{app="lion", proc="web", rev="34d0f99", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="elephant", proc="worker", rev="34d0f99", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="turtle", proc="api", rev="4d3a513", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="fox", proc="widget", rev="4d3a513", env="prod", job="cluster-manager"}
...</pre>
                    <p>我们得到可以按应用程序（<code>app</code> ）和进程类型（ <code>proc</code> ）分组的前3名 CPU 用户，如下所示：</p>
                    <pre>topk(3, sum by (app, proc) (rate(instance_cpu_time_ns[5m])))</pre>
                    <p>假设此度量包含每个正在运行实例的一个时间序列，您可以按如下方式计算每个应用程序的运行实例数：</p>
                    <pre>count by (app) (instance_cpu_time_ns)</pre>
                  </div>
                </div>
              </div>
             </div>
          </div>
          <div v-else v-show="showIntroduce" class="introduce-view">
            <!-- 英文 -->
            <div class="info-room title-heard" v-if="language == 'en'">
              <div class="col-md-9 logs-content">
                <!-- LogQL: Log query language -->
                <h1 class="page-header" style="margin-Top:0px" id="log-query-language">LogQL: Log Query Language<a class="header-anchor" href="https://grafana.com/docs/loki/latest/logql/" rel="noopener noreferrer" target="_blank"><i class="nz-icon nz-icon-link1" style="font-size: 16px;" :title="$t('overall.link')"></i></a></h1>
                <div class="title-heard__divider"></div>
                <!-- catalog 目录 -->
                <div class="catalog">
                <ul class="catalog-square">
                  <li>
                    <div @click="jumpClick('#log-queries')"><span>Log queries</span></div>
                    <ul class="catalog-disc">
                      <li @click="jumpClick('#log-stream-selector')"><span>Log stream selector</span></li>
                      <li>
                        <div @click="jumpClick('#log-pipeline')"><span>Log pipeline</span></div>
                         <ul>
                            <li @click="jumpClick('#line-filter-expressions')"><span>Line filter expression</span></li>
                            <li @click="jumpClick('#label-filter-expressions')"><span>Label filter expression</span></li>
                            <li @click="jumpClick('#parsing-expressions')"><span>Parser expression</span></li>
                            <li @click="jumpClick('#JSON')"><span>JSON</span></li>
                            <li @click="jumpClick('#logfmt')"><span>logfmt</span></li>
                            <li @click="jumpClick('#pattern')"><span>Pattern</span></li>
                            <li @click="jumpClick('#regexp')"><span>Regular expression</span></li>
                            <li @click="jumpClick('#unpack')"><span>unpack</span></li>
                            <li @click="jumpClick('#line-format-expressions')"><span>Line format expression</span></li>
                            <li @click="jumpClick('#label-format-expressions')"><span>Labels format expression</span></li>
                         </ul>
                      </li>
                      <li>
                        <div @click="jumpClick('#log-queries-examples')"><span>Log queries examples</span></div>
                         <ul>
                            <li @click="jumpClick('#multiple-filtering')"><span>Multiple filtering</span></li>
                            <li @click="jumpClick('#multiple-parsers')"><span>Multiple parsers</span></li>
                            <li @click="jumpClick('#formatting')"><span>Formatting</span></li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <div @click="jumpClick('#metric-queries')"><span>Metric queries</span></div>
                    <ul>
                      <li style="list-style:disc;">
                        <div @click="jumpClick('#range-vector-aggregation')"><span>Range Vector aggregation</span></div>
                        <ul>
                          <li @click="jumpClick('#log-range-aggregations')"><span>Log range aggregations</span></li>
                          <li @click="jumpClick('#unwrapped-range-aggregations')"><span>Unwrapped range aggregations</span></li>
                          <li @click="jumpClick('#unwrapped-examples')"><span>Unwrapped examples</span></li>
                        </ul>
                      </li>
                      <li style="list-style:disc;">
                        <div @click="jumpClick('#built-in-aggregation-operators')"><span>Built-in aggregation operators</span></div>
                        <ul><li @click="jumpClick('#vector-aggregation-examples')"><span>Vector aggregation examples</span></li></ul>
                      </li>
                    </ul>
                  </li>
                  </ul>
                </div>
                <div class="page-header-label">
                    <p>LogQL is Grafana Loki’s PromQL-inspired query language. Queries act as if they are a distributed grep to aggregate log sources. LogQL uses labels and operators for filtering.</p>
                    <p>There are two types of LogQL queries:</p>
                    <ul>
                     <li><b style="color: #3C92F1" @click="jumpClick('#log-queries')" class="log-link">Log queries </b>return the contents of log lines.</li>
                     <li><b style="color: #3C92F1" @click="jumpClick('#metric-queries')" class="log-link">Metric queries </b>extend log queries to calculate values based on query results.</li>
                    </ul>
                </div>

                <!-- Log queries -->
                <!-- start -->
                <div class="introduce-view__content">
                  <h1 class="page-header-one" id="log-queries">Log queries</h1>
                  <p>All LogQL queries contain a <b>log stream selector.</b></p>
                  <div class="img-hidden"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkYAAAIPCAYAAACWihHIAABZK0lEQVR4XuzdC7ylU/3H8Z9b5JJE7pdBSDepSAmDoitdpFBModCFVFL/MhJKiopIxSil+82llDLjTq6JEJlBuadE7tX/953fWmevvc6zz+wzc2Zm77M/79fr9zJ7Pes8+9n7nP//+bbWep7HDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHNiHa9V60aMudW81q4b55GVvNarGwEAQDudMB/zus9rwWrb/HSJ17F1Y+UlXtO9Xl1v6EGLeP3D61Gv5attY0371/fynqLtb15PeE0o2gAAGGjXeh1RtS3m9Suvk6v2+U0n8h/UjZVXeP3P6831hh71Ha8zvJ5SbxhjK1t8Lx8p2r7mdbbXkkUbAAAD7V9e36wbe9R4DEbzSlMwAgCgby3ktZ3Xoam2T221g7wmei1qMW3yea8DvNYs+sgWXpMtpnGuSP/evdj+Aa+ditfZM7z2thhl+rjXBu2bZ3q2xf5W8HqWRT8dxySL42qiKbAPeR3l9VFrXvsyp8FoQ69PWBz7Xl5Pb9/cZiOvT1kc9w6pbRevPYd6NNPoiz77i72e5vV+i33sbzFFWdvV4vvMyu9uDa+PWfz8Hl6LF/1q23od5nWk1zstRv1KTcFoR6/9itf6G9F7r27x3gfarN97GYvv8ksW3+0m7ZsBABh7OqEqvOjEpnCg0r+vtDjhlf7j9VmvCy1Gg6Z7PWyxlqQ8qX8wbVP/3O+nxfabvE4vXotOvg9Y7Ev9tT5Gx3GMta9FemNq13vovWd43ZvaLrX2cKRwd1Ladr/XVRb7fdJrt6KfzG4w0rEdn9q1bx27PsM/vV5Z9JMFrNVX29VX6610jJpevKzVtdGKFj+rMPona73f4xbfhb6b0m+9rile5+/uHRbvf5fXrantdq/ntLrOpMDyC4vt6jsj/fsvFqE0awpGP7Hon21l0UchTn8Tt3ndndr+aMOn3F5qsT3/PWhNmvpqBFLfIwAAY04nmN95Pei1TdGuE7pCyrmpT6ag84jF2pV8IlvO4qSuE5hGTUqdptLqYLSGRd/fW1xJJVo8/BmLk2E58pBP7jqR5/dTONFIl9rLERKNmKhNIw45MD3V63yLz6d/Z7MbjHSiV9shFscsGhVRyNF75M8jCo/qq5GrfDy6Ok99NbrWbTDS76D8TNqHQuFDFt9l1ikYqd+7inaNYCn4XGetzyBajK730mhWpu9c35WCc/7bGE0wUth5edGuUSu1awQp00jRnRaBfa3UtrBFH/XdJ7UBADCm9L/KdaLRyb2m6S5t27RoUzC6x4ZPfSgc/dtrStXebTDSlIqCVdOl5VMtTsR51Cif3Pcd6hF04tQoyKlV+wts+NVvkyz28cKibXaCkUakdAI/Z6hHi0ZUNDKlEbZMozwatapHPNb3+q91H4xusOGfaR2L34+mvLJOwejbRVumUSRte0N6vazFSNSnh3q07GzRNwec0QQjTSGW9F3ou9ci8ezD1vmKNv09aFE/AABjTus2dLJapd5gsQ5F27SuKNOJtw4e2Vlet1Rt3Qajyy0ul2+iESAdx3PT63xy14m2dr3F6FUTjUK8zGLtyy8t9rFZsX12gtHz0+v3DvVopxEwlShoqO/k1uY2CjvdBqMv1BsShaALitedglFe11RayuL3m/f9Jou+r7MIKGXpe9Q2hWcZTTDSfmv63Wt6NtPvR8c9oaG+bBEiy9E+AADGhE4y+l/mnWga5avFa504NQ3U5ESLKZpSt8FI02KdQolOzDqhbp1e55P75kM9WjQio4CWaVpIwW66xc+oNLKlADUWwehV6fVrhnq0+5HFGh7Rwmf17RSipln3wagMICWFwj8XrzsFI32OJlqzlEeTciAdqXJoHk0wen3Rll3sdVHxWtN09XvV1bTYHACAOZLX5SxRb7BYv6L/Zf65ok3B6BvF65JCwB1VW7fBSIGm00iPrl7TMWodjIwmGH3Rou/JFlNEWvsjeTRkToNRnop821CPdr+21rSP1hqpr0bpmmgBcrfBqGl6SzTqotG3rFMwagpymhbU1JnWFck7Lfpua8NHbXI93cJYB6NzLcLRhBGq6apJAADmyFstTlYalalpMba2aT1JpmCkBbo1re9RsPhN1a5gpJGkWh2Mvm9x1VjT9MgJFguTdXm6jCYYafREJ9mabjUwFsFIwUDHdvxQjxZ9lnLN0wIWwVEhoDbB4rvtNhidXW+wmArTlWknF22dgpEWtdfyZ9Pl8aL1V3o9KXcYwVgHI41S6m+nvi0AAABzlUaKdDWSFgSXo0ZaXK2TtK4g0gk308lbJ7fdijbJVwtplKGkfddhSepglENYOTolugIqXwWXjSYYafREIzbl6II+j8LCWAQjUfBRICkXcssRFn3LS/a1qFhtWpCtETnR+i6N9ChgdRuMNJJXXkUomhbVtjzlKJ2CkS59n1C061jOs7g6cfmiXaM2Wjem9y0dbBF61k2vxzoYbWzxt6bPVNLvTsH8u1U7AABj5tUW4WO6xcLbIy3uU6O2eiRJJ6vTLE6smjqbbDEFphOerirSqEhJ02japlEbXc6e1cFIjrHoO81iqkg/q/VAN1r7yXo0wWhPi7468epYFVZuTa/VPhbBSKFBn0fHqmPW59TnVb+ji36iK8lOStu0Hkvfub7Tr1kEk26D0Q8tRlS+ZfFd6WfVXk9bdgpGp1jc++krFmFUa64UtnSzxZKu6FM/lUZxyt/3j232LtfvJhiJ3kv9L7WY8tWViwppmu7TtCgAAHONRjv0v8J1gr/ZYhSkHgERncS/ZHHn5XMsTuwabdKIkRY61zQVomkbnfB1Ms80AnR48TrbxeJybO33DxYn7byOJVM4UR+dtGsnW5xAS5Msrgy7zSIk6EoqhSrt4/mtbjNP9DoZj0T99XN1KHuGxftq/zp2fTdvb+vRTuul9J3p/XJQGE0wOsAiaGikSe+nz6d7+9TBVGusyqnMHIy2sAiNWtekn9fUXNO6I1nDYl3ZDRZ9FWLeZ+2jcLriTt9LudZKAVFTpNmLLProiraaQlde21TSWjAdm95Xpf3ltWYAAMx3ORhh9jWtoxKN2jSthyqVwWh2lMEIAADMIYLRnHmvxQ0hNXpS2tUisBxWtdcIRgAA9BCC0ZxZ3+KeTbp31PkWdwq/2iKsaI1NudC9CcEIAIAecpDFYm3MPt12QGt0tI5Li6N1OwLdq6mb+/IsabEuadN6Q5d0k0n9/Br1BgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB9aUGvG70WqDcAAAAMmqUtnmq/RL0BAABg0KzodYnFyBEAAAAAAAAAAACAIS/w2sbrd/UGAACAQbKY1/1eq6X/Lt++GQAAYHDs4PXb9O+ve32y2AYAADBQLvB6S/r3+l4/L7YBAAAMjEW8DjMu0wcAAAAAAIAsWzcUVvD6jdfT6g0AAADjjRZcX+e1UL2hcIzXmRbTbQAAAOPS1l53e21Qb6gs7PUTi8XYIwUoAACAvrS6111em9YbOlA42rVuBAAAGC/0wNjZpWAFAADQt/Soj13qxtmg6bQ/eP3Ma71qGwAAQM/Sgukdvc7zut7rde2bZ9tTvA6wmI47utoGAAAw3+nmjBO8NvNaILUt4XWGxR2ttU5orOn5auXi7c29PmBxDBOMxdoAAAw50WLK5W9e//N6YbHt6tSWS091z66ptj2v2HZtte05xTZddl5u02MtMo2WlNvKKaAbq23rFNtuqratXWy7udq2VrHtlmrbhGLbjGpbuV7ntmrbqsW226ttqxTb9B0/4TXd63yvZYpt85IC0bEWjxfRsXyk2PY5az/+jxbbjqi2lT93ZLVt/2LbF6tt+xXbNJJVbvtgse1L1TaFuewr1bb3Fdv02cptexfbjqu2vbfYdny17T3FthOqbXsU275RbXt3sU3/91Vum1Rs0/vpb/DXFt8tU54AMI/phPg9i3UsmUYSFGpWKtoAzH2Leq3p9Rqv//N6brFtueLfAIAxpvAz1WJE5v1eS7dvBtBDNMWqUdBvW/toJABgjGi6apKxlgToF0t6Tfa6x2unahsAYDZoDY7+nyuA/qV1fWN1lSIADCzdKflOr1fWGwD0NV3VCAAYhU0snq1FKALGF93r6rvWus0DAKALp3ltWzcC6Hu6H5Vu86C1RwAAAANveYv7Yb2i3gAAaKfHPwAY/7b0ekndCABo2cjr4roRAABgEOnho5PqRgDjmkaJGSkGgIouzddzxLiMFxgsJ3ntWTcCwKDbNRWAwaKrTy+tGwEAAAaRHvFzr9fK9QYAAIBBdJTXxLoRAAbVdl7r1o0AAACD6GyvbepGAACAQTTDa0LVBmBwLGzcBRsAhjzgtVTdCGBgLOH1UN0IAIPqIONJ28Ag0//96/8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEC/muj1Oa9DvVZPbdt4rZc7AAAADIKPev3P6wGvu71W8HpxapvR6maHp7anFm0AAADjyp1el3stWrQt4fVdrw8XbU3BaJ/U9qyiDaNzv9eUuhEAAMwfT3h9tW5sQDCaOwhGAAD0gO29Jnv9x+uS9O8PFNs/7rVd8boORv/ndWZq+7LFzz87bcue6/V5r1O9jrP2/WWvsZjOe4rFCNXPvHZr69FsLa/PeJ3i9TWvN3ot2NYjApuOa1WvDSwC4Hcsfi6vpaot4jXJ6ySL4/6U14plB7eYxX5f6rWh1/FeU9t6xHSk3kcjb9+0+Ezad7aZxT4e9roq/XvPYrvoO9nF6xsWn/MTNvxYZG+vt3qt5HWE16+8XtDWAwAAjOhjFifz/3r9Nf1bJ9/sXxYn9KwORmd5/Tm1KVjp51+RtolO6I97/T1tu96ir4JCGWCO8brH68deD1pM632w2N5kR69HLdZFad/XWexbQa0c0do2te9rEUCu8Dov/VvvtVWr60xLe51v8TNXWuxbff/h9fKi3zKpzxSvR7xu8brGa4G0/ZMW36vWbCmkXJxen22tz/4Oi/1rxE7Tmfq3Al62rMX3mo9Fx/1vr396bVn0kz9avM8Mr3stvsONyw4AAKA7OjF/pW60WQcj6TSVppEjBZcfeS1etCvwqP97ijYFI7X9wmvJor2TtS3CyjkWQSbb1WL068iiLQcjBbTXFu2reP3J6w6vpYr2E70e8tq6aNMIjYLHrRYjOJKDkULRq1NbptEpBbbTrP2zK5zpZ15ftEmnqTSNVuk71IhapmO52iJIKjhlOj7tW4GsHjUDAACjMDeCkabWNFKkRdw1jZ6oshyMFCi6oam5J73WqDe4H1gct6a6JAcjTYvV8rbd0msFDX0XmiKsvcqibw5XORg17Vf0HdUhT1f76Wc0HVZqCkaaElPIO6pqF40EaT8KWpmCkUbvAADAHJobwUhrZhR+JjaU1hBpSihTMNKITrcu8rqsbkw0fafj2SS9zuHn7UM9Wha2GPHJ01cayVFfrdeZWJXWRmnbgTN7toLRQel1J/pe3mDxPWkESD+jdUelpmC0g0XfLar2TCNdGo3LFIw0TQcAAObQ3AhGt6f2kSovRB5tMLrJYpqqidbeaN8KI5KD0SuHerQrA8a7bPgx1qWbYEoORlqY3WQ/i33nn7vLYqpQ/+4mGO1l0Xfdqj3TWqmpxWsFo98UrwEAwGyaG8FIJ+ozqrZORhuMfu91Yd2Y5JGWvAg8ByMt1q4tZLFWSVd8yZss+upKs1kZKRjpvbRNI2NbWGs6Uf/tNhi9zaLvy6r2bIbF/jOCEQAAY2QsgtE6RZt8y+LqqLxYuVQumJbRBiNd9q9FycvVGyxCjrbl98jBSD9TU2jRNo3OyASLK8c+kjsU9DnKzz1SMNItAfR5yhtmikZ/OgWjk6s2LTDXsRxctYsWtms/5VolghEAAGNkToKRrgRTW566yja1WDysQFJeJaUTvhZll7cFGG0w0n2DdMzfsxj1yRR0HrP2BdE5GGkt0UZFu65E0yXtuvS9DFi/tDi+5xdtcrTFPvK9gUYKRpMttpX3EdK0oW5H0BSMdLWbLsvPl/pnv7Y4vnI/WlT+W4tbDaxWtBOMAAAYI3MSjJ5pMTKk0KAprjyFJVqorFGPmy2mirSWR5fCq38ZPEYbjERreBS8/mIx2qJ7+OhKNYUdhZYsByNd3aVj1Dof3eBRa370uespNl0Zd4NFwDrd4ri1kFz7yFNuMlIw0o0j77P4/rTgWvuYbrG/pmB0WGpXn/I9tB99dzqWn1uESd1vSq811VYiGAEAMEZ07x5dzVU73mJBcqb1OzrJl3dvFo0C6fJ8rSmqFzlrMbRO6FMt7jukEFDfufkd1h7AuvVyi1CkfevGjrpHUhnaJAcj/VeX3CucqP+3rX0EqaRpOE1TacRGfRXo3tzWI+5PpO9CV6s1WdPrBK9LLT63QqIu39fP1PvSiNoeXj+1+M5LCmC6A3k+Fm2vR7PkUGueAgQAABhSBiMAAICBRjACAABICEYAAADJKhaP/NB/AQAAAAAAAAAAAPStyV63WdzwUbcw0C0G9LBbAACAUXuLzfqJ971ON5nc2Gtfr/O97vSaZMPvjA0AADAi3ehQd+AeT17kdYHXxdb+GBAAAIARjcdglH3I63aLoAQAADBL4zkYiR5Bcrc1PxYEAACgzXgPRqIH3+rhsuXDcgEAAIYZhGAkn7d4uC0AAEBHgxKMFrW4rP/F9QYAAIBsUIKR7OV1et0IAACQdQpGK3pNGKGWsv7zFK+/e61QbwAAAJBOwehcr/+NUO9tde0r37O4+SMAAMAwnYLRC70mjlArW396p9f360YAAADpFIzGK93s8Yq6EQAAQDoFo/E6YrSS1x11IwAAgHQKRuN1jdFCXk/WjQAAANIpGI3XESNRsAMAABimUzAazwhGAACgEcEIAAAgIRgBAAAkBCMAAICEYAQAAJAQjAAAABKCEQAAQPIWr4PqxnGOYAQAAJAQjAAAABKCEQAAQEIwAgAASAhGAAAACcEIAAAg6cdgtJjXG7yWrDfMY9t5TfY6wOJYFvR6rdczy04AAKB/9EMwOt7rguL1wRbHfXTRNq+dYHEMD3jd6rWQ186p7ZdVv/OL1wAA9I3dLEYAFq43jGP9EIx+4jWjeL2x19leWxRt89IyXv/x+pHFKFE2wetMi4CU/cxrevFajvF6vGoDAKDn/M4iKDyl3jCO9WMwmt/Wtfje3l9vaEAwAgD0rV9bnPA0LTIo+jEYrWkxsqeAkr3PaweLtT77e02xmILbrOhT0qjgO7y+btH3o17Lt/VotofXVyy+tzMsjuPtadvT0uuXp9dSBqOnW2y/1OvJ9G/Vsml7phExTRPquL7o9ZL2zTPt6jXJa2mLu7X/1GujsgMAAHNKa0P+WzeOc09Y7wfBOhhtaRFMXl+0/ckiHOhZdzd5TfN60OL3+e5Wt5kUYKZZ7ONai/VLj3rdZxFKRnKc1yUWP3uj11SLZ+zJqqn9w+m1lMFoRYv+f7U4Lv1btVraLh9P2+5O2+5Mr9Ve+q3XhV5XeP3T4jNr4TcAAGPmdBs+xbGytf6XfVN9otW1L93utUrd2GO6DUZqK38fK3jdbBEyyvD3Ta9/e21btCnUXO91i9ciRXuTPJW2d9U+q2CUdZpK28bi5zVKlI9B/9UCboWjciRKwUh9v2qDNfULAJiHfu71SNWm6QmdgDrVQ62ufUmjH7MaJZnfug1GM7wWKNpEU2Tqu3Z6rWkrjZJ9cqhHy2ss+paBqcncCkaayr3a2hd0y6Je93qdWLQpGN1vsw5xAADMth9bTL8Mkm95vadu7DHdBiNdqVbTOiL1fVF6rfsf6fVeXhOr2j5t032JRjK3gtHDXj+w4celutLr8pm9goLRH4rXAACMOZ2U/lE3jnNv9jqrbuwx3Qajps+xi0XfF6fXu6fXI9XhqW8ncyMYLWXDj6MurSPKCEYAgLnuVIspi9J4X2O0uEUYXK7e0EPGMhjpyjW91ujQhA6l+xSNZG4EI02faYpPV8lN6FDlWjCCEQBgrvu2111V2wssTmyd6rpW17715VS9aiyDkdYa6fV+Qz1atIi5m4XMYxGMFIJqmiq7qG5M6sefEIwAAHPds71eVjcOAC1I1pVb69QbesRYBiPRWqR7LH7fpS9YLKZ/XtVem9Ng9DmLfmtV7Xum9nq/uhpNQepjRRvBCAAw12nabFYnxfFKN0jUiMVT6w09YKyD0RoWl/HrCkTd+2iKxf2P1O+kol8ncxqMdMNGTaXp/kN6jppuKyALeH3XYh8aOdJx6UrJxyyON/cTghEAYK7SGg/dTE/PwGq60/Ag0IlYC9B1gu4l77cYzcnWtzjWFxZtWjBdBpJMI4DqO6Fq1zqigy1uoniNRQDZsewwAgUU7XOrql37VPuri7YPeB1ZvM429TrFIszVYVxX0p3u9UeL0a1PWtw1u6TbEBxStQEAMKb0v8D/ZcOnOAaF1tecYxGOenHkCAAAzEO6O/KgBwKFI416XGa9u+YIAABgntL0lRZk62q1Xr6UHwAAYJ7Q1WoKRlokrMdV6MnyL7X2h54CAAAMlOdaLALW1VK59GR5AACAgbG11zSvv1o8wPRtFje8XKnoAwAAMK7p0RO/87rWaycb/rR3AACAgbCt1x0Wd1nutfsZAQCAeWhNrxfVjQMkhyI9ggK97UKvv3gtXW8AAGCsHGrxaIhBtJHF5fm66gy9TSN5f/b6u3ErBQDAXDSowWgRr+u93lRvQM9a1GvJuhEAgLE0qMFIz906rW7sQQtbjGi91uLquNozLZ6Jpn4lvVa7totGXPQ6T0Ot57WNxTPymtZV6ef0gGGZ4PUWiwfJlnTPp1d6vcpr+WpbKX+G19jI07YKPRMt+mmKt6bntWmRfJPVLY7jFV5LVNtEQXiC1+LptR6wq8+vZ9ABADBkEIORHgFyr9fa9YYes5nXbdZ+L6UrLEJN9rrUfkDRJlpIrvbXp9eLpddq/2r6d64/2fCHuv7I4kGzH/F60qLfe9I2BanPeD2e2lVPeB1rEUBKWsP1N2t/P/295cCW6fgfsfZ+37D2qwN/6XVD8VqeZnGs/7XWz+nmnB8sO1l8Pm17l9e56d+5fmrDjxsAMKAGMRgpTOjk2MueYxEULvHa3GK04w0WQelWa59S+p7Fg4DzCI/+q9enDvVoBSMtXla42sJin5pKVHC5y+sZubNF2PiHxboe3ctJx5Pv5fRpiyDyBYuQ9qzUpgB1VOojK3r92+K71kjRUhajQVonVI7WvdHi2BSsNFL0dK8PWbyH/pvVwUgBbarF9/QBiwcha1RNn1v726vVdSgY6bMeYTH69WyLZ+Spff9WVwDAIBvEYHSS1/vqxh7zM6/pNnxNjaaAdCIvj19TTAobp6TX+u891j4qk4PRgxb9S1qErhAyuWjLozAKRCXt8zGLUFQ7xmJbDljbWbynRo1KGgkrrwI82us/FmuISjtYhK6sDkZ5/2UAEgUm3ZPqfmvtMwcjfa8lPURZQbPXgzIAYB4ZxGB0sfX2lWia6tMoiKarmmjUR8GlpCkiBRlNSem/ukllKQejH1bt2dVelxavtf87i9fZrhb7KQNLpsCjbRqRk+en1wo0Tf0zTXup3+HWPmpVq4PRNy1GpOpAJQpV2qfWQEkORnpQcO0Mi5ExAAAGMhjdbp0X8fYCLSTWSfw+i1Gjuh615hGOqRY/d2a9wVrB6LP1huQHFvdzyhSMNG1XO8hiPzNs+HH9NW17d+5s0T+vUbrJYt3QVsV20bEpnKiP+l5mcZz1Yu86GOlZdn8oXpc00qX97Z5e52BUHlv2C4uwCQDAQAYjLRTWFEqvWs3iJK61Mrt1KF2lVlK4UPDQz/3RYtSplIPRkVV79hOLwJh1CkaftNjPPjb8mHKVi8NFQU8jNd+3mOLTz5drkTJdIaf9/8pixEyLu8vbKdTB6CyLR7g0yUFoUvWaYAQAGFGnYKSTmR6iOtXrQGufrtjQ6+3F636jE2Qv0xVSD1ms2emWpqG0TkcBRP+d3L55KBgpdDRRMDiveN0pGO1ssR+FmNmhv6NfW0z3aXF2J1pArqm8MvjUwUhX12lNU70OS/KUn6b3hGAEAOhKUzDSaEq+y7AWsep/uWt6Q2FJTre4OWK/6vVgJLrSTFNp+UqzTFeGaQHxlkWbrsTS70hBQY6zCAzPHerRCkYaLSvbRaMy2lZeAdYpGC1jsa5Hoz81jRadYNFHdO8jBbElhnoETZPp/Sak15pu+9rQ1hatebqleF0Ho4kW+/lU0SYaLdOVd7oCLY8MEowAAF1pCkYbW5xEdGm1aKGy1o887HVz2qb72/SrfghGa1gE0xkW9w+a6LWLRSDVGqMNUj/d50cBQqMr+eaNutxdr3Wpv7ZLDkZXWkyZ7Wmxz49bjE4pcKhP1ikYiUaltC8F5Ndb7EeX6+u4LrLWDSN1A0WNDE2z+FtSP40+aprs/NRHclA63iLwacG0RivVdkjRrw5GogCpETJNzekGjwp5Wn+ltnIajmAEAOhKUzDS/+KfaK27BIuuFtLJb4rFdEo/64dgJFp8PNXieHNpJGTTos++qb2+Ci1PeeVRoHLxtX5GITfvU4u18z2KspGCkexm7TduVCg62SKUlXS1nEJa7qeRLIWZ8nlnmjrUJfsaicr9dA+lg23WN3hc2OtzFvdtyj+r8KjAViIYAQC60hSMxjudIPuJQukEG/mxG7NSX5WmdTkTrDXtNbs0vTrB2kN0k9yvaT1QpvVHE1Ip8IyG+k+w4QEPAIBRIRgNhjoYAQCABgSjwUAwAgCgCwSjwaArtaZaLLoGAAAdEIwAAAASghEAAEBCMAIAAEgIRgAAAAnBCAAAINGdigftpngEIwAAgIRgBAAAkBCMAAAAEoIRAABAQjACAABICEYAAAAJwQgAADRa0WuC1wJV+3hGMAIAAI3OsQgKi9UbxjGCEQAAaHS2RVBYuN4wTi3o9WTdCAAAIGfZYI2grOB1Z90IAAAgZ9hgjaBs4HVV3QgAACC/8Hq0bkzG44LsXbx+VDcCAADIT70eqtq0EPtUi5EkbfuMta9B0rqktxev+8l3vXavGwEAAOSHXg9UbQdahKKDvI72esJrqteGXu+2WJP05qHe/WNxr/u8Vqo3AAAAyPe8/l61neZ1bvF6a6+7LAKRSiFpkWJ7v/iYxecFAABo9B2vu+vGBkt6bee1hfXnpf3LWXzOdesNAAAA2Z5eX6obxxkFOY1yHVJvAAAAGCQKRVO8fm7j8yo7AAAwhk7wOs9iqmm80WfSSJFC0RLVNgAAgDYLWdzDSAuqt6q29bOnWiy01poiTZ8xUgQAALqyjcUl+P1sZa8XWNy8UYvJdUm+rj5bp+wEAAAw3k32+qvFYz50R2uFPO5TBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADod5eZbXq52cVe0/3fu9fbgdl1pdnL9HfldfUVZjvW2wEA6CkXmC3lJ637vZ7wE9eF/t+31n2A2eVBe0P/m5rq9W+v//jf2AvqPgAA9Aw/cb3WT1j/8/pMvQ3z1F+9flg3jhf+d7aD/s48GH2i3gYAQM/Q1FkKRjvX2+bAQl7/8/pCvQEdzatgdLjF7+ap9Ya56Uqz56S/s6/U2wAA6Bl+otonnbDGcgqNYDR64zoYXWH2rPR39vV6GwAAPcNPVB9MUxxvrrd1sJjX+7y+73W21+e9Vi+2v93rZIuT77VeU7z2L7Yf4/UOr3W9jvOa6rVasf1ZFvvUvvUe7/ZapNieLez1Tq/jLfrqv9u09Qhf9drJa22vL3mdaREOnpG2b+X1Ta9fe032Wiq1z8qSXvtZhBn9rPa5UluPsKDFomN9lt94He21QVuP0CkYbWSt7+lErze1b27zaovv+7cWn3vzYtsSads1Fr+bb6fXE4o+8lKL9zvD6xter23fPNPWFj/7NK+9vU7z+lRbj8qlZmvq7+wys5PqbQAA9Aw/WR2YgpFOqrOytMWJ9TGvs7xO9brP6y6vtVKffbymWZx8b7M4oR+Rtsm9Xj/1+ofXTV7nW+tndQwPpW3a/+8t9nORxYk9U3i5OG37g9cpXtel1x8t+on29R2LY5xmM8/RM/td5fXetP1XXn9M7drvAvrBETzT689ej1oEiO9Z7Eefd9Win8Kbwo72q+9Nn+kOryds+NV/TcFIAfTJtE0/mz+jPk99jF9M226xCGo3p9eHpu36zvS7uDW1n5ter5e2i8KNtk232Ed+v29ZBLxMx6V2hZyHbeYafjus2D7MJWYrpGCkgAgAQG/yE9UJOmFdGiM4s6KRH50QX1G0aZREJ/tPFm0jTaUpGP3XYrSntLzX373OsQhg2bYWQaLc165ej1t7uNCJWwHnQWufJlJgUbjQfrIPWxyfQt3KRbtGqurP12SyxWd4YdG2htc9Xh8q2g7w+o+1f9aneP3MIlxOKNrrYPRii+PWaFY5YravxTFOKto0Dao2hSN996JQpuCi43xJapNOU2mvtOirUaLy/fQZ1P/9RVsORp53bNmivSPvvKD/nT14WYRcAAB6j5+k1rs8LtXXqEs3jrQ4ea5YtZejCTKrYKTRiprCigJQGVQyTfsodJSjJE1TXhoB0vs+p2hTMNLUUklhTv2+VrVvmNp3q9pr+jkFs6dX7eX3oGO93WJ0p6bvT6Hn40VbHYwUatSmIFW70mK0J9Oo243WCkWZQotC3MuKtk7B6Bdedze0i0bZNEKW5WC0ZdE2S/73dsrlccl+GVIBAJj//AR1kNdjXtd2OVokGknRCIimaXRS10hEHYpkVsFIU181Ta9p5EmhpC5Nv2h/9RoehSOtiVEfBQCtaVK/coREwejk4rUsY9Gvnv55bmrfo2qv6cSuftdbTN0pUNVTW2ta9FHAqT+PSselqcisDkYKIppKrH9OpSCk0S7Rd62QpbVL3egUjPR7+W7VluUpNk0hSg5Gzxrq0YVr/Hv3UHQ2U2oAgJ7jJ6cjdYLyOu/37YufZ+V11lr7o7rfYiRJi7Kz2QlG51lrn50qr4fRSIhOrBq1UfsjXldba21THYymFK9lToORvMVinVI+No1oaT1PnobSoun6+OvS+qSsDkb6Xuv+ZWl0TfRd6HW39wdqCkYKdRoJPKpoK+1p8TPrp9ezFYym+t+I/719y+u/Ckj1dgAA5is/OW3mJ6mHLo+pktHSCXl7rx9YnCR1xVQ2O8FIUzl/qhs7+JHFGp2PWPvJ+R0W7zsvglGmtVG6ok/rhvSzuvJNdFyj2VcdjDQqp885KwtbjOLN6YiR1ndpyrKJQpd+ZoX0eraCkf+dfUWh6PIY9QIAoPf4SWqKRo50n5l6WwOdhJtGly60uOory8FIi4FrnYKRFm9rSqhpjZHCRzlV9TevnxevM03vzYtgpHU/q9aNFlee6Uo70XelUaTvtDYP0WfRZyrVwUgjYppabLpVQQ4omUbwbrDh05qaalQIKddc5WC0eNEmWriu77VpTZNG86YXr0cdjLzzAv53dt/lM//kAADoUZeZ/V8KRt1crv87ixN4XmsiGjlSm07OJV0dpvv21DoFI90LST+jE/QSRbsWKuukXI5q+eHODALlqMfaFkFiXgQjfVaN6JSLr7X+SZ9N31F2qMVojqbdSvtYvI/u+ZTVwWgLi+mtY6098Gxg8T2V9wOaZLG/Q4o20Yid2rUOKzswtW1ctMnrU7um08oQmqfRytsgjDoYXel/M/o7uzxGGAEA6E1+oto3nbC6ufO1rkLSvXvusxjR0FSP1sJojU99hdIxFidPjUKcULR3Ckayg8W+1OfHFvv/p9e/rP1mhTpWhQbdN0j70ujRv601nTW3g5FChNb46CouLaD+idcDFoGlDCGLWtx/SPtUmNNx5Psv6T5B5WhQHYxEI2D6nDMs7pV0usUU4u3WuveTKMho39qvFoTrvkN5/VOe2ssUZvR96vua7rVOse3zFj+jK9z0verqN73W59MoYDbqYOR/X6vr7+wybvAIAOhll6dHgvhZ+231tg4UHvS8q6mpdDJtOkHqRKqAoRN2OZKhkYeR7t6saR+dzLXvc7w+Z3GPoJqCmMKZ+ilEbW3x5PbJ1j4d9zGLtVAlLRRXv62qdo2Eqf1FVXsT3cPoeIv31yjRZ635OPU97Gpx1Z36KrzpvkaaaivpHlFN4VSBUOu39LMKU1rvk+/aXdMdtvVdqK++m+3aNw95tteXLX435b2YRN+jwkveh46pvuJOo036njodxzAeiNZKAVz3SQLGgv4G9T+OdD8t3e/rVTb8/64AYHT8hPXu9L/kd6q3AWPlKrN1UjDS40aAsaK1fgrq+1rcxuJOi6nlOswDQHeuMHtDGjHq9nJvYNT872vbFIwOqrcBY0ijvRdYTFk3XSgCACPzE9Vyl8cl+6pTdQKr+wCzy/+e1ve/q5O97kwBfJO6DzAX6NE8WovXzbQ4ALRLo0Yz0pRa+awvYI7439SWaaTo75fHfaeAeUVr7HSBBOEIAADAIhxp5IhpNQAA0JUzrXWVaVPlR8H0K42Ca80RC7IBAMAsjfdgpECkBdmTqnYAAICBtKHFzWa5zxEAAIDFqNE2dSMAAEBpvE+lZboJJHdeBwAAI9KjbaaMUOVz+frZRtb+MGoAAICBpWco6mHNAAAAA08PdH6ibgQAABhU/6sbAAAABhXBCAAAICEYAQAAJAQjAACAhGAEAACQEIwAAAASghEAAEBCMAIAAEgIRgAAAAnBCAAAICEYAQAAJAQjAAAwzNFeX6wbBwDBCAAADHOb1/S6cQAQjAAAwDAKRTfXjQOAYAQAAIZRKLqhbhwABCMAADDMjV7XVm3P95o8Qr231bVvEYwAAMAw13ldXbXtbBEcOtWVra59i2AEAACGucbrirpxABCMAADAMFd5XVo3DgCCEQAAGOZyrwurtk28poxQn2517VsEIwAAMMwlXudVbdtbXMbfqc5ode1bBCMAADDMSl4r1o0DgGAEAACGWd9rvbpxABCMAABAm1W8Hvd61AZv1IhgBAAA2iztdavXTV6LV9vGO4IRAABAQjACAABICEYAAAAJwQgAACAhGAEAACQEIwAAgIRgBAAAkBCMAAAAEoIRAABAQjACAABICEYAAAAJwQgAACAhGAEAACQEIwAAgIRgBAAAkBCMAAAAEoIRAABAQjACAAC2iNfEWdTCNv71QzDa0muHurFLL/HazWuBesMcWsNiv8vXGxos63Wy191e93ht6LWE16leB7a6zWzXPgfh7w4A0GNWsAgFI5VOaCWdXF9lcfJardrWr57wWqhu7DE/8ZpRN3bpSIvf5ViHjTdb7PcV9YYGP7f4nr/mdYTXU7w2sPj524p+n0ltSxZt61n8vT2taAMAYMwpDEyYRS1o7X5ordD0qNf7i20ne11fvO4Xt3utUjf2mH4PRg94/bhudFt5rVu8bgpG701tCkgAAPSM/L/wD/Bayev49PoXXod5PWwxItBvLvHauG7sMbMKRovXDYU6GCnsasSmG9pvHY6z0QQjheiv1o0N5iQYlT8zK8t4Pb1uBAAMtsUspihGqkWHesf6jylezyza3uF1q8U0yc+8nlFs6xff8npP3dhjmoLRql7f9rrXIjg85nWG19plJ2sFI02dnub13/T6Sq/XFv1Ku3jdZK3RwYst1jmVuglGmjabbvGe/0r/PrfY/geL48vqYHSt132p7a8WP//qtE0U9hTK83fwiMW03ZpFHznI6yqLv+E/WvQ9uOwAAMDsrDEaj3SCP6tu7DF1MNKIh14/ZBEM3uL1QYvFzX+x9hGhHIwUSH7t9W6vvS1CyZNe27e6zrSfRf9fWfTdyyJEqe8ri37dBKOXWwTsx71+l/6tY83+YRG2szoYKaCdnNq0SFs/v0baJvpeFMqPS9s0mnmH113WPj36JYvv6maL/ekzTSy2AwCARNNFOkEvV2/oIXUw0rqc73htU7TJOy1CRBlgcjDSaFF5ZZo+t0ZktPg5T5cpTGjU5eu5U6KRQwUpjbZk3QSjrNNU2qyCkXSaSsvvr1HL0loWIUhhKVMwUt99ijYAANDBl1P1qjoYdbKFRQCYVLTlYNQUYDQipG0a2ZF9vf5jzZfgK1So74T0en4HI30n11Vt2fcspngzBSNN5z21aAMAAB1oylDTUOvUG3pEUzDSKI6mpRR8NBqkNTQa7VGI2L3ol4NR0+LkvKB+1/Rai+e1VklhpS5Nhanv5qnv/A5GCkUKP/VxqjQSpoCXR8IUjPQaAAB06X1el1tvjirUwUjTRdMtAoMCgqbVJlusHVJbUzBSkKqtb7Ftz/RaC9EVYuqgUdbzU9/5HYxusc7BKFdea0UwAgBgNuhk+gMb+7tEz6k6GH3DYmQnT4FleQSoKRg9u2jLtPBa216XXn/WYjFzN+FwfgejC7wuqto6IRgBADAbNMJwjkU46iYczCt1MDrT4uqzmq626hSMPl20ZdqvQku+q/REi77vyh0KuuP5G611l/B5FYx0KwW1Pa9oE12CryvlyhtEZpoaLEMjwQgAgNmkcKST9WXWO2uO6mB0iMWJfg+LoKL7+exorfv51MFIAWKGxWJr3b9KNzfUZf7qW95HSCNlv7G459Aki3Cofb/JIsTosv08mjavgpGuvFObrjJ7gddSqf0ZFpfm/9niDto6Lv2cLuvXQutyMT3BCACAOfR+iwXZOsHO70v562CkEZ7zLQJDLj12o9MaIy3K3swi8JQ/ozVF9V2wFZo0IlX2UykoTmh1m2fBSAuof5TaVTsX257rdUOxLZfWXJUjfgQjAADGgK5WUzD6p8XNETVC81Kb9w/QVQDYpGpTYNBIiaaa3m4R3pawmA7TI1uyta11JZlu6qmbJu5mzWuOSlqvpH6qei2T6P0mei1dtTfR+zeNvilUlcehO1ZPtOaH+up4NJVXf/ca0drS4jg1hdb0Ps+yuJUBAAAYAwomZ1v7qMSNbT0AAADGua29plk8p+tEr7dZrHMpR2QAAADGNT0aQzc01I0Cd7LOT5gHAAAY17a1uNrpY9Z79zMCAACYZ3IoalpsDAAABoiu9lm1bhwgG1lcnq+rzgAAwIDTAuPyieSDZBGv6y1uZAgAADDzBoJNj5kYBB+1eEI9+sfGXq+sGwEAGCsKRYN4bx7d+VmP0tCNENEfdJXgvy0e/bFGtQ0AgDGhZ079qW4cAHqy/Ll1I3rexy3uSq47XwMAMOa0xuaaujHR4x/G6wnoJK/31Y0AAGCw/dHi6emllb0usngEhh5AeoC17u2jbVO9Nk2v+9XF1j9Xom3v9W2Lx5N8xWKdTUnPTJti8Wywkl6rPT+AVYvN9fq1Fjez/ILXL71OsOZniik46gGvei6a/qvnxr2h2K523fdJ67R+ZjGa0+nBu3r47Nct/nb0fk3fvR4Aq4f4ft/ivT5nw6+Y3N/rs1WbaGrtcIvj0MNk9/RarK1HfGZ9/hdbPIPtOIvP/0Ub/t0BAAbU1RZPUC+d4nW/1z5ex1us6fi51wstnliuwLT+UO/+dLvFibKXKYx+0+L71siewsJtFk+MV0DI9KgSPbH+9KJN9Frt+VEmCgra15EWi+61z99Y7FPtn0r9Mj3dXncBv8RiPZZCzY5pmx78epPXE17nWdwx/FGvO23434aCivb/e4tgcrPFz5Uh6+le13k95vUrr1O9/m5xf6kJrW4zg8wNxWt5tdeDFp9Vn0ehXn+zV3g9s+j3PGt9/gcsPs80i2PR66YH0QIABoxOHho9Kf3W2v9X+Q4WQUknFdWxxbZ+pZNh09Pce8keFt/3B4o2HfO3LMLR84v291j01WiQ6L96vftQj1YwqkOQFqIrDCtMlDe5VDBS36/Z8CnV8y3CZRmCFJYUshSAspdY7OMTRZtGrrS+68yiTaOS6rdJ0abgqqClkaisDkbLWwSoy72WLdq39HrY4jNkORipf3ncW1h8nwqhAIABp5OYTnKz8jSviRZPnB8PdILsdZrmLMNDpt+Frs76fNGm0SWFDV1huGT6r6beSjkYaVv9HDhNi2nURVN2mULFIxZTXCVNRWk/efSopCCmbfnvRKNCev3WoR6hfv+jLcJJOcIjdb86GH3IYv86ppq+H+0zjwzmYKQpupr+x0E9pQwAGEA6kU2qGwdArwcjTS3pGH/gtVtD6cacmnIqrWcRZDQ9+pDFCE4pByOtrWmiIFWGDgUjjQDV9rXYzwdt+HEdnLZp3ZMsYzENp2kuTWFt7bV42laaaDFipasktW7pRdb8zLo6GP3Y62/F69Jm1h7KcjDS+qPaL2xw7+cFAEDPByMtBtYxjlRaS1PTwmVta5oWysHo0HpDonU9CjFZp2Ckhdj1sdSlqb3sOV5nWKwf0jaFNwW+emH1dhZTYnkf91mM7ixa9KmD0VSL6eAm61rsZ6/0Ogejdw/1aCEYAQBmnijPsRgpKE8+g0AnyF6m9TI6Rt2du1uavlL4uMtifU29mDgHIy2ob6K/A02zZZ2CkRZ+az8r1BtmYQmLtT+a4tJCbS3+blrnpek0PaalXOOU1cHop9Z8jKL1Uvr5POVHMAIAjGiCxfRFuQ5jUPR6MBKdqBUEmtShRGtxNIKkaSWNxOi/06x9OioHIwWLeppK65a0xui7RVunYJSnqN5Wb7DYT70mqZ7SE40EaR8a1REt7q5HkERr4DRtmNXBSNNu2o9CT00jW/r7zu9PMAIAzNLrvbapGwdAPwSjj1gc57uqdq3fUfveRdv7UlseHdF/9TpPI0l5VVo5EqVRmympXSM6WadgpBD2B6/p1h56dLWZ7mmkgJUXUU+2CN7l1Wb6ea2P0qiRFn2LFo7fau1Xlmkfuly/nDKsg5ECvS61P89iRCrTYmy1l4vXCUYAAHTQD8FIgSVPJ+nu5Aov09JrhYW8iFkjLQoB9WLss1J7HonJwUh3/VbguMriMn3dV0jtWhxd6hSMROuGdLm+1gsprGg/MyxGaOp7LKmfQpDCh/rdYvF+Gu3J9GBYTQPe4/U9i/fWLSI0Jbh50a8ORqKbR+o4NIWon9P9nnQ7hj9Z+0gowQgAgA76IRiJprw0QvRDi4XGGpHRVVW691CmUKGRmQlFm2g0R+2vSq9zMNI9qiZ4nWixTy3Y1sLnmq7m0uXwnegu19q/Apj2owXfm7b1CBr5OcQisKifgtkWbT2C7suke2Spj0prkdZu62G2i8XdsWvP9jrK4h5cCjkKZ7ptQWl5i+PdsGoXfce6yg4AgIHUL8FoLJXBCAAAYAjBCAAAICEYAQAAJIMYjLSYezdrfnwGAAAYYIMYjAAAABoRjAAAABKCEQAAQEIwAgAASAhGAAAACcEIAAAgIRgBAAAkBCMAAPqUHiTai3r1uLpBMAIAoE9N9vqy14r1hvlMj5i42mv7ekMfIBgBANCn3uX1mNfDXl/wWr5983yziNf1FiHjCq/XtW/uaQQjAAD62KoWo0YKRw95HeG1XFuP+WNBrx28rrIIG5d6bdvWo90nvaaPUPPqAacEIwAAxgGNFn3O6wGvf3kd5vWMth7zj0aMLrIIHRd6vbJ980wKTZoa7FRvaHWdqwhGAACMI8tYjBrpBP9Pi5GbXrGl140Wx7Z/ta1XEIwAABgnlvb6hNc9Xo94fal983y1uddZFsFDC7M3ad/cMwhGAAD0Oa0pOtTrH16Peh3rtXJbj/lHU2TnWQSOa7ze3L55yFEWfTrV11td5yqCEQAAfWoli0ChRde6Ou14r9Xaeswfuo/RG70utwga13ntmNo7YY0RAACYI4d7Pe71Da8J7ZvmK93HSAHjBq+drbfWOc0KwQgAgD6lq7vWqht7gO5jtKvXQvWGPkAwAgAASAhGAAAACcEIAAAgIRgBAAAkBCMAAICEYAQAAJAQjAAAABKCEQAAQEIwAgAASAhGAAAACcEIAAAgIRgBAAAkBCMAAICEYAQAAJAQjAAAABKCEQAA49SzvBaoG3vAwl5r1o09gmAEAMA4o9BxktcTXgtV2+YnHcuuXjd5fbra1gsW9HqybgQAAP1pda+vez3u9aDXke2b5xsFjp29brAYkbnYa+O2HmZre00coda1uW8FrzvrRgAA0F9W9TrO6zGv+y1GY57R1mP+0DTejl7XWQSic7y2buvRcpRFn06lwDe3vcDr6roRAAD0h5W8vuL1qNfdXh/zWqqtx/zzZq9rLELNGV4va988TC+MGL3N66d1IwAA6A+HWwSP671WrrbNT4tZa6Rnv2pbLzvRa++6EQAA9IdlLcKR1hM94PVZr+Xbesw/23hdYhGOLvB6bfvmYeb3iJEWhv/Va616AwAA6C/LeX3e699eD3t9yWLdUS9QILrMIiBdaTHF1nQLgfm9xmgnr2l1IwAA6F8aLVLAeMRiIbbCRFMImR+287rKIuRoMfbm7ZtnLhafMEJpdGxu0Xd0rXVeGA4AAPrYitZalN1L9zGSvCi7l+5jpEXrv6sbAQDA+LKK9c6IUUnHpGPrBS/3usN653gAAADmi5da3NBx23oDAADAIHmTxb2fCEUAAGBg6bYAp1nc+2mjahsAAMC4tprXJl77WFyO/3evA7wWKfoAAACMe5O9bvW6yOtki3sqEYgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYPx4hddz60YAAIBBM8HrP14PeC3QvgkAAGCwPMXrZK/DqnYAAAAAADCINvaa7LW41+ZeX/Oa4rW/1zOKfqXneH3Cot+JXrt7LdrWw2wbrwO9Fvb6oNePvHYrtj/Na1+Lfaj0bx1DbSGvnby+btHvU16rtPUwW9DiM2zmtb7XMV5neS1Wdmqgn3ur1wkW+9Y+Vm/rYbaz10FeS1TtL7Lor//Kiun1el7P8jrKYp8agdHr2j4W772C12e9zrD4XrPlLL4/7eMbFt+dRnVq+gxvs9b38xmvNdp6hG6+b7VpXzUd/yEWP6fv9tXtm2fSsevzP9Pr5db6O/q419JFPwAAetr7vP7n9R6vJ7x+73Wp15Nef7UIGiWd0NXvH15TvS62WJtykbWfuL9gsV7lFK9/e13n9ZG0bYLX7V6PeP3WYj+PWbxvebLWvxVwdHz6+WkW+9J+t2x1s0VSn295Peh1h9efvJYs+tQUmk6z+LnrLY7hIYufL0/8m1p8vkOLNoW1a7z+Yq3j3dBiXx/1ut9in+dZ7FOf802pX3at1y+9bvG6z+LzKaSK9nWn16NeF3pdbrFv/ffpqY/oc+v70zZ9d9qf3lv7K0PWBOvu+9ax/Kx4Lbt6PW7xnU/zutni/b5v8f7ZDqldIVK/I312fUdqu8FG/l0AANAzcjC622ujon0Dr3u8rrDWYtxlvO71OtfaT9CTLPbxjqJNwUhtCjZlX9EIiALD2kWbRnsUBHYs2o5ObdsXbRqR0DHdZa1RnByMFNg0CtONw214f42QKej93WKEJTvOIlSslV6/3+u/XlsN9WgFIx3vpKJdIz8KmwoWGlXKFIxykFDQyp5qET7+6LVa0a4gqGP4ZtGmkTTtQ6Namb6f2yxGdrJuv+86GD3PIkApcC1VtH/A4n0/WbTlYKSwuGrRvl9q12gUAAA9Lwej8iSXKQBom6ZGMk2Z1UFHbQoKRxZtORiVJ+NMYUkjGGUgkHLqS6FHIw9HFG2Zjkf7zif1HIw0XdcNHa+CylfqDdYKOLsVbQpJGj37uUXQ0aiMwkYp/9yvqnYpR5MyBaObitfZ2y36vrje4L7k9bC1vqePWfR99lCPUE8hdvN9Sx2MciDUdF9N+1SYzvvMwWj3oR5BU30aXfxu1Q4AQE/KwagcLcrWtNiWp8BKWuezrdceFiFB/b5abM/BSCfGmtYcads0i6macmQk28Kiz4e9Jlb1qrQtX0GVg1EZzEbyUov+Wic1sSqNzGga8Ysze7Zo1Eo/c4nX32z4upkcfjRC0kQ/U4YOBaOzi9eZwohC28SG0ufVe7xAHS1G9TTqpVEafU/PT+21br5vqYORRq2mFq9Le1nsM9/3KAcjjUTV/myxhgoAgJ6Xg9GEql20/kTbtDg4m+Q1PbWrNO2kqRaFiW6DkabmdCLXKEzej9bk7Fn0ySfakerY1DcHo8+n17Pyehu+r7q0qLx2tcW2pqCYg9Eu9YbkSot1N5mC0W+K15lGvepjqasMH6+x2HfeplEcfQ/l2qFuvm+pg5GmKzuN9GxnsZ8t0uv8+9KarBrBCADQN3IwyldXlTSyoG2aspGt0+vfWYwWlVNqWovSbTAqacRBJ2itw1H/vVN7HhXSe87KaIORgoX6KyB1S59XP6MgON2GLybOwUjrb5rcarHYO+sUjLSGSIunR0sjeFov9QOL4+g0rdjp+5Y6GGnRdNPUoLzL4uc1aiUEIwDAuJCD0YfqDdY6+SmkyGfSa62zKem12rsNRrqEXwu5S1rvorU7OSwsbzEKdXDuUNDPa5FyNtpgpECnIPe5eoPFmplytEW03kmhQSMzmq7Sz9brk3Iw+nHVLutabDu4aOsUjPax6FtfDSjlAuhMi61rCiGaYsuL5vV91evC8vddTufVweg7FtN6dQiU73n9y1rrlAhGAIBxIQcjXR6+etG+stcMi/UrOrFKXquyeXotCj66h063wUjBQ1M609K/My3SVuDQJfeZRj10Yq5HsyZbLAp+WXo92mAk37ZY3K31RiWNjulqrfJ2APosumQ/X06vK9r0ulyUnoOR2stRLt3C4NcWn628n1GnYKSQqVGpadYehBRONMqjKbD8nZ5q0be82k1BRZfJ35Zel993/j1K0/ddByONrGlRve7zlEOWbGMRWstwSDACAIwLORgdZTECoJEAnXD/aXFPn3I9i0YntIj4odRvisX9d3SCf9y6C0ai0Slt089qH3o/vbdO8uUVVroaSguAte/TLfrqcnr9rKaM8sl6doLRsl5XWYysnGmx7wss9qOrz/Jx6+owhQAtis40WqUQoXsl6Qo3ycHoWIvAlY9XU2gKF/UUW6dgJJri0z60XugUixCncKNj1VVr2SYWV6nptgrqk99P4Wznol+333cdjOQga/9ZrSfT/i+y9uBGMAIAjAs5GGk0Q1csaXRDJz2NAjVN52jdkULCZRYh5dMWU0+6Mu2dRT+dwHUiLUcaSjr5a0RIoyBTLUKN1snUdPI90CJEqO8vLE76ZeDSqIjeq7wnTzc0RfZRi8+sfWsNkL6DciRLV5lpIXY9FTXR4j23SK9zMNLPKxwoYOh71Gd8ZepTOtSaF3Fn+u6/ZhHWLrRYe/TCth5Ba4b03ed+OqZ6FExeZ7P+vo+04QFOdPwKwtq/1hy934bf6Xwji/cuR8UyTVl2uloPAICeUgYjzL4yGAEAgD5FMBobBCMAAMYBgtHYIBgBADAOaPHtbtZ8KTi6p+es6XvU1V4AAAAAAAAAAAAAAAAAAAAAAAAAMDh0p+o3WfNdr+eliRbP4tJjRp7XvgkDRLeReKu1340cAIC5pr6P0VbptZ6NNb/sYXEMepaXnhH2nPbNGCB6rIr+FhTWAQCY6+pg9DSL56Tpnjzzy9VeN1s8rLXf6bP8rm5E1/T8u5O8lqs3AAAwN9TBqBfc5vXTurFPEYwAAOgjTcFoitdOxet3eB1j8UT793r92CK47Ou1SNGv9Eav71o8yf1Yr5e3b260g8V7P+Q1I/1bT5gvreF1uNfPLZ74vo8NH1la0VpPmdeT4X9g8bR70Z2pte35XttYHOMvLL4HfT6tZdnL4jOe7vWu+LFhNrB4ary+Bx3LAV5LF9v1efU+mg68I/37y8X2kWzidYLFd3ey15vbtsZ27U+frbS4xWjfgUXboRbf0ZJeB3n9yus7Xm+34et2Xm+x30W99vf6Zfpvpt/1nhaf+dden/dat9he2tTi965QqO+//gyi73tnr29bfFb9rvVolZJ+Lh9TSXca/5jXjyx+V/9nzaNK3/B6i9fqXkdaHLfaXlF2AgAgawpGen108Vqh6F6LE8qtFkHixtRPoaCkxdvfTNv+5HWGRcj5r0V4GIlOujpBPup1T/q3Ts6ZgsyDXv/wOtPrQq//eP3BIgxl61m8vwLAk16/twgEolChbfpM91vs/8+p7SivH3r9xes0i/VNaj9k5k+26DvTfvWdKHDp+9AxX2+tR6u8yuL4dbx6H/07h7ORKGzqM2nUTN/dtRbHcIrFdysLW4xE3eK1WGoTHad+tjzp6+d/4nWuxT71veV96njKcPTx1K730nFP8/pE2qZgpdfaru9Tx3af1yNe26U+2Ucs+t1gEewuTq8/VfTRZ9E+1K5jm+I13eJ73Lro95nUZ4miTRcG3O71mEXw+o3Fcdzp9cKin6jPiWnbJRa/q39Z/P7q4wYAoOtgpLbvW5yURSe2b6X2jVKb7J7aPlC06eSrk5PCUX3iaqITuEYBShoNUBC5Mv0708iETuI64WU5GCmQ1O+Xg5EC3kqpTZ9JgUHtGlHIYUGhQyf1B4o2naAVnHQyL58v9xob/rllNFNpG1ucsDVykr9n2c9i3+UDavWdq28OG2tahAP9rko5BGl0rRzd+2hqL483ByMdr9aalbRf7V+BL9PnP88iqD49tWnUSv0UMEu6wlBhWgFLNNql99p7qEd835dbBLOsDkYaZbrKIujoOX+ZPv8MizD2lKJdwUjf02uLNo0eKXjrbwkAgDajCUYTijbRdJLaNb2WafQmj86UdELUFNkX6w0NmoKRTuB6L02P1TRdpNA1Ib3Oweiw3KGQg5FGNUqaMlO7pgBLOSyUI1IKheUIRm572IZP/Y0mGGlKSYGtaXqyaT8a4fq3xYleoz8zrBU8MgUjhYNlq3ZRwCivPsyf9cVFm+iz6n0+W7WLgmcZ2lZJrzXNWMqjXZmmZ9VPo4Clul8djCam13vkDoW3WWx7Q9Gmz64RpZqm+TS6Vk8nAgAGXLfBSP+ruz5prWzRV6MPohEEvdZowW4NpemPppNUrSkYacTj7qoty2FH61UkByOtFarlvlpjU9JrtW9RtX8ota9WtYtuI6D1K1qHk0fP9N9SU6DpRCNRmu6pvzeVpg3rz6+wMN3rGov33rZ980wKRtpnE4UX/VwOUzkYLT/UI2yW2hVq6+N6t0Uo1XqjTO/3uMV3oTVCWg9U02idRuK0BkuBa0sbvlZM6mCkqT29LoNqps+hYykDnILR8cXrbLLFfvJIFwAAM3UbjJ4oXmd1MNJ0hl6PVJ1O0qWmYHS2RQBokt83TwvlYFSOZGU5GGl0oTSaYKS1UFpQnT+TRnl0vBpVmZNg9E8b/n2VpfU3Na3b0rZO00IKRuU6rVJeC6QRJ+kUjHQPofpY6ipHyjTVqUXgWsuTt0+z9ilX0WiTRhcVotRHI25aF1aGnjoYKZwp/NQhPdN76r0zBSPdJLSmhejaL8EIANBmLIORTjJ6feBQj9nTFIx0ZZPWlTTR2hy97y7p9dwMRpun11qLpEXOi6Z20WLkOQlG0y3WcXVraa+/WXwvOqZ6GlAUjLRYuskRFj83qxGjiald66hGQ9NUL7K4ekyjXVoLpr+ZmkLPVhZTgwpJWmeU1cFIV581HaNofZOmx8ppPIIRAGBUxjIYyZ+t83SZpk+60RSMNF2l99KJtjbZ2j/D3AxGOsnr9RpDPYIWK2u6sSkYTa3aOtEUpK6EKxdeZ03fnaaIdOJ/rsV7KCTVJ/pZrTG6vnjdKRhpn9pHOV2WKRjWU2X6bup1Um+12PdORVv5N5fpM6nfCul1HYzyou3d0uuSpu20TSNcGcEIADAqYx2M9ktt7ynaJAeP91ftTZqCkU6UuvpJU3HlFVMKSpqCOqtom5vBSIuM9Von4UwjI5q+UXsdjM61WFvVtH6mpnU2mibS962rrzJ9Rk3T6TYImUarNDqiezqJrtBSCCj7SL4q7VRrX2icg6Y+X9YpGMkUi6vNNGJW0noeHXNu18Jn7UN/V6U8OvXy9Fp/XxodesFQj7iaTGupNB2Wg1UdjPQZtGBcfyMTUpsoON5ksU5LV7dlBCMAwKiMdTDSCf17qV0nZV1pdV56redeabpjVpqCkeikq4Bwr8VNBrXuSMelUY9Vi35zMxhp2ukGi5O6wpguLb/F4lh0e4A6GE2y+HlNs13QvqnRJyyCxgyLabUzLd5L65jWSH0UIHSPKL1v+X3mq/O2Ltr0O9BUngKH+isg6cpBHZPWHpWjUyMFo2UsQmn+PU6xVugqP7P2d35q1+9d/f6YXuu9swkW02sKW7rVgv5mFCB1/GWoroORKExp+lBrkk63uOeUpun0d1GvYyIYAQBGRetzJlv7dIheb1u81tqSTxWvM12Fpr66l1BNUyc62U21OPHtbu33lxmJwsiOdWOyjrXuYKxL1NW3vJ+QaNpIx/WSql0UoLTteVW7Xqt9jar9Zam9HKVSSNAJW5/ttxaBQiNCWgjdtM7ndRY3x1TVU0xNdBWY+mr/Wpys6bvyBK6pMx2Tjq2kY9DvabeiTeFF35WOX6NL2udPLC53r6fs9L7abxlCSvr97WNxU0/tR0GnnLbKNL2mkUH93nM//T3UNMqjMKfjU7/jbHiw0Siajqn+3hTeFG4UjBQeD7HmK9U+ae33MMq2sNhvOboEAADGuRyMAAAABh7BCAAAICEYAQAAJNtb+/PNAAAAAAAAAAAAAAAAAAAAAAAAAAAvtXjswxRrvssxBoMeUaNH3CxdbwAAoFtNz0rr1qstfnasLwfXIze0Xz3yYVb0tHU91V4Pkr3C4vEb/Wo5az2TDaOnB+jq70aP+gAAYLb0ezDS89j0YFmFin73Ha976kZ0bUOLZ8ytXW8AAKBb/R6M9IT4G+vGPkUwAgBgPusUjPTkdj3t/DdeZ1s8BV1PNC+VwUhTWvlp6l/3emHRr7SUxdPo8xPVj/V6TluP7oLRJhZrim63mEbTv1XlyJGetv4Zi/fS5zjMa5Vie6YpmDdbfOafWhzXMyyeEq996nNu6vXjtO2L1lrHMskinKld79X0ZPr1LX5GT4FXv6O91im2r27xPn/xeiT9W6XvalY2sBgl0X51HB/yWrzYvoLFvvYo2mQBi2P6gteCqW1vi+9IT7LX70j7/FX6d71uR79f7XcNr728fud1TLFd+9zNWn8T3/XaptheerHXiRb9zvI6wOK7r+3g9ROLfj9Pr0taa6ZjWqtq1/e4v9fpFj/7Za/ntfUIB3vt6/VMi+8lf/5JrS4AgPGuKRh92Ou/Xn/z+rbFdNW/vG71Wrbol4PRkV6PWpxEfuB1t9fjNvzEpZP0H9M29T3V6y6LMFCuDRqLYKRpFR3HQ14/swg8D3jdZ3ECLel4dALXZ7jUWsFIIUfHoZP6372+73VuajvP6yivGV4ne12Z2nViL73R6zGvf1h8j/o+9Zn1feZAOLvB6K0W+77D4rvUez/hdbW1B5mTLT5bOcW0m8XxvrNo0+e7zusUa+1TgfI/qV2BIXuDxc//yOI71neWg5FCkdq1Xd+nPssN6fXBqU+2o8X+r7fop9+TPsMZZSeLxfX6eb2P+p2fXutvNXtbait/vwrHOnbtU9+PPqM+m7439S9pjdo5Xn/ymmbxvU232OchQ70AAONaHYye6vUHi1Ei/TvbzKLfR4q2HIx0MldQyZ7m9XuLMFCO4Ohkeb/FKEe2pNeFFlNIebSlm2CUaZREJ93SwhYnWgU5hY5sJa+bLALIYkW7gpFOlFsXbZKDkULMs4t2jQypXSfccnTmhNRejgadZnEs5WibjknrojRKUhrNVNqqFselQFd+Fv2e9Fk0KpIpzCokqq8ocN1p8d2VFBp0/Ap/5e9+S4t9nly05WCkoFuPJGrURcF6l6JNI1QKN2rXCFH2Z4u/Ff3OsndY/I7WTa+1IF0/pxGuUh5lWii9bgpGClr6rsu/T/3ONMKlQLdG0a5gpJ9/b9Gm71bhTn3L3zUAYJyqg1H2lOq1PGjtJ/McjI4v2jJNPWmbpllEoUQjA5rqqeW+ms6SOQ1GmrLRz5ejIZneQ9s0kpMpGGmKppaDUR1gdGJX+yeqdo16qb1ec9X0XV7mdVHVNppgpPfWKFDTovMpXvdahJFsZ4tj0+9MI3wKVWVolByMXlK1y0kWAVihV3IwKsNPprDT9H0qWChglAFHI3ia6hyJgrTe62P1hkodjDRtqr+5zw/1aFF4Vdgq/8YUjBSma++x2G8Z6AEA49RIwUgnyF0tLn/Wmg7107RSloNRPSUhmk5RkNJ6I9nOoq+mJHarap+07f9S3zkNRp+y+Pmm0KCwoxPiZ4s2BaNyfUyWg5HWV5Wen9p13CUFIrXre6nppPp2i8/4LYv31PRbaTTBSOtlNI1Yf5eqHHBWGOod9F1Ntxj9qY9d9HOabiwDVZaDldZhSQ5GGk0qaQpS7Zo2rI9L9VeLadTsWIv+mprUMT232JZpROgai+kw/f3pWJrWitXBaPv0uj7GTKOH5ZSdgpGm6GpvsdjPK+oNAIDxpykY7WcxDab2hy2mS3Qy10mzKRhtW7SVdOL+Yfr3uyz6jlRHpL5zGoy0uFkjBU0neNGohaa9slkFI02dlUYTjDRCpTCgdp3YdayaUtRU0ZwEowts+PdXVzmlJ69N7RotKqfKMgWj2+rGJP+utQ/pFIz0nvVx1KWp00xTaFpsfXOxfYYNH4nS+qbjLEaYcj+NuJWjW3Uwyn9zTQutRT9fjtopGGkasZZHGQlGADAA6mA0Mb3WepQXpbbsLmsORloTUlvEYuolT7PlESNNm83KnAYjjcro5+sRE9H6Go0YHV60za1gpLUx2vfvLU6q+k6yaTZnwUhrl7RIuFsaddGJXyFNAe2w9s0zKRhpPU5es1PazdpDR6dglEeMZjXt1USjQBoNusrid7RV++YhGlX6oMV0oQK8/l6kDkb5b+6V6XXtFouRt4xgBAAYFoy0uFqvJ+QOia5yylMZWQ5Guoqp9hqLbfpf7aKrg3SH6oNzh4LCysrF6zkNRjpZ6+f3qNplJ4ttWg+Uza1gpPfQa30XJY1k3WrNwUgn+25ojZFGxep1QrKGtS/Ilvx71bEdafGZ61sq5Cm4Lap20dWG5QLkTsFIbrRYvN9kver1mtYKNpkWXWvfObzp+9Kx1iOAe1n0y8GnDkYKxvqbKxeiZwpX6qtbEWQEIwDAsGCUTy5aW5RppEOXmau9KRgpMJVBQwutFVZ0JdTTi3atO9HJdWLRpqmUky32kxe3zmkw0oiHRh105dWzi/a1LQKJRlrK0Zu5FYzyouFydEomp/Y6GOkYdCIvpzU70eiKblMwzdq/Y93D5w6LUapM4UMjQXlaU59L34OCgL7/LAcjXe6vK9myHS1CmKayspGCUf6b2r9qz0FG20XTbhoZOtnaQ8/eFv1yqM6LnyflDha/Y/096bj0+aQORv/fzv3bZg0EYBy+KRiCjgI6xAK09BG0DMAADIBoQKKhYgxakKBkABr2SH46n+I4FikQDTyPFCm++HPs+yzdq/uXwmaT1Ptulurry5j117u6CEYA3ApG9TSsPXm+jhk8amibpFpvxlkwak5Sw2ZrD6DCTw1xq8P2amxrkPpMjVDnNg+p4334+NNglHomavwLPU2orcGrgWwo6Tjn5G8Fo7RcvLImD3evzaXp9+/jdjBqtVv1WNDs3vd7EZ0pjDbBvfquLnvOnrHvqWstrfpqfti+V25NTN4PeRWMfl39vB0zNHTNvqfOK2jtA9jvglEhp5V8/b3n7To/tuPuZb9K783uvOqnUNbx53G9yWPvZO9W5d+2835ux6+3c3IWjBra6z2ufL2fDb9VZ2u+1CIYATAejdmDUQOyNFzS0EuNeqvRms9RY1ZZjcRSmOqzzaV5MGaPQuc3VFPvzJmuczHm8Fs7QdcIr5VOSw1h131yKD/TJN2Xx8JNDXnbA3was3eh+98/59IqtuNwV+pV6j6Ojf+9rfzhobxnrnzf41PPxvMxh6J63v5X93Uxbu6Xs9wfs/6aHF693qXekoJbc8IKNq/GzdV4haHuad+jt1RvBaNWEGYFo45fjHnP1V0BsO9kr+DZdVdvzZnq9N2Ym0T2PM/G9f/ae3r1837M8z6MOc+oetsrJNVzVDAvpBdkH984Ywbe7um4Yq3P1gP6ccxtBApTZ0OQXf/iWDjmzuVd9+wzAMA/agUjAID/nmAEALARjAAANs1vOs73AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAO5wCfeW51PC/DfpAAAAAElFTkSuQmCC" alt=""></div>
                  <p>Optionally, the log stream selector can be followed by <b>a log pipeline</b>. A log pipeline is a set of stage expressions that are chained together and applied to the selected log streams. Each expression can filter out, parse, or mutate log lines and their respective labels.</p>
                  <p>The following example shows a full log query in action:</p>
                  <p><code class="fillbox">{container="query-frontend",namespace="loki-dev"} |= "metrics.go" | logfmt | duration > 10s and throughput_mb < 500</code></p>
                  <p>The query is composed of:</p>
                  <ul>
                    <li>a log stream selector <code>{container="query-frontend",namespace="loki-dev"}</code> which targets the <code>query-frontend</code> container in the <code>loki-dev</code> namespace.</li>
                    <li>a log pipeline <code>|= "metrics.go" | logfmt | duration > 10s and throughput_mb < 500</code> which will filter out log that contains the word <code>metrics.go</code>, then parses each log line to extract more labels and filter with them.</li>
                  </ul>
                  <pre>To avoid escaping special characters you can use the <code>`</code>(backtick) instead of<code> " </code>when quoting strings. For example <code>`\w+`</code> is the same as <code>"\\w+"</code>. This is specially useful when writing a regular expression which contains multiple <br/>backslashes that require escaping.</pre>
                </div>
                <!-- Log stream selector -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="log-stream-selector">Log stream selector</h1>
                  <div class="introduce-view__content-label">
                    <p>The stream selector determines which log streams to include in a query’s results. A log stream is a unique source of log content, such as a file. A more granular log stream selector then reduces the number of searched streams to a manageable volume. This means that the labels passed to the log stream selector will affect the relative performance of the query’s execution.</p>
                    <p>The log stream selector is specified by one or more comma-separated key-value pairs. Each key is a log label and each value is that label’s value. Curly braces (<code>{</code> and <code>}</code>) delimit the stream selector.</p>
                    <p>Consider this stream selector:</p>
                    <p><code class="fillbox">{app="mysql",name="mysql-backup"}</code></p>
                    <p>All log streams that have both a label of <code>app</code> whose value is <code>mysql</code> and a label of <code>name</code> whose value is <code>mysql-backup</code> will be included in the query results. A stream may contain other pairs of labels and values, but only the specified pairs within the stream selector are used to determine which streams will be included within the query results.</p>
                    <p>The same rules that apply for Prometheus Label Selectors apply for Grafana Loki log stream selectors.</p>
                    <p>The <code>=</code> operator after the label name is a <b>label matching operator</b>. The following label matching operators are supported:</p>
                    <ul>
                      <li><code>=</code>: exactly equal</li>
                      <li><code>!=</code>: not equal</li>
                      <li><code>=~</code>: regex matches</li>
                      <li><code>!~</code>: regex does not match</li>
                    </ul>
                    <p>Regex log stream examples:</p>
                    <ul>
                      <li><code>{name =~ "mysql.+"}</code></li>
                      <li><code>{name !~ "mysql.+"}</code></li>
                      <li><code>{name !~ `mysql-\d+`}</code></li>
                    </ul>
                    <p><b>Note:</b> The <code>=~</code> regex operator is fully anchored, meaning regex must match against the entire string, including newlines. The regex <code>.</code> character does not match newlines by default. If you want the regex dot character to match newlines you can use the single-line flag, like so: <code>(?s)search_term.+</code> matches <code>search_term\n.</code></p>
                  </div>
                </div>
                <!-- Log pipeline -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="log-pipeline">Log pipeline</h1>
                  <div class="introduce-view__content-label">
                    <p>A log pipeline can be appended to a log stream selector to further process and filter log streams. It is composed of a set of expressions. Each expression is executed in left to right sequence for each log line. If an expression filters out a log line, the pipeline will stop processing the current log line and start processing the next log line.</p>
                    <p>Some expressions can mutate the log content and respective labels, which will be then be available for further filtering and processing in subsequent expressions. An example that mutates is the expression</p>
                    <p><code v-pre class="fillbox">| line_format "{{.status_code}}"</code></p>
                    <p>Log pipeline expressions fall into one of three categories:</p>
                    <ul>
                      <li>Filtering expressions: <b style="color: #3C92F1" @click="jumpClick('#line-filter-expressions')" class="log-link">line filter expressions</b> and <b style="color: #3C92F1" @click="jumpClick('#label-filter-expressions')" class="log-link">label filter expressions</b></li>
                      <li><b style="color: #3C92F1" @click="jumpClick('#parsing-expressions')" class="log-link">Parsing expressions</b></li>
                      <li>Formatting expressions: <b style="color: #3C92F1" @click="jumpClick('#line-format-expressions')" class="log-link">line format expressions</b> and <b style="color: #3C92F1" @click="jumpClick('#label-format-expressions')" class="log-link">label format expressions</b></li>
                    </ul>
                  </div>
                </div>
                <!-- Line filter expression -->
                <div class="introduce-view__content">
                  <h2 id="line-filter-expressions">Line filter expression</h2>
                  <div class="introduce-view__content-label">
                    <p>The line filter expression does a distributed <code>grep</code> over the aggregated logs from the matching log streams. It searches the contents of the log line, discarding those lines that do not match the case sensitive expression.</p>
                    <p>Each line filter expression has a <b>filter operator</b> followed by text or a regular expression. These filter operators are supported:</p>
                    <ul>
                      <li><code>|=</code>: Log line contains string</li>
                      <li><code>!=</code>: Log line does not contain string</li>
                      <li><code>|~</code>: Log line contains a match to the regular expression</li>
                      <li><code>!~</code>: Log line does not contain a match to the regular expression</li>
                    </ul>
                    <p>Line filter expression examples:</p>
                    <ul>
                      <li>
                        <p>Keep log lines that have the substring “error”:</p>
                        <p><code class="fillbox">|= "error"</code></p>
                        <p>A complete query using this example:</p>
                        <p><code class="fillbox">{job="mysql"} |= "error"</code></p>
                      </li>
                      <li>
                        <p>Discard log lines that have the substring “kafka.server:type=ReplicaManager”:</p>
                        <p><code class="fillbox">!= "kafka.server:type=ReplicaManager"</code></p>
                        <p>A complete query using this example:</p>
                        <p><code class="fillbox">{instance=~"kafka-[23]",name="kafka"} != "kafka.server:type=ReplicaManager"</code></p>
                      </li>
                      <li>
                        <p>Keep log lines that contain a substring that starts with <code>tsdb-ops</code> and ends with <code>io:2003</code>. A complete query with a regular expression:</p>
                        <p><code class="fillbox">{name="kafka"} |~ "tsdb-ops.*io:2003"</code></p>
                      </li>
                      <li>
                        <p>Keep log lines that contain a substring that starts with <code>error=</code>, and is followed by 1 or more word characters. A complete query with a regular expression:</p>
                        <p><code class="fillbox">{name="cassandra"} |~  `error=\w+`</code></p>
                      </li>
                    </ul>
                    <p>Filter operators can be chained. Filters are applied sequentially. Query results will have satisfied every filter. This complete query example will give results that include the string <code>error</code>, and do not include the string <code>timeout</code>.</p>
                    <p><code class="fillbox">{job="mysql"} |= "error" != "timeout"</code></p>
                    <p>When using <code>|~</code> and <code>!~</code>, Go (as in Golang) RE2 syntax regex may be used. The matching is case-sensitive by default. Switch to case-insensitive matching by prefixing the regular expression with <code>(?i)</code>.</p>
                    <p>While line filter expressions could be placed anywhere within a log pipeline, it is almost always better to have them at the beginning. Placing them at the beginning improves the performance of the query, as it only does further processing when a line matches. For example, while the results will be the same, the query specified with</p>
                    <p><code class="fillbox" v-pre>{job="mysql"} |= "error" | json | line_format "{{.err}}"</code></p>
                    <p>will always run faster than</p>
                    <p><code class="fillbox" v-pre>{job="mysql"} | json | line_format "{{.message}}" |= "error"</code></p>
                    <p>Line filter expressions are the fastest way to filter logs once the log stream selectors have been applied.</p>
                    <p>Line filter expressions have support matching IP addresses. See Matching IP addresses for details.</p>
                  </div>
                </div>
                <!-- Label filter expression -->
                <div class="introduce-view__content">
                  <h2 id="label-filter-expressions">Label filter expression</h2>
                  <div class="introduce-view__content-label">
                    <p>Label filter expression allows filtering log line using their original and extracted labels. It can contain multiple predicates.</p>
                    <p>A predicate contains a <b>label identifier</b>, an <b>operation</b> and a <b>value</b> to compare the label with.</p>
                    <p>For example with <code>cluster="namespace"</code>the cluster is the label identifier, the operation is <code>=</code> and the value is “namespace”. The label identifier is always on the right side of the operation.</p>
                    <p>We support multiple <b>value</b> types which are automatically inferred from the query input.</p>
                    <ul>
                      <li><b>String </b>is double quoted or backticked such as <code>"200"</code> or `<code>us-central1</code>`.</li>
                      <li>Duration is a sequence of decimal numbers, each with optional fraction and a unit suffix, such as “300ms”, “1.5h” or “2h45m”. Valid time units are “ns”, “us” (or “µs”), “ms”, “s”, “m”, “h”.</li>
                      <li><b>Number </b>are floating-point number (64bits), such as <code>250</code>, <code>89.923</code>.</li>
                      <li><b>Bytes </b>is a sequence of decimal numbers, each with optional fraction and a unit suffix, such as “42MB”, “1.5Kib” or “20b”. Valid bytes units are “b”, “kib”, “kb”, “mib”, “mb”, “gib”, “gb”, “tib”, “tb”, “pib”, “pb”, “eib”, “eb”.</li>
                    </ul>
                    <p>String type work exactly like Prometheus label matchers use in <b style="color: #3C92F1" @click="jumpClick('#log-stream-selector')" class="log-link">log stream selector</b>. This means you can use the same operations (<code>=</code>,<code>!=</code>,<code>=~</code>,<code>!~</code>).</p>
                    <pre>The string type is the only one that can filter out a log line with a label <code>__error__</code>.</pre>
                    <p>Using Duration, Number and Bytes will convert the label value prior to comparision and support the following comparators:</p>
                    <ul>
                      <li><code>==</code> or <code>=</code> for equality.</li>
                      <li><code>!=</code> for inequality.</li>
                      <li><code>></code> and <code>>=</code> for greater than and greater than or equal.</li>
                      <li><code>&lt;</code> and <code>&lt;=</code> for lesser than and lesser than or equal.</li>
                    </ul>
                    <p>For instance, <code>logfmt | duration > 1m and bytes_consumed > 20MB</code></p>
                    <p>If the conversion of the label value fails, the log line is not filtered and an <code>__error__</code> label is added. To filters those errors see the pipeline errors section.</p>
                    <p>You can chain multiple predicates using <code>and</code> and <code>or</code> which respectively express the <code>and</code> and <code>or</code> binary operations. <code>and</code> can be equivalently expressed by a comma, a space or another pipe. Label filters can be place anywhere in a log pipeline.</p>
                    <p>This means that all the following expressions are equivalent:</p>
                    <p><code class="fillbox">
                             | duration >= 20ms or size == 20kb and method!~"2.."<br/>
                             | duration >= 20ms or size == 20kb | method!~"2.."<br/>
                             | duration >= 20ms or size == 20kb , method!~"2.."<br/>
                             | duration >= 20ms or size == 20kb  method!~"2.."
                    </code></p>
                    <p>By default the precedence of multiple predicates is right to left. You can wrap predicates with parenthesis to force a different precedence left to right.</p>
                    <p>For example the following are equivalent.</p>
                    <p><code class="fillbox">
                      | duration >= 20ms or method="GET" and size &lt;= 20KB<br/>
                      | ((duration >= 20ms or method="GET") and size &lt;= 20KB)
                      </code></p>
                      <p>It will evaluate first <code>duration >= 20ms or method="GET"</code>. To evaluate first <code>method="GET" and size &lt;= 20KB</code>, make sure to use proper parenthesis as shown below.</p>
                      <p><code class="fillbox">| duration >= 20ms or (method="GET" and size &lt;= 20KB)</code></p>
                      <pre>Label filter expressions are the only expression allowed after the unwrap expression. This is mainly to allow filtering errors from the metric extraction.</pre>
                      <p>Label filter expressions have support matching IP addresses. See Matching IP addresses for details.</p>
                  </div>
                </div>
                <!-- Parser expression -->
                <div class="introduce-view__content">
                  <h2 id="parsing-expressions">Parser expression</h2>
                  <div class="introduce-view__content-label">
                    <p>Parser expression can parse and extract labels from the log content. Those extracted labels can then be used for filtering using <b style="color: #3C92F1" @click="jumpClick('#label-filter-expressions')" class="log-link">label filter expressions</b> or for <b style="color: #3C92F1" @click="jumpClick('#metric-queries')" class="log-link">metric aggregations</b>.</p>
                    <p>Extracted label keys are automatically sanitized by all parsers, to follow Prometheus metric name convention.(They can only contain ASCII letters and digits, as well as underscores and colons. They cannot start with a digit.)</p>
                    <p>For instance, the pipeline <code>| json</code> will produce the following mapping:</p>
                    <p><code class="fillbox">{ "a.b": {c: "d"}, e: "f" }</code></p>
                    <p>-></p>
                    <p><code class="fillbox">{a_b_c="d", e="f"}</code></p>
                    <p>In case of errors, for instance if the line is not in the expected format, the log line won’t be filtered but instead will get a new <code>__error__</code> label added.</p>
                    <p>If an extracted label key name already exists in the original log stream, the extracted label key will be suffixed with the <code>_extracted</code> keyword to make the distinction between the two labels. You can forcefully override the original label using a <b style="color: #3C92F1" @click="jumpClick('#label-format-expressions')" class="log-link">label formatter expression</b>. However if an extracted key appears twice, only the latest label value will be kept.</p>
                    <p>Loki supports <b style="color: #3C92F1" @click="jumpClick('#JSON')" class="log-link">JSON</b>, <b style="color: #3C92F1" @click="jumpClick('#logfmt')" class="log-link">logfmt</b>, <b style="color: #3C92F1" @click="jumpClick('#pattern')" class="log-link">pattern</b>, <b style="color: #3C92F1"  @click="jumpClick('#regexp')" class="log-link">regexp</b> and <b style="color: #3C92F1" @click="jumpClick('#unpack')" class="log-link">unpack</b> parsers.</p>
                    <p>It’s easier to use the predefined parsers <code>json</code> and <code>logfmt</code> when you can. If you can’t, the <code>pattern</code> and <code>regexp</code> parsers can be used for log lines with an unusual structure. The <code>pattern</code> parser is easier and faster to write; it also outperforms the <code>regexp</code> parser. Multiple parsers can be used by a single log pipeline. This is useful for parsing complex logs. There are examples in <b style="color: #3C92F1" @click="jumpClick('#multiple-parsers')" class="log-link">Multiple parsers</b>.</p>
                  </div>
                </div>
                <!-- JSON -->
                <div class="introduce-view__content">
                <h2 id="JSON">JSON</h2>
                <div class="introduce-view__content-label">
                  <p>The <b>json</b> parser operates in two modes:</p>
                  <p>1. <b>without</b> parameters:</p>
                  <div class="logfmt-module" style="padding-left: 20px;">
                    <p>Adding <code>| json</code> to your pipeline will extract all json properties as labels if the log line is a valid json document. Nested properties are flattened into label keys using the <code>_</code> separator.</p>
                    <p>Note: <b>Arrays are skipped</b>.</p>
                    <p>For example the json parsers will extract from the following document:</p>
                    <pre>{
    "protocol": "HTTP/2.0",
    "servers": ["129.0.1.1","10.2.1.3"],
    "request": {
        "time": "6.032",
        "method": "GET",
        "host": "foo.grafana.net",
        "size": "55",
        "headers": {
          "Accept": "*/*",
          "User-Agent": "curl/7.68.0"
        }
    },
    "response": {
        "status": 401,
        "size": "228",
        "latency_seconds": "6.031"
    }
}</pre>
           <p>The following list of labels:</p>
           <pre>"protocol" => "HTTP/2.0"
"request_time" => "6.032"
"request_method" => "GET"
"request_host" => "foo.grafana.net"
"request_size" => "55"
"response_status" => "401"
"response_size" => "228"
"response_latency_seconds" => "6.031"</pre>
                  </div>
                  <p>2. <b>with </b>parameters:</p>
                  <div class="logfmt-module" style="padding-left: 20px;">
                    <p>Using <code>| json label="expression", another="expression"</code> in your pipeline will extract only the specified json fields to labels. You can specify one or more expressions in this way, the same as <code>label_format</code>; all expressions must be quoted.</p>
                    <p>Currently, we only support field access (<code>my.field</code>, <code>my["field"]</code>) and array access (<code>list[0]</code>), and any combination of these in any level of nesting (<code>my.list[0]["field"]</code>).</p>
                    <p>For example, <code>| json first_server="servers[0]", ua="request.headers[\"User-Agent\"]</code> will extract from the following document:</p>
                    <pre>{
    "protocol": "HTTP/2.0",
    "servers": ["129.0.1.1","10.2.1.3"],
    "request": {
        "time": "6.032",
        "method": "GET",
        "host": "foo.grafana.net",
        "size": "55",
        "headers": {
          "Accept": "*/*",
          "User-Agent": "curl/7.68.0"
        }
    },
    "response": {
        "status": 401,
        "size": "228",
        "latency_seconds": "6.031"
    }
}
                    </pre>
                    <p>The following list of labels:</p>
                    <pre>"first_server" => "129.0.1.1"
"ua" => "curl/7.68.0"</pre>
                    <p>If an array or an object returned by an expression, it will be assigned to the label in json format.</p>
                    <p>For example, <code>| json server_list="servers", headers="request.headers"</code> will extract:</p>
                    <pre>"server_list" => `["129.0.1.1","10.2.1.3"]`
"headers" => `{"Accept": "*/*", "User-Agent": "curl/7.68.0"}`</pre>
                    <p>If the label to be extracted is same as the original JSON field, expression can be written as just <code>| json &lt;label&gt;</code></p>
                    <p>For example, to extract <code>servers</code> fields as label, expression can be written as following</p>
                    <p><code>| json servers</code> will extract:</p>
                    <pre>"servers" => `["129.0.1.1","10.2.1.3"]`</pre>
                    <p>Note that <code>| json servers</code> is same as <code>| json servers="servers"</code></p>
                  </div>
                </div>
              </div>
              <!-- logfmt -->
              <div class="introduce-view__content">
                <h2 id="logfmt">logfmt</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p>The <b>logfmt</b> parser can be added using the <code>| logfmt</code> and will extract all keys and values from the logfmt formatted log line.</p>
                  <p>For example the following log line:</p>
                  <pre>at=info method=GET path=/ host=grafana.net fwd="124.133.124.161" service=8ms status=200</pre>
                  <p>will get those labels extracted:</p>
                  <pre>"at" => "info"
"method" => "GET"
"path" => "/"
"host" => "grafana.net"
"fwd" => "124.133.124.161"
"service" => "8ms"
"status" => "200"</pre>
                </div>
              </div>
              <!-- Pattern -->
              <div class="introduce-view__content">
                <h2 id="pattern">Pattern</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p>The pattern parser allows the explicit extraction of fields from log lines by defining a pattern expression (<code>| pattern "&lt;pattern-expression&gt;"</code>). The expression matches the structure of a log line.</p>
                  <p>Consider this NGINX log line.</p>
                  <p><code class="fillbox">0.191.12.2 - - [10/Jun/2021:09:14:29 +0000] "GET /api/plugins/versioncheck HTTP/1.1" 200 2 "-" "Go-http-client/2.0" "13.76.247.102, 34.120.177.193" "TLSv1.2" "US" ""
</code></p>
                  <p>This log line can be parsed with the expression</p>
                  <p><code>&lt;ip&gt; - - &lt;_&gt; "&lt;method&gt; &lt;uri&gt; &lt;_&gt;" &lt;status&gt; &lt;size&gt; &lt;_&gt; "&lt;agent&gt;" &lt;_&gt;</code></p>
                  <p>to extract these fields:</p>
                  <pre>"ip" => "0.191.12.2"
"method" => "GET"
"uri" => "/api/plugins/versioncheck"
"status" => "200"
"size" => "2"
"agent" => "Go-http-client/2.0"</pre>
                  <p>A pattern expression is composed of captures and literals.</p>
                  <p>A capture is a field name delimited by the <code>&lt;</code> and <code>&gt;</code> characters. <code>&lt;example&gt;</code> defines the field name <code>example</code>. An unnamed capture appears as <code>&lt;_&gt;</code>. <br/>The unnamed capture skips matched content.</p>
                  <p>Captures are matched from the line beginning or the previous set of literals, to the line end or the next set of literals. If a capture is not matched, the pattern parser will stop.</p>
                  <p>Literals can be any sequence of UTF-8 characters, including whitespace characters.</p>
                  <p>By default, a pattern expression is anchored at the start of the log line. If the expression starts with literals, then the log line must also start with the same set of literals. Use <code>&lt;_&gt;</code> at the beginning of the expression if you don’t want to anchor the expression at the start.</p>
                  <p>Consider the log line</p>
                  <pre>level=debug ts=2021-06-10T09:24:13.472094048Z caller=logging.go:66 traceID=0568b66ad2d9294c msg="POST /loki/api/v1/push (204) 16.652862ms"</pre>
                  <p>To match <code>msg="</code>, use the expression:</p>
                  <pre>&lt;_&gt; msg="&lt;method&gt; &lt;path&gt; (&lt;status&gt;) &lt;latency&gt;"</pre>
                  <p>A pattern expression is invalid if</p>
                  <ul>
                    <li>It does not contain any named capture.</li>
                    <li>It contains two consecutive captures not separated by whitespace characters.</li>
                    </ul>
                </div>
              </div>
              <!-- Regular expression -->
              <div class="introduce-view__content">
                <h2 id="regexp">Regular expression</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p>Unlike the logfmt and json, which extract implicitly all values and takes no parameters, the regexp parser takes a single parameter <code>| regexp "&lt;re&gt;"</code> which is the regular expression using the Golang RE2 syntax.</p>
                  <p>The regular expression must contain a least one named sub-match (e.g <code>(?P&lt;name&gt;re)</code>), each sub-match will extract a different label.</p>
                  <p>For example the parser | regexp "(?P&lt;method&gt;\\w+) (?P&lt;path&gt;[\\w|/]+) \\((?P&lt;status&gt;\\d+?)\\) (?P&lt;duration&gt;.*)" will extract from the following line:</p>
                  <pre>POST /api/prom/api/v1/query_range (200) 1.5s</pre>
                  <p>those labels:</p>
                  <pre>"method" => "POST"
"path" => "/api/prom/api/v1/query_range"
"status" => "200"
"duration" => "1.5s"</pre>
                </div>
              </div>
              <!-- unpack -->
              <div class="introduce-view__content">
                <h2 id="unpack">unpack</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p>The <code>unpack</code> parser parses a JSON log line, unpacking all embedded labels from Promtail’s <code>pack</code> stage. <b>A special property <code>_entry</code> will also be used to replace the original log line</b>.</p>
                  <p>For example, using <code>| unpack</code> with the log line:</p>
                  <pre>{
  "container": "myapp",
  "pod": "pod-3223f",
  "_entry": "original log message"
}</pre>
                  <p>extracts the <code>container</code> and <code>pod</code> labels; it sets <code>original log message</code> as the new log line.</p>
                  <p>You can combine the <code>unpack</code> and <code>json</code> parsers (or any other parsers) if the original embedded log line is of a specific format.</p>
                </div>
              </div>
              <!-- Line format expression -->
              <div class="introduce-view__content">
                <h2 id="line-format-expressions">Line format expression</h2>
                <div class="introduce-view__content-label logfmt-module">
                 <p v-pre>The line format expression can rewrite the log line content by using the text/template format. It takes a single string parameter <code>| line_format "{{.label_name}}"</code>, which is the template format. All labels are injected variables into the template and are available to use with the <code>{{.label_name}}</code> notation.</p>
                 <p>For example the following expression:</p>
                 <pre v-pre>{container="frontend"} | logfmt | line_format "{{.query}} {{.duration}}"</pre>
                 <p>Will extract and rewrite the log line to only contains the query and the duration of a request.</p>
                 <p v-pre>You can use double quoted string for the template or backticks <code>`{{.label_name}}`</code> to avoid the need to escape special characters.</p>
                 <p><code>line_format</code> also supports <code>math</code> functions. Example:</p>
                 <p>If we have the following labels <code>ip=1.1.1.1</code>, <code>status=200</code> and <code>duration=3000(ms)</code>, we can divide the duration by <code>1000</code> to get the value in seconds.</p>
                 <pre v-pre>{container="frontend"} | logfmt | line_format "{{.ip}} {{.status}} {{div .duration 1000}}"</pre>
                 <p>The above query will give us the <code>line</code> as <code>1.1.1.1 200 3</code></p>
                 <p>See template functions to learn about available functions in the template format.</p>
                </div>
              </div>
              <!-- Labels format expression -->
              <div class="introduce-view__content">
                <h2 id="label-format-expressions">Labels format expression</h2>
                <div class="introduce-view__content-label">
                 <p>The <code>| label_format</code> expression can rename, modify or add labels. It takes as parameter a comma separated list of equality operations, enabling multiple operations at once.</p>
                 <p>When both side are label identifiers, for example <code>dst=src</code>, the operation will rename the <code>src</code> label into <code>dst</code>.</p>
                 <p>The right side can alternatively be a template string (double quoted or backtick), for example dst="<code v-pre>{{.status}} {{.query}}</code>", in which case the <code>dst</code> label value is replaced by the result of the text/template evaluation. This is the same template engine as the <code>| line_format</code> expression, which means labels are available as variables and you can use the same list of functions.</p>
                 <p>In both cases, if the destination label doesn’t exist, then a new one is created.</p>
                 <p>The renaming form <code>dst=src</code> will drop the <code>src</code> label after remapping it to the <code>dst</code> label. However, the template form will preserve the referenced labels, such that <code v-pre>dst="{{.src}}"</code> results in both <code>dst</code> and <code>src</code> having the same value.</p>
                 <pre>A single label name can only appear once per expression. This means <code>| label_format foo=bar,foo="new"</code> is not allowed but you can use two expressions for the desired effect: <code>| label_format foo=bar | label_format foo="new"</code></pre>
                </div>
              </div>
              <!-- Log queries examples -->
               <h1 class="page-header-two" id="log-queries-examples">Log queries examples</h1>
               <!-- Multiple filtering -->
              <div class="introduce-view__content">
                <h2 id="multiple-filtering">Multiple filtering</h2>
                <div class="introduce-view__content-label">
                  <p>Filtering should be done first using label matchers, then line filters (when possible) and finally using label filters. The following query demonstrate this.</p>
                  <p><code v-pre class="fillbox">{cluster="ops-tools1", namespace="loki-dev", job="loki-dev/query-frontend"} |= "metrics.go" !="out of order" | logfmt | duration > 30s or status_code!="200"</code></p>
                </div>
              </div>
              <!-- Multiple parsers -->
              <div class="introduce-view__content">
                <h2 id="multiple-parsers">Multiple parsers</h2>
                <div class="introduce-view__content-label">
                  <p>To extract the method and the path of the following logfmt log line:</p>
                  <p><code v-pre class="fillbox">level=debug ts=2020-10-02T10:10:42.092268913Z caller=logging.go:66 traceID=a9d4d8a928d8db1 msg="POST /api/prom/api/v1/query_range (200) 1.5s"</code></p>
                  <p>You can use multiple parsers (logfmt and regexp) like this.</p>
                  <p><code v-pre class="fillbox">{job="loki-ops/query-frontend"} | logfmt | line_format "{{.msg}}" | regexp "(?P&lt;method&gt;\\w+) (?P&lt;path&gt;[\\w|/]+) \\((?P&lt;status&gt;\\d+?)\\) (?P&lt;duration&gt;.*)"</code></p>
                  <p>This is possible because the <code>| line_format</code> reformats the log line to become <code>POST /api/prom/api/v1/query_range (200) 1.5s</code> which can then be parsed with the <code>| regexp ...</code> parser.</p>
                </div>
              </div>
              <!-- Formatting -->
              <div class="introduce-view__content">
                <h2 id="formatting">Formatting</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p>The following query shows how you can reformat a log line to make it easier to read on screen.</p>
                  <pre v-pre>{cluster="ops-tools1", name="querier", namespace="loki-dev"}
  |= "metrics.go" != "loki-canary"
  | logfmt
  | query != ""
  | label_format query="{{ Replace .query &#92;"&#92;&#92;n&#92;" &#92;"&#92;" -1 }}"
  | line_format "{{ .ts}}&#92;t{{.duration}}&#92;ttraceID = {{.traceID}}&#92;t{{ printf &#92;"%-100.100s&#92;" .query }} "</pre>
                  <p>Label formatting is used to sanitize the query while the line format reduce the amount of information and creates a tabular output.</p>
                  <p>For these given log lines:</p>
                  <pre>level=info ts=2020-10-23T20:32:18.094668233Z caller=metrics.go:81 org_id=29 traceID=1980d41501b57b68 latency=fast query="{cluster=\"ops-tools1\", job=\"loki-ops/query-frontend\"} |= \"query_range\"" query_type=filter range_type=range length=15m0s step=7s duration=650.22401ms status=200 throughput_mb=1.529717 total_bytes_mb=0.994659
level=info ts=2020-10-23T20:32:18.068866235Z caller=metrics.go:81 org_id=29 traceID=1980d41501b57b68 latency=fast query="{cluster=\"ops-tools1\", job=\"loki-ops/query-frontend\"} |= \"query_range\"" query_type=filter range_type=range length=15m0s step=7s duration=624.008132ms status=200 throughput_mb=0.693449 total_bytes_mb=0.432718</pre>
                  <p>The result would be:</p>
                  <pre>2020-10-23T20:32:18.094668233Z	650.22401ms	    traceID = 1980d41501b57b68	{cluster="ops-tools1", job="loki-ops/query-frontend"} |= "query_range"
2020-10-23T20:32:18.068866235Z	624.008132ms	traceID = 1980d41501b57b68	{cluster="ops-tools1", job="loki-ops/query-frontend"} |= "query_range"</pre>
                </div>
              </div>

               <!-- Metric queries -->
              <div class="introduce-view__content">
                <h1 class="page-header-one" id="metric-queries">Metric queries</h1>
                <div class="introduce-view__content-label">
                  <p>Metric queries extend log queries by applying a function to log query results. This powerful feature creates metrics from logs.</p>
                  <p>Metric queries can be used to calculate the rate of error messages or the top N log sources with the greatest quantity of logs over the last 3 hours.</p>
                  <p>Combined with parsers, metric queries can also be used to calculate metrics from a sample value within the log line, such as latency or request size. All labels, including extracted ones, will be available for aggregations and generation of new series.</p>
                </div>
              </div>
              <!-- Range Vector aggregation -->
              <div class="introduce-view__content">
                <h1 class="page-header-two" id="range-vector-aggregation">Range Vector aggregation</h1>
                <div class="introduce-view__content-label">
                  <p>LogQL shares the range vector concept of Prometheus. In Grafana Loki, the selected range of samples is a range of selected log or label values.</p>
                  <p>The aggregation is applied over a time duration. Loki defines Time Durations with the same syntax as Prometheus.</p>
                  <p>Loki supports two types of range vector aggregations: log range aggregations and unwrapped range aggregations.</p>
                </div>
              </div>
              <!-- Log range aggregations -->
              <div class="introduce-view__content">
                <h2 id="log-range-aggregations">Log range aggregations</h2>
                <div class="introduce-view__content-label">
                  <p>A log range aggregation is a query followed by a duration. A function is applied to aggregate the query over the duration. The duration can be placed after the log stream selector or at end of the log pipeline.</p>
                  <p>The functions:</p>
                  <ul>
                    <li><code> rate(log-range)</code>: calculates the number of entries per second</li>
                    <li><code> count_over_time(log-range)</code>: counts the entries for each log stream within the given range.</li>
                    <li><code> bytes_rate(log-range)</code>: calculates the number of bytes per second for each stream.</li>
                    <li><code> bytes_over_time(log-range)</code>: counts the amount of bytes used by each log stream for a given range.</li>
                    <li><code> absent_over_time(log-range)</code>: returns an empty vector if the range vector passed to it has any elements and a 1-element vector with the value 1 if the range vector passed to it has no elements. (<code>absent_over_time</code> is useful for alerting on when no time series and logs stream exist for label combination for a certain amount of time.)</li>
                  </ul>
                  <p>Examples:</p>
                  <ul>
                    <li>
                      <p>Count all the log lines within the last five minutes for the MySQL job.</p>
                      <p><code class="fillbox">count_over_time({job="mysql"}[5m])</code></p>
                    </li>
                    <li>
                      <p>This aggregation includes filters and parsers. It returns the per-second rate of all non-timeout errors within the last minutes per host for the MySQL job and only includes errors whose duration is above ten seconds.</p>
                      <p><code class="fillbox">sum by (host) (rate({job="mysql"} |= "error" != "timeout" | json | duration > 10s [1m]))</code></p>
                    </li>
                  </ul>
                </div>
              </div>
               <!-- Unwrapped range aggregations -->
              <div class="introduce-view__content">
                <h2 id="unwrapped-range-aggregations">Unwrapped range aggregations</h2>
                <div class="introduce-view__content-label">
                  <p>Unwrapped ranges uses extracted labels as sample values instead of log lines. However to select which label will be used within the aggregation, the log query must end with an unwrap expression and optionally a label filter expression to discard errors.</p>
                  <p>The unwrap expression is noted <code>| unwrap label_identifier</code> where the label identifier is the label name to use for extracting sample values.</p>
                  <p>Since label values are string, by default a conversion into a float (64bits) will be attempted, in case of failure the <code>__error__</code> label is added to the sample. Optionally the label identifier can be wrapped by a conversion function <code>| unwrap &lt;function&gt;(label_identifier)</code>, which will attempt to convert the label value from a specific format.</p>
                  <p>We currently support the functions:</p>
                  <ul>
                    <li><code>duration_seconds(label_identifier)</code> (or its short equivalent <code>duration</code>) which will convert the label value in seconds from the go duration format (e.g <code>5m</code>, <code>24s30ms</code>).</li>
                    <li><code>bytes(label_identifier)</code> which will convert the label value to raw bytes applying the bytes unit (e.g. <code>5 MiB</code>, <code>3k</code>, <code>1G</code>).</li>
                  </ul>
                  <p>Supported function for operating over unwrapped ranges are:</p>
                   <ul>
                    <li><code> rate(unwrapped-range)</code>: calculates per second rate of the sum of all values in the specified interval.</li>
                    <li><code> rate_counter(unwrapped-range)</code>: calculates per second rate of the values in the specified interval and treating them as “counter metric”</li>
                    <li><code> sum_over_time(unwrapped-range)</code>: the sum of all values in the specified interval.</li>
                    <li><code> avg_over_time(unwrapped-range)</code>: the average value of all points in the specified interval.</li>
                    <li><code> max_over_time(unwrapped-range)</code>: the maximum value of all points in the specified interval.</li>
                    <li><code> min_over_time(unwrapped-range)</code>: the minimum value of all points in the specified interval</li>
                    <li><code> first_over_time(unwrapped-range)</code>: the first value of all points in the specified interval</li>
                    <li><code> last_over_time(unwrapped-range)</code>: the last value of all points in the specified interval</li>
                    <li><code> stdvar_over_time(unwrapped-range)</code>: the population standard variance of the values in the specified interval.</li>
                    <li><code> stddev_over_time(unwrapped-range)</code>: the population standard deviation of the values in the specified interval.</li>
                    <li><code> quantile_over_time(scalar,unwrapped-range)</code>: the φ-quantile (0 ≤ φ ≤ 1) of the values in the specified interval.</li>
                    <li><code> absent_over_time(unwrapped-range)</code>: returns an empty vector if the range vector passed to it has any elements and a 1-element vector with the value 1 if the range vector passed to it has no elements. ( <code>absent_over_time</code> is useful for alerting on when no time series and logs stream exist for label combination for a certain amount of time.)</li>
                  </ul>
                  <p>Except for <code>sum_over_time</code>,<code>absent_over_time</code> and <code>rate</code>, unwrapped range aggregations support grouping.</p>
                  <p><code class="fillbox">&lt;aggr-op&gt;([parameter,] &lt;unwrapped-range&gt;) [without|by (&lt;label list&gt;)]</code></p>
                  <p>Which can be used to aggregate over distinct labels dimensions by including a <code>without</code> or <code>by</code> clause.</p>
                  <p><code>without</code> removes the listed labels from the result vector, while all other labels are preserved the output. <code>by</code> does the opposite and drops labels that are not listed in the <code>by</code> clause, even if their label values are identical between all elements of the vector.</p>
                </div>
              </div>
              <!-- Unwrapped examples -->
              <div class="introduce-view__content">
                <h2 id="unwrapped-examples">Unwrapped examples</h2>
                <div class="introduce-view__content-label logfmt-module">
                 <pre>quantile_over_time(0.99,
  {cluster="ops-tools1",container="ingress-nginx"}
    | json
    | __error__ = ""
    | unwrap request_time [1m]) by (path)</pre>
                 <p>This example calculates the p99 of the nginx-ingress latency by path.</p>
                 <pre>sum by (org_id) (
  sum_over_time(
  {cluster="ops-tools1",container="loki-dev"}
      |= "metrics.go"
      | logfmt
      | unwrap bytes_processed [1m])
  )</pre>
                 <p>This calculates the amount of bytes processed per organization ID.</p>
                </div>
              </div>
               <!-- Built-in aggregation operators -->
              <div class="introduce-view__content">
                <h1 class="page-header-two" id="built-in-aggregation-operators">Built-in aggregation operators</h1>
                <div class="introduce-view__content-label">
                  <p>Like PromQL, LogQL supports a subset of built-in aggregation operators that can be used to aggregate the element of a single vector, resulting in a new vector of fewer elements but with aggregated values:</p>
                  <ul>
                    <li><code> sum</code>: Calculate sum over labels</li>
                    <li><code> avg</code>: Calculate the average over labels</li>
                    <li><code> min</code>: Select minimum over labels</li>
                    <li><code> max</code>: Select maximum over labels</li>
                    <li><code> stddev</code>: Calculate the population standard deviation over labels</li>
                    <li><code> stdvar</code>: Calculate the population standard variance over labels</li>
                    <li><code> count</code>: Count number of elements in the vector</li>
                    <li><code> topk</code>: Select largest k elements by sample value</li>
                    <li><code> bottomk</code>: Select smallest k elements by sample value</li>
                  </ul>
                  <p>The aggregation operators can either be used to aggregate over all label values or a set of distinct label values by including a <code>without</code> or a <code>by</code> clause:</p>
                  <p><code class="fillbox">&lt;aggr-op&gt;([parameter,] &lt;vector expression&gt;) [without|by (&lt;label list&gt;)]</code></p>
                  <p><code>parameter</code> is required when using <code>topk</code> and <code>bottomk</code>. <code>topk</code> and <code>bottomk</code> are different from other aggregators in that a subset of the input samples, including the original labels, are returned in the result vector.</p>
                  <p><code>by</code> and <code>without</code> are only used to group the input vector. The <code>without</code> clause removes the listed labels from the resulting vector, keeping all others. The <code>by</code> clause does the opposite, dropping labels that are not listed in the clause, even if their label values are identical between all elements of the vector.</p>
                </div>
              </div>
               <!-- Vector aggregation examples -->
              <div class="introduce-view__content">
                <h2 id="vector-aggregation-examples">Vector aggregation examples</h2>
                <div class="introduce-view__content-label">
                 <p>Get the top 10 applications by the highest log throughput:</p>
                 <p><code class="fillbox">topk(10,sum(rate({region="us-east1"}[5m])) by (name))</code></p>
                 <p>Get the count of log lines for the last five minutes for a specified job, grouping by level:</p>
                 <p><code class="fillbox">sum(count_over_time({job="mysql"}[5m])) by (level)</code></p>
                 <p>Get the rate of HTTP GET requests to the <code>/home</code> endpoint for NGINX logs by region:</p>
                 <p><code class="fillbox">avg(rate(({job="nginx"} |= "GET" | json | path="/home")[10s])) by (region)</code></p>
                </div>
              </div>
              </div>
            </div>
            <!-- 中文 -->
            <div class="info-room title-heard" v-else>
              <div class="col-md-9 logs-content">
                <!-- LogQL: Log query language -->
                <h1 class="page-header" style="margin-Top:0px" id="log-query-language">LogQL：日志查询语言<a class="header-anchor" href="https://grafana.com/docs/loki/latest/logql/" rel="noopener noreferrer" target="_blank"><i class="nz-icon nz-icon-link1" style="font-size: 16px;" :title="$t('overall.link')"></i></a></h1>
                <div class="title-heard__divider"></div>
                <!-- catalog 目录 -->
                <div class="catalog">
                <ul class="catalog-square">
                  <li>
                    <div @click="jumpClick('#log-queries')"><span>日志查询</span></div>
                    <ul class="catalog-disc">
                      <li @click="jumpClick('#log-stream-selector')"><span>日志流选择器</span></li>
                      <li>
                        <div @click="jumpClick('#log-pipeline')"><span>日志管道</span></div>
                         <ul>
                            <li @click="jumpClick('#line-filter-expressions')"><span>行过滤表达式</span></li>
                            <li @click="jumpClick('#label-filter-expressions')"><span>标签过滤表达式</span></li>
                            <li @click="jumpClick('#parsing-expressions')"><span>解析器表达式</span></li>
                            <li @click="jumpClick('#JSON')"><span>JSON</span></li>
                            <li @click="jumpClick('#logfmt')"><span>logfmt</span></li>
                            <li @click="jumpClick('#pattern')"><span>Pattern</span></li>
                            <li @click="jumpClick('#regexp')"><span>正则表达式</span></li>
                            <li @click="jumpClick('#unpack')"><span>unpack</span></li>
                            <li @click="jumpClick('#line-format-expressions')"><span>行格式化表达式</span></li>
                            <li @click="jumpClick('#label-format-expressions')"><span>标签格式化表达式</span></li>
                         </ul>
                      </li>
                      <li>
                        <div @click="jumpClick('#log-queries-examples')"><span>日志查询示例</span></div>
                         <ul>
                            <li @click="jumpClick('#multiple-filtering')"><span>多个过滤阶段</span></li>
                            <li @click="jumpClick('#multiple-parsers')"><span>使用多个解析器</span></li>
                            <li @click="jumpClick('#formatting')"><span>日志行格式化</span></li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <div @click="jumpClick('#metric-queries')"><span>度量查询</span></div>
                    <ul>
                      <li style="list-style:disc;">
                        <div @click="jumpClick('#range-vector-aggregation')"><span>范围向量聚合</span></div>
                        <ul>
                          <li @click="jumpClick('#log-range-aggregations')"><span>日志范围聚合</span></li>
                          <li @click="jumpClick('#unwrapped-range-aggregations')"><span>展开范围聚合</span></li>
                          <li @click="jumpClick('#unwrapped-examples')"><span>展开</span></li>
                        </ul>
                      </li>
                      <li style="list-style:disc;">
                        <div @click="jumpClick('#built-in-aggregation-operators')"><span>内置聚合运算符</span></div>
                        <ul><li @click="jumpClick('#vector-aggregation-examples')"><span>向量聚合</span></li></ul>
                      </li>
                    </ul>
                  </li>
                  </ul>
                </div>
                <div class="page-header-label">
                    <p>LogQL 是 Grafana Loki 的、受 PromQL 启发的查询语言。查询动作就像是通过分布式 grep 来聚合日志源。LogQL 使用标签和运算符进行过滤。</p>
                    <p>LogQL 查询分为两类：</p>
                    <ul>
                     <li><b style="color: #3C92F1" @click="jumpClick('#log-queries')" class="log-link">日志查询 </b>返回日志行的内容</li>
                     <li><b style="color: #3C92F1" @click="jumpClick('#metric-queries')" class="log-link">度量查询 </b>延展日志查询，基于查询结果计算</li>
                    </ul>
                </div>

                <!-- Log queries -->
                <!-- start -->
                <div class="introduce-view__content">
                  <h1 class="page-header-one" id="log-queries">日志查询</h1>
                  <p>所有LogQL查询都含有一个<b>日志流选择器</b>。</p>
                  <div class="img-hidden"><img src="data:image/png;base64,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" alt=""></div>
                  <p>日志流选择器后的<b>日志管道</b>是可选的。日志管道由一组阶段表达式连接而成，应用于所选的日志流。每个表达式都可以过滤、解析和改变日志行内容以及各自的标签。</p>
                  <p>以下示例展示了一个完整的日志查询操作：</p>
                  <p><code class="fillbox">{container="query-frontend",namespace="loki-dev"} |= "metrics.go" | logfmt | duration > 10s and throughput_mb &lt; 500</code></p>
                  <p>该查询的组成部分为：</p>
                  <ul>
                    <li>一个日志流选择器 <code>{container="query-frontend",namespace="loki-dev"}</code> ，用于过滤 <code>loki-dev</code> 命名空间里的 <code>query-frontend</code> 容器的日志。</li>
                    <li>一个日志管道 <code>|= "metrics.go" | logfmt | duration > 10s and throughput_mb < 500</code> ，会过滤出含有词 <code>metrics.go</code> 的日志，解析每个日志行，以提取更多标签用于过滤。</li>
                  </ul>
                  <pre>为了避免转义特殊字符，在引用字符串时可以使用 <code>`</code>（反引号），而非 <code> " </code>（双引号）。例如：<code>`\w+`</code> 与 <code>"\\w+"</code>相同。在写含有多个需要转义的反斜杠的正则表达式时，这一方法尤其有用。</pre>
                </div>
                <!-- Log stream selector -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="log-stream-selector">日志流选择器</h1>
                  <div class="introduce-view__content-label">
                    <p>日志流选择器决定了查询结果包含哪些日志流。一条日志流是一个日志内容独特的源，例如一个文件。一个更细粒度的日志流选择器能够减少搜索到的流数量，便于管理。这意味着传递给日志流选择器的标签将影响查询执行的相关表现。</p>
                    <p>日志流选择器由一个或多个逗号分隔的键值对组成。键为一个日志标签，值为该标签的值。大括号 (<code>{</code> 和 <code>}</code>) 划定了流选择器的边界。</p>
                    <p>以该流选择器为例：</p>
                    <p><code class="fillbox">{app="mysql",name="mysql-backup"}</code></p>
                    <p>所有既包含值为 <code>mysql</code> 的 <code>app</code> 标签、又包含值为 <code>mysql-backup</code> 的 <code>name</code> 标签的日志流，都会被包含在查询结果之中。一条流可能包含其他标签和值对，但只有流选择器指定的对才会用于决定查询结果包含哪些日志流。</p>
                    <p>适用于 Prometheus 标签选择器 的规则同样适用于 Grafana Loki 日志流选择器。</p>
                    <p>位于标签名后的 <code>=</code> 运算符为<b>标签匹配运算符</b>。支持以下标签匹配运算符：</p>
                    <ul>
                      <li><code>=</code>: 完全匹配</li>
                      <li><code>!=</code>: 不相等</li>
                      <li><code>=~</code>: 正则表达式匹配</li>
                      <li><code>!~</code>: 正则表达式不匹配</li>
                    </ul>
                    <p>正则表达式日志流示例：</p>
                    <ul>
                      <li><code>{name =~ "mysql.+"}</code></li>
                      <li><code>{name !~ "mysql.+"}</code></li>
                      <li><code>{name !~ `mysql-\d+`}</code></li>
                    </ul>
                    <p><b>注意:</b> 正则表达式运算符 <code>=~</code> 是完全锚定的，意味着正则表达式必须与整个字符串进行匹配，包括新行 <code>。</code> 正则表达式 。 字符默认不匹配新行，如果您想让其匹配新行，您可以使用单行标志，例如： <code>(?s)search_term.+</code> matches <code>search_term\n</code>。</p>
                  </div>
                </div>
                <!-- Log pipeline -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="log-pipeline">日志管道</h1>
                  <div class="introduce-view__content-label">
                    <p>日志管道可以附加到日志流选择器上，以进一步处理和过滤日志流。日志管道由一组表达式组成。每个表达式针对每个日志行按从左到右的顺序执行。如果表达式过滤处理一个日志行，管道将停止处理当前日志行，并开始处理下一日志行。</p>
                    <p>一些表达式可以改变日志内容及关联标签，用于后续表达式的进一步过滤和分析。以下示例表达式可以改变：</p>
                    <p><code v-pre class="fillbox">| line_format "{{.status_code}}"</code></p>
                    <p>日志表达式分为三类：</p>
                    <ul>
                      <li>过滤表达式: <b style="color: #3C92F1" @click="jumpClick('#line-filter-expressions')" class="log-link">行过滤表达式</b> 和 <b style="color: #3C92F1" @click="jumpClick('#label-filter-expressions')" class="log-link">标签过滤表达式</b></li>
                      <li><b style="color: #3C92F1" @click="jumpClick('#parsing-expressions')" class="log-link">解析表达式</b></li>
                      <li>格式化表达式: <b style="color: #3C92F1" @click="jumpClick('#line-format-expressions')" class="log-link">行格式化表达式</b> 和 <b style="color: #3C92F1" @click="jumpClick('#label-format-expressions')" class="log-link">标签格式化表达式</b></li>
                    </ul>
                  </div>
                </div>
                <!-- Line filter expression -->
                <div class="introduce-view__content">
                  <h2 id="line-filter-expressions">行过滤表达式</h2>
                  <div class="introduce-view__content-label">
                    <p>行过滤表达式对从匹配日志流聚合而来的日志进行分布式 <code>grep</code>，搜索日志行内容，丢弃不匹配区分大小写的表达式的日志行。</p>
                    <p>每个行过滤表达式都有<b>过滤运算符</b>，其后为文本或正则表达式。支持以下过滤运算符：</p>
                    <ul>
                      <li><code>|=</code>: 包含字符串的日志行</li>
                      <li><code>!=</code>: 不含字符串的日志行</li>
                      <li><code>|~</code>: 匹配正则表达式的日志行</li>
                      <li><code>!~</code>: 不匹配正则表达式的日志行</li>
                    </ul>
                    <p>行过滤表达式示例：</p>
                    <ul>
                      <li>
                        <p>保留含有子字符串 “error” 的日志行：</p>
                        <p><code class="fillbox">|= "error"</code></p>
                        <p>使用该示例的完整查询为：</p>
                        <p><code class="fillbox">{job="mysql"} |= "error"</code></p>
                      </li>
                      <li>
                        <p>丢弃含有子字符串 “kafka.server:type=ReplicaManager” 的日志行：</p>
                        <p><code class="fillbox">!= "kafka.server:type=ReplicaManager"</code></p>
                        <p>使用该示例的完整查询为：</p>
                        <p><code class="fillbox">{instance=~"kafka-[23]",name="kafka"} != "kafka.server:type=ReplicaManager"</code></p>
                      </li>
                      <li>
                        <p>保留含有以 <code>tsdb-ops</code> 开头、<code>io:2003</code> 结尾的子字符串的日志行。带有正则表达式的完整查询为：</p>
                        <p><code class="fillbox">{name="kafka"} |~ "tsdb-ops.*io:2003"</code></p>
                      </li>
                      <li>
                        <p>保留含有以 <code>error=</code> 开头、且其后有至少一个字符的子字符串的日志行。带有正则表达式的完整查询为：</p>
                        <p><code class="fillbox">{name="cassandra"} |~  `error=\w+`</code></p>
                      </li>
                    </ul>
                    <p>过滤运算符可以连接起来使用。过滤器按顺序应用。查询结果将满足每个过滤器。该完整查询示例给出的结果包含字符串<code>error</code>，且不包含字符串 <code>timeout</code>。</p>
                    <p><code class="fillbox">{job="mysql"} |= "error" != "timeout"</code></p>
                    <p>当使用 <code>|~</code> 和 <code>!~</code> 时，可能使用 Go（即 Golang）RE2 语法 正则表达式。默认情况下，匹配区分大小写。将 <code>(?i)</code> 作为正则表达式前缀，切换匹配为不区分大小写。</p>
                    <p>虽然行过滤表达式可以放置在日志管道中任意位置，但最好还是置于开头。当某一行匹配时才能做后续处理，从而提升了查询性能。例如，虽然结果相同，但下面的查询</p>
                    <p><code class="fillbox" v-pre>{job="mysql"} |= "error" | json | line_format "{{.err}}"</code></p>
                    <p>总是比以下查询更快</p>
                    <p><code class="fillbox" v-pre>{job="mysql"} | json | line_format "{{.message}}" |= "error"</code></p>
                    <p>一旦应用了日志流选择器，行过滤表达式是过滤日志的最快方法。</p>
                    <p>行过滤表达式支持匹配 IP 地址。详情参见匹配 IP 地址 。</p>
                  </div>
                </div>
                <!-- Label filter expression -->
                <div class="introduce-view__content">
                  <h2 id="label-filter-expressions">标签过滤表达式</h2>
                  <div class="introduce-view__content-label">
                    <p>标签过滤表达式可以使用原始和提取的标签来过滤日志行，可包含多个谓词。</p>
                    <p>谓词包含用于比较标签的<b>标签标识符</b>、<b>运算符</b>和<b>值</b>。</p>
                    <p>例如，在 <code>cluster="namespace"</code> 中， cluster 为标签标识符，运算符为 <code>=</code>，值为 “namespace” 。标签标识符总是在运算符的左侧。</p>
                    <p>LogQL 支持多种<b>值</b>类型， 这些值类型会从查询输入中自动推断出来。</p>
                    <ul>
                      <li><b>字符串</b>使用双引号或反引号，如 <code>"200"</code> 或 `<code>us-central1</code>`。</li>
                      <li>持续时间 是一串带后缀单位的十进制数字，数字可为小数，如 “300ms”、“1.5h” 或 “2h45m”。有效的时间单位为 “ns”、“us” (或 “µs”)、“ms”、“s”、“m”、“h”。</li>
                      <li><b>数字</b>为浮点数（64位），如 <code>250</code>、<code>89.923</code>。</li>
                      <li><b>字节 </b>是一串带后缀单位的十进制数字，数字可为小数，如 “42MB”、“1.5Kib” 或 “20b”。有效的字节单位为 “b”、“kib”、“kb”、“mib”、“mb”、“gib”、“gb”、“tib”、“tb”、“pib”、“pb”、“eib”、“eb”。</li>
                    </ul>
                    <p>字符串类型使用方法和 <b style="color: #3C92F1" @click="jumpClick('#log-stream-selector')" class="log-link">日志流选择器</b> 里的 Prometheus 标签匹配器使用方法完全一样，意味着您也使用这些运算符(<code>=</code>、<code>!=</code>、<code>=~</code>、<code>!~</code>)。</p>
                    <pre>字符串类型是唯一能够过滤出含有标签 <code>__error__</code>日志行的方式。</pre>
                    <p>使用持续时间、数字、字节可以在比较前转换标签值，支持以下比较符：</p>
                    <ul>
                      <li><code>==</code> 或 <code>=</code> 表示相等。</li>
                      <li><code>!=</code> 表示不相等。</li>
                      <li><code>></code> 和 <code>>=</code> 分别表示大于和大于等于。</li>
                      <li><code>&lt;</code> 和 <code>&lt;=</code> 分别表示小于和小于等于。</li>
                    </ul>
                    <p>例如：<code>logfmt | duration > 1m and bytes_consumed > 20MB</code></p>
                    <p>如果标签值未能成功转换，则无法过滤日志行，同时还添加 <code>__error__</code> 标签。要过滤这些错误，详情参见管道错误一节。</p>
                    <p>您可以使用 <code>and</code> 和 <code>or</code> 来连接多个谓词，<code>and</code> 表示 and 的二进制运算，<code>or</code> 表示 or 的二进制运算。<code>and</code> 也可以用逗号、空格、另一管道来表示。标签过滤器可放置在日志管道的任意位置。</p>
                    <p>这意味着以下所有表达式都是等价的：</p>
                    <p><code class="fillbox">
                             | duration >= 20ms or size == 20kb and method!~"2.."<br/>
                             | duration >= 20ms or size == 20kb | method!~"2.."<br/>
                             | duration >= 20ms or size == 20kb , method!~"2.."<br/>
                             | duration >= 20ms or size == 20kb  method!~"2.."
                    </code></p>
                    <p>评估多个谓词时，优先级为从左到右。您可以用圆括号括住谓词，改变其优先级。</p>
                    <p>以下示例为等价的：</p>
                    <p><code class="fillbox">
                      | duration >= 20ms or method="GET" and size &lt;= 20KB<br/>
                      | ((duration >= 20ms or method="GET") and size &lt;= 20KB)
                      </code></p>
                      <p>若要先评估逻辑 and ，使用圆括号，如：</p>
                      <p><code class="fillbox">| duration >= 20ms or (method="GET" and size &lt;= 20KB)</code></p>
                      <pre>在展开表达式后仅允许标签过滤表达式，主要是为了从度量提取中过滤出错误。</pre>
                      <p>标签过滤表达式支持匹配 IP 地址，详情参见匹配 IP 地址 。</p>
                  </div>
                </div>
                <!-- Parser expression -->
                <div class="introduce-view__content">
                  <h2 id="parsing-expressions">解析器表达式</h2>
                  <div class="introduce-view__content-label">
                    <p>解析器表达式可以从日志内容中解析、提取标签。提取的标签可以用 <b style="color: #3C92F1" @click="jumpClick('#label-filter-expressions')" class="log-link">标签过滤表达式</b> 来过滤，或用于 <b style="color: #3C92F1" @click="jumpClick('#metric-queries')" class="log-link">度量聚合</b>。</p>
                    <p>提取的标签键由所有解析器自动净化，以满足 Prometheus 度量名称的规则。（只能包含ASCII字母和数字、下划线和冒号，不能以数字开头。）</p>
                    <p>例如，<code>| json</code>管道会生成以下映射：</p>
                    <p><code class="fillbox">{ "a.b": {c: "d"}, e: "f" }</code></p>
                    <p>-></p>
                    <p><code class="fillbox">{a_b_c="d", e="f"}</code></p>
                    <p>在出错的情况下，例如，如果该行格式不符合要求，则该日志行不会被过滤，同时会添加一个新标签 <code>__error__</code>。</p>
                    <p>如果在原始日志流中已经存在了提取的标签键名称，该提取的标签键会添加关键词 <code>_extracted</code> 作为后缀，从而区分这两个标签。您可以使用 <b style="color: #3C92F1" @click="jumpClick('#label-format-expressions')" class="log-link">标签格式化表达式</b> 来强制覆盖原始标签。 但是如果一个提取的键出现了两次，那么只会保留最新的标签值。</p>
                    <p>Loki 支持 <b style="color: #3C92F1" @click="jumpClick('#JSON')" class="log-link">JSON</b>、<b style="color: #3C92F1" @click="jumpClick('#logfmt')" class="log-link">logfmt</b>、<b style="color: #3C92F1" @click="jumpClick('#pattern')" class="log-link">pattern</b>、<b style="color: #3C92F1"  @click="jumpClick('#regexp')" class="log-link">regexp</b> 和 <b style="color: #3C92F1" @click="jumpClick('#unpack')" class="log-link">unpack</b> 解析器。</p>
                    <p>应尽量用 <code>json</code> 和 <code>logfmt</code> 等预定义解析器，使用起来更便捷。如果无法使用的话，可以用 <code>pattern</code> 和 <code>regexp</code> 解析器来处理带有异常结构的日志行 <code>pattern</code> 解析器写起来更容易，速度更快，性能也比 <code>regexp</code> 解析器更高。可以在一条日志管道中使用多个解析器，在解析复杂日志时尤其有用。示例参见 <b style="color: #3C92F1" @click="jumpClick('#multiple-parsers')" class="log-link">多个解析器</b>。</p>
                  </div>
                </div>
                <!-- JSON -->
                <div class="introduce-view__content">
                <h2 id="JSON">JSON</h2>
                <div class="introduce-view__content-label">
                  <p><b>json</b> 解析器有两种运行模式：</p>
                  <p>1. <b>没有</b>参数：</p>
                  <div class="logfmt-module" style="padding-left: 20px;">
                    <p>如果日志行为有效的json文档，在管道中添加 <code>| json</code> 会将所有 json 属性提取为标签。嵌套属性使用 <code>_</code> 分隔符平铺到标签键中。</p>
                    <p>注意：<b>数组会被跳过</b>。</p>
                    <p>例如，json 解析器从以下文档中提取：</p>
                    <pre>{
    "protocol": "HTTP/2.0",
    "servers": ["129.0.1.1","10.2.1.3"],
    "request": {
        "time": "6.032",
        "method": "GET",
        "host": "foo.grafana.net",
        "size": "55",
        "headers": {
          "Accept": "*/*",
          "User-Agent": "curl/7.68.0"
        }
    },
    "response": {
        "status": 401,
        "size": "228",
        "latency_seconds": "6.031"
    }
}</pre>
           <p>以下为标签列表：</p>
           <pre>"protocol" => "HTTP/2.0"
"request_time" => "6.032"
"request_method" => "GET"
"request_host" => "foo.grafana.net"
"request_size" => "55"
"response_status" => "401"
"response_size" => "228"
"response_latency_seconds" => "6.031"</pre>
                  </div>
                  <p>2. <b>有</b>参数：</p>
                  <div class="logfmt-module" style="padding-left: 20px;">
                    <p>在管道中使用 <code>| json label="expression", another="expression"</code> 只会提取指定的 json 字段为标签。您可以以同样的方式指定一个或多个表达式，如同 <code>label_format</code>; 所有表达式必须加引号。</p>
                    <p>目前，我们只支持字段访问 (<code>my.field</code>, <code>my["field"]</code>) 和数组访问 (<code>list[0]</code>), 以及它们在嵌套 (<code>my.list[0]["field"]</code>) 中处于任意级别的任意组合。</p>
                    <p>例如，<code>| json first_server="servers[0]", ua="request.headers[\"User-Agent\"]</code> 从以下文档中提取：</p>
                    <pre>{
    "protocol": "HTTP/2.0",
    "servers": ["129.0.1.1","10.2.1.3"],
    "request": {
        "time": "6.032",
        "method": "GET",
        "host": "foo.grafana.net",
        "size": "55",
        "headers": {
          "Accept": "*/*",
          "User-Agent": "curl/7.68.0"
        }
    },
    "response": {
        "status": 401,
        "size": "228",
        "latency_seconds": "6.031"
    }
}
                    </pre>
                    <p>以下为标签列表：</p>
                    <pre>"first_server" => "129.0.1.1"
"ua" => "curl/7.68.0"</pre>
                    <p>表达式返回的数组或对象会以 json 格式分配给标签。</p>
                    <p>例如，<code>| json server_list="servers", headers="request.headers"</code> 会提取：</p>
                    <pre>"server_list" => `["129.0.1.1","10.2.1.3"]`
"headers" => `{"Accept": "*/*", "User-Agent": "curl/7.68.0"}`</pre>
                    <p>如果待提取的标签与原始 JSON 字段相同，表达式可以写为 <code>| json &lt;label&gt;</code>。</p>
                    <p>例如，将 <code>servers</code> 字段提取为标签，表达式写法如下：</p>
                    <p><code>| json servers</code> 会提取：</p>
                    <pre>"servers" => `["129.0.1.1","10.2.1.3"]`</pre>
                    <p>注意：<code>| json servers</code> 与 <code>| json servers="servers"</code> 相同。</p>
                  </div>
                </div>
              </div>
              <!-- logfmt -->
              <div class="introduce-view__content">
                <h2 id="logfmt">logfmt</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p><b>logfmt</b> 解析器可以通过 <code>| logfmt</code> 来添加，会从 logfmt 格式化的日志行中提取所有的键和值。</p>
                  <p>例如，日志行：</p>
                  <pre>at=info method=GET path=/ host=grafana.net fwd="124.133.124.161" service=8ms status=200</pre>
                  <p>可以将这些标签提取出来：</p>
                  <pre>"at" => "info"
"method" => "GET"
"path" => "/"
"host" => "grafana.net"
"fwd" => "124.133.124.161"
"service" => "8ms"
"status" => "200"</pre>
                </div>
              </div>
              <!-- Pattern -->
              <div class="introduce-view__content">
                <h2 id="pattern">Pattern</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p>模式（Pattern）解析器可以通过定义模式表达式 (<code>| pattern "&lt;pattern-expression&gt;"</code>)，从日志行中显式提取字段。该表达式匹配日志行的结构。</p>
                  <p>以 NGINX 日志行为例：</p>
                  <p><code class="fillbox">0.191.12.2 - - [10/Jun/2021:09:14:29 +0000] "GET /api/plugins/versioncheck HTTP/1.1" 200 2 "-" "Go-http-client/2.0" "13.76.247.102, 34.120.177.193" "TLSv1.2" "US" ""
</code></p>
                  <p>该日志行可以用以下表达式解析：</p>
                  <p><code>&lt;ip&gt; - - &lt;_&gt; "&lt;method&gt; &lt;uri&gt; &lt;_&gt;" &lt;status&gt; &lt;size&gt; &lt;_&gt; "&lt;agent&gt;" &lt;_&gt;</code></p>
                  <p>提取出以下字段：</p>
                  <pre>"ip" => "0.191.12.2"
"method" => "GET"
"uri" => "/api/plugins/versioncheck"
"status" => "200"
"size" => "2"
"agent" => "Go-http-client/2.0"</pre>
                  <p>模式表达式由捕获和字面量组成。</p>
                  <p>捕获为由 <code>&lt;</code> 和 <code>&gt;</code> 字符分隔的字段名称。 <code>&lt;example&gt;</code> 定义了字段名称 <code>example</code>。未命名的捕获会显示为 <code>&lt;_&gt;</code>。<br/>且会跳过匹配的内容。</p>
                  <p>捕获会从行开头匹配到行结尾，或从上一组字面量匹配到下一组字面量。 如果捕获没有匹配，模式解析器则会停止。</p>
                  <p>字面量可以是任意一串 UTF-8 字符，包括空白字符。</p>
                  <p>默认情况下，模式表达式锚定在日志行开头。如果表达式以字面量开头，日志行也需以同一组字面量开头。如果不想再日志行开头锚定表达式，可在表达式开头使用 <code>&lt;_&gt;</code> 。</p>
                  <p>以该日志行为例</p>
                  <pre>level=debug ts=2021-06-10T09:24:13.472094048Z caller=logging.go:66 traceID=0568b66ad2d9294c msg="POST /loki/api/v1/push (204) 16.652862ms"</pre>
                  <p>要匹配 <code>msg="</code>，使用表达式：</p>
                  <pre>&lt;_&gt; msg="&lt;method&gt; &lt;path&gt; (&lt;status&gt;) &lt;latency&gt;"</pre>
                  <p>在以下情况中，模式表达式是无效的</p>
                  <ul>
                    <li>不含任何已命名的捕获。</li>
                    <li>含有两个未经空白字符分隔的连续捕获。</li>
                    </ul>
                </div>
              </div>
              <!-- Regular expression -->
              <div class="introduce-view__content">
                <h2 id="regexp">正则表达式</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p>不同于隐式提取所有值且不用参数的 logfmt 和 json，正则表达式的解析器需要一个参数 <code>| regexp "&lt;re&gt;"</code> ，为 Golang RE2 语法的正则表达式。</p>
                  <p>正则表达式必须含有至少一个已命名的子匹配（如 <code>(?P&lt;name&gt;re)</code> ），每个子匹配都会提取一个不同的标签。</p>
                  <p>例如，解析器 | regexp "(?P&lt;method&gt;\\w+) (?P&lt;path&gt;[\\w|/]+) \\((?P&lt;status&gt;\\d+?)\\) (?P&lt;duration&gt;.*)" 会从以下行中提取：</p>
                  <pre>POST /api/prom/api/v1/query_range (200) 1.5s</pre>
                  <p>这些标签：</p>
                  <pre>"method" => "POST"
"path" => "/api/prom/api/v1/query_range"
"status" => "200"
"duration" => "1.5s"</pre>
                </div>
              </div>
              <!-- unpack -->
              <div class="introduce-view__content">
                <h2 id="unpack">unpack</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p><code>unpack</code> 解析器解析 JSON 日志行，解包所有 Promtail <code>pack</code> 阶段的嵌入标签。<b>特殊属性 <code>_entry</code> 会用来代替原始日志行</b>。</p>
                  <p>例如，对日志行使用 <code>| unpack</code> :</p>
                  <pre>{
  "container": "myapp",
  "pod": "pod-3223f",
  "_entry": "original log message"
}</pre>
                  <p>提取 <code>container</code> 标签和 <code>pod</code> 标签；将 <code>original log message</code> 设为新日志行。</p>
                  <p>如果原始嵌入日志行属于某种格式，您可以结合使用 <code>unpack</code> 解析器和 <code>json</code> 解析器（或其他解析器）。</p>
                </div>
              </div>
              <!-- Line format expression -->
              <div class="introduce-view__content">
                <h2 id="line-format-expressions">行格式化表达式</h2>
                <div class="introduce-view__content-label logfmt-module">
                 <p v-pre>行格式化表达式可以用 文本/模板 格式来重写日志行内容。需要一个字符串参数 <code>| line_format "{{.label_name}}"</code>作为模板格式。所有标签都是注入模板的变量，可以用 <code>{{.label_name}}</code> 符号来使用。</p>
                 <p>例如，以下表达式：</p>
                 <pre v-pre>{container="frontend"} | logfmt | line_format "{{.query}} {{.duration}}"</pre>
                 <p>会提取并重写日志行，使其只包含查询和请求持续时间。</p>
                 <p v-pre>您可在模板中使用带双引号的字符串，或带反引号的 <code>`{{.label_name}}`</code> 来避免转义特殊字符。</p>
                 <p><code>line_format</code> 同样支持 <code>math</code> 函数。例如：</p>
                 <p>如果有 <code>ip=1.1.1.1</code>、<code>status=200</code> 和 <code>duration=3000(ms)</code> 这三个标签，我们可以将持续时间除以<code>1000</code> 来获取以秒为单位的值。</p>
                 <pre v-pre>{container="frontend"} | logfmt | line_format "{{.ip}} {{.status}} {{div .duration 1000}}"</pre>
                 <p>以上查询得到的 <code>line</code> 为 <code>1.1.1.1 200 3</code>。</p>
                 <p>了解模板格式的可用函数，详情参见模板函数。</p>
                </div>
              </div>
              <!-- Labels format expression -->
              <div class="introduce-view__content">
                <h2 id="label-format-expressions">标签格式化表达式</h2>
                <div class="introduce-view__content-label">
                 <p><code>| label_format</code> 表达式可以重命名、修改或增加标签，以逗号分隔的相等运算列表作为参数，可以同时进行多个运算。</p>
                 <p>当两侧都为标签标识符时，如 <code>dst=src</code>，该运算会将 <code>src</code> 标签重命名为 <code>dst</code>。</p>
                 <p>另外，右侧还可以是模板字符串（双引号或反引号），如 dst="<code v-pre>{{.status}} {{.query}}</code>"，其中 <code>dst</code> 标签值替换为文本/模板的评估结果。此处的模板引擎与 <code>| line_format</code> 表达式的相同，意味着标签可当作变量来使用，您也可以用同样的函数列表。</p>
                 <p>在以上两种情况中，如果目的标签不存在，则会创建一个新标签。</p>
                 <p><code>dst=src</code> 重命名形式会在将 <code>src</code> 标签重映射到 <code>dst</code> 标签后丢弃 src 标签。但是，模板形式将保留引用的标签，这样一来 <code v-pre>dst="{{.src}}"</code> 导致 <code>dst</code> 和 <code>src</code> 的值相同。</p>
                 <pre>一个标签名称在每个表达式中只能出现一次，这意味着 <code>| label_format foo=bar,foo="new"</code> 是不允许的；想要达到预期效果，您可以使用两个表达式：<code>| label_format foo=bar | label_format foo="new"</code>。</pre>
                </div>
              </div>
              <!-- Log queries examples -->
               <h1 class="page-header-two" id="log-queries-examples">日志查询示例</h1>
               <!-- Multiple filtering -->
              <div class="introduce-view__content">
                <h2 id="multiple-filtering">多个过滤阶段</h2>
                <div class="introduce-view__content-label">
                  <p>查询结果按从左到右连续评估的方式收集。为了提高查询效率，从左到右排序过滤阶段：流选择器、行过滤器、标签过滤器。以该查询为例：</p>
                  <p><code v-pre class="fillbox">{cluster="ops-tools1", namespace="loki-dev", job="loki-dev/query-frontend"} |= "metrics.go" !="out of order" | logfmt | duration > 30s or status_code!="200"</code></p>
                </div>
              </div>
              <!-- Multiple parsers -->
              <div class="introduce-view__content">
                <h2 id="multiple-parsers">使用多个解析器</h2>
                <div class="introduce-view__content-label">
                  <p>以 logfmt 日志行为例。提取该 logfmt 日志行的方法和路径:</p>
                  <p><code v-pre class="fillbox">level=debug ts=2020-10-02T10:10:42.092268913Z caller=logging.go:66 traceID=a9d4d8a928d8db1 msg="POST /api/prom/api/v1/query_range (200) 1.5s"</code></p>
                  <p>要提取方法和路径，需使用多个解析器 (logfmt 和 regexp)：</p>
                  <p><code v-pre class="fillbox">{job="loki-ops/query-frontend"} | logfmt | line_format "{{.msg}}" | regexp "(?P&lt;method&gt;\\w+) (?P&lt;path&gt;[\\w|/]+) \\((?P&lt;status&gt;\\d+?)\\) (?P&lt;duration&gt;.*)"</code></p>
                  <p>这么做是可行的，因为 <code>| line_format</code> 将日志行重新格式化为 <code>POST /api/prom/api/v1/query_range (200) 1.5s</code>，随即可用 <code>| regexp ...</code> 解析器来解析。</p>
                </div>
              </div>
              <!-- Formatting -->
              <div class="introduce-view__content">
                <h2 id="formatting">日志行格式化</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p>以下查询展示了如何通过重新格式化日志行增加可读性。</p>
                  <pre v-pre>{cluster="ops-tools1", name="querier", namespace="loki-dev"}
  |= "metrics.go" != "loki-canary"
  | logfmt
  | query != ""
  | label_format query="{{ Replace .query &#92;"&#92;&#92;n&#92;" &#92;"&#92;" -1 }}"
  | line_format "{{ .ts}}&#92;t{{.duration}}&#92;ttraceID = {{.traceID}}&#92;t{{ printf &#92;"%-100.100s&#92;" .query }} "</pre>
                  <p>标签格式化用于净化查询，而行格式化则减少信息量，创建表格输出。</p>
                  <p>对于给出的日志行：</p>
                  <pre>level=info ts=2020-10-23T20:32:18.094668233Z caller=metrics.go:81 org_id=29 traceID=1980d41501b57b68 latency=fast query="{cluster=\"ops-tools1\", job=\"loki-ops/query-frontend\"} |= \"query_range\"" query_type=filter range_type=range length=15m0s step=7s duration=650.22401ms status=200 throughput_mb=1.529717 total_bytes_mb=0.994659
level=info ts=2020-10-23T20:32:18.068866235Z caller=metrics.go:81 org_id=29 traceID=1980d41501b57b68 latency=fast query="{cluster=\"ops-tools1\", job=\"loki-ops/query-frontend\"} |= \"query_range\"" query_type=filter range_type=range length=15m0s step=7s duration=624.008132ms status=200 throughput_mb=0.693449 total_bytes_mb=0.432718</pre>
                  <p>结果是：</p>
                  <pre>2020-10-23T20:32:18.094668233Z	650.22401ms	    traceID = 1980d41501b57b68	{cluster="ops-tools1", job="loki-ops/query-frontend"} |= "query_range"
2020-10-23T20:32:18.068866235Z	624.008132ms	traceID = 1980d41501b57b68	{cluster="ops-tools1", job="loki-ops/query-frontend"} |= "query_range"</pre>
                </div>
              </div>

               <!-- Metric queries -->
              <div class="introduce-view__content">
                <h1 class="page-header-one" id="metric-queries">度量查询</h1>
                <div class="introduce-view__content-label">
                  <p>度量查询通过将函数应用于日志查询结果来扩展日志查询。这一强大功能从日志中创建度量。</p>
                  <p>度量查询可用来计算错误信息速率，或在过去3小时内拥有最多日志数量的前 N 大日志源。</p>
                  <p>度量查询结合解析器，可用来计算来自日志行里样本值的度量，如延时或请求大小。包括提取标签在内的所有标签，均可用于聚合以及生成新系列。</p>
                </div>
              </div>
              <!-- Range Vector aggregation -->
              <div class="introduce-view__content">
                <h1 class="page-header-two" id="range-vector-aggregation">范围向量聚合</h1>
                <div class="introduce-view__content-label">
                  <p>LogQL 范围向量的概念与 Prometheu 的相同。在 Grafana Loki 中，选中的样本范围为某一范围内选中的日志或标签值。</p>
                  <p>聚合应用于一段时间长度。Loki 定义时间长度的语法与 Prometheus 的相同。</p>
                  <p>Loki 支持两种范围向量聚合：日志范围聚合和展开范围聚合。</p>
                </div>
              </div>
              <!-- Log range aggregations -->
              <div class="introduce-view__content">
                <h2 id="log-range-aggregations">日志范围聚合</h2>
                <div class="introduce-view__content-label">
                  <p>日志范围聚合的查询后带有持续时间。在一段持续时间内应用函数来聚合查询。 持续时间可放置于日志流选择器之后，或日志管道末端。</p>
                  <p>函数：</p>
                  <ul>
                    <li><code> rate(log-range)</code>: 计算每秒条目数。</li>
                    <li><code> count_over_time(log-range)</code>: 计算给定时间内每个日志流的条目数。</li>
                    <li><code> bytes_rate(log-range)</code>: 计算每个流每秒的字节数。</li>
                    <li><code> bytes_over_time(log-range)</code>: 计算给定时间内每个日志流使用的字节数。</li>
                    <li><code> absent_over_time(log-range)</code>: 如果传递给它的范围向量含有元素，则返回空向量；如果传递给它的范围向量不含有元素，则返回值为1的单元素向量。（在某一段时间内，如果没有用于标签组合的时间序列或日志流存在，<code>absent_over_time</code>  可以起较好的告警作用。）</li>
                  </ul>
                  <p>示例：</p>
                  <ul>
                    <li>
                      <p>计算 MySQL 作业在过去五分钟内的所有日志行数。</p>
                      <p><code class="fillbox">count_over_time({job="mysql"}[5m])</code></p>
                    </li>
                    <li>
                      <p>该聚合包括了过滤器和解析器。返回 MySQL 作业每台主机过去几分钟内所有非超时错误的每秒比率，并且只包括持续时间超过10秒的错误。</p>
                      <p><code class="fillbox">sum by (host) (rate({job="mysql"} |= "error" != "timeout" | json | duration > 10s [1m]))</code></p>
                    </li>
                  </ul>
                </div>
              </div>
               <!-- Unwrapped range aggregations -->
              <div class="introduce-view__content">
                <h2 id="unwrapped-range-aggregations">展开范围聚合</h2>
                <div class="introduce-view__content-label">
                  <p>展开范围没有使用日志行而是使用了提取的标签作为样本值。但要选择在聚合里用什么标签，日志查询必须以一个展开表达式为结尾，同时可以选择使用标签过滤表达式来丢弃错误。</p>
                  <p>展开表达式标示为 <code>| unwrap label_identifier</code>，其中，标签标识符是用于提取样本值的标签名称。</p>
                  <p>因为标签值为字符串，默认情况下会尝试将其转换为浮点数（64位），避免因错误使样本添加 <code>__error__</code> 标签。可以选择将标签标识符用转换函数 <code>| unwrap &lt;function&gt;(label_identifier)</code> 打包，该过程会尝试转换特定格式的标签值。</p>
                  <p>LogQL当前支持如下函数:</p>
                  <ul>
                    <li><code>duration_seconds(label_identifier)</code> (简写为 <code>duration</code>)，可将go 持续时间格式 (如：<code>5m</code>、<code>24s30ms</code>)的标签值转换为以秒为单位。</li>
                    <li><code>bytes(label_identifier)</code>，可将标签值转换为原始字节并应用字节单位 (如：<code>5 MiB</code>、<code>3k</code>、<code>1G</code>)。</li>
                  </ul>
                  <p>支持展开范围运算的函数如下：</p>
                   <ul>
                    <li><code> rate(unwrapped-range)</code>: 计算指定时间间隔内所有值总和的每秒速率。</li>
                    <li><code> rate_counter(unwrapped-range)</code>: 计算指定时间间隔内值的每秒速率，并将它们视为 “counter metric”（“计数器度量”）。</li>
                    <li><code> sum_over_time(unwrapped-range)</code>: 指定时间间隔内所有值的总和。</li>
                    <li><code> avg_over_time(unwrapped-range)</code>: 指定间隔内所有点的平均值。</li>
                    <li><code> max_over_time(unwrapped-range)</code>: 指定间隔内所有点的最大值。</li>
                    <li><code> min_over_time(unwrapped-range)</code>: 指定间隔内所有点的最小值。</li>
                    <li><code> first_over_time(unwrapped-range)</code>: 指定时间间隔内所有点的第一个值。</li>
                    <li><code> last_over_time(unwrapped-range)</code>: 指定时间间隔内所有点的最后一个值。</li>
                    <li><code> stdvar_over_time(unwrapped-range)</code>: 指定时间间隔内值的总体标准方差。</li>
                    <li><code> stddev_over_time(unwrapped-range)</code>: 指定时间间隔内值的总体标准偏差。</li>
                    <li><code> quantile_over_time(scalar,unwrapped-range)</code>: 指定间隔内值的 φ 分位数（0 ≤ φ ≤ 1）。</li>
                    <li><code> absent_over_time(unwrapped-range)</code>: 如果传递给它的范围向量含有元素，则返回空向量；如果传递给它的范围向量不含有元素，则返回值为1的单元素向量。（在某一段时间内，如果没有用于标签组合的时间序列或日志流存在，<code>absent_over_time</code> 可以起较好的告警作用。）</li>
                  </ul>
                  <p>除 <code>sum_over_time</code>、<code>absent_over_time</code> 和 <code>rate</code> 以外，展开范围聚合支持分组。</p>
                  <p><code class="fillbox">&lt;aggr-op&gt;([parameter,] &lt;unwrapped-range&gt;) [without|by (&lt;label list&gt;)]</code></p>
                  <p>可以通过包含 <code>without</code> 或 <code>by</code> 子句，来聚合不同的标签维度。</p>
                  <p><code>without</code> 将列出的标签从结果向量中删除，保留所有其他标签为输出。<code>by</code> 作用相反，丢弃没有列在 <code>by</code> 子句里的标签，尽管它们的标签值在向量的所有元素中是相同的。</p>
                </div>
              </div>
              <!-- Unwrapped examples -->
              <div class="introduce-view__content">
                <h2 id="unwrapped-examples">展开</h2>
                <div class="introduce-view__content-label logfmt-module">
                 <pre>quantile_over_time(0.99,
  {cluster="ops-tools1",container="ingress-nginx"}
    | json
    | __error__ = ""
    | unwrap request_time [1m]) by (path)</pre>
                 <p>按路径计算 nginx-ingress 延时的 p99。</p>
                 <pre>sum by (org_id) (
  sum_over_time(
  {cluster="ops-tools1",container="loki-dev"}
      |= "metrics.go"
      | logfmt
      | unwrap bytes_processed [1m])
  )</pre>
                 <p>计算每个组织 ID 处理的字节数量。</p>
                </div>
              </div>
               <!-- Built-in aggregation operators -->
              <div class="introduce-view__content">
                <h1 class="page-header-two" id="built-in-aggregation-operators">内置聚合运算符</h1>
                <div class="introduce-view__content-label">
                  <p>LogQL 类似 PromQL，支持内置聚合运算符的子集，可用来聚合单个向量的元素，生成的新向量元素更少，但含有聚合值：</p>
                  <ul>
                    <li><code> sum</code>: 计算标签的总和</li>
                    <li><code> avg</code>: 计算标签的平均值</li>
                    <li><code> min</code>: 选择标签的最小值</li>
                    <li><code> max</code>: 选择标签的最大值</li>
                    <li><code> stddev</code>: 计算标签的总体标准偏差</li>
                    <li><code> stdvar</code>: 计算标签的总体标准方差</li>
                    <li><code> count</code>: 计算向量的元素数</li>
                    <li><code> topk</code>: 按样本值选择最大的 k 个元素</li>
                    <li><code> bottomk</code>: 按样本值选择最小的 k 个元素</li>
                  </ul>
                  <p>可以通过包含 <code>without</code> 或 <code>by</code> 子句，使用聚合运算符来聚合所有标签值，或一组不同的标签值：</p>
                  <p><code class="fillbox">&lt;aggr-op&gt;([parameter,] &lt;vector expression&gt;) [without|by (&lt;label list&gt;)]</code></p>
                  <p>在使用 <code>topk</code> 和 <code>bottomk</code> 时，<code>parameter</code> 为必须项。<code>topk</code> 与 <code>bottomk</code>不同于其他聚合器，其包含原始标签的输入样本子集会返回到结果向量之中。</p>
                  <p><code>by</code> 和 <code>without</code> 只用来对输入向量进行分组。<code>without</code> 子句将列出的标签从结果向量中删除，保留所有其他标签。<code>by</code> 子句作用相反，丢弃没有列在子句里的标签，尽管它们的标签值在向量的所有元素中是相同的。</p>
                </div>
              </div>
               <!-- Vector aggregation examples -->
              <div class="introduce-view__content">
                <h2 id="vector-aggregation-examples">向量聚合</h2>
                <div class="introduce-view__content-label">
                 <p>获取具有最高日志吞吐量的前10个应用程序：</p>
                 <p><code class="fillbox">topk(10,sum(rate({region="us-east1"}[5m])) by (name))</code></p>
                 <p>获取过去五分钟内某一作业的日志行数，按级别分组：</p>
                 <p><code class="fillbox">sum(count_over_time({job="mysql"}[5m])) by (level)</code></p>
                 <p>获取发往 <code>/home</code> 端点的、NGINX 日志的 HTTP GET 请求速率，按区域划分：</p>
                 <p><code class="fillbox">avg(rate(({job="nginx"} |= "GET" | json | path="/home")[10s])) by (region)</code></p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button :class="{'to-top-is-hover': tableHover}" @click="toTop(scrollbarWrap)" class="to-top" style="position:absolute;bottom: -10px;" v-show="showTopBtn" :title="$t('overall.backToTop')"><i class="nz-icon nz-icon-top"></i></button>
    <transition name="right-box">
      <chartRightBox v-if="rightBox.show" ref="addChartModal" :chart="chartData" :from="$CONSTANTS.fromRoute.explore" :panel-data="panelData" :show-panel="showPanel" @close="handleBox(false)" @on-create-success="createSuccess"></chartRightBox>
    </transition>
  </div>
</template>

<script>
import bus from '../../../../libs/bus'
import promqlInput from './promqlInput'
import chart from '../overview/chart'
import axios from 'axios'
import { getUUID } from '../../../common/js/common'
import chartDataFormat from '../../../chart/chartDataFormat'
import logTab from './logTab'
import promqlInputMixin from '@/components/common/mixin/promqlInput'
import chartRightBox from '@/components/common/rightBox/chart/chartRightBox'
import exploreItemMixin from '@/components/page/dashboard/explore/exploreItemMixin'
import copy from '@/components/common/copy'
import './promqlparser/wasm_exec.js'
import draggable from 'vuedraggable'

export default {
  name: 'exploreItem',
  components: {
    'promql-input': promqlInput,
    chartRightBox,
    chart,
    logTab,
    copy,
    draggable
  },
  props: {
    tabIndex: Number,
    closable: Boolean
  },
  mixins: [promqlInputMixin, exploreItemMixin],
  data () {
    return {
      chartLoading: false,
      logTabNoData: false,
      rightBox: { // 面板弹出框相关
        show: false
      },
      value: true,
      tabPosition: 'none',
      tableId: 'explore',
      searchMetrics: [
        {
          value: 'Metrics',
          label: this.$t('overall.metric'),
          icon: 'nz-icon nz-icon-Metrics'
        },
        {
          value: 'Logs',
          label: this.$t('dashboard.dashboard.chartForm.typeVal.log.label'),
          icon: 'nz-icon nz-icon-logs'
        }
      ],
      selectValue: this.$t('overall.metric'),
      selectIcon: 'nz-icon nz-icon-Metrics',
      // language: localStorage.getItem('nz-language') || 'en',
      showMetrics: true,
      promqlCount: 0,
      promqlKeys: [],
      expressions: [],
      filterTime: [
        bus.timeFormate(bus.getOffsetTimezoneData(-1)),
        bus.timeFormate(bus.getOffsetTimezoneData())
      ],

      /* 工具参数 */
      tools: {
        loading: false, // 是否显示table加载动画
        showCustomTableTitle: false, // 自定义列弹框是否显示
        customTableTitle: [] // 自定义列工具的数据
      },
      tableTitle: [],
      showIntroduce: true,
      defaultChartVisible: true,
      defaultTableVisible: true,
      chartVisible: true,
      tableVisible: true,
      pageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      storedTableData: [],
      tableMode: 'table',
      expandResults: false,
      tableData: [],
      saveDisabled: true,
      chartUnit: 2,
      historyParam: { useHistory: true, key: 'expore-history' },
      panelData: [],
      showPanel: { id: -1, name: '', type: 'explore' },
      chartData: {},
      collapseValue: ['1', '2'],
      showTab: ['1', '2'],
      logData: [],
      letter: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G',
        'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
      ],
      tableHover: false,
      showTopBtn: false, // top按钮
      scrollbarWrap: null,
      allMatrix: false, // metric是否全部为matrix类型
      rowData: [],
      metricsHistory: [],
      logsHistory: [],
      lastHistory: [],
      showChart: false,
      showTable: false
    }
  },
  async created () {
    this.init()
    this.getPanelData()
    this.resetExpression()
    // this.getExploreHistory()
    await this.loadWebAssembly()
    this.initQueryFromPath()
  },
  mounted () {
    this.scrollbarWrap = this.$refs.exploreScrollbar
    this.scrollbarWrap.addEventListener('scroll', this.onScroll)
  },
  beforeDestroy () {
    this.scrollbarWrap.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    async loadWebAssembly () {
      try {
        // eslint-disable-next-line no-undef
        const go = new Go()
        const response = await fetch('/static/wasm/promqlparser.wasm')
        const buffer = await response.arrayBuffer()
        const result = await WebAssembly.instantiate(buffer, go.importObject)
        go.run(result.instance)
        // eslint-disable-next-line no-undef
        this.parsePromQL = parsePromQL
      } catch (error) {
        console.error(error)
      }
    },
    parsePromQL () {},
    onScroll: bus.debounce(function () {
      this.showTopBtn = this.scrollbarWrap.scrollTop > 50
      this.hideQueryPrompt()
    }, 300),
    hideQueryPrompt () {
      this.expressions.forEach((item, index) => {
        this.$refs['promql-' + (index)][0]?.hideQueryPromptShow()
      })
    },
    toTop (wrap) {
      let currentTop = wrap.scrollTop
      const interval = currentTop / 10
      const intervalFunc = setInterval(function () { // 花200ms分10次回到顶部，模拟动画效果
        if (currentTop === 0) {
          clearInterval(intervalFunc)
        } else {
          currentTop = (currentTop - interval) < interval * 0.5 ? 0 : currentTop - interval
          wrap.scrollTop = currentTop
        }
      }, 20)
    },
    jumpClick (id) {
      const dom = document.getElementsByClassName('nz-explore-' + this.tabIndex)[0]
      dom.querySelector(id).scrollIntoView(true)
    },
    setTimePickerRange () {
      this.$nextTick(() => {
        if (!this.timePickerLocked || !this.timePickerRange.nowTimeType) {
          return
        }
        const nowTimeType = this.nowTimeType = this.timePickerRange.nowTimeType
        this.filterTime = this.timePickerRange.time
        this.$refs.pickTime && this.$refs.pickTime.$refs.timePicker.setTimeRange(this.nowTimeType, this.filterTime)
        this.setSearchTime('filterTime')
      })
    },
    selectMetricsLogs (val, icon, label) {
      if (val) {
        this.selectIcon = icon
        this.selectValue = val
      } else {
        label = 'Metrics'
      }
      this.changeType(label)
    },
    changeType (value) {
      this.showMetrics = value === 'Metrics'
      this.showIntroduce = true
      this.lastHistory = []
      // this.getExploreHistory()
      this.resetExpression()
    },
    split () {
      this.$emit('split', this.tabIndex)
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
    },
    filterShowData (source, pageObj) {
      if (source) return source.slice((pageObj.pageNo - 1) * pageObj.pageSize, pageObj.pageNo * pageObj.pageSize)
    },
    chartUnitChange (unit) {
      this.chartUnit = unit
      this.$nextTick(() => {
        this.getExpression()
      })
    },
    exportLog ({ limit, descending }) {
      const params = {
        logql: this.expressions,
        start: this.momentStrToTimestamp(this.filterTime[0]),
        end: this.momentStrToTimestamp(this.filterTime[1]),
        direction: descending ? 'backward' : 'forward',
        limit
      }
      axios.get('/logs/loki/export', { responseType: 'blob', params: params }).then(res => {
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, 'log')
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = 'log'
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    queryLogChart () {
      this.$refs.logDetail.$refs.logChart.startLoading()
      const requestArr = []
      const start = this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[0]))
      const end = this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1]))
      // 当不是 指标查询表达式时，除直接查询 用户输入表达式外，另查询 sum by (level) (count_over_time($_expression[$_step]))
      this.expressions.forEach((item, index) => {
        if (item != '' && this.promqlKeys[index].state) {
          const isMetric = this.validateMetric(item)
          if (!isMetric) {
            const step = bus.getStep(bus.formateTimeToTime(this.filterTime[0]), bus.formateTimeToTime(this.filterTime[1]))
            const supplementaryExpr = `sum by (level) (count_over_time(${item}[${step}]))`
            requestArr.push(this.$get('/logs/loki/api/v1/query_range?query=' + encodeURIComponent(supplementaryExpr) + '&start=' + start + '&end=' + end))
          }
        }
      })
      axios.all(requestArr).then(res => {
        res = res.filter((r, i) => r.code === 200)
        if (res.length > 0) {
          let series = []
          let legend = []
          const seriesItem = {
            type: 'line',
            name: '',
            symbol: 'emptyCircle', // 去掉点
            symbolSize: 8,
            showSymbol: false,
            smooth: 0.2, // 曲线变平滑
            data: [],
            lineStyle: {
              width: 2,
              opacity: 0.9
            },
            emphasis: {
              focus: 'none'
            },
            blur: {
              lineStyle: {
                opacity: 0.3
              },
              itemStyle: {
                opacity: 1
              }
            }
          }
          function mergeAndSort (arr) {
            const mergedMap = new Map()
            // 合并数组，根据时间戳累加值
            arr.forEach(([timestamp, value]) => {
              if (mergedMap.has(timestamp)) {
                mergedMap.set(timestamp, mergedMap.get(timestamp) + Number(value))
              } else {
                mergedMap.set(timestamp, Number(value))
              }
            })
            // 将Map转换为二维数组，并根据时间戳排序
            const mergedArray = Array.from(mergedMap.entries()).sort((a, b) => a[0] - b[0])
            return mergedArray
          }
          const logData = res.map(r => r.data)
          logData.forEach((response) => {
            const data = response.result
            data.forEach((result, i) => {
              seriesItem.name = 'logs'
              const values = result.values.map((item) => {
                return [item[0] * 1000, item[1]]
              })
              seriesItem.data.push(...values)
            })
          })
          seriesItem.data = mergeAndSort(seriesItem.data)
          series = [seriesItem]
          legend = [{ name: seriesItem.name, alias: seriesItem.name, isGray: false }]
          this.$nextTick(() => {
            this.$refs.logDetail.$refs.logChart.setLegend(legend)
            this.$refs.logDetail.$refs.logChart.setLogColor(series.length)
            if (!series.length) {
              series = ''
            }
            this.$refs.logDetail.$refs.logChart.setSeries(series)
            this.$refs.logDetail.$refs.logChart.endLoading()
          })
        }
      })
    },
    queryLogData (limit) {
      this.chartLoading = true
      if (!limit) {
        limit = this.$refs.logDetail ? this.$refs.logDetail.getLimit() : 100
      }
      this.$refs.logDetail && this.$refs.logDetail.resetOperation()
      if (this.expressions.length > 0) {
        const requestArr = []
        const realArr = [] // 记录原始位置
        // 过滤掉state为0的元素
        this.expressions.forEach((item, index) => {
          if (item != '' && this.promqlKeys[index].state && item) {
            requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(item) + '&start=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[0])) + '&end=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1])) + '&limit=' + limit))
            realArr.push(index)
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
          this.saveDisabled = false
        }
        axios.all(requestArr).then(res => {
          this.chartLoading = false
          const errorRowIndex = []
          res.forEach((r, i) => {
            if (r.code !== 200) {
              errorRowIndex.push(i)
              this.promqlKeys[realArr[i]].isResError = true
            } else {
              this.promqlKeys[realArr[i]].isResError = false
            }
          })
          if (errorRowIndex.length > 0) {
            this.$message.error(this.$t('tip.errorInRow') + ': ' + errorRowIndex.map(e => e + 1).join(' ,'))
            res = res.filter((r, i) => errorRowIndex.indexOf(i) === -1)
          }
          this.postHistory()
          if (res.length > 0) {
            const logData = res.map(r => r.data)
            if (logData[0].result.length > 0) {
              this.logTabNoData = false
            } else {
              this.logTabNoData = true
            }
            const hasGraph = logData.some(d => d.resultType === 'matrix')
            const hasLog = logData.some(d => d.resultType === 'streamsFormat')
            const graphTabIndex = this.showTab.indexOf('1')
            if (hasGraph) {
              if (graphTabIndex === -1) {
                this.showTab.push('1')
              }
            } else {
              if (graphTabIndex > -1) {
                this.showTab.splice(graphTabIndex, 1)
              }
            }
            const logTabIndex = this.showTab.indexOf('2')
            if (hasLog) {
              if (logTabIndex === -1) {
                this.showTab.push('2')
              }
            } else {
              if (logTabIndex > -1) {
                this.showTab.splice(logTabIndex, 1)
              }
            }
            this.$nextTick(() => {
              this.logData = logData
              hasGraph && this.loadLogGraph()
            })
          } else {
            this.showIntroduce = true
          }
        }).catch(e => {
          this.chartLoading = false
          this.$message.error(this.$t('config.terminallog.statusItem.unknownError'))
        })
      }
    },
    loadLogGraph () {
      const graphData = this.logData.filter(l => l.resultType === 'matrix')
      if (graphData && graphData.length > 0) {
        this.$refs.logChart.startLoading()
        const promqlInputIndexs = []
        const queryExpression = []
        let series = []
        const legend = []
        this.expressions.forEach((item, index) => {
          if (item !== '' && this.promqlKeys[index].state) {
            promqlInputIndexs.push(index)
            queryExpression.push(item)
          }
        })
        this.logData.forEach((response, index) => {
          if (response.resultType === 'matrix') {
            const promqlIndex = promqlInputIndexs[index]
            const data = response.result
            if (!data || data.length < 1) {
              return
            }
            data.forEach((result, i) => {
              const seriesItem = {
                type: 'line',
                name: '',
                symbol: 'emptyCircle', // 去掉点
                symbolSize: 8,
                showSymbol: false,
                smooth: 0.2, // 曲线变平滑
                data: [],
                lineStyle: {
                  width: 2,
                  opacity: 0.9
                },
                emphasis: {
                  focus: 'none'
                },
                blur: {
                  lineStyle: {
                    opacity: 0.3
                  },
                  itemStyle: {
                    opacity: 1
                  }
                }
              }
              let legendName = ''
              seriesItem.data = result.values.map((item) => {
                return [item[0] * 1000, item[1]]
              })
              if (result.metric && Object.keys(result.metric).length > 0) {
                const metric = Object.assign({}, result.metric)
                seriesItem.name += metric.__name__ ? metric.__name__ : ''
                seriesItem.name += '{'
                delete metric.__name__
                for (const key in metric) {
                  seriesItem.name += key + '=' + '"' + metric[key] + '",'
                }
                legendName = seriesItem.name.substr(0, seriesItem.name.length - 1)
                legendName += '}'
              } else {
                legendName = queryExpression[index]
              }
              seriesItem.name = legendName + '-' + index
              const tagKeysArr = Object.keys(result.metric)
              // console.log(queryExpression[index], this.expressions[index], tagKeysArr)
              const legendAlias = this.handleLegendAlias(legendName, this.promqlKeys[promqlInputIndexs[index]].legend, tagKeysArr)
              series.push(seriesItem)
              legend.push({ name: seriesItem.name, alias: legendAlias, isGray: false })
            })

            this.$refs['promql-' + promqlIndex][0].setError('')
          }
        })
        this.defaultChartVisible = true
        this.$nextTick(() => {
          this.$refs.logChart.setLegend(legend)
          this.$refs.logChart.setRandomColors(series.length)
          if (!series.length) {
            series = ''
          }
          this.$refs.logChart.setSeries(series)
          this.$refs.logChart.endLoading()
        })
      }
    },
    queryChartData () {
      this.$refs.exploreChart && this.$refs.exploreChart.startLoading()
      if (this.expressions.length > 0) {
        const requestArr = []
        const promqlInputIndexs = []
        const queryExpression = []
        // 过滤掉state为0的元素
        const step = bus.getStep(bus.formateTimeToTime(this.filterTime[0]), bus.formateTimeToTime(this.filterTime[1]))
        this.expressions.forEach((item, index) => {
          if (item != '' && this.promqlKeys[index].state && !this.promqlKeys[index].matrix && this.promqlKeys[index].queryType == 1) {
            let queryStep = step
            if (this.promqlKeys[index].step) {
              queryStep = this.promqlKeys[index].step + 's'
            }
            promqlInputIndexs.push(index)
            queryExpression.push(item)
            if (this.promqlKeys[index].queryType === 2) {
              requestArr.push(this.$get('/prom/api/v1/query_instant?query=' + encodeURIComponent(item) + '&time=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1]))))
            } else {
              this.showChart = true
              requestArr.push(this.$get('/prom/api/v1/query_range?query=' + encodeURIComponent(item) + '&start=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[0])) + '&end=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1])) + '&step=' + queryStep + '&nullType=null'))
            }
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
          this.saveDisabled = false
        }
        axios.all(requestArr).then(res => {
          let series = []
          const legend = []
          if (res.length > 0) {
            res.forEach((response, index) => {
              const promqlIndex = promqlInputIndexs[index]
              if (response.data && response.status == 'success') {
                const data = response.data.result
                if ((!data || data.length < 1) && response.message) {
                  this.$refs['promql-' + promqlIndex][0].setError(response.message)
                  return
                }
                data.forEach((result, i) => {
                  const seriesItem = {
                    type: 'line',
                    name: '',
                    symbol: 'emptyCircle', // 去掉点
                    symbolSize: 8,
                    showSymbol: false,
                    smooth: 0.2, // 曲线变平滑
                    data: [],
                    lineStyle: {
                      width: 2,
                      opacity: 0.9
                    },
                    emphasis: {
                      focus: 'none'
                    },
                    blur: {
                      lineStyle: {
                        opacity: 0.3
                      },
                      itemStyle: {
                        opacity: 1
                      }
                    }
                  }
                  let legendName = ''
                  seriesItem.data = result.values.map((item) => {
                    return [item[0] * 1000, item[1]]
                  })
                  if (result.metric && Object.keys(result.metric).length > 0) {
                    const metric = Object.assign({}, result.metric)
                    seriesItem.name += metric.__name__ ? metric.__name__ : ''
                    seriesItem.name += '{'
                    delete metric.__name__
                    for (const key in metric) {
                      seriesItem.name += key + '=' + '"' + metric[key] + '",'
                    }
                    legendName = seriesItem.name.substr(0, seriesItem.name.length - 1)
                    legendName += '}'
                  } else {
                    legendName = queryExpression[index]
                  }
                  seriesItem.name = legendName + '-' + index
                  const tagKeysArr = Object.keys(result.metric)
                  // console.log(queryExpression[index], this.expressions[index], tagKeysArr)
                  const legendAlias = this.handleLegendAlias(legendName, this.promqlKeys[promqlInputIndexs[index]].legend, tagKeysArr)
                  series.push(seriesItem)
                  legend.push({ name: seriesItem.name, alias: legendAlias, isGray: false })
                })

                this.$refs['promql-' + promqlIndex][0].setError('')
              } else {
                if (response.error) {
                  this.$refs['promql-' + promqlIndex][0].setError(response.error)
                } else if (response.msg) {
                  this.$refs['promql-' + promqlIndex][0].setError(response.msg)
                } else {
                  this.$refs['promql-' + promqlIndex][0].setError(response)
                }
              }
            })
            this.series = series
            this.$refs.exploreChart?.setLegend(legend)
            this.$refs.exploreChart?.setRandomColors(series.length)
            if (!series.length) {
              series = ''
            }
            this.$refs.exploreChart?.setSeries(series)
            this.defaultChartVisible = true
          }
          this.$refs.exploreChart && this.$refs.exploreChart.endLoading()
        })
      }
    },
    async queryTableData () {
      this.tools.loading = true
      if (this.expressions.length > 0) {
        const requestArr = []
        this.expressions.forEach((item, index) => {
          // 过滤掉state为0的元素
          if (item !== '' && this.promqlKeys[index].state && this.promqlKeys[index].queryType == 2) {
            // requestArr.push(this.$get('/prom/api/v1/query?query=' + encodeURIComponent(item)))
            this.showTable = true
            requestArr.push(this.$get('/prom/api/v1/query_instant?query=' + encodeURIComponent(item) + '&time=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1]))))
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
          this.saveDisabled = false
        }
        const res = await axios.all(requestArr)
        const tData = []
        let tLabels = []
        if (res.length > 0) {
          this.storedTableData = []
          this.rowData = []
          this.tableData = []
          this.tableTitle = []
          this.tools.customTableTitle = []

          // this.allMatrix = res.every(d => d.data.resultType === 'matrix')

          res.forEach((response, index) => {
            if (response.data && response.status === 'success') {
              // matrix类型不请求chart接口 只展示表格数据
              this.promqlKeys[index].matrix = response.data.resultType === 'matrix'
              const data = response.data.result
              if (data) {
                data.forEach((result, i) => {
                  const metrics = Object.assign({}, result.metric)
                  this.$set(metrics, 'value#' + index, chartDataFormat.getUnit(this.chartUnit || 2).compute(result.values[0][1], null, 2))
                  this.$set(metrics, 'time', bus.timeFormate(bus.computeTimezone(result.values[0][0] * 1000)))
                  for (const key in metrics) {
                    const label = {
                      label: key,
                      prop: key,
                      show: true
                    }
                    const temp = tLabels.find((item, index) => {
                      return item.prop == label.prop
                    })
                    if (!temp) {
                      tLabels.push(label)
                    }
                  }
                  result.values.forEach(item => {
                    tData.push({
                      ...metrics,
                      ['value#' + index]: chartDataFormat.getUnit(this.chartUnit || 2).compute(item[1], null, 2),
                      time: bus.timeFormate(bus.computeTimezone(result.values[0][0] * 1000))
                    })
                  })

                  // 处理row模式数据
                  const rowData = this.handlerRowData(result.metric)
                  rowData.value = metrics['value#' + index]
                  // matrix 类型数据
                  rowData.valueList = result.values.map((item, index) => {
                    const obj = {}
                    obj.value = chartDataFormat.getUnit(this.chartUnit || 2).compute(item[1], null, 2)
                    obj.timestamp = '@' + item[0]
                    obj.time = bus.timeFormate(bus.computeTimezone(item[0] * 1000))
                    if (index) { // 与前一个数据间隔
                      obj.interval = '+' + parseInt(item[0] - result.values[index - 1][0]).toString()
                    }
                    return obj
                  })
                  this.rowData.push(rowData)
                })
              }
            }
            tLabels.sort((a, b) => {
              return a.prop.charCodeAt(0) - b.prop.charCodeAt(0)
            })
            tLabels = tLabels.filter(label => label.prop !== 'time')
            tLabels.unshift({
              label: this.$t('overall.time'),
              prop: 'time',
              show: true
            })
            const filterArr = ['alertname', 'severity_id', 'severity', 'rule_type', 'asset_id', 'endpoint_id', 'project_id', 'datacenter_id', 'module_id', 'nz_agent_id', 'parent_asset_id']
            tLabels.forEach(tLabel => {
              if (filterArr.indexOf(tLabel.prop) !== -1) {
                tLabel.show = false
                tLabel.allowed = true
              }
            })
          })
          if (tData.length > 0) {
            this.storedTableData = Object.assign([], tData)
            this.pageObj.total = this.storedTableData.length
            this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
            this.tableTitle = Object.assign([], tLabels)
            this.tools.customTableTitle = Object.assign([], tLabels)
            this.defaultTableVisible = true
          } else {
            // this.defaultTableVisible = false;
            this.pageObj.total = 0
            this.pageObj.pageNo = 1
          }
        }
        this.tools.loading = false
      }
    },
    handleLegendAlias (legend, aliasExpression, params) { // 处理别名
      const self = this
      const myParams = JSON.parse(JSON.stringify(params))
      myParams.$labels = JSON.parse(JSON.stringify(params))
      myParams.$value = myParams.value
      // if (this.from !== 'meta2dTooltip') {
      //   aliasExpression = this.globalVariablesReplace(aliasExpression)
      // }
      if (/\{\{.+\}\}/.test(aliasExpression)) {
        const labelValue = aliasExpression.replace(/(\{\{.+?\}\})/g, function (i) {
          const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
          if (!legend) {
            return label
          }
          let value = null
          if (params && self.$lodash.get(myParams, label)) {
            value = self.$lodash.get(myParams, label)
          }
          if (label) {
            const reg = new RegExp(label + '=".+?"', 'g')
            if (reg.test(legend)) {
              const ans = legend.match(reg)
              let find = ''
              ans.forEach(item => {
                const index = legend.indexOf(item)
                if (legend[index - 1] !== '_') {
                  find = item
                }
              })
              value = find.substr(find.indexOf('"') + 1, find.lastIndexOf('"') - find.indexOf('"') - 1)
            }
          }
          return value || ''
        })
        return labelValue
      } else {
        if (!aliasExpression) {
          return legend
          // let result =legend.substr(legend.indexOf('"') + 1,legend.lastIndexOf('"') - legend.indexOf('"') - 1);
          // return result
        }
        return aliasExpression
      }
    },
    handlerRowData (data) {
      const metric = this.$lodash.cloneDeep(data)
      const metricName = metric.__name__ || ''
      let temp = metricName
      const labelColor = '#588874'// #66d9ef
      const valueColor = '#A21615'// #74e680
      let colorTemp = `<span>${metricName}</span>`
      delete metric.__name__
      temp += '{'
      colorTemp += '<span>{</span>'
      let expandTemp = colorTemp
      const keys = Object.keys(metric)
      for (const index in keys) {
        const key = keys[index]
        temp += key + '="' + metric[key] + '",'
        colorTemp += `<span style="color: ${labelColor}">${key}</span>=<span style="color: ${valueColor}">"${metric[key]}"</span>`
        expandTemp += `<span style="display:block;text-indent:1em"><span style="color: ${labelColor}">${key}</span>=<span style="color: ${valueColor}">"${metric[key]}"</span>`
        if (index < keys.length - 1) {
          colorTemp += ','
          expandTemp += ','
        }
        expandTemp += '</span>'
      }
      if (temp.endsWith(',')) {
        temp = temp.substr(0, temp.length - 1)
      }
      temp += '}'
      colorTemp += '<span>}</span>'
      expandTemp += '<span>}</span>'
      const rowData = { element: temp, colorElement: colorTemp, expandElement: expandTemp }
      return rowData
    },
    async getExpression () {
      if (this.$refs.pickTime) {
        const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
        this.nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
        this.setSearchTime('filterTime')
      }
      if (this.expressions && this.expressions.length >= 1) {
        let error = false
        // 对 promql 格式校验及format
        if (this.showMetrics) {
          this.expressions.forEach((item, index) => {
            if (item != '' && this.promqlKeys[index].state) {
              const res = this.parsePromQL(item)
              if (res.status === 'error') {
                error = true
                this.$refs['promql-' + index][0].setError(res.message)
              } else {
                this.$set(this.expressions, index, res.result)
                this.$refs['promql-' + index][0].prettyCode()
                this.$refs['promql-' + index][0].setError('')
              }
            }
          })
        }
        if (error) { return }
        if (this.showMetrics) {
          this.$refs.exploreChart && this.$refs.exploreChart.startLoading()
          this.showChart = false
          this.showTable = false
          await this.queryTableData()
          this.queryChartData()
          this.storeHistory()
          this.postHistory()
        } else {
          const promiseArr = []
          this.expressions.forEach((item, index) => {
            if (item != '' && this.promqlKeys[index].state && item) {
              promiseArr.push(this.$get('logs/loki/api/v1/format_query', { query: item }))
            } else {
              promiseArr.push('')
            }
          })
          Promise.all(promiseArr).then(res => {
            console.log(res)
          })
          this.queryLogData()
          this.queryLogChart()
        }
      }
      this.updatePath()
    },
    initQueryFromPath () {
      const param = this.$route.query[this.position]
      if (param) {
        const data = JSON.parse(param)
        // 根据地址栏参数设置时间
        const nowTimeType = data.nowTimeType
        this.filterTime = data.searchTime
        if (nowTimeType && nowTimeType.type) {
          this.setSearchTime('filterTime')
        }
        if (nowTimeType) {
          nowTimeType.start_time = this.filterTime[0]
          nowTimeType.end_time = this.filterTime[1]
          this.$refs.pickTime.$refs.timePicker.setCustomTime(nowTimeType)
        }
        // 设置单位
        this.chartUnit = data.unit || 2
        this.$refs.pickTime.unit = this.chartUnit
        this.$refs.pickTime.$refs.chartUnit.unit = this.chartUnit
        // 设置selectValue
        const find = this.searchMetrics.find(item => item.value == data.type)
        this.selectMetricsLogs(find.label, find.icon, find.value)
        // 设置表达式
        this.promqlCount = data.queries.length
        data.queries.forEach((item, index) => {
          this.$set(this.expressions, index, item.expr)
          this.promqlKeys[index] = {
            ...item,
            id: getUUID(),
            state: item.state
          }
        })
        this.init()
        setTimeout(() => {
          this.getExpression()
        }, 200)
      }
    },
    updatePath () {
      const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
      const queries = this.expressions.map((item, index) => {
        return {
          expr: item,
          state: this.promqlKeys[index].state,
          oldName: this.promqlKeys[index].oldName,
          legend: this.promqlKeys[index].legend,
          step: this.promqlKeys[index].step,
          queryType: this.promqlKeys[index].queryType
        }
      })
      const q = {
        type: this.showMetrics ? 'Metrics' : 'Logs',
        unit: this.chartUnit,
        queries: queries,
        nowTimeType: nowTimeType,
        searchTime: this.filterTime
      }
      const exploreItems = this.$parent.exploreItems
      let param = JSON.parse(JSON.stringify(this.$route.query))
      delete param.t
      if (exploreItems.length === 1) { // 一列
        param = {
          left: JSON.stringify(q)
        }
      } else { // 两列
        param[this.position] = JSON.stringify(q)
      }
      this.$router.replace({ query: param })
    },
    storeHistory () {
      const expire = 24
      const historyJson = localStorage.getItem(this.historyParam.key)
      // 过滤掉state为0的元素
      const expressions = this.expressions.filter((item, index) => {
        return item && item != '' && this.promqlKeys[index].state
      })
      const username = localStorage.getItem('nz-username')
      if (historyJson && historyJson != 'undefined' && historyJson != '') {
        const historyObj = JSON.parse(historyJson)
        let history = historyObj[username]
        if (history) {
          // 过滤过期表达式
          history = history.filter(item => {
            return item.time + item.expire >= new Date().getTime()
          })
          let repeat = history.filter(item => {
            return expressions.includes(item.insertText)
          })
          const old = history.filter(item => {
            return !expressions.includes(item.insertText)
          })

          const freshExpression = expressions.filter(item => {
            const find = history.find(t => { return t.insertText == item })
            return !find
          })

          repeat = repeat.map(item => {
            item.time = new Date().getTime()
            item.num += 1
            item.documentation = this.$t('dashboard.metricPreview.historyTip', { time: item.num, hour: 24 })
            return item
          })

          const fresh = freshExpression.map(item => {
            return {
              label: item,
              insertText: item,
              documentation: this.$t('dashboard.metricPreview.historyTip', { time: 1, hour: 24 }),
              num: 1,
              time: new Date().getTime(),
              expire: expire * 60 * 60 * 1000
            }
          })

          historyObj[username] = fresh.concat(repeat).concat(old)
        } else {
          const history = expressions.map(item => {
            return {
              label: item,
              insertText: item,
              documentation: this.$t('dashboard.metricPreview.historyTip', { time: 1, hour: 24 }),
              num: 1,
              time: new Date().getTime(),
              expire: expire * 60 * 60 * 1000
            }
          })
          historyObj[username] = history
        }
        localStorage.setItem(this.historyParam.key, JSON.stringify(historyObj))
      } else {
        const history = expressions.map(item => {
          return {
            label: item,
            insertText: item,
            documentation: this.$t('dashboard.metricPreview.historyTip', { time: 1, hour: 24 }),
            num: 1,
            time: new Date().getTime(),
            expire: expire * 60 * 60 * 1000
          }
        })
        if (history && history.length > 0) {
          const stored = {}
          stored[username] = history
          localStorage.setItem(this.historyParam.key, JSON.stringify(stored))
        }
      }
    },
    // 禁用启用表达式
    enableExpression (index) {
      this.promqlKeys[index].state = this.promqlKeys[index].state ? 0 : 1
      const temp = this.expressions.some((item, index) => {
        return item != '' && this.promqlKeys[index].state
      })
      if (!temp) {
        this.showIntroduce = true
      }
      this.updatePath()
    },
    resetExpression () {
      this.expressions = ['']
      this.promqlKeys = []
      this.promqlCount = 1
      this.init()
    },
    changeChartVisible () {
      this.chartVisible = !this.chartVisible
    },
    changeTableVisible () {
      this.tableVisible = !this.tableVisible
    },
    handleBox (show) {
      this.rightBox.show = show
    },
    postHistory () {
      // expressions
      let postArr = []
      const queryKey = this.showMetrics ? 'explore-metric' : 'explore-log'
      const arr = this.promqlKeys.map((item, index) => {
        item.queryValue = this.expressions[index]
        return item
      })
      this.lastHistory.forEach((item) => {
        const findItem = arr.find(history => history.id == item.id)
        if (findItem && findItem.queryValue !== item.value && !findItem.isError && !findItem.isResError) {
          postArr.push({
            queryKey,
            queryValue: findItem.queryValue
          })
        }
      })
      arr.forEach(item => {
        const findItem = this.lastHistory.find(history => history.id == item.id)
        if (!findItem && !item.isResError) {
          postArr.push({
            queryKey,
            queryValue: item.queryValue
          })
        }
      })
      postArr = postArr.filter(item => item.queryValue)
      this.$post('/sys/user/queryHistory', postArr).then(res => {
        this.lastHistory = this.$lodash.cloneDeep(postArr)
      })
    },
    saveChart () {
      const chart = {
        id: '',
        name: '',
        panelName: '',
        type: 'line',
        span: 6,
        datasource: 'metrics',
        height: 2,
        unit: 2,
        param: {
          stack: 0,
          nullType: 'null',
          legend: {
            placement: 'bottom',
            values: [],
            show: true
          },
          enable: {
            legend: true,
            valueMapping: false,
            thresholds: false,
            visibility: false,
            rightYAxis: false,
            tooltip: true
          },
          thresholdShow: true,
          thresholds: [{ color: '#31a1f7', id: '1fbdd19f' }],
          showHeader: 1,
          visibility: { varName: '', operator: 'equal', varValue: '', result: 'show' },
          rightYAxis: { elementNames: [], style: 'line', unit: 2, label: '' },
          dataLink: [],
          tooltip: { mode: 'all', sort: 'none' },
          valueMapping: [],
          link: ''
        },
        elements: [],
        panel: '',
        sync: 0,
        remark: '',
        groupId: -1
      }
      this.expressions.forEach((exp, index) => {
        chart.elements.push({
          state: this.promqlKeys[index].state,
          expression: exp,
          legend: this.promqlKeys[index].legend,
          step: this.promqlKeys[index].step,
          queryType: this.promqlKeys[index].queryType,
          type: 'expert',
          id: '',
          name: this.transformNumToLetter(index)
        })
      })
      this.chartData = chart
      this.rightBox.show = true
    },
    saveChartLogs () {
      const chart = {
        id: '',
        name: '',
        panelName: '',
        span: 6,
        height: 2,
        unit: 2,
        groupId: -1,
        updateBy: 1,
        updateAt: '2022-05-18 07:51:45',
        type: 'log',
        weight: 6,
        param: { limit: 100 },
        pid: null,
        buildIn: 0,
        seq: null,
        x: 0,
        y: 1.93,
        elements: [],
        children: null,
        chartNums: null,
        asset: null,
        varType: null,
        varId: null,
        varName: null,
        datasource: 'logs',
        enable: { thresholds: false, legend: true, valueMapping: false },
        sync: 0,
        remark: ''
      }
      this.expressions.forEach((exp, index) => {
        chart.elements.push({
          state: this.promqlKeys[index].state,
          expression: exp,
          legend: this.promqlKeys[index].legend,
          step: this.promqlKeys[index].step,
          queryType: this.promqlKeys[index].queryType,
          type: 'expert',
          id: '',
          name: this.transformNumToLetter(index)
        })
      })
      this.chartData = chart
      this.rightBox.show = true
    },
    createSuccess (panel) { // 添加chart成功
      this.$confirm(this.$t('dashboard.metric.goDashboardTip'), this.$t('tip.saveSuccess'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'success'
      }).then(() => {
        bus.$emit('menu-change', 'panel')
        this.$store.commit('panelShowPanelChange', panel)
        this.$router.push({
          path: '/dashboard',
          query: {
            t: +new Date()
          }
        })
      })
    },
    getPanelData () { // 获取panel数据
      this.$get('visual/dashboard?pageNo=1&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
        }
      })
    },
    jumpTo (data, id) {
      bus.$emit('menu-change', data)
      this.$router.push({
        path: '/' + data,
        query: {
          t: +new Date()
        }
      })
    },
    logsCollapseChange (activeNames, a, b) {
      this.$nextTick(() => {
        if (this.$refs.exploreChart) {
          this.$refs.exploreChart.resize()
        }
        if (this.$refs.logChart) {
          this.$refs.logChart.resize()
        }
        if (this.$refs.logDetail) {
          this.$refs.logDetail.myChart.resize()
        }
      })
    },
    updateCustomTableTitle (custom) {
      this.tools.customTableTitle = custom
      this.$refs.exploreTable.doLayout()
    },
    transformNumToLetter (num) { // 相当于26进制 获取idaddExpression
      const self = this
      let letter = ''
      const loopNum = parseInt(num / 26)
      if (loopNum > 0) {
        letter += this.transformNumToLetter(loopNum - 1)
      }
      letter += self.letter[num % 26]
      return letter
    },
    exportToHtml (name) {
      if (this.showIntroduce) {
        this.$message.error(this.$t('explore.queryExpression'))
        return
      }
      const params = {
        type: this.showMetrics ? 1 : 2,
        start: this.momentStrToTimestamp(this.filterTime[0]) / 1000,
        end: this.momentStrToTimestamp(this.filterTime[1]) / 1000,
        unit: this.chartUnit,
        expressions: this.expressions.map(item => encodeURIComponent(item))
      }
      if (!this.showMetrics) {
        params.limit = this.$refs.logDetail ? this.$refs.logDetail.getLimit() : 100
        params.direction = this.$refs.logDetail ? this.$refs.logDetail.getDescending() : 'backward'
      }
      this.$store.dispatch('dispatchHomeLoading', true)
      let total = 10
      let loaded = 0
      this.$get('/visual/explore/snapshot', params, {
        onDownloadProgress: function (progressEvent) {
          // 处理原生进度事件
          total = progressEvent.total
          loaded = progressEvent.loaded
        }
      }).then(res => {
        this.$store.dispatch('dispatchHomeLoading', false)
        const self = this
        let fileName = this.showMetrics ? 'Metrics explore' : 'Logs explore'
        const resFileName = ''
        if (resFileName) {
          fileName = resFileName
        }
        if (loaded < total) {
          this.$message.error(res.msg || res.error || res || this.$t('NetWork Error'))
          return
        }
        if (res.type == 'application/json') {
          const reader = new FileReader() // 创建一个FileReader实例
          reader.readAsText(res, 'utf-8') // 读取文件,结果用字符串形式表示
          reader.onload = function () { // 读取完成后,**获取reader.result**
            const { msg } = JSON.parse(reader.result)
            self.$message.error(msg) // 弹出错误提示
          }
          return
        }
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res])
          window.navigator.msSaveOrOpenBlob(blobObject, fileName + '.html')
        } else {
          const blob = new Blob([res])
          const link = document.createElement('a')
          const href = window.URL.createObjectURL(blob) // 下载链接
          link.href = href
          link.download = fileName + '.html' // 下载后文件名
          document.body.appendChild(link)
          link.click() // 点击下载
          document.body.removeChild(link) // 下载完成移除元素
          window.URL.revokeObjectURL(href) // 释放blob对象
        }
      }, () => {
        this.$message.error('123')
      })
    },
    start () {

    },
    end () {

    }
  },
  computed: {
    promqlType () {
      const type = this.showMetrics ? 'metric' : 'log'
      return type
    },
    minStep () {
      return this.nzDefaultConfig.minStep
    },
    language () {
      return this.$store.getters.getLanguage
    },
    position () {
      const exploreItems = this.$parent.exploreItems
      const tabIndex = exploreItems.indexOf(this.tabIndex)
      return tabIndex ? 'right' : 'left'
    },
    timePickerLocked () {
      return this.$store.getters.getTimePickerLocked
    },
    timePickerRange () {
      return this.$store.getters.getTimePickerRange
    }
  },
  watch: {
    promqlCount (n, o) {
      // this.expressionChange()
    },
    showMetrics (n, o) { // 更换type后，将折叠面板都置为展开状态
      if (n !== o) {
        this.collapseValue = ['1', '2']
      }
    },
    expressions: {
      immediate: true,
      handler (n, o) {
        // if (n.length == 1 && (!n[0] || n[0] == '')) {
        //   this.showIntroduce = true
        // } else if (n.length > 1) {
        //   const temp = n.find((item, index) => {
        //     return item != ''
        //   })
        //   if (!temp) {
        //     this.showIntroduce = true
        //   } else {
        //     // this.showIntroduce = false
        //   }
        // } else {
        //   // this.showIntroduce = false
        // }
        const temp = n.some((item, index) => {
          return item != '' && this.promqlKeys[index].state
        })
        if (!temp) {
          this.showIntroduce = true
          this.saveDisabled = true
        }
      }
    }
  }
}
</script>
