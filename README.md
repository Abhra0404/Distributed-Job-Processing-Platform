# Distributed Job Processing Platform

A production-oriented distributed job processing platform for submitting, scheduling, executing, monitoring, and managing asynchronous computational workloads across a pool of workers.

The system is designed from the ground up to explore **distributed systems, fault tolerance, concurrency, job orchestration, observability, and ML workload execution** without relying on Kubernetes as the core abstraction.

---

## Overview

Modern ML and data workloads often require long-running computation that should not block an API server. This project provides an asynchronous execution layer where clients submit jobs, workers consume them from a queue, execute workloads, and persist their results.

```text
                         ┌──────────────┐
                         │    Client    │
                         └───────┬──────┘
                                 │
                                 ▼
                         ┌──────────────┐
                         │  FastAPI API │
                         └───────┬──────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
             ┌──────────────┐          ┌──────────────┐
             │  PostgreSQL  │          │    Redis     │
             │ Job Metadata │          │  Job Queue   │
             └──────────────┘          └───────┬──────┘
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         ▼                     ▼                     ▼
                  ┌────────────┐       ┌────────────┐       ┌────────────┐
                  │  Worker 1  │       │  Worker 2  │       │  Worker 3  │
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

## Key Features

### Core Execution

* Asynchronous job submission
* Persistent job metadata
* Redis-backed job queues
* Distributed worker execution
* Job status tracking
* Result and artifact storage
* Job cancellation

### Reliability

* Configurable retry policies
* Exponential backoff
* Failed-job handling
* Dead-letter queues
* Worker heartbeats
* Worker failure detection
* Job timeout handling
* Idempotent job submission

### Scheduling & Concurrency

* Priority-based queues
* Concurrent job execution
* Worker capacity management
* Fair workload distribution
* Distributed job locking

### Observability

* Prometheus metrics
* Grafana dashboards
* Queue-depth monitoring
* Worker health monitoring
* Job execution latency
* Success/failure rates
* Structured application logs

### ML Workloads

The platform can eventually execute workloads such as:

* Model training
* Hyperparameter experiments
* Batch inference
* Data preprocessing
* Evaluation pipelines
* Model artifact generation

---

## Job Lifecycle

Every job follows a well-defined state machine:

```text
                 ┌───────────┐
                 │ SUBMITTED │
                 └─────┬─────┘
                       ▼
                  ┌─────────┐
                  │ QUEUED  │
                  └────┬────┘
                       ▼
                 ┌──────────┐
                 │ RUNNING  │
                 └────┬─────┘
                      │
             ┌────────┴────────┐
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
                          └──────────┘
```

A job can contain metadata such as:

```json
{
  "id": "job_8f92a",
  "type": "training",
  "priority": "high",
  "status": "running",
  "attempt": 2,
  "max_retries": 3,
  "created_at": "2026-08-23T10:30:00Z"
}
```

---

## Architecture

The platform is composed of several independently scalable components.

### API Server

Built with **FastAPI**.

Responsibilities:

* Accept job submissions
* Validate requests
* Manage job metadata
* Expose job status
* Handle cancellation
* Provide administrative APIs

### Job Queue

**Redis** acts as the initial message broker.

Responsibilities:

* Queue pending jobs
* Support priority queues
* Coordinate workers
* Provide fast queue operations

### PostgreSQL

PostgreSQL stores durable system state.

Example entities:

```text
jobs
job_attempts
workers
artifacts
idempotency_keys
```

Redis is responsible for transient queue state, while PostgreSQL remains the source of truth for persistent job metadata.

### Worker Pool

Workers independently consume jobs and execute them.

```text
Worker
 ├── register
 ├── heartbeat
 ├── fetch job
 ├── acquire execution lease
 ├── execute workload
 ├── report result
 └── release resources
