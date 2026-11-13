import React, { useEffect } from 'react';
import { CityConfig, Listing } from '../types';

interface SEOHeadProps {
  currentCity: CityConfig;
  selectedListing?: Listing | null;
  activeTab?: string;
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

export const SEOHead: React.FC<SEOHeadProps> = ({ currentCity, selectedListing, activeTab }) => {
  useEffect(() => {
    const isListing = Boolean(selectedListing);
    let title = currentCity.seo.title;
    let description = currentCity.seo.description;

    if (isListing) {
      title = `${selectedListing!.title} - ${currentCity.brandName} (${currentCity.code})`;
      description = `${selectedListing!.title} in ${currentCity.name}. ${selectedListing!.address}. Phone: ${selectedListing!.phone}. ${selectedListing!.description.slice(0, 130)}`;
    } else if (activeTab === 'about') {
      title = `About ${currentCity.brandName} - Fort City Business Directory & Classifieds (${currentCity.code})`;
      description = `Discover ${currentCity.brandName}, the premier local business directory, CMC hospital corridor, student life, and classifieds portal for ${currentCity.name} (${currentCity.code}).`;
    } else if (activeTab === 'contact') {
      title = `Contact ${currentCity.brandName} - Office & Support Helpline (${currentCity.code})`;
      description = `Get in touch with ${currentCity.brandName} regional office in ${currentCity.name}. Phone: ${currentCity.contact.phone}. Office: ${currentCity.contact.address}.`;
    } else if (activeTab === 'biz') {
      title = `Business Profile - ${currentCity.brandName} (${currentCity.code})`;
      description = `View verified local business details, directions, contact, and reviews in ${currentCity.name} (${currentCity.code}).`;
    } else if (activeTab === 'community') {
      title = `Community Noticeboard - ${currentCity.brandName} (${currentCity.code})`;
      description = `Local public announcements, civic initiatives, student updates, and non-commercial community notices in ${currentCity.name} (${currentCity.code}).`;
    } else if (activeTab === 'events') {
      title = `Local Events & Calendar - ${currentCity.brandName} (${currentCity.code})`;
      description = `Discover upcoming conferences, cultural evenings, student symposiums, exhibitions, and tournaments in ${currentCity.name} (${currentCity.code}).`;
    }

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
  }, [currentCity, selectedListing, activeTab]);

  return null;
};

