require('dotenv').config();
const express = require('express');
const cookieParser = require("cookie-parser");
var auth = require("./middlewire/auth");

// var document = require("./middlewire/document");
const port = 3000; // yoki istalgan boshqa port
const app = express();




const taskRouter = require("./routers/task");
const roleRouter = require("./routers/role");
const deviceRouter = require("./routers/device");
const rigsRouter = require("./routers/rings");
const userRouter = require("./routers/user");
const RHTRouter = require("./routers/_____role_has_task");

const setingsRouter = require("./routers/setings");
// const DHTRouter = require("./routers/device_has_topic");                             

const authRouter = require("./routers/auth");

var db = require('./db/mongodb');

setInterval(async () => { db = await db }, 100);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/task', taskRouter)
app.use('/role', roleRouter)
app.use('/user', userRouter)
app.use('/api/RHT', RHTRouter)
app.use('/device', deviceRouter)
app.use('/api/ring', rigsRouter)

app.use('/profil/api', auth, async (req, res, next) => {
  let user_id = req.user.id;
  let devices = await (await db).device.getDeviceForObj({ iduser: user_id });
  let rings = await (await db).ring.getRingForObj({ iduser: user_id });
  res.status(200).json(
    {
      user: req.user,
      devices: devices,
      rings: rings
    });
})

app.use('/profil', auth, async (req, res, next) => {
  let user_id = req.user.id;
  let devices = await (await db).device.getDeviceForObj({ iduser: user_id });
  let rings = await (await db).ring.getRingForObj({ iduser: user_id });
  // console.log("profil result: ",user_id,devices,rings)
  res.render('public/pages/profil',
    {
      user: req.user,
      devices: devices,
      rings: rings,
      daysFunck: function (arr) {
        const daysMap = { 1: 'DSH', 2: 'SSh', 3: 'CHR', 4: 'PAY', 5: 'JU', 6: 'SHN' };
        if (arr.length === 6 && arr.every(day => day >= 1 && day <= 6)) {
          return 'HAR KUN';
        }
        return arr.map(day => daysMap[day]).join(', ');
      }
    })
})

app.use('/setings', setingsRouter)

app.use('/signout', async (req, res, next) => {
  return res
    .cookie("x-web-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .send(`<script>setTimeout(()=>{window.location.href = '/login';},10);</script>`);
})


app.use('/login', authRouter);

// Pug templateni sozlash
app.set('view engine', 'pug');
app.set('views', './views'); // Pug fayllarini joylash

// Static fayllarni servis qilish (masalan: css, js)
app.use(express.static('views/public'));
// app.use('/documents', document,async (req, res, next)=>{(await db).static.add(4);return next();},express.static('views/certifcate'));

app.get('/', auth, async (req, res) => {
  console.log("kirish amalga  oshdi!");
  // // console.log(bolimlar,!bolimlar.task && !bolimlar.role && !bolimlar.user);
  const actions = await (await db).action.getActionAll();
  // const static = await (await db).static.getStatic();
  let static = {};
  res.render('public/index', {
    static: static,
    user: req.user,
    actions: actions
  }); // 'login.pug' faylini ishlatish
});
// Login sahifasi uchun GET tarmoq so'rovini qo'llash
app.get('/login', (req, res) => {
  res.render('public/pages/login'); // 'login.pug' faylini ishlatish
});

// Serverni ishga tushirish
app.listen(port, () => {
  console.log(`Server http://localhost:${port} portda ishlayapti...`);
});
