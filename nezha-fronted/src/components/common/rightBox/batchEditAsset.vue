<template>
  <div class="right-box right-box-asset" v-clickoutside="{obj:editAsset,func:clickOutside}">
    <!--顶部按钮-->
    <!--<div class="right-box-top-btns right-box-form-delete">-->
    <!--<button v-if="editAsset.id" type="button" @click="del" id="asset-edit-del"-->
    <!--class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-min-width-82">-->
    <!--<span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>-->
    <!--<span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>-->
    <!--</button>-->
    <!--</div>-->

    <div class="right-box-title">{{$t("asset.batchEditAsset")}}</div>

    <div class="right-box-form-box" ref="scrollbar">
      <el-form ref="assetEditForm" :model="editAsset" label-width="120px" class="right-box-form right-box-form-left"
               :rules="rules">
        <!--assets-->
        <div class="right-box-form-row right-child-boxes">
          <div class="right-child-box assets-box">
            <!--begin--标题-->
            <div class="right-child-box-title">{{$t('asset.asset')}}</div>
            <!--end--标题-->
            <!--begin--搜索框-->
            <div style="float: right;padding: 9px 9px 0 0;">
              <div class="nz-btn-group nz-btn-group-size-small nz-btn-group-light endpoint-asset-search"
                   style="margin: 0">
                <button id="search-asset-drop" type="button"
                        class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-prepend"
                        @click="assetSearch.dropdownShow = !assetSearch.dropdownShow">
                  <span class="endpoint-asset-label-txt">{{assetSearch.label}}</span>
                  <span>
                    <i v-if="assetSearch.dropdownShow" class="nz-icon nz-icon-caret-up"></i>
                    <i v-if="!assetSearch.dropdownShow" class="nz-icon nz-icon-caret-bottom"></i>
                  </span>
                </button>
                <el-input style="width: 100px;" @keydown.enter.native="searchAssetKeydown" id="batch-edit-search-input"
                          class="input-x-mini-24 nz-input-group-middle" placeholder=""
                          v-model="assetSearch.text"></el-input>
                <button
                  type="button"
                  class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square nz-input-group-append"
                  id="search-asset"><i @click="searchAsset" class="nz-icon nz-icon-search"></i></button>

                <div class="endpoint-asset-search-dropdown" v-if="assetSearch.dropdownShow">
                  <div @click="dropdownSelect('Host')" class="endpoint-asset-search-dropdown-item" id="search-asset-ip">
                    Host
                  </div>
                  <div @click="dropdownSelect('SN')" class="endpoint-asset-search-dropdown-item" id="search-asset-sn" >
                    SN
                  </div>
                </div>
              </div>
            </div>
            <!--end--搜索框-->

            <!-- begin--table-->
            <div class="endpoint-sub-table">
              <div class="endpoint-sub-table-head">
                <div class="endpoint-sub-table-col" style="width: 15px;">
                  <el-checkbox v-model="assetListAll" :indeterminate="assetListHalf" id="batch-edit-select-all"
                               @change="assetListSelAll"></el-checkbox>
                </div>
                <div class="endpoint-sub-table-col">Host</div>
                <div class="endpoint-sub-table-col">SN</div>
              </div>
              <div class="line-100"></div>
              <div class="endpoint-sub-table-body">
                <div ref="assetScrollbar" style="height: 100%; overflow: auto;">
                  <div :data="item.id" v-for="item,index in assetList" class="endpoint-sub-table-row"
                       :id="'select-asset-'+item.id">
                    <div class="endpoint-sub-table-col" style="width: 15px;">
                      <el-checkbox v-model="item.sel" @change="selectAsset" id="batch-edit-select-one"></el-checkbox>
                    </div>
                    <div class="endpoint-sub-table-col" style="width: 50%">{{item.host}}</div>
                    <el-popover trigger="hover" placement="right-start" :content="item.sn">
                      <div slot="reference" class="endpoint-sub-table-col" style="width: calc(50% - 55px)">{{item.sn}}
                      </div>
                    </el-popover>
                  </div>
                </div>
              </div>
            </div>
            <div class="line-100" style="border-color:#dcdfe6"></div>
            <div>
              <button type="button" @click="addToEndpointList" id="batch-edit-add-list"
                      class="nz-btn nz-btn-size-small-new nz-btn-style-light-new endpoints-clear-btn"
              style="margin-top: 3px;">
                {{$t('overall.addAssetList')}}
              </button>
              <span style="display: inline-block; font-size: 14px; float: right;padding-right: 15px;margin-top: 3px;">All: {{this.assetList.length}}</span>
            </div>
            <!--end--table-->
          </div>
          <!--右侧endpoint列表-->
          <div class="right-child-box endpoints-box endpoints-box-snmp">
            <div class="endpoints-box-module-info">
              <div class="title">{{$t('asset.selectAsset')}}</div>
            </div>
            <!--endpoints-->
            <div class="endpoints-box-endpoints" :style="{borderColor: endpointTouch ? paramBorderColor : '#dcdfe6'}">
              <el-table
                :data="assetSelList"
                ref="endpointTable"
                style="width: 100%;border-radius: 4px;"
                height="calc(100% - 36px)"
                :row-class-name="setRowIndex"
                empty-text=" ">
                <el-table-column
                  type="selection"
                  width="25"
                  style="padding: 0 1px;">
                </el-table-column>
                <el-table-column
                  label-class-name="endpoints-box-endpoints-title"
                  v-for="(title, index) in endpointTableTitle"
                  v-if="title.show"
                  :width="title.width"
                  :key="`col-${index}`"
                  :label="title.label"
                >
                  <template slot-scope="scope" :column="title">
                     <span v-if="title.prop == 'host'">
                      <span v-if="!scope.row.isEdit">{{scope.row.host}}</span>
                      <span @mousedown.stop v-else>
                        <el-form-item :prop="'assetSelList[' + scope.row.index + '].host'"
                                      :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}">
                          <el-input class="endpoint-info input-x-mini-22" v-model="scope.row.host"></el-input>
                        </el-form-item>
                      </span>
                    </span>
                    <span v-if="title.prop == 'sn'">
                     <el-popover trigger="hover" placement="right-start" :content="scope.row.sn">
                      <div slot="reference"
                           style="width: 100%;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;"> {{scope.row.sn}}</div>
                    </el-popover></span>
                  </template>
                </el-table-column>
                <!--<el-table-column label="" width="56">-->
                <!--<template slot-scope="scope" :column="title">-->
                <!--<div>-->
                <!--<span :id="'ep-asset-toedit-'+scope.row.assetId" v-if="!scope.row.isEdit" class="endpoint-box-row-symbol" @mousedown.stop @click="toEditEndpoint(scope.row)"><i class="el-icon-edit-outline"></i></span>-->
                <!--<span :id="'ep-asset-edit-'+scope.row.assetId" v-else class="endpoint-box-row-symbol" @mousedown.stop @click="editEndpoint(scope.row)"><i class="nz-icon nz-icon-check"></i></span>-->
                <!--&lt;!&ndash;<span :id="'ep-asset-remove-'+scope.row.assetId" class="endpoint-box-row-symbol" @click="removeEndpoint(scope.row)"><i class="nz-icon nz-icon-shanchu1"></i></span>&ndash;&gt;-->
                <!--</div>-->
                <!--</template>-->
                <!--</el-table-column>-->
              </el-table>
              <div class="el-form-item__error"
                   :style="{opacity: endpointTouch && this.assetSelList.length == 0 ? '1' : '0'}"
                   style="left: unset; transition: all .2s">{{$t('validate.required')}}
              </div>
              <div>
                <button id="clear-select-asset" type="button" @click="clearSelection"
                        class="nz-btn nz-btn-size-small-new nz-btn-style-light-new endpoints-clear-btn">
                  {{$t('overall.clear')}}
                </button>
                <span
                  style="display: inline-block; font-size: 14px; float: right;line-height: 35px;padding-right: 15px;">All: {{this.assetSelList.length}}</span>
              </div>
            </div>
          </div>
        </div>
        <!--tag-->
        <div class="right-box-sub-title">{{$t('overall.tag')}}
          <div class="right-box-form-btns">
            <button style="display: none;">第一个button会出现意料之外的hover样式，找不到原因，只好加个不可见的button规避问题</button>
            <button id="module-add-param" type="button" @click="addTag">
           <span class="create-square-box">
              <i style="font-size: 17px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i>
            </span>
            </button>
          </div>
        </div>
        <div class="right-box-line"></div>
        <el-form-item :label-width="'0px'">
        <div class="tag-edit-box">
          <div class="tag-edit-box-head">
            <div class="tag-edit-tag">Tag</div>
            <div class="tag-edit-value">Value</div>
            <div class="tag-edit-action">Action</div>
          </div>
          <div ref="tagEditBoxScrollbar" style="height: calc(100% - 32px); overflow: auto;" id="batch-edit-tags-box">
            <div class="tag-edit-box-body" v-for="(item, index) in editAsset.tags">
              <el-form-item class="tag-edit tag-edit-tag" :label-width="'0px'"
                            :rules="{required: true, message: $t('validate.required'), trigger: 'change'}"
                            :prop="'tags.' + index + '.tag'">
                <el-autocomplete placeholder="tag" size="mini" v-model="item.tag" :fetch-suggestions="filterKey"
                                 @blur="loadValues(item)" @select="loadValues"
                                 popper-class="no-style-class"></el-autocomplete>
              </el-form-item>
              <el-form-item class="tag-edit tag-edit-value" :label-width="'0px'"
                            :rules="{required: true, message: $t('validate.required'), trigger: 'change'}"
                            :prop="'tags.' + index + '.value'">
                <el-autocomplete placeholder="value" size="mini" v-model="item.value" :fetch-suggestions="filterValue"
                                 popper-class="no-style-class"></el-autocomplete>
              </el-form-item>
              <div class="param-box-row-symbol tag-edit-action" :id="'asset-tag-remove-'+index" @click.stop="removeTag(index)"><i
                class="nz-icon nz-icon-shanchu1" style="color: #666666"></i></div>
            </div>
          </div>
        </div>
        </el-form-item>
        <!--<div class="right-box-sub-title">{{$t('asset.location')}}</div>-->
        <!--<div class="right-box-line"></div>-->
        <!------------------------------------------IDC---------------------------------------------->
        <!--cli-->
        <div class="right-box-sub-title">{{$t('config.account.account')}}
          <el-popover placement="right" width="70" trigger="click" :disabled="editAsset.accounts.length == 3"
                      v-model.sync="showAccountOp" popper-class="no-style-class">
            <button slot="reference" id="add-type" type="button" class="float-right"
                    :class="{'nz-btn-disabled': editAsset.accounts.length == 3}">
              <span><i class="nz-icon nz-icon-create-square"></i></span>
            </button>
            <ul class="el-select-dropdown__list" >
              <li @click="addAccount(type)" v-for="(type, index) in selectableAccountTypes" :key="index" :id="'batch-edit-account-'+type"
                  class="el-select-dropdown__item"><span>{{type}}</span></li>
            </ul>
          </el-popover>
        </div>
        <div class="right-box-line"></div>
        <div class="nz-tab" style="padding-left: 70px;">
          <div class="nz-tab-item-box" v-for="(account, index) in editAsset.accounts" :key="index"
               @click="changeProtocolType(account.protocol)" :id="`account-login-type-${index}`">
            <div class="nz-tab-item" :class="{'nz-tab-item-active': accountType == account.protocol}"
                 style="position: relative;">
              <span>{{account.protocol}}</span>
              <transition name="el-zoom-in-top">
                <div v-if="errorProtocol.indexOf(account.protocol) > -1" class="nz-tab-error el-form-item__error">
                  Required
                </div>
              </transition>
            </div>&nbsp;
            <span class="nz-tab-item-close" @click.stop="removeAccount(index)"><i
              class="nz-icon nz-icon-circle-close"></i></span>
          </div>
        </div>
        <account-config-box v-for="(account,index) in editAsset.accounts" :account="account"
                            v-show="account.protocol == accountType" :key="index" ref="accountConfigBox"
                            @setValidateResult="setAccountValidResult"
                            @protocol-type-change="protocolTypeChange"></account-config-box>
      </el-form>
    </div>

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button v-cancel="{obj:editAsset,func:esc}" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" id="asset-edit-cancel">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="asset-edit-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
  import accountConfig from '../../page/asset/accountConfig';
  import {host} from '../js/validate';
  import {port} from '../js/validate'
  import locationCascader from "./locationCascader";

  export default {
    name:"batchEditAsset",
    components:{
      'account-config-box':accountConfig,
      'location-cascader':locationCascader,
    },
    watch:{
      assetSelList(n,o){
        this.endpoint.assetSelList=n;
        if(n.length>0){
          this.paramBorderColor='#dcdfe6';
        }else{
          this.paramBorderColor='#F56C6C';
        }
      },
    },
    data(){
      return {
        editAsset:{
          assetIds:[],
          tags:[],
          accounts:[],
        },
        assetSelList:[],
        assetList:[],
        assetListAll:false,
        assetListHalf:false,
        assetSearch:{host:'',sn:'',text:'',label:'Host',dropdownShow:false}, //侧滑框中asset的搜索相关
        assetPageObj:{pageNo:1,pageSize:-1},
        endpointTouch:false,
        paramBorderColor:'#dcdfe6',
        endpointTableTitle:[
          {
            label:this.$t("project.endpoint.asset"),
            prop:'asset',
            width:121,
            show:false,
          },{
            label:this.$t("project.endpoint.host"),
            prop:'host',
            width:121,
            show:true,
          },{
            label:"SN",
            prop:'sn',
            show:true,
          },{
            label:this.$t("project.endpoint.port"),
            prop:'port',
            width:54,
            show:false,
          },{
            label:this.$t("project.endpoint.param"),
            prop:'param',
            width:90,
            show:false,
          },{
            label:this.$t("project.endpoint.path"),
            prop:'path',
            width:66,
            show:false,
          }
        ],
        endpoint:{projectId:'',moduleId:'',assetSelList:[]},
        rightBox:{model:{show:false}},
        modelData:[],
        dcData:[],
        assetTypeData:[],
        cabinetData:[],
        vendorAndModelOptionData:[], //厂商型号下拉框选择数据

        showAccountOp:false,
        errorProtocol:[], //校验不通过的account
        selectableAccountTypes:["SSH","TELNET","SNMP"],

        modelSize:1,
        locationInfo:null,

        accountType:'',
        model:{},
        blankModel:{
          id:'',
          name:'',
          vendor:{id:'',value:'',code:'',type:''},
          type:{id:'',value:'',code:'',type:''},
          assetStat:{total:'',inStock:'',outStock:''},
          remark:'',
          vendorCode:'',
          typeCode:''
        },
        userData:[], //用户（人）信息
        cabinetSelectedData:{
          name:'',
          uSize:0,
          remark:'',
          idcId:'',
        },
        rules:{
          sn:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'}
          ],
          host:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'},
            {validator:host,trigger:'blur'}
          ],
          modelId:[
            {required:true,message:this.$t('validate.required'),trigger:'change'}
          ],
          "model.type.code":[
            {required:true,message:this.$t('validate.required'),trigger:'change'}
          ],
          idcId:[
            {required:true,message:this.$t('validate.required'),trigger:'change'}
          ],
          'impi.host':[
            {validator:host,trigger:'blur'}
          ],
          'impi.port':[
            {validator:port,trigger:'blur'}
          ]
        },
        cabRules:{
          name:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'}
          ],
          uSize:[
            {required:true,type:'number',min:1,max:47,message:this.$t('validate.required'),trigger:'blur'}
          ],
          idcId:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'}
          ]
        },
        formData:null,
        accountValidResult:true,
        changeProtocolSwitch:true,
        exporterDisableSwitch:false,
        tagKeys:[],
        tagValues:[],
        tagValuesCache:new Map(),
      }
    },
    methods:{
      clickOutside(){
        this.esc(false);
      },
      /*关闭弹框*/
      esc(refresh){
        this.prevent_opt.save=false;
        this.$emit("close",refresh);
      },
      modelReload(){

      },
      // 获取endpoint弹框中的asset子弹框里asset列表数据
      getAssetList(){
        this.$get('asset',this.assetPageObj).then(response=>{
          if(response.code===200){
            let respData=response.data.list;
            for(let i=0; i<respData.length; i++){
              respData[i].sel=false;
              for(let j=0; j<this.assetSelList.length; j++){
                if(respData[i].id==this.assetSelList[j].id){
                  respData.splice(i,1);
                  i--;
                  break;
                }
              }
            }
            this.assetList=response.data.list;
          }
        });
      },
      //回车搜索searchAsset
      searchAssetKeydown(e){
        e=e?e:window.event;
        let keyCode=e.keyCode?e.keyCode:e.which?e.which:e.charCode;
        if(keyCode===13){
          this.searchAsset()
        }
      },
      //endpoint弹框中的asset子弹框搜索
      searchAsset(){
        if(this.assetSearch.label=='Host'){
          this.assetSearch.host=this.assetSearch.text;
          this.assetSearch.sn='';
        }else if(this.assetSearch.label=='SN'){
          this.assetSearch.sn=this.assetSearch.text;
          this.assetSearch.host='';
        }
        this.assetPageObj=Object.assign({},this.assetPageObj,this.assetSearch);
        this.getAssetList();
      },
      // endpoint弹框的asset子弹框顶部搜索条件选中事件
      dropdownSelect(label){
        this.assetSearch.label=label;
        this.assetSearch.dropdownShow=false;
      },
      // endpoint弹框中的asset子弹框里asset选择事件
      selectAsset(){
        this.$nextTick(()=>{
          let index=0;
          this.assetList.forEach(item=>{
            if(item.sel){
              index++;
            }
          });
          if(index==0){
            this.assetListAll=false;
            this.assetListHalf=false;
          }else if(index<this.assetList.length){
            this.assetListAll=true;
            this.assetListHalf=true;
          }else{
            this.assetListAll=true;
            this.assetListHalf=false;
          }
        })
      },
      addToEndpointList(){
        let arr=[];
        this.assetListAll=false;
        this.assetListHalf=false;
        this.endpointTouch=true;
        this.assetList=this.assetList.filter(item=>{
          let flag=item.sel;
          if(flag){
            item.sel=false;
            arr.push(item);
          }
          return !flag
        });
        this.assetSelList=this.assetSelList.concat(arr);
      },
      assetListSelAll(flag){
        if(flag){
          this.assetListHalf=false;
          this.assetList.forEach(item=>{
            item.sel=flag;
          });
        }else if(!flag&& !this.assetListHalf){
          this.assetList.forEach(item=>{
            item.sel=flag;
          });
        }else if(!flag&&this.assetListHalf){
          this.assetListHalf=false;
          this.assetListAll=true;
          this.assetList.forEach(item=>{
            item.sel= !flag;
          });
        }
      },
      setRowIndex({row,rowIndex}){
        row.index=rowIndex;
      },
      //清空勾选的endpoint
      clearSelection(){
        let selections=this.$refs.endpointTable.selection;
        if(selections&&selections.length>0){
          for(let i=0; i<selections.length; i++){
            this.removeEndpoint(selections[i])
          }
        }
      },
      //移除endpoint
      removeEndpoint(endpoint){
        endpoint.isEdit=false;
        for(let i=0; i<this.assetSelList.length; i++){
          if(this.assetSelList[i].id==endpoint.id){
            this.assetSelList.splice(i,1);
            this.assetList.unshift(endpoint);
            i--;
            break;
          }
        }
      },
      //组织符合cascader的数据格式
      addTag(){
        !this.editAsset.tags&&(this.$set(this.editAsset,"tags",[]));
        this.editAsset.tags.push({tag:"",value:""});
      },
      addAccount(type){
        if(type=="SSH"){
          this.editAsset.accounts.push({
            authType:1,
            protocol:"SSH",
            port:22,
            params:{
              user:"",
              method:"password",
              password:"",
              key:"",
              passwordKey:""
            }
          });
        }else if(type=="TELNET"){
          this.editAsset.accounts.push({
            protocol:"TELNET",
            port:23,
            params:{
              user:"",
              password:"",
              userTip:"",
              passwordTip:"",
              reloginTip:""
            }
          });
        }else if(type=="SNMP"){
          this.editAsset.accounts.push({
            protocol:"SNMP",
            port:161,
            params:{
              version:2,
              community:"public",
              securityName:"",
              securityLevel:"",
              password:"",
              privPassword:"",
              authProtocol:"",
              privProtocol:"",
              contextName:""
            }
          });
        }
        this.accountType=type;
        this.showAccountOp=false;
        this.$nextTick(()=>{
          let sbWrap=this.$refs.scrollbar.$refs.wrap;
          sbWrap.scrollTop=sbWrap.scrollHeight;
        });
      },
      removeAccount(index){
        this.editAsset.accounts.splice(index,1);
        if(this.editAsset.accounts.length>0){
          this.accountType=this.editAsset.accounts[0].protocol;
        }else{
          this.accountType="";
        }
      },
      removeTag(index){
        this.editAsset.tags.splice(index,1);
      },
      getUserData(){
        return new Promise(resolve=>{
          this.$get('sys/user/list').then(response=>{
            if(response.code===200){
              this.userData=response.data.list
            }
            resolve(this.userData);
          });
        });
      },
      setAccountValidResult(result,protocol){
        this.accountValidResult=result;
        let index=this.errorProtocol.indexOf(protocol);
        if(result){
          index!= -1?this.errorProtocol.splice(index,1):"";
        }else{
          index== -1?this.errorProtocol.push(protocol):"";
        }
      },
      changeProtocolType(type){
        this.accountType=type;
        this.$nextTick(()=>{
          let sbWrap=this.$refs.scrollbar.$refs.wrap;
          sbWrap.scrollTop=sbWrap.scrollHeight;
        });
      },
      save(){
        if(this.prevent_opt.save){ return } ;
        if(this.locationInfo){
          if(this.locationInfo.idc){
            this.editAsset.idcId=this.locationInfo.idc.id;
          }
          if(this.locationInfo.cabinet){
            this.editAsset.cabinetId=this.locationInfo.cabinet.id;
          }else{
            this.editAsset.cabinetId=null;
          }
          if(this.locationInfo.u&&this.locationInfo.u.length>0){
            this.editAsset.cabinetStart=this.locationInfo.u[0];
            this.editAsset.cabinetEnd=this.locationInfo.u[1];
          }else{
            this.editAsset.cabinetStart=null;
            this.editAsset.cabinetEnd=null;
          }
        }
        this.endpointTouch=true;
        if(this.$refs.accountConfigBox&&this.$refs.accountConfigBox.length>0){
          this.$refs.accountConfigBox.forEach(box=>{
            box.validateAccount();
          });
        }
        this.$refs.assetEditForm.validate((valid)=>{
          if(valid&&this.accountValidResult){
            if(this.assetSelList.length===0){
              return false;
            }
            this.assetSelList.forEach((item)=>{
              this.editAsset.assetIds.push(item.id);
            });
            this.prevent_opt.save=true;
            this.$put('/asset/batch',this.editAsset).then(res=>{
              this.prevent_opt.save=false;
              if(res.code===200){
                this.$message({duration:2000,type:'success',message:this.$t("tip.saveSuccess")});
                this.esc(true);
              }else{
                this.$message.error(res.msg);
              }
            });
          }else{
            console.log(213123123123);
            this.prevent_opt.save=false;
            return false;
          }
        });
      },
      protocolTypeChange(protocol){
        if(protocol=='TELNET'){
          this.exporterDisableSwitch=true;
        }else{
          this.exporterDisableSwitch=false;
        }
      },
      loadValues:function(tag){
        let tagVal=tag.tag&&tag.tag!=''?tag.tag:tag.value
        if(!tagVal||tagVal==''){
          this.tagValues=[];
          return;
        }

        let value=this.tagValuesCache.get(tagVal)
        if(!value){
          value=[];
          this.$get('/asset/tagValue',{key:encodeURIComponent(tagVal)}).then(res=>{
            if(res.code==200){
              value=res.data.list.map(item=>{
                return {value:item}
              })

              this.tagValues=Object.assign([],value)
              this.tagValuesCache.set(tag.tag,Object.assign([],value))
            }
          })
        }else{
          this.tagValues=Object.assign([],value)
        }
      },
      filterKey:function(input,callback){
        if(!input||input==''){
          callback(this.tagKeys)
        }else{
          let result=this.tagKeys.filter(item=>{
            return item.value.toLowerCase().indexOf(input.toLowerCase())!= -1
          })
          callback(result)
        }
      },
      filterValue:function(input,callback){
        if(!input||input==''){
          callback(this.tagValues)
        }else{
          let result=this.tagValues.filter(item=>{
            return item.value.toLowerCase().indexOf(input.toLowerCase())!= -1
          })
          callback(result)
        }
      },
    },
    mounted(){
      this.getUserData();
      this.getAssetList();
      this.showAccountOp=false;
    }
  }
