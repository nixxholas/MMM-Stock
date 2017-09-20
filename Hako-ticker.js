'use strict';

Module.register("Hako-ticker", {

  hakoallapi: "https://coinhako.com/api/v1/price/all_prices",
  result: {},
  defaults: {
    fiat: 'usd',
    showBefore: null,
    exchange: 'bitstamp',
    updateInterval: 60000,

    // Used to work out url and symbols
    fiatTable: {
      usd: {
        symbol: '$',
        exchangeCode: 'btcusd'
      },
      eur: {
        symbol: '€',
        exchangeCode: 'btceur'
      }
    }
  },

  getStyles: function() {
    return ["Hako-ticker.css"];
  },

  start: function() {
    this.getTickers();
    this.scheduleUpdate();
  },

  getDom: function() {
    var wrapper = document.createElement("ticker");
    wrapper.className = 'medium bright';
    wrapper.className = 'ticker';

    var data = this.result;
    var symbolElement =  document.createElement("span");
    var exchange = this.config.exchange;
    var fiat = this.config.fiat;
    var fiatSymbol = this.config.fiatTable[fiat].symbol;
    var lastPrice = 'BTCUSD IS NOW 4000000.39'; //data.last
    if (this.config.showBefore == null) {
      var showBefore = this.config.exchange;
    } else {
      var showBefore = this.config.showBefore
    }
    if (lastPrice) {
      //symbolElement.innerHTML = showBefore + ' ' + fiatSymbol;
      //symbolElement.innerHTML = 'BTCUSD IS NOW 4000000.39';
      //wrapper.appendChild(symbolElement);
      var priceElement = document.createElement("span");
      priceElement.innerHTML = lastPrice;
      wrapper.appendChild(priceElement);
    }
    return wrapper;
  },

  scheduleUpdate: function(delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    setInterval(function() {
      self.getTickers();
    }, nextLoad);
  },

  getTickers: function () {
    var fiat = this.config.fiat;
    var url = 'https://www.bitstamp.net/api/v2/ticker/' + this.config.fiatTable[fiat].exchangeCode + '/';
    this.sendSocketNotification('GET_TICKERS', url);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "TICKERS_RESULT") {
      var self = this;
      this.result = payload;
      this.updateDom(self.config.fadeSpeed);
    }
  },

});