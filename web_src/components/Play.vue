<template>
<div class="wrapper">
  <header class="main-header" v-if="!fullscreen">
    <nav class="navbar navbar-static-top" role="navigation">
      <div class="channel-title">{{title}}</div>
    </nav>
  </header>
  <div class="content-wrapper">
    <section :class="[{'content': !fullscreen}, {'no-padding': fullscreen}]">
      <div class="player-wrapper" :style="{margin:'0 auto', width: fullscreen ? '100%' : isMobile() ? '95%' : '85%' }">
        <div class="play-area">
          <LivePlayer ref="player" :muted="muted" :videoUrl="videoUrl" :aspect="aspect" live :poster="poster"
            v-loading="bLoading" :debug="debug" element-loading-text="加载中..." element-loading-background="#000" :loading.sync="bLoading" @message="$message"
            :fluent="fluent" :stretch="stretch" :autoplay="autoplay" :controls="controls"
            :style="aspect == 'fullscreen' ? 'width: 100% !important;height: 100% !important;position: fixed !important;':''"></LivePlayer>
        </div>
        <div class="ptz-block" v-show="showPtzPanel">
          <div class="ptz-cell ptz-up" @mousedown.prevent="ptzControl('up', $event)" title="上">
            <i class="fa fa-chevron-up"></i>
          </div>
          <div class="ptz-cell ptz-left" @mousedown.prevent="ptzControl('left', $event)" title="左">
            <i class="fa fa-chevron-left"></i>
          </div>
          <div class="ptz-center" title="云台控制">
            <i class="fa fa-arrows"></i>
          </div>
          <div class="ptz-cell ptz-right" @mousedown.prevent="ptzControl('right', $event)" title="右">
            <i class="fa fa-chevron-right"></i>
          </div>
          <div class="ptz-cell ptz-down" @mousedown.prevent="ptzControl('down', $event)" title="下">
            <i class="fa fa-chevron-down"></i>
          </div>
          <div class="ptz-cell ptz-plus" @mousedown.prevent="ptzControl('zoomin', $event)" title="缩">
            <i class="fa fa-plus-circle"></i>
          </div>
          <div class="ptz-cell ptz-talk" @mousedown.prevent="talkStart" v-if="showTalk">
            <i class="fa fa-microphone"></i>
          </div>
          <div class="ptz-cell ptz-minus" @mousedown.prevent="ptzControl('zoomout', $event)" title="放">
            <i class="fa fa-minus-circle"></i>
          </div>
        </div>
        <div class="text-center" v-if="!fullscreen && isDemoUser(serverInfo, userInfo)">
          <br>
          提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
        </div>
        <div v-if="!fullscreen && (share || showPtzTab)">
          <br>
          <div class="nav-tabs-custom">
            <ul class="nav nav-tabs">
              <li v-show="share" :class="{active: share}">
                <a href="#tab-share-link" data-toggle="tab"><i class="fa fa-share"> 分享</i></a>
              </li>
              <li v-show="showPtzTab" :class="{active: !share}">
                <a href="#tab-ptz" data-toggle="tab"><i class="fa fa-arrows"> 云台控制</i></a>
              </li>
            </ul>
            <div class="tab-content">
              <div :class="{'tab-pane':true, active: share}" id="tab-share-link">
                <form class="form-horizontal" autocomplete="off">
                  <div class="form-group">
                    <label for="input-share-link" class="control-label col-sm-2"> <a :href="shareUrl" target="_blank">分享链接</a></label>
                    <div class="col-sm-10">
                      <div class="input-group">
                        <input type="text" class="form-control" readonly="readonly" :value="shareUrl">
                        <span class="input-group-btn"><button type="button" class="btn btn-default" v-clipboard="shareUrl" title="点击拷贝" @success="$message({type:'success', message:'成功拷贝到粘贴板'})"><i class="fa fa-copy"></i></button></span>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="iframe" class="control-label col-sm-2">iframe</label>
                    <div class="col-sm-10">
                      <div class="input-group">
                        <input type="text" class="form-control" readonly="readonly" :value="$iframe(shareUrl, 640, 360)">
                        <span class="input-group-btn"><button type="button" class="btn btn-default" v-clipboard="$iframe(shareUrl, 640, 360)" title="点击拷贝" @success="$message({type:'success', message:'成功拷贝到粘贴板'})"><i class="fa fa-copy"></i></button></span>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="qrcode" class="control-label col-sm-2">扫码直播</label>
                    <div class="col-sm-10">
                      <Qrcode :value="shareUrl" tag="img" :options="{size: 150}"></Qrcode>
                    </div>
                  </div>
                </form>
              </div>
              <div :class="{'tab-pane': true, active:!share}" id="tab-ptz">
                <div class="form-group">
                    <div class="ptz-block-tab">
                        <div class="ptz-cell ptz-up" command="up" @mousedown.prevent="ptzControl('up', $event)" @touchstart.prevent="ptzControl('up', $event)" title="上">
                            <i class="fa fa-chevron-up"></i>
                        </div>
                        <div class="ptz-cell ptz-left" command="left" @mousedown.prevent="ptzControl('left', $event)" @touchstart.prevent="ptzControl('left', $event)" title="左">
                            <i class="fa fa-chevron-left"></i>
                        </div>
                        <div class="ptz-cell ptz-center" title="云台控制">
                            <i class="fa fa-microphone" title="按住喊话" @touchstart.prevent="talkStart" v-if="showTalk"></i>
                        </div>
                        <div class="ptz-cell ptz-right" command="right" @mousedown.prevent="ptzControl('right', $event)" @touchstart.prevent="ptzControl('right', $event)" title="右">
                            <i class="fa fa-chevron-right"></i>
                        </div>
                        <div class="ptz-cell ptz-down" command="down" @mousedown.prevent="ptzControl('down', $event)" @touchstart.prevent="ptzControl('down', $event)" title="下">
                            <i class="fa fa-chevron-down"></i>
                        </div>
                        <div class="ptz-cell ptz-zoomin" command="zoomin" @mousedown.prevent="ptzControl('zoomin', $event)" @touchstart.prevent="ptzControl('zoomin', $event)" title="缩">
                            <i class="fa fa-plus"></i>
                        </div>
                        <div class="ptz-cell ptz-zoomout" command="zoomout" @mousedown.prevent="ptzControl('zoomout', $event)" @touchstart.prevent="ptzControl('zoomout', $event)" title="放">
                            <i class="fa fa-minus"></i>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <footer class="main-footer" v-if="!fullscreen">
      <span v-html="serverInfo.CopyrightText"></span>
  </footer>
  <resize-observer @notify="handleResize"/>
