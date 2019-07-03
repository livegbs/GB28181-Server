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
                    <LivePlayer v-if="bShow" :videoUrl="videoUrl" :snapUrl="snapUrl" :live="live" muted :hasaudio="hasAudio"
                      @message="$message" :loading.sync="bLoading" v-loading="bLoading" element-loading-text="加载中"></LivePlayer>
                    <div class="text-center text-gray" v-if="serverInfo.IsDemo && (!userInfo || (userInfo && userInfo.Name == 'test'))">
                      <br>
                      提示: 演示系统限制匿名登录播放时间, 若需测试长时间播放, 请<a target="_blank" href="//www.liveqing.com/docs/download/LiveGBS.html">下载使用</a>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click.prevent="scale(1)">x1</button>
                    <button type="button" class="btn btn-primary" @click.prevent="scale(2)">x2</button>
                    <button type="button" class="btn btn-primary" @click.prevent="scale(4)">x4</button>
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
      streamID: "",
      timer: 0,
      hasAudio: false,
      bShow: false,
      bLoading: false
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
    }
  },
  computed: {
    ...mapState(['userInfo', 'serverInfo']),
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
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
        if(this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
        if(this.streamID) {
          $.get("/api/v1/playback/stop", {
            streamid: this.streamID
          });
        }
      })
      .on("show.bs.modal", () => {
        this.bShow = true;
        // no need since v1.2
        // if (this.streamID) {
        //   this.timer = setInterval(() => {
        //     $.get("/api/v1/playback/streaminfo", {
        //       streamid: this.streamID,
        //       touch: true,
        //     });
        //   }, 15000);
        // }
      });
  },
  components: { LivePlayer },
  methods: {
    play(src, title, snap, serial, code, streamID, hasAudio) {
      this.videoUrl = src || "";
      this.videoTitle = title || "";
      this.snapUrl = snap || "";
      this.serial = serial || "";
      this.code = code || "";
      this.streamID = streamID || "";
      this.hasAudio = hasAudio || false;

      $(this.$el).modal("show");
    },
    scale(speed = 1) {
      $.get("/api/v1/playback/control", {
        streamid: this.streamID,
        command: "scale",
        scale: speed
      })
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
</style>