```

Workers are designed to be horizontally scalable.

### Artifact Store

**MinIO** provides S3-compatible object storage for:

* Model checkpoints
* Training results
* Logs
* Generated artifacts
* Evaluation outputs

### Observability

**Prometheus** collects metrics and **Grafana** provides dashboards for monitoring the platform.

---

## Technology Stack

| Layer                | Technology     |
| -------------------- | -------------- |
| API                  | FastAPI        |
| Language             | Python         |
| Database             | PostgreSQL     |
| Queue                | Redis          |
| Workers              | Python         |
| Object Storage       | MinIO          |
| Containers           | Docker         |
| Metrics              | Prometheus     |
| Visualization        | Grafana        |
| Testing              | pytest         |
| Load Testing         | Locust         |
| Deployment           | Docker Compose |
| Future Orchestration | Kubernetes     |

---

## API

### Submit a Job

```http
POST /api/v1/jobs
```

Example:

```json
{
  "type": "python",
  "priority": "normal",
  "payload": {
    "task": "data_processing"
  }
}
```

Response:

```json
{
  "job_id": "job_8f92a",
  "status": "queued"
}
```

### Get Job Status

```http
GET /api/v1/jobs/{job_id}
```

Response:

```json
{
  "job_id": "job_8f92a",
  "status": "running",
  "attempt": 1,
  "worker_id": "worker_03"
}
```

### Cancel Job

```http
POST /api/v1/jobs/{job_id}/cancel
```

### List Jobs

```http
GET /api/v1/jobs
```

Filtering and pagination are supported as the API evolves.

---

## Reliability Model

A major goal of the project is to handle failures gracefully.

### Worker Failure

If a worker stops sending heartbeats:

```text
Worker
   │
   │ heartbeat
   ▼
Coordinator
   │
   X heartbeat timeout
   ▼
Worker marked DEAD
   │
   ▼
Running job recovered
   │
   ▼
Returned to queue
```

### Retry Policy

Jobs can be retried automatically based on configured policies.

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
Dead Letter Queue
```

Non-retryable failures can be marked permanently failed without additional attempts.


---

## Observability

The platform exposes metrics such as:

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
```

The monitoring stack provides visibility into:

* Throughput
* Queue latency
* Worker utilization
* Failure rates
* Retry rates
* Job execution time
* Worker availability

---

## Project Roadmap

### V1 — Core Execution Engine

* [x] Project architecture
* [ ] Job submission API
* [ ] Job persistence
* [ ] Redis queue
* [ ] Worker execution
* [ ] Job status tracking
* [ ] Result storage

### V2 — Reliability

* [ ] Retry mechanism
* [ ] Exponential backoff
* [ ] Priority queues
* [ ] Job timeout
* [ ] Worker heartbeats
* [ ] Worker failure detection
* [ ] Job cancellation

### V3 — Distributed Systems

* [ ] Horizontal worker scaling
* [ ] Idempotency
* [ ] Distributed locking
* [ ] Dead-letter queue
* [ ] Execution leases
* [ ] Concurrency controls
* [ ] Failure injection testing
* [ ] Load testing

### V4 — ML Infrastructure

* [ ] ML training executor
* [ ] Experiment configuration
* [ ] Checkpoint management
* [ ] Model artifact storage
* [ ] Training metrics
* [ ] Batch inference jobs
* [ ] ML-specific worker types

### V5 — Production Deployment

* [ ] Dockerized workers
* [ ] Prometheus metrics
* [ ] Grafana dashboards
* [ ] Kubernetes deployment
* [ ] Horizontal Pod Autoscaling
* [ ] Resource-aware scheduling
* [ ] Distributed tracing

---

## Design Goals

The project is intentionally built around several distributed-systems principles:

* **Durability** — job state should survive process failures.
* **Fault tolerance** — worker failures should not permanently lose jobs.
* **Idempotency** — retries should not create unintended duplicate work.
* **Concurrency control** — multiple workers must coordinate safely.
* **Horizontal scalability** — throughput should increase by adding workers.
* **Observability** — failures and bottlenecks should be measurable.
* **Separation of concerns** — API, queue, persistence, execution, and storage remain independently replaceable.

---

## Future Architecture

The eventual platform will support containerized ML workloads:

```text
                ML Training Request
                        │
                        ▼
                  Job Scheduler
                        │
                        ▼
                    Redis Queue
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        CPU Worker           GPU Worker
              │                   │
              └─────────┬─────────┘
                        ▼
                   ML Training
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
        Checkpoints   Metrics   Artifacts
             │          │          │
             └──────────┼──────────┘
                        ▼
                     MinIO
```

Kubernetes will eventually provide container orchestration and worker scaling, but the underlying job execution and reliability mechanisms will remain part of the platform itself.

---

## Why This Project?

This project is designed to demonstrate practical understanding of:

**Backend Engineering**

* REST APIs
* Database design
* Asynchronous processing
* API reliability

**Distributed Systems**

* Message queues
* Worker coordination
* Failure recovery
* Distributed locking
* Idempotency
* Scheduling

**MLOps**

* ML workload orchestration
* Model artifacts
* Training jobs
* Metrics
* Reproducible execution

**DevOps**

* Docker
* Monitoring
* Metrics
* Container orchestration
* Horizontal scaling

The end goal is a small but technically serious **ML compute orchestration platform**, rather than another standalone ML model demo.

---

## License

This project is licensed under the **MIT License**.
