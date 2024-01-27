import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';

const imageUrls = [
    // 'D:\\Edgedownload\\pixiv'
    //'https://t.mwm.moe/mp', //横图
    "https://t.mwm.moe/pc"
    // '/home/gallery',
    // 添加更多的 URL或本地文件夹...
];

// TextMsg可自行更改，其他照旧即可。
export class TextMsg extends plugin {
  constructor() {
      super({
          name: '今日签到', // 插件名称
          dsc: '今日签到',  // 插件描述            
          event: 'message',  // 更多监听事件请参考下方的 Events
          priority: 6,   // 插件优先度，数字越小优先度越高
          rule: [
              {
                  reg: '^#?(签到)$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '签到'  // 执行方法
              }
          ]
      })

  }

  // 执行方法1
  async 签到(e) {

    let now = new Date();
   let datatime =  now.toLocaleDateString('zh-CN'); //日期格式

   const response = await fetch('https://v1.hitokoto.cn');
   const hitokodata = await response.json();
    const content = hitokodata.hitokoto;


    let imageUrl = await getRandomImage(imageUrls); 
    if (path.isAbsolute(imageUrl)) {
      let imageBuffer = await fs.readFileSync(imageUrl);
      let base64Image = imageBuffer.toString('base64');
      imageUrl = 'data:image/png;base64,' + base64Image
  }

  let data = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.user_id}_sign`));
  const addfavor = Math.floor(Math.random() * 10) + 1;
  let  issign = `好感度+${addfavor}`
  if (!data) {
      data = { favor: addfavor, time: datatime };
  } else if (data.time !== datatime) {
      data.favor += addfavor;
      data.time = datatime;
  } else if (data.time == datatime) {
     issign = `今日已经签到了`
} 
  
  await redis.set(`Yunzai:logier-plugin:${e.user_id}_sign`, JSON.stringify(data));
  let finaldata = JSON.parse(await redis.get(`Yunzai:logier-plugin:${e.user_id}_sign`));
  
  let groupdata = JSON.parse(await redis.get(`Yunzai:logier-plugin:group${e.group_id}_sign`)) || {};
  groupdata[e.user_id] = data.favor;
  logger.info(groupdata)

  await redis.set(`Yunzai:logier-plugin:group${e.group_id}_sign`, JSON.stringify(groupdata));
  
  let favorValues = Object.values(groupdata);
  favorValues.sort((a, b) => b - a);
  
  let position = favorValues.indexOf(data.favor) + 1;

  let Html = `
  <!DOCTYPE html>
  <html lang="zh">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      <div id="main">
        <img alt="" id="main_img" class="bgimg"/>
        <canvas id="cav"></canvas>
        <div id="wrapper">
          <div id="left" style="width: 100%; align-items: center; display: flex!important; font-weight: bold; color: white; text-shadow: -2px 0 black, 0 2px black, 2px 0 black, 0 -2px black;">
            <div id="user_line" style=" text-align: center;">
            <br>
              <img alt="" id="avatar" src="https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}" style="width: 80px; float: left; margin-right: 20px;border-radius: 50%;" />
              <p style="text-align: left; "><span style="font-size: 23px;text-align: center;">欢迎回来！</span><br>${e.nickname}</p>
              <br>
              <div style="text-align: left">
              <p>${issign}</p>
              <p>当前好感度：${finaldata.favor}</p>
              <p>当前群排名：第${position}位</p>
              <p style="line-height: 150%;">今日一言：<br>${content}</p>   
              </div>       
            </div>
          </div>
          <div id="right">
            <div id="img_top" class="img_around">
              <span id="date_text">${datatime}</span>
            </div>
            <img alt="" id="cont_img" class="bgimg"/>
            <div id="img_bottom" class="img_around"></div>
          </div>
        </div>
      </div>
    </body>
  </html>
  <style>
    html,
    body {
      width: 900px;
    }
    #main {
      display: grid;
      grid-template-areas: "i";
      width: 900px;
      overflow: hidden;
    }
    #main_img {
      grid-area: i;
      z-index: -1;
      width: 900px;
      filter: blur(10px); /*模糊强度*/
    }
    #cav {
      grid-area: i;
      z-index: -2;
      visibility: hidden;
      width: 100%;
      height: 100%;
    }
    #wrapper {
      grid-area: i;
      display: grid;
      grid-template-columns: 30% 70%;
    }
    #left {
      padding-left: 30px;
    }
    #right {
    padding-left: 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  </style>
  
  <style>
    #cont_img {
      width: 90%;
      border-radius: 10px;
      filter: drop-shadow(0px 0px 10px black);
    }
    .img_around {
      width: 80%;
      height: 60px;
    }
    #img_top {
      display: flex;
      justify-content: end;
      align-items: end;
      padding: 10px;
    }
    #date_text {
      font-size: 36px;
      font-weight: bold;
      color: white;
      filter: drop-shadow(1px 1px 0px black);
    }
  </style>
  
  <style>
    html {
      line-height: 1.15; /* 1 */
      -webkit-text-size-adjust: 100%; /* 2 */
    }
    body {
      margin: 0;
    }
    main {
      display: block;
    }
    h1 {
      font-size: 2em;
      margin: 0.67em 0;
    }
    hr {
      box-sizing: content-box; /* 1 */
      height: 0; /* 1 */
      overflow: visible; /* 2 */
    }
    pre {
      font-family: monospace, monospace; /* 1 */
      font-size: 1em; /* 2 */
    }
    a {
      background-color: transparent;
    }
    abbr[title] {
      border-bottom: none; /* 1 */
      text-decoration: underline; /* 2 */
      text-decoration: underline dotted; /* 2 */
    }
    b,
    strong {
      font-weight: bolder;
    }
    code,
    kbd,
    samp {
      font-family: monospace, monospace; /* 1 */
      font-size: 1em; /* 2 */
    }
    small {
      font-size: 80%;
    }
    sub,
    sup {
      font-size: 75%;
      line-height: 0;
      position: relative;
      vertical-align: baseline;
    }
    sub {
      bottom: -0.25em;
    }
    sup {
      top: -0.5em;
    }
    img {
      border-style: none;
    }
    button,
    input,
    optgroup,
    select,
    textarea {
      font-family: inherit;
      font-size: 100%;
      line-height: 1.15;
      margin: 0;
    }
    button,
    input {
      overflow: visible;
    }
    button,
    select {
      text-transform: none;
    }
    button,
    [type="button"],
    [type="reset"],
    [type="submit"] {
      -webkit-appearance: button;
    }
    button::-moz-focus-inner,
    [type="button"]::-moz-focus-inner,
    [type="reset"]::-moz-focus-inner,
    [type="submit"]::-moz-focus-inner {
      border-style: none;
      padding: 0;
    }
    button:-moz-focusring,
    [type="button"]:-moz-focusring,
    [type="reset"]:-moz-focusring,
    [type="submit"]:-moz-focusring {
      outline: 1px dotted ButtonText;
    }
    fieldset {
      padding: 0.35em 0.75em 0.625em;
    }
    legend {
      box-sizing: border-box; /* 1 */
      color: inherit; /* 2 */
      display: table; /* 1 */
      max-width: 100%; /* 1 */
      padding: 0; /* 3 */
      white-space: normal; /* 1 */
    }
    progress {
      vertical-align: baseline;
    }
    textarea {
      overflow: auto;
    }
    [type="checkbox"],
    [type="radio"] {
      box-sizing: border-box; /* 1 */
      padding: 0; /* 2 */
    }
    [type="number"]::-webkit-inner-spin-button,
    [type="number"]::-webkit-outer-spin-button {
      height: auto;
    }
    [type="search"] {
      -webkit-appearance: textfield; /* 1 */
      outline-offset: -2px; /* 2 */
    }
    [type="search"]::-webkit-search-decoration {
      -webkit-appearance: none;
    }
    ::-webkit-file-upload-button {
      -webkit-appearance: button; /* 1 */
      font: inherit; /* 2 */
    }
    details {
      display: block;
    }
    summary {
      display: list-item;
    }
    template {
      display: none;
    }
    [hidden] {
      display: none;
    }
  </style>
  <script>
    Function.prototype.rereturn = function (re) {
      return (...args) => re(this(...args));
    };
    window.$ = document.querySelectorAll
      .bind(document)
      .rereturn((list) => (call_back) => list.forEach(call_back));
  </script>
  <script>
  /****
   * $的用法：
   * $(接收一个参数，和你css里的选择器是一样的)(接收一个回调函数，回调函数的参数是接收到的元素，每一个元素都会被回调函数处理一遍)
   * 例子：
   * $("h")((h)=>{h.innerText="你好"})
   * 实际上就是让所有h元素的innerText都等于你好
   */

  $(".bgimg")((img) => {
    img.src = "${imageUrl}"; //图片url,建议使用base64
  });

</script>
          `;
 



    let browser;

 

    try {
      const imageUrl = await getRandomImage(imageUrls);
      if (!imageUrl) {
        throw new Error('无法获取图片URL');
      }
      browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(Html)
      const imgElement = await page.$('#main');
      // 对图片元素进行截图
      const image = await imgElement.screenshot();
      e.reply(segment.image(image))
    } catch (error) {
      logger.info('图片渲染失败');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
    return true;

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








