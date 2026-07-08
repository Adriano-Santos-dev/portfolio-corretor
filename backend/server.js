const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

const corsOptions = {
    origin: [
        'http://localhost:5173', // Para você testar localmente na sua máquina
        'http://localhost:3000', // Outra porta comum de desenvolvimento local
        'https://portfolio-corretor.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));

// SCHEMAS
const defaultOpts = { timestamps: true };

// 1. SCHEMA DE COTAÇÃO (ATUALIZADO E HÍBRIDO)
const CotacaoSchema = new mongoose.Schema({
    // --- Campos Gerais ---
    nome: String,
    email: String,
    telefone: String,
    data_envio: { type: Date, default: Date.now },

    // --- Campos do Novo Formulário ---
    tipo: String,        // 'PF' ou 'PJ'
    cnpj: String,        // Opcional
    vidas: Number,       // Quantidade (Número)
    mensagem: String,    // Dúvidas
    status: { type: String, default: 'Novo' }, // Funil de Vendas

    // --- Campos Legados (Mantidos para histórico) ---
    tipo_plano: String,
    modalidade: String,
    estado: String,
    cidade: String,
    bairro: String,
    numPessoas: Number,
    // O antigo array de detalhes (caso precise acessar dados velhos)
    vidas_detalhes: [{idade: String, pre_existente: String, doenca: String}]
}, defaultOpts);
const Cotacao = mongoose.model('Cotacao', CotacaoSchema);

// 2. SCHEMA DE ATUALIZAÇÕES (NOTÍCIAS)
const AtualizacaoSchema = new mongoose.Schema({
    titulo: String,
    descricao: String,
    imagem: String,
    data_publicacao: { type: Date, default: Date.now },
}, defaultOpts);
const Atualizacao = mongoose.model('Atualizacao', AtualizacaoSchema);

// 3. SCHEMA PARA ADMINISTRADORAS
const AdministradoraSchema = new mongoose.Schema({
    nome: String,
    descricao: String,
    logo: String, // Base64 da Logo
    tabela: String // Base64 da Tabela de Preços
}, defaultOpts);
const Administradora = mongoose.model('Administradora', AdministradoraSchema);

// 4. DEPOIMENTOS DOS CLIENTES
const DepoimentoSchema = new mongoose.Schema({
    nome: String,
    local: String,
    texto: String,
    estrelas: Number,
    aprovado: { type: Boolean, default: false } // Nasce falso (pendente)
}, defaultOpts);
const Depoimento = mongoose.model('Depoimento', DepoimentoSchema);


// --- ROTAS API ---

// --- COTAÇÕES ---

// POST (Cliente envia - Atualizado para aceitar o body direto)
app.post('/api/cotacoes', async (req, res) => {
    try {
        // O formulário novo já manda a estrutura certa, não precisa desestruturar 'idades'
        const nova = new Cotacao(req.body);
        const salvo = await nova.save();
        res.status(201).json({ message: 'Salvo', cotacaoId: salvo._id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET (Admin vê tudo)
app.get('/api/cotacoes', async (req, res) => {
    try {
        const lista = await Cotacao.find().sort({ data_envio: -1 });
        res.json(lista.map(i => ({ ...i._doc, id: i._id })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT STATUS (NOVO - Para o Admin mudar o funil)
app.put('/api/cotacoes/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await Cotacao.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: 'Status atualizado' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
app.delete('/api/cotacoes/:id', async (req, res) => {
    try { await Cotacao.findByIdAndDelete(req.params.id); res.json({ msg: 'OK' }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});


// --- ATUALIZAÇÕES (NOTÍCIAS) ---
app.get('/api/atualizacoes', async (req, res) => {
    try {
        const lista = await Atualizacao.find().sort({ data_publicacao: -1 });
        res.json(lista.map(i => ({ ...i._doc, id: i._id })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/atualizacoes', async (req, res) => {
    try {
        const nova = new Atualizacao(req.body);
        await nova.save();
        res.status(201).json({ message: 'Salvo' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/atualizacoes/:id', async (req, res) => {
    try { await Atualizacao.findByIdAndDelete(req.params.id); res.json({ msg: 'OK' }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/atualizacoes/:id', async (req, res) => {
    try { await Atualizacao.findByIdAndUpdate(req.params.id, req.body); res.json({ msg: 'OK' }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});


// --- ADMINISTRADORAS ---
app.get('/api/administradoras', async (req, res) => {
    try {
        const lista = await Administradora.find();
        res.json(lista.map(i => ({ ...i._doc, id: i._id })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/administradoras', async (req, res) => {
    try {
        const nova = new Administradora(req.body);
        await nova.save();
        res.status(201).json({ message: 'Administradora Salva' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/administradoras/:id', async (req, res) => {
    try { await Administradora.findByIdAndDelete(req.params.id); res.json({ msg: 'OK' }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});


// --- DEPOIMENTOS ---

// ROTA PÚBLICA (Home): Só traz os aprovados!
app.get('/api/depoimentos/publicos', async (req, res) => {
    try {
        const lista = await Depoimento.find({ aprovado: true }).sort({ createdAt: -1 }).limit(6);
        res.json(lista.map(i => ({ ...i._doc, id: i._id })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ROTA ADMIN (Painel): Traz tudo (aprovados e pendentes)
app.get('/api/depoimentos/todos', async (req, res) => {
    try {
        const lista = await Depoimento.find().sort({ createdAt: -1 });
        res.json(lista.map(i => ({ ...i._doc, id: i._id })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ROTA POST (Cliente envia): Salva como pendente
app.post('/api/depoimentos', async (req, res) => {
    try {
        const nova = new Depoimento({ ...req.body, aprovado: false });
        await nova.save();
        res.status(201).json({ message: 'Recebido para moderação' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ROTA PUT (Admin Aprova): Muda para aprovado = true
app.put('/api/depoimentos/:id/aprovar', async (req, res) => {
    try {
        await Depoimento.findByIdAndUpdate(req.params.id, { aprovado: true });
        res.json({ message: 'Aprovado!' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ROTA DELETE (Admin apaga)
app.delete('/api/depoimentos/:id', async (req, res) => {
    try { await Depoimento.findByIdAndDelete(req.params.id); res.json({ msg: 'OK' }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});


app.listen(PORT, () => console.log(`🔥 Server ON ${PORT}`));