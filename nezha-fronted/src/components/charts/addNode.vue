<template>
  <el-form ref="form" :model="form" label-width="80px">
    <el-form-item label="Id">
      <el-input v-model="form.modelId"></el-input>
    </el-form-item>
    <el-form-item label="Label">
      <el-input v-model="form.label"></el-input>
    </el-form-item>
    <el-form-item label="x">
      <el-input v-model="form.x"></el-input>
    </el-form-item>
    <el-form-item label="y">
      <el-input v-model="form.y"></el-input>
    </el-form-item>
    <el-form-item label="image">
      <el-input v-model="form.image"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">提交</el-button>
      <el-button>取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
	export default {
		name:"addNode",
    props:{
      nodeData:{}
    },
    watch:{
      nodeData(n){
        for(let key in this.form){
          this.form[key]=n[key]
        }
        this.form.modelId=n.id;
      }
    },
    data(){
		  return{
        form:{
          modelId:'',
          label:'',
          x:'',
          y:'',
          image:'',
        }
      }
    },
    methods:{
      onSubmit(){
        let model=Object.assign({id:this.form.modelId,shape:'image',shapeProperties:{useImageSize:false}},{...this.form});
        this.$emit('addModel',model)
      },
    },

	}
</script>

<style scoped>

</style>
