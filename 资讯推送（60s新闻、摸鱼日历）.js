import fetch from 'node-fetch'
import plugin from '../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import schedule from 'node-schedule'

const moyutime = '0 30 9 * * ?';// 摸鱼日历定时发送时间，采用 Cron 表达式，当前默认为每日 9:00 分推送
const moyugroupList = ["315239849"]; // 摸鱼日历指定定时发送的群号
const moyuisAutoPush = true;// 摸鱼日历是否开启定时推送，默认为 false

const newstime = '0 30 8 * * ?';// 60s新闻定时发送时间，采用 Cron 表达式，当前默认为每日 9:00 分推送
const newsgroupList = ["315239849"];// 60s新闻指定定时发送的群号
const newsisAutoPush = true;// 60s新闻是否开启定时推送，默认为 false

export class example extends plugin {
  constructor() {
    super({
      name: '摸鱼日历和60s新闻',
      dsc: '获取摸鱼日历和60s新闻',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^(#|/)?(摸鱼日历|摸鱼)$',
          fnc: 'getMoyu'
        },
        {
          reg: '^(#|/)?(60s日报|今日新闻)$',
          fnc: 'getNews'
        }
      ]
    });
  }

  async getMoyu(e) {
    pushContent(e, moyuapiUrl);
  }

  async getNews(e) {
    pushContent(e, newsimageUrl);
  }
}

/**
 * 推送内容
 * @param e oicq传递的事件参数e
 * @param url 图片的URL或API的URL
 */
async function pushContent(e, url, isAuto = 0) {
  let msg;
  let maxAttempts = 3;
  for(let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (url === moyuapiUrl) {
        let fetchUrl = await fetch(url).catch(err => logger.error(err));
        let imgUrl = await fetchUrl.json();
        url = await imgUrl.url;
      }
      msg = [segment.image(url, false, 120)];
      // 如果图片获取成功，就跳出循环
      break;
    } catch (error) {
      console.error(`Attempt ${attempt} failed. Retrying...`);
    }
  }

  // 如果尝试了最大次数后仍然失败，就记录错误并退出
  if(!msg) {
    console.error('Failed to get image after maximum attempts');
    return;
  }

  // 回复消息
  if (isAuto) {
    e.sendMsg(msg);
  } else {
    e.reply(msg);
  }
}

/**
 * 定时任务
 */
function autoTask(time, groupList, isAutoPush, url, taskName) {
  if (isAutoPush) {
    schedule.scheduleJob(time, () => {
      logger.info(`[${taskName}]：开始自动推送...`);
      for (let i = 0; i < groupList.length; i++) {
        setTimeout(() => {
          let group = Bot.pickGroup(groupList[i]);
          pushContent(group, url, 1);
        }, i * 1000);  // 延迟 i 秒
      }
    });
  }
}


const moyuapiUrl = 'https://api.vvhan.com/api/moyu?type=json';// 摸鱼日历接口地址
const newsimageUrl = 'http://bjb.yunwj.top/php/tp/60.jpg';// 60s新闻图片的 URL

autoTask(moyutime, moyugroupList, moyuisAutoPush, moyuapiUrl, '摸鱼人日历');
autoTask(newstime, newsgroupList, newsisAutoPush, newsimageUrl, '60s新闻');
