import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';
import schedule from 'node-schedule'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';


const imageUrls = [
    'https://t.mwm.moe/mp', //横图
    // '/home/gallery',
    // 添加更多的 URL或本地文件夹...
];

// 定时发送时间，采用 Cron 表达式
const time = '0 30 7 * * ?'
/* 各位代表的意思 *-代表任意值 ？-不指定值，仅日期和星期域支持该字符。 （想了解更多，请自行搜索Cron表达式学习）
    *  *  *  *  *  *
    ┬  ┬  ┬  ┬  ┬  ┬
    │  │  │  │  │  |
    │  │  │  │  │  └ 星期几，取值：0 - 7，其中 0 和 7 都表示是周日
    │  │  │  │  └─── 月份，取值：1 - 12
    │  │  │  └────── 日期，取值：1 - 31
    │  │  └───────── 时，取值：0 - 23
    │  └──────────── 分，取值：0 - 59
    └─────────────── 秒，取值：0 - 59（可选）
*/

// 指定定时发送的群号
const groupList = ['315239849']

/**
 * 开启定时推送的群号，填写格式如下
 * 单个群号填写如下：
 * ["374900636"];
 * 多个个群号填写如下：
 * ["374900636","374900636"];
 */

// 是否开启定时推送
const isAutoPush = false

autoyunshi()


// TextMsg可自行更改，其他照旧即可。
export class TextMsg extends plugin {
    constructor() {
        super({
            name: '今日运势', // 插件名称
            dsc: '今日运势',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 6,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?今日运势$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '今日运势'  // 执行方法
                }
            ]
        })

    }
    async 今日运势(e) {
      e.reply("正在为您渲染，请稍后" , true, { recallMsg: 5 });
        push今日运势(e)
      }
}


async function push今日运势(e, isAuto = 0) {
    filefetchData('jrys.json').then(data => {
        const item = data[Math.floor(Math.random() * data.length)];
        logger.info(item);
    });

    const imageUrl = await getRandomImage(imageUrls);
    logger.info(imageUrl);

    let browser;
    try {
      browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();

      let nickname = this.e.nickname ? this.e.nickname : '';
    
      let Html = `
      <html style="background: rgba(255, 255, 255, 0.6)">
      <head>
      <style>
      html, body {
          margin: 0;
          padding: 0;
      }        
      </style>
      </head>
      <div class="fortune" style="width: 35%; height: 65rem; float: left; text-align: center; background: rgba(255, 255, 255, 0.6);">
        <p>${nickname}你的今日运势为</p>
        <h2>${item.fortuneSummary}</h2>
        <p>${item.luckyStar}</p>
        <div class="content" style="margin: 0 auto; padding: 12px 12px; height: 49rem; max-width: 980px; max-height: 1024px; background: rgba(255, 255, 255, 0.6); border-radius: 15px; backdrop-filter: blur(3px); box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); writing-mode: vertical-rl; text-orientation: mixed;">
          <p style="font-size: 25px;">${item.signText}</p>
          <p style="font-size: 25px;">${item.unsignText}</p>
        </div>
        <p>仅供娱乐| 相信科学，请勿迷信 |仅供娱乐</p>
      </div>
      <div class="image" style="height:65rem; width: 65%; float: right; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); text-align: center;">
        <img src=${imageUrl} style="height: 100%; filter: brightness(100%); overflow: hidden; display: inline-block; vertical-align: middle; margin: 0; padding: 0;"/>
      </div>
    </html>
      `
    
      await page.setContent(Html)
    
      const base64 = await page.screenshot({ encoding: "base64", fullPage: true })
    
      if (isAuto) {
        e.sendMsg(segment.image(`base64://${base64}`))
      } else {
        e.reply(segment.image(`base64://${base64}`))
      }
    } catch (error) {
      logger.error(error);
      e.reply('抱歉，生成图片时出现了错误。');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
    
    return true;
    
  }




async function getRandomImage(imageUrls) {
    let imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

    // 检查imageUrl是否是一个本地文件夹
    if (fs.existsSync(imageUrl) && fs.lstatSync(imageUrl).isDirectory()) {
        // 获取文件夹中的所有文件
        let files = fs.readdirSync(imageUrl);

        // 过滤出图片文件
        let imageFiles = files.filter(file => ['.jpg', '.png', '.gif', '.jpeg', '.webp'].includes(path.extname(file)));

        // 如果文件夹中有图片文件，随机选择一个
        if (imageFiles.length > 0) {
            let imageFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
            imageUrl = path.join(imageUrl, imageFile);
        } else {
            // 如果文件夹中没有图片文件，随机选择一个子文件夹
            let subdirectories = files.filter(file => fs.lstatSync(path.join(imageUrl, file)).isDirectory());
            if (subdirectories.length > 0) {
                let subdirectory = subdirectories[Math.floor(Math.random() * subdirectories.length)];
                imageUrl = await getRandomImage([path.join(imageUrl, subdirectory)]);
            }
        }
    }

    return imageUrl;
}

async function filefetchData(jsonFileName) {
    // 获取当前文件的目录
    const __dirname = dirname(fileURLToPath(import.meta.url));
    // 获取 JSON 文件的绝对路径
    const filePath = path.resolve(__dirname, `../../resources/logier/${jsonFileName}`);
    // 获取文件路径的目录部分
    const resourcesPath = path.resolve(__dirname, '../../resources');

    // 如果路径不存在就创建文件夹
    try {
        await fs.promises.access(resourcesPath);
    } catch (error) {
        await fs.promises.mkdir(resourcesPath, { recursive: true });
    }

    let data;
    let attempts = 0;

    while (!data && attempts < 3) {
        try {
            // 尝试读取和解析 JSON 文件
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            if (fileContent && fileContent.length > 0) {
                data = JSON.parse(fileContent);
            }
        } catch (error) {
            // 如果出现错误，删除文件以便重新下载
            await fs.promises.unlink(filePath).catch(() => {});
        }

        if (!data) {
            // 下载文件
            const fileURL = `https://gitee.com/logier/emojihub/raw/master/resources/${jsonFileName}`;
            const file = fs.createWriteStream(filePath);
            await new Promise((resolve, reject) => {
                https.get(fileURL, function(response) {
                    response.pipe(file);
                    file.on('finish', function() {
                        file.close(resolve);
                    });
                }).on('error', function(err) {
                    fs.unlink(filePath);
                    reject(err.message);
                });
            });

            // 重新读取 JSON 文件
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            if (fileContent && fileContent.length > 0) {
                data = JSON.parse(fileContent);
            }
        }

        attempts++;
    }

    return data;
}


function autoyunshi() {
    if (isAutoPush) {
      schedule.scheduleJob(time, () => {
        logger.info('[今日运势]：开始自动推送...')
        for (let i = 0; i < groupList.length; i++) {
          let group = Bot.pickGroup(groupList[i])
          push今日运势(group, 1)
          common.sleep(1000)
        }
      })
    }
  }