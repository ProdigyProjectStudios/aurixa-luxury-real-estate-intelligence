export default {
  routes: [
    {
      method: 'POST',
      path: '/inquiries',
      handler: 'inquiry.create',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
