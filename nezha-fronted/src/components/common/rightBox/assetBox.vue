<template>
  <div class="right-box right-box-asset" v-clickoutside="clickOutside">
    <!--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button v-if="editAsset.id" type="button" @click="del" id="asset-edit-del"
              class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-min-width-82">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>

    <div class="right-box-title">{{editAsset.id ? ($t("asset.editAsset") + "  ID：" + editAsset.id) : $t("asset.createAsset")}}</div>

    <el-scrollbar class="right-box-form-box" ref="scrollbar">
      <el-form ref="assetEditForm" :model="editAsset" label-width="120px" class="right-box-form right-box-form-left" :rules="rules">
        <el-form-item :label="$t('asset.sn')" prop="sn">
          <el-input size="small" v-model="editAsset.sn"/>
        </el-form-item>
        <el-form-item :label="$t('asset.host')" prop="host">
          <el-input size="small" v-model="editAsset.host"/>
        </el-form-item>
        <el-form-item :label="$t('asset.state')">
          <div class="select-style">
            <el-select size="small" v-model="editAsset.state" placeholder="" popper-class="asset-dropdown" >
              <el-option
                :id="'asset-edit-state-op-'+item.value"
                v-for="item in $CONSTANTS.asset.stateData"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </el-form-item>
        <div class="right-box-sub-title">{{$t('asset.assetInfo')}}</div>
        <div class="right-box-line"></div>
        <!------------------------------------------资产类型---------------------------------------------->
        <el-form-item :label="$t('asset.assetType')" class="right-box-form-content" prop="model.type.code">
          <el-select popper-class="asset-dropdown" size="small" v-model="editAsset.model.type.code" @change="getVendorAndModelOptionData(editAsset.model.type.code,$event)">
            <el-option
              :id="'asset-edit-type-op-'+item.id"
              v-for="item in assetTypeData"
              :key="item.id"
              :value="item.code"
              :label="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!------------------------------------------厂商/型号---------------------------------------------->
        <el-form-item :label="$t('asset.vendorModel')" class="right-box-form-content" prop="modelId">
          <el-cascader
            :options="vendorAndModelOptionData"
            :props="{emitPath: false}"
            :disabled="editAsset.model.type.code ? false : true"
            v-model="editAsset.modelId"
            clearable
            size="small"
            placeholder=""
            class="right-box-row-with-btn"
            @change="modelChange"
          >
          </el-cascader>
          <span style="vertical-align: middle"  class="right-box-form-add" @click="addVendor(editAsset.model.type.code)"><i class="nz-icon nz-icon-plus"></i></span>
        </el-form-item>
        <el-form-item :label="$t('asset.purchaseDate')">
          <div class="select-style">
            <el-date-picker
              size="small"
              v-model="editAsset.purchaseDate"
              value-format="yyyy-MM-dd"
              type="date"
              style="width: 100%"
              placeholder="">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item :label="$t('asset.location')" class="required-marker" prop="locationInfo" :rules="[{validator:locationValidator, trigger:'blur'}]">
          <location-cascader :disabled="editAsset.modelId ? false : true" :default-model-u-size="modelSize" @change="setLocationData" ref="locationCascader" :idc-option="dcData"></location-cascader>
        </el-form-item>
        <!--tag-->
        <div class="right-box-sub-title">{{$t('overall.tag')}}
          <div class="right-box-form-btns">
          <button style="display: none;">第一个button会出现意料之外的hover样式，找不到原因，只好加个不可见的button规避问题</button>
          <button id="module-add-param" type="button" @click="addTag">
           <span class="create-square-box">
              <i style="font-size: 17px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i>
            </span>
          </button>
        </div></div>
        <div class="right-box-line"></div>
        <el-form-item>
          <template slot="label">
            <span></span>
          </template>
          <div class="tag-edit-box">
            <div class="tag-edit-box-head">
              <div>Tag</div>
              <div>Value</div>
              <div>Action</div>
            </div>
            <el-scrollbar ref="tagEditBoxScrollbar" style="height: calc(100% - 32px);">
              <div class="tag-edit-box-body" v-for="(item, index) in editAsset.tags">
                <el-form-item class="tag-edit tag-edit-tag" :rules="{required: true, message: $t('validate.required'), trigger: 'change'}" :prop="'tags.' + index + '.tag'">
                  <el-autocomplete placeholder="tag" size="mini" v-model="item.tag" :fetch-suggestions="filterKey" @blur="loadValues(item)" @select="loadValues" popper-class="no-style-class"></el-autocomplete>
                </el-form-item>
                <el-form-item class="tag-edit tag-edit-value" :rules="{required: true, message: $t('validate.required'), trigger: 'change'}" :prop="'tags.' + index + '.value'">
                  <el-autocomplete placeholder="value" size="mini" v-model="item.value" :fetch-suggestions="filterValue" popper-class="no-style-class"></el-autocomplete>
                </el-form-item>
                <div class="param-box-row-symbol" :id="'asset-tag-remove-'+index" @click.stop="removeTag(index)"><i class="nz-icon nz-icon-shanchu1" style="color: #666666"></i></div>
              </div>
            </el-scrollbar>
          </div>
        </el-form-item>

        <!--<div class="right-box-sub-title">{{$t('asset.location')}}</div>-->
        <!--<div class="right-box-line"></div>-->
        <!------------------------------------------IDC---------------------------------------------->
        <!--cli-->
        <div class="right-box-sub-title">{{$t('config.account.account')}}
          <el-popover placement="right" width="70" trigger="click" :disabled="editAsset.accounts.length == 3" v-model.sync="showAccountOp" popper-class="no-style-class">
            <button slot="reference" id="add-type" type="button" class="float-right" :class="{'nz-btn-disabled': editAsset.accounts.length == 3}">
              <span><i class="nz-icon nz-icon-create-square"></i></span>
            </button>
            <ul class="el-select-dropdown__list">
              <li @click="addAccount(type)" v-for="(type, index) in selectableAccountTypes" :key="index" class="el-select-dropdown__item"><span>{{type}}</span></li>
            </ul>
          </el-popover>
        </div>
        <div class="right-box-line"></div>
        <div class="nz-tab" style="padding-left: 70px;">
          <div class="nz-tab-item-box" v-for="(account, index) in editAsset.accounts" :key="index" @click="changeProtocolType(account.protocol)" :id="`account-login-type-${index}`">
            <div class="nz-tab-item" :class="{'nz-tab-item-active': accountType == account.protocol}" style="position: relative;">
              <span>{{account.protocol}}</span>
              <transition name="el-zoom-in-top">
                <div v-if="errorProtocol.indexOf(account.protocol) > -1" class="nz-tab-error el-form-item__error">Required</div>
              </transition>
            </div>&nbsp;
            <span class="nz-tab-item-close" @click.stop="removeAccount(index)"><i class="nz-icon nz-icon-circle-close"></i></span>
          </div>
        </div>
        <account-config-box v-for="(account,index) in editAsset.accounts" :account="account" v-show="account.protocol == accountType" :key="index" ref="accountConfigBox" @setValidateResult="setAccountValidResult" @protocol-type-change="protocolTypeChange"></account-config-box>

        <template v-if="accountType == 'SSH' && !editAsset.id">
          <el-form-item :label="$t('asset.exporter')" class="exporter-label" style="margin-left: 66px">
            <el-switch class="exporter-switch" v-model="editAsset.exporter" active-color="#ee9d3f" active-value="1" inactive-value="0" :show="!exporterDisableSwitch"></el-switch>
          </el-form-item>
        </template>
      </el-form>
    </el-scrollbar>

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc(false)" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" id="asset-edit-cancel">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="asset-edit-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
    <transition name="right-box">
      <model-box v-if="rightBox.model.show" ref="modelBox" @reload="modelReload" :model="model" @close="closeRightBox"></model-box>
    </transition>
  </div>
