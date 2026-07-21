import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import './Profile.css';

const Profile = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim()
      });
      // Force reload to reflect changes
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="profile-container">
      <button 
        className="profile-avatar-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="Account Details"
      >
        {user?.photoURL && !imgError ? (
          <img 
            src={user.photoURL} 
            alt="Profile" 
            className="profile-img" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="profile-initials">{getInitials()}</div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="profile-backdrop" onClick={() => setIsOpen(false)}></div>
          <div className="profile-dropdown">
            {!isEditing ? (
              <div className="profile-info">
                <div className="profile-header">
                  {user?.photoURL && !imgError ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="profile-img-large" 
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="profile-initials-large">{getInitials()}</div>
                  )}
                </div>
              <div className="profile-details">
                <h3>{user?.displayName || 'No Name Set'}</h3>
                <p>{user?.email}</p>
              </div>
              <button 
                className="edit-profile-btn" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="profile-edit-form">
              <h4>Edit Profile</h4>
              {error && <div className="profile-error">{error}</div>}
              
              <div className="form-group">
                <label>Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Photo URL (Optional)</label>
                <input 
                  type="url" 
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="profile-form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default Profile;
