# 🎟️ TicketBossJS — Real-Time Event Ticketing API (Node.js + Express + MongoDB)
> **TicketBossJS** is a robust backend system for managing real-time event seat reservations with **strict concurrency safety**, ensuring **zero overbooking** even under heavy parallel requests.  
> Built for the **Powerplay Backend Intern Challenge**, this project demonstrates backend design, concurrency control, database integration, and scalable REST API architecture.

---

## 📘 Table of Contents
- [🧩 Problem Overview](#problem-overview)
- [⚙️ Tech Stack](#tech-stack)
- [📁 Project Structure](#project-structure)
- [🚀 Setup Instructions](#setup-instructions)
- [🌐 API Endpoints](#api-endpoints)
  - [➕ POST /reservations/ — Reserve Seats](#post-reservations--reserve-seats)
  - [❌ DELETE /reservations/:reservationId — Cancel Reservation](#delete-reservationsreservationid--cancel-reservation)
  - [📊 GET /reservations/ — Event Summary](#get-reservations--event-summary)
- [⚔️ Concurrency & Version Control](#concurrency--version-control)
- [🎨 Frontend Overview](#frontend-overview)
- [🧠 Example API Flow](#example-api-flow)
- [⚙️ Technical Highlights](#technical-highlights)
- [🔮 Future Enhancements](#future-enhancements)
- [✅ Evaluation Checklist](#evaluation-checklist)
- [💻 Quick Start Demo](#quick-start-demo)


---

<a id="problem-overview"></a>
## 🧩 Problem Overview
Your city is hosting a **Node.js Tech Meet-up** with **500 total seats**.  
Partners (vendors, booking apps, or third-party APIs) can **reserve** or **cancel** seats simultaneously — without any risk of overselling.  

The challenge:  
> Handle **multiple concurrent requests** safely, **maintain data consistency**, and ensure **atomic seat updates** across transactions.

This system supports:
- 🔄 Real-time reservation and cancellation  
- 🔐 Concurrency-safe updates using versioning  
- 📊 Live event summary with auto-refresh  
- 🧮 Version increment on every data change  

---

<a id="tech-stack"></a>
## ⚙️ Tech Stack
| Component | Technology |
|------------|-------------|
| **Language** | JavaScript (ESM) |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Frontend** | HTML, CSS, Vanilla JS |
| **Concurrency Model** | Optimistic Concurrency Control (OCC) |
| **Package Manager** | npm |

---

<a id="project-structure"></a>
## 📁 Project Structure
```
TicketBossJS/
├── models/
│   ├── Event.js              # Event Schema (MongoDB)
│   └── Reservation.js        # Reservation Schema
├── public/
│   └── index.html            # Frontend UI (served statically)
├── logs/
│   └── access.log            # Request logs
├── test-concurrency.js       # Parallel request tester for concurrency simulation
├── server.js                 # Main Express server
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variable template
└── README.md                 # Documentation
```

---

<a id="setup-instructions"></a>
## 🚀 Setup Instructions

Follow these steps to set up and run **TicketBossJS** locally on your system.

---

### 🧩 Step 1: Download the Project Folder
You can either:
- Clone this repository using Git, or  
- Download the ZIP folder manually from GitHub and extract it.

```bash
git clone https://github.com/howdikshant/TicketBossJS.git
cd TicketBossJS
```

---

### ⚙️ Step 2: Install MongoDB & MongoDB Compass

1. Download and install **MongoDB Community Server** from the official website:  
   👉 [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

2. Install **MongoDB Compass** (GUI tool) from:  
   👉 [https://www.mongodb.com/products/compass](https://www.mongodb.com/products/compass)

3. Open MongoDB Compass and connect to:  
   ```
   mongodb://127.0.0.1:27017
   ```

4. You should see a running connection on your local system.

---

### 💻 Step 3: Open the Project in VS Code

1. Open **Visual Studio Code**  
2. Click **File → Open Folder → Select the TicketBossJS folder**  
3. Open a new **Terminal** inside VS Code (Ctrl + `)

---

### 🧰 Step 4: Install Dependencies

Now install all required packages manually by running the following commands one by one:

```bash
npm install express
npm install mongoose
npm install cors
npm install dotenv
npm install morgan
npm install nodemon --save-dev
npm install uuid
npm install helmet
npm install express-rate-limit
```

> ⚠️ Note: You can also simply run `npm install` if `package.json` already contains all dependencies.

---

### 🧠 Step 5: Start MongoDB Server

Ensure MongoDB service is running locally.  
To start it manually (if not already running):

```bash
mongod
```

If you’re using MongoDB Compass, it starts automatically when connected.

---

### 🚀 Step 6: Run the Server

Start your backend server:

```bash
npm run dev
```

> This uses `nodemon` for live reloads whenever you edit the code.

Server will start at:  
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

### 🌐 Step 7: Open Frontend UI

Open `public/index.html` in your browser or use **Live Server extension** in VS Code.

You can:
- Reserve seats  
- Cancel reservations  
- View live seat summary and version updates  

---

<a id="api-endpoints"></a>
## 🌐 API Endpoints

<a id="post-reservations--reserve-seats"></a>
### ➕ POST `/reservations/` — Reserve Seats
#### Request
```json
{
  "partnerId": "alpha-corp",
  "seats": 3
}
```

#### ✅ 201 Created
```json
{
  "reservationId": "a873e21b-63b1-48af-a81e-03f121b9c1d1",
  "seats": 3,
  "status": "confirmed",
  "version": 8
}
```

#### ❌ 409 Conflict
```json
{ "error": "Not enough seats left" }
```

---

<a id="delete-reservationsreservationid--cancel-reservation"></a>
### ❌ DELETE `/reservations/:reservationId` — Cancel Reservation
#### ✅ 204 No Content
Reservation cancelled successfully.

#### ❌ 404 Not Found
```json
{ "error": "Reservation not found" }
```

---

<a id="get-reservations--event-summary"></a>
### 📊 GET `/reservations/` — Event Summary
#### ✅ 200 OK
```json
{
  "eventId": "node-meetup-2025",
  "name": "Node.js Tech Meet-up",
  "totalSeats": 500,
  "availableSeats": 489,
  "reservationCount": 11,
  "version": 15
}
```

---

<a id="concurrency--version-control"></a>
## ⚔️ Concurrency & Version Control
**Problem:**  
When multiple users try to reserve tickets simultaneously, the system must prevent race conditions and overbooking.  

**Solution:**  
This project uses **Optimistic Concurrency Control (OCC)**:
- Each `Event` document has a `version` field.
- On every update, Mongoose ensures the document’s version matches the stored version.
- If two updates happen at once, one succeeds, and the other throws a `Concurrency conflict` error.

---

<a id="frontend-overview"></a>
## 🎨 Frontend Overview
- Simple, clean dashboard built using **HTML + CSS + Vanilla JS**.  
- Auto-updating **Event Summary** on page load.  
- Users can:
  - Reserve seats  
  - Cancel reservations  
  - View live seat availability and version number  

---

<a id="example-api-flow"></a>
## 🧠 Example API Flow
1. **POST** `/reservations/` → Partner A books 5 seats  
2. **POST** `/reservations/` → Partner B books 3 seats concurrently  
3. **DELETE** `/reservations/:id` → Partner A cancels  
4. **GET** `/reservations/` → Summary updates, version increments  

Every change increases the **version number** by `+1`.

---

<a id="technical-highlights"></a>
## ⚙️ Technical Highlights
| Feature | Description |
|----------|-------------|
| **Database** | MongoDB with Mongoose ORM |
| **Concurrency** | Optimistic Concurrency Control (safe simultaneous access) |
| **Atomicity** | Each reservation updates seat count + version safely |
| **Validation** | Prevents invalid seat counts, duplicate IDs, and overbooking |
| **Logging** | Console logs + `access.log` for monitoring |
| **Scalability** | Modular structure, supports multiple events easily |
| **Frontend** | Responsive, interactive UI |
| **Testing** | `test-concurrency.js` validates real-world concurrency |

---

<a id="future-enhancements"></a>
## 🔮 Future Enhancements
1. **WebSocket / Socket.io Integration** – Live seat updates  
2. **Multi-Event Support** – Parallel event management  
3. **Redis or Kafka-based Locking** – Distributed concurrency control  
4. **JWT Authentication** – Secure partner access  
5. **Admin Dashboard** – Visualization of seats and analytics  
6. **Docker Containerization** – Seamless deployment  

---

<a id="evaluation-checklist"></a>
## ✅ Evaluation Checklist
| Criteria | Status | Notes |
|-----------|--------|-------|
| API Completeness | ✅ | All endpoints functional |
| No Overselling | ✅ | OCC ensures atomicity |
| MongoDB Integration | ✅ | Persistent and reliable |
| Version Tracking | ✅ | Safe increments per change |
| Frontend Connected | ✅ | Simple UI with feedback |
| Concurrency Testing | ✅ | Real parallel simulation |
| Documentation | ✅ | Detailed + clear |

---

<a id="quick-start-demo"></a>
## 💻 Quick Start Demo
```bash
# Run MongoDB
mongod

# Start backend
npm run dev

# Simulate concurrency
node test-concurrency.js
```
Then visit 👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---


