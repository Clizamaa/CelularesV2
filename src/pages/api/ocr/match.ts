import type { APIRoute } from 'astro';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * Normalizes text for better matching:
 * - Uppercase
 * - Replaces O with 0, I/l with 1 (common OCR errors)
 * - Removes all non-alphanumeric characters
 */
function deepNormalize(text: string): string {
  return text
    .toUpperCase()
    .replace(/O/g, '0')
    .replace(/[Il]/g, '1')
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * POST /api/ocr/match
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const rawText: string = body.text || '';

    if (!rawText.trim()) {
      return errorResponse(400, 'No se proporcionó texto para analizar');
    }

    const cleanText = rawText.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    const textUpper = cleanText.toUpperCase();
    const textDeep = deepNormalize(cleanText);

    console.log('[OCR API] Raw Text Trace:', rawText);
    console.log('[OCR API] Deep Normalized Text:', textDeep);

    const marcas = await prisma.marca.findMany({
      include: { modelos: true },
    });

    const result: {
      marca: string | null;
      modelo: string | null;
      serial: string | null;
      imei: string | null;
    } = {
      marca: null,
      modelo: null,
      serial: null,
      imei: null,
    };

    // ── Find IMEI (15 digits) ──
    // Look for 15 digit numbers
    const imeiRegex = /\b\d{15}\b/g;
    const imeiMatches = cleanText.match(imeiRegex);
    if (imeiMatches && imeiMatches.length > 0) {
      result.imei = imeiMatches[0];
      console.log('[OCR API] IMEI Found:', result.imei);
    }

    // ── Find Serial Number (S/N) ──
    // Look for labels like S/N, SN, Serial NO, etc.
    const snRegex = /(?:S\/N|SN|SERIAL|SER[:\.\s]|S\.N\.)\s*[:\-]?\s*([A-Z0-9]{8,20})/i;
    const snMatch = cleanText.match(snRegex);
    if (snMatch) {
      result.serial = snMatch[1];
      console.log('[OCR API] Serial Found:', result.serial);
    } else {
      // Fallback: look for 8-12 char alphanumeric that isn't the brand or model
      // but let's stick to labels for now to avoid false positives
    }

    // ── Find Marca ──
    for (const marca of marcas) {
      const marcaUpper = marca.nombre.toUpperCase();
      const marcaDeep = deepNormalize(marca.nombre);

      if (textUpper.includes(marcaUpper) || textDeep.includes(marcaDeep)) {
        result.marca = marca.nombre;
        console.log('[OCR API] Brand Found:', marca.nombre);

        // ── Find Modelo ──
        const sortedModelos = [...marca.modelos].sort((a, b) => b.nombre.length - a.nombre.length);

        for (const modelo of sortedModelos) {
          const modeloUpper = modelo.nombre.toUpperCase();
          const modeloDeep = deepNormalize(modelo.nombre);
          
          // 1. Exact phrase match
          if (textUpper.includes(modeloUpper)) {
            result.modelo = modelo.nombre;
            console.log('[OCR API] Exact Model Match:', modelo.nombre);
            break;
          }

          // 2. Deep normalized match (handles A01 vs AO1, etc)
          if (textDeep.includes(modeloDeep)) {
            result.modelo = modelo.nombre;
            console.log('[OCR API] Deep Model Match:', modelo.nombre);
            break;
          }

          // 3. Parts match
          const parts = modeloUpper.split(/\s+/).filter(p => p.length >= 2);
          if (parts.length > 0 && parts.every(p => textUpper.includes(p))) {
            result.modelo = modelo.nombre;
            console.log('[OCR API] Parts Model Match:', modelo.nombre);
            break;
          }
        }
        break;
      }
    }

    // Fallback brand
    if (!result.marca) {
      const commonBrands = ['SAMSUNG', 'APPLE', 'MOTOROLA', 'XIAOMI', 'HUAWEI', 'GOOGLE', 'IPHONE'];
      for (const brand of commonBrands) {
        if (textUpper.includes(brand)) {
          result.marca = brand === 'IPHONE' ? 'Apple' : brand.charAt(0) + brand.slice(1).toLowerCase();
          break;
        }
      }
    }

    return successResponse(result);
  } catch (err) {
    console.error('[API] POST /api/ocr/match error:', err);
    return errorResponse(500, 'Error al procesar texto');
  }
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
