import puppeteer from "puppeteer";
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

let key = ''; //申请高德key，地址https://lbs.amap.com/dev/key/app

export class TextMsg extends plugin {
    constructor() {
        super({
            name: '天气', 
            dsc: '天气',            
            event: 'message',  
            priority: 5000,   
            rule: [
                {
                    reg: '^#?(天气).*$',   
                    fnc: '天气'
                },
            ]
        });
    }

    async 天气(e) {
        const data = await filefetchData('cityadcode.jsonn');

        if (!key) {
            key = fs.readFileSync('D:\\dev\\Miao-Yunzai\\plugins\\example\\key.txt', 'utf8').trim();
        }

        logger.info(key);

        // 从消息中提取中文名
        const chineseName = e.msg.replace(/#?(test)/, '').trim();

        // 如果没有输入城市名称，返回错误消息
        if (!chineseName) {
          logger.warn('请输入城市名称');
          return true;
        }

        // 将中文名转换为adcode
        const cityadcode = data[chineseName];

        // 如果找到了adcode，返回它；否则，返回一个错误消息
        if (cityadcode) {
          logger.info('城市adcode为' + cityadcode);
        } else {
          logger.warn('找不到' + chineseName);
          return true;
        }

        const weatherurl = `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${cityadcode}&extensions=all`;

        // 获取天气信息
        const response = await fetch(weatherurl);
        const weatherData = await response.json();

        // 检查是否成功获取天气信息
        if (weatherData.status !== '1') {
          logger.warn('无法获取天气信息');
          return true;
        }

        // 获取第一个casts的dayweather
        const dayweather = weatherData.forecasts[0].casts[0].dayweather;

        e.reply(dayweather)
    }
}

async function filefetchData(jsonFileName) {
    // 获取当前文件的目录
    const __dirname = dirname(fileURLToPath(import.meta.url));
    // 获取 JSON 文件的绝对路径
    const filePath = path.resolve(__dirname, `../../resources/logier/${jsonFileName}`);
    // 获取文件路径的目录部分
    const dirPath = path.dirname(filePath);

    logger.info(filePath); 

    // 如果路径不存在就创建文件夹
    fs.existsSync(dirPath) || fs.mkdirSync(dirPath, { recursive: true });

    let data;
    try {
        // 尝试读取和解析 JSON 文件
        data = fs.existsSync(filePath) && JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        // 如果出现错误，删除文件以便重新下载
        fs.unlinkSync(filePath);
    }

    if (!data) {
        await downloadFile(`https://gitee.com/logier/logier-plugin/raw/main/resouces/${jsonFileName}`, filePath);
        // 重新读取 JSON 文件
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    return data;
}

