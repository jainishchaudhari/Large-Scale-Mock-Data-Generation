import { faker } from "@faker-js/faker";

// ---------------------------------------------
// Utility: Generate realistic value
// ---------------------------------------------

const generateSemanticValue = (semanticType) => {
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
      return faker.location.country();

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
// String constraint helper
// ---------------------------------------------

const satisfiesStringConstraints = (
  value,
  definition
) => {
  const minLength =
    definition.minLength ?? 1;

  const maxLength =
    definition.maxLength ?? 20;

  if (
    value.length < minLength ||
    value.length > maxLength
  ) {
    return false;
  }

  if (definition.pattern) {
    try {
      const regex = new RegExp(
        definition.pattern
      );

      if (!regex.test(value)) {
        return false;
      }
    } catch {
      console.warn(
        "Invalid regex pattern:",
        definition.pattern
      );
    }
  }

  return true;
};

// ---------------------------------------------
// Generate realistic string with constraints
// ---------------------------------------------

const generateStringValue = (
  definition,
  semanticType
) => {
  const minLength =
    definition.minLength ?? 1;

  const maxLength =
    definition.maxLength ?? 20;

  // -------------------------------------------
  // ENUM
  // -------------------------------------------

  if (Array.isArray(definition.enum)) {
    return faker.helpers.arrayElement(
      definition.enum
    );
  }

  // -------------------------------------------
  // Try realistic semantic value first
  // -------------------------------------------

  if (
    semanticType &&
    semanticType !== "text"
  ) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const value =
        generateSemanticValue(
          semanticType
        );

      if (
        typeof value === "string" &&
        satisfiesStringConstraints(
          value,
          definition
        )
      ) {
        return value;
      }
    }
  }

  // -------------------------------------------
  // Pattern-specific generation
  // -------------------------------------------

  if (definition.pattern) {
    const pattern =
      definition.pattern;

    // Only English letters
    if (
      pattern === "^[A-Za-z]+$"
    ) {
      const min = Math.max(
        minLength,
        1
      );

      const max = Math.max(
        min,
        Math.min(maxLength, 50)
      );

      const length =
        min === max
          ? min
          : faker.number.int({
              min,
              max,
            });

      return faker.string.alpha({
        length,
        casing: "mixed",
      });
    }

    // Only numbers
    if (
      pattern === "^[0-9]+$"
    ) {
      const min = Math.max(
        minLength,
        1
      );

      const max = Math.max(
        min,
        Math.min(maxLength, 50)
      );

      const length =
        min === max
          ? min
          : faker.number.int({
              min,
              max,
            });

      return faker.string.numeric(
        length
      );
    }

    // Letters + numbers
    if (
      pattern ===
      "^[A-Za-z0-9]+$"
    ) {
      const min = Math.max(
        minLength,
        1
      );

      const max = Math.max(
        min,
        Math.min(maxLength, 50)
      );

      const length =
        min === max
          ? min
          : faker.number.int({
              min,
              max,
            });

      return faker.string.alphanumeric(
        length
      );
    }
  }

  // -------------------------------------------
  // Generic realistic text
  // -------------------------------------------

  for (let attempt = 0; attempt < 20; attempt++) {
    let value =
      faker.lorem.words(
        faker.number.int({
          min: 1,
          max: 4,
        })
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
    value = value.substring(
      0,
      maxLength
    );
  }

  return value;
};

// ---------------------------------------------
// Schema-aware Generator
// ---------------------------------------------

const generateSchemaValue = (
  definition,
  semanticType
) => {
  // -------------------------------------------
  // Old format support
  // -------------------------------------------

  if (typeof definition === "string") {
    return generateSemanticValue(
      semanticType || definition
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
      semanticType || "text"
    );
  }

  // -------------------------------------------
  // ENUM
  // -------------------------------------------

  if (Array.isArray(definition.enum)) {
    return faker.helpers.arrayElement(
      definition.enum
    );
  }

  // -------------------------------------------
  // STRING
  // -------------------------------------------

  if (definition.type === "string") {
    return generateStringValue(
      definition,
      semanticType
    );
  }

  // -------------------------------------------
  // INTEGER
  // -------------------------------------------

  if (
    definition.type === "integer"
  ) {
    const minimum =
      definition.minimum ?? 0;

    const maximum =
      definition.maximum ?? 1000;

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
      definition.minimum ?? 0;

    const maximum =
      definition.maximum ?? 1000;

    return faker.number.float({
      min: minimum,
      max: maximum,
      fractionDigits: 2,
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
    return faker.date
      .past()
      .toISOString();
  }

  // -------------------------------------------
  // FALLBACK
  // -------------------------------------------

  return generateSemanticValue(
    semanticType || "text"
  );
};

// ---------------------------------------------
// Recursive Schema Generator
// ---------------------------------------------

const generateFromSchema = (
  schema,
  semanticMap = {},
  parentPath = ""
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
      typeof definition === "object" &&
      definition.type === "object" &&
      definition.properties
    ) {
      result[field] =
        generateFromSchema(
          definition.properties,
          semanticMap,
          currentPath
        );

      continue;
    }

    // -----------------------------------------
    // Array
    // -----------------------------------------

    if (
      definition &&
      typeof definition === "object" &&
      definition.type === "array" &&
      definition.items
    ) {
      const itemCount =
        definition.minItems ??
        definition.maxItems ??
        1;

      const count =
        definition.minItems !==
          undefined &&
        definition.maxItems !==
          undefined
          ? faker.number.int({
              min:
                definition.minItems,
              max:
                definition.maxItems,
            })
          : itemCount;

      result[field] = [];

      for (
        let i = 0;
        i < count;
        i++
      ) {
        // Nested object
        if (
          definition.items.type ===
            "object" &&
          definition.items.properties
        ) {
          result[field].push(
            generateFromSchema(
              definition.items
                .properties,
              semanticMap,
              `${currentPath}[]`
            )
          );

          continue;
        }

        // Normal array item
        const semanticType =
          semanticMap[
            currentPath
          ];

        result[field].push(
          generateSchemaValue(
            definition.items,
            semanticType
          )
        );
      }

      continue;
    }

    // -----------------------------------------
    // Normal Field
    // -----------------------------------------

    const semanticType =
      semanticMap[
        currentPath
      ] ||
      semanticMap[field];

    result[field] =
      generateSchemaValue(
        definition,
        semanticType
      );
  }

  return result;
};

// ---------------------------------------------
// Main Record Generator
// ---------------------------------------------

export const generateRecord = (
  schema,
  semanticMap = {}
) => {
  return generateFromSchema(
    schema,
    semanticMap
  );
};