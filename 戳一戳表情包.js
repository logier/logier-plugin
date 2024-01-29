import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';

/*自定义表情包地址，支持本地和网络
├── emojihub
│   ├── capoo-emoji
│   │   ├── capoo100.gif
│   ├── greyscale-emoji
│   │   ├── greyscale100.gif
可以填写/path/to/emojihub 或 /path/to/emojihub/capoo-emoji */

const imageUrls = [
    // 'https://t.mwm.moe/xhl',
    // '/home/Miao-Yunzai/resources/emojihub',
    // 'C:\\Users\\logie\\Pictures\\设定集'
];


// 你想要排除的表情包类别，请填写fnc的部分，别名无效
const excludeCategories = ['xxx1', 'xxx2'];

// emojihub调用自定义表情包的概率，0-1之间，越大调用概率越大，0为不发送，不影响主动使用
const customerrate = 0;



export class TextMsg extends plugin {
    constructor() {
        super({
            name: '戳一戳表情包', 
            dsc: '戳一戳表情包',            
            event: 'notice.group.poke',  
            priority: 5000,   
            rule: [
                {
                    fnc: 'chuoemoji'
                },
            ]
        });
    }

    async chuoemoji(e) {
        // 生成一个0到1之间的随机数
        let random = Math.random();
    
        // 如果随机数大于customerrate，那么调用sendEmoji函数
        if (random > customerrate) {
            sendEmoji(e, 'emojihub');
        } 
        // 否则，调用自定义函数
        else {
            sendEmoji(e, '自定义表情包');
        }
        return true;
    }
}

await filefetchchuoData('index.json')

// 异步函数 sendEmoji，用于发送表情包
async function sendEmoji(e, command) {
    try {
        if (command === '自定义表情包') {
            const imageUrl = await getRandomImage(imageUrls);
            logger.info(`[表情包仓库]自定义表情包地址：${imageUrl}`);  // 打印选中的图片URL
            e.reply([segment.image(imageUrl)]);
            return true;
        }
        
        const data = await filefetchchuoData('index.json')

        
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


async function filefetchchuoData(jsonFileName) {
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










    
    
    
    
    
  
    

    



    
    



