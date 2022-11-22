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
declare function e(): express.Express;

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
    type FetchUserAuthorization = () => UserAuthorization | Promise<UserAuthorization>;
    
    interface Express extends express.Express {

        initJWT(secret: string, signOpts?: SignOpts, verifyOpts?: VerifyOpts): undefined;

        /**
         * @param port http listen port
         */
        startServe: (port: number) => undefined;

        /**
         * @param key the key of fetched user authorizaton data appending to request
         * @param fn the function to fetch user authorizaton data
         */
        setUserAuth: (key: string, fn: FetchUserAuthorization) => undefined;

        /**
         * @param path directory of controllers
         */
        loadControllers: (path: string) => undefined;
    }
}

export = e;
