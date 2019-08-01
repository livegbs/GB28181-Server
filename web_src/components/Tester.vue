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
                    <el-button type="button" @click.prevent="onDoc">测试报告</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="col-md-5">
            <el-tree style="width: 100%;height:700px;overflow-y: auto;" showCheckbox :data="data" node-key="id" :props="defaultProps"></el-tree>
        </div>
        <div class="col-md-7">
            <div class="row">
                <el-table :data="testerData" height="300" style="width: 100%;" @row-click="onRowClick">
                    <el-table-column type="index" width="50"></el-table-column>
                    <el-table-column prop="TesterName" label="步骤" width="180">
                    </el-table-column>
                    <el-table-column prop="Result" label="结果" width="180">
                    </el-table-column>
                    <el-table-column prop="Detail" label="详细信息">
                    </el-table-column>
                </el-table>
            </div>
            <div class="row">
                <div class="col-md-12 card">
                    <el-tabs>
                        <el-tab-pane :label="TesterName+'服务接收信令'">
                            <el-input placeholder="点击步骤查看详情" rows="14" type="textarea" v-model="TesterIn"></el-input>
                        </el-tab-pane>
                        <el-tab-pane :label="TesterName+'服务反馈信令'">
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
            testing: false,
            serial: "",
            code: "",
            TesterName: "",
            TesterIn: "",
            TesterOut: "",
            checkIDS: [],
            testerData: [],
            data: [{
                id: 1,
                label: '注册',
                children: [{
                    id: 11,
                    label: '注册应答',
                    children: [{
                        id: 111,
                        label: '等待无鉴权注册',
                        disabled: false
                    }, {
                        id: 112,
                        label: '等待有鉴权注册',
                        disabled: false
                    }]
                }]
            }, {
                id: 2,
                label: '心跳',
                children: [{
                    id: 21,
                    label: '心跳',
                    children: [{
                        id: 211,
                        label: '等待心跳',
                        disabled: false

                    }]
                }]
            }, {
                id: 3,
                label: '设备信息查询',
                children: [{
                    id: 31,
                    label: '设备信息查询',
                    children: [{
                        id: 311,
                        label: '发送设备查询信息',
                        disabled: false

                    }, {
                        id: 312,
                        label: '等待设备查询信息',
                        disabled: false
                    }]
                }]
            }, {
                id: 4,
                label: '设备目录查询',
                children: [{
                    id: 41,
                    label: '设备目录查询',
                    children: [{
                        id: 411,
                        label: '发送设备目录查询命令',
                        disabled: false

                    }, {
                        id: 412,
                        label: '等待设备目录信息',
                        disabled: false
                    }]
                }]
            }, {
                id: 5,
                label: '设备状态查询',
                children: [{
                    id: 51,
                    label: '设备状态查询',
                    children: [{
                        id: 511,
                        label: '发送状态查询',
                        disabled: false

                    }, {
                        id: 512,
                        label: '等待状态消息',
                        disabled: false
                    }]
                }]
            }, {
                id: 6,
                label: '配置查询',
                children: [{
                    id: 61,
                    label: '国标配置查询',
                    children: [{
                        id: 611,
                        label: '国标编码配置查询',
                        disabled: false

                    }, {
                        id: 612,
                        label: '等待国标配置',
                        disabled: false
                    }]
                }, {
                    id: 62,
                    label: '视频参数范围查询',
                    children: [{
                        id: 621,
                        label: '视频参数范围查询',
                        disabled: false

                    }, {
                        id: 622,
                        label: '等待回复视频参数范围',
                        disabled: false
                    }]
                }]
            }, {
                id: 7,
                label: '手动录像',
                children: [{
                    id: 71,
                    label: '开启手动录像',
                    children: [{
                        id: 711,
                        label: '开始手动录像',
                        disabled: false

                    }, {
                        id: 712,
                        label: '等待开启成功',
                        disabled: false
                    }]
                }, {
                    id: 72,
                    label: '等待录像',
                    children: [{
                        id: 721,
                        label: '录像ing',
                        disabled: false

                    }]
                }, {
                    id: 73,
                    label: '停止手动录像',
                    children: [{
                        id: 731,
                        label: '等待停止成功',
                        disabled: false

                    }, {
                        id: 732,
                        label: '等待停止成功',
                        disabled: false
                    }]
                }]
            }, {
                id: 8,
                label: '实时视频',
                children: [{
                    id: 81,
                    label: '实时视频建立_UDP',
                    children: [{
                        id: 811,
                        label: '打开视频端口',
                        disabled: false

                    }, {
                        id: 812,
                        label: '发送实时视频请求',
                        disabled: false
                    }, {
                        id: 813,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 814,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 815,
                        label: '播放码流',
                        disabled: false
                    }, {
                        id: 816,
                        label: '停止视频请求',
                        disabled: false
                    }, {
                        id: 817,
                        label: '关闭视频端口',
                        disabled: false
                    }, {
                        id: 818,
                        label: '普通等待',
                        disabled: false
                    }]
                }, {
                    id: 82,
                    label: '实时视频建立_TCP',
                    children: [{
                        id: 821,
                        label: '打开视频端口',
                        disabled: false

                    }, {
                        id: 822,
                        label: '发送实时视频请求',
                        disabled: false
                    }, {
                        id: 823,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 824,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 825,
                        label: '播放码流',
                        disabled: false
                    }, {
                        id: 826,
                        label: '停止视频请求',
                        disabled: false
                    }, {
                        id: 827,
                        label: '关闭视频端口',
                        disabled: false
                    }, {
                        id: 828,
                        label: '普通等待',
                        disabled: false
                    }]
                }]
            }, {
                id: 9,
                label: '强制I帧',
                children: [{
                    id: 91,
                    label: '强制I帧',
                    children: [{
                        id: 911,
                        label: '打开视频端口',
                        disabled: false

                    }, {
                        id: 912,
                        label: '发送实时视频请求',
                        disabled: false
                    }, {
                        id: 913,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 914,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 915,
                        label: '播放码流',
                        disabled: false
                    }, {
                        id: 916,
                        label: '强制I帧检测',
                        disabled: false
                    }, {
                        id: 917,
                        label: '播放码流',
                        disabled: false
                    }, {
                        id: 918,
                        label: '停止视频请求',
                        disabled: false
                    }, {
                        id: 919,
                        label: '关闭视频端口',
                        disabled: false
                    }, {
                        id: 9110,
                        label: '普通等待',
                        disabled: false
                    }]
                }]
            }, {
                id: 10,
                label: '云台控制',
                children: [{
                    id: 101,
                    label: '云台控制',
                    children: [{
                        id: 1011,
                        label: '打开视频端口',
                        disabled: false

                    }, {
                        id: 1012,
                        label: '发送实时视频请求',
                        disabled: false
                    }, {
                        id: 1013,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 1014,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 1015,
                        label: '播放码流',
                        disabled: false
                    }, {
                        id: 1016,
                        label: '向左转',
                        disabled: false
                    }, {
                        id: 1017,
                        label: '停止向左转',
                        disabled: false
                    }, {
                        id: 1018,
                        label: '等待1',
                        disabled: false
                    }, {
                        id: 1019,
                        label: '向右转',
                        disabled: false
                    }, {
                        id: 10110,
                        label: '停止向右转',
                        disabled: false
                    }, {
                        id: 10111,
                        label: '等待2',
                        disabled: false
                    }, {
                        id: 10112,
                        label: '向上转',
                        disabled: false
                    }, {
                        id: 10113,
                        label: '停止向上转',
                        disabled: false
                    }, {
                        id: 10114,
                        label: '等待3',
                        disabled: false
                    }, {
                        id: 10115,
                        label: '向下转',
                        disabled: false
                    }, {
                        id: 10116,
                        label: '停止向下转',
                        disabled: false
                    }, {
                        id: 10117,
                        label: '等待4',
                        disabled: false
                    }, {
                        id: 10118,
                        label: '焦距放大',
                        disabled: false
                    }, {
                        id: 10119,
                        label: '停止放大',
                        disabled: false
                    }, {
                        id: 10120,
                        label: '等待5',
                        disabled: false
                    }, {
                        id: 10121,
                        label: '焦距缩小',
                        disabled: false
                    }, {
                        id: 10122,
                        label: '停止缩小',
                        disabled: false
                    }, {
                        id: 10123,
                        label: '停止视频请求',
                        disabled: false
                    }, {
                        id: 10124,
                        label: '关闭视频端口',
                        disabled: false
                    }]
                }]
            }, {
                id: 11,
                label: '录像查询全部',
                children: [{
                    id: 111,
                    label: '录像查询_ALL',
                    children: [{
                        id: 1111,
                        label: '查询录像(ALL)',
                        disabled: false

                    }, {
                        id: 1112,
                        label: '等待录像(ALL)',
                        disabled: false
                    }]
                }]
            }, {
                id: 12,
                label: '录像回放',
                children: [{
                    id: 121,
                    label: '录像回放_UDP',
                    children: [{
                        id: 1211,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 1212,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 1213,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 1214,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 1215,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 1216,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 1217,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 1218,
                        label: '等待录像结束消息',
                        disabled: false
                    }, {
                        id: 1219,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 12110,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }, {
                    id: 122,
                    label: '录像回放_TCP',
                    children: [{
                        id: 1221,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 1222,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 1223,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 1224,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 1225,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 1226,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 1227,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 1228,
                        label: '等待录像结束消息',
                        disabled: false
                    }, {
                        id: 1229,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 12210,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }, {
                    id: 123,
                    label: '录像慢放',
                    children: [{
                        id: 1231,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 1232,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 1233,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 1234,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 1235,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 1236,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 1237,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 1238,
                        label: '1/4速度播放',
                        disabled: false
                    }, {
                        id: 1239,
                        label: '恢复正常播放',
                        disabled: false
                    }, {
                        id: 12310,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 12311,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }, {
                    id: 124,
                    label: '录像快放',
                    children: [{
                        id: 1241,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 1242,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 1243,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 1244,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 1245,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 1246,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 1247,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 1248,
                        label: '4倍速度播放',
                        disabled: false
                    }, {
                        id: 1249,
                        label: '恢复正常播放',
                        disabled: false
                    }, {
                        id: 12410,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 12411,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }, {
                    id: 125,
                    label: '录像暂停',
                    children: [{
                        id: 1251,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 1252,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 1253,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 1254,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 1255,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 1256,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 1257,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 1258,
                        label: '录像暂停',
                        disabled: false
                    }, {
                        id: 1259,
                        label: '恢复正常播放',
                        disabled: false
                    }, {
                        id: 12510,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 12511,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }, {
                    id: 126,
                    label: '录像拖放',
                    children: [{
                        id: 1261,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 1262,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 1263,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 1264,
                        label: '发送录像播放请求',
                        disabled: false
                    }, {
                        id: 1265,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 1266,
                        label: '发送ACK',
                        disabled: false
                    }, {
                        id: 1267,
                        label: '录像回放',
                        disabled: false
                    }, {
                        id: 1268,
                        label: '录像拖动',
                        disabled: false
                    }, {
                        id: 1269,
                        label: '发送录像停止请求',
                        disabled: false
                    }, {
                        id: 12610,
                        label: '关闭媒体端口',
                        disabled: false
                    }]
                }]
            }, {
                id: 13,
                label: '录像下载',
                children: [{
                    id: 131,
                    label: '录像下载_UDP',
                    children: [{
                        id: 1311,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 1312,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 1313,
                        label: '切换到下载模式',
                        disabled: false
                    }, {
                        id: 1314,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 1315,
                        label: '发送录像下载请求',
                        disabled: false
                    }, {
                        id: 1316,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 1317,
                        label: '发送ACk',
                        disabled: false
                    }, {
                        id: 1318,
                        label: '等待录像下载',
                        disabled: false
                    }, {
                        id: 1319,
                        label: '等待录像下载结束',
                        disabled: false
                    }, {
                        id: 13110,
                        label: '停止下载',
                        disabled: false
                    }, {
                        id: 13111,
                        label: '关闭媒体端口',
                        disabled: false
                    }, {
                        id: 13112,
                        label: '切换到播放模式',
                        disabled: false
                    }]
                }, {
                    id: 132,
                    label: '录像下载_TCP',
                    children: [{
                        id: 1321,
                        label: '获取录像播放时间',
                        disabled: false

                    }, {
                        id: 1322,
                        label: '等待录像(ALL)',
                        disabled: false
                    }, {
                        id: 1323,
                        label: '切换到下载模式',
                        disabled: false
                    }, {
                        id: 1324,
                        label: '打开媒体端口',
                        disabled: false
                    }, {
                        id: 1325,
                        label: '发送录像下载请求',
                        disabled: false
                    }, {
                        id: 1326,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 1327,
                        label: '发送ACk',
                        disabled: false
                    }, {
                        id: 1328,
                        label: '等待录像下载',
                        disabled: false
                    }, {
                        id: 1329,
                        label: '等待录像下载结束',
                        disabled: false
                    }, {
                        id: 13210,
                        label: '停止下载',
                        disabled: false
                    }, {
                        id: 13211,
                        label: '关闭媒体端口',
                        disabled: false
                    }, {
                        id: 13212,
                        label: '切换到播放模式',
                        disabled: false
                    }]
                }]
            }, {
                id: 14,
                label: '对讲与广播',
                children: [{
                    id: 141,
                    label: '语音对讲',
                    children: [{
                        id: 1411,
                        label: '打开音频接收端口',
                        disabled: false
                    }, {
                        id: 1412,
                        label: '发送语音对讲请求',
                        disabled: false
                    }, {
                        id: 1413,
                        label: '等待设备回复200OK',
                        disabled: false
                    }, {
                        id: 1414,
                        label: '发送ACk',
                        disabled: false
                    }, {
                        id: 1415,
                        label: '语音对讲',
                        disabled: false
                    }, {
                        id: 1416,
                        label: '停止语音对讲',
                        disabled: false
                    }, {
                        id: 1417,
                        label: '关闭音频接收端口',
                        disabled: false
                    }, {
                        id: 1418,
                        label: '确认语音对讲功能',
                        disabled: false
                    }, {
                        id: 1419,
                        label: '普通等待',
                        disabled: false
                    }]
                }, {
                    id: 142,
                    label: '语音广播',
                    children: [{
                        id: 1421,
                        label: '打开音频发送端口',
                        disabled: false

                    }, {
                        id: 1422,
                        label: '发送语音广播通知',
                        disabled: false
                    }, {
                        id: 1423,
                        label: '等待语音广播回复',
                        disabled: false
                    }, {
                        id: 1424,
                        label: '等待语音广播请求',
                        disabled: false
                    }, {
                        id: 1425,
                        label: '等待ACK',
                        disabled: false
                    }, {
                        id: 1426,
                        label: '语音广播',
                        disabled: false
                    }, {
                        id: 1427,
                        label: '关闭语音广播',
                        disabled: false
                    }, {
                        id: 1428,
                        label: '关闭音频发送端口',
                        disabled: false
                    }, {
                        id: 1429,
                        label: '确认语音广播功能',
                        disabled: false
                    }, {
                        id: 14210,
                        label: '普通等待',
                        disabled: false
                    }]
                }]
            }, {
                id: 15,
                label: '订阅与通知',
                children: [{
                    id: 151,
                    label: '报警订阅',
                    children: [{
                        id: 1511,
                        label: '布防通道',
                        disabled: false
                    }, {
                        id: 1512,
                        label: '等待布放成功',
                        disabled: false
                    }, {
                        id: 1513,
                        label: '报警订阅',
                        disabled: false
                    }, {
                        id: 1514,
                        label: '等待报警信息',
                        disabled: false
                    }, {
                        id: 1515,
                        label: '刷新订阅',
                        disabled: false
                    }, {
                        id: 1516,
                        label: '等待报警信息',
                        disabled: false
                    }, {
                        id: 1517,
                        label: '取消订阅',
                        disabled: false
                    }, {
                        id: 1518,
                        label: '普通等待',
                        disabled: false
                    }]
                }, {
                    id: 152,
                    label: '目录订阅',
                    children: [{
                        id: 1521,
                        label: '目录订阅',
                        disabled: false

                    }, {
                        id: 1522,
                        label: '等待初始状态上报',
                        disabled: false
                    }, {
                        id: 1523,
                        label: '等待目录改变通知',
                        disabled: false
                    }, {
                        id: 1524,
                        label: '刷新订阅',
                        disabled: false
                    }, {
                        id: 1525,
                        label: '等待初始状态上报',
                        disabled: false
                    }, {
                        id: 1526,
                        label: '等待目录改变通知',
                        disabled: false
                    }, {
                        id: 1527,
                        label: '取消订阅',
                        disabled: false
                    }, {
                        id: 1528,
                        label: '普通等待',
                        disabled: false
                    }]
                }]
            }, {
                id: 16,
                label: '远程协助',
                children: [{
                    id: 161,
                    label: '远程启动',
                    isLeaf: true,
                    children: [{
                        id: 1611,
                        label: '发送重启命令'
                    }, {
                        id: 1612,
                        label: '等待注销1'
                    }, {
                        id: 1613,
                        label: '等待注销2'
                    }, {
                        id: 1614,
                        label: '等待注册并响应失败'
                    }, {
                        id: 1615,
                        label: '注册普通等待'
                    }, {
                        id: 1616,
                        label: '等待注册1'
                    }, {
                        id: 1617,
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
    methods: {
        onStart() {
            if (this.code == "" || this.serial == "") {
                this.$message({
                    type: 'error',
                    message: "设备国标编号或国标通道编号 不能为空"
                })
                return;
            }
            $.get("/api/v1/tester/status", {}).then(ret => {
                if (!ret.Testing) {
                    this.testerData = []
                    this.testing = true
                    this.testerData.push({
                        TesterName: "注册应答",
                        Result: "测试开始",
                        Detail: "等待注册应答......"
                    })
                    $.get("/api/v1/tester/start", {
                        serial: this.serial,
                        code: this.code,
                        ids: "11",
                    }).then(ret => {
                        this.testing = false;
                        console.log(ret)
                        for (var i = 0; i < ret.length; i++) {
                            this.testerData.push(ret[i]);
                        }
                    }).always(() => {
                        this.testing = false
                    });
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
                this.testerData = []
                this.$message({
                    type: 'success',
                    message: "停止成功"
                })
            });

        },
        onRefresh() {
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
</style>
