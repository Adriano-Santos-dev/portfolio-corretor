import React, { useState, useEffect } from 'react';
import '../styles/Admin.css';

const GerenciarDepoimentos = () => {
    const [depoimentos, setDepoimentos] = useState([]);

    const fetchDepoimentos = async () => {
        // Busca TODOS (pendentes e aprovados)
        const res = await fetch((import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com') + '/api/depoimentos/todos');
        if (res.ok) setDepoimentos(await res.json());
    };

    useEffect(() => { fetchDepoimentos(); }, []);

    const handleAprovar = async (id) => {
        await fetch(`${import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com'}/api/depoimentos/${id}/aprovar`, { method: 'PUT' });
        fetchDepoimentos();
    };

    const handleDelete = async (id) => {
        if(confirm('Apagar este depoimento?')) {
            await fetch(`${import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com'}/api/depoimentos/${id}`, { method: 'DELETE' });
            fetchDepoimentos();
        }
    }

    return (
        <div>
            <div className="admin-list-card">
                <h4 style={{color: '#0056b3'}}>Gerenciar Avaliações dos Clientes</h4>
                <p>Aprove os depoimentos para eles aparecerem no site.</p>
                
                {depoimentos.map(d => (
                    <div key={d.id} style={{
                        border: '1px solid #eee', 
                        padding: '15px', 
                        margin: '15px 0', 
                        borderRadius: '10px', 
                        background: d.aprovado ? '#fff' : '#fff3cd', // Amarelo se pendente
                        borderLeft: d.aprovado ? '5px solid green' : '5px solid orange'
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <strong>{d.nome} ({d.local})</strong>
                            <span>{d.aprovado ? '✅ Aprovado' : '⏳ Pendente'}</span>
                        </div>
                        <p style={{color: '#gold'}}>{"⭐".repeat(d.estrelas)}</p>
                        <p style={{fontStyle: 'italic', color: '#555'}}>"{d.texto}"</p>
                        
                        <div style={{marginTop: '10px'}}>
                            {!d.aprovado && (
                                <button onClick={() => handleAprovar(d.id)} style={{backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px'}}>
                                    ✅ Aprovar
                                </button>
                            )}
                            <button onClick={() => handleDelete(d.id)} style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer'}}>
                                🗑️ Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GerenciarDepoimentos;