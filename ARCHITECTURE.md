# System Architecture

## Overview

The Universal AI Student Gateway is a secure automation layer that sits between students and their college portals. It provides monitoring, notifications, and automated portal management capabilities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  - Dashboard                                                 │
│  - Portal Management                                         │
│  - Real-time Updates                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  API Gateway (NestJS)                        │
│  - Authentication (JWT)                                      │
│  - Request Validation                                        │
│  - Rate Limiting                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌────▼─────────┐
│ Auth Service │ │ Portals    │ │ AI Service   │
│              │ │ Service     │ │              │
└──────────────┘ └─────┬──────┘ └──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌────▼─────────┐
│ Vault        │ │ Automation │ │ Notifications│
│ Service      │ │ Service    │ │ Service      │
└──────┬───────┘ └─────┬──────┘ └──────────────┘
       │                │
       │                │
┌──────▼────────────────▼──────────────────────┐
│         Encrypted Credential Store           │
│  (Development: In-Memory)                   │
│  (Production: AWS Secrets Manager)           │
└──────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│      Automation Workers (Playwright)         │
│  - Headless Browsers                         │
│  - Portal Connectors                         │
│  - Action Executors                           │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│         College Portals (External)          │
│  - ERP Systems                               │
│  - LMS Platforms                             │
│  - Exam Portals                              │
└──────────────────────────────────────────────┘
```

## Core Components

### 1. Authentication & Authorization

- **JWT-based authentication**
- **Password hashing** with bcrypt
- **Token-based credential storage** (never store plaintext passwords)

### 2. Secure Vault Service

- **AES-256-GCM encryption** for credentials
- **Tokenized references** in database
- **Zero plaintext logging**
- **Production-ready**: AWS Secrets Manager integration ready

### 3. Portal Automation Engine

- **Playwright-based** browser automation
- **Modular connectors** for different portals
- **Headless browser** execution
- **Screenshot capture** for verification

### 4. State Management

- **Portal state snapshots** stored in PostgreSQL
- **Hash-based change detection** (SHA-256)
- **Historical tracking** of all changes
- **Efficient polling** with configurable intervals

### 5. AI Service Layer

- **OpenAI/Claude integration** for insights
- **Risk assessment** (low/medium/high)
- **Automated recommendations**
- **Action decision making**

### 6. Notification Engine

- **Multi-channel support**:
  - Firebase Push Notifications
  - WhatsApp (Twilio)
  - SMS (Twilio)
  - Email (SMTP)
- **Configurable preferences** per user
- **Batch notifications** for efficiency

### 7. Scheduled Jobs

- **Automatic portal syncing** (every 15 minutes)
- **Configurable per connection**
- **Retry logic** for failed syncs
- **Background processing**

## Data Flow

### Portal Connection Flow

1. User enters portal credentials
2. Credentials encrypted with AES-256-GCM
3. Encrypted data stored in vault
4. Token reference stored in database
5. Connection created and activated

### Portal Sync Flow

1. Scheduler triggers sync job
2. Retrieve encrypted credentials from vault
3. Decrypt credentials (bot use only)
4. Launch headless browser
5. Login to portal
6. Scrape portal data
7. Compare with previous state
8. Store new state
9. If changes detected:
   - Analyze with AI
   - Send notifications
   - Update dashboard

### Action Execution Flow

1. User requests action (e.g., "Apply for exam")
2. AI analyzes if action is safe/appropriate
3. Retrieve credentials from vault
4. Launch browser automation
5. Perform action on portal
6. Capture screenshot for verification
7. Return result to user

## Security Measures

### Credential Security

- ✅ **Never stored in plaintext**
- ✅ **AES-256-GCM encryption**
- ✅ **Tokenized references only**
- ✅ **Zero logging of credentials**
- ✅ **Separate vault service**

### API Security

- ✅ **JWT authentication**
- ✅ **HTTPS only (production)**
- ✅ **Input validation**
- ✅ **Rate limiting** (to be added)
- ✅ **CORS configuration**

### Data Security

- ✅ **Encrypted at rest** (database)
- ✅ **Encrypted in transit** (HTTPS)
- ✅ **User isolation** (user_id checks)
- ✅ **Audit logging** (to be added)

## Scalability Considerations

### Horizontal Scaling

- **Stateless API servers** (can scale horizontally)
- **Shared database** (PostgreSQL)
- **Shared cache** (Redis)
- **Queue-based workers** (BullMQ)

### Performance Optimization

- **Connection pooling** (database)
- **Redis caching** (frequently accessed data)
- **Batch processing** (notifications)
- **Async operations** (non-blocking)

### Resource Management

- **Browser instance pooling** (reuse browsers)
- **Connection limits** (prevent overload)
- **Timeout handling** (prevent hanging)
- **Memory management** (cleanup resources)

## Deployment Architecture

### Development

- Single server running all services
- In-memory credential storage
- Local PostgreSQL and Redis

### Production

- **API Servers**: Multiple instances behind load balancer
- **Workers**: Separate worker processes/containers
- **Database**: PostgreSQL with read replicas
- **Cache**: Redis Cluster
- **Secrets**: AWS Secrets Manager
- **Monitoring**: CloudWatch / Prometheus
- **Logging**: CloudWatch Logs / ELK Stack

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL 15 |
| Cache/Queue | Redis 7, BullMQ |
| Automation | Playwright |
| AI | OpenAI GPT-4 / Claude |
| Notifications | Firebase, Twilio |
| Encryption | Node.js crypto (AES-256-GCM) |
| Authentication | JWT, Passport.js |

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live updates
2. **Mobile App**: React Native mobile application
3. **Advanced AI**: Custom ML models for predictions
4. **Analytics**: Student progress analytics
5. **Multi-language**: Internationalization support
6. **Plugin System**: Community-contributed connectors
