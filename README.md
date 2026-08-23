# Distributed Job Processing Platform

A production-oriented distributed job processing platform built with **Node.js and Express.js** for submitting, scheduling, executing, monitoring, and managing asynchronous computational workloads across a scalable worker pool.

The platform is designed to explore real-world concepts in **distributed systems, backend engineering, fault tolerance, concurrency, job orchestration, observability, and ML infrastructure**.

The orchestration layer is implemented in Node.js, while future ML workloads can be executed through isolated Python/PyTorch containers.

---

## Overview

Long-running computational and ML workloads should not block an API server. This platform provides an asynchronous execution layer where clients submit jobs, workers consume jobs from a distributed queue, execute workloads, and persist results and artifacts.

```text
                         ┌──────────────────┐
                         │      Client      │
                         │ REST API / CLI   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Express.js API  │
                         │     Node.js      │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
             ┌──────────────┐            ┌──────────────┐
             │ PostgreSQL   │            │    Redis     │
             │ Job Metadata │            │   BullMQ      │
             └──────────────┘            └──────┬───────┘
                                                │
                           ┌────────────────────┼────────────────────┐
                           ▼                    ▼                    ▼
                    ┌────────────┐       ┌────────────┐       ┌────────────┐
                    │  Worker 1  │       │  Worker 2  │       │  Worker 3  │
                    │   Node.js  │       │   Node.js  │       │   Node.js  │
                    └─────┬──────┘       └─────┬──────┘       └─────┬──────┘
                          │                    │                    │
                          └────────────────────┼────────────────────┘
                                               ▼
                                        ┌──────────────┐
                                        │    MinIO     │
                                        │   Artifacts  │
                                        └──────────────┘
```

---

## Core Features

### Job Processing

* Asynchronous job submission
* Persistent job metadata
* Redis-backed queues using BullMQ
* Distributed worker execution
* Job status tracking
* Job cancellation
* Result persistence
* Artifact storage

### Reliability

* Configurable retry policies
* Exponential backoff
* Failed-job handling
* Dead-letter queues
* Worker heartbeats
* Worker failure detection
* Job execution timeouts
* Idempotent job submission
* Execution leases

### Scheduling & Concurrency

* Priority-based queues
* Concurrent job execution
* Worker capacity management
* Fair workload distribution
* Distributed locking
* Horizontal worker scaling

### Observability

* Prometheus metrics
* Grafana dashboards
* Structured logging
* Queue-depth monitoring
* Worker health monitoring
* Job latency tracking
* Success and failure rates
* Retry monitoring

### ML Workloads

The platform is designed to eventually support:

* Model training
* Batch inference
* Hyperparameter experiments
* Data preprocessing
* Model evaluation
* Checkpoint generation
* Model artifact storage

---

# Architecture

The platform separates the API, queue, persistence, execution, and storage layers.

```text
                              ┌───────────────┐
                              │     Client    │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │  Express API  │
                              │    Node.js    │
                              └───────┬───────┘
                                      │
                       ┌──────────────┴──────────────┐
                       │                             │
                       ▼                             ▼
                ┌──────────────┐              ┌──────────────┐
                │ PostgreSQL   │              │ Redis/BullMQ │
                │              │              │              │
                │ Durable State│              │ Job Queue    │
                └──────────────┘              └──────┬───────┘
                                                     │
                         ┌───────────────────────────┼──────────────────────────┐
                         │                           │                          │
                         ▼                           ▼                          ▼
                  ┌────────────┐              ┌────────────┐              ┌────────────┐
                  │  Worker 1  │              │  Worker 2  │              │  Worker 3  │
                  │   Node.js  │              │   Node.js  │              │   Node.js  │
                  └─────┬──────┘              └─────┬──────┘              └─────┬──────┘
                        │                            │                            │
                        └────────────────────────────┼────────────────────────────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │     MinIO     │
                                              │ Object Store  │
                                              └──────────────┘
```

---

