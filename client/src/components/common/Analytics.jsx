import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Simple analytics component (replace with your analytics service)
export const Analytics = () => {
  const location = useLocation()

  useEffect(() => {
    // Track page view
    const trackPageView = () => {
      console.log(`[Analytics] Page view: ${location.pathname}`)
      
      // Example: Send to Google Analytics
      if (window.gtag) {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: location.pathname,
        })
      }
      
      // Example: Send to custom analytics endpoint
      if (import.meta.env.PROD) {
        fetch('/api/analytics/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: location.pathname,
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
          }),
        }).catch(console.error)
      }
    }

    trackPageView()
  }, [location])

  // Track performance metrics
  useEffect(() => {
    if ('performance' in window && import.meta.env.PROD) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('[Analytics] LCP:', entry.startTime)
          }
        }
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      
      return () => observer.disconnect()
    }
  }, [])

  return null
}