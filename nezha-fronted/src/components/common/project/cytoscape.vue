<template>
  <div id="cy"></div>
</template>

<script>
  import cytoscape from 'cytoscape';
	export default {
		name:"cytoscape",
    data(){
		  return {
		    cy:'',
      }
    },
    mounted(){
		  this.init();
    },
    methods:{
		  init(){
        this.cy = cytoscape({
          container: document.getElementById('cy'), // container to render in
          elements: [ // list of graph elements to start with
            { // node a
              data: { id: 'a' }
            },
            { // node b
              data: { id: 'b' }
            },
            { // edge ab
              data: { id: 'ab', source: 'a', target: 'b' }
            }
          ],
          style: [ // the stylesheet for the graph
            {
              selector: 'node',
              style: {
                'background-color': '#666',
                'label': 'data(id)'
              }
            },

            {
              selector: 'edge',
              style: {
                'width': 3,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
              }
            }
          ],
          layout: {
            name: 'grid',
            rows: 1
          }
        });
      },
    }
	}
</script>

<style scoped>
  #cy {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
