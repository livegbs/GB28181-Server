<template>
    <div class="">
        <div class="box box-primary">
          <div class="box-header">
            <h4 class="text-primary text-center">录像时间轴({{devid}}-{{channel}})</h4>
          </div>
          <div class="box-body">
            <form class="form-inline">
              <div class="form-group form-group-sm">
                <button type="button" class="btn btn-sm btn-primary" @click.prevent="$router.go(-1)">
                  <i class="fa fa-chevron-left"></i> 返回
                </button>
              </div>
              <div class="form-group pull-right">
                  <div class="input-group input-group-sm">
                      <DatePicker class="form-control" @update:day="updateDay" :day="day" ref="datePicker"></DatePicker>
                      <div class="input-group-btn">
                          <button type="button" class="btn btn-sm btn-default" @click.prevent="showDatePicker">
                            <i class="fa fa-calendar"></i>
                          </button>
                          <router-link :to="`/devices/playback/list/${this.devid}/${this.channel}/${this.day}`" replace class="btn btn-default btn-sm">
                              <i class="fa fa-hand-o-right"></i> 表列视图
                          </router-link>
                      </div>
                  </div>
              </div>
            </form>
            <br>
            <div class="clearfix"></div>
            <LivePlayer live muted :videoUrl="videoUrl" :currentTime="currentTime" @ended="onVideoEnd" @timeupdate="onVideoTimeUpdate"
              v-loading="videoLoading" element-loading-text="加载中" element-loading-background="#000"
              style="margin:0 auto; max-width:700px;">
            </LivePlayer>
            <div class="text-center text-gray" v-if="serverInfo.IsDemo && (!userInfo || (userInfo && userInfo.Name == 'test'))">
              <br>
              提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
            </div>
            <br>
            <br>
            <TimeRule :videos="videos" @timeChange="onTimeChange" ref="timeRule" v-loading="loading"></TimeRule>
            <div class="clearfix"></div>
            <br>
          </div>
        </div>
    </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import DatePicker from "components/DatePicker.vue";
import TimeRule from 'components/TimeRule.vue'
import LivePlayer from '@liveqing/liveplayer'
import { mapState } from "vuex";

export default {
  props: {
    devid: {
      type: String,
      default: ""
    },
    channel: {
      type: String,
      default: ""
    },
    mode: {
      type: String,
      default: "timebox"
    },
    day: {
      type: String,
      default: () => moment().format("YYYYMMDD")
    }
  },
  data() {
    return {
      timerange: [
        moment(this.day, "YYYYMMDD").startOf('hour').toDate(),
        moment(this.day, "YYYYMMDD").startOf('hour').toDate()
      ],
      videoLoading: false,
      loading: false,
      records: [],
      currentTime: null,
      videos: [],
      video: null,
      videoUrl: "",
      hasAudio: false,
      streamID: "",
      touchTimer: 0
    };
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  watch: {
    day: function(newVal, oldVal) {
      this.timerange = [
        moment(this.day, "YYYYMMDD").startOf('hour').toDate(),
        moment(this.day, "YYYYMMDD").startOf('hour').toDate()
      ]
    },
    video: function(newVal, oldVal) {
      if(newVal && newVal != oldVal) {
        this.startPlayback();
      } else {
        this.stopPlayback();
      }
    }
  },
  components: {
    DatePicker, LivePlayer, TimeRule
  },
  methods: {
    isMobile() {
      return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
    },
    showDatePicker() {
      $(this.$refs.datePicker.$el).focus();
    },
    updateDay(day) {
      this.$router.replace(`/devices/playback/${this.mode}/${this.devid}/${this.channel}/${day}`);
    },
    nextTimeRange() {
      var end = moment(this.day, "YYYYMMDD").add(24, 'hours');
      var now = moment().startOf("second");
      if(end.isAfter(now, "second")) {
        end = now;
      }
      var r1 = moment(this.timerange[1]);
      if(r1.isSameOrAfter(end, "second")){
        return false;
      }
      var r2 = moment(this.timerange[1]).add(6, 'hours');
      if(r2.isAfter(end)) {
        r2 = end;
      }
      if(r2.startOf("minute").isSameOrBefore(r1.startOf("minute"), "second")) {
        return false;
      }
      this.timerange = [r1.toDate(), r2.toDate()];
      return true;
    },
    getRecords(refresh) {
      if(refresh) {
        this.loading = true;
        this.records = [];
      }
      if(!this.nextTimeRange()){
        this.videos = this.records;
        this.loading = false;
        return
      }
      $.ajax("/api/v1/playback/recordlist", {
        global: false,
        data: {
          timeout: 3,
          serial: this.devid,
          code: this.channel,
          starttime: moment(this.timerange[0]).format("YYYY-MM-DDTHH:mm:ss"),
          endtime: moment(this.timerange[1]).format("YYYY-MM-DDTHH:mm:ss")
        }
      }).then(ret => {
        this.records = this.records.concat(ret.RecordList);
      }).always(() => {
        this.$nextTick(() => {
          this.getRecords(false);
        })
      });
    },
    formatName(row, col, cell) {
      if (cell) return cell;
      return "-";
    },
    stopPlayback() {
      return new Promise((resolve, reject) => {
          if(this.touchTimer) {
            clearInterval(this.touchTimer);
            this.touchTimer = 0;
          }
          if(!this.streamID) {
            resolve();
            return
          }
          $.get("/api/v1/playback/stop", {
            streamid: this.streamID
          }).always(() => {
            this.streamID = "";
            this.videoUrl = "";
            resolve();
          })
      })
    },
    async startPlayback() {
      await this.stopPlayback();
      if(!this.video) return;
      this.videoLoading = true;
      $.get("/api/v1/playback/start", {
        serial: this.devid,
        code: this.channel,
        starttime: this.video.StartTime,
        endtime: this.video.EndTime
      }).then(streamInfo => {
        var videoUrl = this.isMobile() ? streamInfo.HLS : streamInfo.RTMP;
        if(this.flvSupported() && streamInfo.FLV) {
          videoUrl = streamInfo.FLV;
        }
        this.streamID = streamInfo.StreamID;
        this.hasAudio = streamInfo.AudioEnable && streamInfo.SourceAudioCodecName != "";
        this.videoUrl = videoUrl;
        // no need since v1.2
        // this.touchTimer = setInterval(() => {
        //   this.touchPlayback()
        // }, 15000);
      }).always(() => {
        this.videoLoading = false;
      });
    },
    touchPlayback() {
      if(!this.streamID) return;
      $.get("/api/v1/playback/touch",{
        streamid: this.streamID
      })
    },
    onTimeChange(video) {
      this.video = video;
    },
    onVideoEnd() {

    },
    onVideoTimeUpdate() {

    }
  },
  mounted() {
    let mmt = moment();
    let n = mmt.diff(mmt.clone().startOf('day'), 'minutes');
    n -= 10;
    if(n < 0) n = 0;
    this.$refs.timeRule.clickMinute(n);
    this.getRecords(true);
  },
  beforeDestroy() {
    this.stopPlayback();
  },
  beforeRouteLeave(to, from, next) {
    this.stopPlayback();
    next();
  },
  beforeRouteUpdate(to, from, next) {
    this.stopPlayback();
    next();
    this.$nextTick(() => {
      this.getRecords(true);
    })
  }
};
</script>

