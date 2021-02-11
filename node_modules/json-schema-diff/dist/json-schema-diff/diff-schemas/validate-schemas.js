"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ajv = require("ajv");
// tslint:disable-next-line:no-var-requires no-submodule-imports
const jsonSchemaDraft7Schema = require('json-schema-spec-types/lib/json-schema-draft-07-schema');
const validateJsonSchema = (schema) => {
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchemaDraft7Schema);
    const valid = validate(schema);
    if (valid) {
        return { isValid: true };
    }
    return {
        failureReason: ajv.errorsText(validate.errors || undefined),
        isValid: false
    };
};
exports.validateSchemas = (sourceSchema, destinationSchema) => {
    const sourceSchemaValidationResult = validateJsonSchema(sourceSchema);
    if (!sourceSchemaValidationResult.isValid) {
        return Promise.reject(new Error(`Source schema is not a valid json schema: ${sourceSchemaValidationResult.failureReason}`));
    }
    const destinationSchemaValidationResult = validateJsonSchema(destinationSchema);
    if (!destinationSchemaValidationResult.isValid) {
        return Promise.reject(new Error(`Destination schema is not a valid json schema: ${destinationSchemaValidationResult.failureReason}`));
    }
    return Promise.resolve();
};
