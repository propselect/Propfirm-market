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

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: '"PropEDGE.COM" <noreply@propedge.com>',
      to: email,
      subject: "Welcome to PropEDGE.COM! Your Signup Confirmation",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h1 style="color: #1a202c;">Welcome to PropEDGE.COM, ${name || "Trader"}!</h1>
          <p style="font-size: 16px; color: #4a5568;">
            Thank you for signing up for the ultimate forex prop firm review platform.
          </p>
          <p style="font-size: 16px; color: #4a5568;">
            Start exploring our top-rated firms and find the perfect partner for your trading journey on PropEDGE.COM.
          </p>
          <div style="margin-top: 30px; display: flex; flex-direction: column; gap: 10px;">
            <a href="${process.env.APP_URL}/firms" style="text-decoration: none; background-color: #2f855a; color: white; padding: 12px 24px; border-radius: 6px; text-align: center; display: inline-block;">
              Browse Prop Firms
            </a>
          </div>
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #edf2f7;" />
          <p style="font-size: 12px; color: #a0aec0;">
            If you didn't sign up for this account at PropEDGE.COM, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${email}`);
      } else {
        console.log("--- SIMULATED EMAIL (Missing SMTP Config) ---");
        console.log(`To: ${email}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log("------------------------");
      }
      res.json({ message: "Confirmation email sent" });
    } catch (error) {
      console.error("Error sending email:", error);
      // Even if email fails, we don't want to crash the signup process for the user
      // We just log it and send a success response to the client
      res.json({ message: "Signup successful, though confirmation email failed to send.", warning: "Email delivery failure" });
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
