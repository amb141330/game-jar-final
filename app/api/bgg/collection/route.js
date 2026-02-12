import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const bggUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username)}&own=1&stats=1&excludesubtype=boardgameexpansion`;

  let attempts = 0;
  const maxAttempts = 8;

<<<<<<< HEAD
  const headers = { 'Accept': 'application/xml' };
  if (process.env.BGG_API_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.BGG_API_TOKEN}`;
  }

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(bggUrl, {
        headers,
        cache: 'no-store',
      });

      if (response.status === 202) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }

      if (response.status === 200) {
        const xml = await response.text();
        return new NextResponse(xml, {
          status: 200,
          headers: { 'Content-Type': 'application/xml' },
        });
      }

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'BGG API requires authentication. Add your BGG_API_TOKEN to Vercel environment variables. See https://boardgamegeek.com/using_the_xml_api for details.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `BGG returned status ${response.status}` },
        { status: response.status }
      );
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to reach BGG API' },
        { status: 502 }
      );
=======
// ... (previous logic for username and bggUrl)

while (attempts < maxAttempts) {
  try {
    const response = await fetch(bggUrl, {
      headers: { 
        'Accept': 'application/xml',
        // ADD THIS LINE: BGG requires a descriptive User-Agent to avoid 401s
        'User-Agent': 'GameJar/1.0 (https://your-domain.vercel.app)' 
      },
      // Optional: Prevent Vercel from caching a 401 error response
      cache: 'no-store' 
    });

    if (response.status === 202) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 3000));
      continue;
>>>>>>> d1c95990b6099de964b33d9d34ed3844a113bdbb
    }

    if (response.status === 200) {
      const xml = await response.text();
      return new NextResponse(xml, {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // If it still fails, the body will tell us why (e.g., "BGG returned status 401")
    return NextResponse.json(
      { error: `BGG returned status ${response.status}` },
      { status: response.status }
    );
    
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to reach BGG API' },
      { status: 502 }
    );
  }
}

  return NextResponse.json(
    { error: 'BGG is still processing. Please try again in a moment.' },
    { status: 202 }
  );
}
