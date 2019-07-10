<template>
<div class="box box-primary videos">
    <div class="box-header">
        <h4 class="text-primary text-center">录像({{ name }}) - 列表视图</h4>
        <div class="form-inline">
            <div class="form-group">
                <div class="btn-group">
                    <button type="button" class="btn btn-primary btn-sm" @click.prevent="$router.go(-1)">
                        <i class="fa fa-chevron-left"></i> 返回
                    </button>
                    <button type="button" class="btn btn-danger btn-sm" @click.prevent="removeDaily" v-if="videos.length > 0 && userInfo">
                        <i class="fa fa-remove"></i> 删除当天
                    </button>
                </div>
            </div>
            <div class="form-group pull-right">
                <div class="input-group input-group-sm">
                    <CloudRecordDatePicker class="form-control" :day="day" @update:day="updateDay" ref="datePicker" :id="id"></CloudRecordDatePicker>
                    <div class="input-group-btn">
                        <button type="button" class="btn btn-sm btn-default" @click.prevent="showCloudRecordDatePicker">
                            <i class="fa fa-calendar"></i>
                        </button>
                        <router-link :to="`/cloudrecord/timeview/${this.id}/${this.day}`" replace class="btn btn-default btn-sm">
                            <i class="fa fa-hand-o-right"></i> 时间轴视图
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div class="box-body">
        <el-table :row-class-name="tableRowClassName" ref="recordTable" :data="pageData" empty-text="暂无数据, 请另选日期" :default-sort="{prop: 'startAt', order: 'descending'}" @sort-change="sortChange">
            <el-table-column min-width="120" label="名称" prop="name" show-overflow-tooltip></el-table-column>
            <el-table-column min-width="200" label="操作" v-if="isMobile()">
                <template slot-scope="scope">
                    <div class="btn-group">
                        <a role="button" class="btn btn-primary btn-xs" @click.prevent="play(scope.row)">
                            <i class='fa fa-play'></i> 播放
                        </a>
                        <!-- <a role="button" class="btn btn-info btn-xs" @click.prevent="download(scope.row)" v-loading.fullscreen.lock="bDownloading" element-loading-text="拼命加载中">
                            <i class='fa fa-download'></i> 下载
                        </a> -->
                        <a role="button" class="btn btn-danger btn-xs" @click.prevent="remove(scope.row)" v-if="userInfo">
                            <i class="fa fa-remove"></i> 删除
                        </a>
                    </div>
                </template>
            </el-table-column>
            <el-table-column min-width="200" label="开始时间" prop="startAt" sortable="custom"></el-table-column>
            <el-table-column prop="important" label="紧急标记" min-width="100" v-if="userInfo">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.important" @change="turnImportant(scope.row)"></el-switch>
                </template>
            </el-table-column>
            <el-table-column min-width="120" label="录像时长" prop="duration" sortable="custom"></el-table-column>
            <el-table-column min-width="400" label="视频地址" show-overflow-tooltip>
                <template slot-scope="scope">
                    <i title="点击拷贝" role="button" v-clipboard="scope.row.hls" @success="$message({type:'success', message:'成功拷贝到粘贴板'})" class="fa fa-copy"></i>
                    <a role="button" class="text-primary" @click.prevent="play(scope.row)">{{scope.row.hls}}</a>
                </template>
            </el-table-column>
            <el-table-column min-width="150" label="操作" fixed="right" v-if="!isMobile()">
                <template slot-scope="scope">
                    <div class="btn-group">
                        <a role="button" class="btn btn-primary btn-xs" @click.prevent="play(scope.row)">
                            <i class='fa fa-play'></i> 播放
                        </a>
                        <!-- <a role="button" class="btn btn-info btn-xs" @click.prevent="download(scope.row)" v-loading.fullscreen.lock="bDownloading" element-loading-text="拼命加载中">
                            <i class='fa fa-download'></i> 下载
                        </a> -->
                        <a role="button" class="btn btn-danger btn-xs" @click.prevent="remove(scope.row)" v-if="userInfo">
                            <i class="fa fa-remove"></i> 删除
                        </a>
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <div class="box-footer clearfix" v-if="total > 0">
        <el-pagination layout="prev,pager,next, jumper" class="pull-right" :total="total" :page-size.sync="pageSize" :current-page.sync="currentPage"></el-pagination>
    </div>

    <CloudRecordVideoDlg ref="cloudRecordVideoDlg"></CloudRecordVideoDlg>
</div>
</template>

