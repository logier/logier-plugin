import puppeteer from "puppeteer";
import common from '../../lib/common/common.js' 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';
import fs from 'fs';
import path from 'path';

// 填入gptkey 推荐https://github.com/chatanywhere/GPT_API_free 
// 如果不想在这里填入，也可以在../resources/logier/key.json中的gptkey部分填入
let apikey = ""; 


let model = "gpt-3.5-turbo"; // gpt模型，一般不用改
let gpturl = "https://api.chatanywhere.tech/v1/chat/completions"; // gpt接口地址，从chatanywhere拿key不用改



export class TextMsg extends plugin {
    constructor() {
        super({
            name: '塔罗牌', // 插件名称
            dsc: '塔罗牌',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 6,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(塔罗牌|抽塔罗牌)(.*)$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '塔罗牌'  // 执行方法
                },
                {
                  reg: '^#?(占卜)\\s(.*)$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '占卜'  // 执行方法
              },

            ]
        })


}

async 塔罗牌(e) {

  if (!apikey) {
    const keyData = await filefetchkey('key.json')
    apikey = keyData.gptkey;
  }

  let replacedMsg = this.e.msg.replace(/^#?(塔罗牌|抽塔罗牌|占卜)/, '');

  if (replacedMsg) {
    const 占卜内容 = replacedMsg;
    // 回复用户
    e.reply(`正在为您占卜${replacedMsg}`, true);
    await 抽塔罗牌(e, 占卜内容);

    // 停止循环
    return true
  } else {
    this.setContext('占卜内容')
    e.reply(`请发送你想要占卜的内容`, true)
  }
    return true;
}

async 占卜内容(e) {
  let isFinished = false; // 添加一个标志来记录是否已经结束占卜
  // 判断结果是否匹配
  if (this.e.msg) {
    const 占卜内容 = this.e.msg;
    /** 结束上下文监听，如果不及时结束，会造成多次触发 */
    this.finish('占卜内容')
    isFinished = true; // 如果已经结束占卜，就将标志设置为 true

    // 回复用户
    e.reply(`正在为您占卜${this.e.msg}`, true);

    await 抽塔罗牌(e, 占卜内容);

    // 停止循环
    return true
  } else {
    this.finish('占卜内容')
    e.reply(`结束占卜`, true)
  }

  // 设置30秒的时间限制
  setTimeout(() => {
    // 在这里检查是否已经结束占卜
    if (!isFinished) {
      this.finish('占卜内容')
      e.reply(`占卜已经超过30秒，自动结束`, true)
    }
  }, 30000);
}

async 占卜(e) {

  if (!apikey) {
    const keyData = await filefetchkey('key.json')
    apikey = keyData.gptkey;
  }
  let 占卜内容 = this.e.msg.replace(/^#?(占卜)/, '');
  let tarot = await fetchtarot('tarot.json')
  e.reply(`正在为您占卜${占卜内容}……`)
  // 收集需要转发的消息，存入数组之内，数组内一个元素为一条消息
  const forward = [
      "正在为您抽牌……", 
  ]
  let keys = Object.keys(tarot[0].cards);
  let randomCards = [];
  let randomMeanings = [];
  let randomDescriptions = [];
  let cardposition = [];
  
  for(let i = 0; i < 3; i++) {
      let randomIndex = Math.floor(Math.random() * keys.length);
      let randomKey = keys[randomIndex];
      let randomCard = tarot[0].cards[randomKey];
  
      // 确保不会抽到重复的卡
      while(randomCards.includes(randomCard)) {
          randomIndex = Math.floor(Math.random() * keys.length);
          randomKey = keys[randomIndex];
          randomCard = tarot[0].cards[randomKey];
      }
  
      randomCards.push(randomCard);
  
      // 随机抽取up或down
      let position = Math.random() < 0.5 ? 'up' : 'down';
      cardposition.push(position);
      randomMeanings.push(randomCard.meaning[position]);
  
      // 根据抽取的位置(up或down)选择对应的描述
      if(position === 'up') {
          randomDescriptions.push(randomCard.info.description);
      } else {
          randomDescriptions.push(randomCard.info.reverseDescription);
      }
  
      let imageurl = `https://gitee.com/logier/logier-plugin/raw/master/resources/%E5%A1%94%E7%BD%97%E7%89%8C/${randomCard.type}/${randomCard.pic}.webp`;
  
      logger.info(randomCard);
  
      let forwardmsg = [`你抽到的第${i+1}张牌是\n${randomCard.name_cn} (${randomCard.name_en})\n${position === 'up' ? '正位' : '逆位'}:  ${randomMeanings[i]}\n\n卡牌描述： ${randomDescriptions[i]}`, segment.image(imageurl)]
  
      forward.push(forwardmsg)
  }
  
  let translatedCardPosition = cardposition.map(position => {
      if (position === 'up') {
          return '正位';
      } else if (position === 'down') {
          return '逆位';
      } else {
          return position; // 如果有其他值，保持原样
      }
  });
  
  
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + apikey );
  myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
  myHeaders.append("Content-Type", "application/json");
  
  var raw = JSON.stringify({
      "model": model,
      "messages": [
          {
              "role": "system",
              "content": `我请求你担任塔罗占卜师的角色。 我想占卜的内容是${占卜内容}，请你根据我抽到的三张牌，帮我解释其含义，并给我一些建议。`
          },
          {
              "role": "user",
              "content": `我抽到的第一张牌是${randomCards[0].name_cn}，并且是${translatedCardPosition[0]}，这代表${randomMeanings[0]}`
          },
          {
              "role": "user",
              "content": `我抽到的第二张牌是${randomCards[1].name_cn}，并且是${translatedCardPosition[1]}，这代表${randomMeanings[1]}`
          },
          {
              "role": "user",
              "content": `我抽到的最后一张牌是${randomCards[2].name_cn}，并且是${translatedCardPosition[2]}，这代表${randomMeanings[2]}`
          },
      ]
  });
  
  
  var requestOptions = {
     method: 'POST',
     headers: myHeaders,
     body: raw,
     redirect: 'follow'
  };

  let content;
  
  await fetch(gpturl, requestOptions)
    .then(response => response.json()) // 将响应解析为JSON
    .then(result => {
        content = result.choices[0].message.content; // 访问content字段
        console.log(content);
    })
    .catch(error => console.log('error', error));

    forward.push(content)

    const msg = await common.makeForwardMsg(e, forward, `${e.nickname}的${占卜内容}占卜`)
    await this.reply(msg)
  
 return true;
}

}




