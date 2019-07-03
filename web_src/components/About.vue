<template>
<div class="container-fluid no-padding">
    <div class="col-lg-offset-2 col-lg-8 no-padding server-info">
        <div class="box box-widget">
            <div class="box-header">
                <h3> <i class="fa fa-support"></i> 版本信息</h3>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-striped">
                    <tbody>
                        <tr>
                            <td style="width:20%;">硬件信息</td>
                            <td><span id="hardware-info">{{serverInfo.Hardware}}</span></td>
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
                <h3> <i class="fa fa-key"></i> 授权信息 <span v-if="serverInfo.VersionType">({{serverInfo.VersionType}})</span></h3>
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
                        <tr v-if="serverInfo.ChannelCount && serverInfo.ChannelCount >= 0 && serverInfo.ChannelCount < 1000">
                            <td>通道数</td>
                            <td>{{serverInfo.ChannelCount}}</td>
                        </tr>
                        <tr v-if="!actived">
                            <td>机器码</td>
                            <td>
                                <span id="key-info">CMS{{requestkey}}</span>
                                <br>
                                <span style="color:#bbb">(通过邮箱：support@liveqing.com 向商务人员咨询永久授权信息)</span>
                            </td>
                        </tr>
                        <tr v-if="!actived">
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
            bSubmitting: false,
            runningTime: ""
        };
    },
    computed: {
        ...mapState(["userInfo", "serverInfo"]),
        actived() {
            return this.serverInfo.RemainDays == 9999;
        }
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
        }, 1000)
        $.get("/api/v1/getrequestkey").then(ret => {
            this.requestkey = ret.RequestKey;
        });
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
            this.$confirm('此操作将重启服务, 是否继续?', '提示', {
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
        }
    }
}
</script>
