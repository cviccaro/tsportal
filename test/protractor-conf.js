exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  chromeOnly: true,

  baseUrl: 'http://tradeshow.localhost/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 3000
  },
  onPrepare: function() {
    global.debugPortNumber = 5000;
    global.initiateDebug = function() {
      browser.pause(debugPortNumber);
      debugPortNumber++;
    };
  }
};
