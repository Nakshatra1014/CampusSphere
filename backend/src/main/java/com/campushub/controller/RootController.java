package com.campushub.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String index() {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>CampusHub API Backend</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
                    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; max-width: 600px; width: 100%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                    h1 { color: #1976d2; margin-top: 0; font-size: 24px; }
                    .badge { display: inline-block; background: #edf7ed; color: #2e7d32; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
                    p { line-height: 1.6; color: #475569; font-size: 15px; }
                    .btn { display: inline-block; background: #1976d2; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; margin-top: 16px; margin-right: 10px; }
                    .btn-outline { background: #ffffff; color: #1976d2; border: 1px solid #1976d2; }
                    .links { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>CampusHub REST API Server</h1>
                    <div class="badge">● Backend Online (Port 8080)</div>
                    <p>
                        The <strong>Spring Boot 3</strong> backend server is active and serving REST APIs for the <strong>CampusHub</strong> platform.
                    </p>
                    <p>
                        To access the full web application interface, open the React portal on <strong>Port 3000</strong>:
                    </p>
                    <div>
                        <a href="http://localhost:3000" class="btn" target="_blank">Open React Web Portal 🚀</a>
                        <a href="/h2-console" class="btn btn-outline" target="_blank">Open H2 DB Console 🗄️</a>
                    </div>
                    <div class="links">
                        <strong>API Base:</strong> <code>/api</code> | <strong>Version:</strong> 1.0.0
                    </div>
                </div>
            </body>
            </html>
            """;
    }

    @GetMapping("/api")
    public Map<String, Object> apiInfo() {
        return Map.of(
                "status", "UP",
                "app", "CampusHub REST API",
                "version", "1.0.0",
                "frontendUrl", "http://localhost:3000"
        );
    }
}
