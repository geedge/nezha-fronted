<template>
    <div class="asset-config-tab">
      <el-form-item :label="$t('asset.asset')" size="small" class="right-box-form-content" ref="assetConfigForm" label-width="90px">
        <el-select class="right-box-row-with-btn" clearable @clear="clearAssetInput"  v-model="assetSetting.assetId" @change="assetChanged" popper-class="no-style-class" :class="{'input-error':assetValidate}">
          <el-option v-for="(item,index) in assetList" :label="item.host" :disabled="item.isOccupy" :value="item.id" :key="item.host+'-'+item.id"></el-option>
        </el-select>
        <div class="right-box-row-btn" @click="delSelf"><i class="el-icon-minus"></i></div>
      </el-form-item>
      <div class="endpoints-box-endpoints">
        <el-table :data="assetSetting.configs"
                  tooltip-effect="light"
                  v-scrollBar:el-table="'large'"
                  max-height="300"
                  height="200"
                  :row-class-name="assetSetting.assetId == null?'not-allowed':''"
                  @row-dblclick="changeRowEditState"
                  @row-click="validateRows"
                  class="taffic-setting-tab"
                  style="width: 100%;">
          <el-table-column
            label-class-name="endpoints-box-endpoints-title"
            :resizable="false"
            show-overflow-tooltip
            v-for="(item, index) in tableLabels"
            :width="item.width"
            :key="`col-${index}`"
            >
            <template slot="header">
              <span v-if="item.required == true"><span style="color: red;">*</span>{{item.label}}</span>
              <span v-else>{{item.label}}</span>
            </template>
            <template slot-scope="scope" :column="item">
              <template v-if="item.prop == 'tags'">
                <div v-if="scope.row.edit==false">{{scope.row[item.prop]}}</div>
                <template v-else>
                  <el-input @click.native.stop="showEditTagsBox(true,scope.$index,$event)" :disabled="assetSetting.assetId == null" v-model="scope.row[item.prop]" size="mini" :readonly="true" :class="{'input-error':isError(item.errRows,scope.$index),'transparent-pop':assetSetting.assetId == null}"></el-input>
                </template>
              </template>
              <template v-if="item.prop == 'ifindex'">
                <span v-if="scope.row.edit==false">{{scope.row[item.prop]}}</span>
                <template v-else>
                  <el-select v-model="scope.row[item.prop]" :disabled="assetSetting.assetId == null" size="mini" popper-class="no-style-class" @change="ifIndexChange(scope.row[item.prop],scope.row)" :class="{'input-error':isError(item.errRows,scope.$index),'transparent-pop':assetSetting.assetId == null}">
                    <el-option v-for="(item,index) in ifIndexList" :label="item.label" :value="item.value" :key="item.value" :disabled="item.isOccupy"></el-option>
                  </el-select>
                </template>
              </template>
              <template v-if="item.prop == 'ifdescr'">
                <span >{{scope.row[item.prop]}}</span>
              </template>
              <template v-if="item.prop == 'direction'">
                <template v-if="scope.row.edit==false">
                  <span v-if="scope.row[item.prop][0]">{{scope.row[item.prop][0]}}</span>
                  <span v-if="scope.row[item.prop][1]">{{scope.row[item.prop][1]}}</span>
                </template>
                <template v-else>
                  <el-checkbox-group :disabled="assetSetting.assetId == null" v-model="scope.row[item.prop]" class="direction-checkbox" :class="{'input-error':isError(item.errRows,scope.$index),'transparent-pop':assetSetting.assetId == null}">
                    <div class="input__inner">
                      <el-checkbox label="rx"></el-checkbox>
                      <el-checkbox label="tx"></el-checkbox>
                    </div>
                  </el-checkbox-group>
                </template>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="" :width="30">
            <template slot-scope="scope">
              <el-button @click.stop="delTabRow(scope.$index,scope.row.ifindex)" :disabled="assetSetting.assetId == null" style="width: 18px;height: 18px; line-height: 18px; padding:0;" size="mini"><i class="el-icon-minus"></i></el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-btn">
          <el-button @click="addTabRow"  style="height: 18px; line-height: 18px; padding-top: 0; padding-bottom: 0;" size="mini"><i class="el-icon-plus"></i></el-button>
        </div>
      </div>
      <sub-box ref="subBox"></sub-box>
      <loading ref="loading"></loading>
    </div>
