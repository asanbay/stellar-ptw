// Polyfill для Spark KV в production
declare global {
  interface Window {
    _sparkKVFallback?: boolean
  }
}

if (typeof window !== 'undefined' && !window.location.href.includes('localhost')) {
  // В production Spark KV недоступен, используем localStorage
  window._sparkKVFallback = true;
}
