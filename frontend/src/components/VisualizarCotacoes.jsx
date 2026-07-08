import React, { useState, useEffect } from 'react';
import '../styles/Admin.css';

const VisualizarCotacoes = () => {
    const [cotacoes, setCotacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- ESTADOS DO MODAL (JANELA DE DETALHES) ---
    const [modalAberto, setModalAberto] = useState(false);
    const [cotacaoSelecionada, setCotacaoSelecionada] = useState(null);

    const fetchCotacoes = async () => {
        setLoading(true);
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com') + '/api/cotacoes');
            if (res.ok) setCotacoes(await res.json());
        } catch (error) {
            console.error("Erro ao buscar cotações:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCotacoes(); }, []);

    const updateStatus = async (id, novoStatus) => {
        setCotacoes(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c));
        if (cotacaoSelecionada && cotacaoSelecionada.id === id) {
            setCotacaoSelecionada(prev => ({ ...prev, status: novoStatus }));
        }

        await fetch(`${import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com'}/api/cotacoes/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
    };

    const handleDelete = async (id) => {
        if(confirm('Tem certeza que deseja apagar este lead?')) {
            await fetch(`${import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com'}/api/cotacoes/${id}`, { method: 'DELETE' });
            setModalAberto(false); // Fecha modal se estiver aberto
            fetchCotacoes();
        }
    };

    // --- FUNÇÕES DO MODAL ---
    const abrirModal = (cotacao) => {
        setCotacaoSelecionada(cotacao);
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setCotacaoSelecionada(null);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Novo': return '#ffc107';
            case 'Cotando': return '#17a2b8';
            case 'Cotação Enviada': return '#6f42c1';
            case 'Aguardando Resposta': return '#fd7e14';
            case 'Fechou': return '#28a745';
            case 'Não Fechou': return '#6c757d';
            default: return '#333';
        }
    };

    if (loading) return <p>Carregando leads...</p>;

    return (
        <div>
            <h3 style={{color: '#0056b3', marginBottom: '20px'}}>Gestão de Leads</h3>
            <button onClick={fetchCotacoes} className="refresh-btn" style={{marginBottom: '20px'}}>🔄 Atualizar Lista</button>

            {/* GRID DE CARDS */}
            <div className="cotacoes-grid">
                {cotacoes.map(c => (
                    <div key={c.id} className="admin-card-lead" style={{
                        borderLeft: `5px solid ${getStatusColor(c.status || 'Novo')}`,
                        background: 'white', padding: '20px', borderRadius: '10px', 
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px'
                    }}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:'10px'}}>
                            <strong style={{fontSize: '1.1rem'}}>{c.nome}</strong>
                            <span style={{
                                backgroundColor: getStatusColor(c.status || 'Novo'), 
                                color: 'white', padding: '4px 8px', borderRadius: '10px', fontSize: '0.7rem'
                            }}>
                                {c.status || 'Novo'}
                            </span>
                        </div>
                        
                        <p style={{marginBottom: '5px'}}><strong>📞 Tel:</strong> {c.telefone}</p>
                        <p style={{marginBottom: '15px'}}><strong>👥 Vidas:</strong> {c.vidas || c.numPessoas || 1}</p>

                        {/* SELECT RÁPIDO DE STATUS */}
                        <div style={{marginBottom: '10px'}}>
                            <select 
                                value={c.status || 'Novo'} 
                                onChange={(e) => updateStatus(c.id, e.target.value)}
                                style={{width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
                            >
                                <option value="Novo">🌟 Novo Lead</option>
                                <option value="Cotando">⚙️ Cotando</option>
                                <option value="Cotação Enviada">📨 Cotação Enviada</option>
                                <option value="Aguardando Resposta">⏳ Aguardando Resposta</option>
                                <option value="Fechou">✅ Fechou (Venda)</option>
                                <option value="Não Fechou">❌ Não Fechou</option>
                            </select>
                        </div>

                        {/* BOTÃO PARA ABRIR O MODAL DE DETALHES */}
                        <button 
                            onClick={() => abrirModal(c)}
                            style={{
                                width: '100%', padding: '10px', backgroundColor: '#0056b3', 
                                color: 'white', border: 'none', borderRadius: '5px', 
                                cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px'
                            }}
                        >
                            📄 Ver Detalhes Completos
                        </button>
                    </div>
                ))}
            </div>

            {/* --- O MODAL (JANELA FLUTUANTE) --- */}
            {modalAberto && cotacaoSelecionada && (
                <div className="modal-overlay" onClick={fecharModal}>
                    <div className="modal-content-admin" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={fecharModal}>&times;</button>
                        
                        <h3 style={{color: '#0056b3', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
                            Ficha do Cliente
                        </h3>

                        <div className="whatsapp-style-text" style={{marginTop: '20px'}}>
                            <p><strong>STATUS ATUAL:</strong> <span style={{color: getStatusColor(cotacaoSelecionada.status)}}>{cotacaoSelecionada.status || 'Novo'}</span></p>
                            <br/>
                            
                            <p><strong>👤 DADOS DO CLIENTE:</strong></p>
                            <p><strong>Nome:</strong> {cotacaoSelecionada.nome}</p>
                            <p><strong>Telefone:</strong> {cotacaoSelecionada.telefone}</p>
                            <p><strong>Email:</strong> {cotacaoSelecionada.email || 'Não informado'}</p>
                            <p><strong>Tipo:</strong> {cotacaoSelecionada.tipo || cotacaoSelecionada.modalidade || 'PF'}</p>
                            {cotacaoSelecionada.cnpj && <p><strong>CNPJ:</strong> {cotacaoSelecionada.cnpj}</p>}
                            <p><strong>Data Envio:</strong> {new Date(cotacaoSelecionada.createdAt || cotacaoSelecionada.data_envio).toLocaleString()}</p>
                            
                            <br/>
                            <p><strong>🏥 DADOS DO PLANO:</strong></p>
                            <p><strong>Quantidade de Vidas:</strong> {cotacaoSelecionada.vidas || cotacaoSelecionada.numPessoas || 1}</p>
                            
                            {/* EXIBE DETALHES SE FOR O FORMATO ANTIGO (ARRAY) */}
                            {Array.isArray(cotacaoSelecionada.vidas_detalhes) && cotacaoSelecionada.vidas_detalhes.length > 0 && (
                                <div style={{background: '#f8f9fa', padding: '10px', marginTop: '5px'}}>
                                    <p><em>Detalhes das Vidas (Legado):</em></p>
                                    {cotacaoSelecionada.vidas_detalhes.map((v, i) => (
                                        <p key={i} style={{fontSize: '0.9rem', marginLeft: '10px'}}>
                                            - Pessoa #{i+1}: {v.idade} anos {v.pre_existente === 'sim' ? `(Doença: ${v.doenca})` : ''}
                                        </p>
                                    ))}
                                </div>
                            )}

                            <br/>
                            <div style={{background: '#fff3cd', padding: '15px', borderRadius: '5px', borderLeft: '5px solid #ffc107'}}>
                                <p><strong>💬 MENSAGEM / OBSERVAÇÕES:</strong></p>
                                <p style={{fontStyle: 'italic'}}>"{cotacaoSelecionada.mensagem || 'Sem mensagem adicional'}"</p>
                            </div>
                        </div>

                        <div style={{display: 'flex', gap: '10px', marginTop: '30px'}}>
                            <a 
                                href={`https://wa.me/55${cotacaoSelecionada.telefone.replace(/\D/g,'')}`} 
                                target="_blank" 
                                className="btn-zap-admin"
                                style={{textAlign: 'center', padding: '12px'}}
                            >
                                Chamar no WhatsApp
                            </a>
                            <button 
                                onClick={() => handleDelete(cotacaoSelecionada.id)}
                                className="btn-delete-admin"
                            >
                                Excluir Lead
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default VisualizarCotacoes;