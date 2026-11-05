// The DAX Foundation's Organization record for search engines (schema.org
// JSON-LD), emitted on every page by src/components/SeoJsonLd.astro and
// referenced by @id from each /writing/ Article. One place, one shape.
//
// 2026-11-04 (SEO launch pass). The legal fields wait for the certificate.
//
// ========================================================================
// LEGAL PLACEHOLDERS -- THE ONLY SPOT TO EDIT WHEN THE CERTIFICATE ARRIVES
// ------------------------------------------------------------------------
// Filed for federal not-for-profit incorporation 4 Nov 2026 (request
// 21406706). Until the certificate exists, these stay as placeholders.
// Any value still in [BRACKETS] is LEFT OUT of the JSON-LD, so no
// placeholder ever reaches a search engine. To switch one on, replace the
// bracketed text with the real value from the certificate:
//   legalName   -- the exact corporate name on the certificate
//   foundingDate -- ISO date, e.g. 2026-11-05            ([INC-DATE])
//   identifier  -- the federal corporation number        ([CORP-NO])
// Never add "charity", "registered charity" or tax wording here.
// ========================================================================
export const LEGAL = {
  legalName: '[LEGAL-NAME]',
  foundingDate: '[INC-DATE]',
  identifier: '[CORP-NO]',
};

export const SITE = 'https://daxfoundation.org';
export const ORG_ID = SITE + '/#organization';
export const WEBSITE_ID = SITE + '/#website';

export const ORG = {
  name: 'DAX Foundation',
  url: SITE + '/',
  logo: SITE + '/logo.png',
  image: SITE + '/og.png',
  description: 'DAX: preservation and expansion of life, humanity, and consciousness.',
  sameAs: [
    'https://www.linkedin.com/in/jasonjeyanandan',
    'https://github.com/daxfoundation',
  ],
};

const isSet = (v) => typeof v === 'string' && v.trim() !== '' && !/^\[.*\]$/.test(v.trim());

export function organizationNode() {
  const node = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: ORG.name,
    url: ORG.url,
    logo: { '@type': 'ImageObject', url: ORG.logo, width: 512, height: 512 },
    image: ORG.image,
    description: ORG.description,
    sameAs: ORG.sameAs,
  };
  if (isSet(LEGAL.legalName)) node.legalName = LEGAL.legalName;
  if (isSet(LEGAL.foundingDate)) node.foundingDate = LEGAL.foundingDate;
  if (isSet(LEGAL.identifier)) {
    node.identifier = { '@type': 'PropertyValue', propertyID: 'Corporations Canada corporation number', value: LEGAL.identifier };
  }
  return node;
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: ORG.name,
    url: ORG.url,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
  };
}

// A reference other nodes (an Article's author/publisher) can carry.
export const orgRef = { '@type': 'Organization', '@id': ORG_ID, name: ORG.name, url: ORG.url };

// JSON for a <script type="application/ld+json">: "<" escaped so no string in
// the graph can close the script element.
export function jsonLdString(obj) {
  return JSON.stringify(obj).split('<').join('\\u003c');
}
