const axios = require("axios");

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

const oneSignalClient = axios.create({
  baseURL: "https://api.onesignal.com/notifications",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": `Basic ${ONESIGNAL_API_KEY}`, // REST API Key
  },
});

async function sendNotification(payload) {
  try {
    const response = await oneSignalClient.post("", {
      app_id: ONESIGNAL_APP_ID,
      ...payload // merge with custom body
    });
    return response.data;
  } catch (error) {
    throw new Error(JSON.stringify(error.response?.data || error.message));
  }
}

module.exports = { sendNotification };
