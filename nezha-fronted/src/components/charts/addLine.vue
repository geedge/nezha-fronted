<template>
  <el-form ref="form" :model="form" label-width="80px" :rules="rules">
    <el-form-item label="Id">
      <el-input v-model="form.lineId"></el-input>
    </el-form-item>
    <el-form-item label="箭头方向" prop="arrows">
      <el-select v-model="form.arrows" placeholder="请选择活动区域">
        <el-option label="from" value="from"></el-option>
        <el-option label="to" value="to"></el-option>
        <el-option label="from;to" value="from;to"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="color">
      <el-color-picker
        v-model="form.color"
        :predefine="predefineColors">
      </el-color-picker>
    </el-form-item>
    <el-form-item label="Label">
      <el-input v-model="form.label"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">提交</el-button>
      <el-button>取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  export default {
    name:"addLine",
    props:{
    },
    data(){
      return{
        form:{
          arrows:'',
          label:'',
          color:'#1e90ff',
          lineId:'',
        },
        predefineColors: [
          '#ff4500',
          '#ff8c00',
          '#ffd700',
          '#90ee90',
          '#00ced1',
          '#1e90ff',
          '#c71585',
          '#c71585'
        ],
        rules:{
          arrows: [
            { required: true, message: '请输入活动名称', trigger: 'change' },
          ],
        }
      }
    },
    methods:{
      onSubmit(){
        // {id: 0,from: 2, to: 1,label:"hahah",arrows:'from;to', color: {color:'red',highlight:'red',hover:'red',opacity:1.0},},
        let model=Object.assign({id:this.form.lineId},{...this.form},{color: {color:this.form.color,highlight:this.form.color,hover:this.form.color,opacity:1.0}});
        this.$emit('addLine',model)
      },
    },

  }
</script>

<style scoped>

</style>
