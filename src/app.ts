import express from "express"



const app = express();

app.use (express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to BugForge Server API!",
  });
});


export default app;