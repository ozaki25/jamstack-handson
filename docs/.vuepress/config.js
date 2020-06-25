const dayjs = require('dayjs');

module.exports = {
  title: 'Jamstack Handson',
  themeConfig: {
    domain: 'https://jamstack-handson.ozaki25.now.sh',
    sidebar: ['/page0', '/page1', '/page2', '/page3'],
  },
  markdown: {
    lineNumbers: true,
  },
  plugins: {
    '@vuepress/last-updated': {
      transformer: (timestamp, lang) => {
        return dayjs(timestamp).format('YYYY/MM/DD');
      },
    },
    '@vuepress/medium-zoom': {},
    '@vuepress/back-to-top': {},
    seo: {
      description: () => 'ハンズオン資料',
    },
  },
};
