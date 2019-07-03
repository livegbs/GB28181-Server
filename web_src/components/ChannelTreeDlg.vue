<template>
    <div :class="['modal', {fade: fade}]" data-backdrop="static" data-disable="false" data-keyboard="true" tabindex="-1">
        <div :class="['modal-dialog', size]">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title text-center text-primary"><span>{{title}}</span></h4>
                </div>
                <div class="modal-body">
                    <form class="form-inline" autocomplete="off" spellcheck="false">
                        <div class="form-group form-group-sm">
                            <label>搜索</label>
                            <input type="text" class="form-control" placeholder="关键字" v-model.trim="q" @keydown.enter.prevent ref="q">
                        </div>
                    </form> 
                    <br>
                    <el-tree ref="channelTree" node-key="id" :props="treeProps" show-checkbox
                        lazy :load="getChannels" :filter-node-method="filterNode" @check-change="checkChange"
                        style="max-height:500px; overflow-y:auto;"
                    ></el-tree>
                    <div class="clearfix"></div>  
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-danger" @click.prevent="clearAll">清空</button>
                    <button type="button" class="btn btn-primary" @click.prevent="doSubmit">确定({{selection.length}})</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import 'jquery-ui/ui/widgets/draggable'
    import $ from 'jquery'
    import _ from "lodash";

    export default {
        props: {
            enctype: {
                default: ''
            },
            title: {
                default: ''
            },
            size: {
                type: String,
                default: ''
            },
            fade: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                q: "",
                loading: false,
                selection: [],
                id: '', //外部关联id
                treeProps: {
                    label: 'label',
                    isLeaf: 'isLeaf',
                    disabled: 'disabled'
                }
            }
        },
        watch: {
            q: function(newVal, oldVal) {
                this.doDelaySearch();
            }   
        },         
        computed: {
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
            }).on("hidden.bs.modal", () => {
                this.errors.clear();
                this.$emit("hide");
            })
        },
        methods: {      
            doDelaySearch: _.debounce(function() {
                this.$refs["channelTree"].filter(this.q);
            }, 500),            
            formatName(row, col, cell) {
                if (cell) return cell;
                return "-";
            },  
            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },
            checkChange(data, checked, subChecked) {
                var node = this.$refs["channelTree"].getNode(data.id);
                if(checked) {
                    while(node && node.data) {
                        var id = node.data.id;
                        var idx = this.selection.indexOf(id)
                        if(idx < 0 && id.indexOf(":") >= 0) {
                            this.selection.push(id);
                        }
                        node = node.parent;
                    }
                } else {
                    while(node && node.data) {
                        var id = node.data.id;
                        var idx = this.selection.indexOf(id);
                        if(idx >= 0 && !node.checked && !node.indeterminate) {
                            this.selection.splice(idx, 1);
                        }
                        node = node.parent;
                    }
                }
            },
            getChannels(node, resolve) {
                var data = node.data || {};
                var id = data.id||"";
                var devid = "";
                var pid = "";
                var ids = id.split(":")
                if (ids.length == 2) {
                    devid = ids[0];
                    pid = ids[1]
                } else {
                    devid = id;
                }
                this.loading = true;
                $.get("/api/v1/channel/tree", {
                    DeviceID: devid,
                    ParentID: pid
                }).then(ret => {
                    resolve(ret);
                }).fail(() => {
                    resolve([]);
                }).always(() => {
                    this.loading = false;
                })
            },     
            reset() {
                this.id = '';
                this.selection = [];
                this.$refs["channelTree"].setCheckedKeys(this.selection);
                this.q = "";           
            },
            show(id, selection) {
                this.reset();
                this.id = id;
                this.selection = selection || [];
                this.$refs["channelTree"].setCheckedKeys(this.selection);
                $(this.$el).modal("show");
            },
            hide() {
                $(this.$el).modal("hide");
                this.reset();
            },
            doSubmit() {
                this.$emit("submit", this.id, this.selection);
            },
            clearAll() {
                this.selection = [];
                this.$refs["channelTree"].setCheckedKeys(this.selection);
            }
        }
    }
</script>

<style lang="less" scoped>
    label.el-switch {
        margin-bottom: -10px;
    }

    .modal-content {
        overflow: hidden;
    }
</style>



