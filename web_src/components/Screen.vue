<template>
<div>
  <br><br class="hidden-xs">
  <div class="row hidden-xs text-center">
      <el-button-group class="player-btn-group">
        <el-button type="primary" size="medium" v-for="list in playerBtnGroup" :key="list.num" @click.prevent="setPlayerLength(list.num)" :class="{'active' : playerLength == list.num}">{{list.name}}</el-button>
        <el-button type="button" id="full-btn-medium" size="medium" @click.prevent="fullscreen" title="全屏显示"><i class="fa fa-arrows-alt"></i></el-button>
      </el-button-group>
  </div>
  <div class="row visible-xs text-center">
    <el-button-group class="player-btn-group">
      <el-button type="primary" size="mini" v-for="list in playerBtnGroup" :key="list.num" @click.prevent="setPlayerLength(list.num)" :class="{'active' : playerLength == list.num}">{{list.name}}</el-button>
      <el-button type="button" id="full-btn-mini" size="mini" @click.prevent="fullscreen" title="全屏显示"><i class="fa fa-arrows-alt"></i></el-button>
    </el-button-group>
  </div>
  <br><br class="hidden-xs">
  <div class="view-list row">
    <div class="video-show col-xs-12 col-sm-12 col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2">
      <div>
        <div class="no-margin no-padding video" v-for="(player,index) in players" :key="index" @mousemove="resetCloseTimer(player)" @touchstart="resetCloseTimer(player)" :class="{'col-sm-12': playerLength == 1,'col-sm-6': playerLength == 4,'col-sm-4': playerLength == 9,'col-sm-3': playerLength == 16}">
          <LivePlayer :videoUrl="player.url" live muted :hasaudio="false" stretch v-loading="player.bLoading" element-loading-text="加载中..." element-loading-background="#000" :loading.sync="player.bLoading" @message="$message"></LivePlayer>
          <div class="video-close" v-show="player.url && player.bCloseShow" v-on:click="closeVideo(index)">关闭</div>
          <div class="video-close" v-show="!player.url && player.bCloseShow" v-on:click="selectChannel(index,player)">选择通道</div>
        </div>
        <ScreenChannelListDlg ref="channelListDlg" @selected="play" :title="channelListDlgTitle" style="z-index:2001;"></ScreenChannelListDlg>
      </div>
    </div>
  </div>
  <div class="text-center" v-if="serverInfo.IsDemo && (!userInfo || (userInfo && userInfo.Name == 'test'))">
    <br>
    提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
  </div>
</div>
</template>

<script>
import ScreenChannelListDlg from "components/ScreenChannelListDlg.vue";
import LivePlayer from "@liveqing/liveplayer";
import _ from 'lodash'
import { mapState } from "vuex";

