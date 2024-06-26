import { Router } from "express";
import { createUserWithEmailAndPassword, sendEmailVerification, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { set , ref} from 'firebase/database'
import { db} from '../database/firebase.js'
const router = Router();

router.get('/signup',(req,res)=>{
  res.status(200).send({message:"signup page is rendered", flag:"true"});
})

router.post('/signup', async (req, res) => {
  console.log("signup is running");
  const { name, email, password, phoneNumber } = req.body;

  try {
    const auth = getAuth(); // Get a new instance of Auth

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        sendEmailVerification(user);

        //this intervals runs after every one seconds and when the emailVerified returns true then it ends
        const IntervalId = setInterval(() => {
          console.log(user.emailVerified);
          if (user.emailVerified) {
            console.log(user.uid);
            // if the email is verified then add the record in the database
            set(ref(db, `Hydrosense/Users/${user.uid}`), {
              uid: user.uid,
              username: name,
              email: email,
              phoneNumber: phoneNumber,
              Dashboard: {
                devicesInfo:"",      
              },
            })
              .then(() => {
                // send response to the frontend when the user is successfully signed in 
                  if(user.emailVerified){
                    return res.send({
                      uid: user.uid,
                      username: name,
                      email: email,
                      phoneNumber: phoneNumber,
                      signup:"true",
                      authToken: user.getIdTokenResult(),
                      metaData:user.metadata,
                      refreshToken:user.refreshToken
                    })
                  }
                console.log(`${name} is signed up successfully`);
              })
              .catch((error) => {
                // if failed then send this response with error message to the frontend 
                if(res.statusCode == 400 || res.statusCode == 401 || res.statusCode == 403){
                  return res.status(res.statusCode).send({statusCode:res.statusCode, message:error.message,signup:"false"});
                }
                console.log(error.message + "error occurred");
              });
            clearInterval(IntervalId);
          }
          user.reload();
        }, 2000);
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log("error message", errorMessage);
        if (error.code === 'auth/email-already-in-use') {
         return res.status(400).send({message:"email Already exists try different email address", signup:"false"})
        } else {
          // Handle other errors
          return res.status(500).send({ error: 'Internal server error' });
        }
      });
  }
  catch (error) {
    console.error('Error in signup:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

export default router;
