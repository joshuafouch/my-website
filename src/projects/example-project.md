---
title: Example Project
description: A sample project to demonstrate the new projects page functionality
date: '2026-03-15'
image: '/assets/hero-bg.webp'
sourceUrl: 'https://github.com/yourusername/example-project'
tags:
  - sveltekit
  - typescript
  - tailwindcss
published: true
---

# Example Project

This is an example project to demonstrate how the projects page works with mdsvex.

## Overview

This project showcases the ability to create detailed project pages with markdown content, images, and code examples.

## Features

- Beautiful card-based layout on the projects listing page
- Detailed project pages with full markdown support
- Source code button linking to GitHub repository
- Tag-based categorization
- Responsive design using TailwindCSS

## Technical Stack

- **Frontend**: SvelteKit 2.0
- **Styling**: TailwindCSS + DaisyUI
- **Content**: MDsveX for markdown processing
- **Type Safety**: TypeScript

## Code Example

Here's a sample code snippet:

```typescript
export async function load({ fetch }) {
  const response = await fetch('/api/projects');
  const projects: Project[] = await response.json();
  return { projects };
}
```

## Images

You can add images in your markdown files just like in blog posts!

## Conclusion

This demonstrates the full capabilities of the projects page system. You can now create as many project pages as you want by simply adding markdown files to the `/src/projects/` directory.
