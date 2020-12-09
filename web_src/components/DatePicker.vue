<template>
<input type="text" :placeholder="placeholder">
</template>

<script>
import moment from 'moment'
import 'assets/bootstrap-datepicker-1.7.1/css/bootstrap-datepicker3.css'
import 'assets/bootstrap-datepicker-1.7.1/js/bootstrap-datepicker.js'
import 'assets/bootstrap-datepicker-1.7.1/locales/bootstrap-datepicker.zh-CN.min.js'

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
        placeholder: {
            default: "选择日期"
        },
        clearBtn: {
            type: Boolean,
            default: false
        },
        day: {
            default: ""
        }
    },
    mounted() {
        $(this.$el).datepicker({
            language: "zh-CN",
            autoclose: true,
            clearBtn: this.clearBtn,
            format: "yyyy-mm-dd",
            todayHighlight: true
        }).on("changeDate", e => {
            if (!e.date) {
                this.$emit("update:day", "");
            } else {
                this.$emit("update:day", moment(e.date).format('YYYYMMDD'));
            }
        }).on("change", () => {
            if (!this.$el.value) {
                this.$emit("update:day", "");
            }
        })
        if(this.day) {
            $(this.$el).datepicker("setDate", moment(this.day, "YYYYMMDD").toDate());
        }
        this.update();
    },
    watch: {
        day: function (val) {
            if (!val) return;
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

<style lang="less">
.datepicker {
    z-index: 9999 !important;
}
</style>

