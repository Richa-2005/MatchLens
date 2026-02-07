import dotenv from "dotenv";
dotenv.config();
import app from "./app";

const PORT : number = process.env.PORT ? Number(process.env.PORT) : 8000;

app.listen(PORT, () : void => 
    console.log(`App API running on http://localhost:${PORT}`
));