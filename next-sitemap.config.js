// // next-sitemap.config.js
// module.exports = {
//     siteUrl: 'https://akxbrand.com', // your live domain
//     generateRobotsTxt: true, // generates robots.txt file
// };
  /** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://akxbrand.com',
  generateRobotsTxt: true,
  exclude: [
    '/admin*',
    '/network-error',
    '/login',
    '/register',
    '/account',
    '/orders',
    '/cart',
    '/checkout',
    '/admin-login'
  ],
  changefreq: 'daily',
  priority: 0.7,
};
