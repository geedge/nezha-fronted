<template>
  <div class="right-box right-box-mib" v-clickoutside="clickOutside" >
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns">
      <button id="mib-del" type="button" v-if="editMib.id" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editMib.id ? ($t("config.mib.editMib") + "  ID：" + editMib.id) : $t("config.mib.createMib")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box">
      <el-form class="right-box-form  right-box-form-left" :model="editMib" label-position="right" label-width="120px" :rules="rules" ref="mibForm">
        <el-form-item :label='$t("config.mib.models")' prop="models" :rules="[{validator:checkModels,trigger:'change'}]" >
          <el-cascader
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
        </el-form-item>
        <el-form-item :label="$t('config.mib.remark')" prop="remark">
          <el-input maxlength="512" rows="4" show-word-limit type="textarea" placeholder="" v-model="editMib.remark" size="small"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.mib.mibFiles')" prop="file" :rules="[{validator:checkMibFile,trigger:'change'}]" :class="{'add-required':!editMib.id}">
          <el-upload drag :multiple="false" action="" :file-list="uploadFileList" :on-change="uploadChange" :auto-upload="false" accept="" :on-remove="afterClearFile" ref="mibFileUpload" class="mib-upload right-box-form-row">
            <div slot="tip" class="el-upload__tip" >
              <span v-if="editMib.fileName">{{editMib.fileName}}</span>
              <span v-if="uploadErrorMsg" style="color: #F56C6C"><br>{{uploadErrorMsg}}</span>
            </div>
            <i class="nz-icon nz-icon-upload"></i>
            <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-scrollbar>

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc(false)" id="model-box-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="model-box-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>

  </div>
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
        editMib: {},
        rules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ]
        },
        checkMibFile : (rule, value, callback) => {
          setTimeout(() => {
            if(!$temp.editMib.id){
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
            if(!$temp.editMib.models||$temp.editMib.models == ''){
              // return callback(new Error($temp.$t('validate.required')))
              return callback();
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
    methods: {
      clickOutside() {
        this.esc(false);
      },
      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
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
          this.editMib.models=models.substr(0,models.length-1);
        }else{
          this.editMib.models='';
        }
        this.$refs.mibForm.validateField('models')
      },
      uploadChange(file,fileList) {
        if (fileList.length > 0) {
          this.uploadFileList = [fileList[fileList.length - 1]];
          this.uploadFile = this.uploadFileList[0];
        }
        this.validateFile();
      },
      afterClearFile(file, fileList) {
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
            form.append('name',this.editMib.name);
            form.append('remark',this.editMib.remark);
            form.append('models',this.editMib.models);
            form.append('file', this.uploadFile && this.uploadFile.raw ? this.uploadFile.raw : null);
            if(!this.editMib.id){
              this.$post('/mib', form, {'Content-Type': 'multipart/form-data'}).then(response=>{
                if(response.code==200 && response.msg == 'success'){
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                }else{
                  this.$message.error(response.msg);
                }
              })
            }else{
              form.append('id',this.editMib.id);
              this.$put('/mib',form,{'Content-Type': 'multipart/form-data'}).then(response=>{
                if(response.code==200 && response.msg=='success'){
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                }else{
                  this.$message.error(response.msg);
                }
              })
            }
          }
        })
      },
      /*删除*/
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("mib?ids=" + this.editMib.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
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
        deep: true,
        handler(n, o) {
          this.editMib = JSON.parse(JSON.stringify(n));
          if(this.editMib.models){
            this.selectedModels = this.editMib.models.split(',');
          }else{
            this.selectedModels = [];
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
  .mib-upload .el-upload{
    width: 100%;
  }
  .mib-upload /deep/.el-upload-dragger{
    width: 100% !important;
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
  .el-upload .nz-icon-upload{
    font-size: 67px;
    color: #c0c4cc;
    margin: 40px 0 16px;
    line-height: 50px;
    display: inline-block;
  }
  /*去除上传文件动画end*/
</style>
