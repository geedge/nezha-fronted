<template>
    <div class="table-box" :class="{'table-column-box':showData&&showData.screen&&showData.screen.direction=='column'}">
      <loading ref="loading"></loading>
      <template v-if="showData&&showData.screen">
        <div class="table-box-left" :class="{'table-box-left-half':showData.screen.total.direction == 'column'}" v-show="showData.screen.show">
            <div class="table-screen"  :class="{'fill-flex-cavity':!showData.screen.stat.show&&showData.screen.total.direction != 'column'&&showData.screen.direction!='column'}">
              <div class="screen-top" v-show="showData.screen.total.show" >
                <div :class="{'screen-row':showData.screen.total.direction == 'row','screen-column':showData.screen.total.direction == 'column'}">
                  <div class="screen-col"><i class="super-icon" :class="showData.screen.total.icon"></i></div>
                  <div class="screen-col">
                    <div>{{showData.screen.total.title}}</div>
                    <template v-if="showData.screen.total.showPopover">
                      <el-popover trigger="hover" placement="top">
                        <div class="popover-container">
                          <div v-for="(pop,index) in showData.screen.total.popover">
                            <span>{{pop.label}}:</span>&nbsp;
                            <span>{{pop.value}}</span>
                          </div>
                        </div>
                        <template slot="reference">
<!--                          <div class="super-font">{{showData.screen.total.num}}</div>-->
                          <div class="super-font" v-html="showData.screen.total.num"></div>
                        </template>
                      </el-popover>
                    </template>
                    <template v-else>
                      <div class="super-font">{{showData.screen.total.num}}</div>
                    </template>
                  </div>
                </div>
              </div>
              <div class="screen-bottom" v-show="showData.screen.stat.show">
                <div class="screen-row">
                  <div class="screen-col avg-children-space"><i class="nz-icon nz-icon-arrow-up middle-icon green-icon"></i><span class="middle-font">{{showData.screen.stat.up}}</span></div>
                  <div class="screen-col avg-children-space"><i class="nz-icon nz-icon-arrow-down middle-icon red-icon"></i><span class="middle-font">{{showData.screen.stat.down}}</span></div>
                </div>
              </div>
            </div>
        </div>
      </template>
        <template v-if="showData&&showData.table">
          <div class="table-box-right overview-table" v-show="showData.table.show">
            <el-table
              class="overview-table"
              :data="showData.table.tableData"
              v-scrollBar:el-table
              tooltip-effect="light"
              height="100%"
              ref="dataTable"
            >
              <el-table-column
                :resizable="false"
                v-for="(item, index) in showData.table.tableLabel"
                v-if="item.show"
                :key="`col-${index}`"
                :class-name="typeof item.showOverflowTooltip != 'undefined'&& item.showOverflowTooltip == false?'cell-tooltip':''"
                :width="item.width"
                :label="item.label"
                :render-header="item.renderHeader"
                :show-overflow-tooltip="typeof item.showOverflowTooltip != 'undefined'?item.showOverflowTooltip:true"
                min-width="90"
              >
                <template slot-scope="scope" :column="item">
                  <template v-if="item.showPopover">
                    <el-popover trigger="hover" placement="right" >
                      <div class="popover-container">
                        <div v-for="(pop,index) in item.popover">
                          <span>{{pop.label}}:</span>&nbsp;
                          <span>{{scope.row[pop.prop]}}</span>
                        </div>
                      </div>
                      <template slot="reference">
                        <span v-html="scope.row[item.prop]"></span>
                      </template>
                    </el-popover>
                  </template>
                  <template v-else>
                    <span v-html="scope.row[item.prop]"></span>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>

    </div>
</template>

<script>
  export default {
    name: "tableBox",
    components:{
    },
    props: {
      popData: {type:Object,required:true},
    },
    data(){
      return {
        showData:{
          screen:{ //左侧概览信息
            show:true,
            total:{ //左侧上方大图标及total信息
              show:true,
              num:0,
              title:'',
              showPopover:true,
              icon:'0',
              popover:[]
            },
            stat:{//左侧下方 小图标，
              show:true,
              up:0,
              down:0
            }
          },
          table:{//右侧table
            show:true,
            tableData:[],
            tableLabel:[]
          }
        }
      }
    },
    created() {
    },
    methods:{
      startLoading(){
        this.$refs.loading.startLoading();
      },
      endLoading(){
        this.$refs.loading.endLoading();
      },
      formatTableColumn:function(column,len=14){
        let length=this.getLength(column);
        if(length<=15){
          return column;
        }else{
          let tempStr=column.substr(0,len);
          if(this.getLength(tempStr) <= 15){
            return tempStr+'';
          }else{
            return this.formatTableColumn(tempStr,len-1)
          }
        }
      },
      getLength(val) {
        var str = new String(val);
        var bytesCount = 0;
        for (var i = 0 ,n = str.length; i < n; i++) {
          var c = str.charCodeAt(i);
          if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
            bytesCount += 1;
          } else {
            bytesCount += 2;
          }
        }
        return bytesCount;
      }

    },
    mounted() {
    },
    watch:{
      popData:{
        immediate:true,
        deep:true,
        handler(n,o){
          // this.showData=JSON.parse(JSON.stringify(n));
          this.showData=Object.assign({},n);
        }
      }
    }
  }
</script>

<style scoped>
@import "tableBox.scss";
</style>
<style>
  .overview-table th, .overview-table tr {
    background-color: #FCFCFC !important;
  }
  .cell-tooltip .cell{
    white-space: nowrap;
    min-width: 50px;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
