import plugin from '../../lib/plugins/plugin.js'
import { segment } from "icqq";

export class example extends plugin {
    constructor (){
        super({
            name: '随机老婆',
            dsc: '随机老婆',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: "^(#|/)?今日老婆|marry$",
                    fnc: 'CHOULP',
                }
            ]
        })
    };
    async CHOULP(e) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const date_time = `${year}-${month}-${day}`; //获取今天的日期
        let date_time2 = await redis.get(`Yunzai:choulpriqi:${e.user_id}_clp`);date_time2 = JSON.parse(date_time2); //获取用户上一次抽cp的日期
        let data_cptime = await redis.get(`Yunzai:dateriqi:${e.user_id}_clp`);data_cptime = JSON.parse(data_cptime)//获取用户
        if(date_time === data_cptime){
            let data_cpname = await redis.get(`Yunzai:choulpqq:${e.user_id}_clp`);data_cpname = JSON.parse(data_cpname)
            let data_cpqq = await redis.get(`Yunzai:choulpname${e.user_id}_clp`);data_cpqq = JSON.parse(data_cpqq)
            let msg = [
                segment.at(e.user_id),
                `\n你今天已经被她娶走了哦~`,
                segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${data_cpqq}`),
                `【${data_cpname}】(${data_cpqq})\n乖乖的待在她身边不要乱跑哦~`
            ]
            e.reply(msg)
            return;
        }
        if(date_time === date_time2){//判断日期
            let msg = [`你今天已经有老婆了，还想娶小妾啊？爪巴`]
            e.reply(msg)
            return;
        }
        //随机一位倒霉蛋群友
        let mmap = await e.group.getMemberMap();
        let arrMember = Array.from(mmap.values());
        let randomWife = arrMember[Math.floor(Math.random() * arrMember.length)];
        //发送老婆
        let msg = [
            segment.at(e.user_id),
            "\n你今天的群CP是",
            segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${randomWife.user_id}`),
            `【${randomWife.nickname}】(${randomWife.user_id})\n看好她哦，别让她乱跑~`
        ];
        e.reply(msg);//发送完成
        redis.set(`Yunzai:choulpriqi:${e.user_id}_clp`, JSON.stringify(date_time));//把今天的日期写进去
        redis.set(`Yunzai:choulpcpname:${e.user_id}_clp`, JSON.stringify(randomWife.nickname))//把CP写进去
        redis.set(`Yunzai:choulpcpqq:${e.user_id}_clp`, JSON.stringify(randomWife.user_id))//cp的qq号
        redis.set(`Yunzai:dateriqi:${randomWife.user_id}_clp`, JSON.stringify(date_time))
        redis.set(`Yunzai:choulpname${randomWife.user_id}_clp`, JSON.stringify(e.user_id))
        redis.set(`Yunzai:choulpqq:${randomWife.user_id}_clp`, JSON.stringify(e.nickname))
        return true;
    }
}