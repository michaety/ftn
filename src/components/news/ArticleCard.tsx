import React from 'react';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  author_name: string;
  published_at?: string;
  created_at: string;
}

interface ArticleCardProps {
  article: Article;
  role?: 'admin' | 'editor' | 'public';
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  role = 'public',
  onApprove,
  onReject,
  onEdit,
  onDelete
}) => {
  const articleUrl = role === 'public' 
    ? `/articles/${article.slug}` 
    : role === 'admin'
    ? `/admin/articles/${article.id}`
    : `/editor/articles/${article.id}`;

  return (
    <article className="ftn-article-card">
      {article.featured_image && (
        <div className="ftn-article-image">
          <img src={article.featured_image} alt={article.title} />
        </div>
      )}
      
      <div className="ftn-article-content">
        <h2 className="ftn-article-title">
          <a href={articleUrl}>{article.title}</a>
        </h2>
        
        {article.excerpt && (
          <p className="ftn-article-excerpt">{article.excerpt}</p>
        )}
        
        <div className="ftn-article-meta">
          <span className="ftn-article-author">By {article.author_name}</span>
          <span className="ftn-article-date">
            {new Date(article.published_at || article.created_at).toLocaleDateString()}
          </span>
        </div>

        {(role === 'admin' || role === 'editor') && (
          <div className="ftn-article-actions">
            {role === 'admin' && onApprove && (
              <button 
                onClick={() => onApprove(article.id)}
                className="ftn-btn ftn-btn-approve"
              >
                Approve
              </button>
            )}
            {role === 'admin' && onReject && (
              <button 
                onClick={() => onReject(article.id)}
                className="ftn-btn ftn-btn-reject"
              >
                Reject
              </button>
            )}
            {onEdit && (
              <button 
                onClick={() => onEdit(article.id)}
                className="ftn-btn ftn-btn-edit"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(article.id)}
                className="ftn-btn ftn-btn-delete"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
