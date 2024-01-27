import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';



/*
自定义表情包地址，支持本地和网络
├── emojihub
│   ├── capoo-emoji
│   │   ├── capoo100.gif
│   ├── greyscale-emoji
│   │   ├── greyscale100.gif
支持填写emojihub文件夹
*/
const imageUrls = [
    // 'https://t.mwm.moe/xhl',
    // '/home/Miao-Yunzai/resources/emojihub',
    // 'C:\\Users\\logie\\Pictures\\设定集'
];


// 你想要排除的表情包类别，请填写fnc的部分，别名无效
const excludeCategories = ['龙图', '小黑子'];

// emojihub调用自定义表情包的概率，0-1之间，越大调用概率越大，0为不发送，不影响主动使用
const customerrate = 0;

// 随机发送表情包的群号
const groupList = ['877538147']

// 群聊中接收到消息后随机发送表情概率，0-1之间，越大发送概率越大，0为不发送
const emojirate = 0;

// 随机发送表情包定义延迟的最小值和最大值
let minDelay = 2; //最小延时，单位：秒
let maxDelay = 10; //最大延时，单位：秒

export class autoCommand extends plugin {
    constructor() {
      super({
        name: "表情包小偷",
        dsc: "表情包小偷",
        event: "message",
        priority: 99999999,
        rule: [{
          reg: '',
          fnc: '表情包小偷',
        }],
      });
    }

    async 表情包小偷(e) {
        if (!groupList.includes(this.e.group_id.toString())) {
            return;
        }
    
        let key = `Yunzai:emojithief:${e.group_id}_logie`;
        let random = Math.random();
    
        this.e.message.forEach(async item => {
            if (item.asface) {
                let listStr = await redis.get(key);
                let list = listStr ? JSON.parse(listStr) : [];
                list.push(item.url);
                if (list.length > 50) {
                    list.shift();
                }
                await redis.set(key, JSON.stringify(list));
            }
        })
    
        // 如果随机数大于customerrate，那么调用sendEmoji函数
        if (random > emojirate) {
            return;
        } 
    
        let listStr = await redis.get(key);
    
        // 如果数据库get不到listStr，那么执行以下代码
        if (!listStr) {
            // 生成一个在最小延时和最大延时之间的随机延时
            let delay = Math.random() * (maxDelay - minDelay) + minDelay;
    
            // 决定要发送的表情包类型
            let emojiType = random > customerrate ? 'emojihub' : '自定义表情包';

            // 设置延时后发送表情包
            setTimeout(() => {
                sendEmoji(e, emojiType);
            }, delay * 1000);

            return false;
        }
    
        let list = JSON.parse(listStr);
        let randomIndex = Math.floor(Math.random() * list.length);
        let imageurl = list[randomIndex];
    
        let delay = Math.random() * (maxDelay - minDelay) + minDelay; //生成一个在最小延时和最大延时之间的随机延时
        setTimeout(() => {
            e.reply([segment.image(imageurl)]);
        }, delay *1000);
    
        return false;
    }
    
    
    
}

async function sendEmoji(e, command) {
    try {
        if (command === '自定义表情包') {
            const imageUrl = await getRandomImage(imageUrls);
            logger.info(`[表情包仓库]自定义表情包地址：${imageUrl}`);  // 打印选中的图片URL
            e.reply([segment.image(imageUrl)]);
            return false;
        }
        
        const data = await filefetchData('index.json')

        
        let categories;
        if (command === 'emojihub') {
            categories = Object.keys(data).filter(category => !excludeCategories.includes(category));
        } else {
            if (excludeCategories.includes(command) || !data.hasOwnProperty(command)) {
                logger.warn(`[表情包仓库]类别${excludeCategories.includes(command) ? '在黑名单中' : '不存在'}，操作中止`);
                return;
            }
            categories = [command];
            
        }

        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const files = data[randomCategory];
        const randomFile = files[Math.floor(Math.random() * files.length)];

        const fileURL = `${baseURL}${encodeURIComponent(randomFile)}`;
        logger.info(`[表情包仓库]表情包地址：${fileURL}`);

        e.reply([segment.image(fileURL)]);
    } catch (error) {
        logger.error(`[表情包仓库]${error}`);
    }

    return false;
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
            const fileURL = `https://gitee.com/logier/emojihub/raw/master/${jsonFileName}`;
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


// 表情包仓库的基础URL（不用改）
const baseURL = 'https://gitee.com/logier/emojihub/raw/master/';
