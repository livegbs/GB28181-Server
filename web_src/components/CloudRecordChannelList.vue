<template>
<div class="box box-primary ids">
    <div class="box-header">
        <h4 class="text-primary text-center">云端录像通道列表</h4>
    </div>
    <div class="box-body">
        <div class="form-inline">
            <div class="form-group form-group-sm">
                <label>搜索</label>
                <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
            </div>
        </div>
        <br>
        <div class="clearfix"></div>
        <el-table :data="pageData" stripe :default-sort="{prop: 'serial', order: 'ascending'}" @sort-change="sortChange">
            <el-table-column min-width="250" label="设备国标编号" prop="serial" show-overflow-tooltip sortable="custom"></el-table-column>
            <el-table-column min-width="250" label="通道国标编号" prop="code" show-overflow-tooltip sortable="custom"></el-table-column>
            <!-- <el-table-column min-width="200" label="通道名称" prop="name" show-overflow-tooltip></el-table-column> -->
            <el-table-column min-width="160" label="操作" :fixed="!isMobile() ? 'right' : undefined">
                <template slot-scope="scope">
                    <router-link :to="`/cloudrecord/timeview/${scope.row.serial}/${scope.row.code}`" class="btn btn-primary btn-xs">
                        <i class="fa fa-file-video-o"></i> 查看录像
                    </router-link>
                    <a role="button" class="btn btn-danger btn-xs" @click.prevent="remove(scope.row)" v-if="userInfo">
                        <i class="fa fa-remove"></i> 删除
                    </a>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <div class="box-footer clearfix" v-if="total > 0">
        <el-pagination layout="prev,pager,next" class="pull-right" :total="total" :page-size.sync="pageSize" :current-page.sync="page"></el-pagination>
    </div>
</div>
</template>

<script>
import Vue from 'vue'
import {
    mapState
} from 'vuex'
import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'

export default {
    data() {
        return {
            pageSize: 10,
            q: "",
            page: 1,
            pageData: [],
            total: 0,
            sort: '',
            order: ''
        }
    },
    mounted() {
        // this.$refs['q'].focus();
        // this.load(); //load when sort change
    },
    watch: {
        q: function () {
            this.doDelaySearch();
        },
        page: function (val) {
            this.doSearch(val);
        }
    },
    computed: {
        ...mapState(['userInfo'])
    },
    methods: {
        load() {
            $.get('/api/v1/cloudrecord/querychannels', {
                start: (this.page - 1) * this.pageSize,
                limit: this.pageSize,
                q: this.q,
                sort: this.sort,
                order: this.order
            }).then(data => {
                this.pageData = data.rows;
                this.total = data.total;
            })
        },
        sortChange(data) {
            this.sort = data.prop;
            this.order = data.order;
            this.load();
        },
        selectDevice(id) {
            this.$emit("select-device", id);
        },
        doSearch(page = 1) {
            var query = {};
            if (this.q) query["q"] = this.q;
            this.$router.replace({
                path: `/cloudrecord/${page}`,
                query: query
            });
        },
        doDelaySearch: _.debounce(function () {
            this.doSearch();
        }, 500),
        async remove(row) {
            this.$confirm(`删除 ${row.name} ,会将设备所有录像删除，确认继续?`, '提示').then(() => {
                $.get('/api/v1/cloudrecord/removechannel', {
                    serial: row.serial,
                    code: row.code,
                }).always(() => {
                    this.load();
                })
            }).catch(() => {})
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.q = to.query.q || "";
            vm.page = parseInt(to.params.page) || 1;
        })
    },
    beforeRouteUpdate(to, from, next) {
        next();
        this.$nextTick(() => {
            this.q = to.query.q || "";
            this.page = parseInt(to.params.page) || 1;
            this.pageData = [];
            this.load();
        })
    }
}
</script>
