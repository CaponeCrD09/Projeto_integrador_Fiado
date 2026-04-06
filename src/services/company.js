import { PrismaClient } from "@prisma/client";
import { z } from "zod";
const prisma = new PrismaClient();
import { attachSave } from "../utils/save.js";
import { uploadToImgBB } from "../utils/imgbb.js";


        //req: quequisição o que esta vindo do frontend
        //res: responder ooque vou responder
        //next: proximo o que fazer a seguir

    export async function createCompany(req, res, _next){
    const data = req.body;
    
    // Regra/Exceção: Não permitir cadastro de CNPJ duplicado
    if (data.cnpj) {
        const cnpjExists = await prisma.company.findFirst({ where: { cnpj: data.cnpj } });
        if (cnpjExists) {
            return res.status(400).json({ erro: "Exceção: CNPJ já cadastrado no sistema. Não é possível ter empresas com o mesmo CNPJ." });
        }
    }

    // Regra/Exceção: Não permitir a criação de empresa se contiver pagamentos acima de 10 mil
    if (data.payments && data.payments.create) {
        const pagamentos = Array.isArray(data.payments.create) ? data.payments.create : [data.payments.create];
        const hasHighPayment = pagamentos.some(payment => payment.value > 10000);
        if (hasHighPayment) {
            return res.status(400).json({ erro: "Exceção: Não é permitido criar empresa com pagamentos acima de R$ 10.000,00." });
        }
    }

    // Regra: Enviar imagem para o ImgBB se o usuário enviou o arquivo
    if (req.file) {
        try {
            data.logoUrl = await uploadToImgBB(req.file.buffer);
        } catch (imgError) {
            return res.status(502).json({ erro: "Erro no upload do ImgBB", detalhe: imgError.message });
        }
    }

    try {
        let companies = await prisma.company.create({data});
        return res.status(201).json(companies);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao criar empresa: " + error.message });
    }
}

    export async function readCompany(req, res, _next) {
    const {name,category,place,cnpj,zipCode,addrres,phone,userId} = req.query;
    let consult = { deletedAt: null } // Filtra para mostrar apenas empresas ativas, ocultando as "apagadas"

    // Prisma "contains" auto aplica o "%" por trás, não precisamos passar na string manualmente
    if(name) consult.name = {contains: name};
    if(category) consult.category = {contains: category};
    if(place) consult.place = {contains: place};
    if(cnpj) consult.cnpj = {contains: cnpj};
    if(zipCode) consult.zipCode = {contains: zipCode};
    if(addrres) consult.addrres = {contains: addrres};
    if(phone) consult.phone = {contains: phone};
    
    // userId é inteiro no banco de dados. string "contains" nele acionaria erro interno do lado do Prisma.
    if(userId) consult.userId = Number(userId);

    try {
        let companies = await prisma.company.findMany({where: consult});
        return res.status(200).json(companies);
    } catch(error) {
        return res.status(500).json({ 
            erro: "Erro interno no Prisma. IMPORTANTE: Se o erro for 'Unknown argument deletedAt', você deve DERRUBAR e REINICIAR o terminal rodando 'npm run dev', para o seu projeto assimilar o recarregamento da nova tabela no Prisma.", 
            detalhe: error.message 
        });
    }
}

    export async function showCompany(req, res, _next) {
    let id = Number(req.params.id);
    let company = await prisma.company.findFirst({
        where: {id:id, deletedAt: null},
        include: { payments: true } // Opcional, retornando também os pagamentos
    });
    
    if (!company) {
        return res.status(404).json({ erro: "NÃO ENCONTREI A EMPRESA COM ID "+ id });
    }
    
    return res.status(200).json(company);
}

    export async function updateCompany(req,res,_next) {
    let id = Number(req.params.id);
    const {name,category,cnpj,places,zip_code,addrres,phone} = req.body ;        
    let c = await prisma.company.findFirst({where : {id:id, deletedAt: null}});
    
    if( !c ){
        return res.status(404).json({ erro: "NÃO ENCONTREI A EMPRESA DE ID "+ id +" (ou ela foi deletada)." })
    }

    // Regra/Exceção: Não permitir atualização para um CNPJ que já pertence a outra empresa
    if (cnpj && cnpj !== c.cnpj) {
        const cnpjExists = await prisma.company.findFirst({ where: { cnpj: cnpj } });
        if (cnpjExists) {
            return res.status(400).json({ erro: "Exceção: CNPJ já cadastrado no sistema para outra empresa." });
        }
    }
    
    c = attachSave(c,"company");

    if(name)        c.name      = name
    if(category)    c.category  = category
    if(cnpj)        c.cnpj      = cnpj
    if(places)      c.places    = places      // CORREÇÃO: era 'c.place = places' (a tabela Prisma espera 'places' e não 'place')
    if(zip_code)    c.zip_code  = zip_code
    if(addrres)     c.addrres   = addrres
    if(phone)       c.phone     = phone
            
    // Regra: Enviar imagem atualizada para o ImgBB se o usuário enviou o arquivo novo
    if (req.file) {
        try {
            c.logoUrl = await uploadToImgBB(req.file.buffer);
        } catch (imgError) {
            return res.status(502).json({ erro: "Erro no ImgBB", detalhe: imgError.message });
        }
    }

    try {
        await c.save();
        return res.status(202).json(c);
    } catch(error) {
        return res.status(500).json({ erro: "Erro ao atualizar a empresa.", detalhe: error.message });
    }
}

export async function deletCompany(req,res,_next) {
    let id = Number(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({ erro: "ID inválido fornecido." });
    }

    let c = await prisma.company.findFirst({
        where : {id:id},
        include: { payments: true }
    });
    
    if( !c ){
        return res.status(404).json({ erro: "NÃO ENCONTREI A EMPRESA COM ID "+ id });
    }

    // Regra/Exceção 1: Não ter empresa com pagamento acima de 10 mil
    const hasHighPayment = c.payments && c.payments.some(payment => payment.value > 10000);
    if (hasHighPayment) {
        return res.status(400).json({ erro: "Exceção: Esta empresa possui pagamentos acima de R$ 10.000,00 e não pode ser deletada." });
    }
    
    try {
        // Soft Delete (Exclusão Lógica):
        // Os pagamentos/produtos continuam existindo e mantemos a empresa, mas marcamos como deletada (oculta)
        await prisma.company.update({
            where: { id: id },
            data: { deletedAt: new Date() }
        });

        return res.status(202).json({ mensagem: "EMPRESA APAGADA COM SUCESSO (Ocultada)" });
    } catch(error) {
        return res.status(500).json({ erro: "Erro ao tentar deletar empresa: " + error.message });
    }
}

    