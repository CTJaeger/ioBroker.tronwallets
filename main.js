/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

const utils = require('@iobroker/adapter-core'); // Get common adapter utils
const XMLHttp = require('xmlhttprequest');
const request = require('request');
const adapter = new utils.Adapter('tronwallets');
const trxusdt = 'https://api.binance.com/api/v3/ticker/price?symbol=TRXUSDT';
const trxbtc  = 'https://api.binance.com/api/v3/ticker/price?symbol=TRXBTC';
const btcusdt = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
var jso = '';
var result;
var summe = 0;
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
//adapter.on('unload', function () {
//
//});

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
    adapter.config.interval = parseInt(adapter.config.interval, 10) || 30000;
    if (adapter.config.interval < 5000) {
        adapter.config.interval = 5000;
    }

    //setInterval(abruf, adapter.config.interval || 5000);
    setInterval(abruf, 20000);
    setInterval(exchange, 30000);
    exchange();
}
function abruf() {
    var werte;
    for (var u = 0; u < adapter.config.devices.length; u++) {

        const name = adapter.config.devices[u].name
        const ip = adapter.config.devices[u].ip

        xhr.open("GET", url + ip, false);
        xhr.responseType = 'json';
        xhr.send(null);

        try {
            werte = JSON.parse(xhr.responseText);
            var pfad =adapter.namespace + '.' + name;

            statee( pfad, "name", werte.name );
            statee( pfad, "address", werte.address );
            statee( pfad, "bandwith", werte.bandwith );
            statee( pfad, "allowance", werte.allowance );
            statee( pfad, "frozenBalance", werte.frozenBalance );
            statee( pfad, "totalBalance", werte.totalBalance );
            statee( pfad, "frozenExpire", werte.frozenExpire );
            statee( pfad, "createTime", werte.createTime );
            statee( pfad, "usdValue", werte.usdValue );
            statee( pfad, "transferFromCount", werte.transferFromCount );
            statee( pfad, "transferToCount", werte.transferToCount );
            statee( pfad, "tokensCount", werte.tokensCount );
            statee( pfad, "participationsCount", werte.participationsCount );
            statee( pfad, "balanceStr", werte.balanceStr );
            statee( pfad, "frozenBalanceStr", werte.frozenBalanceStr );
            statee( pfad, "totalBalanceStr", werte.totalBalanceStr );
            statee( pfad, "bandwidthStr", werte.bandwidthStr );
            statee( pfad, "allowanceStr", werte.allowanceStr );

        } catch (e) {
            adapter.log.error ('Parsen der Wallet fehlgeschlagen' + e);
        }

        // Tokenbestand abrufen
        xhr.open("GET", url2 + ip, false);
        xhr.responseType = 'json';
        xhr.send(null);
        // Array im Array parsen
        try {
            var token = JSON.parse(xhr.responseText).data.assets;

        } catch (e) {
            adapter.log.error ('Parsen der Token fehlgeschlagen' + e);
        }
        jso = '[';
        var counter = 0;
        for (var key in token) {
            if (counter > 0) {
                jso = jso + ',';
            }
            var price = round(getprice(key),6);
            summe = summe + (price * token[key]);

                var pfad = adapter.namespace + '.' + name + '.Token';
                statee(pfad, key , token[key]);
                statee(pfad, key + '-TRX', price);

                jso = jso + '{"Token" : "' + key + '" , "Price" : ' + price + ' ,"Amount" : ' + token[key] + ',"Total Balance" : ' + round(price * token[key], 6) + '}';
                counter = counter + 1;

        }
        jso = jso + ']';
        var pfad = adapter.namespace + '.' + name + '.Token';
        statee(pfad, '0Tokenbalance' , summe);
        statee(pfad, '0JSON' , jso);
        summe = 0;
        //jso = '';
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
    xhr.open("GET", url3, false);
    xhr.responseType = 'json';
    xhr.send(null);
    dex = JSON.parse(xhr.responseText);
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
function statee(Pfad, Name , Wert) {
    adapter.setObjectNotExists(Pfad + '.'+ Name, {
        type: 'state',
        common: {
            name: Name,
            read: true,
            write: true,
            value: Wert
        },
        native: {}
    });
    adapter.setState(Pfad + '.'+ Name, Wert);
}
