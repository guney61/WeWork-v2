// Vite plugin for GitHub OAuth token exchange
// This runs on the dev server and handles the /api/github/token endpoint

export function githubAuthPlugin(clientSecret: string) {
    return {
        name: 'github-auth',
        configureServer(server: any) {
            server.middlewares.use(async (req: any, res: any, next: any) => {
                // Handle token exchange endpoint
                if (req.url === '/api/github/token' && req.method === 'POST') {
                    try {
                        let body = '';
                        req.on('data', (chunk: any) => {
                            body += chunk.toString();
                        });

                        req.on('end', async () => {
                            try {
                                const { code } = JSON.parse(body);

                                if (!code) {
                                    res.statusCode = 400;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ error: 'Missing code' }));
                                    return;
                                }

                                // Exchange code for access token
                                const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                                    method: 'POST',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        client_id: 'Ov23liKYLdv73mijMQ5X',
                                        client_secret: '04795caddacafe1a21160db6d67e019b8dd8abea',
                                        code: code,
                                    }),
                                });

                                const tokenData = await tokenResponse.json();

                                if (tokenData.error) {
                                    res.statusCode = 400;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ error: tokenData.error_description || tokenData.error }));
                                    return;
                                }

                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ access_token: tokenData.access_token }));
                            } catch (err: any) {
                                console.error('Token exchange error:', err);
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: err.message }));
                            }
                        });
                    } catch (err: any) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: err.message }));
                    }
                    return;
                }

                next();
            });
        },
    };
}
