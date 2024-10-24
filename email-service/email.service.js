import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const FROM_EMAIL = '"GRPC-TEST" <myspamstuff9@gmail.com>';

const { GMAIL_EMAIL, GMAIL_APP_PASSWORD } = process.env;

if (!GMAIL_EMAIL || !GMAIL_APP_PASSWORD) {
	throw new Error(
		'Missing required environment variables: GMAIL_EMAIL or GMAIL_APP_PASSWORD'
	);
}

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: GMAIL_EMAIL,
		pass: GMAIL_APP_PASSWORD,
	},
});

transporter.verify(function (error, success) {
	if (error) {
		console.error('Error with email transporter configuration:', error);
	} else {
		console.log('Email transporter is ready to send messages');
	}
});

const sendEmail = async ({ to, subject, text, html = null }) => {
	try {
		const info = await transporter.sendMail({
			from: FROM_EMAIL,
			to: to, // list of receivers
			subject: subject,
			text: text,
			html: html || text, // Set the same content for html as a fallback
		});

		console.log(`Email successfully sent to ${to}: ${info.response}`);
	} catch (err) {
		console.error(`Error delivering email to ${to}:`, err);
		throw err;
	}
};

export const emailService = {
	sendEmail,
};
