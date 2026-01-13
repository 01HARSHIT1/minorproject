# Universal AI Student Gateway

A secure automation and AI layer that sits between students and their college portals, enabling monitoring, notifications, and automated portal management.

## 🎯 What This Does

- **Monitor** your college portal automatically
- **Get notified** when important updates occur (results, notices, fees)
- **Control your portal** through the app (apply for exams, pay fees, etc.)
- **AI-powered insights** about your academic progress
- **Multi-channel notifications** (Push, WhatsApp, SMS, Email)

## 🏗️ Architecture

```
Mobile App / Web App
        |
        |
   API Gateway
        |
------------------------------------------------
|                Your Backend                  |
|                                              |
|  Auth Service     AI Service     Bot Manager  |
|                                              |
------------------------------------------------
        |
        |
Encrypted Credential Vault
        |
        |
Automation Workers (Headless Browsers)
        |
        |
College Portals (ERP, LMS, Exam, Results, Fees)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🔐 Security Features

- ✅ AES-256-GCM encryption for credentials
- ✅ Zero plaintext logging
- ✅ Tokenized user references
- ✅ Secure vault storage (AWS Secrets Manager compatible)
- ✅ Never expose portal credentials to frontend/AI
- ✅ JWT-based authentication
- ✅ User data isolation

## 🚀 Tech Stack

- **Backend**: NestJS (Node.js)
- **Frontend**: Next.js 14
- **Automation**: Playwright
- **Queue**: Redis + BullMQ
- **Database**: PostgreSQL
- **AI**: OpenAI / Claude
- **Notifications**: Firebase Push, Twilio WhatsApp

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

1. **Clone and install dependencies:**

```bash
npm run install:all
```

2. **Set up database and Redis:**

Using Docker (recommended):
```bash
docker-compose up -d
```

Or install PostgreSQL and Redis manually.

3. **Configure environment:**

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > frontend/.env.local
```

4. **Install Playwright browsers:**

```bash
cd backend
npx playwright install chromium
```

5. **Run the application:**

```bash
# Run both backend and frontend
npm run dev

# Or run separately
npm run dev:backend  # http://localhost:3001
npm run dev:frontend # http://localhost:3000
```

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## 📖 Usage

1. **Register/Login**: Go to http://localhost:3000/login
2. **Connect Portal**: Click "Connect Portal" and enter your college portal credentials
3. **Monitor**: View your portal data on the dashboard
4. **Actions**: Perform actions like applying for exams, paying fees, etc.

## ⚠️ Legal Notice

Users must authorize access to their portals. This system operates under delegated access principles, similar to financial aggregators like Zerodha, Mint, CRED.

**Important**: Always ensure you have proper authorization from users before accessing their portals. Include clear terms of service.

## 📁 Project Structure

```
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── auth/        # Authentication
│   │   ├── users/       # User management
│   │   ├── portals/    # Portal connections
│   │   ├── automation/ # Browser automation
│   │   ├── vault/       # Credential encryption
│   │   ├── ai/          # AI service
│   │   └── notifications/ # Notifications
│   └── package.json
├── frontend/            # Next.js frontend
│   ├── app/            # App router pages
│   ├── store/          # State management
│   └── lib/            # Utilities
├── docker-compose.yml   # Docker setup
└── README.md
```

## 🔧 Development

### Adding New Portal Connectors

1. Create connector in `backend/src/automation/connectors/`
2. Extend `BaseConnector`
3. Implement required methods
4. Add to `PortalType` enum
5. Register in `AutomationService`

See [SETUP.md](./SETUP.md) for detailed instructions.

### Environment Variables

See `backend/.env.example` for all required environment variables.

**Critical**: Set `ENCRYPTION_KEY` to exactly 32 characters for credential encryption.

## 🚀 Production Deployment

1. **Use AWS Secrets Manager** for credential storage (replace in-memory vault)
2. **Enable HTTPS** for all connections
3. **Set up monitoring** (CloudWatch, Prometheus)
4. **Configure rate limiting**
5. **Set up database backups**
6. **Use environment-specific configs**

See [SETUP.md](./SETUP.md) for production considerations.

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read the architecture documentation first.

## ⚡ Features

- ✅ Secure credential storage
- ✅ Automatic portal syncing
- ✅ Change detection and notifications
- ✅ AI-powered insights
- ✅ Portal action automation
- ✅ Multi-channel notifications
- ✅ Modern, responsive UI
- ✅ Real-time updates (coming soon)
