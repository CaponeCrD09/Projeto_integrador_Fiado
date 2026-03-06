// import { PrismaClient } from "@prisma/client";
// import { z } from "zod";

// const prisma = new PrismaClient();

// //req: quequisição o qyue esta vindo do frontend
// //res: responder ooque vou responder
// //next: proximo o que fazer a seguir

// export async function createPayment(req, res, _next){
//     const data = req.body;
//     let u = await prisma.payment.create({data});
//     return res.status(201).json(u);

// }

// export async function readPayment(req, res, _next) {
   
//     const {value, credits_max, credits_min,user_id, payment_id,product_payment_id,company_id,payment_method }= req.query
   
//     let consult= {}

//     if(value)  consult.value =  value
//     if(credits_max)  consult.value =  {lt: credits_max}
//     if(credits_min)  consult.value =  {gt: credits_min}
//     if(user_id) consult.userId = user_id
//     if(payment_id) consult.paymentId = payment_id
//     if(product_payment_id) consult.productPaymentId = product_payment_id
//     if(company_id) consult.paymentMethod = company_id
//     if(payment_method) consult.payment_method = 

//     //let payment = await prisma.payment.findMany({where: consult});

//     //return res.status(200).json(payment);

// }

// export async function showPayment(req, res, _next) {
//     let id = Number(req.params.id);
//     let p = await prisma.payment.findFirst({where: {id:id}});
//     return res.status(200).json(p);
// }

