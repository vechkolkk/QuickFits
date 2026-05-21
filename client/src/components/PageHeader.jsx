import React from 'react';

export function PageHeader({ title, eyebrow, children }) {
  return (
    <header className="page-header">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  );
}
