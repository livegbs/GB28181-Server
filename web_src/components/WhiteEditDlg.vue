<template>
<FormDlg title="编辑白名单" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()">
    <div :class="{'form-group':true,'has-error': errors.has('serial')}">
        <label class="col-sm-4 control-label">设备国标编号
            <span class="text-red">*</span>
        </label>
        <div class="col-sm-7">
            <input type="text" class="form-control" :readonly="form.oper == 'edit'" name="serial" v-model.trim="form.serial" data-vv-as="设备编号" v-validate="'required'">
        </div>
    </div>
    <div :class="{'form-group':true,'has-error': errors.has('password')}">
        <label class="col-sm-4 control-label">接入密码
        </label>
        <div class="col-sm-7">
            <input type="text" class="form-control" name="password" v-model.trim="form.password" placeholder="为空时免密接入" data-vv-as="接入密码">
        </div>
    </div>
    <div :class="{'form-group':true,'has-error': errors.has('remote_ip')}">
        <label class="col-sm-4 control-label">接入IP
        </label>
        <div class="col-sm-7">
            <input type="text" class="form-control" name="remote_ip" v-model.trim="form.remote_ip" placeholder="为空时不限接入IP" data-vv-as="接入IP">
        </div>
    </div>
    <div :class="{'form-group':true,'has-error': errors.has('remote_port')}">
        <label class="col-sm-4 control-label">接入端口
        </label>
        <div class="col-sm-7">
            <input type="text" class="form-control" name="remote_port" v-model.trim="form.remote_port" placeholder="为空时不限接入端口" v-validate="'numeric'" data-vv-as="接入端口">
        </div>
    </div>
    <div :class="{'form-group':true,'has-error': errors.has('description')}">
        <label class="col-sm-4 control-label">描述
        </label>
        <div class="col-sm-7">
            <input type="text" class="form-control" name="description" v-model.trim="form.description" data-vv-as="描述信息">
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
                oper : 'edit',
                serial: '',
                description: '',
                password: '',
                remote_ip: '',
                remote_port: '',
            }
        },
        onHide() {
            this.form = this.defForm();
            this.$emit("hide");
        },
        onShow() {
            this.errors.clear();
            this.$emit("show");
            if (!this.form.serial) {
                this.form.oper = 'add';
                this.$el.querySelector('[name=serial]').focus();
            }
        },
        async onSubmit() {
            var ok = await this.$validator.validateAll();
            if (!ok) {
                var e = this.errors.items[0];
                this.$message({
                    type: 'error',
                    message: e.msg
                })
                $(`[name=${e.field}]`).focus();
                return;
            }
            $.get('/api/v1/white/save', this.form).then(data => {
                this.$refs['dlg'].hide();
                this.$emit("submit");
            })
        },
        show(data) {
            this.errors.clear();
            if (data) {
                Object.assign(this.form, data);
                if (this.form.remote_port === 0) {
                    this.form.remote_port = '';
                }
            }
            this.$nextTick(() => {
                this.$refs['dlg'].show();
            })
        }
    }
}
</script>
