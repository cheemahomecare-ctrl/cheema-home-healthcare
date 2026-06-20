import React, { useState, useEffect, useCallback } from "react";
import { listenToCollection, addToCollection, updateInCollection, deleteFromCollection } from "./firebase.js";

/* ---------- design tokens ----------
Color: bg #FAF7F0, ink #1F2A24, teal #14463D, sage #6E8F73, clay #C5704B, line #E2D9C8, sky #EAF1ED
Type: display 'Fraunces', body/util 'Inter'
---------------------------------------- */

const ADMIN_CODE = "cheema786";
const PLACEHOLDER_PHONE_DISPLAY = "+91 78883 77966";
const PLACEHOLDER_PHONE_WA = "917888377966"; // country code + number, no + or leading 0

const NURSING_SERVICES = [
  { id: "wound", label: "Wound Dressing / Dressing Change", icon: "🩹" },
  { id: "injection", label: "Injection Administration", icon: "💉" },
  { id: "ivcannula", label: "IV Cannula Insertion", icon: "🩸" },
  { id: "ivmeds", label: "IV Medication Administration", icon: "💊" },
  { id: "rt", label: "Ryle's Tube (RT) Insertion & Care", icon: "🧪" },
  { id: "catheter", label: "Urinary Catheterization (Male/Female)", icon: "🏥" },
  { id: "cathcare", label: "Catheter Care", icon: "🏥" },
  { id: "tracheo", label: "Tracheostomy Care", icon: "🫁" },
  { id: "bedsore", label: "Bed Sore Care", icon: "🩹" },
  { id: "postop", label: "Post Operative Care", icon: "🏨" },
  { id: "elderly", label: "Elderly Patient Care", icon: "🧓" },
  { id: "vitals", label: "Vital Signs Monitoring (BP, Pulse, Temp, SpO2)", icon: "📟" },
  { id: "nebulization", label: "Nebulization", icon: "😮‍💨" },
  { id: "diabetic", label: "Diabetic Care", icon: "🩸" },
  { id: "hygiene", label: "Patient Hygiene & Bed Bath", icon: "🛁" },
  { id: "assessment", label: "Nursing Assessment & General Care", icon: "📋" },
];

const STATUS_FLOW = ["New", "Confirmed", "Completed", "Cancelled"];
const STATUS_COLOR = {
}
  New: "#C5704B",
  Confirmed: "#6E8F73",
  Completed: "#14463D",
  Cancelled: "#9A8F7E",
};
function formatPhoneForWa(phone) {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "91" + digits.slice(1);
  else if (digits.length === 10) digits = "91" + digits;
  return digits;
}
/* ---------------- Firestore-backed collection hook ---------------- */

function useCollection(name) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToCollection(
      name,
      (data) => {
        setItems(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Could not load data right now. Check your Firebase setup.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [name]);

  const add = useCallback(
    async (data) => {
      const id = await addToCollection(name, data);
      return { id, ...data };
    },
    [name]
  );

  const update = useCallback(
    async (id, patch) => {
      await updateInCollection(name, id, patch);
    },
    [name]
  );

  const remove = useCallback(
    async (id) => {
      await deleteFromCollection(name, id);
    },
    [name]
  );

  return { items, loading, error, add, update, remove };
}

/* ---------------- shared UI bits ---------------- */

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  fontSize: 15.5,
  fontFamily: "'Inter', sans-serif",
  color: "#1F2A24",
  background: "#FFFFFF",
  border: "1.5px solid #E2D9C8",
  borderRadius: 7,
  outline: "none",
};

const ghostBtn = {
  background: "transparent",
  border: "1.5px solid #14463D",
  color: "#14463D",
  padding: "8px 14px",
  borderRadius: 7,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
};

const solidBtn = {
  background: "#14463D",
  color: "#FAF7F0",
  border: "none",
  padding: "13px 22px",
  borderRadius: 8,
  fontSize: 15.5,
  fontWeight: 700,
  cursor: "pointer",
};

const clayBtn = { ...solidBtn, background: "#C5704B" };

function Field({ label, children, required }) {
  return (
    <label style={{ display: "block", marginBottom: 18 }}>
      <span
        style={{
          display: "block",
          fontSize: 12.5,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#6E8F73",
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label} {required && <span style={{ color: "#C5704B" }}>*</span>}
      </span>
      {children}
    </label>
  );
}

function WhatsAppButton({ phone = PLACEHOLDER_PHONE_WA, text = "", style, children }) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "#25D366",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 8,
        fontSize: 15,
        fontWeight: 700,
        textDecoration: "none",
        ...style,
      }}
    >
      <span style={{ fontSize: 17 }}>📱</span> {children || "WhatsApp Us"}
    </a>
  );
}

