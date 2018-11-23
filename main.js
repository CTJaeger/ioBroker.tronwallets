/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

const utils =   require(__dirname + '/lib/utils'); // Get common adapter utils
const request = require('request');
const adapter = new utils.Adapter('tronwallets');
const trxusdt = 'https://api.binance.com/api/v3/ticker/price?symbol=TRXUSDT';
const trxbtc  = 'https://api.binance.com/api/v3/ticker/price?symbol=TRXBTC';
const btcusdt = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';

var result;
var summe;
var err;
var ip;
var timer     = null;
var stopTimer = null;
var isStopping = false;
var dex;
var url = 'https://api.trxplorer.io/v1/account/info?address=';
var url2 = 'https://api.tronscan.org/api/grpc/solidity/getaccount/';
var url3 = 'https://api.trongrid.io/wallet/listexchanges';

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function () {

});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    adapter.createState('', 'General', 'BTCUSDT', {
        name: 'BTCUSDT',
        def: 0,
        type: 'number',
        read: 'true',
        write: 'true',
        role: 'value',
        desc: 'BTCUSDT',
        unit: 'USDT'
    });
    adapter.createState('', 'General', 'TRXUSDT', {
        name: 'TRXUSDT',
        def: 0,
        type: 'number',
        read: 'true',
        write: 'true',
        role: 'value',
        desc: 'TRXUSDT',
        unit: 'USDT'
    });
    adapter.createState('', 'General', 'TRXBTC', {
        name: 'TRXBTC',
        def: 0,
        type: 'number',
        read: 'true',
        write: 'true',
        role: 'value',
        desc: 'TRXBTC',
        unit: 'BTC'
    });

        main();
});

process.on('SIGINT', function () {
    if (timer) clearTimeout(timer);
});
function main() {
    exchange();

    if (!adapter.config.devices) {
        adapter.log.error('No wallets found');
        return;
    }
    adapter.config.interval   = parseInt(adapter.config.interval,   10) || 30000;
    if (adapter.config.interval < 5000) {
        adapter.config.interval = 5000;
    }

    setInterval(abruf, adapter.config.interval || 5000);
}

    function abruf() {
    exchange();

    var jso = '';
    var request = require('request');
    var werte;
    for (var u = 0; u < adapter.config.devices.length; u++) {

        const name = adapter.config.devices[u].name
        const ip = adapter.config.devices[u].ip

        getBody(url + ip, function (err, body) {
            if (err) {
                adapter.log.debug('Fehler beim Abruf der Wallet' + name);
            } else {
                try {
                    werte = JSON.parse(body);
                } catch (e) {
                    adapter.log.error ('Parsen der Wallet fehlgeschlagen' + e);
                }
                try {
                adapter.setState(adapter.namespace + '.' + name + '.name', werte.name);
                adapter.setState(adapter.namespace + '.' + name + '.balance', werte.balance);
                adapter.setState(adapter.namespace + '.' + name + '.address', werte.address);
                adapter.setState(adapter.namespace + '.' + name + '.bandwith', werte.bandwith);
                adapter.setState(adapter.namespace + '.' + name + '.allowance', werte.allowance);
                adapter.setState(adapter.namespace + '.' + name + '.frozenBalance', werte.frozenBalance);
                adapter.setState(adapter.namespace + '.' + name + '.totalBalance', werte.totalBalance);
                adapter.setState(adapter.namespace + '.' + name + '.frozenExpire', werte.frozenExpire);
                adapter.setState(adapter.namespace + '.' + name + '.createTime', werte.createTime);
                adapter.setState(adapter.namespace + '.' + name + '.usdValue', werte.usdValue);
                adapter.setState(adapter.namespace + '.' + name + '.transferFromCount', werte.transferFromCount);
                adapter.setState(adapter.namespace + '.' + name + '.transferToCount', werte.transferToCount);
                adapter.setState(adapter.namespace + '.' + name + '.tokensCount', werte.tokensCount);
                adapter.setState(adapter.namespace + '.' + name + '.participationsCount', werte.participationsCount);
                adapter.setState(adapter.namespace + '.' + name + '.tokensCount', werte.tokensCount);
                adapter.setState(adapter.namespace + '.' + name + '.balanceStr', werte.balanceStr);
                adapter.setState(adapter.namespace + '.' + name + '.frozenBalanceStr', werte.frozenBalanceStr);
                adapter.setState(adapter.namespace + '.' + name + '.totalBalanceStr', werte.totalBalanceStr);
                adapter.setState(adapter.namespace + '.' + name + '.bandwidthStr', werte.bandwidthStr);
                adapter.setState(adapter.namespace + '.' + name + '.allowanceStr', werte.allowanceStr);
                } catch (e) {
                    stateserstellen();
                }

            }
        });
        // Tokenbestand abrufen
        getBody(url2 + ip, function (err, body) {
            if (err) {
                adapter.log.debug('Fehler beim Abruf des Tokenbestand.');
            } else {
                // Array im Array parsen
                try {
                    var token = JSON.parse(body).data.assets;
                } catch (e) {
                    adapter.log.error ('Parsen der Token fehlgeschlagen' + e);
                }
                summe = 0;
                for (var key in token) {

                    var price = round(getprice(key),6);
                    summe = summe + (price * token[key]);
                    try {
                        adapter.setState(adapter.namespace + '.' + name + '.Token.' + key, token[key]);
                        adapter.setState(adapter.namespace + '.' + name + '.Token.' + key + '-TRX', price);
                    } catch (e) {
                        adapter.createState(name, 'Token', key, 'value');
                        adapter.createState(name ,'Token', key + '-TRX','value');
                    }

                }
                adapter.setState(adapter.namespace + '.' + name + '.Tokenbalance', round(summe,6));
                adapter.log.debug(name + "->" + summe);
            }

        });
        //summe = 0;
    }
    bina();
        };
    // Kurse von Binance abrufen
    function bina() {
        try {
            request(btcusdt, function (err, stat, body) {
                var werte = JSON.parse(body);
                adapter.setState(adapter.namespace + '.General.BTCUSDT', werte.price);
            });
            request(trxusdt, function (err, stat, body) {
                var werte = JSON.parse(body);
                adapter.setState(adapter.namespace + '.General.TRXUSDT', werte.price);
            });
            request(trxbtc, function (err, stat, body) {
                var werte = JSON.parse(body);
                adapter.setState(adapter.namespace + '.General.TRXBTC', werte.price);
            });
        } catch (e) {
            adapter.log.error ('Abrufen der Preise von Binance fehlgeschlagen' + e);
        }


    }

    function exchange() {
    getBody(url3, function (err, body) {
        if (err) {
            adapter.log.debug('Fehler beim Abruf der Exchange Contracts');
        } else {
            dex = JSON.parse(body);
            }
        });
    }

    function getprice(token) {
        for (var cd = 0; cd < dex.exchanges.length; cd++) {
            var stto = hex2a(dex.exchanges[cd].first_token_id);
                if (stto === token) {
                    var stc = dex.exchanges[cd].second_token_balance / 1000000;
                    var ftc = dex.exchanges[cd].first_token_balance;
                    var priced = stc / ftc;
                    return (priced);
                }
            }
        }

    function getBody(url, callback) {
    request({
        url: url,
    }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            return callback(error || {statusCode: response.statusCode});
        }
        callback(null, body);
    });
}
    // Funktion zur Konvertierung von Hex in ASCII
    function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
