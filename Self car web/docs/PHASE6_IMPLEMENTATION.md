# Phase 6: Optimization, Monetization & Scaling Implementation

## Overview

Phase 6 focuses on achieving scalability, financial sustainability, and performance optimization through:

1. **Performance Optimization** - Load balancing, microservices architecture, CI/CD pipelines
2. **Monetization Strategies** - Transaction fees, premium subscriptions, ad placements
3. **Internationalization** - Multi-language and multi-currency support for ASEAN expansion

## Database Schema

All Phase 6 database tables are defined in `database/phase6_schema.sql`. Run this SQL file to create the required tables:

```bash
mysql -u root -p selfcar_db < database/phase6_schema.sql
```

### Key Tables

#### Monetization
- `subscription_plans` - Subscription tier definitions
- `dealer_subscriptions` - Active dealer subscriptions
- `subscription_payments` - Subscription payment history
- `transaction_fee_configs` - Fee configuration (1-3% based on tier)
- `transaction_fees` - Calculated transaction fees
- `ad_packages` - Ad placement packages
- `ad_purchases` - Ad purchase records
- `ad_impressions` - Ad impression tracking
- `ad_clicks` - Ad click tracking

#### Internationalization
- `supported_languages` - Available languages (Vietnamese, English, Thai, etc.)
- `supported_currencies` - Supported currencies (VND, USD, THB, etc.)
- `currency_exchange_rates` - Exchange rate history
- `user_language_preferences` - User language settings
- `user_currency_preferences` - User currency settings
- `regional_markets` - Market configurations (Vietnam, Thailand, etc.)
- `translations` - Translation content

#### Performance
- `cache_metrics` - Cache performance metrics
- `api_performance_logs` - API performance monitoring

## Backend Implementation

### Package Structure

```
com.selfcar/
├── model/
│   ├── monetization/      # Subscription, fees, ads
│   └── i18n/              # Language, currency, translations
├── repository/
│   ├── monetization/      # Monetization repositories
│   └── i18n/              # i18n repositories
├── service/
│   ├── monetization/      # Subscription, fee, ad services
│   └── i18n/              # i18n services
└── controller/
    ├── monetization/      # Monetization controllers
    └── i18n/              # i18n controllers
```

## API Endpoints

### Subscription Management

```
GET    /api/subscriptions/plans                    # Get all subscription plans
GET    /api/subscriptions/plans/{id}              # Get plan by ID
GET    /api/subscriptions/users/{userId}          # Get user subscriptions
GET    /api/subscriptions/users/{userId}/active   # Get active subscription
POST   /api/subscriptions/subscribe               # Create subscription
POST   /api/subscriptions/{id}/cancel             # Cancel subscription
```

### Transaction Fees

Transaction fees are automatically calculated and applied during payment processing. Fee calculation is handled by `TransactionFeeService`.

### Ad Placement

```
GET    /api/ads/packages                          # Get all ad packages
GET    /api/ads/packages/{id}                     # Get package by ID
POST   /api/ads/purchase                          # Purchase ad package
GET    /api/ads/purchases/user/{userId}           # Get user ad purchases
GET    /api/ads/purchases/{id}/metrics            # Get ad metrics
```

### Internationalization

```
GET    /api/i18n/languages                        # Get active languages
GET    /api/i18n/languages/default                # Get default language
GET    /api/i18n/currencies                       # Get active currencies
GET    /api/i18n/currencies/default               # Get default currency
GET    /api/i18n/convert-currency                 # Convert currency
GET    /api/i18n/translations/{languageCode}      # Get all translations
GET    /api/i18n/translate                        # Translate key
```

## Key Features

### 1. Premium Subscription System

**Subscription Tiers:**
- **Basic**: Free - 50 listings, 3 users
- **Pro**: 500,000 VND/month - 200 listings, 10 users, featured listings, 0.5% fee discount
- **Premium**: 1,500,000 VND/month - 500 listings, 25 users, API access, 1% fee discount
- **Enterprise**: 5,000,000 VND/month - Unlimited listings/users, custom features, 2% fee discount

**Features:**
- Monthly/Yearly billing cycles
- Auto-renewal
- Subscription management
- Feature unlocking based on tier

### 2. Transaction Fee System

**Fee Structure:**
- Basic tier: 3% transaction fee
- Pro tier: 2.5% transaction fee (0.5% discount)
- Premium tier: 2% transaction fee (1% discount)
- Enterprise tier: 1% transaction fee (2% discount)

**Features:**
- Dynamic fee calculation based on subscription tier
- Automatic fee collection
- Fee tracking and reporting
- Configurable fee rates

### 3. Ad Placement Packages

**Ad Types:**
- Featured listings
- Banner ads
- Sponsored listings
- Homepage placement
- Search result placement
- Carousel ads

**Features:**
- Package-based pricing
- Impression and click tracking
- Cost-per-click (CPC) calculation
- Performance metrics

### 4. Internationalization (i18n)

**Supported Languages:**
- Vietnamese (vi) - Default
- English (en)
- Thai (th)
- Indonesian (id)
- Malay (ms)
- Chinese (zh)

