import multer, { Multer } from "multer"

let storage: Multer

export function connectStorage() {
    if (!storage) storage = multer({ dest: "./uploads" })
    return storage
}

export function getStorage(){
    if(!storage) throw new Error("Storage is not initialized")
    return storage
}
