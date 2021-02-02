<template>
  <div class="tool-top" id="tool-top">
    <div id="undo" :class="['top-tool-item',cachesIndex>0?'':'top-tool-item-disabled']"  @click="undo"> <i class="nz-icon nz-icon-jiantou-left" /> </div>
    <div id="redo" :class="['top-tool-item',redoFlag?'':'top-tool-item-disabled']" @click="redo"> <i class="nz-icon nz-icon-jiantou-right" /> </div>
    <!--<div class="top-tool-item" @click="centerView"> 居中</div>-->
    <!--<div class="top-tool-item" @click="fitView"> 自适应</div>-->
    <!--<div :class="['top-tool-item',toolShow.node?'tool-item-active':'']" @click="toolShowChange('node')"> 节点工具 </div>-->
    <!--<div :class="['top-tool-item',toolShow.attr?'tool-item-active':'']" @click="toolShowChange('attr')"> 属性工具 </div>-->
    <!--<div> 保存为图片 </div>-->
    <div class="top-tool-item" @click="del">  <i class="nz-icon nz-icon-delete"/> </div>
    <div class="top-tool-item top-tool-item-scale">
      <span class="scale-number">
          <span class="scale-number-minus scale-number-symbol" @click="changeScale(-25)">-</span>
          <el-popover
            placement="bottom"
            width="111"
            trigger="click"
            class="scale-number-box"
            popper-class="scale-number-popover"
           >
            <div class="scale-num-pop" style=" width: 91px;min-width: 91px">
              <div @click="scale(50)" :class="['scale-num-pop',scaleNum==50?'is-active':'']">50</div>
              <div @click="scale(100)" :class="['scale-num-pop',scaleNum==100?'is-active':'']">100</div>
              <div @click="scale(200)" :class="['scale-num-pop',scaleNum==200?'is-active':'']">200</div>
            </div>
            <span class="scale-number-content" slot="reference">{{scaleNum}}%</span>
          </el-popover>
          <span class="scale-number-add scale-number-symbol" @click="changeScale(25)">+</span>
        </span>
    </div>
    <!--<div class="top-tool-item" @click="clear"> 清空画布 </div>-->

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
          scale:100,
        },
        scaleNum:100,
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
        redoFlag:false,
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
      },
      cachesIndex:{
        type:Number,
        require:true,
      }
    },
    mounted(){
      let dataOption=getTopology(this.index).data;
      Object.keys(this.option).forEach(key=>{
        if(key==='scale'){
          this.scaleNum=(JSON.stringify(dataOption[key])?dataOption[key]*100:this.scaleNum)
        }else{
          this.option[key]=(dataOption[key]?dataOption[key]:this.option[key]);
        }
      })
    },
    methods:{
      // todo 1清空后的 处理属性工具的默认值 2工具栏的移动 以及节点工具和属性工具的移动 3 结束箭头类型的方向
      changeOption(key){
        getTopology(this.index).data[key]=this.option[key];
      },
      undo(){//撤销
        getTopology(this.index).undo();
        setTimeout(()=>{
          this.redoFlag=true;
        },200)
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
      changeScale(num){
        this.scaleNum+=num;
        if(this.scaleNum<25){
          this.scaleNum=25
        }
        if(this.scaleNum>400){
          this.scaleNum=400
        }
        this.scale(this.scaleNum)
      },
      scale(val){
        this.scaleNum=val;
        getTopology(this.index).scaleTo(val/100);
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
<style lang="scss">
  .scale-number-popover{
    width: 111px;
    min-width: 111px;
    .el-popover{
      width: 100%;
    }
  }
  .scale-number-popover .scale-num-pop{
    text-align: center;
    font-size: 14px;
    color: #666666;
    font-weight: 400;
    width: 91px;
    cursor: pointer;
  }
  .scale-number-popover .scale-num-pop.is-active{
    color: #FA901C;
  }
</style>
<style lang="scss" scoped>
  .tool-top {
    border-radius: 2px;
    display: inline-flex;
    .nz-icon{
      font-size: 14px;
      color: #666666;
    }
  }
  .top-tool-item{
    cursor: pointer;
    background: #FFFFFF;
    border: 1px solid #DEDEDE;
    border-radius: 2px;
    padding: 8px 11px;
    line-height: 14px;
    margin-right: 10px;
  }
  .top-tool-item-scale{
    margin-left: 40px;
    padding: 0;
    position: relative;
    .percent{
      position: absolute;
      top: 7px;
      left: 68px;
      font-size:12px ;
    }
    .scale-number{
      width: 91px;
      display: flex;
      height: 30px;
      line-height: 30px;
      position: relative;
      padding: 0 10px;
      justify-content: space-between;
      .scale-number-content{
        width: 59px;
        height: 100%;
        text-align: center;
        font-size: 12px;
        display: block;
        line-height: 28px;
      }
      .scale-number-symbol{
        background: #E9E9E9;
        height: 16px;
        width: 16px;
        display: inline-block;
        color: #333;
        font-size: 14px;
        line-height: 16px;
        border-radius: 50%;
        text-align: center;
        margin-top: 6px;
      }
    }
    /deep/ .el-input--mini{
      input{
        border: none;
      }
    }
    /deep/ .el-input-number--mini {
      width: 111px;
    }
    /deep/ .el-input-number__decrease,/deep/ .el-input-number__increase{
        border: none;
        border-radius: 100%;
        width: 16px;
        height: 16px;
        line-height: 16px;
        margin-top: 6px;
      }
    /deep/ .el-input-number__decrease{
        margin-left: 5px;
      }
    /deep/ .el-input-number__increase{
        margin-right: 5px;
      }
  }
  .top-tool-item-disabled{
    color: #CECECE;
    opacity: 0.3;
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
