

import axios, { AxiosError } from 'axios';

const KROGER_OAUTH_URL = 'https://api.kroger.com/v1/connect/oauth2/token';
const KROGER_CLIENT_ID = 'price-scanner-bbc668lf';
const KROGER_CLIENT_SECRET = 'OFntq2XNoBOIharqiWjtnnrA5GlLPe9dqWD1L5Ld';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

/**
 * Refresh an expired access token using a refresh token
 * Follows Kroger OAuth2 refresh token flow
 */
export async function refreshTokenFromKroger(refreshToken: string): Promise<TokenResponse> {
  try {
    console.log('Attempting to refresh access token using refresh token');

    // Base64 encode credentials for Basic Authentication
    const credentials = `${KROGER_CLIENT_ID}:${KROGER_CLIENT_SECRET}`;
    const encodedCredentials = btoa(credentials);

    const response = await axios.post<TokenResponse>(
      KROGER_OAUTH_URL,
      new URLSearchParams({
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${encodedCredentials}`,
        },
        timeout: 10000,
      }
    );

    console.log('Successfully refreshed access token');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    console.error('Failed to refresh token:', axiosError.response?.data || axiosError.message);
    throw new Error('Failed to refresh access token from Kroger API');
  }
}

/**
 * Handler for refreshing tokens (Express/Node.js endpoint)
 * Expected body: { refreshToken: string }
 */
export async function refreshHandler(req: any, res: any, next: any) {
  if (!req.body?.refreshToken) {
    console.error('Refresh token not provided in request body');
    res.status(400).json({ error: 'Refresh token is required' });
    return;
  }

  try {
    // Call Kroger API to refresh the token
    const tokenData = await refreshTokenFromKroger(req.body.refreshToken);

    // Return new tokens to client
    const result = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || req.body.refreshToken, // Use new refresh token if provided
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      error: 'token_refresh_failed', 
      message: 'Failed to refresh access token' 
    });
  }
}