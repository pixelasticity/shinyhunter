import { NextResponse } from 'next/server';

const cache = new Map<string, any>();
const cacheTTL = new Map<string, number>();
const TTL = 1000 * 60 * 60 * 24 * 365 * 2; // 2 years

const fetchWithRetry = async (url: string, retries = 3, delay = 100) => {
  const cached = cache.get(url);
  if (cached && Date.now() < (cacheTTL.get(url) || 0)) {
    return cached;
  }

  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      cache.set(url, data);
      cacheTTL.set(url, Date.now() + TTL);
      return data;
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
