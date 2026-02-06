import { z } from 'zod';
import { insertUserSchema, insertSoilAnalysisSchema, insertDiseaseDetectionSchema, insertMarketPriceSchema } from './schema';

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ id: z.number(), email: z.string(), name: z.string() }),
        401: z.object({ message: z.string() })
      }
    },
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.object({ id: z.number(), email: z.string(), name: z.string() }),
        400: z.object({ message: z.string() })
      }
    }
  },
  soil: {
    analyze: {
      method: 'POST' as const,
      path: '/api/soil/analyze',
      input: insertSoilAnalysisSchema,
      responses: {
        200: z.object({
          soilType: z.string(),
          fertility: z.string(),
          condition: z.string(),
          crops: z.array(z.object({ name: z.string(), score: z.number() })),
          irrigation: z.object({ type: z.string(), requirement: z.string(), frequency: z.string() })
        })
      }
    }
  },
  disease: {
    detect: {
      method: 'POST' as const,
      path: '/api/disease/detect',
      input: insertDiseaseDetectionSchema,
      responses: {
        200: z.object({
          disease: z.string(),
          severity: z.string(),
          treatment: z.string()
        })
      }
    }
  },
  market: {
    prices: {
      method: 'GET' as const,
      path: '/api/market/prices',
      input: z.object({ crop: z.string().optional(), location: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.object({ market: z.string(), price: z.number(), trend: z.string() }))
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
