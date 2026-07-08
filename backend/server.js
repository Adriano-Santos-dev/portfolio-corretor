const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// Conexão robusta com o MongoDB Atlas (Injetando a string de conexão diretamente como fallback)
const URL_BANCO = MONGODB_URI || 'mongodb+srv://adrianocarvalhonav_db_user:FUZnav1994@corretorcluster.ffewpjh.mongodb.net/corretor_db?retryWrites=true&w=majority';

console.log('🔄 Iniciando tentativa de conexão com o MongoDB Atlas...');

mongoose.connect(URL_BANCO, {
    serverSelectionTimeoutMS: 5000 // Falha rapidamente em 5 segundos caso haja erro de rede, evitando travar a API
})
.then(() => console.log('✅ MongoDB Atlas conectado com sucesso!'))
.catch(err => console.error('❌ Erro crítico de conexão no MongoDB:', err));

const app = express();

const corsOptions = {
    origin: [
        'https://portfolio-corretor.vercel.app' // URL oficial do frontend na Vercel
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));

// Aumentar o limite para aceitar imagens em Base64 se necessário
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// SCHEMAS
const defaultOpts = { timestamps: true };

// 1. SCHEMA DE COTAÇÃO (ATUALIZADO E HÍBRIDO)
const CotacaoSchema = new mongoose.Schema({
    nome: String,
    email: String,
    telefone: String,
    data_envio: { type: Date, default: Date.now },
    tipo: String,        // 'PF' ou 'PJ'
    cnpj: String,        // Opcional
    vidas: Number,       // Quantidade
    mensagem: String,    // Dúvidas
    status: { type: String, default: 'Novo' }, // Funil de Vendas
    tipo_plano: String,
    modalidade: String,
    estado: String,
    cidade: String,
    bairro: String,
    numPessoas: Number,
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
    logo: String, 
    tabela: String 
}, defaultOpts);
const Administradora = mongoose.model('Administradora', AdministradoraSchema);

// 4. DEPOIMENTOS DOS CLIENTES
const DepoimentoSchema = new mongoose.Schema({
    nome: String,
    local: String,
    texto: String,
    stars: Number,
    estrelas: Number,
    aprovado: { type: Boolean, default: false }
}, defaultOpts);
const Depoimento = mongoose.model('Depoimento', DepoimentoSchema);


// --- ROTAS API ---

// --- COTAÇÕES ---
app.post('/api/cotacoes', async (req, res) => {
    try {
        const nova = new Cotacao(req.body);
        const salvo = await nova.save();
        res.status(201).json({ message: 'Salvo', cotacaoId: salvo._id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/cotacoes', async (req, res) => {
    try {
        const lista = await Cotacao.find().sort({ data_envio: -1 });
        res.json(lista.map(i => ({ ...i._doc, id: i._id })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/cotacoes/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await Cotacao.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: 'Status updated' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/cotacoes/:id', async (req, res) => {
    try { await Cotacao.findByIdAndDelete(req.params.id); res.json({ msg: 'OK' }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});


// --- ATUALIZAÇÕES ---
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
app.get('/api/depoimentos/publicos', async (req, res) => {
    try {
        const lista = await Depoimento.find({ aprovado: true }).sort({ createdAt: -1 }).limit(6);
        res.json(lista.map(i => ({ ...i._doc, id: i._id })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/depoimentos/todos', async (req, res) => {
    try {
        const lista = await Depoimento.find().sort({ createdAt: -1 });
        res.json(lista.map(i => ({ ...i._doc, id: i._id })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/depoimentos', async (req, res) => {
    try {
        const nova = new Depoimento({ ...req.body, aprovado: false });
        await nova.save();
        res.status(201).json({ message: 'Recebido para moderação' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/depoimentos/:id/aprovar', async (req, res) => {
    try {
        await Depoimento.findByIdAndUpdate(req.params.id, { aprovado: true });
        res.json({ message: 'Aprovado!' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/depoimentos/:id', async (req, res) => {
    try { await Depoimento.findByIdAndDelete(req.params.id); res.json({ msg: 'OK' }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

// Adicionando a rota de diagnóstico para checagem rápida de integridade se necessário
app.get('/api/status', (req, res) => {
    res.json({
        servidorRodando: true,
        statusDoBanco: mongoose.connection.readyState, // 1 significa conectado
        variavelMongooseExiste: !!process.env.MONGODB_URI
    });
});

app.listen(PORT, () => console.log(`🔥 Server ON ${PORT}`));