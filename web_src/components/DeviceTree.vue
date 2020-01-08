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
          <div class="form-group form-group-sm">
            <el-checkbox title="是否在搜索时始终显示本域组织树" style="margin-left:2px;margin-top:-5px;margin-bottom:0;" size="small" v-if="q" v-model.trim="searchBY">显示本域</el-checkbox>
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
          <div class="col-md-4" ref="devTreeWrapper" id="dev-tree-wrapper">
            <el-tree ref="devTree" id="dev-tree" node-key="key" v-if="showTree" :style="'max-height:'+playerHeight()+'px;min-height:200px;overflow:auto;'"
              :props="treeProps" :load="treeLoad" :filter-node-method="treeFilter" lazy draggable
              @node-click="treeNodeClick" @node-contextmenu="treeNodeRightClick"
              :allow-drag="treeAllowDrag" :allow-drop="treeAllowDrop" @node-drop="treeNodeDrop"
            >
              <span class="custom-tree-node" slot-scope="{node, data}">
                <span :class="{'text-green': data.status === 'ON' && data.subCount === 0 && data.code && data.serial && !data.custom}">
                  <i :class="['fa', {'fa-group' : data.subCount > 0 || !data.code || data.custom,
                    'fa-camera': data.subCount == 0 && data.code && data.serial && !data.custom}]"></i>
                  <span class="ellipsis" :title="node.label">{{node.label}}</span>
                </span>
              </span>
            </el-tree>
          </div>
          <VueContextMenu class="right-menu" :target="contextMenuTarget" :show="contextMenuVisible" @update:show="(show) => contextMenuVisible = show">
            <a href="javascript:;" @click="showNodeAddDlg" v-show="contextMenuNodeData && contextMenuNodeData.custom">
              <i class="fa fa-plus"></i> 新建
            </a>
            <a href="javascript:;" @click="showNodeEditDlg" v-show="contextMenuNodeData && contextMenuNodeData.customName != '本域'">
              <i class="fa fa-edit"></i> 编辑
            </a>
            <a href="javascript:;" @click="removeCustomNode" v-show="showRemoveContextMenu()">
              <i class="fa fa-remove"></i> 删除
            </a>
          </VueContextMenu>
          <div class="col-md-8 tree-player">
            <br>
              <div class="no-margin no-padding video" @mousemove="resetCloseTimer()" @touchstart="resetCloseTimer()">
                <LivePlayer :videoUrl="player.url" :poster="player.poster" live muted stretch v-loading="player.bLoading" element-loading-text="加载中..." element-loading-background="#000" @message="$message"></LivePlayer>
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
      <DeviceTreeNodeEditDlg ref="nodeEditDlg" @submit="treeRefresh" style="z-index:2001;"></DeviceTreeNodeEditDlg>
    </div>
</template>

