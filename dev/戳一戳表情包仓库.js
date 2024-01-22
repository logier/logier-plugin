import fetch from 'node-fetch';

const path=process.cwd()


//在这里设置事件概率,请保证概率加起来小于1，少于1的部分会触发反击
let reply_text = 0.1 //文字回复概率
let reply_img = 0.85 //图片回复概率
let reply_voice = 0.0 //语音回复概率
let mutepick = 0.00 //禁言概率
let example = 0.0 //拍一拍表情概率
//剩下的0.08概率就是反击

/*
自定义表情包地址，支持本地和网络
├── emojihub
│   ├── capoo-emoji
│   │   ├── capoo100.gif
│   ├── greyscale-emoji
│   │   ├── greyscale100.gif
支持填写emojihub文件夹
*/
const imageUrls = [
    // 'https://t.mwm.moe/xhl',
    // '/home/Miao-Yunzai/resources/emojihub',
    // 'C:\\Users\\logie\\Pictures\\设定集'
];
// 你想要排除的表情包类别，请填写fnc的部分，别名无效
const excludeCategories = ['龙图', '小黑子'];
// emojihub调用自定义表情包的概率，0-1之间，越大调用概率越大，0为不发送，不影响主动使用
const customerrate = 0;

let character = '' //人格
let API = '' //https://github.com/chatanywhere/GPT_API_free?tab=readme-ov-file#%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8

let word_list=['（轻轻地被戳）喵呜~(≧▽≦)',
'（小心翼翼地被戳）喵～(๑•́ ₃ •̀๑)',
'你戳谁呢！你戳谁呢！！！',
'不要再戳了！我真的要被你气死了！！',
'怎么会有你这么无聊的人啊！！！',
'是不是要揍你一顿才开心啊！！！',
'不要再戳了！！！',
'讨厌死了！'];


let url = 'https://ikechan8370-vits-uma-genshin-honkai.hf.space/api/generate';
const Speaker = '特别周';

