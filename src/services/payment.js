import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

//req: quequisição o qyue esta vindo do frontend
//res: responder ooque vou responder
//next: proximo o que fazer a seguir

export async function createPayment(req, res, _next){
    const data = req.body;
    let u = await prisma.payment.create({data});
    return res.status(201).json(u);

}