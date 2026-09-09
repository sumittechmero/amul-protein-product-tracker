#!/usr/bin/env bash
set -e

echo "======================================================="
echo "🚀 Deploying Self-Hosted ntfy on Render via Render CLI"
echo "======================================================="

# Check Render CLI installation
if ! command -v render &> /dev/null; then
  echo "❌ Render CLI not found. Installing via Homebrew..."
  brew install render
fi

echo "🔍 Checking Render authentication..."
if ! render whoami &> /dev/null; then
  echo ""
  echo "⚠️  You are not logged in to Render CLI."
  echo "👉 Please authenticate by running:"
  echo "     render login"
  echo "   (or export RENDER_API_KEY='your-api-key')"
  echo ""
  read -p "Would you like to run 'render login' now? (y/N) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    render login
  else
    echo "Exiting. Please login to Render and re-run this script."
    exit 1
  fi
fi

echo "✅ Authenticated with Render:"
render whoami

# Check active workspace
echo ""
echo "🏢 Ensuring Render workspace is selected..."
render workspaces

SERVICE_NAME="${1:-amul-ntfy}"

echo ""
echo "📦 Creating web service '$SERVICE_NAME' on Render with Docker runtime from GitHub..."

render services create \
  --name "$SERVICE_NAME" \
  --type web_service \
  --repo "https://github.com/sumittechmero/amul-protein-product-tracker" \
  --branch "main" \
  --runtime docker \
  --plan free \
  --health-check-path "/v1/health" \
  --env-var "PORT=10000" \
  --env-var "NTFY_LISTEN_HTTP=:10000" \
  --env-var "NTFY_BEHIND_PROXY=true" \
  --env-var "NTFY_CACHE_DURATION=24h" \
  --env-var "NTFY_BASE_URL=https://${SERVICE_NAME}.onrender.com" \
  --env-var "NTFY_UPSTREAM_BASE_URL=https://ntfy.sh" \
  --confirm

echo ""
echo "======================================================="
echo "🎉 ntfy deployment initiated on Render!"
echo "Your service will be live at: https://${SERVICE_NAME}.onrender.com"
echo "Once deployed, copy your URL into your Worker Admin Panel"
echo "under 'ntfy Push Alerts'!"
echo "======================================================="
