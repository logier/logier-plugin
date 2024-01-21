import puppeteer from "puppeteer";


export class TextMsg extends plugin {
    constructor() {
        super({
            name: '塔罗牌', // 插件名称
            dsc: '塔罗牌',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 6,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(塔罗牌|抽塔罗牌)$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '塔罗牌'  // 执行方法
                },

            ]
        })


}

async 塔罗牌(e) {
    let randomIndex = Math.floor(Math.random() * cards.length);
    let randomCard = cards[randomIndex];
    console.log(randomCard);

    let content = `塔罗牌: ${randomCard.name_cn}(${randomCard.name_en})\n正位: ${randomCard.meaning.up}\n逆位: ${randomCard.meaning.down}`;
    let imageurl = `https://gitee.com/logier/logier-plugin/raw/main/resourcces/%E5%A1%94%E7%BD%97%E7%89%8C/${randomCard.pic}.webp`;

    const cgColor = 'rgba(255, 255, 255, 0.6)';
    const shadowc = '0px 0px 15px rgba(0, 0, 0, 0.3)';
    const lightcg = 'brightness(100%)';
    
    let browser;
    try {
      browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
    
      let Html = `
      <html style="background: ${cgColor}">
      <head>
        <style>
        html, body {
            margin: 0;
            padding: 0;
        }        
        </style>
      </head>
      <div class="fortune" style="width: 35%; height: 65rem; float: left; text-align: center; background: ${cgColor};">
        <h2>${randomCard.name_cn}</h2>
        <p>${randomCard.name_en}</p>
        <div class="content" style="margin: 0 auto; padding: 12px 12px; height: 49rem; max-width: 980px; max-height: 1024px; background: ${cgColor}; border-radius: 15px; backdrop-filter: blur(3px); box-shadow: ${shadowc}; writing-mode: vertical-rl; text-orientation: mixed;">
          <p style="font-size: 25px;">正位: ${randomCard.meaning.up}</p>
          <p style="font-size: 25px;">逆位: ${randomCard.meaning.down}</p>
        </div>
        <p> 塔罗牌 | ${this.e.nickname} </p>
      </div>
      <div class="image" style="height:65rem; width: 65%; float: right; box-shadow: ${shadowc}; text-align: center;">
        <img src=${imageurl} style="height: 100%; filter: ${lightcg}; overflow: hidden; display: inline-block; vertical-align: middle; margin: 0; padding: 0;"/>
      </div>
    </html>
      `
    
    
    
      await page.setContent(Html)
    
      const base64 = await page.screenshot({ encoding: "base64", fullPage: true })
    
      e.reply([segment.image(`base64://${base64}`)], true)

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


    
    
}


let cards = [
        {
          "name_cn": "愚者",
          "name_en": "The Fool",
          "type": "MajorArcana",
          "meaning": {
            "up": "新的开始、冒险、自信、乐观、好的时机",
            "down": "时机不对、鲁莽、轻信、承担风险"
          }, 
          "pic": "0-愚者"
        },
        {
          "name_cn": "魔术师",
          "name_en": "The Magician",
          "type": "MajorArcana",
          "meaning": {
            "up": "创造力、主见、激情、发展潜力",
            "down": "缺乏创造力、优柔寡断、才能平庸、计划不周"
          },
          "pic": "01-魔术师"
        },
        {
          "name_cn": "女祭司",
          "name_en": "The High Priestess",
          "type": "MajorArcana",
          "meaning": {
            "up": "潜意识、洞察力、知性、研究精神",
            "down": "自我封闭、内向、神经质、缺乏理性"
          },
          "pic": "02-女祭司"
        },
        {
          "name_cn": "女皇",
          "name_en": "The Empress",
          "type": "MajorArcana",
          "meaning": {
            "up": "母性、女性特质、生命力、接纳",
            "down": "生育问题、不安全感、敏感、困扰于细枝末节"
          },
          "pic": "03-女皇"
        },
        {
          "name_cn": "皇帝",
          "name_en": "The Emperor",
          "type": "MajorArcana",
          "meaning": {
            "up": "控制、意志、领导力、权力、影响力",
            "down": "混乱、固执、暴政、管理不善、不务实"
          },
          "pic": "04-皇帝"
        },
        {
          "name_cn": "教皇",
          "name_en": "The Hierophant",
          "type": "MajorArcana",
          "meaning": {
            "up": "值得信赖的、顺从、遵守规则",
            "down": "失去信赖、固步自封、质疑权威、恶意的规劝"
          },
          "pic": "05-教皇"
        },
        {
          "name_cn": "恋人",
          "name_en": "The Lovers",
          "type": "MajorArcana",
          "meaning": {
            "up": "爱、肉体的连接、新的关系、美好时光、互相支持",
            "down": "纵欲过度、不忠、违背诺言、情感的抉择"
          },
          "pic": "06-恋人"
        },
        {
          "name_cn": "战车",
          "name_en": "The Chariot",
          "type": "MajorArcana",
          "meaning": {
            "up": "高效率、把握先机、坚韧、决心、力量、克服障碍",
            "down": "失控、挫折、诉诸暴力、冲动"
          },
          "pic": "07-战车"
        },
        {
          "name_cn": "力量",
          "name_en": "Strength",
          "type": "MajorArcana",
          "meaning": {
            "up": "勇气、决断、克服阻碍、胆识过人",
            "down": "恐惧、精力不足、自我怀疑、懦弱"
          },
          "pic": "08-力量"
        },
        {
          "name_cn": "隐士",
          "name_en": "The Hermit",
          "type": "MajorArcana",
          "meaning": {
            "up": "内省、审视自我、探索内心、平静",
            "down": "孤独、孤立、过分慎重、逃避"
          },
          "pic": "09-隐士"
        },
        {
          "name_cn": "命运之轮",
          "name_en": "The Wheel of Fortune",
          "type": "MajorArcana",
          "meaning": {
            "up": "把握时机、新的机会、幸运降临、即将迎来改变",
            "down": "厄运、时机未到、计划泡汤"
          },
          "pic": "10-命运之轮"
        },
        {
          "name_cn": "正义",
          "name_en": "Justice",
          "type": "MajorArcana",
          "meaning": {
            "up": "公平、正直、诚实、正义、表里如一",
            "down": "失衡、偏见、不诚实、表里不一"
          },
          "pic": "11-正义"
        },
        {
          "name_cn": "倒吊人",
          "name_en": "The Hanged Man",
          "type": "MajorArcana",
          "meaning": {
            "up": "进退两难、接受考验、因祸得福、舍弃行动追求顿悟",
            "down": "无畏的牺牲、利己主义、内心抗拒、缺乏远见"
          },
          "pic": "12-倒吊人"
        },
        {
          "name_cn": "死神",
          "name_en": "Death",
          "type": "MajorArcana",
          "meaning": {
            "up": "失去、舍弃、离别、死亡、新生事物的来临",
            "down": "起死回生、回心转意、逃避现实"
          },
          "pic": "13-死神"
        },
        {
          "name_cn": "节制",
          "name_en": "Temperance",
          "type": "MajorArcana",
          "meaning": {
            "up": "平衡、和谐、治愈、节制",
            "down": "失衡、失谐、沉溺愉悦、过度放纵"
          },
          "pic": "14-节制"
        },
        {
          "name_cn": "恶魔",
          "name_en": "The Devil",
          "type": "MajorArcana",
          "meaning": {
            "up": "负面影响、贪婪的欲望、物质主义、固执己见",
            "down": "逃离束缚、拒绝诱惑、治愈病痛、直面现实"
          },
          "pic": "15-恶魔"
        },
        {
          "name_cn": "高塔",
          "name_en": "The Tower",
          "type": "MajorArcana",
          "meaning": {
            "up": "急剧的转变、突然的动荡、毁灭后的重生、政权更迭",
            "down": "悬崖勒马、害怕转变、发生内讧、风暴前的寂静"
          },
          "pic": "16-高塔"
        },
        {
          "name_cn": "星星",
          "name_en": "The Star",
          "type": "MajorArcana",
          "meaning": {
            "up": "希望、前途光明、曙光出现",
            "down": "好高骛远、异想天开、事与愿违、失去目标"
          },
          "pic": "17-星星"
        },
        {
          "name_cn": "月亮",
          "name_en": "The Moon",
          "type": "MajorArcana",
          "meaning": {
            "up": "虚幻、不安与动摇、迷惘、欺骗",
            "down": "状况逐渐好转、疑虑渐消、排解恐惧"
          },
          "pic": "18-月亮"
        },
        {
          "name_cn": "太阳",
          "name_en": "The Sun",
          "type": "MajorArcana",
          "meaning": {
            "up": "活力充沛、生机、远景明朗、积极",
            "down": "意志消沉、情绪低落、无助、消极"
          },
          "pic": "19-太阳"
        },
        {
          "name_cn": "审判",
          "name_en": "Judgement",
          "type": "MajorArcana",
          "meaning": {
            "up": "命运好转、复活的喜悦、恢复健康",
            "down": "一蹶不振、尚未开始便已结束、自我怀疑、不予理睬"
          },
          "pic": "20-审判"
        },
        {
          "name_cn": "世界",
          "name_en": "The World",
          "type": "MajorArcana",
          "meaning": {
            "up": "愿望达成、获得成功、到达目的地",
            "down": "无法投入、不安现状、半途而废、盲目接受"
          },
          "pic": "21-世界"
        }
]
