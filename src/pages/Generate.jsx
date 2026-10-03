import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { clearGeneratedData, saveBatch } from "../utils/dataStorage";

const API_URL = "http://localhost:5000/api/generator/generate";
const STREAM_BATCH_SIZE = 1000;
const EASE = [0.22, 1, 0.36, 1];

// ======================================================
// Fonts + CSS animations (same system as Login / Signup)
// ======================================================

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500&display=swap');

.font-display {
  font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.font-code {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}

@keyframes mgDrift {
  0% { transform: translate3d(0, 30px, 0); opacity: 0; }
  20% { opacity: 0.9; }
  80% { opacity: 0.5; }
  100% { transform: translate3d(14px, -170px, 0); opacity: 0; }
}
@keyframes mgStreamUp {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}
@keyframes mgStreamDown {
  from { transform: translateY(-50%); }
  to { transform: translateY(0); }
}
@keyframes mgShimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.mg-drift {
  opacity: 0;
  animation: mgDrift var(--dur, 10s) ease-in-out var(--delay, 0s) infinite;
}
.mg-stream-up { animation: mgStreamUp 50s linear infinite; }
.mg-stream-down { animation: mgStreamDown 56s linear infinite; }
.mg-shimmer { animation: mgShimmer 1.8s ease-in-out infinite; }

/* Cursor spotlight inside cards */
.mg-spot {
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    360px circle at var(--x, 50%) var(--y, 0%),
    rgba(252, 211, 77, 0.07),
    transparent 60%
  );
}
.mg-card:hover .mg-spot { opacity: 1; }

/* Number input without browser spinners */
.mg-num { -moz-appearance: textfield; appearance: textfield; }
.mg-num::-webkit-outer-spin-button,
.mg-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

/* Dark native select with custom chevron */
.mg-select {
  color-scheme: dark;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}
