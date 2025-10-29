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

---

<a id="problem-overview"></a>
## 🧩 Problem Overview




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

<a id="tech-stack"></a>
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

<a id="project-structure"></a>📁 Project StructureTicketBossJS/
│
├── data/
│   ├── data.json              # Event state: totalSeats, availableSeats, version
│   └── reservations.json      # All successful reservation records
│
├── node_modules/              # Installed dependencies
│
├── public/
│   └── index.html             # Interactive client-side UI
│
├── server.js                  # Main backend file (Express server)
├── package.json               # Dependencies and scripts
├── package-lock.json          # Auto-generated dependency lock file
├── .gitignore                 # Ignored files
└── README.md                  # Documentation
<a id="setup-instructions"></a>🚀 Setup InstructionsStep 1: Clone and Navigate to the RepositoryFirst, download all the files by cloning the project from GitHub:Bashgit clone https://github.com/howdikshant/TicketBossJS.git
cd TicketBossJS
Step 2: Open in Visual Studio CodeOpen the project directory in VS Code for easy development and access to the integrated terminal:Bashcode .
Note: If code . doesn't work, manually open the TicketBossJS folder from within VS Code.Step 3: Install DependenciesOpen your terminal (or VS Code's integrated terminal) and install the necessary dependencies (the required stuff):Bashnpm install
Step 4: Run the ServerStart the Express API server using the development script:Bashnpm run dev
The API will start at $\rightarrow$ http://127.0.0.1:8000Step 5: Check the Initial State and FunctionalityVerify the API is running and the event is bootstrapped:Event Bootstrap: The database is seeded on first start-up with 500 seats1111.Total Seats: 500 2Available Seats: 500 3Version: 0 4Open the Frontend: Open public/index.html in your web browser. You can use the provided UI to test the four required API endpoints:POST /reservations/ (Reserve Seats) 5DELETE /reservations/:reservationId (Cancel Reservation) 6GET /reservations/ (Event Summary) 7
---

<a id="api-endpoints"></a>
## 🌐 API Endpoints


### POST /reservations/ — Reserve Seats
#### Request Body
```
{
  "partnerId": "abc-corp",
  "seats": 3
}
```

#### ✅ 201 Created
```
{
  "reservationId": "f53a81e6-3d44-4f23-b2f1-3d79c2c347e1",
  "seats": 3,
  "status": "confirmed"
}
```

#### ⚠️ 400 Bad Request
```
{ "error": "Seats per request must be between 1 and 10" }
```

#### ❌ 409 Conflict
```
{ "error": "Not enough seats left" }
```

---

### DELETE /reservations/:reservationId — Cancel Reservation

#### ✅ 204 No Content
Seats are released back into the pool.

#### ❌ 404 Not Found
```
{ "error": "Reservation not found" }
```

---

### GET /reservations/ — Event Summary

#### ✅ 200 OK
```
{
  "eventId": "node-meetup-2025",
  "name": "Node.js Meet-up",
  "totalSeats": 500,
  "availableSeats": 476,
  "reservationCount": 8,
  "version": 5
}
```

---

<a id="example-api-flow"></a>
## 🧠 Example API Flow


1. `POST /reservations/` → Partner A reserves 5 seats  
2. `POST /reservations/` → Partner B reserves 10 seats  
3. `DELETE /reservations/:id` → Partner A cancels  
4. `GET /reservations/` → Shows updated available seats and version increment

Every successful reservation or cancellation increments the **version** counter.

---

<a id="technical-decisions"></a>
## 🧱 Technical Decisions


### Data Storage
- The event and reservation data are stored **in-memory and mirrored in JSON files** (`data.json`, `reservations.json`).
- In production, this would use **Redis** or **PostgreSQL** to handle concurrent access safely.

### Optimistic Concurrency Control
- A `version` key increments on every state change (reservation/cancellation).
- Ensures real-time consistency without overselling.

### Error Handling
- Proper validation for:
  - Invalid seat numbers (≤0 or >10)
  - Insufficient available seats
  - Missing or invalid reservation IDs

### Design Choices
- Endpoints kept **RESTful and minimal**
- Frontend built using **vanilla HTML/CSS/JS**
- No external frameworks — lightweight and dependency-minimal

---

<a id="evaluation-checklist"></a>
## ✅ Evaluation Checklist


| Criteria | Status | Notes |
|-----------|--------|-------|
| Functional API (3 endpoints) | ✅ | Matches Powerplay spec |
| No overselling of seats | ✅ | Enforced through seat validation |
| Proper HTTP codes | ✅ | 201, 204, 400, 404, 409 |
| Version increments | ✅ | Every modification updates version |
| Clean, documented code | ✅ | Readable + modular |
| Frontend Integration | ✅ | Fully interactive UI |
| Documentation | ✅ | This README covers all details |

---

## 💻 Run Example

```
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
```

#### Response:
```
{
  "reservationId": "af7231ab-18a9-467f-a6db-81ef0196b3c2",
  "seats": 4,
  "status": "confirmed"
}
```

---

