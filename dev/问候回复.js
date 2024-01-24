

// 获取当前小时的函数
const getCurrentHour = () => new Date().getHours();

// 随机获取一个元素
const getRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];

// 导出一个问候插件
export class greetings extends plugin {
    // 构建正则匹配等
    constructor() {
        super({
            name: "每日问候",
            event: "message",
            priority: 100,
            rule: [
                {
                    reg: '^([#/])?(早安|早上好|早安丫|早)$',
                    fnc: 'goodMorning'
                },
                {
                    reg: '^([#/])?(午安|中好|午安丫)$',
                    fnc: 'goodNoon'
                },
                {
                    reg: '^([#/])?(晚上好)$',
                    fnc: 'goodEvening'
                },
                {
                    reg: '^([#/])?(晚安|晚安丫|晚)$',
                    fnc: 'goodNight'
                }
            ]
        })
    }

    // 早安问候
    async goodMorning(e) {
        const currentHour = getCurrentHour();
        
        switch (true) {
            case currentHour >= 5 && currentHour < 8:
                await e.reply(getRandomElement(TextDict['GoodMoring']["5:00-8:00"]), true)
                break;
            case currentHour >= 8 && currentHour < 9:
                await e.reply(getRandomElement(TextDict['GoodMoring']["8:00-9:00"]), true)
                break;
            case currentHour >= 9 && currentHour < 12:
                await e.reply(getRandomElement(TextDict['GoodMoring']["9:00-12:00"]), true)
                break;
            case currentHour >= 12 && currentHour < 18:
                await e.reply(getRandomElement(TextDict['GoodMoring']["12:00-18:00"]), true)
                break;
            case currentHour >= 18 && currentHour < 23:
                await e.reply(getRandomElement(TextDict['GoodMoring']["18:00-23:00"]), true)
                break;
            default:
                await e.reply(getRandomElement(TextDict['GoodMoring']["23:00-5:00"]), true)
                break;
        };
        return true;
    };


    // 午安问候
    async goodNoon(e) {
        const currentHour = getCurrentHour();

        switch (true) {
            case currentHour >= 11 && currentHour < 13:
                await e.reply(getRandomElement(TextDict['GoodNoon']["11:00-13:00"]), true)
                break;
            case currentHour >= 13 && currentHour < 18:
                await e.reply(getRandomElement(TextDict['GoodNoon']["13:00-18:00"]), true)
                break;
            case currentHour >= 18 && currentHour < 0:
                await e.reply(getRandomElement(TextDict['GoodNoon']["18:00-0:00"]), true)
                break;
            case currentHour >= 0 && currentHour < 5:
                await e.reply(getRandomElement(TextDict['GoodNoon']["0:00-5:00"]), true)
                break;
            default:
                await e.reply(getRandomElement(TextDict['GoodNoon']["5:00-11:00"]), true)
                break;
        };
        return true
    };

    // 晚上问候
    async goodEvening(e) {
        const currentHour = getCurrentHour();

        switch (true) {
            case currentHour >= 17 && currentHour < 21:
                await e.reply(getRandomElement(TextDict['GoodEvening']["17:00-21:00"]), true)
                break;
            case currentHour >= 21 && currentHour < 0:
                await e.reply(getRandomElement(TextDict['GoodEvening']["21:00-00:00"]), true)
                break;
            case currentHour >= 0 && currentHour < 7:
                await e.reply(getRandomElement(TextDict['GoodEvening']["00:00-7:00"]), true)
                break;
            case currentHour >= 7 && currentHour < 12:
                await e.reply(getRandomElement(TextDict['GoodEvening']["7:00-12:00"]), true)
                break;
            case currentHour >= 12 && currentHour < 17:
                await e.reply(getRandomElement(TextDict['GoodEvening']["12:00-17:00"]), true)
                break;
            default:
                await e.reply(getRandomElement(TextDict['GoodEvening']["17:00-19:00"]), true)
                break;
        };
        return true
    };

