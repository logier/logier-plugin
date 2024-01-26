import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';



/*
图片地址，支持本地和网络
├── emojihub
│   ├── capoo-emoji
│   │   ├── capoo100.gif
│   ├── greyscale-emoji
│   │   ├── greyscale100.gif
可以填写/path/to/emojihub 或 /path/to/emojihub/capoo-emoji 
*/
const imageUrls = [
    'https://t.mwm.moe/mp', //横图
    // '/home/gallery',
    // 添加更多的 URL或本地文件夹...
];

export class TextMsg extends plugin {
    constructor() {
        super({
            name: '今日运势', // 插件名称
            dsc: '今日运势',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 6,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(今日运势|运势)$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '今日运势'  // 执行方法
                },
                {
                  reg: '^#?(悔签|重新抽取运势)$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '悔签'  // 执行方法
              }
            ]
        })

    }
    async 今日运势(e) {
        push今日运势(e)
      }
    async 悔签(e) {
      push今日运势(e, true)
    }
}

async function push今日运势(e, isRejrys = false) {

  let jrys = await fetchjrys('jrys.json')

  // 获取当前日期
  let now = new Date();
  let day = now.getDate();
  
  let yunshi = await redis.get(`Yunzai:logier-plugin:${e.user_id}_jrys`);
  let item;
  let data;
  
  if (yunshi) {
      data = JSON.parse(yunshi);
      let lastUpdated = new Date(data.time);
      if (isRejrys) {
          if (!data.isRejrys && isSameDay(now, lastUpdated)) {
              logger.info('[今日运势]：悔签，重新抽取');
              let newJrys = jrys.filter(j => j !== data.item);
              data.item = newJrys[Math.floor(Math.random() * newJrys.length)];
              data.time = now;
              data.isRejrys = true;
          } else if (data.isRejrys) {
              e.reply(['小小', segment.at(e.user_id), '竟敢不自量力，一天只可以悔签一次'], true);
              return;
          }
      }
      item = data.item;
  } else {
      logger.info('[今日运势]：未读取到运势数据，直接写入');
      item = jrys[Math.floor(Math.random() * jrys.length)];
      data = {
          item: item,
          time: new Date(),
          isRejrys: false
      };
  }
  
  await redis.set(`Yunzai:logier-plugin:${e.user_id}_jrys`, JSON.stringify(data));
  

  
      let imageUrl = await getRandomImage(imageUrls); 
      if (path.isAbsolute(imageUrl)) {
        let imageBuffer = await fs.readFileSync(imageUrl);
        let base64Image = imageBuffer.toString('base64');
        imageUrl = 'data:image/png;base64,' + base64Image
    }
        

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
        <div class="fortune" style="width: 30%; height: 65rem; float: left; text-align: center; background: rgba(255, 255, 255, 0.6);">
          <p>${e.nickname}的${upperCaseNumbers[day]}日运势为</p>
          <h2>${item.fortuneSummary}</h2>
          <p>${item.luckyStar}</p>
          <div class="content" style="margin: 0 auto; padding: 12px 12px; height: 49rem; max-width: 980px; max-height: 1024px; background: rgba(255, 255, 255, 0.6); border-radius: 15px; backdrop-filter: blur(3px); box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); writing-mode: vertical-rl; text-orientation: mixed;">
            <p >${item.signText}</p>
            <p >${item.unsignText}</p>
          </div>
          <p>| 相信科学，请勿迷信 |</p>
          <p>Create By Logier-Plugin </p>
        </div>
        <div class="image" style="height:65rem; width: 70%; float: right; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); text-align: center;">
          <img src=${imageUrl} style="height: 100%; filter: brightness(100%); overflow: hidden; display: inline-block; vertical-align: middle; margin: 0; padding: 0;"/>
        </div>
        </html>
        `;

      let browser;
      try {
        const imageUrl = await getRandomImage(imageUrls);
        if (!imageUrl) {
          throw new Error('无法获取图片URL');
        }
        // 根据 isRejrys 参数更改消息内容
        let message = isRejrys ? ["异变骤生！", segment.at(e.user_id), '的运势竟然变为了……'] : "正在为您测算今日的运势……";
        e.reply(message, true, { recallMsg: 5 });
        browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(Html)
        const image = await page.screenshot({fullPage: true })
        e.reply(segment.image(image))
      } catch (error) {
        logger.info('[今日运势]：图片渲染失败，使用文本发送');
        let prefix = isRejrys ? ['异变骤生！', segment.at(e.user_id), `的${upperCaseNumbers[day]}日运势竟然变为了……\n${item.fortuneSummary}\n${item.luckyStar}\n${item.signText}\n${item.unsignText}`] : [segment.at(e.user_id), `的${upperCaseNumbers[day]}日运势为……\n${item.fortuneSummary}\n${item.luckyStar}\n${item.signText}\n${item.unsignText}`];
        e.reply(prefix)
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

function isSameDay(d1, d2) {
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
      d1.getUTCMonth() === d2.getUTCMonth() &&
      d1.getUTCDate() === d2.getUTCDate();
}

async function fetchjrys(jsonFileName) {
  // 获取当前文件的目录
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // 获取 JSON 文件的绝对路径
  const filePath = path.resolve(__dirname, `../../resources/logier/${jsonFileName}`);
  // 获取文件路径的目录部分
  const resourcesPath = path.resolve(__dirname, '../../resources');
  const logierPath = path.resolve(resourcesPath, 'logier');

  // 如果路径不存在就创建文件夹
  try {
      await fs.promises.access(logierPath);
  } catch (error) {
      await fs.promises.mkdir(logierPath, { recursive: true });
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
          const fileURL = `https://git.acwing.com/logier/logier-plugin/-/raw/master/resources/${jsonFileName}`;
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




  const upperCaseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十', '三十一'];




 