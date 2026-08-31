#!/bin/sh
# Generate runtime env-config.js from container environment variables.
# This runs before nginx starts, making REACT_APP_* available at runtime.

cat > /usr/share/nginx/html/env-config.js << EOF
window.env = {
  REACT_APP_API_URL: "${REACT_APP_API_URL:-http://localhost:8000}"
};
EOF

echo "Generated env-config.js:"
cat /usr/share/nginx/html/env-config.js

# Hand off to nginx
exec nginx -g "daemon off;"
