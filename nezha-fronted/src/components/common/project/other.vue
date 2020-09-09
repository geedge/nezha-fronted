<template>
  <div id="topo-canvas"></div>
</template>

<script>
  // 1. 导入绘画引擎
  import { Topology,Node,Point } from '@topology/core';
  // import { Point } from 'topology-core/models/point';
  // 图形库
  import { register as registerFlow } from '@topology/flow-diagram';
  import { register as registerActivity } from '@topology/activity-diagram';
  import { register as registerClass } from '@topology/class-diagram';
  import { register as registerSequence } from '@topology/sequence-diagram';
  import { register as registerChart } from '@topology/chart-diagram';
  // 注册图形库
  function canvasRegister() {
    registerFlow();
    registerActivity();
    registerClass();
    registerSequence();
    registerChart();
    // ... 其他图形库
  }
  canvasRegister();
	export default {
		name:"other",
    data(){
		  return{
        topology:"",
      }
    },
    mounted(){
      this.topology = new Topology('topo-canvas', {});
      let a= new Point(110,10,undefined,undefined,1,);
      console.log(a);
      this.topology.open(a)
    }
  }
</script>

<style scoped>

</style>
