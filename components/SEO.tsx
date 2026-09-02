import Head from "next/head";

type SEOProps = {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  image?: string;
};

const SITE_URL = "https://crossbordercart.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

export default function SEO({
  title,
  description,
  path = "",
  noindex = false,
  image = DEFAULT_IMAGE,
}: SEOProps) {
  const cleanPath = path === "/" ? "" : path.replace(/\/$/, "");
  const canonicalUrl = `${SITE_URL}${cleanPath}`;

  return (
    <Head>
      <title>{title}</title>

      {description && (
        <meta name="description" content={description} />
      )}

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={canonicalUrl} />

          <meta property="og:title" content={title} />

          {description && (
            <meta
              property="og:description"
              content={description}
            />
          )}

          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={image} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />

          {description && (
            <meta
              name="twitter:description"
              content={description}
            />
          )}

          <meta name="twitter:image" content={image} />
        </>
      )}
    </Head>
  );
}