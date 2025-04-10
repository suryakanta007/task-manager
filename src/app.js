import express from "express"
import cookieParser from "cookie-parser";
import healthCheckRouter from "./routes/healthcheck.routes.js"
import userRoutes from "./routes/auth.routes.js"
import path from "path";
import { fileURLToPath } from "url";


// Needed to get dirname in ES Module
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);



const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use("/public", express.static(path.join(dirname, "../public")));


// Routers imports 


app.use("/api/v1/healthcheck",healthCheckRouter);
app.use("/api/v1/auth/",userRoutes)
app.get("/",(req,res)=>{
    req.send("Server basic is ok.")
})

export default app


// import express from "express";

// const app = express();

// // Routers Imports
// import healthCheckRouter from "./routes/healthcheck.routes.js";

// app.use("/api/v1/healthcheck", healthCheckRouter);

// export default app;