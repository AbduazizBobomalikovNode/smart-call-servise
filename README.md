# Smart Call Service

IoT tugmalardan kelgan chaqiruvni vazifaga aylantiradigan va uni mas'ul xodimga yetkazadigan tizim.

Kasalxona palatasi, mehmonxona xonasi yoki zavod sexida odam yordam so'ramoqchi bo'lganda tugmani bosadi. Tizim signalni qabul qiladi, kimga tegishli ekanini aniqlaydi va vazifa ochadi. Kim javob berdi, qancha vaqtda bajardi — hammasi yozib boriladi.

**Sahifa:** [abduazizbobomalikovnode.github.io/smart-call-servise/](https://abduazizbobomalikovnode.github.io/smart-call-servise/)

> Bu diplom ishi doirasida yozilgan. Ikkinchi, soddalashtirilgan versiyasi: [system-smart-call-v2](https://github.com/AbduazizBobomalikovNode/system-smart-call-v2)

---

## Muammo

Oddiy chaqiruv tugmasi koridorda chiroq yoqadi, xolos. Kim javob bergani, chaqiruvchi qancha kutgani, umuman javob berilgan-berilmagani hech qayerda qolmaydi.

Natijada uch narsa yo'qoladi: chaqiruvning o'zi (e'tibordan chetda qolsa), javob vaqti (o'lchab bo'lmaydi) va xodim yuklamasi (kim qancha ishlagani noma'lum).

## Nima qiladi

- **Chaqiruvni qabul qiladi** — qurilma MQTT orqali xabar yuboradi, tizim uni yozib oladi
- **Vazifa ochadi** — chaqiruv turiga qarab vazifa yaratiladi va rolga muvofiq xodimga biriktiriladi
- **Bajarilishini kuzatadi** — xodim qabul qiladi va yopadi, o'rtadagi vaqt o'lchanadi
- **Hisobot chiqaradi** — natija DOCX shabloniga to'ldirilib, imzoga tayyor hujjat bo'lib chiqadi
- **Real vaqtda ko'rsatadi** — yangi chaqiruv panelda darhol paydo bo'ladi (Socket.io)

## Qanday ishlaydi

```
Qurilma (tugma)
     │  MQTT: /index/<broker>/get
     ▼
MQTT broker  ──────►  Server (Express)
                          │
                          ├─► chaqiruv bazaga yoziladi        (ring)
                          ├─► vazifa yaratiladi               (task)
                          ├─► rol bo'yicha xodim topiladi     (role_has_task)
                          └─► panelga uzatiladi               (Socket.io)
```

Qurilma MQTT brokerga ulanadi va o'z topic'iga xabar tashlaydi. Server o'sha topic'ga obuna bo'lgan: xabar kelishi bilan `ring` yozuvi ochiladi, unga mos `task` yaratiladi va `role_has_task` jadvali orqali qaysi roldagi xodim javob berishi aniqlanadi.

MQTT ulanishi JWT bilan himoyalangan — parol o'rniga imzolangan token uzatiladi (`resurs/functions/send_recv_mqtt.js`).

## Ma'lumot modeli

| Jadval | Nima saqlaydi |
|---|---|
| `user` | Xodimlar va ularning hisoblari |
| `role` | Rollar (kim qaysi ishni bajaradi) |
| `task` | Vazifa turlari |
| `role_has_task` | Qaysi rol qaysi vazifani oladi |
| `device` | Qurilmalar (tugmalar) |
| `device_has_topic` | Qurilma qaysi MQTT topic'iga ulangan |
| `ring` | Chaqiruvlar tarixi |
| `action` | Foydalanuvchi harakatlari (audit) |
| `static` | Sozlamalar |

## O'rnatish

```bash
git clone https://github.com/AbduazizBobomalikovNode/smart-call-servise.git
cd smart-call-servise
npm install

cp .env.example .env      # qiymatlarni to'ldiring
npm start
```

Kerak bo'ladi: Node.js 16+, MongoDB va ishlab turgan MQTT broker. Broker sifatida shu loyihaning juftini ishlatish mumkin: [broker](https://github.com/AbduazizBobomalikovNode/broker).

## Environment

`.env.example` dan nusxa oling va to'ldiring:

| O'zgaruvchi | Nima uchun |
|---|---|
| `URI_MONGO` | MongoDB ulanish satri |
| `JWT_MY_KEY` | Token imzolash kaliti. Yangi qiymat: `openssl rand -base64 32` |
| `NODE_ENV` | `development` yoki `production` |

Qiymat berilmasa ilova ishga tushmaydi va buni ochiq aytadi — jimgina noto'g'ri sozlama bilan ishlab ketmasligi uchun.

## Tuzilma

```
index.js                     kirish nuqtasi, routerlarni ulaydi
routers/                     REST endpointlar (user, role, task, device, rings…)
db/
  mongodb.js                 ulanish
  tables/                    jadval bilan ishlash funksiyalari
middlewire/
  auth.js                    JWT tekshiruvi
  document.js                DOCX yaratish
resurs/
  functions/send_recv_mqtt.js   MQTT ulanish va obuna
  validate/                  kiruvchi ma'lumot tekshiruvi (Joi)
views/                       Pug shablonlari (panel)
```

## Texnologiyalar

Node.js · Express · MQTT · MongoDB · Socket.io · Pug · JWT · bcrypt · Joi · docxtemplater · qrcode