// Funktion zur Rundung der Werte
    function round(wert, dez) {
        wert = parseFloat(wert);
        if (!wert) return 0;
        dez = parseInt(dez);
        if (!dez) dez=0;
        var umrechnungsfaktor = Math.pow(10,dez);
        return Math.round(wert * umrechnungsfaktor) / umrechnungsfaktor;
}
    function stateserstellen() {
        // Create State
        for (var u = 0; u < adapter.config.devices.length; u++) {
            //adapter.log.info(adapter.config.devices[u].name);
            const name = adapter.config.devices[u].name
            const ip = adapter.config.devices[u].ip
            adapter.createState(null, name, 'Tokenbalance', 'value');
            adapter.createState(null, name, 'name', 'value');
            adapter.createState(null, name, 'balance', 'value');
            adapter.createState(null, name, 'address', 'value');
            adapter.createState(null, name, 'bandwith', 'value');
            adapter.createState(null, name, 'allowance', 'value');
            adapter.createState(null, name, 'frozenBalance', 'value');
            adapter.createState(null, name, 'totalBalance', 'value');
            adapter.createState(null, name, 'frozenExpire', 'value');
            adapter.createState(null, name, 'createTime', 'value');
            adapter.createState(null, name, 'usdValue', 'value');
            adapter.createState(null, name, 'transferFromCount', 'value');
            adapter.createState(null, name, 'transferToCount', 'value');
            adapter.createState(null, name, 'tokensCount', 'value');
            adapter.createState(null, name, 'participationsCount', 'value');
            adapter.createState(null, name, 'tokensCount', 'value');
            adapter.createState(null, name, 'balanceStr', 'value');
            adapter.createState(null, name, 'frozenBalanceStr', 'value');
            adapter.createState(null, name, 'totalBalanceStr', 'value');
            adapter.createState(null, name, 'bandwidthStr', 'value');
            adapter.createState(null, name, 'allowanceStr', 'value');
        };

    }