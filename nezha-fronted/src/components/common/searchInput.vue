<template>
    <div class="new-search"  v-clickoutside="clickout">
        <div class="search-input-all input-position" @click="stop_click">
<!--            历史记录-->
            <div class="search-history" v-if="showHistory">
                <i class="nz-icon nz-icon-time" style="cursor: pointer" @click="look_history" id="search-view-history" :title="$t('search.recentSearch')"></i>
                <div :class="localStorage_display?'localStorage_list_box none':'localStorage_list_box'">
                    <div class="list_box_title" style="cursor: pointer">
                        <span>{{$t('search.recentSearch')}}</span>
                        <i class="nz-icon nz-icon-close" @click="localStorage_display=!localStorage_display" id="search-close-history" :title="$t('overall.close')"></i>
                    </div>
                    <div class="list_box_content" v-if="history_once.length>0">
                        <ul>
                            <li v-for="(val,ind) in history_once" @click="select_history(ind,$event)" :key="ind" :id="'search-history-pick-'+ind">
                                <span v-for="(item,key) in val" :key="key">
                                    <span class="name">{{item.name}}: </span>
                                    <span class="value" v-if="item.val">{{item.val+' '}}</span>
                                    <span class="value" v-else>{{' '}}</span>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div class="list_box_clear">
                        <span v-if="history_once.length>0" @click="clear_history" id="search-clear-history">{{other.clearReSearch}}</span>
                        <span v-else class="no_historyList">{{$t('search.noRecentSearch')}}</span>
                    </div>
                </div>
            </div>
<!--            搜索框-->
            <div class="input-center-box" id="input-center-box">
              <el-scrollbar style="height: 100%;width: 100%; overflow-y: hidden" ref="searchScrollbar">
                <ul class="sreach_fixe_left" id="search-ul">
                    <li class="selectinfo_box" v-if="select_list.length>0" v-for="(val,ind) in select_list" :key="ind" @click="update_sreach(ind,$event)">
                        <div class="select_condition">
                            {{val.name}}
                        </div>
                        <div class="select_content" v-if="typeof val.val !='undefined' && val.val != null && ind!=sreach_num">
                            <span>{{$t(val.valString ? val.valString : val.val)}}</span>
                            <i class="nz-icon nz-icon-close" style="cursor: pointer" @click="close_selcet_list(ind,$event)" :title="$t('overall.close')"></i>
                        </div>
                        <div v-else-if="!change_sreach_show && ind==sreach_num && val.id!==7 " class="select_input">
                            <input type="text" autocomplete="off" id="sreach_input" v-model="input_sreach" :readonly="val.readonly" @keydown="enter(val, $event)" @click="stop_click">
                            <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="val.type == 'select'">
                              <el-scrollbar v-if="selectInfoList[val.label].length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in selectInfoList[val.label]" :key="key" @click="tr_selectInfo(val.label,item.value,item.label,$event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.label)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in selectInfoList[val.label]" :key="key" @click="tr_selectInfo(val.label,item.value,item.label,$event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.label)}}</li>
                              </ul>
                            </div>
                            <div v-if="val.type === 'selectString'" :style="'top:' + selectDom.top +'; left:'+selectDom.left " class="select_info_list">
                              <el-scrollbar v-if="selectInfoList[val.label].length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in selectInfoList[val.label]" :key="key" @click="stringSelectInfo(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.label)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in selectInfoList[val.label]" :key="key" @click="stringSelectInfo(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.label)}}</li>
                              </ul>
                            </div>
                            <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="val.type == 'terminalStatus'">
                              <el-scrollbar v-if="selectInfoList['terminalStatus'].length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in selectInfoList['terminalStatus']" :key="key" @click="stringSelectInfo(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.label)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in selectInfoList['terminalStatus']" :key="key" @click="stringSelectInfo(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.label)}}</li>
                              </ul>
                            </div>
                            <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="val.type == 'dc'">
                              <el-scrollbar v-if="dcSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                  <li v-for="(item,key) in dcSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.name)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in dcSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.name)}}</li>
                              </ul>
                            </div>
                            <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left" v-if="val.type == 'asset'">
                              <el-scrollbar v-if="assetSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in assetSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.host)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in assetSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.host)}}</li>
                              </ul>
                            </div>
                            <div v-if="val.type === 'assetState'" :style="'top:' + selectDom.top +'; left:'+selectDom.left" class="select_info_list">
                              <el-scrollbar v-if="assetStateSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in assetStateSelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in assetStateSelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                              </ul>
                            </div>
                          <div v-if="val.type === 'assetType'" :style="'top:' + selectDom.top +'; left:'+selectDom.left" class="select_info_list">
                            <el-scrollbar v-if="assetTypeTree.length > 8" class="el-scrollbar-small" style="height: 240px;">
                              <ul>
                                <li v-for="(item,key) in assetTypeTree" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                              </ul>
                            </el-scrollbar>
                            <ul v-else>
                              <li v-for="(item,key) in assetTypeTree" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                            </ul>
                          </div>
                          <div v-if="val.type === 'issueType'" :style="'top:' + selectDom.top +'; left:'+selectDom.left" class="select_info_list">
                            <el-scrollbar v-if="issueTypeSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                              <ul>
                                <li v-for="(item,key) in issueTypeSelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                              </ul>
                            </el-scrollbar>
                            <ul v-else>
                              <li v-for="(item,key) in issueTypeSelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                            </ul>
                          </div>
                          <div v-if="val.type === 'issue'" :style="'top:' + selectDom.top +'; left:'+selectDom.left" class="select_info_list">
                            <el-scrollbar v-if="issueData.length > 8" class="el-scrollbar-small" style="height: 240px;">
                              <ul>
                                <li v-for="(item,key) in issueData" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.username)}}</li>
                              </ul>
                            </el-scrollbar>
                            <ul v-else>
                              <li v-for="(item,key) in issueData" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.username)}}</li>
                            </ul>
                          </div>
                            <div v-if="val.type === 'brand'" :style="'top:' + selectDom.top +'; left:'+selectDom.left" class="select_info_list">
                              <el-scrollbar v-if="brandSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in brandSelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in brandSelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                              </ul>
                            </div>
                            <div v-if="val.type === 'group'" :style="'top:' + selectDom.top +'; left:'+selectDom.left" class="select_info_list">
                              <el-scrollbar v-if="groupSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in groupSelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in groupSelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                              </ul>
                            </div>
                            <div v-if="val.type === 'project'" :style="'top:' + selectDom.top +'; left:'+selectDom.left " class="select_info_list">
                              <el-scrollbar v-if="projectSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in projectSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.name)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in projectSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.name)}}</li>
                              </ul>
                            </div>
                            <div v-if="val.type === 'severity'" :style="'top:' + selectDom.top +'; left:'+selectDom.left " class="select_info_list">
                              <el-scrollbar v-if="severitySelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in severitySelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in severitySelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                              </ul>
                            </div>
                            <div v-if="val.type === 'alertTypes'" :style="'top:' + selectDom.top +'; left:'+selectDom.left " class="select_info_list">
                            <el-scrollbar v-if="alertTypesSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                              <ul>
                                <li v-for="(item,key) in alertTypesSelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                              </ul>
                            </el-scrollbar>
                            <ul v-else>
                              <li v-for="(item,key) in alertTypesSelect" :key="key" :class="search_select_style_num==key?'search-style-ind':''" @click="selectObject(val, item, $event)">{{$t(item.name)}}</li>
                            </ul>
                          </div>
                            <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="val.type == 'module'">
                              <el-scrollbar v-if="moduleSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in moduleSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.name)}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in moduleSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.name)}}</li>
                              </ul>
                            </div>
                            <!-- 新增日志模块action下拉选择 -->
                            <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="val.type == 'selectAction'">
                                <ul>
                                    <li v-for="(item,key) in actionSelect" :key="key" @click="tr_selectInfo(val.label,item.id,item.value,$event)">{{$t(item.value)}}</li>
                                </ul>
                            </div>
                            <!-- 新增protocol下拉选择 -->
                             <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="val.type == 'selectType'">
                                <ul>
                                    <li v-for="(item,key) in schemaTypeSelect" :key="key" @click="tr_selectTypeInfo(item)">{{$t(item.value)}}</li>
                                </ul>
                            </div>
                            <!-- 新增protocol二层下拉 -->
                            <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="TypeSelect.length!=0&&val.type == 'selectType'&&secondShow">
                                <ul>
