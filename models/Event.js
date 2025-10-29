import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventId: String,
  name: String,
  totalSeats: Number,
  availableSeats: Number,
  reservationCount: Number,
  version: Number,
});

export const Event = mongoose.model("Event", eventSchema);
