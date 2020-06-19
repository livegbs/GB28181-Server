<template>
    <FormDlg title="编辑用户" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()">
        <input type="hidden" name="ID" v-model.trim="form.ID">
        <div :class="{'form-group':true, 'has-error': errors.has('Username')}">
            <label for="username" class="col-sm-4 control-label">用户名
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="username" name="Username" v-model.trim="form.Username" data-vv-as="用户名" v-validate="'required'" @keydown.enter="$el.querySelector('#role').focus()">
            </div>
        </div>
        <div :class="{'form-group':true, 'has-error': errors.has('Role')}">
            <label for="role" class="col-sm-4 control-label">角色
                <!-- <span class="text-red">*</span> -->
            </label>
            <div class="col-sm-7">
                <el-select style="width:100%;" size="medium" v-model.trim="roles" multiple filterable allow-create default-first-option placeholder="请选择">
                    <el-option v-for="(item, idx) in innerRoles" :key="idx" :label="item" :value="item">
                    </el-option>
                </el-select>
                <!-- <input type="text" class="form-control" id="role" name="Role" v-model.trim="form.Role" data-vv-as="角色" @keydown.enter="onSubmit"> -->
            </div>
        </div>
        <div :class="{'form-group':true, 'has-error': errors.has('Enable')}">
            <label class="col-sm-4 control-label">其它选项
                <!-- <span class="text-red">*</span> -->
            </label>
            <div class="col-sm-7 checkbox">
                <el-checkbox style="margin-left:-19px;margin-top:-5px;" size="small" v-model.trim="form.Enable" name="Enable">启用</el-checkbox>
                &nbsp;&nbsp;
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
            innerRoles: ['管理员', '操作员', '观众'],
            roles: [],
        }
    },
    components: {
        FormDlg
    },
    methods: {
        defForm() {
            return {
                ID: "",
                Username: "",
                Role: "",
                Enable: true,
            }
        },
        onHide() {
            this.form = this.defForm();
            this.roles = [];
        },
        onShow() {
            this.errors.clear();
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
            this.form.Role = this.roles.join(",");
            $.get('/api/v1/user/save', this.form).then(data => {
                if(!this.form.ID) {
                    this.$message({
                        type: 'success',
                        duration: 15000,
                        showClose: true,
                        message: `创建用户成功, 初始密码 ${data.DefaultUserPassword}`,
                    })
                } else {
                    this.$message({
                        type: 'success',
                        message: `编辑用户成功`,
                    })
                }
                this.$refs['dlg'].hide();
                this.$emit("submit");
            })
        },
        show(data) {
            this.errors.clear();
            if(data) {
                Object.assign(this.form, data);
            }
            if(this.form.Role) {
                this.roles = this.form.Role.split(",");
            }
            this.$nextTick(() => {
                this.$refs['dlg'].show();
            })
        }
    }
}
</script>

