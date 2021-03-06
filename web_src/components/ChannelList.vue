<template>
    <div>
        <div class="box box-primary">
          <div class="box-header">
            <h4 class="text-primary text-center">通道列表({{name||devid}}<span v-if="dir_serial">:{{dir_serial}}</span>)</h4>
          </div>
          <div class="box-body">
            <form class="form-inline" autocomplete="off" spellcheck="false">
              <div class="form-group form-group-sm">
                <button type="button" class="btn btn-sm btn-primary" @click.prevent="$router.go(-1)">
                  <i class="fa fa-chevron-left"></i> 返回
                </button>
              </div>
              <span class="hidden-xs">&nbsp;&nbsp;</span>
              <div class="form-group form-group-sm">
                <label>搜索</label>
                <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
              </div>
              <span class="hidden-xs">&nbsp;&nbsp;</span>
              <div class="form-group form-group-sm">
                <label>通道类型</label>
                <select class="form-control" v-model.trim="channel_type">
                  <option value="">全部</option>
                  <option value="device">设备</option>
                  <option value="dir">子目录</option>
                </select>
              </div>
              <span class="hidden-xs">&nbsp;&nbsp;</span>
              <div class="form-group form-group-sm">
                <label>在线状态</label>
                <select class="form-control" v-model.trim="online">
                  <option value="">全部</option>
                  <option value="true">在线</option>
                  <option value="false">离线</option>
                </select>
              </div>
            </form>
            <br>
            <el-table :data="channels" stripe :default-sort="{prop: 'Channel', order: 'ascending'}" @sort-change="sortChange" v-loading="loading" element-loading-text="加载中...">
              <el-table-column prop="Channel" label="通道号" min-width="100" show-overflow-tooltip sortable="custom"></el-table-column>
              <el-table-column label="操作" min-width="260" v-if="isMobile()" class-name="opt-group">
                <template slot-scope="props">
                    <div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-primary" @click.prevent="playStream(props.row)" :disabled="props.row.Locked" v-if="canPlay(props.row)">
                          <i class="fa fa-play-circle"></i> 播放
                        </button>
                        <button type="button" class="btn btn-danger" @click.prevent="stopStream(props.row)" v-if="props.row.StreamID && hasAnyRole(serverInfo, userInfo, '管理员')">
                          <i class="fa fa-stop"></i> 停止
                        </button>
                        <a :href="`/play.html?serial=${props.row.DeviceID}&code=${props.row.ID}`" class="btn btn-warning" target="_blank" v-if="canPlay(props.row) && (!!props.row.Shared || !serverInfo.APIAuth)">
                          <i class="fa fa-share"></i> 分享页
                        </a>
                        <router-link class="btn btn-info" :to="`/devices/playback/timebox/${devid}/${props.row.ID}`" v-if="canPlayback(props.row)">
                          <i class="fa fa-info"></i> 设备录像
                        </router-link>
                        <router-link class="btn btn-info" :to="`/devices/channels/${devid}/1?dir_serial=${props.row.ID}`" v-if="props.row.SubCount > 0">
                          <i class="fa fa-info"></i> 查看子目录
                        </router-link>
                    </div>
                </template>
              </el-table-column>
              <el-table-column prop="ID" label="通道国标编号" min-width="200" show-overflow-tooltip sortable="custom"></el-table-column>
              <el-table-column prop="Name" label="通道名称" min-width="120" show-overflow-tooltip>
                <template slot-scope="props">
                  <a href="javascript:;" @click.prevent="editChannelName(props.row)" :class="{'text-orange': !!props.row.CustomName}" v-if="hasAnyRole(serverInfo, userInfo, '管理员')">
                    {{props.row.CustomName||props.row.Name||'-'}}
                  </a>
                  <span v-else>
                    {{props.row.CustomName||props.row.Name||'-'}}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="Status" label="在线状态" min-width="100">
                <template slot-scope="props">
                  <span v-if="props.row.SubCount > 0">-</span>
                  <span v-else-if="props.row.Status == 'ON'" class="text-success">在线</span>
                  <span v-else>离线</span>
                </template>
              </el-table-column>
              <el-table-column min-width="100" label="快照">
                  <template slot-scope="props">
                      <el-popover :open-delay="1000" :close-delay="10" placement="left" :title="`通道${props.row.Channel}-${props.row.Name}`" width="400" trigger="hover">
                          <img onerror='this.src="/images/default_snap.png"' style="width:100%;height:100%;" :src="props.row.SnapURL">
                          <img onerror='this.src="/images/default_snap.png"' style="height:30px;width:50px;" slot="reference" :src="props.row.SnapURL">
                      </el-popover>
                  </template>
              </el-table-column>
              <el-table-column prop="AudioEnable" label="开启音频" min-width="100" v-if="hasAnyRole(serverInfo, userInfo, '管理员')">
                  <template slot-scope="props">
                      <el-switch :value="props.row.AudioEnable" @change="toggleAudio(props.row)" :disabled="isDir(props.row)"></el-switch>
                  </template>
              </el-table-column>
              <el-table-column prop="Ondemand" label="按需直播" min-width="100" v-if="hasAnyRole(serverInfo, userInfo, '管理员')">
                  <template slot-scope="props">
                      <el-switch :value="props.row.Ondemand" @change="toggleOndemand(props.row)" :disabled="isDir(props.row)"></el-switch>
                  </template>
              </el-table-column>
               <el-table-column prop="CloudRecord" label="云端录像" min-width="100" v-if="hasAnyRole(serverInfo, userInfo, '管理员') && serverInfo.VersionType == '旗舰版'">
                  <template slot-scope="props">
                      <el-switch :value="props.row.CloudRecord" @change="toggleCloudRecord(props.row)" :disabled="isDir(props.row)"></el-switch>
                  </template>
              </el-table-column>
              <el-table-column prop="Shared" label="开启分享" min-width="100" v-if="hasAnyRole(serverInfo, userInfo, '管理员')">
                  <template slot-scope="props">
                      <el-switch :value="props.row.Shared" @change="toggleShared(props.row)" :disabled="isDir(props.row)"></el-switch>
                  </template>
              </el-table-column>
              <el-table-column prop="NumOutputs" label="在线人数" min-width="100" v-if="hasAnyRole(serverInfo, userInfo, '管理员')"></el-table-column>
              <el-table-column prop="SubCount" label="子节点数" min-width="100" v-if="hasAnyRole(serverInfo, userInfo, '管理员')"></el-table-column>
              <el-table-column prop="Manufacturer" label="厂家" min-width="120" :formatter="formatManufacturer" show-overflow-tooltip></el-table-column>
              <el-table-column prop="PTZType" label="云台类型" min-width="140" v-if="hasAnyRole(serverInfo, userInfo, '管理员', '操作员')">
                <template slot-scope="props">
                  <el-dropdown size="small" trigger="click" v-if="hasAnyRole(serverInfo, userInfo, '管理员')" @command="setPTZType">
                    <span :class="['el-dropdown-link', {'text-orange': props.row.CustomPTZType}]">
                      {{formatPTZType(props.row)}} <i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item :command="{row: props.row, PTZType: 0}">0-未知</el-dropdown-item>
                      <el-dropdown-item :command="{row: props.row, PTZType: 1}">1-球机</el-dropdown-item>
                      <el-dropdown-item :command="{row: props.row, PTZType: 2}">2-半球机</el-dropdown-item>
                      <el-dropdown-item :command="{row: props.row, PTZType: 3}">3-固定枪机</el-dropdown-item>
                      <el-dropdown-item :command="{row: props.row, PTZType: 4}">4-遥控枪机</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                  <span :class="{'text-orange': props.row.CustumPTZType}" v-else>{{formatPTZType(props.row)}}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="260" fixed="right" v-if="!isMobile()" class-name="opt-group">
                <template slot-scope="props">
                    <div class="btn-group btn-group-xs">
                        <button type="button" class="btn btn-primary" @click.prevent="playStream(props.row)" :disabled="props.row.Locked" v-if="canPlay(props.row)">
                          <i class="fa fa-play-circle"></i> 播放
                        </button>
                        <button type="button" class="btn btn-danger" @click.prevent="stopStream(props.row)" v-if="props.row.StreamID && hasAnyRole(serverInfo, userInfo, '管理员')">
                          <i class="fa fa-stop"></i> 停止
                        </button>
                        <a :href="`/play.html?serial=${props.row.DeviceID}&code=${props.row.ID}`" class="btn btn-warning" target="_blank" v-if="canPlay(props.row) && (!!props.row.Shared || !serverInfo.APIAuth)">
                          <i class="fa fa-share"></i> 分享页
                        </a>
                        <router-link class="btn btn-info" :to="`/devices/playback/timebox/${devid}/${props.row.ID}`" v-if="canPlayback(props.row)">
                          <i class="fa fa-info"></i> 设备录像
                        </router-link>
                        <router-link class="btn btn-info" :to="`/devices/channels/${devid}/1?dir_serial=${props.row.ID}`" v-if="props.row.SubCount > 0">
                          <i class="fa fa-info"></i> 查看子目录
                        </router-link>
                    </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="box-footer" v-if="total > 0">
            <el-pagination layout="total,prev,pager,next" :pager-count="isMobile() ? 3 : 5" class="pull-right" :total="total" :page-size.sync="pageSize" :current-page.sync="currentPage"></el-pagination>
          </div>
        </div>
        <ChannelNameEditDlg ref="channelNameEditDlg" @submit="getChannels"></ChannelNameEditDlg>
        <VideoDlg ref="videoDlg" live :ptz="!isMobile()"></VideoDlg>
    </div>
