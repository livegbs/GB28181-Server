<template>
<input type="text" placeholder="选择日期">
</template>

<script>
import moment from 'moment'
import 'assets/bootstrap-datepicker-1.7.1/css/bootstrap-datepicker3.css'
import 'assets/bootstrap-datepicker-1.7.1/js/bootstrap-datepicker.js'
import 'assets/bootstrap-datepicker-1.7.1/locales/bootstrap-datepicker.zh-CN.min.js'

let defaultFlags = "0000000000000000000000000000000";

export default {
    data() {
        return {
            flags: {},
            defaultFlags: "0000000000000000000000000000000"
        }
    },
    props: {
        id: {
            default: ""
        },
        day: {
            default: () => moment().format("YYYYMMDD")
        }
    },
    mounted() {
        $(this.$el).datepicker({
            language: "zh-CN",
            autoclose: true,
            format: "yyyy-mm-dd",
            todayHighlight: true
        }).datepicker("setDate", moment(this.day, "YYYYMMDD").toDate()).on("changeDate", e => {
            this.$emit("update:day", moment(e.date).format('YYYYMMDD'));
        })
        this.update();
    },
    watch: {
        day: function (val) {
            let d = $(this.$el).datepicker("getDate");
            if (val != moment(d).format("YYYYMMDD")) {
                $(this.$el).datepicker("setDate", moment(val, "YYYYMMDD").toDate());
            }
        },
        id: function (val) {
            this.update();
        }
    },
    computed: {},
    methods: {
        update() {
            $(this.$el).datepicker('update');
        }
    }
}
</script>