</div>
</template>

<script>
import "font-awesome/css/font-awesome.css"
import "bootstrap/dist/css/bootstrap.css"
import "admin-lte/dist/css/AdminLTE.css"
import "admin-lte/dist/css/skins/_all-skins.css"
import "assets/styles/custom.less"
import 'vue-resize/dist/vue-resize.css'

import "bootstrap/dist/js/bootstrap.js"
import "admin-lte/dist/js/adminlte.js"
import "jquery-ui/ui/widgets/draggable"

import {
  mapState,
  mapActions
} from "vuex"
import Vue from "vue"
import moment from "moment"

import ElementUI from "element-ui"
import "assets/styles/element-custom.scss"
Vue.use(ElementUI);

import VueClipboards from "vue-clipboards"
Vue.use(VueClipboards);

import VueResize from 'vue-resize'
Vue.use(VueResize);

Vue.prototype.$updateQueryString = (uri, key, value) => {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  } else {
    return uri + separator + key + "=" + value;
  }
}
Vue.prototype.$iframe = (link, w, h) => {
  var _link = Vue.prototype.$updateQueryString(link, "aspect", "fullscreen")
  return `<iframe src="${_link}" width="${w}" height="${h}" allowfullscreen allow="autoplay; fullscreen"></iframe>`
}
Vue.prototype.isMobile = () => {
  return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
}
Vue.prototype.isIE = () => {
  return !!videojs.browser.IE_VERSION;
}
Vue.prototype.flvSupported = () => {
  return videojs.browser.IE_VERSION || (flvjs.getFeatureList() && flvjs.getFeatureList().mseLiveFlvPlayback);
}
Vue.prototype.canTalk = () => {
  return location.protocol.indexOf("https") == 0 || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}
