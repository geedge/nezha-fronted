<template>
  <transition name="right-sub-box">
    <div class="right-sub-box sub-box" v-if="editTagsBox.show" :style="'top: ' + editTagsBox.top + 'px; left: ' + editTagsBox.left + 'px;'" >
      <div class="param-box" style="height: calc(100% - 25px)">
        <el-scrollbar style="height: 100%">
          <!--<div class="param-box-row" v-for="(item, index) in tempTagsObj" :key="index">
            <el-input placeholder="key" class="param-box-row-key input-x-mini-22" v-model="item.key"></el-input>
            <span class="param-box-row-eq">=</span>
            <el-input placeholder="value" class="param-box-row-value input-x-mini-22" v-model="item.value"></el-input>
            <span class="param-box-row-symbol" :id="'remove-param-'+index" @click="removeTags(index)"><i class="nz-icon nz-icon-minus-square"></i></span>
          </div>-->
          <el-tag v-for="(item, index) in tempTagsObj" class="sub-box-tags"  size="small" :closable="true" :key="index" @close='delTag(item,index)'>
            <div >{{item.key}}：{{item.value}}</div>
          </el-tag>
          <div class="param-box-row" v-show="showNewTagInput">
            <el-input placeholder="key" style="width: 63px" ref="tagKeyInput" class="param-box-row-key input-x-mini-22" :class="{'input-error':newTagInputError}" v-model="newTag.key" @keydown.enter.native="confirmInput" @blur="confirmInput"></el-input>
            <span class="param-box-row-eq">=</span>
            <el-input placeholder="value" style="width: 63px" class="param-box-row-value input-x-mini-22" v-model="newTag.value" @keydown.enter.native="confirmInput" @blur="confirmInput"></el-input>
          </div>
          <div v-if="showNewTagInput&&newTagInputError" style="text-align: left;padding-left: 10px">
            <span  style="color: #F56C6C;font-size: 12px;">{{$t('validate.key')}}</span>
          </div>
        </el-scrollbar>
      </div>
      <div class="add-btn">
<!--        <el-button @click="addTags" id="add-param" style="height: 18px; line-height: 18px; padding-top: 0; padding-bottom: 0;" size="mini"><i class="el-icon-plus"></i></el-button>-->
        <el-button @click="showEditTagsBox(false)"  style="height: 18px; line-height: 18px; padding-top: 0; padding-bottom: 0;" size="mini"><i class="el-icon-check"></i></el-button>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: "subBox",
    data(){
      return{
        editTagsBox: {show: false, top: 0, left: 0,},
        tempTagsObj:[],
        rowIndex:0,
        curConfigs:null,
        newTag:{key:'',value:''},
        showNewTagInput:true,
        newTagInputError:false,
      }
    },
    methods:{
      showEditTagsBox:function(show,configs,index,e){
        if (show) {
          this.rowIndex=index;
          this.curConfigs=configs;
          let position = e.target.getBoundingClientRect();
          this.editTagsBox.top = position.top + 25;
          this.editTagsBox.left = position.left - 48;
          this.tempTagsObj=[];
          let obj=null;
          try{
            obj=configs[index]['tags']
          }catch (e) {

          }
          if(obj){
            for(let key in obj){
              this.tempTagsObj.push({key:key,value:obj[key]})
            }
          }
        } else {
          if (!this.editTagsBox.show) {
            return;
          }
          this.confirmInput();
          this.showNewTagInput=true;
          let tempObj={};
          for(let i=0;i<this.tempTagsObj.length;i++){
            let obj=this.tempTagsObj[i];
            if(obj.key && obj.value){
              tempObj[obj.key]=obj.value;
            }
          }
          this.curConfigs[this.rowIndex]['tags']=Object.assign({},tempObj)
        }
        this.editTagsBox.show = show;
      },
      validateInput:function(){
        if(this.newTag.key == ''){
           return false;
        }
        if(!/[a-zA-Z_:][a-zA-Z0-9_:]*/.test(this.newTag.key)){
          this.newTagInputError=true;
          return false;
        }
        if(this.newTag.value == ''){
          return false;
        }
        this.newTagInputError=false;
        return true;
      },
      confirmInput:function(){
        if(this.validateInput()){
          this.tempTagsObj.push(Object.assign({},this.newTag));
          this.showNewTagInput=true;
          this.newTag={key:'',value:''};
          this.$nextTick(()=>{
            this.$refs.tagKeyInput.focus();
          })
        }
      },
      editTag:function(tag,index){
        if(this.showNewTagInput == true){//已经有编辑状态的tag，先保存
          this.confirmInput();
        }
        this.tempTagsObj.splice(index,1);
        this.newTag=Object.assign({},tag)
        this.showNewTagInput=true;
        this.$nextTick(()=>{
          this.$refs.tagKeyInput.focus();
        })
      },
      addTags:function(){
        if(this.showNewTagInput == true){//已经有编辑状态的tag，先保存
          this.confirmInput();
        }
        this.newTag={key:'',value:''}
        this.showNewTagInput=true;
        this.$nextTick(()=>{
          this.$refs.tagKeyInput.focus();
        })
      },
      delTag:function(tag,index){
        this.tempTagsObj.splice(index,1)
      },
      clearNewTag:function(){
        this.newTag={key:'',value:''}
        this.showNewTagInput=true;
      }
    },
  }
</script>
<style>
  .sub-box-tags{
    position: relative;
    margin-bottom: 5px;
    display: block;
    width: 150px;
    margin-left: 10px;
    text-align: left;
  }
  .sub-box-tags .el-tag__close{
    position: absolute;
    top: 5px;
    right: 2px;
  }
</style>
<style scoped>
  .right-sub-box {
    width: 170px;
    height: 225px;
    position: fixed;
    z-index: 2;
    padding: 0;
  }
  .sub-box{
    padding:5px;
    text-align: center;
  }
  .sub-box .param-box-row{
    padding:0 10px 0 10px !important;
  }
  .sub-box .add-btn{
    width: 100%;
    text-align: center;
    height: 25px;
    line-height: 25px;
    position: absolute;
    bottom: 0px;
    left: 0px;
  }
  /* start--param*/
  .param-btn {
    float: right;
    height: 27px;
    margin-top: -3px;
  }
  .param-btn-active {
    background-color: #656565;
    color: white;
    border: 1px solid #656565;
  }
  .param-btn-active:hover, .param-btn-active:focus {
    background-color: #656565;
    color: white;
  }
  .param-btn-clear {
    background-color: #D4D4D4;
    border: 1px solid #D4D4D4;
    color: white;
  }
  .param-btn-clear:hover, .param-btn-clear:focus {
    background-color: #D4D4D4;
    color: white;
  }

  .param-box {
    height: 200px;
    overflow: auto;
    border: none;
  }
  .param-box-row {
    padding: 7px 10px 0 10px;
    position: relative;
  }
  .param-box-row:last-of-type {
    padding-bottom: 7px;
  }
  .param-box-row-key, .param-box-row-value {
    display: inline-block;
    width: 50px;
  }
  .param-box-row-eq {
    display: inline-block;
    width: 14px;
    text-align: center;
    height: 22px;
    line-height: 22px;
    color: #c4c7cF;
  }
  /* end--param*/
</style>
