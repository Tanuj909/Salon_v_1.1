import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, Crown, MapPin, Calendar, Star, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const ProfileHeader = ({ user }) => {
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only extract data if it exists, no fallbacks
  const memberSince = user?.memberSince ? new Date(user.memberSince).getFullYear().toString() : null;
  const location = user?.location;
  const totalReviews = user?.stats?.totalReviews;
  const membershipLevel = user?.membershipLevel;
  const userId = user?.user?.id;
  const fullName = user?.user?.fullName;
  const profileImageUrl = user?.user?.profileImageUrl;
  
  const isVerified = user?.user?.verificationStatus === 'VERIFIED';
  const isEmailVerified = user?.user?.isEmailVerified;

  const membershipConfig = {
    BRONZE: {
      gradient: 'linear-gradient(135deg, #92400e, #b45309, #d97706)',
      label: 'Bronze',
      glow: 'rgba(180, 83, 9, 0.4)',
    },
    SILVER: {
      gradient: 'linear-gradient(135deg, #6b7280, #9ca3af, #d1d5db)',
      label: 'Silver',
      glow: 'rgba(156, 163, 175, 0.4)',
    },
    GOLD: {
      gradient: 'linear-gradient(135deg, #a16207, #ca8a04, #eab308)',
      label: 'Gold',
      glow: 'rgba(234, 179, 8, 0.5)',
    },
    PLATINUM: {
      gradient: 'linear-gradient(135deg, #334155, #64748b, #cbd5e1)',
      label: 'Platinum',
      glow: 'rgba(148, 163, 184, 0.4)',
    },
  };

  const tier = membershipLevel ? membershipConfig[membershipLevel] : null;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
 
    .ph-wrapper * { box-sizing: border-box; margin: 0; padding: 0; }

    .ph-wrapper {
      font-family: 'DM Sans', sans-serif;
      --accent: var(--profile-header-accent);
      --accent-light: var(--profile-header-accent-light);
      --accent-dark: var(--profile-header-accent-dark);
      --accent-glow: var(--profile-header-accent-glow);
      --text-main: var(--profile-header-text-main);
      --text-muted: var(--profile-header-text-muted);
      --bg-main: var(--profile-header-bg-main);
      --bg-soft: var(--profile-header-bg-soft);
      --bg-light: var(--profile-header-bg-light);
      --border-light: var(--profile-header-border-light);
    }

    /* Banner */
    .ph-banner {
      position: relative;
      height: 300px;
      overflow: hidden;
    }

    .ph-banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.05);
      transition: transform 8s ease;
    }

    .ph-banner-img.loaded {
      transform: scale(1);
    }

    .ph-banner-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.05) 0%,
        rgba(0,0,0,0.15) 40%,
        rgba(0,0,0,0.72) 100%
      );
    }

    .ph-banner-line {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent-light) 50%, var(--accent) 70%, transparent 100%);
    }

    /* Card */
    .ph-card {
      position: relative;
      margin: 0 24px;
      margin-top: -88px;
      background: var(--bg-main);
      border-radius: 20px;
      box-shadow:
        0 0 0 1px var(--border-light),
        0 4px 6px rgba(0,0,0,0.04),
        0 24px 48px rgba(0,0,0,0.10);
      padding: 32px;
      z-index: 10;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s;
    }

    .ph-card.loaded {
      opacity: 1;
      transform: translateY(0);
    }

    /* Layout */
    .ph-layout {
      display: flex;
      align-items: flex-end;
      gap: 28px;
      flex-wrap: wrap;
    }

    /* Avatar */
    .ph-avatar-wrap {
      position: relative;
      margin-top: -80px;
      flex-shrink: 0;
    }

    .ph-avatar-ring {
      padding: 3px;
      border-radius: 18px;
      background: linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-dark));
      box-shadow: 0 0 24px var(--accent-glow);
    }

    .ph-avatar {
      width: 120px;
      height: 120px;
      border-radius: 15px;
      object-fit: cover;
      display: block;
      background: var(--bg-soft);
      border: 3px solid var(--bg-main);
    }

    .ph-avatar-fallback {
      width: 120px;
      height: 120px;
      border-radius: 15px;
      background: linear-gradient(135deg, var(--bg-light), var(--bg-soft), var(--bg-main));
      border: 3px solid var(--bg-main);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ph-avatar-fallback svg {
      width: 60px;
      height: 60px;
      color: var(--text-muted);
      opacity: 0.7;
    }

    .ph-badge-verified {
      position: absolute;
      bottom: -8px;
      right: -8px;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--bg-main);
      box-shadow: 0 2px 8px var(--accent-glow);
    }

    /* Info */
    .ph-info {
      flex: 1;
      min-width: 200px;
    }

    .ph-name-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .ph-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.2rem;
      font-weight: 600;
      color: var(--text-main);
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .ph-email-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      background: var(--bg-success-light);
      border: 1px solid var(--border-success);
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-success);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .ph-tier-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .ph-tier-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      position: relative;
      overflow: hidden;
    }

    .ph-tier-badge::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
    }

    .ph-id-chip {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 400;
      letter-spacing: 0.03em;
    }

    .ph-meta {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .ph-meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.82rem;
      color: var(--text-muted);
      font-weight: 400;
    }

    .ph-meta-icon {
      color: var(--accent);
    }

    /* Divider */
    .ph-divider {
      width: 1px;
      height: 16px;
      background: var(--border-light);
    }

    /* Responsive */
    @media (max-width: 600px) {
      .ph-card { margin: 0 8px; margin-top: -60px; padding: 20px 16px; border-radius: 16px; }
      .ph-banner { height: 200px; }
      .ph-name { font-size: 1.5rem; }
      .ph-avatar, .ph-avatar-fallback { width: 80px; height: 80px; }
      .ph-avatar-fallback svg { width: 40px; height: 40px; }
      .ph-avatar-wrap { margin-top: -50px; }
      .ph-layout { gap: 12px; }
      .ph-meta { gap: 10px 15px; }
      .ph-meta-item { font-size: 0.75rem; }
      .ph-divider { display: none; }
    }
  `;

  // Don't render anything if no user data
  if (!user) return null;

  return (
    <div className="ph-wrapper">
      <style>{styles}</style>

      {/* Banner */}
      <div className="ph-banner">
        <img
          className={`ph-banner-img ${loaded ? 'loaded' : ''}`}
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop"
          alt={t("profile.profile_banner_alt")}
        />
        <div className="ph-banner-overlay" />
        <div className="ph-banner-line" />
      </div>

      {/* Card */}
      <div className={`ph-card ${loaded ? 'loaded' : ''}`}>
        <div className="ph-layout">

          {/* Avatar - with fallback */}
          <div className="ph-avatar-wrap">
            <div className="ph-avatar-ring">
              {profileImageUrl && !imageError ? (
                <img
                  className="ph-avatar"
                  src={profileImageUrl}
                  alt={fullName || t("profile.profile_alt")}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="ph-avatar-fallback">
                  <User />
                </div>
              )}
            </div>
            {isVerified && (
              <div className="ph-badge-verified">
                <ShieldCheck size={14} color="white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="ph-info">
            {/* Name - only show if fullName exists */}
            {fullName && (
              <div className="ph-name-row">
                <span className="ph-name">{fullName}</span>
                {isEmailVerified && (
                  <span className="ph-email-chip">
                    <CheckCircle size={11} />
                    {t("profile.verified")}
                  </span>
                )}
              </div>
            )}

            {/* Tier, Role and ID */}
            <div className="ph-tier-row">
              {tier ? (
                <span
                  className="ph-tier-badge"
                  style={{ background: tier.gradient, boxShadow: `0 2px 12px ${tier.glow}` }}
                >
                  <Crown size={12} />
                  {t(`profile.tiers.${tier.label.toLowerCase()}`)} {t("profile.member_suffix")}
                </span>
              ) : (
                <span className="ph-tier-badge" style={{ background: 'var(--accent)', boxShadow: `0 2px 12px var(--accent-glow)` }}>
                  <User size={12} />
                  {user?.user?.role || t("profile.user_role")}
                </span>
              )}
              {userId && (
                <span className="ph-id-chip">ID #{userId}</span>
              )}
            </div>


            {/* Meta info - only show if at least one item exists */}
            {(memberSince || location || totalReviews) && (
              <div className="ph-meta">
                {memberSince && (
                  <div className="ph-meta-item">
                    <Calendar size={13} className="ph-meta-icon" />
                    {t("profile.since")} {memberSince}
                  </div>
                )}
                {memberSince && (location || totalReviews) && <div className="ph-divider" />}
                
                {location && (
                  <div className="ph-meta-item">
                    <MapPin size={13} className="ph-meta-icon" />
                    {location}
                  </div>
                )}
                {location && totalReviews && <div className="ph-divider" />}
                
                {totalReviews && (
                  <div className="ph-meta-item">
                    <Star size={13} className="ph-meta-icon" />
                    {totalReviews} {totalReviews === 1 ? t("profile.review") : t("profile.reviews_plural")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;