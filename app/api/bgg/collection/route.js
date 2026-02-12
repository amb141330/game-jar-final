import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const bggUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username)}&own=1&stats=1&excludesubtype=boardgameexpansion`;

  // BGG API often returns 202 "please wait" on first request
  let attempts = 0;
  const maxAttempts = 8;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(bggUrl, {
        headers: { 'Accept': 'application/xml' },
      });

      if (response.status === 202) {
        // BGG is processing, wait and retry
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
