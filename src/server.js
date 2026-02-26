import 'dotenv/config'; //chaves
import express from 'express'; //framwork
import cors from 'cors'; //ele vai permitir a cominuicação com o forntend
import userRouter from './routes/user.js';
import productRouter from './routes/product.js';
import companyRouter from './routes/company.js';
import paymentRouter from './routes/payment.js';


const app = express(); // estou ciando um app
app.use(cors()); //aqui falo qual os cors
app.use(express.json()); // aqui quam fomato json

app.use('/user',userRouter);
app.use('/product',productRouter);
app.use('/payment',paymentRouter);
app.use('/company',companyRouter);


const PORT = process.env.PORT || 3000;
app.listen( PORT, () => console.log(`HTTP => http://localhost:${PORT}`));
