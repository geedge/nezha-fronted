<template>
  <div class="location" >
    <div @click="toggleDropdown">
      <el-input :placeholder="$t('overall.select')" size="small" style="position: relative" :value="inputShowInfo"  :readonly="true" :disabled="disabled">
        <i slot="suffix" class="el-select__caret el-input__icon el-icon-arrow-down" style="font-size: 14px" :class="{'reverse':dropDownVisible == true}"></i>
      </el-input>
    </div>
    <div class="dropdown" :class="{'dropdown-active':dropDownVisible == true}" >
      <div class="container">
        <div class="container-item">
          <el-scrollbar style="height: 100%;">
            <ul v-if="idcInfos&& idcInfos.length>0">
              <li v-for="(item,index) in idcInfos" :key="item.id+'-'+index" @click="loadCabinetInfos(item)">
                <div class="container-item-content">
                  <div :title="item.name" class="container-item-content_label" :class="{'selected':selectedData.idc&&selectedData.idc.id == item.id}">{{item.name}}</div>
                  <div><i class="el-icon-arrow-right"></i></div>
                </div>
              </li>
            </ul>
            <div v-else class="dropdown-empty">{{$t('overall.noData')}}</div>
          </el-scrollbar>
        </div>
        <div class="container-item" v-show="isShowCabinet || selectedData.cabinet">
          <el-scrollbar style="height: 100%;">
            <ul v-if="showCabinetInfos&& showCabinetInfos.length>0">
              <li v-for="(item,index) in showCabinetInfos" :key="item.id+'-'+index" @click="loadCabinetUInfos(item)">
                <div class="container-item-content">
                  <div :title="item.name" class="container-item-content_label" :class="{'selected':selectedData.cabinet&&selectedData.cabinet.id == item.id}">{{item.name}}</div>
                  <div><i class="el-icon-arrow-right"></i></div>
                </div>
              </li>
            </ul>
            <div v-else class="dropdown-empty">{{$t('overall.noData')}}</div>
          </el-scrollbar>
        </div>
        <div class="container-item" v-show="isShowCabinetU || uChecked.length>0" style="border-right: unset">
          <el-scrollbar style="height: 100%">
            <el-checkbox-group v-model="uChecked" v-if="refresh" @change="uChange">
              <el-checkbox v-for="(item,index) in showUInfos" :key="index" :label="item.label" :value="item.value" :disabled="item.occupy==true" :checked="item.occupy==true||item.checked==true" :ref="'u-'+selectedData.idc.id+'-'+selectedData.cabinet.id+'-'+item.value" style="width: 50%"></el-checkbox>
            </el-checkbox-group>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <div class="dropdown-arrow"></div>
  </div>
</template>

