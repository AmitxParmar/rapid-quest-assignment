const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const MessageSchema = new mongoose.Schema({
  wa_id: String,
  meta_msg_id: String,
  text: String,
  status: String,
  timestamp: Date,
});
const Message = mongoose.model("Message", MessageSchema);

async function processFiles() {
  const dirPath = path.join(__dirname, "payloads"); // folder containing JSON files
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dirPath, file), "utf8"));

    if (data.messages) {
      // Insert new message
      for (const msg of data.messages) {
        const ts = await Message.updateOne(
          { meta_msg_id: msg.id },
          {
            wa_id: data.contacts?.[0]?.wa_id || "unknown",
            meta_msg_id: msg.id,
            text: msg.text?.body || "",
            status: "sent",
            timestamp: new Date(msg.timestamp * 1000),
          },
          { upsert: true }
        );
        console.log(ts);
      }
    }

    if (data.statuses) {
      // Update status
      for (const status of data.statuses) {
        const ts = await Message.updateOne(
          { meta_msg_id: status.id },
          { $set: { status: status.status } }
        );
        console.log(ts);
      }
    }
  }

  console.log("Payload processing complete.");
  mongoose.disconnect();
}

processFiles();