async function 抽塔罗牌(e, 占卜内容) {

  let tarot = await fetchtarot('tarot.json')

  let keys = Object.keys(tarot[0].cards);
  let randomIndex = Math.floor(Math.random() * keys.length);
  let randomKey = keys[randomIndex];
  let randomCard = tarot[0].cards[randomKey];
  logger.info(randomCard);

  let imageurl = `https://gitee.com/logier/logier-plugin/raw/master/resources/%E5%A1%94%E7%BD%97%E7%89%8C/${randomCard.type}/${randomCard.pic}.webp`;
  var options = [`正位: ${randomCard.meaning.up}`, `逆位: ${randomCard.meaning.down}`];
  var selection = options[Math.floor(Math.random() * options.length)];
  var selectedOption = selection.split(': ');
  var position = selectedOption[0]; // 正位 或 逆位
  var meaning = selectedOption[1]; // 对应的含义

  const 内容 = `我请求你担任塔罗占卜师的角色。 我想占卜的内容是${占卜内容}，我抽到的牌是${randomCard.name_cn}，并且是${selection}，请您结合我想占卜的内容来解释含义,话语尽可能简洁。`;

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + apikey );
  myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
  myHeaders.append("Content-Type", "application/json");
  
  var raw = JSON.stringify({
     "model": model,
     "messages": [
      {
          "role": "user",
          "content": 内容
      }
     ]
  });
  
  var requestOptions = {
     method: 'POST',
     headers: myHeaders,
     body: raw,
     redirect: 'follow'
  };

  let content;
  
  await fetch(gpturl, requestOptions)
    .then(response => response.json()) // 将响应解析为JSON
    .then(result => {
        content = result.choices[0].message.content; // 访问content字段
        console.log(content);
    })
    .catch(error => console.log('error', error));



  let browser;
  try {
    browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
  
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
      <h2>${randomCard.name_cn}(${randomCard.name_en})</h2>
      <p>${position}</p>
      <div class="content" style="margin: 0 auto; padding: 12px 12px; height: 49rem; max-width: 980px; max-height: 1024px; background: rgba(255, 255, 255, 0.6); border-radius: 15px; backdrop-filter: blur(3px); box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); writing-mode: vertical-rl; text-orientation: mixed;">
      <p style="font-size: 25px;">${content}</p>
      </div>
      <p>${meaning}</p>
      <p>Create By Logier-Plugin</p>
    </div>
    <div class="image" style="height:65rem; width: 65%; float: right; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.3); text-align: center;">
      <img src=${imageurl} style="height: 100%; filter: brightness(100%); overflow: hidden; display: inline-block; vertical-align: middle; margin: 0; padding: 0;"/>
    </div>
  </html>
    `

    await page.setContent(Html)
    const tarotimage = await page.screenshot({fullPage: true })
    e.reply([segment.image(tarotimage)], true)

  } catch (error) {
      logger.error(error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
 return true;
 
}

await filefetchkey('key.json')

async function filefetchkey(jsonFileName) {
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
          const fileURL = `https://gitee.com/logier/logier-plugin/raw/master/resources/${jsonFileName}`;
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

async function fetchtarot(jsonFileName) {
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





