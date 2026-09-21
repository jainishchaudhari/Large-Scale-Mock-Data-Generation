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

export const fallbackSchema = (schema) => {
  const normalizedSchema = {};

  for (const [field, type] of Object.entries(schema)) {
    const fieldKey = field
      .toLowerCase()
      .replace(/[\s-]/g, "_");

    const normalizedType = String(type).toLowerCase();

    normalizedSchema[field] =
      typeRules[fieldKey] ||
      typeRules[normalizedType] ||
      "text";
  }

  return normalizedSchema;
};

