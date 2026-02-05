import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  canonical?: string;
  schema?: Record<string, any>;
  noindex?: boolean;
}

/**
 * Hook to manage SEO meta tags using react-helmet-async
 * Automatically combines with base title from index.html
 */
export const useSEO = (props: SEOProps) => {
  const {
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage = 'https://lovable.dev/opengraph-image-p98pqg.png',
    twitterCard = 'summary_large_image',
    canonical,
    schema,
    noindex = false,
  } = props;

  return (
    <Helmet>
      {title && <title>{title} | SAP BTP Service Analyzer</title>}
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph Tags */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card Tags */}
      {<meta name="twitter:card" content={twitterCard} />}
      {ogTitle && <meta name="twitter:title" content={ogTitle} />}
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default useSEO;
