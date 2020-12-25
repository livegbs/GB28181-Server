<template>
    <FormDlg :title="title" @hide="onHide" @show="onShow" @submit="onSubmit" ref="dlg" :disabled="errors.any()">
        <div :class="{'form-group':true,'has-error': errors.has('parentid')}">
            <label for="input-parentid" class="col-sm-4 control-label">父节点
                <!-- <span class="text-red">*</span> -->
            </label>
            <div class="col-sm-7">
                <select class="form-control" id="input-parentid" v-model.trim="form.parentid" data-vv-as="父节点" disabled="disabled">
                  <option :value="form.parentid">{{form.parentname}}</option>
                </select>
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('serial')}">
            <label for="input-serial" class="col-sm-4 control-label">设备编号
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" readonly="readonly" id="input-serial" name="serial" :value="form.serial" data-vv-as="设备编号" >
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('import_serial')}" v-if="bImport">
            <label for="input-serial" class="col-sm-4 control-label">导入设备
                <span class="text-red">*</span>
            </label>
            <div class="col-sm-7">
                <el-select filterable clearable remote :remote-method="loadDevice" :loading="bLoading" v-model="form.import_serial"
                    @change="changeDevice" @clear="clearDevice" ref="selectDevice"
                    id="input-import-serial" name="import_serial" data-vv-as="导入设备" v-validate="'required'"
                    placeholder="搜索" size="small" style="width:100%;">
                    <el-option v-for="item in devices" :key="item.ID" :label="item.Name||item.ID" :value="item.ID">
                    </el-option>
                </el-select>
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('code')}">
            <label for="input-code" class="col-sm-4 control-label">通道编号
                <span class="text-red" v-if="form.add">*</span>
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-code" name="code" v-model.trim="form.code" :placeholder="codePlaceholder" data-vv-as="通道编号" v-validate="'required|regex:^[0-9]+$'" @keydown.enter="$el.querySelector('#input-name').focus()" v-if="form.add">
                <input type="text" class="form-control" readonly="readonly" id="input-code" name="code" v-model.trim="form.code" data-vv-as="通道编号" v-else>
            </div>
        </div>
        <div :class="{'form-group':true,'has-error': errors.has('name')}">
            <label for="input-name" class="col-sm-4 control-label">节点名称
            </label>
            <div class="col-sm-7">
                <input type="text" class="form-control" id="input-name" name="name" :placeholder="form.name||form.id" v-model.trim="form.customName" data-vv-as="节点名称" @keydown.enter="onSubmit">
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
            bImport: false,
            bLoading: false,
            devices: [],
            form: this.defForm(),
        }
    },
    components: {
        FormDlg
    },
    computed: {
        title() {
            return (this.form.code || this.form.parentname == '根节点') ? "编辑节点" : "新建节点";
        },
        codePlaceholder() {
            if(!this.form.add) return "";
            if(!this.form.serial || this.form.serial.length < 10) return "20位数字";
            return `20位数字, 如: ${this.form.serial.substring(0,10)}2160000001`;
        }
    },
    methods: {
        defForm() {
            return {
                id: '',
                serial: '',
                code: '',
                name: '',
                customName: '',
                parentid: '',
                parentname: '根节点',
                add: false,
                import_serial: '',
            }
        },
        onHide() {
            this.form = this.defForm();
            this.bLoading = false;
            this.bImport = false;
            this.devices = [];
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
            $.get('/api/v1/channel/save', {
                serial: this.form.serial,
                code: this.form.code,
                name: this.form.customName,
                parentid: this.form.parentid,
                add: this.form.add,
                import_serial: this.form.import_serial,
            }).then(data => {
                this.$refs['dlg'].hide();
                this.$emit("submit");
            })
        },
        show(data) {
            this.errors.clear();
            if(data) {
                this.bImport = !!data.import;
                this.form.add = !!data.add;
                this.form.id = data.id;
                this.form.serial = data.serial;
                this.form.code = data.code;
                this.form.name = data.name;
                this.form.customName = data.customName;
                if(data.custom) {
                    this.form.customName = data.name;
                    this.form.name = '';
                }
                if(data.parent) {
                    this.form.parentid = data.parent.code;
                    this.form.parentname = data.parent.customName || data.parent.name || data.parent.id;
                }
            }
            if(this.bImport) {
                this.loadDevice();
            }
            this.$nextTick(() => {
                this.$refs['dlg'].show();
            })
        },
        loadDevice(q) {
            this.bLoading = true;
            $.get("/api/v1/device/list", {
                q: q,
                limit: 10,
            }).then(data => {
                this.devices = data.DeviceList || [];
            }).always(() => {
                this.bLoading = false;
            })
        },
        changeDevice(v) {
            if(!v) {
                this.form.code = '';
                this.form.customName = '';
                this.form.import_serial = '';
            } else {
                this.form.code = v;
                this.form.import_serial = v;
                this.$nextTick(() => {
                    this.form.customName = this.$refs['selectDevice'].selectedLabel;
                })
            }
        },
        clearDevice() {
            this.form.code = '';
            this.form.customName = '';
            this.form.import_serial = '';
            this.loadDevice();
        }
    }
}
</script>
