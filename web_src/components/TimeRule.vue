<template>
<div class="time-rule">
    <div class="time-day" ref="day" :style="{ left: timeDayX + 'px'}">
        <div :class="['time-minute', minuteActiveClass((n - 1)*minutesPerUnit)]" :style="{width: minutesPerUnit + 'px'}" :title="minuteTitle((n - 1)*minutesPerUnit)"
            v-for="n in (1440/minutesPerUnit)" :key="n" @click.prevent="clickMinute((n-1)*minutesPerUnit)"></div>
        <div :class="[ n==1 ? 'time-text-first' : 'time-text']" v-for="n in 24" :key="n">{{hourText(n - 1)}}</div>
    </div>
    <div class="time-cursor" :style="{ left: timeCursorX + 'px'}" ref="cursor">
        <div class="time-cursor-text">{{timeCursorText}}</div>
    </div>
</div>
</template>

<script>
import moment from 'moment'

export default {
    data() {
        return {
            timeCursorX: 0,
            timeDayX: 0,
            bMoving: false
        }
    },
    props: {
        minutesPerUnit: {
            default: 5,
            type: Number
        },
        videos: {
            default: () => []
        }
    },
    mounted() {
        let cursor = this.$refs.cursor;
        let day = this.$refs.day;
        let rule = this.$el;
        let _this = this;

        function moveCursor(e) {
            let originPageX = $(cursor).data("originPageX");
            let dx = e.pageX - originPageX;
            _this.timeCursorX = $(cursor).position().left + dx;
            $(cursor).data("originPageX", e.pageX);
        }

        function touchMoveCursor(e) {
            let touch = e.originalEvent.targetTouches[0];
            let originPageX = $(cursor).data("originPageX");
            let dx = touch.pageX - originPageX;
            _this.timeCursorX = $(cursor).position().left + dx;
            $(cursor).data("originPageX", touch.pageX);
        }

        function moveDay(e) {
            let originPageX = $(day).data("originPageX");
            let dx = e.pageX - originPageX;
            _this.timeDayX = $(day).position().left + dx;
            $(day).data("originPageX", e.pageX);
        }

        function touchMoveDay(e) {
            let touch = e.originalEvent.targetTouches[0];
            let originPageX = $(day).data("originPageX");
            let dx = touch.pageX - originPageX;
            _this.timeDayX = $(day).position().left + dx;
            $(day).data("originPageX", touch.pageX);
        }
        $(cursor).on("mousedown", function (e) {
            $(cursor).data("originPageX", e.pageX);
            _this.bMoving = true;
            $(document).on("mousemove", moveCursor).one("mouseup", function (e) {
                $(document).off("mousemove", moveCursor);
                $(cursor).removeData("originPageX");
                _this.triggerTimeChange();
                _this.bMoving = false;
            })
        }).on("touchstart", function (e) {
            let touch = e.originalEvent.targetTouches[0];
            $(cursor).data("originPageX", touch.pageX);
            _this.bMoving = true;
            $(document).on("touchmove", touchMoveCursor).one("touchend", function (e) {
                $(document).off("touchmove", touchMoveCursor);
                $(cursor).removeData("originPageX");
                _this.triggerTimeChange();
                _this.bMoving = false;
            })
        })

        $(day).on("mousedown", function (e) {
            if($(e.target).hasClass("time-minute")){
                return false;
            }
            $(day).data("originPageX", e.pageX);
            _this.bMoving = true;
            $(document).on("mousemove", moveDay).one("mouseup", function (e) {
                $(document).off("mousemove", moveDay);
                $(day).removeData("originPageX");
                _this.triggerTimeChange();
                _this.bMoving = false;
            })
        }).on("touchstart", function (e) {
            if($(e.target).hasClass("time-minute")){
                return false;
            }
            let touch = e.originalEvent.targetTouches[0];
            $(day).data("originPageX", touch.pageX);
            _this.bMoving = true;
            $(document).on("touchmove", touchMoveDay).one("touchend", function (e) {
                $(document).off("touchmove", touchMoveDay);
                $(day).removeData("originPageX");
                _this.triggerTimeChange();
                _this.bMoving = false;
            })
        })
    },
    watch: {
        videos: function (val) {
            this.triggerTimeChange();
        }
    },
    methods: {
        hourText(n) {
            let h = moment().hour(n).minute(0).second(0);
            return h.format("HH:mm");
        },
        minuteActiveClass(n) {
            let m = moment().hour(0).minute(n);
            let mtext = m.format("HH:mm");
            return Object.keys(this.activeMinutes).indexOf(mtext) >= 0 ? "active" : "";
        },
        minuteTitle(n) {
            let m = moment().hour(0).minute(n);
            let mtext = m.format("HH:mm");
            return Object.keys(this.activeMinutes).indexOf(mtext) >= 0 ? mtext : "";
        },
        clickMinute(n, bTrigger = true) {
            if (this.bMoving) return;
            this.timeCursorX = n + this.timeDayX;
            if (bTrigger) {
                this.triggerTimeChange();
            }
        },
        triggerTimeChange() {
            this.$emit("timeChange", this.activeMinutes[this.timeCursorText]);
        }
    },
    computed: {
        timeCursorText() {
            if (this.timeCursorX >= $(this.$el).innerWidth()) {
                this.timeCursorX = $(this.$el).innerWidth() - 1;
            }
            if (this.timeCursorX < 0) {
                this.timeCursorX = 0;
            }
            if (this.timeDayX < $(this.$el).innerWidth() - $(this.$refs.day).outerWidth()) {
                this.timeDayX = $(this.$el).innerWidth() - $(this.$refs.day).outerWidth();
            }
            if (this.timeDayX > 0) {
                this.timeDayX = 0;
            }
            if (this.timeCursorX - this.timeDayX >= 1440) {
                this.timeDayX = $(this.$el).innerWidth() - $(this.$refs.day).outerWidth();
                this.timeCursorX = $(this.$el).innerWidth() - 1;
            }
            var mx = parseInt((this.timeCursorX - this.timeDayX)/this.minutesPerUnit) * this.minutesPerUnit;
            var m = moment().hour(0).minute(mx);
            return m.format("HH:mm");
        },
        activeMinutes() {
            var minutes = {};
            for (var video of this.videos) {
                var start = moment(video.StartTime, "YYYY-MM-DDTHH:mm:ss");
                var end = moment(video.EndTime, "YYYY-MM-DDTHH:mm:ss");
                if(!start.isSame(end, "day")) { // 跨天
                    if(start.hours() > 12) {
                        start = moment(end).startOf("day");
                    } else {
                        end = moment(start).endOf("day");
                    }
                }
                var _start = moment(start).startOf("hour");
                for(var i=0;;i+=5) {
                    var c = moment(_start).add(i, "minute");
                    if(c.isBefore(start, "minute")) {
                        continue;
                    }
                    if(c.isAfter(end, "minute")) {
                        break;
                    }
                    var mtext = c.format("HH:mm");
                    minutes[mtext] = Object.assign({}, video, {
                        StartTime: c.format("YYYY-MM-DDTHH:mm:ss")
                    });
                }
            }
            return minutes;
        }
    }
}
</script>

