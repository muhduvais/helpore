import { JwtPayload } from "jsonwebtoken";


export interface TokenPayload extends JwtPayload {
    email: string;
}