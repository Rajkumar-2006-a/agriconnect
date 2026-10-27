import React, { useState, useEffect, useMemo } from 'react';
import api, { imageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LeafIcon,
  UsersIcon,
  PlusIcon,
  SearchIcon,
  CloseIcon,
  UploadCloudIcon,
  CheckIcon,
  StethoscopeIcon
} from './FarmerIcons';

const TOPIC_CONFIG = {
  disease: {
    label: 'Plant Disease Help',
    icon: '🩺',
    badgeClass: 'topic-badge-disease',
    color: '#F87171',
    bg: 'rgba(239, 68, 68, 0.16)'
  },
  experience: {
    label: 'Farmer Experience',
    icon: '🌾',
    badgeClass: 'topic-badge-experience',
    color: '#00DC82',
    bg: 'rgba(0, 220, 130, 0.16)'
  },
  tip: {
    label: 'Growing Tip',
    icon: '💡',
    badgeClass: 'topic-badge-tip',
    color: '#FBBF24',
    bg: 'rgba(245, 158, 11, 0.16)'
  },
  question: {
    label: 'Farming Question',
    icon: '❓',
    badgeClass: 'topic-badge-question',
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.16)'
  }
};

const emptyPost = {
  title: '',
  content: '',
  topic: 'disease',
  image: null,
  imagePreview: null
};

