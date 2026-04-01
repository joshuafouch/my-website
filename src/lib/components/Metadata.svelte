<script lang="ts">
  import * as config from '$lib/config';

  interface Props {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    imageAlt?: string;
    imageWidth?: number;
    imageHeight?: number;
    type?: 'website' | 'article';
    author?: string;
    date?: string;
    tags?: string[];
    siteName?: string;
    locale?: string;
  }

  let {
    title = config.title,
    description = config.description,
    url = '',
    image = '/previews/spencer-glacier.webp',
    imageAlt = 'Spencer Glacier - Alaska',
    imageWidth = 1200,
    imageHeight = 630,
    type = 'website',
    author = 'Joshua Fouch',
    date = '',
    tags = [],
    siteName = 'Joshua Fouch',
    locale = 'en_US'
  }: Props = $props();

  // Construct full URLs
  const fullUrl = url.startsWith('http') ? url : `${config.url}${url}`;
  const fullImage = image.startsWith('http') ? image : `${config.url}${image}`;

  // Schema.org structured data
  const getSchemaData = () => {
    if (type === 'article' && date) {
      return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description: description,
        image: fullImage,
        datePublished: date,
        author: {
          '@type': 'Person',
          name: author,
          url: config.url
        },
        publisher: {
          '@type': 'Person',
          name: author,
          url: config.url
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': fullUrl
        },
        ...(tags.length > 0 && { keywords: tags.join(', ') })
      };
    }

    return {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebPage',
      name: title,
      description: description,
      url: fullUrl,
      image: fullImage,
      author: {
        '@type': 'Person',
        name: author
      }
    };
  };
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />

  <!-- Open Graph / Facebook -->
  <meta property="og:title" content={title} />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={fullUrl} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={fullImage} />
  <meta property="og:image:width" content={imageWidth.toString()} />
  <meta property="og:image:height" content={imageHeight.toString()} />
  <meta property="og:image:alt" content={imageAlt} />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:locale" content={locale} />

  {#if type === 'article' && date}
    <meta property="article:published_time" content={date} />
    <meta property="article:author" content={author} />
    {#each tags as tag}
      <meta property="article:tag" content={tag} />
    {/each}
  {/if}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="joshuafouch.vercel.app" />
  <meta property="twitter:url" content={fullUrl} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={fullImage} />

  <!-- Canonical URL -->
  <link rel="canonical" href={fullUrl} />

  <!-- Schema.org JSON-LD -->
  {@html `<script type="application/ld+json">${JSON.stringify(getSchemaData(), null, 2)}</script>`}
</svelte:head>
