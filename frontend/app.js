/*********************************
 WAIT FOR FULL PAGE LOAD
*********************************/
let ALL_APPOINTMENTS = [];

document.addEventListener("DOMContentLoaded", function () {

  const API_URL = "http://localhost:5000/api/appointments";
  
  
  /*********************************
   COMMON INPUT STYLE
  *********************************/
  document.querySelectorAll(".input").forEach(el=>{
    el.classList.add("border","p-2","rounded","w-full");
  });

  /*********************************
   DATE FORMAT FIX
  *********************************/
  function formatDateForMySQL(input){
    if(!input) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    const p = input.split("-");
    return p.length===3 ? `${p[2]}-${p[1]}-${p[0]}` : input;
  }

  /*********************************
   APPOINTMENT REGISTER (ALL PAGES)
  *********************************/
  const form = document.getElementById("appointmentForm");

  if(form){
    form.addEventListener("submit", async function(e){
      e.preventDefault();
        const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "Submitting...";


      const popup =
        document.getElementById("successPopup") ||
        document.getElementById("msg");

      /* ✅ FINAL DB-MATCHING DATA */
      const appointment = {
        name: document.getElementById("name")?.value.trim() || "",
        email: document.getElementById("email")?.value.trim() || "",
        phone: document.getElementById("phone")?.value.trim() || "",

        appointment_date: formatDateForMySQL(
          document.getElementById("appointmentDate")?.value ||
          document.getElementById("date")?.value
        ),

        department: document.getElementById("department")?.value.trim() || "",
        doctor: document.getElementById("doctor")?.value.trim() || "",

        symptoms:
          document.getElementById("symptoms")?.value ||
          document.getElementById("notes")?.value ||
          "",

        age: document.getElementById("age")?.value
          ? Number(document.getElementById("age").value)
          : null,

        gender: document.getElementById("gender")?.value || null,

        status: "pending",

        /* UI FLAGS */
        sendEmail: true,
        sendSMS: true
      };

      /*********************************
       REQUIRED FIELDS VALIDATION
      *********************************/
      if(
        !appointment.name ||
        !appointment.phone ||
        !appointment.appointment_date ||
        !appointment.department ||
        !appointment.doctor
      ){
  popup.innerText = "❌ Please fill required fields";
  popup.className = "bg-red-100 text-red-700 p-3 rounded";
  popup.classList.remove("hidden");

  submitBtn.disabled = false;
  submitBtn.innerText = "Register Appointment";
  return;

      }

      console.log("📤 Sending to backend:", appointment);

      /*********************************
       SEND TO BACKEND
      *********************************/
      try{
        const res = await fetch(API_URL,{
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify(appointment)
        });

        if(!res.ok) throw new Error("Backend failed");

        /* ✅ SUCCESS UI */
        popup.className = "bg-green-100 text-green-700 p-4 rounded";
        popup.innerHTML = `
          ✅ Appointment Registered Successfully!<br><br>
          📧 Email Confirmation Sent<br>
          📱 SMS Confirmation Sent
        `;
        popup.classList.remove("hidden");

        form.reset();
        setTimeout(()=>popup.classList.add("hidden"),5000);

      }catch(err){
popup.innerText = "❌ Backend Error";
popup.className = "bg-red-100 text-red-700 p-3 rounded";
popup.classList.remove("hidden");
console.error(err);

submitBtn.disabled = false;
submitBtn.innerText = "Register Appointment";

      }
    });
  }

  /*********************************
   ADMIN DASHBOARD (UNCHANGED)
  *********************************/
  const table = document.getElementById("appointmentTable");
  
async function renderDashboard() {
  if (!table) return;

  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");

  const searchValue = searchInput ? searchInput.value.toLowerCase() : "";
  const statusValue = statusFilter ? statusFilter.value : "";

  console.log("🔍 SEARCH:", searchValue);
  console.log("📌 STATUS:", statusValue);

  table.innerHTML = "";

  let p = 0, c = 0, co = 0, na = 0;

  const res = await fetch(API_URL);
  const json = await res.json();
  const data = json.data;

  const filteredData = data.filter(a => {
    const name = a.name?.toLowerCase() || "";
    const phone = a.phone || "";

    const searchMatch =
      name.includes(searchValue) ||
      phone.includes(searchValue);

    const statusMatch =
      statusValue === "" || a.status === statusValue;

    return searchMatch && statusMatch;
  });

  console.log("✅ FILTERED DATA:", filteredData);

  filteredData.forEach(a => {
    if (a.status === "pending") p++;
    if (a.status === "confirmed") c++;
    if (a.status === "completed") co++;
    if (a.status === "cancelled") na++;

    table.innerHTML += `
      <tr class="border-t">
        <td class="p-3">${a.name}</td>
        <td>${a.phone}</td>
        <td>${a.department}</td>
        <td>${a.doctor}</td>
        <td>${a.appointment_date}</td>
        <td class="flex gap-2 items-center">
          <select id="status-${a.id}" class="border px-2 py-1 rounded">
            <option value="pending" ${a.status==="pending"?"selected":""}>PENDING</option>
            <option value="confirmed" ${a.status==="confirmed"?"selected":""}>CONFIRMED</option>
            <option value="completed" ${a.status==="completed"?"selected":""}>COMPLETED</option>
            <option value="cancelled" ${a.status==="cancelled"?"selected":""}>NOT AVAILABLE</option>
          </select>

          <button
            onclick="updateStatus(${a.id})"
            class="bg-teal-600 text-white px-3 py-1 rounded text-sm">
            Update
          </button>
        </td>
      </tr>
    `;
  });

  if (window.totalCount) {
    totalCount.innerText = filteredData.length;
    pendingCount.innerText = p;
    confirmedCount.innerText = c;
    completedCount.innerText = co;
    naCount.innerText = na;
  }
}
async function searchAppointmentsBelow() {
  const searchValue =
    document.getElementById("searchInput").value.toLowerCase();

  const statusValue =
    document.getElementById("statusFilter").value;

  const resultBox = document.getElementById("searchResults");
  const body = document.getElementById("searchTableBody");

  body.innerHTML = "";

  if (!searchValue && !statusValue) {
    resultBox.classList.add("hidden");
    return;
  }

  const res = await fetch(API_URL);
  const { data } = await res.json();

  const filtered = data.filter(a => {
    const matchSearch =
      a.name.toLowerCase().includes(searchValue) ||
      a.phone.includes(searchValue);

    const matchStatus =
      statusValue === "" || a.status === statusValue;

    return matchSearch && matchStatus;
  });

  if (filtered.length === 0) {
    body.innerHTML =
      `<tr><td colspan="6" class="text-center p-4">No results found</td></tr>`;
  }

  filtered.forEach(a => {
    body.innerHTML += `
      <tr class="border-t">
        <td class="p-2">${a.name}</td>
        <td>${a.phone}</td>
        <td>${a.department}</td>
        <td>${a.doctor}</td>
        <td>${a.appointment_date}</td>
        <td>${a.status.toUpperCase()}</td>
      </tr>
    `;
  });

  resultBox.classList.remove("hidden");
}
document.getElementById("searchInput")
  .addEventListener("keyup", searchAppointmentsBelow);

document.getElementById("statusFilter")
  .addEventListener("change", searchAppointmentsBelow);


window.updateStatus = async function(id){
  const status = document.getElementById(`status-${id}`).value;

  await fetch(`${API_URL}/${id}/status`,{
    method:"PUT",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ status })
  });

  // Optional toast
  const toast = document.getElementById("toast");
  if (toast) {
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }

  renderDashboard();
};


  renderDashboard();
});

