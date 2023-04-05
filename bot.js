const { Client, LocalAuth } = require("whatsapp-web.js");

/**
 * qr code terminal
 */
const qrcode = require("qrcode-terminal");

/**
 * express.js
 */
const express = require("express");

/**
 * initialize express
 */
const app = express();

require('dotenv').config()

/**
 * initialize whatsapp-web.js
 */
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});


client.on("qr", (qr) => {
    // console.log(qr)
    qrcode.generate(qr, { small: true })
});


client.on("ready", () => {

  console.info("whatsapp bot ready...");

  /**
   * @property {string} req.token request api token
   */
  app.get("/send-message/", async (req, res) => {

    try {

      let whatsapp_number = req.query.whatsapp_number;
      let message = req.query.text;

      if (!whatsapp_number) {
        res.json({
          status: 422,
          message: "please provide whatsapp number",
        });
      }

      if (!message) {
        res.json({
          status: 422,
          message: "please provide message body",
        });
      }
      if (!req.query.token || req.query.token !== process.env.TOKEN) {
        res.json({
          status: 422,
          message: "invalid token",
        });
      }

      const sanitized_number = whatsapp_number
        .toString()
        .replace(/[- )(]/g, "");

      const final_number = `62${sanitized_number.substring(
        sanitized_number.length - 11
      )}`;

      const number_details = await client.getNumberId(final_number);
      
      if (!number_details) {
        
        res.json({
          status:404,
          message:'WhatsApp number is not registered'
        })

      }else{
        await client.sendMessage(
            number_details._serialized,
            message
        );
      }

      res.json({ whatsapp_number: whatsapp_number, message: message,status: '200',status_message: 'message sent' });

    } catch (error) {
        // console.error(error);
    }
  });

});

client.initialize().then(() => {

  app.listen(process.env.PORT || 3000, () => {

    console.info(`Webservice running on port *:${process.env.PORT}`);

  });

});
