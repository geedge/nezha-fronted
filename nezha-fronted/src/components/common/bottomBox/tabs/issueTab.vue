<template>
  <div>
 <el-container>
  <el-container>
    <el-header >
        <span>this is a title</span>
        <div>
            <ul id="menu">
                <li>
                    <i class="nz-icon nz-icon-label"></i>
                    <div>
                        <span>{{ this.issuedetailsData.type }}</span>
                        <span class="describe">Type</span>
                    </div>
                </li>
                  <li>
                    <i class="nz-icon nz-icon-label"></i>
                    <div>
                        <span>{{ priorityEnums(issuedetailsData.priority) }}</span>
                        <span class="describe">Priority</span>
                    </div>
                </li>
                  <li>
                    <i class="nz-icon nz-icon-label"></i>
                    <div>
                        <span>{{ stateEnums(this.issuedetailsData.state) }}</span>
                        <span class="describe">state</span>
                    </div>
                </li>
                  <li>
                    <i class="nz-icon nz-icon-user"></i>
                    <div>
                        <span>{{ this.issuedetailsData.reporter.username }}</span>
                        <span class="describe" >Reporter</span>
                    </div>
                </li>
                  <li>
                    <i class="nz-icon nz-icon-user"></i>
                    <div>
                        <span>{{ this.issuedetailsData.assignee.username }}</span>
                        <span class="describe">Assignee</span>
                    </div>
                </li>
            </ul>
        </div>
    </el-header>
    <el-main>
           <div>
            <span class="description" >
                <i class="nz-icon nz-icon-arrow-right fold" v-if="foldShow" @click="foldFun"></i>
                <i class="nz-icon nz-icon-arrow-down  open" v-if="openShow" @click="openFun"></i>
            </span>
            <span class="description-title">Description</span>
            <div class="description-content"  v-if="openShow" v-html="this.contents">
            </div>
           </div>
              <div class="relate-assets-box">
            <span class="relate-assets" >
                <i class="nz-icon nz-icon-arrow-right fold" v-if="assetsfoldShow" @click="assetsfoldFun"></i>
                <i class="nz-icon nz-icon-arrow-down  open" v-if="assetsopenShow" @click="assetsopenFun"></i>
            </span>
            <span class="relate-assets-title">Relate-assets</span>
            <div class="relate-assets-content"  v-if="assetsopenShow "  >
                 <div v-for="(item, index) in this.assets" :key="index"  >{{item.name}}</div>
            </div>
           </div>
    </el-main>
    <!-- <el-footer>Footer</el-footer> -->
  </el-container>
    <el-aside width="400px" class="aside-box">
        <span>动态</span>
        <template>
                <el-tabs v-model="activeName" @tab-click="handleClick">
                    <el-tab-pane label="全部" name="first">
                        <div class="change ">
                            <i class="nz-icon nz-icon-edit"></i>
                            <span>老王 Created issue {{this.time}}</span>
                             <!-- <div v-for="(item, index) in changeData" :key="index" v-html="item.content" ></div> -->
                        </div>
                        <div class="content first-content">
                               <i class="nz-icon nz-icon-edit"></i>
                            <span>老王 Add comment {{this.time}}</span>
                               <div class="content-data" v-for="(item, index) in contentData" :key="index" v-html="item.content" ></div>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="评论" name="content">
                        <div class="content">
                               <i class="nz-icon nz-icon-edit"></i>
                            <span>老王 Add comment {{this.time}}</span>
                            <div class="content-data" v-for="(item, index) in contentData" :key="index" v-html="item.content" ></div>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="变更记录" name="change">
                        <div class="change">
                            <i class="nz-icon nz-icon-edit"></i>
                            <span>老王 Created issue {{this.time}}</span>
                            <!-- <div  v-html="this.changeData" ></div> -->
                        </div>
                    </el-tab-pane>
                </el-tabs>
        </template>
         <el-footer class="footer-box">
            <div class="add-comment-btn">
            <el-button type="text" v-if="addcommentShow"  @click="addcommentBtn">Add comment</el-button>

             <div v-if="textareaShow" class="textareas">
                <el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4}"
                placeholder="多行输入"
                v-model="textarea">
                </el-input>
               <div class="btn-box">
                 <el-button size="mini" @click="addFun">Add</el-button>
                <el-button size="mini" @click="cancelBtn">Cancel</el-button>
               </div>
             </div>
        </div>
        </el-footer>
    </el-aside>
</el-container>
  </div>
</template>

