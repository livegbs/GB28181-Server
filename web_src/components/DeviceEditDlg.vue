<template>
    <FormDlg title="编辑设备" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()">
        <div :class="{'form-group':true, 'has-feedback':true,'has-error': errors.has('serial')}">
            <label for="input-serial" class="col-sm-4 control-label">设备编号
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" readonly="readonly" id="input-serial" name="serial" v-model.trim="form.serial" autocomplete="new-password" data-vv-as="设备编号" v-validate="'required'">
            </div>
        </div>
        <div :class="{'form-group':true, 'has-feedback':true,'has-error': errors.has('name')}">
            <label for="input-name" class="col-sm-4 control-label">设备名称
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-name" v-model.trim="form.name" autocomplete="new-password" @keydown.enter="$el.querySelector('#input-recv-stream-ip').focus()">
            </div>
        </div>
        <div :class="{'form-group':true, 'has-feedback':true,'has-error': errors.has('recv_stream_ip')}">
            <label for="input-recv-stream-ip" class="col-sm-4 control-label">收流 IP
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" name="recv_stream_ip" id="input-recv-stream-ip" v-model="form.recv_stream_ip" placeholder="默认使用 sms.ini sip host" autocomplete="new-password" @keydown.enter="$el.querySelector('#input-catalog-interval').focus()">
            </div>
        </div>
        <div :class="{'form-group':true, 'has-feedback':true,'has-error': errors.has('catalog_interval')}">
            <label for="input-catalog-interval" class="col-sm-4 control-label">通道更新周期(秒)
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" name="catalog_interval" id="input-catalog-interval" v-model="form.catalog_interval" placeholder="300" autocomplete="new-password" @keydown.enter="onSubmit">
            </div>
        </div>
        <div :class="{'form-group':true, 'has-feedback':true,'has-error': errors.has('media_transport')}">
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
                catalog_interval: 300,
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
            this.$nextTick(() => {
                this.$refs['dlg'].show();
            })
        }
    }
}
</script>
