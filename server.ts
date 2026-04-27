import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/signup-confirmation", async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate SMTP Host
    const smtpHost = process.env.SMTP_HOST || "smtp.ethereal.email";
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Check if SMTP_HOST looks like an email (common misconfiguration)
    if (smtpHost.includes('@')) {
      console.error(`Invalid SMTP_HOST: "${smtpHost}". It looks like an email address instead of a mail server hostname (e.g., smtp.gmail.com).`);
      return res.json({ 
        message: "Signup successful, but confirmation email failed due to server misconfiguration (SMTP_HOST looks like an email).",
        warning: "SMTP misconfiguration" 
      });
    }

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"PropEDGE.COM" <${smtpUser || 'noreply@propedge.com'}>`,
      to: email,
      subject: "Welcome to PropEDGE.COM! Your Signup Confirmation",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
          <h1 style="color: #1a202c; font-size: 24px;">Welcome to PropEDGE.COM, ${name || "Trader"}!</h1>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.5;">
            Thank you for signing up for the ultimate forex prop firm review platform.
          </p>
          <p style="font-size: 16px; color: #4a5568; line-height: 1.5;">
            Start exploring our top-rated firms and find the perfect partner for your trading journey on PropEDGE.COM.
          </p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.APP_URL || 'https://propedge.com'}/firms" style="text-decoration: none; background-color: #10b981; color: white; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">
              Browse Prop Firms
            </a>
          </div>
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #edf2f7;" />
          <p style="font-size: 12px; color: #a0aec0; text-align: center;">
            If you didn't sign up for this account at PropEDGE.COM, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    try {
      if (smtpUser && smtpPass) {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${email} via ${smtpHost}`);
      } else {
        console.log("--- SIMULATED EMAIL (Missing SMTP Config) ---");
        console.log(`Target: ${email}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log("------------------------");
      }
      res.json({ message: "Confirmation email sent" });
    } catch (error: any) {
      console.error("Error sending email:", error.message);
      // Even if email fails, we don't want to crash the signup process for the user
      res.json({ 
        message: "Signup successful, though confirmation email failed to send.", 
        warning: "Email delivery failure",
        details: error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
