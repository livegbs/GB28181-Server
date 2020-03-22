<template>
<div class="modal fade upload-dlg" data-backdrop="static" data-keyboard="true" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title text-center text-info"><span>{{title}}</span></h4>
            </div>
            <div class="modal-body">
                <el-upload :drag="drag" :action="url" :multiple="multiple" :show-file-list="showFileList" :limit="1" :on-success="onSuccess" :on-progress="onProgress" :on-error="onError" :on-remove="onRemove" :accept="accept" :before-upload="beforeUpload" :auto-upload="autoUpload" ref="uploader">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将配置数据拖到此处，或 <em>点击上传</em></div>
                    <div class="el-upload__tip text-center" slot="tip">{{tip}}<span style="color:red"> *上传成功会自动删除原有数据，请注意导出备份*</span></div>
                </el-upload>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal" :disabled="bProgress">关闭</button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import 'jquery-ui/ui/widgets/draggable'
import $ from 'jquery'

export default {
    props: {
        title: {
            default: '上传'
        },
        url: {
            type: String,
            default: ''
        },
        multiple: {
            type: Boolean,
            default: true
        },
        drag: {
            type: Boolean,
            default: true
        },
        showFileList: {
            type: Boolean,
            default: true
        },
        accept: {
            default: '.xlsx'
        },
        tip: {
            default: '仅限上传.xlsx'
        },
        limit: {
            type: Number,
            default: 0
        },
        autoUpload: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            bShow: false,
            bProgress: false
        }
    },
    mounted() {
        $(this.$el).find('.modal-content').draggable({
            handle: '.modal-header',
            cancel: ".modal-title span",
            addClasses: false,
            containment: 'document',
            delay: 100,
            opacity: 0.5
        });
        $(this.$el).on("shown.bs.modal", () => {
            this.$emit("show");
            this.bShow = true;
        }).on("hidden.bs.modal", () => {
            this.$emit("hide");
            this.bShow = false;
            this.$refs['uploader'].clearFiles();
        }).on("hide.bs.modal", () => {
            if (this.bProgress) {
                this.$message({
                    type: 'error',
                    message: '正在上传, 请稍后...'
                });
                return false;
            }
        });
    },
    methods: {
        show() {
            $(this.$el).modal("show");
        },
        hide() {
            $(this.$el).modal("hide");
        },
        beforeUpload(file) {
            if (this.limit && file.size > this.limit) {
                this.$message({
                    type: 'error',
                    message: `文件[${file.name}]大小超过限制[${this.limit}], 不能上传!`
                })
                return false;
            }
            return true;
        },
        onSuccess(res, file, fileList) {
            for (var f of fileList) {
                if (f.percentage != 100 && f.percentage !== 0) {
                    this.bProgress = true;
                    return;
                }
            }
            this.bProgress = false;
            this.$emit('uploaded', file);
        },
        onProgress(evt, file, fileList) {
            this.bProgress = true;
        },
        onError(err, file, fileList) {
            if (err) {
                this.$message({
                    type: "error",
                    message: err + ""
                })
            }
            for (var f of fileList) {
                if (f.percentage != 100 && f.percentage !== 0) {
                    this.bProgress = true;
                    return;
                }
            }
            this.bProgress = false;
        },
        onRemove(file, fileList) {
            for (var f of fileList) {
                if (f.percentage != 100 && f.percentage !== 0) {
                    this.bProgress = true;
                    return;
                }
            }
            this.bProgress = false;
        }
    }
}
</script>

<style lang="less">
.upload-dlg {
    .modal-dialog {
        .modal-body {
            overflow: hidden;

            .el-upload {
                display: block;

                .el-upload-dragger {
                    margin: 0 auto;
                }
            }
        }
    }
}
</style>
