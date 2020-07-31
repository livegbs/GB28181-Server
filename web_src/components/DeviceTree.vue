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
          <div :class="[{'col-md-3': hasAnyRole(serverInfo, userInfo, '管理员', '操作员'), 'col-md-4': !hasAnyRole(serverInfo, userInfo, '管理员', '操作员')}]">
            <ul class="nav nav-tabs">
              <li class="active"><a href="#dev-tree-wrapper" data-toggle="tab">设备树</a></li>
              <li><a href="#group-tree-wrapper" data-toggle="tab">分 组</a></li>
            </ul>
            <div class="tab-content" style="margin: 10px 0;" id="tab-tree-wrapper">
              <div class="tab-pane active" ref="devTreeWrapper" id="dev-tree-wrapper">
                <el-tree ref="devTree" id="dev-tree" node-key="key" v-if="showTree" :style="`${isMobile() ? 'max-height:200px' : 'max-height:800px'};min-height:200px;overflow:auto;`"
                  :props="treeProps" :load="treeLoad" :filter-node-method="treeFilter" lazy
                  @node-click="treeNodeClick" @node-contextmenu="treeNodeRightClick" >
                  <span class="custom-tree-node" slot-scope="{node, data}">
                    <span :class="{'text-green': data.status === 'ON' && data.subCount === 0 && data.code && data.serial && !data.custom}">
                      <i :class="['fa', {'fa-group' : data.subCount > 0 || !data.code || data.custom,
                        'fa-camera': data.subCount == 0 && data.code && data.serial && !data.custom}]"></i>
                      <span class="ellipsis" :title="node.label">{{node.label}}</span>
                    </span>
                  </span>
                </el-tree>
              </div>
              <div class="tab-pane" ref="groupTreeWrapper" id="group-tree-wrapper">
                <el-tree ref="groupTree" id="group-tree" node-key="key" v-if="showGroupTree" :style="`${isMobile() ? 'max-height:200px' : 'max-height:800px'};min-height:200px;overflow:auto;`"
                  :props="treeProps" :load="groupTreeLoad" :filter-node-method="treeFilter" lazy
                  @node-click="treeNodeClick" @node-contextmenu="treeNodeRightClick" >
                  <span class="custom-tree-node" slot-scope="{node, data}">
                    <span :class="{'text-green': data.status === 'ON' && data.subCount === 0 && data.code && data.serial && !data.custom}">
                      <i :class="['fa', {'fa-group' : data.subCount > 0 || !data.code || data.custom,
                        'fa-camera': data.subCount == 0 && data.code && data.serial && !data.custom}]"></i>
                      <span class="ellipsis" :title="node.label">{{node.label}}</span>
                    </span>
                  </span>
                </el-tree>
              </div>
            </div>
          </div>
          <VueContextMenu class="right-menu" :target="contextMenuTarget" :show="contextMenuVisible" @update:show="(show) => contextMenuVisible = show">
            <a href="javascript:;" @click="treeRefresh" v-show="contextMenuNodeData">
              <i class="fa fa-refresh"></i> 刷新节点
            </a>
            <a href="javascript:;" @click="showNodeAddDlg" v-show="contextMenuNodeData && contextMenuNodeData.custom">
              <i class="fa fa-plus"></i> 新建节点
            </a>
            <a href="javascript:;" @click="showCustomListDlg" v-show="contextMenuNodeData && contextMenuNodeData.custom && contextMenuNodeData.code">
              <i class="fa fa-check"></i> 选择通道
            </a>
            <a href="javascript:;" @click="showNodeEditDlg" v-show="contextMenuNodeData && !(contextMenuNodeData.custom && !contextMenuNodeData.code)">
              <i class="fa fa-edit"></i> 编辑节点
            </a>
            <a href="javascript:;" @click="removeCustomNode" v-show="contextMenuNodeData && contextMenuNodeData.custom && contextMenuNodeData.code">
              <i class="fa fa-remove"></i> 删除节点
            </a>
          </VueContextMenu>
          <div :class="{'col-md-7': hasAnyRole(serverInfo, userInfo, '管理员', '操作员'), 'col-md-8': !hasAnyRole(serverInfo, userInfo, '管理员', '操作员')}" id="dev-tree-player">
            <div class="view-list row">
              <div class="video-show">
                <div>
                  <div class="no-margin no-padding video col-sm-6" @click="clickPlayer(player, index, $event)" :class="{'active': index == playerIdx, 'col-sm-12': playersLength == 1,'col-sm-6': playersLength == 4,'col-sm-4': playersLength == 9,'col-sm-3': playersLength == 16}" v-for="(player,index) in players" :key="index" @mousemove="resetCloseTimer(player)" @touchstart="resetCloseTimer(player)">
                    <LivePlayer :videoUrl="player.url" :poster="player.poster" live muted stretch v-loading="player.bLoading" element-loading-text="加载中..." element-loading-background="#000" :loading.sync="player.bLoading" @message="$message"></LivePlayer>
                    <div class="video-close" v-show="player.url && player.bCloseShow" v-on:click="closeVideo(player)">关闭</div>
                  </div>
                </div>
              </div>
            </div>
              <!-- <div class="no-margin no-padding video" @mousemove="resetCloseTimer()" @touchstart="resetCloseTimer()">
                <LivePlayer :videoUrl="player.url" :poster="player.poster" live muted stretch v-loading="player.bLoading" element-loading-text="加载中..." element-loading-background="#000" @message="$message"></LivePlayer>
                <div class="video-close" v-show="player.url && player.bCloseShow" v-on:click="closeVideo()">关闭</div>
              </div> -->
            <br>
            <br>
          </div>
          <div class="col-md-2" id="dev-tree-ptz" v-if="hasAnyRole(serverInfo, userInfo, '管理员', '操作员')">
            <div class="ptz-block">
                <div class="ptz-cell ptz-up" :class="{'readonly': !playing }" command="up" title="上" @mousedown.prevent="ptzControl">
                    <i class="fa fa-chevron-up"></i>
                </div>
                <div class="ptz-cell ptz-left" :class="{'readonly': !playing }" command="left" title="左" @mousedown.prevent="ptzControl">
                    <i class="fa fa-chevron-left"></i>
                </div>
                <div class="ptz-cell ptz-center" title="云台控制">
                    <i class="fa fa-microphone" :class="{'readonly': !playing }" title="按住喊话" @mousedown.prevent="talkStart" v-if="canTalk() && serverInfo.VersionType == '旗舰版'"></i>
                    <i class="fa fa-microphone-slash" :class="{'readonly': !playing }" title="由于浏览器安全策略, 非 HTTPS 或 localhost 访问, 对讲不可用" v-if="!canTalk() && serverInfo.VersionType == '旗舰版'"></i>
                </div>
                <div class="ptz-cell ptz-right" :class="{'readonly': !playing }" command="right" title="右" @mousedown.prevent="ptzControl">
                    <i class="fa fa-chevron-right"></i>
                </div>
                <div class="ptz-cell ptz-down" :class="{'readonly': !playing }" command="down" title="下" @mousedown.prevent="ptzControl">
                    <i class="fa fa-chevron-down"></i>
                </div>
                <div class="ptz-cell ptz-zoomin" :class="{'readonly': !playing }" command="zoomin" title="放大" @mousedown.prevent="ptzControl">
                    <i class="fa fa-plus"></i>
                </div>
                <div class="ptz-cell ptz-zoomout" :class="{'readonly': !playing }" command="zoomout" title="缩小" @mousedown.prevent="ptzControl">
                    <i class="fa fa-minus"></i>
                </div>
            </div>
          </div>
          <div class="clearfix"></div>
          <div class="text-center text-gray" v-if="isDemoUser(serverInfo, userInfo)">
            <br>
            提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
          </div>
          <br>
        </div>
      </div>
      <!-- <div class="box-footer">
      </div> -->
      <DeviceTreeNodeEditDlg ref="nodeEditDlg" @submit="treeRefresh" style="z-index:2001;"></DeviceTreeNodeEditDlg>
      <ChannelCustomListDlg ref="customListDlg" @hide="treeRefresh" style="z-index:2001;"  size="modal-lg" :title="customListDlgTitle"></ChannelCustomListDlg>
      <resize-observer @notify="resetTreeMaxHeight"/>
    </div>
