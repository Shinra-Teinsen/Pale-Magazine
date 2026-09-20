import { Article } from '../types';

export function updateArticleMetaTags(article: Article | null) {
  if (!article) return;

  // Title
  document.title = `${article.title} — PALE`;

  const setMetaTag = (attrName: string, attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard description
  if (article.excerpt) {
    setMetaTag('name', 'description', article.excerpt);
  }

  // OpenGraph (Facebook, WhatsApp, LinkedIn, iMessage, etc.)
  setMetaTag('property', 'og:title', article.title);
  if (article.excerpt) {
    setMetaTag('property', 'og:description', article.excerpt);
  }
  setMetaTag('property', 'og:type', 'article');
  setMetaTag('property', 'og:url', window.location.href);

  if (article.cover_image) {
    setMetaTag('property', 'og:image', article.cover_image);
    setMetaTag('name', 'twitter:image', article.cover_image);
  }

  // Twitter Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', article.title);
  if (article.excerpt) {
    setMetaTag('name', 'twitter:description', article.excerpt);
  }
}
