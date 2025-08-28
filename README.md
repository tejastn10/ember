<p align="center">
  <img src="logo.svg" alt="Logo">
</p>

# Ember 🔥

![Node.js Version](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-007ACC?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11%2B-E0234E?logo=nestjs&logoColor=white)
![LGTM](https://img.shields.io/badge/Observability-LGTM-blueviolet?logo=grafana&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?logo=open-source-initiative&logoColor=white)

**Ember** is a modern NestJS starter template with production-grade observability out of the box. It’s built for developers who care about performance, reliability, and insight into their applications.

With **Loki**, **Grafana**, **Tempo**, and **Mimir** (the LGTM stack) pre-configured via Docker Compose, Ember provides full-stack observability — including logs, metrics, and traces — ready to go from day one.

---

## Features ⚡

- **NestJS**: A progressive Node.js framework for scalable applications.
- **TypeScript**: Static typing for better code reliability and maintainability.
- **Built-in Observability Stack (LGTM)**:
  - **Loki** – High-performance log aggregation.
  - **Grafana** – Dashboards and visualization for logs, metrics, and traces.
  - **Tempo** – Distributed tracing.
  - **Mimir** – Scalable time-series metrics (Prometheus-compatible).
- **OpenTelemetry Integration** – Exports traces, metrics, and logs for deep observability.
- **Pre-configured Tooling**:
  - **BiomeJS**: Enforces consistent code quality.
  - **Husky**: Pre-commit hooks for enforcing best practices.
  - **Commitlint**: Enforce consistent commit message formatting.
- **Modular Architecture**: Designed for scalability and maintainability.
- **Swagger API Documentation**:
  - Built-in OpenAPI (Swagger) integration for easy API exploration.
- **Database Support**:
  - **PostgreSQL**: Integrated with TypeORM for relational database needs.
  - **MongoDB**: Uses Mongoose ODM for handling NoSQL collections.
- **Redis Cache**: Integrated Redis service for caching and performance optimization.
- **Developer Experience**: Optimized setup for efficient backend development.
- **Environment Configuration**: An example `.env` file has been added for reference.

---

## Getting Started 🚀

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v22 or later.

---

### Installation ⚙️

1. Clone the repository:

   ```bash
   git clone https://github.com/tejastn10/ember.git
   cd ember
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Check the environment variables:

   ```bash
   cat .env
   ```

4. Start the development server (this will automatically setup directories and start all services):

   ```bash
   npm run dev
   ```

5. Your application is now running! Access the following services:

   | Service | URL | Description |
   |---------|-----|-------------|
   | **Application** | <http://localhost:5000> | Main NestJS application |
   | **API Docs (Swagger)** | <http://localhost:5000/docs> | Interactive API documentation |
   | **Grafana** | <http://localhost:3000> | Observability dashboards (admin/admin) |
   | **Prometheus** | <http://localhost:9090> | Metrics collection and querying |
   | **Application Metrics** | <http://localhost:5000/metrics> | Prometheus metrics endpoint |

## 📊 Observability Stack (LGTM)

Ember comes with a complete observability stack that provides insights into your application's behavior:

### 🔍 **What You Get Out of the Box**

- **📈 Metrics**: Application performance, resource usage, and custom business metrics
- **📝 Logs**: Structured application logs with correlation IDs and context
- **🔍 Traces**: Distributed tracing across your application stack
- **📊 Dashboards**: Pre-configured Grafana dashboards for monitoring

### 🎯 **Quick Start Guide**

1. **View Application Metrics**:
   - Open [Grafana](http://localhost:3000) → "Ember Overview" dashboard
   - See CPU, memory, request rates, and response times

2. **Explore Distributed Traces**:
   - Go to [Grafana Explore](http://localhost:3000/explore)
   - Select "Tempo" datasource
   - Query: `{.service.name="ember"}` to see all traces

3. **Search Application Logs**:
   - In [Grafana Explore](http://localhost:3000/explore)
   - Select "Loki" datasource  
   - Query: `{container_name="ember-app"}` for application logs

4. **Generate Test Data**:

   ```bash
   # Generate traces and test error scenarios
   curl http://localhost:5000/test-errors/database
   curl http://localhost:5000/test-errors/timeout
   curl http://localhost:5000/test-errors/http
   curl http://localhost:5000/health
   ```

### 📚 **Detailed Documentation**

For comprehensive documentation about the LGTM stack, architecture, and advanced usage, see:

- **[LGTM Stack Guide](./docs/LGTM.md)** - Complete guide to observability stack
- **[Local Development](./docs/LOCAL_SETUP.md)** - Detailed setup and configuration
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint and fix code issues |
| `npm run format` | Format code with Prettier |
| `npm run database` | Start only the database services |

---

## 🏗️ Architecture

```bash
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │  Observability  │    │   Databases     │
│                 │    │      Stack      │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   NestJS    │ │───▶│ │   Grafana   │ │    │ │ PostgreSQL  │ │
│ │ Application │ │    │ │             │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │OpenTelemetry│ │───▶│ │    Tempo    │ │    │ │   MongoDB   │ │
│ │Instrumentation│ │    │ │  (Traces)   │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│                 │───▶│ │    Loki     │ │    │ │    Redis    │ │
│                 │    │ │   (Logs)    │ │    │ │             │ │
│                 │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │ ┌─────────────┐ │    │                 │
│                 │───▶│ │ Prometheus  │ │    │                 │
│                 │    │ │   Mimir     │ │    │                 │
│                 │    │ │ (Metrics)   │ │    │                 │
│                 │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---

## Acknowledgments 🙌

- Built with ❤️ using **NestJS**, **OpenTelemetry**, and the **LGTM Stack**.
- Inspired by the warmth of a glowing **Ember** — lightweight yet powerful.
- Designed for developers who want **visibility without the headache**.
