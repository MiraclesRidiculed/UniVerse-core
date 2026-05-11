const express = require('express');
const app = express();
const { join } = require('path');

app.get('/', async (req, res) => {
	res.sendFile(join(__dirname, 'cors.html'));
});

app.listen(3000);
