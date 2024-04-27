// import { Router } from "express";
// import {auth} from "../database/firebase.js";
// import { sendPasswordResetEmail } from "firebase/auth";
// const router = Router();

// router.post('/forgotPassword', async (req, res) => {
//     const {email} = req.body;
//     sendPasswordResetEmail(auth, email)
//     .then((result) => {
//       console.log(
//         "email has been sent successfully, go and reset your password"
//       );
//       return res.send({flag: "true", message:"email sent to forgot your password"});
//     })
//     .catch((error) => {
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       res.send({flag: "false", errorMessage : errorMessage, errorCode: errorCode});
//     });
// });

// router.get('/forgotPassword', (req,res)=>{
//   res.status(200).send({message:"Forgot Password page is rendered", flag:"true"})
// })

// export default router;
