import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  partnerId: String,
  reservationId: String,
  seats: Number,
});

export const Reservation = mongoose.model("Reservation", reservationSchema);
