<template>
    <div class="asset-config-tab">
      <el-form-item :label="$t('asset.asset')" size="small" class="right-box-form-content" ref="assetConfigForm" label-width="90px">
        <!--<el-select class="right-box-row-with-btn" clearable @clear="clearAssetInput"  v-model="assetSetting.assetId" @change="assetChanged" popper-class="no-style-class" :class="{'input-error':assetValidate}">
          <el-option v-for="(item,index) in assetList" :label="item.host" :disabled="item.isOccupy" :value="item.id" :key="item.host+'-'+item.id"></el-option>
        </el-select>-->
        <el-autocomplete
          clearable
          :class="{'input-error':hostInvalid || hostRepeat}"
          class="asset-input right-box-row-with-btn"
          v-model="assetSetting.host"
          popper-class="no-style-class"
          :fetch-suggestions="queryAssetHosts"
          :debounce="1000"
          :trigger-on-focus="false"
          :highlight-first-item="true"
          @input="hostInputChange"
          @blur="validateHostEmpty"
        ></el-autocomplete>
        <el-popover trigger="click" placement="bottom" @show="popShow" @hide="popHide" popper-class="no-style-class">
          <div class="mib-browser-ad-search">
            <el-row class="mib-browser-ad-search-item">
              <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t("project.endpoint.port")}}</div></el-col>
              <el-col :span="17">
                <el-input class="input-x-mini-24" v-model.number="assetSetting.port"></el-input>
              </el-col>
            </el-row>
            <el-row class="mib-browser-ad-search-item">
              <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t('project.module.community')}}</div></el-col>
              <el-col :span="17">
                <el-input class="input-x-mini-24" v-model="assetSetting.community"></el-input>
              </el-col>
            </el-row>
            <el-row class="mib-browser-ad-search-item">
              <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t('project.module.version')}}</div></el-col>
              <el-col :span="17">
                <el-radio-group v-model.number="assetSetting.version" >
                  <el-radio-button :label="2"></el-radio-button>
                  <el-radio-button :label="3"></el-radio-button>
                </el-radio-group>
              </el-col>
            </el-row>
            <!--SNMP V3 setting-->
            <template v-if="assetSetting.version == 3">
              <el-row class="mib-browser-ad-search-item">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('login.username')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-input class="input-x-mini-24" v-model.trim="assetSetting.auth.username"></el-input>
                </el-col>
              </el-row>

              <el-row class="mib-browser-ad-search-item">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('project.module.securityLevel')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-radio-group v-model="assetSetting.auth.securityLevel" size="small">
                    <el-radio-button label="noAuthNoPriv"></el-radio-button>
                    <el-radio-button label="authNoPriv"></el-radio-button>
                    <el-radio-button label="authPriv"></el-radio-button>
                  </el-radio-group>
                </el-col>
              </el-row>

              <el-row class="mib-browser-ad-search-item" v-if="assetSetting.auth.securityLevel == 'authNoPriv' || assetSetting.auth.securityLevel == 'authPriv'">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('login.password')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-input class="input-x-mini-24" v-model.trim="assetSetting.auth.password"></el-input>
                </el-col>
              </el-row>

              <el-row class="mib-browser-ad-search-item same-label-width" v-if="assetSetting.auth.securityLevel == 'authNoPriv' || assetSetting.auth.securityLevel == 'authPriv'">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('project.module.authProtocol')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-radio-group v-model="assetSetting.auth.authProtocol">
                    <el-radio-button label="MD5"></el-radio-button>
                    <el-radio-button label="SHA"></el-radio-button>
                  </el-radio-group>
                </el-col>
              </el-row>

              <el-row class="mib-browser-ad-search-item same-label-width" v-if="assetSetting.auth.securityLevel == 'authPriv'">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('project.module.privProtocol')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-radio-group v-model="assetSetting.auth.privProtocol">
                    <el-radio-button label="DES"></el-radio-button>
                    <el-radio-button label="AES"></el-radio-button>
                  </el-radio-group>
                </el-col>
              </el-row>

              <el-row class="mib-browser-ad-search-item" v-if="assetSetting.auth.securityLevel == 'authPriv'">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('project.module.privPassword')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-input class="input-x-mini-24" v-model.trim="assetSetting.auth.privPassword"></el-input>
                </el-col>
              </el-row>
            </template>
          </div>
          <button slot="reference"  class="nz-btn nz-btn-size-normal nz-btn-style-light" id="snmp-advanced">
            <i class="el-icon-more"></i>
          </button>
        </el-popover>
        <div class="right-box-row-btn" @click="delSelf"><i class="nz-icon nz-icon-minus"></i></div>
        <div>
          <span style="color:#F56C6C;font-size: 12px;" v-if="hostRepeat">{{$t('validate.repeat')}}</span>
          <span style="color:#F56C6C;font-size: 12px;" v-if="hostInvalid">{{$t('validate.host')}}</span>
          <span style="color:#F56C6C;font-size: 12px;" v-if="hostEmpty">{{$t('validate.required')}}</span>
        </div>
      </el-form-item>
      <div class="endpoints-box-endpoints">
        <el-table :data="assetSetting.configs"
                  tooltip-effect="light"
                  v-scrollBar:el-table="'large'"
                  max-height="300"
                  height="200"
                  :row-class-name="assetSetting.host == null?'not-allowed':''"
                  @row-dblclick="changeRowEditState"
                  @row-click="validateRows"
                  class="taffic-setting-tab"
                  v-if="refreshTab"
                  style="width: 100%;">
          <el-table-column
            label-class-name="endpoints-box-endpoints-title"
            :resizable="false"
            show-overflow-tooltip
            v-for="(item, index) in tableLabels"
            :width="item.width"
            align="center"
            :key="`col-${index}`"
            style="max-height: 200px"
            >
            <template slot="header">
              <span v-if="item.required == true"><span style="color: red;">*</span>{{item.label}}</span>
              <span v-else>{{item.label}}</span>
            </template>
            <template slot-scope="scope" :column="item">
              <template v-if="item.prop == 'tags'">
                <div class="tab-tags" @click="showEditTagsBox(true,scope.$index,scope.row,$event)">
                  <!--<el-scrollbar style="height: 100%;">
                    <el-tag
                      v-for="(value, key, index) in scope.row[item.prop]"
                      class="tab-tags"
                      size="mini"
                      :key="key"
                      style="display: block;margin-bottom:5px;" >
                      &lt;!&ndash;                  <div class="tab-tags-item">&ndash;&gt;
                      &lt;!&ndash;                    <div class="tag-item-key">{{key}}：</div><div class="tag-item-value">{{value}}</div>&ndash;&gt;

                      &lt;!&ndash;                  </div>&ndash;&gt;
                      {{key}}：{{value}}
                    </el-tag>
                  </el-scrollbar>-->
                  <el-tooltip placement="top" effect="light" popper-class="tags-pop transparent-pop">
                    <div slot="content">
                      <template v-if="scope.row[item.prop]">
                        <div class="tab-tags-item" v-for="(value, key, index) in scope.row[item.prop]">
                          <div class="tag-item-key">{{key}}</div>
                          <div class="tag-item-value">{{value}}</div>
                        </div>
                      </template>
                    </div>
                    <div class="tab-tags-item" v-if="scope.row[item.prop]&&Object.keys(scope.row[item.prop]).length>0">
                      <div class="tag-item-key">{{Object.keys(scope.row[item.prop])[0]}}</div>
                      <div class="tag-item-value">{{scope.row[item.prop][Object.keys(scope.row[item.prop])[0]]}}</div>
                      <div class="tag-item-text" v-if="Object.keys(scope.row[item.prop]).length>1">+{{Object.keys(scope.row[item.prop]).length-1}}</div>
                    </div>
                  </el-tooltip>
                </div>
              </template>
              <template v-if="item.prop == 'ifindex'">
                <span v-if="scope.row.edit==false">{{scope.row[item.prop]}}</span>
                <template v-else>
