# Industrial AI Copilot Setup Script for Windows

Write-Host "🚀 Industrial AI Copilot Setup" -ForegroundColor Green
Write-Host ""

# Check if Docker is installed
Write-Host "1️⃣ Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is available
Write-Host "2️⃣ Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "   ✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker Compose not found." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL
Write-Host "3️⃣ Starting PostgreSQL with Docker..." -ForegroundColor Yellow
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
Write-Host "4️⃣ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    $attempt++
    Start-Sleep -Seconds 2
    $ready = docker-compose exec -T postgres pg_isready -U copilot -d copilot_db 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ PostgreSQL is ready!" -ForegroundColor Green
        break
    }
    Write-Host "   ⏳ Attempt $attempt/$maxAttempts..." -ForegroundColor Yellow
} while ($attempt -lt $maxAttempts)

if ($attempt -eq $maxAttempts) {
    Write-Host "   ❌ PostgreSQL failed to start" -ForegroundColor Red
    exit 1
}

# Set up environment
Write-Host "5️⃣ Setting up environment..." -ForegroundColor Yellow
Set-Location backend
if (!(Test-Path ".env")) {
    Copy-Item ".env.docker" ".env"
    Write-Host "   ✅ Created .env file from template" -ForegroundColor Green
    Write-Host "   ⚠️  Please edit .env and add your API keys!" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ .env file already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "6️⃣ Installing dependencies..." -ForegroundColor Yellow
npm install

# Set up database
Write-Host "7️⃣ Setting up database schema..." -ForegroundColor Yellow
node setup-database.js

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Edit backend/.env and add your API keys:"
Write-Host "      - GEMINI_API_KEY=your_key"
Write-Host "      - GROQ_API_KEY=your_key"
Write-Host ""
Write-Host "   2. Test the system:"
Write-Host "      node test-complete-system.js"
Write-Host ""
Write-Host "   3. Start the backend:"
Write-Host "      npm start"
Write-Host ""
Write-Host "   4. Test the APIs:"
Write-Host "      node test-api-endpoints.js"
Write-Host ""

Set-Location ..