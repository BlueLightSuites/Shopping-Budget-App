import axios, { AxiosError } from 'axios';
import { Product, ScanResult } from '../types';
import Constants from 'expo-constants'

const KROGER_API_BASE_URL = 'https://api.kroger.com/v1';
const KROGER_BASIC_TOKEN = Constants.expoConfig?.extra?.KROGER_BASIC_TOKEN;

let locationId: string | null = null;

interface ApiError {
  error: string;
  details?: string;
  statusCode?: number;
}

class ApiService {
  private bearerToken: string | null = null;
  private tokenExpiry: number = 0;
  private TOKEN_BUFFER = 5 * 60 * 1000; // Refresh 5 minutes before expiry

  private oauthTokenApi = axios.create({
    baseURL: `${KROGER_API_BASE_URL}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${KROGER_BASIC_TOKEN}`,
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'application/json',
    },
    
  });

  private api = axios.create({
    baseURL: KROGER_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'application/json',
    }
  })

  private async getOauthToken() {
    try{
      console.log('Basic Token', KROGER_BASIC_TOKEN);
      const response = await this.oauthTokenApi.post(
        '/connect/oauth2/token',
        'grant_type=client_credentials&scope=product.compact',
        {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      },
      
    );
      console.log('OAuth Token Response:', response.data);
      this.bearerToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      // Update axios instance with new bearer token
      this.api.defaults.headers.common['Authorization'] = `Bearer ${this.bearerToken}`;
    } catch (error) {
      console.error('Error fetching OAuth token:', error);
      throw error;
    }
  }

  /**
   * Checks if the current OAuth token is valid
   * @returns True if the token is valid, false otherwise
   */
  private isTokenValid(): boolean {
    return this.bearerToken !== null && (this.tokenExpiry - Date.now()) > this.TOKEN_BUFFER;
  }

  /**
   * Search for the location ID based on zip code
   */
  async getLocationIdByZip(zipCode: string): Promise<string | null> {
    try {

      if (!this.isTokenValid()) {
        await this.getOauthToken();
      }

      const response = await this.api.get(
        `/locations?filter.zipCode.near=${zipCode}`
      );
      console.log('Location ID response:', response);
      const responseData = response.data as any;

      if (responseData.data) {
        locationId = responseData.data[0].locationId;
        return locationId;
      }
      return null;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Location ID fetch error:', axiosError.response?.data || axiosError.message);
      return null;
    }
  }

  /**
   * Search for a product by barcode
   * Tries Kroger API first, then falls back to Walmart API
   */
  async searchProductByBarcode(
    barcode: string,
    locationId?: string | null
  ): Promise<ScanResult> {
    try {
      if (!this.isTokenValid()) {
        await this.getOauthToken();
      }

      const krogerResponse = await this.api.get(
        `/products?filter.term=${barcode}&filter.locationId=${locationId || ''}`
      );
      const krogerData = krogerResponse.data as any;

      if (krogerData.data && Array.isArray(krogerData.data) && krogerData.data.length > 0) {
        const krogerProduct = krogerData.data[0];
        return {
          success: true,
          barcode,
          product: this.mapKrogerProductToProduct(krogerProduct, barcode),
        };
      }

      return {
        success: false,
        barcode,
        error: 'Product not found in any database',
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Barcode search error:', axiosError.response?.data || axiosError.message);

      return {
        success: false,
        barcode,
        error:
          axiosError.response?.data?.error ||
          'Network error or product not found',
      };
    }
  }

  /**
   * Search for products by search term
   */
  async searchProductsByTerm(
    term: string,
    locationId?: string,
    limit: number = 10,
    start: number = 0
  ): Promise<Product[]> {
    try {
      const params = new URLSearchParams({
        term: encodeURIComponent(term),
        limit: limit.toString(),
        start: start.toString(),
      });
      if (locationId) {
        params.append('locationId', locationId);
      }

      const response = await this.api.get(
        `/api/kroger/search?${params.toString()}`
      );
      const responseData = response.data as any;

      if (responseData.data && Array.isArray(responseData.data)) {
        return responseData.data.map((item: any) =>
          this.mapKrogerProductToProduct(item, item.upc || '')
        );
      }

      return [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Product search error:', axiosError.response?.data || axiosError.message);
      return [];
    }
  }

  /**
   * Get product details by product ID
   */
  async getProductById(
    productId: string,
    locationId?: string
  ): Promise<Product | null> {
    try {
      const params = new URLSearchParams();
      if (locationId) {
        params.append('locationId', locationId);
      }

      const url = `/api/kroger/product/${productId}${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      const response = await this.api.get(url);
      const responseData = response.data as any;

      if (responseData.data) {
        return this.mapKrogerProductToProduct(
          responseData.data,
          responseData.data.upc || ''
        );
      }

      return null;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Get product error:', axiosError.response?.data || axiosError.message);
      return null;
    }
  }

  /**
   * Get product locations by product ID
   */
  async getProductLocations(productId: string): Promise<any[]> {
    try {
      const response = await this.api.get(
        `/api/kroger/product/${productId}/locations`
      );
      const responseData = response.data as any;

      if (responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }

      return [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error(
        'Get product locations error:',
        axiosError.response?.data || axiosError.message
      );
      return [];
    }
  }

  /**
   * Map Kroger product data to our Product interface
   */
  private mapKrogerProductToProduct(
    krogerProduct: any,
    barcode: string
  ): Product {
    try {      
      // Get price from various possible locations
      let price = 0;
      if (krogerProduct.items && krogerProduct.items[0]) {
        price = krogerProduct.items[0].price?.regular || krogerProduct.items[0].price?.promo || 0;
      } else if (krogerProduct.price) {
        price = krogerProduct.price?.regular || krogerProduct.price?.promo || 0;
      }

      const productImage = krogerProduct.images?.find((img: any) => img.perspective === 'front');
      const imageUrl = productImage?.sizes?.[3]?.url;

      return {
        id: krogerProduct.productId || '',
      name: krogerProduct.description || 'Unknown Product',
      price: krogerProduct.items?.[0]?.price?.regular || krogerProduct.items?.[0]?.price?.promo || 0,
        barcode: krogerProduct.upc || barcode,
      image: imageUrl,
      description: krogerProduct.description,
      brand: krogerProduct.brand,
      category: krogerProduct.categories?.[0],
      };
    } catch (error) {
      console.error('Error mapping Kroger product:', error);
      // Return a fallback product with minimal info
      return {
        id: '',
        name: 'Product Details Unavailable',
        price: 0,
        barcode: barcode,
        description: 'Failed to parse product data',
      };
    }
  }
}

export const apiService = new ApiService(); 