</script>
<style>
  .location-selector {
    width: 512px;
  }

  .location-selector .el-select-dropdown__item {
    position: relative;
  }

  .location-selector .el-cascader-node__prefix {
    display: none !important;
  }

  .cabinet-u-label .el-checkbox__original:checked + span {
    background-color: orange;
  }

  .cabinet-u-label .el-checkbox__original:checked + span:after {
    -webkit-transform: rotate(45deg) scaleY(1);
    transform: rotate(45deg) scaleY(1);
  }

  .cabinet-u-label .is-disabled {
    cursor: not-allowed;
    border-color: #C0C4CC;
  }

  .cabinet-u-label .is-disabled-bg {
    background-color: #F2F6FC !important;
  }

  .cabinet-u-label .is-disabled-check:after {
    border-color: #C0C4CC !important;
  }

  .endpoints-box-endpoints-title {
    color: black;
    font-weight: 400;
  }

  .endpoints-box-endpoints .el-table td, .endpoints-box-endpoints .el-table th {
    padding: 5px 0 !important;
  }

  .endpoints-box-endpoints .cell {
    padding: 0 2px 0 10px;
  }

  .endpoints-box-endpoints .el-table .el-table__row td {
    padding: 5px 0;
  }

  .module-info-param.el-input.is-disabled .el-input__inner, .endpoint-info-param.el-input.is-disabled .el-input__inner,
  .endpoint-info-param.el-input.is-disabled .el-input__inner, .endpoint-info-param.el-input.is-disabled .el-input__inner {
    cursor: pointer;
    background-color: white;
    border-color: #DCDFE6;
    color: #606266;
    transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
  }

  .module-info-param.el-input.is-disabled .el-input__inner:hover, .endpoint-info-param.el-input.is-disabled .el-input__inner:hover,
  .endpoint-info-param.el-input.is-disabled .el-input__inner:hover, .endpoint-info-param.el-input.is-disabled .el-input__inner:hover {
    border-color: #c0c4cc;
  }

  .endpoints-box-endpoints .el-form-item {
    margin-bottom: 0;
  }

  .endpoints-box-endpoints .el-form-item.is-error {
    margin-bottom: 22px;
  }