</template>

<script>
  import accountConfig from '../../page/asset/accountConfig';
  import {host} from '../js/validate';
  import {port} from '../js/validate'
  import locationCascader from "./locationCascader";
  export default {
    name: "assetBox",
    props: {
      asset: Object
    },
    components:{
      'account-config-box': accountConfig,
      'location-cascader':locationCascader,
    },
    data() {
      return {
        editAsset: {},

        rightBox: {model: {show: false}},
        modelData: [],
        dcData: [],
        assetTypeData: [],
        cabinetData: [],
        vendorAndModelOptionData: [], //厂商型号下拉框选择数据

        showAccountOp: false,
        errorProtocol: [], //校验不通过的account
        selectableAccountTypes: ["SSH", "TELNET", "SNMP"],

        modelSize: 1,
        locationInfo: null,

        accountType: '',
        model: {},
        blankModel: {
          id: '',
          name: '',
          vendor: {id: '', value: '', code: '', type: ''},
          type: {id: '', value: '', code: '', type: ''},
          assetStat: {total: '', inStock: '', outStock: ''},
          remark: '',
          vendorCode: '',
          typeCode: ''
        },
        userData: [], //用户（人）信息
        cabinetSelectedData: {
          name: '',
          uSize: 0,
          remark: '',
          idcId: '',
        },
        rules: {
          sn: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          host: [
            {required:true,message:this.$t('validate.required'),trigger: 'blur'},
            {validator:host, trigger: 'blur'}
          ],
          modelId: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
          "model.type.code": [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
          idcId: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
          'impi.host':[
            {validator:host,trigger:'blur'}
          ],
          'impi.port':[
            {validator:port,trigger:'blur'}
          ]
        },
        cabRules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          uSize: [
            {required: true, type: 'number', min: 1, max: 47, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          idcId: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ]
        },
        formData:null,
        accountValidResult: true,
        changeProtocolSwitch: true,
        exporterDisableSwitch: false,
        tagKeys:[],
        tagValues:[],
        tagValuesCache:new Map(),
      }
    },
    watch: {
      asset: {
        deep: true,
        immediate: true,
        handler(n) {
          //console.info(n);
          this.editAsset = JSON.parse(JSON.stringify(n));
          if (!this.editAsset.accounts) {
            this.$set(this.editAsset, "accounts", []);
          } else {
            this.editAsset.accounts.length > 0 && (this.accountType = this.editAsset.accounts[0].protocol);
          }
          this.$set(this.editAsset, "modelId", n.model.id);
          this.modelSize = n.model.usize;
          let initLocationData={
            idc: n.idc,
            cabinet: n.cabinet,
            u: [n.cabinetStart, n.cabinetEnd]
          };
          this.$nextTick(() => {
            this.$refs.locationCascader.initComponet(initLocationData);
            this.getVendorAndModelOptionData(n.model.type.code);
          });
        }
      },
      'editAsset.accounts': {
        deep: true,
        handler(n) {
          let temp = ["SSH", "TELNET", "SNMP"];
          n.forEach(item => {
            let i = temp.indexOf(item.protocol);
            if (i > -1) {
              temp.splice(i, 1);
            }
          });
          this.selectableAccountTypes = temp;
        }
      },
    },
    methods: {
      clickOutside() {
        this.esc(false);
      },
      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },
      modelReload() {

      },
      //关闭model侧滑框
      closeRightBox(refresh) {
        this.rightBox.model.show = false;
        if (refresh) { //新增修改型号后刷新相关数据
          this.getVendorData();
          this.getModelData(this.editAsset.model.type.code);
        }
      },
      getVendorData() {
        return new Promise(resolve => {
          this.$get('sys/dict/all?type=vendor&pageSize=-1').then(response => {
            if (response.code === 200) {
              this.vendorData = response.data;
            }
            resolve(this.vendorData);
          });
        });
      },
      getModelData(assetType) {
        return new Promise(resolve => {
          let url = assetType ? ('model?typeCode=' + assetType+'&pageSize=-1') : 'model?pageSize=-1';
          this.$get(url).then(response => {
            if (response.code === 200) {
              this.modelData = response.data.list;
            }
            resolve(this.modelData);
          });
        });
      },
      //组织符合cascader的数据格式
      getVendorAndModelOptionData(assetType,event) {
        if(event){
          this.editAsset.modelId='';
        }
        let request = this.getModelData(assetType);
        request.then(response => {
          let resultData = [];
          let modelData = response;
          for (let i = 0; i < modelData.length; i++) {
            if (!modelData[i].vendor) {
              continue;
            }
            let obj = {};
            obj.id = modelData[i].vendor.id;
            obj.code = modelData[i].vendor.code;
            obj.value ='vendor-'+ modelData[i].vendor.code;
            obj.label = modelData[i].vendor.value;
            obj.children = [];
            resultData.push(obj);
          }
          let result = [];
          let obj1 = {};
          for (let i = 0; i < resultData.length; i++) {
            if (!obj1[resultData[i].id]) {
              result.push(resultData[i]);
              obj1[resultData[i].id] = true;
            }
          }
          for (let x = 0; x < result.length; x++) {
            for (let y = 0; y < modelData.length; y++) {
              if (!modelData[y].vendor) {
                continue;
              }
              if (result[x].code === modelData[y].vendor.code) {
                let obj2 = {};
                obj2.value = modelData[y].id;
                obj2.label = modelData[y].name;
                result[x].children.push(obj2);
              }
            }
          }
          this.vendorAndModelOptionData = result;
        });
      },
      addTag() {
        !this.editAsset.tags && (this.$set(this.editAsset, "tags", []));
        this.editAsset.tags.push({tag: "", value: ""});
        this.$nextTick(() => {
          this.$refs.tagEditBoxScrollbar.update();
        });
      },
      addAccount(type) {
        if (type == "SSH") {
          this.editAsset.accounts.push({
            authType: 1,
            protocol: "SSH",
            port: 22,
            params: {
              user: "",
              method: "password",
              password: "",
              key: "",
              passwordKey: ""
            }
          });
        } else if (type == "TELNET") {
          this.editAsset.accounts.push({
            protocol: "TELNET",
            port: 23,
            params: {
              user: "",
              password: "",
              userTip: "",
              passwordTip: "",
              reloginTip: ""
            }
          });
        } else if (type == "SNMP") {
          this.editAsset.accounts.push({
            protocol: "SNMP",
            port: 161,
            params: {
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
        this.accountType = type;
        this.showAccountOp = false;
        this.$nextTick(() => {
          let sbWrap = this.$refs.scrollbar.$refs.wrap;
          sbWrap.scrollTop = sbWrap.scrollHeight;
        });
      },
      removeAccount(index) {
        this.editAsset.accounts.splice(index, 1);
        if (this.editAsset.accounts.length > 0) {
          this.accountType = this.editAsset.accounts[0].protocol;
        } else {
          this.accountType = "";
        }
      },
      removeTag(index) {
        this.editAsset.tags.splice(index, 1);
        this.$nextTick(() => {
          this.$refs.tagEditBoxScrollbar.update();
        });
      },
      setLocationData(data) {
        this.locationInfo = data;
      },
      locationValidator:function(rule, value, callback){
        let $temp=this;
        setTimeout(()=>{
          if(!this.locationInfo){
            callback(new Error($temp.$t('validate.required')))
          }else if(this.locationInfo && !this.locationInfo.idc){
            callback(new Error($temp.$t('validate.required')))
          }else{
            callback();
          }
        }, 100)
      },
      modelChange(modelId) {
        let model = this.modelData.find((item, index)=>{
          return modelId == item.id;
        });
        this.modelSize = model.usize;
      },
      getDcData() {
        return new Promise(resolve => {
          this.$get('idc').then(response => {
            if (response.code === 200) {
              this.dcData = response.data.list;
            }
            resolve(this.dcData);
          });
        });
      },
      getUserData() {
        return new Promise(resolve => {
          this.$get('sys/user/list').then(response => {
            if (response.code === 200) {
              this.userData = response.data.list
            }
            resolve(this.userData);
          });
        });
      },
      getCabinetData(id) {
        return new Promise(resolve => {
          this.$get('cabinet?idcId=' + id).then(response => {
            if (response.code === 200) {
              this.cabinetData = response.data.list;
              for (let i = 0; i < this.cabinetData.length; i++) {
                this.$set(this.cabinetData[i], 'children', this.dcData)
              }
            }
            resolve(this.cabinetData);
          });
        });
      },
      getAssetTypeData() {
        return new Promise(resolve => {
          this.$get('sys/dict/all?type=assetType&pageSize=-1').then(response => {
            if (response.code === 200) {
              this.assetTypeData = response.data;
            }
            resolve(this.assetTypeData);
          });
        });
      },
      newModel() {
        return JSON.parse(JSON.stringify(this.blankModel));
      },
      addVendor(assetType) {
        this.model = this.newModel();
        if (assetType) {
          //model侧滑弹出时，自动选好assetType
          for (let i = 0; i < this.assetTypeData.length; i++) {
            if (this.assetTypeData[i].code == assetType) {
              this.model.type.code = assetType;
              this.model.type.value = this.assetTypeData[i].value;
              break;
            }
          }
        }
        this.rightBox.model.show = true;
      },
      setAccountValidResult(result, protocol) {
        this.accountValidResult = result;
        let index = this.errorProtocol.indexOf(protocol);
        if (result) {
          index != -1 ? this.errorProtocol.splice(index, 1) : "";
        } else {
          index == -1 ? this.errorProtocol.push(protocol) : "";
        }
      },
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("asset?ids=" + this.editAsset.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      changeProtocolType(type) {
        this.accountType = type;
        this.$nextTick(() => {
          let sbWrap = this.$refs.scrollbar.$refs.wrap;
          sbWrap.scrollTop = sbWrap.scrollHeight;
        });
      },
      save() {
        if(this.locationInfo) {
          if(this.locationInfo.idc){
            this.editAsset.idcId = this.locationInfo.idc.id;
          }
          if(this.locationInfo.cabinet) {
            this.editAsset.cabinetId = this.locationInfo.cabinet.id;
          }else{
            this.editAsset.cabinetId = null;
          }
          if(this.locationInfo.u && this.locationInfo.u.length > 0) {
            this.editAsset.cabinetStart = this.locationInfo.u[0];
            this.editAsset.cabinetEnd = this.locationInfo.u[1];
          }else{
            this.editAsset.cabinetStart = null;
            this.editAsset.cabinetEnd = null;
          }
        }

        if(this.$refs.accountConfigBox && this.$refs.accountConfigBox.length > 0) {
          this.$refs.accountConfigBox.forEach(box => {
            box.validateAccount();
          });
        }
        this.$refs.assetEditForm.validate((valid) => {
          if (valid && this.accountValidResult) {
            if (this.editAsset.id) {
              this.$put('asset', this.editAsset).then(res => {
                if (res.code === 200) {
                  this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(res.msg);
                }
              });
            } else {
              if(this.$refs.accountConfigBox && this.$refs.accountConfigBox.length > 0){
                this.$refs.accountConfigBox[0].validateAccount();
              }
              this.$post('asset', this.editAsset).then(res => {
                if (res.code === 200) {
                  this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(res.msg);
                }
              });
            }
          } else {
            return false;
          }
        });
      },
      protocolTypeChange(protocol) {
        if(protocol == 'TELNET'){
          this.exporterDisableSwitch = true;
        }else{
          this.exporterDisableSwitch = false;
        }
      },
      loadKeys:function(){
        this.$get('/asset/tagKey').then(res=>{
          if(res.code == 200){
            this.tagKeys = res.data.list.map(item=>{
                return {value:item}
              })
          }
        })
      },
      loadValues:function(tag){
        let tagVal=tag.tag && tag.tag!=''?tag.tag:tag.value
        if(!tagVal || tagVal ==''){this.tagValues=[]; return; }

        let value = this.tagValuesCache.get(tagVal)
        if(!value){
          value = [];
          this.$get('/asset/tagValue',{key:encodeURIComponent(tagVal)}).then(res => {
            if(res.code == 200){
              value = res.data.list.map(item=>{
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
        if(!input || input == ''){
          callback(this.tagKeys)
        }else{
          let result=this.tagKeys.filter(item=>{return item.value.toLowerCase().indexOf(input.toLowerCase()) != -1})
          callback(result)
        }
      },
      filterValue:function(input,callback){
        if(!input || input == ''){
          callback(this.tagValues)
        }else{
          let result=this.tagValues.filter(item=>{return item.value.toLowerCase().indexOf(input.toLowerCase()) != -1})
          callback(result)
        }
      },
    },
    mounted() {
      this.getUserData();
      this.getVendorData();
      this.getAssetTypeData();
      this.getDcData();
      this.loadKeys();
      this.showAccountOp = false;
    }
  }
</script>
<style >
  .location-selector{
    width: 512px;
  }
  .location-selector .el-select-dropdown__item {
    position: relative;
  }
  .location-selector .el-cascader-node__prefix{
    display: none !important;
  }
  .cabinet-u-label .el-checkbox__original:checked + span{
    background-color: orange;
  }
  .cabinet-u-label .el-checkbox__original:checked + span:after{
    -webkit-transform: rotate(45deg) scaleY(1);
    transform: rotate(45deg) scaleY(1);
  }
  .cabinet-u-label .is-disabled{
    cursor: not-allowed;
    border-color: #C0C4CC;
  }
  .cabinet-u-label .is-disabled-bg{
    background-color: #F2F6FC !important;
  }
  .cabinet-u-label .is-disabled-check:after{
    border-color: #C0C4CC !important;
  }
</style>
<style scoped>
  #module-add-param,#add-type{
    border: none;
    cursor: pointer;
    outline: none;
    margin-right: 5px;

  }
</style>
