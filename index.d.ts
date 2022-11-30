// modified from express

/* =================== USAGE ===================

    import express = require("express");
    var app = express();

 =============================================== */

/// <reference types="express" />

import * as express from 'express';
import { SignOptions, VerifyOptions } from 'jsonwebtoken'
/**
 * Creates an Express application. The express() function is a top-level function exported by the express module.
 */
declare namespace e {
    type SignOpts = SignOptions;
    type VerifyOpts = {
        /**
         * Allows to customize the name of the property in the request object
         * where the decoded payload is set.
         * @default 'auth'
         */
        requestProperty?: string;
    } & VerifyOptions;

    interface UserAuthorization {
        isAdmin: boolean;
        roles?: Array<string>;
        permissions?: Array<string>;
    }

    interface Express extends express.Express {

        /**
         * The jwt is required by the controller's implementation, and thus need to be initiallized from the app
         * The default algorithm is HS256
         * @param secret
         * @param signOpts the sign options supported by jsonwebtoken, such as `expiresIn`
         * @param verifyOpts the verify options supported by express-jwt, such as `requestProperty`
         * */
        initJWT(secret: string, signOpts?: SignOptions, verifyOpts?: VerifyOpts): undefined;

        /**
         * The jwt sign method to get a token. Use the default sign options from `initJWT` and merged with the options provided.
         * @param payload 
         * @param signOpts 
         */
        jwtSign(payload: string | Buffer | object, signOpts?: SignOpts): string;

        /**
         * @param port http listen port
         */
        startServe: (port: number) => undefined;

        /**
         * @param key the key of fetched user authorizaton data appending to request
         * @param fn the function to fetch user authorizaton data. the in param `jwtAuth` is the decoded data from jwt
         */
        setUserAuth: (key: string, fn: (jwtAuth: object) => UserAuthorization | Promise<UserAuthorization>) => undefined;

        /**
         * @param path directory of controllers
         */
        loadControllers: (path: string) => undefined;
    }
}
declare function e(): e.Express;

export = e;
