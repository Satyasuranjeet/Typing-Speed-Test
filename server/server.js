const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/proxy-text', async (req, res) => {
  try {
    const response = await axios.get('https://random-text-api.vercel.app/generate?length=5&type=sentence');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching text' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
