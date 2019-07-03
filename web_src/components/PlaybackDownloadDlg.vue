<template>
    <div :class="['modal', { fade: fade }]" data-keyboard="true" data-backdrop="static" tabindex="-1">
        <div class="modal-dialog modal-md">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title text-primary text-center"><span>{{title}}</span></h4>
                </div>
                <div class="modal-body">
                    <el-progress :text-inside="true" :stroke-width="18" :percentage="progress"></el-progress>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click.prevent="scale(1)">x1</button>
                    <button type="button" class="btn btn-primary" @click.prevent="scale(2)">x2</button>
                    <button type="button" class="btn btn-primary" @click.prevent="scale(4)">x4</button>
                    <button type="button" class="btn btn-default" @click.prevent="hide" :disabled="disabled">{{btnText}}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      bShow: false,
      timer: 0,
      title: "",
      streamID: "",
      progress: 0,
      fileUrl: ""
    };
  },
  props: {
    fade: {
      type: Boolean,
      default: false
    },
    disabled: {
        type: Boolean,
        default: false
    }
  },
  computed: {
      btnText() {
          return this.fileUrl ? "下载" : "关闭";
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
    $(this.$el).on("shown.bs.modal", () => {
        this.bShow = true;
        this.$emit("show");
        if(this.streamID) {
            this.timer = setInterval(() => {
                $.ajax({
                    type: "GET",
                    url: "/api/v1/playback/streaminfo",
                    data: {
                        streamid: this.streamID
                    },
                    global: false
                }).then(ret => {
                    this.progress = Math.ceil(ret.Progress * 100)
                    this.fileUrl = ret.PlaybackFileURL;
                })
            }, 3000);
        }
    }).on("hidden.bs.modal", () => {
        this.bShow = false;
        this.$emit("hide");
        if(this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
        if(this.streamID) {
            $.get("/api/v1/playback/stop", {
                streamid: this.streamID
            }).then(() => {
            }).always(() => {
                if(this.fileUrl) {
                    window.open(this.fileUrl, "_blank");
                    this.fileUrl = "";
                }
                this.streamID = "";
            })
        }
    })
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
  },
  methods: {
    show() {
        $(this.$el).modal("show");
    },
    hide() {
        $(this.$el).modal("hide");
    },
    doSubmit() {
        this.$emit("submit");
    },
    download(title, streamID) {
        this.title = title;
        this.streamID = streamID;
        this.fileUrl = "";
        this.progress = 0;
        $(this.$el).modal("show");
    },
    scale(speed) {
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