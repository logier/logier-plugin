import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// 自定义表情包地址
const imageUrls = [
    // 'https://t.mwm.moe/lai',
    // 'https://t.mwm.moe/xhl',
    // '/home/Miao-Yunzai/resources/emojihub',
    // '/home/Miao-Yunzai/resources/emojihub/chaijun-emoji',
];
/*
├── emojihub
│   ├── capoo-emoji
│   │   ├── capoo100.gif
│   │   ├── capoo101.gif
│   ├── greyscale-emoji
│   │   ├── greyscale100.gif
│   │   ├── greyscale101.gif

可以填写/path/to/emojihub
也可以填/path/to/emojihub/capoo-emoji
*/

// 你想要排除的表情包类别，请填写fnc的部分，别名无效
const excludeCategories = ['龙图', '小黑子'];

// emojihub调用自定义表情包的概率，0-1之间，越大调用概率越大，0为不发送
const customerrate = 0;

// 随机发送表情包的群号
// const groupList = ['315239849', 'qg_2716083353597688170-560367513']

// 群聊中接收到消息后随机发送表情概率，0-1之间，越大发送概率越大，0为不发送
// const emojirate = 1;

// 定义延迟的最小值和最大值
// let minDelay = 0; //最小延时，单位：秒
// let maxDelay = 10; //最大延时，单位：秒



export class TextMsg extends plugin {
    constructor() {
        super({
            name: 'emojihub', 
            dsc: '发送表情包',            
            event: 'message',  
            priority: 5000,   
            rule: [
                {
                    reg: '^#?(emojihub|表情包仓库|表情包)$',   
                    fnc: 'emojihub'
                },
                {
                    reg: '^#?(阿夸|aqua)$',   
                    fnc: '阿夸' 
                },
                {
                    reg: '^#?(阿尼亚)$',   
                    fnc: '阿尼亚' 
                },
                {
                    reg: '^#?(白圣女)$',   
                    fnc: '白圣女' 
                },
                {
                    reg: '^#?(柴郡|chaiq|Chaiq)$',   
                    fnc: '柴郡' 
                },
                {
                    reg: '^#?(甘城猫猫|nacho|Nacho|甘城)$',   
                    fnc: '甘城猫猫' 
                },
                {
                    reg: '^#?(狗妈|nana|Nana|神乐七奈)$',   
                    fnc: '狗妈' 
                },
                {
                    reg: '^#?(吉伊卡哇|chiikawa|Chiikawa|chikawa|Chikawa)$',   
                    fnc: '吉伊卡哇' 
                },
                {
                    reg: '^#?(龙图|long|Long)$',   
                    fnc: '龙图' 
                },
                {
                    reg: '^#?(猫猫虫咖波|猫猫虫|capoo|Capoo|咖波)$',   
                    fnc: '猫猫虫咖波' 
                },
                {
                    reg: '^#?(小黑子|坤图|ikun)$',   
                    fnc: '小黑子' 
                },
                {
                    reg: '^#?(亚托莉|亚托利|atri|ATRI)$',   
                    fnc: '亚托莉' 
                },
                {
                    reg: '^#?(真寻酱|绪山真寻|小真寻)$',   
                    fnc: '真寻酱' 
                },
                {
                    reg: '^#?(七濑胡桃|胡桃酱|Menhera|menhera)$',   
                    fnc: '七濑胡桃' 
                },
                {
                    reg: '^#?(小狐狸|兽耳酱|Kemomimi|kemomimi)$',   
                    fnc: '小狐狸' 
                },
                {
                    reg: '^#?(自定义|我的表情包)$',   
                    fnc: '自定义' 
                },
            ]
        });
    }

