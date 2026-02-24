import { prismaClient } from "prisma/Client";
import { z } from "zod";

const prisma = prismaClient();

//req: quequisição o qyue esta vindo do frontend
//res: responder ooque vou responder
//next: proximo o que fazer a seguir

export async function createPayment(req, res, next){
    const data = req.body;
    let u = await prisma.payments.create({data});
    return res.status(201).json(u);

}