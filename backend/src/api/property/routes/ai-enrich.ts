export default {
  routes: [
    {
      method: 'POST',
      path: '/properties/:id/ai-enrich',
      handler: 'ai-enrich.enrich',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
        middlewares: [],
      },
    },
  ],
};
