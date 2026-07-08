import React, { useState, useEffect } from 'react';
import '../styles/Cotacao.css';
import '../styles/Admin.css';

const GerenciarAdministradoras = () => {
    const [admins, setAdmins] = useState([]);
    const [form, setForm] = useState({ nome: '', descricao: '', logo: '', tabela: '' });
    const [status, setStatus] = useState('');

    const fetchAdmins = async () => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com') + '/api/administradoras');
            if (res.ok) setAdmins(await res.json());
        } catch (error) {
            console.error("Erro ao buscar admins:", error);
        }
    };

    useEffect(() => { fetchAdmins(); }, []);

    const convertToBase64 = (file, field) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setForm(prev => ({ ...prev, [field]: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Enviando...');
        
        try {
            const response = await fetch((import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com') + '/api/administradoras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            
            if (response.ok) {
                setStatus('✅ Salvo com sucesso!');
                setForm({ nome: '', descricao: '', logo: '', tabela: '' });
                // Limpa os inputs de arquivo visualmente
                document.getElementById('logoInput').value = "";
                document.getElementById('tabelaInput').value = "";
                fetchAdmins();
            } else {
                setStatus('❌ Erro ao salvar.');
            }
        } catch (error) {
            setStatus('❌ Erro de rede.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar esta administradora?')) {
            await fetch(`${import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com'}/api/administradoras/${id}`, { method: 'DELETE' });
            fetchAdmins();
        }
    }

    return (
        <div>
            {/* --- FORMULÁRIO DE ADIÇÃO --- */}
            <div className="admin-form-card" style={{padding: '30px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}>
                <h4 style={{color: '#0056b3', marginBottom: '20px', borderBottom: '2px solid #0056b3', display: 'inline-block'}}>
                    Adicionar Administradora
                </h4>
                
                <form onSubmit={handleSubmit} className="cotacao-form" style={{boxShadow: 'none', padding: 0}}>
                    
                    {/* CAMPO NOME (Estilo Material) */}
                    <div className="material-input-group">
                        <input 
                            type="text" 
                            className="material-input-field"
                            value={form.nome} 
                            onChange={e => setForm({...form, nome: e.target.value})} 
                            placeholder="Ex: Amil, Bradesco..." 
                            required 
                        />
                        <label className="material-input-label">Nome da Empresa</label>
                    </div>

                    {/* CAMPO DESCRIÇÃO (Estilo Material) */}
                    <div className="material-input-group">
                        <input 
                            type="text" 
                            className="material-input-field"
                            value={form.descricao} 
                            onChange={e => setForm({...form, descricao: e.target.value})} 
                            placeholder="Ex: Planos Nacionais e Regionais" 
                            required 
                        />
                        <label className="material-input-label">Descrição Curta</label>
                    </div>
                    
                    {/* UPLOADS DE IMAGEM (Estilo Customizado) */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px'}}>
                        <div>
                            <label style={{fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'block'}}>Logo da Empresa:</label>
                            <input 
                                id="logoInput"
                                type="file" 
                                accept="image/*" 
                                onChange={e => convertToBase64(e.target.files[0], 'logo')} 
                                required 
                                style={{border: '1px solid #ccc', padding: '10px', borderRadius: '8px', width: '100%'}}
                            />
                            {form.logo && <img src={form.logo} alt="Preview Logo" style={{height: '40px', marginTop: '5px'}} />}
                        </div>
                        
                        <div>
                            <label style={{fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'block'}}>Imagem da Tabela de Preços:</label>
                            <input 
                                id="tabelaInput"
                                type="file" 
                                accept="image/*" 
                                onChange={e => convertToBase64(e.target.files[0], 'tabela')} 
                                required 
                                style={{border: '1px solid #ccc', padding: '10px', borderRadius: '8px', width: '100%'}}
                            />
                            {form.tabela && <p style={{fontSize: '0.8em', color: 'green'}}>Imagem da tabela carregada!</p>}
                        </div>
                    </div>

                    <button type="submit" className="submit-cotacao-btn" style={{marginTop: '20px'}}>
                        Salvar Administradora
                    </button>
                </form>
                
                <p className="status-message" style={{marginTop: '15px'}}>{status}</p>
            </div>

            {/* --- LISTA DE CADASTRADOS --- */}
            <div className="admin-list-card" style={{marginTop: '40px'}}>
                <h4 style={{color: '#0056b3'}}>Administradoras Cadastradas ({admins.length})</h4>
                
                <div style={{display: 'grid', gap: '15px', marginTop: '20px'}}>
                    {admins.map(a => (
                        <div key={a.id} style={{
                            border: '1px solid #e0e0e0', 
                            padding: '20px', 
                            borderRadius: '10px', 
                            backgroundColor: '#f9f9f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                                <img 
                                    src={a.logo} 
                                    alt="logo" 
                                    style={{width: '60px', height: '60px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '50%', padding: '5px', border: '1px solid #ddd'}} 
                                />
                                <div>
                                    <h5 style={{margin: 0, fontSize: '1.1rem', color: '#333'}}>{a.nome}</h5>
                                    <p style={{margin: 0, color: '#666', fontSize: '0.9rem'}}>{a.descricao}</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleDelete(a.id)} 
                                className="delete-btn" 
                                style={{backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer'}}
                            >
                                Excluir
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GerenciarAdministradoras;