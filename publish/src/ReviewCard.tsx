import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface ReviewCardProps {
  title?: string;
  reviewer?: string;
  rating?: number;
  excerpt?: string;
  fullReview?: string;
  date?: string;
  source?: string;
  bookTitle?: string;
  bookImage?: string;
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <span key={star} className={`text-lg ${filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-gray-200'}`}>
            {filled ? '★' : half ? '★' : '☆'}
          </span>
        );
      })}
      <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
};

const ReviewCard: React.FC<ReviewCardProps> = ({
  title,
  reviewer,
  rating = 0,
  excerpt,
  fullReview,
  date,
  source,
  bookTitle,
  bookImage,
  __stackpage,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleClick = () => {
    __stackpage?.emit('select', { id: title || '', title, contentType: 'publication', source: 'review-card' });
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-lg border border-purple-100 bg-white p-3 transition-shadow hover:shadow-sm sm:p-4"
    >
      <div className="flex items-start gap-3">
        {bookImage && (
          <img src={bookImage} alt={bookTitle || ''} className="h-14 w-10 shrink-0 rounded object-cover sm:h-16 sm:w-12" />
        )}
        <div className="min-w-0 flex-1">
          {bookTitle && (
            <p className="text-xs font-medium text-purple-600">{bookTitle}</p>
          )}
          {title && <h4 className="text-sm font-bold text-gray-900">{title}</h4>}
          <div className="mt-1">
            <StarRating rating={rating} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            {reviewer && <span>by {reviewer}</span>}
            {date && <span>{date}</span>}
            {source && <span className="rounded bg-gray-100 px-1.5 py-0.5">{source}</span>}
          </div>
          {excerpt && (
            <p className={`mt-2 text-sm leading-relaxed text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
              {excerpt}
            </p>
          )}
          {fullReview && (
            <button
              onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
              className="mt-1 text-xs font-medium text-purple-600 hover:underline"
            >
              {expanded ? 'Show less' : 'Read full review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
