# 🔧 Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Ember LGTM stack setup.

## 🩺 Quick Health Checks

### 1. Verify All Services

```bash
# Check container status
docker compose ps

# Expected output: All services should be "Up"
# If any service is "Exit 1" or "Restarting", investigate logs
```

### 2. Test Application Endpoints

```bash
# Application health
curl -s http://localhost:5000/health | jq

# Metrics endpoint
curl -s http://localhost:5000/metrics | head -5

# Grafana API
curl -s http://localhost:3000/api/health

# Tempo API
curl -s http://localhost:3200/api/search?limit=1
```

### 3. Check Service Logs

```bash
# View logs for specific service
docker compose logs -f grafana
docker compose logs -f tempo
docker compose logs -f loki

# Check for errors across all services
docker compose logs | grep -i error
```

---

## 🚨 Common Issues

### Issue: Port Already in Use

**Symptoms**:

```bash
Error: listen EADDRINUSE: address already in use 0.0.0.0:5000
```

**Solution**:

```bash
# Find process using the port
lsof -i :5000

# Kill the process (replace PID)
kill -9 <PID>

# Or use a different port in .env
echo "PORT=5001" >> .env
```

### Issue: Services Not Starting

**Symptoms**:

- `docker compose ps` shows services as "Exit 1"
- Application can't connect to databases

**Diagnosis**:

```bash
# Check Docker daemon
docker info

# Check available resources
docker system df
docker system prune  # Clean up if needed

# Check for conflicting networks
docker network ls
```

**Solution**:

```bash
# Stop all services
docker compose down

# Remove volumes if corrupted (⚠️ data loss)
docker compose down -v

# Restart with clean state
docker compose up -d

# Check startup order
npm run dev
```

### Issue: Cannot Access Services

**Symptoms**:

