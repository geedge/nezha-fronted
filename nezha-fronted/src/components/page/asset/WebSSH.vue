<template>
    <div>
        <div class="title">
            <div class="submenu">
                <el-menu class="el-menu-demo" mode="horizontal">
                    <el-submenu index="1">
                        <template slot="title">操作</template>
                        <el-menu-item index="1-1">
                            <template>
                                <span @click.once="cloneChat">克隆会话</span>
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
                <input style="height: 20px;width: 250px" v-model="order"></input>
                <button @click="sendOrder">发送</button>
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
                        drag
                        class="upload-demo"
                        ref="upload"
                        action=""
                        :on-change="handleChange"
                        :auto-upload="false"
                >
                  <i class="nz-icon nz-icon-upload"></i>
                  <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
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
  name: 'WebSSH',
  components: {
    'my-terminal': Console
  },
  data() {
    return {
      flag:false,
      assetData: '',
      terminal: {
        pid: 1,
        name: 'terminal',
        cols: 400,
        rows: 400
      },
      dialogVisible: false,
      obj: {
        id: ''
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
      order:'',
      enableAsset: '',
      accountId: '',
      routeData: this.$route.query,
      token: '',
      width: '',
      height: `${document.documentElement.clientHeight}`,
      witdh: `${document.documentElement.clientWidth}`,
    }
  },
  watch: {
    routeData(newVal) {
      if (newVal) {
        this.getIDCOptionData(this.routeData)
      }
    },
    accountId(newVal) {
      if (newVal) {
        this.getToken(newVal)
      }
    },
  },
  methods: {
    createCli(item) {
      let routeData = this.$router.resolve({
        name: "newChat",
        query: {
          host: item.host,
          accountId: item.accounts[0].id
        }
      });
      window.open(routeData.href);
    },
    cloneChat() {
      let routeData = this.$router.resolve({
        name: "cloneChat",
        query: {
          accountId: this.accountId,
          host: this.routeData.host
        }
      });
      window.open(routeData.href);
    },
    getIDCOptionData(data) {
      this.$get('account?assetId=' + data.id).then(response => {
        if (response.code === 200) {
          this.accountId = response.data.list[0].id
        }
      })
    },
    getSize(height, width) {
      const _this = this
      setTimeout(function () {
        _this.setSize(height, width)
      }, 1000);
    },
    getToken(data) {
      this.obj.id = data
      this.$post('account/ssh.do', this.obj).then(res => {
        if (res.code === 200) {
          this.token = res.data.token
          sessionStorage.setItem('cliToken', this.token)
        }
      })
    },
    sendOrder(){
      let form = new FormData();
      form.append("token", this.token);
      form.append("cmd", this.order);
      this.$post('account/sendAll.do', form).then(res => {
      })
    },
    setSize(height, width) {
      let form = new FormData();
      form.append("token", this.token);
      form.append("cols", parseInt(20));
      form.append("rows", parseInt(20));
      form.append("height", parseInt(height));
      form.append("width", parseInt(width));
      this.$post('account/resize.do', form).then(res => {
        console.log(res)
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
    handleChange(file) {
      this.uploadFile.file = file.raw
    },
    beforeunloadFn(e) {

    }
  },
  created() {
    window.addEventListener('beforeunload', e => this.beforeunloadFn(e))
  },
  mounted() {
    this.getAssetData()
    if (this.routeData) {
      this.getIDCOptionData(this.routeData)
      this.host = this.routeData.host
      document.title = this.host
    }
    window.onresize = () => {
      return (() => {
        let height = `${document.documentElement.clientHeight}`;
        let width = `${document.documentElement.clientWidth}`;
        this.getSize(height, width)
      })();
    };

    // let _this = this
    // window.onbeforeunload = function (e) {
    //   if (_this.$route.name === "terminal") {
    //     e = e || window.event;
    //     // 兼容IE8和Firefox 4之前的版本
    //     if (e) {
    //       console.log(e)
    //       e.returnValue = "提示：/“退出系统/”请点系统的/“安全退出/”!"; ;
    //     }
    //   } else {
    //     window.onbeforeunload = null
    //   }
    // };
  },
  beforeDestroy(){

  }
}
</script>

<style scoped>
.title {
    display: inline-block;
}

.submenu {
    float: left;
    width: 500px;
    font-size: 22px;

}

.title-input {
    position: absolute;
    left: 300px;
    top: 19px
}
</style>
