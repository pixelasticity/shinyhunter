import { NextResponse } from 'next/server';

const fetchWithRetry = async (url: string, retries = 3, delay = 100) => {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    }
    if (res.status === 429) { // Too many requests
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error(`Failed to fetch from PokeAPI: ${url}`);
};

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const { searchParams } = new URL(request.url);
  const urls = searchParams.get('urls');

  if (urls) {
    // Batch fetch
    const urlArray = urls.split(',');
    try {
      const results = await Promise.allSettled(
        urlArray.map(url => fetchWithRetry(`https://pokeapi.co/api/v2${url}`))
      );
      const data = results.map(result => 
        result.status === 'fulfilled' ? result.value : null
      );
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch from PokeAPI' },
        { status: 500 }
      );
    }
  } else {
    // Single fetch
    const slug = params.slug.join('/');
    const query = searchParams.toString();
    try {
      const data = await fetchWithRetry(`https://pokeapi.co/api/v2/${slug}?${query}`);
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch from PokeAPI' },
        { status: 500 }
      );
    }
  }
}
