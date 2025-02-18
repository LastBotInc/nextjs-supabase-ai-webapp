import sgMail from '@sendgrid/mail'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

interface SendEmailOptions {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

export async function sendEmail({ to, subject, template, data }: SendEmailOptions) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not found, skipping email send')
    return
  }

  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      templateId: getTemplateId(template),
      dynamicTemplateData: data,
    }

    await sgMail.send(msg)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

function getTemplateId(template: string): string {
  const templates: Record<string, string> = {
    'booking-confirmation': process.env.SENDGRID_BOOKING_CONFIRMATION_TEMPLATE_ID!,
    'booking-notification': process.env.SENDGRID_BOOKING_NOTIFICATION_TEMPLATE_ID!,
  }

  const templateId = templates[template]
  if (!templateId) {
    throw new Error(`Template ${template} not found`)
  }

  return templateId
} 