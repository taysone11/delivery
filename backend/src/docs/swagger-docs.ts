import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Express } from 'express';

const swaggerHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sushi Delivery API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi.yaml',
        dom_id: '#swagger-ui'
      });
    </script>
  </body>
</html>`;

/**
 * Регистрирует маршруты для OpenAPI-спецификации и Swagger UI.
 */
export function registerSwaggerDocs(app: Express): void {
  const openApiPath = join(process.cwd(), 'openapi.yaml');

  app.get('/openapi.yaml', (req, res) => {
    if (!existsSync(openApiPath)) {
      res.status(404).json({ error: 'OpenAPI file not found' });
      return;
    }

    res.sendFile(openApiPath);
  });

  app.get('/docs', (req, res) => {
    res.type('html').send(swaggerHtml);
  });
}