    // 晚安问候
    async goodNight(e) {
        const currentHour = getCurrentHour();

        switch (true) {
            case currentHour >= 21 && currentHour < 23:
                await e.reply(getRandomElement(TextDict['GoodNight']["21:00-23:00"]), true)
                break;
            case currentHour >= 23 && currentHour < 2:
                await e.reply(getRandomElement(TextDict['GoodNight']["23:00-2:00"]), true)
                break;
            case currentHour >= 2 && currentHour < 7:
                await e.reply(getRandomElement(TextDict['GoodNight']["2:00-7:00"]), true)
                break;
            case currentHour >= 7 && currentHour < 11:
                await e.reply(getRandomElement(TextDict['GoodNight']["7:00-11:0"]), true)
                break;
            case currentHour >= 11 && currentHour < 13:
                await e.reply(getRandomElement(TextDict['GoodNight']["11:00-13:00"]), true)
                break;
            case currentHour >= 13 && currentHour < 17:
                await e.reply(getRandomElement(TextDict['GoodNight']["13:00-17:00"]), true)
                break;
            case currentHour >= 17 && currentHour < 19:
                await e.reply(getRandomElement(TextDict['GoodNight']["17:00-19:00"]), true)
                break;
            default:
                await e.reply(getRandomElement(TextDict['GoodNight']["19:00-21:00"]), true)
                break;
        };
        return true
    };
}

/**
    作者: OldCityNight
    联系方式: 
        - Discord: oldcitynight
        - Telegram: https://t.me/oldcity_night
        - QQ: 没 QQ

*/