<!--                  <el-select v-model="scope.row[item.prop]" :disabled="assetSetting.host == null" size="mini" popper-class="no-style-class" @change="ifIndexChange(scope.row[item.prop],scope.row)" :class="{'input-error':isError(item.errRows,scope.$index),'transparent-pop':assetSetting.host == null}">-->
<!--                    <el-option v-for="(item,index) in ifIndexList" :label="item.label" :value="item.value" :key="item.value" :disabled="item.isOccupy"></el-option>-->
<!--                  </el-select>-->
                  <el-autocomplete
                    v-model="scope.row[item.prop]"
                    :class="{'input-error':isError(item.errRows,scope.$index)||ifIndexError,'transparent-pop':assetSetting.host == ''}"
                    :fetch-suggestions="loadIfIndex"
                    :debounce="300"
                    :trigger-on-focus="true"
                    popper-class="no-style-class"
                    size="mini"
                    :highlight-first-item="true"
                    @input="ifIndexInputChange(scope.row[item.prop],scope.row,scope.$index)"
                  ></el-autocomplete>
                </template>
              </template>
              <template v-if="item.prop == 'ifdescr'">
                <!--<span v-if="scope.row.edit==false">{{scope.row[item.prop]}}</span>
                <template v-else>
                  <el-input v-model="scope.row[item.prop]" size="small" clearable></el-input>
                </template>-->
                <span>{{scope.row[item.prop]}}</span>
              </template>
              <template v-if="item.prop == 'direction'">
                <template v-if="scope.row.edit==false">
                  <span v-if="scope.row[item.prop][0]">{{scope.row[item.prop][0]}}</span>
                  <span v-if="scope.row[item.prop][1]">{{scope.row[item.prop][1]}}</span>
                </template>
                <template v-else>
                  <el-checkbox-group :disabled="assetSetting.host == null" v-model="scope.row[item.prop]" class="direction-checkbox" :class="{'input-error':isError(item.errRows,scope.$index),'transparent-pop':assetSetting.host == null}">
                    <div class="input__inner">
                      <el-checkbox label="rx">RX</el-checkbox>
                      <el-checkbox label="tx" >TX</el-checkbox>
                    </div>
                  </el-checkbox-group>
                </template>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="" :width="30">
            <template slot-scope="scope">
              <el-button @click.stop="delTabRow(scope.$index,scope.row)" :disabled="assetSetting.host == null" style="width: 18px;height: 18px; line-height: 18px; padding:0;" size="mini"><i class="nz-icon nz-icon-minus"></i></el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-btn">
          <el-button @click="addTabRow"  style="height: 18px; line-height: 18px; padding-top: 0; padding-bottom: 0;" size="mini"><i class="nz-icon nz-icon-plus"></i></el-button>
        </div>
      </div>
      <sub-box ref="subBox" @after="refreshTabFunc"></sub-box>
      <loading ref="loading"></loading>
    </div>
