const https = require('https');

function req(options, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  // Get token
  const tok = await req({
    hostname: 'api.kroger.com', path: '/v1/connect/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic cHJpY2Utc2Nhbm5lci1iYmM2NjhsZjpuVWFoejltdURNRVRwSkVDSGtuZlR3d0ZwekJIM3FOT2VIZ21vaUFr'
    }
  }, 'grant_type=client_credentials&scope=product.compact');
  const token = JSON.parse(tok.body).access_token;
  console.log('Token OK:', !!token);

  // Test 1: 13-digit EAN format (what the app sends: 0001111041700)
  const t1 = await req({
    hostname: 'api.kroger.com',
    path: '/v1/products?filter.term=0001111041700',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
  });
  console.log('\n[Test 1] filter.term=0001111041700 (no locationId):');
  console.log('  Status:', t1.status);
  const d1 = JSON.parse(t1.body);
  console.log('  Results:', d1.data?.length ?? 0);

  // Test 2: 13-digit with empty locationId (exactly what the app does when locationId is null)
  const t2 = await req({
    hostname: 'api.kroger.com',
    path: '/v1/products?filter.term=0001111041700&filter.locationId=',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
  });
  console.log('\n[Test 2] filter.term=0001111041700&filter.locationId= (empty):');
  console.log('  Status:', t2.status);
  const d2 = JSON.parse(t2.body);
  console.log('  Results:', d2.data?.length ?? 0);
  if (d2.errors) console.log('  Errors:', JSON.stringify(d2.errors));

  // Test 3: Get a Smith's locationId for SLC then search
  const locRes = await req({
    hostname: 'api.kroger.com',
    path: '/v1/locations?filter.zipCode.near=84101&filter.limit=5',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
  });
  const locData = JSON.parse(locRes.body);
  const locationId = locData.data?.[0]?.locationId;
  const storeName = locData.data?.[0]?.name;
  const storeBanner = locData.data?.[0]?.chain;
  console.log(`\n[Location] Found: "${storeName}" (chain: ${storeBanner}, id: ${locationId})`);

  const t3 = await req({
    hostname: 'api.kroger.com',
    path: `/v1/products?filter.term=0001111041700&filter.locationId=${locationId}`,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
  });
  console.log('\n[Test 3] filter.term=0001111041700 with real locationId:');
  console.log('  Status:', t3.status);
  const d3 = JSON.parse(t3.body);
  console.log('  Results:', d3.data?.length ?? 0);
  if (d3.data?.length > 0) {
    console.log('  First product:', d3.data[0].description, '| UPC:', d3.data[0].upc, '| Price:', d3.data[0].items?.[0]?.price);
  }
  if (d3.errors) console.log('  Errors:', JSON.stringify(d3.errors));

  // Test 4: 12-digit UPC-A format (drop leading zero)
  const t4 = await req({
    hostname: 'api.kroger.com',
    path: `/v1/products?filter.term=001111041700&filter.locationId=${locationId}`,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
  });
  console.log('\n[Test 4] filter.term=001111041700 (12-digit UPC-A) with locationId:');
  console.log('  Status:', t4.status);
  const d4 = JSON.parse(t4.body);
  console.log('  Results:', d4.data?.length ?? 0);
  if (d4.data?.length > 0) {
    console.log('  First product:', d4.data[0].description, '| UPC:', d4.data[0].upc);
  }
}
main().catch(console.error);
