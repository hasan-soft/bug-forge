import express, { type Application, type Request, type Response } from "express";



const app : Application = express();

app.get("/", (req : Request, res : Response) => {
  res.send("Hello World!");
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});