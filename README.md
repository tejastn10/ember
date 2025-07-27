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
  - **ESLint**: Identify and fix linting issues.
  - **Prettier**: Opinionated code formatting.
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

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Your server is now running at `http://localhost:5000`.
5. To access Swagger API Docs open `http://localhost:5000/docs`.

---

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---

## Acknowledgments 🙌

- Built with ❤️ using **NestJS**, **OpenTelemetry**, and the **LGTM Stack**.
- Inspired by the warmth of a glowing **Ember** — lightweight yet powerful.
- Designed for developers who want **visibility without the headache**.
