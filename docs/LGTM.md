# 🔍 LGTM Stack Guide

The **LGTM Stack** (Loki, Grafana, Tempo, Mimir) is a complete observability solution that provides unified monitoring, logging, and tracing for modern applications. This guide explains each component, how they work together, and how to use them effectively.

---

## 🎯 What is the LGTM Stack?

**LGTM** represents the four pillars of observability:

| Component | Purpose | What It Does |
|-----------|---------|--------------|
| **L**oki | Log Aggregation | Collects, indexes, and stores logs from all services |
| **G**rafana | Visualization | Provides dashboards, alerting, and exploration UI |
| **T**empo | Distributed Tracing | Tracks requests across services and components |
| **M**imir | Metrics Storage | Stores and queries time-series metrics data |

Together, they provide **complete observability** into your application's behavior, performance, and health.

---

## 🏗️ Architecture Overview

```bash
┌─────────────────┐
│   Application   │
│                 │
│ ┌─────────────┐ │    ┌─────────────────────────────────────┐
│ │   NestJS    │ │───▶│            Grafana UI               │
│ │ Application │ │    │     (Dashboards & Explore)          │
│ └─────────────┘ │    └─────────────────────────────────────┘
│ ┌─────────────┐ │              │        │        │
│ │OpenTelemetry│ │              ▼        ▼        ▼
│ │Instrumentation│ │    ┌─────────┐ ┌─────────┐ ┌─────────┐
│ └─────────────┘ │    │  Loki   │ │  Tempo  │ │  Mimir  │
│                 │───▶│ (Logs)  │ │(Traces) │ │(Metrics)│
│                 │    └─────────┘ └─────────┘ └─────────┘
│                 │           ▲               │
│                 │    ┌─────────┐     ┌─────────┐
│                 │───▶│Promtail │     │Prometheus│
│                 │    │(Log     │     │(Metrics │
│                 │    │Shipper) │     │Scraper) │
└─────────────────┘    └─────────┘     └─────────┘
```

### Data Flow

1. **Application** generates logs, metrics, and traces
2. **OpenTelemetry** instruments the application automatically
3. **Promtail** ships logs to Loki
4. **Prometheus** scrapes metrics and sends to Mimir
5. **Tempo** receives traces via OTLP
6. **Grafana** visualizes all data sources

---

## 🔧 Component Deep Dive

### 🪵 Loki - Log Aggregation

**Purpose**: Centralized log storage and querying

**What it does**:

- Indexes logs by labels (not content) for efficiency
- Stores raw log data compressed
- Provides LogQL query language
- Correlates logs with metrics and traces

**Key Features**:

- **Label-based indexing**: Fast queries using metadata
- **Multi-tenancy**: Isolate logs by service/environment
- **Retention policies**: Automatic log cleanup
- **Grafana integration**: Native log visualization

**Example LogQL Queries**:

```logql
# All application logs
{container_name="ember-app"}

# Error logs only
{container_name="ember-app"} |= "ERROR"

# Logs from specific time range
{service_name="ember"} | json | level="error"

# Rate of error logs
rate({container_name="ember-app"} |= "ERROR"[5m])
```

---

### 📊 Grafana - Visualization & Exploration

**Purpose**: Unified interface for observability data

**What it does**:

- Creates dashboards for metrics, logs, and traces
- Provides alerting and notification capabilities
- Offers ad-hoc data exploration
- Correlates data across multiple sources

**Key Features**:

- **Multi-datasource**: Connect to Loki, Tempo, Mimir simultaneously
- **Dashboard templates**: Pre-built monitoring dashboards
- **Alerting**: Set up proactive alerts
- **Explore mode**: Ad-hoc querying and investigation

**Available Interfaces**:

- **Dashboards**: `/dashboards` - Pre-configured monitoring views
- **Explore**: `/explore` - Interactive data exploration
- **Alerting**: `/alerting` - Alert rules and notifications

---

### 🔍 Tempo - Distributed Tracing

**Purpose**: Track requests across your entire application stack

**What it does**:

