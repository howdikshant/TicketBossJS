// test-concurrency.js
import axios from "axios";

const API = "http://127.0.0.1:8000/reservations/";
const NUM_REQUESTS = 10; // how many parallel requests
const partnerId = "concurrency-tester";

async function bookSeats(i) {
  try {
    const res = await axios.post(API, { partnerId, seats: 1 });
    console.log(`✅ [${i}] Success:`, res.data.reservationId);
  } catch (err) {
    console.log(`❌ [${i}] Failed:`, err.response?.data || err.message);
  }
}

async function main() {
  const tasks = [];
  for (let i = 1; i <= NUM_REQUESTS; i++) tasks.push(bookSeats(i));
  await Promise.all(tasks);
  console.log("✅ Test completed");
}

main();
