import express from 'express';
import bodyParser from 'body-parser';
import identify from './controller/identify.js'; 

const app = express();
app.use(bodyParser.json());

app.post('/identify', identify);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
