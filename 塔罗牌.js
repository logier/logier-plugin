import puppeteer from "puppeteer";
import fetch from 'node-fetch';
import fs from 'fs';

let apikey = ""; // 填入gptkey 推荐https://github.com/chatanywhere/GPT_API_free?tab=readme-ov-file#%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8



export class TextMsg extends plugin {
    constructor() {
        super({
            name: '塔罗牌', // 插件名称
            dsc: '塔罗牌',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 6,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(塔罗牌|抽塔罗牌|占卜)(.*)$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '塔罗牌'  // 执行方法
                },

            ]
        })


}

async 塔罗牌(e) {

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

}


async function 抽塔罗牌(e, 占卜内容) {
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

  // 检查apikey是否已输入
  if (!apikey) {
    apikey = fs.readFileSync('D:\\dev\\Miao-Yunzai\\plugins\\example\\apikey.txt', 'utf8').trim();
}

  const 内容 = `我请求你担任塔罗占卜师的角色。 我想占卜的内容是${占卜内容}，我抽到的牌是${randomCard.name_cn}，并且是${selection}，请您结合我想占卜的内容来解释含义,话语尽可能简洁。`;

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + apikey );
  myHeaders.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
  myHeaders.append("Content-Type", "application/json");
  
  var raw = JSON.stringify({
     "model": "gpt-3.5-turbo",
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
  
  await fetch("https://api.chatanywhere.tech/v1/chat/completions", requestOptions)
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



























let tarot = [
{
    "version": 1.2,
    "formations": {
      "圣三角牌阵": {
        "cards_num": 3,
        "is_cut": false,
        "representations": [
          ["处境", "行动", "结果"],
          ["现状", "愿望", "行动"]
        ]
      },
      "时间之流牌阵": {
        "cards_num": 3,
        "is_cut": true,
        "representations": [["过去", "现在", "未来", "问卜者的主观想法"]]
      },
      "四要素牌阵": {
        "cards_num": 4,
        "is_cut": false,
        "representations": [
          [
            "火，象征行动，行动上的建议",
            "气，象征言语，言语上的对策",
            "水，象征感情，感情上的态度",
            "土，象征物质，物质上的准备"
          ]
        ]
      },
      "五牌阵": {
        "cards_num": 5,
        "is_cut": true,
        "representations": [
          [
            "现在或主要问题",
            "过去的影响",
            "未来",
            "主要原因",
            "行动可能带来的结果"
          ]
        ]
      },
      "吉普赛十字阵": {
        "cards_num": 5,
        "is_cut": false,
        "representations": [
          [
            "对方的想法",
            "你的想法",
            "相处中存在的问题",
            "二人目前的环境",
            "关系发展的结果"
          ]
        ]
      },
      "马蹄牌阵": {
        "cards_num": 6,
        "is_cut": true,
        "representations": [
          [
            "现状",
            "可预知的情况",
            "不可预知的情况",
            "即将发生的",
            "结果",
            "问卜者的主观想法"
          ]
        ]
      },
      "六芒星牌阵": {
        "cards_num": 7,
        "is_cut": true,
        "representations": [
          ["过去", "现在", "未来", "对策", "环境", "态度", "预测结果"]
        ]
      },
      "平安扇牌阵": {
        "cards_num": 4,
        "is_cut": false,
        "representations": [
          ["人际关系现状", "与对方结识的因缘", "双方关系的发展", "双方关系的结论"]
        ]
      },
      "沙迪若之星牌阵": {
        "cards_num": 6,
        "is_cut": true,
        "representations": [
          [
            "问卜者的感受",
            "问卜者的问题",
            "问题下的影响因素",
            "将问卜者与问题纠缠在一起的往事",
            "需要注意/考虑的",
            "可能的结果"
          ]
        ]
      }
    },
    "cards": {
      "0": {
        "name_cn": "愚者",
        "name_en": "The Fool",
        "type": "MajorArcana",
        "meaning": {
          "up": "新的开始、冒险、自信、乐观、好的时机",
          "down": "时机不对、鲁莽、轻信、承担风险"
        },
        "pic": "0-愚者"
      },
      "1": {
        "name_cn": "魔术师",
        "name_en": "The Magician",
        "type": "MajorArcana",
        "meaning": {
          "up": "创造力、主见、激情、发展潜力",
          "down": "缺乏创造力、优柔寡断、才能平庸、计划不周"
        },
        "pic": "01-魔术师"
      },
      "2": {
        "name_cn": "女祭司",
        "name_en": "The High Priestess",
        "type": "MajorArcana",
        "meaning": {
          "up": "潜意识、洞察力、知性、研究精神",
          "down": "自我封闭、内向、神经质、缺乏理性"
        },
        "pic": "02-女祭司"
      },
      "3": {
        "name_cn": "女皇",
        "name_en": "The Empress",
        "type": "MajorArcana",
        "meaning": {
          "up": "母性、女性特质、生命力、接纳",
          "down": "生育问题、不安全感、敏感、困扰于细枝末节"
        },
        "pic": "03-女皇"
      },
      "4": {
        "name_cn": "皇帝",
        "name_en": "The Emperor",
        "type": "MajorArcana",
        "meaning": {
          "up": "控制、意志、领导力、权力、影响力",
          "down": "混乱、固执、暴政、管理不善、不务实"
        },
        "pic": "04-皇帝"
      },
      "5": {
        "name_cn": "教皇",
        "name_en": "The Hierophant",
        "type": "MajorArcana",
        "meaning": {
          "up": "值得信赖的、顺从、遵守规则",
          "down": "失去信赖、固步自封、质疑权威、恶意的规劝"
        },
        "pic": "05-教皇"
      },
      "6": {
        "name_cn": "恋人",
        "name_en": "The Lovers",
        "type": "MajorArcana",
        "meaning": {
          "up": "爱、肉体的连接、新的关系、美好时光、互相支持",
          "down": "纵欲过度、不忠、违背诺言、情感的抉择"
        },
        "pic": "06-恋人"
      },
      "7": {
        "name_cn": "战车",
        "name_en": "The Chariot",
        "type": "MajorArcana",
        "meaning": {
          "up": "高效率、把握先机、坚韧、决心、力量、克服障碍",
          "down": "失控、挫折、诉诸暴力、冲动"
        },
        "pic": "07-战车"
      },
      "8": {
        "name_cn": "力量",
        "name_en": "Strength",
        "type": "MajorArcana",
        "meaning": {
          "up": "勇气、决断、克服阻碍、胆识过人",
          "down": "恐惧、精力不足、自我怀疑、懦弱"
        },
        "pic": "08-力量"
      },
      "9": {
        "name_cn": "隐士",
        "name_en": "The Hermit",
        "type": "MajorArcana",
        "meaning": {
          "up": "内省、审视自我、探索内心、平静",
          "down": "孤独、孤立、过分慎重、逃避"
        },
        "pic": "09-隐士"
      },
      "10": {
        "name_cn": "命运之轮",
        "name_en": "The Wheel of Fortune",
        "type": "MajorArcana",
        "meaning": {
          "up": "把握时机、新的机会、幸运降临、即将迎来改变",
          "down": "厄运、时机未到、计划泡汤"
        },
        "pic": "10-命运之轮"
      },
      "11": {
        "name_cn": "正义",
        "name_en": "Justice",
        "type": "MajorArcana",
        "meaning": {
          "up": "公平、正直、诚实、正义、表里如一",
          "down": "失衡、偏见、不诚实、表里不一"
        },
        "pic": "11-正义"
      },
      "12": {
        "name_cn": "倒吊人",
        "name_en": "The Hanged Man",
        "type": "MajorArcana",
        "meaning": {
          "up": "进退两难、接受考验、因祸得福、舍弃行动追求顿悟",
          "down": "无畏的牺牲、利己主义、内心抗拒、缺乏远见"
        },
        "pic": "12-倒吊人"
      },
      "13": {
        "name_cn": "死神",
        "name_en": "Death",
        "type": "MajorArcana",
        "meaning": {
          "up": "失去、舍弃、离别、死亡、新生事物的来临",
          "down": "起死回生、回心转意、逃避现实"
        },
        "pic": "13-死神"
      },
      "14": {
        "name_cn": "节制",
        "name_en": "Temperance",
        "type": "MajorArcana",
        "meaning": {
          "up": "平衡、和谐、治愈、节制",
          "down": "失衡、失谐、沉溺愉悦、过度放纵"
        },
        "pic": "14-节制"
      },
      "15": {
        "name_cn": "恶魔",
        "name_en": "The Devil",
        "type": "MajorArcana",
        "meaning": {
          "up": "负面影响、贪婪的欲望、物质主义、固执己见",
          "down": "逃离束缚、拒绝诱惑、治愈病痛、直面现实"
        },
        "pic": "15-恶魔"
      },
      "16": {
        "name_cn": "高塔",
        "name_en": "The Tower",
        "type": "MajorArcana",
        "meaning": {
          "up": "急剧的转变、突然的动荡、毁灭后的重生、政权更迭",
          "down": "悬崖勒马、害怕转变、发生内讧、风暴前的寂静"
        },
        "pic": "16-高塔"
      },
      "17": {
        "name_cn": "星星",
        "name_en": "The Star",
        "type": "MajorArcana",
        "meaning": {
          "up": "希望、前途光明、曙光出现",
          "down": "好高骛远、异想天开、事与愿违、失去目标"
        },
        "pic": "17-星星"
      },
      "18": {
        "name_cn": "月亮",
        "name_en": "The Moon",
        "type": "MajorArcana",
        "meaning": {
          "up": "虚幻、不安与动摇、迷惘、欺骗",
          "down": "状况逐渐好转、疑虑渐消、排解恐惧"
        },
        "pic": "18-月亮"
      },
      "19": {
        "name_cn": "太阳",
        "name_en": "The Sun",
        "type": "MajorArcana",
        "meaning": {
          "up": "活力充沛、生机、远景明朗、积极",
          "down": "意志消沉、情绪低落、无助、消极"
        },
        "pic": "19-太阳"
      },
      "20": {
        "name_cn": "审判",
        "name_en": "Judgement",
        "type": "MajorArcana",
        "meaning": {
          "up": "命运好转、复活的喜悦、恢复健康",
          "down": "一蹶不振、尚未开始便已结束、自我怀疑、不予理睬"
        },
        "pic": "20-审判"
      },
      "21": {
        "name_cn": "世界",
        "name_en": "The World",
        "type": "MajorArcana",
        "meaning": {
          "up": "愿望达成、获得成功、到达目的地",
          "down": "无法投入、不安现状、半途而废、盲目接受"
        },
        "pic": "21-世界"
      },
      "22": {
        "name_cn": "宝剑ACE",
        "name_en": "Ace of Swords",
        "type": "Swords",
        "meaning": {
          "up": "有进取心和攻击性、敏锐、理性、成功的开始",
          "down": "易引起争端、逞强而招致灾难、偏激专横、不公正的想法"
        },
        "pic": "宝剑-01"
      },
      "23": {
        "name_cn": "宝剑2",
        "name_en": "II of Swords",
        "type": "Swords",
        "meaning": {
          "up": "想法的对立、选择的时机、意见不合且暗流汹涌",
          "down": "做出选择但流言与欺诈会浮出水面、犹豫不决导致错失机会"
        },
        "pic": "宝剑-02"
      },
      "24": {
        "name_cn": "宝剑3",
        "name_en": "III of Swords",
        "type": "Swords",
        "meaning": {
          "up": "感情受到伤害、生活中出现麻烦、自怜自哀",
          "down": "心理封闭、情绪不安、逃避、伤害周边的人"
        },
        "pic": "宝剑-03"
      },
      "25": {
        "name_cn": "宝剑4",
        "name_en": "IV of Swords",
        "type": "Swords",
        "meaning": {
          "up": "养精蓄锐、以退为进、放缓行动、留意总结",
          "down": "即刻行动、投入生活、未充分准备却慌忙应对"
        },
        "pic": "宝剑-04"
      },
      "26": {
        "name_cn": "宝剑5",
        "name_en": "V of Swords",
        "type": "Swords",
        "meaning": {
          "up": "矛盾冲突、不择手段伤害对方、赢得比赛却失去关系",
          "down": "找到应对方法、冲突有解决的可能性、双方愿意放下武器"
        },
        "pic": "宝剑-05"
      },
      "27": {
        "name_cn": "宝剑6",
        "name_en": "VI of Swords",
        "type": "Swords",
        "meaning": {
          "up": "伤口迟迟没能痊愈、现在没有很好的对策、未来存在更多的艰难",
          "down": "深陷于困难、鲁莽地解决却忽视背后更大的问题、需要其他人的帮助或救援"
        },
        "pic": "宝剑-06"
      },
      "28": {
        "name_cn": "宝剑7",
        "name_en": "VII of Swords",
        "type": "Swords",
        "meaning": {
          "up": "疏忽大意、有隐藏很深的敌人、泄密、非常手段或小伎俩无法久用",
          "down": "意想不到的好运、计划不周全、掩耳盗铃"
        },
        "pic": "宝剑-07"
      },
      "29": {
        "name_cn": "宝剑8",
        "name_en": "VIII of Swords",
        "type": "Swords",
        "meaning": {
          "up": "孤立无助、陷入艰难处境、受困于想法导致行动受阻",
          "down": "摆脱束缚、脱离危机、重新起步"
        },
        "pic": "宝剑-08"
      },
      "30": {
        "name_cn": "宝剑9",
        "name_en": "IX of Swords",
        "type": "Swords",
        "meaning": {
          "up": "精神上的恐惧、害怕、焦虑、前路不顺的预兆",
          "down": "事情出现转机、逐渐摆脱困境、沉溺于过去、正视现实"
        },
        "pic": "宝剑-09"
      },
      "31": {
        "name_cn": "宝剑10",
        "name_en": "X of Swords",
        "type": "Swords",
        "meaning": {
          "up": "进展严重受阻、无路可走、面临绝境、重新归零的机会",
          "down": "绝处逢生、东山再起的希望、物极必反"
        },
        "pic": "宝剑-10"
      },
      "32": {
        "name_cn": "宝剑国王",
        "name_en": "King of Swords",
        "type": "Swords",
        "meaning": {
          "up": "公正、权威、领导力、冷静",
          "down": "思想偏颇、强加观念、极端、不择手段"
        },
        "pic": "宝剑国王"
      },
      "33": {
        "name_cn": "宝剑王后",
        "name_en": "Queen of Swords",
        "type": "Swords",
        "meaning": {
          "up": "理性、思考敏捷、有距离感、公正不阿",
          "down": "固执、想法偏激、高傲、盛气凌人"
        },
        "pic": "宝剑王后"
      },
      "34": {
        "name_cn": "宝剑骑士",
        "name_en": "Knight of Swords",
        "type": "Swords",
        "meaning": {
          "up": "勇往直前的行动力、充满激情",
          "down": "计划不周、天马行空、缺乏耐心、做事轻率、自负"
        },
        "pic": "宝剑骑士"
      },
      "35": {
        "name_cn": "宝剑侍从",
        "name_en": "Page of Swords",
        "type": "Swords",
        "meaning": {
          "up": "思维发散、洞察力、谨慎的判断",
          "down": "短见、做事虎头蛇尾、对信息不加以过滤分析"
        },
        "pic": "宝剑侍从"
      },
      "36": {
        "name_cn": "权杖ACE",
        "name_en": "Ace of Wands",
        "type": "Wands",
        "meaning": {
          "up": "新的开端、新的机遇、燃烧的激情、创造力",
          "down": "新行动失败的可能性比较大、开端不佳、意志力薄弱"
        },
        "pic": "权杖-01"
      },
      "37": {
        "name_cn": "权杖2",
        "name_en": "II of Wands",
        "type": "Wands",
        "meaning": {
          "up": "高瞻远瞩、规划未来、在习惯与希望间做选择",
          "down": "犹豫不决、行动受阻、花费太多时间在选择上"
        },
        "pic": "权杖-02"
      },
      "38": {
        "name_cn": "权杖3",
        "name_en": "II of Wands",
        "type": "Wands",
        "meaning": {
          "up": "探索的好时机、身心灵的契合、领导能力、主导地位",
          "down": "合作不顺、欠缺领导能力、团队不和谐"
        },
        "pic": "权杖-03"
      },
      "39": {
        "name_cn": "权杖4",
        "name_en": "IV of Wands",
        "type": "Wands",
        "meaning": {
          "up": "和平繁荣、关系稳固、学业或事业发展稳定",
          "down": "局势失衡、稳固的基础被打破、人际关系不佳、收成不佳"
        },
        "pic": "权杖-04"
      },
      "40": {
        "name_cn": "权杖5",
        "name_en": "V of Wands",
        "type": "Wands",
        "meaning": {
          "up": "竞争、冲突、内心的矛盾、缺乏共识",
          "down": "不公平的竞争、达成共识"
        },
        "pic": "权杖-05"
      },
      "41": {
        "name_cn": "权杖6",
        "name_en": "VI of Wands",
        "type": "Wands",
        "meaning": {
          "up": "获得胜利、成功得到回报、进展顺利、有望水到渠成",
          "down": "短暂的成功、骄傲自满、失去自信"
        },
        "pic": "权杖-06"
      },
      "42": {
        "name_cn": "权杖7",
        "name_en": "VII of Wands",
        "type": "Wands",
        "meaning": {
          "up": "坚定信念、态度坚定、内芯的权衡与决断、相信自己的观点与能力",
          "down": "对自己的能力产生怀疑、缺乏自信与动力、缺乏意志力"
        },
        "pic": "权杖-07"
      },
      "43": {
        "name_cn": "权杖8",
        "name_en": "VIII of Wands",
        "type": "Wands",
        "meaning": {
          "up": "目标明确、一鼓作气、进展神速、趁热打铁、旅行",
          "down": "方向错误、行动不一致、急躁冲动、计划延误"
        },
        "pic": "权杖-08"
      },
      "44": {
        "name_cn": "权杖9",
        "name_en": "IX of Wands",
        "type": "Wands",
        "meaning": {
          "up": "做好准备以应对困难、自我防御、蓄势待发、力量的对立",
          "down": "遭遇逆境、失去自信、士气低落"
        },
        "pic": "权杖-09"
      },
      "45": {
        "name_cn": "权杖10",
        "name_en": "X of Wands",
        "type": "Wands",
        "meaning": {
          "up": "责任感、内芯的热忱、过重的负担、过度劳累",
          "down": "难以承受的压力、高估自身的能力、调整自己的步调、逃避责任"
        },
        "pic": "权杖-10"
      },
      "46": {
        "name_cn": "权杖国王",
        "name_en": "King of Wands",
        "type": "Wands",
        "meaning": {
          "up": "行动力强、态度明确、运筹帷幄、领袖魅力",
          "down": "独断专行、严苛、态度傲慢"
        },
        "pic": "权杖国王"
      },
      "47": {
        "name_cn": "权杖王后",
        "name_en": "Queen of Wands",
        "type": "Wands",
        "meaning": {
          "up": "刚柔并济、热情而温和、乐观而活泼",
          "down": "情绪化、信心不足、热情消退、孤独"
        },
        "pic": "权杖王后"
      },
      "48": {
        "name_cn": "权杖骑士",
        "name_en": "Knight of Wands",
        "type": "Wands",
        "meaning": {
          "up": "行动力、精力充沛、新的旅程、对现状不满足的改变",
          "down": "有勇无谋、鲁莽、行动延迟、计划不周、急躁"
        },
        "pic": "权杖骑士"
      },
      "49": {
        "name_cn": "权杖侍从",
        "name_en": "Page of Wands",
        "type": "Wands",
        "meaning": {
          "up": "新计划的开始、尝试新事物、好消息传来",
          "down": "三分钟热度、规划太久导致进展不顺、坏消息传来"
        },
        "pic": "权杖侍从"
      },
      "50": {
        "name_cn": "圣杯ACE",
        "name_en": "Ace of Cups",
        "type": "Cups",
        "meaning": {
          "up": "新恋情或新友情、精神愉悦、心灵满足",
          "down": "情感缺失、缺乏交流、虚情假意"
        },
        "pic": "圣杯-01"
      },
      "51": {
        "name_cn": "圣杯2",
        "name_en": "II of Cups",
        "type": "Cups",
        "meaning": {
          "up": "和谐对等的关系、情侣间的相互喜爱、合作顺利",
          "down": "两性关系趋于极端、情感的割裂、双方不平等、冲突"
        },
        "pic": "圣杯-02"
      },
      "52": {
        "name_cn": "圣杯3",
        "name_en": "III of Cups",
        "type": "Cups",
        "meaning": {
          "up": "达成合作、努力取得成果",
          "down": "乐极生悲、无法达成共识、团队不和"
        },
        "pic": "圣杯-03"
      },
      "53": {
        "name_cn": "圣杯4",
        "name_en": "IV of Cups",
        "type": "Cups",
        "meaning": {
          "up": "身心俱疲、缺乏动力、对事物缺乏兴趣、情绪低潮",
          "down": "新的人际关系、有所行动、脱离低潮期"
        },
        "pic": "圣杯-04"
      },
      "54": {
        "name_cn": "圣杯5",
        "name_en": "V of Cups",
        "type": "Cups",
        "meaning": {
          "up": "过度注意失去的事物、自责、自我怀疑、因孤傲而拒绝外界帮助",
          "down": "走出悲伤、破釜沉舟、东山再起"
        },
        "pic": "圣杯-05"
      },
      "55": {
        "name_cn": "圣杯6",
        "name_en": "VI of Cups",
        "type": "Cups",
        "meaning": {
          "up": "思乡、美好的回忆、纯真的情感、简单的快乐、安全感",
          "down": "沉溺于过去、不美好的回忆、不甘受束缚"
        },
        "pic": "圣杯-06"
      },
      "56": {
        "name_cn": "圣杯7",
        "name_en": "VII of Cups",
        "type": "Cups",
        "meaning": {
          "up": "不切实际的幻想、不踏实的人际关系、虚幻的情感、生活混乱",
          "down": "看清现实、对物质的不满足、做出明智的选择"
        },
        "pic": "圣杯-07"
      },
      "57": {
        "name_cn": "圣杯8",
        "name_en": "VIII of Cups",
        "type": "Cups",
        "meaning": {
          "up": "离开熟悉的人事物、不沉醉于目前的成果、经考虑后的行动",
          "down": "犹豫不决、失去未来的规划、维持现状"
        },
        "pic": "圣杯-08"
      },
      "58": {
        "name_cn": "圣杯9",
        "name_en": "IX of Cups",
        "type": "Cups",
        "meaning": {
          "up": "愿望极有可能实现、满足现状、物质与精神富足",
          "down": "物质受损失、不懂节制、寻求更高层次的快乐"
        },
        "pic": "圣杯-09"
      },
      "59": {
        "name_cn": "圣杯10",
        "name_en": "X of Cups",
        "type": "Cups",
        "meaning": {
          "up": "团队和谐、人际关系融洽、家庭和睦",
          "down": "团队不和、人际关系不和、冲突"
        },
        "pic": "圣杯-10"
      },
      "60": {
        "name_cn": "圣杯国王",
        "name_en": "King of Cups",
        "type": "Cups",
        "meaning": {
          "up": "创造力、决策力、某方面的专家、有条件的分享或交换",
          "down": "表里不一、行为另有所图、对自我创造力的不信任"
        },
        "pic": "圣杯国王"
      },
      "61": {
        "name_cn": "圣杯王后",
        "name_en": "Queen of Cups",
        "type": "Cups",
        "meaning": {
          "up": "感情丰富而细腻、重视直觉、感性的思考",
          "down": "过度情绪化、用情不专、心灵的孤立"
        },
        "pic": "圣杯王后"
      },
      "62": {
        "name_cn": "圣杯骑士",
        "name_en": "Knight of Cups",
        "type": "Cups",
        "meaning": {
          "up": "在等待与行动之间做出决定、新的机会即将到来",
          "down": "用情不专、消极的等待、对于情感的行动错误"
        },
        "pic": "圣杯骑士"
      },
      "63": {
        "name_cn": "圣杯侍从",
        "name_en": "Page of Cups",
        "type": "Cups",
        "meaning": {
          "up": "情感的表达与奉献、积极的消息即将传来、情感的追求但不成熟",
          "down": "情感的追求但错误、感情暧昧、过度执着于情感或问题"
        },
        "pic": "圣杯侍从"
      },
      "64": {
        "name_cn": "星币ACE",
        "name_en": "Ace of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "新的机遇、顺利发展、物质回报",
          "down": "金钱上的损失、发展不顺、物质丰富但精神虚空"
        },
        "pic": "星币-01"
      },
      "65": {
        "name_cn": "星币2",
        "name_en": "II of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "收支平衡、财富的流通、生活的波动与平衡",
          "down": "用钱过度、难以维持平衡、面临物质的损失"
        },
        "pic": "星币-02"
      },
      "66": {
        "name_cn": "星币3",
        "name_en": "III of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "团队合作、沟通顺畅、工作熟练、关系稳定",
          "down": "分工不明确、人际关系不和、专业技能不足"
        },
        "pic": "星币-03"
      },
      "67": {
        "name_cn": "星币4",
        "name_en": "IV of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "安于现状、吝啬、守财奴、财富停滞、精神匮乏",
          "down": "入不敷出、奢侈无度、挥霍"
        },
        "pic": "星币-04"
      },
      "68": {
        "name_cn": "星币5",
        "name_en": "V of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "经济危机、同甘共苦、艰难时刻",
          "down": "居住问题、生活混乱、劳燕分飞"
        },
        "pic": "星币-05"
      },
      "69": {
        "name_cn": "星币6",
        "name_en": "VI of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "慷慨、给予、礼尚往来、财务稳定且乐观",
          "down": "自私、暗藏心机、负债或在情义上亏欠于人"
        },
        "pic": "星币-06"
      },
      "70": {
        "name_cn": "星币7",
        "name_en": "VII of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "等待时机成熟、取得阶段性成果、思考计划",
          "down": "事倍功半、投资失利、踟蹰不决"
        },
        "pic": "星币-07"
      },
      "71": {
        "name_cn": "星币8",
        "name_en": "VIII of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "工作专注、技能娴熟、进取心、做事有条理",
          "down": "精力分散、工作乏味、工作产出不佳"
        },
        "pic": "星币-08"
      },
      "72": {
        "name_cn": "星币9",
        "name_en": "IX of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "事业收获、持续为自己创造有利条件、懂得理财储蓄",
          "down": "失去财富、舍弃金钱追求生活、管理能力欠缺"
        },
        "pic": "星币-09"
      },
      "73": {
        "name_cn": "星币10",
        "name_en": "X of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "团队和谐、成功的事业伙伴、家族和谐",
          "down": "团队不和、投资合伙暂缓、家庭陷入不和"
        },
        "pic": "星币-10"
      },
      "74": {
        "name_cn": "星币国王",
        "name_en": "King of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "成功人士、追求物质、善于经营、值得信赖、成熟务实",
          "down": "缺乏经济头脑、缺乏信任、管理不善、失去信赖"
        },
        "pic": "星币国王"
      },
      "75": {
        "name_cn": "星币王后",
        "name_en": "Queen of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "成熟、繁荣、值得信赖、温暖、安宁",
          "down": "爱慕虚荣、生活浮华、态度恶劣"
        },
        "pic": "星币王后"
      },
      "76": {
        "name_cn": "星币骑士",
        "name_en": "Knight of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "讲究效率、责任感赖、稳重、有计划",
          "down": "懈怠、思想保守、发展停滞不前"
        },
        "pic": "星币骑士"
      },
      "77": {
        "name_cn": "星币侍从",
        "name_en": "Page of Pentacles",
        "type": "Pentacles",
        "meaning": {
          "up": "善于思考和学习、求知欲旺盛、与知识或者研究工作有关的好消息",
          "down": "知识贫乏、自我认知不足、金钱上面临损失、视野狭窄"
        },
        "pic": "星币侍从"
      }
    }
  }
  
]
