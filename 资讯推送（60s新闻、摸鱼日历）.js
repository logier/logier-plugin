import schedule from 'node-schedule'
import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';

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
// -------------- 摸鱼日历 --------------
const moyutime = '0 30 9 * * ?';
const moyugroupList = ["123456", "456789"]; 
const moyuisAutoPush = true;

// -------------- 60s新闻 --------------
const newstime = '0 30 7 * * ?';
const newsgroupList = ["123456", "456789"];
const newsisAutoPush = true;

// -------------- 今日天气 --------------
const Weathertime = '0 30 8 * * ?';
const WeathergroupList = ["123456", "456789"]; 
const WeatherisAutoPush = true;
let key = ''; //去这里那个key填入就行，https://dev.qweather.com/
const imageUrls = [
  'https://t.mwm.moe/mp', 
  // '/home/gallery', 
  // 添加更多的 URL或本地文件夹...
];
/*自定义表情包地址，支持本地两级文件夹和网络图片
├── emojihub
│   ├── capoo-emoji
│   │   ├── capoo100.gif
│   ├── greyscale-emoji
│   │   ├── greyscale100.gif
可以填写/path/to/emojihub 或 /path/to/emojihub/capoo-emoji */


export class example extends plugin {
  constructor() {
    super({
      name: '摸鱼日历和60s新闻',
      dsc: '获取摸鱼日历和60s新闻',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^(#|/)?(摸鱼日历|摸鱼)$',
          fnc: 'getMoyu'
        },
        {
          reg: '^(#|/)?(60s日报|今日新闻)$',
          fnc: 'getNews'
        },
        {
          reg: '^#?(天气)\\s.*$',   
          fnc: 'getWeather'
      },
      ]
    });
  }

  async getMoyu(e) {
    pushContent(e, moyuapiUrl);
  }

  async getNews(e) {
    pushContent(e, newsimageUrl);
  }

  async getWeather(e) {
    pushweather(e)
  
}
}

/**
 * 推送内容
 * @param e oicq传递的事件参数e
 * @param url 图片的URL或API的URL
 */
async function pushContent(e, url, isAuto = 0) {
  let msg;
  let maxAttempts = 3;
  for(let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (url === moyuapiUrl) {
        let fetchUrl = await fetch(url).catch(err => logger.error(err));
        let imgUrl = await fetchUrl.json();
        url = await imgUrl.url;
      }
      msg = [segment.image(url, false, 120)];
      // 如果图片获取成功，就跳出循环
      break;
    } catch (error) {
      console.error(`Attempt ${attempt} failed. Retrying...`);
    }
  }

  // 如果尝试了最大次数后仍然失败，就记录错误并退出
  if(!msg) {
    console.error('Failed to get image after maximum attempts');
    return;
  }

  // 回复消息
  if (isAuto) {
    e.sendMsg(msg);
  } else {
    e.reply(msg, true);
  }
}

/**
 * 定时任务
 */
function autoTask(time, groupList, isAutoPush, url, taskName) {
  if (isAutoPush) {
    schedule.scheduleJob(time, () => {
      logger.info(`[${taskName}]：开始自动推送...`);
      for (let i = 0; i < groupList.length; i++) {
        setTimeout(() => {
          let group = Bot.pickGroup(groupList[i]);
          // 判断 url 是否等于 'WeatherimageUrl'
          if (url === imageUrls) {
            pushweather(group, 1);
          } else {
            pushContent(group, url, 1);
          }
        }, i * 1000);  // 延迟 i 秒
      }
    });
  }
}



const moyuapiUrl = 'https://api.vvhan.com/api/moyu?type=json';// 摸鱼日历接口地址
const newsimageUrl = 'http://bjb.yunwj.top/php/tp/60.jpg';// 60s新闻图片的 URL

autoTask(moyutime, moyugroupList, moyuisAutoPush, moyuapiUrl, '摸鱼人日历');
autoTask(newstime, newsgroupList, newsisAutoPush, newsimageUrl, '60s新闻');
autoTask(Weathertime, WeathergroupList, WeatherisAutoPush, imageUrls, '今日天气');


