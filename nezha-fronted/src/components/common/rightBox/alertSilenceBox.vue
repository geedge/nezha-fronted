<template>
  <div class="right-box right-box-alert-config" v-clickoutside="{obj:editAlertSilence,func:clickOutside}">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien" id="alert-box-del" type="button"
              v-has="'alert_silence_delete'" v-if="alertSilence.id">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editAlertSilence.id ? $t("alert.silence.edit") + " ID：" + editAlertSilence.id :
      $t("alert.silence.create")}}
    </div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form class="right-box-form right-box-form-left" :model="editAlertSilence" label-position="top"
               label-width="120px" :rules="rules" ref="alertSilenceForm">
        <el-form-item :label='$t("alert.silence.time")' prop="time" class="range-time">
          <div>
            <el-radio-group v-model="rangeTime" size="small" @change="rangeTimeChange">
              <el-radio-button label="1">1 hour</el-radio-button>
              <el-radio-button label="2">2 hour</el-radio-button>
              <el-radio-button label="6">6hour</el-radio-button>
              <el-radio-button label="12">12 hour</el-radio-button>
              <el-radio-button label="24">1 day</el-radio-button>
              <el-radio-button label="48">2 day</el-radio-button>
              <el-radio-button label="168">1 week</el-radio-button>
            </el-radio-group>
          </div>
          <div class="datepicker">
            <div class="datepicker-box">
              <span class="datepicker-title">start time</span>
              <el-date-picker prefix-icon=" " class="panel-time-picker-hidden " size="mini" ref="calendar"
                              format="yyyy/MM/dd HH:mm:ss" @change="(val)=>{dateChange(val,'startAt')}" v-model="editAlertSilence.startAt"
                              :picker-options="optionsStartAt"
                              type="datetime"
                              :clearable="false"
                              popper-class="panel-time-picker-popper"
                              :placeholder="$t('dashboard.panel.startTime')"
                              align="right"
              >
              </el-date-picker>
            </div>
            <div class="datepicker-box">
              <span class="datepicker-title">end time</span>
              <el-date-picker prefix-icon=" " class="panel-time-picker-hidden " size="mini" ref="calendar"
                              format="yyyy/MM/dd HH:mm:ss" @change="(val)=>{dateChange(val,'endAt')}" v-model="editAlertSilence.endAt"
                              :picker-options="optionsEndAt"
                              type="datetime"
                              :clearable="false"
                              popper-class="panel-time-picker-popper"
                              :placeholder="$t('dashboard.panel.startTime')"
                              align="right"
              >
              </el-date-picker>
            </div>
            <!--( :range-separator="")-->
          </div>
        </el-form-item>

        <el-form-item :label='$t("alert.silence.matcher")' prop="matcher" class="matcher">
          <div class="matcher-type">
            <div class="matcher-type-title">Alert rule</div>
            <el-select v-model="editAlertSilence.ruleId" filterable @change="matcherChange" :popper-append-to-body="false" size="small" class="matcher-type-content">
              <el-option
                v-for="item in ruleList"
                :key="item.id"
                :label="item.alertName"
                :value="item.id">
              </el-option>
            </el-select>
          </div>

          <div class="matcher-type">
            <el-select class="matcher-type-title matcher-type-header" v-model="editAlertSilence.type" :popper-append-to-body="false" size="small" @change="typeChange">
              <el-option
                v-for="item in typeList"
                :key="item.type"
                :label="item.name"
                :value="item.type">
              </el-option>
            </el-select>
            <div class="matcher-type-content">
              <select-alert-silence :filter-silence="filterSilence" :silence-data="silenceData" :panel-lock="false" :placement="'bottom-start'" :typeContentLoading="typeContentLoading"
                                   @selectSilence="silenceChange" ref="selectPanel" style="width: 300px;">
                <template v-slot:header>
                  <div class="panel-select-header">
                    <el-input :placeholder="$t('overall.search')" clearable size="mini" style="width: 340px; margin-right: 5px;" v-model="filterSilence" id="panel-list-search"></el-input>
                  </div>
                </template>

                <template v-slot:trigger>
                  <el-input class="panel-name" placeholder="" readonly="readonly" v-model="editAlertSilence.name" size="small">
                  </el-input>
                </template>
              </select-alert-silence>
            </div>
          </div>
        </el-form-item>

        <el-form-item :label='$t("alert.silence.reason")' prop="reason" class="range-time">
          <el-input
            type="textarea"
            :placeholder="$t('alert.description')"
            v-model="editAlertSilence.reason"
            maxlength="512"
            show-word-limit>

          </el-input>
        </el-form-item>


      </el-form>

    </div>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button v-cancel="{obj:editAlertSilence,func:esc}" id="alert-box-esc"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="alert-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
  import bus from '../../../libs/bus';
  import selectAlertSilence from '../alert/selectAlertSilence'
  export default {
    name:"alertSilenceBox",
    components:{
      selectAlertSilence,
    },

    props:{
      alertSilence:Object
    },
    watch:{
      alertSilence:{
        deep:true,
        immediate:true,
        handler(n,o){
          let obj=JSON.parse(JSON.stringify(n))
          if(obj.ruleId==-1){
            obj.ruleId=null;
          }
          if(obj.linkId==-1){
            obj.linkId=null;
          }
          this.editAlertSilence=Object.assign(this.editAlertSilence,obj);
          this.startAtTamp=new Date(this.editAlertSilence.startAt).getTime();
          this.endAtTamp=new Date(this.editAlertSilence.endAt).getTime();
          this.editAlertSilence.time=this.startAtTamp;
          this.rangeTimeCallback();
          this.typeChange(this.editAlertSilence.type,obj.linkId);
          if(obj.linkId || obj.ruleId){
            this.matcherChange()
          }
        }
      }
    },
    data(){
      let that=this;
      let validate = (rule, value, callback) => {
        if(!this.editAlertSilence.startAt){
          callback(new Error('请选择开始时间!'));
        }else if(!this.editAlertSilence.endAt){
          callback(new Error('请选择结束时间!'));
        } else{
          callback();
        }
      };
      return {
        editAlertSilence:{
          id:'',
          startAt:'',
          endAt:'',
          ruleId:'',
          type:'',
          linkId:'',
          reason:'',
          time:[],
          matcher:'',
          name:''
        },
        rules:{
          time: [
            // { required: true, message: this.$t('alert.silence.selectTime'), trigger: 'change' },
            { required: true, trigger: 'change'},
            { validator: validate, trigger: 'change' }
          ],
          matcher:[
            { required: true, message: this.$t('alert.silence.selectMather'), trigger: 'change' },
          ]
        },
        rangeTime:'',
        ruleList:[],
        filterSilence:'',
        silenceData:[],
        typeContentLoading:false,
        typeList:[
          {type:'datacenter',name:'Datacenter'},
          {type:'project',name:'Project'},
          {type:'module',name:'Module'},
          {type:'endpoint',name:'Endpoint'},
          {type:'asset',name:'Asset'},
        ],
        datacenterData:null,
        assetData:null,
        projectData:null,
        moduleData:null,
        endpointData:null,
        startAtTamp:'',
        endAtTamp:'',
      }
    },
    mounted(){
      this.getRuleList()
    },
    methods:{
      clickOutside(){
        this.esc(false);
      },
      esc(refresh){
        this.prevent_opt.save=false;
        this.$emit("close",refresh);
      },
      save(){
        if(this.prevent_opt.save){
          return
        }
        ;
        this.prevent_opt.save=true;
        this.editAlertSilence.matcher=this.editAlertSilence.ruleId || this.editAlertSilence.linkId ;
        this.$refs.alertSilenceForm.validate((valid)=>{
          if(this.endAtTamp < this.startAtTamp){
            this.$message({
              message: '结束时间必须大于开始时间',
              type: 'error'
            });
            return;
          }
          let params={...this.editAlertSilence};
          delete  params.time;
          delete  params.matcher;
          if(valid){
            if(this.editAlertSilence.id){
              this.$put('/alert/silence',params).then(response=>{
                this.prevent_opt.save=false;
                if(response.code===200){
                  this.$message({duration:1000,type:'success',message:this.$t("tip.saveSuccess")});
                  this.esc(true);
                }else{
                  this.$message.error(response.msg);
                }
              });
            }else{
              this.$post('alert/silence',params).then(response=>{
                this.prevent_opt.save=false;
                if(response.code===200){
                  this.$message({duration:1000,type:'success',message:this.$t("tip.saveSuccess")});
                  this.esc(true);
                }else{
                  this.$message.error(response.msg);
                }
              });
            }
          }else{
            this.prevent_opt.save=false;
            return false;
          }
        })
      },
      del(){
        if(this.prevent_opt.save){
          return
        }
        ;
        this.prevent_opt.save=true;
        this.$confirm(this.$t("tip.confirmDelete"),{
          confirmButtonText:this.$t("tip.yes"),
          cancelButtonText:this.$t("tip.no"),
          type:'warning'
        }).then(()=>{
          this.$delete("/alert/silence?ids="+this.editAlertSilence.id).then(response=>{
            this.prevent_opt.save=false;
            if(response.code===200){
              this.$message({type:'success',message:this.$t("tip.deleteSuccess")});
              this.esc(true);
            }else{
              this.$message.error(response.msg);
            }
          })
        }).catch(()=>{
          this.prevent_opt.save=false;
        });
      },
      getRuleList(){
        this.$get('alert/rule',{pageNo:1,pageSize:-1}).then(response=>{
          if(response.code==200){
            this.ruleList=response.data.list;
          }
        })
      },
      dateChange(val,type){
        if(type==='startAt'){
          this.editAlertSilence.startAt=bus.timeFormate(new Date(val), 'yyyy-MM-dd hh:mm:ss');
          this.startAtTamp=new Date(val).getTime();
        } else if(type==='endAt'){
          this.editAlertSilence.endAt=bus.timeFormate(new Date(val), 'yyyy-MM-dd hh:mm:ss');
          this.endAtTamp=new Date(val).getTime();
        }
        this.$forceUpdate
        this.rangeTimeCallback()
      },
      rangeTimeCallback(){
        if(this.editAlertSilence.time){
          let num=new Date(this.editAlertSilence.endAt).getTime() - new Date(this.editAlertSilence.startAt).getTime();
          this.rangeTime=num/(60*60*1000);//以小时为单位
        }else{
          this.rangeTime=null;
        }
      },
      rangeTimeChange(val){
        let arr=[bus.timeFormate(bus.getOffsetTimezoneData(),'yyyy-MM-dd hh:mm:ss'),bus.timeFormate(bus.getOffsetTimezoneData(val*1),'yyyy-MM-dd hh:mm:ss')]
        this.$set(this.editAlertSilence,'startAt',arr[0]);
        this.$set(this.editAlertSilence,'endAt',arr[1]);
        this.startAtTamp=new Date(this.editAlertSilence.startAt).getTime();
        this.endAtTamp=new Date(this.editAlertSilence.endAt).getTime();
        this.$forceUpdate
      },
      matcherChange(val){
        this.editAlertSilence.matcher=this.editAlertSilence.ruleId || this.editAlertSilence.linkId;
      },
      silenceChange(val){
        this.editAlertSilence.linkId=val.id;
        this.editAlertSilence.matcher=this.editAlertSilence.ruleId || this.editAlertSilence.linkId;
        if(this.editAlertSilence.type==='datacenter'){
          this.editAlertSilence.name=val.name;
        }
        if(this.editAlertSilence.type==='asset'){
          this.editAlertSilence.name=val.sn
        }
        if(this.editAlertSilence.type==='project'){
          this.editAlertSilence.name=val.name;
        }
        if(this.editAlertSilence.type==='module'){
          this.editAlertSilence.name=val.name;
        }
        if(this.editAlertSilence.type==='endpoint'){
          this.editAlertSilence.name=val.name;
        }



      },
      typeChange(val,linkId){
        let firstArr=[]
        let secondArr=[];
        let thirddiArr=[];
        this.typeContentLoading=true;
        this.editAlertSilence.linkId=linkId?linkId:'';
        this.editAlertSilence.name='';
        if(val==='datacenter'){
          this.$get('idc',{pageNo:1,pageSize:-1}).then(response=>{
            if(response.code==200){
              firstArr=response.data.list;
              if(linkId){
                this.editAlertSilence.name=firstArr.find(item=>item.id===linkId).name;
              }
              this.silenceData=firstArr;
              this.datacenterData=firstArr;
              this.typeContentLoading=false;
            }
          })
        }

        if(val==='asset'){
          this.$get('asset?pageNo=1&pageSize=-1').then(res=>{
            if(res.code==200){
              let arr=[];
              res.data.list.forEach(asset=>{
                asset.name=asset.sn;
                if(linkId===asset.id){
                  this.editAlertSilence.name=asset.name;
                }
                let idcF=arr.find(idc=>idc.id===asset.idc.id);
                if(idcF){
                  idcF.children.push(asset);
                } else{
                  let idc={...asset.idc};
                  idc.children=[asset];
                  arr.push(idc);
                }
              })
              this.silenceData=arr;
              this.assetData=arr;
              this.typeContentLoading=false;
            }
          })
        }

        if(val==='project'){
          this.$get('project',{pageNo:1,pageSize:-1}).then(response=>{
            if(response.code==200){
              firstArr=response.data.list;
              if(linkId){
                this.editAlertSilence.name=firstArr.find(item=>item.id===linkId).name;
              }
              this.silenceData=firstArr;
              this.projectData=firstArr;
              this.typeContentLoading=false;
            }
          })
        }


        if(val==='module'){
          this.$get('module?pageNo=1&pageSize=-1').then(res=>{
            if(res.code==200){
              let arr=[];
              res.data.list.forEach(module=>{
                if(linkId===module.id){
                  this.editAlertSilence.name=module.name;
                }
                let projectF=arr.find(project=>project.id===module.project.id)
                if(projectF){
                  projectF.children.push(module);
                } else{
                  let project={...module.project};
                  project.children=[module];
                  arr.push(project);
                }
              })
              this.silenceData=arr;
              this.moduleData=arr;
              this.typeContentLoading=false;
            }
          })
        }

        if(val==='endpoint'){
          this.$get('endpoint?pageNo=1&pageSize=-1').then(res=>{
           if(res.code=200){
             let arr=[];
             res.data.list.forEach(item=>{
               item.name=item.host;
               if(linkId===item.id){
                 this.editAlertSilence.name=item.name;
               }
               let projectF = arr.find(project=>item.project.id===project.id);
               if(projectF){
                 let moduleF = projectF.children.find(module=>module.id===item.module.id);
                 if(moduleF){
                   moduleF.children.push(item)
                 } else{
                   projectF.children.push({...item.module,children:[item]});
                 }
               } else {
                 let project={...item.project};
                 project.children=[{...item.module,children:[item]}]
                 arr.push(project);
               }
             });
             this.silenceData=arr;
             this.endpointData=arr;
             this.typeContentLoading=false;
           }
          });

        }

      },
    }
  }
