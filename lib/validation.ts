import { z } from 'zod';
export const loginSchema = z.object({ email: z.string().email().max(256), password: z.string().min(8).max(128) });
export const forgotSchema = z.object({ email: z.string().email().max(256) });
export const resetSchema = z.object({ token: z.string().min(10), password: z.string().min(8).max(128) });
export const postSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(220),
  richDescription: z.string().min(20),
  rideDate: z.string().datetime(),
  locationTags: z.array(z.string().min(1).max(40)).default([]),
  rideStats: z.object({ distanceKm: z.number().nonnegative().optional(), durationMin: z.number().nonnegative().optional(), elevationGainM: z.number().nonnegative().optional() }).optional(),
  featuredImageId: z.string().nullable().optional(),
  gpxUrl: z.string().url().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});
export const mediaCreateSchema = z.object({ fileName: z.string().min(1), mimeType: z.string().min(3), size: z.number().int().positive(), kind: z.enum(['IMAGE', 'VIDEO']), altText: z.string().max(120).optional() });
