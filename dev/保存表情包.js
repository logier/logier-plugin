
import https from 'https';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const crypto = require('crypto');


let setupath = "/home/gallery/other"; //存setu指令保存图片的路径
let emojipath = "/home/Miao-Yunzai/resources/logier/emoji"; //存表情指令保存图片的路径



// TextMsg可自行更改，其他照旧即可。
export class TextMsg extends plugin {
    constructor() {
        super({
            name: '保存表情包', // 插件名称
            dsc: '保存表情包',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 5000,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '#?(保存表情包|存表情)$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '保存表情包',  // 执行方法
                    permission: "master",
                },
                {
                    reg: '#?(保存涩图|存涩图)$',   // 正则表达式,有关正则表达式请自行百度
                    fnc: '保存涩图',  // 执行方法
                    permission: "master",
                },
                {
                  reg: '#?(查看表情包)$',   // 正则表达式,有关正则表达式请自行百度
                  fnc: '查看表情包',  // 执行方法
                  permission: "master",
              },
              {
                reg: '#?(删除表情包).*$',   // 正则表达式,有关正则表达式请自行百度
                fnc: '删除表情包',  // 执行方法
                permission: "master",
            },
            ]
        })

    }



    // 执行方法1
    async 保存表情包(e) {
        if(e.img) {
            e.img.forEach(img => {
                logger.info(img);
                downloadFile(img, emojipath)
                .then((filePath) => {
                  console.log(`文件下载成功，保存在：${filePath}`);
                  e.reply(`保存成功，编号为${currentId}`, true);
              })
                .catch((err) => {
                  console.log('文件下载失败:', err);
                  e.reply("保存失败，请再次尝试或手动保存", true);
              })
            });
        } else if(e.source) {
            let reply = (await e.group.getChatHistory(e.source.seq, 1)).pop()?.message
            reply.forEach(function(item) {
                if (item.type === 'image') {
                  logger.info(item.url);
                  downloadFile(item.url, emojipath)
                  .then((filePath) => {
                    console.log(`文件下载成功，保存在：${filePath}`);
                    e.reply(`保存成功，编号为${currentId}`, true);
                })
                  .catch((err) => {
                    console.log('文件下载失败:', err);
                    e.reply("保存失败，请再次尝试或手动保存", true);
                })
                }
              });
            }

        return true
    }  

    async 查看表情包(e) {
      e.reply(`表情包编号：${readImages(emojipath)}`, true)
      return true
  }  

  async 删除表情包(e) {
    let 编号 = this.e.msg.replace(/^#?(删除表情包)/, '');
    deleteImage(emojipath, 编号)
    e.reply(`删除成功`, true)
    return true
}  

    async 保存涩图(e) {
        if(e.img) {
            e.img.forEach(img => {
                logger.info(img);
                downloadFile(img, setupath)
                .then((filePath) => {
                  console.log(`文件下载成功，保存在：${filePath}`);
                  e.reply(`保存成功，编号为${currentId}`, true);
              })
                .catch((err) => {
                  console.log('文件下载失败:', err);
                  e.reply("保存失败，请再次尝试或手动保存", true);
              })
            });
        } else if(e.source) {
            let reply = (await e.group.getChatHistory(e.source.seq, 1)).pop()?.message
            reply.forEach(function(item) {
                if (item.type === 'image') {
                  logger.info(item.url);
                  downloadFile(item.url, setupath)
                  .then((filePath) => {
                    console.log(`文件下载成功，保存在：${filePath}`);
                    e.reply(`保存成功，编号为${currentId}`, true);
                })
                  .catch((err) => {
                    console.log('文件下载失败:', err);
                    e.reply("保存失败，请再次尝试或手动保存", true);
                })
                }
              });
            }
        return true
    }  

}


let currentId = 1; // 初始编号
let hashSet = new Set(); // 存储哈希值的集合

const getHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

