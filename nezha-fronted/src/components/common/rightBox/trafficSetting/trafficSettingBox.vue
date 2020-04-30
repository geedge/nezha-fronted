<template>
  <transition name="right-box">
    <div class="right-box right-box-project" v-if="rightBox.show" v-clickoutside="clickos" >
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">

        <button v-if="!rightBox.isEdit" id="project-edit" type="button" @click="saveOrToEdit" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-edit"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.edit')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->
      <el-scrollbar class="right-box-form-box">
        <el-form class="right-box-form" :model="traffic" label-width="100px" label-position="left" :rules="rules" ref="trafficForm">
          <el-form-item :label="$t('config.dc.dc')" size="small">
            <el-input :disabled="true" v-model="dcObj.name"></el-input>
          </el-form-item>
          <traffic-setting-tab ref="trafficSetting" :post-asset-list="assetList" v-for="(item,index) in traffic.setting" :index="index" :asset-setting="item" :key="uuids[index]" :id="uuids[index]" @delSelf="delAssetSetting" ></traffic-setting-tab>
          <button @click="addAssetSetting" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100" style="margin:5px 1px">{{$t('config.dc.traffic.add')}}</button>
        </el-form>
      </el-scrollbar>

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="project-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button v-if="rightBox.isEdit" @click="saveOrToEdit" id="project-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
  import trafficSettingTab from "./trafficSettingTab";
  import {getUUID} from "../../js/common";

  export default {
    name: "trafficSettingBox",
    components:{
      'traffic-setting-tab':trafficSettingTab
    },
    props:{
      dcObj:{
        type:Object,
        required:true
      },
    },
    data(){
      return{
        assetList:[],
        rightBox: {
          show: false,
          title: this.$t('config.dc.traffic.title'),
          isCreate: false,
          isEdit:false
        },
        uuids:[],
        traffic:{
          idcId:'',
          setting:[
            {
              host:'',
              port:161,
              community:'public',
              version:2,
              auth:{
                username:'',
                securityLevel:'',
                securityLevel:'',
                authProtocol:'',
                privProtocol:'',
                privPassword:'',
              },
              configs:[
                {
                  direction:[],
                  ifindex:null,
                  ifdescr:' ',
                  tags:"",
                  edit:true,
                }
              ]
            }
          ]
        },
        rules:{}
      }
    },
    created() {

    },
    methods:{
      addAssetSetting:function(){
        let valid=this.validateTabs();
        if(valid){

          this.uuids.push(getUUID());
          this.traffic.setting.push({
            host:'',
            port:161,
            community:'public',
            version:2,
            auth:{
              username:'',
              securityLevel:'',
              securityLevel:'',
              authProtocol:'',
              privProtocol:'',
              privPassword:'',
            },
            configs:[
              {
                direction:[],
                ifindex:null,
                ifdescr:' ',
                tags:"",
                edit:true,
              }
            ]
          })
        }
      },
      getEmptyTraffic:function(){
        let obj={
          host:'',
          port:161,
          community:'public',
          version:2,
          auth:{
            username:'',
            securityLevel:'',
            securityLevel:'',
            authProtocol:'',
            privProtocol:'',
            privPassword:'',
          },
          configs:[
            {
              direction:[],
              ifindex:null,
              ifdescr:' ',
              tags:"",
              edit:true,
            }
          ]
        }
        return Object.assign({},obj)
      },
      validateTabs:function(){
        let valid=true;
        for(let i=0;i<this.$refs.trafficSetting.length;i++){
          let component=this.$refs.trafficSetting[i];
          valid=component.validateRows();
          if(!valid){
            break
          }
        }
        return valid;
      },
      delAssetSetting:function(index){
        this.uuids.splice(index,1);
        this.traffic.setting.splice(index,1)
      },
      show(show,isEdit) {
        this.rightBox.show = show;
        this.rightBox.isEdit=isEdit;
        this.queryTrafficSettings();
      },

      clickos() {
        this.esc();
      },

      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
      },
      /*保存*/
      save() {
        let valid=this.validateTabs();
        if (valid) {
          //拆解数据
          let result={
            idcId:this.dcObj.id,
            setting:[],
          }
          this.traffic.setting.forEach(assetSetting=>{
            let assetId=assetSetting.assetId;
            assetSetting.configs.forEach(config=>{
              let settingItem={
                assetId:assetId,
                direction:config.direction.toString(),
                ifindex:config.ifindex,
                ifdescr:config.ifdescr,
                tags:config.tags,
              }
              result.setting.push(settingItem);
            })
          })

          this.$put('/idc/trafficSetting',result).then(response=>{
            if(response.code == 200){
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.rightBox.show = false;
            }else{
              console.error(response.msg)
              this.$message.error(response.msg);
            }
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      },
      saveOrToEdit: function() {
        if (!this.rightBox.isEdit) {
          this.rightBox.isEdit = true;
          this.rightBox.title = this.$t("project.project.editProject") + "  ID：" + this.project.id;
        } else {
          this.save();
        }
      },
      queryTrafficSettings:function(){
        this.$get('/idc/trafficSetting?id='+this.dcObj.id).then(response=>{
            if(response.code == 200){
              let list=response.data.list;
              if(list.length>0){
                let map=new Map();
                list.forEach(item=>{
                  let arr=map.get(item.host);
                  if(arr){
                    arr.push(item)
                    map.set(item.host,arr);
                  }else{
                    map.set(item.host,[item])
                  }
                })
                this.traffic={
                  idcId:this.dcObj.id,
                  setting:[],
                }
                let keys=map.keys();
                for(let key of keys){//settings 为同一asset下的设置集合
                  let configs=map.get(key);
                  let settingItem={
                    host:configs[0].host,
                    port:configs[0].port,
                    community:configs[0].community,
                    version:configs[0].version,
                    auth:configs[0].auth,
                    configs:[],
                  }
                  configs.forEach(item=>{
                    let config={
                      direction:item.direction&&item.direction!=''?item.direction.split(','):[],
                      ifindex:item.ifindex,
                      ifdescr:item.ifdescr,
                      tags:item.tags,
                      edit:false,
                    }
                    settingItem.configs.push(config);
                  })
                  this.traffic.setting.push(settingItem)
                }
              }else{
                this.traffic={
                  idcId:'',
                  setting:[
                    {
                      host:'',
                      port:161,
                      community:'public',
                      version:2,
                      auth:{
                        username:'',
                        securityLevel:'',
                        securityLevel:'',
                        authProtocol:'',
                        privProtocol:'',
                        privPassword:'',
                      },
                      configs:[
                        {
                          direction:[],
                          ifindex:null,
                          ifdescr:' ',
                          tags:"",
                          edit:true,
                        }
                      ]
                    }
                  ]
                }
              }
              for(let i =0;i<this.traffic.setting.length;i++){
                this.uuids.push(getUUID())
              }
            }else{
              console.error(response.msg)
              this.$message.error(response.msg)
            }
        })
      },
      queryAssetList:function(){
        let queryParams={
          pageSize:-1,
          idcId:this.dcObj.id,
        }
        this.assetList=[];
        this.$get('/asset',queryParams).then(response=>{
          if(response.code == 200){
            let temp=response.data.list;
            this.assetList=temp.map((item,index)=>{
              item.isOccupy=false;
              return item;
            })
          }else{
            console.log('query asset informations faild,cause :'+response.msg)
            this.$message.error(response.msg);
          }
        })
      },
    },
    watch:{
      dcObj:{
        immediate:true,
        deep:true,
        handler(){
          this.queryAssetList();
        }
      }
    }
  }
</script>

<style scoped>

</style>