async function pushweather(e, isAuto = 0) {

  const city = e.msg.replace(/#?(天气)/, '').trim();

  const {location, data} = await getCityGeo(city, key)

  const output = await getIndices(location,  key, toRoman);

  const forecastresult = await getForecast(location, key, data);

  const imageUrl = await getImageUrl(getRandomImage, imageUrls);

  let browser;
  try {
    browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

         let Html = `
         <!DOCTYPE html>
         <html>
         <head>
         <style>
         @font-face {
          font-family: AlibabaPuHuiTi-2-55-Regular;
          src:url(https://puhuiti.oss-cn-hangzhou.aliyuncs.com/AlibabaPuHuiTi-2/AlibabaPuHuiTi-2-55-Regular/AlibabaPuHuiTi-2-55-Regular.woff2) format('woff2');
        }
         * {
            padding: 0;
            margin: 0;
         }
         html {
          font-family: 'AlibabaPuHuiTi-2-55-Regular', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
        }
         body{
           position:absolute;
         }
         .nei{
           float: left;
           box-shadow: 3px 3px 3px #666666;
           width: 50%;
           height:100%;
           display:flex;
           flex-direction: column;
           justify-content: space-between;
           border-radius:10px 10px 10px 10px;
           border:1px solid #a1a1a1;
           background: rgba(255, 255, 255, 0.5);
           z-index:1;
           position:absolute;
           backdrop-filter: blur(80px);
         }
         p {
           color : rgba(0,0,0, 0.6);
           font-size:1.5rem;
           padding: 2px; 
           word-wrap: break-word;
           white-space: pre-wrap;
         }
         .centered-content {
           display: flex;
           flex-direction: column;
           justify-content: flex-start;
           margin: 0 1rem 0 1rem;
           height: 100%;
         }
         .tu{
          float: left;
           border:1px solid #00000;
         }
         img{
            border:1px solid #00000;
            border-radius:10px 10px 10px 10px;
         }
         </style>
         </head>
         <body>
         <div class="tu">
             <img src ="${imageUrl}" height=1024px>
         </div>
         <div class="nei">
           <div class="centered-content">
            <br>
             <p>${forecastresult[0]}</p>
             <br>
             <p>${output}</p>
           </div>
           <br>
           <p style="font-weight: bold; margin-bottom: 20px; text-align: center;">Create By Logier-Plugin </p>
         </div>
         </body>
         </html>
         `
     
         await page.setContent(Html);
         // 获取图片元素
         const imgElement = await page.$('.tu img');
         // 对图片元素进行截图
         const image = await imgElement.screenshot();

        
         if (isAuto) {
          e.sendMsg(segment.image(image));
        } else {
          e.reply(segment.image(image), true);
        }
   
       } catch (error) {
         logger.error(error);
       } finally {
         if (browser) {
           await browser.close();
         }
       }
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

async function getForecast(location, key, data) {
  const forecast = `https://devapi.qweather.com/v7/weather/3d?location=${location}&key=${key}`;
  const forecastresponse = await fetch(forecast);
  const forecastdata = await forecastresponse.json();

  // 创建一个空数组来存储结果
  const forecastresult = [];

  // 遍历 forecastdata.daily 数组
  for (const item of forecastdata.daily) {
    const fxDate = item.fxDate; // 获取 tempMax 属性
    const tempMax = item.tempMax; // 获取 tempMax 属性
    const tempMin = item.tempMin; // 获取 tempMin 属性
    const windScaleDay = item.windScaleDay; // 获取 windScaleDay 属性
    const windScaleNight = item.windScaleNight; // 获取 windScaleNight 属性
    const precip = item.precip; // 获取 precip 属性
    const uvIndex = item.uvIndex; // 获取 uvIndex 属性
    const humidity = item.humidity; // 获取 humidity 属性

    // 创建模板字符串
    const output = `<span style="font-weight:bold; font-size=2em; line-height:150%">${fxDate}  ${data.location[0].name}</span>\n气温：${tempMin}°C/${tempMax}°C\n风力：${windScaleDay}/${windScaleNight}\n降水量：${precip}\n紫外线指数：${uvIndex} \n湿度：${humidity}%\n`;

    // 将模板字符串添加到 forecastresult 数组
    forecastresult.push(output);
  }

  return forecastresult;
}

async function getImageUrl(getRandomImage, imageUrls) {
  let imageUrl = await getRandomImage(imageUrls);
  if (path.isAbsolute(imageUrl)) {
    let imageBuffer = await fs.readFileSync(imageUrl);
    let base64Image = imageBuffer.toString('base64');
    imageUrl = 'data:image/png;base64,' + base64Image;
  }
  return imageUrl;
}

async function getIndices(location, key, toRoman) {
  const indices = `https://devapi.qweather.com/v7/indices/1d?type=1,3,5,9,11,14,15,16&location=${location}&key=${key}`;
  const indicesresponse = await fetch(indices);
  const indicesdata = await indicesresponse.json();

  // 创建一个空数组来存储结果
  const result = [];

  // 遍历 forecastdata.daily 数组
  for (const item of indicesdata.daily) {
    const name = item.name; // 获取 name 属性
    const text = item.text; // 获取 text 属性
    const level = parseInt(item.level); // 获取 level 属性并转换为整数
    const romanLevel = toRoman(level); // 将 level 转换为罗马数字

    // 检查 level 是否大于或等于3
    if (level >= 3) {
      // 如果 level 大于或等于3，将 name 和 text 添加到 result 数组
      result.push(`<span style="font-weight:bold">${name}(${romanLevel})</span>：${text}`);
    }
  }
  // 使用换行符连接 result 数组的所有元素
  const output = result.join('\n\n');
  return output;
}

async function getCityGeo(city, key) {
  const cityGeo = `https://geoapi.qweather.com/v2/city/lookup?location=${city}&key=${key}&city=`;
  const cityGeoresponse = await fetch(cityGeo);
  const data = await cityGeoresponse.json();
  const location = data.location[0].id;

  return {location, data};
}


function toRoman(num) {
  const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let str = '';

  for (let i of Object.keys(roman)) {
    let q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }

  return str;
}