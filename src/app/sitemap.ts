import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ridebuddy.vercel.app'; // Fallback for sitemap generation

  const routes = [
    '',
    '/rides',
    '/login',
    '/signup',
    '/profile',
    '/driver',
    '/rider',
    '/create-ride',
    '/request-ride',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
