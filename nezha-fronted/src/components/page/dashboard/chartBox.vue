<style lang="scss" scoped>
  .el-row:last-child  {
    margin-bottom: 0;
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple {
    background: white;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }

  .common-float-left {
    float: left;
    display:inline-block;
  }

  .el-inner {
    width: 200px;
    border-top-width: 0px;
    border-left-width: 0px;
    border-right-width: 0px;
    border-bottom-width: 10px;
    border-color:red;
    /*outline: medium;*/
  }

  .element-bottom-border {
    padding-bottom: 5px;
    border-bottom: 1px solid #dfe7f2;
    margin-top: 15px;
  }
  /*metric样式--begin*/
  .element-item {

    &:first-of-type {
      padding-top: 0;
      .nz-icon-minus-position {
        padding-top: 4px;
      }
    }
    padding: 20px 0;
    width: 100%;
    border-bottom: 1px dashed $--primary-border-color;
    /deep/ .nz-icon-minus {
      padding: 0 4px;
    }
  }
  .element-item__padding.element-item {
    padding: 0;
  }
  .nz-icon-minus-position {
    padding: 24px 0 24px 0;
  }
  .right-box-form .element-item.form-row-item{
    width: calc(100% - 60px);
    padding: 10px 10px 5px 0;
  }
  .legend-title{
    width: 108px;
    margin-right: 10px;
    text-align: left;
    padding-left:10px;
    height: 32px;
    border-radius: $--primary-border-radius;
    line-height: 32px;
    background: #E7EAED;
    color: #606266;
  }
  /*metric样式--end*/
  .label-center{
    vertical-align: middle;
    line-height: 34px;
  }

  .z-top {
    /*z-index: 2900;*/
  }
  .save-chart-box{
    z-index: 2900;
  }
  .mc{
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 100;
  }
  /deep/ .el-color-picker{
    position: absolute;
  }
  .range /deep/ .el-color-picker{
   left: -17px;
  }
  .color-content{
    height: 0;
    width: 0;
    overflow: hidden;
    position: absolute;
    top: -280px;
    left: 280px;
  }
  .color-tab{
    position: absolute;
    top: -268px;
    left: 144px;
    height: 28px;
    border-radius: 5px 5px 0 0;
    width: 312px;
    border: 1px solid #EBEEF5;
    border-bottom: none;
    background-color: #FFF;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }
  .color-tab div{
    text-align: center;
    flex: 1;
    color: #909399;
    transition: all .3s cubic-bezier(.645,.045,.355,1);
    background: #E4E7ED;
    cursor: pointer;
  }
  .color-tab div:first-child{
    border-right-color: #DCDFE6;
  }
  .color-tab div:hover{
    color: #409EFF;
  }
  .color-tab .color-active{
    color: #409EFF;
    background-color: #FFF;
  }
  .color{
    position: relative;
  }
  .color-show{
    display: inline-block;
    position: relative;
    top: 1px;
  }
  .topology-box{
    width: 100%;
    height: 242px;
    border: 1px solid #E7EAED;
    border-radius: 2px;
    position: relative;
  }
  .topology-dialog{
    position: fixed !important;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    z-index: 11;
  }
  .topology-mc{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
  }
</style>
<template>
  <div v-clickoutside="{obj:editChart, func:clickOutside}" :class="boxClass" class="right-box right-box-chart">
    <transition v-if="from !== 'chartTemp'" name="right-box">
      <panel-box v-if="!showPanel.type" ref="panelBox2" :panel="panel" @reload="panelReload"></panel-box>
    </transition>

    <div class="right-box__header">
      <div class="header__title" v-if="from !== 'chartTemp'">{{editChart.id ? $t("dashboard.panel.editChartTitle") : $t("dashboard.panel.createChartTitle")}}</div>
      <div class="header__title" v-if="from === 'chartTemp'">{{editChart.id ? $t("dashboard.panel.editChartTempTitle") : $t("dashboard.panel.createChartTempTitle")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editChart, func: clickOutside}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>

    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="chartForm" :model="editChart" :rules="rules" label-position= "top" label-width="120px">
          <el-form-item :label='$t("dashboard.panel.chartForm.chartName")' prop="title">
            <el-input maxlength="64" show-word-limit size="small" v-model="editChart.name" id="chart-box-title"></el-input>
          </el-form-item>
          <el-form-item v-if="showPanel.type !== fromRoute.project && showPanel.type !== fromRoute.asset && showPanel.type !== fromRoute.endpoint && showPanel.type !== fromRoute.model && from!=='chartTemp'" :label="$t('dashboard.panel.title')" prop="panelName">
            <select-panel ref="selectPanel" :disabled="showPanel.type === 'dashboard'" :filter-panel="filterPanel" :panel-lock="true" :panelData="panelData" :placement="'bottom-start'" @selectPanel="selectPanel">
              <template v-slot:header>
                <div class="panel-select-header">
                  <el-input id="chart-box-panelname" v-model="filterPanel" :placeholder="$t('overall.search')" clearable size="small" style="width: 340px; margin-right: 5px;"></el-input>
                </div>
              </template>
              <template v-slot:trigger>
                <el-input placeholder="" readonly="readonly" size="small" v-model="panelName" :disabled="showPanel.type==='dashboard'"></el-input>
              </template>
            </select-panel>
          </el-form-item>

          <div class="form-items--half-width-group">
            <!-- type -->
            <el-form-item :label="$t('dashboard.panel.chartForm.type')" class="form-item--half-width" prop="type">
              <el-select id="chart-box-type" v-model="editChart.type" :disabled="editChart.type==='group'&&editChart.children&&editChart.children.length" placeholder="" popper-class="prevent-clickoutside" size="small" value-key="chartType" @change="chartTypeChange">
                <el-option v-for="item in chartTypeList" :key="item.id" :disabled=" item.id==='group' && editChart.isGroup" :label="item.name" :value="item.id">
                  <span class="panel-dropdown-label-txt" >{{item.name}}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <!--group-->
            <el-form-item :label="$t('dashboard.panel.chartForm.group')" class="form-item--half-width" prop="group">
              <el-select id="chart-box-group" v-model="editChart.groupId" :disabled="editChart.type==='group'" clearable placeholder="" popper-class="prevent-clickoutside" size="small" value-key="chartType">
                <el-option v-for="item in groupArr" :key="item.id" :label="item.name" :value="item.id">
                  <span class="panel-dropdown-label-txt" >{{item.name}}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </div>

          <!--   varType   -->
          <el-form-item :label="$t('dashboard.panel.chartForm.varType')" v-if="from === 'chartTemp'">
            <el-select id="chart-box-group" v-model="editChart.varType" :disabled="!!editChart.id" class="right-box__select" popper-class="right-box-select-dropdown prevent-clickoutside" clearable placeholder="" size="small" value-key="chartType">
              <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in varTypeArr">
                <span class="panel-dropdown-label-txt" >{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <!--   remark   -->
          <el-form-item :label="$t('overall.remark')">
            <el-input  maxlength="256" show-word-limit v-model="editChart.remark" :autosize="{ minRows: 1, maxRows: 6}" type="textarea"/>
          </el-form-item>

          <div class="form__sub-title">{{$t('dashboard.panel.chartForm.option')}}</div>
          <div class="form-items--half-width-group">
            <!--width-->
            <el-form-item :label="$t('dashboard.panel.chartForm.width')" class="form-item--half-width" prop="span">
              <el-select id="chart-box-span"  v-model="editChart.span" :disabled="editChart.type === 'group'" placeholder="" popper-class="chart-box-dropdown-mini prevent-clickoutside" size="small" value-key="chartSpan">
                <el-option v-for="item in spanList" :key="item" :label="'span-' + item" :value="item">
                  <span class="panel-dropdown-label-txt" > span-{{item}}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <!--height-->
            <el-form-item :label="$t('dashboard.panel.chartForm.high')" class="form-item--half-width"  prop="height">
<!--              <el-autocomplete
                id="chart-box-height"
                v-model="editChart.height"
                :disabled="editChart.type === 'group'"
                :fetch-suggestions="querySearch"
                placeholder=""
                popper-class="popper-z-index prevent-clickoutside"
                size="small"
                @select="handleSelect">
                <template slot-scope="{ item }">
                  <div class="name">{{ item }}</div>
                </template>
                <template slot="append">px</template>
              </el-autocomplete>-->

              <!-- 由px改为span -->
              <el-select id="chart-box-height"  v-model="editChart.height" :disabled="editChart.type === 'group'" placeholder="" popper-class="chart-box-dropdown-mini prevent-clickoutside" size="small" value-key="chartSpan">
                <el-option v-for="item in spanList" :key="item" :label="'span-' + item" :value="item">
                  <span class="panel-dropdown-label-txt" > span-{{item}}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <!-- unit -->
            <el-form-item v-show="editChart.type !='text' && editChart.type !=='url'&& editChart.type !=='group'&& editChart.type !=='diagram'" :label="$t('dashboard.panel.chartForm.unit')" class="form-item--half-width" prop="unit">
              <el-cascader id="chart-box-unit" v-model="editChart.unit" :options="unitOptions" :props="{ expandTrigger: 'hover',emitPath:false }"  :show-all-levels="false" filterable
                           placeholder=""
                           popper-class="dc-dropdown prevent-clickoutside chart-box-unit"
                           size="small"
                           style="width: 100%"
                           @change="unitSelected"
              >
              </el-cascader>
            </el-form-item>
            <!--Align-->
            <!--<el-form-item v-if="editChart.type ==='diagram'" :label="$t('dashboard.panel.chartForm.align')" class="form-item&#45;&#45;half-width" prop="unit">
              <el-select id="chart-box-statistics" v-model="editChart.param.align" placeholder="" popper-class="chart-box-dropdown-mini prevent-clickoutside" size="small" @change="$forceUpdate">
                <el-option v-for="item in alignList" :key="item.value" :label="item.label" :value="item.value">
                  <span class="panel-dropdown-label-txt" >{{item.label}}</span>
                </el-option>
              </el-select>
            </el-form-item>-->
            <!--lock-->
            <el-form-item v-if="editChart.type ==='diagram'" :label="$t('dashboard.panel.chartForm.lock')" class="form-item--half-width" prop="lock">
              <el-select id="chart-box-statistics" v-model="editChart.param.lock" placeholder="" popper-class="chart-box-dropdown-mini prevent-clickoutside" size="small" @change="$forceUpdate">
                <el-option v-for="item in lockList" :key="item.value" :label="item.label" :value="item.value">
                  <span class="panel-dropdown-label-txt" >{{item.label}}</span>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item v-if="isUrl" :label='$t("dashboard.panel.chartForm.url")' :rules="{ required: true,  message: $t('validate.required'), trigger: 'blur' }" prop="param.url">
              <el-input id="chart-box-url" v-model="editChart.param.url" maxlength="1024" show-word-limit size="small" type="textarea"></el-input>
            </el-form-item>

            <el-form-item  v-if="editChart.type === 'line' || editChart.type == 'bar' || editChart.type == 'stackArea' || editChart.type == 'table'" :label='"Null value"' class="form-item--half-width"  prop="nullType">
              <el-select id="chart-box-nullType" v-model="editChart.param.nullType" placeholder="" popper-class="chart-box-dropdown-small prevent-clickoutside" size="small" @change="$forceUpdate()">
                <el-option v-for="item in nullTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item v-if="editChart.type == 'singleStat' || editChart.type == 'pie'|| editChart.type=='table' || editChart.type == 'bar'" :label="$t('dashboard.panel.chartForm.statistics')" class="form-item--half-width" prop="param.statistics">
              <el-select id="chart-box-statistics" v-model="editChart.param.statistics" placeholder="" popper-class="chart-box-dropdown-mini prevent-clickoutside" size="small" @change="$forceUpdate">
                <el-option v-for="item in statisticsList" :key="item.value" :label="item.label" :value="item.value">
                  <span class="panel-dropdown-label-txt" >{{item.label}}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="form-item--half-width" v-if="editChart.type == 'logs'" :label='$t("dashboard.panel.chartForm.time")' prop="param.time">
              <el-switch id="chart-box-time"
                         v-model="editChart.param.time"
                         :active-value="true"
                         :inactive-value="false"
                         active-color="#ee9d3f"
                         size="small"></el-switch>
            </el-form-item>
            <el-form-item class="form-item--half-width" v-if="editChart.type == 'logs'" :label='$t("dashboard.panel.chartForm.descending")' prop="param.descending">
              <el-switch id="chart-box-descending"
                         v-model="editChart.param.descending"
                         :active-value="true"
                         :inactive-value="false"
                         active-color="#ee9d3f"
                         size="small"></el-switch>
            </el-form-item>
            <el-form-item class="form-item--half-width" v-if="editChart.type == 'logs'" :label='$t("dashboard.panel.chartForm.wrapLines")' prop="param.wrapLines">
              <el-switch id="chart-box-wrapLines"
                         v-model="editChart.param.wrapLines"
                         :active-value="true"
                         :inactive-value="false"
                         active-color="#ee9d3f"
                         size="small"></el-switch>
            </el-form-item>
            <el-form-item class="form-item--half-width" v-if="editChart.type == 'logs'" :label='$t("dashboard.panel.chartForm.limit")' prop="param.limit">
              <el-input id="chart-box-limit" v-model="editChart.param.limit" maxlength="1024" show-word-limit size="small"></el-input>
            </el-form-item>
          </div>

          <div v-if="editChart.type ==='diagram'" class="form__sub-title">
            <span>{{$t('dashboard.panel.chartForm.content')}}</span>
            <span style="cursor: pointer"><i class="nz-icon nz-icon-edit" @click="topologyDialogChange(true)"></i></span>
          </div>
          <!--topoData-->
          <el-form-item v-if="editChart.type ==='diagram'" >
            <div class="topology-box">
              <div class="topology-mc"></div>
              <diagram :topoData="editChart.param.topo" :fromChartBox="true" :topologyIndexF="-1"/>
            </div>
          </el-form-item>

          <el-form-item v-if="editChart.type == 'line' || editChart.type == 'bar' || editChart.type == 'stackArea'" :label='$t("dashboard.panel.chartForm.threshold")' class="form-item--half-width"  prop="param.threshold">
            <el-input id="chart-box-threshold" v-model="editChart.param.threshold" size="small" type="input"></el-input>
          </el-form-item>

          <div v-if="!isUrl&&!isAlert&& editChart.type != 'text'&& editChart.type != 'group' && editChart.type != 'diagram'" class="form__sub-title">
            <span>{{$t('alert.config.expr')}}</span>
            <span v-if="!isSingleStat" @click="addExpression">
              <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
            </span>
          </div>
          <div v-if="editChart.type == 'text'" class="form__sub-title">
            <span>{{$t('dashboard.panel.chartForm.content')}}</span>
          </div>
          <div v-if="isAlert" class="form__sub-title">{{$t('dashboard.panel.chartForm.alertParam.param')}}</div>

          <el-row class="element-item element-item__padding" v-if="isAlert">
            <alert-chart-param @on-enter-complate="getAlertParam" ref="alertParamBox"></alert-chart-param>
          </el-row>
          <div style="margin-bottom: 20px">
            <el-row :key="'ele' + index" class="element-item form-row-item" style="" v-for="index of promqlKeys.length" v-if="!isUrl &&!isAlert && editChart.type != 'text'&& editChart.type != 'group' && editChart.type != 'diagram'">
              <promql-input
                :expression-list="expressions"
                :id="promqlKeys[index-1]"
                :index="index-1"
                :type="promqlType"
                :key="promqlKeys[index-1]"
                :plugins="['metric-selector', 'metric-input', 'remove']"
                :ref="'promql-'+(index-1)"
                :showRemove="false"
                :styleType="2"
                @change="expressionChange"
                @removeExpression="removeExpression"
              ></promql-input>
              <el-row style="margin-top: 18px">
                <el-col class="legend-title">
                  {{$t('dashboard.panel.chartForm.legend')}}&nbsp;
                  <el-popover placement="top" trigger="hover" width="211">
                    <div style="word-break:keep-all;">{{$t('dashboard.panel.chartForm.legendTip')}}</div>
                    <i @mouseover="rz" class="nz-icon nz-icon-info-normal" slot="reference" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                  </el-popover>
                </el-col>
                <el-col style="width: calc(100% - 160px);">
                  <el-input maxlength="512" show-word-limit size="small" type="text" v-model="legends[index-1]" ></el-input>
                </el-col>
              </el-row>
              <div class="nz-icon-minus-position">
                <span class="nz-icon-minus-medium">
                  <i @click="removeExpression(index - 1)" class="nz-icon nz-icon-minus"></i>
                </span>
                  <span v-if="!isSingleStat" class="nz-icon-copy">
                  <i @click="copyExpression(index - 1)" class="nz-icon nz-icon-override"></i>
                </span>
              </div>
            </el-row>
          </div>
          <!--value mapping start-->
          <div v-if="editChart.type == 'singleStat'||editChart.type == 'table'" class="form__sub-title">
          <span>
            {{$t('dashboard.panel.chartForm.valMapping.name')}}
            <el-popover  placement="top" trigger="hover" width="275">
              <div style="white-space: pre-wrap;">{{$t('dashboard.panel.chartForm.valueMappingTip')}}</div>
              <i @mouseover="rz" class="nz-icon nz-icon-info-normal" slot="reference" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
            </el-popover>
          </span>
            <span  class="float-right"  @click="addMapping"><i class="nz-icon nz-icon-create-square" style="font-size: 16px; cursor: pointer;"></i></span>
          </div>
          <div v-if="editChart.type == 'singleStat'||editChart.type == 'table'" style="margin-bottom: 20px; width: 100%"></div>
          <el-form-item v-if="editChart.type == 'singleStat'||editChart.type == 'table'" :label="$t('dashboard.panel.chartForm.type')" prop="span">
            <el-radio-group id="chart-box-change-valuemapping" v-model="editChart.param.valueMapping.type" class="val-mapping-type" fill="#FA901C" size="small"  text-color="#FA901C" @change="valueMappingChange">
              <el-radio-button border class="no-fill" label="value">{{$t('dashboard.panel.chartForm.valMapping.value')}}</el-radio-button>
              <el-radio-button border class="no-fill" label="range">{{$t('dashboard.panel.chartForm.valMapping.range')}}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <template v-if="(editChart.type == 'singleStat'||editChart.type == 'table')&&editChart.param.valueMapping.type == 'value'" id="chart-box-valueMapping-type1">
            <template  v-for="(mapping, index) in editChart.param.valueMapping.mapping">
              <el-form-item :key="index" :label="$t('dashboard.panel.chartForm.valMapping.value')" class="form-item--half-width-other" prop="span" >
                <el-input v-model="mapping.value" size="small" style="display: inline-block;;" type="input"></el-input>
              </el-form-item>
              <el-form-item :key="index" :label="$t('dashboard.panel.chartForm.valMapping.text')" class="form-item--half-width-other  form-item--half-width-other-two" prop="span">
                <el-input v-model="mapping.text" size="small" style="display: inline-block;width:calc(100% - 80px);" type="input"></el-input>
                <!--颜色选择器 start-->
                <div class="color-show">
                  <nezhaColor :color-val="mapping.color" :single="false" :value-arr="[{name:'bac', value:showPicker[index].bac, key:'bac'},{name:'text', value:showPicker[index].text, key:'text'}]" @colorChange="(val,key)=>{colorChange(mapping,key,val)}"/>
                </div>
                <!--颜色选择器 end-->
                <span  class="nz-icon-minus-medium" style="margin-left: 7px;padding: 6px" @click="delMapping(index)"><i class="nz-icon nz-icon-minus" style="color: #EC7F66"></i></span>
              </el-form-item>
            </template>
          </template>
          <template v-if="(editChart.type == 'singleStat'||editChart.type == 'table')&&editChart.param.valueMapping.type == 'range'" id="chart-box-valueMapping-type2">
            <template v-for="(mapping, index) in editChart.param.valueMapping.mapping">
              <div :key="index" class="form-item--half-width-other" style="display: inline-block;margin-left: 15px">
                <el-form-item :label="$t('dashboard.panel.chartForm.valMapping.from')" class="one-third-form-item-left" prop="span" >
                  <el-input v-model="mapping.from" size="small" type="input"></el-input>
                </el-form-item>
                <el-form-item :label="$t('dashboard.panel.chartForm.valMapping.to')" class="one-third-form-item-right" prop="span" >
                  <el-input v-model="mapping.to" size="small" type="input"></el-input>
                </el-form-item>
              </div>
              <el-form-item :key="index" :label="$t('dashboard.panel.chartForm.valMapping.text')" class="form-item--half-width-other-two range" prop="span">
                <el-input v-model="mapping.text" size="small" style="display: inline-block;width:calc(100% - 80px);" type="input" ></el-input>
                <!--颜色选择器 start-->
                <div class="color-show">
                  <nezhaColor :color-val="mapping.color" :single="false" :value-arr="[{name:'bac',value:showPicker[index].bac,key:'bac'},{name:'text',value:showPicker[index].text,key:'text'}]" @colorChange="(val,key)=>{colorChange(mapping,key,val)}"/>
                </div>

                <!--颜色选择器 end-->
                <span class="nz-icon-minus-medium" style="margin-left: 7px;padding: 6px" @click="delMapping(index)"><i class="nz-icon nz-icon-minus"  style="color: #EC7F66"></i></span>
              </el-form-item>
            </template>
          </template>

          <!--value mapping end-->
          <template v-if="editChart.type == 'line' || editChart.type == 'bar' || editChart.type == 'stackArea'">
            <div class="form__sub-title" >
              <span>{{$t('dashboard.panel.chartForm.legendValue')}}</span>
            </div>
            <div style="display: flex; margin-bottom: 20px">
              <span style="margin-left: 15px;"></span>
              <template v-for="(item, index) in sortedOptionKeys">
                <div :key="index" style="flex: 1">
                  <span style="margin-right: 10px;color:rgb(102, 102, 102)">{{item.label}}</span>
                  <el-switch
                    :id="'chart-box-legendValue-'+item.label"
                    v-model="editChart.param.legendValue[item.key]"
                    active-color="#ee9d3f"
                    active-value="on"
                    inactive-value="off"
                  >
                  </el-switch>
                </div>
              </template>
            </div>
          </template>
          <template v-if="editChart.type=='text'&&textShow">
            <rich-text-editor ref="richTextEditor" :edit-data="editChart.param.text"></rich-text-editor>
          </template>

        </el-form>
      </div>
    </div>
    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="chart-box-esc" v-cancel="{obj:editChart,func:esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button v-if="showPanel.type && showPanel.type == 'model'" id="chart-box-Sync" v-has="'panel_chart_edit'" class="footer__btn" @click="SyncSave">
        <span>{{$t('overall.SyncSave')}}</span>
      </button>
      <button v-else-if="from!=='chartTemp'" id="chart-box-preview" class="footer__btn" @click="preview" >
        <span>{{$t('overall.preview')}}</span>
      </button>
      <button id="chart-box-save" v-has="'panel_chart_add'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="confirmAdd" >
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
    <!--preview -->
    <chart-preview :panelId="panelId" ref="chartsPreview" :fromEndpoint="fromEndpoint"></chart-preview>
    <!--topplogy-->
    <diagram :topoData="editChart.param.topo" class="topology-dialog" v-if="topologyDialog" @change="topologyDialogChange" :topologyIndexF="-2" ref="topologyDialog" :fromTopologyDialog="true"/>
  </div>
</template>

<script>
import bus from '../../../libs/bus'
import chartDataFormat from '../../charts/chartDataFormat'
import chartPreview from '../../charts/chartPreview'
import { getUUID, resetZIndex } from '../../common/js/common'
import alertChartParam from './alertChartParam'
import promqlInput from './explore/promqlInput'
import { nzNumber } from '../../common/js/validate'
import richTextEditor from '../../charts/richTextEditor'
import selectPanel from '../../common/popBox/selectPanel'
import nezhaColor from '../../common/nezhaColor'
import i18n from '../../common/i18n'
import { fromRoute } from '@/components/common/js/constants'
import diagram from '@/components/common/ChartDiagram/diagram'
import editRigthBox from '../../common/mixin/editRigthBox'
const rz = {
  methods: {
    rz (e) {
      resetZIndex(e)
    }
  }
}
export default {
  name: 'chartBox',
  props: {
    boxClass: String,
    panelData: Array,
    showPanel: Object,
    chart: Object,
    from: { type: String },
    fromEndpoint: {
      type: Boolean,
      default: false
    }
  },
  mixins: [rz, editRigthBox],
  data () {
    return {
      fromRoute,
      optionBtn: {
        save: false
      },
      editChart: {
        name: '',
        remark: ''
      },
      filterPanel: '',
      statisticsList: this.$CONSTANTS.statisticsList,
      alignList: this.$CONSTANTS.alignList,
      lockList: this.$CONSTANTS.lockList,
      promqlCount: 1,
      promqlKeys: [],
      elementIds: [],
      expressions: [],
      legends: [],
      statistics: '',
      isEdit: false,
      editInfo: {},
      isUrl: false,
      isSingleStat: false,
      isAlert: false,
      rules: {
        panelName: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        url: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        'param.threshold': [
          { validator: nzNumber, trigger: 'blur' }
        ],
        'param.statistics': [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      groupArr: [],
      chartTypeList: [
        {
          id: 'line',
          name: this.$t('dashboard.panel.chartForm.typeVal.line.label')
        },
        {
          id: 'stackArea',
          name: this.$t('dashboard.panel.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'bar',
          name: this.$t('dashboard.panel.chartForm.typeVal.bar.label')
        },
        {
          id: 'singleStat',
          name: this.$t('dashboard.panel.chartForm.typeVal.singleStat.label')
        },
        {
          id: 'pie',
          name: this.$t('dashboard.panel.chartForm.typeVal.pie.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.panel.chartForm.typeVal.table.label')
        },
        {
          id: 'alertList',
          name: this.$t('dashboard.panel.chartForm.typeVal.alertList.label')
        },
        {
          id: 'logs',
          name: this.$t('dashboard.panel.chartForm.typeVal.logs.label')
        },
        {
          id: 'text',
          name: this.$t('dashboard.panel.chartForm.typeVal.text.label')
        },
        {
          id: 'url',
          name: this.$t('dashboard.panel.chartForm.typeVal.url.label')
        },
        {
          id: 'diagram',
          name: this.$t('dashboard.panel.chartForm.typeVal.diagram.label')
        },
        {
          id: 'group',
          name: this.$t('dashboard.panel.chartForm.typeVal.group.label')
        }

      ],
      elements: [1], // 指标部分 tarNum
      elementTarget: [], // 本地保存数据
      alertParams: {},
      spanList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      nullTypeList: [{
        label: 'null',
        value: 'null'
      }, {
        label: 'zero',
        value: 'zero'
      }],
      // 是否为编辑已有信息
      iseditChart: false,
      // productId: 0,//不需要这个参数，可以删除
      isInputPanel: false,
      panelId: 0,
      panelName: '',
      selectFirstPanel: false,
      metricList: [], // metric列表
      metricCascaderList: [], // metric级联列表
      metricAllData: new Map(), // 存放所有的project-module-metric-labelValue，避免重复加载
      deleteIndex: '', // 要删除的指标模块
      subCount: 0, // subSave保存data到bus计数器
      panel: {
        id: '',
        name: ''
      },
      heightSuggestions: ['300', '400', '500', '600'],
      unitOptions: chartDataFormat.unitOptions(),
      sortedOptionKeys: [{ key: 'min', label: 'Min' }, { key: 'max', label: 'Max' }, { key: 'avg', label: 'Avg' }, { key: 'last', label: 'Last' }, { key: 'total', label: 'Total' }],
      textShow: false,
      metricOptions: [],
      showPicker: [],
      varTypeArr: [
        { name: 'Asset', id: 1 },
        { name: 'Endpoint', id: 2 }
      ],
      topologyDialog: false,
      promqlType: 'metric'
      // metricStore: []
    }
  },
  components: {
    'chart-preview': chartPreview,
    'alert-chart-param': alertChartParam,
    'promql-input': promqlInput,
    'rich-text-editor': richTextEditor,
    selectPanel,
    nezhaColor,
    diagram
  },
  mounted () {
    this.$nextTick(() => {
      this.initElements()
    })

    setTimeout(() => {
      this.textShow = true
    }, 300)
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    selectPanel (panel) {
      this.panelName = panel.name
      this.panelId = panel.id
      this.editChart.groupId = ''
      this.$get('visual/panel/chart?panelId=' + this.panelId + '&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.groupArr = []
          response.data.list.forEach((item, index) => {
            if (item.type === 'group') {
              this.groupArr.push({ id: item.id, name: item.name })
            }
          })
        }
      })
    },
    toAddPanel () {
      this.$refs.panelBox2.show(true)
      this.panel = {
        id: '',
        name: ''
      }
      this.$refs.panelBox2.setTitle(this.$t('dashboard.panel.createPanelTitle'))
    },
    panelReload (panelName) { // 刷新panel下拉框
      if (panelName) {
        this.panelName = panelName
      }
      this.$emit('reloadOnlyPanel')
    },
    deletePanel (panel) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('visual/panel?ids=' + panel.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            if (this.panelId == panel.id) {
              this.selectFirstPanel = true
              this.$emit('reload', true)
            } else {
              this.$emit('reload')
            }
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    editPanel (panel) {
      this.$refs.panelBox2.show(true)
      this.panel = Object.assign({}, panel)
      this.$refs.panelBox2.setTitle(this.$t('dashboard.panel.editPanelTitle'))
    },
    setUnit (unit) {
      this.$set(this.editChart, 'unit', Number.parseInt(unit))
    },
    expressionChange: function () {

    },
    addExpression () {
      this.expressions.push('')
      this.legends.push('')
      this.promqlKeys.push(getUUID())
      this.elementIds.push('')
      this.promqlCount++
    },
    removeExpression (index) {
      if (this.promqlCount > 1) {
        this.expressions.splice(index, 1)
        this.legends.splice(index, 1)
        this.promqlKeys.splice(index, 1)
        this.elementIds.splice(index, 1)
        this.promqlCount--
        this.$nextTick(() => {
          this.expressions.forEach((ex, index) => {
            if (ex) {
              this.$refs[`promql-${index}`][0].metricChange(ex)
            }
          })
        })
      }
    },
    copyExpression (index) {
      this.expressions.push(this.expressions[index])
      this.legends.push(this.legends[index])
      this.promqlKeys.push(getUUID())
      this.elementIds.push('')
      this.promqlCount++
      this.$nextTick(() => {
        this.expressions.forEach((ex, index) => {
          if (ex) {
            this.$refs[`promql-${index}`][0].metricChange(ex)
          }
        })
      })
    },
    save () {
      this.$refs.chartForm.validate((valid) => {
        if (valid) {
          if (this.editChart.id) { // 修改
            this.$put('visual/panel/chart', this.editChart).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else { // 新增
            this.$post('visual/panel/chart', this.editChart).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          }
        } else {
          console.error('error submit!!')
          return false
        }
      })
    },
    del () {
      this.$emit('delete-chart', this.editChart)
    },
    // ----------------------------------

    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },

    /* metric部分相关方法--begin */
    // 增加指标,tarNum
    addTarget () {
      this.elements.push(1)
    },
    // 删除指标,第一步, 新方法
    deleteTarget (index) {
      // alert('box第一步，循环所有的metric，为什么要循环？？');
      this.deleteIndex = index
      // alert('box第一步，循环所有的metric，循环前metric,循环次数='+this.$refs.chartTag.length);
      this.$refs.chartTag.forEach((item) => {
        // 子组件保存内容到bus
        item.subSave()
      })
    },
    // subSave保存成功后回调,第二步
    subOk () {
      // 每个模块均有返回,当全部模块返回完成时,将sub计数器重置
      // alert('box第二步，subCount和元素个数一样了，就从deleteIndex开始删除一个元素，this.subCount='+this.subCount);
      this.subCount += 1
      if (this.subCount === this.elements.length) {
        this.subCount = 0
        // 保存完成,进行删除操作
        // ('box第二步，deleteIndex='+this.deleteIndex+'=开始删除一个元素')
        this.elements.splice(this.deleteIndex, 1)
        this.elementTarget.splice(this.deleteIndex, 1)// 没有作用，此处是[]
        bus.chartAddInfo.metricTarget.splice(this.deleteIndex, 1)

        this.$nextTick(() => {
          this.$refs.chartTag.forEach((item, index) => {
            item.setSubdata(index) // 将数据从bus重新赋值
          })
        })
      }
    },
    // 格式化tag为字符串表达式
    /*
      tagsToString(metric,arr) {
        let str = metric;
        let sepStr = '';
        arr.forEach((item, index) => {
          if (index === 0) {
            str +="{"
            if(item.value.length===1){
              str +=  `${item.name}='${item.value.join('|')}'`;
              sepStr = ',';
            }else if(item.value.length>1){
              str +=  `${item.name}=~'${item.value.join('|')}'`;
              sepStr = ',';
            }
          } else {
            if(item.value.length===1){
              str += sepStr+`${item.name}='${item.value.join('|')}'`;
              sepStr = ',';
            }else if(item.value.length>1){
              str += sepStr+`${item.name}=~'${item.value.join('|')}'`;
              sepStr = ',';
            }
          }
        });
        if(str.indexOf('{')>-1){
          str +="}";
        }
        if(str.endsWith('{}')){
          str = str.substring(0,str.indexOf('{'));
        }
        return str;
      },
       */
    autocompleteExist (string) {
      let result = false
      for (let i = 0; i < this.panelData.length; i++) {
        if (this.panelData[i].name.toLowerCase() == string.toLowerCase()) {
          result = this.panelData[i].id
          break
        }
      }
      return result
    },
    // 新建图表
    addCharts (params) {
      // 先处理panel
      /* let panelPromise=new Promise(resolve => {
          if (this.panelId) {
            panelId = this.panelId;
            panel=this.panelData.find(p => p.id === this.panelId);
            resolve()
          } else if (this.showPanel && this.showPanel.type != "dashboard" && this.showPanel.type != 'explore'&& this.showPanel.type != 'endpointQuery') {
            panelId = this.panelData[0].id;
            panel = this.panelData[0]
            resolve()
          } else {
            panelId = this.autocompleteExist(this.editChart.panelName);
            if (!panelId) {
              this.$post('panel', {name: this.editChart.panelName}).then(response => {
                if (response.code === 200) {
                  this.$emit("reloadOnlyPanel");
                  panel = response.data.panel
                  panelId=panel.id;

                  resolve()
                } else {
                  if(response.msg){
                    this.$message.error(response.msg);
                  }else {
                    this.$message.error(response);
                  }
                }
              });
            }
          }
        }); */

      // panelPromise.then(()=>{
      if (this.panelId || this.from === 'chartTemp') {
        if (this.from === 'chartTemp') {
          this.panelId = 0
        }
        const chartParams = params || this.editChart
        chartParams.panelId = this.panelId
        if (!chartParams.groupId) {
          chartParams.groupId = 0
        }
        delete chartParams.panel
        delete chartParams.children
        if (chartParams.elements) {
          chartParams.elements.forEach(item => {
            delete item.id
          })
        }
        this.$post('visual/panel/chart', chartParams).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
            // this.$refs.chartForm.resetFields()// 清空表单
            this.$emit('on-create-success', 'create', response.data, chartParams, { id: this.panelId, name: this.panelName })
            this.esc(true)
          } else {
            if (response.msg) {
              this.$message.error(response.msg)
            } else {
              this.$message.error(response)
            }
          }
          this.prevent_opt.save = false
        })
      }
      // })
    },
    // 更新图表
    updateCharts (params) {
      let panelId = this.panelId ? this.panelId : this.chart.panelId
      if (this.from === 'chartTemp') {
        panelId = 0
      }
      const chartParams = params || this.editChart
      chartParams.panelId = panelId
      if (!chartParams.groupId) {
        chartParams.groupId = 0
      }
      delete chartParams.panel
      delete chartParams.children
      this.$put('visual/panel/chart', chartParams).then(response2 => {
        if (response2.code === 200) {
          this.esc(true)
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
          // this.$refs.chartForm.resetFields();//清空表单
          this.$emit('on-create-success', 'update', response2.data, chartParams)
        } else {
          if (response2.msg) {
            this.$message.error(response2.msg)
          } else {
            this.$message.error(response2)
          }
        }
        this.prevent_opt.save = false
      })
    },
    // 获取每个tag组件内部校验后数据,点击生成图表时触发
    getTarget (target, pointer, optType) {
      this.elementTarget.push(target)
      if (this.elementTarget.length === this.elements.length) {
        this.$refs.chartForm.validate((valid) => {
          const params = {
            // productId: this.productId,
            // panelId: this.panelId,
            name: this.editChart.name, // this.editChart
            span: this.editChart.span,
            height: this.editChart.height,
            type: this.editChart.type,
            unit: this.editChart.unit,
            param: {

            },
            sync: this.editChart.sync,
            groupId: this.editChart.groupId,
            varType: this.editChart.varType
          }
          if (this.editChart.type === 'singleStat' || this.editChart.type === 'pie' || this.editChart.type === 'bar') {
            // params.param.statistics=this.statistics;
          } else {
            delete params.param.statistics
          }
          if (this.editChart.type === 'line' || this.editChart.type === 'bar' || this.editChart.type === 'stackArea') {
            params.param.threshold = this.editChart.param.threshold
            params.param.nullType = this.editChart.param.nullType
          } else {
            delete params.param.threshold
          }
          // 生成指标数组
          const elements = []
          this.elementTarget.forEach((elem, index) => {
            if (elem.type === 'normal') {
              const metricStr = bus.tagsToString(elem.metric, elem.selectedTagList)
              elements.push({
                // id:index+1,
                // metric: elem.metric,//指标名称
                expression: metricStr, // 指标对应Label及Value组成的表达式字符串
                type: elem.type, // 指标类型
                legend: elem.legend// 配置的legend
              })
            } else if (elem.type === 'expert') {
              elements.push({
                // id:index+1,
                // metric: elem.metric,//指标名称
                expression: elem.expression, // 指标对应Label及Value组成的表达式字符串
                type: elem.type, // 指标类型
                legend: elem.legend// 配置的legend
              })
            }
          })
          params.elements = elements
          if (valid) {
            if (optType === 'preview') {
              if (this.iseditChart) {
                params.id = this.editChart.id
              }
              this.$refs.chartsPreview.show(params)
            } else {
              if (this.iseditChart) {
                params.id = this.editChart.id
                this.updateCharts(params)
              } else {
                this.addCharts(params)
              }
            }
          }
        })
      }
    },
    getAlertParam: function (param, opType) {
      this.$refs.chartForm.validate((valid) => {
        const params = {
          name: this.editChart.name, // this.editChart
          span: this.editChart.span,
          height: this.editChart.height,
          type: this.editChart.type,
          unit: this.editChart.unit,
          param: param,
          sync: this.editChart.sync,
          remark: this.editChart.remark,
          groupId: this.editChart.groupId,
          varType: this.editChart.varType
        }
        if (valid) {
          if (opType === 'preview') {
            if (this.iseditChart) {
              params.id = this.editChart.id
            }
            this.$refs.chartsPreview.show(params)
          } else {
            if (this.iseditChart) {
              params.id = this.editChart.id
              this.updateCharts(params)
            } else {
              this.addCharts(params)
            }
          }
        }
      })
    },
    SyncSave () {
      this.editChart.sync = 1
      this.confirmAdd()
    },
    confirmAdd () {
      this.$refs.chartForm.validate((valid) => {
        if (valid) {
          this.prevent_opt.save = true
          this.elementTarget = [] // 初始化清空参数
          if (this.editChart.type !== 'url' && this.editChart.type != 'text') {
            /* if(this.editChart.type == 'alertList'){
                this.$refs.alertParamBox.saveParam();
              }else{
                this.$refs.chartTag.forEach((item, index) => {//循环指标列表
                  // 触发每个tag组件内部进行校验
                  item.saveTarget(index);
                });
              } */
            if (this.editChart.type == 'alertList') {
              this.$refs.alertParamBox.saveParam()
              return
            }
            if (this.editChart.type == 'singleStat' || this.editChart.type == 'pie' || this.editChart.type == 'table' || this.editChart.type == 'bar') {
              // this.$set(this.editChart.param, "statistics", this.statistics);
            } else {
              delete this.editChart.param.statistics
            }
            if (this.expressions[0]) {
              this.editChart.elements = []
              this.expressions.forEach((expr, i) => {
                this.editChart.elements.push({ id: this.elementIds[i], expression: expr, type: 'expert', legend: this.legends[i] })
              })
            } else {
              this.editChart.elements = []
            }
            if (this.editChart.id) {
              this.updateCharts()
            } else {
              this.addCharts()
            }
          } else {
            if (this.editChart.type == 'url') {
              this.$refs.chartForm.validate((valid) => {
                const params = {
                  name: this.editChart.name, // this.editChart
                  span: this.editChart.span,
                  height: this.editChart.height,
                  type: this.editChart.type,
                  unit: this.editChart.unit,
                  param: {
                    url: this.editChart.param.url
                  },
                  sync: this.editChart.sync,
                  remark: this.editChart.remark,
                  groupId: this.editChart.groupId,
                  varType: this.editChart.varType
                }

                if (valid) {
                  params.elements = []
                  if (this.iseditChart) {
                    params.id = this.editChart.id
                    this.updateCharts(params)
                  } else {
                    this.addCharts(params)
                  }
                }
              })
            } else {
              this.$refs.chartForm.validate((valid) => {
                const text = this.$refs.richTextEditor.getContent()
                if (!text) {
                  valid = false
                }
                const params = {
                  name: this.editChart.name, // this.editChart
                  span: this.editChart.span,
                  height: this.editChart.height,
                  type: this.editChart.type,
                  param: {
                    text: text
                  },
                  sync: this.editChart.sync,
                  remark: this.editChart.remark,
                  groupId: this.editChart.groupId,
                  varType: this.editChart.varType
                }

                if (valid) {
                  params.elements = []
                  if (this.iseditChart) {
                    params.id = this.editChart.id
                    this.updateCharts(params)
                  } else {
                    this.addCharts(params)
                  }
                }
              })
            }
          }
        }
      })
    },
    // 获取metric列表
    getSuggestMetric () {
      // this.$get('/prom/api/v1/label/__name__/values').then(response => {
      this.$get('monitor/module?pageSize=-1').then(response => {
        if (response.code === 200) {
          this.metricList = response.data.list
          const cascaderMap = new Map()
          this.metricList.forEach((item, index) => {
            const projectName = item.project.name
            const moduleName = item.name
            const childOption = {
              value: moduleName,
              label: moduleName,
              children: []
            }
            if (cascaderMap.has(projectName)) {
              cascaderMap.get(projectName).push(childOption)
            } else {
              const childArr = []
              childArr.push(childOption)
              cascaderMap.set(projectName, childArr)
            }

            // 缓存全局数据
            const moduleItem = {
              name: moduleName,
              metricMap: new Map()
            }
            if (this.metricAllData.has(projectName)) {
              this.metricAllData.get(projectName).push(moduleItem)
            } else {
              const moduleList = []
              moduleList.push(moduleItem)
              this.metricAllData.set(projectName, moduleList)
            }
          })
          const metricCascaderArr = []
          cascaderMap.forEach(function (value, index) {
            const option = {
              value: index + '_par',
              label: index,
              children: value
            }
            metricCascaderArr.push(option)
          })

          this.metricCascaderList = metricCascaderArr
        } else {
          this.metricList = []
          this.metricCascaderList = []
        }
      })
    },
    // 创建打开
    createData (panelId, elementInfo, unit) {
      if (panelId == -1) {
        const p = this.panelData[0]
        this.editChart.panelName = p.name
      } else {
        this.panelId = panelId
      }
      if (elementInfo) {
        if (elementInfo.elements.length > 1) {
          this.$nextTick(() => {
            this.elements = []
            elementInfo.elements.forEach((item, index) => {
              this.elements.push(index)
            })
            const dSet = this.$refs.chartTag
            this.$nextTick(() => {
              dSet.forEach((item, index) => {
                item.setMdata(elementInfo.elements[index])
              })
            })
          })
        } else {
          this.$nextTick(() => {
            this.$refs.chartTag[0].setMdata(elementInfo.elements[0])
          })
        }
      }
      this.iseditChart = false
      this.initInfo(unit) // 初始化图表信息
      // this.editChartModal = true;//????控制弹出框显示和隐藏的，不需要了
      this.initOpen() // 获取metric, productId数据
    },
    setIsUrl () {
      this.isUrl = true
      this.isSingleStat = false
      this.isAlert = false
    },
    setIsSingleStat () {
      this.isUrl = false
      this.isSingleStat = true
      this.isAlert = false
    },
    setIsAlertList () {
      this.isAlert = true
      this.isUrl = false
      this.isSingleStat = false
    },
    setIsOtherChart () {
      this.isSingleStat = false
      this.isUrl = false
      this.isAlert = false
    },
    setIsGroup () {
      this.isSingleStat = false
      this.isUrl = false
      this.isAlert = false
    },
    // 编辑chart时使用, set_tdata
    editData (data, panelId) {
      if (!panelId) {
        this.panelId = 0
      } else {
        this.panelId = panelId
      }
      if (data.id) {
        this.iseditChart = true
      }
      this.editInfo = data
      // 图表信息获取
      this.editChart.id = data.id
      this.editChart.name = data.name
      this.editChart.span = data.span
      this.editChart.height = data.height
      this.editChart.type = data.type
      this.editChart.unit = data.unit
      this.editChart.remark = data.remark
      this.editChart.elements = data.elements
      if (this.editChart.type === 'url') {
        this.editChart.param.url = data.param.url
        this.setIsUrl()
        // this.elements = [1];
      } else if (this.editChart.type === 'table') {
        this.statisticsList = JSON.parse(JSON.stringify(this.$CONSTANTS.statisticsList))
        this.statisticsList.push({ value: 'null', label: i18n.t('dashboard.panel.chartForm.statisticsVal.null') })
      } else if (this.editChart.type === 'alertList') {
        this.editChart.param = data.param
        this.setIsAlertList()
        this.$nextTick(() => {
          this.$refs.alertParamBox.setData(data)
        })
        // this.elements=[1];
      } else if (this.editChart.type === 'singleStat') {
        this.setIsSingleStat()
      } else if (this.editChart.type === 'group') {
        this.setIsGroup()
      } else {
        if ((this.editChart.type === 'line' || this.editChart.type === 'bar' || this.editChart.type === 'stackArea' || this.editChart.type === 'singleStat') && data.param) {
          this.editChart.param.threshold = data.param.threshold
          this.editChart.param.statistics = this.statistics = data.param.statistics
          if (this.editChart.type === 'bar') {
            this.statisticsList = JSON.parse(JSON.stringify(this.$CONSTANTS.statisticsList))
            this.statisticsList.push({ value: 'null', label: i18n.t('dashboard.panel.chartForm.statisticsVal.null') })
          }
        } else {
          this.editChart.param.threshold = ''
        }
        if ((this.editChart.type === 'line' || this.editChart.type === 'bar' || this.editChart.type === 'stackArea') && data.param) {
          this.editChart.param.nullType = data.param.nullType
        }
        this.setIsOtherChart()
        // this.getSuggestMetric();//获得指标列表
        // 指标
        /* this.elements = [];
          bus.chartAddInfo.metricTarget = [];
          data.elements.forEach((item, index) => {
            this.elements.push(index);
          });
          this.$nextTick(() => {
            if(this.editChart.type==='alertList'){
              this.setIsAlertList();
              this.$nextTick(()=>{
                this.$refs.alertParamBox.setData(data);
              })
            }else{
              const cSet = this.$refs.chartTag;
              // 派发charttag数据
              cSet.forEach((item, index) => {
                item.setMdata(data.elements[index]);
              });
            }
          }); */
      }
    },

    // 初始化信息
    initInfo (unit) {
      this.editChart.name = ''
      this.editChart.type = 'line'
      this.editChart.span = 12
      this.editChart.height = 4
      this.editChart.unit = unit || 2
      this.editChart.remark = ''
      this.editChart.groupId = this.editChart.groupId || ''
      const param = {}
      param.last = 0
      param.url = ''
      param.threshold = ''
      param.valueMapping = { type: 'text', mapping: [{ value: '', text: '', color: { bac: '#fff', text: '#000' } }] }
      param.legendValue = { min: 'off', max: 'off', avg: 'off', last: 'off', total: 'off' }
      param.nullType = 'null'
      this.$set(this.editChart, 'param', param)
      this.elements = [1]
      this.elementTarget = []
      bus.chartAddInfo.metricTarget = []
      this.setIsOtherChart()
    },
    // 创建时打开,用于清空chart-tag数据
    initOpen () {
      // bus.$emit('clear_history');
      /*  项目不需要produce
        if (this.$route.params.productId) {
          this.productId = parseInt(this.$route.params.productId, 10);
        }
        */
      // this.getSuggestMetric();
    },

    /* metric部分相关方法--end */
    querySearch (queryString, cb) {
      const suggestions = this.heightSuggestions
      const results = queryString && (suggestions.includes(queryString) || suggestions.filter(this.createFilter(queryString)).length > 0) ? suggestions : []
      cb(results)
    },
    createFilter (queryString) {
      return (suggestion) => {
        return (suggestion.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    handleSelect: function (item) {
      this.editChart.height = item
    },
    unitSelected: function (value) {
      // this.editChart.unit=value[value.length-1];
    },
    chartTypeChange () {
      const chartType = this.editChart.type
      this.editChart.param.url = ''
      this.editChart.height = 4
      this.promqlType = 'metric'
      if (chartType === 'url') {
        this.setIsUrl()
        /* if(this.$refs.chartTag){
            this.$refs.chartTag.forEach((item, index) => {
              item.setNotSingleStat();
            });
          } */
      } else if (chartType === 'alertList') {
        this.setIsAlertList()
      } else if (chartType === 'singleStat' || chartType === 'pie') {
        if (chartType == 'singleStat') {
          this.setIsSingleStat()
          this.resetElements()
        }
        this.editChart.param = {
          statistics: 'last',
          valueMapping: {
            type: 'value',
            mapping: [{ text: '', value: '', color: { bac: '#fff', text: '#000' } }]
          }
        }
        this.showPicker = [{ bac: false, text: false }]
      } else if (chartType === 'group') {
        this.editChart.span = 12
        this.editChart.height = 6
        this.setIsGroup()
      } else if (chartType === 'diagram') {
        this.editChart.param = {
          lock: 0,
          align: 'center',
          topo: {}
        }
      } else {
        this.setIsOtherChart()
        if (chartType === 'bar' || chartType === 'line' || chartType === 'stackArea') {
          this.editChart.param = { nullType: 'null', threshold: '', legendValue: { min: 'off', max: 'off', avg: 'off', last: 'off', total: 'off' } }
          if (chartType === 'bar') {
            this.editChart.param = { statistics: 'last', nullType: 'null', threshold: '', legendValue: { min: 'off', max: 'off', avg: 'off', last: 'off', total: 'off' } }
            this.statisticsList = JSON.parse(JSON.stringify(this.$CONSTANTS.statisticsList))
            this.statisticsList.push({ value: 'null', label: i18n.t('dashboard.panel.chartForm.statisticsVal.null') })
          }
        } else if (chartType == 'table') {
          this.$set(this.editChart.param, 'last', 0)
          this.editChart.param = {
            statistics: 'last',
            nullType: 'null',
            valueMapping: {
              type: 'value',
              mapping: [{ text: '', value: '', color: { bac: '#fff', text: '#000' } }]
            }
          }
          this.showPicker = [{ bac: false, text: false }]
          this.statisticsList = JSON.parse(JSON.stringify(this.$CONSTANTS.statisticsList))
          this.statisticsList.push({ value: 'null', label: i18n.t('dashboard.panel.chartForm.statisticsVal.null') })
        } else if (chartType == 'logs') {
          this.promqlType = 'log'
          this.editChart.param = {
            time: true,
            descending: true,
            wrapLines: true,
            limit: 1000
          }
        }
        /* if(this.$refs.chartTag){
            this.$refs.chartTag.forEach((item, index) => {
              item.setNotSingleStat();
            });
          } */
      }
    },
    resetElements () {
      this.promqlKeys = ['']
      this.expressions = ['']
      this.legends = []
      this.elementIds = []
    },

    // preview -start
    // 预览图表
    preview () {
      // 验证图表数据是否合法？？，合法了再显示预览窗口
      this.elementTarget = [] // 初始化清空参数
      this.alertParams = {}
      if (this.editChart.type !== 'url' && this.editChart.type !== 'text') {
        if (this.editChart.type == 'alertList') {
          this.$refs.alertParamBox.saveParam('preview')
        } else {
          /* this.$refs.chartTag.forEach((item, index) => {//循环指标列表
              // 触发每个tag组件内部进行校验
              item.saveTarget(index,'preview');
            }); */
          this.$refs.chartForm.validate((valid) => {
            let params = {
              // productId: this.productId,
              // panelId: this.panelId,
              name: this.editChart.name, // this.editChart
              span: this.editChart.span,
              height: this.editChart.height,
              type: this.editChart.type,
              unit: this.editChart.unit,
              param: this.editChart.param,
              sync: this.editChart.sync,
              remark: this.editChart.remark,
              groupId: this.editChart.groupId,
              varType: this.editChart.varType
            }
            params = JSON.parse(JSON.stringify(params))
            if (this.editChart.type === 'singleStat' || this.editChart.type === 'table') {
              // params.param.statistics=this.statistics;
              params.param.valueMapping = this.editChart.param.valueMapping
            }
            if (this.editChart.type != 'singleStat' && this.editChart.type != 'pie' && this.editChart.type != 'table') {
              delete params.param.statistics
            }
            if (this.editChart.type === 'bar' && this.editChart.param.statistics && this.editChart.param.statistics !== 'null') {
              params.param.statistics = this.editChart.param.statistics
            }
            if (this.editChart.type === 'line' || this.editChart.type === 'bar' || this.editChart.type === 'stackArea' || this.editChart.type === 'table') {
              params.param.threshold = this.editChart.param.threshold
              if (this.editChart.type === 'table') {
                delete params.param.threshold
                params.param.valueMapping = this.editChart.param.valueMapping
              }
              params.param.nullType = this.editChart.param.nullType
              params.param.legendValue = this.editChart.param.legendValue
            } else {
              delete params.param.threshold
              delete params.param.nullType
            }
            // 生成指标数组
            const elements = []
            this.expressions.forEach((expr, index) => {
              elements.push({
                expression: expr,
                type: 'expert',
                legend: this.legends[index]
              })
            })
            params.elements = elements
            if (valid) {
              this.$refs.chartsPreview.show(params)
            }
          })
        }
      } else if (this.editChart.type == 'url') {
        this.$refs.chartForm.validate((valid) => {
          const params = {
            name: this.editChart.name, // this.editChart
            span: this.editChart.span,
            height: this.editChart.height,
            type: this.editChart.type,
            unit: this.editChart.unit,
            param: {
              url: this.editChart.param.url
            },
            remark: this.editChart.remark,
            groupId: this.editChart.groupId,
            varType: this.editChart.varType
          }

          if (valid) {
            if (this.iseditChart) {
              params.id = this.editChart.id
            }
            this.$refs.chartsPreview.show(params)
          }
        })
      } else {
        this.$refs.chartForm.validate((valid) => {
          const text = this.$refs.richTextEditor.getContent()
          if (!text) {
            valid = false
          }
          const params = {
            name: this.editChart.name, // this.editChart
            span: this.editChart.span,
            height: this.editChart.height,
            type: this.editChart.type,
            unit: this.editChart.unit,
            param: {
              text: text
            },
            remark: this.editChart.remark,
            groupId: this.editChart.groupId,
            varType: this.editChart.varType
          }

          if (valid) {
            if (this.iseditChart) {
              params.id = this.editChart.id
            }
            this.$refs.chartsPreview.show(params)
          }
        })
      }
    },
    // preview--end
    initElements () {
      if (!this.editChart.elements || this.editChart.elements.length == 0) {
        this.editChart.elements = [{ expression: '', legend: '', type: 'expert', id: '' }]
      }
      this.editChart.elements.forEach(element => {
        if (element && element != '') {
          this.promqlKeys.push(getUUID())
          this.expressions.push(element.expression)
          this.legends.push(element.legend)
          this.elementIds.push(element.id)
        }
      })
      this.promqlCount = this.editChart.elements.length
      this.$nextTick(() => {
        this.expressions.forEach((ex, index) => {
          if (ex) {
            // this.$refs[`promql-${index}`][0].metricChange(ex)
          }
        })
      })
    },
    valueMappingChange: function (value) {
      if (this.editChart.param.valueMapping.type == 'value') {
        this.editChart.param.valueMapping.mapping = [{ text: '', value: '', color: { bac: '#fff', text: '#000' } }]
        this.showPicker = [{ bac: false, text: false }]
      } else {
        this.editChart.param.valueMapping.mapping = [{ from: '', to: '', text: '', color: { bac: '#fff', text: '#000' } }]
        this.showPicker = [{ bac: false, text: false }]
      }
    },
    addMapping: function () {
      if (this.editChart.param.valueMapping.type == 'value') {
        this.editChart.param.valueMapping.mapping.push({ text: '', value: '', color: { bac: '#fff', text: '#000' } })
        this.showPicker.push({ bac: false, text: false })
      } else {
        this.editChart.param.valueMapping.mapping.push({ from: '', to: '', text: '', color: { bac: '#fff', text: '#000' } })
        this.showPicker.push({ bac: false, text: false })
      }
    },
    colorPickerClick (index) {
      if (this.showPicker[index].bac || this.showPicker[index].text) { // 再次点击关闭
        this.showPicker[index].bac = false
        this.showPicker[index].text = false
        return
      }
      this.showPicker[index].bac = true
      this.$refs['colorPickerBac' + index][0].showPicker = true
    },
    changeShowPicker (index, atr) {
      this.$refs['colorPickerBac' + index][0].showPicker = true
      this.showPicker[index].bac = false
      this.showPicker[index].text = false
      this.showPicker[index][atr] = true
      // atr=atr.toLowerCase().replace(/( |^)[a-z]/g,(L)=>L.toUpperCase());
    },
    colorChange (mapping, key, val) {
      mapping.color[key] = val
    },
    colorRGBtoHex (color) {
      const rgb = color.split(',')
      const r = parseInt(rgb[0].split('(')[1])
      const g = parseInt(rgb[1])
      const b = parseInt(rgb[2].split(')')[0])
      const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
      return hex
    },
    colorOut (index, e) {
      let flag = false
      e.path.forEach((item) => {
        if (item.className === 'el-color-dropdown el-color-picker__panel' || item.className === 'color-tab') {
          flag = true
        }
      })
      if (flag) {
        return
      }
      if (this.showPicker[index]) {
        this.showPicker[index].bac = false
        this.showPicker[index].text = false
      }
    },
    delMapping: function (index) {
      this.editChart.param.valueMapping.mapping.splice(index, 1)
    },
    queryMetrics () {
      this.metricOptions = []
      this.$get('prom/api/v1/label/__name__/values').then(response => {
        if (response.status == 'success') {
          const metrics = response.data.sort()
          const metricMap = new Map()
          metrics.forEach((item) => {
            let key = ''
            if (/^[a-zA-Z]+?_[a-zA-Z]*/.test(item)) {
              key = item.split('_')[0]
            } else if (/^_\w*/.test(item)) {
              key = '      '
            } else {
              key = item
            }
            if (metricMap.get(key)) {
              const values = metricMap.get(key)
              values.push({ label: item, value: item })
            } else {
              const values = [{ label: item, value: item }]
              metricMap.set(key, values)
            }
            // this.metricStore.push({label:item,value:item,insertText:item})
          })
          for (const key of metricMap.keys()) {
            const option = {
              label: key,
              value: key
            }
            if (metricMap.get(key) && metricMap.get(key).length > 1) {
              option.children = metricMap.get(key)
            }
            this.metricOptions.push(option)
          }
        }
      })
    },
    getMetricOptions () {
      return this.metricOptions
    },
    topologyDialogChange (flag, data) {
      this.topologyDialog = flag
      if (data) {
        this.editChart.param.topo = data
      }
    }
  },
  created () {
    this.getSuggestMetric()
    this.queryMetrics()
  },
  watch: {
    chart: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        if (n.id) {
          if (!n.param.state && n.param.state != Number) {
            n.param.state = '1'
          }
          if (n.param.severity && n.param.severity != Number) {
            n.param.severity = 1
          }
        }
        if ((n.param && n.param.valueMapping) && (n.type === 'singleStat' || n.type === 'table')) {
          n.param.valueMapping.mapping.forEach(item => {
            this.showPicker.push({ bac: false, text: false })
            if (!item.color) {
              item.color = { bac: '#fff', text: '#000' }
            }
          })
        }
        if (n.name) {
          this.isEdit = true
        }

        this.editChart = JSON.parse(JSON.stringify(n))
        if (this.editChart.panelId === 0 && !this.editChart.varType) {
          this.editChart.varType = 1
        }

        this.panelName = this.editChart.panelName
        this.panelId = this.editChart.panelId
        this.editChart.name = this.editChart.name || ''
        if (!n.groupId || n.groupId == -1) {
          this.editChart.groupId = ''
        }
        if (typeof (this.editChart.param) === 'string') {
          this.editChart.param = JSON.parse(this.editChart.param)
        }
        if (!n.param.nullType) {
          this.editChart.param.nullType = 'null'
        }
        if (n.type === 'url') {
          this.setIsUrl()
        } else if (n.type === 'alertList') {
          this.setIsAlertList()
        } else if (n.type === 'singleStat') {
          if (n.param && !n.param.valueMapping) {
            this.$set(this.editChart.param, 'valueMapping', { type: 'value', mapping: [{ text: '', value: '', color: { bac: '#fff', text: '#000' } }] })
            this.showPicker.push({ bac: false, text: false })
          }
          this.setIsSingleStat()
        } else if (n.type === 'table') {
          n.param.last ? this.$set(this.editChart.param, 'last', n.param.last) : this.$set(this.editChart.param, 'last', 0)
          if (n.param && !n.param.valueMapping) {
            this.$set(this.editChart.param, 'valueMapping', { type: 'value', mapping: [{ text: '', value: '', color: { bac: '#fff', text: '#000' } }] })
            this.showPicker.push({ bac: false, text: false })
          }
        } else if (n.type === 'group') {
          this.setIsGroup()
        } else {
          this.setIsOtherChart()
          n.param && !n.param.legendValue && this.$set(this.editChart.param, 'legendValue', { min: 'off', max: 'off', avg: 'off', last: 'off', total: 'off' })
        }
        if (n.type === 'logs') {
          this.promqlType = 'log'
        }
        this.$set(this.editChart, 'panelName', this.showPanel.name)
        if (this.showPanel.id || this.from === 'chartTemp') {
          this.panelId = this.showPanel.id
        }
        this.$get('visual/panel/chart?panelId=' + this.panelId + '&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.groupArr = []
            response.data.list.forEach((item, index) => {
              if (item.type === 'group') {
                this.groupArr.push({ id: item.id, name: item.name })
              }
            })
          }
        })
        if (n.id || n.name) {
          this.editData(this.editChart, this.showPanel.id)
        } else {
          this.createData(this.showPanel.id, '', n.unit)
        }
        if (this.editChart.param && !this.editChart.param.statistics) {
          this.editChart.param.statistics = 'null'
        }
      }
    }
  },
  beforeDestroy () {
    if (this.$refs.chartTag) {
      this.$refs.chartTag.forEach((item, index) => { // 循环指标列表
        item.clearSelectedTagList()
      })
    }
    this.isUrl = false
  }
}
</script>
<style>
  .popper-z-index{
    z-index: 99999999 !important;
  }
  .right-box-add-chart .el-autocomplete {
    width: 100%;
  }
  .chart-box-autocomplete {
    z-index: 3000 !important;
  }
  .val-mapping-type .no-fill span{
    background-color: unset !important;
  }
  .el-color-picker__panel{
    border-radius: 0 0 5px 5px;
  }
  .el-color-dropdown{
    z-index: 2200!important;
  }
  .chart-box-unit .el-scrollbar{
    height: 195px;
    overflow-y: auto;
  }
</style>