<script>
  export default {
    name: "locationCascader",
    components:{

    },
    model:{
      prop:'value',
      event:'change'
    },
    props:{
      defaultModelUSize:{default:1},
      value:{default:null},
      disabled:{type:Boolean},
      idcOption: {type: Array}
    },
    data(){
      return {
        initData:null,
        dropDownVisible:false,
        idcInfos:[],
        cabinetInfos:new Map(),
        showCabinetInfos:[],
        uInfos:new Map(),
        showUInfos:[],
        selectedData:{
          idc:null,
          cabinet:null,
          u:null
        },
        isShowCabinet:false,
        isShowCabinetU:false,
        occupyU:[],
        uCheckedInfos:new Map(),
        uChecked:[],
        refresh:true,
        oldUChecked:[],
      }
    },
    created(){
      this.queryIdcInfos();
    },
    methods:{
      toggleDropdown:function(){
        if(this.disabled == false){
          this.dropDownVisible = !this.dropDownVisible;
          if(this.dropDownVisible){
            let $temp=this;
            document.addEventListener('click',function(e){
              e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
              $temp.dropDownVisible=false;
            },false)
            this.$el.addEventListener('click',function(e){
              e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
            },false)
          }
        }
      },
      queryIdcInfos:function(){
        this.idcInfos = this.idcOption;
        /*this.$get('idc?pageSize=-1').then(response=>{
          console.info(2)
          if(response.code == 200){
              this.idcInfos=response.data.list;
          }else{
            console.error(response.msg);
          }
        })*/
      },
      loadCabinetInfos:function(idc){
        if(!idc){
          return;
        }
        this.selectedData.idc=idc;
        this.selectedData.cabinet=null;
        this.selectedData.u=null;
        let cabinetKey='idc-'+idc.name+'-'+idc.id;
        this.showCabinetInfos=[];
        if(this.cabinetInfos.has(cabinetKey)&&this.cabinetInfos.get(cabinetKey)&&this.cabinetInfos.get(cabinetKey).length>0){
          this.showCabinetInfos=this.cabinetInfos.get(cabinetKey);
        }else{
          this.$get('cabinet?pageSize=-1&idcId='+idc.id).then(response=>{
            if(response.code == 200){
              this.cabinetInfos.set(cabinetKey,response.data.list);
              this.showCabinetInfos=response.data.list;
            }else{
              console.error(response.msg);
            }
          })
        }
        this.isShowCabinet=true;
        this.isShowCabinetU=false;
        this.showUInfos=[];
      },
      loadCabinetUInfos:function(cabinet,isInit=false){
        if(!cabinet){
          return ;
        }
        this.selectedData.cabinet=cabinet;
        this.selectedData.u=null;
        let cabinetUKey='cabinet-'+this.selectedData.idc.id+'-'+cabinet.id
        this.showUInfos=[];
        this.uChecked=[];
        this.oldUChecked=[];
        this.occupyU=[];
        if(this.uInfos.has(cabinetUKey)&&this.uInfos.get(cabinetUKey)&&this.uInfos.get(cabinetUKey).length>0){
          this.showUInfos=this.uInfos.get(cabinetUKey);
        }else{
          let us=[];
          this.$get('cabinet/u?id='+cabinet.id).then(response=>{
            if(response.code == 200){
              for(let i=1;i<=response.data.total;i++){
                let u={
                  label:i,
                  value:i,
                  occupy:false,
                  checked:false,
                }
                this.occupyU=response.data.occupy;
                if(response.data.occupy.find((item)=>{return u.value == item})){
                  u.occupy=true;
                }
                us.push(u)
              }
              this.showUInfos=us;
              if(isInit){ //回显处理
                this.showUinfos=this.showUInfos.map((item,index)=>{
                  if(item.value >= this.initData.u[0] && item.value <= this.initData.u[1]){
                    item.occupy=false;//修改时，当前asset使用的u位不算占用
                    this.occupyU=this.occupyU.filter((t,i)=>{return t != item.value})
                    this.uChecked.push(item.value)
                  }
                })
                this.oldUChecked=this.uChecked
                this.selectedData.u=this.initData.u;
                this.$emit('change',this.selectedData);
              }
              this.uInfos.set(cabinetUKey,us);
            }else{
              console.error(response.msg);
            }
          })
        }
        this.isShowCabinetU=true;
        this.refreshCheckBox();
      },
      uChange:function(data){
        if(data.length < this.oldUChecked.length){ //取消选择操作
          //1.判断是否仅剩下defualtModelusize 的u位选中
          let checkedValues=this.findUnoccupyU(this.oldUChecked);
          if(checkedValues.length <= this.defaultModelUSize){ // 刚好满足或小于默认usize
            this.clearUChecked();
          }else{
            let unCheckValue=this.oldUChecked.filter((item)=>{//取消选择的那个元素
              return this.oldUChecked.includes(item)&&!data.includes(item);
            })
            unCheckValue=unCheckValue[0];
            //2.判断是否连续，如果不是连续取消后面的选中
            let oldUCheckCopy=this.findOldCheckedMinMax()
            let min=oldUCheckCopy[0];
            let max=oldUCheckCopy[oldUCheckCopy.length-1];
            if(unCheckValue != min && unCheckValue != max){ //非连续取消选中
              debugger
              // 需要留下连续的 且 满足defaultModelUsize的u位
              if(unCheckValue - min >= this.defaultModelUSize){ //上方满足条件
                this.clearUChecked();
                for(let i = min; i<unCheckValue;i++){
                  this.uChecked.push(i);
                }
              }else if(max - unCheckValue >= this.defaultModelUSize){//下方满足条件
                this.clearUChecked();
                for(let i= unCheckValue+1;i<=max;i++){
                  this.uChecked.push(i);
                }
              }else{//两边都不满足条件，则优先上方
                this.clearUChecked();
                let counter=0;
                let item=min;
                while(counter < this.defaultModelUSize){
                  this.uChecked.push(item);
                  counter++;
                  item++;
                }
              }
            }else{ //连续取消选中
              //doNothing
            }
          }
        }else{
          let checkValues=this.findUnoccupyU(data);
          let checkValue=data[data.length-1]; //当前选中的u
          if(checkValues.length < this.defaultModelUSize){ //如果小于model 规定的大小，需要自动选择
            let suitU=this.findSuitableU(checkValue);
            if(suitU.length>0){ //有合适的u位
              while(this.uChecked.length - this.occupyU.length < this.defaultModelUSize){
                let popU=suitU.splice(0,1)[0]
                this.uChecked.push(popU);
              }
            }else{
              this.uChecked.splice(this.uChecked.length-1,1);
            }
          }else{//至少已经选择了defaultCabinetUsize 个u ，这里需要处理不连续选择的情况
            //1.判断是否连续
            let oldUCheckCopy=this.findOldCheckedMinMax()
            let min=oldUCheckCopy[0];
            let max=oldUCheckCopy[oldUCheckCopy.length-1];
            if(checkValue - max > 1 ){ //不连续
              //2.不连续需要判断中间数值是否有被占用的，有占用的不可选
              let occupyFlag=false;
              for(let i=max+1;i<checkValue;i++){
                if(this.occupyU.find((item)=>{return i == item})){
                  occupyFlag=true;
                  break;
                }
              }
              if(!occupyFlag){//没有占用，需要将中间未选中的选中
                for(let i=max+1;i<checkValue;i++){
                  this.uChecked.push(i);
                }
              }else{//占用，取消当前选中
                this.uChecked.splice(this.uChecked.length-1,1);
              }
            }else if(min - checkValue >1){//不连续
              let occupyFlag=false;
              for(let i=checkValue;i<min;i++){
                if(this.occupyU.find((item)=>{return i==item})){
                  occupyFlag=true;
                  break;
                }
              }
              if(!occupyFlag == true){
                for(let i=checkValue;i<min;i++){
                  this.uChecked.push(i);
                }
              }else{
                this.uChecked.splice(this.uChecked.length-1,1);
              }
            }else{//连续
              //doNothing
            }

          }

        }
        console.log('最终选择结果：')
        console.log(this.uChecked)
        this.oldUChecked=this.uChecked;
        this.selectedData.u=this.findOldCheckedMinMax(this.uChecked);
      },
      clearUChecked:function(){ //取消所有选中，恢复到刚打开时的状态
        this.uChecked=[];
        this.uChecked=this.uChecked.concat(this.occupyU);
      },
      findOldCheckedMinMax:function(){
        let oldUCheckCopy=Object.assign([],this.oldUChecked);
        oldUCheckCopy=this.findUnoccupyU(oldUCheckCopy)
        if(oldUCheckCopy&&oldUCheckCopy.length>0){
          oldUCheckCopy.sort((a,b)=>{return a-b});
          let min=oldUCheckCopy[0];
          let max=oldUCheckCopy[oldUCheckCopy.length-1];
          return [min,max]
        }else{
          return [];
        }

      },
      findUnoccupyU:function(arr){
        console.log('findUnoccupyU')
        console.log(this.occupyU)
        return  arr.filter((item,index)=>{
         return !this.occupyU.includes(item);
        })
      },
      findSuitableU:function(checkValue){
        //将u位数组分为左右两部分，先查找右边的是否符合
        let left=this.showUInfos.filter((item,index)=>{return item.value < checkValue});
        left=left.reverse();//自下而上查找
        let right=this.showUInfos.filter((item,index)=>{return item.value > checkValue});
        let leftCount=[]; //存放左侧合适的u位
        let rightCount=[];//存放右侧合适的u位
        for(let i=0;i<left.length;i++){
          let item=left[i];
          if(item.occupy == false){
            leftCount.push(item.value);
          }else{
            break;
          }
        }

        for(let i=0;i<right.length;i++){
          let item=right[i];
          if(item.occupy == false){
            rightCount.push(item.value);
          }else{
            break;
          }
        }
        let result=rightCount.concat(leftCount);
        if(result.length < this.defaultModelUSize - 1){
          result=[];
        }
        return result;
      },
      refreshCheckBox:function(){
        this.refresh = false
        this.$nextTick(() => {
          this.refresh = true
        })
      },
      initComponet:function(initData){
        this.initData=Object.assign({},initData);
        if(initData){
          this.selectedData.idc=initData.idc;
          this.selectedData.cabinet=initData.cabinet;
          this.selectedData.u=initData.u;
          this.loadCabinetInfos(initData.idc);
          this.loadCabinetUInfos(initData.cabinet,true);
        }
      }
    },
    mounted() {
    },
    computed:{
      inputShowInfo:function(){
        console.log(this.selectedData)
        let idcName=this.selectedData.idc?this.selectedData.idc.name+'/':'';

        let cabinetName=this.selectedData.cabinet?this.selectedData.cabinet.name+'/':'';

        let uValues=this.selectedData.u&&this.selectedData.u.length>0&&this.selectedData.u[0]&&this.selectedData.u[1]?this.selectedData.u[0]+'-'+this.selectedData.u[1]:'';

        if(!this.selectedData.idc){
          return '';
        }else if(this.selectedData.idc && !this.selectedData.cabinet){
          return idcName
        }else if(this.selectedData.idc && this.selectedData.cabinet && !this.selectedData.u ){
          return idcName+cabinetName;
        }else if(this.selectedData.idc && this.selectedData.cabinet && this.selectedData.u){
          return idcName+cabinetName+uValues;
        }
      }
    },
    watch:{
      selectedData:{
        immediate:true,
        deep:true,
        handler(n,o){
          this.$emit('change',n);
        }
      }
    }
  }
