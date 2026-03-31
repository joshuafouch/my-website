# Social Media Metadata Guide

This guide shows you exactly what to add for each type of content on your website.

---

## For Blog Posts

### 1. Create Your Markdown File

Location: `src/posts/your-post-name.md`

**Required frontmatter:**

```yaml
---
title: Your Blog Post Title
description: A concise description of your post (1-2 sentences, ~150 characters)
date: '2026-03-31'
categories:
  - category1
  - category2
image: '/previews/your-image.jpg'
published: true
---
```

**That's it!** The blog post page will automatically handle all the metadata, including:

- Open Graph tags (Facebook, LinkedIn, Discord)
- Twitter Cards
- Article metadata (author, published date, categories)
- Structured data (JSON-LD for SEO)
- Canonical URLs

### 2. Add Your Preview Image

- Place your image in: `static/previews/your-image.jpg`
- Recommended size: 1200x630px (optimal for social media)
- Supported formats: `.jpg`, `.png`, `.webp`
- Use the path `/previews/your-image.jpg` in frontmatter

---

## For New Static Pages

When creating a new page like `/about`, `/projects`, `/contact`, etc.

### Template to Copy

Location: `src/routes/your-page/+page.svelte`

```svelte
<script lang="ts">
  import * as config from '$lib/config';
</script>

<svelte:head>
  <title>Your Page Title</title>
  <meta name="description" content="A clear description of this page (1-2 sentences)" />

  <!-- Open Graph / Facebook -->
  <meta property="og:title" content="Your Page Title" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="{config.url}/your-page" />
  <meta property="og:description" content="A clear description of this page" />
  <meta property="og:image" content="{config.url}/assets/your-image.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Brief image description" />
  <meta property="og:site_name" content="Joshua Fouch" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Your Page Title" />
  <meta name="twitter:description" content="A clear description of this page" />
  <meta name="twitter:image" content="{config.url}/assets/your-image.webp" />

  <!-- Canonical URL -->
  <link rel="canonical" href="{config.url}/your-page" />
</svelte:head>

<!-- Your page content here -->
```

### What to Change

1. **title**: The page title (shows in browser tab and social cards)
2. **description**: 1-2 sentence description
3. **og:url**: Replace `your-page` with your actual route
4. **og:image**: Path to your preview image
5. **og:image:alt**: Describe the image briefly
6. **twitter:image**: Same as og:image
7. **canonical**: Same URL as og:url

---

## Quick Checklist

### For Every New Blog Post:

- [ ] Create `.md` file in `src/posts/`
- [ ] Add required frontmatter (title, description, date, categories, image, published)
- [ ] Add preview image to `static/previews/`
- [ ] Reference image path in frontmatter as `/previews/your-image.jpg`

### For Every New Page:

- [ ] Copy the template above
- [ ] Update all instances of page title
- [ ] Update all instances of page description
- [ ] Update all URL references (`/your-page`)
- [ ] Add and reference a preview image
- [ ] Update image alt text

---

## Testing Your Metadata

After adding a new post or page:

1. **Build and preview locally:**

   ```bash
   npm run build
   npm run preview
   ```

2. **View page source** (Ctrl+U in browser) and verify meta tags are present

3. **Test with social media validators:**
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/
   - Discord: Just paste the URL in any channel

4. **After deployment**, re-test with the live URL and click "Scrape Again" to refresh caches

---

## Common Issues

### Cards not updating?

Social platforms cache metadata. Use their debugging tools and click "Scrape Again" or "Fetch new scrape information."

### Image not showing?

- Verify image exists in `static/` folder
- Check image path starts with `/`
- Ensure image is accessible publicly
- Recommended size: 1200x630px

### Wrong text showing?

- Check your frontmatter (for blog posts)
- Check meta tags in `<svelte:head>` (for static pages)
- Verify you're testing the correct URL

---

## Advanced: Adding Structured Data to Static Pages

If you want better SEO for static pages, add JSON-LD:

```svelte
<svelte:head>
  <!-- ... existing meta tags ... -->

  <!-- Structured Data -->
  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Your Page Title",
    "description": "Your page description",
    "url": "${config.url}/your-page",
    "author": {
      "@type": "Person",
      "name": "Joshua Fouch"
    }
  }
  <\/script>`}
</svelte:head>
```

---

## Summary

**For blog posts:** Just add proper frontmatter - metadata is automatic!

**For static pages:** Copy the template and update 7 things (title, description, URLs, image paths).

That's it! Your social media cards will work perfectly.
