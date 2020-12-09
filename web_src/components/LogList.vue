<template>
    <div>
        <div class="box box-primary">
          <div class="box-header">
            <h4 class="text-primary text-center">日志列表</h4>
          </div>
          <div class="box-body">
            <form class="form-inline" autocomplete="off" spellcheck="false">
              <div class="form-group form-group-sm">
                <label>搜索</label>
                <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
              </div>
              <span class="hidden-xs">&nbsp;&nbsp;</span>
              <div class="form-group form-group-sm">
                <label>调用方式</label>
                <select class="form-control" v-model.trim="method">
                  <option value="">全部</option>
                  <option value="GET">HTTP GET</option>
                  <option value="POST">HTTP POST</option>
                  <option value="INVITE">SIP INVITE</option>
                  <!-- <option value="BYE">SIP BYE</option> -->
                </select>
              </div>
              <span class="hidden-xs">&nbsp;&nbsp;</span>
              <div class="form-group">
                  <div class="input-group input-group-sm">
                      <DatePicker class="form-control input-group-sm" clearBtn :day.sync="starttime" ref="startDatePicker" placeholder="开始日期"></DatePicker>
                      <div class="input-group-btn">
                          <button type="button" class="btn btn-sm btn-default" @click.prevent="showStartDatePicker">
                            <i class="fa fa-calendar"></i>
                          </button>
                      </div>
                  </div>
              </div>
              <span class="hidden-xs">&nbsp;-&nbsp;</span>
              <div class="form-group">
                  <div class="input-group input-group-sm">
                      <DatePicker class="form-control input-group-sm" clearBtn :day.sync="endtime" ref="endDatePicker" placeholder="结束日期"></DatePicker>
                      <div class="input-group-btn">
                          <button type="button" class="btn btn-sm btn-default" @click.prevent="showEndDatePicker">
                            <i class="fa fa-calendar"></i>
                          </button>
                      </div>
                  </div>
              </div>
              <div class="form-group form-group-sm pull-right" v-if="hasAnyRole(serverInfo, userInfo, '管理员') && hasAllChannel(serverInfo, userInfo)">
                <div class="input-group input-group-sm">
                  <button type="button" class="btn btn-sm btn-danger" @click.prevent="clearLog">
                    <i class="fa fa-remove"></i> 全部删除
                  </button>
                </div>
              </div>
            </form>
            <br>
            <div class="clearfix"></div>
            <el-table :data="logs" stripe :default-sort="{prop: 'StartAt', order: 'descending'}" @sort-change="sortChange" v-loading="loading" element-loading-text="加载中...">
              <el-table-column prop="Name" label="操作名称" min-width="120" show-overflow-tooltip></el-table-column>
              <el-table-column prop="Method" label="调用方式" min-width="120" :formatter="formatMethod"></el-table-column>
              <el-table-column prop="RequestURI" label="资源路径" min-width="200" show-overflow-tooltip></el-table-column>
              <el-table-column prop="RemoteAddr" label="远端地址" min-width="150" show-overflow-tooltip></el-table-column>
              <el-table-column prop="Status" label="结果" min-width="140" :formatter="formatStatus" show-overflow-tooltip></el-table-column>
              <el-table-column prop="Duration" label="用时(秒)" min-width="100" :formatter="formatDuration" sortable="custom" show-overflow-tooltip></el-table-column>
              <el-table-column prop="Username" label="操作人" min-width="120" show-overflow-tooltip></el-table-column>
              <el-table-column prop="StartAt" label="操作时间" min-width="160" sortable="custom"></el-table-column>
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
import DatePicker from "components/DatePicker.vue";
import { mapState } from "vuex";
import moment from 'moment';
export default {
  props: {
  },
  data() {
    return {
      q: "",
      method: "",
      starttime: "",
      endtime: "",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      sort: "StartAt",
      order: "desc",
      loading: false,
      timer: 0,
      logs: [],
    };
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  watch: {
    q: function(newVal, oldVal) {
      this.doDelaySearch();
    },
    starttime: function(newVal, oldVal) {
      this.doSearch();
    },
    endtime: function(newVal, oldVal) {
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
    DatePicker
  },
  mounted() {
    // this.timer = setInterval(() => {
    //   this.getLogs();
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
      if (this.starttime) query["starttime"] = this.starttime;
      if (this.endtime) query["endtime"] = this.endtime;
      if (this.method) query["method"] = this.method;
      this.$router.replace({
        path: `/logs/${page}`,
        query: query
      });
    },
    doDelaySearch: _.debounce(function() {
      this.doSearch();
    }, 500),
    getLogs() {
      $.get("/api/v1/log/list", {
        q: this.q,
        start: (this.currentPage -1) * this.pageSize,
        limit: this.pageSize,
        starttime: this.starttime ? moment(this.starttime, "YYYYMMDD").startOf('day').format("YYYYMMDDHHmmss") : "",
        endtime: this.endtime ? moment(this.endtime, "YYYYMMDD").endOf('day').format("YYYYMMDDHHmmss") : "",
        method: this.method,
        sort: this.sort,
        order: this.order
      })
      .then(ret => {
        this.total = ret.LogCount;
        this.logs = ret.LogList;
      })
      .always(() => {
      });
    },
    sortChange(data) {
      this.sort = data.prop;
      this.order = data.order == "ascending" ? "asc" : "desc";
      this.getLogs();
    },
    formatMethod(row, col, cell) {
      return `${row.Scheme} ${row.Method}`;
    },
    formatStatus(row, col, cell) {
      return `${row.StatusCode} ${row.Status}`;
    },
    formatDuration(row, col, cell) {
      return moment.duration(row.Duration).asSeconds();
    },
    showStartDatePicker() {
      $(this.$refs.startDatePicker.$el).focus();
    },
    showEndDatePicker() {
      $(this.$refs.endDatePicker.$el).focus();
    },
    removeLog(row) {
      this.$confirm(`确认删除`, "提示").then(() => {
        $.get("/api/v1/log/remove", {
          id: row.ID
        }).always(() => {
          this.getLogs();
        });
      }).catch(() => {});
    },
    clearLog() {
      this.$confirm('确认全部删除', "提示").then(() => {
        $.get("/api/v1/log/clear", {}).then(() => {
          this.getLogs();
        })
      }).catch(() => {});
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.q = to.query.q || "";
      vm.starttime = to.query.starttime || "";
      vm.endtime = to.query.endtime || "";
      vm.method = to.query.method || "";
      vm.currentPage = parseInt(to.params.page) || 1;
    });
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.$nextTick(() => {
      this.q = to.query.q || "";
      this.starttime = to.query.starttime || "";
      this.endtime = to.query.endtime || "";
      this.method = to.query.method || "";
      this.currentPage = parseInt(to.params.page) || 1;
      this.logs = [];
      this.getLogs();
    });
  }
};
</script>



