import pool from "../config/db";

/**
 * INSERT APPOINTMENT
 */
export async function insertAppointment(a: any) {
  const sql = `
    INSERT INTO appointments
    (name, email, phone, appointment_date, department, doctor, symptoms, age, gender, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    a.name,
    a.email,
    a.phone,
    a.appointment_date,
    a.department,
    a.doctor,
    a.symptoms,
    a.age,
    a.gender,
    a.status || "pending",
  ];

  const [result] = await pool.execute(sql, values);
  return result;
}

/**
 * FETCH ALL APPOINTMENTS
 */
export async function fetchAppointments() {
  const [rows] = await pool.query(
    "SELECT * FROM appointments ORDER BY created_at DESC"
  );
  return rows;
}

/**
 * UPDATE STATUS
 */
export async function updateStatus(id: number, status: string) {
  const [result] = await pool.execute(
    "UPDATE appointments SET status=? WHERE id=?",
    [status, id]
  );
  return result;
} 

/**
 * GET APPOINTMENT BY ID (IMPORTANT FOR EMAIL)
 */
export async function getAppointmentById(id: number) {
  const [rows]: any = await pool.query(
    "SELECT * FROM appointments WHERE id = ?",
    [id]
  );

  return rows[0]; // 👈 MUST return full row including email
}
