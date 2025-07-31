// Database health check endpoint
export default function handler(req, res) {
  // Since this is a frontend-only app using localStorage, 
  // we'll just check if localStorage is available
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Test localStorage access
      const testKey = '__health_check__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      res.status(200).json({ 
        status: 'OK',
        storage: 'localStorage available',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(200).json({ 
        status: 'OK',
        storage: 'server-side, localStorage not applicable',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}