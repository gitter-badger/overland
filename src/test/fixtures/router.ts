import { Router } from '../../core';

const appRouter = new Router();
const siteRouter = new Router();

appRouter.get('/', { to: 'post#index' });
appRouter.get('/posts/:id', { to: 'post#show' });
appRouter.app = 'myBlog';

siteRouter.use('app', appRouter);

export { siteRouter, appRouter };