import React from 'react';
import { useAuth } from '../context/AuthContext';
import FarmerDashboardMain from './FarmerDashboardMain';
import FarmerCollaborationSection from '../components/FarmerCollaborationSection';
import { Link } from 'react-router-dom';

/**
 * FarmerCommunity
 * When accessed by a logged-in farmer, renders the full redesigned Farmer Collaboration
 * dashboard complete with the left sidebar, topbar, and community knowledge hub.
 * For guests/public users, provides a clean framed view with sign-in prompt.
 */
export default function FarmerCommunity() {
  const { user } = useAuth();

  if (user) {
    return <FarmerDashboardMain initialSection="collaboration" />;
  }

  return (
    <div className="container py-4">
      <div className="alert alert-success d-flex justify-content-between align-items-center mb-4" style={{ borderRadius: 12 }}>
        <span>🌱 Welcome to AgriConnect Farmer Collaboration. Please sign in to post questions and share experiences with fellow farmers.</span>
        <Link to="/login" className="btn btn-sm btn-success">Sign In</Link>
      </div>
      <FarmerCollaborationSection />
    </div>
  );
}
