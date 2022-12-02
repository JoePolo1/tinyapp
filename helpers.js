// User lookup search function which uses email to check database of users
const getUserByEmail = function(email, users) {
  for (const userId in users) {
    const user = users[userId]
    if (user.email === email) {
      return user;
    }
  }
};

module.exports = { getUserByEmail };