const TextDict = {
    
    'GoodMoring': {
        "5:00-8:00": [
            "嗨，新的一天开始啦！愿你充满活力，迎接新的冒险！",
            "清晨的鸟鸣和微风都在向你打招呼，早安！",
            "崭新的一天，充满希望和机会。祝你早安，愿你笑逐颜开！"
        ],
        "8:00-9:00": [
            "早上好！虽然有点晚，但愿你的笑容早早闪亮起来！",
            "都这个点了还说早安，是不是想多享受一会儿被窝的温暖？",
            "嘿，早安？这是刚刚踏出被窝还是准备再来个小憩？"
        ],
        "9:00-12:00": [
            "早上好？这个点怕是早餐都要吃午饭了吧！",
            "你这早安发得有点晚啊，是不是昨晚熬夜刷剧了？",
            "早安？太阳都晒屁股了，你才起床吗？"
        ],
        "12:00-18:00": [
            "早上好？你确定不是下午好吗？是不是时差没倒过来？",
            "这个点说早上好，你是不是刚睡醒？昼夜颠倒了吧！",
            "午安都过了，你还在这说早安。是不是需要个闹钟来拯救你的作息时间？"
        ],
        "18:00-23:00": [
            "晚上好？不对，现在是晚上了。你的早安是不是发错时间了？",
            "这个点说早上好？你确定不是晚安吗？是不是今天过得太快了？",
            "晚上好！不过你的‘早上好’是不是穿越了？需要我帮你倒倒时差吗？"
        ],
        "23:00-5:00": [
            "晚上好？已经是深夜了，你的‘早上好’是不是想提前预约明天的？",
            "这个点说早上好，你是不是准备半夜起来干坏事？",
            "晚安！不过你的‘早上好’让我有点懵，你是不是时差党？"
        ]
    },
    
    'GoodNoon': {
        "11:00-13:00": [
            "中午好，吃饭了吗？祝你午餐愉快！",
            "阳光正好，微风不燥，愿你中午好心情！",
            "中午好，愿你的一天过得充实又愉快！"
        ],
        "13:00-18:00": [
            "下午好！已经过了中午了，你这是不是刚睡醒的节奏？",
            "中午好？这个点都快吃晚饭了，你是不是刚起床？",
            "下午好！你的中午好来得有点晚啊，是不是午睡过头了？"
        ],
        "18:00-0:00": [
            "下午好！已经过了中午了，你这是不是刚睡醒的节奏？",
            "中午好？这个点都快吃晚饭了，你是不是刚起床？",
            "下午好！你的中午好来得有点晚啊，是不是午睡过头了？"
        ],
        "0:00-5:00": [
            "下午好！已经过了中午了，你这是不是刚睡醒的节奏？",
            "中午好？这个点都快吃晚饭了，你是不是刚起床？",
            "下午好！你的中午好来得有点晚啊，是不是午睡过头了？"
        ],
        "5:00-11:00": [
            "下午好！已经过了中午了，你这是不是刚睡醒的节奏？",
            "中午好？这个点都快吃晚饭了，你是不是刚起床？",
            "下午好！你的中午好来得有点晚啊，是不是午睡过头了？"
        ]
    },
    
    'GoodEvening': {
        "17:00-21:00": [
            "晚上好，愿你有一个宁静的夜晚！",
            "晚上好，今天过得怎么样？希望你晚上愉快！",
            "夜幕降临，祝你晚上好，心情愉快！"
        ],
        "21:00-00:00": [
            "晚上好！准备休息了吗？熬夜对身体不好哦！",
            "深夜了，还在忙碌吗？记得早点休息，晚安！",
            "晚上好！不过快要进入梦乡了，你是不是也该睡觉了？"
        ],
        "00:00-7:00": [
            "晚上好？已经是深夜到凌晨了，你是不是该睡觉了？",
            "这个点说晚上好，你是不是夜猫子准备出动了？",
            "晚安！不过你的‘晚上好’…… 你是不是该调整作息了？"
        ],
        "00:00-7:00": [
            "晚上好？已经是深夜到凌晨了，你是不是该睡觉了？",
            "这个点说晚上好，你是不是夜猫子准备出动了？",
            "晚安！不过你的‘晚上好’…… 你是不是该调整作息了？"
        ],
        "00:00-7:00": [
            "晚上好？已经是深夜到凌晨了，你是不是该睡觉了？",
            "这个点说晚上好，你是不是夜猫子准备出动了？",
            "晚安！不过你的‘晚上好’…… 你是不是该调整作息了？"
        ],
        "7:00-12:00": [
            "早上好！已经是上午了，你的晚上好是不是发错时间了？",
            "这个点说晚上好？你是不是刚起床还是准备睡觉？",
            "中午好都快到了，你还在说晚上好。是不是需要我帮你倒倒时差？"
        ],
        "12:00-17:00": [
            "下午好！已经是下午了，你的晚上好是不是穿越了？",
            "这个点说晚上好？你是不是把下午当成晚上了？",
            "下午好都快过完了，你才说晚上好。是不是太忙了？"
        ]
    },
    
    'GoodNight': {
        "21:00-23:00": [
            "晚安，愿你有一个好梦！",
            "晚安，今天辛苦了！祝你有个美好的夜晚！",
            "夜深了，该休息了。晚安！"
        ],
        "23:00-2:00": [
            "晚安！已经是深夜了，你是不是还在熬夜？",
            "这个点还不睡？熬夜对身体不好哦！早点休息吧！",
            "晚安！不过你的熬夜行为让我有点担心，是不是有什么心事？"
        ],
        "2:00-7:00": [
            "晚安！夜深人静了，你是不是该睡觉了？",
            "这个点还不睡？是不是准备通宵了？熬夜伤身哦！",
            "都快天亮了还不睡？你是不是要准备少走几十年弯路提前离开这个世界？"
        ],
        "7:00-11:0": [
            "早上好！已经是上午了，你的晚上好是不是发错时间了？",
            "这个点说晚上好？你是不是刚起床还是准备睡觉？",
            "中午好都快到了，你还在说晚上好。是不是需要我帮你倒倒时差？"
        ],
        "11:00-13:00": [
            "中午好！别人都睡午觉了你才说晚安？",
            "这个点说晚安？你是不是刚起床还是准备午睡？",
            "午安都快过完了你才说晚安。是不是太忙了？"
        ],
        "13:00-17:00": [
            "下午好！下午了才说晚安你是要少走几十年弯路提前去世吗？",
            "这个点说晚安？你是不是把下午当成晚上了？",
            "下午好都快过完了你才说晚安。是不是需要我帮你倒倒时差？"
        ],
        "17:00-19:00": [
            "晚上好！这么早就睡觉了吗？我不信。",
            "这个点说晚安？你是不是今天太累了想早点休息？",
            "晚上好！不过你的‘晚安’让我有点想笑你是不是提前进入梦乡了？"
        ],
        "19:00-21:00": [
            "晚上好，准备休息了吗？愿你有个好梦！",
            "晚安！愿你今晚有个美好的梦境！",
            "夜幕降临，祝你晚安，好梦相伴！"
        ]
    }
};
