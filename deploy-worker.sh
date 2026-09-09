#!/usr/bin/env bash
set -e

echo "======================================================="
echo "⚡ Deploying Amul Stock Tracker to Cloudflare Workers"
echo "======================================================="

# Check Cloudflare authentication
echo "🔍 Checking Cloudflare authentication..."
if ! npx wrangler whoami &> /dev/null; then
  echo ""
  echo "⚠️  You are not logged in to Cloudflare / Wrangler."
  echo "👉 Please authenticate by running:"
  echo "     npx wrangler login"
  echo "   (or export CLOUDFLARE_API_TOKEN='your-cloudflare-token')"
  echo ""
  read -p "Would you like to run 'npx wrangler login' now? (y/N) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx wrangler login
  else
    echo "Exiting. Please log in to Cloudflare and re-run this script."
    exit 1
  fi
fi

echo "✅ Authenticated with Cloudflare:"
npx wrangler whoami

# Check if KV namespace needs to be created
if grep -q "AMUL_TRACKER_KV_PROD" wrangler.jsonc; then
  echo ""
  echo "📦 Creating production Cloudflare KV Namespace (AMUL_TRACKER_KV)..."
  KV_OUTPUT=$(npx wrangler kv namespace create AMUL_TRACKER_KV 2>&1)
  echo "$KV_OUTPUT"
  
  # Extract ID using grep/sed
  KV_ID=$(echo "$KV_OUTPUT" | grep -oE 'id = "[a-f0-9]+"' | head -n 1 | cut -d'"' -f2)
  
  if [ -n "$KV_ID" ]; then
    echo "✅ Created KV Namespace with ID: $KV_ID"
    echo "📝 Updating wrangler.jsonc with production KV ID..."
    sed -i '' "s/AMUL_TRACKER_KV_PROD/$KV_ID/g" wrangler.jsonc
  else
    echo "⚠️  Could not automatically extract KV ID. Please check output above."
  fi
fi

# Run deploy
echo ""
echo "🚀 Deploying Worker to Cloudflare..."
npx wrangler deploy

echo ""
echo "======================================================="
echo "🎉 Deployment successful!"
echo "Your Amul Stock Tracker & Admin Panel is now live on"
echo "Cloudflare Edge network, continuously scanning every minute!"
echo "======================================================="
