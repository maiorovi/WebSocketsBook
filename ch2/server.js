let WebSockerServer = require('ws').Server;
let wss = new WebSockerServer({port: 8181});

let stocks = {
    "AAPL": 95.0,
    "MSFT": 50.0,
    "GOOG": 300.0,
    "YHOO": 550.0,
    "AMZN": 35.0};

function randomInterval(min, max) {
    return Math.floor(Math.random()* (max - min + 1) + min);
}
let stockUpdater;

let randomStockUpdater = function() {
    for (let symbol in stocks) {
        if (stocks.hasOwnProperty(symbol)) {
            let randomized = randomInterval(-150, 150);
            let floatedValue = randomized / 100;
            stocks[symbol] = stocks[symbol] + floatedValue;
        }
    }
    let randomMsTime = randomInterval(500, 2500);

    stockUpdater = setTimeout(randomStockUpdater, randomMsTime)
};

randomStockUpdater();



wss.on('connection', function(ws) {
    console.log('client connected');
    let clientStockUpdater;
    let clientStocks = [];

    let sendStockUpdates = function(ws) {
      if (ws.readyState === 1) {
          let stocksObj = {};

          for(let i = 0; i < clientStocks.length; i++) {
                symbol = clientStocks[i];
                stocksObj[symbol] = stocks[symbol];
          }

          ws.send(JSON.stringify(stocksObj));
      }
    };

    clientStockUpdater = setInterval(function () {
        sendStockUpdates(ws)
    }, 1000);

    ws.on('message', function(msg) {
        let stock_request = JSON.parse(msg);
        clientStocks = stock_request['stocks'];
        sendStockUpdates(ws);
    });

    ws.on('close', function (e) {
        console.log(e.reason + " " + e.code);

        if(typeof clientStockUpdater !== 'undefined') {
            clearInterval(clientStockUpdater);
        }
    })

});