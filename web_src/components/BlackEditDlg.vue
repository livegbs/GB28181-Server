<template>
<FormDlg title="编辑黑名单" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()">
    <div :class="{'form-group':true,'has-error': errors.has('serial')}">
        <label class="col-sm-4 control-label">设备国标编号
            <span class="text-red">*</span>
        </label>
        <div class="col-sm-7">
            <input type="text" class="form-control" :readonly="form.oper == 'edit'" name="serial" v-model.trim="form.serial" data-vv-as="设备编号" v-validate="'required'">
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
            $.get('/api/v1/black/save', this.form).then(data => {
                this.$refs['dlg'].hide();
                this.$emit("submit");
            })
        },
        show(data) {
            this.errors.clear();
            if (data) {
                Object.assign(this.form, data);
            }
            this.$nextTick(() => {
                this.$refs['dlg'].show();
            })
        }
    }
}
</script>
