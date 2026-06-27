import React from 'react';
import type { StackPageRuntimeApi } from './types';

export interface AuthorWork {
  id: string;
  title: string;
  publishedAt?: string;
  format?: string;
}

export interface AuthorProfileProps {
  name?: string;
  image?: string;
  bio?: string;
  nationality?: string;
  born?: string;
  website?: string;
  works?: AuthorWork[];
  selectedContentIdKey?: string;
  __stackpage?: StackPageRuntimeApi;
}

const AuthorProfile: React.FC<AuthorProfileProps> = ({
  name,
  image,
  bio,
  nationality,
  born,
  website,
  works = [],
  __stackpage,
}) => {
  const handleSelect = (work: AuthorWork) => {
    __stackpage?.emit('select', { id: work.id, title: work.title, contentType: 'publication', source: 'author-profile' });
  };

  return (
    <div className="rounded-lg bg-white p-3 sm:p-4 md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        {image && (
          <div className="shrink-0">
            <img
              src={image}
              alt={name || 'Author'}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-purple-100 sm:h-28 sm:w-28"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {name && <h3 className="text-lg font-bold text-gray-900 md:text-xl">{name}</h3>}
          <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
            {nationality && <span>{nationality}</span>}
            {born && <span>Born: {born}</span>}
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                Website
              </a>
            )}
          </div>
          {bio && <p className="mt-3 text-sm leading-relaxed text-gray-600">{bio}</p>}
        </div>
      </div>

      {works.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Works ({works.length})</h4>
          <div className="space-y-1">
            {works.map(work => (
              <div
                key={work.id}
                onClick={() => handleSelect(work)}
                className="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 hover:bg-purple-50"
              >
                <span className="text-sm font-medium text-gray-800">{work.title}</span>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {work.format && <span>{work.format}</span>}
                  {work.publishedAt && <span>{work.publishedAt}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!name && !bio && works.length === 0 && (
        <div className="flex flex-col items-center py-10 text-gray-400">
          <svg className="mb-2 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-sm">Author information not available.</p>
        </div>
      )}
    </div>
  );
};

export default AuthorProfile;
