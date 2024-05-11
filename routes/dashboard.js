import { Router } from "express";
import { auth, refe, db } from "../database/firebase.js";
import { get, set, update, onValue } from "firebase/database";
import { io } from '../index.js';
import { formatDate } from '../formatting/dateFormat.js';
import { addRow, getRowsByDate } from '../Integration/excelWithFirebase.js';
import { isWithinTimeRange } from '../formatting/timeRange.js';
import { currentDateFormat } from '../formatting/currentDateFormat.js';
import { mmToInches, volumeOfWater, letersOfWater } from '../utilityFunctions/conversionFns.js'
const inTimeRange = isWithinTimeRange();

const router = Router();
let userDeviceInfo = [];
const allDeviceIDRef = refe(db, '/AllDevicesId');
function getCurrentWaterLevel(height, diameter, sensorValue) {

    const heightInInches = mmToInches(height);
    console.log("heightInInches",heightInInches);
    const currentWaterLevel = heightInInches - sensorValue; // sensor value is in inches
    console.log("currentWaterLevel",currentWaterLevel,"sensorValue", sensorValue)
    const volumeAtCurrentLevel = volumeOfWater(currentWaterLevel, diameter); // in cubic inch
    const letersWater = letersOfWater(volumeAtCurrentLevel);

    return currentWaterLevel;
}
router.get('/dashboard/authStatus', (req, res) => {
    console.log("authStatus route is running")
    // Listen for authentication state changes
    auth.onAuthStateChanged((user) => {
        if (user && user.emailVerified) {
            // User is signed in and email is verified, execute the logic
            // Listener for changes in allDeviceIds database
            onValue(allDeviceIDRef, async (snapshot) => {
                const userId = user.uid;
                console.log("userID: ", userId);
                const userDevicesRef = refe(db, `Hydrosense/Users/${userId}/Dashboard/devicesInfo`);
                // Fetch user devices asynchronously
                let enrolledDevicesSnapshot = await get(userDevicesRef);
                // Convert snapshot to an array of values
                const enrolledDevices = enrolledDevicesSnapshot.val() || [];
                if (Object.keys(enrolledDevices).length > 0) {
                    snapshot.forEach((childSnapshot) => {
                        let deviceId = childSnapshot.key;
                        const deviceData = childSnapshot.val();
                        let sensorValue = deviceData.DistanceInInches;
                        // console.log("deviceData", deviceData, "sensorValue", sensorValue);
                        // console.log("deviceId", deviceId, "enrolled Device", enrolledDevices);
                        for (let obj in enrolledDevices) {
                            let height, diameter, volume, tankName, location, deviceStatus;
                            obj = obj.toString().trim();
                            deviceId = deviceId.toString().trim();
                            if (obj == deviceId) {
                                // console.log("tankDimensions",enrolledDevices[obj]);
                                deviceStatus = enrolledDevices[obj];
                                for (let dvcSts in deviceStatus) {
                                    // console.log("deviceStatus",deviceStatus[dvcSts])
                                    deviceStatus = deviceStatus[dvcSts];
                                }
                                let Obj2 = enrolledDevices[obj];
                                for (let subobj in Obj2) {
                                    // console.log("subobj", Obj2[subobj].tankName);
                                    tankName = Obj2[subobj].tankName;
                                    location = Obj2[subobj].location;
                                    let Obj3 = Obj2[subobj].tankDimensions;
                                    for (let it in Obj3) {
                                        // console.log("height", Obj3["height"]);
                                        height = Obj3['height'];
                                        diameter = Obj3['diameter'];
                                        volume = Obj3['volume'];
                                    }
                                }
                                // console.log(height,diameter,volume,location,tankName,deviceStatus);
                                const currentWaterLevel = getCurrentWaterLevel(height, diameter, sensorValue);
                                update(refe(db, `Hydrosense/Users/${userId}/Dashboard/devicesInfo/${deviceId}`), {
                                    tankInfo: {
                                        tankName: tankName || '',
                                        tankDimensions: {
                                            height: height || 0,
                                            diameter: diameter || 0,
                                            volume: volume || 0,
                                        },
                                        waterLevel: currentWaterLevel,
                                        location: location || '',
                                        waterConsumption: "empty",
                                    },
                                    deviceStatus: deviceStatus || '', // Update deviceStatus
                                }).then(() => {
                                    console.log(`Updated data for device ${deviceId} in user's dashboard`);
                                }).catch((error) => {
                                    console.log(`Error updating data for device ${deviceId}:`, error.message);
                                });
                            }
                            else {
                                console.log("not expected or enrolled id");
                            }
                        }
                    });
                }
            });
        } else {
            // User is not signed in or email is not verified, handle accordingly
            // For example, you could log a message or take other appropriate action
            console.log("User is not signed in or email is not verified");
            res.status(401).send({ error: "User is not signed in" })
        }
    });

});

