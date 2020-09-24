<template>
    <FormDlg title="编辑通道名称" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()">
        <div :class="{'form-group':true,'has-error': errors.has('serial')}">
            <label for="input-serial" class="col-sm-4 control-label">设备编号
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" readonly="readonly" id="input-serial" name="serial" :value="form.serial" data-vv-as="设备编号" >
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('code')}">
            <label for="input-code" class="col-sm-4 control-label">通道编号
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" readonly="readonly" id="input-code" name="code" :value="form.code" data-vv-as="通道编号">
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('name')}">
            <label for="input-name" class="col-sm-4 control-label">自定义名称
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-name" name="name" :placeholder="form.name||'-'" v-model.trim="form.customName" data-vv-as="自定义名称" @keydown.enter="onSubmit">
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
            form: this.defForm(),
        }
    },
    components: {
        FormDlg
    },
    methods: {
        defForm() {
            return {
                serial: '',
                code: '',
                name: '',
                customName: '',
            }
        },
        onHide() {
            this.form = this.defForm();
            this.$emit("hide");
        },
        onShow() {
            this.errors.clear();
            this.$emit("show");
            this.$el.querySelector('#input-name').focus()
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
            $.get('/api/v1/device/setchannelname', {
                serial: this.form.serial,
                code: this.form.code,
                name: this.form.customName,
            }).then(data => {
                this.$refs['dlg'].hide();
                this.$emit("submit");
            })
        },
        show(data) {
            this.errors.clear();
            if(data) {
                this.form.serial = data.serial;
                this.form.code = data.code;
                this.form.name = data.name;
                this.form.customName = data.customName;
                if(data.custom) {
                    this.form.customName = data.name;
                    this.form.name = '';
                }
            }
            this.$nextTick(() => {
                this.$refs['dlg'].show();
            })
        }
    }
}
</script>
