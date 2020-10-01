<template>
<div>
  <br><br class="hidden-xs">
  <div class="row hidden-xs">
    <div style="width: 450px; margin:0 auto;">
      <el-button-group class="player-btn-group">
        <el-button type="primary" size="medium" v-for="list in playerBtnGroup" :key="list.num" @click.prevent="setPlayerLength(list.num)" :class="{'active' : playerLength == list.num}">{{list.name}}</el-button>
        <el-button type="button" id="full-btn-medium" size="medium" @click.prevent="fullscreen" title="全屏显示" v-if="!isMobile()"><i class="fa fa-arrows-alt"></i></el-button>
        <el-button type="button" v-if="hasLocalData()" size="medium" @click.prevent="loadLocalData(true)" title="点击加载上次记录"><i class="fa fa-database"></i></el-button>
      </el-button-group>
    </div>
  </div>
  <div class="row visible-xs text-center">
    <el-button-group class="player-btn-group">
      <el-button type="primary" size="mini" v-for="list in playerBtnGroup" :key="list.num" @click.prevent="setPlayerLength(list.num)" :class="{'active' : playerLength == list.num}">{{list.name}}</el-button>
    </el-button-group>
  </div>
  <br><br class="hidden-xs">
  <div class="view-list row">
    <div class="col-md-3" id="dev-tree-left">
      <form autocomplete="off" spellcheck="false">
          <div class="form-group form-group-sm">
              <!-- <label>搜索</label> -->
              <input type="text" class="form-control" placeholder="搜索" v-model.trim="q" @keydown.enter.prevent ref="q">
          </div>
      </form>
      <ul class="nav nav-tabs">
        <li class="active"><a href="#dev-tree-wrapper" data-toggle="tab">设备树</a></li>
        <li><a href="#group-tree-wrapper" data-toggle="tab">分 组</a></li>
      </ul>
      <div class="tab-content" style="margin: 10px 0;" id="tab-tree-wrapper">
        <div class="tab-pane active" ref="devTreeWrapper" id="dev-tree-wrapper">
          <el-tree ref="devTree" id="dev-tree" node-key="key" v-if="showTree" :style="`${isMobile() ? 'max-height:200px;' : ''};min-height:200px;overflow:auto;background-color:transparent;`"
            :props="treeProps" :load="treeLoad" :filter-node-method="treeFilter" lazy
            @node-click="treeNodeClick" @node-contextmenu="treeNodeRightClick" >
            <span class="custom-tree-node" slot-scope="{node, data}">
              <span :class="{'text-green': data.status === 'ON' && data.subCount === 0 && data.code && data.serial && !data.custom}">
                <i :class="['fa', {'fa-sitemap' : data.subCount > 0 || !data.code || data.custom,
                  'fa-camera': data.subCount == 0 && data.code && data.serial && !data.custom}]"></i>
                <span class="ellipsis" :title="node.label">{{node.label}}</span>
              </span>
            </span>
          </el-tree>
        </div>
        <div class="tab-pane" ref="groupTreeWrapper" id="group-tree-wrapper">
          <el-tree ref="groupTree" id="group-tree" node-key="key" v-if="showGroupTree" :style="`${isMobile() ? 'max-height:200px;' : ''};min-height:200px;overflow:auto;background-color:transparent;`"
            :props="treeProps" :load="groupTreeLoad" :filter-node-method="treeFilter" lazy :default-expanded-keys="[serverInfo.SIPSerial]"
            @node-click="treeNodeClick" @node-contextmenu="treeNodeRightClick" >
            <span class="custom-tree-node" slot-scope="{node, data}">
              <span :class="{'text-green': data.status === 'ON' && data.subCount === 0 && data.code && data.serial && !data.custom}">
                <i :class="['fa', {'fa-home': !data.code,
                  'fa-sitemap' : data.code && (data.subCount > 0 || data.custom),
                  'fa-camera': data.subCount == 0 && data.code && data.serial && !data.custom}]"></i>
                <span class="ellipsis" :title="node.label">{{node.label}}</span>
              </span>
            </span>
          </el-tree>
        </div>
      </div>
    </div> <!-- dev-tree-left -->
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
    <div id="dev-tree-right" class="row col-md-9" data-sticky-wrap data-sticky-for="1000" data-sticky-class="sticky">
      <div class="video-show col-md-9 col-lg-10">
        <div>
          <div class="no-margin no-padding video" @click="clickPlayer(player, index, $event)" v-for="(player,index) in players" :key="index" @mousemove="resetCloseTimer(player)" @touchstart="resetCloseTimer(player)" :class="{'active': index == playerIdx, 'col-sm-12': playerLength == 1,'col-sm-6': playerLength == 4,'col-sm-4': playerLength == 9,'col-sm-3': playerLength == 16}">
            <LivePlayer :videoUrl="player.url" :poster="player.poster" live muted stretch v-loading="player.bLoading" element-loading-text="加载中..." element-loading-background="#000" :loading.sync="player.bLoading" @message="$message"></LivePlayer>
            <div class="video-close" v-show="player.url && player.bCloseShow" v-on:click="closeVideo(index, true)">关闭</div>
            <div class="video-close channel-selector" v-show="!player.url && player.bCloseShow" v-on:click="selectChannel(index,player)">选择通道</div>
          </div>
          <ScreenChannelListDlg ref="channelListFullscreenDlg" @selected="play" :title="channelListDlgTitle"></ScreenChannelListDlg>
        </div>
        <div class="clearfix"></div>
        <div class="text-center" v-if="isDemoUser(serverInfo, userInfo)">
          <br>
          提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
        </div>
      </div>
      <div class="col-md-3 col-lg-2" id="dev-tree-ptz" v-if="hasAnyRole(serverInfo, userInfo, '管理员', '操作员')">
        <div class="ptz-block">
            <div class="ptz-cell ptz-up" :class="{'readonly': !playing }" command="up" title="上" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-chevron-up"></i>
            </div>
            <div class="ptz-cell ptz-left" :class="{'readonly': !playing }" command="left" title="左" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-chevron-left"></i>
            </div>
            <div class="ptz-cell ptz-center" title="云台控制">
                <i class="fa fa-microphone" :class="{'readonly': !playing }" title="按住喊话" @mousedown.prevent="talkStart"  @touchstart.prevent="talkStart" v-if="canTalk() && serverInfo.VersionType == '旗舰版'"></i>
                <i class="fa fa-microphone-slash" :class="{'readonly': !playing }" title="由于浏览器安全策略, 非 HTTPS 或 localhost 访问, 对讲不可用" v-if="!canTalk() && serverInfo.VersionType == '旗舰版'"></i>
            </div>
            <div class="ptz-cell ptz-right" :class="{'readonly': !playing }" command="right" title="右" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-chevron-right"></i>
            </div>
            <div class="ptz-cell ptz-down" :class="{'readonly': !playing }" command="down" title="下" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-chevron-down"></i>
            </div>
            <div class="ptz-cell ptz-zoomin" :class="{'readonly': !playing }" command="zoomin" title="放大" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-plus"></i>
            </div>
            <div class="ptz-cell ptz-zoomout" :class="{'readonly': !playing }" command="zoomout" title="缩小" @mousedown.prevent="ptzControl" @touchstart.prevent="ptzControl">
                <i class="fa fa-minus"></i>
            </div>
        </div>
      </div> <!-- dev-tree-ptz -->
    </div> <!-- dev-tree-right -->
  </div> <!-- view-list -->
  <ScreenChannelListDlg ref="channelListDlg" @selected="play" :title="channelListDlgTitle"></ScreenChannelListDlg>
  <DeviceTreeNodeEditDlg ref="nodeEditDlg" @submit="treeRefresh"></DeviceTreeNodeEditDlg>
  <ChannelCustomListDlg ref="customListDlg" @hide="treeRefresh" size="modal-lg" :title="customListDlgTitle"></ChannelCustomListDlg>