function CallButton({ phone = PLACEHOLDER_PHONE_DISPLAY, style, children }) {
  const tel = phone.replace(/[^\d+]/g, "");
  return (
    <a
      href={`tel:${tel}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "transparent",
        border: "1.5px solid #14463D",
        color: "#14463D",
        padding: "12px 20px",
        borderRadius: 8,
        fontSize: 15,
        fontWeight: 700,
        textDecoration: "none",
        ...style,
      }}
    >
      <span style={{ fontSize: 17 }}>📞</span> {children || "Call Now"}
    </a>
  );
}

function Header({ page, setPage }) {
  const links = [
    ["home", "Home"],
    ["about", "About"],
    ["services", "Nursing Services"],
    ["book", "Book a Nurse"],
    ["contact", "Contact Us"],
  ];
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1.5px solid #E2D9C8",
        position: "sticky",
        top: 0,
        background: "#FAF7F0",
        zIndex: 20,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "#14463D",
            color: "#FAF7F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          C
        </div>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#14463D", lineHeight: 1.1 }}>
            Cheema Home Healthcare
          </div>
          <div style={{ fontSize: 11, color: "#8A8275", letterSpacing: "0.03em" }}>Professional Nurse Visits at Home</div>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {links.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              ...ghostBtn,
              border: "none",
              background: page === id ? "#EAF1ED" : "transparent",
              color: "#14463D",
              fontSize: 13.5,
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setPage("admin")}
          style={{
            ...ghostBtn,
            background: page === "admin" ? "#14463D" : "transparent",
            color: page === "admin" ? "#fff" : "#14463D",
            fontSize: 13.5,
          }}
        >
          Staff
        </button>
      </nav>
    </header>
  );
}

function Footer({ setPage }) {
  return (
    <footer style={{ borderTop: "1.5px solid #E2D9C8", padding: "30px 24px", marginTop: 30 }}>
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: "#14463D", marginBottom: 6 }}>
            Cheema Home Healthcare
          </div>
          <div style={{ fontSize: 13, color: "#8A8275", maxWidth: 280, lineHeight: 1.6 }}>
            Trained, professional nurses providing skilled nursing care in the comfort of your home.
          </div>
        </div>
        <div style={{ fontSize: 13.5, color: "#4B5A50", display: "flex", flexDirection: "column", gap: 6 }}>
          <span>📞 {PLACEHOLDER_PHONE_DISPLAY}</span>
          <span>🕑 Available all 7 days</span>
          <button onClick={() => setPage("contact")} style={{ ...ghostBtn, padding: "5px 10px", width: "fit-content" }}>
            Contact Us
          </button>
        </div>
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: "#B8AF9F", marginTop: 24 }}>
        © {new Date().getFullYear()} Cheema Home Healthcare. All rights reserved.
      </div>
    </footer>
  );
}

/* ---------------- pages ---------------- */

function HomePage({ setPage }) {
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px 40px" }}>
      <section style={{ marginBottom: 70, display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 420px" }}>
          <p
            style={{
              color: "#C5704B",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Professional Home Nursing
          </p>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(32px, 5vw, 50px)",
              lineHeight: 1.1,
              color: "#14463D",
              margin: "0 0 18px",
            }}
          >
            Skilled nursing care, delivered to your home.
          </h1>
          <p style={{ fontSize: 16.5, color: "#4B5A50", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 480 }}>
            Cheema Home Healthcare sends trained, qualified nurses to your doorstep for
            wound care, injections, catheter care, post-operative recovery and more —
            so your family member is cared for without leaving home.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setPage("book")} style={clayBtn}>
              Book a Nurse →
            </button>
            <WhatsAppButton text="Hello, I would like to book a home nurse visit." />
            <CallButton />
          </div>
        </div>
        <div
          style={{
            flex: "1 1 280px",
            background: "#14463D",
            borderRadius: 18,
            padding: "30px",
            color: "#FAF7F0",
          }}
        >
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, marginBottom: 16 }}>Why families choose us</div>
          {[
            ["✓", "Trained & verified nurses"],
            ["✓", "Same-day visits available"],
            ["✓", "16 nursing procedures covered"],
            ["✓", "Transparent booking, no surprises"],
          ].map(([icon, t]) => (
            <div key={t} style={{ display: "flex", gap: 10, fontSize: 14.5, marginBottom: 12, color: "#C9D6CC" }}>
              <span style={{ color: "#C5704B", fontWeight: 700 }}>{icon}</span> {t}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 70 }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", color: "#14463D", fontSize: 24, marginBottom: 20 }}>
          Most requested services
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {NURSING_SERVICES.slice(0, 6).map((s) => (
            <div
              key={s.id}
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E2D9C8",
                borderRadius: 12,
                padding: "18px",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#1F2A24", lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setPage("services")} style={{ ...ghostBtn, marginTop: 18 }}>
          View all 16 services →
        </button>
      </section>

      <section style={{ marginBottom: 60 }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", color: "#14463D", fontSize: 24, marginBottom: 24 }}>
          How booking works
        </h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            ["1", "Book online", "Choose a service, date and time on our booking page."],
            ["2", "We confirm", "Our team calls or WhatsApps you to confirm the nurse's arrival."],
            ["3", "Nurse visits", "A trained nurse arrives at your home to provide care."],
            ["4", "Visit closed", "Your booking is marked completed in our records."],
          ].map(([n, title, desc], i, arr) => (
            <div key={n} style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "2px solid #14463D",
                    color: "#14463D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {n}
                </div>
                {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: "#E2D9C8", minHeight: 24 }} />}
              </div>
              <div style={{ paddingBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5, color: "#1F2A24" }}>{title}</div>
                <div style={{ fontSize: 14, color: "#8A8275" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "#EAF1ED", borderRadius: 16, padding: "32px", textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Fraunces', serif", color: "#14463D", fontSize: 22, margin: "0 0 8px" }}>
          Need a nurse at home today?
        </h3>
        <p style={{ color: "#4B5A50", fontSize: 14.5, margin: "0 0 20px" }}>
          Book online in under a minute, or reach us directly.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setPage("book")} style={clayBtn}>
            Book a Nurse
          </button>
          <WhatsAppButton text="Hello, I would like to book a home nurse visit." />
        </div>
      </section>
    </main>
  );
}

function AboutPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px 40px" }}>
      <p style={{ color: "#C5704B", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        About us
      </p>
      <h1 style={{ fontFamily: "'Fraunces', serif", color: "#14463D", fontSize: 36, margin: "10px 0 22px" }}>
        About Cheema Home Healthcare
      </h1>
      <p style={{ fontSize: 16, color: "#4B5A50", lineHeight: 1.75, marginBottom: 18 }}>
        Cheema Home Healthcare was founded to bring reliable, professional nursing
        care directly into patients' homes. We understand that hospital visits can be
        difficult, time-consuming, and exhausting for patients and their families —
        especially for the elderly, post-operative patients, and those needing
        ongoing care.
      </p>
      <p style={{ fontSize: 16, color: "#4B5A50", lineHeight: 1.75, marginBottom: 18 }}>
        Our team of trained nurses provides skilled procedures — from wound dressing
        and IV administration to catheter care and post-operative monitoring —
        following proper clinical protocol, in the comfort and privacy of your home.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16, margin: "30px 0" }}>
        {[
          ["Trained nurses", "Every nurse is verified and experienced in home care procedures."],
          ["Punctual visits", "We respect your time and confirm every appointment in advance."],
          ["Patient dignity", "Care delivered with respect, privacy and compassion."],
        ].map(([t, d]) => (
          <div key={t} style={{ background: "#FFFFFF", border: "1.5px solid #E2D9C8", borderRadius: 12, padding: 18 }}>
            <div style={{ fontWeight: 700, color: "#14463D", marginBottom: 6 }}>{t}</div>
            <div style={{ fontSize: 13.5, color: "#8A8275", lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 16, color: "#4B5A50", lineHeight: 1.75 }}>
        Our mission is simple: make professional nursing care as easy to access as a
        phone call, without compromising on safety or quality.
      </p>
    </main>
  );
}

function ServicesPage({ setPage }) {
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px 40px" }}>
      <p style={{ color: "#C5704B", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        What we offer
      </p>
      <h1 style={{ fontFamily: "'Fraunces', serif", color: "#14463D", fontSize: 36, margin: "10px 0 30px" }}>
        Nursing Services
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {NURSING_SERVICES.map((s) => (
          <div
            key={s.id}
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E2D9C8",
              borderRadius: 12,
              padding: "20px",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1F2A24", lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button onClick={() => setPage("book")} style={clayBtn}>
          Book any of these services →
        </button>
      </div>
    </main>
  );
}

function BookPage({ addBooking }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    service: NURSING_SERVICES[0].id,
    date: "",
    time: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.date || !form.time) {
      setErr("Please fill in name, phone, address, date and time.");
      return;
    }
    setErr(null);
    setSubmitting(true);
    try {
      const rec = await addBooking({ ...form, status: "New" });
      setSubmitted(rec);
    } catch (e) {
      setErr("Something went wrong saving your request. Please check your internet connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const serviceLabel = NURSING_SERVICES.find((s) => s.id === submitted.service)?.label;
    const refId = (submitted.id || "").slice(-6).toUpperCase();
    const waText = `Hello, I just booked a nurse visit.\nRef: #${refId}\nService: ${serviceLabel}\nDate: ${submitted.date} at ${submitted.time}\nName: ${submitted.name}`;
    return (
      <main style={{ maxWidth: 540, margin: "0 auto", padding: "60px 24px 90px" }}>
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E2D9C8",
            borderRadius: 14,
            padding: "36px 30px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>✓</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: "#14463D", margin: "0 0 10px" }}>
            Booking received
          </h2>
          <p style={{ color: "#4B5A50", fontSize: 15.5, lineHeight: 1.7, margin: "0 0 6px" }}>
            Reference number
          </p>
          <p style={{ fontFamily: "monospace", color: "#C5704B", fontWeight: 700, fontSize: 18, margin: "0 0 18px" }}>
            #{refId}
          </p>
          <p style={{ color: "#4B5A50", fontSize: 14.5, lineHeight: 1.65, margin: "0 0 24px" }}>
            {serviceLabel} on {submitted.date} at {submitted.time}.
            <br />Our team will confirm shortly by phone or WhatsApp.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <WhatsAppButton text={waText}>Confirm via WhatsApp</WhatsAppButton>
            <button
              onClick={() => {
                setForm({ name: "", phone: "", address: "", service: NURSING_SERVICES[0].id, date: "", time: "", notes: "" });
                setSubmitted(null);
              }}
              style={ghostBtn}
            >
              Book another visit
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px 90px" }}>
      <p style={{ color: "#C5704B", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Book a nurse
      </p>
      <h1 style={{ fontFamily: "'Fraunces', serif", color: "#14463D", fontSize: 32, margin: "8px 0 6px" }}>
        Schedule a home visit
      </h1>
      <p style={{ color: "#8A8275", fontSize: 14.5, marginBottom: 28 }}>
        Fill in the patient's details below — our team will call to confirm.
      </p>

      <form onSubmit={onSubmit} style={{ background: "#FFFFFF", border: "1.5px solid #E2D9C8", borderRadius: 14, padding: 30 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
          <Field label="Patient name" required>
            <input style={inputStyle} value={form.name} onChange={set("name")} placeholder="Full name" />
          </Field>
          <Field label="Phone number" required>
            <input style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="03xx-xxxxxxx" />
          </Field>
        </div>

        <Field label="Home address" required>
          <input style={inputStyle} value={form.address} onChange={set("address")} placeholder="House #, street, area, city" />
        </Field>

        <Field label="Select nursing service" required>
          <select style={{ ...inputStyle, cursor: "pointer" }} value={form.service} onChange={set("service")}>
            {NURSING_SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
          <Field label="Preferred date" required>
            <input type="date" style={inputStyle} value={form.date} onChange={set("date")} />
          </Field>
          <Field label="Preferred time" required>
            <input type="time" style={inputStyle} value={form.time} onChange={set("time")} />
          </Field>
        </div>

        <Field label="Patient condition / notes">
          <textarea
            style={{ ...inputStyle, minHeight: 70, resize: "vertical", fontFamily: "'Inter', sans-serif" }}
            value={form.notes}
            onChange={set("notes")}
            placeholder="Briefly describe condition, mobility, or anything our nurse should know"
          />
        </Field>

        {err && <p style={{ color: "#C5704B", fontSize: 14, marginTop: -6, marginBottom: 14 }}>{err}</p>}

        <button type="submit" disabled={submitting} style={{ ...solidBtn, width: "100%", opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Sending..." : "Confirm Booking"}
        </button>
        <p style={{ fontSize: 12.5, color: "#8A8275", textAlign: "center", marginTop: 10, marginBottom: 0 }}>
          No payment required now — our team confirms by phone first.
        </p>
      </form>
    </main>
  );
}

function ContactPage() {
  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px 90px", textAlign: "center" }}>
      <p style={{ color: "#C5704B", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Get in touch
      </p>
      <h1 style={{ fontFamily: "'Fraunces', serif", color: "#14463D", fontSize: 34, margin: "8px 0 16px" }}>
        Contact Us
      </h1>
      <p style={{ color: "#4B5A50", fontSize: 15.5, lineHeight: 1.7, marginBottom: 32 }}>
        For urgent nursing needs, call or WhatsApp us directly — our team is available
        every day to confirm your home visit.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
        <CallButton />
        <WhatsAppButton text="Hello, I would like to know more about your nursing services." />
      </div>
      <div style={{ background: "#FFFFFF", border: "1.5px solid #E2D9C8", borderRadius: 14, padding: 26, textAlign: "left" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, color: "#6E8F73", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Phone / WhatsApp
          </div>
          <div style={{ fontSize: 16, color: "#1F2A24" }}>{PLACEHOLDER_PHONE_DISPLAY}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, color: "#6E8F73", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Availability
          </div>
          <div style={{ fontSize: 16, color: "#1F2A24" }}>7 days a week</div>
        </div>
        <div>
          <div style={{ fontSize: 12.5, color: "#6E8F73", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Service area
          </div>
          <div style={{ fontSize: 16, color: "#1F2A24" }}>Home visits across the city</div>
        </div>
      </div>
    </main>
  );
}

/* ---------------- admin ---------------- */

function AdminGate({ onSuccess }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  return (
    <main style={{ maxWidth: 360, margin: "60px auto", padding: "0 24px" }}>
      <div style={{ background: "#FFFFFF", border: "1.5px solid #E2D9C8", borderRadius: 14, padding: "32px 28px", textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Fraunces', serif", color: "#14463D", margin: "0 0 6px" }}>Staff access</h3>
        <p style={{ fontSize: 13.5, color: "#8A8275", margin: "0 0 18px" }}>Enter the staff passcode to manage bookings.</p>
        <input
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setErr(false);
          }}
          style={{ ...inputStyle, textAlign: "center", marginBottom: 12 }}
          placeholder="Passcode"
        />
        {err && <p style={{ color: "#C5704B", fontSize: 13, marginBottom: 10 }}>Incorrect passcode.</p>}
        <button onClick={() => (code === ADMIN_CODE ? onSuccess() : setErr(true))} style={{ ...solidBtn, width: "100%" }}>
          Enter
        </button>
      </div>
    </main>
  );
}

function NurseManager({ nurses, addNurse, removeNurse }) {
  const [form, setForm] = useState({ name: "", phone: "", specialty: "" });
  const [open, setOpen] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addNurse(form);
    setForm({ name: "", phone: "", specialty: "" });
    setOpen(false);
  };

  return (
    <div style={{ background: "#FFFFFF", border: "1.5px solid #E2D9C8", borderRadius: 12, padding: 18, marginBottom: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: open ? 14 : 0 }}>
        <div style={{ fontWeight: 700, color: "#14463D" }}>Nurses ({nurses.length})</div>
        <button onClick={() => setOpen((o) => !o)} style={ghostBtn}>
          {open ? "Close" : "+ Add nurse"}
        </button>
      </div>
      {open && (
        <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <input style={{ ...inputStyle, flex: "1 1 160px" }} placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input style={{ ...inputStyle, flex: "1 1 140px" }} placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <input style={{ ...inputStyle, flex: "1 1 160px" }} placeholder="Specialty (e.g. Wound care)" value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} />
          <button type="submit" style={{ ...solidBtn, padding: "10px 18px" }}>
            Add
          </button>
        </form>
      )}
      {nurses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {nurses.map((n) => (
            <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, padding: "8px 10px", background: "#FAF7F0", borderRadius: 8 }}>
              <span>
                <strong>{n.name}</strong>{n.specialty ? ` — ${n.specialty}` : ""}{n.phone ? ` · ${n.phone}` : ""}
              </span>
              <button onClick={() => removeNurse(n.id)} style={{ ...ghostBtn, padding: "4px 10px", fontSize: 12 }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ bookings, loading, error, updateBooking, nurses, addNurse, removeNurse, onExit }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? bookings : bookings.filter((b) => b.status === filter);
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const confirmText = (b) =>
    `Hello ${b.name}, this is Cheema Home Healthcare confirming your nurse visit.\nRef: #${(b.id || "").slice(-6).toUpperCase()}\nService: ${NURSING_SERVICES.find((s) => s.id === b.service)?.label}\nDate: ${b.date} at ${b.time}\nOur nurse will arrive on time. Thank you!`;

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "50px 24px 90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", color: "#14463D", fontSize: 28, margin: 0 }}>
          Admin Dashboard
        </h1>
        <button onClick={onExit} style={ghostBtn}>Log out</button>
      </div>

      <NurseManager nurses={nurses} addNurse={addNurse} removeNurse={removeNurse} />

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["All", ...STATUS_FLOW].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              ...ghostBtn,
              background: filter === s ? "#14463D" : "transparent",
              color: filter === s ? "#fff" : "#14463D",
              fontSize: 13,
            }}
          >
            {s} ({s === "All" ? bookings.length : counts[s] || 0})
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "#8A8275" }}>Loading bookings…</p>}
      {error && <p style={{ color: "#C5704B" }}>{error}</p>}
      {!loading && filtered.length === 0 && <p style={{ color: "#8A8275" }}>No bookings in this view yet.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((b) => (
          <div key={b.id} style={{ background: "#FFFFFF", border: "1.5px solid #E2D9C8", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1F2A24" }}>{b.name}</div>
                <div style={{ fontSize: 13.5, color: "#6E8F73" }}>
                  {NURSING_SERVICES.find((s) => s.id === b.service)?.label || b.service} · {b.date} {b.time}
                </div>
              </div>
              <span style={{ alignSelf: "flex-start", fontSize: 12, fontWeight: 700, color: "#fff", background: STATUS_COLOR[b.status] || "#9A8F7E", padding: "4px 10px", borderRadius: 20 }}>
                {b.status}
              </span>
            </div>
            <div style={{ fontSize: 14, color: "#4B5A50", marginTop: 8, lineHeight: 1.5 }}>
              📞 {b.phone} &nbsp;·&nbsp; 📍 {b.address}
            </div>
            {b.notes && <div style={{ fontSize: 13.5, color: "#8A8275", marginTop: 4, fontStyle: "italic" }}>"{b.notes}"</div>}
            <div style={{ fontSize: 11.5, color: "#B8AF9F", marginTop: 6, fontFamily: "monospace" }}>
              #{(b.id || "").slice(-6).toUpperCase()} · {b.createdAtMs ? new Date(b.createdAtMs).toLocaleString() : ""}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  onClick={() => updateBooking(b.id, { status: s })}
                  disabled={b.status === s}
                  style={{
                    fontSize: 12.5,
                    padding: "6px 11px",
                    borderRadius: 6,
                    border: `1.5px solid ${b.status === s ? STATUS_COLOR[s] : "#E2D9C8"}`,
                    background: b.status === s ? STATUS_COLOR[s] : "transparent",
                    color: b.status === s ? "#fff" : "#4B5A50",
                    cursor: b.status === s ? "default" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {s}
                </button>
              ))}
              <WhatsAppButton phone={FormatPhoneForWa(b.phone)} text={confirmText(b)} style={{ padding: "6px 12px", fontSize: 12.5 }}>
                Send WhatsApp confirmation
              </WhatsAppButton>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

/* ---------------- root ---------------- */

export default function CheemaNursingApp() {
  const [page, setPage] = useState("home");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const bookingsC = useCollection("bookings");
  const nursesC = useCollection("nurses");

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#FAF7F0", minHeight: "100vh", color: "#1F2A24" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color:#14463D !important; box-shadow:0 0 0 3px rgba(20,70,61,0.12); }
        button:focus-visible, a:focus-visible { outline: 2px solid #C5704B; outline-offset: 2px; }
        @media (max-width:560px){
          .ch-grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Header page={page} setPage={setPage} />

      {page === "home" && <HomePage setPage={setPage} />}
      {page === "about" && <AboutPage />}
      {page === "services" && <ServicesPage setPage={setPage} />}
      {page === "book" && <BookPage addBooking={bookingsC.add} />}
      {page === "contact" && <ContactPage />}
      {page === "admin" &&
        (adminAuthed ? (
          <AdminDashboard
            bookings={bookingsC.items}
            loading={bookingsC.loading}
            error={bookingsC.error}
            updateBooking={bookingsC.update}
            nurses={nursesC.items}
            addNurse={nursesC.add}
            removeNurse={nursesC.remove}
            onExit={() => setAdminAuthed(false)}
          />
        ) : (
          <AdminGate onSuccess={() => setAdminAuthed(true)} />
        ))}

      {page !== "admin" && <Footer setPage={setPage} />}
    </div>
  );
}
