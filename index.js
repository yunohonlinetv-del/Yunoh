const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

const client = new twilio.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

app.post('/webhook', async (req, res) => {
    const messageBody = req.body.Body;
    const sender = req.body.From;

    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: messageBody }],
        });

        const reply = response.data.choices[0].message.content;
        await client.messages.create({
            body: reply,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: sender,
        });

        res.status(200).send('Message sent');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});