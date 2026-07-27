"use client";

import { getCanonicalPersonHref } from "../utils/routeAdapters";

export default function PersonCard({ person }: { person: any }) {
  const href = getCanonicalPersonHref(person);
  const content = (
    <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105">
      <div className="max-h-96 overflow-hidden">
        <img
          src={person.avatar}
          alt={person.name}
          width={800}
          height={560}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">@{person.name}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              person.type === "real"
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {person.type === "real" ? "真实人物" : "虚拟人物"}
          </span>
        </div>
        <p className="text-gray-600 mb-2">{person.title}</p>
        <p className="text-gray-700 text-sm line-clamp-2">{person.bio}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">{person.storyCount} 个故事</span>
          <span className="flex items-center text-sm text-yellow-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {person.popularity}
          </span>
        </div>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return <a href={href} className="block">{content}</a>;
}
