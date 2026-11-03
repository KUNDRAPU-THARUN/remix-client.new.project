import React, { useEffect } from 'react';
import { CityConfig, Listing } from '../types';

interface SEOHeadProps {
  currentCity: CityConfig;
  selectedListing?: Listing | null;
}

function updateMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string) {
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export const SEOHead: React.FC<SEOHeadProps> = ({ currentCity, selectedListing }) => {
  useEffect(() => {
    const isListing = Boolean(selectedListing);
    const title = isListing
      ? `${selectedListing!.title} - ${currentCity.brandName} (${currentCity.code})`
      : currentCity.seo.title;

    const description = isListing
      ? `${selectedListing!.title} in ${currentCity.name}. ${selectedListing!.address}. Phone: ${selectedListing!.phone}. ${selectedListing!.description.slice(0, 130)}`
      : currentCity.seo.description;

    const url = typeof window !== 'undefined' ? window.location.href : `https://${currentCity.domain}`;
    const image = isListing && selectedListing!.images?.[0]
      ? selectedListing!.images[0]
      : 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80';

    // 1. Title
    document.title = title;

    // 2. Primary Meta Description
    updateMetaTag('name', 'description', description);

    // 3. Open Graph Tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', url);
    updateMetaTag('property', 'og:type', isListing ? 'article' : 'website');
    updateMetaTag('property', 'og:image', image);

    // 4. Twitter Card Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image);

    // 5. Canonical Link
    updateCanonicalLink(url.split('?')[0]);
  }, [currentCity, selectedListing]);

  return null;
};

