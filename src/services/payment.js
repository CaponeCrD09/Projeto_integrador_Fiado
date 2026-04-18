import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { attachSave } from "../utils/save.js";

const prisma = new PrismaClient();

// ══════════════════════════════════════════════════════════════════════════════
// SCHEMAS ZOD
//
// Zod é uma biblioteca de validação de esquemas que substitui longas cadeias
// de if/else.  Cada schema descreve a forma e as restrições dos dados.
// .safeParse() retorna { success, data } ou { success: false, error }.
// ══════════════════════════════════════════════════════════════════════════════

/** Métodos de pagamento aceitos pela aplicação. */
const METODOS_PERMITIDOS = ["boleto", "dinheiro físico", "pix", "cartão"];

/**
 * Schema de ID de rota (req.params.id).
 * z.coerce converte a string da URL para número antes de validar.
 * Regras: deve ser inteiro e maior que zero.
 */
const idSchema = z.coerce
    .number({ invalid_type_error: "O ID deve ser um número." })
    .int({ message: "O ID deve ser um número inteiro." })
    .positive({ message: "O ID deve ser maior que zero." });

/**
 * Schema base dos campos de um pagamento.
 *
 * Campos e seus tipos esperados:
 *  - companyId : inteiro positivo
 *  - userId    : inteiro positivo
 *  - value     : número decimal  ≥ 0  e  ≤ R$ 10.000
 *  - method    : string — um dos valores em METODOS_PERMITIDOS
 *  - toDate    : string ISO — não pode ser data passada
 *  - dueDate   : string ISO — não pode ser antes de toDate nem mais de 3 meses depois
 *
 * .refine() adiciona validações cruzadas (entre dois campos) que o schema
 * individual não consegue expressar.
 */
const paymentFields = z.object({

    companyId: z
        .number({ invalid_type_error: "O campo 'companyId' deve ser um número inteiro (ex: 1, 2, 3)." })
        .int({ message: "O campo 'companyId' deve ser um número inteiro, sem decimais." })
        .positive({ message: "O campo 'companyId' deve ser maior que zero." }),

    value: z
        .number({ invalid_type_error: "O campo 'value' deve ser um número decimal (ex: 150.00)." })
        .nonnegative({ message: "O valor do pagamento não pode ser negativo." })
        .max(10000, { message: "O valor do pagamento não pode ser maior que R$ 10.000,00." }),

    method: z
        .string({ invalid_type_error: "O campo 'method' deve ser uma string de texto." })
        .refine(
            (m) => METODOS_PERMITIDOS.includes(m),
            { message: `Método inválido. Use um de: ${METODOS_PERMITIDOS.join(", ")}.` }
        ),

    toDate: z
        .string({ invalid_type_error: "O campo 'toDate' deve ser uma string no formato ISO." })
        .refine((d) => {
            const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
            return new Date(d) >= hoje;
        }, { message: "A data de início (toDate) não pode ser uma data passada." }),

    dueDate: z
        .string({ invalid_type_error: "O campo 'dueDate' deve ser uma string no formato ISO." }),

});

const paymentBaseSchema = paymentFields
    // Validação cruzada 1: dueDate não pode ser anterior a toDate
    .refine(
        ({ toDate, dueDate }) => new Date(dueDate) >= new Date(toDate),
        { message: "A data de vencimento (dueDate) não pode ser anterior à data de início.", path: ["dueDate"] }
    )
    // Validação cruzada 2: dueDate deve estar dentro do limite de 3 meses
    .refine(
        ({ toDate, dueDate }) => {
            const limite = new Date(toDate);
            limite.setMonth(limite.getMonth() + 3);
            return new Date(dueDate) <= limite;
        },
        { message: "O prazo máximo de pagamento é de 3 meses após a data de início.", path: ["dueDate"] }
    );

/**
 * Schema para criação (POST) — todos os campos são obrigatórios.
 * Usa o schema base sem modificações.
 */
const createSchema = paymentBaseSchema;

/**
 * Schema para atualização (PUT) — todos os campos são opcionais.
 * .partial() torna cada campo do schema base opcional (undefined aceito).
 * As validações cruzadas de datas só se aplicam se ambos os campos estiverem presentes.
 */
