const express = require("express");


const router = express.Router();

var db = require('../db/mongodb');
var generateId = require('../resurs/functions/getid');
const validate = require("../resurs/validate/ring");
var auth = require("../middlewire/auth");
var getClientMqtt = require('../resurs/functions/get_mqtt_client');
var {sendMqtt,receiveMqtt} = require('../resurs/functions/send_recv_mqtt');

var url = null;
var getClient = null;

setTimeout(async () => { db = await db; url = await (await db).getUrl(); }, 100);

router.get("/get/ring/:id", auth, async (req, res) => {
    let id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ error: 'id xato berildi, id butun son qiymat bo\'lishi shart' });
    }
    let ring = await (await db).ring.getRingForObj({ id: id, iduser: req.user.id });
    if (ring.length == 0) {
        return res.status(404).json({ error: 'ushbu idga mos chalinish to\'pilmadi!' });
    }
    res.json(
        ring[0]
    );
})



router.get('/get/all', auth, async (req, res) => {
    let iduser = req.user.id;
    let device = await (await db).ring.getRingForObj({ iduser: iduser });
    res.json(
        device
    );
})

router.post('/add', auth, async (req, res) => {
    const { error } = validate(req.body, "add");
    if (error) {
        return res.status(400).send(error.details[0].message)
    }
    let body = req.body;
    let ring_int = await (await db).ring.getRingForObj({ ...body });
    if (ring_int.length > 0) {
        return res.status(400).json({ error: 'ushbu  qiymatlar allaqachon kritilgan' });
    }
    
    let _device = await (await db).device.getDevice(body.iddevice);
   // getClient  = getClientMqtt(url,_device.key,req.user.name,req.user.idbroker);

    let ring = {
        id: await generateId(db, 8, "ring"),
        ...body,
        isactive:true,
        iduser:req.user.id
    }

    let result = await (await db).ring.addRing(ring);
    if (result.hasOwnProperty('error')) {
        return res.status(400).json(
            result
        );
    }
    console.log(result);
    res.json(
        ring
    );
})

router.put('/update/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message)
    }
    let body = req.body;
    let id = parseInt(req.params.id);
    console.log(body,id)

    if (!id) {
        return res.status(400).json({ error: 'id xato berildi, id butun son qiymat bo\'lishi shart' });
    }

    if (!body) {
        return res.status(400).json({ error: 'no\'tog\'ri so\'rov. bosh qiymat yuborilgan.' });
    }

    if (body.hasOwnProperty("id")) {
        return res.status(400).json({ error: 'id qiymatini o\'zgartirib bo\'lmaydi.' });
    }



    let ring = await (await db).ring.getRingForObj({ id: id, iduser: req.user.id });
    console.log(ring);
    if (ring.length == 0) {
        return res.status(404).json({ error: 'ushbu idga mos chalinish to\'pilmadi!' });
    }
    let _device = await (await db).device.getDevice(ring.iddevice);
   // getClient  = getClientMqtt(url,_device.key,req.user.name,req.user.idbroker);

    let result = await (await db).ring.update(id, body);
    console.log(result);
    
    if (result.hasOwnProperty('error')) {
        return res.status(400).json(
            result
        );
    }
    res.json(
        result
    );
})



router.get('/delete/:id', auth, async (req, res) => {
    let id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ error: 'id xato berildi, id butun son qiymat bo\'lishi shart' });
    }

    let ring = await (await db).ring.getRingForObj({ id: id, iduser: req.user.id });
    if (ring.length == 0) {
        return res.status(404).json({ error: 'ushbu idga mos chalinish to\'pilmadi!' });
    }
    let _device = await (await db).device.getDevice(ring.iddevice);
    //getClient  = getClientMqtt(url,_device.key,req.user.name,req.user.idbroker);

    let result = await (await db).ring.delete(id);
    console.log(result,id);
    res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script>
                window.location.href = '/profil';
            </script>
        </head>
        <body>
            
        </body>
        </html>`)
})

router.delete('/delete/:id', auth, async (req, res) => {
    let id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ error: 'id xato berildi, id butun son qiymat bo\'lishi shart' });
    }

    let ring = await (await db).ring.getRingForObj({ id: id, iduser: req.user.id });
    if (ring.length == 0) {
        return res.status(404).json({ error: 'ushbu idga mos chalinish to\'pilmadi!' });
    }
    let _device = await (await db).device.getDevice(ring.iddevice);
   // getClient  = getClientMqtt(url,_device.key,req.user.name,req.user.idbroker);


    let result = await (await db).device.delete(id);
    res.json(
        ring[0]
    );
})




module.exports = router;


