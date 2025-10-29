import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// ---------------- EVENT STATE ----------------
let EVENT = {
  eventId: "node-meetup-2025",
  name: "Node.js Meet-up",
  totalSeats: 500,
  availableSeats: 500,
  reservationCount: 0,
  version: 0,
  reservations: {}
};

// ---------------- ROUTES ----------------

// POST /reservations/ → Reserve seats
app.post("/reservations/", (req, res) => {
  const { partnerId, seats } = req.body;

  if (!partnerId || typeof seats !== "number") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  if (seats <= 0 || seats > 10) {
    return res.status(400).json({ error: "Seats per request must be between 1 and 10" });
  }

  if (seats > EVENT.availableSeats) {
    return res.status(409).json({ error: "Not enough seats left" });
  }

  // Reserve seats
  const reservationId = uuidv4();
  EVENT.availableSeats -= seats;
  EVENT.reservationCount += 1;
  EVENT.version += 1;
  EVENT.reservations[reservationId] = { partnerId, seats };

  res.status(201).json({
    reservationId,
    seats,
    status: "confirmed"
  });
});

// DELETE /reservations/:reservationId → Cancel reservation
app.delete("/reservations/:reservationId", (req, res) => {
  const { reservationId } = req.params;
  const reservation = EVENT.reservations[reservationId];

  if (!reservation) {
    return res.status(404).json({ error: "Reservation not found" });
  }

  EVENT.availableSeats += reservation.seats;
  delete EVENT.reservations[reservationId];
  EVENT.version += 1;

  res.status(204).send();
});

// GET /reservations/ → Event summary
app.get("/reservations/", (req, res) => {
  res.status(200).json({
    eventId: EVENT.eventId,
    name: EVENT.name,
    totalSeats: EVENT.totalSeats,
    availableSeats: EVENT.availableSeats,
    reservationCount: Object.keys(EVENT.reservations).length,
    version: EVENT.version
  });
});

// Serve frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = 8000;
app.listen(PORT, () => console.log(`✅ TicketBoss API running on http://127.0.0.1:${PORT}`));
