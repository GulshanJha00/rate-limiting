# Making Token Bucket Rate Limiter Concurrency Safe using Optimistic Concurrency

## The Problem

Suppose our database has:

```json
{
    "remainingToken": 1
}
```

Now two users send requests **at exactly the same time**.

### Request A

Reads:

```
remainingToken = 1
```

### Request B

Also reads:

```
remainingToken = 1
```

Both think there is one token left.

Both decrease it to `0`.

Both save it.

Result:

```
Request A ✅ Allowed
Request B ✅ Allowed
```

But this is wrong.

There was only **one token**, so only **one request** should have been allowed.

This problem is called a **Race Condition**.

---

# How MongoDB Solves This

MongoDB itself does not automatically prevent this.

Instead, Mongoose provides **Optimistic Concurrency Control**.

Enable it like this:

```javascript
const UserSchema = new mongoose.Schema({...}, {
    optimisticConcurrency: true
});
```

When this option is enabled, Mongoose automatically creates a field named:

```
__v
```

This is called the **Version Key**.

Every document has its own version.

Example:

```
{
    remainingToken: 5,
    __v: 7
}
```

Whenever a document is successfully saved,

```
__v++
```

So after saving,

```
{
    remainingToken: 4,
    __v: 8
}
```

---

# Why Version Number Helps

Imagine two requests.

Initial database:

```
remainingToken = 5
__v = 10
```

Both Request A and Request B read the document.

```
A sees version 10
B also sees version 10
```

Request A saves first.

Database becomes:

```
remainingToken = 4
__v = 11
```

Now Request B tries to save.

But Request B is still trying to update **version 10**.

MongoDB checks:

```
Current version = 11

Expected version = 10
```

Versions don't match.

So MongoDB rejects the update.

Mongoose throws

```
VersionError
```

This prevents two requests from overwriting each other's work.

---

# Retry Loop

If we simply return an error after `VersionError`, then many valid requests will fail whenever multiple requests arrive together.

Instead, we retry.

Pseudo flow:

```
Read document

↓

Calculate tokens

↓

Try to save

↓

Success?
```

If save succeeds,

```
Done ✅
```

If save fails because of `VersionError`,

```
Read the latest document again

↓

Recalculate

↓

Try saving again
```

Usually, the second attempt succeeds.

---

# Understanding checkRateLimit()

The controller works in these steps.

---

## Step 1

Read the user from MongoDB.

```javascript
const user = await User.findOne({ clientKey });
```

We need the latest token bucket state.

---

## Step 2

Calculate how many new tokens should be added.

```javascript
const updateToken = Producer(user);
```

Example

```
Refill rate = 2 seconds

Last refill = 10:00:00

Current time = 10:00:08
```

Elapsed time

```
8 seconds
```

Generated tokens

```
8 / 2 = 4
```

---

## Step 3

Update the refill time.

```javascript
newLastRefill = ...
```

If 4 tokens were generated,

```
lastRefill

10:00:00
```

becomes

```
10:00:08
```

Otherwise, the same 8 seconds would be counted again during the next request.

---

## Step 4

Refill the bucket.

```javascript
tokens = Math.min(
    remainingToken + updateToken,
    capacity
);
```

Suppose

```
Capacity = 10

Current tokens = 8

Generated = 5
```

Without `Math.min`

```
13 tokens
```

which is impossible.

So we keep

```
10 tokens
```

The bucket never exceeds its capacity.

---

## Step 5

Check if a token is available.

```javascript
if(tokens <= 0)
```

If there are no tokens,

Return

```
429 Too Many Requests
```

Otherwise,

Consume one token.

```
tokens--
```

---

## Step 6

Save the updated document.

```javascript
await user.save();
```

If nobody modified the document,

Save succeeds.

If another request already modified it,

Mongoose throws

```
VersionError
```

---

## Step 7

Retry if necessary.

```javascript
catch(err){
    if(err.name === "VersionError"){
        continue;
    }
}
```

The loop starts again.

This time it reads the newest version of the document.

Now calculations happen on fresh data instead of outdated data.

---

# Complete Flow

```
Client Request

      │

      ▼

Read User

      │

      ▼

Calculate Refilled Tokens

      │

      ▼

Update lastRefill

      │

      ▼

Bucket Full?

      │

      ▼

Consume One Token

      │

      ▼

Try Save

      │
      │
      ├──────────────► Success
      │                     │
      │                     ▼
      │               Return 200
      │
      ▼

VersionError

      │

      ▼

Read Latest Document Again

      │

      ▼

Repeat

```

---

# Example

Database

```
remainingToken = 1
__v = 5
```

Three requests arrive together.

### Request A

Reads

```
1 token
```

Consumes it.

Saves successfully.

Database becomes

```
remainingToken = 0
__v = 6
```

Returns

```
200 OK
```

---

### Request B

Reads

```
1 token
```

Tries to save.

Gets

```
VersionError
```

Retries.

Reads again.

Now database contains

```
remainingToken = 0
```

No token is available.

Returns

```
429 Too Many Requests
```

---

### Request C

Same as Request B.

Returns

```
429 Too Many Requests
```

Final result

```
Request A ✅ Allowed

Request B ❌ 429

Request C ❌ 429
```

This is exactly what we want.



## Why Do We Need the Retry Loop?

When two or more requests arrive at the same time, they may all read the same token count.

For example:

```text
remainingToken = 10

Request A → reads 10
Request B → reads 10
```

* Request **A** saves first, so `remainingToken` becomes **9**.
* Request **B** tries to save its old data and gets a **VersionError** because the document has already been updated.

Instead of failing immediately, **Request B retries**:

1. Reads the latest document (`remainingToken = 9`).
2. Recalculates the token count.
3. Consumes one token.
4. Saves successfully (`remainingToken = 8`).

This ensures that **valid requests don't fail just because they lost the race to update the document**. If no tokens are left after retrying, the request correctly returns **429 Too Many Requests**.
