var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
  start: function () {
    console.log('hako helper started...');
  },

  getData: function (url) {
      var self = this;
      var hakoTickers = new Array(); // List of tickers
      var hakoPairs = new Array(); // List of Pairs

      request({ url: url, method: 'GET' }, function (error, response, body) {
        //console.log("node_helper.js: " + body);
          if (!error && (response.statusCode == 200 || response.statusCode == 429)) {
            var result = JSON.parse(body);
            for (i = 0; i < result["data"]["crypto_currencies"]; i++) {
              for (j = 0; j < result["data"]["fiat_currencies"]; j++) {
                  console.log("node_helper.js: hakoticker obj -> " + result["data"]["crypto_currencies"][i]);
                  hakoTickers.push(result["data"]["crypto_currencies"][i]["symbol"] + result["data"]["fiat_currencies"][j]["symbol"]);
              }
            }

            // Retrieve the prices
            for (k = 0; k < hakoTickers.length; k++) {
              request({ url: 'https://coinhako.com/api/v1/price/currency/' + hakoTickers[k], method: 'GET' }, function (error, response, body) {
                if (!error && (response.statusCode == 200 || response.statusCode == 429)) {
                  var result = JSON.parse(body);
                  
                  var elementPair;

                  elementPair.pair_name = hakoTickers[k];
                  elementPair.buy_price = result["data"]["buy_price"];
                  elementPair.sell_price = result["data"]["sell_price"];
                  
                  hakoPairs.push(elementPair);
                }
              });
            }

            self.sendSocketNotification('DATA_RESULT', hakoPairs);
          }

          if (error) {
            console.log("[ERROR] node_helper.js: Error -> " + error);
          } else {
            console.log("Status Code: " + response.statusCode);
          }
      });

  },

  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GET_DATA') {
      console.log("node_helper.js: socketNotificationReceived");
      this.getData(payload);
    }
  }

});
