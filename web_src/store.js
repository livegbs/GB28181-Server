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
                path: '/',
                title: "概览",
                icon: 'dashboard',
                roles: ['管理员'],
            }, {
                path: "/devices",
                icon: "video-camera",
                title: "国标设备",
                roles: ['管理员','操作员','观众'],
            }, {
                path: '/screen',
                icon: 'th-large',
                title: "分屏展示",
                // roles: ['管理员','操作员','观众'],
            }, {
                path: "/cloudrecord",
                icon: "cloud",
                title: "云端录像",
                versionType: "旗舰版",
                roles: ['管理员','操作员','观众'],
            }, {
                path: "/alarms",
                icon: "bell",
                title: "报警查询",
                roles: ['管理员','操作员'],
            }, {
                path: "/cascade",
                icon: "cloud-upload",
                title: "国标级联",
                versionType: "旗舰版",
                roles: ['管理员'],
            }, {
                path: "/user",
                icon: "users",
                title: "用户管理",
                roles: ['管理员'],
            }, {
                path: "/logs",
                icon: "paw",
                title: "操作日志",
                roles: ['管理员'],
            }, {
                path: "/config",
                icon: "cogs",
                title: "基础配置",
                roles: ['管理员'],
            }, {
                path: "/about",
                icon: "support",
                title: "版本信息",
                roles: ['管理员'],
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
                    resolve({});
                }).fail(() => {
                    resolve({});
                })
            })
        }
    }
})

export default store;