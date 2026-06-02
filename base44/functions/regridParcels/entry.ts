import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { lat, lng, radius_km = 0.4, action } = body;

    const token = Deno.env.get('REGRID_API_KEY') || 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJyZWdyaWQuY29tIiwiaWF0IjoxNzc5Mjg3MTU5LCJleHAiOjE3ODE4NzkxNTksInUiOjc5MjI5NiwiZyI6MjMxNTMsImNhcCI6InBhOnRzOnBzOmJmOm1hOnR5OmVvOnpvOnNiIn0.C4iTUatCZ7PasCt2PPzwrbi6QRYmxp8Eu7QxblSn7G0';

    // Return token for frontend tile layer use
    if (action === 'token') return Response.json({ token });

    if (!lat || !lng) return Response.json({ error: 'lat and lng required' }, { status: 400 });

    // Build bounding box from center + radius
    const latDelta = radius_km / 111;
    const lngDelta = radius_km / (111 * Math.cos(lat * Math.PI / 180));
    const bbox = `${lng - lngDelta},${lat - latDelta},${lng + lngDelta},${lat + latDelta}`;

    const url = `https://app.regrid.com/api/v2/parcels/area?bbox=${bbox}&limit=300&token=${token}&return_custom=false&return_geometry=true&return_field_labels=false`;

    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: `Regrid API error: ${res.status}`, detail: text }, { status: 502 });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});