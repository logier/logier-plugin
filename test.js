
export class autoCommand extends plugin {
    constructor() {
      super({
        name: "test",
        dsc: "test",
        event: "message",
        priority: 9999,
        rule: [{
          reg: '',
          fnc: 'test',
        }],
      });
    }

    async test(e) {
        if (this.e.user_id == 785189653) {
        logger.info(e)
    }
    

}

}












