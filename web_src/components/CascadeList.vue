<template>
    <div>
        <div class="box box-primary">
          <div class="box-header">
            <h4 class="text-primary text-center">级联列表</h4>
          </div>
          <div class="box-body">
            <form class="form-inline" autocomplete="off" spellcheck="false">
              <div class="form-group form-group-sm">
                  <div class="input-group input-group-sm">
                    <button type="button" class="btn btn-sm btn-primary" @click.prevent="$refs['cascadeEditDlg'].show()">
                      <i class="fa fa-plus"></i> 添加
                    </button>
                  </div>
              </div>
              <span class="hidden-xs">&nbsp;&nbsp;</span>
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
            </form>
            <br>
            <div class="clearfix"></div>
            <el-table :data="cascades" stripe :default-sort="{prop: 'Serial', order: 'ascending'}" @sort-change="sortChange" v-loading="loading" element-loading-text="加载中...">
              <el-table-column prop="Name" label="名称" min-width="100" show-overflow-tooltip></el-table-column>
              <el-table-column label="操作" min-width="200" v-if="isMobile()" class-name="opt-group">
                <template slot-scope="props">
                    <div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-warning" @click.prevent="editCascade(props.row)">
                          <i class="fa fa-edit"></i> 编辑
                        </button>
                        <button type="button" class="btn btn-primary" @click.prevent="editChannel(props.row)">
                          <i class="fa fa-check"></i> 选择通道
                        </button>
                        <button type="button" class="btn btn-danger" @click.prevent="removeCascade(props.row)">
                          <i class="fa fa-remove"></i> 删除
                        </button>
                    </div>
                </template>
              </el-table-column>
              <el-table-column prop="Serial" label="SIP服务国标编号" min-width="200" show-overflow-tooltip sortable="custom"></el-table-column>
              <el-table-column prop="Realm" label="SIP服务国标域" min-width="120" show-overflow-tooltip></el-table-column>
              <el-table-column prop="Enable" label="是否启用" min-width="100">
                <template slot-scope="props">
                  <span v-if="props.row.Enable" class="text-success">启用</span>
                  <span v-else>未启用</span>
                </template>
              </el-table-column>
              <el-table-column prop="Online" label="在线状态" min-width="100">
                <template slot-scope="props">
                  <span v-if="props.row.Online" class="text-success">在线</span>
                  <span v-else>离线</span>
                </template>
              </el-table-column>
              <el-table-column prop="Host" label="SIP服务IP" min-width="140"></el-table-column>
              <el-table-column prop="Port" label="SIP服务端口" min-width="120"></el-table-column>
              <el-table-column prop="RegisterTimeout" label="注册有效期(秒)" min-width="120"></el-table-column>
              <el-table-column prop="KeepaliveInterval" label="心跳周期(秒)" min-width="120"></el-table-column>
              <el-table-column prop="CatalogGroupSize" label="目录分组大小" min-width="120"></el-table-column>
              <el-table-column prop="CommandTransport" label="信令传输" min-width="120"></el-table-column>
              <el-table-column prop="Charset" label="字符集" min-width="120"></el-table-column>
              <el-table-column label="操作" min-width="200" fixed="right" v-if="!isMobile()" class-name="opt-group">
                <template slot-scope="props">
                    <div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-warning" @click.prevent="editCascade(props.row)">
                          <i class="fa fa-edit"></i> 编辑
                        </button>
                        <button type="button" class="btn btn-primary" @click.prevent="editChannel(props.row)">
                          <i class="fa fa-check"></i> 选择通道
                        </button>
                        <button type="button" class="btn btn-danger" @click.prevent="removeCascade(props.row)">
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
        <CascadeEditDlg ref="cascadeEditDlg" @submit="getCascades()"></CascadeEditDlg>
        <ChannelListDlg ref="channelListDlg" size="modal-lg" title="选择通道"></ChannelListDlg>
    </div>
</template>

<script>
import _ from "lodash";
import CascadeEditDlg from "components/CascadeEditDlg";
import ChannelListDlg from "components/ChannelListDlg";
import { mapState } from "vuex";
export default {
  props: {
  },
  data() {
    return {
      q: "",
      online: "",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      sort: "Serial",
      order: "asc",
      loading: false,
      timer: 0,
      cascades: []
    };
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  watch: {
    q: function(newVal, oldVal) {
      this.doDelaySearch();
    },
    online: function(newVal, oldVal) {
      this.doSearch();
    },
    currentPage: function(newVal, oldVal) {
      this.doSearch(newVal);
    }
  },
  components: {
    CascadeEditDlg, ChannelListDlg
  },
  mounted() {
    this.timer = setInterval(() => {
      this.getCascades();
    }, 3000);
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
      if (this.online) query["online"] = this.online;
      this.$router.replace({
        path: `/cascade/${page}`,
        query: query
      });
    },
    doDelaySearch: _.debounce(function() {
      this.doSearch();
    }, 500),
    getCascades() {
      $.get("/api/v1/cascade/list", {
        q: this.q,
        start: (this.currentPage -1) * this.pageSize,
        limit: this.pageSize,
        online: this.online,
        sort: this.sort,
        order: this.order
      })
      .then(ret => {
        this.total = ret.CascadeCount;
        this.cascades = ret.CascadeList;
      })
      .always(() => {
      });
    },
    sortChange(data) {
      this.sort = data.prop;
      this.order = data.order == "ascending" ? "asc" : "desc";
      this.getCascades();
    },
    formatName(row, col, cell) {
      if (cell) return cell;
      return "-";
    },
    editCascade(row) {
      this.$refs['cascadeEditDlg'].show(row);
    },
    editChannel(row) {
      this.$refs['channelListDlg'].show(row.ID);
    },
    removeCascade(row) {
      this.$confirm(`确认删除 ${row.Name || row.ID}`, "提示").then(() => {
        $.get("/api/v1/cascade/remove", {
          id: row.ID
        }).always(() => {
          this.getCascades();
        });
      }).catch(() => {});
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.q = to.query.q || "";
      vm.online = to.query.online || "";
      vm.currentPage = parseInt(to.params.page) || 1;
    });
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.$nextTick(() => {
      this.q = to.query.q || "";
      this.online = to.query.online || "";
      this.currentPage = parseInt(to.params.page) || 1;
      this.cascades = [];
      this.getCascades();
    });
  }
};
</script>

<style lang="less">
.opt-group .cell {
  overflow: visible;
}
</style>



