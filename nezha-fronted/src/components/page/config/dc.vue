<style scoped>
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
        </div>
      </div>
      <!--dc table start-->
      <div class="content-right" v-if="tabShow==1">
        <div class="top-tools">
          <div></div>
          <div>
            <button type="button" @click="toAdd" :title="$t('overall.createDatacenter')"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light float-right " id="dc-add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
            <div class="top-tool-search float-right">
              <search-input ref="searchInput" :searchMsg="searchMsg" @search="search" v-if="tabShow==1"></search-input>
            </div>
          </div>
        </div>
        <el-table
          class="nz-table"
          :data="tableData"
          border
          v-scrollBar:el-table
          height="calc(100% - 160px)"
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
              <template v-else-if="item.prop == 'assetStat'">
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
                <span class="clickable" @click="showCabinet(scope.row)">{{scope.row[item.prop]}}</span>
              </template>
              <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
              <template v-else>-</template>
            </template>
          </el-table-column>
          <el-table-column width="28">
            <template slot="header" slot-scope="scope">
            <span @click.stop="elementsetShow('shezhi',$event)" class="nz-table-gear">
              <i class="nz-icon nz-icon-gear"></i>
            </span>
            </template>
          </el-table-column>
        </el-table>
        <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
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
      <!--cabinet table start-->
      <div v-if="tabShow==2" class="content-right">
        <div class="top-tools">
          <div>
            <div @click="back">
              <button  class="nz-btn nz-btn-size-normal nz-btn-style-light float-right nz-btn-min-width-82">
                <span class='top-tool-btn-txt'>{{$t('overall.back')}}</span>
              </button>
            </div>
          </div>
          <div>
            <button type="button" @click="toAddCabinet" :title="$t('overall.createCabinet')"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light float-right " id="cab-add">
              <i class="nz-icon-create-square nz-icon"></i>
            </button>
            <div class="top-tool-search float-right">
              <search-input ref="cabSearchInput" :searchMsg="cabSearchMsg" @search="cabSearch" v-if="tabShow==2"></search-input>
            </div>
          </div>
        </div>

        <el-table
          class="nz-table"
          :data="cabinetDatas"
          border
          v-scrollBar:el-table
          height="calc(100% - 160px)"
          style="width: 100%;">
          <el-table-column
            :resizable="false"
            v-for="(item, index) in cabinetLabel"
            v-if="item.show"
            :width="item.width"
            :key="`col-${index}`"
            :label="item.label"
          >
            <template slot-scope="scope" :column="item">
              <div v-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.edit')" @click="editCabinet(scope.row)" class="content-right-option" :id="'dc-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
                &nbsp;
                <span :title="$t('overall.delete')" @click="delCabinet(scope.row)" class="content-right-option" :id="'dc-del-'+scope.row.id"><i class="el-icon-delete"></i></span>
              </div>
              <template v-else-if="item.prop == 'assetStat'">
                <el-popover
                  placement="top-start"
                  offset="-100"
                  trigger="hover"
                  :content="$t('overall.result.total') + '：' + scope.row.assetStat.total + '，' + $t('asset.createAssetTab.inStock') + '：' + scope.row.assetStat.inStock + '，' + $t('asset.createAssetTab.notInStock') + '：' + scope.row.assetStat.outStock">
                  <div slot="reference" class="dc-asset-states">
                    <span class="dc-asset-state dc-asset-state-total">{{scope.row.assetStat.total}}</span>
                    <span class="dc-asset-state dc-asset-state-in">{{scope.row.assetStat.inStock}}</span>
                    <span class="dc-asset-state dc-asset-state-out">{{scope.row.assetStat.outStock}}</span>
                  </div>
                </el-popover>

              </template >
              <template v-else-if="item.prop == 'alertStat'">
                <el-popover
                  placement="top-start"
                  offset="-128"
                  trigger="hover"
                  :content="$t('overall.result.total') + '：' + scope.row.alertStat.total + '，' + $t('alert.config.high') + '：' + scope.row.alertStat.high + '，' + $t('alert.config.medium') + '：' + scope.row.alertStat.medium+ '，' + $t('alert.config.low') + '：' + scope.row.alertStat.low">
                  <div slot="reference" class="dc-asset-states">
                    <span class="dc-asset-state dc-asset-state-total">{{scope.row.alertStat.total}}</span>
                    <span class="dc-asset-state dc-asset-state-high">{{scope.row.alertStat.high}}</span>
                    <span class="dc-asset-state dc-asset-state-in">{{scope.row.alertStat.medium}}</span>
                    <span class="dc-asset-state dc-asset-state-out">{{scope.row.alertStat.low}}</span>
                  </div>
                </el-popover>

              </template >
              <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
              <template v-else>-</template>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!--cabinet table end-->
      <cabinet-box :cur-cabinet="curCabinet" :cur-idc="currentShowDc" ref="cabinetEditBox" @after="getCabinetDatas"></cabinet-box>
    </div>
