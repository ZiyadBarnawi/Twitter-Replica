export class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  static sort(query, queryString) {
    return query.sort(queryString.sort.split(",").join(" "));
  }

  static fields(query, queryString, excludedFields) {
    if (!queryString?.fields) {
      excludedFields = "-" + excludedFields.join(" -");
      return query.select(excludedFields);
    }
    let queryStringCopy = { ...queryString };
    queryStringCopy = queryStringCopy.fields.split(",").join(" ");
    excludedFields.forEach((field) => {
      queryStringCopy = queryStringCopy.replaceAll(`${field}`, "");
    });
    if (queryStringCopy.trim() === "") {
      excludedFields = "-" + excludedFields.join(" -");
      return query.select(excludedFields);
    }
    return query.select(queryStringCopy);
  }

  static limit(query, queryString) {
    return query.limit(queryString.limit);
  }
  static skip(query, queryString, options = { page: 1, limit: 10 }) {
    const page = queryString.page * 1 || options.page;
    const limit = queryString.limit * 1 || options.limit;
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }
}
