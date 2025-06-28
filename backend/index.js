const express = require("express");
const app = express();
const RouterApp = require("./routes/index")
require('dotenv').config();
app.use(express.json());
const mongoose = require('mongoose');
const cors = require("cors");

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true, 
}))

app.use("/", RouterApp);

app.get("/", (req, res) => {
    res.send("Following are the routes:")
})


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
};
connectDB()
app.listen(8006);
