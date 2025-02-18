import { MailService } from '@sendgrid/mail';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sgMail = new MailService();
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendEmail() {
  const argv = await yargs(hideBin(process.argv))
    .option('to', {
      alias: 't',
      description: 'Recipient email address',
      type: 'string',
      demandOption: true,
    })
    .option('subject', {
      alias: 's',
      description: 'Email subject',
      type: 'string',
      demandOption: true,
    })
    .option('message', {
      alias: 'm',
      description: 'Email message (HTML supported)',
      type: 'string',
      demandOption: true,
    })
    .option('template-id', {
      description: 'SendGrid template ID (optional)',
      type: 'string',
    })
    .option('dynamic-template-data', {
      description: 'JSON string of dynamic template data (optional)',
      type: 'string',
    })
    .help()
    .argv;

  try {
    const msg = {
      to: argv.to,
      from: 'pasi@lastbot.com',
      subject: argv.subject,
      html: argv.message,
    } as any;

    // If template ID is provided, add template-specific properties
    if (argv.templateId) {
      msg.templateId = argv.templateId;
      if (argv.dynamicTemplateData) {
        msg.dynamicTemplateData = JSON.parse(argv.dynamicTemplateData);
      }
    }

    const response = await sgMail.send(msg);
    console.log('Email sent successfully:', response[0].statusCode);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

sendEmail().catch((error) => {
  console.error('Failed to send email:', error);
  process.exit(1);
}); 