import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";

let transporter: Transporter | null = null;

/**
 * Returns a cached Nodemailer transporter configured for Ethereal SMTP.
 * Creates the transporter lazily on first call.
 */
export async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: env.ETHEREAL_USER,
      pass: env.ETHEREAL_PASS,
    },
  });

  // Verify connection on first use
  await transporter.verify();
  console.log("✅  Nodemailer / Ethereal transporter ready");

  return transporter;
}

export interface SendMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email via Ethereal SMTP and returns the Ethereal preview URL.
 */
export async function sendMail(options: SendMailOptions): Promise<string> {
  const t = await getTransporter();

  const info = await t.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  // Ethereal gives a preview URL for every message
  const previewUrl = nodemailer.getTestMessageUrl(info) as string | false;
  console.log(
    `📧  Email sent to ${options.to} | Preview: ${previewUrl || "n/a"}`
  );

  return previewUrl || "";
}
