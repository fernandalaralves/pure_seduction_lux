import * as Sentry from "@sentry/node";
import express from "express";

const app = express();

// All your controllers should live here

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
  
});

