const bcrypt = require('bcrypt');
const password = "1234";
bcrypt.hash(password, 10, function(err, hash) {
  const hashedPassword = hash;
  console.log(hashedPassword);
});