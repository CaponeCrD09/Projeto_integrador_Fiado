import 'dotenv/config'; //chaves
import express from 'express'; //framwork
import cors from 'cors'; //ele vai permitir a cominuicação com o forntend
import userRouter from './routes/user';
import productRouter from './routes/products';
import companiesRouter from './routes/companies';
import paymentRouter from './routes/payments';


const app = express(); // estou ciando um app
app.use(cors()); //aqui falo qual os cors
app.use(express.json()); // aqui quam fomato json

app.use('/user',userRouter);
app.use('/product',productRouter);
app.use('/payment',paymentRouter);
app.use('/companies',companiesRouter);


const PORT = process.env.PORT || 3000;
app.listen( PORT, () => console.log(`HTTP => http://localhost:${PORT}`));
