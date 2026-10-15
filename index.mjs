import * as Sentry from "@sentry/node";
import express from "express";

const app = express();

// All your controllers should live here

app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

