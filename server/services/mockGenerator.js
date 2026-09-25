import {
  fakerEN_IN,
  fakerEN_US,
  fakerEN_GB,
  fakerDE,
  fakerEN_CA,
} from "@faker-js/faker";

// ---------------------------------------------
// Country → Faker Locale
// ---------------------------------------------

const getFakerByCountry = (country) => {
  switch (country) {
    case "India":
      return fakerEN_IN;

    case "United States":
      return fakerEN_US;

    case "United Kingdom":
      return fakerEN_GB;

    case "Germany":
      return fakerDE;

    case "Canada":
      return fakerEN_CA;

    default:
      return fakerEN_IN;
  }
};

// ---------------------------------------------
// Country Value Generator
// ---------------------------------------------

const getCountryValue = (country, faker) => {
  if (country && country !== "Global") {
    return country;
  }

  return faker.location.country();
};

// ---------------------------------------------
// Utility: Generate realistic semantic value
// ---------------------------------------------

const generateSemanticValue = (
  semanticType,
  faker,
  country = "Global",
) => {
  switch (semanticType) {
    case "name":
      return faker.person.fullName();

    case "email":
      return faker.internet.email();

    case "age":
      return faker.number.int({
        min: 18,
        max: 80,
      });

    case "number":
      return faker.number.int({
        min: 1,
        max: 1000,
      });

    case "city":
      return faker.location.city();

    case "country":
      return getCountryValue(country, faker);

    case "phone":
      return faker.phone.number();

    case "company":
      return faker.company.name();

    case "address":
      return faker.location.streetAddress();

    case "date":
      return faker.date.past().toISOString();

    case "boolean":
      return faker.datatype.boolean();

    case "text":
      return faker.lorem.sentence();

    default:
      return faker.lorem.word();
  }
};

// ---------------------------------------------
// Get numeric constraint
// Supports:
// min/max
// minimum/maximum
// ---------------------------------------------

const getMinimum = (definition, defaultValue = 0) => {
  return (
    definition.min ??
    definition.minimum ??
    defaultValue
  );
};

const getMaximum = (
  definition,
  defaultValue = 1000,
) => {
  return (
    definition.max ??
    definition.maximum ??
    defaultValue
  );
};

// ---------------------------------------------
// String constraint checker
// ---------------------------------------------

const satisfiesStringConstraints = (
  value,
  definition,
) => {
  const minLength =
    definition.minLength ?? 1;

  const maxLength =
    definition.maxLength ?? Infinity;

  if (
    typeof value !== "string" ||
    value.length < minLength ||
    value.length > maxLength
  ) {
    return false;
  }

  if (definition.pattern) {
    try {
      const regex = new RegExp(
        definition.pattern,
      );

      if (!regex.test(value)) {
        return false;
      }
    } catch {
      console.warn(
        "Invalid regex pattern:",
        definition.pattern,
      );
    }
  }

  return true;
};

// ---------------------------------------------
// Generate string from common patterns
// ---------------------------------------------

const generatePatternValue = (
  pattern,
  definition,
  faker,
) => {
  const minLength =
    definition.minLength ?? 1;

  const maxLength =
    definition.maxLength ?? 50;

  // -------------------------------------------
  // STU12345 / COL12345 / EMP12345
  // PAT12345 / CUS12345 / ORD12345
  // -------------------------------------------

  const prefixPattern =
    /^\^([A-Za-z]+)\[0-9\]\+\$$/;

  const prefixMatch =
    pattern.match(prefixPattern);

  if (prefixMatch) {
    const prefix = prefixMatch[1];

    const minimumDigits = Math.max(
      1,
      minLength - prefix.length,
    );

    const maximumDigits = Math.max(
      minimumDigits,
      Math.min(
        12,
        maxLength - prefix.length,
      ),
    );

    const digitLength =
      faker.number.int({
        min: minimumDigits,
        max: maximumDigits,
      });

    return (
      prefix +
      faker.string.numeric(digitLength)
    );
  }

  // -------------------------------------------
  // Indian 10-digit mobile number
  // -------------------------------------------

  if (
    pattern === "^[6-9][0-9]{9}$"
  ) {
    return (
      faker.helpers.arrayElement([
        "6",
        "7",
        "8",
        "9",
      ]) +
      faker.string.numeric(9)
    );
  }

  // -------------------------------------------
  // Six digit postal code
  // -------------------------------------------

  if (pattern === "^[0-9]{6}$") {
    return faker.string.numeric(6);
  }

  // -------------------------------------------
  // Only English letters
  // -------------------------------------------

  if (pattern === "^[A-Za-z]+$") {
    const min = Math.max(
      1,
      minLength,
    );

    const max = Math.max(
      min,
      Math.min(maxLength, 50),
    );

    const length =
      faker.number.int({
        min,
        max,
      });

    return faker.string.alpha({
      length,
      casing: "mixed",
    });
  }

  // -------------------------------------------
  // Only numbers
  // -------------------------------------------

  if (pattern === "^[0-9]+$") {
    const min = Math.max(
      1,
      minLength,
    );

    const max = Math.max(
      min,
      Math.min(maxLength, 50),
    );

    const length =
      faker.number.int({
        min,
        max,
      });

    return faker.string.numeric(length);
  }

  // -------------------------------------------
  // Letters + numbers
  // -------------------------------------------

  if (
    pattern === "^[A-Za-z0-9]+$"
  ) {
    const min = Math.max(
      1,
      minLength,
    );

    const max = Math.max(
      min,
      Math.min(maxLength, 50),
    );

    const length =
      faker.number.int({
        min,
        max,
      });

    return faker.string.alphanumeric(
      length,
    );
  }

  return null;
};