</template>

<script>
  import subBox from "./subBox";
  import loading from "../../loading";
  import vm from "../../../../main";
  export default {
    name: "assetConfigTab",
    components:{
      'sub-box':subBox,
      'loading':loading,
    },
    props:{
      index:{},
      postAssetList:{type:Array,required:true},
      assetSetting:{type:Object},
      validateRepeatFunc:{type:Function},
    },
    data(){
      return {
        assetList:[],
        assetValidate:false,
        hostRepeat:false,
        hostInvalid:false,
        hostEmpty:false,
        refreshTab:true,
        tableLabels:[
          {
            label:'ifIndex',
            prop:'ifindex',
            width:100,
            required:true,
            errRows:[],
          },
          {
            label:'ifDescr',
            prop:'ifdescr',
            width:250,
            required:false,
            errRows:[],
          },
          {
            label:this.$t('config.dc.traffic.direction'),
            prop:'direction',
            width:200,
            required:true,
            errRows:[],
          },
          {
            label:this.$t('config.dc.traffic.tags'),
            prop:'tags',
            required:false,
            errRows:[],
          },
        ],
        ifIndexList:[],
        ifDescMap:new Map(),
        editTagsBox: {show: false, top: 0, left: 0,}, //param编辑弹框
        tempTagsObj:[],
        showTags:[],
        showTagInput:false,
        newTag:{key:'',value:''},
        hostTimer:null,
        ifIndexError:false,
      }
    },
    created() {
      this.assetList=Object.assign([],this.postAssetList);
      this.showTags=Object.assign([],this.assetSetting.tags)
    },
    methods:{
      clearAssetInput:function(){
        this.resetComponet();
      },
      refreshTabFunc:function(){
        this.refreshTab=false;
        this.$nextTick(()=>{
          this.refreshTab=true;
        });
      },
      resetComponet:function(){
        this.ifIndexList=[];
        this.assetSetting.assetId=null;
        this.assetSetting.configs=[];
        this.assetSetting.configs.push({
          direction:[],
          ifindex:null,
          ifdescr:' ',
          tags:{},
          edit:true,
        })
        this.tableLabels=this.tableLabels.map(item=>{
          item.errRows=[];
          return item;
        })
      },
      ifIndexChange:function(ifIndex,row){
        this.$set(row,'ifdescr',this.ifDescMap.get('ifDescr.'+ifIndex))
      },
      assetChanged:function(){
        if(!this.assetSetting||this.assetSetting.assetId == null){
          return ;
        }
        this.assetValidate=false;
        this.assetSetting.configs=[
          {
            direction:[],
            ifindex:null,
            ifdescr:' ',
            tags:{},
            edit:true,
          }
        ]
        this.queryInterfaceInfos(this.assetSetting.assetId,true);
      },
      queryInterfaceInfos:function(skipCommit=false){
        // this.$refs.loading.startLoading();
        let queryParams={
          operation:'walk',
          host:this.assetSetting.host,
          port:this.assetSetting.port,
          version:this.assetSetting.version,
          community:this.assetSetting.community,
          oid:'1.3.6.1.2.1.2.2.1',
          auth:this.assetSetting.auth,
        }
        this.$post('/mib/browser',queryParams).then(response=>{
          this.ifIndexList=[];
          this.ifDescMap.clear();
          if(response.code == 200){
            let resultList=response.data.list;
            let ifIndexList=resultList.filter(item=>{
              return /if(?:Index)\.\d+/.test(item.name);
            })

            this.ifIndexList=ifIndexList.map(item=>{
              return {label:item.value,value:item.value,isOccupy:false};
            })

            let ifDescrList=resultList.filter(item=>{
              return /if(?:Descr)\.\d+/.test(item.name);
            })
            this.ifDescrList=ifDescrList.filter(item=>{
              this.ifDescMap.set(item.name,item.value)
            })
            this.commitAdd(skipCommit);
            // this.$refs.loading.endLoading();
          }else{
            // this.$refs.loading.endLoading();
            console.error(response);
            // this.$message.error(response.msg)
          }
        })

      },
      loadIfIndex:function(queryString,cb){
        let result=Object.assign([],this.ifIndexList);
        result=result.filter(item=>{
          let temp=this.assetSetting.configs.find(c=>{
            return c.ifindex == item.value;
          })
          return typeof temp == "undefined";
        })
        cb(result)
      },
      queryAssetHosts:function(queryString,cb){
        let param={
          pageSize:-1,
          host:queryString,
        }
        this.$get('/asset',param).then(response=>{
          if(response.code == 200){
            let data=response.data.list;
            console.log(data)
            let result=data.map(item=>{
              return {label:item.host,value:item.host}
            })
            cb(result)
          }else{
            cb([]);
            console.error(response)
          }
        })
      },
      popShow() {

      },
      popHide() {
        console.log(this.assetSetting)
        this.queryInterfaceInfos(true);
      },
      showInput:function(){
        this.showTagInput=true;
      },
      handleInputConfirm:function(){

      },
      ifIndexInputChange:function(ifindex,row,index){
        if(this.ifIndexList && this.ifIndexList.length>0){
          // let temp=this.ifIndexList.find(item=>{
          //   return item.value == ifindex;
          // })
          // if(!temp){
          //   this.ifIndexError=true;
          //   return ;
          // }else{
          //   this.ifIndexError=false;
          // }
          this.ifIndexChange(ifindex,row)
          let tmp=this.assetSetting.configs.find((item,i)=>{
            return i != index && item.ifindex == ifindex;
          })
          if(tmp){
            this.ifIndexError=true;
            return ;
          }else{
            this.ifIndexError=false;
          }
        }else{
          this.ifIndexError=false;
        }
      },
      hostInputChange:function(value){
        if(this.hostTimer){
          clearTimeout(this.hostTimer);
        }
        this.hostTimer=setTimeout(()=>{
          this.validateHostRepeat(value);
          this.validateHostValid(value);
          if(!this.hostEmpty&&!this.hostRepeat&&!this.hostInvalid){
            this.queryInterfaceInfos(true);
          }
        },500)
      },
      validateHostEmpty:function(){
        this.hostEmpty=!this.assetSetting.host||this.assetSetting.host == '';
      },
      validateHostValid:function(host){
        if(host==''){
          return false
        }
        const hostReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\:\d{0,5})?$/
        if (hostReg.test(host)) {
          this.hostInvalid=false;
        } else {
          this.hostInvalid=true;
        }
      },
      validateHostRepeat:function(host){
        if(!this.validateRepeatFunc(host,this.index)){
          this.hostRepeat=true;
        }else{
          this.hostRepeat=false;
        }
      },
      changeRowEditState:function(row,column,event){
        if(this.validateRows()){
          this.commitAdd(false);
          if(row.edit == true){
            this.$set(row,'edit',false)
          }else{
            this.$set(row,'edit',true)
          }

        }
      },
      validateRows:function(){
        let validateFlag=true;
        validateFlag=this.assetSetting && this.assetSetting.host != '' ;
        if(!validateFlag){
          this.assetValidate=true;
          return validateFlag;
        }
        this.assetValidate=false
        this.tableLabels.forEach(item=>{
          item.errRows=[];
        })
        this.assetSetting.configs.forEach((config,index)=>{
          this.tableLabels.forEach(label=>{
            let value=config[label.prop]
            let required=label.required
            if(required &&(!value || (typeof value =='string' && value == '')||(value instanceof Array && value.length<1))){
              validateFlag=false
              label.errRows.push(index) //保存有错误的行的index，通过行列唯一定位有错误的输入框
            }else{
              if(label.prop == 'ifindex'){
                if(this.ifIndexList && this.ifIndexList.length>0) {
                  let temp = this.ifIndexList.find(item => {
                    return item.value == value;
                  })
                  if(!temp){
                    validateFlag=false
                    label.errRows.push(index) //保存有错误的行的index，通过行列唯一定位有错误的输入框
                  }
                }
              }
            }
          })
        })
        if(this.ifIndexError){
          validateFlag=false;
        }
        return validateFlag;
      },
      isError:function(columnErrRows,rowIndex){
        return columnErrRows.includes(rowIndex);
      },
      commitAdd:function(skipChangeEditState=false){
        this.resetIfIndexOccupyState();
        this.assetSetting.configs=this.assetSetting.configs.map((config)=>{
          if(!skipChangeEditState){
            this.$set(config,'edit',false)
          }
          this.changeIfIndexOccupyState(config.ifindex,true);
          return config
        })
      },
      addTabRow:function(){
        let validateFlag=this.validateRows();
        if(validateFlag){
          this.commitAdd();
          this.assetSetting.configs.push({
            direction:[],
            ifindex:null,
            ifdescr:' ',
            tags:{},
            edit:true,
          })
        }
      },
      delTabRow:function(index,row){
        if(this.assetSetting.configs.length>1){
          this.assetSetting.configs.splice(index,1);
          if(row.edit == true && this.ifIndexError == true){
            this.ifIndexError=false;
          }
          this.changeIfIndexOccupyState(row.ifindex,false)
        }
      },
      resetIfIndexOccupyState:function(){
        this.ifIndexList=this.ifIndexList.map(item=>{
          item.isOccupy=false;
          return item;
        })
      },
      changeIfIndexOccupyState:function(ifindex,state){
        this.ifIndexList=this.ifIndexList.map(item=>{
          if(item.value == ifindex){
            item.isOccupy=state;
          }
          return item;
        })
      },
      delSelf:function(){
        this.$emit('delSelf',this.index)
      },
      showEditTagsBox:function(show,index,row,e){
        if(this.assetSetting.host != '' && row.edit == true){
          this.$refs.subBox.showEditTagsBox(show,this.assetSetting.configs,index,e);
        }
      },
    },
    mounted() {
      if(this.assetSetting&&this.assetSetting.host&&this.assetSetting.host != ''){
        this.queryInterfaceInfos(true);
      }
    }
  }
