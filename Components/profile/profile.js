'use client';
import React from 'react';

export default function InitialsAvatar({ name = 'User', size = 60 }) {
  // Get initials safely
  const getInitials = (fullName) => {
    if (!fullName) return 'U'; // default initial
    const words = fullName.trim().split(' ').filter(Boolean);
    if (words.length === 0) return 'U';
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: `${size / 2.2}px`,
        userSelect: 'none',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      }}
    >
      {initials}
    </div>
  );
}