export default function FarmerCollaborationSection({ onNavigateSection }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [postForm, setPostForm] = useState(emptyPost);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});
  const [activeTopicFilter, setActiveTopicFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [notice, setNotice] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/posts');
      const postList = res.data || [];
      setPosts(postList);

      // Load comments for each post in parallel
      const commentEntries = await Promise.all(
        postList.map(async (item) => {
          try {
            const commentRes = await api.get(`/posts/${item._id}/comments`);
            return [item._id, commentRes.data || []];
          } catch {
            return [item._id, []];
          }
        })
      );
      setComments(Object.fromEntries(commentEntries));
    } catch (err) {
      setNotice('Unable to load farmer community discussions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostForm({
        ...postForm,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleRemoveImage = () => {
    setPostForm({
      ...postForm,
      image: null,
      imagePreview: null
    });
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.content.trim()) return;

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', postForm.title.trim());
      data.append('content', postForm.content.trim());
      data.append('topic', postForm.topic);
      if (postForm.image) {
        data.append('image', postForm.image);
      }

      await api.post('/posts', data);
      setPostForm(emptyPost);
      setShowCreateCard(false);
      setNotice('Your discussion has been shared with fellow farmers!');
      await loadData();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to publish discussion.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (postId) => {
    const text = replyText[postId]?.trim();
    if (!text) return;

    try {
      setSubmittingReply((prev) => ({ ...prev, [postId]: true }));
      await api.post(`/posts/${postId}/comments`, { content: text });
      setReplyText((prev) => ({ ...prev, [postId]: '' }));

      // Reload comments for this specific post
      const commentRes = await api.get(`/posts/${postId}/comments`);
      setComments((prev) => ({ ...prev, [postId]: commentRes.data || [] }));
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to send reply.');
    } finally {
      setSubmittingReply((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleExpand = (postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Filtered discussions
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesTopic = activeTopicFilter === 'all' || p.topic === activeTopicFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.author?.name?.toLowerCase().includes(q);
      return matchesTopic && matchesSearch;
    });
  }, [posts, activeTopicFilter, searchQuery]);

  // Statistics
  const diseaseCount = posts.filter((p) => p.topic === 'disease').length;
  const tipCount = posts.filter((p) => p.topic === 'tip' || p.topic === 'experience').length;

  return (
    <div className="farmer-collab-wrapper">
      {notice && (
        <div className="alert alert-success alert-dismissible mb-4">
          <span>{notice}</span>
          <button type="button" className="btn-close" onClick={() => setNotice('')} />
        </div>
      )}

      {/* 1. Header Banner Row */}
      <div className="farmer-content-header-row collab-header-banner">
        <div className="header-left-title-box">
          <span className="header-leaf-emblem">
            <UsersIcon size={26} />
          </span>
          <div>
            <h1>Farmer Collaboration & Knowledge Hub</h1>
            <p>Exchange plant health symptoms, organic treatments, and real farming solutions</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary-green"
          onClick={() => setShowCreateCard(!showCreateCard)}
        >
          <PlusIcon size={16} />
          <span>{showCreateCard ? 'Close Editor' : 'Ask Farmers / Share Tip'}</span>
        </button>
      </div>

      {/* 2. Top Stats Overview Row */}
      <div className="marketplace-stat-cards mb-4">
        <div className="marketplace-stat-card">
          <div className="stat-card-left">
            <div className="stat-icon-circle stat-icon-green">
              <UsersIcon size={22} />
            </div>
            <div className="stat-card-text">
              <span className="stat-card-title">Community Discussions</span>
              <span className="stat-card-value">{posts.length}</span>
            </div>
          </div>
        </div>

        <div className="marketplace-stat-card">
          <div className="stat-card-left">
            <div className="stat-icon-circle stat-icon-orange">
              <span style={{ fontSize: 20 }}>🩺</span>
            </div>
            <div className="stat-card-text">
              <span className="stat-card-title">Plant Disease Help</span>
              <span className="stat-card-value">{diseaseCount}</span>
            </div>
          </div>
        </div>

        <div className="marketplace-stat-card">
          <div className="stat-card-left">
            <div className="stat-icon-circle stat-icon-blue">
              <span style={{ fontSize: 20 }}>💡</span>
            </div>
            <div className="stat-card-text">
              <span className="stat-card-title">Proven Tips & Solutions</span>
              <span className="stat-card-value">{tipCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. New Discussion Creation Card (Expandable) */}
      {showCreateCard && (
        <form className="collab-create-card mb-4" onSubmit={handlePublish}>
          <div className="collab-create-head">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: 20 }}>✍️</span>
              <h2 className="collab-create-title">Start a Discussion or Ask for Crop Help</h2>
            </div>
            <button
              type="button"
              className="btn-icon-clear"
              onClick={() => setShowCreateCard(false)}
            >
              <CloseIcon size={18} />
            </button>
          </div>

          {/* Topic Selector Chips */}
          <div className="mb-3">
            <label className="collab-form-label">Category</label>
            <div className="collab-topic-chips">
              {Object.entries(TOPIC_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  className={`collab-topic-chip ${postForm.topic === key ? 'active' : ''}`}
                  onClick={() => setPostForm({ ...postForm, topic: key })}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12">
              <label className="collab-form-label">Discussion Title</label>
              <input
                className="search-filter-input w-100"
                required
                placeholder={
                  postForm.topic === 'disease'
                    ? 'e.g., Yellowing leaves & black spots on tomato plant after rains'
                    : postForm.topic === 'tip'
                    ? 'e.g., Simple garlic & neem spray recipe that cured aphid infestations'
                    : 'e.g., How much water is optimal for drip irrigation in red soil?'
                }
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label className="collab-form-label">
                Describe details (crop, symptoms, soil type, or treatment experience)
              </label>
              <textarea
                className="search-filter-input w-100"
                required
                rows={4}
                style={{ resize: 'vertical' }}
                placeholder="Mention crop stage, location, symptoms observed, weather conditions, or any fertilizer already tried..."
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              />
            </div>

            <div className="col-md-7">
              <label className="collab-form-label">Plant / Field Photo (Optional)</label>
              <div className="collab-upload-box">
                <input
                  type="file"
                  id="collab-file-input"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <label htmlFor="collab-file-input" className="collab-upload-label">
                  <UploadCloudIcon size={20} className="text-success" />
                  <span>Choose Photo of Affected Crop or Technique</span>
                </label>
                {postForm.image && (
                  <div className="collab-upload-preview-wrap">
                    <img
                      src={postForm.imagePreview}
                      alt="Preview"
                      className="collab-upload-preview-thumb"
                    />
                    <button
                      type="button"
                      className="collab-upload-remove-btn"
                      onClick={handleRemoveImage}
                      title="Remove image"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-5 d-flex align-items-end justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowCreateCard(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary-green"
                disabled={submitting}
              >
                {submitting ? 'Sharing...' : 'Share with Farmers'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 4. Filter & Search Controls */}
      <div className="marketplace-filter-row mb-4">
        {/* Search */}
        <div className="search-filter-box" style={{ maxWidth: 360 }}>
          <SearchIcon size={16} className="search-filter-icon" />
          <input
            type="text"
            className="search-filter-input"
            placeholder="Search discussions, symptoms, crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-filter-clear"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="collab-filter-pills">
          <button
            type="button"
            className={`collab-pill-btn ${activeTopicFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTopicFilter('all')}
          >
            All Discussions ({posts.length})
          </button>
          {Object.entries(TOPIC_CONFIG).map(([key, cfg]) => {
            const count = posts.filter((p) => p.topic === key).length;
            return (
              <button
                key={key}
                type="button"
                className={`collab-pill-btn ${activeTopicFilter === key ? 'active' : ''}`}
                onClick={() => setActiveTopicFilter(key)}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
                <span className="collab-pill-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Main Two-Column Layout */}
      <div className="marketplace-content-grid">
        {/* Left Column: Post Feed */}
        <div className="marketplace-products-column">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
              <p className="text-muted mt-2">Loading farmer collaboration discussions...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="collab-feed-list">
              {filteredPosts.map((item, idx) => {
                const topicCfg = TOPIC_CONFIG[item.topic] || TOPIC_CONFIG.question;
                const postComments = comments[item._id] || [];
                const isExpanded = expandedComments[item._id] || false;
                const authorName = item.author?.name || 'Farmer';
                const createdDate = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'Recent';

                return (
                  <article
                    key={item._id}
                    className="collab-post-card"
                    style={{ animationDelay: `${0.05 * idx}s` }}
                  >
                    {/* Header: Author + Badge + Date */}
                    <div className="collab-post-top">
                      <div className="collab-author-wrap">
                        <div className="collab-author-avatar">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="collab-author-name">{authorName}</span>
                            <span className="collab-verified-pill">
                              <CheckIcon size={11} /> Verified {item.author?.role === 'rentalOwner' ? 'Owner' : item.author?.role === 'buyer' ? 'Buyer' : 'Farmer'}
                            </span>
                            {item.author?.location && (
                              <span className="badge" style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#1E293B', border: '1px solid #334155', color: '#CBD5E1' }}>
                                📍 {item.author.location}
                              </span>
                            )}
                          </div>
                          <span className="collab-post-date">{createdDate}</span>
                        </div>
                      </div>

                      <span
                        className="collab-topic-tag"
                        style={{
                          color: topicCfg.color,
                          backgroundColor: topicCfg.bg,
                          borderColor: topicCfg.color + '33'
                        }}
                      >
                        <span>{topicCfg.icon}</span>
                        <span>{topicCfg.label}</span>
                      </span>
                    </div>

                    {/* Title & Content */}
                    <h3 className="collab-post-title">{item.title}</h3>
                    <p className="collab-post-body">{item.content}</p>

                    {/* Image Attachment (if present) */}
                    {item.image && (
                      <div className="collab-post-image-box">
                        <img
                          src={imageUrl(item.image)}
                          alt={item.title}
                          className="collab-post-img"
                          onClick={() => setEnlargedImage(imageUrl(item.image))}
                          title="Click to zoom image"
                        />
                        <span className="collab-img-zoom-tip">🔍 Click to zoom</span>
                      </div>
                    )}

                    {/* Action Bar: Replies Counter & Toggle */}
                    <div className="collab-post-action-bar">
                      <button
                        type="button"
                        className="collab-replies-toggle-btn"
                        onClick={() => toggleExpand(item._id)}
                      >
                        <span>💬 {postComments.length} {postComments.length === 1 ? 'Reply' : 'Replies'}</span>
                        <span style={{ fontSize: 11 }}>{isExpanded ? '▲ Hide' : '▼ View / Reply'}</span>
                      </button>
                    </div>

                    {/* Comments & Discussion Thread */}
                    {isExpanded && (
                      <div className="collab-comments-thread">
                        {postComments.length > 0 ? (
                          <div className="collab-comments-list">
                            {postComments.map((c) => (
                              <div key={c._id} className="collab-comment-item">
                                <div className="collab-comment-avatar">
                                  {(c.user?.name || 'F').charAt(0).toUpperCase()}
                                </div>
                                <div className="collab-comment-content">
                                  <div className="d-flex align-items-center justify-content-between mb-1">
                                    <div className="d-flex align-items-center gap-2">
                                      <b className="collab-comment-author">
                                        {c.user?.name || 'Farmer'}
                                      </b>
                                      {c.user?.location && (
                                        <span className="badge text-bg-light border text-muted" style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
                                          📍 {c.user.location}
                                        </span>
                                      )}
                                    </div>
                                    <small className="text-muted" style={{ fontSize: 11 }}>
                                      {c.createdAt
                                        ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short'
                                          })
                                        : ''}
                                    </small>
                                  </div>
                                  <p className="collab-comment-text">{c.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="collab-empty-replies">
                            No farmer replies yet. Be the first to share your experience or treatment recommendation!
                          </p>
                        )}

                        {/* Inline Reply Input */}
                        <div className="collab-reply-input-box mt-3">
                          <input
                            type="text"
                            className="search-filter-input flex-grow-1"
                            placeholder="Write practical advice, medicine dosage, or experience..."
                            value={replyText[item._id] || ''}
                            onChange={(e) =>
                              setReplyText({ ...replyText, [item._id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSendReply(item._id);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-success px-3"
                            disabled={submittingReply[item._id] || !replyText[item._id]?.trim()}
                            onClick={() => handleSendReply(item._id)}
                          >
                            {submittingReply[item._id] ? 'Sending...' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="marketplace-empty-box">
              <div className="empty-icon-wrap">
                <UsersIcon size={26} />
              </div>
              <h3>No discussions found</h3>
              <p>
                {searchQuery || activeTopicFilter !== 'all'
                  ? 'No posts matched your current search or topic filter.'
                  : 'Be the first farmer to share a plant health question or successful treatment!'}
              </p>
              {searchQuery || activeTopicFilter !== 'all' ? (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success px-3"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTopicFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary-green"
                  style={{ margin: '0 auto' }}
                  onClick={() => setShowCreateCard(true)}
                >
                  <PlusIcon size={16} />
                  <span>Start First Discussion</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Advisory & Doctor Helpline Card */}
        <div className="marketplace-sidebar-column">
          {/* Seasonal Advisory Card */}
          <div className="quick-actions-card">
            <h3 className="quick-actions-card-title">
              <span>🌾 Seasonal Crop Advisory</span>
            </h3>
            <div className="collab-advisory-box">
              <b className="d-block text-white mb-1" style={{ fontSize: 13.5 }}>
                Tamil Nadu Monsoon & Post-Rain Advisory
              </b>
              <p className="text-light small mb-2" style={{ opacity: 0.85 }}>
                High humidity during overcast days increases leaf blight, powdery mildew, and root fungal rot across tomato, brinjal, and paddy fields.
              </p>
              <ul className="collab-advisory-list">
                <li>Spray <b>Neem Oil (5ml/L)</b> with soap nut as an organic preventive measure.</li>
                <li>Ensure trench drainage to prevent standing root waterlogging.</li>
                <li>Avoid excessive urea dosage during continuous cloudy weather.</li>
              </ul>
            </div>
          </div>

          {/* Need Urgent Doctor Card */}
          <div className="farming-promo-banner-card p-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <StethoscopeIcon size={20} className="text-info" />
              <b className="text-white" style={{ fontSize: 14 }}>Need Official Agri Doctor Help?</b>
            </div>
            <p className="small text-light mb-3" style={{ opacity: 0.85 }}>
              If your crops face severe unknown diseases or urgent pest attacks, connect directly with verified Agricultural Doctors.
            </p>
            <button
              type="button"
              className="quick-action-primary-btn"
              onClick={() => onNavigateSection?.('doctors')}
            >
              <span>Consult Agri Doctors</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="details-modal-scrim"
          onClick={() => setEnlargedImage(null)}
        >
          <div
            className="details-modal-card p-2"
            style={{ width: 650, maxWidth: '95vw', background: '#000000dd' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-end mb-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-light"
                onClick={() => setEnlargedImage(null)}
              >
                ✕ Close
              </button>
            </div>
            <img
              src={enlargedImage}
              alt="Enlarged"
              className="img-fluid rounded"
              style={{ maxHeight: '80vh', objectFit: 'contain', width: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