<!--                                    <li v-for="(item,key) in TypeSelect" :key="key" @click="tr_selectProtocolInfo(item)">{{item.name}}</li>-->
                                </ul>
                            </div>
<!--                           时间计划-->
                            <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="val.type == 'select'&&val.id==5">
                                <ul>
                                    <li v-for="(item, i) in schlist" :key="i" @click="selectSul(item.name)">{{$t(item.name)}}</li>
                                </ul>
                            </div>
                          <!--endpoint 状态-->
                          <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="val.type == 'state'&&val.id==33">
                            <ul>
                              <li v-for="(item,key) in selectInfoList['endpointState']" :key="key" @click="tr_selectInfo(val.label,item.value,item.label,$event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.label)}}</li>
                            </ul>
                          </div>
                          <!--alertMessage idc-->
                          <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="val.type == 'idc'&&val.id==27">
                            <el-scrollbar v-if="dcSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                              <ul>
                                <li v-for="(item,key) in dcSelect" :key="key" @click="tr_selectInfo(val.label,item.id,item.name,$event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.name)}}</li>
                              </ul>
                            </el-scrollbar>
                            <ul v-else>
                              <li v-for="(item,key) in dcSelect" :key="key" @click="tr_selectInfo(val.label,item.id,item.name,$event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.name)}}</li>
                            </ul>
                          </div>
                          <!--exprTemp ganem-->
                          <div class="select_info_list" :style="'top:' + selectDom.top +'; left:'+selectDom.left " v-if="val.type == 'selectTemp'&&val.id==13">
                            <el-scrollbar v-if="gnameList.length > 8" class="el-scrollbar-small" style="height: 240px;">
                              <ul>
                                <li v-for="(item,key) in gnameList" :key="key" @click="tr_selectInfo(val.label,item.id,item.name,$event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.name)}}</li>
                              </ul>
                            </el-scrollbar>
                            <ul v-else>
                              <li v-for="(item,key) in gnameList" :key="key" @click="tr_selectInfo(val.label,item.id,item.name,$event)" :class="search_select_style_num==key?'search-style-ind':''">{{$t(item.name)}}</li>
                            </ul>
                          </div>
                        </div>
                        <my-date-picker
                                v-model="timeFrame"
                                type="datetimerange"
                                range-separator="To"
                                start-placeholder="Start Time"
                                end-placeholder="End Time"
                                @change="changeDate"
                                :class="dataBackG?'':'dataBackG'"
                                v-if="ind==sreach_num&&val.id==7"
                                :value-format="timeFormatStrToDatePickFormat(timeFormatMain)"
                                :format="timeFormatStrToDatePickFormat(timeFormatMain)"
                        >
                        </my-date-picker>
                    </li>
<!-- 最开始的input框-->
                    <li class="select_input" v-if="change_sreach_show">
                        <input type="text" autocomplete="off" @click="read_input" v-model="no_condition" @keyup="enter_one" :id="'one-input' + position" @keydown="clear_search_list" :placeholder="placeholder">
                    </li>
                </ul>
              </el-scrollbar>
            </div>
            <div v-show="clearSearchShow" class="clear-search" @click="clear_input">
                <i class="nz-icon nz-icon-circle-close"></i>
            </div>
            <div :class="input_list?'input_list none':'input_list'" :style="'top:' + selectDom.top +'; left:'+selectDom.left " @click="stop_click" id="input_list" v-if="!single || (single&&searchLabelList.length==searchMsg.searchLabelList.length)">
                <ul>
                    <li v-for="(val,ind) in searchLabelList" @click="select_name(val.name,ind,val.id,val.type,val.label,val.disabled,val.readonly,$event)" :key="ind" :class="{'search-style-ind':searchStyleNum==ind,'is-disabled':val.disabled}">
                        <span>{{val.name}}</span>
                    </li>
                    <!--<li v-for="(val,ind) in searchLabelList"  v-if="val.name=='Protocol'" @click="select_type(val.name,ind,val.id,val.type,val.label,val.disabled)" :key="ind" :class="{'search-style-ind':searchStyleNum==ind,'is-disabled':val.disabled}">
                        <span>{{val.name}}</span>
                    </li>-->
                </ul>
            </div>
        </div>
        <button id="search-input-search" class="search-btn float-right" type="button" @click="select" v-if="showSearch" :title="$t('overall.search')"><i class="nz-icon nz-icon-search"></i></button>
        <!--<div class="new-search-btn" @click="select">
            <i class="nz-icon nz-icon-search"></i>
        </div>-->
    </div>
</template>

