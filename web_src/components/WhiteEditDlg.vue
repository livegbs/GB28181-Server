<template>
<FormDlg title="编辑白名单" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()">
    <div :class="{'form-group':true,'has-error': errors.has('serial')}">
        <label class="col-sm-4 control-label">设备国标编号
            <span class="text-red">*</span>
        </label>
        <div class="col-sm-7">
            <input v-if="form.oper == 'edit'" type="text" class="form-control" readonly="readonly" name="serial" v-model.trim="form.serial" data-vv-as="设备编号" v-validate="'required'">
            <input v-if="form.oper == 'add'" type="text" class="form-control" name="serial" v-model.trim="form.serial" data-vv-as="设备编号" v-validate="'required'">
        </div>
    </div>
    <div :class="{'form-group':true,'has-error': errors.has('password')}">
        <label class="col-sm-4 control-label">接入密码
        </label>
        <div class="col-sm-7">
            <input type="text" class="form-control" name="password" v-model.trim="form.password" placeholder="为空时免密接入" data-vv-as="接入密码">
        </div>
    </div>
    <div :class="{'form-group':true,'has-error': errors.has('desc')}">
        <label class="col-sm-4 control-label">描述
        </label>
        <div class="col-sm-7">
            <input type="text" class="form-control" name="desc" v-model.trim="form.desc" data-vv-as="描述信息">
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
                desc: '',
                password: '',
            }
        },
        onHide() {
            this.form = this.defForm();
            this.$emit("hide");
        },
        onShow() {
            this.errors.clear();
            this.$emit("show");
            if (this.form.serial == '') {
                this.form.oper = 'add'
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
            $.post('/api/v1/white/save', this.form).then(data => {
                this.$refs['dlg'].hide();
                this.$emit("submit");
            })
        },
        show(data) {
            this.errors.clear();
            if (data) {
                Object.assign(this.form, data);
            }
            if (!this.form['subscribe_interval']) {
                this.form['subscribe_interval'] = '';
            }
            this.$nextTick(() => {
                this.$refs['dlg'].show();
            })
        }
    }
}
</script>