**Supported Currencies:**
- VND (Vietnamese Dong) - Default
- USD (US Dollar)
- THB (Thai Baht)
- IDR (Indonesian Rupiah)
- MYR (Malaysian Ringgit)
- SGD (Singapore Dollar)
- PHP (Philippine Peso)

**Features:**
- Multi-language content
- Currency conversion
- User preferences
- Regional market support
- Translation management

### 5. Regional Expansion Roadmap

**Phase 1: Vietnam (Current)**
- Status: Active
- Language: Vietnamese
- Currency: VND

**Phase 2: Thailand (Month 20-21)**
- Language: Thai
- Currency: THB
- Market code: TH

**Phase 3: Indonesia (Month 22-23)**
- Language: Indonesian
- Currency: IDR
- Market code: ID

**Phase 4: Malaysia & Singapore (Month 24)**
- Languages: Malay, English
- Currencies: MYR, SGD
- Market codes: MY, SG

**Phase 5: Philippines (Month 25+)**
- Language: English
- Currency: PHP
- Market code: PH

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline is configured in `.github/workflows/ci-cd.yml`:

**Stages:**
1. **Test**: Run backend and frontend tests
2. **Build**: Build Docker images
3. **Deploy**: Deploy to production

**Features:**
- Automated testing
- Docker image building
- Container registry push
- Deployment automation

### Docker Configuration

**Backend Dockerfile:**
- Base: OpenJDK 17
- Multi-stage build for optimization
- Exposes port 8080

**Frontend Dockerfile:**
- Base: Node 18 Alpine
- Build stage: npm build
- Serve stage: Nginx
- Exposes port 80

**Docker Compose:**
- Backend service
- Frontend service
- MySQL database
- Redis cache
- Nginx load balancer

## Performance Optimization

### Caching Strategy

**Redis Cache:**
- Car listings cache
- User session cache
- Translation cache
- Currency exchange rates cache

**Cache Invalidation:**
- Time-based expiration
- Event-based invalidation
- Manual cache clearing

### Database Optimization

**Indexing:**
- Foreign key indexes
- Frequently queried columns
- Composite indexes for complex queries

**Query Optimization:**
- Query result pagination
- Lazy loading for relationships
- Batch operations for bulk updates

### Load Balancing

**Nginx Configuration:**
- Round-robin load balancing
- Health check endpoints
- SSL/TLS termination
- Static asset serving

## Microservices Architecture

See `docs/MICROSERVICES_ROADMAP.md` for detailed microservices architecture plan.

**Key Services:**
1. API Gateway
2. User Service
3. Car Service
4. Order Service
5. Payment Service
6. Subscription Service
7. Notification Service
8. Analytics Service
9. Ecosystem Service
10. Integration Service

## Deployment

### Local Development

```bash
# Start all services with Docker Compose
docker-compose up -d

# Run database migrations
mysql -u root -p selfcar_db < database/phase6_schema.sql
```

### Production Deployment

1. **Build Docker Images:**
```bash
docker build -t selfcar-backend ./backend
docker build -t selfcar-frontend ./frontend
```

2. **Push to Registry:**
```bash
docker push registry/selfcar-backend:latest
docker push registry/selfcar-frontend:latest
```

3. **Deploy to Kubernetes:**
```bash
kubectl apply -f k8s/
```

## Monitoring & Observability

### Metrics Collection
- API response times
- Error rates
- Service availability
- Database performance
- Cache hit rates

### Logging
- Centralized logging with ELK Stack
- Structured logging (JSON format)
- Log aggregation and analysis

### Alerting
- Service downtime alerts
- High error rate alerts
- Performance degradation alerts
- Resource usage alerts

## Testing

### Unit Tests
- Service layer tests
- Repository tests
- Model validation tests

### Integration Tests
- API endpoint tests
- Database integration tests
- External service mock tests

### Performance Tests
- Load testing
- Stress testing
- Endurance testing

## Security

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- API key management for external integrations

### Data Protection
- Encryption at rest
- Encryption in transit (TLS/SSL)
- PII data masking
- Regular security audits

## Cost Optimization

### Resource Management
- Right-sizing containers
- Auto-scaling based on load
- Database connection pooling
- CDN for static assets

### Monitoring
- Cost tracking per service
- Resource utilization monitoring
- Cost alerting

## Future Enhancements

1. **Advanced Analytics**: ML-based demand prediction
2. **Real-time Features**: WebSocket for real-time updates
3. **Mobile Apps**: Native iOS and Android apps
4. **Advanced Search**: Elasticsearch integration
5. **Event Sourcing**: For audit trails and event replay

## Summary

Phase 6 successfully implements:

✅ **Monetization Strategies** - Subscription tiers, transaction fees (1-3%), ad placements
✅ **Internationalization** - Multi-language (6 languages) and multi-currency (7 currencies) support
✅ **Performance Optimization** - Caching, load balancing, database optimization
✅ **CI/CD Pipeline** - Automated testing, building, and deployment
✅ **Microservices Roadmap** - Architecture plan for scalability
✅ **Regional Expansion** - ASEAN market expansion roadmap

All components are production-ready and can be extended with additional features as needed.