# Technology Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Runtime        | Node.js                   |
| API            | Express.js                |
| Language       | JavaScript / TypeScript   |
| Database       | PostgreSQL                |
| ORM            | Drizzle ORM               |
| Queue          | Redis + BullMQ            |
| Workers        | Node.js                   |
| Object Storage | MinIO                     |
| Containers     | Docker                    |
| Metrics        | Prometheus                |
| Dashboards     | Grafana                   |
| Testing        | Vitest / Jest + Supertest |
| Load Testing   | k6 / Locust               |
| ML Runtime     | Python + PyTorch          |
| Orchestration  | Kubernetes — planned      |

---

# System Components

## API Server

The Express.js API acts as the control plane of the platform.

Responsibilities include:

* Job submission
* Request validation
* Job persistence
* Queue publishing
* Job status retrieval
* Job cancellation
* Retry management
* Artifact metadata
* Worker administration

Example API:

```text
POST   /api/v1/jobs
GET    /api/v1/jobs
GET    /api/v1/jobs/:id
POST   /api/v1/jobs/:id/cancel
GET    /api/v1/workers
```

---

## PostgreSQL

PostgreSQL stores durable system state.

Primary entities include:

```text
jobs
job_attempts
workers
artifacts
idempotency_keys
```

PostgreSQL acts as the source of truth for job metadata, while Redis handles transient queue operations.

---

## Redis + BullMQ

Redis provides the messaging infrastructure and BullMQ provides queue management.

The queue layer handles:

* Job delivery
* Delayed jobs
* Priority
* Retries
* Backoff
* Job scheduling
* Queue state

The platform's higher-level reliability mechanisms, including worker lifecycle management and job state transitions, remain part of the application layer.

---

## Worker Pool

Workers are independent Node.js processes that consume jobs from Redis.

```text
Worker
 ├── Register
 ├── Send heartbeat
 ├── Fetch job
 ├── Acquire execution lease
 ├── Execute workload
 ├── Report result
 └── Release resources
```

Workers can be started independently, allowing the system to scale horizontally.

```bash
npm run worker -- --worker-id worker-01
npm run worker -- --worker-id worker-02
npm run worker -- --worker-id worker-03
```

---

# Job Lifecycle

Every job follows a controlled state machine.

```text
                 ┌───────────┐
                 │ SUBMITTED │
                 └─────┬─────┘
                       │
                       ▼
                  ┌─────────┐
                  │ QUEUED  │
                  └────┬────┘
                       │
                       ▼
                 ┌──────────┐
                 │ RUNNING  │
                 └────┬─────┘
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
        ┌───────────┐      ┌────────┐
        │ SUCCEEDED │      │ FAILED │
        └───────────┘      └────┬───┘
                                │
                         retry available
                                │
                                ▼
                          ┌──────────┐
                          │ RETRYING │
                          └────┬─────┘
                               │
                               ▼
                            QUEUED
```

Example job:

```json
{
  "id": "job_8f92a",
  "type": "computation",
  "priority": "high",
  "status": "running",
  "attempt": 2,
  "maxRetries": 3
}
```

---

# API Example

## Submit a Job

```http
POST /api/v1/jobs
Content-Type: application/json
```

```json
{
  "type": "computation",
  "priority": "normal",
  "payload": {
    "operation": "fibonacci",
    "n": 100000
  }
}
```

Response:

```json
{
  "jobId": "job_8f92a",
  "status": "queued"
}
```

---

## Get Job Status

```http
GET /api/v1/jobs/job_8f92a
```

Response:

```json
{
  "jobId": "job_8f92a",
  "status": "running",
  "attempt": 1,
  "workerId": "worker-03"
}
```

---

## Cancel a Job

```http
POST /api/v1/jobs/job_8f92a/cancel
```

---

# Reliability

A major objective of the platform is to continue operating correctly when individual components fail.

## Worker Heartbeats

Workers periodically report their health:

```text
worker_id
status
current_job
last_heartbeat
jobs_completed
jobs_failed
```

If a worker stops sending heartbeats:

```text
Worker
   │
   │ heartbeat
   ▼
Coordinator
   │
   X timeout
   ▼
Worker marked DEAD
   │
   ▼
Execution lease expires
   │
   ▼
Job recovered
   │
   ▼
Returned to queue
```

---

## Retry Mechanism

Jobs can automatically retry after transient failures.