</template>

<script>
import _ from "lodash";
import ChannelNameEditDlg from "components/ChannelNameEditDlg";
import VideoDlg from "components/VideoDlg";
import { mapState } from "vuex";
export default {
  props: {
    devid: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      q: "",
      online: "",
      devOnline: false,
      channel_type: "",
      dir_serial: "",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      sort: "Channel",
      order: "asc",
      loading: false,
      timer: 0,
      channels: [],
      recorder: null,
      bAudioSending: false,
      bAudioSendError: false,
    };
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  // watch: {
  //   q: function(newVal, oldVal) {
  //     this.doDelaySearch();
  //   },
  //   online: function(newVal, oldVal) {
  //     this.doSearch();
  //   },
  //   channel_type: function(newVal, oldVal) {
  //     this.doSearch();
  //   },
  //   dir_serial: function(newVal, oldVal) {
  //     this.doSearch();
  //   },
  //   currentPage: function(newVal, oldVal) {
  //     this.doSearch(newVal);
  //   }
  // },
  components: {
    ChannelNameEditDlg, VideoDlg
  },
  mounted() {
    // this.$refs["q"].focus();
    // this.getChannels();
    // this.timer = setInterval(() => {
    //     this.getChannels();
    // }, 3000);
    // $(document).on("mouseup", this.talkStop); //.on("keydown", this.keyDown);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
    this.talkStop();
    $(document).off("mouseup", this.talkStop); //.off('keydown', this.keyDown);
  },
  methods: {
    ready(){
      this.$watch('q', function(newVal, oldVal) {
        this.doDelaySearch();
      });
      this.$watch('online', function(newVal, oldVal) {
        this.doSearch();
      });
      this.$watch('channel_type', function(newVal, oldVal) {
        this.doSearch();
      });
      this.$watch('dir_serial', function(newVal, oldVal) {
        this.doSearch();
      });
      this.$watch('currentPage', function(newVal, oldVal) {
        this.doSearch(newVal);
      });
      this.timer = setInterval(() => {
          this.getChannels();
      }, 3000);
      $(document).on("mouseup", this.talkStop); //.on("keydown", this.keyDown);
    },
    keyDown(e) {
      if(e.keyCode == 27) {
        this.$el.querySelector('.fa-chevron-left').click();
      }
    },
    isMobile() {
      return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
    },
    doSearch(page = 1) {
      var query = {};
      if (this.q) query["q"] = this.q;
      if (this.online) query["online"] = this.online;
      if (this.channel_type) query["channel_type"] = this.channel_type;
      if (this.dir_serial) query["dir_serial"] = this.dir_serial;
      this.$router.replace({
        path: `/devices/channels/${this.devid}/${page}`,
        query: query
      });
    },
    doDelaySearch: _.debounce(function() {
      this.doSearch();
    }, 500),
    getChannels() {
      $.get("/api/v1/device/channellist", {
        serial: this.devid,
        q: this.q,
        start: (this.currentPage -1) * this.pageSize,
        limit: this.pageSize,
        online: this.online,
        channel_type: this.channel_type,
        dir_serial: this.dir_serial,
        sort: this.sort,
        order: this.order
      })
      .then(ret => {
        this.total = ret.ChannelCount;
        this.channels = ret.ChannelList;
      })
      .always(() => {
      });
    },
    sortChange(data) {
      this.sort = data.prop;
      this.order = data.order == "ascending" ? "asc" : "desc";
      this.getChannels();
    },
    canPlay(row) {
      // return row && row.DeviceOnline && row.Status == "ON" && !row.Custom && row.Parental == 0 && row.SubCount == 0;
      if (row && row.DeviceOnline && row.Status == "ON" && !row.Custom && row.SubCount == 0) {
        if (row.Parental != 1 || row.Manufacturer != "LiveQing") {
          if (row.ID.length != 20 || row.ID.substring(10, 13) != "216" || row.ID.substring(10, 13) != "215") {
            return true;
          }
        }
      }
      return false;
    },
    canPlayback(row) {
      // return row && row.DeviceOnline && !row.Custom && row.Parental == 0 && row.SubCount == 0;
      if (row && row.DeviceOnline && !row.Custom && row.SubCount == 0) {
        if (row.Parental != 1 || row.Manufacturer != "LiveQing") {
          if (row.ID.length != 20 || row.ID.substring(10, 13) != "216" || row.ID.substring(10, 13) != "215") {
            return true;
          }
        }
      }
      return false;
    },
    isDir(row) {
      // return row && (row.SubCount > 0 || row.Parental == 1);
      if (row) {
        if (row.SubCount > 0) {
          return true;
        }
        if (row.Parental == 1 && row.Manufacturer == "LiveQing") {
          return true;
        }
        if (row.ID.length == 20 && (row.ID.substring(10, 13) == "216" || row.ID.substring(10, 13) == "215")) {
          return true;
        }
      }
      return false;
    },
    formatName(row, col, cell) {
      return row.CustomName || row.Name || "-";
    },
    formatManufacturer(row, col, cell) {
      if (cell) return cell;
      return "-";
    },
    formatPTZType(row, col, cell) {
      var ret = "未知";
      var val = row.CustomPTZType || row.PTZType;
      switch(val) {
        case 1:
          ret = "球机"; break;
        case 2:
          ret = "半球"; break;
        case 3:
          ret = "固定枪机"; break;
        case 4:
          ret = "遥控枪机"; break;
      }
      return ret;
    },
    setPTZType(cmd) {
      var ptz = cmd.PTZType;
      if(ptz === cmd.row.PTZType) {
        ptz = 0;
      }
      cmd.row.CustomPTZType = ptz;
      $.get("/api/v1/device/setchannelptztype", {
        serial: cmd.row.DeviceID,
        code: cmd.row.ID,
        ptz_type: ptz,
      })
    },
    toggleAudio(row) {
      $.get("/api/v1/device/setchannelaudio", {
        serial: row.DeviceID,
        code: row.ID,
        audio: !row.AudioEnable,
      }).then(() => {
        row.AudioEnable = !row.AudioEnable;
      })
    },
    editChannelName(row) {
      this.$refs['channelNameEditDlg'].show({
        serial: row.DeviceID,
        code: row.ID,
        name: row.Name,
        custom: row.Custom,
        customName: row.CustomName,
      });
    },
    toggleOndemand(row) {
      $.get("/api/v1/device/setchannelondemand", {
        serial: row.DeviceID,
        code: row.ID,
        ondemand: !row.Ondemand,
      }).then(() => {
        row.Ondemand = !row.Ondemand;
      })
    },
    toggleCloudRecord(row) {
      var tip = row.CloudRecord ? "关闭云端录像, 是否同时设置 开启 按需直播?" : "开启云端录像, 是否同时设置 关闭 按需直播?";
      this.$confirm(tip, "提示", {
        distinguishCancelAndClose: true,
        cancelButtonText: "不设置",
      }).then(() => {
         $.get("/api/v1/device/setchannelcloudrecord", {
          serial: row.DeviceID,
          code: row.ID,
          cloudrecord: !row.CloudRecord,
          ondemand: row.CloudRecord,
        }).always(() => {
          row.Ondemand = row.CloudRecord;
          row.CloudRecord = !row.CloudRecord;
        });
      }).catch(action => {
        if(action === 'cancel') {
          $.get("/api/v1/device/setchannelcloudrecord", {
            serial: row.DeviceID,
            code: row.ID,
            cloudrecord: !row.CloudRecord,
          }).then(() => {
            row.CloudRecord = !row.CloudRecord;
          })
        }
      });
    },
    toggleShared(row) {
      $.get("/api/v1/device/setchannelshared", {
        serial: row.DeviceID,
        code: row.ID,
        shared: !row.Shared,
      }).then(() => {
        row.Shared = !row.Shared;
      })
    },
    talkStart(row) {
      if(this.recorder) {
        return;
      }
      LiveRecorder.get((rec, err) => {
        if(err) {
          alert(err);
          return
        }

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
              serial: row.DeviceID,
              code: row.ID,
              audio: base64,
            }).error(() => {
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
        this.recorder = null;
        return;
      }
    },
    playStream(row) {
      this.loading = true;
      this.$set(row, "Locked", true);
      $.get("/api/v1/stream/start", {
        serial: row.DeviceID,
        code: row.ID
      }).then(streamInfo => {
        this.loading = false;
        this.$nextTick(() => {
          this.$refs["videoDlg"].play(row.CustomName||row.Name||row.ID, row.DeviceID, row.ID, streamInfo);
        });
      }).always(() => {
        this.$delete(row, "Locked");
        this.loading = false;
      })
    },
    stopStream(row) {
      this.$confirm(`确认停止直播 ${row.Name || row.ID} ?`, "提示").then(() => {
        $.get("/api/v1/stream/stop", {
          serial: this.devid,
          code: row.ID
        }).always(() => {
          this.getChannels();
        });
      }).catch(() => {});
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.q = to.query.q || "";
      vm.online = to.query.online || "";
      vm.channel_type = to.query.channel_type || "";
      vm.dir_serial = to.query.dir_serial || "";
      vm.currentPage = parseInt(to.params.page) || 1;
      vm.ready();
    });
  },
  beforeRouteLeave(to, from, next) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
    next();
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.$nextTick(() => {
      this.q = to.query.q || "";
      this.online = to.query.online || "";
      this.channel_type = to.query.channel_type || "";
      this.dir_serial = to.query.dir_serial || "";
      this.currentPage = parseInt(to.params.page) || 1;
      this.channels = [];
      this.getChannels();
    });
  }
};
</script>

<style lang="less">
.opt-group .cell {
  overflow: visible;
}
</style>



