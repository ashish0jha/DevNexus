# DevTinder API

Backend for DevTinder — a platform where developers match, and connect with each other instead of scrolling through another job board. Under the hood it's handling JWT auth, a Razorpay-powered premium flow, and real-time chat over Socket.io, deployed on an AWS EC2 instance.

**Live:** http://13.236.147.238/

**Frontend repo:** https://github.com/ashish0jha/DevTinder-FrontEnd

## What it does

Handles everything on the server side — signup/login, the feed that suggests other devs, sending and responding to connection requests, real-time chat once two people match, and a premium membership flow with Razorpay.

## Stack

- Node.js + Express 
- MongoDB + Mongoose
- JWT auth, cookies (httpOnly), bcrypt for password hashing
- Socket.io for live chat
- Razorpay for payments
- validator for input checks

## Routes

**Auth**
- `POST /signup`
- `POST /login`
- `POST /logout`

**Profile**
- `GET /profile/view`
- `PATCH /profile/edit`
- `POST /profile/password`

**User**
- `GET /user/requests/:state` — state: sent / received
- `GET /user/connections`
- `GET /user/feed`
- `DELETE /user/remove/:id`
- `DELETE /user`

**Requests**
- `POST /request/send/:status/:receiverId` — status: Interested / Ignored
- `POST /request/review/:status/:requestId` — status: Accepted / Rejected
- `DELETE /request/cancel/:_id`

**Chat**
- WebSocket connection via Socket.io, room per match, handled in real time once a connection request is accepted.

**Payments**
- `POST /payment/create`
- `POST /payment/webhook`
- Razorpay handles checkout; webhook confirms and unlocks premium.

## Folder structure

```
src/
├── config/
│   └── database.js
├── middlewares/
│   └── Auth.js
├── models/
│   ├── chat.js
│   ├── connectionRequest.js
│   ├── payment.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── chat.js
│   ├── payment.js
│   ├── profile.js
│   ├── requests.js
│   └── user.js
├── utils/
│   ├── razorpay.js
│   ├── socket.js
│   └── validate.js
└── app.js
```

## Running it locally

```bash
git clone https://github.com/ashish0jha/DevTinder.git
cd DevTinder
npm install
```

Add a `.env`:

```
PORT=3000
DB_CONNECTION_SECRET=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

```bash
npm start
```

Server runs on `localhost:3000` by default.

## Deployment

Running on an AWS EC2 instance — Nginx reverse-proxies incoming traffic to the Node process, and PM2 keeps that process alive (auto-restarts on crash, survives reboots).

```bash
npm i pm2 -g
pm2 start npm --name "devtinder-backend" -- start
pm2 save
```

Useful PM2 commands while debugging on the server: `pm2 logs`, `pm2 list`, `pm2 restart devtinder-backend`.

## Notes

- Passwords are never stored in plain text — bcrypt with salting.
- Auth is cookie-based JWT, checked via middleware on protected routes.
- Self-requests and duplicate connection requests are blocked at the schema level.
- Socket connections are authenticated before a chat room is joined — no anonymous access to someone else's chat.

## What's next

- Push notifications for new matches/messages
- Better feed ranking (right now it's mostly exclusion-based — filtering out people already swiped on)
- Tests — there aren't any yet, and that's the next thing on the list
