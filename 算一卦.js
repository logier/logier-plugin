
import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';

const imageUrls = [
    'https://t.mwm.moe/mp', 
    // '/home/gallery', 
    // 添加更多的 URL或本地文件夹...
];


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

    async function push算一卦(e, isResuangua = false) {
         
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




 var guayao = [
  "██████&#10;██████&#10;██████&#10;██████&#10;██████&#10;██████&#10;\n",
  "██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██        ██&#10;██████&#10;██████&#10;██████&#10;\n",
  "██████&#10;██████&#10;██████&#10;██        ██&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;\n",
  "██████&#10;██████&#10;██        ██&#10;██████&#10;██████&#10;██████&#10;\n",
  "██████&#10;██████&#10;██████&#10;██        ██&#10;██████&#10;██████&#10;\n",
  "██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;██████&#10;██████&#10;\n",
  "██████&#10;██████&#10;██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;\n",
  "██████&#10;██████&#10;██████&#10;██████&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██████&#10;██████&#10;██████&#10;██████&#10;\n",
  "██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██████&#10;██        ██&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██        ██&#10;██████&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;██████&#10;\n",
  "██████&#10;██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;\n",
  "██████&#10;██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██████&#10;██████&#10;██        ██&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██        ██&#10;██████&#10;██████&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;\n",
  "██        ██&#10;██████&#10;██████&#10;██████&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;\n",
  "██████&#10;██        ██&#10;██████&#10;██████&#10;██        ██&#10;██████&#10;\n",
  "██        ██&#10;██████&#10;██████&#10;██████&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██████&#10;██████&#10;██████&#10;██        ██&#10;\n",
  "██████&#10;██████&#10;██████&#10;██████&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██████&#10;██████&#10;██████&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██████&#10;██        ██&#10;██████&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██████&#10;██        ██&#10;██████&#10;██████&#10;\n",
  "██        ██&#10;██████&#10;██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;██████&#10;██        ██&#10;\n",
  "██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;██████&#10;\n",
  "██████&#10;██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;\n",
  "██        ██&#10;██████&#10;██████&#10;██████&#10;██████&#10;██████&#10;\n",
  "██████&#10;██████&#10;██████&#10;██████&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██████&#10;██        ██&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██        ██&#10;██████&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██████&#10;██        ██&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██        ██&#10;██████&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██████&#10;██████&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██████&#10;██████&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;\n",
  "██████&#10;██████&#10;██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;██████&#10;██████&#10;\n",
  "██        ██&#10;██        ██&#10;██████&#10;██████&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██████&#10;██████&#10;██        ██&#10;██        ██&#10;\n",
  "██████&#10;██████&#10;██        ██&#10;██████&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██████&#10;██        ██&#10;██████&#10;██████&#10;\n",
  "██████&#10;██████&#10;██        ██&#10;██        ██&#10;██████&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██        ██&#10;██        ██&#10;██████&#10;██████&#10;\n",
  "██████&#10;██████&#10;██        ██&#10;██        ██&#10;██████&#10;██████&#10;\n",
  "██        ██&#10;██        ██&#10;██████&#10;██████&#10;██        ██&#10;██        ██&#10;\n",
  "██        ██&#10;██████&#10;██        ██&#10;██████&#10;██        ██&#10;██████&#10;\n",
  "██████&#10;██        ██&#10;██████&#10;██        ██&#10;██████&#10;██        ██&#10;\n"
]


var guachi = [
  "第1卦&#10;乾为天·自强不息【上上卦】&#10;象曰：&#10;困龙得水好运交，&#10;不由喜气上眉梢，&#10;一切谋望皆如意，&#10;向后时运渐渐高。&#10;&#10;象征天，喻龙（德才的君子），又象征纯粹的阳和健，表明兴盛强健。乾卦是根据万物变通的道理，以“元、亨、利、贞”为卦辞，示吉祥如意，教导人遵守天道的德行\n",
  "第2卦&#10;坤为地·厚德载物【上上卦】&#10;象曰：&#10;肥羊失群入山岗，&#10;饿虎逢之把口张，&#10;适口充肠心欢喜，&#10;卦若占之大吉昌。&#10;&#10;阴性。象征地（与乾卦相反），顺从天。承载万物，伸展无穷无尽。坤卦以雌马为象征，表明地道生育抚养万物，而又依天顺时，性情温顺。它以“先迷后得”证明“坤”顺从“乾”，依随“乾”，才能把握正确方向，遵循正道，获取吉利\n",
  "第3卦&#10;水雷屯·起始维艰【下下卦】&#10;象曰：&#10;风刮乱丝不见头，&#10;颠三倒四犯忧愁，&#10;慢从款来左顺遂，&#10;急促反惹不自由。&#10;&#10;震为雷，喻动；坎为雨，喻险。雷雨交加，险象丛生，环境恶劣。“屯”原指植物萌生大地。万物始生，充满艰难险阻，然而顺时应运，必欣欣向荣\n",
  "第4卦&#10;山水蒙·启蒙奋发【中下卦】&#10;象曰：&#10;卦中爻象犯小耗，&#10;君子占之运不高，&#10;婚姻合伙有琐碎，&#10;做事必然受苦劳。&#10;&#10;艮是山的形象，喻止；坎是水的形象，喻险。卦形为山下有险，仍不停止前进，是为蒙昧，故称蒙卦。但因把握时机，行动切合时宜，因此，具有启蒙和通达的卦象\n",
  "第5卦&#10;水天需·守正待机【中上卦】&#10;象曰：&#10;明珠土埋日久深，&#10;无光无亮到如今，&#10;忽然大风吹土去，&#10;自然显露有重新。&#10;&#10;下卦是乾，刚健之意；上卦是坎，险陷之意。以刚逢险，宜稳健之妥，不可冒失行动，观时待变，所往一定成功\n",
  "第6卦&#10;天水讼·慎争戒讼【中下卦】&#10;象曰：&#10;心中有事事难做，&#10;恰是二人争路走，&#10;雨下俱是要占先，&#10;谁肯让谁走一步。&#10;&#10;同需卦相反，互为“综卦”。乾为刚健，坎为险陷。刚与险，健与险，彼此反对，定生争讼。争讼非善事，务必慎重戒惧\n",
  "第7卦&#10;地水师·行险而顺【中上卦】&#10;象曰：&#10;将帅领旨去出征，&#10;骑着烈马拉硬弓，&#10;百步穿杨去得准，&#10;箭中金钱喜气生。&#10;&#10;“师”指军队。坎为水、为险；坤为地、为顺，喻寓兵于农。兵凶战危，用兵乃圣人不得已而为之，但它可以顺利无阻碍地解决矛盾，因为顺乎形势，师出有名，故能化凶为吉\n",
  "第8卦&#10;水地比·诚信团结【上上卦】&#10;象曰：&#10;顺风行船撒起帆，&#10;上天又助一蓬风，&#10;不用费力逍遥去，&#10;任意而行大亨通。&#10;&#10;坤为地；坎为水。水附大地，地纳河海，相互依赖，亲密无间。此卦与师卦完全相反，互为综卦。它阐述的是相亲相辅，宽宏无私，精诚团结的道理\n",
  "第9卦&#10;风天小畜·蓄养待进【下下卦】&#10;象曰：&#10;苗逢旱天尽焦梢，&#10;水想云浓雨不浇，&#10;农人仰面长吁气，&#10;是从款来莫心高。&#10;&#10;乾为天；巽为风。喻风调雨顺，谷物滋长，故卦名小畜（蓄）。力量有限，须待发展到一定程度，才可大有作为\n",
  "第10卦&#10;天泽履·脚踏实地【中上卦】&#10;象曰：&#10;凤凰落在西岐山，&#10;长鸣几声出圣贤，&#10;天降文王开基业，&#10;富贵荣华八百年。&#10;&#10;乾为天；兑为泽，以天喻君，以泽喻民，原文：“履（踩）虎尾、不咥（咬）人。”因此，结果吉利。君上民下，各得其位。兑柔遇乾刚，所履危。履意为实践，卦义是脚踏实地的向前进取的意思\n",
  "第11卦&#10;地天泰·应时而变【中中卦】&#10;象曰：&#10;学文满腹入场闱，&#10;三元及第得意回，&#10;从今解去愁和闷，&#10;喜庆平地一声雷。&#10;&#10;乾为天，为阳；坤为地，为阴，阴阳交感，上下互通，天地相交，万物纷纭。反之则凶。万事万物，皆对立，转化，盛极必衰，衰而转盛，故应时而变者泰（通）\n",
  "第12卦&#10;天地否(pǐ)·不交不通【中中卦】&#10;象曰：&#10;虎落陷坑不堪言，&#10;进前容易退后难，&#10;谋望不遂自己便，&#10;疾病口舌事牵连。&#10;&#10;其结构同泰卦相反，系阳气上升，阴气下降，天地不交，万物不通。它们彼此为“综卦”，表明泰极而否，否极泰来，互为因果\n",
  "第13卦&#10;天火同人·上下和同【中上卦】&#10;象曰：&#10;心中有事犯猜疑，&#10;谋望从前不着实，&#10;幸遇明人来指引，&#10;诸般忧闷自消之。&#10;&#10;乾为天，为君；离为火，为臣民百姓，上天下火，火性上升，同于天，上下和同，同舟共济，人际关系和谐，天下大同\n",
  "第14卦&#10;火天大有·顺天依时【上上卦】&#10;象曰：&#10;砍树摸雀作事牢，&#10;是非口舌自然消，&#10;婚姻合伙不费力，&#10;若问走失未逃脱。&#10;&#10;上卦为离，为火；下卦为乾，为天。火在天上，普照万物，万民归顺，顺天依时，大有所成\n",
  "第15卦&#10;地山谦·内高外低【中中卦】&#10;象曰：&#10;天赐贫人一封金，&#10;不争不抢两平分，&#10;彼此分得金到手，&#10;一切谋望皆遂心。&#10;&#10;艮为山，坤为地。地面有山，地卑（低）而山高，是为内高外低，比喻功高不自居，名高不自誉，位高不自傲。这就是谦\n",
  "第16卦&#10;雷地豫·顺时依势【中中卦】&#10;象曰：&#10;太公插下杏黄旗，&#10;收妖为徒归西岐，&#10;自此青龙得了位，&#10;一旦谋望百事宜。&#10;&#10;坤为地，为顺；震为雷，为动。雷依时出，预示大地回春。因顺而动，和乐之源。此卦与谦卦互为综卦，交互作用\n",
  "第17卦&#10;泽雷随·随时变通【中中卦】&#10;象曰：&#10;泥里步踏这几年，&#10;推车靠崖在眼前，&#10;目下就该再使力，&#10;扒上崖去发财源。&#10;&#10;震为雷、为动；兑为悦。动而悦就是“随”。随指相互顺从，己有随物，物能随己，彼此沟通。随必依时顺势，有原则和条件，以坚贞为前提\n",
  "第18卦&#10;山风蛊·振疲起衰【中中卦】&#10;象曰：&#10;卦中爻象如推磨，&#10;顺当为福反为祸，&#10;心中有益且迟迟，&#10;凡事尽从忙处错。&#10;&#10;与随卦互为综卦。蛊（gu）本意为事，引申为多事、混乱。器皿久不用而生虫称“蛊”，喻天下久安而因循、腐败，必须革新创造，治理整顿，挽救危机，重振事业\n",
  "第19卦&#10;地泽临·教民保民【中上卦】&#10;象曰：&#10;君王无道民倒悬，&#10;常想拨云见青天，&#10;幸逢明主施仁政，&#10;重又安居乐自然。&#10;&#10;坤为地；兑为泽，地高于泽，泽容于地。喻君主亲临天下，治国安邦，上下融洽\n",
  "第20卦&#10;风地观·观下瞻上【中上卦】&#10;象曰：&#10;卦遇蓬花旱逢河，&#10;生意买卖利息多，&#10;婚姻自有人来助，&#10;出门永不受折磨。&#10;&#10;风行地上，喻德教遍施。观卦与临卦互为综卦，交相使用。在上者以道义观天下；在下者以敬仰瞻上，人心顺服归从\n",
  "第21卦&#10;火雷噬嗑·刚柔相济【上上卦】&#10;象曰：&#10;运拙如同身受饥，&#10;幸得送饭又送食，&#10;适口充腹心欢喜，&#10;忧愁从此渐消移。&#10;&#10;离为阴卦；震为阳卦。阴阳相交，咬碎硬物，喻恩威并施，宽严结合，刚柔相济。噬嗑（shihe）为上下颚咬合，咀嚼\n",
  "第22卦&#10;山火贲·饰外扬质【中上卦】&#10;象曰：&#10;近来运转瑞气周，&#10;窈窕淑女君子求，&#10;钟鼓乐之大吉庆，&#10;占者逢之喜临头。&#10;&#10;离为火为明；艮为山为止。文明而有节制。贲（bi）卦论述文与质的关系，以质为主，以文调节。贲，文饰、修饰\n",
  "第23卦&#10;山地剥·顺势而止【中下卦】&#10;象曰：&#10;鹊遇天晚宿林中，&#10;不知林内先有鹰，&#10;虽然同处心生恶，&#10;卦若逢之是非轻。&#10;&#10;五阴在下，一阳在上，阴盛而阳孤；高山附于地。二者都是剥落象，故为“剥卦”。此卦阴盛阳衰，喻小人得势，君子困顿，事业败坏\n",
  "第24卦&#10;地雷复·寓动于顺【中中卦】&#10;象曰：&#10;马氏太公不相合，&#10;世人占之忧疑多，&#10;恩人无义反为怨，&#10;是非平地起风波。&#10;&#10;震为雷、为动；坤为地、为顺，动则顺，顺其自然。动在顺中，内阳外阴，循序运动，进退自如，利于前进\n",
  "第25卦&#10;天雷无妄·无妄而得【下下卦】&#10;象曰：&#10;飞鸟失机落笼中，&#10;纵然奋飞不能腾，&#10;目下只宜守本分，&#10;妄想扒高万不能。&#10;&#10;乾为天为刚为健；震为雷为刚为动。动而健，刚阳盛，人心振奋，必有所得，但唯循纯正，不可妄行。无妄必有获，必可致福\n",
  "第26卦&#10;山天大畜·止而不止【中上卦】&#10;象曰：&#10;忧愁常锁两眉头，&#10;千头万绪挂心间，&#10;从今以后防开阵，&#10;任意行而不相干。&#10;&#10;乾为天，刚健；艮为山，笃实。畜者积聚，大畜意为大积蓄。为此不畏严重的艰难险阻，努力修身养性以丰富德业\n",
  "第27卦&#10;山雷颐·纯正以养【上上卦】&#10;象曰：&#10;太公独钓渭水河，&#10;手执丝杆忧愁多，&#10;时来又遇文王访，&#10;自此永不受折磨。&#10;&#10;震为雷，艮为山。山在上而雷在下，外实内虚。春暖万物养育，依时养贤育民。阳实阴虚，实者养人，虚者为人养。自食其力\n",
  "第28卦&#10;泽风大过·非常行动【中下卦】&#10;象曰：&#10;夜晚梦里梦金银，&#10;醒来仍不见一文，&#10;目下只宜求本分，&#10;思想络是空劳神。&#10;&#10;兑为泽、为悦，巽为木、为顺，泽水淹舟，遂成大错。阴阳爻相反，阳大阴小，行动非常，有过度形象，内刚外柔\n",
  "第29卦&#10;坎为水·行险用险【下下卦】&#10;象曰：&#10;一轮明月照水中，&#10;只见影儿不见踪，&#10;愚夫当财下去取，&#10;摸来摸去一场空。&#10;&#10;坎为水、为险，两坎相重，险上加险，险阻重重。一阳陷二阴。所幸阴虚阳实，诚信可豁然贯通。虽险难重重，却方能显人性光彩\n",
  "第30卦&#10;离为火·附和依托【中上卦】&#10;象曰：&#10;官人来占主高升，&#10;庄农人家产业增，&#10;生意买卖利息厚，&#10;匠艺占之大亨通。&#10;&#10;离者丽也，附着之意，一阴附丽，上下二阳，该卦象征火，内空外明。离为火、为明、太阳反复升落，运行不息，柔顺为心\n",
  "第31卦&#10;泽山咸·相互感应【中上卦】&#10;象曰：&#10;运去黄金失色，&#10;时来棒槌发芽，&#10;月令极好无差，&#10;且喜心宽意大。&#10;&#10;艮为山；泽为水。兑柔在上，艮刚在下，水向下渗，柔上而刚下，交相感应。感则成\n",
  "第32卦&#10;雷风恒·恒心有成【中上卦】&#10;象曰：&#10;渔翁寻鱼运气好，&#10;鱼来撞网跑不了，&#10;别人使本挣不来，&#10;谁想一到就凑合。&#10;&#10;震为男、为雷；巽为女、为风。震刚在上，巽柔在下。刚上柔下，造化有常，相互助长。阴阳相应，常情，故称为恒\n",
  "第33卦&#10;天山遁·遁世救世【下下卦】&#10;象曰：&#10;浓云蔽日不光明，&#10;劝君且莫出远行，&#10;婚姻求财皆不利，&#10;提防口舌到门庭。&#10;&#10;乾为天，艮为山。天下有山，山高天退。阴长阳消，小人得势，君子退隐，明哲保身，伺机救天下\n",
  "第34卦&#10;雷天大壮·壮勿妄动【中上卦】&#10;象曰：&#10;卦占工师得大木，&#10;眼前该着走上路，&#10;时来运转多顺当，&#10;有事自管放心宽。&#10;&#10;震为雷；乾为天。乾刚震动。天鸣雷，云雷滚，声势宏大，阳气盛壮，万物生长。刚壮有力故曰壮。大而且壮，故名大壮。四阳壮盛，积极而有所作为，上正下正，标正影直\n",
  "第35卦&#10;火地晋·求进发展【中上卦】&#10;象曰：&#10;锄地锄去苗里草，&#10;谁想财帛将人找，&#10;一锄锄出银子来，&#10;这个运气也算好。&#10;&#10;离为日，为光明；坤为地。太阳高悬，普照大地，大地卑顺，万物生长，光明磊落，柔进上行，喻事业蒸蒸日上\n",
  "第36卦&#10;地火明夷·晦而转明【中下卦】&#10;象曰：&#10;时乖运拙走不着，&#10;急忙过河拆了桥，&#10;恩人无义反为怨，&#10;凡事无功枉受劳。&#10;&#10;离为明，坤为顺；离为日；坤为地。日没入地，光明受损，前途不明，环境困难，宜遵时养晦，坚守正道，外愚内慧，韬光养晦\n",
  "第37卦&#10;风火家人·诚威治业【下下卦】&#10;象曰：&#10;一朵鲜花镜中开，&#10;看着极好取不来，&#10;劝君休把镜花恋，&#10;卦若逢之主可怪。&#10;&#10;离为火；巽为风。火使热气上升，成为风。一切事物皆应以内在为本，然后伸延到外。发生于内，形成于外。喻先治家而后治天下，家道正，天下安乐\n",
  "第38卦&#10;火泽睽·异中求同【下下卦】&#10;象曰：&#10;此卦占来运气歹，&#10;如同太公作买卖，&#10;贩猪牛快贩羊迟，&#10;猪羊齐贩断了宰。&#10;&#10;离为火；兑为泽。上火下泽，相违不相济。克则生，往复无空。万物有所不同，必有所异，相互矛盾。睽即矛盾\n",
  "第39卦&#10;水山蹇·险阻在前【下下卦】&#10;象曰：&#10;大雨倾地雪满天，&#10;路上行人苦又寒，&#10;拖泥带水费尽力，&#10;事不遂心且耐烦。&#10;&#10;坎为水；艮为山。山高水深，困难重重，人生险阻，见险而止，明哲保身，可谓智慧。蹇，跋行艰难\n",
  "第40卦&#10;雷水解·柔道致治【中上卦】&#10;象曰：&#10;目下月令如过关，&#10;千辛万苦受熬煎，&#10;时来恰相有人救，&#10;任意所为不相干。&#10;&#10;震为雷、为动；坎为水、为险。险在内，动在外。严冬天地闭塞，静极而动。万象更新，冬去春来，一切消除，是为解\n",
  "第41卦&#10;山泽损·损益制衡【下下卦】&#10;象曰：&#10;时运不至费心多，&#10;比作推车受折磨，&#10;山路崎岖吊下耳，&#10;左插右按按不着。&#10;&#10;艮为山；兑为泽。上山下泽，大泽浸蚀山根。损益相间，损中有益，益中有损。二者之间，不可不慎重对待。损下益上，治理国家，过度会损伤国基。应损则损，但必量力、适度。少损而益最佳\n",
  "第42卦&#10;风雷益·损上益下【上上卦】&#10;象曰：&#10;时来运转吉气发，&#10;多年枯木又开花，&#10;枝叶重生多茂盛，&#10;几人见了几人夸。&#10;&#10;巽为风；震为雷。风雷激荡，其势愈强，雷愈响，风雷相助互长，交相助益。此卦与损卦相反。它是损上以益下，后者是损下以益上。二卦阐述的是损益的原则\n",
  "第43卦&#10;泽天夬·决而能和【上上卦】&#10;象曰：&#10;蜘蛛脱网赛天军，&#10;粘住游蜂翅翎毛，&#10;幸有大风吹破网，&#10;脱离灾难又逍遥。&#10;&#10;乾为天为健；兑为泽为悦。泽气上升，决注成雨，雨施大地，滋润万物。五阳去一阴，去之不难，决（去之意）即可，故名为夬（guài），夬即决\n",
  "第44卦&#10;天风姤·天下有风【上卦】&#10;象曰：&#10;他乡遇友喜气欢，&#10;须知运气福重添，&#10;自今交了顺当运，&#10;向后管保不相干。&#10;&#10;乾为天；巽为风。天下有风，吹遍大地，阴阳交合，万物茂盛。姤（gǒu）卦与夬卦相反，互为“综卦”。姤即遘，阴阳相遇。但五阳一阴，不能长久相处\n",
  "第45卦&#10;泽地萃·荟萃聚集【中上卦】&#10;象曰：&#10;游鱼戏水被网惊，&#10;跳过龙门身化龙，&#10;三尺杨柳垂金线，&#10;万朵桃花显你能。&#10;&#10;坤为地、为顺；兑为泽、为水。泽泛滥淹没大地，人众多相互斗争，危机必四伏，务必顺天任贤，未雨绸缪，柔顺而又和悦，彼此相得益彰，安居乐业。萃，聚集、团结\n",
  "第46卦&#10;地风升·柔顺谦虚【上上卦】&#10;象曰：&#10;士人来占必得名，&#10;生意买卖也兴隆，&#10;匠艺逢之交易好，&#10;农间庄稼亦收成。&#10;&#10;坤为地、为顺；巽为木、为逊。大地生长树木，逐步的成长，日渐高大成材，喻事业步步高升，前程远大，故名“升”\n",
  "第47卦&#10;泽水困·困境求通【中上卦】&#10;象曰：&#10;时运不来好伤怀，&#10;撮上押去把梯抬，&#10;一筒虫翼无到手，&#10;转了上去下不来。&#10;&#10;兑为阴为泽喻悦；坎为阳为水喻险。泽水困，陷入困境，才智难以施展，仍坚守正道，自得其乐，必可成事，摆脱困境\n",
  "第48卦&#10;水风井·求贤若渴【上上卦】&#10;象曰：&#10;枯井破费已多年，&#10;一朝流泉出来鲜，&#10;资生济渴人称羡，&#10;时来运转喜自然。&#10;&#10;坎为水；巽为木。树木得水而蓬勃生长。人靠水井生活，水井由人挖掘而成。相互为养，井以水养人，经久不竭，人应取此德而勤劳自勉\n",
  "第49卦&#10;泽火革·顺天应人【上上卦】&#10;象曰：&#10;苗逢旱天渐渐衰，&#10;幸得天恩降雨来，&#10;忧去喜来能变化，&#10;求谋干事遂心怀。&#10;&#10;离为火；兑为泽，泽内有水。水在上而下浇，火在下而上升。火旺水干；水大火熄。二者相生亦相克，必然出现变革。变革是宇宙的基本规律\n",
  "第50卦&#10;火风鼎·稳重图变【中下卦】&#10;象曰：&#10;莺鹜蛤蜊落沙滩，&#10;蛤蜊莺鹜两翅扇，&#10;渔人进前双得利，&#10;失走行人却自在。&#10;&#10;燃木煮食，化生为熟，除旧布新的意思。鼎为重宝大器，三足稳重之象。煮食，喻食物充足，不再有困难和困扰。在此基础上宜变革，发展事业\n",
  "第51卦&#10;震为雷·临危不乱【中上卦】&#10;象曰：&#10;一口金钟在淤泥，&#10;人人拿着当玩石，&#10;忽然一日钟悬起，&#10;响亮一声天下知。&#10;&#10;震为雷，两震相叠，反响巨大，可消除沉闷之气，亨通畅达。平日应居安思危，怀恐惧心理，不敢有所怠慢，遇到突发事变，也能安然自若，谈笑如常\n",
  "第52卦&#10;艮为山·动静适时【中下卦】&#10;象曰：&#10;财帛常打心头走，&#10;可惜眼前难到手，&#10;不如意时且忍耐，&#10;逢着闲事休开口。&#10;&#10;艮为山，二山相重，喻静止。它和震卦相反。高潮过后，必然出现低潮，进入事物的相对静止阶段。静止如山，宜止则止，宜行则行。行止即动和静，都不可失机，应恰到好处，动静得宜，适可而止\n",
  "第53卦&#10;风山渐·渐进蓄德【上上卦】&#10;象曰：&#10;俊鸟幸得出笼中，&#10;脱离灾难显威风，&#10;一朝得意福力至，&#10;东西南北任意行。&#10;&#10;艮为山；巽为木。山上有木，逐渐成长，山也随着增高。这是逐渐进步的过程，所以称渐，渐即进，渐渐前进而不急速\n",
  "第54卦&#10;雷泽归妹·立家兴业【下下卦】&#10;象曰：&#10;求鱼须当向水中，&#10;树上求之不顺情，&#10;受尽爬揭难随意，&#10;劳而无功运平平。&#10;&#10;震为动、为长男；兑为悦、为少女。以少女从长男，产生爱慕之情，有婚姻之动，有嫁女之象，故称归妹。男婚女嫁，天地大义，人的开始和终结。上卦与渐卦为综卦，交互为用\n",
  "第55卦&#10;雷火丰·日中则斜【上上卦】&#10;象曰：&#10;古镜昏暗好几年，&#10;一朝磨明似月圆，&#10;君子谋事逢此卦，&#10;时来运转喜自然。&#10;&#10;电闪雷鸣，成就巨大，喻达到顶峰，如日中天。告诫；务必注意事物向相反方面发展。治乱相因，盛衰无常，不可不警惕\n",
  "第56卦&#10;火山旅·依义顺时【下下卦】&#10;象曰：&#10;飞鸟树上垒窝巢，&#10;小人使计举火烧，&#10;君占此卦为不吉，&#10;一切谋望枉徒劳。&#10;&#10;此卦与丰卦相反，互为“综卦”。山中燃火，烧而不止，火势不停地向前蔓延，如同途中行人，急于赶路。因而称旅卦\n",
  "第57卦&#10;巽为风·谦逊受益【中上卦】&#10;象曰：&#10;一叶孤舟落沙滩，&#10;有篙无水进退难，&#10;时逢大雨江湖溢，&#10;不用费力任往返。&#10;&#10;巽（xùn）为风，两风相重，长风不绝，无孔不入，巽义为顺。谦逊的态度和行为可无往不利\n",
  "第58卦&#10;兑为泽·刚内柔外【上上卦】&#10;象曰：&#10;这个卦象真可取，&#10;觉着做事不费力，&#10;休要错过这机关，&#10;事事觉得随心意。&#10;&#10;泽为水。两泽相连，两水交流，上下相和，团结一致，朋友相助，欢欣喜悦。兑为悦也。同秉刚健之德，外抱柔和之姿，坚行正道，导民向上\n",
  "第59卦&#10;风水涣·拯救涣散【下下卦】&#10;象曰：&#10;隔河望见一锭金，&#10;欲取岸宽水又深，&#10;指望资财难到手，&#10;昼思夜想枉费心。&#10;&#10;风在水上行，推波助澜，四方流溢。涣，水流流散之意。象征组织和人心涣散，必用积极的手段和方法克服，战胜弊端，挽救涣散，转危为安\n",
  "第60卦&#10;水泽节·万物有节【上上卦】&#10;象曰：&#10;时来运转喜气生，&#10;登台封神姜太公，&#10;到此诸神皆退位，&#10;纵然有祸不成凶。&#10;&#10;兑为泽；坎为水。泽有水而流有限，多必溢于泽外。因此要有节度，故称节。节卦与涣卦相反，互为综卦，交相使用。天地有节度才能常新，国家有节度才能安稳，个人有节度才能完美\n",
  "第61卦&#10;风泽中孚·诚信立身【下下卦】&#10;象曰：&#10;路上行人色匆匆，&#10;急忙无桥过薄冰，&#10;小心谨慎过得去，&#10;一步错了落水中。&#10;&#10;孚（fú）本义孵，孵卵出壳的日期非常准确，有信的意义。卦形外实内虚，喻心中诚信，所以称中孚卦。这是立身处世的根本\n",
  "第62卦&#10;雷山小过·行动有度【中上卦】&#10;象曰：&#10;行人路过独木桥，&#10;心内惶恐眼里瞧，&#10;爽利保你过得去，&#10;慢行一定不安牢。&#10;&#10;艮为山；震为雷。过山雷鸣，不可不畏惧。阳为大，阴为小，卦外四阴超过中二阳，故称“小过”，小有越过\n",
  "第63卦&#10;水火既济·盛极将衰【中上卦】&#10;象曰：&#10;金榜以上题姓名，&#10;不负当年苦用功，&#10;人逢此卦名吉庆，&#10;一切谋望大亨通。&#10;&#10;坎为水；离为火。水火相交，水在火上，水势压倒火势，救火大功告成。既，已经；济，成也。既济就是事情已经成功，但终将发生变故\n",
  "第64卦&#10;火水未济·事业未竟【中下卦】&#10;象曰：&#10;离地着人几丈深，&#10;是防偷营劫寨人，&#10;后封太岁为凶煞，&#10;时加谨慎祸不侵。&#10;&#10;离为火；坎为水。火上水下，火势压倒水势，救火大功未成，故称未济。《周易》以乾坤二卦为始，以既济、未济二卦为终，充分反映了变化发展的思想"
]