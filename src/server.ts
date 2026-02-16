import app from "./app";
import { prisma } from "./lib/prisma"
const PORT = process.env.PORT
async function server() {

    try {

        await prisma.$connect();
        console.log("Connected to the database succesfully");
        app.listen(PORT, () => {
            console.log(`Newspress server  is running on port ${PORT}`)
        });
    }

    catch (err) {
        console.error("An occured error:", err);
        await prisma.$disconnect();
        process.exit(1);
    }

}

server();