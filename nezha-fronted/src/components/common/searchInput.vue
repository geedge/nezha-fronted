<template>
    <div class="new-search"  v-clickoutside="clickout">
        <div class="search-input-all input-position" @click="stop_click">
<!--            历史记录-->
            <div class="search-history">
                <i class="el-icon-time" @click="look_history" id="search-view-history"></i>
                <div :class="localStorage_display?'localStorage_list_box none':'localStorage_list_box'">
                    <div class="list_box_title">
                        <span>{{$t('search.recentSearch')}}</span>
                        <i class="el-icon-close" @click="localStorage_display=!localStorage_display" id="search-close-history"></i>
                    </div>
                    <div class="list_box_content" v-if="history_once.length>0">
                        <ul>
                            <li v-for="(val,ind) in history_once" @click="select_history(ind,$event)" :key="ind" :id="'search-history-pick-'+ind">
                                <span v-for="(item,key) in val" :key="key">
                                    <span class="name">{{item.name}}: </span>
                                    <span class="value">{{item.val+' '}}</span>
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
              <el-scrollbar style="height: 100%;width: 200px; overflow-y: hidden" ref="searchScrollbar">
                <ul class="sreach_fixe_left" id="search-ul">
                    <li class="selectinfo_box" v-if="select_list.length>0" v-for="(val,ind) in select_list" :key="ind" @click="update_sreach(ind,$event)">
                        <div class="select_condition">
                            {{val.name}}
                        </div>
                        <div class="select_content" v-if="val.val && ind!=sreach_num">
                            <span>{{val.valString ? val.valString : val.val}}</span>
                            <i class="el-icon-close" @click="close_selcet_list(ind,$event)"></i>
                        </div>
                        <div v-else-if="!change_sreach_show && ind==sreach_num && val.id!==7 " class="select_input">
                            <input type="text" autocomplete="off" id="sreach_input" v-model="input_sreach" @keyup="enter(val.name, $event)" @click="stop_click">
                            <div class="select_info_list" :style="'top:' + selectDom.top" v-if="val.type == 'select'">
                              <el-scrollbar v-if="selectInfoList[val.label].length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in selectInfoList[val.label]" :key="key" @click="tr_selectInfo(val.label,item.value,item.label,$event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.label}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in selectInfoList[val.label]" :key="key" @click="tr_selectInfo(val.label,item.value,item.label,$event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.label}}</li>
                              </ul>
                            </div>
                            <div class="select_info_list" :style="'top:' + selectDom.top" v-if="val.type == 'selectString'">
                              <el-scrollbar v-if="selectInfoList[val.label].length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in selectInfoList[val.label]" :key="key" @click="stringSelectInfo(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.label}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in selectInfoList[val.label]" :key="key" @click="stringSelectInfo(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.label}}</li>
                              </ul>
                            </div>
                            <div class="select_info_list" :style="'top:' + selectDom.top" v-if="val.type == 'dc'">
                              <el-scrollbar v-if="dcSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                  <li v-for="(item,key) in dcSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.name}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in dcSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.name}}</li>
                              </ul>
                            </div>
                            <div class="select_info_list" :style="'top:' + selectDom.top" v-if="val.type == 'asset'">
                              <el-scrollbar v-if="assetSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in assetSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.host}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in assetSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.host}}</li>
                              </ul>
                            </div>
                            <div class="select_info_list" :style="'top:' + selectDom.top" v-if="val.type == 'project'">
                              <el-scrollbar v-if="projectSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in projectSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.name}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in projectSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.name}}</li>
                              </ul>
                            </div>
                            <div class="select_info_list" :style="'top:' + selectDom.top" v-if="val.type == 'module'">
                              <el-scrollbar v-if="moduleSelect.length > 8" class="el-scrollbar-small" style="height: 240px;">
                                <ul>
                                    <li v-for="(item,key) in moduleSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.name}}</li>
                                </ul>
                              </el-scrollbar>
                              <ul v-else>
                                <li v-for="(item,key) in moduleSelect" :key="key" @click="selectObject(val, item, $event)" :class="search_select_style_num==key?'search-style-ind':''">{{item.name}}</li>
                              </ul>
                            </div>
                            <!-- 新增日志模块action下拉选择 -->
                            <div class="select_info_list" :style="'top:' + selectDom.top" v-if="val.type == 'selectAction'">
                                <ul>
                                    <li v-for="(item,key) in actionSelect" :key="key" @click="tr_selectInfo(val.label,item.id,item.value,$event)">{{item.value}}</li>
                                </ul>
                            </div>
                            <!-- 新增protocol下拉选择 -->
                             <div class="select_info_list" :style="'top:' + selectDom.top" v-if="val.type == 'selectType'">
                                <ul>
                                    <li v-for="(item,key) in schemaTypeSelect" :key="key" @click="tr_selectTypeInfo(item)">{{item.value}}</li>
                                </ul>
                            </div>
                            <!-- 新增protocol二层下拉 -->
                            <div class="select_info_list" :style="'top:' + selectDom.top" v-if="TypeSelect.length!=0&&val.type == 'selectType'&&secondShow">
                                <ul>
                                    <li v-for="(item,key) in TypeSelect" :key="key" @click="tr_selectProtocolInfo(item)">{{item.name}}</li>
                                </ul>
                            </div>
<!--                           时间计划-->
                            <div class="select_info_list" :style="'top:' + selectDom.top" v-if="val.type == 'select'&&val.id==5">
                                <ul>
                                    <li v-for="item in schlist" @click="selectSul(item.name)">{{item.name}}</li>
                                </ul>
                            </div>
                        </div>
                        <el-date-picker
                                v-model="timeFrame"
                                type="datetimerange"
                                range-separator="To"
                                start-placeholder="Start Time"
                                end-placeholder="End Time"
                                @change="changeDate"
                                :class="dataBackG?'':'dataBackG'"
                                v-if="ind==sreach_num&&val.id==7"
                        >
                        </el-date-picker>
                    </li>
