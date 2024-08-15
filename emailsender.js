const Imap = require('imap');
const nodemailer = require('nodemailer');
const moment = require('moment');
const { simpleParser } = require('mailparser');

// Email configuration
const senderEmail = 'contact@devlly.net'; // Your Titan email address
const senderPassword = 'Devlly00@'; // Your Titan password

async function sendEmail(to, subject, text, pdfPath, isMeet, submissionId, date) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.titan.email',
        port: 587, // Use 465 for SSL if you want to set secure: true
        secure: false, // Set to true if using port 465
        auth: {
            user: senderEmail,
            pass: senderPassword,
        },
    });

    let mailOptions;
    console.log("ismeet = ", isMeet);
    if (isMeet === 'OK') {
        // Schedule the meeting for the next day at 4 PM
        const meetingDate = moment(date, 'YYYY-MM-DD');

        mailOptions = {
            from: senderEmail,
            to: to,
            subject: subject,
            html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #ddd;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 10px;
                        background-color: #f9f9f9;
                    }
                    h1 {
                        color: #16217C;
                    }
                    .logo {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .logo img {
                        max-width: 150px;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        font-size: 16px;
                        color: white;
                        background-color: #16217C;
                        border-radius: 5px;
                        text-decoration: none;
                        margin-top: 20px;
                    }
                    .button:hover {
                        background-color: #0056b3;
                        color: white;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src="https://i.imgur.com/KHUlNrv.png" alt="Devlly Agency Logo" width="150">
                    </div>
                    <h1>Your vision, our Code!</h1>
                    <p>Bonjour,</p>
                    <p>Merci d'avoir contacté Devlly Agency pour vos besoins en développement. Nous sommes ravis de vous présenter votre devis personnalisé en pièce jointe, ainsi que notre contrat de services.</p>
                    <p>Nous avons également prévu une réunion pour discuter davantage de vos besoins. Rejoignez la réunion en utilisant le lien ci-dessous :</p>
                    <p><strong>Date et Heure:</strong> ${meetingDate.format('DD-MM-YYYY à HH:mm')}</p>
                    <a href="https://meet.google.com/uit-bvdy-zya" class="button">Rejoindre la réunion</a>
                    <p>Si vous avez des questions ou des besoins supplémentaires, n'hésitez pas à nous contacter. Nous sommes là pour vous aider.</p>
                    <p>Cordialement,<br>L'équipe Devlly Agency</p>
                </div>
            </body>
            </html>
            `,
        };
        console.log("we sent a meeting email");
    } else {
        const paymentLink = `https://devlly.net/?fluent-form=4&submission_id=${submissionId}&email=${encodeURIComponent(to)}`;

        mailOptions = {
            from: senderEmail,
            to: to,
            subject: subject,
            html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #ddd;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 10px;
                        background-color: #f9f9f9;
                    }
                    h1 {
                        color: #16217C;
                    }
                    .logo {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .logo img {
                        max-width: 150px;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        font-size: 16px;
                        color: white;
                        background-color: #16217C;
                        border-radius: 5px;
                        text-decoration: none;
                        margin-top: 20px;
                    }
                    .button:hover {
                        background-color: #0056b3;
                        color: white;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src="https://i.imgur.com/KHUlNrv.png" alt="Devlly Agency Logo" width="150">
                    </div>
                    <h1>Your vision, our Code!</h1>
                    <p>Bonjour,</p>
                    <p>Merci d'avoir contacté Devlly Agency pour vos besoins en développement. Nous sommes ravis de vous présenter votre devis personnalisé en pièce jointe, ainsi que notre contrat de services.</p>
                    <p>Pour faciliter le processus, nous avons également inclus un lien où vous pouvez procéder au paiement directement si vous acceptez notre offre et les détails du contrat :</p>
                    <a href="${paymentLink}" class="button">Procéder au paiement</a>
                    <p>Si vous avez des questions ou des besoins supplémentaires, n'hésitez pas à nous contacter. Nous sommes là pour vous aider.</p>
                    <p>Cordialement,<br>L'équipe Devlly Agency</p>
                </div>
            </body>
            </html>
            `,
            attachments: [
                {
                    filename: "Votre Devis.pdf",
                    path: pdfPath,
                },
                {
                    filename: "contract de travail.pdf",
                    path: "./contract de travail.pdf",
                },
            ],
        };
    }

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
        console.log('Info object:', info);

        // Append the sent email to the "Sent" folder using IMAP
        const imap = new Imap({
            user: senderEmail,
            password: senderPassword,
            host: 'imap.titan.email',
            port: 993,
            tls: true,
        });

        imap.once('ready', () => {
            imap.openBox('Sent', true, (err) => {
                if (err) {
                    console.error('Error opening "Sent" folder:', err);
                    imap.end();
                    return;
                }

                // Create the email message as MIMEText
                const emailMessage = `From: ${senderEmail}\r\nTo: ${to}\r\nSubject: ${subject}\r\n\r\n${text}`;

                // Append the sent email to the "Sent" folder
                imap.append(emailMessage, { mailbox: 'Sent' }, (appendErr) => {
                    if (appendErr) {
                        console.error('Error appending email to "Sent" folder:', appendErr);
                    } else {
                        console.log('Email appended to "Sent" folder.');
                    }
                    imap.end();
                });
            });
        });

        imap.once('error', (imapErr) => {
            console.error('IMAP Error:', imapErr);
        });

        imap.connect();
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Export the sendEmail function
module.exports = { sendEmail };
