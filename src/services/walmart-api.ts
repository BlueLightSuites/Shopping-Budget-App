import axios, { AxiosError } from 'axios';
import forge from 'node-forge';
import Constants from 'expo-constants';
import { Product, ScanResult } from '../types';

const WALMART_API_BASE_URL = 'https://developer.api.walmart.com/api-proxy/service/affil/product/v2';
const WALMART_CONSUMER_ID = Constants.expoConfig?.extra?.WALMART_CONSUMER_ID as string;
const WALMART_KEY_VERSION = (Constants.expoConfig?.extra?.WALMART_KEY_VERSION as string) ?? '1';
const WALMART_PRIVATE_KEY_BASE64 = Constants.expoConfig?.extra?.WALMART_PRIVATE_KEY_BASE64 as string;

interface ApiError {
  error: string;
  details?: string;
  statusCode?: number;
}

/**
 * Parse the private key once at module load time so we don't re-do expensive
 * ASN.1 decoding on every scan request.
 */
let _cachedPrivateKey: forge.pki.rsa.PrivateKey | null = null;

/** Cached nearest Walmart store ID — fetched once per session */
let _cachedStoreId: string | null = null;

function getPrivateKey(): forge.pki.rsa.PrivateKey {
  if (_cachedPrivateKey) return _cachedPrivateKey;

  if (!WALMART_PRIVATE_KEY_BASE64) {
    throw new Error('WALMART_PRIVATE_KEY_BASE64 is not configured.');
  }
  // WALMART_PRIVATE_KEY_BASE64 is the raw key body (no PEM headers, no newlines).
  // The key is PKCS#8 format — manually unwrap to get the inner RSA key.
  const p8Der = forge.util.decode64(WALMART_PRIVATE_KEY_BASE64);
  const p8Asn1 = forge.asn1.fromDer(p8Der);
  // PKCS#8 PrivateKeyInfo structure: value[2] is the PrivateKey OCTET STRING (PKCS#1 RSA key)
  const rsaKeyDer = (p8Asn1 as any).value[2].value;
  const rsaKeyAsn1 = forge.asn1.fromDer(rsaKeyDer);
  _cachedPrivateKey = forge.pki.privateKeyFromAsn1(rsaKeyAsn1);
  return _cachedPrivateKey;
}

/**
 * Build the RSA-SHA256 signature required by Walmart's Open API.
 * String to sign: consumerId + "\n" + timestampMs + "\n" + keyVersion + "\n"
 */
function buildWalmartSignature(timestamp: string): string {
  const privateKey = getPrivateKey();
  const stringToSign = `${WALMART_CONSUMER_ID}\n${timestamp}\n${WALMART_KEY_VERSION}\n`;
  const md = forge.md.sha256.create();
  md.update(stringToSign, 'utf8');
  return forge.util.encode64(privateKey.sign(md));
}

function buildWalmartHeaders() {
  const timestamp = Date.now().toString();
  const signature = buildWalmartSignature(timestamp);

  return {
    'WM_CONSUMER.ID': WALMART_CONSUMER_ID,
    'WM_CONSUMER.INTIMESTAMP': timestamp,
    'WM_SEC.KEY_VERSION': WALMART_KEY_VERSION,
    'WM_SEC.AUTH_SIGNATURE': signature,
    'Accept': 'application/json',
  };
}

class WalmartApiService {
  private api = axios.create({
    baseURL: WALMART_API_BASE_URL,
    timeout: 5000,
  });

  /**
   * Look up the nearest Walmart store ID for a zip code.
   * Result is cached for the session — only fetches once.
   */
  async getStoreIdByZip(zipCode: string): Promise<string | null> {
    if (_cachedStoreId) return _cachedStoreId;
    try {
      const response = await this.api.get('/stores', {
        params: { zip: zipCode, distance: '10' },
        headers: buildWalmartHeaders(),
      });
      const data = response.data as any;
      if (Array.isArray(data) && data.length > 0) {
        _cachedStoreId = String(data[0].no);
        console.log('Walmart store ID:', _cachedStoreId);
        return _cachedStoreId;
      }
      return null;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Walmart store lookup error:', axiosError.response?.data || axiosError.message);
      return null;
    }
  }

  /**
   * Search for a Walmart product by UPC/barcode.
   * Passes the cached storeId for location-specific pricing when available.
   */
  async searchProductByBarcode(barcode: string): Promise<ScanResult> {
    try {
      const params: Record<string, string> = { upc: barcode };
      if (_cachedStoreId) params.storeId = _cachedStoreId;

      const response = await this.api.get('/items', {
        params,
        headers: buildWalmartHeaders(),
      });

      const data = response.data as any;

      // Walmart returns { items: [...] }
      if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
        return {
          success: true,
          barcode,
          product: this.mapWalmartProductToProduct(data.items[0], barcode),
        };
      }

      return {
        success: false,
        barcode,
        error: 'Product not found in Walmart catalog',
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Walmart barcode search error:', axiosError.response?.data || axiosError.message);
      return {
        success: false,
        barcode,
        error: axiosError.response?.data?.error || 'Network error or product not found',
      };
    }
  }

  /**
   * Search Walmart products by keyword term.
   */
  async searchProductsByTerm(term: string, limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.api.get('/search', {
        params: { query: term, numItems: limit },
        headers: buildWalmartHeaders(),
      });

      const data = response.data as any;

      if (data?.items && Array.isArray(data.items)) {
        return data.items.map((item: any) => this.mapWalmartProductToProduct(item, item.upc ?? ''));
      }

      return [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Walmart product search error:', axiosError.response?.data || axiosError.message);
      return [];
    }
  }

  /**
   * Map a Walmart API item object to the shared Product interface.
   */
  private mapWalmartProductToProduct(item: any, barcode: string): Product {
    try {
      return {
        id: String(item.itemId ?? ''),
        name: item.name ?? 'Unknown Product',
        price: item.salePrice ?? item.msrp ?? 0,
        barcode: item.upc ?? barcode,
        image: item.largeImage ?? item.mediumImage ?? item.thumbnailImage,
        // Use the product name as description so list views always show a clean label
        description: item.name ?? item.shortDescription ?? '',
        brand: item.brandName,
        category: item.categoryPath,
      };
    } catch (error) {
      console.error('Error mapping Walmart product:', error);
      return {
        id: '',
        name: 'Product Details Unavailable',
        price: 0,
        barcode,
        description: 'Failed to parse product data',
      };
    }
  }
}

export const walmartApiService = new WalmartApiService();
