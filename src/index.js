const {
    getConfigs,
    checkConfigs,
    makeHeader,
    ListNotification,
    AckNotification,
    Wallet,
    SendLog,
    AppVersion,
    getGlobalConfig,
    SendResult,
} = require("./config");

const { log, addLogContent, getLogs, sleep } = require("./util");

const nodemailer = require("nodemailer");

(async () => {
    log.info("开始获取全局配置");
    var globalConfig = getGlobalConfig();
    log.info("获取成功");
    if (globalConfig.sendMail == true) {
        log.info("组装邮件发射器");
        var transporter = nodemailer.createTransport({
            host: globalConfig.mailConfig.smtpServer,
            port: globalConfig.mailConfig.smtpPort,
            secure: globalConfig.mailConfig.smtpSecure,
            auth: {
                user: globalConfig.mailConfig.user,
                pass: globalConfig.mailConfig.pass,
            },
        });
    }
    var minDelay = globalConfig.minDelay;
    var maxDelay = globalConfig.maxDelay;
    var configs = getConfigs();
    log.info(`正在检测配置有效性`);
    checkConfigs(configs);
    log.info("检测完毕！");
    log.info("正在获取版本号");
    var appversion = await AppVersion();
    appversion = appversion.data.package_version;
    log.info(`获取成功！当前版本号：${appversion}`);
    var successNum = 0,
        totalNum = 0;
    for (key in configs) {
        totalNum++;
        log.info(`正在执行配置 ${key}`);
        log.info("尝试签到……");
        var header = makeHeader(configs[key], appversion);
        var WalletRespond = await Wallet(header);
        addLogContent(
            `<span style="color: orange; font-weight: bold">${key} Wallet返回体</span> <br> <span style="color: orange">${JSON.stringify(
                WalletRespond
            )}</span><br>`
        );
        if (WalletRespond.data != null) {
            var NotificationRespond = await ListNotification(header);
            addLogContent(
                `<span style="color: orange; font-weight: bold">${key} Notification返回体</span> <br> <span style="color: orange">${JSON.stringify(
                    NotificationRespond
                )}</span><br>`
            );
            successNum++;
            log.info(
                `签到完毕! 获得时长：${WalletRespond.data.free_time.send_freetime}分钟，总时长:${WalletRespond.data.free_time.free_time}分钟`
            );
            if (configs[key].email != null) {
                SendResult(
                    transporter,
                    globalConfig.mailConfig.user,
                    configs[key].email,
                    `签到完毕! 获得时长：${WalletRespond.data.free_time.send_freetime}分钟，总时长:${WalletRespond.data.free_time.free_time}分钟`
                );
            }
            let NotificationLength = NotificationRespond.data.list.length;
            let postHeader = header;
            Object.assign(postHeader, {
                "Content-Length": 28,
                "Content-Type": "application/json",
            });
            for (var i = 0; i < NotificationLength; i++) {
                AckNotification(
                    postHeader,
                    NotificationRespond.data.list[i].id
                );
            }
        } else {
            log.error("签到失败");
            if (configs[key].email != null) {
                SendResult(
                    transporter,
                    globalConfig.mailConfig.user,
                    configs[key].email,
                    "签到失败"
                );
            }
        }
        var delay = Math.round(
            Math.random() * (maxDelay - minDelay) + minDelay
        );
        log.info(`暂停：${delay}毫秒`);
        await sleep(delay);
    }

    if (globalConfig.sendMail == true) {
        log.info(`运行完毕！丢出日志`);
        SendLog(
            transporter,
            globalConfig.mailConfig.user,
            globalConfig.mailConfig.mailto,
            successNum,
            totalNum,
            getLogs()
        );
    }
})();
