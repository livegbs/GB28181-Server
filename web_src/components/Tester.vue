<template>
<div>
    <div class="row">
        <div class="col-md-12">
            <el-form :inline="true">
                <el-form-item label="设备国标编号">
                    <el-input v-model="serial" placeholder="设备国标编号"></el-input>
                </el-form-item>
                <el-form-item label="国标通道编号">
                    <el-input v-model="code" placeholder="国标通道编号"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click.prevent="onStart" v-if="!testing">运行</el-button>
                    <el-button type="danger" @click.prevent="onStop" v-if="testing">停止</el-button>
                    <el-button type="button" @click.prevent="onRefresh">刷新树</el-button>
                    <el-button type="button" @click.prevent="onReport">测试报告</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="col-md-12" v-if="teserNames != ''">
            <div class="test-link">测试序列：{{teserNames}}</div>
        </div>
        <div class="col-md-5">
            <el-tree style="width: 100%;height:700px;overflow-y: auto;" ref="tree" showCheckbox :data="data" node-key="id" :props="defaultProps"></el-tree>
        </div>
        <div class="col-md-7">
            <div class="row">
                <el-table :data="testerData" height="300" style="width: 100%;" @row-click="onRowClick">
                    <el-table-column prop="Step" width="50" label="步骤"></el-table-column>
                    <el-table-column prop="TesterName" label="测试对象" width="180">
                    </el-table-column>
                    <el-table-column prop="Result" label="结果" width="150">
                        <template slot-scope="props">
                            <span class="text-success" title="单击查看详细信令报文" style="cursor:pointer;" v-if="props.row.Result =='接收成功'||props.row.Result =='响应成功'">{{props.row.Result}}</span>
                            <span style="color:red" v-else-if="props.row.Result=='失败'">{{props.row.Result}}</span>
                            <span v-else>{{props.row.Result}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="Detail" label="详细信息">
                    </el-table-column>
                    <el-table-column prop="Time" label="时间">
                    </el-table-column>
                </el-table>
            </div>
            <div class="row">
                <div class="col-md-12 card">
                    <el-tabs v-model="activeName">
                        <el-tab-pane name="in" :label="TesterName+' 信令(设备端>>>>服务端)'">
                            <el-input placeholder="点击步骤查看详情" rows="14" type="textarea" v-model="TesterIn"></el-input>
                        </el-tab-pane>
                        <el-tab-pane name="out" :label="TesterName+' 信令(服务端>>>>设备端)'">
                            <el-input placeholder="点击步骤查看详情" rows="14" class="card-content" type="textarea" v-model="TesterOut"></el-input>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import _ from 'lodash'
export default {
    data() {
        return {
            activeName: "in",
            first: true,
            index: 0,
            teserNames: "",
            testing: false,
            serial: "",
            code: "",
            TesterName: "",
            TesterIn: "",
            TesterOut: "",
            checkIDS: [],
            testerData: [],
            data: [{
                id: 101,
                label: '注册',
                children: [{
                    id: 1011,
                    label: '注册应答',
                    children: [{
                        id: 10111,
                        label: '等待无鉴权注册',
                        disabled: false
                    }, {
                        id: 10112,
                        label: '等待有鉴权注册',
                        disabled: false
                    }]
                }]
            }, {
                id: 102,
                label: '心跳',
                children: [{
                    id: 1021,
                    label: '心跳',
                    children: [{
                        id: 10211,
                        label: '等待心跳',
                        disabled: false

                    }]
                }]
            }, {
                id: 103,
                label: '设备信息查询',
                children: [{
                    id: 1031,
                    label: '设备信息查询',
                    children: [{
                        id: 10311,
                        label: '发送设备查询信息',
                        disabled: false

                    }, {
                        id: 10312,
                        label: '等待设备查询信息',
                        disabled: false
                    }]
                }]
            }, {
                id: 104,
                label: '设备目录查询',
                children: [{
                    id: 1041,
                    label: '设备目录查询',
                    children: [{
                        id: 10411,
                        label: '发送设备目录查询命令',
                        disabled: false

                    }, {
                        id: 10412,
                        label: '等待设备目录信息',
                        disabled: false
                    }]
                }]
            }, {
                id: 105,
                label: '设备状态查询',
                children: [{
                    id: 1051,
                    label: '设备状态查询',
                    children: [{
                        id: 10511,
                        label: '发送状态查询',
                        disabled: false

                    }, {
                        id: 10512,
                        label: '等待状态消息',
                        disabled: false
                    }]
                }]
            }, {
                id: 106,
                label: '配置查询',
                children: [{
                    id: 1061,
                    label: '国标配置查询',
                    children: [{
                        id: 10611,
                        label: '国标编码配置查询',
                        disabled: false

                    }, {
                        id: 10612,
                        label: '等待国标配置',
                        disabled: false
                    }]
                }, {
                    id: 1062,
                    label: '视频参数范围查询',
                    children: [{
                        id: 10621,
                        label: '视频参数范围查询',
                        disabled: false

                    }, {
                        id: 10622,
                        label: '等待回复视频参数范围',
                        disabled: false
                    }]
                }]
            }, {
                id: 107,
                label: '手动录像',
                children: [{
                        id: 1071,
                        label: '开启手动录像',
                        children: [{
                            id: 10711,
                            label: '开始手动录像',
                            disabled: false

                        }, {
                            id: 10712,
                            label: '等待开启成功',
                            disabled: false
                        }]
                    },
                    {
                        id: 1072,
                        label: '停止手动录像',
                        children: [{
                            id: 10721,
                            label: '停止手动录像',
                            disabled: false

                        }, {
                            id: 10722,
                            label: '等待停止成功',
                            disabled: false
                        }]
                    }
                ]
            }, {
                id: 108,
                label: '实时视频',
                children: [{
                    id: 1081,
                    label: '实时视频建立_UDP',
                    children: [{
                        id: 10811,
                        label: '打开视频端口',
                        disabled: false

                    }, {
                        id: 10812,
                        label: '发送实时视频请求',
                        disabled: false
                    }, {
                        id: 10813,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 10814,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 10815,
                        label: '播放码流',
                        disabled: false
                    }, {
                        id: 10816,
                        label: '停止视频请求',
                        disabled: false
                    }, {
                        id: 10817,
                        label: '关闭视频端口',
                        disabled: false
                    }, {
                        id: 10818,
                        label: '普通等待',
                        disabled: false
                    }]
                }, {
                    id: 1082,
                    label: '实时视频建立_TCP',
                    children: [{
                        id: 10821,
                        label: '打开视频端口',
                        disabled: false

                    }, {
                        id: 10822,
                        label: '发送实时视频请求',
                        disabled: false
                    }, {
                        id: 10823,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 10824,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 10825,
                        label: '播放码流',
                        disabled: false
                    }, {
                        id: 10826,
                        label: '停止视频请求',
                        disabled: false
                    }, {
                        id: 10827,
                        label: '关闭视频端口',
                        disabled: false
                    }, {
                        id: 10828,
                        label: '普通等待',
                        disabled: false
                    }]
                }]
            }, {
                id: 109,
                label: '强制I帧',
                children: [{
                    id: 1091,
                    label: '强制I帧',
                    children: [{
                        id: 10911,
                        label: '打开视频端口',
                        disabled: false

                    }, {
                        id: 10912,
                        label: '发送实时视频请求',
                        disabled: false
                    }, {
                        id: 10913,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 10914,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 10915,
                        label: '播放码流',
                        disabled: false
                    }, {
                        id: 10916,
                        label: '强制I帧检测',
                        disabled: false
                    }, {
                        id: 10917,
                        label: '播放码流',
                        disabled: false
                    }, {
                        id: 10918,
                        label: '停止视频请求',
                        disabled: false
                    }, {
                        id: 10919,
                        label: '关闭视频端口',
                        disabled: false
                    }, {
                        id: 109110,
                        label: '普通等待',
                        disabled: false
                    }]
                }]
            }, {
                id: 110,
                label: '云台控制',
                children: [{
                    id: 1101,
                    label: '云台控制',
                    children: [{
                        id: 11011,
                        label: '打开视频端口',
                        disabled: false

                    }, {
                        id: 11012,
                        label: '发送实时视频请求',
                        disabled: false
                    }, {
                        id: 11013,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 11014,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 11015,
                        label: '播放码流',
                        disabled: false
                    }, {
                        id: 11016,
                        label: '向左转',
                        disabled: false
                    }, {
                        id: 11017,
                        label: '停止向左转',
                        disabled: false
                    }, {
                        id: 11018,
                        label: '等待1',
                        disabled: false
                    }, {
                        id: 11019,
                        label: '向右转',
                        disabled: false
                    }, {
                        id: 110110,
                        label: '停止向右转',
                        disabled: false
                    }, {
                        id: 110111,
                        label: '等待2',
                        disabled: false
                    }, {
                        id: 110112,
                        label: '向上转',
                        disabled: false
                    }, {
                        id: 110113,
                        label: '停止向上转',
                        disabled: false
                    }, {
                        id: 110114,
                        label: '等待3',
                        disabled: false
                    }, {
                        id: 110115,
                        label: '向下转',
                        disabled: false
                    }, {
                        id: 110116,
                        label: '停止向下转',
                        disabled: false
                    }, {
                        id: 110117,
                        label: '等待4',
                        disabled: false
                    }, {
                        id: 110118,
                        label: '焦距放大',
                        disabled: false
                    }, {
                        id: 110119,
                        label: '停止放大',
                        disabled: false
                    }, {
                        id: 110120,
                        label: '等待5',
                        disabled: false
                    }, {
                        id: 110121,
                        label: '焦距缩小',
                        disabled: false
                    }, {
                        id: 110122,
                        label: '停止缩小',
                        disabled: false
                    }, {
                        id: 110123,
                        label: '停止视频请求',
                        disabled: false
                    }, {
                        id: 110124,
                        label: '关闭视频端口',
                        disabled: false
                    }]
                }]
            }, {
                id: 111,
                label: '录像查询全部',
                children: [{
                    id: 1111,
                    label: '录像查询_ALL',
                    children: [{
                        id: 11111,
                        label: '查询录像(ALL)',
                        disabled: false

                    }, {
                        id: 11112,
                        label: '等待录像(ALL)',
                        disabled: false
                    }]
                }]
            }, {
                id: 112,
                label: '录像回放',
                children: [{
                    id: 1121,
                    label: '录像回放_UDP',
                    children: [{
                        id: 11211,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 11212,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 11213,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 11214,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 11215,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 11216,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 11217,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 11218,
                        label: '等待录像结束消息',
                        disabled: false
                    }, {
                        id: 11219,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 112110,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }, {
                    id: 1122,
                    label: '录像回放_TCP',
                    children: [{
                        id: 11221,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 11222,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 11223,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 11224,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 11225,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 11226,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 11227,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 11228,
                        label: '等待录像结束消息',
                        disabled: false
                    }, {
                        id: 11229,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 112210,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }, {
                    id: 1123,
                    label: '录像慢放',
                    children: [{
                        id: 11231,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 11232,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 11233,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 11234,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 11235,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 11236,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 11237,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 11238,
                        label: '1/4速度播放',
                        disabled: false
                    }, {
                        id: 11239,
                        label: '恢复正常播放',
                        disabled: false
                    }, {
                        id: 112310,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 112311,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }, {
                    id: 1124,
                    label: '录像快放',
                    children: [{
                        id: 11241,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 11242,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 11243,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 11244,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 11245,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 11246,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 11247,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 11248,
                        label: '4倍速度播放',
                        disabled: false
                    }, {
                        id: 11249,
                        label: '恢复正常播放',
                        disabled: false
                    }, {
                        id: 112410,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 112411,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }, {
                    id: 1125,
                    label: '录像暂停',
                    children: [{
                        id: 11251,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 11252,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 11253,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 11254,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 11255,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 11256,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 11257,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 11258,
                        label: '录像暂停',
                        disabled: false
                    }, {
                        id: 11259,
                        label: '恢复正常播放',
                        disabled: false
                    }, {
                        id: 112510,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 112511,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }, {
                    id: 1126,
                    label: '录像拖放',
                    children: [{
                        id: 11261,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 11262,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 11263,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 11264,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 11265,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 11266,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 11267,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 11268,
                        label: '录像拖动',
                        disabled: false
                    }, {
                        id: 11269,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 112610,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }]
            }, {
                id: 113,
                label: '录像下载',
                children: [{
                    id: 1131,
                    label: '录像下载_UDP',
                    children: [{
                        id: 11311,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 11312,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 11313,
                        label: '切换到下载模式',
                        disabled: false
                    }, {
                        id: 11314,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 11315,
                        label: '发送录像下载请求',
                        disabled: false
                    }, {
                        id: 11316,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 11317,
                        label: '发送ACk',
                        disabled: false
                    }, {
                        id: 11318,
                        label: '等待录像下载',
                        disabled: false
                    }, {
                        id: 11319,
                        label: '等待录像下载结束',
                        disabled: false
                    }, {
                        id: 113110,
                        label: '停止下载',
                        disabled: false
                    }, {
                        id: 113111,
                        label: '关闭媒体端口',
                        disabled: false
                    }, {
                        id: 113112,
                        label: '切换到播放模式',
                        disabled: false
                    }]
                }, {
                    id: 1132,
                    label: '录像下载_TCP',
                    children: [{
                        id: 11321,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 11322,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 11323,
                        label: '切换到下载模式',
                        disabled: false
                    }, {
                        id: 11324,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 11325,
                        label: '发送录像下载请求',
                        disabled: false
                    }, {
                        id: 11326,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 11327,
                        label: '发送ACk',
                        disabled: false
                    }, {
                        id: 11328,
                        label: '等待录像下载',
                        disabled: false
                    }, {
                        id: 11329,
                        label: '等待录像下载结束',
                        disabled: false
                    }, {
                        id: 113210,
                        label: '停止下载',
                        disabled: false
                    }, {
                        id: 113211,
                        label: '关闭媒体端口',
                        disabled: false
                    }, {
                        id: 113212,
                        label: '切换到播放模式',
                        disabled: false
                    }]
                }]
            }, {
                id: 114,
                label: '对讲与广播',
                children: [{
                    id: 1141,
                    label: '语音对讲',
                    children: [{
                        id: 11411,
                        label: '打开音频接收端口',
                        disabled: false
                    }, {
                        id: 11412,
                        label: '发送语音对讲请求',
                        disabled: false
                    }, {
                        id: 11413,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 11414,
                        label: '发送ACk',
                        disabled: false
                    }, {
                        id: 11415,
                        label: '语音对讲',
                        disabled: false
                    }, {
                        id: 11416,
                        label: '停止语音对讲',
                        disabled: false
                    }, {
                        id: 11417,
                        label: '关闭音频接收端口',
                        disabled: false
                    }, {
                        id: 11418,
                        label: '确认语音对讲功能',
                        disabled: false
                    }, {
                        id: 11419,
                        label: '普通等待',
                        disabled: false
                    }]
                }, {
                    id: 1142,
                    label: '语音广播',
                    children: [{
                        id: 11421,
                        label: '打开音频发送端口',
                        disabled: false

                    }, {
                        id: 11422,
                        label: '发送语音广播通知',
                        disabled: false
                    }, {
                        id: 11423,
                        label: '等待语音广播回复',
                        disabled: false
                    }, {
                        id: 11424,
                        label: '等待语音广播请求',
                        disabled: false
                    }, {
                        id: 11425,
                        label: '等待ACK',
                        disabled: false
                    }, {
                        id: 11426,
                        label: '语音广播',
                        disabled: false
                    }, {
                        id: 11427,
                        label: '关闭语音广播',
                        disabled: false
                    }, {
                        id: 11428,
                        label: '关闭音频发送端口',
                        disabled: false
                    }, {
                        id: 11429,
                        label: '确认语音广播功能',
                        disabled: false
                    }, {
                        id: 114210,
                        label: '普通等待',
                        disabled: false
                    }]
                }]
            }, {
                id: 115,
                label: '订阅与通知',
                children: [{
                    id: 1151,
                    label: '报警订阅',
                    children: [{
                        id: 11511,
                        label: '布防通道',
                        disabled: false
                    }, {
                        id: 11512,
                        label: '等待布放成功',
                        disabled: false
                    }, {
                        id: 11513,
                        label: '报警订阅',
                        disabled: false
                    }, {
                        id: 11514,
                        label: '等待报警信息',
                        disabled: false
                    }, {
                        id: 11515,
                        label: '刷新订阅',
                        disabled: false
                    }, {
                        id: 11516,
                        label: '等待报警信息',
                        disabled: false
                    }, {
                        id: 11517,
                        label: '取消订阅',
                        disabled: false
                    }, {
                        id: 11518,
                        label: '普通等待',
                        disabled: false
                    }]
                }, {
                    id: 1152,
                    label: '目录订阅',
                    children: [{
                        id: 11521,
                        label: '目录订阅',
                        disabled: false

                    }, {
                        id: 11522,
                        label: '等待初始状态上报',
                        disabled: false
                    }, {
                        id: 11523,
                        label: '等待目录改变通知',
                        disabled: false
                    }, {
                        id: 11524,
                        label: '刷新订阅',
                        disabled: false
                    }, {
                        id: 11525,
                        label: '等待初始状态上报',
                        disabled: false
                    }, {
                        id: 11526,
                        label: '等待目录改变通知',
                        disabled: false
                    }, {
                        id: 11527,
                        label: '取消订阅',
                        disabled: false
                    }, {
                        id: 11528,
                        label: '普通等待',
                        disabled: false
                    }]
                }]
            }, {
                id: 116,
                label: '远程协助',
                children: [{
                    id: 1161,
                    label: '远程启动',
                    isLeaf: true,
                    children: [{
                        id: 11611,
                        label: '发送重启命令'
                    }, {
                        id: 11612,
                        label: '等待注销1'
                    }, {
                        id: 11613,
                        label: '等待注销2'
                    }, {
                        id: 11614,
                        label: '等待注册并响应失败'
                    }, {
                        id: 11615,
                        label: '注册普通等待'
                    }, {
                        id: 11616,
                        label: '等待注册1'
                    }, {
                        id: 11617,
                        label: '等待注册2'
                    }]
                }]
            }],
            defaultProps: {
                children: 'children',
                label: 'label'
            }
        };
    },
    mounted() {
        this.updateSteps();
        this.timer1 = setInterval(() => {
            this.updateSteps();
        }, 1000);
    },
    beforeDestroy() {
        if (this.timer1) {
            clearInterval(this.timer1);
            this.timer1 = 0;
        }
    },
    methods: {
        updateSteps() {
            $.get("/api/v1/tester/logs", {}).then(ret => {
                this.testerData = ret;
            });
            if (this.index % 3 == 0) {
                var tnames = ""
                $.get("/api/v1/tester/names", {}).then(ret => {
                    var names = ret.names;
                    for (var i = 0; i < names.length; i++) {
                        if (tnames == "") {
                            tnames = (i + 1) + "-" + names[i]
                        } else {
                            tnames += "->" + (i + 1) + "-" + names[i]
                        }
                    }
                    if (this.first) {
                        this.first = false
                        this.serial = ret.serial;
                        this.code = ret.code;
                        this.$refs.tree.setCheckedKeys(ret.ids);
                    }
                    this.teserNames = tnames
                });
                $.get("/api/v1/tester/status", {}).then(ret => {
                    this.testing = ret.Testing
                });
            }
            this.index++
        },
        onStart() {
            var ids = this.$refs.tree.getCheckedKeys()
            var hids = this.$refs.tree.getHalfCheckedKeys()
            for (var i = 0; i < hids.length; i++) {
                ids.push(hids[i])
            }
            if (ids.length == 0) {
                this.$message({
                    type: 'error',
                    message: "没有选中任何测试"
                })
                return;
            }
            if (this.code == "" || this.serial == "") {
                this.$message({
                    type: 'error',
                    message: "设备国标编号或国标通道编号 不能为空"
                })
                return;
            }
            this.checkIDS = ""
            for (var i = 0; i < ids.length; i++) {
                if ((ids[i] + "").length == 4) {
                    if (this.checkIDS == "") {
                        this.checkIDS = ids[i]
                    } else {
                        this.checkIDS += "," + ids[i]
                    }
                }
            }
            $.get("/api/v1/tester/status", {}).then(ret => {
                if (!ret.Testing) {
                    this.testerData = []
                    this.testing = true
                    $.get("/api/v1/tester/start", {
                        serial: this.serial,
                        code: this.code,
                        ids: this.checkIDS,
                    })
                } else {
                    this.testing = true
                    this.$message({
                        type: 'error',
                        message: "测试中请先停止"
                    })
                }

            });
        },
        onStop() {
            $.get("/api/v1/tester/stop", {}).then(ret => {
                this.testing = false;
                this.$message({
                    type: 'success',
                    message: "停止成功"
                })
            });

        },
        onRefresh() {
            this.$refs.tree.setCheckedKeys([]);
            this.checkIDS = "";
            this.$message({
                type: 'success',
                message: "刷新成功"
            })
        },
        onRowClick(row, column, event) {
            this.TesterName = row.TesterName;
            this.TesterIn = row.TesterIn;
            this.TesterOut = row.TesterOut;
            if (row.Result == '响应成功') {
                this.activeName = "out"
            } else {
                this.activeName = "in"
            }
        },
        onReport() {
            window.open('/#/testreport');
        }
    },
};
</script>

<style lang="less" scoped>
.card {
    padding-top: 12px;
    background-color: white;
    height: 400px;
    border-right-color: lightgrey;
    border-right-width: 1px;
    border-right-style: solid;
}

.test-link {
    width: 100%;
    line-height: 24px;
    padding-left: 5px;
    padding-bottom: 5px;
}
</style>
