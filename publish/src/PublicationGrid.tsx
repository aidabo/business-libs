import React from 'react';
import PublicationCard from './PublicationCard';
import type { Publication } from './types';

export interface PublicationGridProps {
  title?: string;
  publications: Publication[];
  columns?: 1 | 2 | 3;
}

const PublicationGrid: React.FC<PublicationGridProps> = ({
  title,
  publications,
  columns = 2,
}) => {
  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <section className="py-8">
      {title && <h2 className="mb-6 text-2xl font-bold text-gray-900">{title}</h2>}
      {publications.length === 0 && (
        <div className="py-12 text-center text-gray-400">No publications available.</div>
      )}
      <div className={`grid gap-3 md:gap-6 ${gridCols[columns]}`}>
        {publications.map((pub) => (
          <PublicationCard
            key={pub.id}
            title={pub.title}
            coverImage={pub.coverImage}
            author={pub.author}
            publisher={pub.publisher}
            format={pub.format}
            price={pub.price}
            description={pub.description}
          />
        ))}
      </div>
    </section>
  );
};

export default PublicationGrid;
