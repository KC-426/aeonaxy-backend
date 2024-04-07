const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  location: {
    type: String,
  },

  imageFile: {
    name: {
      type: String,
    },
    url: {
      type: String,
    },
    path: {
      type: String,
    },
  },
});

module.exports = mongoose.model("User", userSchema);