```text
Attempt 1
    ↓
Failure
    ↓
Exponential Backoff
    ↓
Attempt 2
    ↓
Failure
    ↓
Attempt 3
    ↓
Permanent Failure / DLQ
```

Retry policies can define:

* Maximum attempts
* Backoff duration
* Retryable errors
* Non-retryable errors

---

# Priority Queues

Jobs can be assigned priorities:

```text
HIGH
 ├── job_102
 ├── job_107
 └── job_111

NORMAL
 ├── job_103
 └── job_104

LOW
 └── job_109
```

Workers consume jobs according to the scheduler's priority policy.

This allows latency-sensitive workloads to receive resources before background jobs.

---

# Idempotency

The API supports idempotent job creation.

```http
POST /api/v1/jobs
Idempotency-Key: 7f1b2c9e
```

If the client retries the same request because of a network failure, the platform returns the previously created job instead of creating a duplicate.

```text
Request
   │
   ▼
Idempotency Key
   │
   ├── Exists ──────► Return existing job
   │
   └── New ─────────► Create job
```

---

# Dead-Letter Queue

Jobs that exhaust their retry policy are moved into a dead-letter queue.

```text
Job
 │
 ├── Attempt 1 → Failed
 │
 ├── Attempt 2 → Failed
 │
 └── Attempt 3 → Failed
                  │
                  ▼
             Dead Letter Queue
                  │
             ┌────┴────┐
             ▼         ▼
          Inspect    Retry
```

This prevents permanently failing workloads from continuously consuming worker capacity.

---

# Object Storage

MinIO provides S3-compatible object storage.

Artifacts may include:

```text
models/
checkpoints/
results/
logs/
reports/
datasets/
```

Example:

```text
job_8f92a/
├── model.pt
├── metrics.json
├── training.log
└── checkpoint_epoch_50.pt
```

---

# ML Workload Execution

The platform can eventually act as a lightweight ML execution system.

A Node.js worker can orchestrate an isolated Python/PyTorch workload:

```text
                   Training Request
                           │
                           ▼
                     Express API
                           │
                           ▼
                     Redis Queue
                           │
                           ▼
                     Node Worker
                           │
                           ▼
                 Docker ML Executor
                           │
                           ▼
                     Python/PyTorch
                           │
                  ┌────────┼────────┐
                  ▼        ▼        ▼
             Checkpoint Metrics  Logs
                  │        │        │
                  └────────┼────────┘
                           ▼
                         MinIO
```

This separation allows the platform to use **Node.js for orchestration and distributed infrastructure** while using **Python/PyTorch for ML computation**.

---

# Observability

Prometheus collects platform metrics and Grafana provides dashboards.

Example metrics:

```text
jobs_submitted_total
jobs_completed_total
jobs_failed_total
jobs_retried_total

active_workers
dead_workers

queue_depth
job_execution_duration_seconds
job_queue_wait_seconds

worker_utilization
```

The monitoring layer is intended to answer questions such as:

* How many jobs are waiting?
* Which workers are active?
* What is the average queue latency?
* What percentage of jobs fail?
* How often are jobs retried?
* Which workloads consume the most execution time?
* Are workers becoming unhealthy?

---

# Project Structure

