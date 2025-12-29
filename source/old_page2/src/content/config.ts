import { defineCollection, z } from 'astro:content';

// Определяем схему для блога
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().optional(),
    readTime: z.string().optional(),
  }),
});

// Определяем схему для новостей
const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    source: z.string().optional(),
    category: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  news: newsCollection,
};