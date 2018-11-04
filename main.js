/**
 *
 * TRONwallet adapter, Copyright CTJaeger 2018, MIT
 *
 */
/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

const utils =   require(__dirname + '/lib/utils'); // Get common adapter utils
const request = require('request');
const adapter = new utils.Adapter('tronwallets');

var result;
var err;
var ip;
var timer     = null;
var stopTimer = null;
var isStopping = false;


// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function () {

});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
        adapter.log.info('ack is not set!');
    }
});

// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj === 'object' && obj.message) {
        if (obj.command === 'send') {
            // e.g. send email or pushover or whatever
            console.log('send command');

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }

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


function main() {
    var request = require('request');
    var werte;
    var url = 'https://api.trxplorer.io/v1/account/info?address=';
    for (var u = 0; u < adapter.config.devices.length; u++) {
        //adapter.log.info(adapter.config.devices[u].name);
        const name = adapter.config.devices[u].name
        const ip = adapter.config.devices[u].ip
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
        request(url + ip, function (err, stat, body) {
        werte = JSON.parse(body);
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
    });
    };
    bina();
}

function bina() {

    request(btcusdt, function(err, stat, body) {
        var werte=JSON.parse(body);
        adapter.setState(adapter.namespace + '.General.BTCUSDT', werte.price);
    });
    request(trxusdt, function(err, stat, body) {
        var werte=JSON.parse(body);
        adapter.setState(adapter.namespace + '.General.TRXUSDT', werte.price);
    });
    request(trxbtc, function(err, stat, body) {
        var werte=JSON.parse(body);
        adapter.setState(adapter.namespace + '.General.TRXBTC', werte.price);
    });

}




