<template>
    <div>
        <div class="box box-primary">
          <div class="box-header">
            <h4 class="text-primary text-center">用户列表</h4>
          </div>
          <div class="box-body">
            <form class="form-inline" autocomplete="off" spellcheck="false">
              <div class="form-group form-group-sm">
                  <div class="input-group input-group-sm">
                    <button type="button" class="btn btn-sm btn-primary" @click.prevent="$refs['userEditDlg'].show()">
                      <i class="fa fa-plus"></i> 添加用户
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
                <label>状态</label>
                <select class="form-control" v-model.trim="enable">
                  <option value="">全部</option>
                  <option value="true">启用</option>
                  <option value="false">禁用</option>
                </select>
              </div>
            </form>
            <br>
            <div class="clearfix"></div>
            <el-table :data="users" stripe :default-sort="{prop: 'LastLoginAt', order: 'descending'}" @sort-change="sortChange" v-loading="loading" element-loading-text="加载中...">
              <el-table-column prop="Username" label="用户名" min-width="120" show-overflow-tooltip sortable="custom"></el-table-column>
              <el-table-column label="操作" min-width="300" v-if="isMobile()" class-name="opt-group">
                <template slot-scope="props">
                    <div class="btn-group btn-group-xs" v-if="props.row.Role != '超级管理员'">
                        <button type="button" class="btn btn-warning" @click.prevent="editUser(props.row)">
                          <i class="fa fa-edit"></i> 编辑
                        </button>
                        <button type="button" class="btn btn-primary" @click.prevent="editChannel(props.row)">
                          <i class="fa fa-check"></i> 关联通道
                        </button>
                        <button type="button" class="btn btn-info" @click.prevent="resetPassword(props.row)">
                          <i class="fa fa-key"></i> 重置密码
                        </button>
                        <button type="button" class="btn btn-danger" @click.prevent="removeUser(props.row)">
                          <i class="fa fa-remove"></i> 删除
                        </button>
                    </div>
                </template>
              </el-table-column>
              <el-table-column prop="Role" label="角色" min-width="200" show-overflow-tooltip sortable="custom"></el-table-column>
              <el-table-column prop="Enable" label="是否启用" min-width="100">
                <template slot-scope="props">
                  <span v-if="props.row.Enable" class="text-success">启用</span>
                  <span v-else>禁用</span>
                </template>
              </el-table-column>
              <el-table-column prop="LastLoginAt" label="最近登录" min-width="160" sortable="custom"></el-table-column>
              <el-table-column prop="UpdatedAt" label="更新时间" min-width="160" sortable="custom"></el-table-column>
              <el-table-column prop="CreatedAt" label="创建时间" min-width="160" sortable="custom"></el-table-column>
              <el-table-column label="操作" min-width="300" fixed="right" v-if="!isMobile()" class-name="opt-group">
                <template slot-scope="props">
                    <div class="btn-group btn-group-xs" v-if="props.row.Role != '超级管理员'">
                        <button type="button" class="btn btn-warning" @click.prevent="editUser(props.row)">
                          <i class="fa fa-edit"></i> 编辑
                        </button>
                        <button type="button" class="btn btn-primary" @click.prevent="editChannel(props.row)">
                          <i class="fa fa-check"></i> 关联通道
                        </button>
                        <button type="button" class="btn btn-info" @click.prevent="resetPassword(props.row)">
                          <i class="fa fa-key"></i> 重置密码
                        </button>
                        <button type="button" class="btn btn-danger" @click.prevent="removeUser(props.row)">
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
        <UserEditDlg ref="userEditDlg" @submit="getUsers()"></UserEditDlg>
        <UserChannelListDlg ref="userChannelListDlg" size="modal-lg" :title="userChannelListDlgTitle"></UserChannelListDlg>
    </div>
</template>

<script>
import _ from "lodash";
import UserEditDlg from "components/UserEditDlg";
import UserChannelListDlg from "components/UserChannelListDlg"
import { mapState } from "vuex";
export default {
  props: {
  },
  data() {
    return {
      q: "",
      enable: "",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      sort: "ID",
      order: "asc",
      loading: false,
      users: [],
      userChannelListDlgTitle: "关联通道",
    };
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  watch: {
    q: function(newVal, oldVal) {
      this.doDelaySearch();
    },
    enable: function(newVal, oldVal) {
      this.doSearch();
    },
    currentPage: function(newVal, oldVal) {
      this.doSearch(newVal);
    }
  },
  components: {
    UserEditDlg, UserChannelListDlg
  },
  mounted() {
    // this.timer = setInterval(() => {
    //   this.getUsers();
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
      if (this.enable) query["enable"] = this.enable;
      this.$router.replace({
        path: `/user/${page}`,
        query: query
      });
    },
    doDelaySearch: _.debounce(function() {
      this.doSearch();
    }, 500),
    getUsers() {
      $.get("/api/v1/user/list", {
        q: this.q,
        start: (this.currentPage -1) * this.pageSize,
        limit: this.pageSize,
        enable: this.enable,
        sort: this.sort,
        order: this.order
      })
      .then(ret => {
        this.total = ret.UserCount;
        this.users = ret.UserList;
      }).always(() => {});
    },
    sortChange(data) {
      this.sort = data.prop;
      this.order = data.order == "ascending" ? "asc" : "desc";
      this.getUsers();
    },
    formatName(row, col, cell) {
      if (cell) return cell;
      return "-";
    },
    editUser(row) {
      this.$refs['userEditDlg'].show(row);
    },
    editChannel(row) {
      this.userChannelListDlgTitle = `关联通道(${row.Username || row.ID})`;
      this.$refs['userChannelListDlg'].show(row.ID);
    },
    resetPassword(row) {
      this.$prompt(`请输入 ${row.Username || row.ID} 的新密码:`, "重置密码", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '请输入有效密码',
        closeOnClickModal: false,
      }).then(({ value }) => {
        $.get("/api/v1/user/resetpassword", {
          id: row.ID,
          password: value,
        }).then(() => {
            this.$message({
                type: 'success',
                message: "密码重置成功！"
            })
        })
      }).catch(() => {});
    },
    removeUser(row) {
      this.$confirm(`确认删除 ${row.Username || row.ID}`, "提示").then(() => {
        $.get("/api/v1/user/remove", {
          id: row.ID
        }).always(() => {
          this.getUsers();
        });
      }).catch(() => {});
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.q = to.query.q || "";
      vm.enable = to.query.enable || "";
      vm.currentPage = parseInt(to.params.page) || 1;
    });
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.$nextTick(() => {
      this.q = to.query.q || "";
      this.enable = to.query.enable || "";
      this.currentPage = parseInt(to.params.page) || 1;
      this.users = [];
      this.getUsers();
    });
  }
};
</script>

<style lang="less">
.opt-group .cell {
  overflow: visible;
}
</style>