// ---------------------------------------------
// Generate realistic string with constraints
// ---------------------------------------------

const generateStringValue = (
  definition,
  semanticType,
  faker,
  country,
) => {
  const minLength =
    definition.minLength ?? 1;

  const maxLength =
    definition.maxLength ?? Infinity;

  // -------------------------------------------
  // ENUM
  // -------------------------------------------

  if (Array.isArray(definition.enum)) {
    return faker.helpers.arrayElement(
      definition.enum,
    );
  }

  // -------------------------------------------
  // COUNTRY
  // -------------------------------------------

  if (semanticType === "country") {
    return getCountryValue(
      country,
      faker,
    );
  }

  // -------------------------------------------
  // PATTERN
  // -------------------------------------------

  if (definition.pattern) {
    const patternValue =
      generatePatternValue(
        definition.pattern,
        definition,
        faker,
      );

    if (
      patternValue &&
      satisfiesStringConstraints(
        patternValue,
        definition,
      )
    ) {
      return patternValue;
    }
  }

  // -------------------------------------------
  // Semantic value
  // -------------------------------------------

  if (
    semanticType &&
    semanticType !== "text"
  ) {
    for (
      let attempt = 0;
      attempt < 20;
      attempt++
    ) {
      const value =
        generateSemanticValue(
          semanticType,
          faker,
          country,
        );

      if (
        typeof value === "string" &&
        satisfiesStringConstraints(
          value,
          definition,
        )
      ) {
        return value;
      }
    }
  }

  // -------------------------------------------
  // Generic realistic text
  // -------------------------------------------

  for (
    let attempt = 0;
    attempt < 20;
    attempt++
  ) {
    const value =
      faker.lorem.words(
        faker.number.int({
          min: 1,
          max: 4,
        }),
      );

    if (
      value.length >= minLength &&
      value.length <= maxLength
    ) {
      return value;
    }
  }

  // -------------------------------------------
  // Final fallback
  // -------------------------------------------

  let value =
    faker.lorem.word();

  while (
    value.length < minLength
  ) {
    value +=
      faker.lorem.word();
  }

  if (
    value.length > maxLength
  ) {
    value =
      value.substring(
        0,
        maxLength,
      );
  }

  return value;
};

// ---------------------------------------------
// Schema-aware value generator
// ---------------------------------------------

