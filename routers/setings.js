const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
var db = require('../db/mongodb');

const jwt = require('jsonwebtoken');

const jwt_my_key = process.env.JWT_MY_KEY || "***OLIB-TASHLANDI***";

var generateId = require('../resurs/functions/getid');
const validateProfil = require("../resurs/validate/profil");
const validateDevice = require("../resurs/validate/device");

var auth = require("../middlewire/auth");

setTimeout(async () => { db = await db }, 100);


router.get('/', auth, async (req, res) => {
    let devices = await (await db).device.getDeviceForObj({ iduser: req.user.id });
    res.render('public/pages/setings', {
        devices: devices,
        user: req.user
    })
});

router.post('/profil', auth, async (req, res) => {
    console.log(req.body, req.body.hasOwnProperty("name"))
    const { error } = validateProfil(req.body);
    if (error) {
        return res.render('public/pages/erors/error-404', {
            status: 400,
            error: error.details[0].message,
            path: '/setings'
        });
    }
    let user = {};
    let body = req.body;
    if (body.hasOwnProperty("oldpassword") && body.hasOwnProperty("newpassword")) {
        if (body.newpassword != '////////' && body.oldpassword != '////////') {
            user = {
                password: req.body.newpassword,
            };
            req.user.password = req.body.newpassword;
        }
    }
    if (body.hasOwnProperty("name")) {
        user.name = req.body.name;
        req.user.name = req.body.name;
    }
    if (body.hasOwnProperty("email")) {
        user.email = req.body.email;
        req.user.email = req.body.email;
    }

    let id = req.user.id;

    if (body.hasOwnProperty("oldpassword") && body.hasOwnProperty("newpassword")) {
        if (body.newpassword != '////////' && body.oldpassword != '////////') {
            let password = body.oldpassword;
            let pas_flag = password == req.user.password || await bcrypt.compare(password, req.user.password);
            if (pas_flag > 0) {
                return res.render('public/pages/erors/error-404', {
                    status: 400,
                    error: 'asil  parolingiz  xato  esingizdan  chiqan bo\'lsa. +998916664315 ga murojat qiling',
                    path: '/setings'
                });
            }
        }
    }

    let result = await (await db).user.update(id, user);
    if (result.hasOwnProperty('error')) {
        return res.status(400).json(
            result
        );
    }


    const token = jwt.sign({ ...req.user }, jwt_my_key);
    if (result) {
        return res
            .cookie("x-web-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
            .status(200)
            .send(`<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title> Abdusoft</title>
                        <script>
                            setTimeout(()=>{window.location.href = '/setings';},1000);
                        </script>
                        <style>
                        body{
                            background-color:black;
                        }
                        .center{
                            width: fit-content;
                            height: fit-content;
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%,-50%);
                            display: flex;
                        }
                        .left,.right,.left_right{
                            margin-left: 5vw;
                            width: fit-content;
                            height: fit-content;
                        }
                        .right{
                            padding-top: 8vh;
                        }
                        .loader {
                            width: 84px;
                            height: 84px;
                            position: relative;
                            overflow: hidden;
                          }
                          .loader:before , .loader:after {
                            content: "";
                            position: absolute;
                            left: 50%;
                            bottom: 0;
                            width:64px;
                            height: 64px;
                            border-radius: 50%;
                            background:#FFF;
                            transform: translate(-50% , 100%)  scale(0);
                            animation: push 2s infinite ease-in;
                          }
                          .loader:after {
                          animation-delay: 1s;
                          }
                          @keyframes push {
                              0% {
                                transform: translate(-50% , 100%)  scale(1);
                              }
                              15% , 25%{
                                transform: translate(-50% , 50%)  scale(1);
                              }
                            50% , 75% {
                                transform: translate(-50%, -30%) scale(0.5);
                              }
                            80%,  100% {
                                transform: translate(-50%, -50%) scale(0);
                              }
                          }                    
                        </style>
                    </head>
                    <body>
                        <div class="center"> 
                            <div class="left">
                                <span class="loader"></span>
                            </div>
                        </div>
                    </body>
                    </html>`);
    }
});


router.post('/device/:id', auth, async (req, res) => {
    const { error } = validateDevice(req.body, "", "");
    if (error) {
        return res.render('public/pages/erors/error-404', {
            status: 400,
            error: error.details[0].message,
            path: '/setings'
        });
    }
    let body = req.body;
    let id = Number(req.params.id);


    let device = await (await db).device.getDevice(id);
    if (!device) {
        return res.render('public/pages/erors/error-404', {
            status: 404,
            error: 'ushbu idga mos vazifa to\'pilmadi!',
            path: '/setings'
        });
    }
    if (body.hasOwnProperty("name")) {
        let result = await (await db).device.getDeviceForObj({ name: body.name, iduser: req.user.id });
        if (result.length > 0) {
            return res.render('public/pages/erors/error-404', {
                status: 404,
                error: 'ushbu nomda boshqa qurilmangiz mavchud!',
                path: '/setings'
            });
        }
    }

    let result = await (await db).device.update(id, body);
    if (result.hasOwnProperty('error')) {
        return res.render('public/pages/erors/error-404', {
            status: 400,
            error: JSON.stringify(result),
            path: '/setings'
        });
    }
    console.log(result);
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
            window.location.href = '/setings';
        </script>
    </head>
    <body>
        
    </body>
    </html>`);

})

module.exports = router;