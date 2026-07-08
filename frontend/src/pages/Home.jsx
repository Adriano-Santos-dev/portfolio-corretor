import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import AtualizacoesCarousel from '../components/AtualizacoesCarousel';
import FormularioDepoimento from '../components/FormularioDepoimento';
import Snowfall from '../components/Snowfall';
import '../styles/Home.css';

const Home = () => {
  const [atualizacoes, setAtualizacoes] = useState([]);
  const [depoimentos, setDepoimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- SEO GARANTIDO (Sem bibliotecas externas) ---
    document.title = "Corretor Adriano Santos | Planos de Saúde e Odontológicos";
    // ------------------------------------------------

    const fetchData = async () => {
      try {
        const resAtu = await fetch((import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com') + '/api/atualizacoes');
        if (resAtu.ok) setAtualizacoes(await resAtu.json());

        const resDepo = await fetch((import.meta.env.VITE_API_URL || 'https://portfolio-corretor.onrender.com') + '/api/depoimentos/publicos');
        if (resDepo.ok) setDepoimentos(await resDepo.json());

      } catch (error) {
        console.error('Erro de rede ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderEstrelas = (qtd) => "⭐".repeat(qtd);

  return (
    <div className="home-wrapper">
      
      {/* 1. HERO SECTION (NATALINA) */}
      <section className="hero-section">
        {/* Neve Caindo */}
        <Snowfall />

        <div className="hero-content">
          <span className="hero-badge" style={{backgroundColor: '#f8b229', color: '#003366', fontWeight: 'bold'}}>
              🎅 Boas Festas & Muita Saúde!
          </span>
          
          <h1>O Melhor Presente é <br/>Cuidar de Quem Ama</h1>
          
          <p>
            Neste Natal, garanta a proteção da sua família com a <strong>Corretora Marins</strong>.
            Comece 2026 com o plano de saúde ideal e tranquilidade total.
          </p>

          <div className="hero-buttons">
            <Link to="/cotacao" className="btn-hero primary" style={{backgroundColor: '#d42426'}}>
                Fazer Cotação
            </Link>
            <Link to="/contato" className="btn-hero secondary">Fale Comigo</Link>
          </div>
        </div>
        
        <div className="hero-image">
            <img 
                src="/images/perfil.png" 
                alt="Corretor Adriano Santos" 
                width="350"
                height="350"
                onError={(e) => e.target.src='https://via.placeholder.com/350'} 
            />
        </div>
      </section>

      {/* 2. DESTAQUES */}
      <section className="features-strip">
        <div className="feature-card">
            <h3>Planos Individuais</h3>
            <p>Proteção completa para você e sua família.</p>
        </div>
        <div className="feature-card">
            <h3>Planos Empresariais</h3>
            <p>O melhor custo-benefício para sua equipe.</p>
        </div>
        <div className="feature-card">
            <h3>Rede Credenciada</h3>
            <p>Hospitais e laboratórios de excelência.</p>
        </div>
      </section>

      {/* 3. ATUALIZAÇÕES */}
      <section className="updates-section">
        <div className="section-header">
          <h2>Novidades & Oportunidades</h2>
          <p>Fique por dentro das últimas notícias do mercado de saúde.</p>
        </div>
        
        <div className="carousel-wrapper">
            {loading ? (
                <p>Carregando...</p>
            ) : (
                <AtualizacoesCarousel items={atualizacoes} />
            )}
        </div>
      </section>

      {/* 4. DEPOIMENTOS */}
      <section className="reviews-section">
        <div className="section-header">
            <h2>O Que Nossos Clientes Dizem</h2>
            <p>A satisfação de quem já contratou com a Marins Benefícios.</p>
        </div>

        <div className="reviews-grid">
            {depoimentos.length === 0 && !loading ? (
                <p>Seja o primeiro a deixar seu depoimento!</p>
            ) : (
                depoimentos.map(depo => (
                    <div key={depo.id} className="review-card">
                        <div className="review-stars">{renderEstrelas(depo.estrelas)}</div>
                        <p className="review-text">"{depo.texto}"</p>
                        <div className="review-author">
                            <h5>{depo.nome}</h5>
                            <span>{depo.local}</span>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div style={{maxWidth: '600px', margin: '50px auto 0'}}>
            <FormularioDepoimento />
        </div>
      </section>

      {/* 5. SOBRE */}
      <section className="about-section">
        <div className="about-image">
            <img 
                src="/images/logomarins.png"
                alt="Marins Benefícios"
                loading="lazy"
                width="400"
                height="300"
                onError={(e) => e.target.src='https://via.placeholder.com/400'} 
            />
        </div>
        <div className="about-content">
            <h4>Quem Somos</h4>
            <h2>Nossa Missão</h2>
            <p>
                Prover tranquilidade e segurança, com planos que são garantia de paz.
                Conte comigo pra fazer o melhor negócio!
                Na <strong>Marins Benefícios</strong>, nosso foco é descomplicar o acesso à saúde.
            </p>
            <Link to="/contato" className="btn-link">Entre em Contato &rarr;</Link>
        </div>
      </section>

    </div>
  );
};

export default Home;