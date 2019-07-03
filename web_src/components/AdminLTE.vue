<template>
  <div class="wrapper">
    <NaviBar :logoText="serverInfo.LogoText" :logoMiniText="serverInfo.LogoMiniText" :versionText="versionText" @modify-password="$refs['modify-password-dlg'].show()"></NaviBar>
    <Sider :menus="menus"></Sider>
    <VideoDlg ref="videoDlg" fade></VideoDlg>
    <ModifyPasswordDlg ref="modify-password-dlg"></ModifyPasswordDlg>
    <div class="content-wrapper">
      <section class="content">
        <router-view @play="play"></router-view>
      </section>
    </div>
    <footer class="main-footer">
      <div class="pull-right hidden-xs hide">
        {{serverInfo.LogoText}}
      </div>
      <span v-html="serverInfo.CopyrightText"></span>
    </footer>
    <back-to-top text="返回顶部" class="hidden-xs"></back-to-top>
  </div>
</template>

<script>
import "font-awesome/css/font-awesome.css"
import "bootstrap/dist/css/bootstrap.css"
import "admin-lte/dist/css/AdminLTE.css"
import "admin-lte/dist/css/skins/_all-skins.css"
import "assets/styles/custom.less"

import "bootstrap/dist/js/bootstrap.js"
import "admin-lte/dist/js/adminlte.js"


import { mapState, mapActions } from "vuex"
import Vue from 'vue'
import moment from 'moment'
import Sider from 'components/Sider.vue'
import NaviBar from 'components/NaviBar.vue'
import VideoDlg from 'components/VideoDlg.vue'
import ModifyPasswordDlg from 'components/ModifyPasswordDlg.vue'

import ElementUI from "element-ui"
import 'assets/styles/element-custom.scss'
Vue.use(ElementUI);

import VCharts from 'v-charts'
Vue.use(VCharts);

import VueClipboards from 'vue-clipboards';
Vue.use(VueClipboards);

import fullscreen from 'vue-fullscreen'
Vue.use(fullscreen);

import BackToTop from 'vue-backtotop'
Vue.use(BackToTop)

import VeeValidate, { Validator } from "vee-validate";
import zh_CN from "vee-validate/dist/locale/zh_CN";
Validator.localize("zh_CN", zh_CN);
Vue.use(VeeValidate, {
  locale: "zh_CN",
  // delay: 500,
  dictionary: {
    zh_CN: {
      messages: {
        required: field => `${field} 不能为空`,
        confirmed: (field, targetField) => `${field} 和 ${targetField} 不匹配`,
        regex: field => `${field} 不符合要求格式`
      }
    }
  }
});
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
    var _link = Vue.prototype.$updateQueryString(link, "aspect", `${w}x${h}`)
    return `<iframe src="${_link}" width="${w}" height="${h}" allowfullscreen allow="autoplay"></iframe>`
}
Vue.prototype.isMobile = () => {
  return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
}
Vue.prototype.flvSupported = () => {
  return videojs.browser.IE_VERSION || (flvjs.getFeatureList() && flvjs.getFeatureList().mseLiveFlvPlayback);
}

import $ from "jquery"
$.ajaxSetup({ cache: false });
export default {
  data() {
    return {}
  },
  mounted() {
    $(document).ajaxError((evt, xhr, opts, ex) => {
      if (xhr.status == 401) {
        location.href = `/login.html?r=${encodeURIComponent(window.location.href)}`;
        return false;
      }
      let msg = xhr.responseText || "网络请求失败";
      if (xhr.status == 404) {
        msg = "请求服务不存在或已停止";
      } else if (xhr.status == 504) {
        msg = "Gateway Timeout";
      }
      try {
        msg = JSON.parse(msg)
      } catch (error) {}
      this.$message({
        type: 'error',
        message: msg
      })
    }).on("click", ".main-header .sidebar-toggle", function () {
      setTimeout(() => {
        localStorage["sidebar-collapse"] = $("body").hasClass("sidebar-collapse") ? "sidebar-collapse" : "";
      }, 500)
    }).ready(() => {
        this.getServerInfo().then(() => {
          $("body").layout("fix");
          this.fixHover();
        })
    });
    $("body").addClass(localStorage["sidebar-collapse"]);
  },
  components: {
    NaviBar, Sider, VideoDlg, ModifyPasswordDlg
  },
  computed: {
    ...mapState([
      "menus",
      "userInfo",
      "serverInfo",
    ]),
    versionText(){
      var text = "";
      if(this.serverInfo){
        text = this.serverInfo.Server || ""
      }
      var matchs = text.match(/LiveGBS\/(.+?)\s/i);
      if(matchs) {
        return matchs[1];
      }
      return ""
    }
  },
  methods: {
    ...mapActions([
      "getServerInfo"
    ]),
    fixHover() {
        if(videojs.browser.IS_IOS||videojs.browser.IS_ANDROID) {
            for(var sheetI = document.styleSheets.length - 1; sheetI >= 0; sheetI--) {
                var sheet = document.styleSheets[sheetI];
                if(sheet.cssRules) {
                    for(var ruleI = sheet.cssRules.length - 1; ruleI >= 0; ruleI--) {
                        var rule = sheet.cssRules[ruleI];
                        if(rule.selectorText) {
                            rule.selectorText = rule.selectorText.replace(":hover", ":active");
                            rule.selectorText = rule.selectorText.replace(":focus", ":active");
                        }
                    }
                }
            }
        }
    },
    play(video){
      this.$refs['videoDlg'].play(video.videoUrl, video.videoTitle, video.snapUrl);
    },
    thisYear() {
      return moment().format('YYYY');
    }
  }
}
</script>

<style lang="less" scoped>
.content-wrapper, .right-side, .main-footer {
  transition: none;
}
</style>

<style lang="less">
.vue-back-to-top {
  background-color: transparent;
  left: 30px;
  bottom: 10px;
}
.sidebar-collapse .vue-back-to-top {
  display: none;
}
</style>