</style>
<style scoped>
  #module-add-param, #add-type {
    border: none;
    cursor: pointer;
    outline: none;
    margin-right: 5px;

  }

  .nz-icon.nz-icon-shanchu1 {
    font-size: 14px;
  }

  /* start--param*/
  .param-btn {
    float: right;
    height: 27px;
    margin-top: -3px;
  }

  .param-btn-active {
    background-color: #656565;
    color: white;
    border: 1px solid #656565;
  }

  .param-btn-active:hover, .param-btn-active:focus {
    background-color: #656565;
    color: white;
  }

  .param-btn-clear {
    background-color: #D4D4D4;
    border: 1px solid #D4D4D4;
    color: white;
  }

  .param-btn-clear:hover, .param-btn-clear:focus {
    background-color: #D4D4D4;
    color: white;
  }

  .param-box {
    height: 200px;
    overflow: auto;
    border: none;
  }

  .param-box-row {
    padding: 7px 10px 0 10px;
    position: relative;
  }

  .param-box-row:last-of-type {
    padding-bottom: 7px;
  }

  .param-box-row-key, .param-box-row-value {
    display: inline-block;
    width: 50px;
  }

  .param-box-row-eq {
    display: inline-block;
    width: 14px;
    text-align: center;
    height: 22px;
    line-height: 22px;
    color: #c4c7cF;
  }

  /* end--param*/

  /* begin--小盒子*/
  .right-child-boxes {
    height: 400px;
    position: relative;
    display: flex;
    width: 100%;
  }

  .endpoint-to-right-symbol {
    position: absolute;
    top: calc(50% - 30px);
    left: 274px;
    cursor: pointer;
    font-size: 18px;
  }

  .right-child-box {
    height: 100%;
  }

  .assets-box {
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    width: 395px;
    height: calc(100% - 22px);
  }

  .endpoints-box {
    margin: 0 0 0 20px;
    width: 540px;
  }

  .endpoints-box.endpoints-box-snmp {
    width: 400px;
  }

  .right-child-box .el-input-group {
    width: 187px;
    float: right;
    margin: 7px 5px 0 0;
  }

  .right-child-box .module-info .el-input {
    display: inline-block;
  }

  .right-child-box .module-info {
    display: inline-block;
    height: 22px;
    vertical-align: middle;
    position: absolute;
    top: 5px;
  }

  .right-child-box-title {
    padding: 9px 0 0 9px;
    display: inline-block;
  }

  .endpoints-box-module-info {
    background: #eeeeee;
    width: 100%;
    height: 33px;
    position: relative;
  }

  .endpoints-box-module-info .title {
    line-height: 33px;
    color: #5e5e5e;
    padding-left: 5px;
    display: inline-block;
  }

  .module-info-port {
    width: 53px;
    right: 209px;
  }

  .module-info-port-snmp {
    right: 50px;
  }

  .module-info-param {
    width: 89px;
    right: 116px;
  }

  .module-info-path {
    width: 70px;
    right: 42px;
  }

  .endpoint-info-param {
    width: 80px;
  }

  .right-child-box .module-info-cover {
    right: 4px;
    padding: 0px 6px;
    margin-right: 5px;
  }

  .endpoints-box-endpoints {
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    height: calc(100% - 54px);
    transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
    position: relative;
  }

  .endpoint-param-pop {
    max-height: 200px;
    overflow: auto;
  }

  /* end--小盒子*/

  /* begin--子弹框*/
  .right-sub-box {
    width: 170px;
    height: 225px;
    position: fixed;
    z-index: 2;
    padding: 0;
  }

  /* begin--搜索框*/
  .endpoint-asset-search {
    position: relative;
    margin-left: 44px;
  }

  .endpoint-asset-search button {
    height: 24px !important;
  }

  .endpoint-asset-search-dropdown {
    position: absolute;
    top: 25px;
    background-color: #444;
    border-radius: 4px;
    width: 44px;
    left: 0;
  }

  .endpoint-asset-search-dropdown-item {
    text-align: center;
    line-height: 22px;
    height: 22px;
    cursor: default;
    color: white;
    font-size: 12px;
  }

  .endpoint-asset-label-txt {
    display: inline-block;
    min-width: 19px;
    text-align: center;
  }

  .endpoint-asset-search-dropdown-item:first-of-type {
    border-radius: 4px 4px 0 0;
  }

  .endpoint-asset-search-dropdown-item:last-of-type {
    border-radius: 0 0 4px 4px;
  }

  .endpoint-asset-search-dropdown-item:hover {
    background-color: #222;
    color: #ff9900;
  }

  .endpoint-asset-search-input {
    display: inline-block;
    width: 100px;
    vertical-align: top;
  }

  /* end--搜索框*/

  /* begin--table*/
  .endpoint-sub-table {
    padding-top: 5px;
    height: calc(100% - 72px);
  }

  .line-100 {
    margin-bottom: 3px;
  }

  .endpoint-sub-table-head {
    line-height: 28px;
    height: 30px;
  }

  .endpoint-sub-table-row, .endpoint-sub-table-row-disabled {
    line-height: 28px;
    height: 30px;
    color: #656565;
    position: relative;
  }

  .endpoint-sub-table-row:hover {
    background-color: #dadada;
    cursor: default;
  }

  .endpoint-sub-table-row-active {
    background-color: #dadada;
  }

  .endpoint-sub-table-row-selected {
    background-color: #656565;
    color: white;
  }

  .endpoint-sub-table-col {
    display: inline-block;
    width: calc(50% - 28px);
    padding-left: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .endpoint-sub-table-paginate-all {
    position: absolute;
    left: 10px;
    bottom: 17px;
    color: #5a5a5a;
  }

  .endpoint-sub-table-body {
    font-size: 15px;
    position: relative;
    overflow: auto;
    height: calc(100% - 37px);
    width: 390px;
  }

  .endpoint-sub-table-body-dialog {
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    position: absolute;
  }

  .endpoints-clear-btn {
    margin: 6px 0 0 7px;
  }
  /deep/.el-table td{
    padding: 5px 0;
  }
  /* end--table*/

  /* end--子弹框*/
</style>

