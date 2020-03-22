<template>
<div class="box box-primary records">
    <div class="box-header">
        <h4 class="text-primary text-center">云端录像({{ name }})-时间轴视图</h4>
    </div>
    <div class="box-body">
        <div class="form-inline">
            <div class="form-group">
                <button type="button" class="btn btn-primary btn-sm" @click.prevent="$router.go(-1)"> <i class="fa fa-chevron-left"></i> 返回 </button>
            </div>
            <div class="form-group pull-right">
                <div class="input-group input-group-sm">
                    <CloudRecordDatePicker class="form-control" :day="day" @update:day="updateDay" ref="datePicker" :serial="serial" :code="code"></CloudRecordDatePicker>
                    <div class="input-group-btn">
                        <button type="button" class="btn btn-sm btn-default" @click.prevent="showCloudRecordDatePicker"> <i class="fa fa-calendar"></i> </button>
                        <router-link :to="`/cloudrecord/listview/${this.serial}/${this.code}/${this.day}`" replace class="btn btn-default btn-sm">
                            <i class="fa fa-hand-o-right"></i> 列表视图
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        <br>
        <div class="clearfix"></div>
        <LivePlayer :videoUrl="videoUrl" muted :currentTime="currentTime" @ended="onVideoEnd" @timeupdate="onVideoTimeUpdate" style="margin:0 auto; max-width:700px;" :loading.sync="loading" v-loading="loading" element-loading-text="加载中" element-loading-background="#000"></LivePlayer>
        <div class="text-center" v-if="serverInfo.IsDemo && (!userInfo || (userInfo && userInfo.Name == 'test'))">
            <br>
            提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
        </div>
        <br>
        <br>
        <CloudRecordTimeRule :videos="videos" @timeChange="onTimeChange" ref="timeRule"  v-loading="loadingRecords"></CloudRecordTimeRule>
        <br>
    </div>
    <div class="box-footer clearfix">
        <br>
    </div>
</div>
</template>

<script>
import moment from 'moment'
import CloudRecordDatePicker from 'components/CloudRecordDatePicker.vue'
import CloudRecordTimeRule from 'components/CloudRecordTimeRule.vue'
import LivePlayer from '@liveqing/liveplayer'
import {
    mapState
} from "vuex";

export default {
    props: {
        serial: '',
        code: '',
        day: ''
    },
    data() {
        return {
            videos: [],
            videoUrl: "",
            currentTime: 0,
            bActive: false,
            loading: false,
            loadingRecords: false,
            name: '',
            pathname: location.pathname == "/" ? "" : location.pathname.substring(0, location.pathname.length - 1)
        }
    },
    components: {
        CloudRecordDatePicker,
        LivePlayer,
        CloudRecordTimeRule
    },
    methods: {
        updateDay(day) {
            this.$router.replace(`/cloudrecord/timeview/${this.serial}/${this.code}/${day}`);
        },
        showCloudRecordDatePicker() {
            $(this.$refs['datePicker'].$el).focus();
        },
        updateVideos() {
            this.loadingRecords = true;
            $.get("/api/v1/cloudrecord/querydaily", {
                serial: this.serial,
                code: this.code,
                period: this.day
            }).then(data => {
                this.name = data.name;
                this.videos = data.list;
            }).always(() => {
                this.loadingRecords = false;
            })
        },
        onTimeChange(video) {
            this.videoUrl = this.pathname + ((video || {}).hls || "");
            this.currentTime = (video || {}).currentTime || 0;
        },
        onVideoEnd() {
            var idx = this.videoUrls.indexOf(this.videoUrl);
            if (idx >= 0 && idx < this.videos.length - 1) {
                var nextVideo = this.videos[idx + 1];
                if (!nextVideo) return;
                var startTime = moment(nextVideo.startAt, 'YYYYMMDDHHmmss');
                var n = startTime.diff(startTime.clone().startOf('day'), 'minutes');
                this.$refs['timeRule'].clickMinute(n);
            }
        },
        onVideoTimeUpdate(currentTime) {
            var idx = this.videoUrls.indexOf(this.videoUrl);
            if (idx >= 0 && idx < this.videos.length) {
                var video = this.videos[idx];
                var startTime = moment(video.startAt, 'YYYYMMDDHHmmss');
                startTime.add(currentTime, 'seconds');
                var n = startTime.diff(startTime.clone().startOf('day'), 'minutes');
                this.$refs['timeRule'].clickMinute(n, false);
            }
        }
    },
    computed: {
        ...mapState(['userInfo', 'serverInfo']),
        videoUrls() {
            return this.videos.map((val, index, array) => {
                return (val || {}).hls;
            });
        }
    },
    mounted() {
        let mmt = moment();
        let n = mmt.diff(mmt.clone().startOf('day'), 'minutes');
        n -= 10;
        if (n < 0) n = 0;
        this.$refs.timeRule.clickMinute(n);
        if (!this.serial || !this.code) {
            this.$router.replace("/cloudrecord");
            return;
        }
        if (!this.day) {
            this.$router.replace(`/cloudrecord/timeview/${this.serial}/${this.code}/${moment().format('YYYYMMDD')}`);
            return;
        }
        this.updateVideos();
    },
    beforeRouteUpdate(to, from, next) {
        if (!to.params.serial || !to.params.code) {
            next({
                path: '/cloudrecord',
                replace: true
            })
            return;
        }
        if (!to.params.day) {
            next({
                path: `/cloudrecord/timeview/${to.params.serial}/${to.params.code}/${moment().format('YYYYMMDD')}`,
                replace: true
            })
            return;
        }
        next();
        this.$nextTick(() => {
            this.updateVideos();
        })
    }
}
</script>
