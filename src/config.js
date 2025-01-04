const { exit } = require("process");
const fs = require("fs");
const { default: axios } = require("axios");
const { log } = require("./util");

exports.hk4e_ListNotificationURL =
    "https://api-cloudgame.mihoyo.com/hk4e_cg_cn/gamer/api/listNotifications?status=NotificationStatusUnread&type=NotificationTypePopup&is_sort=true";
exports.hk4e_AckNotificationURL =
    "https://api-cloudgame.mihoyo.com/hk4e_cg_cn/gamer/api/ackNotification";
exports.hk4e_WalletURL =
    "https://api-cloudgame.mihoyo.com/hk4e_cg_cn/wallet/wallet/get?cost_method=0";
exports.hk4e_AppVersionURL =
    "https://api-takumi.mihoyo.com/ptolemaios/api/getLatestRelease?app_id=1953443910&app_version=3.8.0&channel=mihoyo";

exports.nap_ListNotificationURL =
    "https://cg-nap-api.mihoyo.com/nap_cn/cg/gamer/api/listNotifications?status=NotificationStatusUnread&type=NotificationTypePopup&is_sort=true";
exports.nap_AckNotificationURL =
    "https://cg-nap-api.mihoyo.com/nap_cn/cg/gamer/api/ackNotification";
exports.nap_WalletURL =
    "https://cg-nap-api.mihoyo.com/nap_cn/cg/wallet/wallet/get?cost_method=0";
exports.nap_AppVersionURL =
    "https://api-takumi.mihoyo.com/ptolemaios_api/api/getLatestRelease?app_id=1953458691&app_version=1.4.0&channel=appstore";

exports.hk4e_ListNotification = async function (header) {
    let tmp = (
        await axios(exports.hk4e_ListNotificationURL, {
            headers: header,
        })
    ).data;
    tmp.StringVersion = JSON.stringify(tmp);
    return tmp;
};
exports.nap_ListNotification = async function (header) {
    let tmp = (
        await axios(exports.nap_ListNotificationURL, {
            headers: header,
        })
    ).data;
    tmp.StringVersion = JSON.stringify(tmp);
    return tmp;
};
exports.hk4e_AckNotification = async function (header, id) {
    let data = `{"id":"${id}"}`;
    await axios.post(exports.hk4e_AckNotificationURL, data, {
        headers: header,
    });
};
exports.nap_AckNotification = async function (header, id) {
    let data = `{"id":"${id}"}`;
    await axios.post(exports.nap_AckNotificationURL, data, {
        headers: header,
    });
};
exports.hk4e_Wallet = async function (header) {
    let tmp = (
        await axios(exports.hk4e_WalletURL, {
            headers: header,
        })
    ).data;
    tmp.StringVersion = JSON.stringify(tmp);
    return tmp;
};
exports.nap_Wallet = async function (header) {
    let tmp = (
        await axios(exports.nap_WalletURL, {
            headers: header,
        })
    ).data;
    tmp.StringVersion = JSON.stringify(tmp);
    return tmp;
};

exports.hk4e_AppVersion = async function () {
    let tmp = (await axios(exports.hk4e_AppVersionURL)).data;
    tmp.StringVersion = JSON.stringify(tmp);
    return tmp;
};
exports.nap_AppVersion = async function () {
    let tmp = (await axios(exports.nap_AppVersionURL)).data;
    tmp.StringVersion = JSON.stringify(tmp);
    return tmp;
};

var configKeys = [
    "token",
    "client_type",
    "device_name",
    "device_model",
    "sys_version",
    "channel",
];

exports.getGlobalConfig = function () {
    try {
        var globalConfig = fs.readFileSync("global.json");
    } catch (e) {
        if (e.toString().includes("Error: ENOENT: no such file or directory")) {
            log.error(`读取配置失败！找不到全局配置文件`);
        } else {
            log.error(`读取配置失败！错误信息：${e}`);
        }
        exit();
    }
    return JSON.parse(globalConfig);
};