<script>
import {
    mapState
} from "vuex";
import moment from "moment";
import CloudRecordVideoDlg from "components/CloudRecordVideoDlg";
import CloudRecordDatePicker from "components/CloudRecordDatePicker.vue";
import axios from "axios";
import _ from 'lodash'

export default {
    props: {
        id: "",
        day: ""
    },
    data() {
        return {
            name: "",
            bDownloading: false,
            currentPage: 1,
            pageSize: 10,
            sort: "startAt",
            order: "ascending",
            videos: [],
            bgcolor: "",
            pathname: location.pathname == "/" ? "" : location.pathname.substring(0, location.pathname.length - 1)
        };
    },
    components: {
        CloudRecordDatePicker,
        CloudRecordVideoDlg
    },
    methods: {
        tableRowClassName({
            row,
            rowIndex
        }) {
            if (row.important) {
                return "warning-row";
            }
        },
        isMobile() {
            return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
        },
        updateDay(day) {
            this.$router.replace(`/cloudrecord/listview/${this.id}/${day}`);
        },
        showCloudRecordDatePicker() {
            $(this.$refs.datePicker.$el).focus();
        },
        updateVideos() {
            $.get("api/v1/cloudrecord/querydaily", {
                id: this.id,
                period: this.day,
                sort: this.sort,
                order: this.order
            }).then(data => {
                this.videos = data.list;
                this.name = data.name;
            });
        },
        updateVideosDebounce: _.debounce(function () {
            this.updateVideos()
        }, 500),
        play(row) {
            this.$refs["cloudRecordVideoDlg"].play(
                row.hls,
                `${this.name || this.id}(${row.startAt})`,
                row.Snap || "",
            );
        },
        download(row) {
            window.open(`api/v1/cloudrecord/download/${row.id}/${row._startAt}`);
        },
        removeDaily() {
            this.$confirm(
                    `确认删除 ${this.name} ${moment(this.period).format(
          "YYYY-MM-DD"
        )} 当天所有录像?`,
                    "提示"
                )
                .then(() => {
                    $.get("api/v1/cloudrecord/removedaily", {
                        id: this.id,
                        period: this.day
                    }).always(() => {
                        this.updateVideos();
                        this.$refs["datePicker"].update();
                    });
                })
                .catch(() => {});
        },
        remove(row) {
            this.$confirm(`确认删除 ${row.name} ?`, "提示")
                .then(() => {
                    $.get("api/v1/cloudrecord/remove", {
                        id: row.id,
                        period: row._startAt
                    }).always(() => {
                        this.updateVideos();
                    });
                })
                .catch(() => {});
        },
        sortChange(data) {
            this.sort = data.prop;
            this.order = data.order;
            this.updateVideos();
        },
        turnImportant(row) {
            $.get("api/v1/cloudrecord/setimportant", {
                id: row.id,
                period: row._startAt,
                important: row.important
            }).then(() => {
                var msg = row.important ? "标记成功,将不会被自动清理" : "取消标记成功";
                this.$message({
                    type: "success",
                    message: msg
                });
            })
        }
    },
    mounted() {
        if (!this.id) {
            this.$router.replace("/cloudrecord");
            return;
        }
        if (!this.day) {
            this.$router.replace(
                `/cloudrecord/${this.id}/${moment().format("YYYYMMDD")}`
            );
            return;
        }
        // this.updateVideos();
    },
    computed: {
        ...mapState(["userInfo"]),
        total() {
            return this.videos.length;
        },
        pageData() {
            let start = (this.currentPage - 1) * this.pageSize;
            let end = start + this.pageSize;
            return this.videos.slice(start, end).map(row => {
                if (!row.id) {
                    row.id = this.id;
                    row.location = location;
                    row._startAt = row.startAt;
                    row.startAt = moment(row.startAt, "YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss");
                    row.duration = moment.utc((row.duration || 0) * 1000).format("HH:mm:ss");
                }
                return row;
            });
        }
    },
    beforeRouteUpdate(to, from, next) {
        if (!to.params.id) {
            this.$router.replace(`/cloudrecord`);
            return;
        }
        if (!to.params.day) {
            this.$router.replace(
                `/cloudrecord/${to.params.id}/${moment().format("YYYYMMDD")}`
            );
            return;
        }
        next();
        this.$nextTick(() => {
            this.updateVideos();
        });
    }
};
</script>

<style>
.el-table .warning-row {
    background: oldlace;
    color: red;
}

.el-table .success-row {
    background: #f0f9eb;
}
</style>
