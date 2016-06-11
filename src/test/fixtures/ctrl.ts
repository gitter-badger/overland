import { Controller } from '../../core';

class PostCtrl extends Controller {
  
  async index(ctx, next) {
    ctx.body = `Hello, world.`;
  }
  
  async show(ctx, next) {
    ctx.body = await ctx.render({ text: 'foobar!' });
  }
}

export { PostCtrl as default };