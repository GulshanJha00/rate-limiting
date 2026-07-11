# Token Bucket Rate Limiter Service

A standalone rate limiting service built with **Node.js**, **Express.js**, and **MongoDB** that allows applications to enforce request limits using configurable algorithms. The service exposes REST APIs to validate incoming requests and responds with **ALLOW** or **DENY** decisions based on each client's configured rate-limiting policy.

## Features

* Token Bucket rate limiting algorithm
* Sliding Window rate limiting algorithm
* Per-client configurable limits
* Persistent bucket state using MongoDB
* Race-condition safe request handling
* REST APIs for client management and request validation
* Standard rate-limit response headers
* Load tested for 500+ concurrent requests

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose

## API Endpoints

### Check Request

```http
POST /check
```

Checks whether a request from a client should be allowed.

#### Request

```json
{
  "clientKey": "client123"
}
```

#### Response

```json
{
  "status": "ALLOW"
}
```

or

```json
{
  "status": "DENY"
}
```

---

### Create / Update Client

```http
POST /admin/client
```

Configure rate-limiting rules for a client.

#### Request

```json
{
  "clientKey": "client123",
  "algorithm": "token_bucket",
  "requestsPerSecond": 5,
  "burstSize": 10
}
```

## Algorithms

### Token Bucket

Each client owns a bucket with a configurable capacity. Every incoming request consumes one token. Tokens are automatically replenished over time based on the configured refill rate.

### Sliding Window

Tracks requests within a rolling time window to provide smoother rate limiting while preventing burst traffic from bypassing limits.

## Response Headers

Every `/check` response includes standard rate-limit headers:

* `X-RateLimit-Limit`
* `X-RateLimit-Remaining`
* `X-RateLimit-Reset`

##

## How It Works

1. A client sends a request containing its `clientKey`.
2. The service loads the client's configuration and current limiter state.
3. The configured algorithm evaluates whether the request can be processed.
4. The limiter state is updated atomically.
5. The service returns an `ALLOW` or `DENY` decision along with rate-limit metadata.

## Concurrency

The service safely handles multiple simultaneous requests for the same client by preventing duplicate token consumption and maintaining consistent limiter state.

## Persistence

Limiter state and client configurations are stored in MongoDB, ensuring that token counts and request history survive service restarts.

## Load Testing

The service has been validated under sustained traffic exceeding **500 concurrent requests per second**, ensuring correct request decisions and consistent limiter behavior under load.


### Concurrency Stress Test

The rate limiter was tested using `autocannon` with **100 concurrent connections** for **10 seconds**.

Test configuration:
- Capacity: 30 tokens
- Refill Rate: 100 seconds/token (effectively disables refill during the test)

Results:
- Total Requests: ~53,000
- Successful Requests (200): **30**
- Rejected Requests (429): **52,483**

Since only 30 requests were allowed—the exact number of available tokens—the test confirms that optimistic concurrency and the retry mechanism prevent race conditions and ensure that no extra tokens are consumed under heavy parallel load.