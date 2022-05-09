// try catch block and async await || the direct promise thenables

module.exports = func => (req, res, next) => {
  Promise.resolve(func(req, res, next)).catch(next);
};
