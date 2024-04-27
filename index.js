import express from 'express';
import cors from 'cors'
import { Server } from 'socket.io';
import {createServer} from 'http'
import { config } from 'dotenv';
config();
export const app = express();
//initialize the socket.io
const server =createServer(app);
export const io = new Server(server,{
    cors: {
        origin: "http://localhost:3000"
    }
});

import signupRouter from './routes/Signup.js'
// import tankDataRouter from './routes/TankData.js'
import loginRouter from './routes/Login.js'
// import ForgotPass from './routes/ForgotPass.js'
import waterConsumptionRouter from './routes/WaterConsumption.js'
import dashboard from './routes/dashboard.js'
import session from 'express-session';


io.on('connection', (socket)=>{
    console.log("server is connected to client")
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true
  }));
// use cors
app.use(cors());

//middlewares
app.use(signupRouter);
// app.use(tankDataRouter);
app.use(loginRouter);
// app.use(ForgotPass);
app.use(waterConsumptionRouter);
app.use(dashboard);

app.get('/', (req,res) => {
     res.send("Hello world");
})

const PORT = 3001;
server.listen(PORT, (req,res)=>{
    console.log(`server is listening on port ${PORT}`)
})

export default server;