<!-- 最开始的input框-->
                    <li class="select_input" v-if="change_sreach_show">
                        <input type="text" @click="read_input" v-model="no_condition" @keyup="enter_one" id="one-input" @keydown="clear_search_list" >
                    </li>
                </ul>
              </el-scrollbar>
            </div>
            <div v-show="clearSearchShow" class="clear-search" @click="clear_input">
                <i class="el-icon-circle-close"></i>
            </div>
            <div :class="input_list?'input_list none':'input_list'" :style="'top:' + selectDom.top" @click="stop_click" id="input_list">
                <ul>
                    <li v-for="(val,ind) in searchLabelList" @click="select_name(val.name,ind,val.id,val.type,val.label,val.disabled,$event)" :key="ind" :class="{'search-style-ind':searchStyleNum==ind,'is-disabled':val.disabled}">
                        <span>{{val.name}}</span>
                    </li>
                    <!--<li v-for="(val,ind) in searchLabelList"  v-if="val.name=='Protocol'" @click="select_type(val.name,ind,val.id,val.type,val.label,val.disabled)" :key="ind" :class="{'search-style-ind':searchStyleNum==ind,'is-disabled':val.disabled}">
                        <span>{{val.name}}</span>
                    </li>-->
                </ul>
            </div>
        </div>
        <button @click="select" type="button" class="nz-btn nz-btn-size-normal nz-btn-style-light float-right" id="search-input-search"><i class="el-icon-search"></i></button>
        <!--<div class="new-search-btn" @click="select">
            <i class="el-icon-search"></i>
        </div>-->
    </div>
</template>

