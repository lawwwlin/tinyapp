const { assert } = require('chai');

const { findUserByEmail, filterData } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUsers2 = {};

const database = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aaaaa"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aaaaa"
  },
  a824dX: {
    longURL: "https://www.facebook.com",
    userID: "bbbbb"
  }
};

describe('findUserByEmail', function() {
  it('should return a user object with matching email, given an email in the database', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = testUsers.userRandomID;
    assert.deepEqual(user, expectedOutput);
  });

  it('should return null, given an email not in the database', function() {
    const user = findUserByEmail("none@example.com", testUsers)
    const expectedOutput = null;
    assert.deepEqual(user, expectedOutput);
  });
  
    it('should return null, given an empty string in the database', function() {
      const user = findUserByEmail("", testUsers)
      const expectedOutput = null;
      assert.deepEqual(user, expectedOutput);
    });

  it('should return null, given an email not in and empty database', function() {
    const user = findUserByEmail("user@example.com", testUsers2)
    const expectedOutput = null;
    assert.deepEqual(user, expectedOutput);
  });
});

describe('filterData', function() {
  it('should return object with key as short URL, and value as long URL, given a user with 2 entreis in the database', function() {
    const actual = filterData("aaaaa", database)
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
      }
    };
    assert.deepEqual(actual, expectedOutput);
  });

  it('should return object with key as short URL, and value as long URL, given a user with 1 entry in the database', function() {
    const actual = filterData("bbbbb", database)
    const expectedOutput = {
      a824dX: {
        longURL: "https://www.facebook.com",
      }
    };
    assert.deepEqual(actual, expectedOutput);
  });

  it('should return object with key as short URL, and value as long URL, given a user not in the database', function() {
    const actual = filterData("ccccc", database)
    const expectedOutput = null;
    assert.deepEqual(actual, expectedOutput);
  });
  
    it('should return null, given an empty string in the database', function() {
      const actual = filterData("", database)
      const expectedOutput = null;
      assert.deepEqual(actual, expectedOutput);
    });

  it('should return null, given an email not in and empty database', function() {
    const actual = filterData("aaaaa", testUsers2)
    const expectedOutput = null;
    assert.deepEqual(actual, expectedOutput);
  });
});
