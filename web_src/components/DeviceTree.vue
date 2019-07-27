<template>
    <div class="box box-primary">
      <div class="box-header">
        <h4 class="text-primary text-center">设备树</h4>
      </div>
      <div class="box-body">
        <form class="form-inline" autocomplete="off" spellcheck="false">
          <div class="form-group form-group-sm">
            <label>搜索</label>
            <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
          </div>
          <span class="hidden-xs">&nbsp;&nbsp;</span>
          <div class="form-group pull-right">
            <router-link :to="`/devices/1`" class="btn btn-default btn-sm">
                <i class="fa fa-table"></i> 列表视图
            </router-link>
          </div>
        </form>
        <br>
        <div class="clearfix"></div>
        <div class="content">
          <div class="col-sm-4">
            <el-tree ref="devTree"
              :props="treeProps"
              :load="treeLoad"
              :filter-node-method="treeFilter"
              lazy
              @node-click="treeNodeClick"
            >
            <span class="custom-tree-node" slot-scope="{node, data}">
              <span :class="{'text-green': data.status === 'ON' && data.subCount === 0}">
                <i :class="['fa', {'fa-group' : data.subCount > 0, 'fa-camera': data.subCount == 0 }]"></i>
                <span class="ellipsis">{{node.label}}</span>
              </span>
            </span>
            </el-tree>
          </div>
          <div class="col-sm-8">
            <br>
              <div class="no-margin no-padding video" @mousemove="resetCloseTimer()" @touchstart="resetCloseTimer()">
                <LivePlayer :videoUrl="player.url" live muted :hasaudio="player.hasAudio" stretch v-loading="player.bLoading" element-loading-text="加载中..." element-loading-background="#000" @message="$message"></LivePlayer>
                <div class="video-close" v-show="player.url && player.bCloseShow" v-on:click="closeVideo()">关闭</div>
              </div>
            <br>
            <br>
          </div>
          <div class="text-center text-gray" v-if="serverInfo.IsDemo && (!userInfo || (userInfo && userInfo.Name == 'test'))">
            提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
          </div>
          <br>
        </div>

      </div>
      <!-- <div class="box-footer">
      </div> -->
    </div>
</template>

<script>
import _ from "lodash";
import url from "url";
import { mapState } from "vuex"
import LivePlayer from '@liveqing/liveplayer'
export default {
  props: {},
  data() {
    return {
      q: "",
      loading: false,
      timer: 0,
      player: {
        url: "",
        hasAudio: false,
        bLoading: false,
        bCloseShow: false,
      },
      treeProps: {
        label: (data, node) => {
          node.serial = data.serial;
          node.code = data.code;
          var label = (data.name || data.id);
          if(data.subCount > 0) {
            label += ` [${data.onlineSubCount}/${data.subCount}]`;
          }
          return label;
        },
        isLeaf: (data, node) => {
          return data.subCount === 0;
        },
        disabled: (data, node) => {
          return data.subCount === 0 && data.status != "ON";
        }
      }
    };
  },
  components: {
    LivePlayer
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  mounted() {
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
  },
  watch: {
    q: function(newVal, oldVal) {
      this.$refs['devTree'].filter(newVal);
    }
  },
  methods: {
    treeLoad(node, resolve) {
      var serial = node.serial||"";
      var pcode = node.code||"";
      $.get("/api/v1/device/channeltree", {
        serial: serial,
        pcode: pcode
      }).then(ret => {
        resolve((ret||[]).map(v => {
          return Object.assign(v, {
          })
        }));
      })
    },
    treeFilter(value, data) {
       if (!value) return true;
       return data.name.indexOf(value) !== -1 || data.id.indexOf(value) !== -1;
    },
    treeNodeClick(data, node, c) {
      if(data.subCount === 0 && data.status === "ON") {
        this.closeVideo();
        this.player.bLoading = true;
        $.get("/api/v1/stream/start", {
          serial: data.serial,
          code: data.code,
        }).then(streamInfo => {
          streamInfo = streamInfo || {};
          var videoUrl = this.isMobile() ? streamInfo.HLS : streamInfo.RTMP;
          if(this.flvSupported() && streamInfo.FLV) {
            videoUrl = streamInfo.FLV;
          }
          this.player.hasAudio = streamInfo.AudioEnable && streamInfo.SourceAudioCodecName != "";
          this.player.url = videoUrl || "";
        }).always(() => {
          this.player.bLoading = false;
        })
      }
    },
    resetCloseTimer() {
      this.player.bCloseShow = true;
      if (this.player.closeTimer) {
        clearTimeout(this.player.closeTimer)
      }
      this.player.closeTimer = setTimeout(() => {
        this.player.bCloseShow = false;
      }, 2000);
    },
    closeVideo() {
      this.player.url = "";
      this.player.hasAudio = false;
      this.player.bLoading = false;
      this.player.bCloseShow = false;
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
    next();
  }
};
</script>

<style lang="less" scoped>
.video {
  position: relative;

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
}
</style>


