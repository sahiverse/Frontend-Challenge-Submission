/**
 * Web Vitals Performance Monitoring
 * 
 * This utility measures and reports Core Web Vitals metrics for the application.
 * Core Web Vitals are a set of metrics that Google uses to measure user experience.
 * 
 * @module reportWebVitals
 */

/**
 * Report Web Vitals Metrics
 * 
 * Dynamically imports the web-vitals library and measures key performance metrics.
 * The library is lazy-loaded to avoid impacting initial bundle size.
 * 
 * @param {Function} onPerfEntry - Callback function to handle performance metrics
 *                                  Receives metric objects with name, value, and other data
 * 
 * @example
 * // Log metrics to console
 * reportWebVitals(console.log);
 * 
 * @example
 * // Send metrics to analytics
 * reportWebVitals((metric) => {
 *   analytics.send({
 *     name: metric.name,
 *     value: metric.value,
 *     id: metric.id
 *   });
 * });
 */
const reportWebVitals = onPerfEntry => {
  // Only proceed if a valid callback function is provided
  if (onPerfEntry && onPerfEntry instanceof Function) {
    /**
     * Dynamically import web-vitals library
     * 
     * This lazy-loads the library only when needed, reducing initial bundle size.
     * The library measures five Core Web Vitals:
     * 
     * 1. CLS (Cumulative Layout Shift)
     *    - Measures visual stability
     *    - Good: < 0.1, Needs improvement: 0.1-0.25, Poor: > 0.25
     *    - Tracks unexpected layout shifts during page load
     * 
     * 2. FID (First Input Delay)
     *    - Measures interactivity
     *    - Good: < 100ms, Needs improvement: 100-300ms, Poor: > 300ms
     *    - Time from first user interaction to browser response
     * 
     * 3. FCP (First Contentful Paint)
     *    - Measures loading performance
     *    - Good: < 1.8s, Needs improvement: 1.8-3s, Poor: > 3s
     *    - Time when first content appears on screen
     * 
     * 4. LCP (Largest Contentful Paint)
     *    - Measures loading performance
     *    - Good: < 2.5s, Needs improvement: 2.5-4s, Poor: > 4s
     *    - Time when largest content element appears on screen
     * 
     * 5. TTFB (Time to First Byte)
     *    - Measures server response time
     *    - Good: < 800ms, Needs improvement: 800-1800ms, Poor: > 1800ms
     *    - Time from request to first byte of response
     */
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Measure Cumulative Layout Shift
      getCLS(onPerfEntry);
      // Measure First Input Delay
      getFID(onPerfEntry);
      // Measure First Contentful Paint
      getFCP(onPerfEntry);
      // Measure Largest Contentful Paint
      getLCP(onPerfEntry);
      // Measure Time to First Byte
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
