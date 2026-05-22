import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import globalRouter from "./modules/routes";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use((req, res, next) => {
  console.log("HIT:", req.method, req.url);
  next();
});
app.use(express.json());
app.use("/api", globalRouter);
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to BugForge Server API!",
  });
});

app.use(globalErrorHandler);
export default app;
