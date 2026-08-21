const mongoose = require('mongoose');

async function testMongo() {
  const uri1 = "mongodb+srv://abibdipto_db_user:1234@cluster0.c3qrv2g.mongodb.net/pulse_chat?retryWrites=true&w=majority";
  const uri2 = "mongodb+srv://task-user:1234@cluster0.c3qrv2g.mongodb.net/pulse_chat?retryWrites=true&w=majority";

  console.log("Testing URI 1 (abibdipto_db_user)...");
  try {
    await mongoose.connect(uri1, { serverSelectionTimeoutMS: 5000 });
    console.log("✓ Connected successfully with uri1!");
    await mongoose.disconnect();
    return;
  } catch (err) {
    console.log("URI 1 failed:", err.message);
  }

  console.log("Testing URI 2 (task-user)...");
  try {
    await mongoose.connect(uri2, { serverSelectionTimeoutMS: 5000 });
    console.log("✓ Connected successfully with uri2!");
    await mongoose.disconnect();
    return;
  } catch (err) {
    console.log("URI 2 failed:", err.message);
  }
}

testMongo();