.mg-select option { background: #0b0e15; color: #fff; }
`;

// ======================================================
// Real-World Schema Templates
// ======================================================

const TEMPLATE_SCHEMAS = {
  School: {
    studentId: { type: "string", minLength: 6, maxLength: 12, pattern: "^STU[0-9]+$" },
    firstName: { type: "string", minLength: 2, maxLength: 30 },
    lastName: { type: "string", minLength: 2, maxLength: 30 },
    dateOfBirth: { type: "date" },
    gender: { type: "string", enum: ["Male", "Female", "Other"] },
    email: { type: "string", maxLength: 100 },
    phone: { type: "string", pattern: "^[6-9][0-9]{9}$" },
    class: { type: "string", enum: ["6", "7", "8", "9", "10", "11", "12"] },
    section: { type: "string", enum: ["A", "B", "C", "D"] },
    rollNumber: { type: "number", min: 1, max: 60 },
    admissionDate: { type: "date" },
    parent: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 2, maxLength: 60 },
        phone: { type: "string", pattern: "^[6-9][0-9]{9}$" },
        email: { type: "string", maxLength: 100 },
      },
    },
    address: {
      type: "object",
      properties: {
        street: { type: "string", minLength: 5, maxLength: 100 },
        city: { type: "city" },
        state: { type: "string", minLength: 2, maxLength: 40 },
        postalCode: { type: "string", pattern: "^[0-9]{6}$" },
        country: { type: "country" },
      },
    },
    attendancePercentage: { type: "number", min: 0, max: 100 },
    status: {
      type: "string",
      enum: ["Active", "Inactive", "Graduated", "Transferred"],
    },
  },

  College: {
    studentId: { type: "string", minLength: 6, maxLength: 15, pattern: "^COL[0-9]+$" },
    enrollmentNumber: { type: "string", minLength: 8, maxLength: 20 },
    firstName: { type: "string", minLength: 2, maxLength: 30 },
    lastName: { type: "string", minLength: 2, maxLength: 30 },
    email: { type: "string", maxLength: 100 },
    phone: { type: "string", pattern: "^[6-9][0-9]{9}$" },
    dateOfBirth: { type: "date" },
    gender: { type: "string", enum: ["Male", "Female", "Other"] },
    department: {
      type: "string",
      enum: [
        "Computer Science",
        "Information Technology",
        "Commerce",
        "Management",
        "Physics",
        "Chemistry",
      ],
    },
    program: {
      type: "string",
      enum: ["BSc", "BCA", "BBA", "MCA", "MBA", "MSc"],
    },
    semester: { type: "number", min: 1, max: 10 },
    year: { type: "number", min: 1, max: 5 },
    cgpa: { type: "number", min: 0, max: 10 },
    admissionYear: { type: "number", min: 2000, max: 2035 },
    graduationYear: { type: "number", min: 2000, max: 2040 },
    address: {
      type: "object",
      properties: {
        city: { type: "city" },
        state: { type: "string", minLength: 2, maxLength: 40 },
        country: { type: "country" },
      },
    },
    status: {
      type: "string",
      enum: ["Active", "Graduated", "Suspended", "Dropped"],
    },
  },

  Banking: {
    customerId: { type: "string", minLength: 8, maxLength: 15, pattern: "^CUS[0-9]+$" },
    accountNumber: { type: "string", minLength: 10, maxLength: 16, pattern: "^[0-9]+$" },
    firstName: { type: "string", minLength: 2, maxLength: 30 },
    lastName: { type: "string", minLength: 2, maxLength: 30 },
    dateOfBirth: { type: "date" },
    gender: { type: "string", enum: ["Male", "Female", "Other"] },
    email: { type: "string", maxLength: 100 },
    phone: { type: "string", pattern: "^[6-9][0-9]{9}$" },
    accountType: {
      type: "string",
      enum: ["Savings", "Current", "Salary", "Fixed Deposit"],
    },
    balance: { type: "number", min: 0, max: 10000000 },
    currency: { type: "string", enum: ["INR", "USD", "EUR", "GBP"] },
    branch: {
      type: "object",
      properties: {
        branchCode: { type: "string", minLength: 4, maxLength: 12 },
        branchName: { type: "string", minLength: 3, maxLength: 60 },
        city: { type: "city" },
      },
    },
    address: {
      type: "object",
      properties: {
        street: { type: "string", minLength: 5, maxLength: 100 },
        city: { type: "city" },
        state: { type: "string", minLength: 2, maxLength: 40 },
        postalCode: { type: "string", pattern: "^[0-9]{6}$" },
      },
    },
    accountStatus: {
      type: "string",
      enum: ["Active", "Dormant", "Blocked", "Closed"],
    },
    openedAt: { type: "date" },
  },

  Hospital: {
    patientId: { type: "string", minLength: 7, maxLength: 15, pattern: "^PAT[0-9]+$" },
    firstName: { type: "string", minLength: 2, maxLength: 30 },
    lastName: { type: "string", minLength: 2, maxLength: 30 },
    dateOfBirth: { type: "date" },
    gender: { type: "string", enum: ["Male", "Female", "Other"] },
    bloodGroup: {
      type: "string",
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    email: { type: "string", maxLength: 100 },
    phone: { type: "string", pattern: "^[6-9][0-9]{9}$" },
    emergencyContact: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 2, maxLength: 60 },
        relationship: {
          type: "string",
          enum: ["Parent", "Spouse", "Sibling", "Friend", "Relative"],
        },
        phone: { type: "string", pattern: "^[6-9][0-9]{9}$" },
      },
    },
    address: {
      type: "object",
      properties: {
        city: { type: "city" },
        state: { type: "string", minLength: 2, maxLength: 40 },
        country: { type: "country" },
      },
    },
    medical: {
      type: "object",
      properties: {
        department: {
          type: "string",
          enum: [
            "Cardiology",
            "Neurology",
            "Orthopedics",
            "Pediatrics",
            "Dermatology",
            "General Medicine",
          ],
        },
        doctorName: { type: "name" },
        diagnosis: { type: "string", minLength: 5, maxLength: 150 },
        admissionDate: { type: "date" },
      },
    },
    insurance: {
      type: "object",
      properties: {
        provider: { type: "company", minLength: 3, maxLength: 80 },
        policyNumber: { type: "string", minLength: 8, maxLength: 20 },
      },
    },
    status: {
      type: "string",
      enum: ["Admitted", "Discharged", "Under Treatment", "Recovered"],
    },
  },

  "E-commerce": {
    orderId: { type: "string", minLength: 8, maxLength: 15, pattern: "^ORD[0-9]+$" },
    customer: {
      type: "object",
      properties: {
        customerId: { type: "string", minLength: 6, maxLength: 15, pattern: "^CUS[0-9]+$" },
        name: { type: "name" },
        email: { type: "email", maxLength: 100 },
        phone: { type: "string", pattern: "^[6-9][0-9]{9}$" },
      },
    },
    items: {
      type: "array",
      minItems: 1,
      maxItems: 10,
      items: {
        type: "object",
        properties: {
          productId: { type: "string", minLength: 6, maxLength: 15, pattern: "^PROD[0-9]+$" },
          productName: { type: "string", minLength: 3, maxLength: 100 },
          category: {
            type: "string",
            enum: ["Electronics", "Clothing", "Books", "Home", "Beauty", "Sports"],
          },
          quantity: { type: "number", min: 1, max: 20 },
          unitPrice: { type: "number", min: 50, max: 100000 },
        },
      },
    },
    shippingAddress: {
      type: "object",
      properties: {
        street: { type: "string", minLength: 5, maxLength: 100 },
        city: { type: "city" },
        state: { type: "string", minLength: 2, maxLength: 40 },
        postalCode: { type: "string", pattern: "^[0-9]{6}$" },
        country: { type: "country" },
      },
    },
    payment: {
      type: "object",
      properties: {
        method: {
          type: "string",
          enum: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash on Delivery"],
        },
        transactionId: { type: "string", minLength: 8, maxLength: 30 },
        amount: { type: "number", min: 50, max: 500000 },
        status: { type: "string", enum: ["Pending", "Paid", "Failed", "Refunded"] },
      },
    },
    orderStatus: {
      type: "string",
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
    },
    orderedAt: { type: "date" },
  },

  Employee: {
    employeeId: { type: "string", minLength: 6, maxLength: 12, pattern: "^EMP[0-9]+$" },
    firstName: { type: "string", minLength: 2, maxLength: 30 },
    lastName: { type: "string", minLength: 2, maxLength: 30 },
    email: { type: "email", maxLength: 100 },
    phone: { type: "string", pattern: "^[6-9][0-9]{9}$" },
    dateOfBirth: { type: "date" },
    gender: { type: "string", enum: ["Male", "Female", "Other"] },
    department: {
      type: "string",
      enum: ["Engineering", "Human Resources", "Finance", "Marketing", "Sales", "Operations"],
    },
    designation: {
      type: "string",
      enum: [
        "Software Engineer",
        "Senior Engineer",
        "Manager",
        "HR Executive",
        "Accountant",
        "Sales Executive",
      ],
    },
    employmentType: {
      type: "string",
      enum: ["Full-Time", "Part-Time", "Contract", "Intern"],
    },
    joiningDate: { type: "date" },
    salary: { type: "number", min: 15000, max: 500000 },
    manager: {
      type: "object",
      properties: {
        employeeId: { type: "string", minLength: 6, maxLength: 12 },
        name: { type: "name" },
      },
    },
    address: {
      type: "object",
      properties: {
        city: { type: "city" },
        state: { type: "string", minLength: 2, maxLength: 40 },
        country: { type: "country" },
      },
    },
    skills: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: { type: "string", minLength: 2, maxLength: 30 },
    },
    employmentStatus: {
      type: "string",
      enum: ["Active", "On Leave", "Resigned", "Terminated"],
    },
  },

  Customer: {
    customerId: { type: "string", minLength: 8, maxLength: 15, pattern: "^CUS[0-9]+$" },
    firstName: { type: "string", minLength: 2, maxLength: 30 },
    lastName: { type: "string", minLength: 2, maxLength: 30 },
    email: { type: "email", maxLength: 100 },
    phone: { type: "string", pattern: "^[6-9][0-9]{9}$" },
    dateOfBirth: { type: "date" },
    address: {
      type: "object",
      properties: {
        street: { type: "string", minLength: 5, maxLength: 100 },
        city: { type: "city" },
        state: { type: "string", minLength: 2, maxLength: 40 },
        postalCode: { type: "string", pattern: "^[0-9]{6}$" },
        country: { type: "country" },
      },
    },
    company: {
      type: "object",
      properties: {
        name: { type: "company", minLength: 3, maxLength: 80 },
        industry: {
          type: "string",
          enum: ["Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing"],
        },
        jobTitle: { type: "string", minLength: 2, maxLength: 60 },
      },
    },
    preferences: {
      type: "object",
      properties: {
        language: {
          type: "string",
          enum: ["English", "Hindi", "Gujarati", "Spanish", "French"],
        },
        communicationChannel: {
          type: "string",
          enum: ["Email", "Phone", "SMS", "WhatsApp"],
        },
      },
    },
    totalOrders: { type: "number", min: 0, max: 1000 },
    totalSpent: { type: "number", min: 0, max: 10000000 },
    customerSince: { type: "date" },
    status: {
      type: "string",
      enum: ["Active", "Inactive", "Prospect", "Blocked"],
    },
  },
};

// ======================================================
// Custom Default Schema
// ======================================================

const CUSTOM_SCHEMA = {
  name: "string",
  email: "string",
  age: "number",
  city: "string",
  country: "string",
};

const TEMPLATE_OPTIONS = ["Custom", ...Object.keys(TEMPLATE_SCHEMAS)];

const COUNTRY_OPTIONS = [
  { value: "Global", label: "Global Data" },
  { value: "India", label: "India" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Germany", label: "Germany" },
  { value: "Canada", label: "Canada" },
];

const RECORD_PRESETS = [
  { label: "1K", value: 1000 },
  { label: "10K", value: 10000 },
  { label: "100K", value: 100000 },
  { label: "1M", value: 1000000 },
];

// ======================================================
// Decorative data
// ======================================================

const STREAM_ROWS = [
  '{"id":1043,"age":29}',
  '{"city":"Surat"}',
  '{"sku":"MG-2041"}',
  '{"qty":2,"paid":true}',
  '{"id":1044,"role":"admin"}',
  '{"zip":395007}',
  '{"price":1899}',
  '{"id":1045,"active":true}',
  '{"order":"ORD-88214"}',
  '{"rating":4.6}',
  '{"id":1046,"age":34}',
  '{"stock":120}',
];

const PARTICLES = [
  { left: "6%", top: "78%", size: 5, rgb: "125,211,252", dur: "9s", delay: "0s" },
  { left: "14%", top: "52%", size: 4, rgb: "252,211,77", dur: "11s", delay: "2s" },
  { left: "27%", top: "86%", size: 5, rgb: "252,211,77", dur: "10s", delay: "4s" },
  { left: "41%", top: "70%", size: 4, rgb: "125,211,252", dur: "12s", delay: "1s" },
  { left: "58%", top: "90%", size: 5, rgb: "125,211,252", dur: "9s", delay: "5s" },
  { left: "69%", top: "62%", size: 4, rgb: "252,211,77", dur: "13s", delay: "3s" },
  { left: "82%", top: "80%", size: 5, rgb: "252,211,77", dur: "10s", delay: "6s" },
  { left: "93%", top: "58%", size: 4, rgb: "125,211,252", dur: "11s", delay: "1.5s" },
];

// ======================================================
// Motion variants (page load cascade)
// ======================================================

const pageV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemV = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

// ======================================================
// Helpers
// ======================================================

// Reads an NDJSON response and calls onItem(item) for every line.
// Errors thrown while parsing / handling a line are logged and skipped
// (same behaviour as the original implementation).
const readNdjson = async (response, onItem) => {
  if (!response.body) {
    throw new Error("Streaming response is not supported by this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const handleLine = async (line) => {
    if (!line.trim()) return;

    try {
      await onItem(JSON.parse(line));
    } catch (parseError) {
      console.error("Invalid NDJSON line:", line);
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      await handleLine(line);
    }
  }

  if (buffer.trim()) {
    await handleLine(buffer);
  }
};

// Custom Monaco theme that matches the page palette
const defineMockGenTheme = (monaco) => {
  monaco.editor.defineTheme("mockgen", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "string.key.json", foreground: "7dd3fc" },
      { token: "string.value.json", foreground: "6ee7b7" },
      { token: "number", foreground: "fcd34d" },
      { token: "keyword", foreground: "fda4af" },
      { token: "delimiter", foreground: "64748b" },
    ],
    colors: {
      "editor.background": "#0b0e15",
      "editorGutter.background": "#0b0e15",
      "editor.lineHighlightBackground": "#ffffff08",
      "editor.lineHighlightBorder": "#00000000",
      "editor.selectionBackground": "#fcd34d33",
      "editor.inactiveSelectionBackground": "#fcd34d1a",
      "editorCursor.foreground": "#fcd34d",
      "editorLineNumber.foreground": "#475569",
      "editorLineNumber.activeForeground": "#cbd5e1",
      "editorIndentGuide.background1": "#ffffff0d",
      "editorIndentGuide.activeBackground1": "#ffffff26",
      "scrollbarSlider.background": "#ffffff14",
      "scrollbarSlider.hoverBackground": "#ffffff26",
      "scrollbarSlider.activeBackground": "#ffffff33",
    },
  });
};

const onEditorMount = (editor, monaco) => {
  // Re-measure once the web font is ready so the cursor stays aligned
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => monaco.editor.remeasureFonts());
  }
};

// ======================================================
// Icons
// ======================================================

const Svg = ({ children, className = "h-4 w-4", strokeWidth = 1.8 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ZapIcon = () => (
  <Svg>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Svg>
);

const CheckIcon = () => (
  <Svg className="h-3 w-3" strokeWidth={3}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
);

const LayersIcon = () => (
  <Svg className="h-5 w-5">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </Svg>
);

const CpuIcon = () => (
  <Svg className="h-5 w-5">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </Svg>
);

const DatabaseIcon = () => (
  <Svg className="h-5 w-5">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </Svg>
);

// ======================================================
// Small UI pieces
// ======================================================

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-amber-300/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-300/10";

const Segmented = ({ name, options, value, onChange }) => (
  <div
    role="radiogroup"
    className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1"
  >
    {options.map((option) => {
      const active = value === option;

      return (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(option)}
          className="relative z-10 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
        >
          {active && (
            <motion.span
              layoutId={`seg-${name}`}
              className="absolute inset-0 -z-10 rounded-md bg-amber-300"
              transition={{ type: "spring", stiffness: 500, damping: 36 }}
            />
          )}
          <span
            className={`transition-colors ${
              active ? "text-slate-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {option}
          </span>
        </button>
      );
    })}
  </div>
);