export class chuo extends plugin{
    constructor(){
    super({
        name: '戳一戳',
        dsc: '戳一戳机器人触发效果',
        event: 'notice.group.poke',
        priority: 5000,
        rule: [
            {
                /** 命令正则匹配 */
                fnc: 'chuoyichuo'
                }
            ]
        }
    )
}


async chuoyichuo (e){
    logger.info('[戳一戳生效]')
    if(e.target_id == cfg.qq){
        //生成0-100的随机数
        let random_type = Math.random()
        
        //回复随机文字
        if(random_type < reply_text){

            try {
                const response = await axios.post(
                    'https://api.chatanywhere.com.cn/v1/chat/completions', {
                    'model': 'gpt-3.5-turbo',
                    'messages': [
                        {
                        'role': 'system',
                        'content': character ,
                        'role': 'user',
                        'content': '戳一戳你' ,
                    }],
                    'temperature': 0.8
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + API
                    }
                }
                );
                let msg = response.data.choices[0].message.content
                msg = msg.replace(/\n/g, '')
                e.reply(msg, true)
            } catch (error) {
                let text_number = Math.ceil(Math.random() * word_list['length'])
                await e.reply(word_list[text_number-1])
            } 
        }
        
        
        //回复随机图片
        else if(random_type < (reply_text + reply_img)){

            let emojiType = random > customerrate ? 'emojihub' : '自定义表情包';
            sendEmoji(e, emojiType);

        }
        
        //回复随机语音
        else if(random_type < (reply_text + reply_img + reply_voice)){
            try {
                const response = await axios.post(
                    'https://api.chatanywhere.com.cn/v1/chat/completions', {
                    'model': 'gpt-3.5-turbo',
                    'messages': [
                        {
                        'role': 'system',
                        'content': character ,
                        'role': 'user',
                        'content': '戳一戳你' ,
                    }],
                    'temperature': 0.8
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + API
                    }
                }
                );
                let msg = response.data.choices[0].message.content
                msg = msg.replace(/\n/g, '')

                

                
                let data = [
                    msg, 
                    "中文", 
                    Speaker, 
                    0.6, 
                    0.668, 
                    1.2, 
                ];
                
                fetch(url, {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({data: data}) 
                })
                .then(response => response.json())
                .then(data => {
                    if (data.data && data.data[1].is_file) {
                        let audioData = data.data[1].data; // 获取音频数据
                        let audioBuffer = Buffer.from(audioData, 'base64'); // 将 Base64 编码的字符串转换为 Buffer
                        fs.writeFileSync('output.wav', audioBuffer); // 将 Buffer 写入到一个文件中
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
                e.reply(segment.record('output.wav'))
               
            } catch (error) {
                let text_number = Math.ceil(Math.random() * word_list['length'])
                await e.reply(word_list[text_number-1])
            } 
        }
        }
        
        //禁言
        else if(random_type < (reply_text + reply_img + reply_voice + mutepick)){
            //两种禁言方式，随机选一种
            let mutetype = Math.ceil(Math.random() * 2)
            if(mutetype == 1){
                e.reply('说了不要戳了！')
                await common.sleep(1000)
                await e.group.muteMember(e.operator_id,60);
                await common.sleep(3000)
                e.reply('啧')
                //有这个路径的图话可以加上
                //await e.reply(segment.image('file:///' + path + '/resources/chuochuo/'+'laugh.jpg'))
            }
            else if (mutetype == 2){
                e.reply('不！！')
                await common.sleep(500);
                e.reply('准！！')
                await common.sleep(500);
                e.reply('戳！！')
                await common.sleep(1000);
                await e.group.muteMember(e.operator_id,60)
            }
        }
        
        //拍一拍表情包
        else if(random_type < (reply_text + reply_img + reply_voice + mutepick + example)){
            await e.reply(await segment.image(`http://ovooa.com/API/face_pat/?QQ=${e.operator_id}`))
        }
        
        //反击
        else {
            e.reply('反击！')
            await common.sleep(1000)
            await e.group.pokeMember(e.operator_id)
        }
        
    }
    
}
    




async function sendEmoji(e, command) {
    try {
        if (command === '自定义表情包') {
            const imageUrl = await getRandomImage(imageUrls);
            logger.info(`[表情包仓库]自定义表情包地址：${imageUrl}`);  // 打印选中的图片URL
            e.reply([segment.image(imageUrl)]);
            return true;
        }
        
        const data = await filefetchData('index.json')

        
        let categories;
        if (command === 'emojihub') {
            categories = Object.keys(data).filter(category => !excludeCategories.includes(category));
        } else {
            if (excludeCategories.includes(command) || !data.hasOwnProperty(command)) {
                logger.warn(`[表情包仓库]类别${excludeCategories.includes(command) ? '在黑名单中' : '不存在'}，操作中止`);
                return;
            }
            categories = [command];
            
        }

        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const files = data[randomCategory];
        const randomFile = files[Math.floor(Math.random() * files.length)];

        const fileURL = `${baseURL}${encodeURIComponent(randomFile)}`;
        logger.info(`[表情包仓库]表情包地址：${fileURL}`);

        e.reply([segment.image(fileURL)]);
    } catch (error) {
        logger.error(`[表情包仓库]${error}`);
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



async function filefetchData(jsonFileName) {
    // 获取当前文件的目录
    const __dirname = dirname(fileURLToPath(import.meta.url));
    // 获取 JSON 文件的绝对路径
    const filePath = path.resolve(__dirname, `../../resources/logier/${jsonFileName}`);
    // 获取文件路径的目录部分
    const resourcesPath = path.resolve(__dirname, '../../resources');

    // 如果路径不存在就创建文件夹
    try {
        await fs.promises.access(resourcesPath);
    } catch (error) {
        await fs.promises.mkdir(resourcesPath, { recursive: true });
    }

    let data;
    let attempts = 0;

    while (!data && attempts < 3) {
        try {
            // 尝试读取和解析 JSON 文件
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            if (fileContent && fileContent.length > 0) {
                data = JSON.parse(fileContent);
            }
        } catch (error) {
            // 如果出现错误，删除文件以便重新下载
            await fs.promises.unlink(filePath).catch(() => {});
        }

        if (!data) {
            // 下载文件
            const fileURL = `https://gitee.com/logier/emojihub/raw/master/${jsonFileName}`;
            const file = fs.createWriteStream(filePath);
            await new Promise((resolve, reject) => {
                https.get(fileURL, function(response) {
                    response.pipe(file);
                    file.on('finish', function() {
                        file.close(resolve);
                    });
                }).on('error', function(err) {
                    fs.unlink(filePath);
                    reject(err.message);
                });
            });

            // 重新读取 JSON 文件
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            if (fileContent && fileContent.length > 0) {
                data = JSON.parse(fileContent);
            }
        }

        attempts++;
    }

    return data;
}


// 表情包仓库的基础URL（不用改）
const baseURL = 'https://gitee.com/logier/emojihub/raw/master/';