- Collects traces via OpenTelemetry
- Stores trace data efficiently
- Provides trace search and visualization
- Correlates traces with logs and metrics

**Key Features**:

- **TraceQL**: Powerful query language for traces
- **Service maps**: Visualize service dependencies
- **Span analysis**: Detailed timing and performance data
- **Error tracking**: Identify failures in distributed calls

**Example TraceQL Queries**:

```traceql
# All traces for ember service
{.service.name="ember"}

# Slow database operations
{.service.name="ember" && .db.operation.name=~"SELECT.*"} | select(.duration > 100ms)

# Traces with errors
{.service.name="ember"} | select(.status = error)

# HTTP requests to specific endpoint
{.service.name="ember" && .http.route="/health"}
```

**Trace Structure**:

```bash
Trace ID: abc123
├── HTTP Request [GET /api/users] (50ms)
    ├── Database Query [SELECT users] (30ms)
    ├── Redis Cache Check [GET user:123] (5ms)
    └── External API Call [POST /auth] (10ms)
```

---

### 📈 Mimir - Metrics Storage

**Purpose**: Long-term storage and querying of time-series metrics

**What it does**:

- Stores Prometheus metrics long-term
- Provides PromQL query interface
- Handles high cardinality metrics
- Enables historical analysis

**Key Features**:

- **Prometheus compatible**: Drop-in replacement for Prometheus
- **Horizontal scaling**: Handle massive metric volumes
- **Long-term storage**: Years of metric history
- **Query federation**: Query across multiple clusters

**Example PromQL Queries**:

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate percentage
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# Memory usage
process_resident_memory_bytes / 1024 / 1024

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

---

## 🚀 Getting Started

### 1. Access Your Services

| Service | URL | Login | Purpose |
|---------|-----|-------|---------|
| **Grafana** | <http://localhost:3000> | admin/admin | Main observability UI |
| **Prometheus** | <http://localhost:9090> | None | Direct metric queries |
| **Application** | <http://localhost:5000> | None | Your NestJS app |

### 2. Generate Sample Data

```bash
# Generate various types of traces
curl http://localhost:5000/                    # Normal request
curl http://localhost:5000/health             # Health check
curl http://localhost:5000/test-errors/database  # Database error
curl http://localhost:5000/test-errors/timeout   # Timeout error
curl http://localhost:5000/test-errors/http      # HTTP error
```

### 3. Explore Your Data

**View Traces**:

1. Go to <http://localhost:3000/explore>
2. Select "Tempo" datasource
3. Query: `{.service.name="ember"}`
4. Click any trace ID to see detailed trace view

**View Logs**:

1. In Grafana Explore, select "Loki"
2. Query: `{container_name="ember-app"}`
3. Filter by log level: `{container_name="ember-app"} |= "ERROR"`

**View Metrics**:

1. Go to <http://localhost:3000/explore>
2. Select "Mimir" datasource
3. Query: `rate(http_requests_total[5m])`

---

## 🎯 Common Use Cases

### 1. Performance Monitoring

**Objective**: Monitor application performance and identify bottlenecks

**Approach**:

1. **Dashboard**: "Ember Overview" shows key performance metrics
2. **Metrics**: Track response times, throughput, error rates
3. **Traces**: Identify slow database queries or external calls
4. **Logs**: Look for performance-related warnings

**Key Queries**:

```promql
# Request throughput
rate(http_requests_total[5m])

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])
```

### 2. Error Investigation

**Objective**: Quickly identify and debug application errors

**Approach**:

1. **Logs**: Find error messages and stack traces
2. **Traces**: See the full request path that led to the error
3. **Metrics**: Understand error patterns and frequency
4. **Correlation**: Link traces to logs using trace IDs

**Investigation Flow**:

```bash
Error Alert → Dashboard → Logs (find error) → Trace ID → Full trace → Root cause
```

### 3. Dependency Mapping

**Objective**: Understand service dependencies and call patterns

**Approach**:

1. **Service Maps**: Visual representation of service calls
2. **Traces**: See actual request flows
3. **Metrics**: Measure dependency health