<script>
export default {
  name: 'issueTab',
  data () {
    return {
      url: '/issue',
      activeName: 'first',
      textareaShow: false, // 底部输入框显示状态
      addcommentShow: true, // 底部按钮显示状态
      openShow: false, // 展开折叠图标显示状态
      foldShow: true, // 展开折叠图标显示状态
      assetsopenShow: false, // 展开折叠图标显示状态
      assetsfoldShow: true, // 展开折叠图标显示状态
      textarea: '', // 底部输入框内容
      issuedetailsData: [], // issue详情data
      changeData: [], // 变更data
      contentData: [], // 评论data
      assets: [],
      contents: [],
      time: '',
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  created () {
    this.axiosss()
  },
  methods: {
    handleNodeClick (data) {
      console.log(data)
    },
    handleClick (tab, event) {
      console.log(tab, event)
    },
    addcommentBtn () {
      this.textareaShow = true
      this.addcommentShow = false
    },
    cancelBtn () {
      this.textareaShow = false
      this.addcommentShow = true
    },
    // 处理后台返回的html特殊标签   ----已经弃用 之前有插件处理
    delHtmlTag (str) {
      return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/ig, '')
    },
    addFun () {
      const params = {
        issueId: 1,
        content: this.textarea
      }
      this.$post('/issue/activity', params).then(response => { // 问题动态 新增
        if (response.code === 200) {
        //   console.log(response, 1)
          this.axiosss()
        }
      })
    },
    axiosss () {
      this.$get(`${this.url}/${1}`).then(response => { // issue详情接口
        if (response.code === 200) {
          this.issuedetailsData = response.data
          this.contents = this.issuedetailsData.content
          this.assets = this.issuedetailsData.assets
          //   console.log(this.issuedetailsData, 3)
        }
      })
      this.$get(`${this.url}/activity?issueId=1&type=1&pageSize=-1`).then(response => { // issue动态详情接口-变更记录
        if (response.code === 200) {
          this.changeData = response.data.list
          this.time = response.time
          console.log(response.time)
        //   console.log(this.changeData, 1)
        //   console.log(response.data, 2)
        }
      })
      this.$get(`${this.url}/activity?issueId=1&type=2&pageSize=-1`).then(response => { // issue动态详情接口-评论
        if (response.code === 200) {
          this.contentData = response.data.list
        //   console.log(this.contentData, 2)
        }
      })
    },
    // priority 枚举转换
    priorityEnums (data) {
      if (data == 1) {
        data = '高'
      } else if (data == 2) {
        data = '中'
      } else {
        data = '低'
      }
      return data
    },
    // state 枚举转换
    stateEnums (data) {
      if (data == 1) {
        data = '打开'
      } else if (data == 2) {
        data = '已指派'
      } else if (data == 3) {
        data = '处理中'
      } else if (data == 4) {
        data = '挂起'
      } else if (data == 5) {
        data = '已解决'
      } else if (data == 6) {
        data = '关闭'
      } else if (data == 7) {
        data = '取消'
      }
      return data
    },
    foldFun () {
      this.openShow = true
      this.foldShow = false
    },
    openFun () {
      this.openShow = false
      this.foldShow = true
    },
    assetsfoldFun () {
      this.assetsopenShow = true
      this.assetsfoldShow = false
    },
    assetsopenFun () {
      this.assetsopenShow = false
      this.assetsfoldShow = true
    }
  }
}
</script>

<style>
 #menu {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
 }
 #menu li {
  display: flex;
  flex-wrap: wrap;
  width: 200px;
  height: 80px;
  margin-top: 40px;
  position: relative;
 }
 #menu li i{
    font-size: 40px;
    margin-right: 10px;
 }
 #menu li .describe {
    position: absolute;
    bottom: 40px;
    right: 100px;
    width: 50px;
    /* color: $--color-text-regular; */
 }
  #menu li i,div{
  line-height: 100%;
 }
 .theme-light  .el-header{
    height: 150px !important;
    padding: 20px !important;
  }

  .theme-light  .el-aside {
    height: 630px !important;
     padding: 20px !important;
  }

 .theme-light  .el-main {
    height: 480px !important;
     padding: 20px !important;
  }
  body > .el-container {
    margin-bottom: 40px;
  }

  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }

  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
  .el-tabs {
    margin-top: 20px !important;
  }
  .footer-box{
    position: relative;
    height: 130px !important;
  }
  .add-comment-btn{
    position: absolute;
    bottom: 0px;
    left: 0px;
    /* border: rgba(180, 176, 176, 0.847) 1px solid; */
    width: 395px;
    height: 40px;
    line-height: 100%;
  }
.theme-light .el-button--text{
    margin-left: 15px !important;
  }
  .textareas{
    width: 395px;
    position: absolute;
    bottom: 50px;
    left: 0px;
  }
  .btn-box{
    position: absolute;
    /* bottom: -40px; */
    right: 45px;
  }
  .description{
    position: relative;
    line-height: 100%;
  }
 .description i {
    position: absolute;
    top: 0px;
    left: 0px;
    cursor:pointer;/*鼠标变小手*/
    border: 1px solid;
}
.description-title {
    margin-left: 20px;
}
.description-content {
    margin-left: 20px;
    margin-top: 12px;
    white-space:pre-wrap;
}
.relate-assets-box {
    margin-top: 20px;
}
.relate-assets{
     position: relative;
    line-height: 100%;
}
.relate-assets i {
    position: absolute;
    top: 0px;
    left: 0px;
    cursor:pointer;/*鼠标变小手*/
    border: 1px solid;
}
.relate-assets-title {
    margin-left: 20px;
}
.relate-assets-content {
    margin-left: 20px;
    margin-top: 12px;
}
.relate-assets-content div{
    margin-top: 12px;
}
.content-data{
    margin-top: 10px;
    margin-left: 20px;
}
.first-content{
    border-bottom: 1px solid;
    border-top: 1px solid;
    margin-top: 20px;
    padding-top: 10px;
    padding-bottom: 10px;
}
.ql-container.ql-snow{
    border: 0 !important;
}
.theme-light .el-textarea{
    width: 350px !important;
}
</style>
