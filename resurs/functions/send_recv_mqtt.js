var mqtt = require('mqtt');
const jwt = require('jsonwebtoken');
const jwt_my_key = process.env.JWT_MY_KEY;
var getClient = null;


function getClientMqtt(url, client_id, username, idbroker) {
    let clientId = `user-${idbroker}` + "-" + (new Date()).valueOf()
    console.log(url, clientId, username, idbroker);

    const token = jwt.sign({ id: idbroker, password: client_id }, jwt_my_key);
    let client = mqtt.connect(url, {
        clientId: clientId,
        username: username,
        password: token
    });

    client.on('connect', function () {
        console.log('MQTT mijozi ulandi');
        client.subscribe(['/index/' + idbroker + '/get'], function (err) {
            if (!err) {
                console.log('Ushbu mavzuga obuna bo\'lindi: ' + '/index/' + idbroker + '/get');
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




function sendMqtt(client, topic, message) {
    // console.log("sendMqtt : ",topic, message)
    if (typeof message === 'object' && message !== null) {
        try {
            message = JSON.stringify(message);
        } catch (error) {
            console.error('Message JSON stringga aylantirilmadi:', error);
            message = message.toString();
        }
    } else {
        message = message.toString();
    }
    client.publish(topic, message, {}, function (err) {
        if (!err) {
            console.warn('Xabar yuborildi');
        } else {
            console.error('Xabar yuborishda xatolik:', err);
        }
    });
}
function receiveMqtt(client, callBack) {
    client.on('message', function (topic, message) {
        let context = message.toString();
        callBack(context);
    });
}

async function mqtt_general(db, topic, url, name, idbroker, iddevice, message) {
    var _device = await (await db).device.getDevice(iddevice);
    if (!_device) {
        _device = await (await db).device.getDeviceForObj({iduser:idbroker})
        if (_device.length > 0) {
            _device = _device[0];
        }else{
            _device = null;
        }
    }
    try {
        console.log("_device :",_device);
        if (getClient && !getClient.connected || !getClient) {
            getClient = getClientMqtt(url, _device.key, name, idbroker);
        }
        try {
            if (message && message.type == "device") {
                message.device = _device.device_broker_id;
            }
        } catch (error) {
            console.log(error);
        }
        sendMqtt(getClient, topic, message);
    } catch (error) {
        console.log(error,iddevice)
    }
}

module.exports = { sendMqtt, receiveMqtt, mqtt_general };