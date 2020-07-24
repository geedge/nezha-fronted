<template>
  <transition name="right-box">
    <div class="right-box right-box-cabinet" v-if="rightBox.show" v-clickoutside="esc">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button id="cab-del" type="button" v-if="curCabinet.id != '' && rightBox.isEdit" @click="delCabinet" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button v-if="!rightBox.isEdit" id="cab-save" type="button" @click="" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-edit"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.edit')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box">
        <el-form class="right-box-form right-box-form-left" label-width="120px" label-position="right" :model="cabinet" ref="cabinetForm" :rules="rules">
          <el-form-item :label="$t('asset.name')" prop="name">
            <el-input size='mini' v-model="cabinet.name" v-if="rightBox.isEdit"/>
            <div class="right-box-form-content-txt" v-if="!rightBox.isEdit">{{cabinet.name}}</div>
          </el-form-item>
          <el-form-item :label="$t('asset.DC')" prop="idcId">
            <el-input size='mini' v-model="curIdc.name" v-if="rightBox.isEdit" disabled/>
            <div class="right-box-form-content-txt" v-if="!rightBox.isEdit">{{idc?idc.name:''}}</div>
          </el-form-item>
          <el-form-item :label="$t('asset.uSize')" prop="uSize">
            <el-input v-model.number="cabinet.uSize" :max="47" ></el-input>
<!--            <el-slider v-model.number="cabinet.uSize" :max="47" v-if="rightBox.isEdit"></el-slider>-->
          </el-form-item>
          <el-form-item :label="$t('config.dc.remark')">
            <el-input size='mini' v-model="cabinet.remark" type="textarea" :rows="2" v-if="rightBox.isEdit"/>
            <div class="right-box-form-content-txt" v-if="!rightBox.isEdit">{{cabinet.remark}}</div>
          </el-form-item>
        </el-form>
      </el-scrollbar>

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="cab-box-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button @click="saveOrEdit" id="cab-box-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>

    </div>
  </transition>
</template>

<script>
    export default {
      name: "cabinetBox",
      props:{
        curCabinet:{type:Object},
        curIdc:{type:Object}
      },
      data(){
        return {
          rightBox:{show:false,title:'',isEdit:true},
          cabinet:{
            id:'',
            idcId:'',
            name:'',
            remark:'',
            seq:'',
            uSize:1
          },
          rules:{
            name: [
              {required: true, message: this.$t('validate.required'), trigger: 'blur'}
            ],
            uSize: [
              {required: true,  message: this.$t('validate.required'), trigger: 'blur'},
              {type: 'number', min: 1, max: 47,message: this.$t('validate.uSize'),trigger: 'blur'}
            ],
          },
        }
      },
      created() {
        this.getIdcDatas();
      },
      methods:{
        reset:function(){
          this.cabinet={
              id:null,
              idcId:this.curIdc.id,
              name:'',
              remark:'',
              seq:'',
              uSize:1
          };
        },
        show(show, isEdit) {
          this.rightBox.show = show;
          this.rightBox.isEdit = isEdit;
        },
        getIdcDatas:function(){
          let temp=this;
          if(temp.postIdcDatas&&temp.postIdcDatas.length>0){
            temp.idcDatas=temp.postIdcDatas;
            for (let i in temp.idcDatas){
              let item=temp.idcDatas[i];
              if(item.id==temp.cabinet.idcId){
                temp.idc=item;
                break;
              }
            }
            return;
          }
          temp.$get('idc').then(response => {
            if (response.code === 200) {
              temp.idcDatas = response.data.list;
              for (let i in temp.idcDatas){
                let item=temp.idcDatas[i];
                if(item.id==temp.cabinet.idcId){
                  temp.idc=item;
                  break;
                }
              }
            }
          })
        },
        esc() {
          this.rightBox.show = false;
        },
        saveOrEdit:function(){
          let temp=this;
          temp.$refs.cabinetForm.validate((valid => {
            if(valid){
              temp.cabinet.idcId=temp.curIdc.id;
              if (temp.cabinet.id) {
                this.$put('cabinet', temp.cabinet).then(res => {
                  const h = temp.$createElement;
                  if (res.code === 200) {
                    temp.$message({duration: 2000, type: 'success', message: temp.$t("tip.saveSuccess")});
                    temp.$emit("after",temp.cabinet.idcId);
                    temp.esc();
                  } else {
                    temp.$message.error(res.msg);
                  }
                })
              } else {
                temp.$post('cabinet', temp.cabinet).then(res => {
                  const h = temp.$createElement;
                  if (res.code === 200) {
                    temp.$message({duration: 2000, type: 'success', message: temp.$t("tip.saveSuccess")});
                    temp.$emit("after",temp.cabinet.idcId);
                    temp.esc();
                  } else {
                    temp.$message.error(res.msg);
                  }
                })
              }
            }else{
              return false;
            }
          }))
        },
        delCabinet:function(){
          let temp=this;
          this.$confirm(this.$t("tip.confirmDelete"), {
            confirmButtonText: this.$t("tip.yes"),
            cancelButtonText: this.$t("tip.no"),
            type: 'warning'
          }).then(() => {
            this.$delete('/cabinet?ids='+temp.cabinet.id).then(response=>{
              if(response.code ==  200){
                this.esc();
                this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
                this.$emit('after',this.cabinet.idcId)
              }else{
                this.$message.error(response.msg);
              }
            })
          })
        }
      },
      watch:{
        curCabinet:{
          deep:true,
          immediate:true,
          handler:function(n,o){
            if (n) {
              this.cabinet=JSON.parse(JSON.stringify(n));
            }
          }
        },
        cabinet:{
          deep:true,
          immediate:true,
          handler:function(n,o){
            this.rightBox.title = n && n.id ? this.$t('asset.title') + "  ID：" + n.id : this.$t('asset.cabinet');
          }
        }
      }
    }
</script>
<style >
</style>
