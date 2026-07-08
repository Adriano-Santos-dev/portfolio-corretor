import React, { useState } from 'react';
import '../styles/Cotacao.css';

// Função para gerar uma nova pessoa (vida) vazia
const criarNovaPessoa = (id) => ({
    id: id,
    idade: '',
    preExistente: 'não',
    doenca: '',
});

const Cotacao = () => {
    // Estado Original (Detalhado) + Novos Campos (CNPJ/Status)
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        tipo: 'PF', // Mudamos 'modalidade' para 'tipo' pra alinhar com o novo padrão
        cnpj: '',   // CAMPO NOVO
        cidade: '',
        bairro: '',
        numPessoas: 1, // Esse é o numero que aparece no input
        idades: [criarNovaPessoa(1)], // Essa é a lista detalhada
        mensagem: ''
    });

    const [statusEnvio, setStatusEnvio] = useState('');

    // Atualiza campos simples
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- CORREÇÃO DO BUG MOBILE "TRAVA NO 1" ---
    const handlePessoasChange = (e) => {
        const valorDigitado = e.target.value;

        // 1. Se o usuário apagar tudo, permite ficar vazio (pra não travar)
        if (valorDigitado === '') {
            setFormData({ ...formData, numPessoas: '' });
            return;
        }

        const novoNumero = parseInt(valorDigitado);
        
        // 2. Só atualiza a lista se for um número válido
        if (!isNaN(novoNumero)) {
            const idadesAtuais = formData.idades;
            let novasIdades = [...idadesAtuais];

            if (novoNumero > idadesAtuais.length) {
                // Adiciona novas vidas
                const qtdAdicionar = novoNumero - idadesAtuais.length;
                for (let i = 0; i < qtdAdicionar; i++) {
                    novasIdades.push(criarNovaPessoa(idadesAtuais.length + i + 1));
                }
            } else if (novoNumero < idadesAtuais.length && novoNumero > 0) {
                // Remove as últimas vidas (mas nunca deixa zerado)
                novasIdades = idadesAtuais.slice(0, novoNumero);
            }

            setFormData({ 
                ...formData, 
                numPessoas: novoNumero, 
                idades: novasIdades 
            });
        }
    };

    // Atualiza os detalhes de cada vida (idade, doença)
    const handlePessoaDetalheChange = (id, field, value) => {
        const novasIdades = formData.idades.map(pessoa => 
            pessoa.id === id ? { ...pessoa, [field]: value } : pessoa
        );
        setFormData({ ...formData, idades: novasIdades });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepara os dados pro formato Híbrido do Server
        const dadosParaEnviar = {
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            tipo: formData.tipo, // PF ou PJ
            cnpj: formData.cnpj, // CNPJ se tiver
            cidade: formData.cidade,
            bairro: formData.bairro,
            mensagem: formData.mensagem,
            status: 'Novo', // Funil de vendas
            
            // Manda os dois formatos pra garantir:
            vidas: formData.idades.length, // Número simples
            vidas_detalhes: formData.idades.map(({id, ...rest}) => rest) // Detalhes (Idade/Doença)
        };

        setStatusEnvio('Enviando...');

        try {
            const response = await fetch((import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com') + '/api/cotacoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaEnviar),
            });

            if (response.ok) {
                const result = await response.json();
                
                // Formata mensagem pro WhatsApp
                let msgZap = `*NOVA COTAÇÃO (ID: ${result.cotacaoId})*\n\n` +
                             `👤 ${formData.nome}\n📞 ${formData.telefone}\n` +
                             `📍 ${formData.bairro} - ${formData.cidade}\n` +
                             `🏥 Tipo: ${formData.tipo} ${formData.cnpj ? `(CNPJ: ${formData.cnpj})` : ''}\n\n` +
                             `*--- VIDAS (${formData.idades.length}) ---*\n`;

                formData.idades.forEach((p, i) => {
                    msgZap += `Vida #${i+1}: ${p.idade} anos`;
                    if(p.preExistente === 'sim') msgZap += ` ⚠️ (${p.doenca})`;
                    msgZap += `\n`;
                });

                if(formData.mensagem) msgZap += `\n💬 Msg: ${formData.mensagem}`;

                const whatsappURL = `https://api.whatsapp.com/send?phone=5521980867488&text=${encodeURIComponent(msgZap)}`;
                window.open(whatsappURL, '_blank');

                setStatusEnvio('✅ Enviado com sucesso! Abrindo WhatsApp...');
                // Limpa form
                setFormData({
                    nome: '', email: '', telefone: '', tipo: 'PF', cnpj: '',
                    cidade: '', bairro: '', numPessoas: 1, idades: [criarNovaPessoa(1)], mensagem: ''
                });
            } else {
                setStatusEnvio('❌ Erro ao enviar. Tente novamente.');
            }
        } catch (error) {
            console.error(error);
            setStatusEnvio('❌ Erro de conexão.');
        }
    };

    return (
        <div className="cotacao-wrapper">
            <div className="cotacao-card">
                <h2>Solicite sua Cotação Detalhada</h2>
                <p>Preencha os dados abaixo para uma simulação precisa.</p>

                <form onSubmit={handleSubmit}>
                    {/* DADOS DE CONTATO */}
                    <div className="input-group">
                        <label>Nome Completo *</label>
                        <input name="nome" value={formData.nome} onChange={handleChange} required className="material-input-field" placeholder="Seu nome" />
                    </div>

                    <div className="row-2">
                        <div className="input-group">
                            <label>Telefone / Zap *</label>
                            <input name="telefone" value={formData.telefone} onChange={handleChange} required className="material-input-field" placeholder="(21) 99999-9999" />
                        </div>
                        <div className="input-group">
                            <label>Email (Opcional)</label>
                            <input name="email" value={formData.email} onChange={handleChange} type="email" className="material-input-field" placeholder="email@exemplo.com" />
                        </div>
                    </div>

                    <div className="row-2">
                        <div className="input-group">
                            <label>Cidade</label>
                            <input name="cidade" value={formData.cidade} onChange={handleChange} required className="material-input-field" />
                        </div>
                        <div className="input-group">
                            <label>Bairro</label>
                            <input name="bairro" value={formData.bairro} onChange={handleChange} required className="material-input-field" />
                        </div>
                    </div>

                    {/* TIPO E CNPJ */}
                    <div className="row-2">
                        <div className="input-group">
                            <label>Tipo de Plano</label>
                            <select name="tipo" value={formData.tipo} onChange={handleChange} className="material-input-field">
                                <option value="PF">Pessoa Física (CPF)</option>
                                <option value="PJ">Empresarial (CNPJ)</option>
                            </select>
                        </div>
                        
                        {/* O INPUT DE VIDAS QUE AGORA NÃO TRAVA MAIS */}
                        <div className="input-group">
                            <label>Quantas Vidas? *</label>
                            <input 
                                type="number" 
                                name="numPessoas" 
                                value={formData.numPessoas} 
                                onChange={handlePessoasChange} 
                                required 
                                min="1" 
                                max="30"
                                inputMode="numeric"
                                className="material-input-field"
                            />
                        </div>
                    </div>

                    {/* CAMPO CNPJ (Só aparece se for PJ) */}
                    {formData.tipo === 'PJ' && (
                        <div className="input-group animate-fade-in">
                            <label>CNPJ da Empresa</label>
                            <input name="cnpj" value={formData.cnpj} onChange={handleChange} className="material-input-field" placeholder="00.000.000/0000-00" />
                        </div>
                    )}

                    <hr style={{margin: '30px 0', border: '0', borderTop: '1px solid #eee'}} />

                    {/* LISTA DETALHADA DAS VIDAS (LOOP) */}
                    <h3 style={{color: '#0056b3', marginBottom: '20px'}}>Detalhes das Vidas</h3>
                    
                    {formData.idades.map((pessoa, index) => (
                        <div key={pessoa.id} className="pessoa-detalhe" style={{background: '#f9f9f9', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px dashed #ccc'}}>
                            <h4 style={{margin: '0 0 10px 0', color: '#555'}}>Pessoa #{index + 1}</h4>
                            
                            <div className="row-2">
                                <div className="input-group">
                                    <label>Idade</label>
                                    <input 
                                        type="number" 
                                        value={pessoa.idade} 
                                        onChange={(e) => handlePessoaDetalheChange(pessoa.id, 'idade', e.target.value)}
                                        required
                                        className="material-input-field"
                                        placeholder="Ex: 35"
                                    />
                                </div>
                                
                                <div className="input-group">
                                    <label>Pré-existente?</label>
                                    <select 
                                        value={pessoa.preExistente} 
                                        onChange={(e) => handlePessoaDetalheChange(pessoa.id, 'preExistente', e.target.value)}
                                        className="material-input-field"
                                    >
                                        <option value="não">Não</option>
                                        <option value="sim">Sim</option>
                                    </select>
                                </div>
                            </div>

                            {pessoa.preExistente === 'sim' && (
                                <div className="input-group animate-fade-in">
                                    <label>Qual a doença/condição?</label>
                                    <input 
                                        value={pessoa.doenca} 
                                        onChange={(e) => handlePessoaDetalheChange(pessoa.id, 'doenca', e.target.value)}
                                        className="material-input-field"
                                        placeholder="Ex: Diabetes, Hipertensão..."
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="input-group">
                        <label>Mensagem ou Dúvidas Adicionais</label>
                        <textarea name="mensagem" value={formData.mensagem} onChange={handleChange} rows="3" className="material-input-field"></textarea>
                    </div>

                    <button type="submit" className="btn-enviar">Solicitar Simulação</button>
                    {statusEnvio && <p className="status-msg">{statusEnvio}</p>}
                </form>
            </div>
        </div>
    );
};

export default Cotacao;