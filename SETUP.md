# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Playwright browsers (installed automatically)

## Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install Playwright browsers
cd ../backend
npx playwright install chromium
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE student_gateway;
```

### 3. Environment Configuration

#### Backend (.env)

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=student_gateway

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT - Generate a strong secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Encryption - MUST be exactly 32 characters
ENCRYPTION_KEY=your-32-character-encryption-key!!

# OpenAI (optional, for AI features)
OPENAI_API_KEY=your-openai-api-key

# Firebase (optional, for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Twilio (optional, for WhatsApp/SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend (.env.local)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run Services

#### Start PostgreSQL and Redis

```bash
# PostgreSQL (varies by OS)
# Windows: Start PostgreSQL service
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Redis
# Windows: Download and run Redis
# Mac: brew services start redis
# Linux: sudo systemctl start redis
```

#### Start Backend

```bash
cd backend
npm run start:dev
```

Backend will run on http://localhost:3001

#### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:3000

## Usage

1. **Register/Login**: Go to http://localhost:3000/login
2. **Connect Portal**: Click "Connect Portal" and enter your college portal credentials
3. **Monitor**: View your portal data on the dashboard
4. **Actions**: Perform actions like applying for exams, paying fees, etc.

## Production Considerations

### Security

1. **Secrets Management**: Replace in-memory vault with AWS Secrets Manager or Hashicorp Vault
2. **Environment Variables**: Use secure secret management (AWS Parameter Store, etc.)
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Add rate limiting to API endpoints
5. **Input Validation**: All inputs are validated, but review for your use case

### Scaling

1. **Database**: Use connection pooling, read replicas for heavy loads
2. **Redis**: Use Redis Cluster for high availability
3. **Workers**: Run automation workers in separate processes/containers
4. **Load Balancing**: Use nginx or AWS ALB for load balancing

### Monitoring

1. **Logging**: Add structured logging (Winston, Pino)
2. **Metrics**: Add Prometheus metrics
3. **Error Tracking**: Integrate Sentry or similar
4. **Health Checks**: Add health check endpoints

## Architecture Notes

- **Credentials**: Never stored in plaintext, always encrypted
- **Automation**: Uses headless browsers (Playwright) to interact with portals
- **Polling**: Automatic sync every 15 minutes (configurable per connection)
- **Notifications**: Multi-channel (Push, WhatsApp, SMS, Email)
- **AI**: Optional AI layer for insights and recommendations

## Adding New Portal Connectors

1. Create a new connector in `backend/src/automation/connectors/`
2. Extend `BaseConnector`
3. Implement `login()`, `scrapeData()`, and `performAction()` methods
4. Add portal type to `PortalType` enum
5. Register in `AutomationService.createConnector()`

Example:

```typescript
// backend/src/automation/connectors/custom.connector.ts
export class CustomConnector extends BaseConnector {
  async login(credentials: PortalCredentials): Promise<boolean> {
    // Implement login logic
  }
  
  async scrapeData(): Promise<PortalData> {
    // Implement data scraping
  }
  
  async performAction(action: string, params: Record<string, any>): Promise<any> {
    // Implement actions
  }
}
```

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running
- Verify credentials in `.env`
- Check database exists

### Redis Connection Issues
- Check Redis is running: `redis-cli ping`
- Verify host/port in `.env`

### Playwright Issues
- Run `npx playwright install chromium` in backend directory
- Check system dependencies for headless browser

### Portal Connection Fails
- Verify portal URL is correct
- Check credentials are valid
- Review connector implementation for your portal type
- Check browser console logs in automation service
