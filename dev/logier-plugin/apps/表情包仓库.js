import { readAndParseJSON, readAndParseYAML, getRandomUrl } from '../utils/getdate.js'

export class TextMsg extends plugin {
    constructor() {
        super({
            name: '表情包仓库', 
            dsc: '发送表情包',            
            event: 'message',  
            priority: 5000,   
            rule: [
                {
                    reg: '^#?(emojihub|表情包仓库|表情包)$',   
                    fnc: 'emojihub'
                },
                {
                    reg: '^#?(阿夸|aqua)(表情包)?$',   
                    fnc: '阿夸' 
                },
                {
                    reg: '^#?(阿尼亚)(表情包)?$',   
                    fnc: '阿尼亚' 
                },
                {
                    reg: '^#?(白圣女)(表情包)?$',   
                    fnc: '白圣女' 
                },
                {
                    reg: '^#?(柴郡|chaiq|Chaiq)(表情包)?$',   
                    fnc: '柴郡' 
                },
                {
                    reg: '^#?(甘城猫猫|nacho|Nacho)(表情包)?$',   
                    fnc: '甘城猫猫' 
                },
                {
                    reg: '^#?(狗妈|nana|Nana|神乐七奈)(表情包)?$',   
                    fnc: '狗妈' 
                },
                {
                    reg: '^#?(吉伊卡哇|chiikawa|Chiikawa|chikawa|Chikawa)(表情包)?$',   
                    fnc: '吉伊卡哇' 
                },
                {
                    reg: '^#?(龙图|long|Long)(表情包)?$',   
                    fnc: '龙图' 
                },
                {
                    reg: '^#?(猫猫虫咖波|猫猫虫|capoo|Capoo|咖波)(表情包)?$',   
                    fnc: '猫猫虫咖波' 
                },
                {
                    reg: '^#?(小黑子|坤图|ikun)(表情包)?$',   
                    fnc: '小黑子' 
                },
                {
                    reg: '^#?(亚托莉|亚托利|atri|ATRI)(表情包)?$',   
                    fnc: '亚托莉' 
                },
                {
                    reg: '^#?(真寻酱|绪山真寻|小真寻)(表情包)?$',   
                    fnc: '真寻酱' 
                },
                {
                    reg: '^#?(七濑胡桃|胡桃酱|Menhera|menhera)(表情包)?$',   
                    fnc: '七濑胡桃' 
                },
                {
                    reg: '^#?(小狐狸|兽耳酱|Kemomimi|kemomimi)(表情包)?$',   
                    fnc: '小狐狸' 
                },
                {
                    reg: '^#?(喵内|喵内酱)(表情包)?$',   
                    fnc: '喵内' 
                },
                {
                    reg: '^#?(波奇|孤独摇滚|bochi)(表情包)?$',   
                    fnc: '孤独摇滚' 
                },
                {
                    reg: '^#?(自定义表情包|我的表情包)$',   
                    fnc: '自定义表情包' 
                },

            ]
        });
    }

    async emojihub(e) {
        sendEmoji(e, '表情包仓库')
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
    async 狗妈(e) {
        sendEmoji(e, '狗妈')
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
    }emojirate
    async 七濑胡桃(e) {
        sendEmoji(e, '七濑胡桃')
    }
    async 小狐狸(e) {
        sendEmoji(e, '小狐狸')
    }
    async 喵内(e) {
        sendEmoji(e, '喵内')
    }
    async 孤独摇滚(e) {
        sendEmoji(e, '孤独摇滚')
    }
    async 自定义表情包(e) {
        sendEmoji(e, '自定义')
    }
}
  

const BASE_URL = 'https://gitee.com/logier/emojihub/raw/master/';

async function sendEmoji(e, category) {
    try {
        const EmojiDoc = await readAndParseYAML('../config/emojihub.yaml');
        const exclude = EmojiDoc[e.group_id] || EmojiDoc['default'];

        const EmojiIndex = await readAndParseJSON('../data/EmojiIndex.json');
        const EmojiConfig = await readAndParseYAML('../config/config.yaml');

        if (exclude.includes(category)) {
            logger.info('[logier-plugin]表情包在黑名单');
        } else {
            let imageUrl;
            if (category === '表情包仓库') {
                if (Math.random() < Number(EmojiConfig.customerrate)) {
                    imageUrl = await getRandomUrl(EmojiConfig.imageUrls);
                } else {
                    let keys = Object.keys(EmojiIndex);
                    let filteredKeys = keys.filter(key => !exclude.includes(key));
                    let randomKey = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
                    let randomValue = EmojiIndex[randomKey][Math.floor(Math.random() * EmojiIndex[randomKey].length)];
                    imageUrl = `${BASE_URL}${randomKey}/${randomValue}`;
                }
            } else if (category === '自定义') {
                imageUrl = await getRandomUrl(EmojiConfig.imageUrls);
            } else if (Object.keys(EmojiIndex).includes(category)) {
                const items = EmojiIndex[category];
                const randomItem = items[Math.floor(Math.random() * items.length)];
                imageUrl = `${BASE_URL}${category}/${randomItem}`;
            }

            if (imageUrl) {
                logger.info(`[logier-plugin]发送${category}表情包`);
                e.reply([segment.image(imageUrl)]);
            }
        }
    } catch (error) {
        logger.error(`[logier-plugin] Error: ${error.message}`);
    }

    return true;
}



   



  
    

    



    
    



