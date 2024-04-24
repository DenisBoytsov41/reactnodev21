const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshToken, logoutUser, deleteRefreshToken, checkRefreshToken, fetchData,
     updateTokensWithTheme, updateTheme, totalRecords, countRecordsLastMonth, lastAddedRecord, searchUsers, searchUsers_2 } = require('./controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refreshToken/:token', refreshToken);
router.post('/deleteRefreshToken', deleteRefreshToken);
router.post('/checkRefreshToken', checkRefreshToken);
router.get('/fetchData', fetchData);
router.get('/totalRecords', totalRecords);
router.get('/lastAddedRecord', lastAddedRecord);
router.get('/countRecordsLastMonth', countRecordsLastMonth);
router.get('/search/:userSearch', searchUsers);
router.get('/search_2/:userSearch', searchUsers_2);
router.post('/updateTokensWithTheme', updateTokensWithTheme);
router.post('/updateTheme', updateTheme);

module.exports = router;
