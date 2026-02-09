import express,{Application, Request, Response} from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import resumeRoutes from './routes/resumeRoutes';

const app : Application = express();

app.use(cors()); 
app.use(express.json()); 

app.use('/auth',authRoutes); //Authorization of user
app.use('/resumes',resumeRoutes); //resume CRUD

app.get('/health', (req: Request, res: Response) : void => {
    res.status(200).json({status:'ok'});
})

app.get('/',(req : Request,res : Response) : void =>{
    res.status(200).send('Welcome to the App API!');
})

export default app;
