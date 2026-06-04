import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { aiToolApi } from '../../api';

const ReviewSection = ({ tool, showReviews, setShowReviews }) => {
  const { user } = useAuth();
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Edit/Delete States
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const handleStartEdit = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditError("");
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Voulez-vous vraiment supprimer votre avis ?")) return;
    try {
      const response = await aiToolApi.deleteReview({ review_id: reviewId });
      if (response && (response.success || response.status === "success")) {
        window.location.reload();
      } else {
        alert(response.error || "Une erreur est survenue lors de la suppression.");
      }
    } catch (err) {
      alert("Impossible de supprimer l'avis.");
    }
  };

  const handleSaveEdit = async (e, reviewId) => {
    e.preventDefault();
    if (!editComment.trim()) {
      setEditError("Le commentaire ne peut pas être vide.");
      return;
    }
    setEditSubmitting(true);
    setEditError("");
    try {
      const response = await aiToolApi.updateReview({
        review_id: reviewId,
        rating: editRating,
        comment: editComment.trim()
      });
      if (response && (response.success || response.status === "success")) {
        setEditingReviewId(null);
        window.location.reload();
      } else {
        setEditError(response.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setEditError("Impossible de modifier l'avis.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Veuillez rédiger un commentaire avant de valider.");
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await aiToolApi.addReview(tool.id, {
        rating,
        comment: comment.trim()
      });

      if (response && (response.success || response.status === "success")) {
        setSuccess(true);
        setComment("");
        setRating(5);
        // Reload after 1.5 seconds to display the new review and updated rating
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errMsg = response.error || response.message || "Une erreur est survenue.";
        if (response.status === 403 || errMsg.includes("suspended") || errMsg.includes("banned")) {
          setError("Votre compte a été suspendu par un administrateur. Vous ne pouvez plus publier d'avis.");
        } else if (response.status === 409 || response.error?.includes("already reviewed") || errMsg.includes("already reviewed")) {
          setError("Vous avez déjà soumis un avis pour cet outil.");
        } else {
          setError(errMsg);
        }
      }
    } catch (err) {
      setError("Impossible d'enregistrer votre avis. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = {
    1: "Médiocre",
    2: "Passable",
    3: "Bon",
    4: "Très bon",
    5: "Excellent !"
  };

  return (
    <div style={{ marginTop: '64px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '48px' }}>
      <style>{`
        .review-form-panel {
          padding: 24px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .review-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .review-textarea-custom {
          width: 100%;
          min-height: 110px;
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--on-surface, #ffffff);
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
          resize: vertical;
          transition: all 0.2s ease;
        }

        .review-textarea-custom:focus {
          border-color: var(--primary, #00dbe9);
          background: rgba(255, 255, 255, 0.05);
          outline: none;
          box-shadow: 0 0 12px rgba(0, 219, 233, 0.15);
        }

        .review-submit-btn-premium {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #00dbe9, #ebb2ff);
          color: #0b0b0f;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 219, 233, 0.2);
        }

        .review-submit-btn-premium:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 219, 233, 0.35);
          background: linear-gradient(135deg, #00f0ff, #f3c2ff);
        }

        .review-submit-btn-premium:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-invite-banner {
          padding: 28px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(0, 219, 233, 0.03), rgba(235, 178, 255, 0.03));
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          text-align: center;
          margin-bottom: 32px;
        }

        .login-invite-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--on-surface, #ffffff);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .login-invite-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary, #00dbe9);
          color: var(--primary, #00dbe9);
          transform: translateY(-1px);
        }

        .review-message-banner {
          padding: 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
        }

        .review-message-banner.error {
          background: rgba(255, 74, 118, 0.08);
          color: #ff4a76;
          border: 1px solid rgba(255, 74, 118, 0.15);
        }

        .review-message-banner.success {
          background: rgba(69, 207, 123, 0.08);
          color: #45cf7b;
          border: 1px solid rgba(69, 207, 123, 0.15);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

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
          {/* Review Submission Form or Login Prompt */}
          {user ? (
            <form onSubmit={handleSubmit} className="review-form-panel">
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Laisser un avis</h4>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--outline)" }}>Partagez votre expérience d'utilisation de cet outil d'IA</p>
              </div>

              {/* Star selector */}
              <div className="review-input-group">
                <span style={{ fontSize: "14px", color: "var(--outline)", fontWeight: "500" }}>Votre note</span>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <span
                          key={star}
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "28px",
                            cursor: "pointer",
                            color: isActive ? "#FFAD33" : "rgba(255, 255, 255, 0.15)",
                            textShadow: isActive ? "0 0 10px rgba(255, 173, 51, 0.4)" : "none",
                            transition: "all 0.15s ease",
                            fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400"
                          }}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          star
                        </span>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#FFAD33", minWidth: "80px" }}>
                    {starLabels[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Comment text box */}
              <div className="review-input-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "var(--outline)", fontWeight: "500" }}>Votre commentaire</span>
                  <span style={{ fontSize: "11px", color: comment.length > 450 ? "#ff4a76" : "var(--outline)" }}>
                    {comment.length} / 500
                  </span>
                </div>
                <textarea
                  className="review-textarea-custom"
                  placeholder="Qu'avez-vous particulièrement apprécié ? Quels sont les points d'amélioration ?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.substring(0, 500))}
                  required
                />
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="review-message-banner error">
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>warning</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="review-message-banner success">
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>check_circle</span>
                  <span>Votre avis a été publié avec succès !</span>
                </div>
              )}

              {/* Submit Button */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="review-submit-btn-premium"
                  disabled={submitting || !comment.trim()}
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite", fontSize: "18px" }}>sync</span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>send</span>
                      Publier mon avis
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="login-invite-banner">
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--primary)" }}>account_circle</span>
              <div>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "700" }}>Participez au débat</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--outline)" }}>Vous devez être connecté pour donner votre avis sur cet outil d'IA.</p>
              </div>
              <Link to="/login" className="login-invite-btn">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>login</span>
                Se connecter
              </Link>
            </div>
          )}

          {/* Existing comments list */}
          {tool.reviews?.length > 0 ? tool.reviews.map((review) => {
            const isOwner = user && String(user.id) === String(review.user_id);
            const isEditing = editingReviewId === review.id;

            return (
              <div key={review.id} className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
                {isEditing ? (
                  <form onSubmit={(e) => handleSaveEdit(e, review.id)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>Modifier votre avis</h4>
                    </div>

                    {/* Star selector */}
                    <div className="review-input-group">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isActive = editRating >= star;
                            return (
                              <span
                                key={star}
                                className="material-symbols-outlined"
                                style={{
                                  fontSize: "24px",
                                  cursor: "pointer",
                                  color: isActive ? "#FFAD33" : "rgba(255, 255, 255, 0.15)",
                                  textShadow: isActive ? "0 0 10px rgba(255, 173, 51, 0.4)" : "none",
                                  transition: "all 0.15s ease",
                                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400"
                                }}
                                onClick={() => setEditRating(star)}
                              >
                                star
                              </span>
                            );
                          })}
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#FFAD33" }}>
                          {starLabels[editRating]}
                        </span>
                      </div>
                    </div>

                    {/* Comment text box */}
                    <div className="review-input-group">
                      <textarea
                        className="review-textarea-custom"
                        style={{ minHeight: '80px' }}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value.substring(0, 500))}
                        required
                      />
                    </div>

                    {editError && (
                      <div className="review-message-banner error" style={{ padding: '10px 14px', borderRadius: '12px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>warning</span>
                        <span style={{ fontSize: '13px' }}>{editError}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => setEditingReviewId(null)}
                        style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--on-surface)', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={editSubmitting}
                        style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--primary)', border: 'none', color: '#0b0b0f', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {editSubmitting && <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite", fontSize: "16px" }}>sync</span>}
                        Enregistrer
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
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
                    {isOwner && (
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                        <button 
                          onClick={() => handleStartEdit(review)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteReview(review.id)}
                          style={{ background: 'none', border: 'none', color: '#ff4a76', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                          Supprimer
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          }) : (
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
