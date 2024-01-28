// TextMsg可自行更改，其他照旧即可。
export class TextMsg extends plugin {
    constructor() {
        super({
            name: '测试插件', // 插件名称
            dsc: '这是一个基础的插件示例',  // 插件描述            
            event: 'message',  // 更多监听事件请参考下方的 Events
            priority: 99999999,   // 插件优先度，数字越小优先度越高
            rule: [
                {
                    reg: '',   // 正则表达式,有关正则表达式请自行百度
                    fnc: 'test'  // 执行方法
                }
            ]
        })

    }

    // 执行方法1
    async test(e) {

        logger.info(e)
        return true
    }

}