</template>

<script>
import _ from "lodash";
import url from "url";
import { mapState } from "vuex"
import LivePlayer from '@liveqing/liveplayer'
import { component as VueContextMenu } from '@xunlei/vue-context-menu'
import DeviceTreeNodeEditDlg from 'components/DeviceTreeNodeEditDlg.vue'
import ChannelCustomListDlg from 'components/ChannelCustomListDlg.vue'
export default {
  props: {},
  data() {
    return {
      q: "",
      loading: false,
      showTree: true,
      showGroupTree: true,
      playerIdx: 0,
      playersLength: 4,
      players: [],
      pnode: null,
      contextMenuTarget: null,
      contextMenuVisible: false,
      contextMenuNodeData: null,
      treeProps: {
        label: (data, node) => {
          node.serial = data.serial;
          node.code = data.code;
          var label = (data.customName || data.name || data.id);
          if(data.subCount > 0 || !data.code || data.custom) {
            label += ` [${data.onlineSubCount}/${data.subCount}]`;
          }
          return label;
        },
        isLeaf: (data, node) => {
          return data.subCount === 0 && data.code && data.serial && !data.custom;
        },
        disabled: (data, node) => {
          return data.subCount === 0 && data.code && data.serial && !data.custom && data.status != "ON";
        }
      },
      customListDlgTitle: "选择通道",
    };
  },
  components: {
    LivePlayer, VueContextMenu, DeviceTreeNodeEditDlg, ChannelCustomListDlg
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
    playing() {
      var player = this.players[this.playerIdx]||{};
      return !!player.url;
    },
    canPTZ() {
      var player = this.players[this.playerIdx]||{};
      return !!player.url && (player.ptzType === 0 || player.ptzType === 1);
    }
  },
  mounted() {
    this.setPlayersLength(this.playersLength);
    this.contextMenuTarget = document.querySelector('#tab-tree-wrapper');
    $(document).on("mouseup touchend", this.ctrlStop);
  },
  beforeDestroy() {
    this.ctrlStop();
    $(document).off("mouseup touchend", this.ctrlStop);
    this.clearVideos();
  },
  beforeRouteLeave(to, from, next) {
    this.ctrlStop();
    this.clearVideos();
    next();
  },
  beforeRouteUpdate(to, from, next) {
    this.ctrlStop();
    this.clearVideos();
    next();
  },
  watch: {
    q: function(newVal, oldVal) {
      this.$refs['devTree'].filter(newVal);
      this.$refs['groupTree'].filter(newVal);
    },
  },
  methods: {
    treeLoad(data, resolve) {
      var serial = data.serial||"";
      var pcode = data.code||"";
      $.get("/api/v1/device/channeltree", {
        serial: serial,
        pcode: pcode
      }).then(ret => {
        resolve((ret||[]).map(v => {
          return Object.assign(v, {
            key: v.id,
          })
        }));
        this.$refs['devTree'].filter(this.q);
      })
    },
    groupTreeLoad(data, resolve) {
      var serial = data.serial||"";
      var pcode = data.code||"";
      $.get("/api/v1/device/grouptree", {
        serial: serial,
        pcode: pcode
      }).then(ret => {
        resolve((ret||[]).map(v => {
          return Object.assign(v, {
            key: v.id,
          })
        }));
        this.$refs['groupTree'].filter(this.q);
      })
    },
    treeFilter(value, data) {
       if (!value) return true;
       return data.name.indexOf(value) !== -1 || data.customName.indexOf(value) !== -1 || data.id.indexOf(value) !== -1;
    },
    treeNodeRefresh(key) {
      let node = this.$refs['devTree'].getNode(key);
      if(!node) return;
      node.loaded = false;
      node.expand();
    },
    treeNodeRightClick(event, data, node, c) {
      if(!this.hasAnyRole(this.serverInfo, this.userInfo, '管理员')) return;
      this.contextMenuNodeData = data;
      this.pnode = node.parent;
      var new_event = new MouseEvent(event.type, event);
      this.contextMenuTarget.dispatchEvent(new_event);
    },
    treeNodeClick(data, node, c) {
      this.contextMenuNodeData = null;
      if(data.subCount === 0 && data.status === "ON" && !data.custom && data.serial && data.code) {
        var player = this.players[this.playerIdx]||{};
        if(player.bLoading) return;
        this.closeVideo(player);
        player.serial = data.serial;
        player.code = data.code;
        player.ptzType = data.ptzType;
        player.bLoading = true;
        $.get("/api/v1/stream/start", {
          serial: data.serial,
          code: data.code,
        }).then(streamInfo => {
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
          player.protocol = protocol;
          player.poster = protocol == "RTMP" ? "" : streamInfo.SnapURL;
          this.$nextTick(() => {
            player.url = videoUrl || "";
          });
        }).always(() => {
          player.bLoading = false;
        })
        this.setPlayerIdx(this.playerIdx + 1);
      }
    },
    showNodeEditDlg() {
      this.contextMenuVisible = false;
      var data = Object.assign({}, this.contextMenuNodeData, { parent: this.getParentData(), add: false});
      this.$refs['nodeEditDlg'].show(data);
    },
    showNodeAddDlg() {
      this.contextMenuVisible = false;
      var data = Object.assign({
        serial: this.contextMenuNodeData.serial||'',
        code: '',
        name: '',
        customName: '',
      }, { parent: this.contextMenuNodeData, add: true});
      this.$refs['nodeEditDlg'].show(data);
    },
    showCustomListDlg() {
      this.contextMenuVisible = false;
      this.customListDlgTitle = `选择通道(${this.contextMenuNodeData.customName || this.contextMenuNodeData.name || this.contextMenuNodeData.code})`;
      this.$refs['customListDlg'].show(this.contextMenuNodeData.code);
    },
    removeCustomNode() {
      this.contextMenuVisible = false;
      if(!this.contextMenuNodeData) return;
      var name = this.contextMenuNodeData.customName || this.contextMenuNodeData.name || this.contextMenuNodeData.id;
      this.$confirm(`确认删除 ${name}`, "提示").then(() => {
        $.get("/api/v1/channel/remove", {
          serial: this.contextMenuNodeData.serial,
          code: this.contextMenuNodeData.code,
        }).always(() => {
          this.treeNodeRefresh(this.pnode);
        });
      }).catch(() => {});
    },
    treeRefresh() {
      this.contextMenuVisible = false;
      if(this.pnode) {
        this.treeNodeRefresh(this.pnode);
        return;
      }
      this.showTree = false;
      this.$nextTick(() => {
        this.showTree = true;
      })
    },
    getParentData() {
      if(!this.contextMenuNodeData) return null;
      if(!this.$refs["devTree"]) return null;
      var pNode = this.$refs["devTree"].getNode(this.contextMenuNodeData);
      if(!pNode) return null;
      if(!pNode.parent) return null;
      return pNode.parent.data;
    },
    resetCloseTimer(player) {
      if(!player) return;
      player.bCloseShow = true;
      if (player.closeTimer) {
        clearTimeout(player.closeTimer)
      }
      player.closeTimer = setTimeout(() => {
        player.bCloseShow = false;
      }, 2000);
    },
    closeVideo(player) {
      if(!player) return;
      player.bLoading = false;
      player.bCloseShow = false;
      player.poster = "";
      player.url = "";
    },
    clearVideos() {
      for(var idx in this.players) {
        this.closeVideo(this.players[idx]);
      }
    },
    setPlayersLength(len) {
      if(len == this.players.length) {
        return
      }
      this.clearVideos();
      this.players = [];
      this.playersLength = len;
      for(var i=0; i < len; i++) {
        this.players.push({
          serial: "",
          code: "",
          url: "",
          protocol: "",
          poster: "",
          bLoading: false,
          bCloseShow: false,
        })
      }
    },
    setPlayerIdx(idx) {
      this.ctrlStop();
      this.playerIdx = idx % this.players.length;
    },
    clickPlayer(player, idx, event) {
      if(!$(event.target).hasClass("video-close")) {
        this.setPlayerIdx(idx);
      }
    },
    ptzControl(e) {
      var player = this.players[this.playerIdx];
      if(!player || !player.serial || !player.code) return;
      var $target = $(e.currentTarget);
      $.get("/api/v1/control/ptz", {
        serial: player.serial,
        code: player.code,
        command: $target.attr("command")
      });
      $target.addClass("active");
    },
    ptzStop() {
      var player = this.players[this.playerIdx];
      if(!player || !player.serial || !player.code) return;
      if ($(this.$el).find(".ptz-cell.active").length > 0) {
        $.get("/api/v1/control/ptz", {
          serial: player.serial,
          code: player.code,
          command: "stop"
        });
        $(this.$el).find(".ptz-cell.active").removeClass("active");
      }
    },
    talkStart(e) {
      if(!this.ws) {
        var talkURL = this.wsTalkURL();
        if(!talkURL) return;
        var ws = new WebSocket(talkURL);
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
    wsTalkURL() {
      var player = this.players[this.playerIdx];
      if(!player || !player.serial || !player.code) return '';
      var protocal = "ws:";
      if(location.protocol.startsWith("https")) {
        protocal = "wss:";
      }
      //url query param "format=pcm|g711"
      return `${protocal}//${location.host}/api/v1/control/ws-talk/${player.serial}/${player.code}?format=pcm`;
    },
    resetTreeMaxHeight() {
      var $tree = $("#dev-tree, #group-tree");
      if(this.isMobile()) {
        $tree.css("max-height", 200);
      } else {
        this.$nextTick(() => {
          var ph = $("#dev-tree-player").height() - 90;
          var wh = $(window).height() - 450;
          var th = wh > ph ? wh : ph;
          $tree.css("max-height", th);
        })
      }
    }
  }
};
</script>

<style lang="less" scoped>
.right-menu {
  position: fixed;
  background: #fff;
  border: solid 1px rgba(0, 0, 0, .2);
  border-radius: 3px;
  z-index: 999;
  display: none;
}
.right-menu a {
  width: 100px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  display: block;
  color: #1a1a1a;
}
.right-menu a:hover {
  background: #eee;
  color: #fff;
}
.right-menu {
    border: 1px solid #eee;
    box-shadow: 0 0.5em 1em 0 rgba(0,0,0,.1);
    border-radius: 1px;
}
a {
    text-decoration: none;
}
.right-menu a {
    padding: 2px;
}
.right-menu a:hover {
    background: #42b983;
}
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
.ptz-cell.readonly {
  color: #ddd;
}
.fa-microphone.active {
  color: #FFF;
}
.fa-microphone.readonly {
  color: #ddd;
}
.fa-microphone-slash.readonly {
  color: #ddd;
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

  &.readonly {
    cursor: auto;
  }
}
</style>

<style lang="less">
#dev-tree-player {
  .view-list {
  .video-show {
    .video {
      border: 1px solid #fff;

      &.active .video-inner {
        border: 2px solid red;
      }
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
}
</style>


