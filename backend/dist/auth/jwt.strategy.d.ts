import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
export type JwtPayload = {
    sub: number;
    username: string;
    role: string;
};
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    validate(payload: JwtPayload): Promise<User>;
}
export {};
