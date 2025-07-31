// This API endpoint handles the root path redirect
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return HTML that redirects to the actual frontend app
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Claude Codespace - Loading...</title>
          <meta http-equiv="refresh" content="0; url=/index">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, sans-serif;
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .loader {
              text-align: center;
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #334155;
              border-top: 4px solid #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            h1 {
              margin: 0 0 10px;
              font-size: 24px;
              font-weight: 600;
            }
            p {
              margin: 0;
              color: #94a3b8;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <h1>Claude 4 Codespace</h1>
            <p>Loading your AI-powered development environment...</p>
          </div>
          <script>
            // Fallback redirect in case meta refresh doesn't work
            setTimeout(() => {
              if (window.location.pathname === '/api') {
                window.location.href = '/';
              }
            }, 1000);
          </script>
        </body>
      </html>
    `);
  } else {
    // For other methods, return frontend info
    res.status(200).json({
      message: "Claude Codespace Frontend",
      version: "1.0.0",
      status: "running",
      note: "This is the frontend application. Visit the main page for the full UI.",
      redirect: "/index"
    });
  }
}