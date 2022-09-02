<template>
  <div>
 <el-container>
  <el-container class="issuetab-container">
    <el-header class="issuetab-header">
        <span class="title">this is a title</span>
        <div>
            <ul id="menu">
                <li class="menu-li">
                    <i class="nz-icon nz-icon-label menu-i"></i>
                    <div class="menu-div">
                        <span>{{ this.issuedetailsData.type }}</span>
                        <span class="describe">Type</span>
                    </div>
                </li>
                  <li class="menu-li">
                    <i class="nz-icon nz-icon-label menu-i"></i>
                    <div class="menu-div">
                        <span>{{ priorityEnums(issuedetailsData.priority) }}</span>
                        <span class="describe">Priority</span>
                    </div>
                </li>
                  <li class="menu-li">
                    <i class="nz-icon nz-icon-label menu-i"></i>
                    <div class="menu-div">
                        <span>{{ stateEnums(this.issuedetailsData.state) }}</span>
                        <span class="describe">state</span>
                    </div>
                </li>
                  <li class="menu-li">
                    <i class="nz-icon nz-icon-user menu-i"></i>
                    <div class="menu-div">
                        <span>{{ this.issuedetailsData.reporter.username }}</span>
                        <span class="describe" >Reporter</span>
                    </div>
                </li>
                  <li class="menu-li">
                    <i class="nz-icon nz-icon-user menu-i"></i>
                    <div class="menu-div">
                        <span>{{ this.issuedetailsData.assignee.username }}</span>
                        <span class="describe">Assignee</span>
                    </div>
                </li>
            </ul>
        </div>
    </el-header>
    <el-main class="issuetab-main">
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
    <el-aside width="400px" class="issuetab-aside">
        <span>{{$t("issueTab.dynamic")}} </span>
        <template>
                <el-tabs v-model="activeName" @tab-click="handleClick" class="issuetab-eltabs">
                    <el-tab-pane :label="$t('issueTab.whole')" name="first" class="tab-pane">
                        <div class="change ">
                            <i class="nz-icon nz-icon-edit"></i>
                            <span>老王</span>
                            <span>Created issue</span>
                            <span>2022-09-02</span>
                             <!-- <div v-for="(item, index) in changeData" :key="index" v-html="item.content" ></div> -->
                        </div>
                        <div class="content first-content" >
                               <div v-for="(item, index) in this.contentData" :key="index">
                                <i class="nz-icon nz-icon-edit"></i>
                                <span>{{item.createUser.name}}</span>
                                <span>{{typeEnums(item.type)}}</span>
                                <span>{{timezoneToUtcTimeStr(item.cts)}}</span>
                                <div class="content-data" v-for="(item, index) in contentData" :key="index" v-html="item.content" ></div>
                                </div>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane :label="$t('issueTab.comment')"  name="content" class="tab-pane">
                        <div class="content " >
                               <div v-for="(item, index) in this.contentData" :key="index">
                                <i class="nz-icon nz-icon-edit"></i>
                                <span>{{item.createUser.name}}</span>
                                <span>{{typeEnums(item.type)}}</span>
                                <span>{{timezoneToUtcTimeStr(item.cts)}}</span>
                                <div class="content-data" v-for="(item, index) in contentData" :key="index" v-html="item.content" ></div>
                                </div>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane :label="$t('issueTab.changeRecord')"  name="change" class="tab-pane">
                        <div class="change">
                            <i class="nz-icon nz-icon-edit"></i>
                            <span>老王</span>
                            <span>Created issue</span>
                            <span>2022-09-02</span>
                        </div>
                    </el-tab-pane>
                </el-tabs>
        </template>
         <div class="add-comment-btn">
              <el-button type="text" v-if="addcommentShow"  @click="addcommentBtn">{{$t("issueTab.addComment")}}</el-button>
            </div>

             <div v-if="textareaShow" class="textareas">
                <el-input
                class="textareas-input"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4}"
                placeholder="多行输入"
                v-model="textarea">
                </el-input>
               <div class="btn-box">
                 <el-button size="mini" @click="addFun">{{$t("issueTab.Add")}}</el-button>
                <el-button size="mini" @click="cancelBtn">{{$t("issueTab.Cencel")}}</el-button>
               </div>
             </div>
    </el-aside>
</el-container>
  </div>
</template>

<script>
import mainMixinFun from '@/components/common/mixin/mainMixinFun'
export default {
  name: 'issueTab',
  mixins: [mainMixinFun],
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
      createUser: [],
      updateUser: [],
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
          console.log(response.data, 1)
        //   console.log(response.data, 2)
        }
      })
      this.$get(`${this.url}/activity?issueId=1&type=2&pageSize=-1`).then(response => { // issue动态详情接口-评论
        if (response.code === 200) {
          this.contentData = response.data.list
          this.time = response.time
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
    // type 处理
    typeEnums (data) {
      if (data == 1) {
        data = 'changed issue'
      } else if (data == 2) {
        data = 'created issue'
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
