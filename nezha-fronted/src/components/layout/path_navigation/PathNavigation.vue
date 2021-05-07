<template>
  <div class="navigation">
    <el-dialog title="Get started in 6 steps" :visible.sync="show" center>
      <el-tabs type="border-card">
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-datacenter1"></i> 我的行程</span
          >
          <div style="margin-top: 0">
            1sadssssssssssssssssssssssasddddddddddddddddddddddddddddddddddddsdsadasdasdasdasdasdasdasdassssssssssssssssssssssssssssssssssssssssssddddd
          </div>
          <div style="margin-top: 0">
            1sadssssssssssssssssssssssasddddddddddddddddddddddddddddddddddddsdasdassssssssssssssssssssssssssssssssssssssssssddddd
          </div>
          <el-button @click="addDatacenter">add a</el-button>
          <el-button @click="addCabinet">add b</el-button>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-agent"></i> 我的行程</span
          >
          <div>1</div>
          <el-button @click="addAgent">add a</el-button>
          <el-button @click="downloadAgent">add b</el-button>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-menu-assets"></i> 我的行程</span
          >
          <div>1</div>
          <el-button @click="addAsset">add a</el-button>
          <el-button @click="importAsset">add b</el-button>
          <el-button @click="webTerminal">add c</el-button>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-menu-project"></i> 我的行程</span
          >
          <div>1</div>
          <el-button @click="addPeoject">add a</el-button>
          <el-button @click="addModule">add b</el-button>
          <el-button @click="addEndpoint">add c</el-button>
          <el-button @click="importEndpoint">add d</el-button>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-visualization"></i> 我的行程</span
          >
          <div>1</div>
          <el-button @click="addPanel">add a</el-button>
          <el-button @click="addChart">add b</el-button>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"
            ><i class="nz-icon nz-icon-terminal-log"></i> 我的行程</span
          >
          <div>1</div>
          <el-button @click="addAlertRule">add a</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script>
import DcBox from "@/components/common/rightBox/dcBox";
export default {
  props: {
    show: Boolean,
  },
  components: {
    DcBox
  },
  data() {
    return {};
  },
  methods: {
    // Datacenter
    addDatacenter() {
      this.$router.push({
        path: "/dc",
      });
      this.$emit("update:show", false);
    },
    addCabinet() {
      console.log(2);
      console.log(this.$route);
      this.$router.push({
        path: "/dc/cabinet",
      });
      this.$emit("update:show", false);
    },
    // Angebt
    addAgent() {
      this.$router.push({
        path: "/agent",
      });
      this.$emit("update:show", false);
    },
    downloadAgent() {
      console.log(4);
    },
    // Asset
    addAsset() {
      this.$router.push({
        path: "/asset",
      });
      this.$emit("update:show", false);
    },
    importAsset() {
      console.log(6);
    },
    webTerminal() {
      console.log(7);
    },
    // Monitor
    addPeoject() {
      this.$router.push({
        path: "/monitor/project",
      });
      this.$emit("update:show", false);
    },
    addModule() {
      console.log(9);
    },
    addEndpoint() {
      console.log(10);
    },
    importEndpoint() {
      console.log(11);
    },
    // Visualization
    addPanel() {
      this.$router.push({
        path: "/panel",
      });
      this.$emit("update:show", false);
    },
    addChart() {
      console.log(13);
    },
    // Alert
    addAlertRule() {
      this.$router.push({
        path: "/alertRule",
      });
      this.$emit("update:show", false);
    },
  },
  computed: {},
};
</script>
<style lang="scss">
.el-dialog__body {
  background-color: #fff;
  .el-tab-pane {
    text-align: center;
    div {
      text-align: left;
      line-height: 20px;
    }
    .el-button {
      width: 156px;
      height: 46px;
      border-radius: 2px;
      background-color: #666;
      span {
        color: #fff;
      }
    }
  }
}
</style>