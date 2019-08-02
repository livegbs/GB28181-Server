<template>
<div>
    <div class="row report">
        <el-button type="primary" @click.prevent="printContent" >打印测试报告</el-button>
        <el-table :data="testerData" :style="tableWidth" border id="table-content">
            <el-table-column prop="Step" width="50" label="步骤"></el-table-column>
            <el-table-column prop="TesterName" label="测试对象" width="150">
            </el-table-column>
            <el-table-column prop="Result" label="结果">
                <template slot-scope="props">
                    <span class="text-success" title="单击查看详细信令报文" style="cursor:pointer;" v-if="props.row.Result =='接收成功'||props.row.Result =='响应成功'">
                        {{props.row.Result}}
                        <p style="word-wrap:break-word" v-if="props.row.TesterIn != ''"><br>{{props.row.TesterIn}}</p>
                        <p style="word-wrap:break-word" v-if="props.row.TesterOut != ''"><br>{{props.row.TesterOut}}</p>
                    </span>
                    <span style="color:red" v-else-if="props.row.Result=='失败'">{{props.row.Result}}</span>
                    <span v-else>{{props.row.Result}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="Detail" width="200" style="max-width:100px;" label="描述">
            </el-table-column>
            <el-table-column prop="Time" width="200" label="时间">
            </el-table-column>
        </el-table>
    </div>
</div>
</template>

<script>
import _ from 'lodash'
export default {
    data() {
        return {
            tableWidth: "width: 100%;word-wrap:break-word",
            testerData: [],
        }
    },
    mounted() {
        this.updateData();
    },
    methods: {
        updateData() {
            $.get("/api/v1/tester/logs", {}).then(ret => {
                this.testerData = ret;
            });
        },
        printContent() {
            this.tableWidth = "width:750px;word-wrap:break-word"
            setTimeout(function () {
                let wpt = document.getElementById('table-content');
                let newContent = wpt.innerHTML;
                let oldContent = document.body.innerHTML;
                document.body.innerHTML = newContent;
                window.print();
            }, 500)
        }
    },
};
</script>

<style lang="less" scoped>
.report {
    position: fixed;
    padding: 30px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    background-color: white;
    z-index: 100000;
}
</style>