<script>
import searchSelectInfo from './searchSelectInfo' // 搜索框组件--下拉框内容
export default {
  name: 'searchInput',
  data () {
    return {
      selectDom: { top: '', left: '', tempTop: '', show: true }, // 选择弹框的位置
      clearSearchShow: false,
      select_conditionsName: '',
      selectInfoList: searchSelectInfo,
      select_title: '',
      other: '',
      localStorage_display: true,
      input_list: true,
      change_sreach_show: true,
      select_list: [], // 当前的搜索条件和值
      historyList: [],
      actionSelect: [],
      dcSelect: [], // 数据中心
      assetSelect: [], // 资产
      assetStateSelect: [],
      issueTypeSelect: [], // issue type
      issueData: [], // issue
      brandSelect: [],
      groupSelect: [],
      projectSelect: [],
      severitySelect: [],
      alertTypesSelect: searchSelectInfo.searchMetrics,
      moduleSelect: [],
      modelSelect: [],
      gnameList: [],
      schemaTypeSelect: [], // 日志检索Protocol下拉菜单
      TypeSelect: [], // Protocol二层下拉菜单
      secondShow: '', // 二层显示控制
      input_sreach: '',
      sreach_num: 0,
      searchLabelList: [ // 下拉列表里的选项
      ],
      bool: false,
      no_condition: '',
      // 历史记录列表
      history_once: [],
      name: '',
      id: '',
      schedata: {
        name: '',
        isValid: 1,
        pageSize: 30,
        pageNo: 1
      },
      schlist: [],
      timeFrame: [new Date(new Date() - 1 * 60 * 60 * 1000), new Date()],
      dataBackG: true,
      delBool: false,
      searchStyleNum: -1,
      isSearchNum: -1,
      search_select_style_num: -1,
      keyBool: false,
      delnum: 0,
      delcriteriaBool: false,
      selectInfo: false,
      disabaled: true,
      downBool: false,
      where: this.$route.path,
      assetTypeTree: []
    }
  },
  watch: {
    defaultValue: {
      immediate: true,
      handler (n) {
        if (n) {
          this.$nextTick(() => {
            if (this.defaultItem) {
              if (this.defaultItem == 'alertMessageState' && this.defaultValue) {
                this.searchLabelList.forEach((item, index) => {
                  if (item.id == 12) {
                    this.searchLabelList.splice(index, 1)
                  }
                })
                this.select_list.push({
                  name: this.$t('overall.state'),
                  type: 'select',
                  label: 'state',
                  disabled: false,
                  val: this.$t('alert.list.pending'),
                  valnum: 1
                })
                this.input_sreach = ''
                this.sreach_num = this.select_list.length
                this.change_sreach_show = false
                this.input_list = true
                this.select()
              }
            }
          })
        }
      }
    },
    inTransform: {
      immediate: true,
      handler (n) {
        const listsK = document.querySelectorAll('.input_list')
        listsK.forEach((item, index) => {
          item.style.display = 'none'
        })
        const listsV = document.querySelectorAll('.select_info_list')
        listsV.forEach((item, index) => {
          item.style.display = 'none'
        })
        /* if (n) {
                this.selectDom.tempTop = this.selectDom.top;
                this.selectDom.top = '36px';
              } else {
                this.selectDom.top = this.selectDom.tempTop;
              } */
        setTimeout(() => {
          listsK.forEach((item, index) => {
            item.style.display = ''
          })
          listsV.forEach((item, index) => {
            item.style.display = ''
          })
        }, 500)
      }
    },
    select_list: {
      // 监听下拉列表
      handler (newData, oldData) {
        this.$refs.searchScrollbar.update()
        if (newData.length == 0) {
          this.change_sreach_show = true
          this.clearSearchShow = false
        } else {
          this.clearSearchShow = true
        }
        /* if (this.$route.path.indexOf("alertList") > -1 || this.$route.path.indexOf("alertConfig") > -1) {
                // 处理alertType--asset联动问题：
                // 当已选alertType为asset时，将可选列表中的asset的disabled恢复为false；
                // 当已选alertType不为asset时，将可选列表中的asset的disabled设为true，若有已选的asset，则删除；
                let hasType = false;
                for (let i = 0; i < newData.length; i++) {
                  if (newData[i].label == "alertType" && newData[i].valnum) { //若存在alertType，判断可选列表中是否有asset，有的话disabled置为false
                    hasType = true;
                    if (newData[i].valnum == 3) {
                      for (let j = 0; j < this.searchLabelList.length; j++) {
                        if (this.searchLabelList[j].label == 'asset') {
                          this.searchLabelList[j].disabled = false;
                          break;
                        }
                      }
                      break;
                    } else {
                      for (let j = 0; j < newData.length; j++) {
                        if (newData[j].label == "asset") {
                          this.close_selcet_list(j);
                          break;
                        }
                      }
                      for (let j = 0; j < this.searchLabelList.length; j++) {
                        if (this.searchLabelList[j].label == 'asset') {
                          this.searchLabelList[j].disabled = true;
                          break;
                        }
                      }

                      break;
                    }
                  }
                }
                if (!hasType) {
                  for (let j = 0; j < this.searchLabelList.length; j++) {
                    if (this.searchLabelList[j].label == 'asset') {
                      this.searchLabelList[j].disabled = true;
                      break;
                    }
                  }
                }
              } */
      }
    },
    no_condition: {
      handler (newData, oldData) {
        if (newData != '') {
          this.input_list = true
        }
      }
    },
    searchMsg: {
      immediate: true,
      handler (n) {
        if (n) {
          n.searchLabelList.forEach(item => {
            if (item.id === 27 && item.type === 'idc' && item.label === 'idcId') {
              this.getDcData()
            }
          })
        }
      }
    }
  },
  props: {
    searchMsg: {},
    defaultItem: {},
    defaultValue: {},
    inTransform: {},
    position: {
      type: String,
      default: ''
    },
    single: {},
    showHistory: {
      type: Boolean,
      default: true
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: ''
    },
    targetTab: {}
  },
  methods: {
    // dc
    clearSearch () {
      this.select_list = []
    },
    clickout () {
      this.input_list = true
    },
    selectObject (column, selectItem, e) {
      this.stop_click(e)
      for (let i = 0; i < this.select_list.length; i++) {
        const val = this.select_list[i]
        if (val.type == 'dc' && selectItem.searchType == 'dc') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type == 'project' && selectItem.searchType == 'project') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type == 'module' && selectItem.searchType == 'module') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type == 'asset' && selectItem.searchType == 'asset') {
          val.val = selectItem.host
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type == 'assetState' && selectItem.searchType == 'assetState') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type == 'assetType' && selectItem.searchType == 'assetType') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type === 'brand' && selectItem.searchType === 'brand') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type === 'group' && selectItem.searchType === 'group') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type === 'severity' && selectItem.searchType === 'severity') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type === 'alertTypes' && selectItem.searchType === 'alertTypes') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type === 'issue' && selectItem.searchType === 'issue') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        } else if (val.type === 'issueType') {
          val.val = selectItem.name
          val.valnum = selectItem.id
          val.valString = ''
        }
      }
      // this.select_list.push({type: 'dc', val: selectItem.name, valnum: selectItem.id});
      this.input_sreach = ''
      this.sreach_num = this.select_list.length
      this.change_sreach_show = true
      this.input_list = false
      const _this = this
      setTimeout(() => {
        document.getElementById('one-input' + this.position).focus()
      }, 500)
      setTimeout(function () {
        _this.getHeight()
      })
      /* this.$nextTick(() => {
                  this.$refs.searchScrollbar.update();
                }); */
    },
    // 一层下拉点击
    tr_selectTypeInfo (val) {
      this.TypeSelect = []
      val.data.length != 0 && this.TypeSelect.push(val.data[0])
      val.data.length != 0 && (this.secondShow = true)
    },
    // 二层下拉点击
    tr_selectProtocolInfo (val) {
      this.select_list = []
      this.select_list.push({
        name: val.name,
        // id:id,
        type: val.type,
        label: val.label
        // disabled:disabled
      })
      this.change_sreach_show = false
      this.sreach_num = this.select_list.length - 1
      this.input_list = !this.input_list
      //   setTimeout("document.getElementById(\"sreach_input\").focus()", 500);
      const _this = this
      setTimeout(function () {
        _this.getHeight()
      })
    },
    Iskeywords (ind) {
      if (this.select_list[ind].id == 29) {
        this.searchLabelList.forEach(val => {
          if (val.id == 30 || val.id == 31 || val.id == 32 || val.id == 33) {
            val.disabled = false
          }
        })
      } else if (this.select_list[ind].id == 30 || this.select_list[ind].id == 31 || this.select_list[ind].id == 32 || this.select_list[ind].id == 33) {
        this.searchLabelList.forEach(val => {
          if (val.id == 29) {
            val.disabled = false
          }
        })
      }
    },
    getDcData () {
      this.$get('dc', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.dcSelect = response.data.list
          this.dcSelect.forEach((item, index) => {
            this.$set(item, 'searchType', 'dc')
          })
        }
      })
    },
    getAssetData () {
      this.$get('asset', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.assetSelect = response.data.list
          this.assetSelect.forEach((item, index) => {
            this.$set(item, 'searchType', 'asset')
          })
        }
      })
    },
    getAssetStateData () {
      this.$get('asset/stateConf', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.assetStateSelect = response.data.list
          this.assetStateSelect.forEach((item, index) => {
            this.$set(item, 'searchType', 'assetState')
          })
        }
      })
    },
    getAssetTypeData () {
      this.$get('asset/typeConf/tree').then(response => {
        if (response.code === 200) {
          this.assetTypeTree = response.data.list
          this.assetTypeTree.forEach((item, index) => {
            this.$set(item, 'searchType', 'assetType')
          })
        }
      })
    },
    getIssueTypeData () {
      this.$get('issue/type').then(response => {
        if (response.code === 200) {
          this.issueTypeSelect = response.data.map((item, index) => {
            return {
              value: item,
              name: item,
              id: index
            }
          })
        }
      })
    },
    getUserList () {
      this.$get('sys/user', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.issueData = response.data.list
          this.issueData.forEach((item, index) => {
            this.$set(item, 'searchType', 'issue')
          })
        }
      })
    },
    getBrandData () {
      this.$get('asset/brand', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.brandSelect = response.data.list
          this.brandSelect.forEach((item, index) => {
            this.$set(item, 'searchType', 'brand')
          })
        }
      })
    },
    getGroupData () {
      this.$get('asset/field/group', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.groupSelect = response.data.list
          this.groupSelect.forEach((item, index) => {
            this.$set(item, 'searchType', 'group')
          })
        }
      })
    },
    getModelData () {
      this.$get('model', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.modelSelect = response.data.list
          this.modelSelect.forEach((item, index) => {
            this.$set(item, 'searchType', 'model')
          })
        }
      })
    },
    getProjectData () {
      this.$get('monitor/project', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.projectSelect = response.data.list
          this.projectSelect.forEach((item, index) => {
            this.$set(item, 'searchType', 'project')
          })
        }
      })
    },
    getSeverityData () {
      this.$get('alert/severity', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.severitySelect = response.data.list
          this.severitySelect.forEach((item, index) => {
            this.$set(item, 'searchType', 'severity')
          })
        }
      })
    },
    getModuleData () {
      this.$get('monitor/module', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.moduleSelect = response.data.list
          this.moduleSelect.forEach((item, index) => {
            this.$set(item, 'searchType', 'module')
          })
        }
      })
    },
    getGnameList () {
      this.$get('/expression/tmpl/gname').then(res => {
        if (res.code === 200) {
          this.gnameList = res.data.list.map((item, index) => {
            return {
              value: item,
              name: item,
              id: index
            }
          })
        }
      })
    },
    // 点击确认选择下拉内容
    tr_selectInfo (selectLabel, value, label, e) {
      this.stop_click(e)
      this.select_list.forEach(val => {
        if (val.label == selectLabel) {
          val.val = label
          val.valnum = value
        }
      })
      for (let i = 0; i < this.select_list.length; i++) {
        if (this.select_list[i].label == selectLabel) {
          this.select_list.splice(i, 1, Object.assign({}, this.select_list[i], { val: label, valnum: value }))
          /* this.select_list[i].val = label;
                    this.select_list[i].valnum = value; */
        }
      }
      this.input_sreach = ''
      this.sreach_num = this.select_list.length
      this.change_sreach_show = true
      this.input_list = false
      const _this = this
      setTimeout(() => {
        document.getElementById('one-input' + this.position).focus()
      }, 500)
      setTimeout(function () {
        _this.getHeight()
      })
    },
    // 点击确认value是string类型的下拉内容, param: 字段对象，选中的选项
    stringSelectInfo (column, selectItem, e) {
      this.stop_click(e)
      this.select_list.forEach(val => {
        if (val.label === column.label) {
          val.val = selectItem.value
          val.valString = selectItem.label
        }
      })
      this.input_sreach = ''
      this.sreach_num = this.select_list.length
      this.change_sreach_show = true
      this.input_list = false
      const _this = this
      setTimeout(() => {
        document.getElementById('one-input' + this.position).focus()
      }, 500)
      setTimeout(function () {
        _this.getHeight()
      })
    },
    // 点击历史记录图标
    look_history (e) {
      this.stop_click(e)
      this.localStorage_display = !this.localStorage_display
      this.restructure_historyDate()
    },
    backtime (t) {
      const myDate = new Date(t)
      const nt = myDate.getFullYear() + '-' + (myDate.getMonth() > 8 ? '' : 0) +
                    (myDate.getMonth() + 1) + '-' + (myDate.getDate() > 9 ? '' : 0) +
                    myDate.getDate() + ' ' +
                    (myDate.getHours() > 9 ? '' : '0') + myDate.getHours() + ':' +
                    (myDate.getMinutes() > 9 ? '' : 0) + myDate.getMinutes() + ':' +
                    (myDate.getSeconds() > 9 ? '' : 0) + myDate.getSeconds()
      return nt
    },
    changeDate () {
      this.dataBackG = false
      this.change_sreach_show = true
      if (this.timeFrame != []) {
        this.select_list[this.sreach_num].val = this.backtime(this.timeFrame[0]) + ' - ' + this.backtime(this.timeFrame[1])
        this.input_sreach = ''
        this.sreach_num++
      }
    },
    // 选择时间计划
    selectSul (name) {
      this.change_sreach_show = true
      this.select_list[this.sreach_num].val = name
      this.input_sreach = ''
      this.sreach_num++
      this.getHeight()
    },
    // 点击搜索
    select () {
      const objectInfo = {}
      this.change_sreach_show = true
      this.name = ''
      this.id = ''
      if (this.select_list[this.sreach_num]) {
        this.select_list[this.sreach_num].val = this.input_sreach
        this.input_sreach = ''
        this.sreach_num = this.select_list.length
      }
      // input有值  默认添加到name中
      if (this.no_condition != '') {
        const no_condition_bool = false; let no_condition_str = ''; const route = this.$route.path
        if (this.select_list.length == 0) {
          // 日志模块新增路由判断
          if (route == '/Log_SecurityEventLogs' || route == '/Log_ProxyEventLogs' || route == '/Log_SesssionRecords' || route == '/Log_RadiusLogs') {
            no_condition_str = 'logId'
          } else if (route == '/Device_DeviceList') {
            no_condition_str = 'sn'
          } else if (route == '/system_PolicyConfigurationLog' || route == '/system_LoginLog') {
            no_condition_str = 'modifyBy'
          } else {
            no_condition_str = 'name'
          }
          if (no_condition_str == 'name') {
            // 处理空白输入时不可作为搜索条件
            // this.select_list.push({name: this.select_title.name, id:2, type:'input',val:this.no_condition,label:'name'});
            // this.searchLabelList.forEach((val,ind)=>{
            //   if(val.id == 2){
            //     this.searchLabelList.splice(ind,1);
            //   }
            // })
          } else if (no_condition_str == 'modifyBy') {
            this.select_list.push({ name: this.select_title.Operator, id: 6, type: 'input', val: this.no_condition, label: 'modifyBy' })
            this.searchLabelList.forEach((val, ind) => {
              if (val.id == 6) {
                this.searchLabelList.splice(ind, 1)
              }
            })
          } else if (no_condition_str == 'sn') {
            this.select_list.push({ name: this.select_title.SN, id: 8, type: 'input', val: this.no_condition, label: 'sn' })
            this.searchLabelList.forEach((val, ind) => {
              if (val.id == 8) {
                this.searchLabelList.splice(ind, 1)
              }
            })
          } else if (no_condition_str == 'id') {
            this.select_list.push({ name: this.select_title.Policy_ID, id: 1, type: 'input', val: this.no_condition, label: 'id' })
            this.searchLabelList.forEach((val, ind) => {
              if (val.id == 1) {
                this.searchLabelList.splice(ind, 1)
              }
            })
          } else if (no_condition_str == 'logId') { // 日志模块新增判断
            this.select_list.push({ name: 'Log ID', type: 'input', label: 'Log Id', val: this.no_condition })
            this.searchLabelList.forEach((val, ind) => {
              if (val.id == 1) {
                this.searchLabelList.splice(ind, 1)
              }
            })
          }
          this.sreach_num++
        } else {
          const no_condition_bool = false; let no_condition_str = ''; const route = this.$route.path; const bool = true
          if (route == '/Log_SesssionRecords' || route == '/Log_EventLogs') {
            no_condition_str = 'id'
          } else if (route == '/Device_DeviceList') {
            no_condition_str = 'sn'
          } else if (route == '/system_PolicyConfigurationLog' || route == '/system_UserManagement' || route == '/system_LoginLog') {
            no_condition_str = 'modifyBy'
          } else {
            no_condition_str = 'name'
          }
          // this.select_list.forEach(val => {
          //   if (val.label == no_condition_str) {
          //     bool = false
          //     val.val += ',' + this.no_condition
          //   }
          // })
          if (bool) {
            this.searchLabelList.forEach((val, ind) => {
              if (val.label == no_condition_str) {
                val.val = this.no_condition
                this.select_list.push(val)
                this.searchLabelList.splice(ind, 1)
              }
            })
            this.sreach_num++
          }
        }
        this.no_condition = ''
      }
      let labelBool = true
      this.select_list.forEach(val => {
        if (typeof (val.val) !== 'undefined' && val.val != null) {
          if (val.type === 'select') {
            if (val.label === 'alertType' || val.label === 'promType' || val.label === 'ipamType') {
              objectInfo.type = val.valnum
            } else if (val.label === 'assetState') {
              objectInfo.stateIds = val.valnum
            } else if (val.label === 'assetType') {
              objectInfo.typeIds = val.valnum
            } else if (val.label === 'credentialType') {
              objectInfo.types = val.valnum
            } else if (val.label === 'promState') {
              objectInfo.statuses = val.valnum
            } else if (val.label === 'ipamState') {
              objectInfo.state = val.valnum
            } else if (val.label === 'recordState') {
              objectInfo.state = val.valnum
            } else if (val.label === 'starrd') {
              objectInfo.starrd = val.valnum
            } else if (val.label === 'recordType') {
              objectInfo.type = val.valnum
            } else if (val.label === 'buildIn') {
              objectInfo.buildIn = val.valnum
            } else if (val.label === 'issueState') {
              objectInfo.state = val.valnum
            } else if (val.label === 'priority') {
              objectInfo.priority = val.valnum
            } else if (typeof (val.valnum) === 'undefined' || val.valnum == '') {
              this.selectInfoList[val.label].forEach(item => {
                if (item.label === val.val) {
                  labelBool = false
                  objectInfo[val.label] = item.value
                }
              })
              if (labelBool) {
                objectInfo[val.label] = val.val
              }
            } else {
              objectInfo[val.label] = val.valnum
            }
          } else if (val.type === 'selectSelf') {
            objectInfo[val.label] = val.valnum
          } else if (val.type === 'severity') {
            objectInfo[val.label] = val.valnum
          } else if (val.type === 'alertTypes') {
            objectInfo[val.label] = val.valnum
          } else if (val.type === 'selectAction') { // 新增日志判断
            objectInfo[val.label] = val.valnum
          } else if (val.type === 'dc') {
            objectInfo.dcIds = val.valnum
          } else if (val.type === 'asset') {
            objectInfo.asset = val.val
          } else if (val.type === 'module') {
            objectInfo.moduleIds = val.valnum
          } else if (val.type === 'project') {
            objectInfo.projectIds = val.valnum
          } else if (val.label === 'assetState') {
            objectInfo.stateIds = val.valnum
          } else if (val.label === 'assetType') {
            objectInfo.typeIds = val.valnum
          } else if (val.type === 'brand') {
            objectInfo.brandIds = val.valnum
          } else if (val.type === 'group') {
            objectInfo.groupIds = val.valnum
          } else if (val.type === 'issueType') {
            objectInfo.type = val.val
          } else if (val.type === 'issue') {
            if (val.label === 'cid') {
              objectInfo.cid = val.valnum
            } else if (val.label === 'uid') {
              objectInfo.uid = val.valnum
            } else if (val.label === 'rid') {
              objectInfo.rid = val.valnum
            } else if (val.label === 'aid') {
              objectInfo.aid = val.valnum
            }
          } else if (val.type === 'selectString') {
            if (val.label === 'dcState') {
              objectInfo.state = val.val
            } else if (val.label === 'promType') {
              objectInfo.type = val.val
            } else if (val.label === 'chartType') {
              objectInfo.type = val.val
            } else if (val.label === 'protocol') {
              objectInfo.protocol = val.val
            } else if (val.label === 'operation') {
              objectInfo.operation = val.val
            } else if (val.label === 'state') {
              objectInfo.state = val.val
            } else if (val.label === 'ack') {
              objectInfo.ack = val.val
            }
          } else {
            objectInfo[val.label] = val.val
          }
        }
      })
      this.getHeight()
      // 搜索完成后存储在本地历史记录中
      if (this.select_list.length != 0) {
        if (JSON.parse(localStorage.getItem('nz-history-' + this.where)) == undefined || JSON.parse(localStorage.getItem('nz-history-' + this.where)) == []) {
          this.historyList.unshift(this.select_list)
          localStorage.setItem('nz-history-' + this.where, JSON.stringify(this.historyList))
        } else {
          this.historyList = JSON.parse(localStorage.getItem('nz-history-' + this.where))
          this.historyList.unshift(this.select_list)
          if (this.historyList.length > 10) {
            this.historyList.length = 10
          }
          localStorage.setItem('nz-history-' + this.where, JSON.stringify(this.historyList))
        }
      }
      this.input_list = true
      this.restructure_historyDate()

      this.$emit('search', objectInfo)
    },
    // 清空历史记录
    clear_history () {
      this.historyList = []
      this.history_once = []
      localStorage.setItem('nz-history-' + this.where, JSON.stringify(this.historyList))
    },
    // 再次点击之前的历史记录
    select_history (ind, e) {
      this.stop_click(e)
      this.input_list = true
      this.change_sreach_show = true
      this.localStorage_display = !this.localStorage_display
      this.select_list = []
      JSON.parse(localStorage.getItem('nz-history-' + this.where)).splice(ind, 1)
      this.select_list = JSON.parse(JSON.stringify(this.history_once[ind]))
      this.sreach_num = this.select_list.length
      this.select_list.forEach(val => {
        this.searchLabelList.forEach((item, index) => {
          if (val.label == item.label) {
            this.searchLabelList.splice(index, 1)
          }
        })
      })
      this.select()
    },
    // 获取历史记录  数据进行处理以便循环展示
    restructure_historyDate () {
      if (localStorage.getItem('nz-history-' + this.where) !== undefined && localStorage.getItem('nz-history-' + this.where) !== null) {
        this.history_once = JSON.parse(localStorage.getItem('nz-history-' + this.where))
      }
    },
    clear_search_list (e) {
      const keyCode = window.event ? e.keyCode : e.which
    },
    // 监听输入框鼠标抬起事件
    enter_one (e) {
      const keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 40) {
        if (this.searchStyleNum < this.searchLabelList.length - 1) {
          var disabledNum = 0
          this.searchLabelList.forEach(val => {
            if (val.disabled) {
              disabledNum++
            }
          })
          this.isSearchNum = this.searchStyleNum
          this.isSearchNum++
          if (!(this.searchLabelList[this.isSearchNum].disabled)) {
            this.searchStyleNum++
          } else {
            this.searchStyleNum += disabledNum + 1
          }
        }
        if (this.searchStyleNum >= 7) {
          document.getElementById('input_list').scrollTop += 28
        }
      }
      if (keyCode == 38) {
        if (this.searchStyleNum >= 0) {
          var disabledNum = 0
          this.searchLabelList.forEach(val => {
            if (val.disabled) {
              disabledNum++
            }
          })
          this.isSearchNum = this.searchStyleNum
          if (this.isSearchNum > 0) {
            this.isSearchNum--
          }
          if (!(this.searchLabelList[this.isSearchNum].disabled)) {
            this.searchStyleNum--
          } else {
            this.searchStyleNum -= disabledNum + 1
          }
        }
        if (this.searchStyleNum <= this.searchLabelList.length - 8) {
          document.getElementById('input_list').scrollTop -= 28
        }
      }
      if (this.no_condition == '') {
        if (!this.keyBool) {
          if (keyCode == 8) {
            const arr = this.select_list
            if (!this.delBool) {
              if (this.input_sreach == '') {
                for (let i = arr.length - 1; i >= 0; i--) {
                  this.input_list = true
                  this.change_sreach_show = false
                  this.sreach_num = i
                  this.input_sreach = arr[i].val
                  setTimeout(() => {
                    document.getElementById('sreach_input').focus()
                  }, 500)
                  // this.delBool = true
                  break
                }
              }
            }
          }
        }
      }
      if (keyCode == 13) {
        if (this.searchStyleNum <= 0) {
          this.select()
        } else {
          const val = this.searchLabelList[this.searchStyleNum].name
          const ind = this.searchStyleNum
          const id = this.searchLabelList[this.searchStyleNum].id
          const type = this.searchLabelList[this.searchStyleNum].type
          const label = this.searchLabelList[this.searchStyleNum].label
          const disabled = this.searchLabelList[this.searchStyleNum].disabled
          const readonly = this.searchLabelList[this.searchStyleNum].readonly
          this.searchStyleNum = -1
          this.select_name(val, ind, id, type, label, disabled, readonly)
        }
      }
    },
    // input框监听是按删除还是回车
    enter (val, e) {
      const keyCode = window.event ? e.keyCode : e.which
      if (val == 'ID' && keyCode == 13) {
        const id = /^[0-9]*$/
        if (!id.test(this.input_sreach) || this.input_sreach > 2147483647) {
          // 如果有不正确的值 进行删除
          this.input_sreach = ''
          this.$message.error(this.other.delErrorId)
          return false
        }
      }
      if (keyCode !== 8) {
        this.delBool = false
        this.delcriteriaBool = false
      }
      if (this.delBool) {
        if (keyCode == 8) {
          if (this.input_sreach == '') {
            this.searchMsg.searchLabelList.forEach((val, k) => {
              if (this.select_list[this.sreach_num].label == val.label) {
                this.searchLabelList.splice(k + 1, 0, val)
                this.Iskeywords(this.sreach_num)
              }
            })
            this.select_list.splice(this.sreach_num, 1)
            this.change_sreach_show = true
            setTimeout(() => {
              document.getElementById('one-input' + this.position).focus()
            }, 500)
            this.input_list = false
            this.delBool = false
          } else if (this.searchMsg.searchLabelList.find(key => this.select_list[this.sreach_num].label == key.label).readonly) {
            this.input_sreach = ''
          }
        }
      } else {
        if (keyCode == 8) {
          if (this.delcriteriaBool || !this.input_sreach) {
            this.searchMsg.searchLabelList.forEach((val, k) => {
              if (this.select_list[this.sreach_num].label == val.label) {
                this.searchLabelList.splice(k + 1, 0, val)
                this.Iskeywords(this.sreach_num)
              }
            })
            this.select_list.splice(this.sreach_num, 1)
            this.change_sreach_show = true
            setTimeout(() => {
              document.getElementById('one-input' + this.position).focus()
            }, 500)
            this.input_list = false
            this.delcriteriaBool = false
          } else if (this.searchMsg.searchLabelList.find(key => this.select_list[this.sreach_num].label == key.label).readonly) {
            this.input_sreach = ''
          } else {
            if (this.input_sreach == '') {
              this.delcriteriaBool = true
            }
          }
        }
      }

      if (keyCode == 38 || keyCode == 40) {
        if (this.select_list[this.sreach_num].type !== 'select') {
          if (this.input_sreach !== '') {
            this.zhezhao_click()
            setTimeout(() => {
              document.getElementById('one-input' + this.position).focus()
            }, 500)
            this.input_list = false
          }
        } else {
          if (keyCode == 40) {
            this.selectInfo = true
            if (this.search_select_style_num < this.selectInfoList[this.select_list[this.sreach_num].label].length - 1) {
              this.search_select_style_num++
            }
          }
          if (keyCode == 38) {
            this.selectInfo = true
            if (this.search_select_style_num >= 0) {
              this.search_select_style_num--
            }
          }
        }
      } else if (keyCode == 13) {
        this.searchMsg.zheze_none = true
        // 回车键
        if (!this.selectInfo) {
          this.select()
        } else {
          this.selectInfo = false
          this.tr_selectInfo(this.select_list[this.sreach_num].label, this.selectInfoList[this.select_list[this.sreach_num].label][this.search_select_style_num].label, this.selectInfoList[this.select_list[this.sreach_num].label][this.search_select_style_num].value, e)
        }
      }
    },
    // 清空已输入的搜索条件
    clear_input (e) {
      this.stop_click(e)
      this.no_condition = ''
      this.input_sreach = ''
      this.select_list = []
      this.searchLabelList = []
      JSON.parse(JSON.stringify(this.searchMsg.searchLabelList)).forEach(val => {
        this.searchLabelList.push(val)
      })
      this.$nextTick(() => {
        this.$refs.searchScrollbar.update()
      })
      this.select()
    },
    // 修改已有参数
    update_sreach (ind, e) {
      // if(this.select_list[ind].id==6||this.select_list[ind].id==28){
      if (false) {
        this.sreach_num = ind
        this.downBool = false
        this.change_sreach_show = false
        this.input_list = true
      } else {
        this.input_list = true
        this.change_sreach_show = false
        this.sreach_num = ind
        this.input_sreach = this.select_list[ind].val ? this.select_list[ind].val : ''
        if (this.select_list[ind].type == 'input') {
          this.downBool = true
        } else {
          this.downBool = false
        }
        setTimeout('document.getElementById("sreach_input").focus()', 50)
        this.getHeight()
        this.searchMsg.zheze_none = false
      }
    },
    // 删除要搜索的条件
    close_selcet_list (ind, e) {
      if (e) {
        this.stop_click(e)
      }
      // 处理alertType--asset联动问题：删除alertType时，将asset也删除
      /* if (this.select_list[ind].label == 'alertType') {
                  for (let i = 0; i < this.select_list.length; i++) {
                    if (this.select_list[i].label == 'asset') {
                      this.close_selcet_list(i);
                      for (let j = 0; j < this.searchLabelList.length; j++) {
                        if (this.searchLabelList[j].label == 'asset') {
                          this.searchLabelList[j].disabled = true;
                          break;
                        }
                      }
                      break;
                    }
                  }
                } */
      this.searchMsg.searchLabelList.forEach((val, key) => {
        if (this.select_list[ind].label == val.label) {
          this.searchLabelList.splice(key + 1, 0, val)
          this.Iskeywords(ind)
        }
      })
      this.select_list.splice(ind, 1)
      this.sreach_num--
      this.select()
    },
    // 阻止冒泡事件
    stop_click (e) {
      if (e) {
        e.cancelBubble = true
        e.stopPropagation()
      }
    },
    // 点击遮罩层
    zhezhao_click () {
      if (this.input_sreach != '') {
        if (!this.searchMsg.zheze_none) {
          if (this.input_sreach != '') {
            this.change_sreach_show = true
            let IDsplit
            const id = /^[0-9]*$/
            const bool = true
            if (this.select_list[this.sreach_num].id == 1) {
              // id==1  判断是不是搜索ID    如果是ID 会出现搜索多个ID  分割ID
              IDsplit = this.input_sreach.split(',')
              // 循环分割出来的ID  判断输入的每个ID是否正确
              for (let i = IDsplit.length - 1; i >= 0; i--) {
                if (!id.test(IDsplit[i]) || IDsplit[i] > 2147483647) {
                  // 如果有不正确的值 进行删除
                  IDsplit.splice(i, 1)
                  this.$message.error(this.other.delErrorId)
                }
                if (IDsplit[i] == '') {
                  IDsplit.splice(i, 1)
                }
              }
              this.input_sreach = ''
              // 从新拼接ID内容
              IDsplit.forEach(val => {
                this.input_sreach += val + ','
              })
              this.input_sreach = this.input_sreach.substr(0, this.input_sreach.length - 1)
              if (this.input_sreach != '') {
                this.select_list[this.sreach_num].val = this.input_sreach
                this.input_sreach = ''
                this.sreach_num++
                this.sreach_num = this.select_list.length
              } else {
                this.sreach_num = 0
                this.change_sreach_show = false
              }
            } else {
              this.select_list[this.sreach_num].val = this.input_sreach
              this.input_sreach = ''
              this.sreach_num = this.select_list.length
            }
          } else {
            let Bool = false
            this.select_list.forEach(val => {
              if (val.val == '' || val.val == undefined) {
                Bool = true
              }
            })
            if (Bool) {
              this.sreach_num = this.select_list.length - 1
            } else {
              this.sreach_num = this.select_list.length
            }
          }
          if (this.no_condition != '') {
            this.change_sreach_show = true
            if (this.select_list.length == 0) {
              this.select_list.push({ name: 'Name', id: 2, type: 'input', val: this.no_condition, label: 'name' })
              this.searchLabelList.forEach((val, ind) => {
                if (val.id == 2) {
                  this.searchLabelList.splice(ind, 1)
                }
              })
              this.sreach_num++
            } else {
              let bool = true
              this.select_list.forEach(val => {
                if (val.id == 2) {
                  bool = false
                  val.val += ',' + this.no_condition
                }
              })
              if (bool) {
                this.select_list.push({ name: 'Name', id: 2, type: 'input', val: this.no_condition, label: 'name' })
                this.searchLabelList.forEach((val, ind) => {
                  if (val.id == 2) {
                    this.searchLabelList.splice(ind, 1)
                  }
                })
                this.sreach_num++
              }
            }
            this.no_condition = ''
            this.sreach_num = this.select_list.length
          }
          setTimeout(() => {
            document.getElementById('one-input' + this.position).focus()
          }, 500)
          this.input_list = !this.input_list
          const _this = this
          setTimeout(function () {
            _this.getHeight()
          })
          this.searchMsg.zheze_none = true
        }
      }
    },
    // 点击搜索框  显示搜索类型
    read_input (e) {
      e.cancelBubble = true
      e.stopPropagation()
      this.getHeight()
      this.input_list = !this.input_list
      this.getSelectPosition(e)
    },
    // 点击选择 搜索类型
    select_name (val, ind, id, type, label, disabled, readonly, e) {
      if (type == 'input') {
        this.downBool = true
      } else {
        this.downBool = false
      }
      this.no_condition = ''
      this.searchMsg.zheze_none = false
      if (!disabled) {
        if (id == 7) {
          this.searchLabelList.splice(ind, 1)
          this.select_list.push({
            name: val,
            id: id,
            type: type,
            label: label,
            disabled: disabled,
            readonly
          })
          this.change_sreach_show = false
          this.input_list = !this.input_list
        } else if (id == 29) {
          this.searchLabelList.splice(ind, 1)
          this.select_list.push({
            name: val,
            id: id,
            type: type,
            label: label,
            disabled: disabled,
            readonly
          })
          this.change_sreach_show = false
          this.sreach_num = this.select_list.length - 1
          this.input_list = !this.input_list
          setTimeout(document.getElementById('sreach_input').focus(), 500)
          this.change_sreach_show = false
          this.sreach_num = this.select_list.length - 1
          this.input_list = !this.input_list
          setTimeout(document.getElementById('sreach_input').focus(), 500)
        } else {
          this.searchLabelList.splice(ind, 1)
          this.select_list.push({
            name: val,
            id: id,
            type: type,
            label: label,
            disabled: disabled,
            readonly
          })
          this.change_sreach_show = false
          this.sreach_num = this.select_list.length - 1
          this.input_list = !this.input_list
          if (id !== 6 && id !== 28) {
            setTimeout('document.getElementById("sreach_input").focus()', 500)
          }
        }
        const _this = this
        setTimeout(function () {
          _this.getHeight()
        })
      }
    },
    /* 计算select弹框的位置 */
    getSelectPosition (e) {
      const inputListDom = this.getDomFromParents(e.target, 'input-center-box', 0)
      if (inputListDom) {
        this.$nextTick(() => {
          if (this.inTransform) {
            // this.selectDom.top = "36px";
          } else {
            const position = inputListDom.getBoundingClientRect()
            this.selectDom.top = position.top + 36 + 'px'
            this.selectDom.left = position.left + 'px'
          }
        })
      }
    },
    /* 递归向上获取指定class的dom */
    getDomFromParents (dom, className, level) {
      const parentClassNames = dom.parentElement.className
      if (parentClassNames.indexOf(className) == -1) {
        if (level < 20 && dom.parentElement) { // 限制20层，避免溢出
          return this.getDomFromParents(dom.parentElement, className, ++level)
        } else {
          return false
        }
      } else {
        return dom.parentElement
      }
    },
    // 判断输入框的高度
    getHeight () {
      if (document.getElementById('search-ul').clientHeight < 24 || document.getElementById('input-center-box').clientHeight < 24) {
        document.getElementById('input-center-box').style.height = 27 + 'px'
        document.getElementById('search-ul').style.height = 21 + 'px'
      }
    },
    chlick_sreach (e) {
      this.stop_click(e)
      this.searchMsg.zheze_none = false
    },
    // 时间计划
    schelistget () {
      this.schlist = []
      this.$get('/schedule', this.schedata).then(data => {
        if (data.code == 200) {
          this.schlist = data.data.list
        }
      })
    },
    close_search (e) {
      this.selectDom.show = false
    }
  },
  mounted () {
    if (this.position) {
      this.where = this.$route.path + this.position
    }
    this.restructure_historyDate()
    setTimeout(() => {
      if (this.$route.path === '/asset' || this.targetTab === 'asset') {
        this.getAssetStateData()
        this.getAssetTypeData()
      }
      if (this.$route.path === '/agent' || this.$route.path === '/ipam') {
        this.getDcData()
      }
      if (this.$route.path === '/model') {
        this.getBrandData()
      }
      if (this.$route.path === '/assetLabel') {
        this.getGroupData()
      }
      if (this.$route.path === '/module') {
        this.getProjectData()
      }
      if (this.$route.path === '/endpoint') {
        this.getProjectData()
        this.getModuleData()
      }
      if (this.$route.path === '/alertRule') {
        this.getSeverityData()
      }
      if (this.$route.path === '/exprTemp') {
        this.getGnameList()
      }
      if (this.$route.path === '/issue') {
        this.getIssueTypeData()
        this.getUserList()
      }
      this.searchLabelList = this.searchLabelList.filter(item => !this.select_list.find(select => select.label === item.label))
      setTimeout(() => {
        this.select_list.forEach(item => {
          if (item.listStr) {
            item.val = this[item.listStr].find(r => r.id == item.valnum).name
          }
        })
      }, 300)
    }, 1000)
    JSON.parse(JSON.stringify(this.searchMsg.searchLabelList)).forEach(val => {
      if (val.prop == 'common_action') {
        this.actionSelect = val.doc.data
      }
      this.actionSelect.forEach((item) => {
        item.id = item.code
        item.label = val.label
        item.name = val.label
      })
      this.searchLabelList.push(val)
    })
    const _this = this
    document.onkeydown = function (event) {
      const e = event || window.event || arguments.callee.caller.arguments[0]
      if (e.keyCode == 27) {
        _this.close_search(e)
      }
    }
  }
}
</script>
