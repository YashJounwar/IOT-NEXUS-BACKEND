import { Router } from "express";
import {auth, refe} from "../database/firebase.js";
import { get } from "firebase/database";
const router = Router();

router.post('/login', async (req, res) => {
    console.log("login is running");
    const { email, password } = req.body;
    console.log("email", email, "password", password);
    try {
        get(refe(db, "Hydrosense/Users"))
        .then((snapshot) => {
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const uid = childSnapshot.key;
              var data = childSnapshot.val();
              var username = data.username;
              signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                  // Signed in
                  const user = userCredential.user;
                  console.log(
                    `${username} is logged in successfully! with user id: ${user.uid}`
                  );
                  auth.onAuthStateChanged((user)=>{
                    if(user.emailVerified){
                      return res.send({userName:user.displayName, email:user.email, phoneNumber:user.phoneNumber, authToken:user.getIdToken(), userUid:user.uid,login:"true"})
                    }
                  })
                  // send response to the frontend at login endpoint 
                })
                .catch((error) => {
                  const errorMessage = error.message;
                  console.log("password is incorrect , try correct password");
                  console.log("not signed in ! " + uid + " " + errorMessage);
                  // send when any error in login
                  res.status(401).json({ error: errorMessage,login:"false" });
                });
            });
          } else {
            console.log("No data available");
            res.send({message: "No data available"});
          }
        })
        .catch((error) => {
          console.log(error + "cant read");
          console.log(error.message);
          res.status(500).json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

router.get('/login', (req,res)=>{
  res.status(200).send({message:"login page is rendered", flag:"true"})
})

export default router;
