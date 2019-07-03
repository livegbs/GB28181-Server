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
                        <span class="hidden-xs">&nbsp;&nbsp;</span>
                        <div class="form-group form-group-sm">
                            <label>通道类型</label>
                            <select class="form-control" v-model.trim="channel_type">
                            <option value="">全部</option>
                            <option value="device">设备</option>
                            <option value="dir">子目录</option>
                            </select>
                        </div>
                        <span class="hidden-xs">&nbsp;&nbsp;</span>
                        <div class="form-group form-group-sm">
                            <div class="checkbox">
                                <el-checkbox style="margin-top:-5px;padding-left:0;" size="small" v-model.trim="related" name="Enable">只看已选</el-checkbox>
                            </div>
                        </div>
                    </form>
                    <br>
                    <el-table :data="channels" stripe @sort-change="sortChange" @select="select" @select-all="selectAll" :max-height="500"
                        ref="channelTable" v-loading="loading" element-loading-text="加载中...">
                        <el-table-column type="selection" width="55" fixed></el-table-column>
                        <el-table-column prop="DeviceID" label="设备国标编号" min-width="200" show-overflow-tooltip sortable="custom"></el-table-column>
                        <el-table-column prop="ID" label="通道国标编号" min-width="200" show-overflow-tooltip sortable="custom"></el-table-column>
                        <el-table-column prop="Name" label="通道名称" min-width="120" :formatter="formatName" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="Status" label="在线状态" min-width="100">
                            <template slot-scope="props">
                            <span v-if="props.row.SubCount > 0">-</span>
                            <span v-else-if="props.row.Status == 'ON'" class="text-success">在线</span>
                            <span v-else>离线</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="SubCount" label="子节点数" min-width="100" sortable="custom"></el-table-column>
                        <el-table-column prop="Manufacturer" label="厂家" min-width="120" :formatter="formatName" show-overflow-tooltip></el-table-column>
                    </el-table>
                    <el-pagination v-if="total > 0" layout="total,prev,pager,next,sizes" :pager-count="5" class="pull-right" :total="total" :page-size.sync="pageSize" :current-page.sync="currentPage"></el-pagination>
                    <div class="clearfix"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal">确定({{relateCnt}})</button>
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
                channel_type: "",
                total: 0,
                relateCnt: 0,
                pageSize: 10,
                currentPage: 1,
                sort: "",
                order: "",
                related: false,
                loading: false,
                channels: [],
                selection: [],
                id: '', //外部关联id
            }
        },
        watch: {
            q: function(newVal, oldVal) {
                this.doDelaySearch();
            },
            channel_type: function(newVal, oldVal) {
                this.doSearch();
            },
            related: function(newVal, oldVal) {
                this.doSearch();
            },
            currentPage: function(newVal, oldVal) {
                this.doSearch(newVal);
            },
            pageSize: function(newVal, oldVal) {
                this.doSearch();
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
            }).on("hidden.bs.modal", () => {
                this.errors.clear();
                this.reset();
                this.$emit("hide");
            })
        },
        methods: {
            sortChange(data) {
                this.sort = data.prop;
                this.order = data.order == "ascending" ? "asc" : "desc";
                this.getChannels();
            },
            select(selection, row) {
                var idx = selection.indexOf(row);
                if(idx >= 0) {
                    $.get("/api/v1/cascade/savechannels", {
                        id: this.id,
                        channels: [`${row.DeviceID}:${row.ID}`]
                    })
                } else {
                    $.get("/api/v1/cascade/removechannels", {
                        id: this.id,
                        channels: [`${row.DeviceID}:${row.ID}`]
                    })
                }
                this.getChannels();
            },
            selectAll(selection) {
                var keys = [];
                if(selection.length) {
                    for(var row of selection) {
                        var idx = this.selection.indexOf(row);
                        if(idx < 0) {
                            keys.push(`${row.DeviceID}:${row.ID}`)
                        }
                    }
                    $.get("/api/v1/cascade/savechannels", {
                        id: this.id,
                        channels: keys,
                    })
                } else {
                    for(var row of this.selection) {
                        keys.push(`${row.DeviceID}:${row.ID}`)
                    }
                    $.get("/api/v1/cascade/removechannels", {
                        id: this.id,
                        channels: keys,
                    })
                }
                this.getChannels();
            },
            doSearch(page = 1) {
                this.currentPage = page;
                this.getChannels();
            },
            doDelaySearch: _.debounce(function() {
                this.doSearch();
            }, 500),
            formatName(row, col, cell) {
                if (cell) return cell;
                return "-";
            },
            getChannels() {
                if(!this.id) return;
                this.loading = true;
                $.get("/api/v1/cascade/channellist", {
                    id: this.id,
                    q: this.q,
                    start: (this.currentPage -1) * this.pageSize,
                    limit: this.pageSize,
                    channel_type: this.channel_type,
                    related: this.related,
                    sort: this.sort,
                    order: this.order
                }).then(ret => {
                    this.$refs["channelTable"].clearSelection();
                    this.total = ret.ChannelCount;
                    this.relateCnt = ret.ChannelRelateCount;
                    this.channels = ret.ChannelList || [];
                    this.selection = [];
                    this.$nextTick(() => {
                        this.channels.forEach(row => {
                            var sel = row.CascadeID != "";
                            this.$refs["channelTable"].toggleRowSelection(row, sel);
                            if(sel) {
                                this.selection.push(row);
                            }
                        })
                    })
                }).always(() => {
                    this.loading = false;
                });
            },
            reset() {
                this.id = '';
                this.$refs["channelTable"].clearSelection();
                this.channels = [];
                this.selection = [];
                this.q = "";
                this.channel_type = "";
                this.currentPage = 1;
                this.pageSize = 10;
            },
            show(id) {
                this.id = id;
                $(this.$el).modal("show");
                this.getChannels();
            },
            hide() {
                $(this.$el).modal("hide");
            }
        }
    }
</script>

<style lang="less" scoped>
    label.el-switch {
        margin-bottom: -10px;
    }
</style>



