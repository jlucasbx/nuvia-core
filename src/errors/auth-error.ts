
export class AuthError extends Error{
    constructor() {
        super("Login failed. Please check your username and password and try again.")
    }
}
