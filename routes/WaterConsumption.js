import { Router } from 'express';
import { onValue, get, ref } from 'firebase/database';
import { db } from '../database/firebase.js';
import { io } from '../index.js';
const router = Router();

const tankRef = ref(db, '/WaterConsumption');
let currentWaterConsumption;

onValue(tankRef, async (snapshot) => {
  currentWaterConsumption = await snapshot.val();

  io.on('connection', (socket) => {
    // console.log("connected to client")
    io.emit('waterConsumption', currentWaterConsumption)
  })
  io.emit('waterConsumption', currentWaterConsumption)

  // console.log("water consumption called", currentWaterConsumption)
});

// router.get('/water_consumption',(req, res) => {

//   res.send(currentWaterConsumption);
// });

export default router;