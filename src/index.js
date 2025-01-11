const {
    checkConfigs,
    hk4e_getConfigs,
    hk4e_makeHeader,
    hk4e_ListNotification,
    hk4e_AckNotification,
    hk4e_Wallet,
    hk4e_AppVersion,
    nap_getConfigs,
    nap_makeHeader,
    nap_ListNotification,
    nap_AckNotification,
    nap_Wallet,
    nap_AppVersion,
    SendLog,
    getGlobalConfig,
    SendResult,
} = require("./config");

const { log, addLogContent, getLogs, sleep } = require("./util");

const nodemailer = require("nodemailer");

(async () => {
    log.info("开始获取全局配置");
    var globalConfig = getGlobalConfig();
    log.info("获取成功");
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
    var minDelay = globalConfig.minDelay;
    var maxDelay = globalConfig.maxDelay;
    var hk4e_configs = hk4e_getConfigs();
    var nap_configs = nap_getConfigs();
    log.info(`正在检测原神配置有效性`);
    checkConfigs(hk4e_configs);
    log.info("检测完毕！");
    log.info(`正在检测绝区零配置有效性`);
    checkConfigs(nap_configs);
    log.info("检测完毕！");
    log.info("正在获取版本号");
    var hk4e_appversion = await hk4e_AppVersion();
    var nap_appversion = await nap_AppVersion();
    hk4e_appversion = hk4e_appversion.data.package_version;
    nap_appversion = nap_appversion.data.package_version;
    log.info(`获取成功！当前版本号：原神${hk4e_appversion}，绝区零${nap_appversion}`);
    var successNum = 0, totalNum = 0;
    for (key in hk4e_configs) {
        var delay = Math.round(
            Math.random() * (maxDelay - minDelay) + minDelay
        );
        log.info(`暂停：${delay}毫秒`);
        await sleep(delay);
        totalNum++;
        log.info(`${key} - 正在执行配置 ${key}`);
        log.info(`${key} - 尝试签到原神……`);
        var hk4e_header = hk4e_makeHeader(hk4e_configs[key], hk4e_appversion);
        var hk4e_WalletRespond = await hk4e_Wallet(hk4e_header);
        addLogContent(
            `<span style="color: orange; font-weight: bold">${key} hk4e_Wallet返回体</span> <br> <span style="color: orange">${JSON.stringify(
                hk4e_WalletRespond
            )}</span><br>`
        );
        if (hk4e_WalletRespond.data != null) {
            var hk4e_NotificationRespond = await hk4e_ListNotification(hk4e_header);
            addLogContent(
                `<span style="color: orange; font-weight: bold">${key} hk4e_Notification返回体</span> <br> <span style="color: orange">${JSON.stringify(
                    hk4e_NotificationRespond
                )}</span><br>`
            );
            successNum++;
            log.info(
                `${key} - 签到完毕! 原神总时长：${hk4e_WalletRespond.data.free_time.free_time}分钟`
            );
            if (hk4e_configs[key].email != null && globalConfig.sendMail == true) {
                SendResult(
                    transporter,
                    globalConfig.mailConfig.user,
                    hk4e_configs[key].email,
                    `签到完毕! 总时长：${hk4e_WalletRespond.data.free_time.free_time}分钟`,
                    key
                );
            }
            let hk4e_NotificationLength = hk4e_NotificationRespond.data.list.length;
            let hk4e_postHeader = hk4e_header;
            Object.assign(hk4e_postHeader, {
                "Content-Length": 28,
                "Content-Type": "application/json; charset=UTF-8",
            });
            for (var i = 0; i < hk4e_NotificationLength; i++) {
                hk4e_AckNotification(
                    hk4e_postHeader,
                    hk4e_NotificationRespond.data.list[i].id
                );
            }
        } else {
            log.error(`${key} - 签到失败`);
            if (hk4e_configs[key].email != null && globalConfig.sendMail == true) {
                SendResult(
                    transporter,
                    globalConfig.mailConfig.user,
                    hk4e_configs[key].email,
                    "签到失败",
                    key
                );
            }
        }
    }
    for (key in nap_configs) {
        var delay = Math.round(
            Math.random() * (maxDelay - minDelay) + minDelay
        );
        log.info(`暂停：${delay}毫秒`);
        await sleep(delay);
        totalNum++;
        log.info(`${key} - 正在执行配置 ${key}`);
        log.info(`${key} - 尝试签到绝区零……`);
        var nap_header = nap_makeHeader(nap_configs[key], nap_appversion);
        var nap_WalletRespond = await nap_Wallet(nap_header);
        addLogContent(
            `<span style="color: orange; font-weight: bold">${key} nap_Wallet返回体</span> <br> <span style="color: orange">${JSON.stringify(
                nap_WalletRespond
            )}</span><br>`
        );
        if (nap_WalletRespond.data != null) {
            var nap_NotificationRespond = await nap_ListNotification(nap_header);
            addLogContent(
                `<span style="color: orange; font-weight: bold">${key} nap_Notification返回体</span> <br> <span style="color: orange">${JSON.stringify(
                    nap_NotificationRespond
                )}</span><br>`
            );
            successNum++;
            log.info(
                `${key} - 签到完毕! 绝区零总时长：${nap_WalletRespond.data.free_time.free_time}分钟`
            );
            if (nap_configs[key].email != null && globalConfig.sendMail == true) {
                SendRnapt(
                    transporter,
                    globalConfig.mailConfig.user,
                    nap_configs[key].email,
                    `签到完毕! 总时长：${nap_WalletRespond.data.free_time.free_time}分钟`,
                    key
                );
            }
            let nap_NotificationLength = nap_NotificationRespond.data.list.length;
            let nap_postHeader = nap_header;
            Object.assign(nap_postHeader, {
                "Content-Length": 28,
                "Content-Type": "application/json; charset=UTF-8",
            });
            for (var i = 0; i < nap_NotificationLength; i++) {
                nap_AckNotification(
                    nap_postHeader,
                    nap_NotificationRespond.data.list[i].id
                );
            }
        } else {
            log.error(`${key} - 签到失败`);
            if (nap_configs[key].email != null && globalConfig.sendMail == true) {
                SendResult(
                    transporter,
                    globalConfig.mailConfig.user,
                    nap_configs[key].email,
                    "签到失败",
                    key
                );
            }
        }
    }

    if (globalConfig.sendMail == true) {
        log.info(`暂停：10秒`);
        await sleep(10000);
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
