// configurations.js
'use strict';

const logger = require('../logging_setup');
let fs = require('fs')

module.exports = class Configuration {

    constructor(conf_file){
        this.__conf_file = conf_file
        this.config = undefined
    }


    load()
    {        
        logger.info("Loading configuration data");

        try 
        {
            if (fs.existsSync(path)) 
            {
                let rawdata = fs.readFileSync(this.__conf_file, `utf8`);
                this.config = JSON.parse(rawdata);
            } 
            else 
            {
              console.log("File does not exist.")
            }
        } 
        catch(err) 
        {
            err = "Unable to load primary configuration " + str(e)
            logger.error(err)
        }
    }

    data(){
        return this.config;
    }
}