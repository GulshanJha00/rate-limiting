const User = require("../model/client.model");
const Producer = require("../algorithm/Producer");
const xSecond = require("../algorithm/xSecond");

const MAX_RETRIES = 5;

const checkRateLimit = async (req, res) => {
    const { clientKey } = req.body;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {

        const user = await User.findOne({ clientKey });

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const updateToken = Producer(user);

        let newLastRefill = user.lastRefill;

        if (updateToken > 0) {
            newLastRefill = new Date(
                user.lastRefill.getTime() +
                updateToken * user.refillRate
            );
        }

        let tokens = Math.min(
            user.remainingToken + updateToken,
            user.capacity
        );

        const reset = xSecond(newLastRefill, user);

        if (tokens <= 0) {
            res.set("X-RateLimit-Limit", user.capacity);
            res.set("X-RateLimit-Remaining", 0);
            res.set("X-RateLimit-Reset", reset);

            return res.status(429).json({
                allowed: false,
                retryAfter: reset,
            });
        }

        tokens--;

        user.remainingToken = tokens;
        user.lastRefill = newLastRefill;

        try {

            await user.save();

            res.set("X-RateLimit-Limit", user.capacity);
            res.set("X-RateLimit-Remaining", tokens);
            res.set("X-RateLimit-Reset", reset);

            return res.json({
                allowed: true,
                remainingTokens: tokens,
            });

        } catch (err) {

            // Another request updated the document first
            if (err.name === "VersionError") {
                continue;
            }

            throw err;
        }
    }

    return res.status(409).json({
        message: "Too many concurrent requests. Please retry."
    });
};

module.exports = checkRateLimit;