Vue.prototype.hasAnyRole = (serverInfo, userInfo, ...roles) => {
    if (!userInfo) {
        return true;
    }
    var userRoles = [];
    if (userInfo) {
        userRoles = userInfo.Roles || [];
    }
    var checked = false;
    for(var role of (roles||[])) {
        if (!role || userRoles.some(ur => (ur == role || ur == '超级管理员'))) {
            checked = true;
            break;
        }
    }
    return checked;
}
Vue.prototype.isDemoUser = (serverInfo, userInfo) => {
  if (serverInfo && userInfo && serverInfo.IsDemo && userInfo.Name == serverInfo.DemoUser) return true;
  return false;
}

import Qrcode from "@xkeshi/vue-qrcode"
import LivePlayer from "@liveqing/liveplayer"
import $ from "jquery"
import "@penggy/jquery.nicescroll"
$.ajaxSetup({ cache: false });
export default {
  components: {
    LivePlayer,
    Qrcode
  },
  data() {
    return {
      videoUrl: "",
      bLoading: false,
      url: "",
      title: "",
      timer: 0,
      serial: "",
      code: "",
      channel: "1",
      type: "stream",
      starttime: "",
      endtime: "",
      streamid: "",
      protocol: "",
      shareUrl: "",
      snapUrl: "",
      ptz: true,
      share: true,
      fluent: true,
      stretch: false,
      autoplay: true,
      controls: true,
      aspect: "",
      debug: false,
      token: "",
      muted: true,
      talk: false,
      otherParams: "",
      sourceVideoCodecName: "",
      sourceAudioCodecName: "",
      recorder: null,
      ws: null,
      nice: null,
    };
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
    this.videoUrl = "";
    this.ctrlStop();
    $(document).off("mouseup touchend", this.ctrlStop);
  },
  created() {
    this.aspect = this.getQueryString("aspect","").replace("x", ":");
    this.autoplay = this.getQueryString("autoplay", "yes") == "yes";
    this.controls = this.getQueryString("controls", "yes") == "yes";
    this.ptz = this.getQueryString("ptz", "yes") == "yes";
    this.share = this.getQueryString("share", "yes") == "yes";
    this.fluent = this.getQueryString("fluent", "yes") == "yes";
    this.stretch = this.getQueryString("stretch", "no") == "yes";
    this.type = this.getQueryString("type", "stream");
    this.starttime = this.getQueryString("starttime", "");
    this.endtime = this.getQueryString("endtime", "");
    this.serial = this.getQueryString("serial", "");
    this.code = this.getQueryString("code", "");
    this.channel = this.getQueryString("channel", "1");
    this.protocol = this.getQueryString("protocol", "");
    this.debug = this.getQueryString("debug") == "yes";
    this.token = this.getQueryString("token", "");
    this.muted = this.getQueryString("muted", "yes") == "yes";
    this.talk = this.getQueryString("talk", "no") == "yes";
    this.otherParams = this.getOtherParams(["aspect", "autoplay", "controls", "ptz", "share", "fluent", "stretch", "type", "starttime", "endtime", "serial", "code", "channel", "protocol", "muted", "talk", "debug"])
    this.shareUrl = location.href;
  },
  async mounted() {
    await this.getServerInfo();
    await this.getUserInfo();
    document.title = this.serverInfo.LogoText || "LiveGBS";
    $(document).ajaxError((evt, xhr, opts, ex) => {
      if (xhr.status == 401) {
        if (this.serverInfo.IsDemo) {
          location.href = `/login.html?r=${encodeURIComponent(location.href)}`;
        } else {
          if (this.fullscreen) {
             console.log("登录认证过期");
          } else {
            this.$message({
              type: 'error',
              message: "登录认证过期"
            })
          }
        }
        return false;
      } else if (xhr.status) {
        let msg = xhr.responseText || "网络请求失败";
        if (xhr.status == 404) {
          msg = "请求服务不存在或已停止";
        } else if (xhr.status == 504) {
          msg = "Gateway Timeout";
        }
        try {
          msg = JSON.parse(msg)
        } catch (error) {}
        if (this.fullscreen) {
          console.log(msg);
        } else {
          this.$message({
            type: 'error',
            message: msg
          })
        }
      } else {
        console.log(`ajax error: ${xhr.status} ${xhr.responseText}`);
      }
    }).on("mouseup touchend", this.ctrlStop).ready(() => {
      this.$nextTick(() => {
        $("body").layout("fix");
        this.fixHover();
        this.initNiceScroll();
      })
    }).on('shown.bs.modal', () => {
        this.removeNiceScroll();
    }).on('hidden.bs.modal', () => {
        this.initNiceScroll();
    });
    $(".ptz-block").draggable({
      handle: '.ptz-center',
      cancel: ".ptz-cell",
      containment: 'document',
      delay: 100
    });
    if (this.code && this.serial) {
      switch (this.type) {
        case "stream":
          this.bLoading = true;
          $.get(`/api/v1/stream/start`, {
            serial: this.serial,
            code: this.code,
            token: this.token,
          }).then(streamInfo => {
            if(!this.getQueryString("ptz", "") && streamInfo.ChannelPTZType == 3) { // 0 - 未知, 1 - 球机, 2 - 半球, 3 - 固定枪机, 4 - 遥控枪机
              this.ptz = false;
            }
            var _videoUrl = this.isMobile() ? streamInfo.HLS : streamInfo.RTMP;
            var _snapUrl = this.isMobile() ? streamInfo.SnapURL : "";
            if (this.flvSupported()) {
              if (streamInfo.WS_FLV && !this.isIE()) {
                _videoUrl = streamInfo.WS_FLV;
              } else if(streamInfo.FLV) {
                _videoUrl = streamInfo.FLV;
              }
              _snapUrl = streamInfo.SnapURL;
            }
            var _protocol = String(this.protocol).toUpperCase();
            switch (_protocol) {
              case "RTMP":
                _videoUrl = streamInfo.RTMP || "";
                break;
              case "HLS":
                _videoUrl = streamInfo.HLS || "";
                break;
              case "FLV":
                _videoUrl = streamInfo.FLV || "";
                break;
              case "WS_FLV":
                _videoUrl = streamInfo.WS_FLV || "";
                break;
              case "WS-FLV":
                _videoUrl = streamInfo.WS_FLV || "";
                break;
            }
            if (this.otherParams != "") {
              if (_videoUrl.indexOf("?") == -1) {
                _videoUrl += "?" + this.otherParams;
              } else {
                _videoUrl += "&" + this.otherParams;
              }
            }
            this.title = streamInfo.ChannelCustomName || streamInfo.ChannelName;
            this.sourceVideoCodecName = streamInfo.SourceVideoCodecName;
            this.sourceAudioCodecName = streamInfo.SourceAudioCodecName;
            this.snapUrl = _snapUrl||"";
            this.$nextTick(() => {
              this.videoUrl = _videoUrl;
            })
          }).fail(() => {
            this.bLoading = false;
          })
          break;
        case "playback":
          if(!this.getQueryString("ptz", "")) {
            this.ptz = false;
          }
          this.bLoading = true;
          $.get(`/api/v1/playback/start`, {
            serial: this.serial,
            code: this.code,
            starttime: this.starttime,
            endtime: this.endtime,
            token: this.token,
          }).then(streamInfo => {
            var _videoUrl = this.isMobile() ? streamInfo.HLS : streamInfo.RTMP;
            var _snapUrl = this.isMobile() ? streamInfo.SnapURL : "";
            if (this.flvSupported()) {
              if(streamInfo.WS_FLV && !this.isIE()) {
                _videoUrl = streamInfo.WS_FLV;
              } else if (streamInfo.FLV) {
                _videoUrl = streamInfo.FLV;
              }
              _snapUrl = streamInfo.SnapURL;
            }
            var _protocol = String(this.protocol).toUpperCase();
            switch (_protocol) {
              case "RTMP":
                _videoUrl = streamInfo.RTMP || "";
                break;
              case "HLS":
                _videoUrl = streamInfo.HLS || "";
                break;
              case "FLV":
                _videoUrl = streamInfo.FLV || "";
                break;
              case "WS_FLV":
                _videoUrl = streamInfo.WS_FLV || "";
                break;
              case "WS-FLV":
                _videoUrl = streamInfo.WS_FLV || "";
                break;
            }
            if (this.otherParams != "") {
              if (_videoUrl.indexOf("?") == -1) {
                _videoUrl += "?" + this.otherParams;
              } else {
                _videoUrl += "&" + this.otherParams;
              }
            }
            this.title = streamInfo.ChannelCustomName || streamInfo.ChannelName;
            this.sourceVideoCodecName = streamInfo.SourceVideoCodecName;
            this.sourceAudioCodecName = streamInfo.SourceAudioCodecName;
            this.snapUrl = _snapUrl||"";
            this.$nextTick(() => {
              this.videoUrl = _videoUrl;
            })
            this.streamid = streamInfo.StreamID || "";
          }).fail(() => {
            this.bLoading = false;
          })
          break;
      }
    }
  },
  computed: {
    ...mapState(["serverInfo", "userInfo"]),
    fullscreen() {
      return (this.aspect != "");
    },
    showTalk() {
      return this.talk && this.canTalk() && this.serverInfo.VersionType == '旗舰版';
    },
    showPtzPanel() {
      return (this.ptz || this.talk) && !this.isMobile() && this.hasAnyRole(this.serverInfo, this.userInfo, '管理员', '操作员');
    },
    showPtzTab() {
      return (this.ptz || this.talk) && this.isMobile() && this.hasAnyRole(this.serverInfo, this.userInfo, '管理员', '操作员');
    },
    poster() {
      var _protocol = String(this.protocol).toUpperCase();
      if(_protocol == "RTMP") {
        return "";
      }
      return this.snapUrl;
    }
  },
  methods: {
    ...mapActions(["getServerInfo", "getUserInfo"]),
    initNiceScroll() {
        if(!this.isIE() && !this.isMobile() && !this.nice) {
            this.nice = $('body').niceScroll({
                zindex: 999999,
                cursorwidth: "10px",
                cursoropacitymax: 0.5,
                preservenativescrolling: false,
                enablekeyboard: false,
            });
        }
    },
    removeNiceScroll() {
        if (this.nice) {
            this.nice.remove();
            this.nice = null;
        }
    },
    fixHover() {
      if (videojs.browser.IS_IOS || videojs.browser.IS_ANDROID) {
        for (var sheetI = document.styleSheets.length - 1; sheetI >= 0; sheetI--) {
          var sheet = document.styleSheets[sheetI];
          if (sheet.cssRules) {
            for (var ruleI = sheet.cssRules.length - 1; ruleI >= 0; ruleI--) {
              var rule = sheet.cssRules[ruleI];
              if (rule.selectorText) {
                rule.selectorText = rule.selectorText.replace(":hover", ":active");
                rule.selectorText = rule.selectorText.replace(":focus", ":active");
              }
            }
          }
        }
      }
    },
    touchStream() {
      switch (this.type) {
        case "stream":
          $.get("/api/v1/stream/touch", {
            serial: this.serial,
            code: this.code,
            token: this.token,
          })
          break;
        case "playback":
          $.get("/api/v1/playback/touch", {
            streamid: this.streamid,
            token: this.token
          })
          break;
      }
    },
    thisYear() {
      return moment().format("YYYY");
    },
    getQueryString(name, defVal = "") {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) {
        return unescape(r[2]);
      }
      return defVal;
    },
    getOtherParams(without) {
      var url = location.search;
      var theRequest = "";
      if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
          if (without.indexOf(strs[i].split("=")[0]) == -1) {
            if (theRequest == "") {
              theRequest = strs[i]
            } else {
              theRequest += "&" + strs[i]
            }
          }
        }
      }
      return theRequest;
    },
    ptzControl(cmd, event) {
      $.get("/api/v1/control/ptz", {
        serial: this.serial,
        code: this.code,
        command: cmd,
        token: this.token
      })
      $(event.target).closest('.ptz-cell').addClass("active");
    },
    ptzStop() {
      if ($(this.$el).find(".ptz-cell.active").length > 0) {
        $.get("/api/v1/control/ptz", {
          serial: this.serial,
          code: this.code,
          command: "stop",
          token: this.token
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
        $(this.$el).find(".fa-microphone.active, .ptz-talk.active").removeClass("active");
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
    handleResize() {
      this.nice && this.nice.resize();
    },
    wsTalkURL() {
      var protocal = "ws:";
      if(location.protocol.startsWith("https")) {
        protocal = "wss:";
      }
      //url query param "format=pcm|g711"
      return `${protocal}//${location.host}/api/v1/control/ws-talk/${this.serial}/${this.code}?format=pcm`;
    }
  }
};
</script>

<style lang="less" scoped>
.main-header .navbar {
  /* Fix for IE */
  -webkit-transition: none;
  -o-transition: none;
  transition: none;
}

.channel-title {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  color: #fff;
  text-align: center;
  padding: 0 15px;
  font-size: 20px;
  line-height: 50px;
  font-weight: 700;
}

.ptz-block-tab {
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

.ptz-talk {
  top: 150px;
  left: 50px;
}

.ptz-zoomout {
  top: 150px;
  left: 80px;
}

.ptz-up,
.ptz-left,
.ptz-right,
.ptz-down,
.ptz-zoomin,
.ptz-talk,
.ptz-zoomout {
  cursor: pointer;
}

.ptz-block {
  position: absolute;
  z-index: 99999;
  width: 150px;
  height: 220px;
  right: 20px;
  top: 20px;
  text-align: center;
  font-size: 24px;
  background: fade(#eee, 0%);
  border-radius: 16px;
  overflow: hidden;

  &:hover {
    background: fade(#eee, 60%);

    .ptz-cell {
      display: block;
    }
  }

  .ptz-cell {
    width: 50px;
    height: 50px;
    line-height: 50px;
    position: absolute;
    cursor: pointer;
    display: none;
  }

  .ptz-cell.active {
    color: #ccc;
    font-size: 26px;
  }

  .ptz-center {
    top: 120px;
    left: 50px;
    width: 50px;
    height: 50px;
    line-height: 50px;
    position: absolute;
    border-radius: 25px;
    background: fade(#ccc, 20%);
    cursor: move;

    i {
      color: fade(#000, 30%);
    }
  }

  .ptz-up {
    top: 70px;
    left: 50px;
  }

  .ptz-left {
    top: 120px;
    left: 0;
  }

  .ptz-right {
    top: 120px;
    left: 100px;
  }

  .ptz-down {
    top: 165px;
    left: 50px;
  }

  .ptz-plus {
    top: 25px;
    left: 5px;
  }

  .ptz-talk {
    top: 25px;
    left: 50px;
  }

  .ptz-minus {
    top: 25px;
    left: 95px;
  }
}
</style>