const updateSchema = paymentFields.partial()
    .refine(
        (data) => {
            if (data.toDate && data.dueDate) {
                return new Date(data.dueDate) >= new Date(data.toDate);
            }
            return true;
        },
        { message: "A data de vencimento (dueDate) não pode ser anterior à data de início.", path: ["dueDate"] }
    )
    .refine(
        (data) => {
            if (data.toDate && data.dueDate) {
                const limite = new Date(data.toDate);
                limite.setMonth(limite.getMonth() + 3);
                return new Date(data.dueDate) <= limite;
            }
            return true;
        },
        { message: "O prazo máximo de pagamento é de 3 meses após a data de início.", path: ["dueDate"] }
    );

/**
 * Schema de query param para busca (GET /payment?value=X).
 * A query string chega como string; z.coerce converte para número.
 */
const querySchema = z.object({
    value: z.coerce.number({ invalid_type_error: "O filtro 'value' deve ser um número." }).optional(),
});


// ══════════════════════════════════════════════════════════════════════════════
// HELPER: validate
//
// Centraliza o ciclo safeParse → retornar erro 422 ou retornar dados válidos.
// Todos os controllers chamam esta função; não há lógica de if/else espalhada.
//
// @param {z.ZodSchema} schema  - Schema Zod a usar
// @param {unknown}     input   - Dados a validar
// @param {Response}    res     - Objeto de resposta Express
// @returns {object|null}       - Dados validados e tipados, ou null (já respondeu 422)
// ══════════════════════════════════════════════════════════════════════════════
function validate(schema, input, res) {
    const result = schema.safeParse(input);
    if (!result.success) {
        // Pega a primeira mensagem de erro do Zod e responde imediatamente
        const mensagem = result.error.issues[0].message;
        res.status(422).json({ error: mensagem });
        return null;
    }
    return result.data;
}


// ══════════════════════════════════════════════════════════════════════════════
// HELPER: findPaymentOrFail
//
// Busca um pagamento pelo ID e responde 404 caso não exista.
// Evita repetir o mesmo bloco em show, update e delete.
//
// @param {number}   id   - ID já validado
// @param {Response} res  - Objeto de resposta Express
// @returns {object|null} - Registro encontrado ou null (já respondeu 404)
// ══════════════════════════════════════════════════════════════════════════════
async function findPaymentOrFail(id, res) {
    const p = await prisma.payment.findFirst({ where: { id } });
    if (!p) {
        res.status(404).json({ error: `Pagamento com ID ${id} não encontrado.` });
        return null;
    }
    return p;
}


// ══════════════════════════════════════════════════════════════════════════════
// CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /payment
 * Cria um novo pagamento após validar todos os campos e verificar
 * a existência de userId e companyId no banco de dados.
 */
export async function createPayment(req, res, _next) {
    // 1. Valida o corpo da requisição com o schema de criação
    const data = validate(createSchema, req.body, res);
    if (!data) return;

    // 2. Usa o userId do token autenticado (não vem mais do body)
    data.userId = req.logeded.id;

    // 3. Verifica se userId existe no banco
    const user = await prisma.user.findFirst({ where: { id: data.userId } });
    if (!user) return res.status(404).json({ error: `Usuário com ID ${data.userId} não encontrado.` });

    // 4. Verifica se companyId existe no banco
    const company = await prisma.company.findFirst({ where: { id: data.companyId } });
    if (!company) return res.status(404).json({ error: `Empresa com ID ${data.companyId} não encontrada.` });

    // 5. Verifica se a empresa pertence ao usuário logado (ADM pode usar qualquer empresa)
    if (req.logeded.type !== 'userADM' && company.userId !== req.logeded.id) {
        return res.status(403).json({ erro: "Esta empresa não pertence ao seu usuário." });
    }

    const u = await prisma.payment.create({ data });
    return res.status(201).json(u);
}

/**
 * GET /payment
 * Lista todos os pagamentos, com filtro opcional por valor (?value=X).
 */
export async function readPayment(req, res, _next) {
    // Valida e converte o query param (string → número)
    const query = validate(querySchema, req.query, res);
    if (!query) return;

    // Monta o filtro base — usuários comuns só veem seus próprios pagamentos
    const where = {};
    if (req.logeded && req.logeded.type !== 'userADM') {
        where.userId = req.logeded.id;
    }
    if (query.value !== undefined) {
        where.value = query.value;
    }

    const payments = await prisma.payment.findMany({ where });
    return res.status(200).json(payments);
}

