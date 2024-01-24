
export class autoCommand extends plugin {
    constructor() {
      super({
        name: "test",
        dsc: "test",
        event: "message",
        priority: 9999,
        rule: [{
          reg: 'test',
          fnc: 'test',
        }],
      });
    }

    async test(e) {
        logger.info(e)

    

}

}












