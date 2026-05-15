import React from 'react';

const ReviewSection = ({ tool, showReviews, setShowReviews }) => {
  return (
    <div style={{ marginTop: '64px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '48px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h3 className="h3-md" style={{ margin: 0 }}>Avis de la Communauté</h3>
        <button 
          onClick={() => setShowReviews(!showReviews)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '12px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: showReviews ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, rgba(0, 219, 233, 0.1), rgba(235, 178, 255, 0.1))',
            color: showReviews ? 'var(--on-surface)' : 'var(--primary)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: showReviews ? 'none' : '0 4px 15px rgba(0, 219, 233, 0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(0, 219, 233, 0.15)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = showReviews ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, rgba(0, 219, 233, 0.1), rgba(235, 178, 255, 0.1))';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {showReviews ? 'visibility_off' : 'chat'}
          </span>
          {showReviews ? 'Masquer les avis' : `Voir les avis (${tool.reviews?.length || 0})`}
        </button>
      </div>

      {showReviews && (
        <div className="flex flex-col gap-md">
          {tool.reviews?.length > 0 ? tool.reviews.map((review) => (
            <div key={review.id} className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
              <div className="flex justify-between items-start" style={{ marginBottom: '16px' }}>
                <div className="flex items-center gap-sm">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-primary)', fontSize: '12px', fontWeight: 'bold' }}>
                    {review.user_name?.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{review.user_name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--outline)' }}>{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div style={{ color: '#FFC107', fontSize: '14px' }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: '1.6' }}>
                "{review.comment}"
              </p>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--outline)' }}>
              Aucun avis pour le moment. Soyez le premier à donner votre avis !
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
