<template>
<div>
    <div class="box box-primary">
        <div class="box-header">
            <h4 class="text-primary text-center">白名单配置</h4>
        </div>
        <div class="box-body">
            <form class="form-inline" autocomplete="off" spellcheck="false">
                <div class="form-group form-group-sm">
                    <button type="button" class="btn btn-sm btn-primary" @click.prevent="$router.go(-1)">
                        <i class="fa fa-chevron-left"></i> 返回
                    </button>
                </div>
                <span class="hidden-xs">&nbsp;&nbsp;</span>
                <div class="form-group form-group-sm input-group-btn">
                    <label>搜索</label>
                    <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
                    <button type="button" v-if="!isMobile()" class="btn btn-sm btn-default" @click.prevent="download" title="导出白名单数据"><i class="fa fa-download"></i></button>
                    <button type="button" v-if="!isMobile()" class="btn btn-sm btn-default" @click.prevent="$refs['uploadDlg'].show()" title="导入白名单数据"><i class="fa fa-upload"></i></button>
                    <button type="button" class="btn btn-sm btn-default" @click.prevent="addWhite()"><i class="fa fa-plus"></i> 添加白名单</button>
                </div>
            </form>
            <br>
            <el-table :data="whitelist" stripe :default-sort="{prop: 'Channel', order: 'ascending'}" @sort-change="sortChange" v-loading="loading" element-loading-text="加载中...">
                <el-table-column prop="Serial" label="设备国标编号" min-width="300" show-overflow-tooltip sortable="custom"></el-table-column>
                <el-table-column prop="Password" label="接入密码" min-width="200" show-overflow-tooltip sortable="custom"></el-table-column>
                <el-table-column prop="Desc" label="描述" min-width="200" show-overflow-tooltip sortable="custom"></el-table-column>
                <el-table-column prop="CreatedAt" label="创建时间" min-width="160" sortable="custom"></el-table-column>
                <el-table-column prop="UpdatedAt" label="更新时间" min-width="160" sortable="custom"></el-table-column>
                <el-table-column label="操作" min-width="120" :fixed="isMobile() ? false:'right'" class-name="opt-group">
                    <template slot-scope="props">
                        <div class="btn-group btn-group-xs">
                            <button type="button" class="btn btn-warning" @click.prevent="editWhite(props.row)" v-if="userInfo">
                                <i class="fa fa-edit"></i> 编辑
                            </button>
                            <button type="button" class="btn btn-danger" @click.prevent="delWhite(props.row)" v-if="userInfo">
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

        <UploadDlg ref="uploadDlg" url="/api/v1/white/import" @uploaded="uploaded"></UploadDlg>
        <WhiteEditDlg ref="whiteEditDlg" @submit="getwhitelist"></WhiteEditDlg>
    </div>
</div>
</template>

<script>
import UploadDlg from "components/UploadDlg.vue";
import WhiteEditDlg from "components/WhiteEditDlg.vue";
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
            timer: 0,
            whitelist: [],
        };
    },
    components: {
        UploadDlg,
        WhiteEditDlg
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
        this.getwhitelist();
        this.timer = setInterval(() => {
            this.getwhitelist();
        }, 3000);
        $(document).on("mouseup", this.talkStop);
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
    },
    methods: {
        download() {
            window.open(`/api/v1/white/export`);
        },
        uploaded() {
            this.$message({
                type: 'success',
                message: "上传配置成功！"
            })
            this.getwhitelist();
            this.$refs['uploadDlg'].hide();
        },
        isMobile() {
            return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
        },
        doSearch(page = 1) {
            var query = {};
            if (this.q) query["q"] = this.q;
            this.$router.replace({
                path: `/white/${page}`,
                query: query
            });
        },
        doDelaySearch: _.debounce(function () {
            this.doSearch();
        }, 500),
        getwhitelist() {
            $.get("/api/v1/white/list", {
                    q: this.q,
                    start: (this.currentPage - 1) * this.pageSize,
                    limit: this.pageSize,
                    sort: this.sort,
                    order: this.order
                })
                .then(ret => {
                    this.total = ret.WhiteCount;
                    this.whitelist = ret.WhiteList;
                })
                .always(() => {});
        },
        sortChange(data) {
            this.sort = data.prop;
            this.order = data.order == "ascending" ? "asc" : "desc";
            this.getwhitelist();
        },
        delWhite(row) {
            this.$confirm(`确认删除 ${row.Serial}`, "提示").then(() => {
                $.post("/api/v1/white/remove", {
                    serial: row.Serial,
                }).always(() => {
                    this.getwhitelist();
                });
            }).catch(() => {});
        },
        editWhite(row) {
            this.$refs["whiteEditDlg"].show({
                serial: row.Serial,
                password: row.Password,
                desc: row.Desc,
            });
        },
        addWhite(row) {
            this.$refs["whiteEditDlg"].show({
                serial: "",
                password: "",
                desc: "",
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
            this.currentPage = parseInt(to.params.page) || 1;
            this.whitelist = [];
            this.getwhitelist();
        });
    }
};
</script>

<style lang="less">
.opt-group .cell {
    overflow: visible;
}
</style>
