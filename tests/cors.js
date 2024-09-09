const express = require('express');
const app = express();

app.get('/', async (req, res) => {
	try {
		const res = await fetch('http://localhost:7000/client/students/nigga123');
		console.log(await res.json());
	} catch (e) {
		console.error(e);
	}
});

app.listen(3000);
