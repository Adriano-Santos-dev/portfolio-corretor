import React, { useState } from 'react';
import '../styles/Cotacao.css';

const FormularioDepoimento = () => {
    const [form, setForm] = useState({ nome: '', local: '', texto: '', estrelas: '5' });
    const [status, setStatus] = useState('');

    // Captura a URL do backend configurada na Vercel
    const API_URL = import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Enviando...');
        
        try {
            // Adiciona a API_URL antes da rota do endpoint
            const res = await fetch(`${API_URL}/api/depoimentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setStatus('✅ Obrigado! Seu depoimento foi enviado para análise e aparecerá em breve.');
                setForm({ nome: '', local: '', texto: '', estrelas: '5' });
            } else {
                setStatus('❌ Erro ao enviar.');
            }
        } catch (error) {
            setStatus('❌ Erro de conexão.');
        }
    };

    return (
        <div className="cotacao-form" style={{marginTop: '40px', borderTop: '4px solid #00a86b'}}>
            <h3 style={{textAlign: 'center', color: '#0056b3'}}>Deixe sua Avaliação</h3>
            <p style={{textAlign: 'center', color: '#666', marginBottom: '20px'}}>Sua opinião é muito importante para nós!</p>

            <form onSubmit={handleSubmit}>
                <div className="material-input-group">
                    <input className="material-input-field" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required placeholder="Seu Nome" />
                    <label className="material-input-label">Nome</label>
                </div>

                <div className="material-input-group">
                    <input className="material-input-field" value={form.local} onChange={e => setForm({...form, local: e.target.value})} required placeholder="Cidade/Bairro" />
                    <label className="material-input-label">De onde você é?</label>
                </div>

                <div className="material-input-group">
                    <select className="material-input-field" value={form.estrelas} onChange={e => setForm({...form, estrelas: e.target.value})}>
                        <option value="5">⭐⭐⭐⭐⭐ (Excelente)</option>
                        <option value="4">⭐⭐⭐⭐ (Muito Bom)</option>
                        <option value="3">⭐⭐⭐ (Bom)</option>
                        <option value="2">⭐⭐ (Mais ou Menos)</option>
                        <option value="1">⭐ (Não Gostei)</option>
                    </select>
                    <label className="material-input-label">Nota</label>
                </div>

                <div className="material-input-group">
                    <textarea className="material-input-field" value={form.texto} onChange={e => setForm({...form, texto: e.target.value})} required placeholder="Escreva sua experiência..." style={{minHeight: '80px'}} />
                    <label className="material-input-label">Depoimento</label>
                </div>

                <button type="submit" className="submit-cotacao-btn">Enviar Avaliação</button>
            </form>
            {status && <p style={{textAlign: 'center', marginTop: '15px', fontWeight: 'bold', color: status.includes('✅') ? 'green' : 'red'}}>{status}</p>}
        </div>
    );
};

export default FormularioDepoimento;