router.get('/dashboard', (req, res) => {
    res.status(400).send("dashboard is rendered");
})

router.post('/dashboard/tankSpecification', async (req, res) => {

    let { height, diameter, volume, location, tankName, deviceId } = req.body
    height = parseInt(height); // inch
    console.log("height",height);

    try {
        auth.onAuthStateChanged(user => {
            if (user.emailVerified) {
                // User is signed in
                const userId = user.uid;
                console.log("User ID:", userId);
                get(allDeviceIDRef)
                    .then((snapshot) => {
                        snapshot.forEach((childSnapshot) => {
                            let id = childSnapshot.val();
                            let key = childSnapshot.key;
                            let sensorValue = id.DistanceInInches;
                            let deviceStatus = id.deviceStatus;
                            // console.log(typeof key, typeof deviceId, key, deviceId);
                            if (key.trim() === deviceId.trim()) {
                                console.log("came in update function", deviceId)
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
                                        waterConsumption: "",
                                    },
                                    deviceStatus: deviceStatus,
                                })
                                    .then(() => {
                                        //send data to frontend
                                        console.log("Data is saved")
                                    })
                                    .catch((error) => {
                                        console.log("Error storing dashboard data:", error.message);
                                    });
                            }
                        })
                    })
                res.send("Dashboard data is saved")
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

        auth.onAuthStateChanged((user) => {
            const userId = user.uid;
            onValue(refe(db, `Hydrosense/Users/${userId}/Dashboard/devicesInfo`),(snapshot)=>{

                userDeviceInfo = []; // Clear the array before updating
                snapshot.forEach((childsnapshot) => {
                    const data = childsnapshot.val();
                    userDeviceInfo.push(data);
                });
                // Emit the updated userDeviceInfo array to the client
                io.emit('tankDataFromTank', userDeviceInfo);
                // console.log("dashboard/tankLevels: ", userDeviceInfo);
            })
        })
        // console.log("dashboard/tankLevels: ", userDeviceInfo);

    res.send({ message: "Data updated and sent to clients", Note:"take the data on 'tankDataFromDashboard' socket" });
});
router.get('/dashboard/tankInfo', (req, res) => {

        auth.onAuthStateChanged((user) => {
            const userId = user.uid;
            onValue(refe(db, `Hydrosense/Users/${userId}/Dashboard/devicesInfo`),(snapshot)=>{

                userDeviceInfo = []; // Clear the array before updating
                snapshot.forEach((childsnapshot) => {
                    const data = childsnapshot.val();
                    userDeviceInfo.push(data);
                });
                // Emit the updated userDeviceInfo array to the client
                io.emit('tankDataFromDashboard', userDeviceInfo);
                // console.log("dashboard/tankLevels: ", userDeviceInfo);
            })
        })
        // console.log("dashboard/tankLevels: ", userDeviceInfo);

    res.send({ message: "Data updated and sent to clients", Note:"take the data on 'tankDataFromDashboard' socket" });
});
