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

export async function readPayment(req, res, _next) {
    let users = await prisma.payment.findMany();
    return res.status(200).json(payment);
}

export async function showPayment(req, res, _next) {
    let id = Number(req.params.id);
    let u = await prisma.user.findFirst({where: {id:id}});
    return res.status(200).json(payment);
}