const DataStream = ({ side }) => {
  const left = side === "left";
  const rows = useMemo(
    () => Array.from({ length: 8 }, () => STREAM_ROWS).flat(),
    [],
  );
  const fade =
    "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-0 hidden h-full w-52 overflow-hidden 2xl:block ${
        left ? "left-0" : "right-0"
      }`}
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <div
        className={`${
          left ? "mg-stream-down text-left" : "mg-stream-up text-right"
        } space-y-3 px-5 font-code text-[10px] text-slate-600`}
      >
        {rows.map((row, i) => (
          <div key={i} className="whitespace-nowrap">
            {row}
          </div>
        ))}
      </div>

      <div
        className={`absolute inset-0 from-transparent to-[#080a10] ${
          left ? "bg-gradient-to-r" : "bg-gradient-to-l"
        }`}
      />
    </div>
  );
};

// ======================================================
// Generate Component
// ======================================================

const Generate = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [records, setRecords] = useState(1000);
  const [method, setMethod] = useState("Batch");
  const [batchSize, setBatchSize] = useState(100);

  const [country, setCountry] = useState("Global");
  const [outputFormat, setOutputFormat] = useState("JSON");

  const [selectedTemplate, setSelectedTemplate] = useState("Custom");

  const [schemaText, setSchemaText] = useState(
    JSON.stringify(CUSTOM_SCHEMA, null, 2),
  );

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);

  const fail = (message) => {
    setError(message);
    setShake((n) => n + 1);
  };

  const onCardMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  // Live JSON validity + field count shown under the editor
  const schemaStatus = useMemo(() => {
    try {
      const parsed = JSON.parse(schemaText);

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { valid: true, fields: Object.keys(parsed).length };
      }

      return { valid: false, message: "Schema must be a JSON object" };
    } catch (err) {
      return { valid: false, message: "Invalid JSON" };
    }
  }, [schemaText]);

  const estimatedBatches =
    Number(batchSize) > 0
      ? Math.ceil(Number(records) / Number(batchSize))
      : 0;

  // ======================================================
  // Template Selection
  // ======================================================

  const handleTemplateChange = (templateName) => {
    setSelectedTemplate(templateName);
    setError("");

    if (templateName === "Custom") {
      setSchemaText(JSON.stringify(CUSTOM_SCHEMA, null, 2));
      return;
    }

    const selectedSchema = TEMPLATE_SCHEMAS[templateName];

    if (selectedSchema) {
      setSchemaText(JSON.stringify(selectedSchema, null, 2));
    }
  };

  // ======================================================
  // Format JSON
  // ======================================================

  const formatJson = () => {
    try {
      const parsed = JSON.parse(schemaText);

      setSchemaText(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (err) {
      fail("Cannot format invalid JSON. Please fix the JSON syntax first.");
    }
  };

  // ======================================================
  // Records Input Handler
  // ======================================================

  const handleRecordsChange = (e) => {
    const rawValue = e.target.value;

    if (rawValue === "") {
      setRecords("");
      return;
    }

    const value = Number(rawValue);

    if (value > 1000000) {
      setRecords(1000000);
      return;
    }

    if (value < 0) {
      setRecords(1);
      return;
    }

    setRecords(value);

    if (method === "Batch" && Number(batchSize) > value) {
      setBatchSize(value);
    }
  };

  const applyRecordsPreset = (value) => {
    setRecords(value);

    if (method === "Batch" && Number(batchSize) > value) {
      setBatchSize(value);
    }
  };

  // ======================================================
  // Batch Size Input Handler
  // ======================================================

  const handleBatchSizeChange = (e) => {
    const rawValue = e.target.value;

    if (rawValue === "") {
      setBatchSize("");
      return;
    }

    const value = Number(rawValue);
    const maxBatchSize = Number(records) || 1;

    if (value > maxBatchSize) {
      setBatchSize(maxBatchSize);
      return;
    }

    if (value < 0) {
      setBatchSize(1);
      return;
    }

    setBatchSize(value);
  };

  // ======================================================
  // Generate Data
  // ======================================================

  const handleGenerate = async () => {
    setError("");

    const totalRecords = Number(records);
    const selectedBatchSize = Number(batchSize);

    // ---------------- Records validation ----------------

    if (!Number.isInteger(totalRecords) || totalRecords < 1) {
      fail("Please enter a valid number of records.");
      return;
    }

    if (totalRecords > 1000000) {
      fail("Maximum 1,000,000 records are allowed.");
      return;
    }

    // ---------------- Batch size validation ----------------

    if (method === "Batch") {
      if (!Number.isInteger(selectedBatchSize) || selectedBatchSize < 1) {
        fail("Please enter a valid batch size.");
        return;
      }

      if (selectedBatchSize > 10000) {
        fail("Maximum batch size is 10,000 records.");
        return;
      }

      if (selectedBatchSize > totalRecords) {
        fail(
          "Batch size cannot be greater than the total number of records.",
        );
        return;
      }
    }

    // ---------------- Schema validation ----------------

    let schema;

    try {
      schema = JSON.parse(schemaText);
    } catch (err) {
      fail("Invalid JSON format. Please check your schema.");
      return;
    }

    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
      fail("Schema must be a valid JSON object.");
      return;
    }

    if (Object.keys(schema).length === 0) {
      fail("Please add at least one field to the schema.");
      return;
    }

    // Progress helper (only re-renders when the percentage changes)
    const updateProgress = (generated, total) => {
      const percent = Math.min(100, Math.round((generated / total) * 100));

      if (Number.isFinite(percent)) {
        setProgress(percent);
      }
    };

    // ---------------- API request ----------------

    try {
      setLoading(true);
      setProgress(0);

      // Clear previous temporary browser dataset
      await clearGeneratedData();
      console.log("Previous temporary dataset cleared.");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          schema,
          records: totalRecords,
          method,
          batchSize: method === "Batch" ? selectedBatchSize : null,
          country,
          outputFormat,
        }),
      });

      if (!response.ok) {
        let message = "Failed to generate mock data.";

        try {
          const errorData = await response.json();

          if (errorData.message) {
            message = errorData.message;
          }
        } catch (err) {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      // ==================================================
      // BATCH GENERATION
      // ==================================================

      if (method === "Batch") {
        let completeMetadata = null;

        await readNdjson(response, async (item) => {
          // Batch received -> save to IndexedDB
          if (item.type === "batch") {
            console.log(`Batch ${item.batchNumber} received`);
            console.log(`Records in batch: ${item.batchSize}`);
            console.log(`Total generated: ${item.totalGenerated}`);

            await saveBatch(item.batchNumber, item.data);

            console.log(`Batch ${item.batchNumber} saved to IndexedDB.`);

            updateProgress(item.totalGenerated, totalRecords);
          }

          // Generation complete
          if (item.type === "complete") {
            console.log("All batches received.");
            completeMetadata = item;
          }
        });

        if (!completeMetadata) {
          throw new Error("Generation completed without final metadata.");
        }

        console.log("Generation completed successfully.");
        setProgress(100);

        navigate("/results", {
          state: {
            data: [],
            records: completeMetadata.records || totalRecords,
            method: "Batch",
            schema,
            country,
            outputFormat,
            batchSize: completeMetadata.batchSize || selectedBatchSize,
            totalBatches: completeMetadata.totalBatches,
            originalSchema: completeMetadata.originalSchema,
            normalizedSchema: completeMetadata.normalizedSchema,
            generationTime: completeMetadata.generationTime,
            memoryUsed: completeMetadata.memoryUsed,
            id: completeMetadata.id,
            dataStored: completeMetadata.dataStored,
            dataReturned: completeMetadata.dataReturned,
          },
        });

        return;
      }

      // ==================================================
      // STREAMING GENERATION
      // ==================================================

      if (method === "Streaming") {
        // IMPORTANT: do NOT keep the entire streaming dataset in React
        // memory. Store every 1,000 records in IndexedDB.

        let currentBatch = [];
        let batchNumber = 1;
        let totalGenerated = 0;
        let metadata = null;

        const saveStreamingBatch = async () => {
          if (currentBatch.length === 0) {
            return;
          }

          console.log(`Streaming batch ${batchNumber} received`);
          console.log(`Records in batch: ${currentBatch.length}`);

          await saveBatch(batchNumber, currentBatch);

          console.log(`Streaming batch ${batchNumber} saved to IndexedDB.`);

          totalGenerated += currentBatch.length;
          currentBatch = [];
          batchNumber++;

          updateProgress(totalGenerated, totalRecords);
        };

        await readNdjson(response, async (item) => {
          // Final metadata
          if (item.__metadata === true) {
            metadata = item;
            console.log("Streaming metadata received:", metadata);
            return;
          }

          // Generated record
          currentBatch.push(item);

          // Save every 1,000 records
          if (currentBatch.length >= STREAM_BATCH_SIZE) {
            await saveStreamingBatch();
          }
        });

        // Save final partial batch
        if (currentBatch.length > 0) {
          await saveStreamingBatch();
        }

        if (!metadata) {
          throw new Error(
            "Streaming generation completed without final metadata.",
          );
        }

        console.log("Streaming generation completed successfully.");
        console.log(`Total records stored: ${totalGenerated}`);
        console.log(`Total batches stored: ${batchNumber - 1}`);

        // Validate record count
        if (totalGenerated !== totalRecords) {
          throw new Error(
            `Streaming generation mismatch. Expected ${totalRecords} records but received ${totalGenerated}.`,
          );
        }

        setProgress(100);

        navigate("/results", {
          state: {
            // Generated dataset is NOT passed through React Router state.
            data: [],
            records: totalGenerated,
            method: "Streaming",
            schema,
            country,
            outputFormat,
            batchSize: STREAM_BATCH_SIZE,
            totalBatches: batchNumber - 1,
            originalSchema: metadata.originalSchema,
            normalizedSchema: metadata.normalizedSchema,
            generationTime: metadata.generationTime,
            memoryUsed: metadata.memoryUsed,
            id: metadata.id,
            dataStored: metadata.dataStored,
            dataReturned: metadata.dataReturned,
          },
        });

        return;
      }

      throw new Error("Invalid generation method.");
    } catch (err) {
      console.error("Generation Error:", err);

      fail(
        err.message ||
          "Unable to generate data. Make sure the backend server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="font-display relative min-h-screen overflow-hidden bg-[#080a10] text-white antialiased">
      <style>{css}</style>

      {/* ---------- Background ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 25%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 25%, black, transparent)",
          }}
        />

        <motion.div
          className="absolute inset-x-0 top-[-180px] mx-auto h-[420px] w-[720px] rounded-full bg-sky-500/10 blur-[140px]"
          animate={
            reduce ? undefined : { opacity: [0.55, 1, 0.55], scale: [1, 1.08, 1] }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute inset-x-0 bottom-[-200px] mx-auto h-[360px] w-[560px] rounded-full bg-amber-300/[0.06] blur-[140px]"
          animate={
            reduce ? undefined : { opacity: [1, 0.5, 1], scale: [1.05, 1, 1.05] }
          }
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {!reduce && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="mg-drift absolute rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background: `rgb(${p.rgb})`,
                boxShadow: `0 0 12px rgba(${p.rgb}, 0.9)`,
                "--dur": p.dur,
                "--delay": p.delay,
              }}
            />
          ))}
        </div>
      )}

      {!reduce && <DataStream side="left" />}
      {!reduce && <DataStream side="right" />}

      {/* ---------- Content ---------- */}
      <motion.main
        variants={pageV}
        initial={reduce ? "show" : "hidden"}
        animate="show"
        className="relative z-10 mx-auto max-w-6xl px-6 py-10"
      >
        {/* Header */}
        <motion.div variants={itemV} className="mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1 text-xs font-medium text-amber-200">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
            </span>
            Data generator
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Generate Mock Data
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Define your schema, select the dataset size and generation
            strategy, then generate realistic JSON mock data.
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence mode="wait" initial={false}>
          {error && (
            <motion.div
              key={shake}
              role="alert"
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={
                reduce
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }
              }
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
              transition={{ duration: 0.4 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-300"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-400/30 text-xs">
                !
              </span>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          {/* ==================================================
              Schema Editor
          ================================================== */}

          <motion.section
            variants={itemV}
            onMouseMove={onCardMove}
            className="mg-card relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e15]/80 shadow-2xl shadow-black/40"
          >
            <div className="pointer-events-none absolute -top-px left-1/2 z-10 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
            <div className="mg-spot pointer-events-none absolute inset-0" />

            {/* Card header */}
            <div className="relative border-b border-white/10 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Schema Definition</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Select a real-world template or define your own JSON
                    schema.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={formatJson}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-amber-300/40 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
                  >
                    Format JSON
                  </button>

                  <span className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 font-code text-xs text-slate-500">
                    JSON
                  </span>
                </div>
              </div>
            </div>

            {/* Template selector */}
            <div className="relative border-b border-white/10 bg-black/20 px-6 py-5">
              <label className="text-sm font-medium text-slate-300">
                Schema Template
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Use a realistic domain-specific schema with constraints and
                nested structures.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {TEMPLATE_OPTIONS.map((name) => {
                  const active = selectedTemplate === name;

                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleTemplateChange(name)}
                      className={`relative rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 ${
                        active
                          ? "border-amber-300/40 text-amber-200"
                          : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="template-pill"
                          className="absolute inset-0 rounded-full bg-amber-300/10"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 36,
                          }}
                        />
                      )}
                      <span className="relative">{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editor */}
            <div className="relative overflow-hidden">
              <Editor
                height="420px"
                language="json"
                theme="mockgen"
                beforeMount={defineMockGenTheme}
                onMount={onEditorMount}
                loading={
                  <span className="text-sm text-slate-500">Loading editor…</span>
                }
                value={schemaText}
                onChange={(value) => {
                  setSchemaText(value || "");
                  setError("");
                  setSelectedTemplate("Custom");
                }}
                options={{
                  minimap: { enabled: false },
                  fontFamily:
                    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 14,
                  lineHeight: 24,
                  padding: { top: 18, bottom: 18 },
                  tabSize: 2,
                  wordWrap: "on",
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  scrollBeyondLastLine: false,
                  roundedSelection: false,
                  renderLineHighlight: "line",
                  folding: true,
                  suggestOnTriggerCharacters: true,
                  overviewRulerBorder: false,
                }}
              />
            </div>

            {/* Schema information */}
            <div className="relative border-t border-white/10 bg-black/20 px-6 py-4">
              <div className="mb-3 flex items-center gap-2 text-xs">
                <span
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    schemaStatus.valid
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                      : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]"
                  }`}
                />

                {schemaStatus.valid ? (
                  <span className="text-slate-400">
                    Valid JSON
                    <span className="text-slate-600"> · </span>
                    {schemaStatus.fields}{" "}
                    {schemaStatus.fields === 1 ? "field" : "fields"}
                  </span>
                ) : (
                  <span className="text-red-300">{schemaStatus.message}</span>
                )}
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Example:{" "}
                <span className="font-code text-slate-400">
                  {'{ "name": "string", "age": "number" }'}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Supported types: name, email, number, date, city, country,
                phone, company, address, boolean, nested objects and arrays.
              </p>

              <p className="mt-2 text-xs text-slate-600">
                Templates support constraints such as enum, min/max,
                minLength/maxLength, pattern and minItems/maxItems.
              </p>
            </div>
          </motion.section>

          {/* ==================================================
              Generation Settings
          ================================================== */}

          <motion.section
            variants={itemV}
            onMouseMove={onCardMove}
            className="mg-card relative h-fit overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
            <div className="mg-spot pointer-events-none absolute inset-0" />

            <div className="relative">
              <h2 className="text-xl font-semibold">Generation Settings</h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure the benchmark workload.
              </p>

              {/* Records */}
              <div className="mt-7">
                <label
                  htmlFor="records"
                  className="text-sm font-medium text-slate-300"
                >
                  Number of Records
                </label>

                <input
                  id="records"
                  type="number"
                  min="1"
                  max="1000000"
                  value={records}
                  onChange={handleRecordsChange}
                  className={`mg-num mt-2 font-code ${inputCls}`}
                />

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {RECORD_PRESETS.map((preset) => {
                    const active = Number(records) === preset.value;

                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyRecordsPreset(preset.value)}
                        className={`rounded-md border px-2.5 py-1 font-code text-[11px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 ${
                          active
                            ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                            : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2.5 text-xs leading-5 text-slate-500">
                  Enter the number of records required for the benchmark.
                  Maximum: 1,000,000 records.
                </p>
              </div>

              {/* Country */}
              <div className="mt-7">
                <label
                  htmlFor="country"
                  className="text-sm font-medium text-slate-300"
                >
                  Country / Data Locale
                </label>

                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`mg-select mt-2 ${inputCls.replace("px-4", "pl-4")}`}
                >
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Select a country for localized data or choose Global Data for
                  worldwide data.
                </p>
              </div>

              {/* Output Format */}
              <div className="mt-7">
                <label className="text-sm font-medium text-slate-300">
                  Output Format
                </label>

                <div className="mt-2">
                  <Segmented
                    name="format"
                    options={["JSON", "JSONL"]}
                    value={outputFormat}
                    onChange={setOutputFormat}
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  JSON is suitable for standard structured data. JSONL is
                  recommended for large-scale and streaming-friendly workloads.
                </p>
              </div>

              {/* Method */}
              <div className="mt-7">
                <label className="text-sm font-medium text-slate-300">
                  Generation Method
                </label>

                <div role="radiogroup" className="mt-3 space-y-3">
                  {[
                    {
                      value: "Batch",
                      text: "Generates and delivers records progressively in user-defined mini-batches.",
                    },
                    {
                      value: "Streaming",
                      text: "Generates records progressively using a continuous stream.",
                    },
                  ].map((option) => {
                    const active = method === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setMethod(option.value)}
                        className={`relative w-full rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 ${
                          active
                            ? "border-transparent"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="method-ring"
                            className="absolute inset-0 rounded-xl border border-amber-300/50 bg-amber-300/[0.06]"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 36,
                            }}
                          />
                        )}

                        <div className="relative flex items-center justify-between">
                          <span className="font-semibold">{option.value}</span>

                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                              active
                                ? "border-amber-300 bg-amber-300 text-slate-950"
                                : "border-white/15 text-transparent"
                            }`}
                          >
                            <CheckIcon />
                          </span>
                        </div>

                        <p className="relative mt-1 text-xs leading-5 text-slate-500">
                          {option.text}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mini Batch */}
              <AnimatePresence initial={false}>
                {method === "Batch" && (
                  <motion.div
                    key="mini-batch"
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="pt-7">
                      <label
                        htmlFor="batchSize"
                        className="text-sm font-medium text-slate-300"
                      >
                        Mini-Batch Size
                      </label>

                      <input
                        id="batchSize"
                        type="number"
                        min="1"
                        max={Number(records) || 1}
                        value={batchSize}
                        onChange={handleBatchSizeChange}
                        className={`mg-num mt-2 font-code ${inputCls}`}
                      />

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Number of records generated and delivered together in
                        each batch.
                      </p>

                      <div className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.05] px-3 py-2.5">
                        <p className="text-xs leading-5 text-amber-200/90">
                          {records || 0} records with batch size {batchSize || 0}
                          {" → approximately "}
                          {estimatedBatches}
                          {" batches will be delivered progressively."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate */}
              <motion.button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                whileHover={reduce || loading ? undefined : { y: -1 }}
                whileTap={reduce || loading ? undefined : { scale: 0.98 }}
                className="group relative mt-8 w-full overflow-hidden rounded-xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/10 transition-colors hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a10] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {/* shine sweep */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                      {method === "Batch"
                        ? "Generating Batches..."
                        : "Streaming Data..."}
                      <span className="font-code tabular-nums">{progress}%</span>
                    </>
                  ) : (
                    <>
                      <ZapIcon />
                      Generate Mock Data
                    </>
                  )}
                </span>
              </motion.button>

              {/* Progress */}
              <AnimatePresence initial={false}>
                {loading && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="relative h-full overflow-hidden rounded-full bg-amber-300 transition-[width] duration-200 ease-out"
                        style={{
                          width: `${progress}%`,
                          boxShadow: "0 0 10px rgba(252,211,77,0.6)",
                        }}
                      >
                        {!reduce && (
                          <span className="mg-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                        )}
                      </div>
                    </div>

                    <p className="mt-2.5 text-center text-xs text-slate-500">
                      {method === "Batch"
                        ? "Each batch is saved to IndexedDB as it arrives."
                        : "Records are stored in 1,000-record IndexedDB batches."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>

        {/* ==================================================
            Information
        ================================================== */}

        <motion.section
          variants={itemV}
          className="mt-8 grid gap-4 md:grid-cols-3"
        >
          {[
            {
              icon: <LayersIcon />,
              title: "Real-World Schema Templates",
              text: "MockGen provides domain-specific schemas for school, college, banking, healthcare, e-commerce, employee management and CRM applications. These schemas contain nested objects, arrays, categorical values and validation constraints.",
            },
            {
              icon: <CpuIcon />,
              title: "Generation Pipeline",
              text: "The selected schema is passed to the same AI-assisted and rule-based generation pipeline. The generator interprets the field semantics and preserves the defined constraints while generating realistic mock records.",
            },
            {
              icon: <DatabaseIcon />,
              title: "Batch & Streaming Storage",
              text: "In Batch mode, records are generated in configurable mini-batches and each completed batch is sent to the client immediately. In Streaming mode, records are received continuously and internally grouped into 1,000-record IndexedDB batches. This allows very large datasets to be browsed later without storing the generated dataset in MongoDB.",
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/[0.07] text-amber-300">
                {card.icon}
              </div>

              <h3 className="mt-4 font-semibold text-white">{card.title}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {card.text}
              </p>
            </motion.div>
          ))}
        </motion.section>
      </motion.main>
    </div>
  );
};

export default Generate;