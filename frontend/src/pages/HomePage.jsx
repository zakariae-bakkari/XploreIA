import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <MainLayout>
      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <span className="label-sm" style={{ color: 'var(--primary-fixed-dim)', letterSpacing: '0.2em' }}>
              GLOBAL AI MARKETPLACE
            </span>
            <h1 className="h1-xl" style={{ marginTop: '24px' }}>
              Unlock the World of <br /> <span className="cyber-gradient-text">AI Intelligence</span>
            </h1>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '700px', margin: '24px auto' }}>
              XploreIA is the premiere technical gateway for discovering and exploring precision-built AI services. 
              Find the perfect models for your workflow from our curated directory.
            </p>

            <div className="glass-panel search-bar">
              <span className="material-symbols-outlined" style={{ padding: '0 16px', color: 'var(--on-surface-variant)' }}>search</span>
              <input type="text" className="search-input" placeholder="Search for AI tools, models, or categories..." />
              <button className="btn-primary" style={{ padding: '12px 24px' }}>Search</button>
            </div>

            <div className="flex justify-center gap-md" style={{ marginTop: '32px' }}>
              <Link to="/signup" className="btn-primary" style={{ padding: '12px 32px', textDecoration: 'none' }}>Get Started</Link>
              <Link to="/discover" className="glass-panel" style={{ padding: '12px 32px', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Explore Marketplace</Link>
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <section className="bento-grid">
          {/* Main Feature - Discovery */}
          <div className="glass-panel bento-item col-8" style={{ minHeight: '400px', padding: 'var(--lg)' }}>
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '400px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '48px' }}>search_insights</span>
              <h3 className="h2-lg" style={{ color: 'white', marginTop: '16px' }}>Curated AI Discovery</h3>
              <p style={{ color: 'var(--on-surface-variant)', marginTop: '12px' }}>
                Access a hand-picked selection of the most advanced AI models on the market. Filter by category, pricing, and performance.
              </p>
              <Link to="/discover" className="flex items-center gap-xs" style={{ background: 'none', color: 'var(--primary)', marginTop: '24px', fontWeight: '600', textDecoration: 'none' }}>
                Open Marketplace <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div style={{ position: 'absolute', right: '-80px', bottom: '-80px', width: '320px', height: '320px', background: 'rgba(0, 219, 233, 0.1)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
          </div>

          {/* Feature 2 - Suggestions */}
          <div className="glass-panel bento-item col-4" style={{ padding: 'var(--lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '48px' }}>add_box</span>
            <h3 className="h3-md" style={{ color: 'white' }}>Suggest Tools</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>
              Found a great tool we missed? Suggest it to our community and help build the directory.
            </p>
          </div>

          {/* Feature 3 - Categories */}
          <div className="glass-panel bento-item col-4" style={{ padding: 'var(--lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '48px' }}>category</span>
            <h3 className="h3-md" style={{ color: 'white' }}>Deep Categorization</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>
              From NLP to Generative Art, find exactly what you need with our precise taxonomy.
            </p>
          </div>

          {/* Feature 4 - Community */}
          <div className="glass-panel bento-item col-8" style={{ padding: 'var(--lg)' }}>
            <div className="flex items-center justify-between" style={{ height: '100%', gap: '24px' }}>
              <div style={{ maxWidth: '400px' }}>
                <h3 className="h2-lg" style={{ color: 'white' }}>Verified Reviews</h3>
                <p style={{ color: 'var(--on-surface-variant)', marginTop: '12px' }}>
                  Explore tools with confidence. Our community provides real feedback on performance and cost-effectiveness.
                </p>
              </div>
              <div style={{ position: 'relative' }}>
                <div className="cyber-gradient-bg" style={{ width: '120px', height: '120px', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.3, position: 'absolute', inset: '-8px' }}></div>
                <div className="glass-panel" style={{ width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                   <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'white' }}>verified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: 'var(--xl) 0', textAlign: 'center' }}>
          <div className="glass-panel" style={{ padding: 'var(--xl)', border: '1px solid rgba(0, 219, 233, 0.2)', borderRadius: '32px' }}>
            <h2 className="h2-lg">Ready to Find Your Next AI Solution?</h2>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)', margin: '16px auto', maxWidth: '600px' }}>
              Join 10,000+ technical pioneers exploring the boundaries of machine intelligence on XploreIA.
            </p>
            <div className="flex justify-center gap-md" style={{ marginTop: '24px' }}>
              <Link to="/signup" className="btn-primary" style={{ padding: '12px 32px', textDecoration: 'none' }}>Get Started Now</Link>
              <Link to="/community" className="glass-panel" style={{ padding: '12px 32px', color: 'var(--on-surface)', textDecoration: 'none' }}>Join Community</Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default HomePage;
