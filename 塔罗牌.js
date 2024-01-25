import puppeteer from "puppeteer";
import common from '../../lib/common/common.js' 

let apikey = ""; // 填入gptkey 推荐https://github.com/chatanywhere/GPT_API_free?tab=readme-ov-file#%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8

let model = "gpt-3.5-turbo";
let gpturl = "https://api.chatanywhere.tech/v1/chat/completions";



export class TextMsg extends plugin {
    constructor() {
        super({
            name: '塔罗牌', // 插件名称
            dsc: '塔罗牌',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 6,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '^#?(抽塔罗牌)\\s(.*)$',   // 正则表达式,有关正则表达式请自行百度
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
  let 占卜内容 = this.e.msg.replace(/^#?(占卜)/, '');
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
  
      let forwardmsg = `你抽到的第${i+1}张牌是\n${randomCard.name_cn} (${randomCard.name_en})\n${position === 'up' ? '正位' : '逆位'}:${randomMeanings[i]}\n${randomDescriptions[i]}`
  
      forward.push(forwardmsg, segment.image(imageurl))
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






let tarot = [
  {
      "version": 1.2,
      "formations": {
        "圣三角牌阵": {
          "cards_num": 3,
          "is_cut": false,
          "representations": [
            [
              "处境",
              "行动",
              "结果"
            ],
            [
              "现状",
              "愿望",
              "行动"
            ]
          ]
        },
        "时间之流牌阵": {
          "cards_num": 3,
          "is_cut": true,
          "representations": [
            [
              "过去",
              "现在",
              "未来",
              "问卜者的主观想法"
            ]
          ]
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
            [
              "过去",
              "现在",
              "未来",
              "对策",
              "环境",
              "态度",
              "预测结果"
            ]
          ]
        },
        "平安扇牌阵": {
          "cards_num": 4,
          "is_cut": false,
          "representations": [
            [
              "人际关系现状",
              "与对方结识的因缘",
              "双方关系的发展",
              "双方关系的结论"
            ]
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
          "pic": "0-愚者",
          "Brand_Link": "https://tarotchina.net/major-arcana0-vip/",
          "info": {
            "description": "愚人是一张代表自发性行为的塔罗牌，一段跳脱某种状态的日子，或尽情享受眼前日子的一段时光。好冒险，有梦想，不拘泥于传统的观念，自由奔放，居无定所，一切从基础出发。当你周遭的人都对某事提防戒慎，你却打算去冒这个险时，愚人牌可能就会出现。愚人暗示通往成功之路是经由自发的行动，而长期的计划则是将来的事。",
            "reverseDescription": "暗示当你被要求有所承诺时，却想从责任当中寻求解脱。你正在找一个脱身之道，然而目前并不是这么做的时机。现在是你对自己的将来有所承诺，或是解决过去问题的时候了，如此你才能够重新过着自发性的生活。在你能够安全出发之前，还有某些未完成的事情需要你去处理。"
          }
        },
        "1": {
          "name_cn": "魔术师",
          "name_en": "The Magician",
          "type": "MajorArcana",
          "meaning": {
            "up": "创造力、主见、激情、发展潜力",
            "down": "缺乏创造力、优柔寡断、才能平庸、计划不周"
          },
          "pic": "01-魔术师",
          "Brand_Link": "https://tarotchina.net/major-arcana1-vip/",
          "info": {
            "description": "这是个着手新事物的适当时机。对的时间，对的机会，对的动机，使你的努力值回票价。对于展开行动，实现计划而言，这正是一个良好时机。由于你已为实现计划扎下良好基础，所以新的冒险很可能会实现。清楚的方向感和意志力的贯彻，大大的提升了成功的可能性。",
            "reverseDescription": "对别人进行控制可能导致毁掉对方，可能是暗中作梗，或以任何他想得到的方法，这可能包括妖术，雇人暗杀，自己动手。也可能做出违反社会的行为。可能会变得不切实际，而导致精神，情感或身体健康上出问题；会变的漫无目标且缺乏自律。"
          }
        },
        "2": {
          "name_cn": "女祭司",
          "name_en": "The High Priestess",
          "type": "MajorArcana",
          "meaning": {
            "up": "潜意识、洞察力、知性、研究精神",
            "down": "自我封闭、内向、神经质、缺乏理性"
          },
          "pic": "02-女祭司",
          "Brand_Link": "https://tarotchina.net/major-arcana2-vip/",
          "info": {
            "description": "你应该要相信你的直觉，因为在这一点上，有些东西你可能看不见。高位的女教皇是一张代表精神和心灵发展的牌。它代表了向内心探索的一段时期，以便为你人生的下一个阶段播种，或者去消化你在肉体的层次上所处理的事情。",
            "reverseDescription": "你没有办法倾听你内在的声音，或你内在的知识没有办法转化成行动。这个时候应当出去走走，认识新朋友，因为刚认识的人可以帮你介绍新的可能以及机会。例如，你可能会因此而找到新工作或新伴侣，或者得到崭新的理解。"
          }
        },
        "3": {
          "name_cn": "女皇",
          "name_en": "The Empress",
          "type": "MajorArcana",
          "meaning": {
            "up": "母性、女性特质、生命力、接纳",
            "down": "生育问题、不安全感、敏感、困扰于细枝末节"
          },
          "pic": "03-女皇",
          "Brand_Link": "https://tarotchina.net/major-arcana3-vip/",
          "info": {
            "description": "生活优雅而富贵，充满了喜悦，有艺术天分，善于营造气氛，人生经历丰富，家庭观念重。如果求问者是男性，可能暗示与女性有纠缠，或女性气质强。",
            "reverseDescription": "在家庭环境或某段两性关系中遭遇到的困难。可能无法实现自己的计划或在某段关系中，没有办法打心里去爱，因为对爱过于知性或理想化了。另一层意思可说是，冷静地思考所有的选择之后，运用理性来解决问题。"
          }
        },
        "4": {
          "name_cn": "皇帝",
          "name_en": "The Emperor",
          "type": "MajorArcana",
          "meaning": {
            "up": "控制、意志、领导力、权力、影响力",
            "down": "混乱、固执、暴政、管理不善、不务实"
          },
          "pic": "04-皇帝",
          "Brand_Link": "https://tarotchina.net/major-arcana4-vip/",
          "info": {
            "description": "透过自律和实际的努力而达到成功。这可以代表你生活中一段相当稳定，且井然有序的时光。也暗示遭遇到法律上的问题，或是碰到某个地位，权利都在你之上的人，例如法官，警员，父亲，或具有父亲形象的人。为了成功，现在正是你采取务实态度来面对人生的时候。你被周遭的人设下种种限制，但只要你能在这些限制之内努力的话，你还是可以达成你的目标的。",
            "reverseDescription": "由于缺乏自律而无法成功。有时候可能会在面临严苛抉择时退却下来，因为你缺乏向目标迈进的勇气。丧失了皇帝正位时的管理特质，所以容易失去掌控的能力与缺乏先机，无法承担责任，没有担当，懦弱，刚愎自用。另一方面，也会处处提防他人，显得防卫心极强，疑神疑鬼。"
          }
        },
        "5": {
          "name_cn": "教皇",
          "name_en": "The Hierophant",
          "type": "MajorArcana",
          "meaning": {
            "up": "值得信赖的、顺从、遵守规则",
            "down": "失去信赖、固步自封、质疑权威、恶意的规劝"
          },
          "pic": "05-教皇",
          "Brand_Link": "https://tarotchina.net/major-arcana5-vip/",
          "info": {
            "description": "教皇暗示你向某人或某个团体的人屈服了。或许这正是你为自己，及心灵上的需求负起责任的时刻了。你目前的行事作风并非应付事情的唯一方式，假设你愿意加以探索的话，或许你就会找到新的可能。",
            "reverseDescription": "代表新思想，观念的形成，或拒绝一些流于俗态的观念。它也可以说你在为自己人生写脚本，照着自己对生命的理解而活。现在你正为自己的心灵发展负起责任，虽然道路可能是崎岖不平的，然而这通常是值得的。"
          }
        },
        "6": {
          "name_cn": "恋人",
          "name_en": "The Lovers",
          "type": "MajorArcana",
          "meaning": {
            "up": "爱、肉体的连接、新的关系、美好时光、互相支持",
            "down": "纵欲过度、不忠、违背诺言、情感的抉择"
          },
          "pic": "06-恋人",
          "Brand_Link": "https://tarotchina.net/major-arcana6-vip/",
          "info": {
            "description": "恋人是一张代表决定的牌，而且除非顾客问的是某个特定的问题，否则它通常是指有关两性关系的决定。它可能是在描述沉浸在爱恋之中的过程，因为它可以意指一段两性关系中的最初，或者是罗曼蒂克的阶级。恋人牌也可以形容在决定到底要保留旧有的关系，或转进新关系当中。它暗示你已经由过去经验而得到成长了，因此你可以安全的迈向一个新的阶段。",
            "reverseDescription": "恋人牌的逆位与正位的差异并不大，仍然有选择的意思。只不过恋人正位更趋向于“选择开始”，当事人也有更多主动权，而逆位更趋向于“选择结束”，当事人也有被迫选择（接受）的意味。一张牌变成逆位，经常是外在条件不足所带来的迟滞或当事人内在的抗拒所造成的。本该发生的事情没有发生，本该接受的事实没有接受，塔罗便会把这种情况以逆位的形式表达出现。人面对选择的时候常常会犹豫，逃避，害怕承担自主选择所带来的责任，结果反而丧失了主动权。但不论是主动的选择还是被动的选择，承担其后果的永远都是当事人自身。恋人是一个机会，抓住这个机会选择自己想要的方向，才是明智的人应该做的。\r代表欲求不满，多愁善感和迟疑不决，意味着任何追求相互关系新阶段的努力，都只能建立在期待和梦想上，还是维持原状较好。也可能在暗示一段关系的结束，或是一种毁灭性的关系，并暗示逃避责任和承诺。"
          }
        },
        "7": {
          "name_cn": "战车",
          "name_en": "The Chariot",
          "type": "MajorArcana",
          "meaning": {
            "up": "高效率、把握先机、坚韧、决心、力量、克服障碍",
            "down": "失控、挫折、诉诸暴力、冲动"
          },
          "pic": "07-战车",
          "Brand_Link": "https://tarotchina.net/major-arcana7-vip/",
          "info": {
            "description": "不论正道多么艰险难行，你都得继续走下去。同时，他也暗示这个人(通常是男人)，掌控着他自己和周遭的事物。”不要放弃”是这张牌的关键主题。你必须控制住生命中互相对抗的力量。正立的战车也可能指一桩重要的生意，或具有重大意义的成功。在爱情上，它暗示控制你的情绪，对两性关系是有帮助的，传达着＂不要放弃＂的讯息。只要你能协调好关系中的冲突，用理智去超越恐惧和欲望，就能看出问题的解决之道。你应该抛开过去的束缚，并从中吸取教训。",
            "reverseDescription": "逆位战车所体现的是一种思维极度混乱的状态，巨大的压力已经把英雄压垮了，情绪代替了判断，冲动代替了控制，战车上的英雄已经心有余而力不足，只能由着两匹战马使性狂奔。“情绪肆虐”是此时最好的形容词，而一把情绪的火能把一切精心建立的基业都烧毁。冷静与自律是此时唯一的建议，而一个想成为英雄的人应能依靠自己的能力扭转这样的败局，否则他的功业总是不会长久的。\r暗示专制的态度和拙劣的方向感，可能被情绪蒙蔽了视线导致情绪化的判断事件。它象征太过于多愁善感，或因悬而未决的感情，影响了你对事物的看法。"
          }
        },
        "8": {
          "name_cn": "力量",
          "name_en": "Strength",
          "type": "MajorArcana",
          "meaning": {
            "up": "勇气、决断、克服阻碍、胆识过人",
            "down": "恐惧、精力不足、自我怀疑、懦弱"
          },
          "pic": "08-力量",
          "Brand_Link": "https://tarotchina.net/major-arcana8-vip/",
          "info": {
            "description": "力量正位表示当事人能量旺盛，有逢凶化吉，遇难呈祥的潜质。但谋事在人，成事在天，力量所体现的仅仅是“人”这个部分。有时由于种种因缘巧合，当事人虽然身手了得，却也未必能取得圆满的结果。具体事件会怎样发生，大多数时候还是要配合其他牌才能了解。",
            "reverseDescription": "力量的逆位并不复杂，就是“没力量”，也就是软弱。人的软弱可以体现在很多方面，依赖他人，推卸责任，甚至是恃强凌弱……越是软弱的人就越可能把自己伪装得极其强势，好像老虎屁股摸不得，其实却是外强中干。有时候当你在生活中感到无力时，你可能会去找你可以支配的某个人或事物，来帮助自己再度感到强而有力。在这期间你可能会发现自己在任何关系中，对别人不是太颐指气使，就是过分恭顺。"
          }
        },
        "9": {
          "name_cn": "隐士",
          "name_en": "The Hermit",
          "type": "MajorArcana",
          "meaning": {
            "up": "内省、审视自我、探索内心、平静",
            "down": "孤独、孤立、过分慎重、逃避"
          },
          "pic": "09-隐士",
          "Brand_Link": "https://tarotchina.net/major-arcana9-vip/",
          "info": {
            "description": "隐士是一个寻求答案的人，在黑暗中摸索，期望得到真理之光。因此。此张牌含有解决问题，开导迷茫着的涵义。这张牌代表独处，心智保持寂静，这样你才能听见自己心底的声音，想要得到内在的成功，你需要独自去经历一些事。跟随你的内在召唤，离开某种再也无法满足你的情境。",
            "reverseDescription": "沉溺和逃避是逆位隐士的主题。呆在自己的世界里只有孤寂，回到原来的世界中又不适应，或已经回不去，进退两难中，很多人选择了逃避。工作狂和网游成瘾，酗酒和药物滥用，每天十二小时坐在电视前看肥皂剧……隐士可以沉溺在一切可以由他独立操作的事物中，以便不去注意自己的颓废和孤独。沉溺是这样一种东西，时间越久就越难解救。对于耽溺者而言，勇敢面对固然是方法之一，他人的帮助在此时却也是必不可少的。"
          }
        },
        "10": {
          "name_cn": "命运之轮",
          "name_en": "The Wheel of Fortune",
          "type": "MajorArcana",
          "meaning": {
            "up": "把握时机、新的机会、幸运降临、即将迎来改变",
            "down": "厄运、时机未到、计划泡汤"
          },
          "pic": "10-命运之轮",
          "Brand_Link": "https://tarotchina.net/major-arcana10-vip/",
          "info": {
            "description": "通常命运之轮象征你生命境遇的改变。或许你并不了解这些改变的原因，不过在这里，你如何应对改变是比较重要的。你要迎接生命所提供给你的机会，还是要抗拒改变呢？此牌正立时就是在告诉你，要去适应这些改变。",
            "reverseDescription": "当命运之轮逆位时，所发生的改变可能是比较困难的。它暗示要努力对抗这些事件，而且通常都是徒劳无功。宇宙中蕴含着比每一个个体还要伟大的力量，所以我们必须要努力去理解，这项改变到底要教会我们什么。或许在你的生活中会有一种重复的模式，这可能意味着生命再度以同一种形式的问题，来展现其挑战性，好让你学会此问题中的教训。季节总是在更替着，而生命所展现的机会却越来越少，因此你更应好好反省过去的所作所为。"
          }
        },
        "11": {
          "name_cn": "正义",
          "name_en": "Justice",
          "type": "MajorArcana",
          "meaning": {
            "up": "公平、正直、诚实、正义、表里如一",
            "down": "失衡、偏见、不诚实、表里不一"
          },
          "pic": "11-正义",
          "Brand_Link": "https://tarotchina.net/major-arcana11-vip/",
          "info": {
            "description": "正义意味事情已经达成它应有的使命。也就是说，你过往的决定或行为已经引导你走到了目前的境遇。你已经得到你应得的了，如果你对自己是够诚实的话，你肯定知道这点。它代表你应该对自己，以及周遭的人绝对的诚实。你应该对自己以及使你成为今天这个样子的种种决定负起责任。你的未来可能会因为你目前的决定，行为或理解而改变。\r正义也可能暗示这一项有利于你的法律上的决定，或是购置某些需要签署法律文件的东西。它也可能是指成功地解决某项争议或意见相左的情形，或是负起某种状况当中你应当负其的责任。如果正义和权张六一起出现，它可能是在暗示工作上的晋升，这正是各种决定或过去行为所带来的结果（也就是说，辛勤的工作带来了报酬）。",
            "reverseDescription": "当正义倒立时，它暗示着不公不义。某个诉讼过程拖延不决；一项无止无休的争端无法协调；或是互相指责，推委责任。对于你的付出你还是会得到回报，或者说你仍可以收获到你的耕耘，只不过这不太可能会是个欢愉的收获。如果目前生命中出现了不公平或不美好的事物，或许正是你应该检视先前所播下之种子，并从中汲取教训的机会。\r你对自己或其他人可能并不诚实。你并不愿意追踪现今事件的原因，而总是因你的窘境去责备他人。如果你如此怠惰的话，恐怕会丧失了解自己，以及人生的机会。这可不是指望别人来教你的时刻，而是一个自救的时机，因果循环依旧在。你还是会受某人或某种状况的牵制，直到你洞悉并解决了先前的事端。当你留下一个悬而未决的状况，它（或与它类似的情形）会在你面前重复出现，直到你学到了教训。"
          }
        },
        "12": {
          "name_cn": "倒吊人",
          "name_en": "The Hanged Man",
          "type": "MajorArcana",
          "meaning": {
            "up": "进退两难、接受考验、因祸得福、舍弃行动追求顿悟",
            "down": "无畏的牺牲、利己主义、内心抗拒、缺乏远见"
          },
          "pic": "12-倒吊人",
          "Brand_Link": "https://tarotchina.net/major-arcana12-vip/",
          "info": {
            "description": "当你在这段期间内，透过对生命的顺从，并让它引领你到你需要去的地方，那么你便可以获益良多。你应该顺着感觉走，或是接受自己，即使别人都认为你的方式很奇怪也不打紧。它也可能象征，经历了生命中一段艰难的时光后的心灵平静。现在不是挣扎的时候，静下来好好思考你过去的行为，以及未来的计划。这只是一个暂时的状态，只要你妥善的运用这段时间，对你应该是有好处的。让生命中的事物自然而然的发生，或许你会对结果感到惊喜。",
            "reverseDescription": "逆位的倒吊者可能暗示无法得到超越社会压力的自由。它代表你会听从别人对你的期望，而非顺从你内在的声音。或许你一生都在利用角色模式引导你，而非直接去体验生活。\r它也可能意味你以某种方式在抗拒你内在的自我。或许你正抗拒着自己的某些部分，不愿顺从自己的精神目的，你可能还在为保持财产，或物质生活上的巅峰状态而奋斗。声明要求你去反省自己的方向，以及你现阶段精神的感情实现层次及情绪满足，然而你努力想要保持现状。\r你受到拘束，却拼命想要的自由。可能你并不理解目前生活的目的，或它能带给你什么，挣扎并不恰当，因为在适当的时间到来之前，你不可能得到自由。如果你能妥善的运用这段时间的话，那么当生命要你迈步向前的时候，你就不必再花时间去思考了。如果你现在不进行反省的话，可能会导致更长的耽搁，或重复的模式。得到自由要付出代价的。"
          }
        },
        "13": {
          "name_cn": "死神",
          "name_en": "Death",
          "type": "MajorArcana",
          "meaning": {
            "up": "失去、舍弃、离别、死亡、新生事物的来临",
            "down": "起死回生、回心转意、逃避现实"
          },
          "pic": "13-死神",
          "Brand_Link": "https://tarotchina.net/major-arcana13-vip/",
          "info": {
            "description": "死亡为旧事物画上休止符，并让路给新事物。死亡牌代表改变的一段其间。我们可以这样说，生命中的某个章节就要结束了，而你对这份改变的接纳，将是变化自然而然地发生。抱持着“生命将会带来某些比它从你身上拿走的更美好的东西”的信念。在潜意识中，你或许也在渴望改变的发生，死亡牌即意味着改变正要出现。不要抗拒这份改变，试着去接纳它吧。",
            "reverseDescription": "一样是旧有模式的解体，而不同的是当事人的主观态度以及这一改变所需要的时间。由于逆位抗拒和拖延的本质，逆位情况下，当事人主观上大多希望推迟改变，维持现状，即使挽回已经很明确是不可能的了。而当事人这一举动的唯一后果就是拉长改变所需要的时间，同时也拉长了其痛苦的时间。\r逆位的死神有可能是指对任何死亡的形式极端恐惧。一点儿小改变都可能被误以为是肉体的死亡，而你会尽所有可能去抵抗它，因为你不愿意死亡。这份恐惧可能会让你沉溺于旧习，带给你一种单调，重复的生活，用这种生活来掩饰你想到即将面临改变时所产生的绝望。\r当你不想改变时，你必须消耗所有力量以保持静止不动，且为了有某些力量可以生活，你常常会从周遭的人身上压榨能量。以目前而言，改变是必须的，然而你对改变的恐惧令你陷于苦闷，沮丧或肉体的疲惫中，因为你大多数的精力都用在抗拒改变。"
          }
        },
        "14": {
          "name_cn": "节制",
          "name_en": "Temperance",
          "type": "MajorArcana",
          "meaning": {
            "up": "平衡、和谐、治愈、节制",
            "down": "失衡、失谐、沉溺愉悦、过度放纵"
          },
          "pic": "14-节制",
          "Brand_Link": "https://tarotchina.net/major-arcana14-vip/",
          "info": {
            "description": "凭借调和对立的思想，相反结果的能力，你的内心安祥而平静；学会了调节正义和怜悯，成功与失败，欢乐与悲伤，缓和生命中的各种需求。你包容和自己意见不同的声音，但不会完全迎合它们；调和自己内心相互冲突的思想，因而得到真正的宽容。",
            "reverseDescription": "逆位的节制代表一个人与其灵魂的分离。不论这个人在做什么，不管他做得多成功，基本上他其实都根本不知道自己在做什么。逆位节制带来一种强烈的虚无感和无意义感，因为当事人已经与他的本源分离。树冠再繁茂，失去了根的滋养也是枉然；没头的苍蝇，靠到处乱撞永远飞不出房间。此时当事人一定要坐下来，重新回到最基本的问题上：我内心想要的究竟是什么？我如今所做的是否与我的真心相一致？每个人都是一颗种子，只有在适合那颗种子的土地上播种，才能长成参天大树，别人的沃土不一定是你的沃土。\r你在人的神性和动物野性之间，产生了分裂；高层次的自我和低层次自我之间，发生了失序的情况，导致毫无节制盲目的行为。你不愿意去倾听那具有神性的自我，而过度沉溺于个人的欲望。你常常做出没有目的的行为，盲目地追求流行。"
          }
        },
        "15": {
          "name_cn": "恶魔",
          "name_en": "The Devil",
          "type": "MajorArcana",
          "meaning": {
            "up": "负面影响、贪婪的欲望、物质主义、固执己见",
            "down": "逃离束缚、拒绝诱惑、治愈病痛、直面现实"
          },
          "pic": "15-恶魔",
          "Brand_Link": "https://tarotchina.net/major-arcana15-vip/",
          "info": {
            "description": "你对自己极度缺乏信心，认为自己不可能做好任何事情。你的态度被动而消极，总是让命运决定自己的未来，不相信自己可以决定自己的命运。",
            "reverseDescription": "逆位的恶魔意味一种打破限制你自由之链的企图，不论它是肉体上或精神上的不自由。现在你正积极的找寻改变或新的选择，你不再打算接受目前的状况了。可代表抛弃控制生命的需求，并接受自己的黑暗面。如此一来，你便可以将用在压抑你内在需求与欲望的精力给要回来，然后把它用在更具价值的目的。显示出尝试性的走向自由，做出选择。它可说是挑战你周遭的人，或你人生信仰的行动。五角星星又再度正立了，因此你可以把你的理性力量用于你的欲望之上。"
          }
        },
        "16": {
          "name_cn": "高塔",
          "name_en": "The Tower",
          "type": "MajorArcana",
          "meaning": {
            "up": "急剧的转变、突然的动荡、毁灭后的重生、政权更迭",
            "down": "悬崖勒马、害怕转变、发生内讧、风暴前的寂静"
          },
          "pic": "16-高塔",
          "Brand_Link": "https://tarotchina.net/major-arcana16-vip/",
          "info": {
            "description": "当高塔牌出现时，便是到了改变的时刻。现在再来为改变做准备，或选择如何改变都已太迟，现在你需要做的就是丢掉旧东西。你的信念遭到质疑；你的生活遭到干扰；你的习惯遭到破坏；你必须舍弃以往的一切，来适应新的模式。",
            "reverseDescription": "当高塔逆位时，改变的迹象依然明显，不过改变的程度就没有正立时来得多了。它可能是在形容一种被阻挠或被监禁的持续感，因为你不允许所有的改变都发生。藉由稳固控制你的行动，可以减轻这份痛苦，但这么做的话也会使你的成长趋缓。逆立的高塔表示你抗拒放开你所压抑的东西，这可能会导致冒出另一股力量，并带来另一项突如其来，爆发力十足的改变。不论你如何抗拒改变，它迟早会发生。它也可能是在形容你抱残守缺，停留在一种早就不合适的情况中。"
          }
        },
        "17": {
          "name_cn": "星星",
          "name_en": "The Star",
          "type": "MajorArcana",
          "meaning": {
            "up": "希望、前途光明、曙光出现",
            "down": "好高骛远、异想天开、事与愿违、失去目标"
          },
          "pic": "17-星星",
          "Brand_Link": "https://tarotchina.net/major-arcana17-vip/",
          "info": {
            "description": "星星可能暗示一段假期或一段你能感觉不慌不忙，心平气和的时光。伴随这张牌而来的是一种“有时间去思想及行动”的感觉。在这段期间内，你了解你就是潜意识和有形世界之间的联系。你选择什么东西来表现潜意识，完全由你决定，于是你最好的作品或最精彩的表现，是来自和潜意识最清楚的沟通。",
            "reverseDescription": "你目前并没有接触到你潜意识能量的来源，而且可能会觉得受限于生命，或和你创造力的来源失去联系。这张牌可代表一位艺术家或以创意为职业者，他似乎无法提出新的构想。目前你缺乏灵感，因为你触碰不到你的潜意识。\r可能你会觉得需要休息一阵子，放个假，或有更多的自由，但是你所需要的应该是心灵的自由，而不是肉体的自由。当星星出现逆位时，意味着和生命或世界的灵魂联系被切断了。因此空虚，寂寞，或退却到智力中的情形均可能发生，这会缺乏“事情将来会获得改善”的信心。\r它也可能表示你失去了你的目标，也就是你在这一辈子所应该做的事。事情既没有办法为你带来以往的满足，而你也无法给它们和以往一样的承诺。现在该是返回高塔的时刻了，这样你才能够排除那些与你生命不再有价值的东西，进一步发现一种和潜意识清晰，简单的连结。"
          }
        },
        "18": {
          "name_cn": "月亮",
          "name_en": "The Moon",
          "type": "MajorArcana",
          "meaning": {
            "up": "虚幻、不安与动摇、迷惘、欺骗",
            "down": "状况逐渐好转、疑虑渐消、排解恐惧"
          },
          "pic": "18-月亮",
          "Brand_Link": "https://tarotchina.net/major-arcana18-vip/",
          "info": {
            "description": "月亮可能暗示欺骗，有些事物隐而不见，因此得看得比表象更深入，以发掘某种状态的真相。月亮暗示你需要面对你的恐惧，因它们可能会阻碍你去作某些事情，或获得某些东西。多留意你的潜意识思考。",
            "reverseDescription": "月亮逆位暗示着那些尚未被解决的事情又降临到你身上了。现在是去面对这些内在挑战，而非退缩到有形世界的安全领域中的时候了。这也是回到星星牌，以体验其中所提供的信心和希望的时候。这也可以提醒你，同一个池子既包含了你的恐惧，也包容了你的力量和问题的解决之道。"
          }
        },
        "19": {
          "name_cn": "太阳",
          "name_en": "The Sun",
          "type": "MajorArcana",
          "meaning": {
            "up": "活力充沛、生机、远景明朗、积极",
            "down": "意志消沉、情绪低落、无助、消极"
          },
          "pic": "19-太阳",
          "Brand_Link": "https://tarotchina.net/major-arcana19-vip/",
          "info": {
            "description": "太阳是一张让你的人生和你自己快乐起来的牌。它代表一种内在的知识，你了解挑战是重要的；挑战可以考验你，让你对生命持续赐予你的一些小礼物充满感激。它也代表你知道幸福是一种选择，而且它并不需要与你周遭的有形事物有任何关联。",
            "reverseDescription": "象征对人生及创造性抱着一种竞争的态度。这是基于对不足的恐惧——怕支援不够，怕没有机会或爱不够。这可能是一种根本性的恐惧，怕这个世界不会支持你的努力。在两性关系份当中，它可能暗示两个相互竞争的人。"
          }
        },
        "20": {
          "name_cn": "审判",
          "name_en": "Judgement",
          "type": "MajorArcana",
          "meaning": {
            "up": "命运好转、复活的喜悦、恢复健康",
            "down": "一蹶不振、尚未开始便已结束、自我怀疑、不予理睬"
          },
          "pic": "20-审判",
          "Brand_Link": "https://tarotchina.net/major-arcana20-vip/",
          "info": {
            "description": "你正处于人生旅途的重要阶段：反省过去，重新规画未来。你内心的声音正在呼唤自己，要你与自己的内在对话，检视自己过去的行为和追求是否正确？目前你所拥有的是否能带给自己真正的快乐和满足？你必须正视这些问题，因为这是你获得长久成功和快乐的二次机会。此时你理解了你由生命所展示的试炼及挑战中学习到了什么。",
            "reverseDescription": "你正在找寻某些东西，以填补命中越来越大的鸿沟。你并不知道这个召唤是来自内心，也不知道解决方法也来自内心。简单说，这张牌碍是缺乏清晰的判断力。"
          }
        },
        "21": {
          "name_cn": "世界",
          "name_en": "The World",
          "type": "MajorArcana",
          "meaning": {
            "up": "愿望达成、获得成功、到达目的地",
            "down": "无法投入、不安现状、半途而废、盲目接受"
          },
          "pic": "21-世界",
          "Brand_Link": "https://tarotchina.net/major-arcana21-vip/",
          "info": {
            "description": "世界牌可能意指环游世界，或重大的成功及快乐。就变通的角度而言，它暗示你就站在生命希望你站的地方，而你也能感受到生命及你周遭的人的支持。它描述着一种快乐，它不是来自拥有或耕耘，而是来自存在。",
            "reverseDescription": "也许你拿到了想要的东西结果却发现，自己不知为何还是不满意；也许你正大踏步地顺利向目标A前进，岔路上突然冒出个貌似更好的目标B；未来是美好的，但总是有些让人心情烦乱的事情发生，或者说不定只是庸人自扰。但正是因为这种残缺性，才能称得上机会。这是一个思绪有些烦乱的时期，但现实本质上却并不糟糕，因此只要重整思路就可以顺利前进，比现在看来更大的成功也是可能实现的。另外世界逆位也有可能是巨大的成功已经过去的意思，这种情况下，当事人也许会有心理落差，也许只是想好好休息一阵，一切就得看当事人自己的感受了。"
          }
        },
        "22": {
          "name_cn": "宝剑ACE",
          "name_en": "Ace of Swords",
          "type": "Swords",
          "meaning": {
            "up": "有进取心和攻击性、敏锐、理性、成功的开始",
            "down": "易引起争端、逞强而招致灾难、偏激专横、不公正的想法"
          },
          "pic": "宝剑-01",
          "Brand_Link": "https://tarotchina.net/suit-of-swords1-vip/",
          "info": {
            "description": "代表开始或计划一项新的冒险。\r关键词：重点突破，取得重大进展，新创意，新思想，新想法，新概念，新设想，头脑风暴，成功，胜利，发财，成名",
            "reverseDescription": "代表开始或计划一项新的冒险。\r关键词：思考一个想法，心如明镜，心里明白，重新考虑，再想想，模糊的判断，消息不足"
          }
        },
        "23": {
          "name_cn": "宝剑2",
          "name_en": "II of Swords",
          "type": "Swords",
          "meaning": {
            "up": "想法的对立、选择的时机、意见不合且暗流汹涌",
            "down": "做出选择但流言与欺诈会浮出水面、犹豫不决导致错失机会"
          },
          "pic": "宝剑-02",
          "Brand_Link": "https://tarotchina.net/suit-of-swords2-vip/",
          "info": {
            "description": "代表规避某些特殊的话题和场合。\r宝剑二提示推测者有一颗叫封闭心灵，对待万事万物消极悲观，在采取一种抗拒和逃避的态度。 此牌提醒大家，要老实面对内心情感。无论事情怎样，要接受，莫逃避；要接纳，无抗拒。把蒙眼布取下，将双剑方下，事情其实并没有那么严重。\r关键词：艰难的决定，权衡利弊，慎重考虑，绝境，僵局，死循环，想逃避",
            "reverseDescription": "代表规避某些特殊的话题和场合。\r宝剑二提示推测者有一颗叫封闭心灵，对待万事万物消极悲观，在采取一种抗拒和逃避的态度。 此牌提醒大家，要老实面对内心情感。无论事情怎样，要接受，莫逃避；要接纳，无抗拒。把蒙眼布取下，将双剑方下，事情其实并没有那么严重。\r关键词：优柔寡断，犹豫不决，不确定，困惑，混淆，尴尬，局促不安，信息泛滥，信息过量，数据过多，僵持，胶着"
          }
        },
        "24": {
          "name_cn": "宝剑3",
          "name_en": "III of Swords",
          "type": "Swords",
          "meaning": {
            "up": "感情受到伤害、生活中出现麻烦、自怜自哀",
            "down": "心理封闭、情绪不安、逃避、伤害周边的人"
          },
          "pic": "宝剑-03",
          "Brand_Link": "https://tarotchina.net/suit-of-swords3-vip/",
          "info": {
            "description": "代表请接受或面对痛苦与悲伤。\r宝剑三告诉推测者，正确认识悲伤情绪，让它成为有益于你生命的东西。\r关键词：心碎，心酸，伤心欲绝，受打击，情感痛苦，悲伤，悲痛，悲哀，伤心事，不幸，担心，忧虑，委屈，受伤",
            "reverseDescription": "代表请接受或面对痛苦与悲伤。\r宝剑三告诉推测者，正确认识悲伤情绪，让它成为有益于你生命的东西。\r关键词：消极的自我对话，止痛，乐观，原谅，宽恕，宽宏大量"
          }
        },
        "25": {
          "name_cn": "宝剑4",
          "name_en": "IV of Swords",
          "type": "Swords",
          "meaning": {
            "up": "养精蓄锐、以退为进、放缓行动、留意总结",
            "down": "即刻行动、投入生活、未充分准备却慌忙应对"
          },
          "pic": "宝剑-04",
          "Brand_Link": "https://tarotchina.net/suit-of-swords4-vip/",
          "info": {
            "description": "代表隐退及沉思熟虑的一段时期。\r宝剑四出现时，通常代表当事人正处于一种休息状态，或是他需要放缓行动，好好休息一番，然后再重新出发。这是张“ 充电 ”的牌 。提示你在休息确当中，要好好反思，留意总结教训。\r关键词：休息，放松，消遣，用于放松消遣的时间，娱乐活动，放宽管制，冥想，沉思，深思，凝视，默默注视，回收，恢复，复原，痊愈，挽回，休养",
            "reverseDescription": "代表隐退及沉思熟虑的一段时期。\r宝剑四出现时，通常代表当事人正处于一种休息状态，或是他需要放缓行动，好好休息一番，然后再重新出发。这是张“ 充电 ”的牌 。提示你在休息确当中，要好好反思，留意总结教训。\r关键词：精疲力尽，殚精竭虑，沉思冥想，停滞不前，疲倦，衰竭，精疲力竭，劳累过度，停滞，萧条，迟钝"
          }
        },
        "26": {
          "name_cn": "宝剑5",
          "name_en": "V of Swords",
          "type": "Swords",
          "meaning": {
            "up": "矛盾冲突、不择手段伤害对方、赢得比赛却失去关系",
            "down": "找到应对方法、冲突有解决的可能性、双方愿意放下武器"
          },
          "pic": "宝剑-05",
          "Brand_Link": "https://tarotchina.net/suit-of-swords5-vip/",
          "info": {
            "description": "代表争吵和紧张，而且解决的可能性十分渺茫。\r宝剑五在提示当事人不要一味追求胜利而忽略了其意义，要在奋斗过程中，即利人又利己。\r关键词：冲突，争执，争论，战斗，抵触，矛盾，分歧，竞争，角逐，比赛，竞赛，竞争者，战胜，阻挠，挫败，不惜一切代价赢得胜利",
            "reverseDescription": "代表争吵和紧张，而且解决的可能性十分渺茫。\r宝剑五在提示当事人不要一味追求胜利而忽略了其意义，要在奋斗过程中，即利人又利己。\r关键词：和解，对账，和好，调和，补偿，过去的恩怨"
          }
        },
        "27": {
          "name_cn": "宝剑6",
          "name_en": "VI of Swords",
          "type": "Swords",
          "meaning": {
            "up": "伤口迟迟没能痊愈、现在没有很好的对策、未来存在更多的艰难",
            "down": "深陷于困难、鲁莽地解决却忽视背后更大的问题、需要其他人的帮助或救援"
          },
          "pic": "宝剑-06",
          "Brand_Link": "https://tarotchina.net/suit-of-swords6-vip/",
          "info": {
            "description": "代表混乱之后，逐渐回复平静。\r处于一种困境。何去何从，都决定着人的命运。前进，或许还有希望，不前进，可能会困死原地。\r关键词：过渡，转变，变革，变迁，改变，变化，使不同，使变换，改换，变成，度过人生重大阶段，放下包袱",
            "reverseDescription": "代表混乱之后，逐渐回复平静。\r处于一种困境。何去何从，都决定着人的命运。前进，或许还有希望，不前进，可能会困死原地。\r关键词：转变，转型，改革，内心反对改变，抗拒改变，未完成的事业交易合作"
          }
        },
        "28": {
          "name_cn": "宝剑7",
          "name_en": "VII of Swords",
          "type": "Swords",
          "meaning": {
            "up": "疏忽大意、有隐藏很深的敌人、泄密、非常手段或小伎俩无法久用",
            "down": "意想不到的好运、计划不周全、掩耳盗铃"
          },
          "pic": "宝剑-07",
          "Brand_Link": "https://tarotchina.net/suit-of-swords7-vip/",
          "info": {
            "description": "如果你想成功的话，你需要另谋新方法。\r宝剑七频繁代表欺骗，桀黠，背叛，诡计。当事人可能是说谎的一方，也可能是受骗的一方。\r关键词：责任，出卖，背叛，最毒妇人心，欺骗，蒙骗，诓骗，诡计，骗术，骗局，逃避某事，战略行动，有策略地行动",
            "reverseDescription": "如果你想成功的话，你需要另谋新方法。\r宝剑七频繁代表欺骗，桀黠，背叛，诡计。当事人可能是说谎的一方，也可能是受骗的一方。\r关键词：骗子，自欺欺人，保守秘密，冒名顶替，移花接木，鸠占鹊巢"
          }
        },
        "29": {
          "name_cn": "宝剑8",
          "name_en": "VIII of Swords",
          "type": "Swords",
          "meaning": {
            "up": "孤立无助、陷入艰难处境、受困于想法导致行动受阻",
            "down": "摆脱束缚、脱离危机、重新起步"
          },
          "pic": "宝剑-08",
          "Brand_Link": "https://tarotchina.net/suit-of-swords8-vip/",
          "info": {
            "description": "自身受限制丧失个人能力。\r这张牌预兆着当事者将陷入或已陷入艰难的处境。同时预示着当事人新的奋争开始了。\r关键词：消极思想，负面想法，自我设限，关押，监禁，坐牢，住院，囚禁，卧床在家，被害妄想症，感觉有人害自己",
            "reverseDescription": "自身受限制丧失个人能力。\r这张牌预兆着当事者将陷入或已陷入艰难的处境。同时预示着当事人新的奋争开始了。\r关键词：自我设限，自我批判，放下消极思想，换角度看问题"
          }
        },
        "30": {
          "name_cn": "宝剑9",
          "name_en": "IX of Swords",
          "type": "Swords",
          "meaning": {
            "up": "精神上的恐惧、害怕、焦虑、前路不顺的预兆",
            "down": "事情出现转机、逐渐摆脱困境、沉溺于过去、正视现实"
          },
          "pic": "宝剑-09",
          "Brand_Link": "https://tarotchina.net/suit-of-swords9-vip/",
          "info": {
            "description": "对问题的担心让自己日有所思夜有所梦。\r宝剑九不是令人兴奋的一张牌，然而它也不仅仅预兆悲痛。通常它只是某些不愉快因素或者麻烦将出现的警号。它常表明你所走的道路将不是很平坦。\r关键词：焦虑，忧虑，担心，害怕，渴望，担心，担忧，发愁，使担心，使担忧，使发愁，骚扰，烦扰，使不安宁，抑郁症，精神忧郁，沮丧，消沉，萧条期，经济衰退，不景气，噩梦，梦魇，可怕的经历，难以处理之事",
            "reverseDescription": "对问题的担心让自己日有所思夜有所梦。\r宝剑九不是令人兴奋的一张牌，然而它也不仅仅预兆悲痛。通常它只是某些不愉快因素或者麻烦将出现的警号。它常表明你所走的道路将不是很平坦。\r关键词：秘密，机密，诀窍，秘诀，奥秘，内心阴影，烦躁，强烈的恐惧感，放下忧虑，认命，坦然接受"
          }
        },
        "31": {
          "name_cn": "宝剑10",
          "name_en": "X of Swords",
          "type": "Swords",
          "meaning": {
            "up": "进展严重受阻、无路可走、面临绝境、重新归零的机会",
            "down": "绝处逢生、东山再起的希望、物极必反"
          },
          "pic": "宝剑-10",
          "Brand_Link": "https://tarotchina.net/suit-of-swords10-vip/",
          "info": {
            "description": "在新的开始之前，某种状况结束。\r每一个事件，不论其坏或者好，都有意义。宝剑十出现，在于告诉当事人怎么从失败口学到宝贵经验，在痛苦中成长。\r关键词：痛苦的结局，重伤，重创心灵，被背叛，被出卖，丧失，损失，丢失，亏损，危机，危急关头，危难时刻，病危期，逝世",
            "reverseDescription": "在新的开始之前，某种状况结束。\r每一个事件，不论其坏或者好，都有意义。宝剑十出现，在于告诉当事人怎么从失败口学到宝贵经验，在痛苦中成长。\r关键词：恢复，痊愈，改善，回升，复苏，取回，收回，复得，再生，改造，悔悟，反抗命运，挣扎，不接受结局"
          }
        },
        "32": {
          "name_cn": "宝剑国王",
          "name_en": "King of Swords",
          "type": "Swords",
          "meaning": {
            "up": "公正、权威、领导力、冷静",
            "down": "思想偏颇、强加观念、极端、不择手段"
          },
          "pic": "宝剑国王",
          "Brand_Link": "https://tarotchina.net/suit-of-swords14-vip/",
          "info": {
            "description": "一个心智成熟且自律的男人。\r关键词：头脑清晰，智慧过人，权威专家，权力，威权，当权，职权，批准，授权，正确，真理，实情，事实",
            "reverseDescription": "一个心智成熟且自律的男人。\r关键词：保持沉默，内心正确，滥用权力，暗箱操作，摆弄，纵横捭阖"
          }
        },
        "33": {
          "name_cn": "宝剑王后",
          "name_en": "Queen of Swords",
          "type": "Swords",
          "meaning": {
            "up": "理性、思考敏捷、有距离感、公正不阿",
            "down": "固执、想法偏激、高傲、盛气凌人"
          },
          "pic": "宝剑王后",
          "Brand_Link": "https://tarotchina.net/suit-of-swords13-vip/",
          "info": {
            "description": "经过沉思熟虑方可取得成就。\r关键词：独立自主，裁决公正，评价中肯，没有偏见，界限清晰，直接沟通，面对面，直接的沟通",
            "reverseDescription": "经过沉思熟虑方可取得成就。\r关键词：过度情绪化，无法掌握情绪，容易受外部人事物影响，出言不逊，脾气暴躁，冷淡，恶毒，冷酷"
          }
        },
        "34": {
          "name_cn": "宝剑骑士",
          "name_en": "Knight of Swords",
          "type": "Swords",
          "meaning": {
            "up": "勇往直前的行动力、充满激情",
            "down": "计划不周、天马行空、缺乏耐心、做事轻率、自负"
          },
          "pic": "宝剑骑士",
          "Brand_Link": "https://tarotchina.net/suit-of-swords12-vip/",
          "info": {
            "description": "要达成愿望需要有敏捷的行动。\r关键词：野心勃勃，行动导向，成功的动力，思维敏捷",
            "reverseDescription": "要达成愿望需要有敏捷的行动。\r关键词：焦躁不安，无法安宁，最后一次，悸动的心，浮躁，无法集中注意力，冲动，精疲力竭，劳累过度"
          }
        },
        "35": {
          "name_cn": "宝剑侍从",
          "name_en": "Page of Swords",
          "type": "Swords",
          "meaning": {
            "up": "思维发散、洞察力、谨慎的判断",
            "down": "短见、做事虎头蛇尾、对信息不加以过滤分析"
          },
          "pic": "宝剑侍从",
          "Brand_Link": "https://tarotchina.net/suit-of-swords11-vip/",
          "info": {
            "description": "梦想太多，执行力不够。\r关键词：新思想，新思路，新观点，创意，好奇心，罕见而有趣之物，奇物，珍品，求知欲，渴望知识，新的通信方式",
            "reverseDescription": "梦想太多，执行力不够。\r关键词：自我表现，表达自己，光说不做，行动鲁莽，仓促行事"
          }
        },
        "36": {
          "name_cn": "权杖ACE",
          "name_en": "Ace of Wands",
          "type": "Wands",
          "meaning": {
            "up": "新的开端、新的机遇、燃烧的激情、创造力",
            "down": "新行动失败的可能性比较大、开端不佳、意志力薄弱"
          },
          "pic": "权杖-01",
          "Brand_Link": "https://tarotchina.net/suit-of-wands1-vip/",
          "info": {
            "description": "即将开始执行某种方案。\r权杖首牌代表新的机会，无论结果怎样，放弃都是不可取代。\r关键词：灵感，天启，启发，新机遇，新机会，发育，成长，生长，增加，增长，增强，经济增长，经济发展，潜力，潜质",
            "reverseDescription": "即将开始执行某种方案。\r权杖首牌代表新的机会，无论结果怎样，放弃都是不可取代。\r关键词：新的想法，没有发展方向，分散主意力，分心，拖延，延迟，延期，推迟，迟到"
          }
        },
        "37": {
          "name_cn": "权杖2",
          "name_en": "II of Wands",
          "type": "Wands",
          "meaning": {
            "up": "高瞻远瞩、规划未来、在习惯与希望间做选择",
            "down": "犹豫不决、行动受阻、花费太多时间在选择上"
          },
          "pic": "权杖-02",
          "Brand_Link": "https://tarotchina.net/suit-of-wands2-vip/",
          "info": {
            "description": "对未来进行规划。\r权杖二代表一种来自实践或者依靠自身修养而来的权利。个人魅力是一种生生不息的气力，令人积极向上，当他和勇气向他配时，就能成就辉煌。\r关键词：未来规划，未来计划，进步，进展，进程，前进，行进，决定，抉择，决断，决策，发现，发觉",
            "reverseDescription": "对未来进行规划。\r权杖二代表一种来自实践或者依靠自身修养而来的权利。个人魅力是一种生生不息的气力，令人积极向上，当他和勇气向他配时，就能成就辉煌。\r关键词：个人目标，内部统一，前途未卜，对未来感到害怕，缺乏计划，没有规划"
          }
        },
        "38": {
          "name_cn": "权杖3",
          "name_en": "II of Wands",
          "type": "Wands",
          "meaning": {
            "up": "探索的好时机、身心灵的契合、领导能力、主导地位",
            "down": "合作不顺、欠缺领导能力、团队不和谐"
          },
          "pic": "权杖-03",
          "Brand_Link": "https://tarotchina.net/suit-of-wands3-vip/",
          "info": {
            "description": "完成了计划中的一小步。\r权杖三代表这是一个探索新领域的好时机，也代表着已经踏上了探索的旅程。\r关键词：进步，进展，进程，前进，行进，扩张，扩展，扩大，深谋远虑，先见之明，海外机会，出口机会",
            "reverseDescription": "完成了计划中的一小步。\r权杖三代表这是一个探索新领域的好时机，也代表着已经踏上了探索的旅程。\r关键词：玩小游戏，小本生意，小打小闹，过家家，缺乏远见，意外延误"
          }
        },
        "39": {
          "name_cn": "权杖4",
          "name_en": "IV of Wands",
          "type": "Wands",
          "meaning": {
            "up": "和平繁荣、关系稳固、学业或事业发展稳定",
            "down": "局势失衡、稳固的基础被打破、人际关系不佳、收成不佳"
          },
          "pic": "权杖-04",
          "Brand_Link": "https://tarotchina.net/suit-of-wands4-vip/",
          "info": {
            "description": "在新家或者某个环境中安顿下来。\r权杖四给人的意向是正面的，积极向上，一种安全感油然而生。 由于四具有四位方正的含义，逆位的权杖四即有与正位相反的含义，应当视具体推测问题与整体牌阵局势而定。\r关键词：庆典，庆祝，高兴，愉快，喜悦，乐趣，成功，满意，满足，融洽，和睦，和谐，协调，放松，休息，消遣，回家，回国，返校",
            "reverseDescription": "在新家或者某个环境中安顿下来。\r权杖四给人的意向是正面的，积极向上，一种安全感油然而生。 由于四具有四位方正的含义，逆位的权杖四即有与正位相反的含义，应当视具体推测问题与整体牌阵局势而定。\r关键词：自我庆祝，自娱自乐，与他人冲突，过渡，转变，变革，变迁"
          }
        },
        "40": {
          "name_cn": "权杖5",
          "name_en": "V of Wands",
          "type": "Wands",
          "meaning": {
            "up": "竞争、冲突、内心的矛盾、缺乏共识",
            "down": "不公平的竞争、达成共识"
          },
          "pic": "权杖-05",
          "Brand_Link": "https://tarotchina.net/suit-of-wands5-vip/",
          "info": {
            "description": "团队内部存在冲突缺乏和谐。\r关键词：冲突，争执，争论，冲突，战斗，抵触，矛盾，意见不一，分歧，竞争，角逐，比赛，竞赛，对手，紧张局势，差异，不同，多样化",
            "reverseDescription": "团队内部存在冲突缺乏和谐。\r关键词：内部冲突，内心矛盾，逃避矛盾，避免冲突，缓解紧张"
          }
        },
        "41": {
          "name_cn": "权杖6",
          "name_en": "VI of Wands",
          "type": "Wands",
          "meaning": {
            "up": "获得胜利、成功得到回报、进展顺利、有望水到渠成",
            "down": "短暂的成功、骄傲自满、失去自信"
          },
          "pic": "权杖-06",
          "Brand_Link": "https://tarotchina.net/suit-of-wands6-vip/",
          "info": {
            "description": "对未来的人生充满了自信。\r权杖六好似战车牌的小阿卡纳版本，胜利的象征意味明显，不过这一种胜利更世俗些，具体些，生活化些。\r关键词：成功，胜利，发财，成名，公众认可，进步，进展，进程，前进，行进，自信",
            "reverseDescription": "对未来的人生充满了自信。\r权杖六好似战车牌的小阿卡纳版本，胜利的象征意味明显，不过这一种胜利更世俗些，具体些，生活化些。\r关键词：个人成就，个人对成功的定义，失宠，失利，过气，受冷落，自我中心，利己主义，自私自利"
          }
        },
        "42": {
          "name_cn": "权杖7",
          "name_en": "VII of Wands",
          "type": "Wands",
          "meaning": {
            "up": "坚定信念、态度坚定、内芯的权衡与决断、相信自己的观点与能力",
            "down": "对自己的能力产生怀疑、缺乏自信与动力、缺乏意志力"
          },
          "pic": "权杖-07",
          "Brand_Link": "https://tarotchina.net/suit-of-wands7-vip/",
          "info": {
            "description": "不要放弃，坚韧的度过挫折获得成功。\r关键词：挑战，艰巨任务，提议，质询，质疑，提出异议，竞争，角逐，比赛，竞赛，对手，保护，防卫，保险，毅力，韧性，不屈不挠的精神",
            "reverseDescription": "不要放弃，坚韧的度过挫折获得成功。\r关键词：黔驴技穷，疲倦，衰竭，精疲力竭，放弃，难以承受，应接不暇，不知所措"
          }
        },
        "43": {
          "name_cn": "权杖8",
          "name_en": "VIII of Wands",
          "type": "Wands",
          "meaning": {
            "up": "目标明确、一鼓作气、进展神速、趁热打铁、旅行",
            "down": "方向错误、行动不一致、急躁冲动、计划延误"
          },
          "pic": "权杖-08",
          "Brand_Link": "https://tarotchina.net/suit-of-wands8-vip/",
          "info": {
            "description": "意味着旅行或者自由自在。\r关键词：运动，移动，迁移，转移，活动，变化快，节奏快，瞄准，校正，空运，航空旅行",
            "reverseDescription": "意味着旅行或者自由自在。\r关键词：延时，延迟，延误，误点，懊恼，沮丧，受阻，受挫，阻止，挫败，对抗突发事件，内部调整"
          }
        },
        "44": {
          "name_cn": "权杖9",
          "name_en": "IX of Wands",
          "type": "Wands",
          "meaning": {
            "up": "做好准备以应对困难、自我防御、蓄势待发、力量的对立",
            "down": "遭遇逆境、失去自信、士气低落"
          },
          "pic": "权杖-09",
          "Brand_Link": "https://tarotchina.net/suit-of-wands9-vip/",
          "info": {
            "description": "对承诺是否能完成进行重新评估。\r关键词：快速恢复，快速适应，勇气，勇敢，无畏，胆量，坚持，锲而不舍，持续存在，维持，忠诚考验，信仰考验，界限，底线",
            "reverseDescription": "对承诺是否能完成进行重新评估。\r关键词：背后资源，社会资源，背景，奋斗，努力，争取，艰难地行进，吃力地进行，斗争，抗争，挣扎，防御，防守，守势，偏执，妄想，多疑"
          }
        },
        "45": {
          "name_cn": "权杖10",
          "name_en": "X of Wands",
          "type": "Wands",
          "meaning": {
            "up": "责任感、内芯的热忱、过重的负担、过度劳累",
            "down": "难以承受的压力、高估自身的能力、调整自己的步调、逃避责任"
          },
          "pic": "权杖-10",
          "Brand_Link": "https://tarotchina.net/suit-of-wands10-vip/",
          "info": {
            "description": "一份责任。\r关键词：负担，重担，重负，额外责任，努力工作，努力奋斗，结束，完成",
            "reverseDescription": "一份责任。\r关键词：全力以赴，独当一面，全部都做，承担责任，委托，委派，释放，放出，放走，放开，松开，发泄，宣泄"
          }
        },
        "46": {
          "name_cn": "权杖国王",
          "name_en": "King of Wands",
          "type": "Wands",
          "meaning": {
            "up": "行动力强、态度明确、运筹帷幄、领袖魅力",
            "down": "独断专行、严苛、态度傲慢"
          },
          "pic": "权杖国王",
          "Brand_Link": "https://tarotchina.net/suit-of-wands14-vip/",
          "info": {
            "description": "经过自我管理获得成功。\r关键词：天才领导，视野，想象，幻象，梦幻，神示，异象，高瞻远瞩，创业，企业家，尊敬，尊重，崇敬，荣幸，光荣，正义感，道义，节操",
            "reverseDescription": "经过自我管理获得成功。\r关键词：领导能力差，目标激进，个人方向，冲动，急速，匆忙，仓促，残酷无情，高期望值，高要求"
          }
        },
        "47": {
          "name_cn": "权杖王后",
          "name_en": "Queen of Wands",
          "type": "Wands",
          "meaning": {
            "up": "刚柔并济、热情而温和、乐观而活泼",
            "down": "情绪化、信心不足、热情消退、孤独"
          },
          "pic": "权杖王后",
          "Brand_Link": "https://tarotchina.net/suit-of-wands13-vip/",
          "info": {
            "description": "通过精神层面的力量达到成功。\r关键词：勇气，勇敢，无畏，胆量，信心，信任，信赖，把握，肯定，独立，自主，自立，交际花，决心，果断，坚定",
            "reverseDescription": "通过精神层面的力量达到成功。\r关键词：自重，自爱，自尊，自信，内向，不喜交际，重建自我"
          }
        },
        "48": {
          "name_cn": "权杖骑士",
          "name_en": "Knight of Wands",
          "type": "Wands",
          "meaning": {
            "up": "行动力、精力充沛、新的旅程、对现状不满足的改变",
            "down": "有勇无谋、鲁莽、行动延迟、计划不周、急躁"
          },
          "pic": "权杖骑士",
          "Brand_Link": "https://tarotchina.net/suit-of-wands12-vip/",
          "info": {
            "description": "意味着新的领域或改变转型。\r当看到权杖骑士时，大家要抱着权衡的态度，是不是骄傲自大？是急躁易怒或总是很有耐心？有人伤害自己时是不是暴跳如雷？是不是未作任何预备就仓促行动？\r关键词：活力，精力，能量，干劲，激情，强烈的爱，激励，鼓励，冒险，奇遇，冲动",
            "reverseDescription": "意味着新的领域或改变转型。\r当看到权杖骑士时，大家要抱着权衡的态度，是不是骄傲自大？是急躁易怒或总是很有耐心？有人伤害自己时是不是暴跳如雷？是不是未作任何预备就仓促行动？\r关键词：约会计划，约炮计划，急速，匆忙，仓促，精力分散，延迟，延期，推迟，迟到，懊恼，沮丧，受阻，受挫，阻止"
          }
        },
        "49": {
          "name_cn": "权杖侍从",
          "name_en": "Page of Wands",
          "type": "Wands",
          "meaning": {
            "up": "新计划的开始、尝试新事物、好消息传来",
            "down": "三分钟热度、规划太久导致进展不顺、坏消息传来"
          },
          "pic": "权杖侍从",
          "Brand_Link": "https://tarotchina.net/suit-of-wands11-vip/",
          "info": {
            "description": "即将开始一项新方案或者新挑战。\r关键词：灵感，启发，想法，构思，主意，印象，概念，意见，看法，信念，发现，发觉，潜力，自由",
            "reverseDescription": "即将开始一项新方案或者新挑战。\r关键词：新思想学派，新流派，重建格局，引导资源，自我约定，精神境界提升"
          }
        },
        "50": {
          "name_cn": "圣杯ACE",
          "name_en": "Ace of Cups",
          "type": "Cups",
          "meaning": {
            "up": "新恋情或新友情、精神愉悦、心灵满足",
            "down": "情感缺失、缺乏交流、虚情假意"
          },
          "pic": "圣杯-01",
          "Brand_Link": "https://tarotchina.net/suit-of-cups1-vip/",
          "info": {
            "description": "意味着情感联系和满足。\r圣杯预示着一场新恋情或新情谊的开始。在情感刚开始时，爱与关怀常满溢，要懂得慷慨回报对方，珍惜这份福气。若求问者这份感情以维持很久了，出现圣杯首牌，要好好看看四周的牌，小心外遇对象 。若是无关感情的推测，出现圣杯首牌，表示这个局势需用爱来耐心化解。\r关键词：爱，热爱，慈爱，爱情，恋爱，喜好，喜爱，新欢，新恋情，新伴侣，同情，怜悯，创造",
            "reverseDescription": "意味着情感联系和满足。\r圣杯预示着一场新恋情或新情谊的开始。在情感刚开始时，爱与关怀常满溢，要懂得慷慨回报对方，珍惜这份福气。若求问者这份感情以维持很久了，出现圣杯首牌，要好好看看四周的牌，小心外遇对象 。若是无关感情的推测，出现圣杯首牌，表示这个局势需用爱来耐心化解。\r关键词：自私的爱，直觉，情感上的损失，没有灵感，空虚，自爱，自恋，自慰，直觉，压抑，压制情绪，压制激情，压制欲望"
          }
        },
        "51": {
          "name_cn": "圣杯2",
          "name_en": "II of Cups",
          "type": "Cups",
          "meaning": {
            "up": "和谐对等的关系、情侣间的相互喜爱、合作顺利",
            "down": "两性关系趋于极端、情感的割裂、双方不平等、冲突"
          },
          "pic": "圣杯-02",
          "Brand_Link": "https://tarotchina.net/suit-of-cups2-vip/",
          "info": {
            "description": "一种合作伙伴关系或两性关系。\r圣杯二常与爱情产生强烈关系，在这方面持牌比较近是初恋状态。如图中一样，男女相敬如宾，同等对待对方，不做强求。圣杯二不止局限于男女感情，也可涉及情谊，以及任何人际关系，而这种关系往往是和谐对等，愉快地。所以，问情谊，问恋情或婚恋，圣杯二都会给你一个答案。\r关键词：合作伙伴，相互吸引，团结，交谈沟通，贸易，欢愉的爱，一致的爱，伙伴关系，合伙人身份，合作关系，合伙企业，彼此爱慕",
            "reverseDescription": "一种合作伙伴关系或两性关系。\r圣杯二常与爱情产生强烈关系，在这方面持牌比较近是初恋状态。如图中一样，男女相敬如宾，同等对待对方，不做强求。圣杯二不止局限于男女感情，也可涉及情谊，以及任何人际关系，而这种关系往往是和谐对等，愉快地。所以，问情谊，问恋情或婚恋，圣杯二都会给你一个答案。\r关键词：自爱，自恋，自慰，分手，分离，分居，破裂，不协调，不和谐，不一致，不信任，怀疑"
          }
        },
        "52": {
          "name_cn": "圣杯3",
          "name_en": "III of Cups",
          "type": "Cups",
          "meaning": {
            "up": "达成合作、努力取得成果",
            "down": "乐极生悲、无法达成共识、团队不和"
          },
          "pic": "圣杯-03",
          "Brand_Link": "https://tarotchina.net/suit-of-cups3-vip/",
          "info": {
            "description": "意味着庆祝或聚会。\r圣杯三通常表示以感情作为关联的团体，另外，也代表一种欢庆的场合，包括宴会，婚礼等。其丰收的含义通常代表事情有了好的结果。当然，有时也相反。\r关键词：庆典，庆祝活动，庆祝，友谊，朋友关系，友情，友好，合作，协作，合作成果",
            "reverseDescription": "意味着庆祝或聚会。\r圣杯三通常表示以感情作为关联的团体，另外，也代表一种欢庆的场合，包括宴会，婚礼等。其丰收的含义通常代表事情有了好的结果。当然，有时也相反。\r关键词：独立，自主，自立，独处，核心聚会，小圈子，通敌，勾结敌人，内奸"
          }
        },
        "53": {
          "name_cn": "圣杯4",
          "name_en": "IV of Cups",
          "type": "Cups",
          "meaning": {
            "up": "身心俱疲、缺乏动力、对事物缺乏兴趣、情绪低潮",
            "down": "新的人际关系、有所行动、脱离低潮期"
          },
          "pic": "圣杯-04",
          "Brand_Link": "https://tarotchina.net/suit-of-cups4-vip/",
          "info": {
            "description": "要留意目前感情上的机会，不要错过。\r圣杯四代表一段消极，无聊，疲惫，退缩的时光。当事人缺乏动力，对一切事物漠不关心，不想参加社交。圣杯四有时候也代表外遇和新机会的来临。\r关键词：冥想，沉思，深思，凝视，默默注视，冷漠，淡漠，评估，消费，重新评估，感觉沮丧和无助，没什么事情能让自己开心起来",
            "reverseDescription": "要留意目前感情上的机会，不要错过。\r圣杯四代表一段消极，无聊，疲惫，退缩的时光。当事人缺乏动力，对一切事物漠不关心，不想参加社交。圣杯四有时候也代表外遇和新机会的来临。\r关键词：渴望机会而没有机会，需要新起点，寻找那一丝希望，突然意识到某事，退却，撤退，离开，离去，退去，后退，改变主意，退缩，撤走，收回，取回，不再参加，退出组织，提款，取款，检查"
          }
        },
        "54": {
          "name_cn": "圣杯5",
          "name_en": "V of Cups",
          "type": "Cups",
          "meaning": {
            "up": "过度注意失去的事物、自责、自我怀疑、因孤傲而拒绝外界帮助",
            "down": "走出悲伤、破釜沉舟、东山再起"
          },
          "pic": "圣杯-05",
          "Brand_Link": "https://tarotchina.net/suit-of-cups5-vip/",
          "info": {
            "description": "负起感情上的责任，独自强化内心。\r圣杯五无论正逆位都表示事情的发展并不是自己预期的样子，有损失但并不是全军覆没，自己感觉自己很可怜。区别在于正位表示坦然接受损失，负重前行。逆位表示继续自怨自艾，唏嘘不已。\r关键词：感到遗憾，惋惜，懊悔，有礼貌地或正式地表示抱歉，痛惜或悲伤，失败，未做，未履行，失望，沮丧，扫兴，悲观情绪，悲观主义，事情不是你希望的那样，挫折",
            "reverseDescription": "负起感情上的责任，独自强化内心。\r圣杯五无论正逆位都表示事情的发展并不是自己预期的样子，有损失但并不是全军覆没，自己感觉自己很可怜。区别在于正位表示坦然接受损失，负重前行。逆位表示继续自怨自艾，唏嘘不已。\r关键词：后悔，失败，失望，失去，悲伤，自怜，挫折，对前途悲观，自怨自艾，无法接受这么个结果，怎么会这样，不敢相信这就是结局，个人挫折，自我原谅，继续前进，自我原谅，继续前进，接受现实，接受教训，反思错误，继续前行，主要还是情感问题"
          }
        },
        "55": {
          "name_cn": "圣杯6",
          "name_en": "VI of Cups",
          "type": "Cups",
          "meaning": {
            "up": "思乡、美好的回忆、纯真的情感、简单的快乐、安全感",
            "down": "沉溺于过去、不美好的回忆、不甘受束缚"
          },
          "pic": "圣杯-06",
          "Brand_Link": "https://tarotchina.net/suit-of-cups6-vip/",
          "info": {
            "description": "回味那纯真年代的人所给予的舒适与温暖或者寻找那久违的安全感。\r圣杯六无论正位还是逆位，都表示回忆过去所经历的人事物，区别在于正位表示在现在比以前好的情况下回忆过去。逆位表示在现在比以前差的情况下回忆过去。试着感受一下两种情况下的不同感受。\r关键词：以前很多东西都消失了，很熟悉的感觉，康复，感叹自己老了，感觉时间过的真快啊，再访，重游，重提，再次讨论，重温过去，过去，昔日，从前，以往，童年的回忆，儿时记忆，快乐的回忆，回忆童年，清白，无辜，无罪，天真，纯真，单纯，高兴，愉快，喜悦，乐事，乐趣，成功，满意，满足",
            "reverseDescription": "回味那纯真年代的人所给予的舒适与温暖或者寻找那久违的安全感。\r圣杯六无论正位还是逆位，都表示回忆过去所经历的人事物，区别在于正位表示在现在比以前好的情况下回忆过去。逆位表示在现在比以前差的情况下回忆过去。试着感受一下两种情况下的不同感受。\r关键词：坚持过去的日子，失去童心，缺乏乐趣，拒绝面对现在与未来，原谅，宽恕，宽宏大量，活在过去，缺乏娱乐精神，刻板，保守，拘谨"
          }
        },
        "56": {
          "name_cn": "圣杯7",
          "name_en": "VII of Cups",
          "type": "Cups",
          "meaning": {
            "up": "不切实际的幻想、不踏实的人际关系、虚幻的情感、生活混乱",
            "down": "看清现实、对物质的不满足、做出明智的选择"
          },
          "pic": "圣杯-07",
          "Brand_Link": "https://tarotchina.net/suit-of-cups7-vip/",
          "info": {
            "description": "应清楚自身的内在需要。\r回味了过去经历的酸甜苦辣（经历了圣杯六），现在是时侯展望未来了，圣杯七正逆位的区别在于，正位表示在过去很美好的情况展望未来，而逆位表示过去较惨的情况下展望未来。\r关键词：机会，时机，选择，挑选，抉择，选择权，入选，一厢情愿，单相思，幻想，错觉，幻觉，意淫对幻想的未来既兴奋又害怕，建议停止幻想采取行动，建议区分哪些是现实哪些是幻象然后做出选择（注意：想象很美好，因为只要你行动未来真的很美好。）",
            "reverseDescription": "应清楚自身的内在需要。\r回味了过去经历的酸甜苦辣（经历了圣杯六），现在是时侯展望未来了，圣杯七正逆位的区别在于，正位表示在过去很美好的情况展望未来，而逆位表示过去较惨的情况下展望未来。\r关键词：结盟，合作，一致行动，个人价值观，选择太多，应接不暇，沉迷幻想当中无法自拔，此时此刻是脱离幻想面对现实的分界线（注意：想象很美好是但未来并不是很好，沉迷幻想不想脱离其中。）"
          }
        },
        "57": {
          "name_cn": "圣杯8",
          "name_en": "VIII of Cups",
          "type": "Cups",
          "meaning": {
            "up": "离开熟悉的人事物、不沉醉于目前的成果、经考虑后的行动",
            "down": "犹豫不决、失去未来的规划、维持现状"
          },
          "pic": "圣杯-08",
          "Brand_Link": "https://tarotchina.net/suit-of-cups8-vip/",
          "info": {
            "description": "您将意识到必须离开熟悉的人事物，主动去追寻更多的东西。\r圣杯八无论正位还是逆位都表示离开熟悉的人事物，区别是在于离开现状以后是去做积极的事情还是去悄悄堕落。\r关键词：失望，沮丧，扫兴，令人失望，离弃，遗弃，抛弃，放弃，中止，撤走，收回，取回，不再参加，退出，逃避现实不满现况，要去改变，要去修炼，追求更高层次的快乐与美好（注意：同样是脱离不满意的现况，正位表示离开去追求更高境界。）",
            "reverseDescription": "您将意识到必须离开熟悉的人事物，主动去追寻更多的东西。\r圣杯八无论正位还是逆位都表示离开熟悉的人事物，区别是在于离开现状以后是去做积极的事情还是去悄悄堕落。\r关键词：漫无目的的漂流，再试一次，优柔寡断，犹豫不决，漫无目的，随遇而安，随便走走，离开，抛弃，退缩，逃避，失去追求目标，随便怎么样（注意：同样是脱离不满意的现况，逆位表示离开去逃避而不做出改变。）"
          }
        },
        "58": {
          "name_cn": "圣杯9",
          "name_en": "IX of Cups",
          "type": "Cups",
          "meaning": {
            "up": "愿望极有可能实现、满足现状、物质与精神富足",
            "down": "物质受损失、不懂节制、寻求更高层次的快乐"
          },
          "pic": "圣杯-09",
          "Brand_Link": "https://tarotchina.net/suit-of-cups9-vip/",
          "info": {
            "description": "自我感觉满意和光荣。\r圣杯九以愿望牌著名，它预示着你的梦想在现实中的去向。但要领悟图形的寓意，必须晓得自己的内心意图，勇于承担寻梦过程中的相应责任。这样才能终极享受自己的好运气。\r关键词：满足，知足常乐，满意，欣慰，令人欣慰的事，达到，妥善处理，清偿债务，赔偿，感激之情，感谢，美梦成真，愿望实现",
            "reverseDescription": "自我感觉满意和光荣。\r圣杯九以愿望牌著名，它预示着你的梦想在现实中的去向。但要领悟图形的寓意，必须晓得自己的内心意图，勇于承担寻梦过程中的相应责任。这样才能终极享受自己的好运气。\r关键词：内心的快乐，物质主义，内心很满足，利己主义，物质，功利，放纵，任性"
          }
        },
        "59": {
          "name_cn": "圣杯10",
          "name_en": "X of Cups",
          "type": "Cups",
          "meaning": {
            "up": "团队和谐、人际关系融洽、家庭和睦",
            "down": "团队不和、人际关系不和、冲突"
          },
          "pic": "圣杯-10",
          "Brand_Link": "https://tarotchina.net/suit-of-cups10-vip/",
          "info": {
            "description": "代表互利的团队或和谐的家庭。\r假如经历一段时间的人际冲突，此牌出现，代表和解指日可待。在感情方面的推测上，圣杯十代表两人已经越过圣杯二的初恋阶段，寻求更长就稳定的关系 ，极可能步入婚姻的圣殿 。\r关键词：爱使你身心愉悦，神圣的爱情，爱情至上，真爱，幸福的一对，融洽，和睦，和声，和谐，协调，一致",
            "reverseDescription": "代表互利的团队或和谐的家庭。\r假如经历一段时间的人际冲突，此牌出现，代表和解指日可待。在感情方面的推测上，圣杯十代表两人已经越过圣杯二的初恋阶段，寻求更长就稳定的关系 ，极可能步入婚姻的圣殿 。\r关键词：断线，拆解，切断，断开，停止供电，错误的价值观，价值观错位，渐渐远离，挣扎摆脱关系"
          }
        },
        "60": {
          "name_cn": "圣杯国王",
          "name_en": "King of Cups",
          "type": "Cups",
          "meaning": {
            "up": "创造力、决策力、某方面的专家、有条件的分享或交换",
            "down": "表里不一、行为另有所图、对自我创造力的不信任"
          },
          "pic": "圣杯国王",
          "Brand_Link": "https://tarotchina.net/suit-of-cups14-vip/",
          "info": {
            "description": "熟练的控制自己的情绪取得成功。\r关键词：情绪平稳，有同情心，怜悯，社交，有手段，变通，策略，圆滑",
            "reverseDescription": "熟练的控制自己的情绪取得成功。\r关键词：自我同情，自怜，自我怜悯，喜怒无常，冲动"
          }
        },
        "61": {
          "name_cn": "圣杯王后",
          "name_en": "Queen of Cups",
          "type": "Cups",
          "meaning": {
            "up": "感情丰富而细腻、重视直觉、感性的思考",
            "down": "过度情绪化、用情不专、心灵的孤立"
          },
          "pic": "圣杯王后",
          "Brand_Link": "https://tarotchina.net/suit-of-cups13-vip/",
          "info": {
            "description": "意味着跟着感觉走就能成功。\r关键词：富有同情心，慈悲，乐于助人，关心他人，体贴人，关注，在意，担忧，关心，关怀，努力做，情绪稳定，第六感准确，跟随，不做主，听话，乖巧",
            "reverseDescription": "意味着跟着感觉走就能成功。\r关键词：自我照顾，自我保护，自我照顾，自爱，靠自己"
          }
        },
        "62": {
          "name_cn": "圣杯骑士",
          "name_en": "Knight of Cups",
          "type": "Cups",
          "meaning": {
            "up": "在等待与行动之间做出决定、新的机会即将到来",
            "down": "用情不专、消极的等待、对于情感的行动错误"
          },
          "pic": "圣杯骑士",
          "Brand_Link": "https://tarotchina.net/suit-of-cups12-vip/",
          "info": {
            "description": "意味着在情感与行动之间做出决定。\r关键词：浪漫，爱情关系，风流韵事，恋爱，爱情，魅力，魔力，吸引力，迷人的特征，妩媚，吉祥小饰物，美好",
            "reverseDescription": "意味着在情感与行动之间做出决定。\r关键词：想象力过度活跃，思维跳跃，不切实际，吃醋，妒忌，妒羡，珍惜，爱惜，精心守护，情绪多变，喜怒无常，脾气坏，郁郁寡欢，感伤，抑郁，令人悲伤"
          }
        },
        "63": {
          "name_cn": "圣杯侍从",
          "name_en": "Page of Cups",
          "type": "Cups",
          "meaning": {
            "up": "情感的表达与奉献、积极的消息即将传来、情感的追求但不成熟",
            "down": "情感的追求但错误、感情暧昧、过度执着于情感或问题"
          },
          "pic": "圣杯侍从",
          "Brand_Link": "https://tarotchina.net/suit-of-cups11-vip/",
          "info": {
            "description": "意味着内心情感表达与奉献。\r关键词：好奇心，求知欲，罕见而有趣之物，艺术家，创造能力，直觉敏锐，一切皆有可能",
            "reverseDescription": "意味着内心情感表达与奉献。\r关键词：新思想，新思路，创意，想法，新观点，错觉，感觉不对劲，没有灵感，情感幼稚"
          }
        },
        "64": {
          "name_cn": "星币ACE",
          "name_en": "Ace of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "新的机遇、顺利发展、物质回报",
            "down": "金钱上的损失、发展不顺、物质丰富但精神虚空"
          },
          "pic": "星币-01",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles1-vip/",
          "info": {
            "description": "有足够的钱保证计划的实施。\r当星币首牌出现时，通常代表一个有关金钱与物质的新计划，且前途光明。但这并不代表以后就衣食无忧，它会提示你：想要的东西就在伸手可得之处。另外星币首牌可以表示加薪，获利，以及肉体与精神上的满足和娱乐。\r在感情上，星币首牌代表一段稳定且布满感官享受的关系，也可以表示感情的物化，如给对方一枚钻戒等。\r关键词：新财路，新就业机会，新的经济模式，新的经济来源，显示，表明，表示，显灵，大量，丰盛，充裕，富裕",
            "reverseDescription": "有足够的钱保证计划的实施。\r当星币首牌出现时，通常代表一个有关金钱与物质的新计划，且前途光明。但这并不代表以后就衣食无忧，它会提示你：想要的东西就在伸手可得之处。另外星币首牌可以表示加薪，获利，以及肉体与精神上的满足和娱乐。\r在感情上，星币首牌代表一段稳定且布满感官享受的关系，也可以表示感情的物化，如给对方一枚钻戒等。\r关键词：失去机会，错过机会，没有计划，准备不周，没有远见"
          }
        },
        "65": {
          "name_cn": "星币2",
          "name_en": "II of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "收支平衡、财富的流通、生活的波动与平衡",
            "down": "用钱过度、难以维持平衡、面临物质的损失"
          },
          "pic": "星币-02",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles2-vip/",
          "info": {
            "description": "一个与钱财相关的决定。\r要求推测者面对各种事物，要八面玲珑长袖善舞，不要死守某个思维定势。在财运的推测中，星币二预示着收支平衡。假如你近来情绪低落，它预示你应想得开，需要出去玩乐。\r关键词：优先选择，多种选择，时间管理，适应，可用，灵活",
            "reverseDescription": "一个与钱财相关的决定。\r要求推测者面对各种事物，要八面玲珑长袖善舞，不要死守某个思维定势。在财运的推测中，星币二预示着收支平衡。假如你近来情绪低落，它预示你应想得开，需要出去玩乐。\r关键词：过度承诺，过度保证，结构破坏，组织瓦解，管理混乱，修复，重定位"
          }
        },
        "66": {
          "name_cn": "星币3",
          "name_en": "III of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "团队合作、沟通顺畅、工作熟练、关系稳定",
            "down": "分工不明确、人际关系不和、专业技能不足"
          },
          "pic": "星币-03",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles3-vip/",
          "info": {
            "description": "通过研究学习或者将构想实践而改变自身的境遇。\r在感情上，星币三可能表示工作团队中培养起来的恋情，也可能暗示双双把重心都放在了金钱与地位，而缺乏情感交流。\r关键词：团队合作，团队精神，学习，知识，学问，学识，执行，履行，实施，贯彻，生效，完成",
            "reverseDescription": "通过研究学习或者将构想实践而改变自身的境遇。\r在感情上，星币三可能表示工作团队中培养起来的恋情，也可能暗示双双把重心都放在了金钱与地位，而缺乏情感交流。\r关键词：不协调，非合作，错位，单独工作，独自修行"
          }
        },
        "67": {
          "name_cn": "星币4",
          "name_en": "IV of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "安于现状、吝啬、守财奴、财富停滞、精神匮乏",
            "down": "入不敷出、奢侈无度、挥霍"
          },
          "pic": "星币-04",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles4-vip/",
          "info": {
            "description": "一段勤俭节约的日子或者经历。\r星币四在实际推测中，往往代表指控，代表那些牢牢把握物质资产不放的人（也包括精神层面上的东西）。若是情侣，会嫉妒心很重，爱吃醋，若是老板，肯定是处处剥削工资的小气鬼。\r关键词：省钱，存钱，安全，担保，保证，保守，原则，缺乏，不足，稀少，限制，限定，约束，管理，管制",
            "reverseDescription": "一段勤俭节约的日子或者经历。\r星币四在实际推测中，往往代表指控，代表那些牢牢把握物质资产不放的人（也包括精神层面上的东西）。若是情侣，会嫉妒心很重，爱吃醋，若是老板，肯定是处处剥削工资的小气鬼。\r关键词：过度消费，财政赤字，铺张浪费，贪婪，贪心，贪欲，贪吃，自我保护，自我防卫"
          }
        },
        "68": {
          "name_cn": "星币5",
          "name_en": "V of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "经济危机、同甘共苦、艰难时刻",
            "down": "居住问题、生活混乱、劳燕分飞"
          },
          "pic": "星币-05",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles5-vip/",
          "info": {
            "description": "意味着远离了那些能充实的事物。\r星币五在实际推测中，一般代表同甘共苦，荣辱与共。若是情侣的话明知在一起未来生活清苦，但也义无反顾的在一起。\r关键词：经济损失，贫穷，贫困，贫乏，短缺，劣质，孤独，孤立，担心，担忧，发愁",
            "reverseDescription": "意味着远离了那些能充实的事物。\r星币五在实际推测中，一般代表同甘共苦，荣辱与共。若是情侣的话明知在一起未来生活清苦，但也义无反顾的在一起。\r关键词：经济复苏，赔偿，补偿，清债，精神空虚"
          }
        },
        "69": {
          "name_cn": "星币6",
          "name_en": "VI of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "慷慨、给予、礼尚往来、财务稳定且乐观",
            "down": "自私、暗藏心机、负债或在情义上亏欠于人"
          },
          "pic": "星币-06",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles6-vip/",
          "info": {
            "description": "一种结构性的关系，其中某人支配另一个人。\r星币六经常表示你将要得到需要的东西。如朋友久欠不还的债款，一件意义非凡的赠礼，甚至是遗产。当然，有时也代表着你将要捐献，馈赠，为别人付出。\r关键词：給予，付出，捐赠，拿到，接到，收到，体验，受到，分享财富，慷慨，大方，宽宏大量，慈善，赈济，施舍，仁爱，宽容，宽厚",
            "reverseDescription": "一种结构性的关系，其中某人支配另一个人。\r星币六经常表示你将要得到需要的东西。如朋友久欠不还的债款，一件意义非凡的赠礼，甚至是遗产。当然，有时也代表着你将要捐献，馈赠，为别人付出。\r关键词：自我照顾，自理，未偿债务，欠钱，赊账，白费劲，没收获，伪善，只有付出没有收获"
          }
        },
        "70": {
          "name_cn": "星币7",
          "name_en": "VII of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "等待时机成熟、取得阶段性成果、思考计划",
            "down": "事倍功半、投资失利、踟蹰不决"
          },
          "pic": "星币-07",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles7-vip/",
          "info": {
            "description": "思考未来的财务或者经济状况。\r星币七象征一个十字路口。在日常生活中，开拓新的方向并不容易。星币七正显示一种过程改变中的形象，它不是终结之牌，由于游戏并未结束，所以需要时时刻刻去把握。\r关键词：着眼长远，永续经营，持之以恒，投资兴业，长远考虑，可持续发展，毅力，韧性，不屈不挠的精神，投资",
            "reverseDescription": "思考未来的财务或者经济状况。\r星币七象征一个十字路口。在日常生活中，开拓新的方向并不容易。星币七正显示一种过程改变中的形象，它不是终结之牌，由于游戏并未结束，所以需要时时刻刻去把握。\r关键词：缺乏长远眼光，达不到预期，结果不理想，成功有限，回报有限"
          }
        },
        "71": {
          "name_cn": "星币8",
          "name_en": "VIII of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "工作专注、技能娴熟、进取心、做事有条理",
            "down": "精力分散、工作乏味、工作产出不佳"
          },
          "pic": "星币-08",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles8-vip/",
          "info": {
            "description": "暗示对某人或者某种情况的承诺。\r星币八通常暗示推测者要集中精力去处理眼前的急切的事务，同时，此牌也鼓舞推测者付出百分之二百的汗水去从事感受好的事物。\r关键词：学徒，见习，见习，重复的工作，机械性劳动，精通，熟练掌握，控制，驾驭，培养能力，开发技术，练习技能，精益求精",
            "reverseDescription": "暗示对某人或者某种情况的承诺。\r星币八通常暗示推测者要集中精力去处理眼前的急切的事务，同时，此牌也鼓舞推测者付出百分之二百的汗水去从事感受好的事物。\r关键词：自我发展，完美主义，误导，错误，方向不对，使用不当"
          }
        },
        "72": {
          "name_cn": "星币9",
          "name_en": "IX of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "事业收获、持续为自己创造有利条件、懂得理财储蓄",
            "down": "失去财富、舍弃金钱追求生活、管理能力欠缺"
          },
          "pic": "星币-09",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles9-vip/",
          "info": {
            "description": "自信且自律将获得成功。\r星币九在推测中含义丰富。有时候是纪律和自控的象征，有时暗示推测者放弃一切尘世中低俗下流不文明的东西，有所节制。此牌正放和倒放差别很大。\r关键词：丰衣足食，丰富，富庶，奢侈的享受，奢华，奢侈品，自给自足，财务自由，经济独立",
            "reverseDescription": "自信且自律将获得成功。\r星币九在推测中含义丰富。有时候是纪律和自控的象征，有时暗示推测者放弃一切尘世中低俗下流不文明的东西，有所节制。此牌正放和倒放差别很大。\r关键词：自我价值，投资过度，工作过度，匆忙，催促"
          }
        },
        "73": {
          "name_cn": "星币10",
          "name_en": "X of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "团队和谐、成功的事业伙伴、家族和谐",
            "down": "团队不和、投资合伙暂缓、家庭陷入不和"
          },
          "pic": "星币-10",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles10-vip/",
          "info": {
            "description": "坚实的物质基础。\r情爱方面，星币十可能显示双方在事业上契合伙伴，同时暗示缺乏情感缺乏交流，或不重视这方面的沟通。另外，也可代表搀杂了其他物质因素的婚姻。\r关键词：钱财，资产，经济安全，生活保证，家庭，亲人，亲戚，长远成功，未来成功，捐款，贡献",
            "reverseDescription": "坚实的物质基础。\r情爱方面，星币十可能显示双方在事业上契合伙伴，同时暗示缺乏情感缺乏交流，或不重视这方面的沟通。另外，也可代表搀杂了其他物质因素的婚姻。\r关键词：理财失败，遭受损失，财产来源不清，黑心钱，缺德赚钱，奸商"
          }
        },
        "74": {
          "name_cn": "星币国王",
          "name_en": "King of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "成功人士、追求物质、善于经营、值得信赖、成熟务实",
            "down": "缺乏经济头脑、缺乏信任、管理不善、失去信赖"
          },
          "pic": "星币国王",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles14-vip/",
          "info": {
            "description": "非毅力者不能成也。\r关键词：财富，富裕，大量，丰富，众多，充裕，商业，买卖，生意，商务，公事，领导地位，领导才能，领导品质，安全，保证，惩罚，处罚，训练，训导，管教，自我控制，严格要求",
            "reverseDescription": "非毅力者不能成也。\r关键词：没有商业头脑，沉迷于金钱与社会地位，固执，执拗，顽固，倔强"
          }
        },
        "75": {
          "name_cn": "星币王后",
          "name_en": "Queen of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "成熟、繁荣、值得信赖、温暖、安宁",
            "down": "爱慕虚荣、生活浮华、态度恶劣"
          },
          "pic": "星币王后",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles13-vip/",
          "info": {
            "description": "喜欢大自然或者田园生活。\r星币皇后是一张无穷暖和的牌，当大家看到这张牌时，皇后地能量已辐射到大家身上，不管它是以何种身份出现在大家生活中，大家都被激励，被匡扶。\r关键词：培育，养育，教养，包养，现实，实际，供给，给钱，资助，工作的父母",
            "reverseDescription": "喜欢大自然或者田园生活。\r星币皇后是一张无穷暖和的牌，当大家看到这张牌时，皇后地能量已辐射到大家身上，不管它是以何种身份出现在大家生活中，大家都被激励，被匡扶。\r关键词：经济独立，自我照顾，工作与家庭冲突，财务自由，事业与爱情相冲突"
          }
        },
        "76": {
          "name_cn": "星币骑士",
          "name_en": "Knight of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "讲究效率、责任感赖、稳重、有计划",
            "down": "懈怠、思想保守、发展停滞不前"
          },
          "pic": "星币骑士",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles12-vip/",
          "info": {
            "description": "认真执行稳健的计划。\r关键词：勤奋工作，艰难工作，辛苦工作，艰苦工作，高效，规律，保守，原则",
            "reverseDescription": "认真执行稳健的计划。\r关键词：自律，无聊，感觉“卡住了”，自我约束，厌烦，厌倦，无聊，瓶颈阶段，完美主义"
          }
        },
        "77": {
          "name_cn": "星币侍从",
          "name_en": "Page of Pentacles",
          "type": "Pentacles",
          "meaning": {
            "up": "善于思考和学习、求知欲旺盛、与知识或者研究工作有关的好消息",
            "down": "知识贫乏、自我认知不足、金钱上面临损失、视野狭窄"
          },
          "pic": "星币侍从",
          "Brand_Link": "https://tarotchina.net/suit-of-pentacles11-vip/",
          "info": {
            "description": "意味着努力学习。\r关键词：显现，表现，出头，投资机会，技能发展，技术突破",
            "reverseDescription": "意味着努力学习。\r关键词：缺乏进展，停滞不前，延期，拖延，汲取教训，总结经验"
          }
        }
      }
    }
    
  ]