</script>

<style scoped>
  .asset-config-tab{
    width: calc(100% - 30px);
    min-height: 100px;
    max-height: 400px;
    border: 1px solid lightgrey;
    border-radius: 5px;
    padding:10px 20px 10px 10px;
    margin: 0;
    margin-bottom: 10px;
    position: relative;
  }
  .asset-config-tab .add-btn{
    text-align: center;
  }
  .asset-config-tab #snmp-advanced{
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    height: 30px;
    position: relative;
    left: -4px;
    top:1px;
  }
  .asset-config-tab .right-box-row-with-btn{
    width: calc(100% - 69px);
  }
</style>
<style lang="scss">
  .tab-tags{
    width: 100%;
    height: 22px;
  }
  .tags-pop{
    width: 110px;
    text-align: center;
  }
  .tab-tags-item{
    display: flex;
    margin-bottom: 5px;
    height: 20px;
    line-height: 18px;
    justify-content: flex-end;
  }
  .tab-tags-item .tag-item-key{
    border:1px solid #409eff;;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    background-color: #409eff;
    width: 52px;
    color: white;
  }
  .tab-tags-item .tag-item-value{
    border:1px solid #409eff;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    background-color: #FFF;
    width: 52px;
  }
  .tab-tags-item .tag-item-text{
    background-color: #FFF;
    width: 20px;
  }
  .taffic-setting-tab .el-table__row:hover{
    .input__inner{
      border-color: #F0F0F0;
    }
  }
  .input__inner{
    border: 1px solid;
    border-color: white;
    border-radius: 4px;
    padding-left: 10px;
    background-color: white;
  }
  .input-error .el-input__inner,.input-error .el-input__inner:hover,.input-error .el-input__inner:focus,
  .input-error .input__inner,.input-error .input__inner:hover,.input-error .input__inner:focus {
   border-color: #F56C6C !important;
  }
  .direction-checkbox .el-checkbox{
    margin-right: 10px;
  }
  .direction-checkbox .el-checkbox__label{
    padding-left:0px
  }
  /*.taffic-setting-tab  td>.cell , .taffic-setting-tab td{
    text-align: center !important;
    padding:0 10px!important;
  }
  .taffic-setting-tab th>.cell{
    text-align: center !important;
    padding:0 10px!important;
  }*/
  .not-allowed:hover{
    cursor: not-allowed;
  }
  .asset-config-tab .asset-input .el-input__inner{
    border-top-right-radius: 0px !important;
    border-bottom-right-radius: 0px !important;
  }
  /*mib 移植*/
  .mib-browser-ad-search-item {
    margin-bottom: 10px;
  }
  .mib-browser-ad-search .el-radio-group .el-radio-button__inner {
    height: 24px;
    line-height: 0;
  }
  .mib-browser-ad-search-label {
    line-height: 24px;
  }
  .mib-browser-ad-search {
    width: 450px;
  }
</style>
