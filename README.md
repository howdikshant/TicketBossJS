# 🎟️ TicketBossJS — Real-Time Event Ticketing API (Node.js + Express)

> **TicketBossJS** is a backend application that implements a real-time event seat reservation system for a tech meet-up.  
> Built as part of the **Powerplay Backend Intern Challenge**, this project ensures **no overselling** of seats while allowing multiple partners to reserve and cancel tickets instantly.

---

## 📘 Table of Contents
- [Problem Overview](#problem-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
  - [POST /reservations/ — Reserve Seats](#post-reservations--reserve-seats)
  - [DELETE /reservations/:reservationId — Cancel Reservation](#delete-reservationsreservationid--cancel-reservation)
  - [GET /reservations/ — Event Summary](#get-reservations--event-summary)
- [Example API Flow](#example-api-flow)
- [Technical Decisions](#technical-decisions)
- [Evaluation Checklist](#evaluation-checklist)
- [Author](#author)

---

## 🧩 Problem Overview

Your city is hosting a **Node.js Tech Meet-up** with **500 total seats**.  
Partners can use this API to **reserve** or **cancel** seats in real time.  
Overselling is **not allowed**, and each partner must get an **instant accept/deny response**.

The system supports:
- Real-time seat reservations  
- Reservation cancellation  
- Live event summary tracking  
- Version increment on every data update  

---

## ⚙️ Tech Stack

| Component | Technology |
|------------|-------------|
| **Language** | JavaScript (ESM) |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Frontend** | Plain HTML, CSS, JS (served statically) |
| **Concurrency Model** | In-memory data store with optimistic versioning |
| **Package Manager** | npm |

---

## 📁 Project Structure

TicketBossJS/
├── public/
│ └── index.html # Frontend UI
├── server.js # Main backend file
├── package.json # Dependencies and scripts
├── .gitignore # Ignored files
└── README.md # Documentation

yaml
Copy code

---

## 🚀 Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/howdikshant/TicketBossJS.git
cd TicketBossJS
Step 2: Install Dependencies
bash
Copy code
npm install
Step 3: Run the Server
bash
Copy code
npm run dev
The API will start at
👉 http://127.0.0.1:8000

Step 4: Open the Frontend
Open public/index.html in your browser or use VSCode’s Live Server extension.
The UI allows you to:

Reserve seats

Cancel reservations

View live event summary

🌐 API Endpoints
POST /reservations/ — Reserve Seats
Request Body
json
Copy code
{
  "partnerId": "abc-corp",
  "seats": 3
}
✅ 201 Created
json
Copy code
{
  "reservationId": "f53a81e6-3d44-4f23-b2f1-3d79c2c347e1",
  "seats": 3,
  "status": "confirmed"
}
⚠️ 400 Bad Request
json
Copy code
{ "error": "Seats per request must be between 1 and 10" }
❌ 409 Conflict
json
Copy code
{ "error": "Not enough seats left" }
DELETE /reservations/:reservationId — Cancel Reservation
✅ 204 No Content
Seats are released back into the pool.

❌ 404 Not Found
json
Copy code
{ "error": "Reservation not found" }
GET /reservations/ — Event Summary
✅ 200 OK
json
Copy code
{
  "eventId": "node-meetup-2025",
  "name": "Node.js Meet-up",
  "totalSeats": 500,
  "availableSeats": 476,
  "reservationCount": 8,
  "version": 5
}
🧠 Example API Flow
POST /reservations/ → Partner A reserves 5 seats

POST /reservations/ → Partner B reserves 10 seats

DELETE /reservations/:id → Partner A cancels

GET /reservations/ → Shows updated available seats and version increment

Every successful reservation or cancellation increments the version counter.

🧱 Technical Decisions
Data Storage
The event and reservation data are stored in-memory for simplicity.

A real-world implementation would persist data in Redis or PostgreSQL for concurrency safety.

Optimistic Concurrency Control
A version key increments on every state change (reservation/cancellation).

This allows clients to detect concurrent updates.

Error Handling
Proper validation for:

Invalid seat numbers (≤0 or >10)

Insufficient available seats

Missing or invalid reservation IDs

Design Choices
Endpoints kept RESTful and simple

Stateless API behavior (no sessions)

Frontend built using vanilla HTML/CSS/JS for simplicity and clarity

✅ Evaluation Checklist
Criteria	Status	Notes
Functional API (3 endpoints)	✅	Matches Powerplay spec
No overselling of seats	✅	Validated in POST route
Proper HTTP codes	✅	201, 204, 400, 404, 409 used correctly
Version increments	✅	Each update increments version
Clean Code & Comments	✅	Readable, modular code
Frontend Integration	✅	Fully working UI for interaction
Documentation	✅	Detailed README (this file)

💻 Run Example
bash
Copy code
# Start server
npm run dev

# Open in browser
http://127.0.0.1:8000

# Example POST request
POST http://127.0.0.1:8000/reservations/
{
  "partnerId": "alpha-inc",
  "seats": 4
}
Response:
json
Copy code
{
  "reservationId": "af7231ab-18a9-467f-a6db-81ef0196b3c2",
  "seats": 4,
  "status": "confirmed"
}
👨‍💻 Author
Dikshant Ubale
