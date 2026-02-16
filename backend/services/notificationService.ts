import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * APPOINTMENT CREATE MAIL
 */
export const sendAppointmentCreatedMail = async (
  to: string,
  appointment: any
) => {
  if (!to) {
    console.log("❌ Email missing, mail not sent");
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: to, // ✅ always required
    subject: "Appointment Confirmation",
    text: `
Hello ${appointment.name || "Patient"},

Your appointment has been successfully booked.

Date: ${
      appointment.appointment_date || appointment.date || "Not mentioned"
    }
Status: ${appointment.status || "Pending"}

Thank you.
`,
  });
};

/**
 * STATUS UPDATE MAIL
 */
export const sendStatusUpdateMail = async (
  to: string,
  status: string,
  appointment: any
) => {
  if (!to) {
    console.log("❌ Email missing, status mail not sent");
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: to, // ✅ always required
    subject: `Appointment ${status}`,
    text: `
Hello ${appointment.name || "Patient"},

Your appointment status has been updated.

Date: ${
      appointment.appointment_date || appointment.date || "Not mentioned"
    }
Current Status: ${status}

Thank you.
`,
  });
};
