export const filterObj = (obj, ...allowedFields) => {
  let objCopy = { ...obj };
  let newObj = {};
  for (let field in objCopy) {
    if (allowedFields.includes(field)) newObj[field] = objCopy[field];
  }
  return newObj;
};
