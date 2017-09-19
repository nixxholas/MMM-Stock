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
            //console.log("node_helper.js: body -> " + body);
            var result = JSON.parse(body);
            //console.log("node_helper.js: body json parsed -> " + result);

            for (i = 0; i < result["data"]["crypto_currencies"].length; i++) {
              var cryptoCurr = result["data"]["crypto_currencies"][i]["symbol"];
              //console.log("i = " + i);
              for (j = 0; j < result["data"]["fiat_currencies"].length; j++) {
                  //console.log("node_helper.js: hakoticker obj -> " + result["data"]["crypto_currencies"][i]);
                  hakoTickers.push(cryptoCurr + result["data"]["fiat_currencies"][j]["symbol"]);
              }
            }

            // A simple output check
            //console.log(hakoTickers.length);
            //console.log(JSON.stringify(hakoTickers));

            // Retrieve the prices
            for (k = 0; k < hakoTickers.length; k++) {
              var pairName = hakoTickers[k];
              
              //console.log("node_helper.js: price api pushing to hakoPairs");
              // Can't put a call within a for loop..
              // https://stackoverflow.com/questions/37421274/http-request-inside-a-loop
              hakoPairs.push(self.getPair(pairName));
            }
          }

          if (error) {
            console.log("[ERROR] node_helper.js: Error -> " + error);
          } 
          // else {
          //   console.log("Status Code: " + response.statusCode);
          // }
      });

      console.log("node_helper.js: dispatching sendSocketNotification");
      self.sendSocketNotification('DATA_RESULT', hakoPairs);
  },

  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GET_DATA') {
      console.log("node_helper.js: socketNotificationReceived");
      this.getData(payload);
    }
  },

  getPair: function(pairName) {
    request({ url: 'https://coinhako.com/api/v1/price/currency/' + pairName, method: 'GET' }, function (error, response, body) {
      if (!error && (response.statusCode == 200 || response.statusCode == 429)) {
        //console.log("node_helper.js: price api body -> " + body);
        var result = JSON.parse(body);
        
        //console.log("node_helper.js: price api pair_name -> " + pairName);
        //console.log("node_helper.js: price api buy_price -> " + result["data"]["buy_price"]);
        var elementPair = {
          pair_name: pairName,
          buy_price: result["data"]["buy_price"],
          sell_price: result["data"]["sell_price"]
        };

        return elementPair;
      }
    });
  }

});
