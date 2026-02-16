import { Request, Response } from "express";
import * as service from "../services/appointmentService";
import {
  sendAppointmentCreatedMail,
  sendStatusUpdateMail,
} from "../services/notificationService";

/**
 * CREATE APPOINTMENT
 * User form submit ayyaka mail vellali
 */
export const createAppointment = async (req: Request, res: Response) => {
  try {
    console.log("📥 Incoming:", req.body);

    const appointment = (await service.createAppointment(req.body)) as any;

    // ✅ EMAIL REQUEST BODY NUNDI
    await sendAppointmentCreatedMail(req.body.email, appointment);

    res.status(201).json({
      message: "Appointment saved successfully",
      data: appointment,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to save appointment" });
  }
};

/**
 * GET ALL APPOINTMENTS (Admin)
 */
export const getAppointments = async (_req: Request, res: Response) => {
  try {
    const data = await service.getAppointments();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

/**
 * UPDATE STATUS (Admin)
 * Status change ayyaka mail vellali
 */
export const updateAppointmentStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status, email } = req.body;

    const updatedAppointment =
      (await service.updateAppointmentStatus(
        Number(id),
        status
      )) as any;

    // ✅ STATUS MAIL – EMAIL REQUEST BODY NUNDI
await sendStatusUpdateMail(
  updatedAppointment.email,
  status,
  updatedAppointment
);


    res.json({
      message: "Status updated successfully",
      data: updatedAppointment,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

