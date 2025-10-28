#!/usr/bin/env node

/**
 * Chrome Web Store OAuth Refresh Token Generator
 *
 * This script helps you generate a refresh token for the Chrome Web Store API.
 *
 * Prerequisites:
 * 1. Create a .env file in the project root with:
 *    CHROME_CLIENT_ID=your_client_id
 *    CHROME_CLIENT_SECRET=your_client_secret
 * 2. Make sure you've added yourself as a test user in Google Cloud Console
 *
 * Usage:
 *   node scripts/generate-refresh-token.js
 */

const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  }
}

loadEnv();

// Configuration
const CLIENT_ID = process.env.CHROME_CLIENT_ID;
const CLIENT_SECRET = process.env.CHROME_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8080/oauth2callback';
const SCOPE = 'https://www.googleapis.com/auth/chromewebstore';
const PORT = 8080;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateConfig() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    log('❌ Error: Missing required environment variables!', 'red');
    log('\nPlease create a .env file in the project root with:', 'yellow');
    log('CHROME_CLIENT_ID=your_client_id_here');
    log('CHROME_CLIENT_SECRET=your_client_secret_here');
    log('\nOr export them as environment variables:', 'yellow');
    log('export CHROME_CLIENT_ID=your_client_id_here');
    log('export CHROME_CLIENT_SECRET=your_client_secret_here');
    process.exit(1);
  }
}

function makeHttpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

async function exchangeCodeForToken(code) {
  log('\n📡 Exchanging authorization code for tokens...', 'cyan');

  const postData = new URLSearchParams({
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  }).toString();

  const options = {
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  try {
    const response = await makeHttpsRequest(options, postData);
    return response;
  } catch (error) {
    log(`❌ Failed to exchange code for token: ${error.message}`, 'red');
    throw error;
  }
}

function startLocalServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url, true);

      if (parsedUrl.pathname === '/oauth2callback') {
        const code = parsedUrl.query.code;
        const error = parsedUrl.query.error;

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
                <h1 style="color: #d32f2f;">❌ Authorization Failed</h1>
                <p>Error: ${error}</p>
                <p>You can close this window and check the terminal.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (code) {
          try {
            const tokens = await exchangeCodeForToken(code);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
                  <h1 style="color: #4caf50;">✅ Authorization Successful!</h1>
                  <p>Your refresh token has been generated.</p>
                  <p>Check the terminal for your tokens.</p>
                  <p style="margin-top: 20px; color: #666;">You can close this window now.</p>
                </body>
              </html>
            `);

            server.close();
            resolve(tokens);
          } catch (error) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
                  <h1 style="color: #d32f2f;">❌ Token Exchange Failed</h1>
                  <p>${error.message}</p>
                  <p>You can close this window and check the terminal.</p>
                </body>
              </html>
            `);
            server.close();
            reject(error);
          }
        }
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(PORT, () => {
      log(`\n🚀 Local server started on http://localhost:${PORT}`, 'green');
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        log(`❌ Port ${PORT} is already in use. Please close other applications using this port.`, 'red');
      } else {
        log(`❌ Server error: ${error.message}`, 'red');
      }
      reject(error);
    });
  });
}

function generateAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function main() {
  log('╔════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   Chrome Web Store OAuth Refresh Token Generator              ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════╝', 'cyan');

  // Validate configuration
  validateConfig();

  log('\n✅ Configuration loaded:', 'green');
  log(`   Client ID: ${CLIENT_ID.substring(0, 20)}...`);
  log(`   Client Secret: ${CLIENT_SECRET.substring(0, 10)}...`);

  log('\n⚠️  Important Reminders:', 'yellow');
  log('   1. Make sure you added yourself as a test user in Google Cloud Console');
  log('   2. OAuth consent screen must include the scope: https://www.googleapis.com/auth/chromewebstore');
  log('   3. Authorized redirect URI must include: http://localhost:8080/oauth2callback');

  log('\n📋 Starting OAuth flow...', 'bright');

  try {
    // Start local server
    const tokenPromise = startLocalServer();

    // Generate and display authorization URL
    const authUrl = generateAuthUrl();
    log('\n🔗 Please open this URL in your browser:', 'bright');
    log(authUrl, 'blue');
    log('\n💡 Tip: The browser should open automatically on macOS/Linux', 'cyan');

    // Try to open browser automatically
    const open = require('child_process').exec;
    const command = process.platform === 'darwin' ? 'open' :
                    process.platform === 'win32' ? 'start' : 'xdg-open';
    open(`${command} "${authUrl}"`);

    // Wait for authorization
    log('\n⏳ Waiting for authorization...', 'yellow');
    const tokens = await tokenPromise;

    // Display results
    log('\n╔════════════════════════════════════════════════════════════════╗', 'green');
    log('║                  ✅ SUCCESS! Tokens Generated                  ║', 'green');
    log('╚════════════════════════════════════════════════════════════════╝', 'green');

    log('\n📝 Your OAuth Tokens:', 'bright');
    log('─────────────────────────────────────────────────────────────────');

    if (tokens.refresh_token) {
      log('\n🔑 REFRESH TOKEN (use this in GitHub Secrets):', 'green');
      log(tokens.refresh_token, 'bright');
    } else {
      log('\n⚠️  No refresh token received!', 'yellow');
      log('This usually means you\'re reusing an already-authorized client.', 'yellow');
      log('Try revoking access at https://myaccount.google.com/permissions', 'yellow');
      log('and run this script again.', 'yellow');
    }

    log('\n🎫 Access Token (temporary, expires in 1 hour):', 'cyan');
    log(tokens.access_token.substring(0, 50) + '...', 'bright');

    log('\n📋 Next Steps:', 'bright');
    log('─────────────────────────────────────────────────────────────────');
    log('1. Copy the REFRESH TOKEN above');
    log('2. Go to GitHub → Repository Settings → Secrets and variables → Actions');
    log('3. Create a new secret: CHROME_REFRESH_TOKEN');
    log('4. Paste the refresh token as the value');
    log('5. Make sure you also have these secrets configured:');
    log('   - CHROME_CLIENT_ID');
    log('   - CHROME_CLIENT_SECRET');
    log('   - CHROME_EXTENSION_ID');

    // Save to .env.local for reference
    const envLocalPath = path.join(__dirname, '..', '.env.local');
    const envContent = `# Generated OAuth tokens (${new Date().toISOString()})
CHROME_REFRESH_TOKEN=${tokens.refresh_token || 'NOT_GENERATED'}
CHROME_ACCESS_TOKEN=${tokens.access_token}
# Note: Access token expires in ${tokens.expires_in} seconds (approximately 1 hour)
`;
    fs.writeFileSync(envLocalPath, envContent);
    log(`\n💾 Tokens saved to .env.local for reference`, 'cyan');
    log('   ⚠️  Do NOT commit this file to git!', 'yellow');

  } catch (error) {
    log('\n❌ Error:', 'red');
    log(error.message, 'red');

    if (error.message.includes('403') || error.message.includes('access_denied')) {
      log('\n💡 Troubleshooting:', 'yellow');
      log('   This usually means you\'re not added as a test user.');
      log('   Go to: Google Cloud Console → APIs & Services → OAuth consent screen');
      log('   Scroll to "Test users" and add your email address.');
    } else if (error.message.includes('redirect_uri_mismatch')) {
      log('\n💡 Troubleshooting:', 'yellow');
      log('   The redirect URI is not authorized.');
      log('   Go to: Google Cloud Console → APIs & Services → Credentials');
      log('   Edit your OAuth 2.0 Client ID');
      log(`   Add this URI to "Authorized redirect URIs": ${REDIRECT_URI}`);
    }

    process.exit(1);
  }
}

// Run the script
main();