</div>
</template>

<script>
import Sticky from "sticky-js";
import ScreenChannelListDlg from "components/ScreenChannelListDlg.vue";
import LivePlayer from "@liveqing/liveplayer";
import _ from 'lodash'
import { mapState } from "vuex";
import { component as VueContextMenu } from '@xunlei/vue-context-menu';
import DeviceTreeNodeEditDlg from 'components/DeviceTreeNodeEditDlg.vue';
import ChannelCustomListDlg from 'components/ChannelCustomListDlg.vue';

export default {
  components: {
    LivePlayer, VueContextMenu,
    ScreenChannelListDlg, DeviceTreeNodeEditDlg, ChannelCustomListDlg
  },
  data() {
    return {
      q: "",
      players: [],
      playerIdx: 0,
      playerLength: 4,
      loadedData: false,
      localData: {
          num1: {},
          num4: {},
          num9: {},
          num16: {}
      },
      channelListDlgTitle: "",
      protocol: "",
      showTree: true,
      showGroupTree: true,
      fullscreenFlag: false,
      pnode: null,
      contextMenuTarget: null,
      contextMenuVisible: false,
      contextMenuNodeData: null,
      treeProps: {
        label: (data, node) => {
          node.serial = data.serial;
          node.code = data.code;
          var label = (data.customName || data.name || data.code || data.id);
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
      sticky: null,
    };
  },
  computed: {
    ...mapState(["userInfo", "serverInfo"]),
    playerBtnGroup() {
      var list = [{
        num: 1,
        name: "单屏"
      }, {
        num: 4,
        name: "四分屏"
      }, {
        num: 9,
        name: "九分屏"
      }];
      if(!this.isIE() && !this.isMobile()) {
        list.push({
          num: 16,
          name: "十六分屏"
        })
      }
      return list;
    },
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
    if(this.isMobile()) {
      this.playerLength = 1;
    }
    this.setPlayerLength(this.playerLength);
    this.protocol = this.getQueryString("protocol", "");
    this.loadLocalData(false);
    this.contextMenuTarget = document.querySelector('#tab-tree-wrapper');
    $(document).on("mouseup touchend", this.ctrlStop);
    $(document).on('expanded.pushMenu collapsed.pushMenu', this.updateSticky);
    this.sticky = new Sticky("#dev-tree-right");
  },
  beforeDestroy() {
    this.ctrlStop();
    $(document).off("mouseup touchend", this.ctrlStop);
    $(document).off('expanded.pushMenu collapsed.pushMenu', this.updateSticky);
    this.clearVideos();
    if (this.sticky) {
        this.sticky.destroy();
        this.sticky = null;
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
  beforeRouteLeave(to, from, next) {
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
    hasLocalData() {
        if (localStorage['livegbs_screen']) {
            for (let index = 0; index < this.playerLength; index++) {
                if (this.localData["num" + this.playerLength]["c" + index]) {
                    return !this.loadedData;
                }
            }
            this.loadedData = true;
        }
        return false;
    },
    setLocalData() {
      this.loadedData = true;
      localStorage['livegbs_screen'] = JSON.stringify(this.localData);
    },
    loadLocalData(update) {
        if (localStorage['livegbs_screen']) {
          this.localData = JSON.parse(localStorage['livegbs_screen']);
        }
        if (update) {
          this.loadedData = true;
          for (let index = 0; index < this.playerLength; index++) {
              if (this.localData["num" + this.playerLength]["c" + index]) {
                  var c = JSON.parse(this.localData["num" + this.playerLength]["c" + index])
                  this.play(index, c)
              }
          }
        }
    },
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
      if(this.fullscreenFlag) {
        this.$refs["channelListFullscreenDlg"].show(index);
      } else {
        this.$refs["channelListDlg"].show(index);
      }
    },
    setPlayerLength(playerNum) {
      if (playerNum == this.players.length) {
        return
      }
      this.clearVideos();
      this.players = [];
      this.playerLength = playerNum;
      this.loadedData = false;
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
        var protocol = this.isMobile() ? "HLS" : "RTMP";
        if(this.flvSupported()) {
          if(stream.WS_FLV && !this.isIE()) {
            videoUrl = stream.WS_FLV;
            protocol = "WS_FLV";
          } else if(stream.FLV) {
            videoUrl = stream.FLV;
            protocol = "FLV";
          }
        }
        if(this.isIE() && i > 0) {
          videoUrl = stream.HLS;
          protocol = "HLS";
        }
        var _protocol = String(this.protocol).toUpperCase();
        switch (_protocol) {
          case "RTMP":
            videoUrl = stream.RTMP || "";
            protocol = "RTMP";
            break;
          case "HLS":
            videoUrl = stream.HLS || "";
            protocol = "HLS";
            break;
          case "FLV":
            videoUrl = stream.FLV || "";
            protocol = "FLV";
            break;
          case "WS_FLV":
            videoUrl = stream.WS_FLV || "";
            protocol = "WS_FLV";
            break;
          case "WS-FLV":
            videoUrl = stream.WS_FLV || "";
            protocol = "WS_FLV";
            break;
        }
        player.serial = channel.DeviceID;
        player.code = channel.ID;
        player.ptzType = channel.PTZType;
        player.protocol = protocol;
        player.poster = protocol == "RTMP" ? "" : stream.SnapURL;
        this.$nextTick(() => {
          player.url = videoUrl;
        })
        this.resetCloseTimer(player);
        if (!this.loadedData) {
          this.localData["num" + this.playerLength] = {}
        }
        this.localData["num" + this.playerLength]["c" + index] = JSON.stringify(channel)
        this.setLocalData();
      }).fail(() => {
        player.bLoading = false;
      });
    },
    closeVideo(idx, manual = false) {
      var player = this.players[idx];
      if (!player) {
        return;
      }
      if (player.closeTimer) {
        clearTimeout(player.closeTimer);
        player.closeTimer = 0;
      }
      player.bCloseShow = false;
      player.bloading = false;
      player.poster = "";
      player.url = "";
      player.ptzType = 0;
      player.serial = "";
      player.code = "";
      if (manual) {
          delete this.localData["num" + this.playerLength]["c" + idx];
          this.setLocalData();
      }
    },
    clearVideos() {
      for(var idx in this.players) {
        this.closeVideo();
      }
    },
    setPlayerLength(len) {
      if(len == this.players.length) {
        return
      }
      this.clearVideos();
      this.players = [];
      this.playerLength = len;
      this.loadedData = false;
      this.playerIdx = 0;
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
    fullscreen() {
      if (this.isMobile()) {
        this.$message({
          type: "error",
          message: "请在电脑浏览器上使用该功能"
        });
        return;
      }
      this.$fullscreen.enter(this.$el.querySelector(`.video-show > div`), {
        wrap: false,
        callback: f => {
          this.fullscreenFlag = f;
        }
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
    },
    // tree
    treeLoad(node, resolve) {
      var serial = (node.data||{}).serial||"";
      var pcode = (node.data||{}).code||"";
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
    groupTreeLoad(node, resolve) {
      var serial = (node.data||{}).serial||"";
      var pcode = (node.data||{}).code||"";
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
      var new_event;
      if(typeof(MouseEvent) === 'function') {
          new_event = new MouseEvent(event.type, event);
      } else {
          new_event = document.createEvent('MouseEvents');
          new_event.initMouseEvent(event.type, true, true, event.view, event.detail,
              event.screenX, event.screenY, event.clientX, event.clientY,
              event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button, event);
      }
      this.contextMenuTarget.dispatchEvent(new_event);
    },
    treeNodeClick(data, node, c) {
      this.contextMenuNodeData = null;
      if(data.subCount === 0 && data.status === "ON" && !data.custom && data.serial && data.code) {
        var player = this.players[this.playerIdx]||{};
        if(player.bLoading) return;
        this.closeVideo(this.playerIdx);
        this.play(this.playerIdx, {
          DeviceID: data.serial,
          ID: data.code,
          PTZType: data.ptzType,
        });
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
    // control
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
    updateSticky() {
        this.sticky && this.sticky.update();
    },
  },
};
</script>



<style lang="less" scoped>
@import url(~assets/styles/variables.less);

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

.view-list {

  .nav.nav-tabs > li {
    a {
      background-color: transparent;
    }
    &.active {
      a {
        background-color: darken(#ecf0f5, 5%);
      }
    }
  }

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

.fullscreen {
  width: 100% !important;
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

<!-- ptz style -->
<style lang="less" scoped>
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
.view-list {
    .video-show {
        :not(:fullscreen) {
            .video.active .video-inner {
                border: 2px solid red;
            }
        }
    }
}

.fullscreen {
    & > .video {
        &.col-sm-12 {
            height: 100%;
        }
        &.col-sm-6 {
            height: 50%;
        }
        &.col-sm-4 {
            height: 33.33%;
        }
        &.col-sm-3 {
            height: 25%;
        }
        & > .player-wrapper {
            height: 100%;
            .video-wrapper {
                padding-bottom: 0 !important;
                height: 100%;
            }
        }
    }
}
</style>