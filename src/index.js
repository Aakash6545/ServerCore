import connectDB from "./db/index.js";
import 'dotenv/config'
import {app} from "./app.js";





connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error.message);
    process.exit(1);  
  });

