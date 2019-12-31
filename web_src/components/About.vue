<template>
<div class="container-fluid no-padding box-cards">
    <el-card class="box-card col-lg-6" shadow="never">
        <div slot="header" class="clearfix">
            <div class="col-md-12 no-padding">
                <h3>信令服务</h3>
            </div>
        </div>
        <div class="server-info">
            <div class="box box-widget">
                <div class="box-header">
                    <h4> <i class="fa fa-support"></i> 版本信息</h4>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-striped">
                        <tbody>
                            <tr>
                                <td style="width:20%;">硬件信息</td>
                                <td><span>{{serverInfo.Hardware}}</span></td>
                            </tr>
                            <tr>
                                <td>接口版本</td>
                                <td><span id="interface-info">{{serverInfo.InterfaceVersion}}</span></td>
                            </tr>
                            <tr>
                                <td>运行时间</td>
                                <td>
                                    <span id="running-time-info">{{runningTime || serverInfo.RunningTime}}
                                        <small v-if="userInfo">
                                            &nbsp;<a href="#" @click.prevent="restart" class="text-orange">重启</a>
                                        </small>
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>软件信息</td>
                                <td><span id="software-info">{{serverInfo.Server}}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="box box-widget">
                <div class="box-header">
                    <h4>
                        <i class="fa fa-key"></i> 授权信息 <span v-if="serverInfo.VersionType">({{serverInfo.VersionType}})</span>
                        &nbsp;&nbsp;
                        <small v-show="canExpand && !expanded">
                            <a href="#" @click.prevent="expand" class="fa fa-plus text-orange" title="显示激活码入口"></a>
                        </small>
                    </h4>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-striped">
                        <tbody>
                            <tr>
                                <td style="width:20%;">授权对象</td>
                                <td>{{serverInfo.Authorization}}</td>
                            </tr>
                            <tr>
                                <td>授权时间</td>
                                <td v-if="!actived">剩余期限{{serverInfo.RemainDays}}天</td>
                                <td v-else>永久授权</td>
                            </tr>
                            <tr v-if="actived && serverInfo.ChannelCount && serverInfo.ChannelCount >= 0 && serverInfo.ChannelCount < 1000">
                                <td>通道数</td>
                                <td>{{serverInfo.ChannelCount}}</td>
                            </tr>
                            <tr v-if="!actived || expanded">
                                <td>机器码</td>
                                <td>
                                    <span id="key-info">CMS{{(serverInfo.Server||"").indexOf("Linux") >= 0 ? "L":"W"}}{{requestkey}}</span>
                                    <br>
                                    <span style="color:#bbb">(通过邮箱：support@liveqing.com 向商务人员咨询永久授权信息)</span>
                                </td>
                            </tr>
                            <tr v-if="!actived || expanded">
                                <td>提交激活码</td>
                                <td>
                                    <el-input type="textarea" :rows="1" placeholder="输入申请到的激活码" v-model.trim="activationCode" ref="activationCode" :autosize="{minRows:1, maxRows:5}" style="margin-bottom:10px;"></el-input>
                                    <div>
                                        <button type="button" class="btn btn-sm btn-primary" @click.prevent="checkCode" :disabled="bSubmitting"> 提交 </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </el-card>
    <el-card class="box-card col-lg-6" shadow="never">
        <div slot="header" class="clearfix">
            <div class="col-md-6 no-padding">
                <h3>流媒体服务</h3>
            </div>
            <div class="col-md-6 no-padding" v-if="sms.Load">
                <select style="margin-top: 23px;width:100%" v-model.trim="smsserial" @change="smschange">
                    <option v-for="(c, idx) in smss" :value="c.Serial" :key="idx"> SMS-{{c.Serial}}</option>
                </select>
            </div>
        </div>
        <div class="server-info">
            <h4 style="text-align:center;" v-if="!smsserverinfo.Hardware"> SMS 流媒体服务尚未启动 </h4>
            <div class="box box-widget" v-if="smsserverinfo.Hardware">
                <div class="box-header">
                    <h4> <i class="fa fa-support"></i> 版本信息</h4>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-striped">
                        <tbody>
                            <tr>
                                <td style="width:20%;">硬件信息</td>
                                <td><span>{{smsserverinfo.Hardware}}</span></td>
                            </tr>
                            <tr>
                                <td style="width:20%;">负载</td>
                                <td><span>{{sms.Load}}</span></td>
                            </tr>
                            <tr>
                                <td>运行时间</td>
                                <td>
                                    <span id="running-time-info">{{runningSMSTime || smsserverinfo.RunningTime}}
                                        <small v-if="userInfo">
                                            &nbsp;<a href="#" @click.prevent="restartSMS" class="text-orange">重启</a>
                                        </small>
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>软件信息</td>
                                <td><span id="software-info">{{smsserverinfo.Server}}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="box box-widget" v-if="smsrequestkey.RequestKey && smsserverinfo.Authorization">
                <div class="box-header">
                    <h4> <i class="fa fa-key"></i> 授权信息 <span v-if="smsserverinfo.VersionType">({{smsserverinfo.VersionType}})</span></h4>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-striped">
                        <tbody>
                            <tr>
                                <td style="width:20%;">授权对象</td>
                                <td>{{smsserverinfo.Authorization}}</td>
                            </tr>
                            <tr>
                                <td>授权时间</td>
                                <td v-if="!activedsms">剩余期限{{smsserverinfo.RemainDays}}天</td>
                                <td v-else>永久授权</td>
                            </tr>
                            <tr v-if="(activedsms||expanded) && smsserverinfo.ChannelCount && smsserverinfo.ChannelCount >= 0 && smsserverinfo.ChannelCount < 1000">
                                <td>通道数</td>
                                <td>{{smsserverinfo.ChannelCount}}</td>
                            </tr>
                            <tr v-if="!activedsms||expanded">
                                <td>机器码</td>
                                <td>
                                    <span id="key-info">SMS{{(smsserverinfo.Server||"").indexOf("Linux") >= 0 ? "L":"W"}}{{smsrequestkey.RequestKey}}</span>
                                    <br>
                                    <span style="color:#bbb">(通过邮箱：support@liveqing.com 向商务人员咨询永久授权信息)</span>
                                </td>
                            </tr>
                            <tr v-if="!activedsms||expanded">
                                <td>提交激活码</td>
                                <td>
                                    <el-input type="textarea" :rows="1" placeholder="输入申请到的激活码" v-model.trim="activationCodeSMS" ref="activationCodeSMS" :autosize="{minRows:1, maxRows:5}" style="margin-bottom:10px;"></el-input>
                                    <div>
                                        <button type="button" class="btn btn-sm btn-primary" @click.prevent="checkCodeSMS" :disabled="bSubmittingSMS"> 提交 </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </el-card>
