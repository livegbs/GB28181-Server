import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import url from 'url'

import AdminLTE from 'components/AdminLTE.vue'

const Dashboard = () => import( /* webpackChunkName: 'dashboard' */ 'components/Dashboard.vue');

const ContentRoot = () => import( /* webpackChunkName: 'root' */ 'components/ContentRoot.vue')

const Screen  = () => import(/* webpackChunkName: 'screen' */ 'components/Screen.vue')

const DeviceList = () => import( /* webpackChunkName: 'device' */ 'components/DeviceList.vue')
const ChannelList = () => import( /* webpackChunkName: 'device' */ 'components/ChannelList.vue')
const PlaybackList = () => import(/* webpackChunkName: 'device' */ 'components/PlaybackList.vue')
const PlaybackTimebox = () => import(/* webpackChunkName: 'device' */ 'components/PlaybackTimebox.vue')
const AlarmList = () => import(/* webpackChunkName: 'alarm' */ 'components/AlarmList.vue')
const CascadeList = () => import(/* webpackChunckName: 'cascade' */ 'components/CascadeList.vue')
const Config = () => import(/* webpackChunkName: 'config' */ 'components/Config.vue')
const About = () => import(/* webpackChunkName: 'about' */ 'components/About.vue')

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      component: AdminLTE,
      children: [{
        path: '',
        component: Dashboard,
        props: true
      }, {
        path: 'screen',
        component: ContentRoot,
        children: [
          {
            path: '',
            component: Screen,
            props: true
          }
        ]
      }, {
        path: 'devices',
        component: ContentRoot,
        children: [
          {
            path: '',
            redirect: '1'
          }, {
            path: ':page',
            component: DeviceList,
            props: true
          }, {
            path: 'channels/:devid/:page',
            component: ChannelList,
            props: true
          }, {
            path: 'playback/list/:devid/:channel/:day?',
            component: PlaybackList,
            props: true
          }, {
            path: 'playback/timebox/:devid/:channel/:day?',
            component: PlaybackTimebox,
            props: true
          }
        ]
      },{
        path: 'alarms',
        meta: {},
        component: ContentRoot,
        children: [
          {
            path: '',
            redirect: '1'
          }, {
            path: ':page',
            component: AlarmList,
            props: true
          }
        ]
      }, {
        path: 'cascade',
        meta: { needLogin: true },
        component: ContentRoot,
        children: [
          {
            path: '',
            redirect: '1'
          }, {
            path: ':page',
            component: CascadeList,
            props: true
          }
        ]
      }, {
        path: 'config',
        meta: { needLogin: true },
        component: Config
      }, {
        path: 'about',
        component: About
      }, {
        path: 'logout',
        async beforeEnter(to, from, next) {
          await store.dispatch("logout");
          window.location.href = `/login.html`;
        }
      }, {
        path: '*',
        redirect: '/'
      }
      ]
    }
  ],
  linkActiveClass: 'active'
})

router.beforeEach(async (to, from, next) => {
  var userInfo = await store.dispatch("getUserInfo");
  if (!userInfo) {
    if (to.matched.some((record => {
      return record.meta.needLogin || record.meta.role;
    }))) {
      if (to.fullPath == '/') {
        window.location.href = `/login.html`;
      } else {
        var _url = url.parse(window.location.href, true);
        _url.hash = to.fullPath
        window.location.href = `/login.html?r=${encodeURIComponent(url.format(_url))}`;
      }
      return;
    }
  } else {
    var roles = userInfo.roles || [];//当前用户角色列表
    var menus = store.state.menus.reduce((pval, cval) => {
      pval[cval.path] = cval;
      return pval;
    }, {})
    var _roles = [];//前往页面要求角色列表
    var menu = menus[to.path];
    if (menu) {
      _roles.push(...(menu.roles || []));
    }
    if (_roles.length > 0 && !_roles.some(val => {
      return roles.indexOf(val) >= 0;
    })) {//两个角色列表没有交集
      return;
    }
  }
  next();
})

export default router;