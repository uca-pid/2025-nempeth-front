interface UnsplashPhoto {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
}

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
  console.warn(
    'VITE_UNSPLASH_ACCESS_KEY no está configurada. Las imágenes de Unsplash no funcionarán.',
  );
}

export const searchUnsplashPhoto = async (
  query: string,
): Promise<string | null> => {
  if (!UNSPLASH_ACCESS_KEY) return null;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query,
      )}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`,
    );

    if (!response.ok) {
      throw new Error(`Error en la API de Unsplash: ${response.status}`);
    }

    const data: UnsplashSearchResponse = await response.json();

    if (data.results.length > 0) {
      return data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('Error al buscar imagen en Unsplash:', error);
    return null;
  }
};
