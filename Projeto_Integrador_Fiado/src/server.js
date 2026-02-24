import 'dotenv/config'; //chaves
import express from 'express'; //framwork
import cors from 'cors'; //ele vai permitir a cominuicação com o forntend
import userRouter from './routes/user';
const app = express(); // estou ciando um app
app.use(cors()); //aqui falo qual os cors
app.use(express.json()); // aqui quam fomato json

const PORT = process.env.PORT || 3000;
app.listen( PORT, () => console.log(`HTTP => http://localhost:${PORT}`));

app.use('/user',userRouter)