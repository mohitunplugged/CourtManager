import React, { useState, useEffect } from 'react';

export default function Avatar({ src, name, className, size = "md" }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
      setImgSrc(src);
      setError(false);
  }, [src]);

  const handleError = () => {
      // Fallback to a high-quality 3D-style generated avatar if local file missing
      const seed = name.replace(' ', '');
      // 'notionists' has a nice sketched/3D look, or 'fun-emoji'
      const fallback = `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
      setImgSrc(fallback);
      setError(true);
  };

  return (
    <img 
      src={imgSrc} 
      alt={name} 
      onError={handleError}
      className={`${className} object-cover bg-slate-800 border-slate-700`}
    />
  );
}
