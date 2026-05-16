const mongoose = require("mongoose")
const initData = require("./data.js")
const Listing = require("../models/listing.js")

main().then(() => {
  console.log("Connected to MongoDB")
}
).catch((err) => { 
    console.error("Error connecting to MongoDB:", err)
})

async function main(){
    await mongoose.connect("mongodb://localhost:27017/wanderlust")
}

initDB = async () => {
  await Listing.deleteMany({})
   initData.data = initData.data.map((obj) => ({
   ...obj,
   owner:'69c86e6b00a86bde0e2feadf',
  }))
  await Listing.insertMany(initData.data)
  console.log("Database initialized with sample data")
}

initDB()