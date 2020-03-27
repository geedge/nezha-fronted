<template>
  <transition name="right-box">
    <div class="right-box right-box-mib" v-if="rightBox.show" v-clickoutside="clickos" >
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button id="mib-del" type="button" v-if="currentMib.id != '' && rightBox.isEdit" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button v-if="!rightBox.isEdit" id="mib-save" type="button" @click="saveOrToEdit" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
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
        <el-form class="right-box-form" :model="currentMib" label-position="top" :rules="rules" ref="mibForm">
          <!--mib名称-->
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input v-if="rightBox.isEdit" placeholder="" maxlength="64" show-word-limit v-model.trim="currentMib.name" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentMib.name}}</div>
          </el-form-item>

          <el-form-item :label='$t("config.mib.models")' prop="models" :rules="[{validator:checkModels,trigger:'change'}]" class="add-required">
            <el-cascader
              v-if="rightBox.isEdit"
              :options="modelOptions"
              :props="modelProps"
              :show-all-levels="false"
              v-model="selectedModels"
              @change="selectedModelChange"
              ref="modelSelector"
              collapse-tags
              :placeholder="$t('config.mib.modelTip')"
              size="small"
              class="right-box-form-row"
              clearable></el-cascader>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">
              <span v-for="(n,i) in selectedModels" :key="n.name+'-'+n.id+'-'+i" >
                <template v-if="i < selectedModels.length-1">
                  {{n.name}}，
                </template>
                <template v-else>{{n.name}}</template>
              </span>
            </div>
          </el-form-item>
          <el-form-item :label="$t('config.mib.remark')" prop="remark">
            <el-input maxlength="512" rows="4" show-word-limit v-if="rightBox.isEdit" type="textarea" placeholder="" v-model.trim="currentMib.remark" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentMib.remark}}</div>
          </el-form-item>
          <el-form-item :label="$t('config.mib.mibFile')" prop="file" :rules="[{validator:checkMibFile,trigger:'change'}]" :class="{'add-required':!currentMib.id}">
            <el-upload v-if="rightBox.isEdit" :multiple="false" action="" :file-list="uploadFileList" :on-change="uploadChange"  :auto-upload="false" accept="" :on-remove="afterClearFile" ref="mibFileUpload">
              <div slot="tip" class="el-upload__tip" >
                <span v-if="!currentMib.fileName">{{$t('config.mib.uploadTip')}}</span>
                <span v-else>{{currentMib.fileName}}</span>
                <span v-if="uploadErrorMsg" style="color: #F56C6C"><br>{{uploadErrorMsg}}</span>
              </div>
              <button type="button" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
                <span class="top-tool-btn-txt" >{{$t('overall.upload')}}</span>
              </button>
            </el-upload>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentMib.fileName}}</div>
          </el-form-item>

        </el-form>
      </el-scrollbar>

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="model-box-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button v-if="rightBox.isEdit" @click="saveOrToEdit" id="model-box-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>

    </div>
  </transition>
</template>