<script>
import _ from "lodash";
import url from "url";
import { mapState } from "vuex"
import LivePlayer from '@liveqing/liveplayer'
import { component as VueContextMenu } from '@xunlei/vue-context-menu'
import DeviceTreeNodeEditDlg from 'components/DeviceTreeNodeEditDlg.vue'
export default {
  props: {},
  data() {
    return {
      q: "",
      loading: false,
      timer: 0,
      showTree: true,
      searchBY:true,
      player: {
        url: "",
        protocol: "",
        poster: "",
        bLoading: false,
        bCloseShow: false,
      },
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
          return data.subCount === 0 && data.status != "ON" && !data.custom;
        }
      },
    };
  },
  components: {
    LivePlayer, VueContextMenu, DeviceTreeNodeEditDlg
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  mounted() {
    this.contextMenuTarget = document.querySelector('#dev-tree-wrapper')
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
    },
    searchBY: function(newVal,oldVal) {
      this.$refs['devTree'].filter(this.q);
    }
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
            key: serial + ":" + pcode + ":" + v.id,
          })
        }));
        this.$refs['devTree'].filter(this.q);
      })
    },
    treeFilter(value, data) {
       if (!value) return true;
       if (this.searchBY && (data.customName.indexOf("本域") !== -1 || data.id.indexOf("216") !== -1) ) {
          return true;
       }
       return data.name.indexOf(value) !== -1 || data.customName.indexOf(value) !== -1 || data.id.indexOf(value) !== -1;
    },
    treeAllowDrag(node) {
      if(node && node.data && node.data.code) {
        this.pnode = node.parent;
        return true;
      } else {
        return false;
      }
    },
    treeAllowDrop(dragNode, dropNode, type) {
      if(type != 'inner' || !dragNode || !dropNode) return false;
      var drag = dragNode.data;
      var drop = dropNode.data;
      if(!drag || !drop) return false;
      if(!drop.custom) return false;
      if(drag.custom && drag.serial != drop.serial) return false;
      if(!drag.custom && !drop.code) return false;
      return true;
    },
    treeNodeDrop(dragNode, dropNode, type, event) {
      if(type == 'inner') {
        var drag = dragNode.data;
        var drop = dropNode.data;
        if(!drag || !drop) return;
        if(!drag.custom) {
          $.get("/api/v1/channel/move", {
            serial: drag.serial,
            code: drag.code,
            parentid: drop.id,
          }).then(() => {
            this.treeNodeRefresh(this.pnode);
            this.treeNodeRefresh(drop);
          })
        } else {
          $.get("/api/v1/channel/move", {
            serial: drag.serial,
            code: drag.code,
            parentid: drop.code,
          }).then(() => {
            this.treeNodeRefresh(this.pnode);
            this.treeNodeRefresh(drop);
          })
        }
      }
    },
    treeNodeRefresh(key) {
      let node = this.$refs['devTree'].getNode(key);
      if(!node) return;
      node.loaded = false;
      node.expand();
    },
    treeNodeRightClick(event, data, node, c) {
      this.contextMenuNodeData = data;
      this.pnode = node.parent;
      var new_event = new MouseEvent(event.type, event);
      document.querySelector('#dev-tree-wrapper').dispatchEvent(new_event);
    },
    treeNodeClick(data, node, c) {
      this.contextMenuNodeData = null;
      if(data.subCount === 0 && data.status === "ON" && !data.custom && data.serial && data.code) {
        this.closeVideo();
        this.player.bLoading = true;
        $.get("/api/v1/stream/start", {
          serial: data.serial,
          code: data.code,
        }).then(streamInfo => {
          streamInfo = streamInfo || {};
          var videoUrl = this.isMobile() ? streamInfo.HLS : streamInfo.RTMP;
          var protocol = this.isMobile() ? "HLS" : "RTMP";
          if(this.flvSupported() && streamInfo.FLV) {
            videoUrl = streamInfo.FLV;
            protocol = "FLV";
          }
          this.player.protocol = protocol;
          this.player.poster = protocol == "RTMP" ? "" : streamInfo.SnapURL;
          this.$nextTick(() => {
            this.player.url = videoUrl || "";
          })
        }).always(() => {
          this.player.bLoading = false;
        })
      }
    },
    showRemoveContextMenu() {
      if(this.contextMenuNodeData && this.contextMenuNodeData.code) {
        if(!this.contextMenuNodeData.custom) {
          var pData = this.getParentData();
          if(pData && !pData.custom) return false;
        }
        return true;
      }
      return false;
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
      this.player.bLoading = false;
      this.player.bCloseShow = false;
    },
    playerHeight() {
      return this.isMobile() ? 200: $(".tree-player").outerHeight()
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
.right-menu {
  position: fixed;
  background: #fff;
  border: solid 1px rgba(0, 0, 0, .2);
  border-radius: 3px;
  z-index: 999;
  display: none;
}
.right-menu a {
  width: 75px;
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
</style>


