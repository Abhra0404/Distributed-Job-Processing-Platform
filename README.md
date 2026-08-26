# Distributed Job Processing Platform

A distributed asynchronous job processing system built with **Node.js, TypeScript, Express, PostgreSQL, Redis, BullMQ, and Docker**.

The platform separates **API request handling from job execution**, allowing computational workloads to be queued and processed asynchronously by independent worker processes.

## Architecture

```text
                    ┌──────────────┐
                    │    Client    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Express API │
                    └──────┬───────┘
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
           ┌─────────────┐   ┌─────────────┐
           │ PostgreSQL  │   │    Redis    │
           │  Job State  │   │   BullMQ    │
           └─────────────┘   └──────┬──────┘
                                    │
                      ┌─────────────┼─────────────┐
                      ▼             ▼             ▼
                  Worker 1      Worker 2      Worker N
                      │             │             │
                      └─────────────┼─────────────┘
                                    ▼
                              Job Executor
                                    │
                                    ▼
                              PostgreSQL
````

### How it works

1. A client submits a job through the REST API.
2. The API validates the request and stores the job in PostgreSQL.
3. The job is added to a BullMQ queue backed by Redis.
4. An available worker consumes the job.
5. The worker executes the workload asynchronously.
6. The result or error is persisted in PostgreSQL.
7. The client can query the job status at any time.

This separation allows the **API and worker layer to scale independently**.

---

## Features

* Asynchronous job processing
* Redis-backed BullMQ queue
* Independent worker processes
* Multiple workers consuming from the same queue
* Persistent job state and results
* Job lifecycle tracking
* Job status and result APIs
* Job listing with pagination
* Queued job cancellation
* Runtime validation with Zod
* Graceful API and worker shutdown
* Dockerized PostgreSQL and Redis
* Type-safe database access with Drizzle ORM

### Supported Workloads

| Workload | Description |
|---|---|
| `fibonacci` | Calculate the nth Fibonacci number |
| `sleep` | Simulate a long-running job |
| `prime` | Check whether a number is prime |
| `matrix` | Multiply two matrices |

The executor layer is designed so additional workloads can be added without changing the API architecture.

---

## Tech Stack

| Technology  | Purpose                       |
| ----------- | ----------------------------- |
| Node.js     | Runtime                       |
| TypeScript  | Type safety                   |
| Express     | REST API                      |
| PostgreSQL  | Persistent job state          |
| Drizzle ORM | Database access               |
| Redis       | Queue backend                 |
| BullMQ      | Job scheduling and processing |
| Zod         | Request validation            |
| Docker      | Infrastructure                |

---

## Project Structure

```text
src/
├── config/          # Environment configuration
├── db/              # Database connection and schema
├── jobs/            # Job types, validation, controllers and services
├── queue/           # Redis and BullMQ configuration
├── routes/          # API routes
├── worker/          # Worker and job processors
├── app.ts
└── server.ts

drizzle/             # Database migrations
docker-compose.yml
drizzle.config.ts
package.json
tsconfig.json
```

---

## Getting Started

### Prerequisites

* Node.js 20+
* npm
* Docker

### Installation

```bash
git clone https://github.com/Abhra0404/Distributed-Job-Processing-Platform.git
cd Distributed-Job-Processing-Platform

npm install
```

Create a `.env` file:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://djp:djp@localhost:5432/djp
REDIS_URL=redis://localhost:6379
```

Start PostgreSQL and Redis:

```bash
docker compose up -d
```

Run database migrations:

```bash
npm run db:migrate
```

Start the API:

```bash
npm run dev
```

In another terminal, start a worker:

```bash
npm run worker -- --worker-id=worker-01
```

Multiple workers can run simultaneously:

```bash
npm run worker -- --worker-id=worker-02
npm run worker -- --worker-id=worker-03
```

---

## API Usage

### Submit a job

```http
POST /api/v1/jobs
```

```bash
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fibonacci",
    "payload": {
      "n": 40
    }
  }'
```

Response:

```json
{
  "id": "487b4493-e941-4661-91cd-dbe77dfa1f58",
  "type": "fibonacci",
  "status": "queued"
}
```

The API returns immediately while the worker processes the job asynchronously.

### Get job status

```http
GET /api/v1/jobs/:id
```

Example:

```json
{
  "id": "487b4493-e941-4661-91cd-dbe77dfa1f58",
  "type": "fibonacci",
  "status": "succeeded",
  "result": {
    "value": 102334155
  }
}
```

### List jobs

```http
GET /api/v1/jobs?page=1&limit=20
```

### Cancel a queued job

```http
POST /api/v1/jobs/:id/cancel
```

---

## Job Lifecycle

```text
        ┌─────────┐
        │  QUEUED │
        └────┬────┘
             │
             ▼
        ┌─────────┐
        │ RUNNING │
        └────┬────┘
             │
       ┌─────┴─────┐
       ▼           ▼
 SUCCEEDED       FAILED

QUEUED ───────► CANCELLED
```

PostgreSQL maintains the durable state of each job, while Redis/BullMQ manages asynchronous job delivery.

---

## Running Multiple Workers

Because workers are separate processes, multiple workers can consume from the same queue:

```text
                     Redis
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
           Worker 1 Worker 2 Worker 3
              │        │        │
            Job A    Job B    Job C
```

This provides the foundation for **horizontal worker scaling** without increasing the API workload.

---

## Development Commands

```bash
npm run dev              # Start API in development
npm run worker           # Start worker
npm run build            # Build TypeScript
npm start                # Start production build

npm run db:generate      # Generate migration
npm run db:migrate       # Apply migrations

docker compose up -d     # Start infrastructure
docker compose down      # Stop infrastructure
```

---

## Why This Project?

The project explores the fundamentals behind **distributed task processing and backend infrastructure**.

Instead of executing computational work directly inside an HTTP request, the system separates:

**API → Queue → Workers → Execution → Persistent Results**

This architecture provides a foundation for systems such as background job processors, data pipelines, ML training infrastructure, and distributed compute platforms.

---

## License

This project is licensed under the MIT License.

> Stay focused, stay productive, and keep leveling up! — kaizenX out. ✌️
