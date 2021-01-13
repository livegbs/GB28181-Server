<template>
  <div>
    <div class="box box-primary">
      <div class="box-header">
        <h4 class="text-primary text-center">设备列表</h4>
      </div>
      <div class="box-body">
        <form class="form-inline" autocomplete="off" spellcheck="false">
          <div class="form-group form-group-sm">
            <label>搜索</label>
            <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
          </div>
          <span class="hidden-xs">&nbsp;&nbsp;</span>
          <div class="form-group form-group-sm">
            <label>在线状态</label>
            <select class="form-control" v-model.trim="online">
              <option value="">全部</option>
              <option value="true">在线</option>
              <option value="false">离线</option>
            </select>
          </div>
          <!-- <div class="form-group pull-right">
            <router-link :to="`/devices/tree`" class="btn btn-default btn-sm">
                <i class="fa fa-sitemap"></i> 树视图
            </router-link>
          </div> -->
        </form>
        <br>
        <div class="clearfix"></div>
        <el-table :data="devices" stripe :default-sort="{prop: 'ID', order: 'ascending'}" @sort-change="sortChange">
          <el-table-column prop="ID" label="设备国标编号" min-width="200" sortable="custom" show-overflow-tooltip>
            <template slot-scope="props">
              <span>{{props.row.ID}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" :min-width="hasAnyRole(serverInfo, userInfo, '管理员') ? 240 : 120" v-if="isMobile()">
            <template slot-scope="props">
                <div class="btn-group btn-group-xs">
                    <router-link class="btn btn-info" :to="`/devices/channels/${props.row.ID}/1`" v-if="props.row.ChannelCount > 0">
                        查看通道
                    </router-link>
                    <button type="button" class="btn btn-primary" @click.prevent="fetchCatalog(props.row)" v-if="props.row.Online && hasAnyRole(serverInfo, userInfo, '管理员')">
                      <i class="fa fa-refresh"></i> 更新通道
                    </button>
                    <button type="button" class="btn btn-warning" @click.prevent="editDevice(props.row)" v-if="hasAnyRole(serverInfo, userInfo, '管理员')">
                      <i class="fa fa-edit"></i> 编辑
                    </button>
                    <button type="button" class="btn btn-danger" @click.prevent="removeDevice(props.row)" v-if="!props.row.Online && hasAnyRole(serverInfo, userInfo, '管理员')">
                      <i class="fa fa-remove"></i> 删除
                    </button>
                </div>
            </template>
          </el-table-column>
          <el-table-column prop="Name" label="名称" min-width="140" :formatter="formatName" show-overflow-tooltip></el-table-column>
          <el-table-column prop="CommandTransport" label="信令传输" min-width="120" :formatter="formatName" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" show-overflow-tooltip></el-table-column>
          <el-table-column prop="MediaTransport" label="流传输模式" min-width="140" v-if="hasAnyRole(serverInfo, userInfo, '管理员')">
            <template slot-scope="props">
              <el-dropdown size="small" trigger="click" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" @command="setMediaTransport">
                <span class="el-dropdown-link">
                  {{formatTransport(props.row)}} <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{row: props.row, MediaTransport: 'UDP', MediaTransportMode: 'passive'}">UDP</el-dropdown-item>
                  <el-dropdown-item :command="{row: props.row, MediaTransport: 'TCP', MediaTransportMode: 'passive'}">TCP 被动</el-dropdown-item>
                  <el-dropdown-item :command="{row: props.row, MediaTransport: 'TCP', MediaTransportMode: 'active'}">TCP 主动</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <span v-else>{{formatTransport(props.row)}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="ChannelCount" label="通道数" min-width="100" sortable="custom" v-if="hasAnyRole(serverInfo, userInfo, '管理员')"></el-table-column>
          <el-table-column prop="Online" label="在线状态" min-width="100">
            <template slot-scope="props">
              <span class="text-success" v-if="props.row.Online">在线</span>
              <span class="text-gray" v-else>离线</span>
            </template>
          </el-table-column>
          <el-table-column prop="RemoteIP" label="出口IP" min-width="140" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" show-overflow-tooltip></el-table-column>
          <el-table-column prop="RemotePort" label="端口" min-width="100" v-if="hasAnyRole(serverInfo, userInfo, '管理员')"></el-table-column>
          <el-table-column prop="Manufacturer" label="厂家" min-width="120" :formatter="formatName" show-overflow-tooltip></el-table-column>
          <el-table-column prop="LastKeepaliveAt" label="最近心跳" min-width="160" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" sortable="custom"></el-table-column>
          <el-table-column prop="LastRegisterAt" label="最近注册" min-width="160" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" sortable="custom"></el-table-column>
          <el-table-column prop="UpdatedAt" label="更新时间" min-width="160" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" sortable="custom"></el-table-column>
          <el-table-column prop="CreatedAt" label="创建时间" min-width="160" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" sortable="custom"></el-table-column>
          <el-table-column label="操作" :min-width="hasAnyRole(serverInfo, userInfo, '管理员') ? 240 : 120" fixed="right" v-if="!isMobile()">
            <template slot-scope="props">
                <div class="btn-group btn-group-xs">
                    <router-link class="btn btn-info" :to="`/devices/channels/${props.row.ID}/1`" v-if="props.row.ChannelCount > 0">
                       <i class="fa fa-info"></i> 查看通道
                    </router-link>
                    <button type="button" class="btn btn-primary" @click.prevent="fetchCatalog(props.row)" v-if="props.row.Online && hasAnyRole(serverInfo, userInfo, '管理员')">
                      <i class="fa fa-refresh"></i> 更新通道
                    </button>
                    <button type="button" class="btn btn-warning" @click.prevent="editDevice(props.row)" v-if="hasAnyRole(serverInfo, userInfo, '管理员')">
                      <i class="fa fa-edit"></i> 编辑
                    </button>
                    <button type="button" class="btn btn-danger" @click.prevent="removeDevice(props.row)" v-if="!props.row.Online && hasAnyRole(serverInfo, userInfo, '管理员')">
                      <i class="fa fa-remove"></i> 删除
                    </button>
                </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="box-footer" v-if="total > 0">
        <el-pagination layout="total,prev,pager,next" :pager-count="isMobile() ? 3 : 5" class="pull-right" :total="total" :page-size.sync="pageSize" :current-page.sync="currentPage"></el-pagination>
      </div>
    </div>
    <div class="alert text-center" v-if="serverInfo.IsDemo">
      <small>
          <strong><i class="fa fa-info-circle"></i> 提示 : </strong>
          可向 Redis 订阅 device 消息以获取设备实时状态 > SUBSCRIBE device; 消息内容为 "设备国标编号 ON/OFF"
      </small>
    </div>
    <DeviceEditDlg ref="deviceEditDlg" @submit="getDeviceList"></DeviceEditDlg>
  </div>
</template>

<script>
import _ from "lodash";
import url from "url";
import DeviceEditDlg from 'components/DeviceEditDlg.vue'
import { mapState } from "vuex"
export default {
  props: {},
  data() {
    return {
      q: "",
      online: "",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      sort: "ID",
      order: "asc",
      devices: [],
      loading: false,
      timer: 0
    };
  },
  components: {
    DeviceEditDlg
  },
  computed: {
    ...mapState(["userInfo", "serverInfo"])
  },
  mounted() {
    // this.$refs["q"].focus();
    // this.getDeviceList();
    // this.timer = setInterval(() => {
    //     this.getDeviceList();
    // }, 3000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
  },
  methods: {
    ready() {
      this.$watch('q', function(newVal, oldVal) {
        this.doDelaySearch();
      });
      this.$watch('online', function(newVal, oldVal) {
        this.doSearch();
      });
      this.$watch('currentPage', function(newVal, oldVal) {
        this.doSearch(newVal);
      });
      this.timer = setInterval(() => {
        this.getDeviceList();
      }, 3000);
    },
    isMobile() {
      return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
    },
    doSearch(page = 1) {
      var query = {};
      if (this.q) query["q"] = this.q;
      if (this.online) query["online"] = this.online;
      this.$router.replace({
        path: `/devices/${page}`,
        query: query
      });
    },
    doDelaySearch: _.debounce(function() {
      this.doSearch();
    }, 500),
    getDeviceList() {
      this.loading = true;
      $.get("/api/v1/device/list", {
        q: this.q,
        start: (this.currentPage -1) * this.pageSize,
        limit: this.pageSize,
        online: this.online,
        sort: this.sort,
        order: this.order
      })
        .then(ret => {
          this.total = ret["DeviceCount"];
          this.devices = ret["DeviceList"];
        })
        .always(() => {
          this.loading = false;
        });
    },
    sortChange(data) {
      this.sort = data.prop;
      this.order = data.order == "ascending" ? "asc" : "desc";
      this.getDeviceList();
    },
    fetchCatalog(row) {
      $.ajax("/api/v1/device/fetchcatalog", {
        global: false,
        data: {
          serial: row.ID
        }
      }).then(() => {
        this.$message({
          type: "success",
          message: "更新通道信息成功"
        })
      })
    },
    removeDevice(row) {
      this.$confirm(`确认删除 ${row.Name || row.ID}`, "提示").then(() => {
        $.get("/api/v1/device/remove", {
          serial: row.ID
        }).always(() => {
          this.getDeviceList();
        });
      }).catch(() => {});
    },
    editDevice(row) {
      this.$refs["deviceEditDlg"].show({
        serial: row.ID,
        name: row.Name,
        media_transport: row.MediaTransport,
        media_transport_mode: row.MediaTransportMode,
        recv_stream_ip: row.RecvStreamIP,
        contact_ip: row.ContactIP,
        sms_id: row.SMSID,
        charset: row.Charset,
        catalog_interval: row.CatalogInterval,
        subscribe_interval: row.SubscribeInterval,
        password: row.Password,
        record_center: row.RecordCenter,
        record_indistinct: row.RecordIndistinct,
        civil_code_first: row.CivilCodeFirst,
      });
    },
    formatName(row, col, cell) {
      if (cell) return cell;
      return "-";
    },
    formatTransport(row, col, cell) {
      var ret = String(row.MediaTransport).toUpperCase();
      if(ret == "TCP") {
        ret += row.MediaTransportMode == 'active' ? " 主动" : " 被动";
      }
      return ret;
    },
    setMediaTransport(cmd) {
      cmd.row.MediaTransport = cmd.MediaTransport || cmd.row.MediaTransport;
      cmd.row.MediaTransportMode = cmd.MediaTransportMode || cmd.row.MediaTransportMode;
      $.get("/api/v1/device/setmediatransport", {
        serial: cmd.row.ID,
        media_transport: cmd.row.MediaTransport,
        media_transport_mode: cmd.row.MediaTransportMode
      })
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.q = to.query.q || "";
      vm.online = to.query.online || "";
      vm.currentPage = parseInt(to.params.page) || 1;
      vm.ready();
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
    next();
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.$nextTick(() => {
      this.q = to.query.q || "";
      this.online = to.query.online || "";
      this.currentPage = parseInt(to.params.page) || 1;
      this.devices = [];
      this.getDeviceList();
    });
  }
};
</script>

