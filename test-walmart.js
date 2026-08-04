const https = require('https');
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Load environment variables from .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
}

const WALMART_CONSUMER_ID = env['WALMART_CONSUMER_ID'];
const WALMART_KEY_VERSION = env['WALMART_KEY_VERSION'] || '1';
const WALMART_PRIVATE_KEY_BASE64 = env['WALMART_PRIVATE_KEY_BASE64'];

console.log('WALMART_CONSUMER_ID:', WALMART_CONSUMER_ID);
console.log('WALMART_KEY_VERSION:', WALMART_KEY_VERSION);
console.log('WALMART_PRIVATE_KEY_BASE64 set:', !!WALMART_PRIVATE_KEY_BASE64);

function buildSignature(timestamp) {
  const p8Der = forge.util.decode64(WALMART_PRIVATE_KEY_BASE64);
  const p8Asn1 = forge.asn1.fromDer(p8Der);
  const rsaKeyDer = p8Asn1.value[2].value;
  const rsaKeyAsn1 = forge.asn1.fromDer(rsaKeyDer);
  const privateKey = forge.pki.privateKeyFromAsn1(rsaKeyAsn1);
  const stringToSign = `${WALMART_CONSUMER_ID}\n${timestamp}\n${WALMART_KEY_VERSION}\n`;
  const md = forge.md.sha256.create();
  md.update(stringToSign, 'utf8');
  return forge.util.encode64(privateKey.sign(md));
}

function httpsRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        const rawBuffer = Buffer.concat(chunks);
        const encoding = res.headers['content-encoding'];
        if (encoding === 'gzip' || encoding === 'deflate' || (rawBuffer[0] === 0x1f && rawBuffer[1] === 0x8b)) {
          zlib.gunzip(rawBuffer, (err, decoded) => {
            if (err) resolve({ status: res.statusCode, headers: res.headers, body: rawBuffer.toString('utf8') });
            else resolve({ status: res.statusCode, headers: res.headers, body: decoded.toString('utf8') });
          });
        } else {
          resolve({ status: res.statusCode, headers: res.headers, body: rawBuffer.toString('utf8') });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('\n=== Testing Walmart API with REAL signature ===');
  const timestamp = Date.now().toString();
  let signature;
  try {
    signature = buildSignature(timestamp);
    console.log('Signature generated OK');
  } catch(e) {
    console.error('Signature generation failed:', e.message);
    return;
  }

  // Test 1: items endpoint with UPC
  const res1 = await httpsRequest({
    hostname: 'developer.api.walmart.com',
    path: '/api-proxy/service/affil/product/v2/items?upc=0078742338477',
    method: 'GET',
    headers: {
      'WM_CONSUMER.ID': WALMART_CONSUMER_ID,
      'WM_CONSUMER.INTIMESTAMP': timestamp,
      'WM_SEC.KEY_VERSION': WALMART_KEY_VERSION,
      'WM_SEC.AUTH_SIGNATURE': signature,
      'Accept': 'application/json',
    }
  });
  console.log('Items endpoint status:', res1.status);
  console.log('Content-Type:', res1.headers['content-type']);
  // Try to parse as JSON
  try {
    const parsed = JSON.parse(res1.body);
    console.log('Response (JSON):', JSON.stringify(parsed).substring(0, 400));
  } catch(e) {
    console.log('Response (raw, first 400 chars):', res1.body.substring(0, 400));
  }

  // Test 2: search endpoint
  console.log('\n--- Testing search endpoint ---');
  const timestamp2 = Date.now().toString();
  const sig2 = buildSignature(timestamp2);
  const res2 = await httpsRequest({
    hostname: 'developer.api.walmart.com',
    path: '/api-proxy/service/affil/product/v2/search?query=milk&numItems=2',
    method: 'GET',
    headers: {
      'WM_CONSUMER.ID': WALMART_CONSUMER_ID,
      'WM_CONSUMER.INTIMESTAMP': timestamp2,
      'WM_SEC.KEY_VERSION': WALMART_KEY_VERSION,
      'WM_SEC.AUTH_SIGNATURE': sig2,
      'Accept': 'application/json',
    }
  });
  console.log('Search endpoint status:', res2.status);
  try {
    const parsed = JSON.parse(res2.body);
    console.log('Response (JSON):', JSON.stringify(parsed).substring(0, 400));
  } catch(e) {
    console.log('Response (raw, first 400 chars):', res2.body.substring(0, 400));
  }
}

main().catch(console.error);
