# 🛠️ Local Development Setup

This guide provides detailed information about setting up and configuring the Ember application with the LGTM observability stack in your local development environment.

## 🔧 Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 22+ | Runtime for the NestJS application |
| **Docker** | 20+ | Container runtime for services |
| **Docker Compose** | 2+ | Multi-container orchestration |
| **Git** | 2+ | Version control |

### System Requirements

- **Memory**: 4GB+ available RAM (LGTM stack uses ~2GB)
- **Disk**: 10GB+ available space
- **OS**: Linux, macOS, or Windows with WSL2

---

## 🌐 Port Configuration

### Application Ports

| Service | Port | Internal Port | Purpose |
|---------|------|---------------|---------|
| **NestJS App** | 5000 | 5000 | Main application server |
| **Swagger Docs** | 5000/docs | 5000 | API documentation |
| **Metrics Endpoint** | 5000/metrics | 5000 | Prometheus metrics |

### Database Ports

| Service | Port | Internal Port | Purpose |
|---------|------|---------------|---------|
| **PostgreSQL** | 5432 | 5432 | Primary relational database |
| **MongoDB** | 27017 | 27017 | Document database |
| **Redis** | 6379 | 6379 | Cache and session store |

### Observability Ports

| Service | Port | Internal Port | Purpose |
|---------|------|---------------|---------|
| **Grafana** | 3000 | 3000 | Observability UI and dashboards |
| **Loki** | 3100 | 3100 | Log aggregation API |
| **Tempo** | 3200 | 3200 | Trace storage API |
| **Tempo OTLP gRPC** | 4317 | 4317 | OpenTelemetry trace ingestion |
| **Tempo OTLP HTTP** | 4318 | 4318 | OpenTelemetry trace ingestion |
| **Prometheus** | 9090 | 9090 | Metrics collection and query |
| **Mimir** | 9009 | 9009 | Long-term metrics storage |
| **Node Exporter** | 9100 | 9100 | System metrics exporter |

### Port Conflicts

If you encounter port conflicts, you can modify ports in:

- `docker-compose.yml` for containerized services
- `.env` file for application configuration

```bash
# Check if ports are already in use
lsof -i :3000  # Grafana
lsof -i :5000  # Application
lsof -i :9090  # Prometheus
```

---

## 🏗️ Service Architecture

### Container Network

All services run in the `ember-network` Docker network for secure inter-service communication.

```bash
ember-network (bridge)
├── ember-app (host network)
├── ember-postgres
├── ember-mongo
├── ember-redis
├── ember-grafana
├── ember-loki
├── ember-tempo
├── ember-mimir
├── ember-prometheus
├── ember-promtail
└── ember-node-exporter
```

### Data Volumes

Persistent storage for stateful services:

```bash
Docker Volumes:
├── ember-postgres    # PostgreSQL data
├── ember-mongo       # MongoDB data
├── ember-redis       # Redis data
├── ember-grafana     # Grafana settings/dashboards
├── ember-loki        # Log storage
├── ember-tempo       # Trace storage
├── ember-mimir       # Metrics storage
└── ember-prometheus  # Prometheus data
```

### Directory Structure

```bash
ember/
├── src/                          # Application source code
│   ├── telemetry/               # OpenTelemetry configuration
│   │   ├── telemetry.init.ts   # Early OTEL initialization
│   │   └── telemetry.service.ts # Prometheus metrics service
├── telemetry/                   # Observability configuration
│   ├── grafana/
│   │   └── provisioning/       # Grafana datasources & dashboards
│   ├── loki-config.yaml        # Loki configuration
│   ├── mimir.yaml              # Mimir configuration
│   ├── prometheus.yml          # Prometheus configuration
│   ├── promtail-config.yaml    # Log shipping configuration
│   └── tempo.yaml              # Tempo configuration
├── logs/                        # Application logs
├── scripts/                     # Setup and utility scripts
├── docker-compose.yml          # Container orchestration
└── .env                        # Environment variables
```

---

## 🔐 Environment Variables

### Application Configuration

```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=ember
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=ember

MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USERNAME=ember
MONGO_PASSWORD=password
MONGO_DATABASE=ember

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=password

# Application Settings
NODE_ENV=development
PORT=5000
API_PREFIX=api

# OpenTelemetry Configuration
OTEL_SERVICE_NAME=ember
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_LOG_LEVEL=info
```

### Production vs Development

**Development** (`.env`):

- Services accessible on localhost
- Debug logging enabled
- Hot reload enabled
- Immediate trace export

**Production** (deployment):

- Internal service names (e.g., `http://tempo:4318`)
- Error-level logging
- Optimized batch export
- Resource limits applied

---

## 🐳 Docker Compose Services

### Core Application Services

```yaml
# PostgreSQL Database
postgres:
  image: postgres
  environment:
    POSTGRES_DB: ${POSTGRES_DATABASE}
    POSTGRES_USER: ${POSTGRES_USERNAME}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  ports:
    - "${POSTGRES_PORT}:5432"
  volumes:
    - ember-postgres:/var/lib/postgresql/data

# MongoDB Database  
mongo:
  image: mongo
  environment:
    MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
    MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
  ports:
    - "${MONGO_PORT}:27017"
  volumes:
    - ember-mongo:/data/db

# Redis Cache
redis:
  image: redis/redis-stack:latest
  command:
    - redis-server
    - --requirepass ${REDIS_PASSWORD}
    - --maxmemory 256mb
    - --maxmemory-policy allkeys-lru
  ports:
    - "${REDIS_PORT:-6379}:6379"
  volumes:
    - ember-redis:/data
```

### Observability Services