window.checkStatus = async function () {
  const phone = document.getElementById("statusPhone")?.value.trim();
  const email = document.getElementById("statusEmail")?.value.trim();

  if (!phone && !email) {
    alert("Please enter phone or email");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/appointments/status-check?phone=${phone}&email=${email}`
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // 🔼 SHOW STATUS SECTION BELOW HEADER
    const section = document.getElementById("statusPage");
    section.classList.remove("hidden");

    // 🔼 SCROLL JUST BELOW HEADER
    section.scrollIntoView({ behavior: "smooth", block: "start" });

    // Fill values
    document.getElementById("pName").innerText = data.data.name;
    document.getElementById("pDate").innerText = data.data.appointment_date;
    document.getElementById("pDoctor").innerText = data.data.doctor;
    document.getElementById("pDept").innerText = data.data.department;

    const statusEl = document.getElementById("pStatus");
    const status = data.data.status;

    statusEl.innerText = status.toUpperCase();

    // 🎨 Status color
    if (status === "pending") {
      statusEl.className =
        "inline-block px-8 py-3 rounded-full bg-yellow-500 text-white text-xl font-bold";
    } else if (status === "confirmed") {
      statusEl.className =
        "inline-block px-8 py-3 rounded-full bg-blue-600 text-white text-xl font-bold";
    } else if (status === "completed") {
      statusEl.className =
        "inline-block px-8 py-3 rounded-full bg-green-600 text-white text-xl font-bold";
    } else {
      statusEl.className =
        "inline-block px-8 py-3 rounded-full bg-red-600 text-white text-xl font-bold";
    }

  } catch (err) {
    alert("Appointment not found");
  }
};
/*********************************
 CONFIG
*********************************/
const API_URL = "http://localhost:5000/api/appointments";

/*********************************
 CHECK APPOINTMENT STATUS
*********************************/
window.checkStatus = async function () {

  const phone = document.getElementById("statusPhone").value.trim();
  const email = document.getElementById("statusEmail").value.trim();

  if (!phone && !email) {
    alert("Please enter phone or email");
    return;
  }

  try {
    // 🔹 Fetch all appointments (same as admin dashboard)
    const res = await fetch(API_URL);
    const { data } = await res.json();

    // 🔹 Find matching patient
    const patient = data.find(a =>
      (phone && a.phone === phone) ||
      (email && a.email === email)
    );

    if (!patient) {
      alert("Appointment not found");
      return;
    }

    // 🔹 Show result section
    const section = document.getElementById("statusPage");
    section.classList.remove("hidden");
    section.scrollIntoView({ behavior: "smooth" });

    // 🔹 Fill patient details
    document.getElementById("pName").innerText = patient.name || "-";
    document.getElementById("pDate").innerText = patient.appointment_date || "-";
    document.getElementById("pDoctor").innerText = patient.doctor || "-";
    document.getElementById("pDept").innerText = patient.department || "-";
   
    document.getElementById("pContact").innerText = patient.phone || "-";
    document.getElementById("pEmail").innerText = patient.email || "-";
    document.getElementById("pNotes").innerText = patient.symptoms || "-";

    // 🔹 Status badge
    const statusEl = document.getElementById("pStatus");
    const status = patient.status;

    const colors = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-600",
      completed: "bg-green-600",
      cancelled: "bg-red-600"
    };

    statusEl.innerText = status.toUpperCase();
    statusEl.className =
      `inline-block px-8 py-3 rounded-full text-white text-xl font-bold ${colors[status]}`;

    // 🔹 Show cancel button only if allowed
    renderCancelButton(patient);

  } catch (err) {
    console.error(err);
    alert("Server error. Please try again.");
  }
};

/*********************************
 CANCEL APPOINTMENT BUTTON
*********************************/
function renderCancelButton(patient) {

  let btn = document.getElementById("cancelBtn");

  // Create button if not exists
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "cancelBtn";
    btn.className =
      "mt-6 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700";
    btn.innerText = "Cancel Appointment";

    document.getElementById("statusPage")
      .querySelector(".bg-white")
      .appendChild(btn);
  }

  // Disable if already cancelled/completed
  if (patient.status === "cancelled" || patient.status === "completed") {
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");
    btn.innerText = "Cannot Cancel";
    return;
  }

  btn.disabled = false;
  btn.innerText = "Cancel Appointment";

  btn.onclick = async function () {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    await fetch(`${API_URL}/${patient.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" })
    });

    alert("Appointment cancelled successfully");

    // Refresh status
    patient.status = "cancelled";
    renderCancelButton(patient);

    const statusEl = document.getElementById("pStatus");
    statusEl.innerText = "CANCELLED";
    statusEl.className =
      "inline-block px-8 py-3 rounded-full bg-red-600 text-white text-xl font-bold";
  };
}


