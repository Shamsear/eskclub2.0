/**
 * Lighthouse CI Configuration
 * 
 * This configuration defines performance budgets and audit settings
 * for the public sports platform.
 */

module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/tournaments',
        'http://localhost:3000/players',
        'http://localhost:3000/clubs',
        'http://localhost:3000/matches',
      ],
      // Number of runs per URL
      numberOfRuns: 3,
      settings: {
        // Emulate mobile device
        preset: 'desktop',
        // Throttling settings
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      // Performance budgets
      assertions: {
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3500 }],
        
        // Performance score
        'categories:performance': ['error', { minScore: 0.9 }],
        
        // Accessibility score
        'categories:accessibility': ['error', { minScore: 0.95 }],
        
        // Best practices score
        'categories:best-practices': ['error', { minScore: 0.9 }],
        
        // SEO score
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Specific audits
        'uses-responsive-images': 'error',
        'offscreen-images': 'warn',
        'uses-optimized-images': 'warn',
        'modern-image-formats': 'warn',
        'uses-text-compression': 'error',
        'uses-rel-preconnect': 'warn',
        'font-display': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'efficient-animated-content': 'warn',
        'duplicated-javascript': 'warn',
        'legacy-javascript': 'warn',
        
        // Accessibility audits
        'color-contrast': 'error',
        'image-alt': 'error',
        'button-name': 'error',
        'link-name': 'error',
        'label': 'error',
        'aria-valid-attr': 'error',
        'aria-required-attr': 'error',
        'aria-roles': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',
        'tabindex': 'error',
        
        // Best practices
        'errors-in-console': 'warn',
        'no-vulnerable-libraries': 'error',
        'uses-http2': 'warn',
        'uses-passive-event-listeners': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
