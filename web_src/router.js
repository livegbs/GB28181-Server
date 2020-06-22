import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import url from 'url'

import AdminLTE from 'components/AdminLTE.vue'

const Dashboard = () => import( /* webpackChunkName: 'dashboard' */ 'components/Dashboard.vue');

const ContentRoot = () => import( /* webpackChunkName: 'root' */ 'components/ContentRoot.vue')

const Screen  = () => import(/* webpackChunkName: 'screen' */ 'components/Screen.vue')

const DeviceList = () => import( /* webpackChunkName: 'device' */ 'components/DeviceList.vue')
const DeviceTree = () => import( /* webpackChunkName: 'device' */ 'components/DeviceTree.vue')
const ChannelList = () => import( /* webpackChunkName: 'device' */ 'components/ChannelList.vue')
const PlaybackList = () => import(/* webpackChunkName: 'device' */ 'components/PlaybackList.vue')
const PlaybackTimebox = () => import(/* webpackChunkName: 'device' */ 'components/PlaybackTimebox.vue')
const AlarmList = () => import(/* webpackChunkName: 'alarm' */ 'components/AlarmList.vue')
const CascadeList = () => import(/* webpackChunckName: 'cascade' */ 'components/CascadeList.vue')
const UserList = () => import(/* webpackChunckName: 'user' */ 'components/UserList.vue')
const Config = () => import(/* webpackChunkName: 'config' */ 'components/Config.vue')
const About = () => import(/* webpackChunkName: 'about' */ 'components/About.vue')

const CloudRecordChannelList = () => import(/* webpackChunkName: 'cloudrecord' */ 'components/CloudRecordChannelList.vue')
const CloudRecordListBox = () => import(/* webpackChunkName: 'cloudrecord' */ 'components/CloudRecordListBox.vue')
const CloudRecordTimeBox = () => import(/* webpackChunkName: 'cloudrecord' */ 'components/CloudRecordTimeBox.vue')


const Tester = () => import(/* webpackChunkName: 'tester' */ 'components/Tester.vue')
const TesterReport =() => import(/* webpackChunkName: 'tester' */ 'components/TesterReport.vue')

const WhiteList = () => import(/* webpackChunkName: 'white' */ 'components/WhiteList.vue')
const BlackList = () => import(/* webpackChunkName: 'black' */ 'components/BlackList.vue')

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
        path: 'test',
        component: ContentRoot,
        children: [
          {
            path: '',
            component: Tester,
            props: true
          }
        ]
      }, {
        path: 'testreport',
        component: ContentRoot,
        children: [
          {
            path: '',
            component: TesterReport,
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
            path: 'tree',
            component: DeviceTree,
            props: true,
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
      }, {
        path: 'cloudrecord',
        component: ContentRoot,
        children: [{
          path: '',
          redirect: '1'
        },{
          path: ':page',
          component: CloudRecordChannelList,
          props: true
        }, {
          path: 'listview/:serial/:code/:day?',
          component: CloudRecordListBox,
          props: true
        }, {
          path: 'timeview/:serial/:code/:day?',
          component: CloudRecordTimeBox,
          props: true
        }]
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
        path: 'user',
        meta: { needLogin: true },
        component: ContentRoot,
        children: [
          {
            path: '',
            redirect: '1'
          }, {
            path: ':page',
            component: UserList,
            props: true
          }
        ]
      }, {
        path: 'white',
        meta: { needLogin: true },
        component: ContentRoot,
        children: [
          {
            path: '',
            redirect: '1'
          }, {
            path: ':page',
            component: WhiteList,
            props: true
          }
        ]
      },{
        path: 'black',
        meta: { needLogin: true },
        component: ContentRoot,
        children: [
          {
            path: '',
            redirect: '1'
          }, {
            path: ':page',
            component: BlackList,
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
  var serverInfo = await store.dispatch("getServerInfo");
  var userInfo = await store.dispatch("getUserInfo");
  if (serverInfo && serverInfo.APIAuth === false && !userInfo) {
    next();
    return;
  }
  var menuMap = store.state.menus.reduce((pval, cval) => {
    pval[cval.path] = cval;
    return pval;
  }, {})
  var pageRoles = []; // 前往页面要求角色列表
  var menu = menuMap[to.path];
  if (menu) {
    pageRoles.push(...(menu.roles || []));
  }
  if (!userInfo) {
    if (pageRoles.length > 0 || to.matched.some(record => (record.meta.needLogin || record.meta.roles))) {
      if (to.fullPath == '/') {
        window.location.href = `/login.html`;
      } else {
        var _url = url.parse(window.location.href, true);
        _url.hash = to.fullPath
        window.location.href = `/login.html?r=${encodeURIComponent(url.format(_url))}`;
      }
      return;
    }
    next();
    return;
  }
  if (pageRoles.length == 0) {
    next();
    return;
  }
  if (!pageRoles.some(pr => (userInfo.Roles.some(ur => (ur == pr || ur == '超级管理员'))))) { // 两个角色列表没有交集
    console.log("page", to.path, "require roles", pageRoles.join(','));
    console.log("user", userInfo.Name, "has roles", userInfo.Roles.join(','));
    for(var menu of store.state.menus) { // 取首个有交集的菜单
      if(menu.path) {
        if(!menu.roles || menu.roles.some(pr => (userInfo.Roles.some(ur => (ur == pr))))) {
          next(menu.path);
          return;
        }
      }
    }
    // next('/devices')
    // window.location.href = `/#/devices/1`;
    return;
  }
  next();
})

export default router;