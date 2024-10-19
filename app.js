import express from "express";
import db from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.listen()

const PORT = 4100;
app.use(express.json());

app.get("/",(req,res) => {
    res.send('Hello World');
})

app.use('/api/users', userRoutes);
app.use('/balance', expenseRoutes);

const server = () =>{
    db()
    app.listen(PORT, () => {
        console.log('listening to port:', PORT)
    })
}

server();

