import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lat, lng, radius = 800 } = await req.json();
    if (!lat || !lng) return Response.json({ error: 'lat and lng are required' }, { status: 400 });

    // Overpass API query: fetch address nodes and ways within radius
    const query = `
      [out:json][timeout:30];
      (
        node["addr:housenumber"](around:${radius},${lat},${lng});
        way["addr:housenumber"](around:${radius},${lat},${lng});
      );
      out center tags;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json({ error: `Overpass API error: ${response.status}`, detail: text }, { status: 502 });
    }

    const data = await response.json();

    const addresses = (data.elements || []).map(el => {
      const tags = el.tags || {};
      // For ways, use center coordinates
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;

      const street = tags['addr:street'] || '';
      const number = tags['addr:housenumber'] || '';
      const city = tags['addr:city'] || '';
      const state = tags['addr:state'] || '';
      const postcode = tags['addr:postcode'] || '';

      const addressLine = [
        number && street ? `${number} ${street}` : (number || street),
        city,
        state && postcode ? `${state} ${postcode}` : (state || postcode),
      ].filter(Boolean).join(', ');

      return {
        address: addressLine || `${elLat?.toFixed(5)}, ${elLng?.toFixed(5)}`,
        lat: elLat,
        lng: elLng,
        city: city || null,
        postcode: postcode || null,
      };
    }).filter(a => a.lat && a.lng && a.address);

    return Response.json({ addresses, total: addresses.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});