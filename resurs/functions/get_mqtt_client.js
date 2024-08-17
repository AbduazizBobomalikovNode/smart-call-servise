var mqtt = require('mqtt');
const jwt = require('jsonwebtoken');
const jwt_my_key = process.env.JWT_MY_KEY || "***OLIB-TASHLANDI***";

function getClient(url, clientId, username,idbroker) {
    const token = jwt.sign({ id:idbroker}, jwt_my_key);
    let client = mqtt.connect(url, {
        clientId: clientId,
        username: username,
        password: token
    });
    client.on('connect', function () {
        console.log('MQTT mijozi ulandi');
        client.subscribe(['/index/'+idbroker+'/get'], function (err) {
            if (!err) {
                console.log('Ushbu mavzuga obuna bo\'lindi: ' + '/'+idbroker+'/get');
            } else {
                console.error('mavzuga obuna Xatosi:', err);
            }
        });
    });
    client.on('error', function (error) {
        console.error('MQTT mijozi xatosi:', error);
    });

    client.on('close', function () {
        console.warn('MQTT mijozi  uzildi');
    });
    return client;
}

module.exports = getClient;
