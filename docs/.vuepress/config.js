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
    '@vuepress/back-to-top': {},
    'seo': {},
  },
};
