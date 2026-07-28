import { useEffect } from 'react';

interface PageMetadataConfig {
  title: string;
  description: string;
  path: string;
}

function ensureMetaTag(attributeName: 'name' | 'property', attributeValue: string): HTMLMetaElement {
  const selector = `meta[${attributeName}="${attributeValue}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attributeName, attributeValue);
    document.head.appendChild(tag);
  }

  return tag;
}

function ensureCanonicalTag(): HTMLLinkElement {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }

  return tag;
}

export function usePageMetadata({ title, description, path }: PageMetadataConfig): void {
  useEffect(() => {
    const siteName = 'ONEMISSION';
    const pageTitle = `${title} | ${siteName}`;
    const canonicalBaseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : 'https://onemissionclo.com';
    const canonicalUrl = `${canonicalBaseUrl}${path}`;

    document.title = pageTitle;

    ensureMetaTag('name', 'description').setAttribute('content', description);
    ensureMetaTag('property', 'og:title').setAttribute('content', pageTitle);
    ensureMetaTag('property', 'og:description').setAttribute('content', description);
    ensureMetaTag('property', 'og:type').setAttribute('content', 'website');
    ensureMetaTag('property', 'og:url').setAttribute('content', canonicalUrl);
    ensureCanonicalTag().setAttribute('href', canonicalUrl);
  }, [description, path, title]);
}
