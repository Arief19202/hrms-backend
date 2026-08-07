const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "HRMS API",
        description: "HR Management System Backend API"
    },

    host: "localhost:3000",

    schemes: ["http"],

    securityDefinitions: {
        bearerAuth: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            description: "Enter JWT Bearer Token"
        }
    }
};

const outputFile = "./swagger-output.json";

const endpointsFiles = [
    "./src/app.js"
];

swaggerAutogen(outputFile, endpointsFiles, doc);