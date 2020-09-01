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
    <resize-observer @notify="handleResize"/>
  </div>
</template>

<script>
import "font-awesome/css/font-awesome.css"
import "bootstrap/dist/css/bootstrap.css"
import "admin-lte/dist/css/AdminLTE.css"
import "admin-lte/dist/css/skins/_all-skins.css"
import "assets/styles/custom.less"
import 'vue-resize/dist/vue-resize.css'

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
Vue.use(BackToTop);

import VueResize from 'vue-resize'
Vue.use(VueResize);

import VeeValidate, { Validator } from "vee-validate";
Vue.use(VeeValidate, {
  fieldsBagName: 'veeFields'
});
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
    return `<iframe src="${_link}" width="${w}" height="${h}" allowfullscreen allow="autoplay; fullscreen"></iframe>`
}
Vue.prototype.isMobile = () => {
  return videojs.browser.IS_IOS || videojs.browser.IS_ANDROID;
}
Vue.prototype.isIE = () => {
  return !!videojs.browser.IE_VERSION;
}
Vue.prototype.flvSupported = () => {
  return videojs.browser.IE_VERSION || (flvjs.getFeatureList() && flvjs.getFeatureList().mseLiveFlvPlayback);
}
Vue.prototype.canTalk = () => {
  return location.protocol.indexOf("https") == 0 || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}
Vue.prototype.hasAnyRole = (serverInfo, userInfo, ...roles) => {
    if (serverInfo && serverInfo.APIAuth === false && !userInfo) {
        return true;
    }
    var userRoles = [];
    if (userInfo) {
        userRoles = userInfo.Roles || [];
    }
    var checked = false;
    for(var role of (roles||[])) {
        if (!role || userRoles.some(ur => (ur == role || ur == '超级管理员'))) {
            checked = true;
            break;
        }
    }
    return checked;
}
Vue.prototype.isDemoUser = (serverInfo, userInfo) => {
  if (serverInfo && userInfo && serverInfo.IsDemo && userInfo.Name == serverInfo.DemoUser) return true;
  return false;
}

import $ from "jquery"
import "@penggy/jquery.nicescroll"
$.ajaxSetup({ cache: false });
export default {
  data() {
    return {
      nice: null,
    }
  },
  watch: {
    serverInfo(val) {
      if (val) {
       document.title = val.LogoText || "LiveGBS";
      }
    }
  },
  mounted() {
    $(document).ajaxError((evt, xhr, opts, ex) => {
      if (xhr.status == 401) {
        location.href = `/login.html?r=${encodeURIComponent(window.location.href)}`;
        return false;
      } else {
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
      }
    }).on("click", ".main-header .sidebar-toggle", function () {
      setTimeout(() => {
        localStorage["sidebar-collapse"] = $("body").hasClass("sidebar-collapse") ? "sidebar-collapse" : "";
      }, 500)
    }).ready(() => {
      this.$nextTick(() => {
        $("body").layout("fix");
        this.fixHover();
        if(!this.isIE() && !this.isMobile()) {
          this.nice = $("body").niceScroll({
              zindex: 999999,
              cursorwidth: "10px",
              cursoropacitymax: 0.5,
              enablekeyboard: false,
          });
        }
      });
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
    handleResize() {
      this.nice && this.nice.resize();
    },
    play(video){
      this.$refs['videoDlg'].play(video.videoUrl, video.videoTitle, video.snapUrl);
    },
    thisYear() {
      return moment().format('YYYY');
    }
  },
  beforeRouteUpdate(to, from, next) {
    $('.modal').modal('hide') // closes all active pop ups.
    next();
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


