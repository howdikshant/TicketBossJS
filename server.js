// ===============================================
// 🎟️ TicketBossJS — Backend Server (Full Logging)
// ===============================================

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// ESM Fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================================
// ✅ MongoDB Connection
// ===============================================
mongoose
  .connect("mongodb://127.0.0.1:27017/ticketboss", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===============================================
// 🎟️ Schemas
// ===============================================
const eventSchema = new mongoose.Schema({
  eventId: String,
  name: String,
  totalSeats: Number,
  availableSeats: Number,
  reservationCount: Number,
  version: Number,
});

const reservationSchema = new mongoose.Schema({
  partnerId: String,
  reservationId: String,
  seats: Number,
});

const logSchema = new mongoose.Schema({
  endpoint: String,
  method: String,
  status: Number,
  message: String,
  partnerId: String,
  reservationId: String,
  timestamp: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", eventSchema);
const Reservation = mongoose.model("Reservation", reservationSchema);
const Log = mongoose.model("Log", logSchema);

// ===============================================
// 🌱 Seed Database (once)
// ===============================================
async function seedDatabase() {
  const count = await Event.countDocuments();
  if (count === 0) {
    await Event.create({
      eventId: "node-meetup-2025",
      name: "Node.js Tech Meet-up",
      totalSeats: 500,
      availableSeats: 500,
      reservationCount: 0,
      version: 1,
    });
    console.log("🌱 Database seeded with initial event data!");
  } else {
    console.log(`ℹ️ Existing event count: ${count}, skipping seeding.`);
  }
}
seedDatabase();

// ===============================================
// 🚀 ROUTES
// ===============================================

// ➕ Reserve Seats (POST)
app.post("/reservations/", async (req, res) => {
  try {
    const { partnerId, seats } = req.body;

    if (!partnerId || typeof seats !== "number") {
      console.log("❌ [400] Invalid request body");
      await Log.create({
        method: "POST",
        endpoint: "/reservations",
        status: 400,
        message: "Invalid request body",
        partnerId,
      });
      return res.status(400).json({ error: "Invalid request body" });
    }

    if (seats <= 0 || seats > 10) {
      console.log("❌ [400] Seats per request must be between 1 and 10");
      await Log.create({
        method: "POST",
        endpoint: "/reservations",
        status: 400,
        message: "Seats per request must be between 1 and 10",
        partnerId,
      });
      return res.status(400).json({ error: "Seats per request must be between 1 and 10" });
    }

    const event = await Event.findOne();
    if (!event) {
      console.log("❌ [404] Event not found");
      await Log.create({
        method: "POST",
        endpoint: "/reservations",
        status: 404,
        message: "Event not found",
        partnerId,
      });
      return res.status(404).json({ error: "Event not found" });
    }

    if (seats > event.availableSeats) {
      console.log("❌ [409] Not enough seats left");
      await Log.create({
        method: "POST",
        endpoint: "/reservations",
        status: 409,
        message: "Not enough seats left",
        partnerId,
      });
      return res.status(409).json({ error: "Not enough seats left" });
    }

    // 🧠 Optimistic Concurrency Control
    const currentVersion = event.version;
    const updateResult = await Event.updateOne(
      { _id: event._id, version: currentVersion, availableSeats: { $gte: seats } },
      { $inc: { availableSeats: -seats, reservationCount: 1, version: 1 } }
    );

    if (updateResult.matchedCount === 0) {
      console.log("⚠️ [409] Concurrency conflict — retrying may help");
      await Log.create({
        method: "POST",
        endpoint: "/reservations",
        status: 409,
        message: "Version conflict (concurrent update)",
        partnerId,
      });
      return res.status(409).json({ error: "Concurrency conflict — try again" });
    }

    const reservationId = uuidv4();
    await Reservation.create({ partnerId, reservationId, seats });
    await Log.create({
      method: "POST",
      endpoint: "/reservations",
      status: 201,
      message: `Reservation confirmed (${seats} seats, version ${currentVersion + 1})`,
      partnerId,
      reservationId,
    });

    console.log(
      `✅ [201] Reservation confirmed — Partner: ${partnerId}, Seats: ${seats}, ID: ${reservationId}, Version: ${currentVersion + 1}`
    );

    return res.status(201).json({
      reservationId,
      seats,
      status: "confirmed",
      version: currentVersion + 1,
    });
  } catch (err) {
    console.error("❌ [500] Error in POST /reservations:", err);
    await Log.create({
      method: "POST",
      endpoint: "/reservations",
      status: 500,
      message: "Internal server error",
    });
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ❌ Cancel Reservation (DELETE)
app.delete("/reservations/:reservationId", async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.findOne({ reservationId });

    if (!reservation) {
      console.log(`❌ [404] Reservation not found: ${reservationId}`);
      await Log.create({
        method: "DELETE",
        endpoint: "/reservations/:reservationId",
        status: 404,
        message: "Reservation not found",
        reservationId,
      });
      return res.status(404).json({ error: "Reservation not found" });
    }

    const event = await Event.findOne();
    const currentVersion = event.version;

    const updateResult = await Event.updateOne(
      { _id: event._id, version: currentVersion },
      { $inc: { availableSeats: reservation.seats, version: 1 } }
    );

    if (updateResult.matchedCount === 0) {
      console.log(`⚠️ [409] Concurrency conflict while cancelling: ${reservationId}`);
      await Log.create({
        method: "DELETE",
        endpoint: "/reservations/:reservationId",
        status: 409,
        message: "Cancel concurrency conflict",
        reservationId,
      });
      return res.status(409).json({ error: "Concurrency conflict during cancel" });
    }

    await Reservation.deleteOne({ reservationId });
    await Log.create({
      method: "DELETE",
      endpoint: "/reservations/:reservationId",
      status: 204,
      message: `Reservation cancelled successfully`,
      reservationId,
    });

    console.log(`🗑️ [204] Reservation cancelled successfully — ID: ${reservationId}`);
    return res.status(204).send();
  } catch (err) {
    console.error("❌ [500] Error in DELETE /reservations:", err);
    await Log.create({
      method: "DELETE",
      endpoint: "/reservations/:reservationId",
      status: 500,
      message: "Internal server error",
    });
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📊 Get Event Summary (GET)
let lastSummary = {}; // store last known values

app.get("/reservations/", async (req, res) => {
  try {
    const event = await Event.findOne();
    const reservationCount = await Reservation.countDocuments();

    const currentSummary = {
      availableSeats: event.availableSeats,
      totalSeats: event.totalSeats,
      version: event.version,
    };

    // 🧠 Only log when something changes
    const hasChanged =
      lastSummary.availableSeats !== currentSummary.availableSeats ||
      lastSummary.version !== currentSummary.version;

    if (hasChanged) {
      console.log(
        `📊 [200] Event Updated — Available: ${event.availableSeats}/${event.totalSeats}, Version: ${event.version}`
      );

      await Log.create({
        method: "GET",
        endpoint: "/reservations",
        status: 200,
        message: "Event summary changed (logged once)",
      });

      lastSummary = currentSummary;
    }

    return res.status(200).json({
      eventId: event.eventId,
      name: event.name,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      reservationCount,
      version: event.version,
    });
  } catch (err) {
    console.error("❌ [500] Error in GET /reservations:", err);
    await Log.create({
      method: "GET",
      endpoint: "/reservations",
      status: 500,
      message: "Internal server error",
    });
    res.status(500).json({ error: "Internal server error" });
  }
});


// ===============================================
// 🖥️ Serve Frontend
// ===============================================
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================================
// 🟢 Start Server
// ===============================================
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ TicketBoss API running on http://127.0.0.1:${PORT}`);
});