</div>
</template>

<script>
import {
    mapState,
    mapActions
} from "vuex";
import moment from 'moment'
export default {
    data() {
        return {
            timer: 0,
            requestkey: "",
            activationCode: "",
            activationCodeSMS: "",
            bSubmitting: false,
            bSubmittingSMS: false,
            runningTime: "",
            runningSMSTime: "",
            smsserial: "",
            smss: [],
            sms: {},
            smsrequestkey: {},
            smsserverinfo: {},
            expanded:false,
        };
    },
    computed: {
        ...mapState(["userInfo", "serverInfo"]),
        actived() {
            return this.serverInfo.RemainDays == 9999;
        },
        activedsms() {
            return this.smsserverinfo.RemainDays == 9999;
        },
        canExpand() {
            if (this.actived && this.serverInfo.VersionType && this.serverInfo.VersionType.indexOf("旗舰版") < 0) {
                return true;
            }
            if (this.actived && this.serverInfo.ChannelCount && this.serverInfo.ChannelCount >= 0 && this.serverInfo.ChannelCount < 1000) {
                return true;
            }
            return false;
        },
    },
    mounted() {
        this.getServerInfo();
        this.timer = setInterval(() => {
            if (this.serverInfo && this.serverInfo.StartUpTime) {
                var start = moment(this.serverInfo.StartUpTime, "YYYY-MM-DD HH:mm:ss");
                var now = moment();
                var d = moment.duration(now.diff(start));
                if (this.serverInfo.DiffDuration) {
                    d = d.add(this.serverInfo.DiffDuration);
                }
                this.runningTime = `${parseInt(d.asDays())} Days ${d.hours()} Hours ${d.minutes()} Mins ${d.seconds()} Secs`;
            }
            if (this.smsserverinfo && this.smsserverinfo.StartUpTime) {
                var start = moment(this.smsserverinfo.StartUpTime, "YYYY-MM-DD HH:mm:ss");
                var now = moment();
                var d = moment.duration(now.diff(start));
                if (this.smsserverinfo.DiffDuration) {
                    d = d.add(this.smsserverinfo.DiffDuration);
                }
                this.runningSMSTime = `${parseInt(d.asDays())} Days ${d.hours()} Hours ${d.minutes()} Mins ${d.seconds()} Secs`;
            }
        }, 1000)
        $.get("/api/v1/getrequestkey").then(ret => {
            this.requestkey = ret.RequestKey;
        });

        this.getSMSList()
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
    },
    methods: {
        ...mapActions([
            "getServerInfo"
        ]),
        restart() {
            this.$confirm('此操作将重启信令服务, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                $.get("/api/v1/restart").then(ret => {
                    this.$message({
                        type: 'success',
                        message: '重启成功!'
                    });
                    setTimeout(() => {
                        this.getServerInfo();
                    }, 2000);
                }).fail(() => {
                    this.$message({
                        type: 'error',
                        message: '重启失败!'
                    });
                })
            }).catch(() => {});
        },
        restartSMS() {
            this.$confirm('此操作将重启流媒体服务, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                $.get("/api/v1/sms/restart", {
                    serial: this.smsserial
                }).then(ret => {
                    this.$message({
                        type: 'success',
                        message: '重启成功!'
                    });
                    setTimeout(() => {
                        this.getSMSInfo();
                    }, 2000);
                }).fail(() => {
                    this.$message({
                        type: 'error',
                        message: '重启失败!'
                    });
                })
            }).catch(() => {});
        },
        checkCode() {
            if (this.activationCode == "") {
                this.$message({
                    type: "error",
                    message: "请输入激活码"
                });
            } else {
                this.bSubmitting = true;
                $.get("/api/v1/verifyproductcode", {
                    productcode: this.activationCode
                }).then(ret => {
                    if (ret.State == 1) {
                        this.$message({
                            type: "success",
                            message: "授权成功！"
                        });
                        this.getServerInfo();
                    } else {
                        this.$message({
                            type: "error",
                            message: "输入有效激活码"
                        })
                    }
                }).always(() => {
                    this.bSubmitting = false;
                })
            }
        },
        getSMSList() {
            if (this.smsserial == "") {
                $.get("api/v1/sms/list").then(ret => {
                    this.smss = ret
                    if (ret.length > 0) {
                        this.sms = ret[0]
                        this.smsserial = ret[0].Serial
                    }
                    this.getSMSInfo();
                })
            }
        },
        getSMSInfo() {
            if (this.smsserial != "") {
                $.get("api/v1/sms/getrequestkey", {
                    serial: this.smsserial
                }).then(ret => {
                    this.smsrequestkey = ret;
                })
                $.get("api/v1/sms/getserverinfo", {
                    serial: this.smsserial
                }).then(ret => {
                    this.smsserverinfo = ret;
                })
            }
        },
        smschange() {
            this.getSMSInfo()
            $.get("api/v1/sms/list").then(ret => {
                this.smss = ret
                for (var i = 0; i < this.smss.length; i++) {
                    if (this.smss[i].Serial == this.smsserial) {
                        this.sms = this.smss[i]
                        break
                    }
                }
            })
        },
        checkCodeSMS() {
            if (this.activationCodeSMS == "") {
                this.$message({
                    type: "error",
                    message: "请输入激活码"
                });
            } else {
                this.bSubmittingSMS = true;
                $.get("/api/v1/sms/verifyproductcode", {
                    serial: this.smsserial,
                    productcode: this.activationCodeSMS
                }).then(ret => {
                    if (ret.State == 1) {
                        this.$message({
                            type: "success",
                            message: "授权成功！"
                        });
                        this.getSMSInfo();
                    } else {
                        this.$message({
                            type: "error",
                            message: "输入有效激活码"
                        })
                    }
                }).always(() => {
                    this.bSubmittingSMS = false;
                })
            }
        },
        expand() {
            this.expanded = true;
        }
    }
}
</script>

<style lang="less" scoped>
.container-fluid.no-padding.box-cards {
    overflow: hidden;

    .box-card {
        &[class*="col-"] {
            margin-bottom: -99999px;
            padding-bottom: 99999px;
        }
    }
}
</style>
