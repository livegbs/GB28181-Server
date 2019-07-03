<template>
<div class="qcontent">
  <div class="qcontent-header">服务器概览 <button type="button" class="btn btn-xs btn-default full-btn" @click.prevent="fullscreen" title="点击大屏展示"><i class="fa fa-arrows-alt"></i></button></div>
  <div class="container-fluid" :style="`height:${this.pageHeight}px;min-height:500px;`">
    <div class="col-md-6 visible-md visible-lg">
      <div class="view-dashboard view-left">
        <div class="panel">
          <div class="panel-body">
            <div class="col-md-12 panel-title">
              通道信息
            </div>
            <div class="col-md-6 auth-view" style="text-align:center;">
              <el-progress color="#337ab7" type="circle" :height="this.authViewHeight" :width="this.authViewHeight" :percentage="authData.DeviceTotal == 0 ? 0:  parseFloat((authData.DeviceOnline/authData.DeviceTotal*100).toFixed(2))"></el-progress>
              <div class="auth-title">在线数:<span class="auth-num">{{authData.DeviceOnline}}</span><br>总设备:<span class="auth-num">{{authData.DeviceTotal}}</span></div>
            </div>
            <div class="col-md-6 auth-view" style="text-align:center">
              <el-progress color="#337ab7" type="circle" :height="this.authViewHeight" :width="this.authViewHeight" :percentage="authData.ChannelTotal == 0 ? 0:  parseFloat((authData.ChannelOnline/authData.ChannelTotal*100).toFixed(2))"></el-progress>
              <div class="auth-title">在线数:<span class="auth-num">{{authData.ChannelOnline}}</span><br>总通道:<span class="auth-num">{{authData.ChannelTotal}}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="view-dashboard  view-left view-split">
        <div class="panel">
          <div class="panel-body">
            <ve-bar height="100%" :colors="chartColors" :data="storeData" :settings="storeSettings" legend-position="bottom" :title="{text:'存储使用', left: 'center'}"></ve-bar>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="view-dashboard view-right">
        <div class="panel">
          <div class="panel-body">
            <ve-line height="100%" :colors="chartColors" :data="cpuData" :settings="memSettings" :legend-visible="false" :title="{text:'CPU使用', left: 'center'}"></ve-line>
          </div>
        </div>
      </div>
      <div class="view-dashboard view-right view-split">
        <div class="panel">
          <div class="panel-body">
            <ve-line height="100%" :colors="chartColors" :data="memData" :settings="memSettings" :legend-visible="false" :title="{text:'内存使用', left: 'center'}"></ve-line>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import moment from "moment";
import {
  mapState
} from "vuex";

import fullscreen from 'vue-fullscreen'
Vue.use(fullscreen);