```text
distributed-job-platform/
│
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── middleware/
│   │       └── app.ts
│   │
│   └── worker/
│       └── src/
│           ├── executors/
│           ├── processors/
│           ├── heartbeat/
│           └── worker.ts
│
├── packages/
│   ├── database/
│   ├── queue/
│   ├── logger/
│   └── shared/
│
├── infrastructure/
│   ├── prometheus/
│   └── grafana/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── load/
│
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

# Local Development

## Prerequisites

* Node.js 20+
* npm
* Docker
* Docker Compose
* Git

## Clone

```bash
git clone https://github.com/<username>/distributed-job-platform.git
cd distributed-job-platform
```

## Install Dependencies

```bash
npm install
```

## Start Infrastructure

```bash
docker compose up -d
```

This starts:

```text
PostgreSQL
Redis
MinIO
Prometheus
Grafana
```

## Start API

```bash
npm run dev
```

## Start Worker

```bash
npm run worker
```

Multiple workers can be started independently:

```bash
npm run worker -- --worker-id worker-01
npm run worker -- --worker-id worker-02
npm run worker -- --worker-id worker-03
```

---

# Testing

Run unit and integration tests:

```bash
npm test
```

Run the test suite in watch mode:

```bash
npm run test:watch
```

The project aims to test:

* API validation
* Job creation
* Queue operations
* Worker execution
* State transitions
* Retry behavior
* Idempotency
* Concurrency
* Worker failure recovery
* Integration between PostgreSQL and Redis

Load testing will be introduced using **k6** as the platform matures.

---

# Development Roadmap

## V1 — Core Execution Engine

* [x] Initial project architecture
* [ ] Express.js API
* [ ] PostgreSQL schema
* [ ] Redis integration
* [ ] BullMQ queues
* [ ] Job submission
* [ ] Worker execution
* [ ] Job status tracking
* [ ] Result storage

## V2 — Reliability

* [ ] Retry mechanism
* [ ] Exponential backoff
* [ ] Priority queues
* [ ] Job timeout
* [ ] Worker heartbeats
* [ ] Worker failure detection
* [ ] Job cancellation
* [ ] Dead-letter queue

## V3 — Distributed Systems

* [ ] Horizontal worker scaling
* [ ] Idempotency
* [ ] Distributed locking
* [ ] Execution leases
* [ ] Concurrency controls
* [ ] Failure injection
* [ ] Load testing
* [ ] Resource-aware scheduling

## V4 — ML Infrastructure

* [ ] ML training executor
* [ ] Dockerized ML workloads
* [ ] Python/PyTorch integration
* [ ] Training configuration
* [ ] Checkpoint management
* [ ] Model artifact storage
* [ ] Batch inference
* [ ] Experiment tracking

## V5 — Production Deployment

* [ ] Prometheus metrics
* [ ] Grafana dashboards
* [ ] Distributed tracing
* [ ] Kubernetes deployment
* [ ] Horizontal Pod Autoscaling
* [ ] Resource-aware worker scheduling
* [ ] GPU worker support

---

# Engineering Principles

The project is built around several core distributed-systems principles.

### Durability

Persistent job state should survive API and worker restarts.

### Fault Tolerance

Individual worker failures should not result in permanent job loss.

### Idempotency

Repeated client requests should not unintentionally create duplicate work.

### Concurrency Control

Multiple workers must safely coordinate around shared jobs.

### Horizontal Scalability

System throughput should increase by adding workers rather than vertically scaling a single process.

### Observability

Failures, bottlenecks, and resource utilization should be measurable.

### Separation of Concerns

The API, queue, database, workers, storage, and observability layers should remain independently replaceable.

---

# Future Architecture

The eventual system will support containerized workloads and Kubernetes-based worker scaling.

```text
                         Client
                           │
                           ▼
                    Express.js API
                           │
                           ▼
                     Job Scheduler
                           │
                           ▼
                    Redis / BullMQ
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        CPU Worker    CPU Worker    GPU Worker
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                  Container Executor
                           │
                    ┌──────┴──────┐
                    ▼             ▼
               Node Workload   ML Workload
                                  │
                                  ▼
                              PyTorch
                                  │
                                  ▼
                                MinIO
```

Kubernetes will be introduced as the **deployment and scaling layer**, rather than being used to hide the underlying distributed-system implementation.

---

# Why This Project?

This project demonstrates practical engineering across multiple layers of a modern compute platform.

### Backend Engineering

* Node.js
* Express.js
* REST APIs
* PostgreSQL
* Redis
* Asynchronous processing

### Distributed Systems

* Message queues
* Worker coordination
* Retries
* Failure recovery
* Distributed locking
* Idempotency
* Scheduling
* Concurrency

### MLOps

* ML workload orchestration
* Training jobs
* Checkpoint management
* Model artifacts
* Metrics
* Containerized ML execution

### DevOps

* Docker
* Infrastructure as code
* Monitoring
* Metrics
* Horizontal scaling
* Kubernetes

The long-term goal is to build a **small but technically serious distributed compute platform** capable of executing both general-purpose computational jobs and ML workloads.

---

# License

This project is licensed under the **MIT License**.