exports.hk4e_getConfigs = function () {
    try {
        var configsList = fs.readdirSync("configs/hk4e");
        configsList = configsList.filter((file) => file.endsWith(".json"));
    } catch (e) {
        if (
            e == "Error: ENOENT: no such file or directory, scandir 'configs'"
        ) {
            log.error(`读取配置失败！找不到configs/hk4e文件夹`);
        } else {
            log.error(`读取配置失败！错误信息：${e}`);
        }
        exit();
    }
    log.info(`检测到${configsList.length}个原神配置文件：`);
    configsList.forEach((file) => {
        log.info(`${file}`);
    });
    var configs = {};
    configsList.forEach((file) => {
        configs[file] = JSON.parse(fs.readFileSync(`configs/hk4e/${file}`));
    });
    return configs;
};
exports.nap_getConfigs = function () {
    try {
        var configsList = fs.readdirSync("configs/nap");
        configsList = configsList.filter((file) => file.endsWith(".json"));
    } catch (e) {
        if (
            e == "Error: ENOENT: no such file or directory, scandir 'configs'"
        ) {
            log.error(`读取配置失败！找不到configs/nap文件夹`);
        } else {
            log.error(`读取配置失败！错误信息：${e}`);
        }
        exit();
    }
    log.info(`检测到${configsList.length}个绝区零配置文件：`);
    configsList.forEach((file) => {
        log.info(`${file}`);
    });
    var configs = {};
    configsList.forEach((file) => {
        configs[file] = JSON.parse(fs.readFileSync(`configs/nap/${file}`));
    });
    return configs;
};

exports.checkConfigs = function (configs) {
    for (file in configs) {
        var configThis = configs[file];
        for (key in configKeys) {
            if (
                configThis[configKeys[key]] == "" ||
                configThis[configKeys[key]] == undefined ||
                configThis[configKeys[key]] == null ||
                configThis[configKeys[key]] == NaN
            ) {
                log.error(`配置文件 ${file} 异常：`);
                log.error(`  —— ${configKeys[key]}字段缺失`);
            }
        }
    }
};

exports.hk4e_makeHeader = function (data, appversion) {
    return {
        "x-rpc-combo_token": data.token,
        "x-rpc-client_type": data.client_type,
        "x-rpc-app_version": appversion,
        "x-rpc-sys_version": data.sys_version,
        "x-rpc-channel": data.channel,
        "x-rpc-device_id": data.device_id,
        "x-rpc-device_name": data.device_name,
        "x-rpc-device_model": data.device_model,
        "x-rpc-app_id": 1953439974,
        "x-rpc-cg_game_biz": "hk4e_cn",
        "x-rpc-op_biz": "clgm_cn",
        "x-rpc-language": "zh-cn",
        "x-rpc-vendor_id": 1,
        "x-rpc-cps": "cyydmihoyo",
        Host: "api-cloudgame.mihoyo.com",
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip, deflate",
        "User-Agent": "okhttp/4.10.0"
    };
};
// iOS
exports.nap_makeHeader = function (data, appversion) {
    return {
        "x-rpc-combo_token": data.token,
        "x-rpc-client_type": data.client_type,
        "x-rpc-app_version": appversion,
        "x-rpc-sys_version": data.sys_version,
        "x-rpc-channel": data.channel,
        "x-rpc-device_id": data.device_id,
        "x-rpc-device_name": data.device_name,
        "x-rpc-device_model": data.device_model,
        "x-rpc-cg_game_id": 9000357,
        "x-rpc-cg_game_biz": "nap_cn",
        "x-rpc-op_biz": "clgm_nap-cn",
        "x-rpc-language": "zh-cn",
        "x-rpc-vendor_id": 2,
        "x-rpc-cps": "appstore",
        Host: "cg-nap-api.mihoyo.com",
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip, deflate, br",
        "User-Agent": "CloudGame/2 CFNetwork/1410.1 Darwin/22.6.0"
    };
};

exports.SendLog = function (
    transporter,
    mailfrom,
    mailto,
    successNum,
    totalNum,
    content
) {
    transporter.sendMail(
        {
            from: `"Hoyo Cloud Game Helper" <${mailfrom}>`, //邮件来源
            to: mailto, //邮件发送到哪里，多个邮箱使用逗号隔开
            subject: `今日已签到${successNum}/${totalNum}名用户`, // 邮件主题
            text: "", // 存文本类型的邮件正文
            html: `${content}`, // html类型的邮件正文
        },
        (error) => {
            if (error) {
                return console.log(error);
            }
            log.info("日志已丢出！");
        }
    );
};

exports.SendResult = function (transporter, mailfrom, mailto, content, key) {
    transporter.sendMail(
        {
            from: `"Hoyo Cloud Game Helper" <${mailfrom}>`, //邮件来源
            to: mailto, //邮件发送到哪里，多个邮箱使用逗号隔开
            subject: `Hoyo Cloud Game Helper`, // 邮件主题
            text: `${content}`, // 存文本类型的邮件正文
        },
        (error) => {
            if (error) {
                return console.log(error);
            }
            log.info(`${key} - 已发送通知至${mailto}`);
        }
    );
};