</template>
<script>
  import cabinetBox from "../../common/rightBox/cabinetBox";
  export default {
    name: "dc",
    components:{
      'cabinet-box':cabinetBox
    },
    data() {
      return {
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
        cabinetLabel:[
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          },
          {
            label:this.$t('overall.name'),
            prop:'name',
            show:true
          },
          {
            label:this.$t('asset.createAssetTab.uSize'),
            prop:'uSize',
            show:true
          },
          {
            label:this.$t('config.dc.assets'),
            prop:'assetStat',
            show:true
          },
          {
            label:this.$t('alert.alert'),
            prop:'alertStat',
            show:true
          },
          {
            label:this.$t('config.dc.remark'),
            prop:'remark',
            show:true
          },
          {
            label: this.$t('config.account.option'),
            prop: 'option',
            show: true,
            width: 120
          }
        ],
        curCabinet:{
          id:'',
          idcId:'',
          name:'',
          remark:'',
          seq:'',
          uSize:0
        },
        currentShowDc:{},
        cabSearchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [
            {
            id: 11,
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          },
          {
            id:12,
            name:this.$t('asset.createAssetTab.uSize'),
            label:'uSize',
            disabled: false
          },
          {
            id:13,
            name:this.$t('config.dc.remark'),
            label:'remark',
            disabled: false
          }
          ],
        },
        cabSearchLabel: {

        }, //搜索参数
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
      detail(u) {
        let tempDc = JSON.parse(JSON.stringify(u));
        if (!tempDc.area) {
          this.$set(tempDc, 'area', {id: '', name: ''});
        }
        this.currentDc = tempDc;
        this.$refs.dcBox.show(true, false);
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
        this.tabShow=2;
        this.currentShowDc=dc;
        this.cabSearchLabel={idcId:this.currentShowDc.id};
        this.getCabinetDatas();
        let temp=this;
        setTimeout(function(){temp.$refs.cabSearchInput.clear_input();},100)
      },
      getCabinetDatas:function(){
        this.$get('/cabinet',this.cabSearchLabel).then(response=>{
          if(response.code==200 && response.msg=='success'){
            this.cabinetDatas=response.data.list;
          }
        })
      },
      editCabinet:function(cabinet){
        this.curCabinet=cabinet;
        this.$refs.cabinetEditBox.show(true,true);
      },
      toAddCabinet:function(){
        this.$refs.cabinetEditBox.show(true,true);
        this.$refs.cabinetEditBox.reset();
      },
      delCabinet:function(cabinet){
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete('/cabinet?ids='+cabinet.id).then(response=>{
            if(response.code ==  200){
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.getCabinetDatas();
            }else{
              this.$message.error(response.msg);
            }
          })
        })
      },
      back:function(){
        this.tabShow=1;
        this.getTableData();
        let temp=this;
        setTimeout(function(){temp.$refs.searchInput.clear_input();},100)
      },
      cabSearch:function(obj){
        this.cabSearchLabel={idcId:this.currentShowDc.id};
        if(obj){
          for(let item in obj){
            if(obj[item]){
              this.$set(this.cabSearchLabel,item,obj[item]);
            }
          }
        }
        this.getCabinetDatas();
      }
    },
    mounted() {
      this.getTableData();
      this.$nextTick(function(){
        this.getUserData();
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
