import React from 'react';
import { Article } from '../../types';
import { ExternalLink, Share2 } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onCreatePost?: (article: Article) => void;
}

export function ArticleCard({ article, onCreatePost }: ArticleCardProps) {
  return (
    <div className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200">
      {article.image_url && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{article.description}</p>
        <div className="flex justify-between items-center">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center group/link"
          >
            Read Article 
            <ExternalLink className="ml-1 h-4 w-4 transform group-hover/link:translate-x-0.5 transition-transform" />
          </a>
          {onCreatePost && (
            <button
              onClick={() => onCreatePost(article)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}