export default {
  components: {
    LivePlayer,
    ScreenChannelListDlg
  },
  data() {
    return {
      players: [],
      playerLength: 4,
      playerBtnGroup: [{
        num: 1,
        name: "单屏"
      }, {
        num: 4,
        name: "四分屏"
      }, {
        num: 9,
        name: "九分屏"
      }, {
        num: 16,
        name: "十六分屏"
      }],
      channelListDlgTitle: "",
      protocol: "",
    };
  },
  computed: {
    ...mapState(["userInfo", "serverInfo"])
  },
  mounted() {
    this.setPlayerLength(this.playerLength);
    this.protocol = this.getQueryString("protocol", "");
  },
  methods: {
    getQueryString(name, defVal = "") {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) {
        return unescape(r[2]);
      }
      return defVal;
    },
    clearVideos() {
      for (var idx in this.players) {
        this.closeVideo(idx);
      }
    },
    selectChannel(index) {
      this.channelListDlgTitle = `为第 ${index+1} 屏选择通道`;
      this.$refs["channelListDlg"].show(index);
    },
    setPlayerLength(playerNum) {
      if (playerNum == this.players.length) {
        return
      }
      this.clearVideos();
      this.players = []
      this.playerLength = playerNum
      for (let index = 0; index < this.playerLength; index++) {
        this.players.push({
          url: "",
          bLoading: false,
          timer: 0,
          bCloseShow: false,
          closeTimer: 0
        })
      }
    },
    play(index, channel) {
      var i = 0;
      var player = null;
      for (var _player of this.players) {
        if (index == i) {
          player = _player;
          break;
        }
        i++
      }
      if (!player) {
        this.$message({
          type: "error",
          message: "当前播放窗口已被占满！"
        });
        return;
      }
      player.bLoading = true;
      $.get("/api/v1/stream/start", {
        serial: channel.DeviceID,
        code: channel.ID,
      }).then(stream => {
        var videoUrl = this.isMobile() ? stream.HLS : stream.RTMP;
        if(this.flvSupported()) {
          if(index < 6 && stream.FLV) {
            videoUrl = stream.FLV;
          } else if (index >= 6 && stream.WS_FLV) {
            videoUrl = stream.WS_FLV;
          }
        }
        var _protocol = String(this.protocol).toUpperCase();
        switch (_protocol) {
          case "RTMP":
            videoUrl = stream.RTMP || "";
            break;
          case "HLS":
            videoUrl = stream.HLS || "";
            break;
          case "FLV":
            videoUrl = stream.FLV || "";
            break;
          case "WS_FLV":
            videoUrl = stream.WS_FLV || "";
            break;
        }
        player.url = videoUrl;
        this.resetCloseTimer(player);
      }).fail(() => {
        player.bLoading = false;
      });
    },
    closeVideo: function (idx) {
      var player = this.players[idx]
      if (!player) {
        return;
      }
      if (player.closeTimer) {
        clearTimeout(player.closeTimer);
        player.closeTimer = 0;
      }
      player.bCloseShow = false;
      player.bloading = false;
      player.url = "";
    },
    fullscreen() {
      if (this.isMobile()) {
        this.$message({
          type: "error",
          message: "请在电脑浏览器上使用该功能"
        });
        return;
      }
      this.$fullscreen.enter(this.$el.querySelector(`.video-show > div`), {
        wrap: false
      });
    },
    resetCloseTimer(player) {
      player.bCloseShow = true;
      if (player.closeTimer) {
        clearTimeout(player.closeTimer)
      }
      player.closeTimer = setTimeout(() => {
        player.bCloseShow = false;
      }, 2000);
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.protocol = vm.getQueryString("protocol", "");
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.clearVideos();
    this.protocol = this.getQueryString("protocol", "");
    next();
  },
  beforeDestroy() {
    this.clearVideos();
  },
  beforeRouteLeave(to, from, next) {
    this.clearVideos();
    next();
  }
};
</script>



<style lang="less" scoped>
@import url(~assets/styles/variables.less);

.view-list {
  .video-show {
    .video {
      border: 1px solid #fff;
    }
    .col-sm-12 {
      &:nth-child(1) {
        border: 0;
      }
    }

    .col-sm-6 {
      &:nth-child(1),
      &:nth-child(2) {
        border-top-color: transparent;
      }

      &:nth-child(2),
      &:nth-child(4) {
        border-right-color: transparent;
      }

      &:nth-child(1),
      &:nth-child(3) {
        border-left-color: transparent;
      }

      &:nth-child(3),
      &:nth-child(4) {
        border-bottom-color: transparent;
      }
    }

    .col-sm-4 {
      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3) {
        border-top-color: transparent;
      }

      &:nth-child(3),
      &:nth-child(6),
      &:nth-child(9) {
        border-right-color: transparent;
      }

      &:nth-child(7),
      &:nth-child(8),
      &:nth-child(9) {
        border-bottom-color: transparent;
      }

      &:nth-child(1),
      &:nth-child(4),
      &:nth-child(7) {
        border-left-color: transparent;
      }
    }

    .col-sm-3 {
      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(4) {
        border-top-color: transparent;
      }

      &:nth-child(4),
      &:nth-child(8),
      &:nth-child(12),
      &:nth-child(16) {
        border-right-color: transparent;
      }

      &:nth-child(13),
      &:nth-child(14),
      &:nth-child(15),
      &:nth-child(16) {
        border-bottom-color: transparent;
      }

      &:nth-child(1),
      &:nth-child(5),
      &:nth-child(9),
      &:nth-child(13) {
        border-left-color: transparent;
      }
    }
  }
}

.video-close {
  position: absolute;
  top: 5px;
  right: 5px;
  color: white;
  font-size: 12px;
  background-color: fade(gray, 50%);
  padding: 2px 5px;
  cursor: pointer;
  border-radius: 2px;
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.player-btn-group {
  margin: 5px 0;

  .el-button--primary {
    color: @base;
    background: #ffffff;
    border: 1px solid #dcdfe6 !important;
  }

  .active {
    background-color: @base-active;
    color: #ffffff;
  }
}
</style>