</template>

<script>
  import subBox from "./subBox";
  import loading from "../../loading";
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
    },
    data(){
      return {
        assetList:[],
        assetValidate:false,
        tableLabels:[
          {
            label:'ifindex',
            prop:'ifindex',
            width:90,
            required:true,
            errRows:[],
          },
          {
            label:'ifdescr',
            prop:'ifdescr',
            width:100,
            required:false,
            errRows:[],
          },
          {
            label:'direction',
            prop:'direction',
            width:100,
            required:true,
            errRows:[],
          },
          {
            label:'tags',
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
      resetComponet:function(){
        this.ifIndexList=[];
        this.assetSetting.assetId=null;
        this.assetSetting.configs=[];
        this.assetSetting.configs.push({
          direction:[],
          ifindex:null,
          ifdescr:' ',
          tags:"",
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
            tags:"",
            edit:true,
          }
        ]
        this.queryInterfaceInfos(this.assetSetting.assetId,true);
      },
      queryInterfaceInfos:function(assetId,skipCommit=false){
        if(!assetId&&assetId !=''){
          return;
        }
        let asset=this.assetList.find(item=>{
          return item.id == assetId;
        })
        if(asset){
          this.$refs.loading.startLoading();
          let queryParams={
            operation:'walk',
            host:asset.host,
            port:161,
            version:2,
            community:'public',
            oid:'1.3.6.1.2.1.2.2.1',
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
                return {label:item.value,value:Number.parseInt(item.value),isOccupy:false};
              })

              let ifDescrList=resultList.filter(item=>{
                return /if(?:Descr)\.\d+/.test(item.name);
              })
              this.ifDescrList=ifDescrList.filter(item=>{
                this.ifDescMap.set(item.name,item.value)
              })
              this.commitAdd(skipCommit);
              this.$refs.loading.endLoading();
            }else{
              this.$refs.loading.endLoading();
              console.error(response);
              this.$message.error(response.msg)
            }
          })
        }
      },
      changeRowEditState:function(row,column,event){
        if(this.validateRows()){
          this.commitAdd(true);
          if(row.edit == true){
            this.$set(row,'edit',false)
          }else{
            this.$set(row,'edit',true)
          }

        }
      },
      validateRows:function(){
        let validateFlag=true;
        validateFlag=this.assetSetting && this.assetSetting.assetId != null ;
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
            }
          })
        })

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
            tags:"",
            edit:true,
          })
        }
      },
      delTabRow:function(index,ifindex){
        if(this.assetSetting.configs.length>1){
          this.assetSetting.configs.splice(index,1)
          this.changeIfIndexOccupyState(ifindex,false)
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
      showEditTagsBox:function(show,index,e){
        if(this.assetSetting.assetId != null){
          this.$refs.subBox.showEditTagsBox(show,this.assetSetting.configs,index,e);
        }
      },
    },
    mounted() {
      if(this.assetSetting&&this.assetSetting.assetId){
        this.queryInterfaceInfos(this.assetSetting.assetId,true);
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
</style>
<style lang="scss">
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
  .taffic-setting-tab  td>.cell , .taffic-setting-tab td{
    text-align: center !important;
    padding:0 10px!important;
  }
  .taffic-setting-tab th>.cell{
    text-align: center !important;
    padding:0 10px!important;
  }
  .not-allowed:hover{
    cursor: not-allowed;
  }
</style>
