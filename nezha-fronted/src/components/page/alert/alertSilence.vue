<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.alertSilence"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button
          id="roles-add"
          v-has="'alertSilence_add'"
          :title="$t('overall.createAlertSilence')"
          class="top-tool-btn margin-r-10"
          type="button"
          @click="add"
        >
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :from="'alertSilence'"
          :forceDeleteShow="false"
          id="role-list-batch-delete"
          v-has="'alertSilence_expire'"
          :api="url"
          :delete-objs="batchDeleteObjs"
          @after="getTableData"
          @before="delFlag = true"
        ></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <alert-silence-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          :nowTime="nowTime"
          @del="del"
          @edit="edit"
          @copy="copy"
          @orderBy="tableDataSort"
          @queryMessage="queryMessage"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="
            (targetTab, object) => {
              $refs.dataList.showBottomBox(targetTab, object);
            }
          "
        ></alert-silence-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination
          ref="Pagination"
          :pageObj="pageObj"
          :tableId="tableId"
          @pageNo="pageNo"
          @pageSize="pageSize"
        ></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <alert-silence-box
        v-if="rightBox.show"
        :alert-silence="object"
        @close="closeRightBox"
      ></alert-silence-box>
    </transition>
    <!--导出-->
    <div class="export-xlsx">
      <el-dialog
        :modal-append-to-body="false"
        :show-close="true"
        :title="importBox.title"
        :visible.sync="importBox.show"
        class="nz-dialog"
        width="300px"
        @close="closeDialog"
      >
        <div class="upload-body">
          <button
            id="alert-msg-exportcur"
            class="el-button el-button--default el-button--small"
            @click="exportCur"
          >
            <span>{{ $t("overall.current") }}</span>
          </button>
          <button
            id="alert-msg-exportall"
            class="el-button el-button--default el-button--small"
            @click="exportAll"
          >
            <span>{{ $t("overall.exportAll") }}</span>
          </button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import bus from "@/libs/bus";
import alertSilenceBox from "@/components/common/rightBox/alertSilenceBox";
import deleteButton from "@/components/common/deleteButton";
import nzDataList from "@/components/common/table/nzDataList";
import dataListMixin from "@/components/common/mixin/dataList";
import alertSilenceTable from "@/components/common/table/alert/alertSilenceTable";
import routerPathParams from "@/components/common/mixin/routerPathParams";

