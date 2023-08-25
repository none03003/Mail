const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require("path");


const app = express();



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = 80;

app.use(express.static('public'));
// Serve the HTML page with the form

app.get('/email-input.html', (req, res) => {
  res.sendFile(path.join(__dirname + '/email-input.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === "user" && password === "password") {
    // Successful login
    res.status(200).send('Login successful');
  } else {
    // Failed login
    res.status(401).send('Login failed. Please check your username and password.');
  }
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

let transporter;

app.post('/setup-smtp', (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass } = req.body;

    transporter = nodemailer.createTransport({
      // SMTP configuration
      "host": smtpHost,  // smtp4dev is running locally
      "port": smtpPort,           // Default SMTP port
      "secure": false,
      "auth": {

        "user": smtpUser,
        "pass": smtpPass
      },
    });

    transporter.verify((error) => {
      if (error) {
        console.error('SMTP setup error:', error);
        res.status(500).json({ success: false, message: 'Error setting up SMTP.', error: error.message });
      } else {
        console.log('SMTP setup successful.');
        res.json({ success: true, message: 'SMTP setup successful.' });
      }
    });
  } catch (error) {
    console.error('JSON parsing error:', error);
    res.status(400).json({ success: false, message: 'Invalid JSON data.' });
  }
});


// POST endpoint to handle the email sending
app.post('/send-email', async (req, res) => {




  try {
    const { recipientEmails, subject, body, sendMethod, domain, fromAddress, contentEncoding } = req.body;
    if (sendMethod === 'smtp') {
      if (!transporter) {
        return res.status(400).send({ success: false, message: 'SMTP is not set up.' });
      }
      const recipients = recipientEmails.split(',').map(email => email.trim());
      // const totalEmails = recipients.length;
      // let sentEmails = 0;


      let contentTransferEncoding = 'quoted-printable';
      if (contentEncoding === 'base64') {
        contentTransferEncoding = 'base64';
      }


      for (const recipient of recipients) {
        const mailOptions = {

          from: `${fromAddress} <noreply@${domain}>`,
          to: recipient,
          subject: subject,
          html: body,
          encoding: contentTransferEncoding,
          contentType: 'text/plain; charset=UTF-8',

        };

        await transporter.sendMail(mailOptions);
      }
      res.send({ success: true, message: 'Email sent successfully using SMTP.' });
    } else {
      res.status(500).send({ success: false, message: 'Error sending email using SMTP.' });
    }
  }
  catch (error) {
    res.status(400).send({ success: false, message: 'Invalid send method.' });
  }
});

app.listen(port, () => {
 // console.log(`Server is running on http://localhost:${port}`);
  //  console.log(`Server is running on http://35.176.170.40:${port} `);
   console.log(`Server is running on http://:${port}`);

});