const generateSchemaValue = (
  definition,
  semanticType,
  faker,
  country,
  fieldName,
  context = {},
) => {
  // -------------------------------------------
  // Old format support
  // -------------------------------------------

  if (typeof definition === "string") {
    return generateSemanticValue(
      semanticType || definition,
      faker,
      country,
    );
  }

  // -------------------------------------------
  // Invalid definition
  // -------------------------------------------

  if (
    !definition ||
    typeof definition !== "object"
  ) {
    return generateSemanticValue(
      semanticType || "text",
      faker,
      country,
    );
  }

  // -------------------------------------------
  // ENUM
  // -------------------------------------------

  if (
    Array.isArray(definition.enum)
  ) {
    return faker.helpers.arrayElement(
      definition.enum,
    );
  }

  // -------------------------------------------
  // STRING
  // -------------------------------------------

  if (
    definition.type === "string"
  ) {
    return generateStringValue(
      definition,
      semanticType,
      faker,
      country,
    );
  }

  // -------------------------------------------
  // INTEGER
  // -------------------------------------------

  if (
    definition.type === "integer"
  ) {
    const minimum =
      getMinimum(
        definition,
        0,
      );

    const maximum =
      getMaximum(
        definition,
        1000,
      );

    return faker.number.int({
      min: minimum,
      max: maximum,
    });
  }

  // -------------------------------------------
  // NUMBER
  // -------------------------------------------

  if (
    definition.type === "number"
  ) {
    const minimum =
      getMinimum(
        definition,
        0,
      );

    const maximum =
      getMaximum(
        definition,
        1000,
      );

    // -----------------------------------------
    // Admission Year
    // -----------------------------------------

    if (
      fieldName ===
      "admissionYear"
    ) {
      const value =
        faker.number.int({
          min: minimum,
          max: maximum,
        });

      context.admissionYear =
        value;

      return value;
    }

    // -----------------------------------------
    // Graduation Year
    // -----------------------------------------

    if (
      fieldName ===
      "graduationYear"
    ) {
      const admissionYear =
        context.admissionYear;

      if (
        typeof admissionYear ===
        "number"
      ) {
        const minimumGraduationYear =
          admissionYear + 3;

        const maximumGraduationYear =
          admissionYear + 5;

        const safeMinimum =
          Math.max(
            minimumGraduationYear,
            minimum,
          );

        const safeMaximum =
          Math.max(
            safeMinimum,
            Math.min(
              maximumGraduationYear,
              maximum,
            ),
          );

        return faker.number.int({
          min: safeMinimum,
          max: safeMaximum,
        });
      }

      return faker.number.int({
        min: minimum,
        max: maximum,
      });
    }

    // -----------------------------------------
    // Normal Number
    // -----------------------------------------

    return faker.number.int({
      min: minimum,
      max: maximum,
    });
  }

  // -------------------------------------------
  // BOOLEAN
  // -------------------------------------------

  if (
    definition.type === "boolean"
  ) {
    return faker.datatype.boolean();
  }

  // -------------------------------------------
  // DATE
  // -------------------------------------------

  if (
    definition.type === "date"
  ) {
    // -----------------------------------------
    // Date of Birth
    // -----------------------------------------

    if (
      semanticType ===
        "dateOfBirth" ||
      semanticType ===
        "birthdate" ||
      semanticType === "dob" ||
      fieldName ===
        "dateOfBirth"
    ) {
      return faker.date
        .birthdate({
          min: 18,
          max: 30,
          mode: "age",
        })
        .toISOString()
        .split("T")[0];
    }

    // -----------------------------------------
    // Normal Date
    // -----------------------------------------

    return faker.date
      .past()
      .toISOString()
      .split("T")[0];
  }

  // -------------------------------------------
  // FALLBACK
  // -------------------------------------------

  return generateSemanticValue(
    semanticType || "text",
    faker,
    country,
  );
};

// ---------------------------------------------
// Recursive Schema Generator
// ---------------------------------------------

const generateFromSchema = (
  schema,
  semanticMap = {},
  parentPath = "",
  faker,
  country = "Global",
  context = {},
) => {
  const result = {};

  for (
    const [field, definition]
    of Object.entries(schema)
  ) {
    // -----------------------------------------
    // JSON Schema keyword
    // -----------------------------------------

    if (field === "required") {
      continue;
    }

    const currentPath =
      parentPath
        ? `${parentPath}.${field}`
        : field;

    // -----------------------------------------
    // Nested Object
    // -----------------------------------------

    if (
      definition &&
      typeof definition ===
        "object" &&
      definition.type ===
        "object" &&
      definition.properties
    ) {
      result[field] =
        generateFromSchema(
          definition.properties,
          semanticMap,
          currentPath,
          faker,
          country,
          context,
        );

      continue;
    }

    // -----------------------------------------
    // Array
    // -----------------------------------------

    if (
      definition &&
      typeof definition ===
        "object" &&
      definition.type ===
        "array" &&
      definition.items
    ) {
      const minItems =
        definition.minItems ?? 1;

      const maxItems =
        definition.maxItems ??
        minItems;

      const count =
        faker.number.int({
          min: minItems,
          max: maxItems,
        });

      result[field] = [];

      for (
        let i = 0;
        i < count;
        i++
      ) {
        // -------------------------------------
        // Object inside array
        // -------------------------------------

        if (
          definition.items
            .type === "object" &&
          definition.items
            .properties
        ) {
          result[field].push(
            generateFromSchema(
              definition.items
                .properties,
              semanticMap,
              `${currentPath}[]`,
              faker,
              country,
              context,
            ),
          );

          continue;
        }

        // -------------------------------------
        // Normal array item
        // -------------------------------------

        const semanticType =
          semanticMap[
            `${currentPath}[]`
          ] ||
          semanticMap[
            currentPath
          ] ||
          semanticMap[field];

        result[field].push(
          generateSchemaValue(
            definition.items,
            semanticType,
            faker,
            country,
            field,
            context,
          ),
        );
      }

      continue;
    }

    // -----------------------------------------
    // Normal Field
    // -----------------------------------------

    const semanticType =
      semanticMap[currentPath] ||
      semanticMap[field];

    result[field] =
      generateSchemaValue(
        definition,
        semanticType,
        faker,
        country,
        field,
        context,
      );
  }

  return result;
};

// ---------------------------------------------
// Main Record Generator
// ---------------------------------------------

export const generateRecord = (
  schema,
  semanticMap = {},
  country = "Global",
) => {
  const fakerInstance =
    getFakerByCountry(
      country,
    );

  const context = {};

  return generateFromSchema(
    schema,
    semanticMap,
    "",
    fakerInstance,
    country,
    context,
  );
};