const getNextId = (destDir) => {
  let exts = ['.jpg', '.png', '.gif', '.webp'];
  while (exts.some(ext => fs.existsSync(path.join(destDir, `${currentId}${ext}`)))) {
    currentId++;
  }
  return currentId;
};

const downloadFile = (url, destDir, subDir) => {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        const contentType = response.headers['content-type'];
        let ext = '';
        if (contentType.includes('image/jpeg')) {
          ext = '.jpg';
        } else if (contentType.includes('image/png')) {
          ext = '.png';
        } else if (contentType.includes('image/gif')) {
          ext = '.gif';
        } else if (contentType.includes('image/webp')) {
          ext = '.webp';
        } else {
          ext = '.jpg';
        }
  
        // 如果subDir存在，将其添加到destDir中
        if (subDir) {
          destDir = path.join(destDir, subDir);
          // 如果子目录不存在，创建它
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir);
          }
        }

        // 从文件中读取哈希值
        if (fs.existsSync(path.join(destDir, 'hashes.txt'))) {
          const hashes = fs.readFileSync(path.join(destDir, 'hashes.txt'), 'utf-8');
          hashSet = new Set(hashes.split('\n'));
        }
  
        let data = new Buffer.from([]);
        response.on('data', (chunk) => {
          data = Buffer.concat([data, chunk]);
        });
  
        response.on('end', () => {
          const hash = getHash(data);
          if (hashSet.has(hash)) {
            resolve('File already exists');
          } else {
            hashSet.add(hash);
            fs.appendFileSync(path.join(destDir, 'hashes.txt'), hash + '\n');
            const dest = path.join(destDir, `${getNextId(destDir)}${ext}`);
            fs.writeFileSync(dest, data);
            resolve(dest);
          }
        });
      }).on('error', (err) => {
        console.error(`An error occurred: ${err}`);
        reject(err.message);
      });
    });
};



const readImages = (dir) => {
  let results = [];

  // 读取目录中的所有文件和文件夹
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    // 获取文件的完整路径
    const filePath = path.join(dir, file);

    // 获取文件的信息
    const stat = fs.statSync(filePath);

    // 如果是目录，则递归读取
    if (stat && stat.isDirectory()) {
      results = results.concat(readImages(filePath));
    } else {
      // 检查文件扩展名是否为图片
      const ext = path.extname(file).toLowerCase();
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.webp') {
        // 获取文件名中的数字
        const num = parseInt(path.basename(file, ext));
        if (!isNaN(num)) {
          results.push(num);
        }
      }
    }
  });

  // 对结果进行排序
  results.sort((a, b) => a - b);

  // 创建范围
  let ranges = [];
  for (let i = 0; i < results.length; i++) {
    // 如果当前数字和下一个数字连续，则创建一个新的范围或扩展现有的范围
    if (i === results.length - 1 || results[i] + 1 !== results[i + 1]) {
      ranges.push([results[i]]);
    } else {
      let range = [results[i]];
      while (i < results.length - 1 && results[i] + 1 === results[i + 1]) {
        range.push(results[i + 1]);
        i++;
      }
      ranges.push(range);
    }
  }

  // 将范围转换为字符串
  let strRanges = ranges.map(range => range[0] === range[range.length - 1] ? `${range[0]}` : `${range[0]}-${range[range.length - 1]}`);

  return strRanges.join(', ');
};

// 使用方法：readImages('指定的目录')


const deleteImage = (dir, id) => {
  // 读取目录中的所有文件和文件夹
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    // 获取文件的完整路径
    const filePath = path.join(dir, file);

    // 获取文件的信息
    const stat = fs.statSync(filePath);

    // 如果是目录，则递归删除
    if (stat && stat.isDirectory()) {
      deleteImage(filePath, id);
    } else {
      // 检查文件扩展名是否为图片
      const ext = path.extname(file).toLowerCase();
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.webp') {
        // 获取文件名中的数字
        const num = parseInt(path.basename(file, ext));
        if (!isNaN(num) && num === id) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      }
    }
  });
};

// 使用方法：deleteImage('指定的目录', 编号)





  




  