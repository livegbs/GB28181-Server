#  下载地址
[**https://www.liveqing.com/docs/download/LiveGBS.html**](https://www.liveqing.com/docs/download/LiveGBS.html)

# LiveGBS GB28181 国标方案安装使用说明

## 服务资源

  [试用安装包下载](https://www.liveqing.com/docs/download/LiveGBS.html) | [在线演示](http://gbs.liveqing.com) | [在线API](http://gbs.liveqing.com/apidoc) | QQ交流群：[947137753](https://jq.qq.com/?_wv=1027&k=51AHErq)

## 服务架构

![LiveGBS架构图](http://www.liveqing.com/images/gbs/架构图.jpg)

## 服务说明

### 安装包
- Windows平台使用的安装包：

        LiveCMS-windows-***.zip
        LiveSMS-windows-***.zip

- Linux平台使用的安装包：

        LiveCMS-linux-***.tar.gz
        LiveSMS-linux-***.tar.gz

### 信令服务

- LiveCMS

    SIP 中心信令服务, 单节点, 自带一个 Redis Server, 随 LiveCMS 自启动, 不需要手动运行

- LiveCMS端口使用

	TCP 端口 : 5060(SIP), 10000(HTTP), 26379(Redis)

	UDP 端口 : 5060(SIP)

### 流媒体服务

- LiveSMS

 	SIP 流媒体服务, 根据需要可部署多套

- LiveSMS端口使用

	TCP 端口 : 5070(SIP), 10001(HTTP), 11935(RTMP Live), 30000-40000(RTP over TCP)

	UDP 端口 : 5070(SIP), 50000-60000(RTP/RTCP over UDP)


	*端口区间说明*
   - 如果不走TCP 传输, TCP区间端口可以不开放
   - 如果不走UDP 传输, UDP区间端口可以不开放
   - TCP 区间大小 = 最大并发数(包括直播和回放) ，可以手动修改端口区间
   - UDP 区间大小 = 最大并发数(包括直播和回放)*2 ，可以手动修改端口区间


### 配置信令服务(LiveCMS)

  	服务名称：LiveCMS

  	配置文件：livecms.ini

  	所在位置：LiveCMS-windows-***.zip, LiveCMS-linux-***.tar.gz

- [sip] -> host

    SIP 中心信令服务器 IP

- [sip] -> serial

    SIP 中心信令服务器 ID

- [sip] -> realm

    SIP 中心信令服务器 Realm

- [sip] -> device_password

    设备接入统一密码


### 配置流媒体服务(LiveSMS)

 	 服务名称：LiveSMS

 	 配置文件：livesms.ini

 	 所在位置：LiveSMS-windows-***.zip, LiveSMS-linux-***.tar.gz

- [sip] -> host

    SIP 流媒体服务器 IP

- [sip] -> serial

    SIP 流媒体服务器 ID

- [sip] -> realm

    SIP 流媒体服务器 Realm

- [sip] -> wan_ip (可选配置)

    SIP 流媒体服务器公网 IP

- [sip] -> use_wan_ip_recv_stream (可选配置)

    可选配置0/1, 指示流媒体服务器使用公网 IP 接收国标下级流数据

- [rtp] -> udp_port_range

    RTP over UDP 端口

- [rtp] -> tcp_port_range

    RTP over TCP 端口

## 服务运行


### Warning 注意

> 安装包所在路径不要包含 **中文**, 先运行 LiveCMS, 再运行 LiveSMS


### Windows

直接运行

信令服务（LiveCMS）

- 启动: 解压目录中，直接双击 LiveCMS.exe

- 停止：以 `Ctrl + C` 停止服务, 不可以直接叉控制台窗口, 否则服务停不干净

流媒体服务（LiveSMS）

- 启动: 解压目录中，直接双击 LiveSMS.exe

- 停止：以 `Ctrl + C` 停止服务, 不可以直接叉控制台窗口, 否则服务停不干净

以服务启动

信令服务（LiveCMS）

- 安装: 解压目录中，直接双击 ServiceInstall-LiveCMS.exe

- 卸载: 以 ServiceUninstall-LiveCMS.exe 卸载 CMS 服务

流媒体服务（LiveSMS）

- 安装: 解压目录中，直接双击 ServiceInstall-LiveSMS.exe

- 卸载: 以 ServiceUninstall-LiveSMS.exe 卸载 SMS 服务

### Linux

直接运行

信令服务（LiveCMS）

```
cd LiveCMS
# 启动：./livecms
# 停止： Ctrl + C
```

流媒体服务（LiveSMS）

```
cd LiveSMS
# 启动：./livesms
# 停止：Ctrl + C
```

以服务启动

信令服务（LiveCMS）

```
cd LiveCMS
# 启动：./start.sh
# 停止：./stop.sh
```

流媒体服务（LiveSMS）

```
cd LiveSMS
# 启动：./start.sh
# 停止：./stop.sh
```


## 配置设备接入

下面是海康、大华和宇视 IPC 中, GB28181 平台接入配置的截图, 供参考

### 海康GB28181接入示例

![海康GB28181接入示例](https://www.liveqing.com/images/gbs/%E6%B5%B7%E5%BA%B7%E6%8E%A5%E5%85%A5.jpg)

### 大华GB28181接入示例

![大华GB28181接入示例](https://www.liveqing.com/images/gbs/%E5%A4%A7%E5%8D%8E%E6%8E%A5%E5%85%A5.jpg)

### 宇视4G GB28181接入示例

![宇视4G GB28181接入示例](https://www.liveqing.com/images/gbs/%E5%AE%87%E8%A7%86%E6%8E%A5%E5%85%A501.jpg)

![宇视4G GB28181接入示例](https://www.liveqing.com/images/gbs/%E5%AE%87%E8%A7%86%E6%8E%A5%E5%85%A502.jpg)


## 平台使用

### 管理平台

http://localhost:10000

### 接口文档
http://localhost:10000/apidoc

### 使用分享页

为方便客户在网页中集成播放功能, 我们单独提供了可供 HTML iframe 集成的分享页, 形如:

`http://ip:10000/play.html?serial=34020000001110000001&code=34020000001320000001`

其中 URL 参数:

- serial 设备国标编号

- code 通道国标编号

- share 是否显示分享, 可选, yes/no, 默认值为 yes

- ptz 是否显示云台控制, 可选, yes/no, 默认值为 yes

- iframe 是否仅显示视频播放区域, 可选, yes/no, 默认值为 no

- aspect 视频播放区域的宽高比, 可选, wxh, 默认为 640x360, 即16:9, 当 aspect=fullscreen 时整页显示播放器

- fluent 是否以流畅模式播放, 可选, yes/no, 默认值为 yes

- autoplay 是否自动播放, 可选, yes/no, 默认值为 yes

- stretch 是否拉伸显示, 可选, yes/no, 默认值为 no

- protocol 播放流格式, 可选, rtmp/hls/flv, 默认 auto check

### 网页播放器

除了 iframe 方式集成播放器, 也可以使用 LivePlayer 网页播放器来二次开发

LivePlayer 网页播放器下载和使用文档, 参阅链接:

https://www.npmjs.com/package/@liveqing/liveplayer

## 统一编码规则

关于设备ID, 通道ID, 以下是国标协议文档中关于 **统一编码规则** 的截取

![统一编码规则1](https://upload-images.jianshu.io/upload_images/15249405-5646d18156a76d62.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![统一编码规则2](https://upload-images.jianshu.io/upload_images/15249405-f093244bc2ca159d.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![统一编码规则3](https://upload-images.jianshu.io/upload_images/15249405-653798fdc7c79b19.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 常见问题

* LiveCMS 和 LiveSMS都部署起来后，浏览器输入ip:10000端口打不开LiveCMS的页面。首先确认TCP 10000和10001端口是否开放。确认已经开放后，这种情况一般是LiveCMS的10000端口被其他程序占用了导致。可以先卸载LiveCMS，打开livecms.ini文件，把http端口从10000改成100002或其他端口，再重新安装LiveCMS。

* 网页打开后，设备无法注册上来，需要检测UDP 5060端口是否开放。

* 修改服务IP时，需要同时修改LiveCMS和LiveSMS配置页面里面的IP，不能只修改LiveCMS，否则可能会出现设备在线但是无法播放的问题。

* 播放视频时概率性出现timeout或者花屏、卡顿等问题时，一般是由于设备端视频向服务端传输时网络跟不上导致，可以在设备端的配置页面，把视频的码率降低。一般公网播放的话建议码率设置到256-1024kbps之间。如果码率太高，设备端上行带宽很可能跟不上。

* 如果LiveCMS、LiveSMS部署都正常，IP设置也正确。但是播放视频时总是提示“media server not found”。这种问题首先需要排查服务器端TCP 30000-40000 UDP 50000-60000端口是否开放。如果端口已经都开放，可能的问题是配置的公网IP，但是本机的LiveCMS没法直接通过这个公网IP访问自己的LiveSMS。这种情况比较少，如果遇到的话，需要先卸载LiveSMS服务，然后修改livesms.ini文件，将[sip]段落下的host改为127.0.0.1，wan_ip设置成之前的公网ip，然后use_wan_ip_recv_stream=1，再重新安装LiveSMS。


## 获取更多信息

安防流媒体互联直播-QQ交流群：[615081503](https://jq.qq.com/?_wv=1027&k=5pdZ4ab)

LiveGBS-QQ交流群：[947137753](https://jq.qq.com/?_wv=1027&k=5UDV5Pt)

联系方式：151-5689-6292（同微信）

WEB：[www.liveqing.com](http://www.liveqing.com/)

Copyright &copy; LiveQing.com 2016-2019
