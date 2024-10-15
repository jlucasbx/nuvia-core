


export class UnauthorizedError extends Error{
    constructor(){
          super("Authentication token is missing or invalid. Please provide a valid token in the Authorization header.")
    }
}
