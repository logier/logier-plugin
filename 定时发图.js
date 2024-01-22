import schedule from 'node-schedule'
import fs from 'fs';
import path from 'path';

// 定时发送时间，采用 Cron 表达式，当前默认为半小时推送一次
let time = '0 0/30 * * * ? ';

// 指定定时发送的群号
let groupList = ['123456'];

// 是否开启定时推送，默认为 false
let isAutoPush = false;

/*图片地址，支持本地和网络
├── emojihub
│   ├── capoo-emoji
│   │   ├── capoo100.gif
│   ├── greyscale-emoji
│   │   ├── greyscale100.gif
可以填写/path/to/emojihub 或 /path/to/emojihub/capoo-emoji */
let dirs = [
  // '/home/gallery', 
  // 'C:\\Users\\logie\\Pictures\\设定集'
];

let excludeDirs = ['不想要的文件夹1', '不想要的文件夹2'];  // 比如你填写了emojihub，但不想要下面的greyscale-emoji，就直接填入文件夹名字

autoTask();

export class example extends plugin {
  constructor() {
    super({
      name: '定时发图',
      dsc: '定时发图',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?(定时发图)$',
          fnc: '定时发图'
        }
      ]
    });
  }

  async 定时发图(e) {
    try {
      await push定时发图(e);
    } catch (error) {
      console.error(error);
    }
  }
}

async function push定时发图(e, isAuto = 0) {
  const fileTypeRegex = /\.(jpg|jpeg|png|gif|webp)$/;
  let files = [];

  // 随机选择一个目录
  let dir = dirs[Math.floor(Math.random() * dirs.length)];

  let picture;
  if (dir.startsWith('http')) {
    // 如果dir是HTTP URL，直接将其写入picture
    picture = dir;
  } else {
    try {
      // 获取文件夹及其子文件夹下的所有文件
      await getFiles(dir, files, fileTypeRegex);
    } catch (error) {
      console.error(error);
      return;
    }

    // 从文件列表中随机选择一个文件
    picture = files[Math.floor(Math.random() * files.length)];
  }

  // 获取文件夹名和文件名
  let folderName = path.dirname(picture).split(path.sep).pop();
  let pictureNameWithoutExt = path.basename(picture, path.extname(picture));

  // 构造消息
  let fenlei = `分类：${folderName}\nPid：${pictureNameWithoutExt}`;

  if (isAuto) {
    e.sendMsg([fenlei, segment.image(picture)]);
  } else {
    e.reply([fenlei, segment.image(picture)]);
  }
}

async function getFiles(currentDir, files, fileTypeRegex) {
  const dirContent = await fs.promises.readdir(currentDir);

  for (const file of dirContent) {
    const filePath = path.join(currentDir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        await getFiles(filePath, files, fileTypeRegex);
      }
    } else if (fileTypeRegex.test(filePath)) {
      files.push(filePath);
    }
  }
}

/**
 * 定时任务
 */
function autoTask() {
  if (isAutoPush) {
    schedule.scheduleJob(time, () => {
      // 随机延迟1到120秒
      const delay = Math.floor(Math.random() * 120) * 1000;
      setTimeout(() => {
        logger.info('[定时发图]：开始自动推送...');
        for (let i = 0; i < groupList.length; i++) {
          setTimeout(() => {
            let group = Bot.pickGroup(groupList[i]);
            push自定义(group, 1);
          }, i * 1000);  // 延迟 i 秒
        }
      }, delay);
    });
  }
}




