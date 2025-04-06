const express = require("express");
const app = express();
const cors = require("cors");
const RouterApp=require("./routes/index")
const { connectDB } = require("./db");
require('dotenv').config();
app.use(cors());
app.use(express.json());

app.use("/api", RouterApp);

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
app.listen(3006);
