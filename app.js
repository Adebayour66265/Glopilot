require("dotenv");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoute = require('./routes/userRoute');
const errorHandler = require('./middleware/errorMiddleware');


const app = express();

//  middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true,
}));

// Routes 
app.use('/api/users', userRoute)

app.get('/', (req, res) => {
    console.log('Home Pages');
})


// Error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => {
        console.log('App is Ruuning');
    })
}).catch((err) => {
    console.log(err);
});

// app.listen(PORT, () => {
//     console.log('App is Ruuning');
// })