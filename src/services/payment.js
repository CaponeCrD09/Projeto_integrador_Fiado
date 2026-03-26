 import { PrismaClient } from "@prisma/client";
 import { z } from "zod";
 const prisma = new PrismaClient();
 import { attachSave } from "../utils/save.js";
 

 
 export async function createPayment(req, res, _next){
     const data = req.body;
     let u = await prisma.payment.create({data});
     return res.status(201).json(u);
 }

  export async function readPayment(req, res, _next) {
   
     const {value }= req.query
   
     let consult= {}

     if(value)  consult.value =  value
     



    let payment = await prisma.payment.findMany({where: consult});

     return res.status(200).json(payment);

 }

 export async function showPayment(req, res, _next) {
     let id = Number(req.params.id);
     let p = await prisma.payment.findFirst({where: {id:id}});
     return res.status(200).json(p);
 }

export async function updatePayment(req, res, _next) {
    let id = Number(req.params.id);
    const {value,method,toDate,dueDate,userId} = readPayment.body;

    let p = await prisma.user.findFirst({where: {id:id}});

    if(!p){
        return res.status(404).json("Não encrontrei "+ id);
    }
    
    p = attachSave(p, 'payment');
    
    if(value) p.value = value;
    if(method) p.method = method;
    if(toDate) p.toDate = toDate ;
    if(dueDate) p.dueDate = dueDate ;
    if(userId) p.userId = userId;
    await p.save();

    return res.status(202).json(p);

 }


  export async function deletePayment(req, res, _next) {
    const data = res.body;
    let id = Number(req.params.id);
    let d = await prisma.payment.findFirst({where: {id:id}});
     
     if (!d) {
        return res.status(404).json("ID apagado ou não existente "+ id);
        
    }
    d = await prisma.payment.delete({where:{id:id}})
    return res.status(200).json("Pagamento apagado com sucesso");
    
 }


