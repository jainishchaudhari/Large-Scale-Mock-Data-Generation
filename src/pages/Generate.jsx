import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

import { clearGeneratedData, saveBatch } from "../utils/dataStorage";

// ======================================================
// Real-World Schema Templates
// ======================================================

const TEMPLATE_SCHEMAS = {
  School: {
    studentId: {
      type: "string",
      minLength: 6,
      maxLength: 12,
      pattern: "^STU[0-9]+$",
    },

    firstName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    lastName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    dateOfBirth: {
      type: "date",
    },

    gender: {
      type: "string",
      enum: ["Male", "Female", "Other"],
    },

    email: {
      type: "string",
      maxLength: 100,
    },

    phone: {
      type: "string",
      pattern: "^[6-9][0-9]{9}$",
    },

    class: {
      type: "string",
      enum: ["6", "7", "8", "9", "10", "11", "12"],
    },

    section: {
      type: "string",
      enum: ["A", "B", "C", "D"],
    },

    rollNumber: {
      type: "number",
      min: 1,
      max: 60,
    },

    admissionDate: {
      type: "date",
    },

    parent: {
      type: "object",
      properties: {
        name: {
          type: "string",
          minLength: 2,
          maxLength: 60,
        },

        phone: {
          type: "string",
          pattern: "^[6-9][0-9]{9}$",
        },

        email: {
          type: "string",
          maxLength: 100,
        },
      },
    },

    address: {
      type: "object",
      properties: {
        street: {
          type: "string",
          minLength: 5,
          maxLength: 100,
        },

        city: {
          type: "city",
        },

        state: {
          type: "string",
          minLength: 2,
          maxLength: 40,
        },

        postalCode: {
          type: "string",
          pattern: "^[0-9]{6}$",
        },

        country: {
          type: "country",
        },
      },
    },

    attendancePercentage: {
      type: "number",
      min: 0,
      max: 100,
    },

    status: {
      type: "string",
      enum: ["Active", "Inactive", "Graduated", "Transferred"],
    },
  },

  College: {
    studentId: {
      type: "string",
      minLength: 6,
      maxLength: 15,
      pattern: "^COL[0-9]+$",
    },

    enrollmentNumber: {
      type: "string",
      minLength: 8,
      maxLength: 20,
    },

    firstName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    lastName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    email: {
      type: "string",
      maxLength: 100,
    },

    phone: {
      type: "string",
      pattern: "^[6-9][0-9]{9}$",
    },

    dateOfBirth: {
      type: "date",
    },

    gender: {
      type: "string",
      enum: ["Male", "Female", "Other"],
    },

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

    semester: {
      type: "number",
      min: 1,
      max: 10,
    },

    year: {
      type: "number",
      min: 1,
      max: 5,
    },

    cgpa: {
      type: "number",
      min: 0,
      max: 10,
    },

    admissionYear: {
      type: "number",
      min: 2000,
      max: 2035,
    },

    graduationYear: {
      type: "number",
      min: 2000,
      max: 2040,
    },

    address: {
      type: "object",
      properties: {
        city: {
          type: "city",
        },

        state: {
          type: "string",
          minLength: 2,
          maxLength: 40,
        },

        country: {
          type: "country",
        },
      },
    },

    status: {
      type: "string",
      enum: ["Active", "Graduated", "Suspended", "Dropped"],
    },
  },

  Banking: {
    customerId: {
      type: "string",
      minLength: 8,
      maxLength: 15,
      pattern: "^CUS[0-9]+$",
    },

    accountNumber: {
      type: "string",
      minLength: 10,
      maxLength: 16,
      pattern: "^[0-9]+$",
    },

    firstName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    lastName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    dateOfBirth: {
      type: "date",
    },

    gender: {
      type: "string",
      enum: ["Male", "Female", "Other"],
    },

    email: {
      type: "string",
      maxLength: 100,
    },

    phone: {
      type: "string",
      pattern: "^[6-9][0-9]{9}$",
    },

    accountType: {
      type: "string",
      enum: ["Savings", "Current", "Salary", "Fixed Deposit"],
    },

    balance: {
      type: "number",
      min: 0,
      max: 10000000,
    },

    currency: {
      type: "string",
      enum: ["INR", "USD", "EUR", "GBP"],
    },

    branch: {
      type: "object",
      properties: {
        branchCode: {
          type: "string",
          minLength: 4,
          maxLength: 12,
        },

        branchName: {
          type: "string",
          minLength: 3,
          maxLength: 60,
        },

        city: {
          type: "city",
        },
      },
    },

    address: {
      type: "object",
      properties: {
        street: {
          type: "string",
          minLength: 5,
          maxLength: 100,
        },

        city: {
          type: "city",
        },

        state: {
          type: "string",
          minLength: 2,
          maxLength: 40,
        },

        postalCode: {
          type: "string",
          pattern: "^[0-9]{6}$",
        },
      },
    },

    accountStatus: {
      type: "string",
      enum: ["Active", "Dormant", "Blocked", "Closed"],
    },

    openedAt: {
      type: "date",
    },
  },

  Hospital: {
    patientId: {
      type: "string",
      minLength: 7,
      maxLength: 15,
      pattern: "^PAT[0-9]+$",
    },

    firstName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    lastName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    dateOfBirth: {
      type: "date",
    },

    gender: {
      type: "string",
      enum: ["Male", "Female", "Other"],
    },

    bloodGroup: {
      type: "string",
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    email: {
      type: "string",
      maxLength: 100,
    },

    phone: {
      type: "string",
      pattern: "^[6-9][0-9]{9}$",
    },

    emergencyContact: {
      type: "object",
      properties: {
        name: {
          type: "string",
          minLength: 2,
          maxLength: 60,
        },

        relationship: {
          type: "string",
          enum: ["Parent", "Spouse", "Sibling", "Friend", "Relative"],
        },

        phone: {
          type: "string",
          pattern: "^[6-9][0-9]{9}$",
        },
      },
    },

    address: {
      type: "object",
      properties: {
        city: {
          type: "city",
        },

        state: {
          type: "string",
          minLength: 2,
          maxLength: 40,
        },

        country: {
          type: "country",
        },
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

        doctorName: {
          type: "name",
        },

        diagnosis: {
          type: "string",
          minLength: 5,
          maxLength: 150,
        },

        admissionDate: {
          type: "date",
        },
      },
    },

    insurance: {
      type: "object",
      properties: {
        provider: {
          type: "company",
          minLength: 3,
          maxLength: 80,
        },

        policyNumber: {
          type: "string",
          minLength: 8,
          maxLength: 20,
        },
      },
    },

    status: {
      type: "string",
      enum: ["Admitted", "Discharged", "Under Treatment", "Recovered"],
    },
  },

  "E-commerce": {
    orderId: {
      type: "string",
      minLength: 8,
      maxLength: 15,
      pattern: "^ORD[0-9]+$",
    },

    customer: {
      type: "object",
      properties: {
        customerId: {
          type: "string",
          minLength: 6,
          maxLength: 15,
          pattern: "^CUS[0-9]+$",
        },

        name: {
          type: "name",
        },

        email: {
          type: "email",
          maxLength: 100,
        },

        phone: {
          type: "string",
          pattern: "^[6-9][0-9]{9}$",
        },
      },
    },

    items: {
      type: "array",
      minItems: 1,
      maxItems: 10,

      items: {
        type: "object",

        properties: {
          productId: {
            type: "string",
            minLength: 6,
            maxLength: 15,
            pattern: "^PROD[0-9]+$",
          },

          productName: {
            type: "string",
            minLength: 3,
            maxLength: 100,
          },

          category: {
            type: "string",
            enum: [
              "Electronics",
              "Clothing",
              "Books",
              "Home",
              "Beauty",
              "Sports",
            ],
          },

          quantity: {
            type: "number",
            min: 1,
            max: 20,
          },

          unitPrice: {
            type: "number",
            min: 50,
            max: 100000,
          },
        },
      },
    },

    shippingAddress: {
      type: "object",
      properties: {
        street: {
          type: "string",
          minLength: 5,
          maxLength: 100,
        },

        city: {
          type: "city",
        },

        state: {
          type: "string",
          minLength: 2,
          maxLength: 40,
        },

        postalCode: {
          type: "string",
          pattern: "^[0-9]{6}$",
        },

        country: {
          type: "country",
        },
      },
    },

    payment: {
      type: "object",
      properties: {
        method: {
          type: "string",
          enum: [
            "UPI",
            "Credit Card",
            "Debit Card",
            "Net Banking",
            "Cash on Delivery",
          ],
        },

        transactionId: {
          type: "string",
          minLength: 8,
          maxLength: 30,
        },

        amount: {
          type: "number",
          min: 50,
          max: 500000,
        },

        status: {
          type: "string",
          enum: ["Pending", "Paid", "Failed", "Refunded"],
        },
      },
    },

    orderStatus: {
      type: "string",
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
    },

    orderedAt: {
      type: "date",
    },
  },

  Employee: {
    employeeId: {
      type: "string",
      minLength: 6,
      maxLength: 12,
      pattern: "^EMP[0-9]+$",
    },

    firstName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    lastName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    email: {
      type: "email",
      maxLength: 100,
    },

    phone: {
      type: "string",
      pattern: "^[6-9][0-9]{9}$",
    },

    dateOfBirth: {
      type: "date",
    },

    gender: {
      type: "string",
      enum: ["Male", "Female", "Other"],
    },

    department: {
      type: "string",
      enum: [
        "Engineering",
        "Human Resources",
        "Finance",
        "Marketing",
        "Sales",
        "Operations",
      ],
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

    joiningDate: {
      type: "date",
    },

    salary: {
      type: "number",
      min: 15000,
      max: 500000,
    },

    manager: {
      type: "object",
      properties: {
        employeeId: {
          type: "string",
          minLength: 6,
          maxLength: 12,
        },

        name: {
          type: "name",
        },
      },
    },

    address: {
      type: "object",
      properties: {
        city: {
          type: "city",
        },

        state: {
          type: "string",
          minLength: 2,
          maxLength: 40,
        },

        country: {
          type: "country",
        },
      },
    },

    skills: {
      type: "array",
      minItems: 1,
      maxItems: 6,

      items: {
        type: "string",
        minLength: 2,
        maxLength: 30,
      },
    },

    employmentStatus: {
      type: "string",
      enum: ["Active", "On Leave", "Resigned", "Terminated"],
    },
  },

  Customer: {
    customerId: {
      type: "string",
      minLength: 8,
      maxLength: 15,
      pattern: "^CUS[0-9]+$",
    },

    firstName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    lastName: {
      type: "string",
      minLength: 2,
      maxLength: 30,
    },

    email: {
      type: "email",
      maxLength: 100,
    },

    phone: {
      type: "string",
      pattern: "^[6-9][0-9]{9}$",
    },

    dateOfBirth: {
      type: "date",
    },

    address: {
      type: "object",
      properties: {
        street: {
          type: "string",
          minLength: 5,
          maxLength: 100,
        },

        city: {
          type: "city",
        },

        state: {
          type: "string",
          minLength: 2,
          maxLength: 40,
        },

        postalCode: {
          type: "string",
          pattern: "^[0-9]{6}$",
        },

        country: {
          type: "country",
        },
      },
    },

    company: {
      type: "object",
      properties: {
        name: {
          type: "company",
          minLength: 3,
          maxLength: 80,
        },

        industry: {
          type: "string",
          enum: [
            "Technology",
            "Finance",
            "Healthcare",
            "Education",
            "Retail",
            "Manufacturing",
          ],
        },

        jobTitle: {
          type: "string",
          minLength: 2,
          maxLength: 60,
        },
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

    totalOrders: {
      type: "number",
      min: 0,
      max: 1000,
    },

    totalSpent: {
      type: "number",
      min: 0,
      max: 10000000,
    },

    customerSince: {
      type: "date",
    },

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

// ======================================================
// Generate Component
// ======================================================

const Generate = () => {
  const navigate = useNavigate();

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
  const [error, setError] = useState("");

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
      setError(
        "Cannot format invalid JSON. Please fix the JSON syntax first.",
      );
    }
  };

  // ======================================================
  // Records Input Handler
  // ======================================================

  const handleRecordsChange = (e) => {
    const rawValue = e.target.value;

    // Allow empty input while typing
    if (rawValue === "") {
      setRecords("");
      return;
    }

    const value = Number(rawValue);

    // Maximum 1,000,000 records
    if (value > 1000000) {
      setRecords(1000000);
      return;
    }

    // Prevent negative values
    if (value < 0) {
      setRecords(1);
      return;
    }

    setRecords(value);

    // Keep batch size valid when total records becomes smaller
    if (method === "Batch" && Number(batchSize) > value) {
      setBatchSize(value);
    }
  };

  // ======================================================
  // Batch Size Input Handler
  // ======================================================

  const handleBatchSizeChange = (e) => {
    const rawValue = e.target.value;

    // Allow empty input while typing
    if (rawValue === "") {
      setBatchSize("");
      return;
    }

    const value = Number(rawValue);
    const maxBatchSize = Number(records) || 1;

    // Batch size cannot exceed total records
    if (value > maxBatchSize) {
      setBatchSize(maxBatchSize);
      return;
    }

    // Prevent negative values
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

    // ==================================================
    // Records Validation
    // ==================================================

    if (!Number.isInteger(totalRecords) || totalRecords < 1) {
      setError("Please enter a valid number of records.");
      return;
    }

    if (totalRecords > 1000000) {
      setError("Maximum 1,000,000 records are allowed.");
      return;
    }

    // ==================================================
    // Batch Size Validation
    // ==================================================

    if (method === "Batch") {
      if (
        !Number.isInteger(selectedBatchSize) ||
        selectedBatchSize < 1
      ) {
        setError("Please enter a valid batch size.");
        return;
      }

      if (selectedBatchSize > 10000) {
        setError("Maximum batch size is 10,000 records.");
        return;
      }

      if (selectedBatchSize > totalRecords) {
        setError(
          "Batch size cannot be greater than the total number of records.",
        );
        return;
      }
    }

    // ==================================================
    // Schema Validation
    // ==================================================

    let schema;

    try {
      schema = JSON.parse(schemaText);
    } catch (err) {
      setError("Invalid JSON format. Please check your schema.");
      return;
    }

    if (
      !schema ||
      typeof schema !== "object" ||
      Array.isArray(schema)
    ) {
      setError("Schema must be a valid JSON object.");
      return;
    }

    const fields = Object.keys(schema);

    if (fields.length === 0) {
      setError("Please add at least one field to the schema.");
      return;
    }

    // ==================================================
    // API Request
    // ==================================================

    try {
      setLoading(true);

      // --------------------------------------------------
      // Clear previous temporary browser dataset
      // --------------------------------------------------

      await clearGeneratedData();

      console.log("Previous temporary dataset cleared.");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/generator/generate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            schema,
            records: totalRecords,
            method,

            batchSize:
              method === "Batch" ? selectedBatchSize : null,

            country,

            outputFormat,
          }),
        },
      );

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
        if (!response.body) {
          throw new Error(
            "Streaming response is not supported by this browser.",
          );
        }

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        let buffer = "";
        let completeMetadata = null;

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          const lines = buffer.split("\n");

          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) {
              continue;
            }

            try {
              const item = JSON.parse(line);

              // ------------------------------------------------
              // Batch received
              // ------------------------------------------------

              if (item.type === "batch") {
                console.log(
                  `Batch ${item.batchNumber} received`,
                );

                console.log(
                  `Records in batch: ${item.batchSize}`,
                );

                console.log(
                  `Total generated: ${item.totalGenerated}`,
                );

                // ----------------------------------------------
                // Save batch temporarily in IndexedDB
                // ----------------------------------------------

                await saveBatch(
                  item.batchNumber,
                  item.data,
                );

                console.log(
                  `Batch ${item.batchNumber} saved to IndexedDB.`,
                );
              }

              // ------------------------------------------------
              // Generation complete
              // ------------------------------------------------

              if (item.type === "complete") {
                console.log("All batches received.");

                completeMetadata = item;
              }
            } catch (parseError) {
              console.error(
                "Invalid NDJSON line:",
                line,
              );
            }
          }
        }

        // ==================================================
        // Process remaining buffer
        // ==================================================

        if (buffer.trim()) {
          try {
            const item = JSON.parse(buffer);

            if (item.type === "batch") {
              console.log(
                `Final batch ${item.batchNumber} received.`,
              );

              await saveBatch(
                item.batchNumber,
                item.data,
              );
            }

            if (item.type === "complete") {
              completeMetadata = item;
            }
          } catch (parseError) {
            console.error(
              "Invalid final streaming data:",
              buffer,
            );
          }
        }

        // ==================================================
        // Validate completion metadata
        // ==================================================

        if (!completeMetadata) {
          throw new Error(
            "Generation completed without final metadata.",
          );
        }

        console.log(
          "Generation completed successfully.",
        );

        // ==================================================
        // Navigate to Results
        // ==================================================

        navigate("/results", {
          state: {
            // Do NOT send generated dataset
            // through React Router state.
            data: [],

            records:
              completeMetadata.records ||
              totalRecords,

            method: "Batch",

            schema,

            country,

            outputFormat,

            batchSize:
              completeMetadata.batchSize ||
              selectedBatchSize,

            totalBatches:
              completeMetadata.totalBatches,

            originalSchema:
              completeMetadata.originalSchema,

            normalizedSchema:
              completeMetadata.normalizedSchema,

            generationTime:
              completeMetadata.generationTime,

            memoryUsed:
              completeMetadata.memoryUsed,

            id: completeMetadata.id,

            dataStored:
              completeMetadata.dataStored,

            dataReturned:
              completeMetadata.dataReturned,
          },
        });

        return;
      }

      // ======================================================
      // STREAMING GENERATION
      // ======================================================

      if (method === "Streaming") {
        if (!response.body) {
          throw new Error(
            "Streaming response is not supported by this browser.",
          );
        }

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        let buffer = "";

        const generatedData = [];

        let metadata = null;

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          const lines = buffer.split("\n");

          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) {
              continue;
            }

            try {
              const item = JSON.parse(line);

              if (!item.__metadata) {
                generatedData.push(item);
              }

              if (item.__metadata === true) {
                metadata = item;
              }
            } catch (parseError) {
              console.error(
                "Invalid streaming JSON:",
                line,
              );
            }
          }
        }

        // ==================================================
        // Process remaining buffer
        // ==================================================

        if (buffer.trim()) {
          try {
            const item = JSON.parse(buffer);

            if (!item.__metadata) {
              generatedData.push(item);
            }

            if (item.__metadata === true) {
              metadata = item;
            }
          } catch (parseError) {
            console.error(
              "Invalid final streaming data:",
              buffer,
            );
          }
        }

        // ==================================================
        // Navigate to Results
        // ==================================================

        navigate("/results", {
          state: {
            data: generatedData,

            records:
              totalRecords ||
              generatedData.length,

            method: "Streaming",

            schema,

            country,

            outputFormat,

            originalSchema:
              metadata?.originalSchema,

            normalizedSchema:
              metadata?.normalizedSchema,

            generationTime: metadata
              ? `${metadata.generationTime} ms`
              : null,

            memoryUsed: metadata
              ? `${metadata.memoryUsed} MB`
              : null,
          },
        });

        return;
      }

      throw new Error(
        "Invalid generation method.",
      );
    } catch (err) {
      console.error(err);

      setError(
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
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}

        <div className="mb-10">
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
            DATA GENERATOR
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Generate Mock Data
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Define your schema, select the dataset size and
            generation strategy, then generate realistic JSON
            mock data.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
          {/* Schema Editor */}

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Schema Definition
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a real-world template or define
                    your own JSON schema.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={formatJson}
                    className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-purple-500 hover:text-purple-400"
                  >
                    Format JSON
                  </button>

                  <span className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-400">
                    JSON
                  </span>
                </div>
              </div>
            </div>

            {/* Template Selector */}

            <div className="border-b border-slate-800 bg-slate-950/40 px-6 py-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Schema Template
                  </label>

                  <p className="mt-1 text-xs text-slate-500">
                    Use a realistic domain-specific schema
                    with constraints and nested structures.
                  </p>
                </div>

                <select
                  value={selectedTemplate}
                  onChange={(e) =>
                    handleTemplateChange(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-500 sm:w-64"
                >
                  <option value="Custom">
                    Custom JSON Schema
                  </option>

                  <option value="School">
                    🏫 School
                  </option>

                  <option value="College">
                    🎓 College / University
                  </option>

                  <option value="Banking">
                    🏦 Banking
                  </option>

                  <option value="Hospital">
                    🏥 Hospital / Patient
                  </option>

                  <option value="E-commerce">
                    🛒 E-commerce Order
                  </option>

                  <option value="Employee">
                    👨‍💼 Employee / HR
                  </option>

                  <option value="Customer">
                    👤 Customer / CRM
                  </option>
                </select>
              </div>
            </div>

            {/* Editor */}

            <div className="overflow-hidden">
              <Editor
                height="420px"
                language="json"
                theme="vs-dark"
                value={schemaText}
                onChange={(value) => {
                  setSchemaText(value || "");
                  setError("");
                  setSelectedTemplate("Custom");
                }}
                options={{
                  minimap: {
                    enabled: false,
                  },

                  fontSize: 14,

                  lineHeight: 24,

                  padding: {
                    top: 18,
                    bottom: 18,
                  },

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
                }}
              />
            </div>

            {/* Schema Information */}

            <div className="border-t border-slate-800 bg-slate-950/50 px-6 py-4">
              <p className="text-xs leading-5 text-slate-500">
                Example:{" "}
                <span className="text-slate-400">
                  {'{ "name": "string", "age": "number" }'}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Supported types: name, email, number, date,
                city, country, phone, company, address,
                boolean, nested objects and arrays.
              </p>

              <p className="mt-2 text-xs text-slate-600">
                Templates support constraints such as enum,
                min/max, minLength/maxLength, pattern and
                minItems/maxItems.
              </p>
            </div>
          </section>

          {/* Generation Settings */}

          <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Generation Settings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure the benchmark workload.
            </p>

            {/* Records */}

            <div className="mt-7">
              <label className="text-sm font-medium text-slate-300">
                Number of Records
              </label>

              <input
                type="number"
                min="1"
                max="1000000"
                value={records}
                onChange={handleRecordsChange}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Enter the number of records required for the
                benchmark. Maximum: 1,000,000 records.
              </p>
            </div>

            {/* Country */}

            <div className="mt-7">
              <label className="text-sm font-medium text-slate-300">
                Country / Data Locale
              </label>

              <select
                value={country}
                onChange={(e) =>
                  setCountry(e.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
              >
                <option value="Global">
                  🌍 Global Data
                </option>

                <option value="India">
                  🇮🇳 India
                </option>

                <option value="United States">
                  🇺🇸 United States
                </option>

                <option value="United Kingdom">
                  🇬🇧 United Kingdom
                </option>

                <option value="Germany">
                  🇩🇪 Germany
                </option>

                <option value="Canada">
                  🇨🇦 Canada
                </option>
              </select>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Select a country for localized data or choose
                Global Data for worldwide data.
              </p>
            </div>

            {/* Output Format */}

            <div className="mt-7">
              <label className="text-sm font-medium text-slate-300">
                Output Format
              </label>

              <select
                value={outputFormat}
                onChange={(e) =>
                  setOutputFormat(e.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
              >
                <option value="JSON">JSON</option>

                <option value="JSONL">JSONL</option>
              </select>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                JSON is suitable for standard structured data.
                JSONL is recommended for large-scale and
                streaming-friendly workloads.
              </p>
            </div>

            {/* Method */}

            <div className="mt-7">
              <label className="text-sm font-medium text-slate-300">
                Generation Method
              </label>

              <div className="mt-3 space-y-3">
                {/* Batch */}

                <button
                  onClick={() => setMethod("Batch")}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    method === "Batch"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-slate-700 bg-slate-950 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      Batch
                    </span>

                    {method === "Batch" && (
                      <span className="text-xs text-purple-400">
                        Selected
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Generates and delivers records progressively
                    in user-defined mini-batches.
                  </p>
                </button>

                {/* Streaming */}

                <button
                  onClick={() => setMethod("Streaming")}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    method === "Streaming"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-slate-700 bg-slate-950 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      Streaming
                    </span>

                    {method === "Streaming" && (
                      <span className="text-xs text-purple-400">
                        Selected
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Generates records progressively using a
                    continuous stream.
                  </p>
                </button>
              </div>
            </div>

            {/* Mini Batch */}

            {method === "Batch" && (
              <div className="mt-7">
                <label className="text-sm font-medium text-slate-300">
                  Mini-Batch Size
                </label>

                <input
                  type="number"
                  min="1"
                  max={Number(records) || 1}
                  value={batchSize}
                  onChange={handleBatchSizeChange}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Number of records generated and delivered
                  together in each batch.
                </p>

                <div className="mt-3 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2.5">
                  <p className="text-xs text-purple-300">
                    {records || 0} records with batch size{" "}
                    {batchSize || 0}
                    {" → approximately "}
                    {Number(batchSize) > 0
                      ? Math.ceil(
                          Number(records) /
                            Number(batchSize),
                        )
                      : 0}
                    {" batches will be delivered progressively."}
                  </p>
                </div>
              </div>
            )}

            {/* Generate */}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-purple-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? method === "Batch"
                  ? "Generating Batches..."
                  : "Streaming Data..."
                : "Generate Mock Data"}
            </button>
          </section>
        </div>

        {/* Information */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <span className="text-lg">i</span>
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Real-World Schema Templates
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                MockGen provides domain-specific schemas for
                school, college, banking, healthcare,
                e-commerce, employee management and CRM
                applications. These schemas contain nested
                objects, arrays, categorical values and
                validation constraints.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                The selected schema is passed to the same
                AI-assisted and rule-based generation pipeline.
                The generator interprets the field semantics and
                preserves the defined constraints while
                generating realistic mock records.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                In Batch mode, records are generated in
                configurable mini-batches and each completed
                batch is sent to the client immediately. The
                received batch is temporarily stored in browser
                IndexedDB so that very large datasets can be
                browsed later without storing the dataset in
                MongoDB.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Generate;