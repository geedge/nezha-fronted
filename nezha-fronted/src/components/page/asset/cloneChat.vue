<template>
    <div>
        <div class="title">
            <div class="submenu">
                <el-menu class="el-menu-demo" mode="horizontal">
                    <el-submenu index="1">
                        <template slot="title">操作</template>
                        <el-menu-item index="1-1">
                            <template>
                                <span @click="cloneChat">克隆会话</span>
                            </template>
                        </el-menu-item>
                        <el-menu-item index="1-2">
                            <template>
                                <span @click="dialogVisible = true">上传文件</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                    <el-submenu index="2">
                        <template slot="title">打开</template>
                        <template v-for="(item, index) in enableAsset">
                            <el-menu-item :index="'2-' + index" @click="createCli(item)">{{item.host}}</el-menu-item>
                        </template>
                    </el-submenu>
                </el-menu>
            </div>
            <div class="title-input">
                <input style="height: 20px;width: 250px"></input>
                <button>发送</button>
            </div>
        </div>

        <el-dialog
                :visible="dialogVisible"
                width="30%"
                :modal="true">
            <label>文件路径</label>
            <el-input v-model="uploadFile.path"></el-input>
            <div style="padding-top: 20px">
                <el-upload
                        class="upload-demo"
                        ref="upload"
                        action=""
                        :on-change="handleChange"
                        :auto-upload="false"
                >
                    <el-button size="small" type="primary">{{$t('asset.createAssetTab.clickToUpload')}}</el-button>
                </el-upload>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="upload">确 定</el-button>
            </span>
        </el-dialog>
        <my-terminal :terminal="terminal" :token="token"></my-terminal>
    </div>
</template>

<script>
import Console from './Console'
export default {
  name: 'cloneChat',
  components: {
    'my-terminal': Console
  },
  data() {
    return {
      dialogVisible: false,
      terminal: {
        pid: 1,
        name: 'terminal',
        cols: 400,
        rows: 400
      },
      obj:{
        id:''
      },
      uploadFile: {
        file: '',
        path: '',
        token: ''
      },
      pageObj: {
        pageNo: 1,
        pageSize: 100,
      },
      enableAsset:'',
      host:'',
      token:'',
      routeData: this.$route.query,
    }
  },
  watch: {
  },
  methods: {
    createCli(item){
      let routeData = this.$router.resolve({
        name: "newChat",
        query: {
          host: item.host,
          accountId:item.accounts[0].id
        }
      });
      window.open(routeData.href);
    },
    cloneChat(){
      let routeData = this.$router.resolve({
        name: "cloneChat",
        query: {
          host:this.routeData.host,
          accountId:this.routeData.accountId
        }
      });
      window.open(routeData.href);
    },
    getConnect(id,token) {
      this.$get('account/reopen.do?id='+id+"&token="+token).then(res => {
        if (res.code === 200) {
          this.token = res.data.token
          console.log(this.token)
          sessionStorage.setItem("cliToken", this.token);
        }
      })
    },
    handleChange(file) {
      this.uploadFile.file = file.raw
    },
    upload() {
      this.uploadFile.token = this.token
      let form = new FormData();
      form.append("token", this.token);
      form.append("file", this.uploadFile.file);
      form.append("path", this.uploadFile.path);
      this.$post('account/upload.do', form).then(res => {
        if (res.code === 200) {
          console.log(res)
        }
      })
    },
    getAssetData() {
      this.$get('asset', this.pageObj).then(response => {
        if (response.code === 200) {
          this.assetData = response.data.list;
          this.enableAsset = this.assetData.filter(item => {
            return item.accounts.length > 0
          })
        }
      })
    },
  },
  mounted() {
    if (this.routeData) {
      this.host = this.routeData.host
      document.title = this.host
    }
    this.getAssetData()
    if(sessionStorage.getItem('cliToken')){
      console.log(this.routeData.accountId,sessionStorage.getItem('cliToken'))
      this.getConnect(this.routeData.accountId,sessionStorage.getItem('cliToken'))
    }
  },
}
</script>

<style scoped>
.title{
    display: inline-block;
}
.submenu {
    float: left;
    width: 500px;
    font-size: 22px;

}
.title-input{
    position: absolute;
    left: 300px;
    top:19px
}
</style>