</script>

<style scoped>
  .location{
    position: relative;
  }
  .reverse{
    transform: rotate(-180deg);
  }
  .dropdown{
    position: absolute;
    min-width: 200px;
    padding:5px;
    background-color: #fff;
    display: none;
    z-index: 2020;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    margin: 10px 0;
  }
  .dropdown:before{
    content: "";
    width: 0;
    height: 0;
    border-right: 5px solid transparent;
    border-bottom: 5px solid #fff;
    border-left: 5px solid transparent;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    position: absolute;
    left: 10%;
    top:0%;
    margin-top:-5px
  }
  .dropdown:after{

  }
  .dropdown-active{
    display: block !important;
    height: 200px;
    width: 100%;
  }
  .container{
    height: 100%;
    width: 100%;
    display: flex;
  }
  .container .container-item{
    height: 100%;
    flex: 1;
    width: 0;
    border-right: 1px solid #E4E7ED;
    padding-left: 5px;
  }
  .container-item-content{
    display: flex;
    justify-content: space-between;
    padding:5px;
  }
  .container-item-content .container-item-content_label{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .container-item-content .selected{
    font-weight: 700;
    color:#ee9d3f;
  }
  .container-item-content .container-item-content_label:hover{
    color:#ee9d3f;
  }

  .dropdown-empty{
    margin: 0;
    text-align: center;
    color: #999;
    font-size: 14px;
  }
</style>
<style>

</style>