<script>
    import searchSelectInfo from "./searchSelectInfo"; //搜索框组件--下拉框内容
    export default {
        name: "index",
        data() {
            return {
                selectDom: {top: '', tempTop: ''}, // 选择弹框的位置
                clearSearchShow: false,
                select_conditionsName:'',
                selectInfoList: searchSelectInfo,
                select_title: '',
                other: '',
                localStorage_display: true,
                input_list: true,
                change_sreach_show: true,
                select_list: [], //当前的搜索条件和值
                historyList: [],
                actionSelect:[],
                dcSelect: [], //数据中心
                assetSelect: [], //资产
                projectSelect: [],
                moduleSelect: [],
                modelSelect: [],
                schemaTypeSelect:[], //日志检索Protocol下拉菜单
                TypeSelect:[],//Protocol二层下拉菜单
                secondShow:'',//二层显示控制
                input_sreach: '',
                sreach_num: 0,
                searchLabelList: [ //下拉列表里的选项
                    {id: 0, name: this.$t('search.searchTip'), icon: 'el-icon-search'},
                ],
                bool: false,
                no_condition: '',
                //历史记录列表
                history_once: [],
                name:"",
                id:"",
                schedata:{
                    name:'',
                    isValid:1,
                    pageSize:30,
                    pageNo:1
                },
                schlist:[],
                timeFrame: [new Date(new Date() - 1 * 60 * 60 * 1000), new Date()],
                dataBackG:true,
                delBool : false,
                searchStyleNum:-1,
                isSearchNum :-1,
                search_select_style_num:-1,
                keyBool : false,
                delnum :0,
                delcriteriaBool:false,
                selectInfo:false,
                disabaled:true,
                downBool:false
            }
        },
        computed: {
            alertListAssetId() {
              return this.$store.state.assetForAlertList;
            }
        },
        watch: {
          defaultValue: {
            immediate: true,
            handler(n) {
              if (n) {
                this.$nextTick(() => {
                  if (this.defaultItem) {
                    if (this.defaultItem == 'alertMessageState' && this.defaultValue) {
                      this.searchLabelList.forEach((item, index) => {
                        if (item.id == 12) {
                          this.searchLabelList.splice(index, 1);
                        }
                      });
                      this.select_list.push({
                        name: this.$t('alert.list.state'),
                        type: 'select',
                        label: 'state',
                        disabled: false,
                        val: this.$t('alert.list.pending'),
                        valnum: 1
                      });
                      this.input_sreach = '';
                      this.sreach_num = this.select_list.length;
                      this.change_sreach_show = false;
                      this.input_list = true;
                      this.select();
                    }
                  }
                });
              }
            }
          },
          inTransform: {
            immediate: true,
            handler(n) {
              let listsK = document.querySelectorAll(".input_list");
              listsK.forEach((item, index) => {
                item.style.display = "none";
              });
              let listsV = document.querySelectorAll(".select_info_list");
              listsV.forEach((item, index) => {
                item.style.display = "none";
              });
              if (n) {
                this.selectDom.tempTop = this.selectDom.top;
                this.selectDom.top = '36px';
              } else {
                this.selectDom.top = this.selectDom.tempTop;
              }
              setTimeout(() => {
                listsK.forEach((item, index) => {
                  item.style.display = "";
                });
                listsV.forEach((item, index) => {
                  item.style.display = "";
                });
              }, 500);
            }
          },
          select_list: {
            //监听下拉列表
            handler(newData, oldData) {
              this.$refs.searchScrollbar.update();
              if (newData.length == 0) {
                this.change_sreach_show = true;
                this.clearSearchShow = false;
              } else {
                this.clearSearchShow = true;
              }
              /*if (this.$route.path.indexOf("alertList") > -1 || this.$route.path.indexOf("alertConfig") > -1) {
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
              }*/
            }
          },
          no_condition: {
              handler(newData, oldData) {
                  if (newData != '') {
                      this.input_list = true
                  }
              }
          },
          /*alertListAssetId: {
            immediate: true,
            handler(newData, oldData) {
              if (newData && this.$route.path == '/alertList') {
                setTimeout(()=>{
                  //
                  //1.条件名alertType
                  //
                  this.searchLabelList.splice(2, 1);
                  this.select_list.push({
                    name: this.$t('alert.list.type'),
                    id: 3,
                    type: 'select',
                    label: 'alertType',
                    disabled: false
                  });
                  //
                  //2.条件值asset
                  //
                  this.select_list.forEach(val => {
                    if (val.label == 'alertType') {
                      val.val = this.$t('alert.config.typeOption.asset');
                      val.valnum = 3;
                      //alertList页type选择asset时，可以搜索asset
                      if (this.$route.path == '/alertList' && val.label == 'alertType' && val.valnum == 3) {
                        for (let i = 0; i < this.searchLabelList.length; i++) {
                          if (this.searchLabelList[i].label == 'asset') {
                            this.searchLabelList[i].disabled = false;
                            break;
                          }
                        }
                      } else if (this.$route.path == '/alertList' && val.label == 'alertType' && val.valnum != 3) {
                        let ind = -1;
                        for (let i = 0; i < this.searchLabelList.length; i++) {
                          if (this.searchLabelList[i].label == 'asset') {
                            this.searchLabelList[i].disabled = true;
                            break;
                          }
                        }
                        for (let i = 0; i < this.select_list.length; i++) {
                          if (this.select_list[i].label == 'asset') {
                            ind = i;
                            break;
                          }
                        }
                        if (ind >= 0) {
                          this.close_selcet_list(ind);
                        }
                      }
                    }
                  });
                  //
                  //3.条件名asset
                  //
                  //this.input_list = false;
                  this.searchLabelList.splice(3, 1);
                  this.select_list.push({
                    name: this.$t('asset.asset'),
                    id: 11,
                    type: 'asset',
                    label: 'asset',
                    disabled: false
                  });

                  //
                  //4.条件值：指定的asset
                  setTimeout(()=>{
                    let assetHost = '';
                    for (let i = 0; i < this.assetSelect.length; i++) {
                      if (this.assetSelect[i].id == newData) {
                        assetHost = this.assetSelect[i].host;
                      }
                    }
                    this.select_list.forEach(val => {
                      if (val.label == 'asset') {
                        val.val = assetHost;
                        val.valnum = newData;
                      }
                    });
                    this.input_sreach = '';
                    this.sreach_num = this.select_list.length;
                    this.change_sreach_show = false;
                    this.input_list = true;
                    //
                    //5.点击搜索
                    //
                    this.select();
                  }, 50);

                }, 100);
                this.$store.commit('assetForAlertListChange', '');
              }
            }
          }*/
        },
        props:['searchMsg','defaultItem','defaultValue','inTransform'],
        methods: {
              //dc
              clearSearch() {
                this.select_list = [];
              },
              clickout(){
                this.input_list=true;
              },
              selectObject(column, selectItem, e) {
                this.stop_click(e);
                for (let i = 0; i < this.select_list.length; i++) {
                  let val = this.select_list[i];
                  if (val.type == 'dc' && selectItem.searchType == 'dc'){
                    val.val = selectItem.name;
                    val.valnum = selectItem.id;
                    val.valString = '';
                  } else if (val.type == 'project' && selectItem.searchType == 'project') {
                    val.val = selectItem.name;
                    val.valnum = selectItem.id;
                    val.valString = '';
                  } else if (val.type == 'module' && selectItem.searchType == 'module') {
                    val.val = selectItem.name;
                    val.valnum = selectItem.id;
                    val.valString = '';
                  } else if (val.type == 'asset' && selectItem.searchType == 'asset') {
                    val.val = selectItem.host;
                    val.valnum = selectItem.id;
                    val.valString = '';
                  }
                }
                //this.select_list.push({type: 'dc', val: selectItem.name, valnum: selectItem.id});
                this.input_sreach = '';
                this.sreach_num = this.select_list.length;
                this.change_sreach_show = true;
                this.input_list = false;
                var _this = this;
                setTimeout("document.getElementById(\"one-input\").focus()", 500);
                setTimeout(function () {
                  _this.getHeight();
                });
                /*this.$nextTick(() => {
                  this.$refs.searchScrollbar.update();
                });*/
              },
               //一层下拉点击
              tr_selectTypeInfo(val){
                  this.TypeSelect=[];
                  val.data.length!=0?this.TypeSelect.push(val.data[0]):'';
                  val.data.length!=0?this.secondShow=true:''
              },
               //二层下拉点击
              tr_selectProtocolInfo(val){
                  this.select_list=[];
                  this.select_list.push({
                    name: val.name,
                    // id:id,
                    type:val.type,
                    label:val.label,
                    // disabled:disabled
                  })
                  this.change_sreach_show = false
                  this.sreach_num = this.select_list.length-1
                  this.input_list = !this.input_list
                //   setTimeout("document.getElementById(\"sreach_input\").focus()", 500);
                  var _this = this
                  setTimeout(function () {
                    _this.getHeight()
                  },)
            },
            Iskeywords(ind){
              if(this.select_list[ind].id==29){
                this.searchLabelList.forEach(val=>{
                  if(val.id==30||val.id==31||val.id==32||val.id==33){
                    val.disabled = false
                  }
                })
              }else if(this.select_list[ind].id==30||this.select_list[ind].id==31||this.select_list[ind].id==32||this.select_list[ind].id==33){
                this.searchLabelList.forEach(val=>{
                  if(val.id==29){
                    val.disabled = false
                  }
                })
              }
            },
            getDcData() {
              this.$get('idc', {pageNo: 1, pageSize: -1}).then(response => {
                if (response.code === 200) {
                  this.dcSelect = response.data.list;
                  this.dcSelect.forEach((item, index) => {
                    this.$set(item, 'searchType', 'dc');
                  });
                }
              });
            },
            getAssetData() {
              this.$get('asset', {pageNo: 1, pageSize: -1}).then(response => {
                if (response.code === 200) {
                  this.assetSelect = response.data.list;
                  this.assetSelect.forEach((item, index) => {
                    this.$set(item, 'searchType', 'asset');
                  });
                }
              });
            },
            getModelData() {
              this.$get('model', {pageNo: 1, pageSize: -1}).then(response => {
                if (response.code === 200) {
                  this.modelSelect = response.data.list;
                  this.modelSelect.forEach((item, index) => {
                    this.$set(item, 'searchType', 'model');
                  });
                }
              });
            },
            getProjectData() {
              this.$get('project', {pageNo: 1, pageSize: -1}).then(response => {
                if (response.code === 200) {
                  this.projectSelect = response.data.list;
                  this.projectSelect.forEach((item, index) => {
                    this.$set(item, 'searchType', 'project');
                  });
                }
              });
            },
            getModuleData() {
              this.$get('module', {pageNo: 1, pageSize: -1}).then(response => {
                if (response.code === 200) {
                  this.moduleSelect = response.data.list;
                  this.moduleSelect.forEach((item, index) => {
                    this.$set(item, 'searchType', 'module');
                  });
                }
              });
            },
            //点击确认选择下拉内容
            tr_selectInfo(selectLabel,value,label,e){
                this.stop_click(e);
                this.select_list.forEach(val=>{
                    if(val.label == selectLabel){
                        val.val = label;
                        val.valnum = value;
                    }
                });
                for (let i = 0; i < this.select_list.length; i++) {
                  if (this.select_list[i].label == selectLabel) {
                    this.select_list.splice(i, 1, Object.assign({}, this.select_list[i], {val: label, valnum: value}));
                    /*this.select_list[i].val = label;
                    this.select_list[i].valnum = value;*/
                  }
                }
                this.input_sreach = '';
                this.sreach_num = this.select_list.length;
                this.change_sreach_show = true;
                this.input_list = false;
                var _this = this;
                setTimeout("document.getElementById(\"one-input\").focus()", 500);
                setTimeout(function () {
                  _this.getHeight();
                });
            },
            //点击确认value是string类型的下拉内容, param: 字段对象，选中的选项
            stringSelectInfo(column, selectItem, e){
              this.stop_click(e);
              this.select_list.forEach(val=>{
                if(val.label == column.label){
                  val.val = selectItem.value;
                  val.valString = selectItem.label;
                }
              });
              this.input_sreach = '';
              this.sreach_num = this.select_list.length;
              this.change_sreach_show = true;
              this.input_list = false;
              var _this = this;
              setTimeout("document.getElementById(\"one-input\").focus()", 500);
              setTimeout(function () {
                _this.getHeight();
              });
            },
            // 点击历史记录图标
            look_history(e){
                this.stop_click(e);
                this.localStorage_display=!this.localStorage_display;
            },
            backtime(t){
                let myDate=new Date(t);
                let nt=myDate.getFullYear()+'-'+(myDate.getMonth()>8?'':0)
                    +(myDate.getMonth()+1)+'-'+(myDate.getDate()>9?'':0)
                    + myDate.getDate()+' '
                    +(myDate.getHours()>9?'':'0')+myDate.getHours()+':'
                    +(myDate.getMinutes()>9?'':0)+myDate.getMinutes()+':'
                    +(myDate.getSeconds()>9?'':0)+myDate.getSeconds();
                return nt;
            },
            changeDate(){
                this.dataBackG = false
                this.change_sreach_show = true
                if(this.timeFrame!=[]){
                    this.select_list[this.sreach_num].val = this.backtime(this.timeFrame[0])+' - '+this.backtime(this.timeFrame[1])
                    this.input_sreach = ''
                    this.sreach_num++
                }
            },
            //选择时间计划
            selectSul(name){
                this.change_sreach_show = true;
                this.select_list[this.sreach_num].val = name;
                this.input_sreach = '';
                this.sreach_num++;
                this.getHeight();
            },
            //点击搜索
            select() {
                let objectInfo = {};
                this.change_sreach_show = true;
                this.name = '', this.id = '';
                if (this.input_sreach != '') {
                  this.select_list[this.sreach_num].val = this.input_sreach;
                    this.input_sreach = '';
                    this.sreach_num=this.select_list.length;
                }
                //input有值  默认添加到name中
                if (this.no_condition != '') {
                  let no_condition_bool = false,no_condition_str = '',route = this.$route.path
                    if(this.select_list.length==0){
                      //日志模块新增路由判断
                      if(route == '/Log_SecurityEventLogs'||route == '/Log_ProxyEventLogs'||route=='/Log_SesssionRecords'||route=='/Log_RadiusLogs'){
                        no_condition_str = 'logId';
                      }else if(route == '/Device_DeviceList'){
                        no_condition_str = 'sn';
                      }else if(route=='/system_PolicyConfigurationLog' || route=='/system_LoginLog'){
                        no_condition_str='modifyBy';
                      }else {
                        no_condition_str='name';
                      }
                      if(no_condition_str=='name'){
                        this.select_list.push({name: this.select_title.name, id:2, type:'input',val:this.no_condition,label:'name'});
                        this.searchLabelList.forEach((val,ind)=>{
                          if(val.id == 2){
                            this.searchLabelList.splice(ind,1);
                          }
                        })
                      }else if(no_condition_str=='modifyBy'){
                        this.select_list.push({name: this.select_title.Operator, id:6, type:'input',val:this.no_condition,label:'modifyBy'});
                        this.searchLabelList.forEach((val,ind)=>{
                          if(val.id == 6){
                            this.searchLabelList.splice(ind,1);
                          }
                        })
                      }else if(no_condition_str=='sn'){
                        this.select_list.push({name: this.select_title.SN, id:8, type:'input',val:this.no_condition,label:'sn'});
                        this.searchLabelList.forEach((val,ind)=>{
                          if(val.id == 8){
                            this.searchLabelList.splice(ind,1);
                          }
                        })
                      }else if(no_condition_str=='id'){
                        this.select_list.push({name: this.select_title.Policy_ID, id:1, type:'input',val:this.no_condition,label:'id'});
                        this.searchLabelList.forEach((val,ind)=>{
                          if(val.id == 1){
                            this.searchLabelList.splice(ind,1);
                          }
                        })
                      }else if(no_condition_str=='logId'){ //日志模块新增判断
                        this.select_list.push({  name: 'Log ID',  type: 'input', label: 'Log Id', val:this.no_condition,});
                        this.searchLabelList.forEach((val,ind)=>{
                          if(val.id == 1){
                            this.searchLabelList.splice(ind,1);
                          }
                        })
                      }
                        this.sreach_num++;
                    }else {
                      let no_condition_bool = false,no_condition_str = '',route = this.$route.path,bool = true;
                      if(route == '/Log_SesssionRecords'||route == '/Log_EventLogs'){
                        no_condition_str = 'id';
                      }else if(route == '/Device_DeviceList'){
                        no_condition_str = 'sn';
                      }else if(route=='/system_PolicyConfigurationLog' || route=='/system_UserManagement' || route=='/system_LoginLog'){
                        no_condition_str='modifyBy';
                      }else {
                        no_condition_str='name';
                      }
                        this.select_list.forEach(val => {
                            if(val.label==no_condition_str){
                                bool = false;
                                val.val += ','+this.no_condition;
                            }
                        });
                        if(bool){
                            this.searchLabelList.forEach((val,ind)=>{
                                if(val.label == no_condition_str){
                                  val.val = this.no_condition;
                                  this.select_list.push(val);
                                  this.searchLabelList.splice(ind,1);
                                }
                            });
                            this.sreach_num++;
                        }
                    }
                    this.no_condition = '';
                }
                let labelBool = true;
                this.select_list.forEach(val=>{
                    if (typeof (val.val) !== 'undefined' && val.val) {
                        if(val.type == 'select'){
                            if (val.label == 'alertType' || val.label == 'promType') {
                                objectInfo.type = val.valnum;
                            } else if (val.label == 'assetState') {
                                objectInfo.state = val.valnum;
                            } else if(typeof(val.valnum) == "undefined"||val.valnum == ''){
                                this.selectInfoList[val.label].forEach(item=>{
                                    if(item.label == val.val){
                                        labelBool = false;
                                        objectInfo[val.label] = item.value;
                                    }
                                })
                                if(labelBool){
                                    objectInfo[val.label] = val.val;
                                }
                            }else {
                                objectInfo[val.label] = val.valnum;
                            }
                        } else if(val.type == 'selectSelf'){
                          objectInfo[val.label] = val.valnum;
                        } else if(val.type == 'selectAction'){ //新增日志判断
                          objectInfo[val.label] = val.valnum;
                        } else if (val.type == 'dc') {
                          objectInfo.idcId = val.valnum;
                        } else if (val.type == 'asset') {
                          objectInfo.assetId = val.valnum;
                        } else if (val.type == 'module') {
                          objectInfo.moduleId = val.valnum;
                        } else if (val.type == 'project') {
                          objectInfo.projectId = val.valnum;
                        } else {
                            objectInfo[val.label] = val.val;
                        }
                    }
                });
                this.getHeight()
                //搜索完成后存储在本地历史记录中
                if(this.select_list.length!=0){
                    if (JSON.parse(localStorage.getItem('nz-history-'+this.$route.path)) == undefined || JSON.parse(localStorage.getItem('nz-history-'+this.$route.path)) == []) {
                        this.historyList.unshift(this.select_list);
                        localStorage.setItem('nz-history-'+this.$route.path, JSON.stringify(this.historyList));
                    } else {
                        this.historyList = JSON.parse(localStorage.getItem('nz-history-'+this.$route.path));
                        this.historyList.unshift(this.select_list);
                        if (this.historyList.length > 10) {
                            this.historyList.length = 10;
                        }
                        localStorage.setItem('nz-history-'+this.$route.path, JSON.stringify(this.historyList));
                    }
                }
                this.input_list = true;
                this.restructure_historyDate();

                this.$emit("search", objectInfo);
            },
            //清空历史记录
            clear_history() {
                this.historyList = [];
                this.history_once = [];
                localStorage.setItem('nz-history-'+this.$route.path, JSON.stringify(this.historyList));
            },
            //再次点击之前的历史记录
            select_history(ind,e) {
                this.stop_click(e);
                this.input_list = true;
                this.change_sreach_show = true;
                this.localStorage_display = !this.localStorage_display;
                this.select_list = [];
                JSON.parse(localStorage.getItem('nz-history-'+this.$route.path)).splice(ind,1);
                this.select_list = JSON.parse(JSON.stringify(this.history_once[ind]));
                this.sreach_num = this.select_list.length;
                this.select_list.forEach(val => {
                    this.searchLabelList.forEach((item, index) => {
                        if (val.id == item.id) {
                            this.searchLabelList.splice(index, 1);
                        }
                    })
                });
                this.select()
            },
            // 获取历史记录  数据进行处理以便循环展示
            restructure_historyDate() {
                if (localStorage.getItem('nz-history-'+this.$route.path) !== undefined && localStorage.getItem('nz-history-'+this.$route.path) !== null) {
                    this.history_once = JSON.parse(localStorage.getItem('nz-history-'+this.$route.path));
                }
            },
            clear_search_list(e){
                var keyCode = window.event ? e.keyCode : e.which;
            },
            //监听输入框鼠标抬起事件
            enter_one(e){
                var keyCode = window.event ? e.keyCode : e.which;
                if(keyCode == 40){
                    if(this.searchStyleNum<this.searchLabelList.length-1){
                      var disabledNum = 0;
                      this.searchLabelList.forEach(val=>{
                        if(val.disabled){
                          disabledNum++;
                        }
                      });
                      this.isSearchNum=this.searchStyleNum;
                      this.isSearchNum++;
                      if(!(this.searchLabelList[this.isSearchNum].disabled)){
                        this.searchStyleNum++;
                      }else {
                        this.searchStyleNum+=disabledNum+1;
                      }
                    }
                    if(this.searchStyleNum>=7){
                      document.getElementById('input_list').scrollTop+=28;
                    }
                }
                if(keyCode == 38){
                  if(this.searchStyleNum>=0){
                    var disabledNum = 0;
                    this.searchLabelList.forEach(val=>{
                      if(val.disabled){
                        disabledNum++;
                      }
                    })
                    this.isSearchNum=this.searchStyleNum;
                    if(this.isSearchNum>0){
                      this.isSearchNum--
                    }
                    if(!(this.searchLabelList[this.isSearchNum].disabled)){
                      this.searchStyleNum--
                    }else {
                      this.searchStyleNum-=disabledNum+1
                    }
                  }
                  if(this.searchStyleNum<=this.searchLabelList.length-8){
                    document.getElementById('input_list').scrollTop -= 28
                  }
                }
                if(this.no_condition==''){
                    if(!this.keyBool){
                        if(keyCode==8){
                            let arr = this.select_list
                            if(!this.delBool){
                                if(this.input_sreach==''){
                                    for(var i = arr.length-1 ; i>=0 ; i--){
                                        this.input_list = true
                                        this.change_sreach_show = false
                                        this.sreach_num = i
                                        this.input_sreach = arr[i].val
                                        setTimeout("document.getElementById(\"sreach_input\").focus()", 500);
                                        this.delBool = true
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if (keyCode == 13) {
                    if(this.searchStyleNum<=0){
                        this.select()
                    }else {
                        let val = this.searchLabelList[this.searchStyleNum].name,
                            ind = this.searchStyleNum,
                            id= this.searchLabelList[this.searchStyleNum].id,
                            type= this.searchLabelList[this.searchStyleNum].type,
                            label= this.searchLabelList[this.searchStyleNum].label,
                          disabled= this.searchLabelList[this.searchStyleNum].disabled
                        this.searchStyleNum = -1
                        this.select_name(val, ind, id, type,label,disabled)
                    }

                }
            },
            // input框监听是按删除还是回车
            enter(val, e) {
              var keyCode = window.event ? e.keyCode : e.which;
              if(val == 'ID'&&keyCode == 13){
                let id = /^[0-9]*$/
                if (!id.test(this.input_sreach) || this.input_sreach > 2147483647) {
                  //如果有不正确的值 进行删除
                  this.input_sreach = ''
                  this.$message.error(this.other.delErrorId)
                  return false;
                }
              }
              if(keyCode!==8){
                this.delBool = false
                this.delcriteriaBool = false
              }
               if(this.delBool){
                   if(keyCode==8){
                       if(this.input_sreach==''){
                           this.searchMsg.searchLabelList.forEach((val, k) => {
                               if (this.select_list[this.sreach_num].id == val.id) {
                                   this.searchLabelList.splice(k + 1, 0, val)
                                 this.Iskeywords(this.sreach_num)
                               }
                           })
                           this.select_list.splice(this.sreach_num, 1)
                           this.change_sreach_show=true
                           setTimeout("document.getElementById(\"one-input\").focus()", 500);
                           this.input_list = false
                           this.delBool = false
                       }
                   }
               }else {
                   if(keyCode==8){
                       if(this.delcriteriaBool){
                           this.searchMsg.searchLabelList.forEach((val, k) => {
                               if (this.select_list[this.sreach_num].id == val.id) {
                                   this.searchLabelList.splice(k + 1, 0, val)
                                 this.Iskeywords(this.sreach_num)
                               }
                           })
                           this.select_list.splice(this.sreach_num, 1)
                           this.change_sreach_show=true
                           setTimeout("document.getElementById(\"one-input\").focus()", 500);
                           this.input_list = false
                           this.delcriteriaBool = false
                       }else {
                           if(this.input_sreach==''){
                               this.delcriteriaBool = true
                           }
                       }
                   }

               }

               if(keyCode == 38||keyCode == 40){
                   if(this.select_list[this.sreach_num].type !== 'select'){
                     if(this.input_sreach!==''){
                       this.zhezhao_click()
                       setTimeout("document.getElementById(\"one-input\").focus()", 500);
                       this.input_list = false
                     }
                   }else {
                     if(keyCode == 40){
                       this.selectInfo = true
                       if(this.search_select_style_num<this.selectInfoList[this.select_list[this.sreach_num].label].length-1){
                         this.search_select_style_num++
                       }
                     }
                     if(keyCode == 38){
                       this.selectInfo = true
                       if(this.search_select_style_num>=0){
                         this.search_select_style_num--
                       }
                     }
                   }
               }else if(keyCode == 13) {
                 this.searchMsg.zheze_none = true
                 //回车键
                 if (!this.selectInfo) {
                   this.select()
                 }else {
                   this.selectInfo  = false
                   this.tr_selectInfo(this.select_list[this.sreach_num].label, this.selectInfoList[this.select_list[this.sreach_num].label][this.search_select_style_num].label, this.selectInfoList[this.select_list[this.sreach_num].label][this.search_select_style_num].value, e)
                 }
               }
            },
            // 清空已输入的搜索条件
            clear_input(e) {
                this.stop_click(e)
                this.no_condition = ''
                this.input_sreach = ''
                this.select_list = []
                this.searchLabelList = [{id: 0, name: 'Press Enter or click to search', icon: 'el-icon-search'},]
                JSON.parse(JSON.stringify(this.searchMsg.searchLabelList)).forEach(val => {
                    this.searchLabelList.push(val)
                })
              this.$nextTick(() => {
                this.$refs.searchScrollbar.update();
              });
            },
            //修改已有参数
            update_sreach(ind,e) {
                //if(this.select_list[ind].id==6||this.select_list[ind].id==28){
                if(false){
                    this.sreach_num = ind
                    this.downBool = false
                    this.change_sreach_show = false
                    this.input_list = true
                }else {
                    this.input_list = true
                    this.change_sreach_show = false
                    this.sreach_num = ind
                    this.input_sreach = this.select_list[ind].val
                    if(this.select_list[ind].type=='input'){
                        this.downBool = true
                    }else {
                        this.downBool = false
                    }
                    setTimeout("document.getElementById(\"sreach_input\").focus()", 50);
                    this.getHeight()
                    this.searchMsg.zheze_none = false
                }
            },
            //删除要搜索的条件
            close_selcet_list(ind, e){
                if (e) {
                  this.stop_click(e)
                }
                // 处理alertType--asset联动问题：删除alertType时，将asset也删除
                /*if (this.select_list[ind].label == 'alertType') {
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
                }*/
                console.log(ind)
                this.searchMsg.searchLabelList.forEach((val, key) => {
                    if (this.select_list[ind].id == val.id) {
                        this.searchLabelList.splice(key , 1, val);
                        this.Iskeywords(ind)
                    }
                });
                this.select_list.splice(ind, 1);
                this.sreach_num--;
            },
            //阻止冒泡事件
            stop_click(e) {
                if (e) {
                  e.cancelBubble = true;
                  e.stopPropagation();
                }
            },
            //点击遮罩层
            zhezhao_click() {
                if(this.input_sreach!=''){
                  if(!this.searchMsg.zheze_none){
                    if (this.input_sreach!='') {
                      this.change_sreach_show = true
                      let IDsplit,
                        id = /^[0-9]*$/,
                        bool = true
                      if (this.select_list[this.sreach_num].id == 1) {
                        //id==1  判断是不是搜索ID    如果是ID 会出现搜索多个ID  分割ID
                        IDsplit = this.input_sreach.split(',')
                        //循环分割出来的ID  判断输入的每个ID是否正确
                        for (let i = IDsplit.length - 1; i >= 0; i--) {
                          if (!id.test(IDsplit[i]) || IDsplit[i] > 2147483647) {
                            //如果有不正确的值 进行删除
                            IDsplit.splice(i, 1)
                            this.$message.error(this.other.delErrorId)
                          }
                          if (IDsplit[i] == '') {
                            IDsplit.splice(i, 1)
                          }
                        }
                        this.input_sreach = ''
                        //从新拼接ID内容
                        IDsplit.forEach(val => {
                          this.input_sreach += val + ','
                        })
                        this.input_sreach = this.input_sreach.substr(0, this.input_sreach.length - 1)
                        if(this.input_sreach!=''){
                          this.select_list[this.sreach_num].val = this.input_sreach
                          this.input_sreach = ''
                          this.sreach_num++
                          this.sreach_num = this.select_list.length
                        }else {
                          this.sreach_num = 0
                          this.change_sreach_show = false
                        }
                      }else {
                        this.select_list[this.sreach_num].val = this.input_sreach
                        this.input_sreach = ''
                        this.sreach_num = this.select_list.length
                      }
                    }else {
                      let Bool = false
                      this.select_list.forEach(val=>{
                        if(val.val==''||val.val==undefined){
                          Bool = true
                        }
                      })
                      if(Bool){
                        this.sreach_num = this.select_list.length-1
                      }else {
                        this.sreach_num = this.select_list.length
                      }

                    }
                    if (this.no_condition != '') {
                      this.change_sreach_show = true
                      if(this.select_list.length==0){
                        this.select_list.push({name: 'Name', id:2, type:'input',val:this.no_condition,label:'name'})
                        this.searchLabelList.forEach((val,ind)=>{
                          if(val.id == 2){
                            this.searchLabelList.splice(ind,1)
                          }
                        })
                        this.sreach_num++
                      }else {
                        let bool = true
                        this.select_list.forEach(val => {
                          if(val.id==2){
                            bool = false
                            val.val += ','+this.no_condition
                          }
                        })
                        if(bool){
                          this.select_list.push({name: 'Name', id:2, type:'input',val:this.no_condition,label:'name'})
                          this.searchLabelList.forEach((val,ind)=>{
                            if(val.id == 2){
                              this.searchLabelList.splice(ind,1)
                            }
                          })
                          this.sreach_num++
                        }
                      }
                      this.no_condition = ''
                      this.sreach_num = this.select_list.length
                    }
                    setTimeout("document.getElementById(\"one-input\").focus()", 500);
                    this.input_list = !this.input_list
                    var _this = this
                    setTimeout(function () {
                      _this.getHeight()
                    },)
                    this.searchMsg.zheze_none = true
                  }
                }

            },
            //点击搜索框  显示搜索类型
            read_input(e) {
                e.cancelBubble = true;
                e.stopPropagation();
                this.getHeight();
                this.input_list = !this.input_list;
                this.getSelectPosition(e);
            },
            //点击选择 搜索类型
            select_name(val, ind, id, type,label,disabled,e ) {
                // if(id==43||id==45||id==48){  //根据id判断是否开启ip验证
                //     this.select_conditionsName=true
                // }
              if(type=='input'){
                this.downBool = true;
              }else {
                this.downBool = false;
              }
              this.no_condition = '';
              this.searchMsg.zheze_none = false;
              if(!disabled){
                if (ind == 0) {
                  this.select()
                }else if(id == 7){
                  this.searchLabelList.splice(ind, 1)
                  this.select_list.push({
                    name: val,
                    id:id,
                    type:type,
                    label:label,
                    disabled:disabled
                  })
                  this.change_sreach_show = false
                  this.input_list = !this.input_list
                }else if(id==29){
                  this.searchLabelList.splice(ind, 1)
                  this.select_list.push({
                    name: val,
                    id:id,
                    type:type,
                    label:label,
                    disabled:disabled
                  })
                  this.change_sreach_show = false
                  this.sreach_num = this.select_list.length-1
                  this.input_list = !this.input_list
                  setTimeout("document.getElementById(\"sreach_input\").focus()", 500);
                 /* this.searchLabelList.forEach(val=>{
                    if(val.id==30||val.id==31||val.id==32||val.id==33){
                      val.disabled = true
                    }
                  })

                }else if(id==30||id==31||id==32||id==33){
                  this.searchLabelList.splice(ind, 1)
                  this.select_list.push({
                    name: val,
                    id:id,
                    type:type,
                    label:label,
                    disabled:disabled
                  })*/
                  this.change_sreach_show = false
                  this.sreach_num = this.select_list.length-1
                  this.input_list = !this.input_list
                  setTimeout("document.getElementById(\"sreach_input\").focus()", 500);
                  /*this.searchLabelList.forEach(val=>{
                    if(val.id==29){
                      val.disabled = true
                    }
                  })*/
                }else {
                  this.searchLabelList.splice(ind, 1);
                  this.select_list.push({
                    name: val,
                    id:id,
                    type:type,
                    label:label,
                    disabled:disabled
                  });
                  this.change_sreach_show = false;
                  this.sreach_num = this.select_list.length-1;
                  this.input_list = !this.input_list;
                   if(id!==6&&id!==28){
                       setTimeout("document.getElementById(\"sreach_input\").focus()", 500);
                   }
                }
                var _this = this
                setTimeout(function () {
                  _this.getHeight()
                },)

                // console.info(e.target.parentElement.parentElement.parentElement.getBoundingClientRect());
              }
            },
            /*计算select弹框的位置*/
            getSelectPosition(e) {
              let inputListDom = this.getDomFromParents(e.target, 'input-center-box', 0);
              if (inputListDom) {
                if (this.inTransform) {
                  this.selectDom.top = "36px";
                } else {
                  let position = inputListDom.getBoundingClientRect();
                  this.selectDom.top = position.top+36+'px';
                }
              }
            },
            /*递归向上获取指定class的dom*/
            getDomFromParents(dom, className, level) {
              let parentClassNames = dom.parentElement.className;
              if (parentClassNames.indexOf(className) == -1) {
                if (level < 20 && dom.parentElement) { //限制20层，避免溢出
                  return this.getDomFromParents(dom.parentElement, className, ++level);
                } else {
                  return false;
                }
              } else {
                return dom.parentElement;
              }
            },
            // 判断输入框的高度
            getHeight(){
                if(document.getElementById('search-ul').clientHeight<24||document.getElementById('input-center-box').clientHeight<24){
                  document.getElementById('input-center-box').style.height = 27+'px'
                  document.getElementById('search-ul').style.height = 21+"px"
                }
          },
            chlick_sreach(e) {
                this.stop_click(e)
                this.searchMsg.zheze_none = false
            },
            // 时间计划
            schelistget(){
              this.schlist = []
                this.$get("/schedule", this.schedata).then(data => {
                    if (data.code == 200) {
                        this.schlist = data.data.list
                    }
                })

            },
        },
        mounted() {
            /*this.defaultItem ? this.select_list.push({name:this.defaultItem,label:this.defaultItem}) : '';
            this.defaultValue != '' ? this.no_condition=this.defaultValue:'';*/
            this.restructure_historyDate();
            setTimeout(() => {
              if(this.$route.path=='/Objects_Objects'){
                this.schelistget();
              }
              if (this.$route.path == '/promServer') {
                this.getDcData();
              }
              if (this.$route.path == '/project' || this.$route.path == '/alertList' || this.$route.path == '/alertConfig') {
                this.getAssetData();
              }
              if (this.$route.path == '/alertList') {
                this.getProjectData();
                this.getModuleData();
              }
              if (this.$route.path == '/asset') {
                this.getModelData();
              }
            }, 1000);
            JSON.parse(JSON.stringify(this.searchMsg.searchLabelList)).forEach(val => {
              if(val.name=='Protocol'){
                  this.schemaTypeSelect=val.doc.data
              }
              if(val.prop=='common_action'){
                this.actionSelect=val.doc.data
              }
              this.actionSelect.forEach((item)=>{
                  item.id=item.code;
                  item.label=val.label;
                  item.name=val.label;
              });
              this.searchLabelList.push(val);
            });
            var _this = this;
            document.onkeydown=function(event) {
                var e = event || window.event || arguments.callee.caller.arguments[0];
                if(e.keyCode==27){
                    _this.close_search(e)
                }
            }
        }
    }
</script>

<style scoped lang="scss">

    .new-search{
        display: flex;
        position: relative;
        line-height: 25px;
      border-radius: 4px;
      border: 1px solid #D8D8D8;
      /*box-shadow: inset 0 0 5px 0 rgba(184,184,184,0.80);*/
    }
    .new-search .nz-btn {
      box-shadow: 0 0 1px 1px #d8d8d8;
      border-radius: 0 4px 4px 0;
    }
    .new-search .search-input-all{
        width: 231px !important;
        min-width: 231px;
        background-color: $content-right-background-color;
        color: rgba(0,0,0,.55);
        height: 24px;
        line-height: 24px;
        border-bottom-left-radius: 5px;
        border-top-left-radius: 5px;
        display: flex;
        position: relative;
    }
    input {
        background-color: $content-right-background-color;
    }
    .search-input-all .btn-retract{
        padding: 0px 4px;
        text-align: center;
    }
    .search-input-all .search-history{
        padding: 0px 7px;
        height: 16px;
        line-height: 16px;
        text-align: center;
        border-right: 1px solid #e5e5e5;
        margin-top: 4px;
        position: relative;
    }
    .search-input-all .input-center-box{
        flex: 1;
        height: 100%;
        overflow: hidden;
    }
    /*.input-center-box::-webkit-scrollbar {
        width: 4px;
        height: 6px;
    }
    .input-center-box::-webkit-scrollbar-thumb {
        border-radius: 3px;
        -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
        background: rgba(0,0,0,0.2);
    }
    .input-center-box::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
        border-radius: 0;
        background: rgba(0,0,0,0.1);
    }*/
    .search-input-all .clear-search{
        padding: 0 5px;
        text-align: center;
        font-size: 12px;
    }
    .dataBackG{
        background: #f0f0f0;
    }
    .none{
        display: none !important;
    }
    .new-search-btn {
      padding: 0 4px;
      cursor: pointer;
    }
    .search-text{
        display: inline-block;
        margin-right: 20px;
    }
    .sreach_box{
        position: relative;
        width: 80%;
        height: 25px;
        padding: 20px;
        background: #fff;
        margin: 200px auto;
    }
    .keyring_sreach_right_btn{
        width: 18%;
        height: 25px;
        float: right;
        line-height: 25px;
        text-align: center;
        border: 1px solid #dfdfdf;
    }
    .keyring_sreach_right_btn .right-btn-group{
        float: left;
        width: 80%;
        border-right: 1px solid #dfdfdf;
        box-sizing: border-box;
    }
    .keyring_sreach_right_btn .right-btn-icon{
        float: left;
        width: 19%;
    }
    .sreach_box .close_zhezhao{
        position: absolute;
        right: 0;
        top: -50px;
        width: 24px;
        height: 25px;
        border-radius: 50%;
        background: #fff;
        text-align: center;
        line-height: 28px;
        font-size: 12px;
    }

    .localStorage_list_box{
        position: absolute;
        left: 10px;
        top: 36px;
        width: auto;
        min-width:250px;
        max-width: 350px;
        height: auto;
        border: 1px solid #dfdfdf;
        background: #fff;
        color: #2e2e2e;
        text-align: left;
        border-radius: 3px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 9999;
        font-size: 12px;
    }
    .localStorage_list_box .list_box_title{
        width: 100%;
        height: 40px;
        line-height: 40px;
        line-height: 40px;
        text-align: center;
        position: relative;
        border-bottom: 1px solid #dfdfdf;
        color: #2e2e2e;
    }
    .localStorage_list_box .list_box_title i{
        position: absolute;
        right: 10px;
        top: 5px;
    }
    .localStorage_list_box .list_box_content{
        text-align: left;
        padding: 5px 0;
        box-sizing: border-box;
        border-bottom: 1px solid #dfdfdf;
    }
    .localStorage_list_box ul li{
        padding: 5px 10px;
        line-height: 20px;
    }
    .localStorage_list_box ul li:hover{
        background: #f0f0f0;
        cursor:pointer;
    }

    .localStorage_list_box ul li span{
        color: #2e2e2e;
    }
    .localStorage_list_box ul li .value{
        font-weight: 600;
    }
    .localStorage_list_box .list_box_clear{
        padding-left: 10px;
        line-height: 40px;
    }
    .localStorage_list_box .list_box_clear:hover{
        background: #f0f0f0;
        cursor:pointer;
    }
    .input-center-box .sreach_fixe_left{
        width: auto;
        display: flex;
        height: 100%;
        min-width: 100%;
    }
    .sreach_list{
        display: flex;
        justify-content:flex-start;
        height: 100%;
        padding-left: 10px;
    }
    .sreach_fixe_left .selectinfo_box{
        display: flex;
        flex-shrink: 0;
        width: auto;
        height: auto;
        margin: 3px 2px;
        font-size: 12px;
    }
    .selectinfo_box .select_condition{
        float:left;
        height: 13px;
        padding: 3px;
        background:#f8f8f8;
        line-height: 13px;
        color: rgba(0,0,0,.55);
    }
    .selectinfo_box .select_content{
        float: left;
        line-height: 13px;
        height: 13px;
        padding: 3px;
        background: #f0f0f0;
        color: rgba(0,0,0,0.85);
        display: flex;
    }
    .selectinfo_box .select_content>span {
      max-width: 100px;
      display: inline-block;
      white-space: nowrap;
      word-break: break-all;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .select_input{
        height: 100%;
        flex: 1;
        float: left;
        width: 100px;
    }
    .select_input input{
        width: calc(100% - 1px);
        height: 100%;
        border: none;
        float: left;
        padding-left: 5px !important;
        box-sizing: border-box;
    }
    .select_input input:focus {
        border:none;
        box-shadow:none;
    }
    .select_input .select_info_list{
        position: fixed;
        /*left: 100px;
        top: 36px;*/
        width: auto;
        max-height: 240px;
        padding: 5px 0;
        background: #fff;
        border: 1px solid #e5e5e5;
        border-radius: 3px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        overflow-y: auto;
        z-index: 9999;
        right: 139px;
    }
    .select_info_list ul li{
        padding: 5px 10px;
        line-height: 20px;
        text-overflow: ellipsis;
        width: 150px;
        word-break: break-all;
        white-space: nowrap;
        overflow: hidden;
    }
    .select_info_list ul li:hover{
        background: #f0f0f0;
        cursor: pointer;
    }
    .sreach_input .input{
        flex: 1;
        height: 100%;
        padding-left: 10px !important;
        box-sizing: border-box;
        position: relative;
    }
    .sreach_input .input input{
        width: 100%;
        height: 100%;
        border: none;
        padding: 0 !important;
        float: left;
    }
    .sreach_box input:focus {
        outline: none;
        border-color: transparent;
        box-shadow: none;
    }
    .sreach_input input::placeholder{
        color: rgba(0,0,0,0.55)
    }
    .input_list{
        position: fixed;
        /*left: 47px;
        top: 36px;*/
        width: auto;
        max-width: 400px;
        max-height: 240px;
        min-width: 300px;
        background: #fff;
        border-radius: 3px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 9;
        overflow-y: auto;
        font-size: 12px;
    }
    .input_list ul{
        padding: 4px 0;
    }
    .input_list ul li{
        padding: 4px 10px;
        line-height: 16px;
        height: 20px;
    }
    .input_list ul li:hover{
        background: #f0f0f0;
        cursor:pointer;
    }
    .search-style-ind{
        background: #f0f0f0;
        cursor:pointer;
    }
    .sreach_fixe>i{
        margin-right: 15px;
    }
    .is-disabled{
        color: #C0C4CC;
        cursor: not-allowed !important;
        background: #fff !important;
    }
    li {
        list-style: none;
    }
</style>
