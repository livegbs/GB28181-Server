import Vue from "vue";
import Vuex from "vuex";
import moment from "moment"

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        serverInfo: {},
        userInfo: null,
        menus: [
            {
                id: "menu_homepage",
                path: '/',
                title: "概览",
                icon: 'dashboard'
            }, {
                id:"menu_screen",
                path: '/screen',
                title: "分屏展示",
                icon: 'th-large'
            }, {
                path: "/devices",
                icon: "video-camera",
                title: "国标设备"
            }, {
                path: "/alarms",
                icon: "bell",
                title: "报警查询"
            }, {
                path: "/cascade",
                icon: "cloud-upload",
                title: "国标级联"
            }, {
                path: "/config",
                icon: "cogs",
                title: "基础配置"
            }, {
                path: "/about",
                icon: "support",
                title: "版本信息"
            }
        ]
    },
    mutations: {
        updateUserInfo(state, userInfo) {
            state.userInfo = userInfo;
        },
        updateServerInfo(state, serverInfo) {
            state.serverInfo = serverInfo;
        }
    },
    actions: {
        getUserInfo({ commit, state }) {
            return new Promise((resolve, reject) => {
                $.get("/api/v1/userinfo").then(msg => {
                    var userInfo = msg;
                    commit('updateUserInfo', userInfo);
                    resolve(userInfo);
                }).fail(() => {
                    resolve(null);
                })
            })
        },
        logout({ commit, state }) {
            return new Promise((resolve, reject) => {
                $.get("/api/v1/logout").then(data => {
                    commit('updateUserInfo', null);
                    resolve(null);
                }).fail(() => {
                    resolve(null);
                })
            })
        },
        getServerInfo({ commit }) {
            return new Promise((resolve, reject) => {
                $.get("/api/v1/getserverinfo").then(serverInfo => {
                    try {
                        if (serverInfo.ServerTime) {
                            var stime = moment(serverInfo.ServerTime, "YYYY-MM-DD HH:mm:ss");
                            serverInfo.DiffDuration = moment.duration(stime.diff(moment()))
                        }
                        commit('updateServerInfo', serverInfo);
                        resolve(serverInfo)
                        return
                    } catch (error) {
                        console.log(error)
                    }
                    resolve({})
                })
            })
        }
    }
})

export default store;