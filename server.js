// server.js
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

// ===============================
// ✅ MongoDB Connection
// ===============================
mongoose
  .connect("mongodb://127.0.0.1:27017/ticketboss", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===============================
// 🎟️ Schemas
// ===============================
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

const Event = mongoose.model("Event", eventSchema);
const Reservation = mongoose.model("Reservation", reservationSchema);

// ===============================
// 🌱 Seed Database (once)
// ===============================
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
    console.log(`ℹ️ Existing event count: ${count}`);
    console.log("✅ Database already has data, skipping seeding.");
  }
}
seedDatabase();

// ===============================
// 🚀 Routes
// ===============================

// ➕ Reserve Seats (Optimistic Concurrency)
app.post("/reservations/", async (req, res) => {
  try {
    const { partnerId, seats } = req.body;

    if (!partnerId || typeof seats !== "number")
      return res.status(400).json({ error: "Invalid request body" });

    if (seats <= 0 || seats > 10)
      return res.status(400).json({
        error: "Seats per request must be between 1 and 10",
      });

    const event = await Event.findOne();
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (seats > event.availableSeats)
      return res.status(409).json({ error: "Not enough seats left" });

    // 🎯 Perform version-based atomic update
    const currentVersion = event.version;
    const updateResult = await Event.updateOne(
      {
        _id: event._id,
        version: currentVersion, // check version
        availableSeats: { $gte: seats }, // avoid negative availability
      },
      {
        $inc: {
          availableSeats: -seats,
          reservationCount: 1,
          version: 1,
        },
      }
    );

    // 🧱 If no documents matched — someone else modified it first
    if (updateResult.matchedCount === 0) {
      console.warn(`⚠️ Version conflict detected at ${new Date().toISOString()}`);
      return res.status(409).json({ error: "Concurrency conflict — try again" });
    }

    const reservationId = uuidv4();
    await Reservation.create({ partnerId, reservationId, seats });

    console.log(
      `✅ [${new Date().toLocaleTimeString()}] Reservation created: ${reservationId} (${seats} seats, version ${currentVersion + 1})`
    );

    return res.status(201).json({
      reservationId,
      seats,
      status: "confirmed",
      version: currentVersion + 1,
    });
  } catch (err) {
    console.error("❌ Error in POST /reservations:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ❌ Cancel Reservation (safe update)
app.delete("/reservations/:reservationId", async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.findOne({ reservationId });
    if (!reservation)
      return res.status(404).json({ error: "Reservation not found" });

    const event = await Event.findOne();
    const currentVersion = event.version;

    const updateResult = await Event.updateOne(
      { _id: event._id, version: currentVersion },
      {
        $inc: {
          availableSeats: reservation.seats,
          version: 1,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      console.warn(`⚠️ Cancel conflict at ${new Date().toISOString()}`);
      return res.status(409).json({ error: "Concurrency conflict during cancel" });
    }

    await Reservation.deleteOne({ reservationId });

    console.log(
      `🗑️ [${new Date().toLocaleTimeString()}] Reservation cancelled: ${reservationId}`
    );
    return res.status(204).send();
  } catch (err) {
    console.error("❌ Error in DELETE /reservations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📊 Get Event Summary
app.get("/reservations/", async (req, res) => {
  try {
    const event = await Event.findOne();
    const reservationCount = await Reservation.countDocuments();

    return res.status(200).json({
      eventId: event.eventId,
      name: event.name,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      reservationCount,
      version: event.version,
    });
  } catch (err) {
    console.error("❌ Error in GET /reservations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===============================
// 🖥️ Serve Frontend
// ===============================
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================
// 🟢 Start Server
// ===============================
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ TicketBoss API running on http://127.0.0.1:${PORT}`);
});
