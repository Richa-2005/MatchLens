
import app from "./app";
import dotenv from "dotenv";
dotenv.config();

const PORT : Number = process.env.PORT ? Number(process.env.PORT) : 8000;

app.listen(PORT, () => 
    console.log(`App API running on http://localhost:${PORT}`
));