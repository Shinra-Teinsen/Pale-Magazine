import { Article, Category, Tag, Comment } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Société',
    slug: 'societe',
    description: 'Enjeux sociétaux, débats contemporains, tendances urbaines et évolutions du monde moderne.',
  },
  {
    id: 'cat-2',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Art de vivre, bien-être, design d’intérieur, voyages inspirants et développement personnel.',
  },
  {
    id: 'cat-3',
    name: 'Culture & Divertissement',
    slug: 'culture-divertissement',
    description: 'Cinéma, littérature, expositions artistiques, musique et innovations créatives.',
  },
];

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag-1', name: 'Technologie', slug: 'technologie' },
  { id: 'tag-2', name: 'Architecture', slug: 'architecture' },
  { id: 'tag-3', name: 'Bien-être', slug: 'bien-etre' },
  { id: 'tag-4', name: 'Cinéma', slug: 'cinema' },
  { id: 'tag-5', name: 'Écologie', slug: 'ecologie' },
  { id: 'tag-6', name: 'Design', slug: 'design' },
];

export const INITIAL_ARTICLES: Article[] = [];

export const INITIAL_COMMENTS: Comment[] = [];