</script>

<style scoped lang="scss">
  .range-time {
    /deep/ .el-radio-button--small .el-radio-button__inner, /deep/ .el-radio-group {
      width: 100%
    }

    /deep/ .el-radio-button {
      width: 14.2%
    }

    /deep/ .el-date-editor.el-range-editor.el-input__inner.panel-time-picker-hidden.el-date-editor--datetimerange.el-range-editor--mini {
      width: 100%;
    }

    .datepicker {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      .datepicker-box{
        width: 48%;
        flex: 1;
        position: relative;
        /deep/ .el-date-editor.el-input, /deep/ .el-date-editor.el-input__inner{
          width: 100%;
        }
        /deep/ .el-input__inner{
          text-align: center;
        }
        .datepicker-title{
          position: absolute;
          left: 15px;
          z-index: 1;
        }
      }
    }
  }
  .matcher{
    /deep/ .el-input__prefix{
      left: 0;
    }
    /deep/ .el-form-item__error{
      left: 126px;
      padding-top: 10px;
    }
    .matcher-type{
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      .matcher-type-title{
        width: 125px;
        background:#E7EAED;
        font-family: ArialMT;
        font-size: 14px;
        color: #333333;
        letter-spacing: 0;
        font-weight: 400;
        text-align: center;
      }
      /deep/ .matcher-type-title.el-select--small .el-input__inner{
        background:#E7EAED;
        font-family: ArialMT;
        font-size: 14px;
        color: #333333;
        letter-spacing: 0;
        font-weight: 400;
        text-align: center;
        border: none;
      }
      .matcher-type-content{
        flex: 1;
      }
    }
  }
</style>
