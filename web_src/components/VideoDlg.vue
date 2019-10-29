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
                        <div class="col-sm-8 form-group">
                            <LivePlayer ref="player" v-if="bShow" :videoUrl="videoUrl" :poster="poster" :live="live" muted :hasaudio="hasAudio"
                              @message="$message" :loading.sync="bLoading" v-loading="bLoading" element-loading-text="加载中"></LivePlayer>
                        </div>
                        <div class="col-sm-4 form-group">
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
                    <div class="row" v-else>
                        <LivePlayer ref="player" v-if="bShow" :videoUrl="videoUrl" :poster="poster" :live="live" muted :hasaudio="hasAudio"
                          @message="$message" :loading.sync="bLoading" v-loading="bLoading" element-loading-text="加载中"></LivePlayer>
                    </div>
                    <div class="text-center text-gray" v-if="serverInfo.IsDemo && (!userInfo || (userInfo && userInfo.Name == 'test'))">
                      提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
                    </div>
                </div>
                <div class="modal-footer">
                    <el-radio-group v-model.trim="protocol" size="small" @change="setProtocol" id="protocol-switcher" class="hidden-xs pull-left">
                      <el-radio-button label="FLV"></el-radio-button>
                      <el-radio-button label="RTMP"></el-radio-button>
                      <el-radio-button label="HLS"></el-radio-button>
                    </el-radio-group>
                    <button v-if="(userInfo || !serverInfo.APIAuth) && serverInfo.VersionType == '旗舰版'" type="button" :class="['btn', {'btn-primary': !bRecording, 'btn-danger': bRecording}]" @click.prevent="toggleRecord()">
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
      osd: "",
      streamid: "",
      protocol: "",
      streamInfo: null,
      bRecording: false,
      hasAudio: false,
      bShow: false,
      bLoading: false,
      recorder: null,
      bAudioSending: false,
      bAudioSendError: false,
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
      clearInterval(this.timer);
      this.timer = 0;
    }
    this.ctrlStop();
    $(document).off("mouseup", this.ctrlStop);
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
        this.videoUrl = "";
        if(this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
      })
      .on("show.bs.modal", () => {
        this.bShow = true;
          // no need since v1.2
          // this.timer = setInterval(() => {
          //   $.get("/api/v1/stream/touch", {
          //     serial: this.serial,
          //     code: this.code,
          //     audio: this.hasAudio,
          //   }).then(streamInfo => {
          //     this.bRecording = streamInfo.RecordStartAt != ""
          //   })
          // }, 15000);
      });
    $(document).on("mouseup", this.ctrlStop);
  },
  components: { LivePlayer },
  methods: {
    play(title, serial, code, streamInfo) {
      streamInfo = streamInfo || {};
      var videoUrl = this.isMobile() ? streamInfo.HLS : streamInfo.RTMP;
      var protocol = this.isMobile() ? "HLS" : "RTMP";
      if(this.flvSupported() && streamInfo.FLV) {
        videoUrl = streamInfo.FLV;
        protocol = "FLV";
      }
      this.hasAudio = streamInfo.AudioEnable && streamInfo.SourceAudioCodecName != "";
      this.protocol = protocol;
      this.videoTitle = title || "";
      this.snapUrl = streamInfo.SnapURL || "";
      this.serial = serial || "";
      this.code = code || "";
      this.streamid = streamInfo.StreamID || "";
      this.bRecording = streamInfo.RecordStartAt != ""
      this.streamInfo = streamInfo;

      this.$nextTick(() => {
        this.videoUrl = videoUrl || "";
      })
      $(this.$el).modal("show");
    },
    setProtocol(protocol) {
      if(!this.streamInfo) return;
      switch(protocol) {
        case "FLV":
          this.videoUrl = this.streamInfo.FLV;
          break;
        case "RTMP":
          this.videoUrl = this.streamInfo.RTMP;
          break;
        case "HLS":
          this.videoUrl = this.streamInfo.HLS;
          break;
      }
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
      if ($(this.$el).find(".ptz-cell.active").size() > 0) {
        $.get("/api/v1/control/ptz", {
          serial: this.serial,
          code: this.code,
          command: "stop"
        });
        $(this.$el).find(".ptz-cell.active").removeClass("active");
      }
    },
    talkStart(e) {
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
          if(this.bAudioSendError) return;
          var reader = new window.FileReader();
          reader.onloadend = () => {
            var base64 = reader.result;
            var base64 = base64.split(',')[1];
            this.bAudioSending = true;
            $.get("/api/v1/control/talk", {
              serial: this.serial,
              code: this.code,
              audio: base64,
            }).fail(() => {
              if(!this.bAudioSendError) {
                this.bAudioSendError = true;
                setTimeout(() => {
                  this.bAudioSendError = false;
                }, 10000);
              }
            }).always(() => {
              this.bAudioSending = false;
            })
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
        return;
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
    }
  }
};
</script>

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






