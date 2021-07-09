// from Lecture: HTTP Cookies & User Authentication - W03D3 by Andy Lindsay
const findUserByEmail = (email, database) => {
  for (const userID in database) {
    const user = database[userID];
    if (user.email === email) {
      return user;
    }
  }

  return null;
};

const filterData = (userID, database) => {
  const filteredData = {};

  for (const shortURL in database) {
    const url = database[shortURL];
    if (url.userID === userID) {
      filteredData[shortURL] = {
        longURL: url.longURL,
        date: url.date
      };
    }
  }

  if (Object.keys(filteredData).length === 0) {
    return null;
  }

  return filteredData;
};

const dateNow = () => {
  const currentDate = new Date().toLocaleString();
  return currentDate;
};

module.exports = {
  findUserByEmail,
  filterData,
  dateNow
};