<template>
    <div>
        <div class="box box-primary">
          <div class="box-header">
            <h4 class="text-primary text-center">报警列表</h4>
          </div>
          <div class="box-body">
            <form class="form-inline" autocomplete="off" spellcheck="false">
              <div class="form-group form-group-sm">
                <label>搜索</label>
                <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
              </div>
              <span class="hidden-xs">&nbsp;&nbsp;</span>
              <div class="form-group form-group-sm">
                <label>报警级别</label>
                <select class="form-control" v-model.trim="priority">
                  <option value="">全部</option>
                  <option value="1">一级警情</option>
                  <option value="2">二级警情</option>
                  <option value="3">三级警情</option>
                  <option value="4">四级警情</option>
                </select>
              </div>
              <span class="hidden-xs">&nbsp;&nbsp;</span>
              <div class="form-group form-group-sm">
                <label>报警方式</label>
                <select class="form-control" v-model.trim="method">
                  <option value="">全部</option>
                  <option value="1">电话报警</option>
                  <option value="2">设备报警</option>
                  <option value="3">短信报警</option>
                  <option value="4">GPS报警</option>
                  <option value="5">视频报警</option>
                  <option value="6">设备故障报警</option>
                  <option value="7">其他报警</option>
                </select>
              </div>
            </form>
            <br>
            <div class="clearfix"></div>
            <el-table :data="alarms" stripe :default-sort="{prop: 'Time', order: 'descending'}" @sort-change="sortChange" v-loading="loading" element-loading-text="加载中...">
              <el-table-column prop="DeviceID" label="报警设备" min-width="200" :formatter="formatDevice" show-overflow-tooltip></el-table-column>
              <el-table-column prop="ChannelID" label="报警通道" min-width="200" :formatter="formatChannel" show-overflow-tooltip></el-table-column>
              <el-table-column label="操作" min-width="100" v-if="isMobile()" class-name="opt-group">
                <template slot-scope="props">
                    <div class="btn-group btn-group-xs">
                      <button type="button" class="btn btn-danger" @click.prevent="removeAlarm(props.row)">
                        <i class="fa fa-remove"></i> 删除
                      </button>
                    </div>
                </template>
              </el-table-column>
              <el-table-column prop="AlarmPriority" label="报警级别" min-width="100" :formatter="formatPriority" show-overflow-tooltip sortable="custom"></el-table-column>
              <el-table-column prop="AlarmMethod" label="报警方式" min-width="100" :formatter="formatMethod" show-overflow-tooltip></el-table-column>
              <el-table-column prop="AlarmType" label="报警类型" min-width="100" :formatter="formatType" show-overflow-tooltip></el-table-column>
              <el-table-column prop="Time" label="报警时间" min-width="150" sortable="custom"></el-table-column>
              <!-- <el-table-column prop="RecordLink" label="关联录像" min-width="150" show-overflow-tooltip>
                <template slot-scope="props">
                  <a href="props.RecordLink" v-if="props.RecordLink" target="_blank">{{props.RecordLink}}</a>
                  <span v-else>-</span>
                </template>
              </el-table-column> -->
              <!-- <el-table-column prop="Description" label="描述" min-width="200" show-overflow-tooltip></el-table-column> -->
              <el-table-column label="操作" min-width="100" fixed="right" v-if="!isMobile()" class-name="opt-group">
                <template slot-scope="props">
                    <div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-danger" @click.prevent="removeAlarm(props.row)">
                          <i class="fa fa-remove"></i> 删除
                        </button>
                    </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="box-footer" v-if="total > 0">
            <el-pagination layout="total,prev,pager,next" :pager-count="5" class="pull-right" :total="total" :page-size.sync="pageSize" :current-page.sync="currentPage"></el-pagination>
          </div>
        </div>
    </div>
</template>

<script>
import _ from "lodash";
import { mapState } from "vuex";
export default {
  props: {
  },
  data() {
    return {
      q: "",
      priority: "",
      method: "",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      sort: "Time",
      order: "desc",
      loading: false,
      timer: 0,
      alarms: []
    };
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  watch: {
    q: function(newVal, oldVal) {
      this.doDelaySearch();
    },
    priority: function(newVal, oldVal) {
      this.doSearch();
    },
    method: function(newVal, oldVal) {
      this.doSearch();
    },
    currentPage: function(newVal, oldVal) {
      this.doSearch(newVal);
    }
  },
  components: {
    // CascadeEditDlg
  },
  mounted() {
    // this.timer = setInterval(() => {
    //   this.getAlarms();
    // }, 3000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
  },
  methods: {
    doSearch(page = 1) {
      var query = {};
      if (this.q) query["q"] = this.q;
      if (this.priority) query["priority"] = this.priority;
      if (this.method) query["method"] = this.method;
      this.$router.replace({
        path: `/alarms/${page}`,
        query: query
      });
    },
    doDelaySearch: _.debounce(function() {
      this.doSearch();
    }, 500),
    getAlarms() {
      $.get("/api/v1/alarm/list", {
        q: this.q,
        start: (this.currentPage -1) * this.pageSize,
        limit: this.pageSize,
        priority: this.priority,
        method: this.method,
        sort: this.sort,
        order: this.order
      })
      .then(ret => {
        this.total = ret.AlarmCount;
        this.alarms = ret.AlarmList;
      })
      .always(() => {
      });
    },
    sortChange(data) {
      this.sort = data.prop;
      this.order = data.order == "ascending" ? "asc" : "desc";
      this.getAlarms();
    },
    formatName(row, col, cell) {
      if (cell) return cell;
      return "-";
    },
    formatDevice(row, col, cell) {
      // if (row.DeviceName) {
      //   return row.DeviceName;
      // }
      if (row.DeviceID) {
        return row.DeviceID;
      }
      return "-";
    },
    formatChannel(row, rol, cell) {
      // if (row.ChannelName) {
      //   return row.ChannelName;
      // }
      if (row.ChannelID) {
        return row.ChannelID;
      }
      return "-";
    },
    formatPriority(row, col, cell) {
      if (row.AlarmPriorityName){
        return row.AlarmPriorityName;
      }
      if (row.AlarmPriority != undefined) {
        return row.AlarmPriority;
      }
      return "-";
    },
    formatMethod(row, col, cell) {
      if (row.AlarmMethodName) {
        return row.AlarmMethodName;
      }
      if (row.AlarmMethod != undefined) {
        return row.AlarmMethod;
      }
      return "-";
    },
    formatType(row, col, cell) {
      if (row.AlarmTypeName) {
        return row.AlarmTypeName;
      }
      if (row.AlarmType != undefined) {
        return row.AlarmType;
      }
      return "-";
    },
    removeAlarm(row) {
      this.$confirm(`确认删除`, "提示").then(() => {
        $.get("/api/v1/alarm/remove", {
          id: row.ID
        }).always(() => {
          this.getAlarms();
        });
      }).catch(() => {});
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.q = to.query.q || "";
      vm.priority = to.query.priority || "";
      vm.method = to.query.method || "";
      vm.currentPage = parseInt(to.params.page) || 1;
    });
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.$nextTick(() => {
      this.q = to.query.q || "";
      this.priority = to.query.priority || "";
      this.method = to.query.method || "";
      this.currentPage = parseInt(to.params.page) || 1;
      this.alarms = [];
      this.getAlarms();
    });
  }
};
</script>

<style lang="less">
.opt-group .cell {
  overflow: visible;
}
</style>



