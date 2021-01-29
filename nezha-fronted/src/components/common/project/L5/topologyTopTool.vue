<template>
  <div class="tool-top">
    <div class="top-tool-item"  @click="undo"> 撤销 </div>
    <div class="top-tool-item" @click="redo"> 重做 </div>
    <div class="top-tool-item" @click="centerView"> 居中</div>
    <div class="top-tool-item" @click="fitView"> 自适应</div>
    <div class="top-tool-item"> 缩放大小 <el-input-number size="mini" v-model="option.scale" @change="scale" :min="0.25" :max="5" :step="0.2" :precision="2"></el-input-number> </div>
    <div :class="['top-tool-item',toolShow.node?'tool-item-active':'']" @click="toolShowChange('node')"> 节点工具 </div>
    <div :class="['top-tool-item',toolShow.attr?'tool-item-active':'']" @click="toolShowChange('attr')"> 属性工具 </div>
    <!--<div> 保存为图片 </div>-->
    <div class="top-tool-item" @click="del"> 删除 </div>
    <div class="top-tool-item" @click="clear"> 清空画布 </div>
  </div>
</template>

<script>
  import {getTopology} from "../../js/common";

  export default {
    name:"topologyTopTool",
    data(){
      return {
        option:{
          lineName:'curve',
          lineWidth:1,
          fromArrow:'',
          toArrow:'triangleSolid',
          scale:1,
        },
        penLineType:[
          {d:'M5 14 a100,50 0 0,1 85,0',"stroke-dasharray":"",name:'curve'},
          {d:'M5 8 l40 0 l0 12 l40 0',"stroke-dasharray":"",name:'polyline'},
          {d:'M5 14 l85 0',"stroke-dasharray":"",name:'line'},
          {d:'M5 20 C0,8 50,0 85,0',"stroke-dasharray":"",name:'mind'},
        ],
        penLineFromTOArrow:[
          {d:'M5 14 l85 0',"points":"",fill:'',stroke:"",'stroke-width':"",name:''},
          {d:'M5 14 l85 0',"points":"5 14,20 9,20 19",fill:'#000000',stroke:"",'stroke-width':"",name:'triangleSolid'},
          {d:'M5 14 l85 0',"points":"5 14,20 9,20 19",fill:'#ffffff', stroke:"#000000",'stroke-width':"1",name:'triangle'},
          {d:'M5 14 l85 0',fill:'#000000', stroke:"",'stroke-width':"",cx:"10",cy:"14",r:"5",name:'circleSolid'},
          {d:'M5 14 l85 0',fill:'#ffffff', stroke:"#000000",'stroke-width':"1",cx:"10",cy:"14",r:"5",name:'circle'},
        ],
      }
    },
    props:{
      selection:{
        type:Object,
        require:true
      },
      index:{
        type:Number,
        require:true,
      },
      toolShow:{
        type:Object,
        require:true
      }
    },
    mounted(){
      let dataOption=getTopology(this.index).data;
      Object.keys(this.option).forEach(key=>{
        this.option[key]=(dataOption[key]?dataOption[key]:this.option[key]);
      })
    },
    methods:{
      // todo 1清空后的 处理属性工具的默认值 2工具栏的移动 以及节点工具和属性工具的移动 3 结束箭头类型的方向
      changeOption(key){
        getTopology(this.index).data[key]=this.option[key];
      },
      undo(){//撤销
        getTopology(this.index).undo();
      },
      redo(){//重做
        getTopology(this.index).redo();
      },
      centerView(){//居中显示
        getTopology(this.index).centerView();
      },
      fitView(){//自适应画布大小
        getTopology(this.index).fitView();
      },
      scale(){
        getTopology(this.index).scaleTo(this.option.scale);
      },
      del(){
        let delObj=this.selection.pen?this.selection.pen.id:this.selection.pens
        this.$emit('del', delObj);
      },
      clear(){
        let data={...getTopology(this.index).data};
        data.pens=[];
        getTopology(this.index).open(data);
      },
      toolShowChange(attr){
        this.$emit('toolShowChange',attr);
      }

    }
  }
</script>

<style scoped>
  .tool-top {
    border: 1px solid #1a1a1a;
    border-radius: 2px;
    display: inline-flex;
  }
  .tool-top > div{
    padding: 3px 5px;
  }
  .tool-top > div:not(:last-child){
    border-right: 1px solid #1a1a1a ;
  }
  .top-tool-item{
    cursor: pointer;
  }
  .tool-item-active{
    background: #1a1a1a;
    color: #fff;
  }
  .mb10 {
    margin-bottom: 10px;
  }

  .mt10 {
    margin-top: 10px;
  }
  .p10{
    padding: 10px;
  }
  .pl0{
    padding-left: 0;
  }
  .special-select{
    vertical-align: middle;
  }
  .special-select .el-select.el-select--small{
    width: 100%;
  }
  .special-select /deep/ .el-input.el-input--prefix.el-input--suffix,.line-width /deep/ .el-input.el-input--prefix.el-input--suffix{
    border: 1px solid #DCDFE6;
    height: 28px;
  }
  .special-select /deep/ .el-input__inner,.line-width /deep/ .el-input__inner{
    display: none;
  }
  .special-select /deep/ .el-input__prefix,.line-width /deep/ .el-input__prefix{
    height: 28px;
    line-height: 28px;
    color: #899FB7;
    width: 100%;
  }
  .special-select /deep/ .el-input__prefix > div{
    width: 100%;
    height: 100%;
  }
  .props-pen-item{
    display: inline-block;
    width: 130px;
  }
  .icon-item{
    width: 100%;
    height:100%;
  }
  .icon-item svg{
    width: 100%;
    height:100%;
  }
</style>
