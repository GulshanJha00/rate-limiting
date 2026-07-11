# Token Bucket Rate Limiter Service

A standalone rate limiting service built with **Node.js**, **Express.js**, and **MongoDB** that allows applications to enforce request limits using the **Token Bucket** algorithm. The service exposes REST APIs to validate incoming requests and responds with **ALLOW** or **DENY** decisions based on each client's configured rate-limiting policy.

## Features

* Token Bucket rate limiting algorithm
* Per-client configurable limits
* Persistent bucket state using MongoDB
* Race-condition safe request handling
* REST APIs for client management and request validation
* Standard rate-limit response headers
* Optimistic concurrency control for safe concurrent updates
* Load tested under heavy concurrent traffic

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

#### Success Response

```json
{
  "allowed": true,
  "remainingTokens": 9
}
```

#### Rate Limited Response

```json
{
  "allowed": false,
  "retryAfter": 1
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
  "capacity": 10,
  "remainingToken": 10,
  "refillRate": 1000
}
```

## Algorithm

### Token Bucket

Each client owns a bucket with a configurable capacity.

* Every incoming request consumes one token.
* Tokens are automatically replenished over time based on the configured refill rate.
* If no tokens are available, the request is rejected with **HTTP 429 (Too Many Requests)**.

## Response Headers

Every `/check` response includes standard rate-limit headers:

* `X-RateLimit-Limit`
* `X-RateLimit-Remaining`
* `X-RateLimit-Reset`

## How It Works

1. A client sends a request containing its `clientKey`.
2. The service loads the client's configuration and current bucket state.
3. The Token Bucket algorithm determines whether the request should be allowed.
4. The bucket state is updated safely using optimistic concurrency.
5. The service returns the decision along with rate-limit metadata.

## Concurrency

The service safely handles multiple simultaneous requests for the same client using **Mongoose Optimistic Concurrency Control**.

If multiple requests attempt to update the same client's bucket simultaneously, only one update succeeds. The remaining requests automatically retry using the latest document version, preventing duplicate token consumption and ensuring consistent bucket state.

## Persistence

Client configurations and bucket state are stored in MongoDB, ensuring that rate-limit state survives service restarts.

## Concurrency Stress Test

The rate limiter was tested using **autocannon** with **100 concurrent connections** for **10 seconds**.

### Test Configuration

* Capacity: **30 tokens**
* Refill Rate: **100 seconds/token** (effectively disabled during the test)

### Results

| Metric                    |      Value |
| ------------------------- | ---------: |
| Total Requests            |    ~53,000 |
| Successful Requests (200) |     **30** |
| Rejected Requests (429)   | **52,483** |

### Conclusion

Only **30 requests** were allowed, exactly matching the available number of tokens. No additional requests were able to consume extra tokens, confirming that optimistic concurrency and the retry mechanism successfully prevent race conditions under heavy concurrent load.
