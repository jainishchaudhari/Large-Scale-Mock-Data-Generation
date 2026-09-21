import { faker } from "@faker-js/faker";

const generateValue = (type) => {
  switch (type) {
    case "name":
      return faker.person.fullName();

    case "email":
      return faker.internet.email();

    case "age":
      return faker.number.int({ min: 18, max: 80 });

    case "number":
      return faker.number.int({ min: 1, max: 1000 });

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

export const generateRecord = (schema) => {
  const record = {};

  for (const [field, type] of Object.entries(schema)) {
    record[field] = generateValue(type);
  }

  return record;
};
