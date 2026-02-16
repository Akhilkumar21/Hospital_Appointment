import { Router } from "express";
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus
} from "../controllers/appointmentController";

const router = Router();

/* CREATE APPOINTMENT */
router.post("/", createAppointment);

/* GET ALL APPOINTMENTS */
router.get("/", getAppointments);

/* UPDATE STATUS */
router.put("/:id/status", updateAppointmentStatus);

export default router;
