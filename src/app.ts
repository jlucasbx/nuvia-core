import express from "express"
import { loadRouterHandlers } from "@utils/load-route-handler"
import { connectDatabase } from "@utils/connect-database"
import { connectStorage } from "@utils/connect-storage"
import cors from "cors"

export async function App() {
    const app = express()
    app.use(cors())
    connectStorage()
    await loadRouterHandlers(app)
    await connectDatabase()
    return app
}
