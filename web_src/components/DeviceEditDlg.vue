<template>
    <FormDlg title="编辑设备" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()">
        <div :class="{'form-group':true,'has-error': errors.has('serial')}">
            <label for="input-serial" class="col-sm-4 control-label">设备编号
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" readonly="readonly" id="input-serial" name="serial" v-model.trim="form.serial" data-vv-as="设备编号" v-validate="'required'">
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('name')}">
            <label for="input-name" class="col-sm-4 control-label">设备名称
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-name" name="name" v-model.trim="form.name" data-vv-as="设备名称" @keydown.enter="$el.querySelector('#input-password').focus()">
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('password')}">
            <label for="input-password" class="col-sm-4 control-label">接入密码
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-password" name="password" v-model.trim="form.password" placeholder="默认使用 livecms.ini > sip > device_password" data-vv-as="接入密码" @keydown.enter="$el.querySelector('#input-contact-ip').focus()">
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('contact_ip')}">
            <label for="input-contact-ip" class="col-sm-4 control-label">信令联络 IP
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-contact-ip" name="contact_ip" v-model.trim="form.contact_ip" placeholder="默认使用 livecms.ini > sip > host" data-vv-as="信令联络 IP" @keydown.enter="$el.querySelector('#input-recv-stream-ip').focus()">
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('recv_stream_ip')}">
            <label for="input-recv-stream-ip" class="col-sm-4 control-label">收流 IP
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-recv-stream-ip" name="recv_stream_ip" v-model.trim="form.recv_stream_ip" placeholder="默认使用 livesms.ini > sip > host" data-vv-as="收流 IP" @keydown.enter="$el.querySelector('#input-catalog-interval').focus()">
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('catalog_interval')}">
            <label for="input-catalog-interval" class="col-sm-4 control-label">通道更新周期(秒)
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-catalog-interval" name="catalog_interval" v-model.trim="form.catalog_interval" placeholder="3600" @keydown.enter="$el.querySelector('#input-subscribe-interval').focus()">
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('subscribe_interval')}">
            <label for="input-catalog-interval" class="col-sm-4 control-label">订阅周期(秒)
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-subscribe-interval" name="subscribe_interval" v-model.trim="form.subscribe_interval" placeholder="默认不订阅" @keydown.enter="onSubmit">
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('media_transport')}">
            <label for="input-media-transport" class="col-sm-4 control-label">流传输模式
            </label>
            <div class="col-sm-7">
                <el-radio-group v-model.trim="form.media_transport" size="mini">
                    <el-radio-button label="TCP"></el-radio-button>
                    <el-radio-button label="UDP"></el-radio-button>
                </el-radio-group>
                &nbsp;&nbsp;
                <el-radio-group v-model.trim="form.media_transport_mode" size="mini" v-show="form.media_transport == 'TCP'">
                    <el-radio-button label="passive">被动</el-radio-button>
                    <el-radio-button label="active">主动</el-radio-button>
                </el-radio-group>
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('forbidden')}">
            <label for="input-forbidden" class="col-sm-4 control-label">其它设置
            </label>
            <div class="col-sm-7 checkbox">
                <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="form.forbidden" name="forbidden">禁止接入</el-checkbox>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="form.freeticket" name="freeticket">免密注册</el-checkbox>
            </div>
        </div>
    </FormDlg>
</template>

<script>
import FormDlg from 'components/FormDlg.vue'
import $ from 'jquery'

export default {
    data() {
        return {
            form: this.defForm()
        }
    },
    components: {
        FormDlg
    },
    methods: {
        defForm() {
            return {
                serial: '',
                name: '',
                media_transport: 'UDP',
                media_transport_mode: 'passive',
                recv_stream_ip: '',
                contact_ip: '',
                catalog_interval: 3600,
                subscribe_interval: 600,
                password: '',
                forbidden: false,
                freeticket: false,
            }
        },
        onHide() {
            this.form = this.defForm();
            this.$emit("hide");
        },
        onShow() {
            this.errors.clear();
            this.$emit("show");
        },
        async onSubmit() {
            var ok = await this.$validator.validateAll();
            if(!ok) {
                var e = this.errors.items[0];
                this.$message({
                    type: 'error',
                    message: e.msg
                })
                $(`[name=${e.field}]`).focus();
                return;
            }
            $.get('/api/v1/device/setinfo', this.form).then(data => {
                this.$refs['dlg'].hide();
                this.$emit("submit");
            })
        },
        show(data) {
            this.errors.clear();
            if(data) {
                Object.assign(this.form, data);
            }
            if(!this.form['subscribe_interval']) {
                this.form['subscribe_interval'] = '';
            }
            this.$nextTick(() => {
                this.$refs['dlg'].show();
            })
        }
    }
}
</script>