<style lang="less" scoped>
@import url(~assets/styles/variables.less);

.time-rule {
    overflow: hidden;
    position: relative;
    height: 50px;
    margin: 0 auto;
    width: 100%;
    font-size: 12px;
    max-width: 1440px;
    background-color: #CCC;
}

.time-day {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 1440px;
    cursor: pointer;
    -ms-user-select: none;
    user-select: none;
}

.time-minute {
    float: left;
    height: 8px;
    margin: 0;
    cursor: default;
}

.time-minute.active {
    background-color: @base-active;
    cursor: pointer;
}

.time-text {
    float: left;
    width: 60px;
    border-left: 1px solid #999;
    border-top: 1px solid #999;
    -ms-user-select: none;
    user-select: none;
    text-align: center;
    height: 25px;
    line-height: 25px;
}

.time-text-first {
    .time-text;
    border-left: 0;
}

.time-cursor {
    position: absolute;
    left: 0;
    top: 0;
    height: 30px;
    width: 2px;
    background-color: red;
    text-align: center;
}

.time-cursor-text {
    position: absolute;
    padding: 0 5px;
    width: 60px;
    left: -30px;
    top: 30px;
    border: 1px solid red;
    height: 15px;
    line-height: 15px;
    cursor: move;
    background-color: white;
    -ms-user-select: none;
    user-select: none;
}
</style>
