const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshToken, logoutUser, deleteRefreshToken, checkRefreshToken, fetchData,
     updateTokensWithTheme, updateTheme } = require('./controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refreshToken/:token', refreshToken);
router.post('/deleteRefreshToken', deleteRefreshToken);
router.post('/checkRefreshToken', checkRefreshToken);
router.get('/fetchData', fetchData);
router.post('/updateTokensWithTheme', updateTokensWithTheme);
router.post('/updateTheme', updateTheme);

module.exports = router;
