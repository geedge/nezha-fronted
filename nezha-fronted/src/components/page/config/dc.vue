<style>
  .dc {
    height: 100%;
  }
  .dc-asset-states {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .dc-asset-state {
    display: inline-block;
    min-width: 25px;
    height: 20px;
    color: white;
    text-align: center;
    line-height: 20px;
    margin-right: 6px;
    border-radius: 3px;
  }
  .dc-asset-state.dc-asset-state-total {
    background-color: #1166bb;
    margin-right: 15px
  }
  .dc-asset-state-in {
    background-color: #90ee90;
  }
  .dc-asset-state-out {
    background-color: orange;
  }
  .dc-asset-state-high {
    background-color: rgba(255, 0, 0, 0.6);
  }
</style>
<template>
    <div class="dc" >
      <div class="content-left">
        <div class="sidebar-title">{{$t('overall.config')}}</div>
        <div class="sidebar-info">
          <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="prom-jump-account">
            {{$t('config.account.account')}}
          </div>
          <div class="sidebar-info-item" @click="jumpTo('promServer')" id="account-jump-promserver">
            {{$t('config.promServer.promServerList')}}
          </div>
          <div class="sidebar-info-item sidebar-info-item-active"  id="account-jump-dc">
            {{$t('config.dc.dc')}}
          </div>
          <div class="sidebar-info-item" @click="jumpTo('model')" id="account-jump-model">
            {{$t('config.model.model')}}
          </div>
          <div class="sidebar-info-item" @click="jumpTo('mib')" id="account-jump-mib">
            {{$t('config.mib.mib')}}
          </div>
        </div>
      </div>
      <!--dc table start-->
      <div class="content-right">
        <div class="main-list" :class="{'main-list-with-sub': showSubList}">
          <div class="top-tools" v-show="mainResizeShow">
            <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': showSubList}">
              <div class="top-tool-search">
                <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" :inTransform="inTransform"></search-input>
              </div>
              <button type="button" @click="toAdd" :title="$t('overall.createDatacenter')"
                      class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="dc-add">
                <i class="nz-icon-create-square nz-icon"></i>
              </button>
            </div>
            <div class="pagination-top pagination-top-hide display-none"></div>
          </div>
          <el-table
            class="nz-table"
            :data="tableData"
            border
            v-show="mainResizeShow"
            v-scrollBar:el-table
            :height="mainTableHeight"
            ref="dcTable"
            style="width: 100%;">
            <el-table-column
              :resizable="false"
              v-for="(item, index) in tablelable"
              v-if="item.show"
              :width="item.width"
              :key="`col-${index}`"
              :label="item.label"
            >
              <template slot-scope="scope" :column="item">
                <div v-if="item.prop == 'option'" class="content-right-options">
                  <span :title="$t('overall.view')" @click="detail(scope.row)" class="content-right-option" :id="'dc-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
                  &nbsp;
                  <span :title="$t('overall.edit')" @click="edit(scope.row)" class="content-right-option" :id="'dc-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
                  &nbsp;
                  <span :title="$t('overall.delete')" @click="del(scope.row)" class="content-right-option" :id="'dc-del-'+scope.row.id"><i class="el-icon-delete"></i></span>
                </div>
                <template v-else-if="item.prop == 'principal'">
                  <template v-if="scope.row.principal">
                    <template v-for="item in userData">
                      <template v-if="scope.row.principal == item.userId">{{item.username}}</template>
                    </template>
                  </template>
                  <template v-else>-</template>
                </template>
                <template v-else-if="item.prop == 'area'">
                  <template v-if="scope.row.area">{{scope.row.area.name}}</template>
                  <template v-else>-</template>
                </template>
                <template v-else-if="item.prop == 'assetStat' && scope.row.assetStat">
                  <el-popover
                    placement="top"
                    trigger="hover"
                    :content="$t('overall.result.total') + '：' + scope.row.assetStat.total + '，' + $t('asset.createAssetTab.inStock') + '：' + scope.row.assetStat.inStock + '，' + $t('asset.createAssetTab.notInStock') + '：' + scope.row.assetStat.outStock">
                    <div slot="reference" class="dc-asset-states">
                      <span class="dc-asset-state dc-asset-state-total">{{scope.row.assetStat.total}}</span>
                      <span class="dc-asset-state dc-asset-state-in">{{scope.row.assetStat.inStock}}</span>
                      <span class="dc-asset-state dc-asset-state-out">{{scope.row.assetStat.outStock}}</span>
                    </div>
                  </el-popover>

                </template >
                <template v-else-if="item.prop == 'cabinetNum'">
                  <span class="link" @click="showCabinet(scope.row)">{{scope.row[item.prop]}}</span>
                </template>
                <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
                <template v-else>-</template>
              </template>
            </el-table-column>
            <el-table-column width="28" :resizable="false">
              <template slot="header" slot-scope="scope">
              <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
                <i class="nz-icon nz-icon-gear"></i>
              </span>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-bottom" v-show="!showSubList">
            <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
          </div>
          <button class="to-top" v-show="showTopBtn" @click="toTop"><i class="nz-icon nz-icon-top"></i></button>
        </div>
        <bottom-box v-if="showSubList" :show-sub-list="showSubList" :subResizeShow="subResizeShow" :obj="cabinetDc" :isFullScreen="isFullScreen" :from="'dc'" :targetTab="targetTab" :detail="dcDetail"
                     @closeSubList="showSubList = false" @fullScreen="fullScreen" @exitFullScreen="exitFullScreen" @listResize="listResize" ></bottom-box>
      </div>
      <!--dc table end-->
      <element-set
        v-clickoutside="elementsetHide"
        :dropCol="dropCol"
        @tablelable="tablelabelEmit"
        :table-title="tableTitle"
        ref="elementset"
      ></element-set>
      <dc-box ref="dcBox" :dc="currentDc" :user-data="userData" @reload="getTableData"></dc-box>
    </div>
</template>
<script>
  export default {
    name: "dc",
    data() {
      return {
        targetTab: '', //展示二级列表中的哪个页签
        showElementSet: false, //控制自定义列的弹框
        inTransform: false, //搜索框相关，搜索条件下拉框是否在transform里
        mainResizeShow: true, //dom高度改变时部分内容是否展示
        subResizeShow: true,
        isFullScreen: false,
        showSubList: false, //是否展示二级列表
        tableId: 'dcTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false,
        mainTableHeight: this.$tableHeight.normal, //主列表table高度
        currentDc: {
          id: '',
          name: '',
          location: '',
          tel: '',
          principal: '',
          area: {
            id: '',
            name: ''
          }
        },
        cabinetDc: {},
        dcDetail: [], //dc的详情信息，包含标题
        pageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        tableTitle: [
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t("overall.name"),
            prop: 'name',
            show: true,
          }, {
            label: this.$t('config.dc.area'),
            prop: 'area',
            show: true
          }, {
            label: this.$t("asset.createAssetTab.location"),
            prop: 'location',
            show: true,
          }, {
            label: this.$t("config.dc.cabinetNum"),
            prop: 'cabinetNum',
            show: true,
          }, {
            label: this.$t("config.dc.assets"),
            prop: 'assetStat',
            show: true,
          }, {
            label: this.$t('asset.createAssetTab.tel'),
            prop: 'tel',
            show: true,
          }, {
            label: this.$t('asset.createAssetTab.principal'),
            prop: 'principal',
            show: true
          }, {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        tablelable: [],
        dropCol: [],
        tableData: [],
        userData: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 10,
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }],
        },
        searchLabel: {}, //搜索参数
        tabShow:1, // 控制显示一级页面和二级页面 1 dc 2cabinet
        cabinetDatas:[],//显示的机柜信息

      }
    },
    methods: {
      elementsetShow(s, e) {
        var eventfixed = {
          shezhi: 0,
          screen: 0
        };
        eventfixed[s] = 1;
        e.preventDefault();
        this.$store.commit('setHeaderTable', this.tablelable);
        this.$store.commit('setEventfixed', eventfixed);
        const h = document.documentElement.clientHeight;
        const w = document.documentElement.clientWidth;
        const dw = this.$refs.elementset.$el.offsetWidth;
        const dh = this.$refs.elementset.$el.offsetHeight;
        let positionx =
          e.clientX + dw <= w - 10 ? e.clientX + 14 : e.clientX + 14 - dw;
        let positiony =
          e.clientY + dh <= h - 10
            ? e.clientY + 20
            : e.clientY + 20 - (e.clientY + dh - h);
        this.$store.commit('setPosition', {positionx, positiony});
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        this.$refs.elementset.elementsetHide();
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
      },
      // 鼠标拖动二级列表
      listResize(e) {
        let mainListDom = document.querySelector(".main-list-with-sub"); //主列表
        let subListDom = document.querySelector(".sub-list"); //副列表
        let contentRightDom = document.querySelector(".content-right"); //右侧内容区
        let contentRightHeight = contentRightDom.offsetHeight;//可视高度
        //得到点击时俩dom的初始高度：
        let mainInitialHeight = mainListDom.offsetHeight;
        let subInitialHeight = subListDom.offsetHeight;
        //点击时鼠标的Y轴位置
        let mouseInitialY = e.clientY;

        let _this = this;

        document.onmousemove = (e) => {
          e.preventDefault();
          //得到鼠标拖动的距离
          let mouseMoveY = Math.abs(e.clientY - mouseInitialY);

          //往上方拖动：
          if (e.clientY < mouseInitialY) {
            mainListDom.style.height = mainInitialHeight-mouseMoveY+'px';
            subListDom.style.height = subInitialHeight+mouseMoveY+'px';
          }
          //往下方拖动：
          if (e.clientY > mouseInitialY) {
            mainListDom.style.height = mainInitialHeight+mouseMoveY+'px';
            subListDom.style.height = subInitialHeight-mouseMoveY+'px';
          }

          // 主、副列表最小高度限制为15px
          if(parseInt(mainListDom.style.height) >= contentRightHeight-15){
            mainListDom.style.height = contentRightHeight-15+'px';
          }
          if(parseInt(mainListDom.style.height) <= 15){
            mainListDom.style.height = 15+'px';
          }
          if(parseInt(subListDom.style.height) >= contentRightHeight-15){
            subListDom.style.height = contentRightHeight-15+'px';
          }
          if(parseInt(subListDom.style.height) <= 15){
            subListDom.style.height = 15+'px';
          }
          //当主副列表可视区域小于一定值时，不展示内容
          if(parseInt(mainListDom.style.height) <= 100){
            if (_this.mainResizeShow) {
              _this.mainResizeShow = false;
            }
          } else {
            if (!_this.mainResizeShow) {
              _this.mainResizeShow = true;
            }
          }
          if(parseInt(subListDom.offsetHeight) <= 100){
            if (_this.subResizeShow) {
              _this.subResizeShow = false;
            }
          } else {
            if (!_this.subResizeShow) {
              _this.subResizeShow = true;
            }
          }
        };
        document.onmouseup = () => {
          document.onmousemove = null;
        }
      },
      exitFullScreen() {
        let contentRightDom = document.querySelector(".content-right"); //右侧内容区
        let contentRightHeight = contentRightDom.offsetHeight;//可视高度
        //主列表
        document.querySelector(".main-list-with-sub").style.height = this.mainListHeight ? this.mainListHeight + 'px' : 'calc(50% - 4px)';

        //副列表
        document.querySelector(".sub-list").style.height = this.mainListHeight ? contentRightHeight-this.mainListHeight-9 + 'px' : 'calc(50% - 4px)';
        setTimeout(() => {
          this.isFullScreen = false;
          if (document.querySelector(".main-list-with-sub").offsetHeight >= 100) {
            this.mainResizeShow = true;
          }
          if (document.querySelector(".sub-list").offsetHeight >= 100) {
            this.subResizeShow = true;
          }
        }, 210);
      },
      fullScreen() {
        let contentRightDom = document.querySelector(".content-right"); //右侧内容区
        let contentRightHeight = contentRightDom.offsetHeight;//可视高度
        this.isFullScreen = true;
        //主列表
        this.mainListHeight = document.querySelector(".main-list-with-sub").offsetHeight; //记录全屏前主列表的高度
        document.querySelector(".main-list-with-sub").style.height = '0';
        this.mainResizeShow = false;
        //副列表
        document.querySelector(".sub-list").style.height = contentRightHeight + 'px';
      },
      jumpTo(data, id) {
        this.$router.push({
          path: "/" + data,
          query: {
            t: +new Date()
          }
        });
      },
      edit: function (u) {
        let tempDc = JSON.parse(JSON.stringify(u));
        if (!tempDc.area) {
          this.$set(tempDc, 'area', {id: '', name: ''});
        }
        this.currentDc = tempDc;
        this.$refs.dcBox.show(true, true);
      },
      detail(obj) {
        let tempDc = JSON.parse(JSON.stringify(obj));
        if (!tempDc.area) {
          this.$set(tempDc, 'area', {id: '', name: ''});
        }
        //this.currentDc = tempDc;
        //this.$refs.dcBox.show(true, false);
        this.cabinetDc = tempDc;
        this.targetTab = "detail";
        this.showSubList = true;
      },
      convertToDetail(obj) {
        let detail = [];
        detail.push({label: this.$t("overall.name"), value: obj.name});
        detail.push({label: this.$t("asset.createAssetTab.location"), value: obj.location});
        detail.push({label: this.$t("asset.createAssetTab.tel"), value: obj.tel});
        let principal = '';
        for (let i = 0; i < this.userData.length; i++) {
          if (this.userData[i].userId == obj.principal) {
            principal = this.userData[i].username;
            break;
          }
        }
        detail.push({label: this.$t("asset.createAssetTab.principal"), value: principal});
        detail.push({label: this.$t("config.dc.area"), value: obj.area.name});
        console.info(detail)
        return detail;
      },
      toAdd() {
        this.currentDc = {
          id: '',
            name: '',
            location: '',
            tel: '',
            principal: '',
            area: {
            id: '',
              name: ''
          }
        },
        this.$refs.dcBox.show(true, true);
      },
      del: function (u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("idc?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      getTableData: function () {
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$get('idc', this.searchLabel).then(response => {
          if (response.code === 200) {
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total
          }
        })
      },
      getUserData() {
        this.$get('sys/user/list', {pageSize: -1, pageNo: 1}).then(response => {
          if (response.code === 200) {
            this.userData = response.data.list;
          }
        })
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getTableData();
      },
      pageSize(val) {
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.pageObj.pageSize = val;
        this.getTableData();
      },
      search: function (searchObj) {
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        this.getTableData();
      },
      showCabinet:function(dc){
        //this.currentShowDc=dc;
        //this.tabShow=2;
        this.targetTab = 'cabinet';
        this.cabinetDc = JSON.parse(JSON.stringify(dc));
        this.showSubList = true;
        //this.cabSearchLabel={idcId:this.currentShowDc.id};
        //this.getCabinetDatas();
        /*let temp=this;
        setTimeout(function(){temp.$refs.cabSearchInput.clear_input();},100)*/
      },
    },
    watch: {
      cabinetDc: {
        deep: true,
        handler(n) {
          this.dcDetail = this.convertToDetail(n);
        }
      },
      showSubList(n) {
        this.inTransform = n;
        if (!n) {
          this.mainTableHeight = this.$tableHeight.normal; //重置table的高度
          this.isFullScreen = false;
          //移动分页组件的位置
          let paginationTop = document.querySelector(".pagination-top");
          let paginationBottom = document.querySelector(".pagination-bottom");
          paginationTop.classList.remove("display-none");
          if (paginationTop.classList.contains("pagination-top-show")) {
            paginationTop.classList.remove("pagination-top-show");
          }
          if (!paginationTop.classList.contains("pagination-top-hide")) {
            paginationTop.classList.add("pagination-top-hide");
          }
          setTimeout(() => {
            paginationTop.classList.add("display-none");
            paginationBottom.appendChild(paginationTop.removeChild(document.querySelector(".pagination")));
          }, 210);

          // 主列表恢复全屏
          this.mainResizeShow = this.subResizeShow = true;
          document.querySelector('.main-list').style.height = "";
          //副列表高度清空
          document.querySelector(".sub-list").style.height = '';
        } else {
          this.mainTableHeight = this.$tableHeight.openSubList.mainList; //重置table高度
          //移动分页组件的位置
          let paginationTop = document.querySelector(".pagination-top");
          paginationTop.appendChild(document.querySelector(".pagination-bottom").removeChild(document.querySelector(".pagination")));
          paginationTop.classList.remove("display-none");
          setTimeout(() => {
            if (paginationTop.classList.contains("pagination-top-hide")) {
              paginationTop.classList.remove("pagination-top-hide");
            }
            if (!paginationTop.classList.contains("pagination-top-show")) {
              paginationTop.classList.add("pagination-top-show");
            }
          }, 210);
        }
      }
    },
    destroyed() {
      window.onresize = null;
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize != 'undefined' && pageSize != null) {
        this.pageObj.pageSize = pageSize;
      }
      this.getTableData();
      this.$nextTick(function(){
        this.getUserData();//绑定滚动条事件，控制top按钮
        let el = this.$refs.dcTable.$el.querySelector(".el-table__body-wrapper");
        if (el._ps_) {
          el.addEventListener("ps-scroll-y", () => {
            if (el._ps_.scrollbarYTop > 100) {
              this.showTopBtn = true;
            } else {
              this.showTopBtn = false;
            }
          });
        }
      });
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
        : this.tableTitle;
    }
  }
</script>
