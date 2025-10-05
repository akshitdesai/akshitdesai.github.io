
import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import Gallery from 'react-photo-gallery';
import './PhotoGallery.css';

interface PhotoGalleryProps {
  theme: 'light' | 'dark';
  location?: string;
  imagesUrl?: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ theme, location, imagesUrl }) => {
  const [imageLinks, setImageLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastFetchedUrl = useRef<string | undefined>(undefined);
  // Helper to check if query param uh=true is present
  const shouldShowHidden = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('uh') === 'true';
  }, []);

  useEffect(() => {
    if (!imagesUrl) {
      setImageLinks([]);
      lastFetchedUrl.current = undefined;
      return;
    }
    if (lastFetchedUrl.current === imagesUrl) {
      // Prevent refetch if URL hasn't changed
      return;
    }
    lastFetchedUrl.current = imagesUrl;
    setImageLinks([]);
    setLoading(true);
    setError(null);

    // Convert GitHub tree URL to API contents URL
    // Example tree URL: https://github.com/akshitdesai/photos/tree/gh-pages/photos/Banff%2C%20AB%20...%5B12023-06%5D
    // API: https://api.github.com/repos/akshitdesai/photos/contents/photos/Banff%2C%20AB%20...%5B12023-06%5D?ref=gh-pages
    const treeMatch = imagesUrl.match(/github.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/);
    if (!treeMatch) {
      setError('Invalid GitHub URL');
      setLoading(false);
      return;
    }
    const owner = treeMatch[1];
    const repo = treeMatch[2];
    const branch = treeMatch[3];
    const folder = treeMatch[4];
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folder}?ref=${branch}`;

    axios.get(apiUrl)
      .then(res => {
        if (Array.isArray(res.data)) {
          let images = res.data.filter((item: any) => item.type === 'file' && /\.(jpg|jpeg|png|gif)$/i.test(item.name));
          if (!shouldShowHidden) {
            images = images.filter((item: any) => !item.name.includes('.hide'));
          }
          setImageLinks(images.map((img: any) => img.download_url));
        } else {
          setImageLinks([]);
        }
        setLoading(false);
      })
      .catch(err => {
        setImageLinks([]);
        setError('This location is still compiling memories...');
        setLoading(false);
      });
  }, [imagesUrl, shouldShowHidden]);


  // Prepare images for react-photo-gallery with correct aspect ratio
  const [photos, setPhotos] = useState<{ src: string; width: number; height: number; loading: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (imageLinks.length === 0) {
      setPhotos([]);
      return;
    }
    Promise.all(
      imageLinks.map(
        (url) =>
          new Promise<{ src: string; width: number; height: number; loading: string }>((resolve) => {
            const img = new window.Image();
            img.onload = function () {
              resolve({ src: url, width: img.naturalWidth, height: img.naturalHeight, loading: 'lazy' });
            };
            img.onerror = function () {
              // fallback to 4:3 if cannot load
              resolve({ src: url, width: 4, height: 3, loading: 'lazy' });
            };
            img.src = url;
          })
      )
    ).then((results) => {
      if (isMounted) setPhotos(results);
    });
    return () => {
      isMounted = false;
    };
  }, [imageLinks]);

  // Responsive columns: 3 for desktop, 1 for mobile
  const getColumns = (containerWidth: number) => {
    if (containerWidth < 600) return 1;
    if (containerWidth < 900) return 3;
    return 3;
  };

  return (
    <div className={`photo-gallery-container ${theme}`} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="photo-gallery-content">
        {location && imagesUrl ? (
          <>
            {loading && (
              <div className="photo-gallery-loading">
                <span className="photo-gallery-spinner" />
                <span className="photo-gallery-loading-text"><span className="photo-gallery-dots"></span></span>
              </div>
            )}
            {error && (
              <div style={{ textAlign: 'center', margin: '2em 0' }}>
                {error.split('compiling memories...').length > 1 ? (
                  <span>
                    This location is still{' '}
                    <span className="secondary-color">compiling memories.</span>
                  </span>
                ) : (
                  <span>{error}</span>
                )}
              </div>
            )}
            {photos.length > 0 ? (
              <Gallery
                photos={photos}
                direction="column"
                margin={8}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PhotoGallery;