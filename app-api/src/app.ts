import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/health', (req, res) => {
    res.status(200).json({status:'ok'});
})

app.get('/',(req,res)=>{
    res.status(200).send('Welcome to the App API!');
})

export default app;
