// countModule.js
import { Router } from 'express';

// Initialize count
let count = 0;

const countRouter = Router();

// Get current count
countRouter.get("/", (_req, res) => {
  return res.status(200).json({ count });
});

// Update count (increment by 1 or specified value)
countRouter.post("/", (req, res) => {
  const { increment = 1 } = req.body;

  // Validate input
  if (
    typeof increment !== "number" ||
    !Number.isInteger(increment) ||
    increment < 1
  ) {
    return res.status(400).json({
      error: "Increment must be a positive integer",
    });
  }

  count += increment;

  return res.status(200).json({
    count,
    message: `Count increased by ${increment}`,
  });
});

// Reset count to zero
countRouter.delete("/", (_req, res) => {
  count = 0;

  return res.status(200).json({
    count,
    message: "Count reset to zero",
  });
});

export default countRouter;