**TraceQL for Dependencies**:

```traceql
# Database operations
{.service.name="ember" && .db.system="postgresql"}

# External HTTP calls
{.service.name="ember" && .http.method="POST"}
```

### 4. Capacity Planning

**Objective**: Plan for scaling based on actual usage patterns

**Approach**:

1. **Historical metrics**: Analyze trends over time
2. **Resource utilization**: CPU, memory, disk usage
3. **Request patterns**: Peak hours, seasonal trends

**Key Metrics**:

```promql
# CPU usage trend
rate(process_cpu_seconds_total[5m])

# Memory growth
increase(process_resident_memory_bytes[1h])

# Request volume trend
increase(http_requests_total[1h])
```

---

## 🔍 Advanced Queries

### Complex TraceQL Examples

```traceql
# Find traces with database calls taking longer than 100ms
{.service.name="ember"} | select(.db.operation.name != nil && .duration > 100ms)

# Traces with specific HTTP status codes
{.service.name="ember"} | select(.http.status_code >= 400)

# Traces containing both database and cache operations
{.service.name="ember"} | select(.db.system != nil && .cache.operation != nil)

# Error traces in the last hour
{.service.name="ember" && .status = error} | select(.timestamp > 1h)
```

### Advanced LogQL Queries

```logql
# Parse JSON logs and filter by level
{container_name="ember-app"} | json | level="error"

# Extract and count error types
{container_name="ember-app"} | json | level="error" | line_format "{{.message}}" | label_format error_type="{{.message}}"

# Log rate by level
sum by (level) (rate({container_name="ember-app"} | json[5m]))

# Logs correlated with specific trace
{container_name="ember-app"} |= "trace_id=abc123"
```

### Complex PromQL Queries

```promql
# Request success rate
sum(rate(http_requests_total{status!~"4..|5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# Top 5 slowest endpoints
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))

# Memory usage prediction (linear regression)
predict_linear(process_resident_memory_bytes[1h], 3600)

# Apdex score (Application Performance Index)
(sum(rate(http_request_duration_seconds_bucket{le="0.3"}[5m])) + sum(rate(http_request_duration_seconds_bucket{le="1.2"}[5m]))) / 2 / sum(rate(http_request_duration_seconds_count[5m]))
```

---

## 📚 Best Practices

### 1. Instrumentation

**Do**:

- Use semantic naming for spans and metrics
- Add meaningful attributes to spans
- Include correlation IDs in logs
- Instrument at business logic boundaries

**Don't**:

- Over-instrument (creates noise)
- Use high-cardinality labels in metrics
- Log sensitive information
- Create spans for trivial operations

### 2. Query Optimization

**Efficient Queries**:

```logql
# Good: Use labels for filtering
{service_name="ember", level="error"}

# Bad: Filter on log content
{service_name="ember"} |= "ERROR"
```

**Time Ranges**:

- Use appropriate time ranges for your queries
- Longer ranges = slower queries
- Use rate() functions for counters

### 3. Dashboard Design

**Effective Dashboards**:

- **Golden Signals**: Latency, traffic, errors, saturation
- **Consistent time ranges**: Sync all panels
- **Meaningful alerts**: Actionable, not noisy
- **Drill-down paths**: From overview to detail

### 4. Alerting Strategy

**Alert Hierarchy**:

1. **Critical**: Service down, high error rate
2. **Warning**: Performance degradation, approaching limits
3. **Info**: Deployment notifications, maintenance

**Alert Content**:

- Clear description of the problem
- Runbook links for resolution
- Context about impact
- Links to relevant dashboards

---

## 🔗 Related Documentation

- [Local Development Setup](./LOCAL_SETUP.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [OpenTelemetry Configuration](../src/telemetry/README.md)

---

## 📚 External Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Tempo Documentation](https://grafana.com/docs/tempo/)
- [Mimir Documentation](https://grafana.com/docs/mimir/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [PromQL Guide](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [LogQL Guide](https://grafana.com/docs/loki/latest/logql/)
- [TraceQL Guide](https://grafana.com/docs/tempo/latest/traceql/)
