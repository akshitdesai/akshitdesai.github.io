import React from 'react';
import './PhotoGallery.css';

interface PhotoGalleryProps {
  theme: 'light' | 'dark';
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ theme }) => {
  return (
    <div className={`photo-gallery-container ${theme}`}>
      <div className="photo-gallery-content">
        <p className="coming-soon-text">Coming soon</p>
      </div>
    </div>
  );
};

export default PhotoGallery;