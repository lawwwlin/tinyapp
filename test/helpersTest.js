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

describe('getUserByEmail', function() {
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
