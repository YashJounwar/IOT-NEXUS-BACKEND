import { Router } from "express";
import { auth, refe, db } from "../database/firebase.js";
import { get, set, update } from "firebase/database";
import { io } from '../index.js';
import { mmToInches, volumeOfWater, letersOfWater } from '../utilityFunctions/conversionFns.js'
const router = Router();
let userDeviceInfo = {};
const allDeviceIDRef = refe(db, '/AllDevicesId');
function getCurrentWaterLevel(height, diameter, sensorValue) {

    const heightInInches = mmToInches(height);
    const currentWaterLevel = heightInInches - sensorValue; // sensor value is in inches
    const volumeAtCurrentLevel = volumeOfWater(currentWaterLevel, diameter); // in cubic inch
    const letersWater = letersOfWater(volumeAtCurrentLevel);

    return letersWater;
}

router.get('/dashboard', (req, res) => {
    res.status(400).send("dashboard is rendered");
})

router.post('/dashboard/tankSpecification', async (req, res) => {

    let { height, diameter, volume, location, tankName, deviceId } = req.body
    height = parseInt(height); 

    try {
        auth.onAuthStateChanged(user => {
            if (user.emailVerified) {
                // User is signed in
                const userId = user.uid;
                console.log("User ID:", userId);

                setInterval(() => {
                    get(allDeviceIDRef)
                        .then((snapshot) => {
                            snapshot.forEach((childSnapshot) => {
                                let id = childSnapshot.val();
                                let key = childSnapshot.key;
                                let sensorValue = id.DistanceInInches;
                                let deviceStatus = id.deviceStatus;
                                if (key === deviceId) {
                                    // get the value of waterLevel when the id is matched
                                    const currentWaterLevel = getCurrentWaterLevel(height, diameter, sensorValue);
                                    update(refe(db, `Hydrosense/Users/${userId}/Dashboard/devicesInfo/${deviceId}/`), {
                                        tankInfo: {
                                            tankName: tankName,
                                            tankDimensions: {
                                                height: height,
                                                diameter: diameter,
                                                volume: volume,
                                            },
                                            waterLevel: currentWaterLevel,
                                            location: location,
                                        },
                                        deviceStatus: deviceStatus,
                                    })
                                        .then(() => {
                                            //send data to frontend
                                            get(refe(db, `Hydrosense/Users/${userId}/Dashboard/devicesInfo`))
                                                .then(async (snapshot) => {
                                                    const data = await snapshot.val();
                                                    userDeviceInfo = data;
                                                })
                                                .catch((err) => {
                                                    console.log("error", err.message);
                                                })
                                        })
                                        .catch((error) => {
                                            console.log("Error storing dashboard data:", error.message);
                                        });
                                }
                            })
                        })

                }, 5000);
                setTimeout(() => {
                    
                    res.send("Dashboard data is saved")
                }, 6000);
            } else {
                // User is signed out
                console.log("No user signed in");
                res.status(401).send("Unauthorized");
            }
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


router.get('/dashboard/tankLevels', (req, res) => {
    setInterval(() => {
        io.emit('tankDataFromDashboard', userDeviceInfo);
        // console.log("dashboard/tankLevels: ", userDeviceInfo)
    }, 5000)
    res.status(200).send("ok",userDeviceInfo);
});



export default router;


/// get the value from the mac address of current distance of the water from the sensor
// then calculate the water level
// then save it to the corresponding mac address vala tank
// all this will happen in real time and i will send the value in real time to the frontend as the value change in the mac address
// onValue at mac address path then inside it calculate the water level then send it to the users with help of socket