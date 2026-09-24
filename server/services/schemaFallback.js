const typeRules = {
  name: "name",
  fullname: "name",
  full_name: "name",

  email: "email",
  emailaddress: "email",
  email_address: "email",

  age: "age",
  userage: "age",
  user_age: "age",

  city: "city",
  homecity: "city",
  home_city: "city",

  country: "country",
  countryname: "country",
  country_name: "country",

  phone: "phone",
  phonenumber: "phone",
  phone_number: "phone",

  address: "address",

  company: "company",

  date: "date",

  number: "number",

  boolean: "boolean",

  text: "text",
};


// ---------------------------------------------
// Normalize field name
// ---------------------------------------------

const normalizeFieldName = (field) => {
  return field
    .toLowerCase()
    .replace(/[\s-]/g, "_");
};


// ---------------------------------------------
// Get semantic type
// ---------------------------------------------

const getSemanticType = (
  field,
  definition
) => {
  const normalizedField =
    normalizeFieldName(field);

  // -------------------------------------------
  // Field-name rule
  // -------------------------------------------

  if (
    typeRules[normalizedField]
  ) {
    return typeRules[
      normalizedField
    ];
  }


  // -------------------------------------------
  // Definition type rule
  // -------------------------------------------

  if (
    typeof definition === "object" &&
    definition !== null
  ) {
    // Enum without semantic meaning
    // is treated as text.
    if (
      Array.isArray(
        definition.enum
      )
    ) {
      return "text";
    }

    if (
      definition.type === "integer"
    ) {
      return "number";
    }

    if (
      definition.type === "number"
    ) {
      return "number";
    }

    if (
      definition.type === "boolean"
    ) {
      return "boolean";
    }

    if (
      definition.type === "date"
    ) {
      return "date";
    }

    if (
      definition.type === "string"
    ) {
      return "text";
    }
  }


  // -------------------------------------------
  // String definition support
  // -------------------------------------------

  if (
    typeof definition === "string"
  ) {
    const normalizedType =
      definition.toLowerCase();

    if (
      typeRules[normalizedType]
    ) {
      return typeRules[
        normalizedType
      ];
    }
  }


  // -------------------------------------------
  // Default
  // -------------------------------------------

  return "text";
};


// ---------------------------------------------
// Recursive fallback generator
// ---------------------------------------------

const buildFallbackMap = (
  schema,
  parentPath = ""
) => {
  const result = {};

  for (
    const [field, definition]
    of Object.entries(schema)
  ) {

    const currentPath =
      parentPath
        ? `${parentPath}.${field}`
        : field;


    // -----------------------------------------
    // Nested object
    // -----------------------------------------

    if (
      definition &&
      typeof definition === "object" &&
      definition.type === "object" &&
      definition.properties
    ) {
      const nestedMap =
        buildFallbackMap(
          definition.properties,
          currentPath
        );

      Object.assign(
        result,
        nestedMap
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

      // Array of objects
      if (
        definition.items.type ===
          "object" &&
        definition.items.properties
      ) {

        const nestedMap =
          buildFallbackMap(
            definition.items.properties,
            `${currentPath}[]`
          );

        Object.assign(
          result,
          nestedMap
        );

        continue;
      }


      // Array of primitive values
      result[currentPath] =
        getSemanticType(
          field,
          definition.items
        );

      continue;
    }


    // -----------------------------------------
    // Normal field
    // -----------------------------------------

    result[currentPath] =
      getSemanticType(
        field,
        definition
      );
  }


  return result;
};


// ---------------------------------------------
// Main fallback function
// ---------------------------------------------

export const fallbackSchema = (
  schema
) => {
  return buildFallbackMap(
    schema
  );
};