export default {
  name: "alertSilence",
  components: {
    alertSilenceTable,
    deleteButton,
    nzDataList,
    alertSilenceBox,
  },
  mixins: [dataListMixin, routerPathParams],
  data() {
    return {
      url: "alert/silence",
      tableId: "silenceTable",
      /* 搜素相关 */
      searchMsg: {
        // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            name: "ID",
            type: "input",
            label: "ids",
            disabled: false,
          },
          {
            name: this.$t("alert.silence.matchers"),
            type: "input",
            label: "matchers",
            disabled: false,
          },
        ],
      },
      // 导出相关
      importBox: { show: false, title: this.$t("overall.exportExcel") },
      deleteBox: { show: false, ids: "", remark: "", state: 2 },
      // 创建修改相关
      blankObject: {
        id: "",
        startAt: "",
        endAt: "",
        ruleId: "",
        type: "asset",
        linkId: "",
        remark: "",
        time: [],
        matchers: [{ name: "", value: "", regex: 0 }],
        name: "",
      },
      nowTime: "",
    };
  },
  mounted() {
    this.initEvent();
  },
  methods: {
    queryMessage(alertRule) {
      this.$refs.dataList.showBottomBox('alertRuleAlertMessage', alertRule)
    },
    closeRightBox(refresh) {
      this.rightBox.show = false;
      this.copyFlag = false;
      this.object = {};
      if (refresh) {
        this.delFlag = true;
        this.getTableData();
      }
    },
    initEvent() {
      bus.$on("alert-rule-list-change", () => {
        this.getTableData();
      });
      bus.$on("dc-list-change", () => {
        this.getTableData();
      });
      bus.$on("alert-message-change", () => {
        this.getTableData();
      });
    },
    exportCur() {
      const searchLabel = Object.assign({}, this.searchLabel);
      this.$set(
        searchLabel,
        "language",
        localStorage.getItem("nz-language")
          ? localStorage.getItem("nz-language")
          : "en"
      );
      this.exportExcel(searchLabel);
      this.closeDialog();
    },
    exportAll() {
      const temp = JSON.parse(JSON.stringify(this.searchLabel));
      temp.pageSize = -1;
      this.$set(
        temp,
        "language",
        localStorage.getItem("nz-language")
          ? localStorage.getItem("nz-language")
          : "en"
      );
      this.exportExcel(temp);
      this.closeDialog();
    },
    closeDialog() {
      this.importBox.show = false;
      this.deleteBox.show = false;
    },
    getTableData(params) {
      if (params && Object.keys(params).length > 0) {
        for (const key in params) {
          this.$set(this.searchLabel, key, params[key]);
        }
      }
      if (this.orderBy) {
        this.$set(this.searchLabel, "orderBy", this.orderBy);
      } else {
        delete this.searchLabel.orderBy;
      }
      this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
      this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
      this.tools.loading = true;
      const alertRuleParam = {
        ...this.searchLabel,
        ...this.searchCheckBox,
      };
      const path = this.fromRoute.alertSilence;
      this.updatePath(alertRuleParam, path);
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(
        (response) => {
          this.tools.loading = false;
          this.nowTime = this.utcTimeToTimezoneStr(response.time);
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              response.data.list[i].status = response.data.list[i].status + "";
              // response.data.list[i].startAt = bus.UTCTimeToConfigTimezone(response.data.list[i].startAt)
              // response.data.list[i].endAt = bus.UTCTimeToConfigTimezone(response.data.list[i].endAt)
            }
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total;
            if (
              !this.scrollbarWrap &&
              this.$refs.dataTable &&
              this.$refs.dataTable.$refs.dataTable
            ) {
              this.$nextTick(() => {
                this.scrollbarWrap =
                  this.$refs.dataTable.$refs.dataTable.bodyWrapper;
                this.toTopBtnHandler(this.scrollbarWrap);
              });
            }
          }
        }
      );
    },
    add() {
      this.blankObject.startAt = bus.getOffsetTimezoneData();
      this.blankObject.endAt = bus.getOffsetTimezoneData(1);
      this.object = JSON.parse(JSON.stringify(this.blankObject));
      this.rightBox.show = true;
    },
    edit(u, copyFlag) {
      this.$get(`${this.url}/${u.id}`).then((response) => {
        if (response.code === 200) {
          this.object = {
            ...response.data,
            matchers: JSON.parse(response.data.matchers),
            startAt: bus.UTCTimeToConfigTimezone(response.data.startAt),
            endAt: bus.UTCTimeToConfigTimezone(response.data.endAt),
          };
          if (copyFlag) {
            this.object.id = "";
            this.object.name = this.object.name + "-copy";
            if (this.object.name.length > 64) {
              const length = this.object.name.length - 64;
              this.object.name =
                u.name.substring(0, u.name.length - length) + "-copy";
            }
          }
          this.rightBox.show = true;
        }
      });
    },
    copy(u) {
      this.edit(u, true);
    },
    del(row) {
      this.$confirm(this.$t("tip.confirmExpired"), {
        confirmButtonText: this.$t("tip.yes"),
        cancelButtonText: this.$t("tip.no"),
        type: "warning",
      }).then(() => {
        this.$delete(this.url + "?ids=" + row.id + "&state=" + this.state).then(
          (response) => {
            if (response.code === 200) {
              this.delFlag = true;
              this.$message({
                duration: 2000,
                type: "success",
                message: this.$t("tip.deleteSuccess"),
              });
              this.getTableData();
            } else {
              this.$message.error(response.msg);
            }
          }
        );
      });
    },
  },
  created() {
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      pageNo: { target: this.pageObj, propertyName: "pageNo", type: "number" },
      pageSize: {
        target: this.pageObj,
        propertyName: "pageSize",
        type: "number",
      },
      orderBy: { target: this.$data, propertyName: "orderBy", type: "string" },
      ids: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: "ids",
        type: "string",
        defaultJson: {
          disabled: false,
          id: "ids",
          label: "ids",
          name: "ID",
          type: "input",
          val: "",
        },
        jsonKey: "val",
      },
      matchers: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: "matchers",
        type: "string",
        defaultJson: {
          disabled: false,
          label: "matchers",
          name: "Matcher",
          type: "input",
          val: "",
        },
        jsonKey: "val",
      },
    };
    this.initQueryFromPath(searchKeys);
  },
};
</script>
