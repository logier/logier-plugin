import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';

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

export class TextMsg extends plugin {
    constructor() {
        super({
            name: '算一卦', // 插件名称
            dsc: '算一卦',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 6,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(算一卦|算卦).*$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '算一卦'  // 执行方法
                },
                {
                  reg: '^#?(悔卦|逆天改命).*$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '悔卦'  // 执行方法
              }
            ]
        })
    }
    async 算一卦(e) {
        push算一卦(e)
    }
    async 悔卦(e) {
      push算一卦(e, true)
    }

}

await fetchsuangua('guayao.json')
await fetchsuangua('guachi.json')

    async function push算一卦(e, isResuangua = false) {


      let guayao = await fetchsuangua('guayao.json')
      let guachi = await fetchsuangua('guachi.json')
         
      let imageUrl = await getRandomImage(imageUrls); 
      if (path.isAbsolute(imageUrl)) {
        let imageBuffer = await fs.readFileSync(imageUrl);
        let base64Image = imageBuffer.toString('base64');
        imageUrl = 'data:image/png;base64,' + base64Image
    }
           
    
    var randomIndex = Math.floor(Math.random() * guayao.length);
    let replacedMsg = e.msg.replace(/^#?(算一卦|算卦)/, '');
    let content = [e.nickname + '心中所念' + (replacedMsg ? '“' + replacedMsg + '”' : '') + '卦象如下:'];

    let yunshi = await redis.get(`Yunzai:logier-plugin:${e.user_id}_suanyigua`);
    let data;
    
    if (yunshi) {
      data = JSON.parse(yunshi);
      let now = new Date();
      let lastUpdated = new Date(data.time);
      if (isResuangua) {
          if (!data.isResuangua && isSameDay(now, lastUpdated)) {
              logger.info('[算一卦]：悔卦，重新抽取');
              let possibleIndexes = [...Array(guayao.length).keys()].filter(i => i !== data.item);  // 创建一个过滤后的数组
              data.item = possibleIndexes[Math.floor(Math.random() * possibleIndexes.length)];  // 从过滤后的数组中随机选择一个新的索引
              data.time = now;
              data.isResuangua = true;
          } else if (data.isResuangua) {
              e.reply(['小小', segment.at(e.user_id), '竟敢不自量力，一天只可以悔卦一次'], true);
              return;
          }
      }
      randomIndex = data.item;
  } else {
      logger.info('[算一卦]：首次测算卦象');
      randomIndex = Math.floor(Math.random() * guayao.length);
      data = {
          item: randomIndex,
          time: new Date(),
          isResuangua: false
      };
  }
    await redis.set(`Yunzai:logier-plugin:${e.user_id}_suanyigua`, JSON.stringify(data));

    let message = isResuangua ? ["异变骤生！", segment.at(e.user_id), '的卦象竟然变为了……'] : "正在为您测算……";
    e.reply(message, true, { recallMsg: 10 });

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
             background: rgba(255, 255, 255, 0.6);
             z-index:1;
             position:absolute;
           }
           p {
             color : rgba(0,0,0, 0.5);
             font-size:1.5rem;
             padding: 2px; 
             word-wrap: break-word;
             white-space: pre-wrap;
             text-align: center; 
           }
           .centered-content {
             display: flex;
             flex-direction: column;
             justify-content: flex-start;
             align-items: center;
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
              <br>
               <p>${content}</p>
               <br>
               <p style="text-shadow:3px 3px 2px rgba(-20,-10,4,.3);">${guayao[randomIndex]}</p>
               <p>${guachi[randomIndex]}</p>
             </div>
             <br>
             <p style="font-weight: bold; margin-bottom: 20px;">Create By Logier-Plugin </p>
           </div>
           </body>
           </html>
           `
       
           await page.setContent(Html);
           // 获取图片元素
           const imgElement = await page.$('.tu img');
           // 对图片元素进行截图
           const image = await imgElement.screenshot();

           e.reply(segment.image(image))
       
     
         } catch (error) {
           logger.error(error);
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


    async function fetchsuangua(jsonFileName) {
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
