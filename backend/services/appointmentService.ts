import * as model from "../models/appointmentModel";

/* =========================
   CORE IMPLEMENTATIONS
   ========================= */

async function _createAppointment(data: any) {
  return await model.insertAppointment(data);
}

async function _getAppointments() {
  return await model.fetchAppointments();
}

async function _updateAppointmentStatus(id: number, status: string) {
  // 1️⃣ status update
  await model.updateStatus(id, status);

  // 2️⃣ SAME appointment fetch (email kosam)
  const appointment = await model.getAppointmentById(id);

  return appointment; // ✅ email untundi
}

/* =========================
   EXISTING EXPORTED METHODS
   (DO NOT DELETE)
   ========================= */

export async function createAppointment(data: any) {
  return _createAppointment(data);
}

export async function getAppointments() {
  return _getAppointments();
}

export async function updateAppointmentStatus(id: number, status: string) {
  return _updateAppointmentStatus(id, status);
}

/* =========================
   ARROW FUNCTION VERSIONS
   ========================= */

export const createAppointmentAlt = async (data: any) => {
  return _createAppointment(data);
};

export const getAppointmentsAlt = async () => {
  return _getAppointments();
};


export const updateAppointmentStatusAlt = async (
  id: number,
  status: string
) => {
  return _updateAppointmentStatus(id, status);
};
import { Request, Response } from "express";

import { Router } from "express";

const router = Router();

router.get("/hello", (req, res) => {
  res.send("hi");
});

export default router;
