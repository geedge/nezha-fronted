<template>
  <div class="export-xlsx">
    <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light">
      <slot name="optionZone"></slot><button @mouseenter="exportMenuHandler(true)" @mouseleave="exportMenuHandler(false)" class="nz-btn nz-btn-size-normal nz-btn-style-light export-dropdown-btn" id="browser-go">
        <i class="el-icon-arrow-down"></i>
        <transition name="el-zoom-in-top">
          <ul class="el-dropdown-menu el-popper el-dropdown-menu--mini export-dropdown" v-show="exportShow">
            <li @click="showImportBox(1)" class="el-dropdown-menu__item dropdown-content"><i class="el-icon-upload2"></i>import</li>
            <li @click="showImportBox(2)" class="el-dropdown-menu__item dropdown-content"><i class="el-icon-download"></i>export</li>
          </ul>
        </transition>
      </button>
      <!--<el-dropdown split-button type="primary" size="mini" class="dropdownBtn">
        <slot name="optionZone" class="option-button"></slot><el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="showImportBox(1)" class="dropdown-content"><i class="el-icon-upload2"></i>{{$t('overall.importExcelLower')}}</el-dropdown-item>
          <el-dropdown-item @click.native="showImportBox(2)" class="dropdown-content"><i class="el-icon-download"></i>{{$t('overall.exportExcelLower')}}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>-->
    </div>

    <el-dialog :visible.sync="importBox.show" :title="importBox.title" :modal-append-to-body='false' :show-close="true" :width="importBox.width" @close="closeDialog" class="nz-dialog" :close-on-click-modal="importBox.type!=3">
      <div v-if="importBox.type==1">
        <div class="upload-body">
          <el-upload drag class="upload-demo" ref="uploadExcel"  action="" :file-list="importFileList" :on-change="importChange"  :auto-upload="false" accept=".xlsx,.xls">
            <div slot="tip" class="el-upload__tip" >{{$t('overall.importTip')}}</div>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
            <!--<button type="button" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
              <span class="top-tool-btn-txt" >{{$t('overall.upload')}}</span>
            </button>-->
          </el-upload>
        </div>
        <div slot="footer" class="footer">
          <div class="el-message-box__btns" style="text-align: right;">
            <button @click="downloadTemplate"  class="el-button el-button--default el-button--small">
              <span>{{$t('overall.template')}}</span>
            </button>
            <button  @click="importExcel"  class="el-button el-button--default el-button--small">
              <span>{{$t('overall.importExcel')}}</span>
            </button>
            <button @click="closeDialog"  class="el-button el-button--default el-button--small" >
              <span>{{$t('overall.cancel')}}</span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="importBox.type == 2">
        <div class="upload-body">
          <button @click="exportCur"  class="el-button el-button--default el-button--small">
            <span>{{$t('overall.exportCur')}}</span>
          </button>
          <button  @click="exportAll"  class="el-button el-button--default el-button--small">
            <span>{{$t('overall.exportAll')}}</span>
          </button>
        </div>
        <div slot="footer" class="footer">
        </div>
      </div>
      <div v-if="importBox.type==3">
          <div class="upload-body result-body">
            <div>
              <span class="result-title">{{$t('overall.result.total')}}:</span>
              <span>{{importResult&&importResult.totalNum?importResult.totalNum:0}}</span>
            </div>
            <div>
              <span class="result-title">{{$t('overall.result.failed')}}:</span>
              <span>{{importResult&&importResult.failNum?importResult.failNum:0}}</span>
              <span class="result-title">{{$t('overall.result.success')}}:</span>
              <span>{{importResult&&importResult.successNum?importResult.successNum:0}}</span>
            </div>
            <div>
              <div class="result-title">{{$t('overall.result.failedDetail')}}:</div>
              <el-scrollbar style="height: 100%">
                <div class="result-detail" v-if="importResult&&importResult.failDetail">
                  <ul>
                    <li v-for="(item,index) in importResult.failDetail"><span>{{item.lineNo}}</span>:<span>{{item.errorMsg}}</span> </li>
                  </ul>
                </div>
              </el-scrollbar>
            </div>
          </div>
          <div slot="footer" class="footer">
            <div class="el-message-box__btns">
              <button @click="rollbackImport"  class="el-button el-button--default el-button--small">
                <span>{{$t('overall.rollbackImport')}}</span>
              </button>
              <button  @click="closeDialog"  class="el-button el-button--default el-button--small">
                <span>{{$t('overall.cancel')}}</span>
              </button>
            </div>
          </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios'
  var timeout;
  export default {
    name: "exportXLSX",
    props:{
      exportUrl:{type:String,required:true},
      params:{type:Object},
      exportFileName:{type:String},
      importUrl: {type:String,required:true},
    },
    data:function(){
      return {
        importBox:{show:false,title:this.$t('overall.importExcel'),type:1},
        importFile:null,
        importFileList:[],
        importResult:null,
        exportShow: false,
      }
    },
    created(){
    },
    methods: {
      importChange:function(file,fileList){
        if (fileList.length > 0) {
          this.importFileList = [fileList[fileList.length - 1]]
        }
        this.importFile = this.importFileList[0];
        this.validateFile();
      },
      validateFile:function(){

      },
      rollbackImport:function(){
        let url;
        if (this.importUrl.indexOf("asset") > -1) {
          url = "/asset/cancelImport";
        } else if (this.importUrl.indexOf("endpoint") > -1) {
          url = "/endpoint/cancelImport";
        }
        this.$delete(url + '?seq='+this.importResult.seq).then(response=>{
          if(response.code ==  200 ){
            this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
          }else{
            this.$message.error(response.msg);
          }
          this.closeDialog();
        })
      },
      importExcel:function(){
        if(this.importFile && this.importFile.raw){
          let form = new FormData();
          form.append('excelFile',this.importFile.raw);
          this.$post(this.importUrl,form,{'Content-Type': 'multipart/form-data'}).then(response=>{
            if(response.code==200 && response.msg=='success'){
              this.importResult=response.data;
              this.$emit('afterImport')
              this.importBox.type=3;
              this.importBox.width='600px';
            }else{
              this.$message.error(response.msg);
            }
          })
        }
      },
      exportMenuHandler(show) {
        if (show) {
          clearTimeout(timeout);
          this.exportShow = true;
        } else {
          timeout = setTimeout(() => {
            this.exportShow = false;
          }, 700);
        }
      },
      closeDialog:function(){
        this.importBox.show=false;
        this.importResult=null;
        this.importFileList=[];
        this.importFile=null;
      },
      downloadTemplate:function(){
        let language=localStorage.getItem('nz-language-' + localStorage.getItem('nz-username')) || 'en'; //初始未选择默认 en 英文
        let fileName=this.exportFileName+'-'+'template'+'.xlsx';
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.responseType = "blob";
        xmlHttp.onload=function(){
          if(this.status === 200){
            let blob=this.response;
            let reader = new FileReader();
            reader.readAsDataURL(blob); // 转换为base64，可以直接放入a标签href
            reader.onload = function(e) {
              // 转换完成后创建a标签下载
              let a = document.createElement('a');
              a.download = fileName;
              a.href = e.target.result;
              document.body.appendChild(a);
              a.click();
              a.remove();
            }
          }
        }
        xmlHttp.open("GET",'/static/template/'+language+'/'+fileName,true);
        xmlHttp.send();
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => v[j]))
      },
      exportCur:function(){
        this.exportExcel();
        this.closeDialog();
      },
      exportAll:function(){
        let params=JSON.parse(JSON.stringify(this.params));
        params.pageSize=-1;
        this.exportExcel(params);
        this.closeDialog();
      },
      exportExcel:function(params){
        let temp=this;
        if(!params){
          params=temp.params;
        }
        axios.get(this.exportUrl,{responseType:'blob',params:params}).then(res=>{
          let fileName=temp.exportFileName+'-'+temp.getTimeString()+'.xlsx';
          if(window.navigator.msSaveOrOpenBlob){
            // 兼容ie11
            let blobObject = new Blob([res.data]);
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
          }else{
            let url = URL.createObjectURL(new Blob([res.data]));
            let a = document.createElement('a');
            document.body.appendChild(a); //此处增加了将创建的添加到body当中
            a.href = url;
            a.download = fileName;
            a.target = '_blank';
            a.click();
            a.remove(); //将a标签移除
          }
        })
      },
      showImportBox:function(type){
        this.importBox.show=true;
        this.importBox.type=type;
        if(type == 1){//import
          this.importBox.title=this.$t('overall.importExcel');
          this.importBox.width='600px';
        }else if(type == 2){//export
          this.importBox.title=this.$t('overall.exportExcel');
          this.importBox.width='300px';
        }
      },
      getTimeString:function(){
        let split='-';
        let date=new Date();
        let year=date.getFullYear();
        let month=this.formatNum(date.getMonth()+1);
        let day=this.formatNum(date.getDate());
        let hours=this.formatNum(date.getHours());
        let minutes=this.formatNum(date.getMinutes());
        let seconds=this.formatNum(date.getSeconds());
        console.log(day)
        return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds;
      },
      formatNum:function(num){
        return num>9?num:'0'+num;
      }
    }
  }
</script>

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