export default {
  computed: {
    ...mapState(["serverInfo", "userInfo"])
  },
  components: {},
  data() {
    return {
      chartColors: ["#337ab7", "#7FFFD4"],
      pageWidth: 0,
      pageHeight: 0,
      protocol: location.protocol,
      authViewHeight: 80,
      timer: 0,
      vods: {},
      duration: 30,
      memData: {
        columns: ["time", "use"],
        rows: []
      },
      memSettings: {
        area: true,
        xAxisType: "time",
        yAxisType: ["percent"],
        min: [0],
        max: [1],
        labelMap: {
          use: '使用'
        },
      },
      cpuData: {
        columns: ["time", "use"],
        rows: []
      },
      vodData: {
        columns: ["type", "count"],
        rows: []
      },
      vodSettings: {
        label: {
          show: true,
          formatter: "{b}: {c}"
        },
        roseType: "area" //'radius'
      },
      storeData: {
        columns: ["Name", "Used", "FreeSpace"],
        rows: []
      },
      storeSettings: {
        dimension: ["Name"],
        metrics: ["Used", "FreeSpace"],
        stack: {
          store: ["Used", "FreeSpace"]
        },
        legendName: {
          Used: '已使用(G)',
          FreeSpace: '剩余(G)'
        },
        labelMap: {
          Used: '已使用(G)',
          FreeSpace: '剩余(G)'
        }
      },
      authData: {
        ChannelOnline: 0,
        ChannelTotal: 0,
        ChannelCount: 0,
        DeviceOnline: 0,
        DeviceTotal: 0,
      },
      bandwidthData: {
        columns: ["time", "use"],
        rows: []
      },
      bandwidthSettings: {
        area: true,
        xAxisType: "time",
        labelMap: {
          use: "使用(Mbps)"
        }
      }
    };
  },
  mounted() {
    this.top();
    this.timer1 = setInterval(() => {
      this.top();
    }, 2000);
    this.store();
    this.timer2 = setInterval(() => {
      this.store();
    }, 5000);
  },
  created() {
    $(window).resize(function () {
      var newPageWidth = window.innerWidth;
      var newPageHeight = window.innerHeight;
      if (typeof pageWidth != "number") {
        if (document.compatMode == "CSS1Compat") {
          newPageWidth = document.documentElement.clientWidth;
          newPageHeight = document.documentElement.clientHeight;
        } else {
          newPageWidth = document.body.clientWidth;
          newPageHeight = document.body.clientHeight;
        }
      }
      if (newPageWidth != this.pageWidth || newPageHeight != this.pageHeight) {
        this.pageWidth = newPageWidth;
        this.pageHeight = newPageHeight;
      }
      if (this.pageHeight >= screen.height) {
        $(".qcontent .container-fluid").css("height", this.pageHeight + "px");
      } else {
        $(".qcontent .container-fluid").css("height", (this.pageHeight - 140) + "px");
      }
      if (this.pageHeight > 800) {
        $(".auth-view").css("padding-top", "16%")
      } else if (this.pageHeight > 630) {
        $(".auth-view").css("padding-top", "10%")
      } else {
        $(".auth-view").css("padding-top", "2%")
      }
    });
    this.initHeight();
    $(".content").css("padding", "0")
  },
  beforeDestroy() {
    if (this.timer1) {
      clearInterval(this.timer1);
      this.timer1 = 0;
    }
    if (this.timer2) {
      clearInterval(this.timer2);
      this.timer2 = 0;
    }
    $(".content").css("padding", "15px")
  },
  methods: {
    fullscreen() {
      this.$fullscreen.enter(this.$el.querySelector(".container-fluid"), {
        wrap: false
      })
    },
    top() {
      $.get("/api/v1/dashboard/top").then(result => {
        var data = result.data;
        this.memData.rows = data.memData;
        this.cpuData.rows = data.cpuData;
      });
    },
    store() {
      $.get("/api/v1/dashboard/store").then(result => {
        var data = result.data;
        this.storeData.rows = data;
      });

      $.get("/api/v1/dashboard/auth").then(result => {
        var data = result.data;
        this.authData = data;
      });
    },
    isIE() {
      if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
      else
        return false;
    },
    initHeight() {
      this.pageWidth = window.innerWidth;
      this.pageHeight = window.innerHeight;
      if (typeof this.pageWidth != "number") {
        if (document.compatMode == "CSS1Compat") {
          this.pageWidth = document.documentElement.clientWidth;
          this.pageHeight = document.documentElement.clientHeight;
        } else {
          this.pageWidth = document.body.clientWidth;
          this.pageHeight = document.body.clientHeight;
        }
      }
      this.pageHeight = this.pageHeight - 140;
    }
  }
};
</script>

<style>
.qdashboard {
  height: 100%;
}

.view-dashboard {
  height: 50%;
}

.view-left {
  margin-right: 5px;
}

.view-right {
  margin-left: 5px;
}

.view-split {
  margin-top: 10px;
}

.qcontent .fullscreen {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #ecf0f5;
}

.qcontent .full-btn {
  margin-left: 2px;
  margin-top: -3px;
}

.qcontent .col-md-6 {
  padding-left: 0px;
  padding-right: 0px;
  height: 100%;
}

.qcontent .panel {
  height: 100%;
}

.qcontent .panel-body {
  height: 100%;
}

.qcontent .panel-title {
  text-align: center;
  font-weight: bold;
  font-size: 18px;
}

.auth-vlive,
.auth-live {
  margin-top: 6%;
}

.auth-num {
  margin-top: 20%;
  font-size: 14px;
  font-weight: bold;
  color: #337ab7;
}

.auth-view {
  min-height: 200px;
  padding-top: 10%;
}

.auth-title {
  font-size: 12px;
  color: #1d3b55;
}

.auth-promt-div {
  margin-top: 10%;
}

.qcontent .container-fluid {
  padding-bottom: 20px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
}

.content {
  padding: 0;
}
</style>