    async emojihub(e) {
        // 生成一个0到1之间的随机数
        let random = Math.random();
    
        // 如果随机数大于customerrate，那么调用sendEmoji函数
        if (random > customerrate) {
            sendEmoji(e, 'emojihub');
        } 
        // 否则，调用自定义函数
        else {
            getRandomImage(imageUrls).then(imageUrl => {
                logger.info('图片地址：' + imageUrl);  // 打印选中的图片URL
                e.reply([segment.image(imageUrl)]);
            });
        }
        return true;
    }
    
    async 阿夸(e) {
        sendEmoji(e, '阿夸')
    }
    async 阿尼亚(e) {
        sendEmoji(e, '阿尼亚')
    }
    async 白圣女(e) {
        sendEmoji(e, '白圣女')
    }
    async 柴郡(e) {
        sendEmoji(e, '柴郡')
    }
    async 甘城猫猫(e) {
        sendEmoji(e, '甘城猫猫')
    }
    async 吉伊卡哇(e) {
        sendEmoji(e, '吉伊卡哇')
    }
    async 龙图(e) {
        sendEmoji(e, '龙图')
    }
    async 猫猫虫咖波(e) {
        sendEmoji(e, '猫猫虫咖波')
    }
    async 小黑子(e) {
        sendEmoji(e, '小黑子')
    }
    async 亚托莉(e) {
        sendEmoji(e, '亚托莉')
    }
    async 真寻酱(e) {
        sendEmoji(e, '真寻酱')
    }
    async 七濑胡桃(e) {
        sendEmoji(e, '七濑胡桃')
    }
    async 小狐狸(e) {
        sendEmoji(e, '小狐狸')
    }
    async 自定义(e) {
        console.log(this.e.group_id)
        getRandomImage(imageUrls).then(imageUrl => {
            logger.info('图片地址：' + imageUrl);  // 打印选中的图片URL
            e.reply([segment.image(imageUrl)]);
        });
        return true
    }
    async sendRandomEmoji(e) {
        // 检查this.e.group_id是否在grouplist数组中
        if (!groupList.includes(this.e.group_id)) {
            return false;
        }
        // 生成一个minDelay到maxDelay之间的随机数
        let delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
        // 生成一个0到1之间的随机数
        let random = Math.random();
    
        // 设置延时
        setTimeout(() => {
            // 如果随机数小于，那么调用sendEmoji函数
            if (random < emojirate) {
                sendEmoji(e, 'emojihub');
            }
        }, delay * 1000);  // 转换为毫秒
    
        return true;
    }
    
    
    

}

// 异步函数 sendEmoji，用于发送表情包
async function sendEmoji(e, command) {
    try {
        // 从基础URL获取index.json文件
        const response = await fetch(baseURL + 'index.json');
        // 将响应解析为JSON数据
        const jsonData = await response.json();

        let categories;
        // 如果白名单是'emojihub'，就选取所有类别，然后去掉黑名单内的类别
        if (command === 'emojihub') {
            categories = Object.keys(jsonData).filter(category => !excludeCategories.includes(category));
            logger.info('选择除了黑名单中的所有类别');
        } else {
            // 如果白名单中的类别在黑名单中，就不继续
            if (excludeCategories.includes(command)) {
                logger.warn('类别在黑名单中，操作中止');
                return;
            }

            // 如果白名单中的类别不在jsonData中，就不继续
            if (!jsonData.hasOwnProperty(command)) {
                logger.warn('类别不存在，操作中止');
                return;
            }

            // 选择白名单中的类别
            categories = [command];
        }

        // 随机选择一个类别
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        const files = jsonData[randomCategory];
        const randomFile = files[Math.floor(Math.random() * files.length)];

        const fileURL = baseURL + encodeURIComponent(randomFile);
        logger.info('表情包地址：' + baseURL + randomFile);

        // 回复用户一个图片消息
        e.reply([segment.image(fileURL)]);
    } catch (error) {
        // 如果出现错误，记录错误日志
        logger.error(error);
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


// 表情包仓库的基础URL（不用改）
const baseURL = 'https://gitee.com/logier/emojihub/raw/master/';









    
    
    
    
    
  
    

    



    
    



