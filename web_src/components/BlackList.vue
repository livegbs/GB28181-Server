<template>
<div>
    <div class="box box-primary">
        <div class="box-header">
            <h4 class="text-primary text-center">黑名单</h4>
        </div>
        <div class="box-body">
            <form class="form-inline" autocomplete="off" spellcheck="false">
                <div class="form-group form-group-sm">
                    <button type="button" class="btn btn-sm btn-primary" @click.prevent="$router.go(-1)">
                        <i class="fa fa-chevron-left"></i> 返回
                    </button>
                </div>
                <span class="hidden-xs">&nbsp;&nbsp;</span>
                <div class="form-group form-group-sm">
                    <label>搜索</label>
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
                        <div class="input-group-btn">
                            <button type="button" v-if="!isMobile()" class="btn btn-sm btn-default" @click.prevent="download" title="导出黑名单数据"><i class="fa fa-download"></i></button>
                            <button type="button" v-if="!isMobile()" class="btn btn-sm btn-default" @click.prevent="$refs['uploadDlg'].show()" title="导入黑名单数据"><i class="fa fa-upload"></i></button>
                            <button type="button" class="btn btn-sm btn-default" @click.prevent="addBlack()"><i class="fa fa-plus"></i> 添加黑名单</button>
                        </div>
                    </div>
                </div>
            </form>
            <br>
            <div class="clearfix"></div>
            <el-table :data="blackList" stripe :default-sort="{prop: 'Serial', order: 'ascending'}" @sort-change="sortChange" v-loading="loading" element-loading-text="加载中...">
                <el-table-column prop="Serial" label="设备国标编号" min-width="300" show-overflow-tooltip sortable="custom"></el-table-column>
                <el-table-column prop="Description" label="描述" min-width="200" show-overflow-tooltip sortable="custom"></el-table-column>
                <el-table-column prop="CreatedAt" label="创建时间" min-width="160" sortable="custom"></el-table-column>
                <el-table-column prop="UpdatedAt" label="更新时间" min-width="160" sortable="custom"></el-table-column>
                <el-table-column label="操作" min-width="150" :fixed="isMobile() ? false:'right'" class-name="opt-group">
                    <template slot-scope="props">
                        <div class="btn-group btn-group-xs">
                            <button type="button" class="btn btn-warning" @click.prevent="editBlack(props.row)" v-if="userInfo">
                                <i class="fa fa-edit"></i> 编辑
                            </button>
                            <button type="button" class="btn btn-danger" @click.prevent="delBlack(props.row)" v-if="userInfo">
                                <i class="fa fa-stop"></i> 删除
                            </button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="box-footer" v-if="total > 0">
            <el-pagination layout="total,prev,pager,next" :pager-count="5" class="pull-right" :total="total" :page-size.sync="pageSize" :current-page.sync="currentPage"></el-pagination>
        </div>

        <UploadDlg ref="uploadDlg" title="上传黑名单" url="/api/v1/black/import" @uploaded="uploaded"></UploadDlg>
        <BlackEditDlg ref="blackEditDlg" @submit="getBlackList"></BlackEditDlg>
    </div>
</div>
</template>

<script>
import UploadDlg from "components/UploadDlg.vue";
import BlackEditDlg from "components/BlackEditDlg.vue";
import _ from "lodash";
import {
    mapState
} from "vuex";
export default {
    props: {},
    data() {
        return {
            q: "",
            total: 0,
            pageSize: 10,
            currentPage: 1,
            sort: "Serial",
            order: "asc",
            loading: false,
            blackList: [],
        };
    },
    components: {
        UploadDlg,
        BlackEditDlg
    },
    computed: {
        ...mapState(['userInfo', 'serverInfo']),
    },
    watch: {
        q: function (newVal, oldVal) {
            this.doDelaySearch();
        },
        currentPage: function (newVal, oldVal) {
            this.doSearch(newVal);
        }
    },
    mounted() {
        // this.getBlackList();
    },
    beforeDestroy() {
    },
    methods: {
        download() {
            window.open(`/api/v1/black/export`);
        },
        uploaded() {
            this.$message({
                type: 'success',
                message: "上传配置成功！"
            })
            this.getBlackList();
            this.$refs['uploadDlg'].hide();
        },
        doSearch(page = 1) {
            var query = {};
            if (this.q) query["q"] = this.q;
            this.$router.replace({
                path: `/black/${page}`,
                query: query
            });
        },
        doDelaySearch: _.debounce(function () {
            this.doSearch();
        }, 500),
        getBlackList() {
            this.loading = true;
            $.get("/api/v1/black/list", {
                q: this.q,
                start: (this.currentPage - 1) * this.pageSize,
                limit: this.pageSize,
                sort: this.sort,
                order: this.order
            })
            .then(ret => {
                this.total = ret.BlackCount;
                this.blackList = ret.BlackList;
            })
            .always(() => {
                this.loading = false;
            });
        },
        sortChange(data) {
            this.sort = data.prop;
            this.order = data.order == "ascending" ? "asc" : "desc";
            this.getBlackList();
        },
        delBlack(row) {
            this.$confirm(`确认删除 ${row.Serial} ?`, "提示").then(() => {
                $.get("/api/v1/black/remove", {
                    serial: row.Serial,
                }).always(() => {
                    this.getBlackList();
                });
            }).catch(() => {});
        },
        editBlack(row) {
            this.$refs["blackEditDlg"].show({
                serial: row.Serial,
                description: row.Description,
            });
        },
        addBlack(row) {
            this.$refs["blackEditDlg"].show({
                serial: "",
                description: "",
            });
        },
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.q = to.query.q || "";
            vm.currentPage = parseInt(to.params.page) || 1;
        });
    },
    beforeRouteLeave(to, from, next) {
        next();
    },
    beforeRouteUpdate(to, from, next) {
        next();
        this.$nextTick(() => {
            this.q = to.query.q || "";
            this.currentPage = parseInt(to.params.page) || 1;
            this.blackList = [];
            this.getBlackList();
        });
    }
};
</script>

<style lang="less">
.opt-group .cell {
    overflow: visible;
}
</style>
