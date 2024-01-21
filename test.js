import plugin from "../../lib/plugins/plugin.js";
import PluginsLoader from "../../lib/plugins/loader.js";


// 随机发送表情包的群号
const groupList = ['877538147']

// 群聊中接收到消息后随机发送表情概率，0-1之间，越大发送概率越大，0为不发送
const emojirate = 1;

// 随机发送表情包定义延迟的最小值和最大值
let minDelay = 0; //最小延时，单位：秒
let maxDelay = 0; //最大延时，单位：秒

export class autoCommand extends plugin {
    constructor() {
      super({
        name: "test",
        dsc: "test",
        event: "message",
        priority: -9999,
        rule: [{
          reg: '',
          fnc: '推送表情包',
        }],
      });
    }

    async 推送表情包() {
        logger.info(groupList)
        logger.info(this.e.group_id)
        if (groupList.includes(this.e.group_id)) {
            logger.info('群在在白名单')
            let command = '表情包'
            logger.info(command)
            let timeout = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
            logger.info(timeout)
            await setETask(command, Number(timeout))
        } else {
            logger.info('群不在白名单')
        }
    }
    

}

async function setETask(text, timeout) {
    let e = await getE(text)
    return setTimeout(async function () {
      await PluginsLoader.deal(e)
    }, timeout * 1000)
  }

  async function getE(text){
    return {
      post_type: 'message',
      message_id: this.e.message_id,
      user_id: this.e.user_id,
      time: this.e.time,
      seq: this.e.seq,
      rand: this.e.rand,
      font: this.e.font,
      message_type: this.e.message_type,
      sub_type: this.e.sub_type,
      sender: this.e.sender,
      from_id: this.e.from_id,
      to_id: this.e.to_id,
      auto_reply: this.e.auto_reply,
      friend: this.e.friend,
      reply: this.e.reply,
      self_id: this.e.self_id,
      logText: '',
      isPrivate: this.e.isPrivate,
      isMaster: this.e.isMaster,
      replyNew: this.e.replyNew,
      runtime: this.e.runtime,
      user: this.e.user,
      Bot: this.e.Bot || global.Bot,

      message: [{ type: 'text', text }],
      msg: '',
      original_msg: text,
      raw_message: text,
      toString: () => { return text }
    }
  }












