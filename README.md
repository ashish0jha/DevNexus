# DevNexus API

Backend for DevNexus — a platform where developers discover, connect, and network with each other. Under the hood it's handling JWT auth, a Razorpay-powered premium flow, real-time chat over Socket.io, a social posts layer, and Cloudinary-backed photo uploads. Deployed on an AWS EC2 instance.

**Live:** http://13.236.147.238/

**Frontend repo:** https://github.com/ashish0jha/DevNexus-FrontEnd

## What it does

Handles everything on the server side — signup/login, a randomized feed of developers, sending and responding to connection requests, real-time chat once two people connect, a social posts layer (create posts, like, comment), developer search by name and skills, and a premium membership flow with Razorpay.

## Stack

- Node.js + Express 
- MongoDB + Mongoose
- JWT auth, cookies (httpOnly)
- bcrypt for password hashing
- Socket.io for live chat
- Razorpay for payments
- Cloudinary for photo/post image storage (multer → buffer → stream → Cloudinary, only URL stored in MongoDB)
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
- `GET /user/feed` — randomized feed, excludes people already swiped on
- `POST /search` — search developers by name or skills
- `GET /user/requests/:state` — state: sent / received
- `GET /user/connections`
- `DELETE /user/remove/:id`
- `DELETE /user`

**Requests**
- `POST /request/send/:status/:receiverId` — status: Interested / Ignored
- `POST /request/review/:status/:requestId` — status: Accepted / Rejected
- `DELETE /request/cancel/:_id`
- `GET /requestCheck/:userId`

**Posts**
- `POST /post/create` — create a post (text + optional image via Cloudinary)
- `GET /post/feed` — paginated posts feed
- `GET /post/view/user` — posts by the logged-in user
- `PATCH /addLike/:postId`
- `POST /post/comment/:postId`
- `GET /getcomments/:postId`

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
│   ├── Auth.js
│   └── upload.js
├── models/
│   ├── chat.js
│   ├── connectionRequest.js
│   ├── payment.js
│   ├── post.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── chat.js
│   ├── payment.js
│   ├── post.js
│   ├── profile.js
│   ├── requests.js
│   └── user.js
├── utils/
│   ├── cloudinary.js
│   ├── razorpay.js
│   ├── socket.js
│   └── validate.js
└── app.js
```

## Running it locally

```bash
git clone https://github.com/ashish0jha/DevNexus.git
cd DevNexus
npm install
```

Add a `.env`:

```
PORT=3000
DB_CONNECTION_SECRET=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm start
```

Server runs on `localhost:3000` by default.

## Deployment

Running on an AWS EC2 instance — Nginx reverse-proxies incoming traffic to the Node process, and PM2 keeps that process alive (auto-restarts on crash, survives reboots).

```bash
npm i pm2 -g
pm2 start npm --name "devnexus" -- start
pm2 save
```

Useful PM2 commands while on the server: `pm2 logs`, `pm2 list`, `pm2 restart devnexus-backend`.

## Notes

- Passwords are never stored in plain text — bcrypt with salting.
- Auth is cookie-based JWT, checked via middleware on protected routes.
- File uploads handled by `upload.js` middleware (multer → memory storage → streamed to Cloudinary; only the returned URL is stored in MongoDB).
- Self-requests and duplicate connection requests are blocked at the schema level.
- Socket connections are authenticated before a chat room is joined — no anonymous access to someone else's chat.
- Feed uses MongoDB `$aggregate` with `$sample` for randomization and `$match` with ObjectId filtering to exclude already-swiped users.
- Search uses `$regex` with `$options: "i"` across firstName, lastName, and skills fields.

## What's next

- In-app and push notifications for matches, messages, and requests
- Smarter feed ranking by shared skills and interests instead of pure exclusion-based filtering
- Search filters (experience level, tech stack, location)
- Voice/video calling for matched connections
- Tests — none yet, that's next