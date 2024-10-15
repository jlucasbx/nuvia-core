import { App } from "@app"
import { getEnv } from "@utils/get-env"
const { PORT } = getEnv()
/* eslint-disable no-console */

async function main() {
    const app = await App()
    app.listen(PORT, () => {
        console.log(`Server is listen on port ${PORT}!!!`)
    })
}

main()