```yaml
# Grafana - Visualization
grafana:
  image: grafana/grafana:latest
  environment:
    GF_SECURITY_ADMIN_PASSWORD: admin
    GF_AUTH_ANONYMOUS_ENABLED: "true"
    GF_AUTH_ANONYMOUS_ORG_ROLE: Admin
  ports:
    - "3000:3000"
  volumes:
    - ember-grafana:/var/lib/grafana
    - ./telemetry/provisioning:/etc/grafana/provisioning

# Loki - Log Aggregation
loki:
  image: grafana/loki:latest
  command:
    - -config.file=/etc/loki/local-config.yaml
  ports:
    - "3100:3100"
  volumes:
    - ember-loki:/loki

# Tempo - Distributed Tracing
tempo:
  image: grafana/tempo:latest
  command:
    - -config.file=/etc/tempo.yaml
  ports:
    - "3200:3200"  # HTTP API
    - "4317:4317"  # OTLP gRPC
    - "4318:4318"  # OTLP HTTP
  volumes:
    - ember-tempo:/var/tempo
    - ./telemetry/tempo.yaml:/etc/tempo.yaml

# Mimir - Metrics Storage
mimir:
  image: grafana/mimir:latest
  command:
    - -config.file=/etc/mimir.yaml
  ports:
    - "9009:9009"
  volumes:
    - ember-mimir:/data
    - ./telemetry/mimir.yaml:/etc/mimir.yaml

# Prometheus - Metrics Collection
prometheus:
  image: prom/prometheus:latest
  command:
    - --config.file=/etc/prometheus/prometheus.yml
    - --storage.tsdb.path=/prometheus
    - --web.console.libraries=/etc/prometheus/console_libraries
    - --web.console.templates=/etc/prometheus/consoles
    - --storage.tsdb.retention.time=200h
    - --web.enable-lifecycle
    - --web.enable-admin-api
  ports:
    - "9090:9090"
  volumes:
    - ./telemetry/prometheus.yml:/etc/prometheus/prometheus.yml
    - ember-prometheus:/prometheus
```

---

## 🔄 Development Workflow

### 1. Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd ember

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start all services
npm run dev
```

### 2. Service Startup Order

The `npm run dev` command handles the startup sequence:

1. **Directory Setup**: Creates required log directories
2. **Database Services**: Starts PostgreSQL, MongoDB, Redis
3. **Observability Stack**: Starts Loki, Tempo, Mimir, Prometheus, Grafana
4. **Application**: Starts NestJS with hot reload

### 3. Development Commands

```bash
# Start everything (recommended)
npm run dev

# Start only databases
npm run database

# Start application only (requires databases running)
npm start

# Run in debug mode
npm run debug

# Run tests
npm test

# Lint and format code
npm run lint
npm run format
```

### 4. Health Checks

Verify services are running:

```bash
# Application health
curl http://localhost:5000/health

# Service status
docker compose ps

# Check logs
docker compose logs -f grafana
docker compose logs -f tempo
```

### 5. Hot Reload

The application supports hot reload for development:

- **TypeScript changes**: Automatically recompiled and restarted
- **Configuration changes**: Require manual restart
- **Docker services**: Use `docker compose restart <service>`

---

## ⚙️ Configuration Files

### OpenTelemetry (`src/telemetry/telemetry.init.ts`)

```typescript
const traceExporter = new OTLPTraceExporter({
  url: process.env.NODE_ENV === "production" 
    ? "http://tempo:4318/v1/traces"      // Production
    : "http://localhost:4318/v1/traces", // Development
  headers: {
    "Content-Type": "application/json",
  },
  keepAlive: true,
});

const spanProcessor = new BatchSpanProcessor(traceExporter, {
  maxExportBatchSize: 1,     // Development: immediate export
  exportTimeoutMillis: 10000,
  scheduledDelayMillis: 500, // Export every 0.5 seconds
  maxQueueSize: 100,
});
```

### Tempo (`telemetry/tempo.yaml`)

```yaml
auth_enabled: false

server:
  http_listen_port: 3200
  grpc_listen_port: 9095

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: 0.0.0.0:4317
        http:
          endpoint: 0.0.0.0:4318

storage:
  trace:
    backend: local
    local:
      path: /var/tempo
```

### Prometheus (`telemetry/prometheus.yml`)

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ember-app'
    static_configs:
      - targets: ['host.docker.internal:5000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Loki (`telemetry/loki-config.yaml`)

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks
```

---

## 🔧 Common Development Tasks

### Adding New Metrics

```typescript
// In your service
import { TelemetryService } from '../telemetry/telemetry.service';

@Injectable()
export class MyService {
  private requestCounter = this.telemetry.createCounter({
    name: 'my_service_requests_total',
    help: 'Total number of requests to my service',
    labelNames: ['method', 'status'],
  });

  constructor(private telemetry: TelemetryService) {}

  async handleRequest(method: string) {
    // Your business logic
    this.requestCounter.inc({ method, status: 'success' });
  }
}
```

### Adding Custom Spans

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('my-service');

async function myFunction() {
  const span = tracer.startSpan('my-operation');
  
  try {
    // Your business logic
    span.setAttributes({
      'operation.type': 'data-processing',
      'user.id': '123',
    });
    
    // Do work...
    
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({ 
      code: SpanStatusCode.ERROR, 
      message: error.message 
    });
    throw error;
  } finally {
    span.end();
  }
}
```

### Adding Custom Dashboards

1. Create JSON dashboard file in `telemetry/provisioning/dashboards/`
2. Add to `dashboard.yml` provider
3. Restart Grafana: `docker compose restart grafana`

---

## 🔗 Related Documentation

- [LGTM Stack Guide](./LGTM.md) - Comprehensive observability guide
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
- [Main README](../README.md) - Project overview and quick start

---

## 📚 External Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/instrumentation/js/)
- [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
