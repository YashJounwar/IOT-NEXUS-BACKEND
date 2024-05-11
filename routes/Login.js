import { Router } from "express";
import {auth, refe, db} from "../database/firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
const router = Router();

router.post('/login', async (req, res) => {
  const {logout} = req.body;
  if(logout){
    auth.signOut();
  }
  else{
    
    console.log("login is running");
    const { email, password } = req.body;
    try {
              signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                  // Signed in
                  const user = userCredential.user;
                  console.log(
                    `${email} is logged in successfully! with user id: ${user.uid}`
                  );
                  auth.onAuthStateChanged((user)=>{
                    if(user.emailVerified){
                      return res.send({userName:user.displayName, email:user.email, phoneNumber:user.phoneNumber, authToken:user.refreshToken, userUid:user.uid,login:"true"})
                    }
                  })
                  // send response to the frontend at login endpoint 
                })
                .catch((error) => {
                  const errorMessage = error.message;
                  console.log("not signed in ! " + errorMessage);
                  // send when any error in login
                  res.status(401).json({ error: errorMessage,login:"false" });
                });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

});

router.get('/login', (req,res)=>{
  res.status(200).send({message:"login page is rendered", flag:"true"})
})

export default router;
