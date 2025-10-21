// countModule.js
import { Router, Request, Response } from "express";

interface CounterRequest extends RequestObject<Number> {}
interface CounterResult extends ResultObject<Number> {}

// Initialize count
let count = 0;

const countRouter = Router();

// Get current count
countRouter.get("/", (_req, res: Response<CounterResult>) => {
  return res.status(200).json({
    resultType: "SUCCESS",
    dataContent: count,
    metaData: { version: "1.0.0" },
  });
});

// Update count (increment by 1 or specified value
countRouter.post(
  "/",
  (req: Request<CounterRequest>, res: Response<CounterResult>) => {
    try {
      const newCount = req.body.dataContent || 0;

      // Validate input
      if (
        typeof newCount !== "number" ||
        !Number.isInteger(newCount) ||
        newCount < 0
      )
        throw new Error("Count must bigger then zero");

      count = newCount;

      return res.status(200).json({
        resultType: "SUCCESS",
        resultMessage: `Count set by ${newCount}`,
        dataContent: count,
        metaData: { version: "1.0.0" },
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          resultType: "ERROR",
          resultMessage: error.message,
          metaData: { version: "1.0.0" },
        });
      }
      return res.status(500).json({
        resultType: "ERROR",
        resultMessage: "An unknown error occurred",
        metaData: { version: "1.0.0" },
      });
    }
  }
);

// Update count (increment by 1 or specified value
countRouter.put(
  "/",
  (req: Request<CounterRequest>, res: Response<CounterResult>) => {
    try {
      const increment = req.body.dataContent || 0;

      // Validate input
      if (
        typeof increment !== "number" ||
        !Number.isInteger(increment) ||
        increment < 1
      )
        throw new Error("Increment must be a positive integer");

      count += increment;

      return res.status(200).json({
        resultType: "SUCCESS",
        resultMessage: `Count increased by ${increment}`,
        dataContent: count,
        metaData: { version: "1.0.0" },
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          resultType: "ERROR",
          resultMessage: error.message,
          metaData: { version: "1.0.0" },
        });
      }
    }
    return res.status(500).json({
      resultType: "ERROR",
      resultMessage: "An unknown error occurred",
      metaData: { version: "1.0.0" },
    });
  }
);

// Reset count to zero
countRouter.delete("/", (_req, res: Response<CounterResult>) => {
  count = 0;

  return res.status(200).json({
    resultType: "SUCCESS",
    resultMessage: "Count reset to zero",
    dataContent: count,
    metaData: { version: "1.0.0" },
  });
});

export default countRouter;
