<template>
    <div :class="['modal', { fade: fade }]" data-keyboard="true" data-backdrop="static" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title text-primary text-center"><span>{{videoTitle}}</span></h4>
                </div>
                <div class="modal-body">
                    <div class="row" v-if="ptz">
                        <div :class="['form-group', 'play-area', { 'user-active': active, 'col-sm-8': hasAnyRole(serverInfo, userInfo, '管理员', '操作员'), 'col-sm-12': !hasAnyRole(serverInfo, userInfo, '管理员', '操作员')}]" @mousemove="doActive">
                            <LivePlayer ref="player" v-if="bShow" :videoUrl="videoUrl" :poster="poster" :live="live" muted
                              @message="$message" :loading.sync="bLoading" v-loading="bLoading" element-loading-text="加载中">
                              <div class="player-demo-text" v-if="isDemoUser(serverInfo, userInfo)">
                                提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
                              </div>
                            </LivePlayer>
                        </div>
                        <div :class="['col-sm-4', 'form-group']" v-if="hasAnyRole(serverInfo, userInfo, '管理员', '操作员')">
                            <div class="form-group hide">
                                <div class="input-group">
                                    <input type="text" v-model.trim="osd" class="form-control">
                                    <span class="input-group-btn">
                                        <button class="btn btn-default" type="button" @click.prevent="setOSD">设置OSD</button>
                                    </span>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="ptz-block">
                                    <div class="ptz-cell ptz-up" command="up" title="上" @mousedown.prevent="ptzControl">
                                        <i class="fa fa-chevron-up"></i>
                                    </div>
                                    <div class="ptz-cell ptz-left" command="left" title="左" @mousedown.prevent="ptzControl">
                                        <i class="fa fa-chevron-left"></i>
                                    </div>
                                    <div class="ptz-cell ptz-center" title="云台控制">
                                        <i class="fa fa-microphone" title="按住喊话" @mousedown.prevent="talkStart" v-if="canTalk() && serverInfo.VersionType == '旗舰版'"></i>
                                        <i class="fa fa-microphone-slash" title="由于浏览器安全策略, 非 HTTPS 或 localhost 访问, 对讲不可用" v-if="!canTalk() && serverInfo.VersionType == '旗舰版'"></i>
                                    </div>
                                    <div class="ptz-cell ptz-right" command="right" title="右" @mousedown.prevent="ptzControl">
                                        <i class="fa fa-chevron-right"></i>
                                    </div>
                                    <div class="ptz-cell ptz-down" command="down" title="下" @mousedown.prevent="ptzControl">
                                        <i class="fa fa-chevron-down"></i>
                                    </div>
                                    <div class="ptz-cell ptz-zoomin" command="zoomin" title="放大" @mousedown.prevent="ptzControl">
                                        <i class="fa fa-plus"></i>
                                    </div>
                                    <div class="ptz-cell ptz-zoomout" command="zoomout" title="缩小" @mousedown.prevent="ptzControl">
                                        <i class="fa fa-minus"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else :class="['row', 'play-area', { 'user-active': active }]" @mousemove="doActive">
                        <LivePlayer ref="player" v-if="bShow" :videoUrl="videoUrl" :poster="poster" :live="live" muted
                          @message="$message" :loading.sync="bLoading" v-loading="bLoading" element-loading-text="加载中">
                              <div class="player-demo-text" v-if="isDemoUser(serverInfo, userInfo)">
                                提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
                              </div>
                        </LivePlayer>
                    </div>
                </div>
                <div class="modal-footer">
                    <el-radio-group v-model.trim="protocol" size="small" @change="setProtocol" id="protocol-switcher" class="hidden-xs pull-left">
                      <el-radio-button label="FLV" v-if="flvSupported()"></el-radio-button>
                      <el-radio-button label="WS_FLV" v-if="flvSupported() && !isIE()"></el-radio-button>
                      <el-radio-button label="RTMP"></el-radio-button>
                      <el-radio-button label="HLS"></el-radio-button>
                    </el-radio-group>
                    <button v-if="hasAnyRole(serverInfo, userInfo, '管理员', '操作员') && serverInfo.VersionType == '旗舰版'" type="button" :class="['btn', {'btn-primary': !bRecording, 'btn-danger': bRecording}]" @click.prevent="toggleRecord()">
                      <i :class="['fa', {'fa-save': !bRecording, 'fa-stop': bRecording}]"></i>
                      {{bRecording? '停止录像' : '实时录像'}}
                    </button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import "jquery-ui/ui/widgets/draggable";
