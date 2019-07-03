<template>
    <div class="">
        <div class="box box-primary">
          <div class="box-header">
            <h4 class="text-primary text-center">录像列表({{devid}}-{{channel}})</h4>
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
                          <router-link :to="`/devices/playback/timebox/${this.devid}/${this.channel}/${this.day}`" replace class="btn btn-default btn-sm">
                              <i class="fa fa-hand-o-right"></i> 时间轴视图
                          </router-link>
                      </div>
                  </div>
              </div>
            </form>
            <br>
            <div class="clearfix"></div>
            <el-table :data="records" stripe v-loading="loading" element-loading-text="加载中...">
              <el-table-column prop="DeviceID" label="通道国标编号" min-width="200" show-overflow-tooltip></el-table-column>
              <el-table-column label="操作" min-width="190" v-if="isMobile()">
                <template slot-scope="props">
                    <div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-primary" @click.prevent="startPlayback(props.row)" :disabled="props.row.Starting"><i class="fa fa-play-circle"></i> 播放</button>
                        <button type="button" class="btn btn-info" @click.prevent="downloadPlayback(props.row)" :disabled="props.row.Starting"><i class="fa fa-download"> 下载</i></button>
                        <a :href="`/play.html?type=playback&ptz=no&serial=${devid}&code=${props.row.DeviceID}&starttime=${props.row.StartTime}&endtime=${props.row.EndTime}`" role="button" class="btn btn-warning" target="_blank"><i class="fa fa-share"></i> 分享页</a>
                    </div>
                </template>
              </el-table-column>
              <el-table-column prop="Name" label="通道名称" min-width="120" :formatter="formatName" show-overflow-tooltip></el-table-column>
              <el-table-column prop="StartTime" label="开始时间" min-width="160" :formatter="formatName"></el-table-column>
              <el-table-column prop="EndTime" label="结束时间" min-width="160" :formatter="formatName"></el-table-column>
              <el-table-column label="操作" min-width="190" fixed="right" v-if="!isMobile()">
                <template slot-scope="props">
                    <div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-primary" @click.prevent="startPlayback(props.row)" :disabled="props.row.Starting"><i class="fa fa-play-circle"></i> 播放</button>
                        <button type="button" class="btn btn-info" @click.prevent="downloadPlayback(props.row)" :disabled="props.row.Starting"><i class="fa fa-download"> 下载</i></button>
                        <a :href="`/play.html?type=playback&ptz=no&serial=${devid}&code=${props.row.DeviceID}&starttime=${props.row.StartTime}&endtime=${props.row.EndTime}`" role="button" class="btn btn-warning" target="_blank"><i class="fa fa-share"></i> 分享页</a>
                    </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <PlaybackVideoDlg ref="playbackVideoDlg" live></PlaybackVideoDlg>
        <PlaybackDownloadDlg ref="playbackDownloadDlg"></PlaybackDownloadDlg>
    </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import DatePicker from "components/DatePicker.vue";
import PlaybackVideoDlg from "components/PlaybackVideoDlg";
import PlaybackDownloadDlg from "components/PlaybackDownloadDlg";
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
      default: "list"
    },
    day: {
      type: String,
      default: () => moment().format("YYYYMMDD")
    }
  },
  data() {
    return {
      xhr: null,
      timerange: [
        moment(this.day, "YYYYMMDD").startOf('hour').toDate(),
        moment(this.day, "YYYYMMDD").startOf('hour').toDate()
      ],
      loading: false,
      records: []
    };
  },
  watch: {
    day: function(newVal, oldVal) {
      this.timerange = [
        moment(this.day, "YYYYMMDD").startOf('hour').toDate(),
        moment(this.day, "YYYYMMDD").startOf('hour').toDate()
      ]
    }
  },
  components: {
    PlaybackVideoDlg, PlaybackDownloadDlg, DatePicker
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
        this.loading = false;
        return
      }
      this.xhr = $.ajax("/api/v1/playback/info", {
        global: false,
        data: {
          timeout: 3,
          serial: this.devid,
          code: this.channel,
          starttime: moment(this.timerange[0]).format("YYYY-MM-DDTHH:mm:ss"),
          endtime: moment(this.timerange[1]).format("YYYY-MM-DDTHH:mm:ss")
        }
      });
      this.xhr.then(ret => {
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
    downloadPlayback(row) {
      this.loading = true;
      this.$set(row, "Starting", true);
      $.get("/api/v1/playback/start", {
        serial: this.devid,
        code: this.channel,
        starttime: row.StartTime,
        endtime: row.EndTime,
        download: true
      }).then(ret => {
        this.$refs["playbackDownloadDlg"].download(row.StartTime + " - " + row.EndTime, ret.StreamID);
      }).always(() => {
        this.loading = false;
        this.$delete(row, "Starting");
      });
    },
    startPlayback(row) {
      this.loading = true;
      this.$set(row, "Starting", true);
      $.get("/api/v1/playback/start", {
        serial: this.devid,
        code: this.channel,
        starttime: row.StartTime,
        endtime: row.EndTime
      }).then(ret => {
        var videoUrl = this.isMobile() ? ret.HLS : ret.RTMP;
        if(this.flvSupported() && ret.FLV) {
          videoUrl = ret.FLV;
        }
        this.$refs["playbackVideoDlg"].play(
          videoUrl,
          row.Name || row.DeviceID,
          row.Snap || "",
          this.devid,
          this.channel,
          ret.StreamID,
          ret.AudioEnable && ret.SourceAudioCodecName != ""
        );
      }).always(() => {
        this.loading = false;
        this.$delete(row, "Starting");
      });
    },
  },
  mounted() {
    this.getRecords(true);
  },
  beforeRouteUpdate(to, from, next) {
    if(this.xhr) {
      this.xhr.abort();
    }
    next();
    this.$nextTick(() => {
      this.getRecords(true);
    })
  }
};
</script>