- Grafana UI not loading (<http://localhost:3000>)
- Application returning connection errors

**Diagnosis**:

```bash
# Check if containers are running
docker compose ps

# Test network connectivity
docker compose exec grafana wget -qO- http://tempo:3200/ready
docker compose exec app curl http://loki:3100/ready
```

**Solution**:

```bash
# Restart networking
docker compose down
docker network prune
docker compose up -d

# Check firewall settings (macOS/Linux)
sudo ufw status  # Linux
# For macOS, check System Preferences > Security > Firewall
```

---

## 🔍 Service-Specific Problems

### Grafana Issues

**Problem**: Dashboards not loading

```bash
# Check Grafana logs
docker compose logs grafana

# Common issues:
# - Datasource connection failed
# - Dashboard provisioning errors
# - Permission issues
```

**Solutions**:

```bash
# Reset Grafana data
docker compose stop grafana
docker volume rm ember_ember-grafana
docker compose up -d grafana

# Check datasource connectivity
curl -s "http://localhost:3000/api/datasources" | jq
```

**Problem**: "Datasource not found" errors

```bash
# Verify datasource UIDs match dashboard configuration
grep -r "P214B5B846CF3925F" telemetry/provisioning/

# Update dashboard files if UIDs changed
# Check: telemetry/provisioning/datasources/datasources.yml
```

### Tempo Issues

**Problem**: No traces appearing

```bash
# Check Tempo configuration
docker compose logs tempo | grep -i error

# Verify OTLP endpoints are configured
curl -v http://localhost:4318/v1/traces

# Test trace ingestion
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{"resourceSpans":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"test"}}]},"scopeSpans":[{"spans":[{"traceId":"00000000000000000000000000000001","spanId":"0000000000000001","name":"test-span","startTimeUnixNano":"1000000000","endTimeUnixNano":"2000000000"}]}]}]}'
```

**Solution for Tempo Config**:

```yaml
# Ensure tempo.yaml has proper receivers
distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: 0.0.0.0:4317
        http:
          endpoint: 0.0.0.0:4318
```

**Problem**: TraceQL queries failing

```bash
# Check query syntax
# Good: {.service.name="ember"}
# Bad:  service.name="ember"

# Test direct API
curl -s "http://localhost:3200/api/search?q=%7B.service.name%3D%22ember%22%7D"
```

### Loki Issues

**Problem**: Logs not appearing

```bash
# Check Promtail logs
docker compose logs promtail

# Verify log file permissions
ls -la logs/nestjs/

# Test Loki API
curl -s "http://localhost:3100/loki/api/v1/labels"
```

**Solution**:

```bash
# Ensure log directory exists and is writable
mkdir -p logs/nestjs
chmod 755 logs/nestjs

# Restart Promtail
docker compose restart promtail

# Check Promtail config
docker compose exec promtail cat /etc/promtail/config.yaml
```

### Prometheus/Mimir Issues

**Problem**: Metrics not being scraped

```bash
# Check Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq

# Verify application metrics endpoint
curl -s http://localhost:5000/metrics

# Check scrape configuration
docker compose exec prometheus cat /etc/prometheus/prometheus.yml
```

**Solution**:

```bash
# Application must be accessible from container
# Use host.docker.internal instead of localhost in prometheus.yml

# Restart Prometheus
docker compose restart prometheus

# Check metric ingestion
curl -s "http://localhost:9090/api/v1/query?query=up"
```

---

## ⚡ Performance Issues

### High Memory Usage

**Diagnosis**:

```bash
# Check container resource usage
docker stats

# Check system resources
free -h  # Linux
vm_stat  # macOS
```

**Solution**:

```bash
# Limit container memory in docker-compose.yml
services:
  grafana:
    mem_limit: 512m
  tempo:
    mem_limit: 1g
  loki:
    mem_limit: 512m
```

### Slow Query Performance

**Symptoms**:

- Grafana dashboards taking >30 seconds to load
- Timeout errors in queries

**Diagnosis**:

```bash
# Check query complexity
# Large time ranges = slower queries
# High cardinality metrics = performance impact

# Monitor query logs
docker compose logs grafana | grep "query"
```

**Solutions**:

```bash
# Reduce time ranges in dashboards
# Use appropriate time intervals for rate() functions
# Limit label cardinality in metrics

# Example: Good vs Bad metrics
# Good: http_requests_total{method="GET", status="200"}
# Bad:  http_requests_total{user_id="12345", session_id="abc123"}
```

### Storage Issues

**Problem**: Running out of disk space

```bash
# Check volume usage
docker system df
du -sh logs/

# Check retention settings
# Prometheus: --storage.tsdb.retention.time=200h
# Loki: retention_period in config
# Tempo: retention in config
```

**Solution**:

```bash
# Clean old data
docker system prune -f
docker volume prune -f

# Adjust retention periods
# Edit telemetry/prometheus.yml, loki-config.yaml, tempo.yaml

# Restart services
docker compose restart prometheus loki tempo
```

---

## 🔧 Data Pipeline Debugging

### Tracing Data Flow

**Application → Tempo**:

```bash
# 1. Check OpenTelemetry instrumentation
# Application logs should show:
# "OpenTelemetry started - traces going to: http://localhost:4318/v1/traces"

# 2. Verify trace export
# Enable debug logging in telemetry.init.ts:
# process.env.OTEL_LOG_LEVEL = "debug";

# 3. Check Tempo ingestion
docker compose logs tempo | grep "query stats"
```

**Application → Prometheus → Mimir**:

```bash
# 1. Check metrics endpoint
curl http://localhost:5000/metrics

# 2. Verify Prometheus scraping
curl "http://localhost:9090/api/v1/targets" | jq '.data.activeTargets[] | select(.labels.job=="ember-app")'

# 3. Check Mimir storage
curl "http://localhost:9009/prometheus/api/v1/query?query=up"
```

**Application → Loki**:

```bash
# 1. Check log file creation
tail -f logs/nestjs/app.log

# 2. Verify Promtail pickup
docker compose logs promtail

# 3. Check Loki ingestion
curl "http://localhost:3100/loki/api/v1/query_range?query={container_name=\"ember-app\"}&start=$(date -d '1 hour ago' +%s)000000000&end=$(date +%s)000000000"
```

### Missing Data Investigation

**No Traces**:

1. Application instrumentation issue
2. Network connectivity between app and Tempo
3. Tempo configuration problem
4. TraceQL query syntax error

**No Metrics**:

1. Metrics endpoint not exposing data
2. Prometheus can't reach application
3. Scrape interval too long
4. Mimir ingestion failure

**No Logs**:

1. Log file not being written
2. Promtail can't read log files
3. Loki configuration issue
4. LogQL query syntax error

---

## 🔄 Recovery Procedures

### Complete Reset

```bash
# ⚠️ This will delete all observability data
docker compose down -v
docker system prune -a -f
docker volume prune -f

# Remove application logs
rm -rf logs/

# Restart fresh
npm run dev
```

### Partial Service Reset

```bash
# Reset specific service (example: Grafana)
docker compose stop grafana
docker volume rm ember_ember-grafana
docker compose up -d grafana

# Reset application only
pkill -f "nest start"
npm run dev
```

### Configuration Recovery

```bash
# Restore default configs
git checkout -- telemetry/
git checkout -- docker-compose.yml

# Restart affected services
docker compose restart grafana tempo loki prometheus
```

### Data Recovery

```bash
# Backup important data
docker run --rm -v ember_ember-grafana:/data -v $(pwd):/backup alpine tar czf /backup/grafana-backup.tar.gz -C /data .

# Restore from backup
docker run --rm -v ember_ember-grafana:/data -v $(pwd):/backup alpine tar xzf /backup/grafana-backup.tar.gz -C /data
```

---

## 🆘 Getting Help

### Log Collection

```bash
# Collect all relevant logs
mkdir -p debug-logs
docker compose logs > debug-logs/docker-compose.log
npm run dev > debug-logs/application.log 2>&1 &
sleep 30
pkill -f "nest start"

# System information
docker version > debug-logs/docker-info.txt
docker compose version >> debug-logs/docker-info.txt
node --version >> debug-logs/node-info.txt
npm --version >> debug-logs/node-info.txt
```

### Diagnostic Commands

```bash
#!/bin/bash
# diagnostic.sh - Run complete health check

echo "=== Container Status ==="
docker compose ps

echo "=== Service Health ==="
curl -s http://localhost:5000/health || echo "App: FAILED"
curl -s http://localhost:3000/api/health || echo "Grafana: FAILED"
curl -s http://localhost:3200/ready || echo "Tempo: FAILED"
curl -s http://localhost:3100/ready || echo "Loki: FAILED"
curl -s http://localhost:9090/-/ready || echo "Prometheus: FAILED"

echo "=== Port Usage ==="
lsof -i :3000,3100,3200,4317,4318,5000,9009,9090

echo "=== Recent Errors ==="
docker compose logs --since=10m | grep -i error | tail -10
```

### Common Solutions Summary

| Problem | Quick Fix |
|---------|-----------|
| Port conflicts | `lsof -i :<port>` then `kill -9 <PID>` |
| Services not starting | `docker compose down && docker compose up -d` |
| No traces | Check Tempo config and OTLP endpoints |
| No metrics | Verify `/metrics` endpoint and Prometheus config |
| No logs | Check file permissions and Promtail config |
| Slow performance | Reduce query time ranges, check resources |
| Data missing | Follow data pipeline debugging steps |
| Complete failure | Run complete reset procedure |

---

## 🔗 Related Documentation

- [LGTM Stack Guide](./LGTM.md) - Understanding the observability stack
- [Local Setup Guide](./LOCAL_SETUP.md) - Detailed configuration information
- [Main README](../README.md) - Quick start guide

---

## 📞 External Resources

- [Docker Compose Troubleshooting](https://docs.docker.com/compose/troubleshooting/)
- [Grafana Troubleshooting](https://grafana.com/docs/grafana/latest/troubleshooting/)
- [OpenTelemetry Troubleshooting](https://opentelemetry.io/docs/reference/specification/troubleshooting/)
- [Prometheus Troubleshooting](https://prometheus.io/docs/prometheus/latest/troubleshooting/)