<script>
  export default {
    name: "modelBox",
    props: {
      mib: Object
    },
    data() {
      let $temp=this;
      return {
        currentMib: {
          id: null,
          name: '',
          remark:'',
          models:'',
          file:null,
        },
        rightBox: {
          show: false,
          title: '',
          isEdit: false
        },
        rules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ]
        },
        checkMibFile : (rule, value, callback) => {
          setTimeout(() => {
            if(!$temp.currentMib.id){
              if(!$temp.uploadFile || !$temp.uploadFile.raw){
                $temp.uploadErrorMsg=$temp.$t('config.mib.requiredMibFile');
                return callback(new Error(' '));
              }else{
                $temp.uploadErrorMsg=null;
                return callback()
              }
            }else{
              $temp.uploadErrorMsg=null;
              return callback();
            }
          }, 200);
        },
        checkModels:(rule, value, callback)=>{
          setTimeout(() => {
            if(!$temp.currentMib.models||$temp.currentMib.models == ''){
              return callback(new Error($temp.$t('validate.required')))
            }else{
              return callback();
            }
          }, 200);
        },
        selectedModels:[],
        modelOptions:[],
        modelProps: { multiple: true ,emitPath:false},
        uploadFileList:[],
        uploadFile:null,
        uploadErrorMsg:null,
      }
    },
    created:function(){

    },
    methods: {
      show(show, isEdit) {
        this.rightBox.show = show;
        this.rightBox.isEdit = isEdit;
      },
      clickos() {
        this.rightBox.show = false;
      },
      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
      },
      queryModelInfos:function(){
        this.$get('model?pageSize=-1').then(response=>{
          if(response.code == 200){
            let modelInfos=response.data.list;
            let sortModels={};
            modelInfos.forEach((item)=>{
              if(!sortModels[item.type.value]){//没有这个assetType
                sortModels[item.type.value]={}
              }
              if(!sortModels[item.type.value][item.vendor.value]){
                sortModels[item.type.value][item.vendor.value]=[];
              }
              item.label=item.name;
              item.value=item.id;
              sortModels[item.type.value][item.vendor.value].push(item);
            })
            for (let assetType of Object.keys(sortModels)){
              let option={
                label:assetType,
                value:assetType,
                children:[]
              }
              for(let vendor of Object.keys(sortModels[assetType])){
                let child={
                  label:vendor,
                  value:vendor,
                  children: sortModels[assetType][vendor]
                }
                option.children.push(child);
              }
              this.modelOptions.push(option);
            }
          }
        })
      },
      selectedModelChange:function(nodes){
        let selectedNodes=this.selectedModels;
        if(selectedNodes && selectedNodes.length>0){
          let models='';
          for(let node of selectedNodes){
            models+=node+',';
          }
          this.currentMib.models=models.substr(0,models.length-1);
        }else{
          this.currentMib.models='';
        }
        this.$refs.mibForm.validateField('models')
      },
      uploadChange:function(file,fileList){
        console.log('fileChange')
        if (fileList.length > 0) {
          this.uploadFileList = [fileList[fileList.length - 1]]
          this.uploadFile = this.uploadFileList[0];
        }
        this.validateFile();
      },
      afterClearFile:function(file, fileList){
        this.uploadFileList = [];
        this.uploadFile = null;
        this.validateFile();
      },
      validateFile:function(){
        this.$refs.mibForm.validateField('file')
      },
      /*保存*/
      save() {
        this.$refs.mibForm.validate((valid) => {
          if (valid) {
            let form = new FormData();
            form.append('name',this.currentMib.name);
            form.append('remark',this.currentMib.remark);
            form.append('models',this.currentMib.models);
            form.append('file',this.uploadFile&&this.uploadFile.raw?this.uploadFile.raw:null);
            if(!this.currentMib.id){
              this.$post('/mib',form,{'Content-Type': 'multipart/form-data'}).then(response=>{
                if(response.code==200 && response.msg=='success'){
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc();
                  this.$emit('after');
                }else{
                  this.$message.error(response.msg);
                }
              })
            }else{
              form.append('id',this.currentMib.id);
              this.$put('/mib',form,{'Content-Type': 'multipart/form-data'}).then(response=>{
                if(response.code==200 && response.msg=='success'){
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc();
                  this.$emit('after');
                }else{
                  this.$message.error(response.msg);
                }
              })
            }
          }
        })
      },
      saveOrToEdit: function() {
        if (!this.rightBox.isEdit) {
          this.rightBox.isEdit = true;
          this.rightBox.title = this.$t("config.mib.editMib") + "  ID：" + this.currentMib.id;
        } else {
          this.save();
        }
      },
      clearData:function(){
        this.currentMib={
          id: null,
          name: '',
          remark:'',
          file:'',
          models:'',
        }
        this.uploadFile=null;
        this.uploadFileList=[];
        this.selectedModels=[];
        this.uploadErrorMsg=null;
      },
      /*删除*/
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("mib?ids=" + this.currentMib.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.rightBox.show = false;
              this.$emit("reload");
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
    },
    mounted() {
      this.queryModelInfos();
    },
    computed: {
    },
    watch: {
      mib: {
        immediate: true,
        deep:true,
        handler(n, o) {
          this.currentMib = Object.assign({},n);
          if(this.currentMib.modelsDetail && this.currentMib.modelsDetail.length>0){
            for(let model of this.currentMib.modelsDetail){
              model.label=model.name;
              model.value=model.id;
              this.selectedModels.push(model);
            }
          }else{
            this.selectedModels=[];
          }
          if (n && n.id) {
            this.rightBox.title =this.rightBox.isEdit? this.$t("config.mib.editMib") + "  ID：" + n.id : this.$t("config.mib.mib") + "  ID：" + n.id ;
          } else {
            this.rightBox.title = this.$t("config.mib.createMib");
          }
        }
      },
    }
  }
</script>

<style>
  .right-box-mib .right-box-form-row{
    margin-top:0;
    width: 100%;
  }
  .add-required .el-form-item__label:before{
    content: '*';
    color: #F56C6C;
    margin-right: 4px;
  }
</style>
<style scoped>
  /*去除上传文件动画start*/
  /*.upload-demo {*/
  /*  display: flex;*/
  /*}*/
  /deep/ .el-list-enter-active,
  /deep/ .el-list-leave-active {
    transition: none;
  }
  .nz-tab {
    margin-bottom: 22px;
    margin-left: 13px;
  }
  /deep/ .el-list-enter,
  /deep/ .el-list-leave-active {
    opacity: 0;
  }
  /deep/ .el-upload-list {
    height: 40px;
  }
  /*去除上传文件动画end*/
</style>
