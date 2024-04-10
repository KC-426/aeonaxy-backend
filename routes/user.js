const express = require('express')
const userController = require('../controllers/user')
const userAuth = require('../middleware/auth')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage: storage });

const router = express.Router()

router.post('/user/signup', userController.userSignup)
router.get('/user/login', userController.userLogin)
router.put('/user/profile/:userId', upload.single('file'), userController.userProfile)

module.exports = router
