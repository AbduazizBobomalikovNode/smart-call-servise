function sendMqtt(client,topic,message) {
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
function receiveMqtt(client,callBack) { 
    client.on('message', function (topic, message) {
        let context = message.toString();
        callBack(context);
    });
}


module.exports = {sendMqtt,receiveMqtt};