import LivePlayer from "@liveqing/liveplayer";
import { mapState } from "vuex";

export default {
  data() {
    return {
      videoUrl: "",
      videoTitle: "",
      snapUrl: "",
      serial: "",
      code: "",
      timer: 0,
      active: false, // show demo tips
      osd: "",
      streamid: "",
      protocol: "",
      streamInfo: null,
      bRecording: false,
      bShow: false,
      bLoading: false,
      recorder: null,
      ws: null,
    };
  },
  props: {
    live: {
      type: Boolean,
      default: false
    },
    fade: {
      type: Boolean,
      default: false
    },
    ptz: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
    poster() {
      if(this.protocol == "RTMP") {
        return "";
      }
      return this.snapUrl;
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.ctrlStop();
    $(document).off("mouseup touchend", this.ctrlStop);
  },
  mounted() {
    $(this.$el)
      .find(".modal-content")
      .draggable({
        handle: ".modal-header",
        cancel: ".modal-title span",
        addClasses: false,
        containment: "document",
        delay: 100,
        opacity: 0.5
      });
    $(this.$el)
      .on("hide.bs.modal", () => {
        this.bShow = false;
        this.streamInfo = null;
        this.protocol = "";
        this.snapUrl = "";
        this.videoUrl = "";
        if(this.timer) {
            clearTimeout(this.timer);
            this.timer = 0;
        }
      })
      .on("show.bs.modal", () => {
        this.bShow = true;
      });
    $(document).on("mouseup touchend", this.ctrlStop);
  },
  components: { LivePlayer },
  methods: {
    play(title, serial, code, streamInfo) {
      streamInfo = streamInfo || {};
      var videoUrl = this.isMobile() ? streamInfo.HLS : streamInfo.RTMP;
      var protocol = this.isMobile() ? "HLS" : "RTMP";
      if(this.flvSupported()) {
        if(streamInfo.WS_FLV && !this.isIE()) {
          videoUrl = streamInfo.WS_FLV;
          protocol = "WS_FLV";
        } else if(streamInfo.FLV) {
          videoUrl = streamInfo.FLV;
          protocol = "FLV";
        }
      }
      this.protocol = protocol;
      this.videoTitle = title || "";
      this.snapUrl = protocol == "RTMP" ? "" : (streamInfo.SnapURL || "");
      this.serial = serial || "";
      this.code = code || "";
      this.streamid = streamInfo.StreamID || "";
      this.bRecording = streamInfo.RecordStartAt != ""
      this.streamInfo = streamInfo;

      this.$nextTick(() => {
        this.videoUrl = videoUrl || "";
        this.doActive();
      })
      $(this.$el).modal("show");
    },
    setProtocol(protocol) {
      if(!this.streamInfo) return;
      switch(protocol) {
        case "FLV":
          this.videoUrl = this.streamInfo.FLV;
          break;
        case "WS_FLV":
          this.videoUrl = this.streamInfo.WS_FLV;
          break;
        case "RTMP":
          this.snapUrl = "";
          this.videoUrl = this.streamInfo.RTMP;
          break;
        case "HLS":
          this.videoUrl = this.streamInfo.HLS;
          break;
      }
      this.doActive();
    },
    ptzControl(e) {
      var $target = $(e.currentTarget);
      $.get("/api/v1/control/ptz", {
        serial: this.serial,
        code: this.code,
        command: $target.attr("command")
      });
      $target.addClass("active");
    },
    ptzStop() {
      if ($(this.$el).find(".ptz-cell.active").length > 0) {
        $.get("/api/v1/control/ptz", {
          serial: this.serial,
          code: this.code,
          command: "stop"
        });
        $(this.$el).find(".ptz-cell.active").removeClass("active");
      }
    },
    talkStart(e) {
      if(!this.ws) {
        var ws = new WebSocket(this.wsTalkURL());
        ws.onopen = evt => {
          console.log("ws talk open");
          this.ws = ws;
        }
        ws.onclose = evt => {
          console.log("ws talk close");
        }
        ws.onerror = evt => {
          console.log("ws talk error", evt);
        }
      }
      var $target = $(e.currentTarget);
      if(this.recorder) {
        $target.addClass("active");
        this.recorder.start();
        return;
      }
      LiveRecorder.get((rec, err) => {
        if(err) {
          alert(err);
          return
        }
        // this.$refs["player"].setMuted(true);
        $target.addClass("active");
        this.recorder = rec;
        this.recorder.start();
      }, {
        sampleBits: 16,
        sampleRate: 8000,
        pcmCallback: pcm => {
          // binary to base64 string
          var reader = new window.FileReader();
          reader.onloadend = () => {
            var base64 = reader.result;
            var base64 = base64.split(',')[1];
            if(this.ws) {
              this.ws.send(base64);
            }
          }
          reader.readAsDataURL(pcm);
        }
      })
    },
    talkStop() {
      if(this.recorder) {
        this.recorder.stop();
        // this.recorder = null;
        $(this.$el).find(".fa-microphone.active").removeClass("active");
        // this.$refs["player"].setMuted(false);
      }
      if(this.ws) {
        this.ws.close();
        this.ws = null;
      }
    },
    ctrlStop() {
      this.talkStop();
      this.ptzStop();
    },
    toggleRecord() {
      if(this.bRecording) {
        $.get("/api/v1/record/stop", {
          streamid: this.streamid
        }).then(ret => {
          for(var record of ret.RecordList) {
            window.open(record.DownloadURL, "_blank");
          }
          this.bRecording = false;
        })
      } else {
        $.get("/api/v1/record/start", {
          streamid: this.streamid
        }).then(() => {
          this.bRecording = true;
        })
      }
    },
    wsTalkURL() {
      var protocal = "ws:";
      if(location.protocol.startsWith("https")) {
        protocal = "wss:";
      }
      //url query param "format=pcm|g711"
      return `${protocal}//${location.host}/api/v1/control/ws-talk/${this.serial}/${this.code}?format=pcm`;
    },
    doActive() {
        this.active = true;
        if(this.timer) {
            clearTimeout(this.timer);
            this.timer = 0;
        }
        this.timer = setTimeout(() => {
            this.active = false;
        }, 2000);
    },
  }
};
</script>

<style lang="less">
.play-area {
    .player-demo-text {
        position:absolute;
        left:0;
        right:0;
        width:100%;
        bottom:3em;
        color:#FFF;
        background-color:rgba(43,51,63,.7);
        text-align:center;padding:10px;
        visibility: visible;
        opacity: 0;
        transition: visibility 1s,opacity 1s;
    }
    &.user-active {
        .player-demo-text {
            visibility: visible;
            opacity: 1;
            transition: visibility .1s,opacity .1s;
        }
    }
}
</style>

<style lang="css">
/* IE9, IE10, IE11 */
@media screen and (min-width:0\0) {
  .play-area .player-demo-text { bottom: 30px !important; }
}
</style>

<style lang="less" scoped>
.modal-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ptz-block {
  width: 150px;
  height: 180px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  font-size: 24px;
}

.ptz-cell {
  width: 50px;
  height: 50px;
  line-height: 50px;
  position: absolute;
}

.ptz-cell.active {
  color: #ccc;
  font-size: 26px;
}
.fa-microphone.active {
  color: #FFF;
}

.ptz-center {
  top: 50px;
  left: 50px;
  border-radius: 25px;
  background-color: #ccc;
}

.ptz-up {
  top: 0;
  left: 50px;
}

.ptz-left {
  top: 50px;
  left: 0;
}

.ptz-right {
  top: 50px;
  left: 100px;
}

.ptz-down {
  top: 100px;
  left: 50px;
}

.ptz-zoomin {
  top: 150px;
  left: 20px;
}

.ptz-zoomout {
  top: 150px;
  left: 80px;
}

.ptz-up,
.ptz-left,
.ptz-right,
.ptz-down,
.ptz-center > .fa-microphone,
.ptz-zoomin,
.ptz-zoomout {
  cursor: pointer;
}

#protocol-switcher {
  label {
    margin-bottom: 0;
  }
}
</style>






