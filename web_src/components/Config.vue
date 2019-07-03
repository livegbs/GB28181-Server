<template>
    <div class="container-fluid no-padding">
        <section class="content">
            <div class="nav-tabs-custom col-lg-offset-2 col-lg-8 no-padding">
                <ul class="nav nav-tabs">
                    <li class="active"><a href="#base-config" data-toggle="tab">{{logoText}} 基础配置</a></li>
                </ul>
                <div class="tab-content">
                    <div class="tab-pane  active" id="base-config">
                        <form role="form" class="form-horizontal" autocomplete="off" @submit.prevent="onSubmit">
                            <div :class="['form-group' , {'has-error': errors.has('Serial')}]">
                                <label for="sip-serial" class="col-sm-4 control-label">SIP ID</label>
                                <div class="col-sm-7">
                                    <input id="sip-serial" type="text" class="form-control" name="Serial" data-vv-as="SIP ID" v-validate="'required'" v-model.trim="Serial">
                                    <span class="help-block">{{errors.first('Serial')}}</span>
                                </div>
                            </div>
                            <div :class="['form-group' , {'has-error': errors.has('Realm')}]">
                                <label for="sip-realm" class="col-sm-4 control-label">SIP 域</label>
                                <div class="col-sm-7">
                                    <input id="sip-realm" type="text" class="form-control" name="Realm" data-vv-as="SIP 域" v-validate="'required'" v-model.trim="Realm">
                                    <span class="help-block">{{errors.first('Realm')}}</span>
                                </div>
                            </div>
                            <div :class="['form-group' , {'has-error': errors.has('Host')}]">
                                <label for="sip-host" class="col-sm-4 control-label">SIP Host</label>
                                <div class="col-sm-7">
                                    <input type="text" id="sip-host" class="form-control" name="Host" data-vv-as="SIP Host" v-validate="'required'" v-model.trim="Host">
                                    <span class="help-block">{{errors.first('Host')}}</span>
                                </div>
                            </div>
                            <div :class="['form-group' , {'has-error': errors.has('Port')}]">
                                <label for="sip-port" class="col-sm-4 control-label">SIP 端口</label>
                                <div class="col-sm-7 checkbox">
                                    <input type="text" id="sip-port" class="form-control" name="Port" data-vv-as="SIP 端口" v-validate="'required|numeric'" v-model.trim="Port">
                                    <span class="help-block">{{errors.first('Port')}}</span>
                                </div>
                            </div>
                            <div :class="['form-group' , {'has-error': errors.has('DevicePassword')}]">
                                <label for="sip-dev-pwd" class="col-sm-4 control-label">设备统一接入密码</label>
                                <div class="col-sm-7">
                                    <input type="text" id="sip-dev-pwd" class="form-control" name="DevicePassword" data-vv-as="设备统一接入密码" v-model.trim="DevicePassword">
                                    <span class="help-block">{{errors.first('DevicePassword')}}</span>
                                </div>
                            </div>
                            <div :class="['form-group' , {'has-error': errors.has('TimeServer')}]">
                                <label for="sip-time-server" class="col-sm-4 control-label">校时源</label>
                                <div class="col-sm-7">
                                    <input type="text" id="sip-time-server" class="form-control" name="TimeServer" data-vv-as="校时源" v-validate="" v-model.trim="TimeServer" placeholder="上级国标编号/NTP">
                                    <span class="help-block">{{errors.first('TimeServer')}}</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="api-auth" class="col-sm-4 control-label">接口鉴权</label>
                                <div class="col-sm-7 checkbox">
                                    <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small"  true-label="1" false-label="0" v-model.trim="APIAuth" name="APIAuth" ></el-checkbox>
                                    <span class="help-block"></span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="black-serial-list" class="col-sm-4 control-label">黑名单 ID</label>
                                <div class="col-sm-7">
                                    <input type="text" id="black-serial-list" class="form-control" name="BlackSerialList" data-vv-as="黑名单 ID" v-model.trim="BlackSerialList">
                                    <span class="help-block"></span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="black-ip-list" class="col-sm-4 control-label">黑名单 IP</label>
                                <div class="col-sm-7">
                                    <input type="text" id="black-ip-list" class="form-control" name="BlackIPList" data-vv-as="黑名单 IP" v-model.trim="BlackIPList">
                                    <span class="help-block"></span>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-sm-offset-4 col-sm-7">
                                    <button type="submit" class="btn btn-primary" :disabled="isBasicNoChange || errors.any() || bCommitting">保存</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- /.tab-content -->
            </div>
        </section>
    </div>
</template>

<script>
import $ from "jquery";
import { mapState, mapActions } from "vuex"

export default {
  data() {
    return {
      bCommitting: false,
      Serial: "",
      Realm: "",
      Host: "",
      Port: 0,
      DevicePassword: "",
      TimeServer: "",
      AckTimeout: 0,
      KeepaliveTimeout: 0,
      APIAuth: "0",
      BlackSerialList: "",
      BlackIPList: "",
      remoteBasicData: ""
    };
  },
  mounted() {
    this.getBaseConfig()
  },
  methods: {
    async onSubmit() {
      var ok = await this.$validator.validateAll();
      if (!ok) {
        var e = this.errors.items[0];
        this.$message({
          type: "error",
          message: e.msg
        });
        $(`[name=${e.field}]`).focus();
        return;
      }
      this.bCommitting = true;
      $.get("/api/v1/setbaseconfig", this.getBasicCommitObject()).then(data => {
        this.$message({
            type: "success",
            message: "配置成功！"
        });
      }).always(() => {
          this.getBaseConfig()
          this.bCommitting = false;
      })
    },
    getBasicCommitObject() {
      return {
        Serial: this.Serial,
        Realm: this.Realm,
        Host: this.Host,
        Port: this.Port,
        DevicePassword: this.DevicePassword,
        TimeServer: this.TimeServer,
        AckTimeout: this.AckTimeout,
        KeepaliveTimeout: this.KeepaliveTimeout,
        APIAuth: this.APIAuth,
        BlackSerialList: this.BlackSerialList,
        BlackIPList: this.BlackIPList
      };
    },
    getBaseConfig() {
        $.get("api/v1/getbaseconfig").then(ret => {
            this.Serial = ret.Serial;
            this.Realm = ret.Realm;
            this.Host = ret.Host;
            this.Port = ret.Port;
            this.DevicePassword = ret.DevicePassword;
            this.TimeServer = ret.TimeServer;
            this.AckTimeout = ret.AckTimeout;
            this.KeepaliveTimeout = ret.KeepaliveTimeout;
            this.APIAuth = ret.APIAuth;
            this.BlackSerialList = ret.BlackSerialList;
            this.BlackIPList = ret.BlackIPList;

            this.remoteBasicData = JSON.stringify(this.getBasicCommitObject());
        });
    }
  },
  computed: {
    ...mapState([
      "logoText",
      "logoMiniText",
      "menus",
      "serverInfo"
    ]),
    isBasicNoChange() {
      var localeData = JSON.stringify(this.getBasicCommitObject());
      return this.remoteBasicData.localeCompare(localeData) == 0;
    }
  }
};
</script>

