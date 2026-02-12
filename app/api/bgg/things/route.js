import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (!ids) {
    return NextResponse.json({ error: 'Game IDs are required' }, { status: 400 });
  }

  // BGG allows up to ~20 IDs at once
  const bggUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${encodeURIComponent(ids)}&stats=1`;

  try {
    const response = await fetch(bggUrl, {
      headers: { 'Accept': 'application/xml' },
    });

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