/**
 * GET /payment/:id
 * Retorna um pagamento específico pelo ID.
 * Valida o ID e retorna 404 se não existir.
 */
export async function showPayment(req, res, _next) {
    const id = validate(idSchema, req.params.id, res);
    if (!id) return;

    const p = await findPaymentOrFail(id, res);
    if (!p) return;

    // Verifica se o token pertence ao usuário dono do pagamento
    if (req.logeded && req.logeded.type !== 'userADM' && req.logeded.id !== p.userId) {
        return res.status(403).json({ erro: "Este token é invalido ou pertence a outro usuário." });
    }

    // Verifica se a empresa do pagamento pertence ao usuário logado
    const company = await prisma.company.findFirst({ where: { id: p.companyId } });
    if (req.logeded && req.logeded.type !== 'userADM' && company && company.userId !== req.logeded.id) {
        return res.status(403).json({ erro: "Esta empresa não pertence ao seu usuário." });
    }

    return res.status(200).json(p);
}

/**
 * PUT /payment/:id
 * Atualiza parcialmente um pagamento.
 * Valida o ID, verifica existência, valida os campos enviados e,
 * se userId ou companyId forem alterados, confirma que existem no banco.
 */
export async function updatePayment(req, res, _next) {
    // 1. Valida o ID da rota
    const id = validate(idSchema, req.params.id, res);
    if (!id) return;

    // 2. Confirma que o pagamento existe
    let p = await findPaymentOrFail(id, res);
    if (!p) return;

    // 3. Verifica se o token pertence ao usuário dono do pagamento (ADM pode editar qualquer um)
    if (req.logeded && req.logeded.type !== 'userADM' && req.logeded.id !== p.userId) {
        return res.status(403).json({ erro: "Este token é invalido ou pertence a outro usuário." });
    }

    // 4. Verifica se a empresa do pagamento pertence ao usuário logado
    const companyAtual = await prisma.company.findFirst({ where: { id: p.companyId } });
    if (req.logeded && req.logeded.type !== 'userADM' && companyAtual && companyAtual.userId !== req.logeded.id) {
        return res.status(403).json({ erro: "Esta empresa não pertence ao seu usuário." });
    }

    // 5. Valida os campos do body (schema parcial — tudo opcional)
    const data = validate(updateSchema, req.body, res);
    if (!data) return;

    // 6. Se companyId foi enviado, verifica existência e propriedade
    if (data.companyId !== undefined) {
        const company = await prisma.company.findFirst({ where: { id: data.companyId } });
        if (!company) return res.status(404).json({ error: `Empresa com ID ${data.companyId} não encontrada.` });
        if (req.logeded && req.logeded.type !== 'userADM' && company.userId !== req.logeded.id) {
            return res.status(403).json({ erro: "Esta empresa não pertence ao seu usuário." });
        }
    }

    // 7. Se userId foi enviado, verifica existência
    if (data.userId !== undefined) {
        const user = await prisma.user.findFirst({ where: { id: data.userId } });
        if (!user) return res.status(404).json({ error: `Usuário com ID ${data.userId} não encontrado.` });
    }

    // 8. Aplica apenas os campos presentes no body
    p = attachSave(p, "payment");
    Object.assign(p, data);
    await p.save();

    return res.status(202).json(p);
}

/**
 * DELETE /payment/:id
 * Remove um pagamento pelo ID.
 * Valida o ID e retorna 404 se não existir.
 */
export async function deletePayment(req, res, _next) {
    const id = validate(idSchema, req.params.id, res);
    if (!id) return;

    const d = await findPaymentOrFail(id, res);
    if (!d) return;

    // Verifica se o token pertence ao usuário dono do pagamento (ADM pode deletar qualquer um)
    if (req.logeded && req.logeded.type !== 'userADM' && req.logeded.id !== d.userId) {
        return res.status(403).json({ erro: "Este token é invalido ou pertence a outro usuário." });
    }

    // Verifica se a empresa do pagamento pertence ao usuário logado
    const company = await prisma.company.findFirst({ where: { id: d.companyId } });
    if (req.logeded && req.logeded.type !== 'userADM' && company && company.userId !== req.logeded.id) {
        return res.status(403).json({ erro: "Esta empresa não pertence ao seu usuário." });
    }

    await prisma.payment.delete({ where: { id } });
    return res.status(200).json({ message: "Pagamento apagado com sucesso." });
}
