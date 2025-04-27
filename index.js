const express = require("express");
const { generatePDF } = require("./generatePDF");
const { generateHTML } = require("./generatehtml");
const {sendEmail} = require("./emailsender")
const {scrapeLogic} = require("./scrapeLogic")
const app = express();
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 4000;
const sentEmails = new Set();
app.get("/scrape", (req, res) => {
  scrapeLogic(res);
});

app.post('/webhook', async (req, res) => {
  console.log(req.body)
  const UserInputs = Object.entries(req.body).filter(([key, value]) => key.startsWith('devlly'));
  const data = Object.fromEntries(UserInputs);
  const submissionId = req.body.__submission.id; // Use the submission ID from the request

  // Check if the email for this submission ID has already been sent
  if (sentEmails.has(submissionId)) {
      return res.status(400).send({ status: 'error', message: 'Email has already been sent for this submission ID.' });
  }

  // Generate HTML content based on user inputs
  const htmlContent = generateHTML(req.body, submissionId);

  // Generate PDF from HTML content
  const pdfPath = await generatePDF(htmlContent, 'invoice.pdf');

  // Check if devlly_isMeet is set and adjust email content accordingly
  const emailTemplate = data['devlly_isMeet'] ? 'Votre réservation de réunion est confirmée : Rejoignez-nous via le lien Meet' : 'Urgent: Votre devis est prêt, venez le consulter dès maintenant!';
  const emailText = data['devlly_isMeet']
      ? 'Please find attached your invoice. You can join the Google Meet using the link provided.'
      : 'Please find attached your invoice.';

  // Send the email
  await sendEmail(data['devlly_email'], emailTemplate, emailText, pdfPath, data['devlly_isMeet'], submissionId , data['devlly_meet_date']);

  // Add the unique ID to the sentEmails set
  sentEmails.add(submissionId);

  console.log(req.body);
  res.status(200).send({ status: 'success' });
});


app.get("/", (req, res) => {
  res.send("Devlly server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
