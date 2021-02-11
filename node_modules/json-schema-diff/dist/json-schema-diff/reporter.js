"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Reporter {
    constructor(wrappedLog) {
        this.wrappedLog = wrappedLog;
    }
    static getAddedValuesMessage(schema) {
        return `Values described by the following schema were added:\n${JSON.stringify(schema, null, 4)}`;
    }
    static getRemovedValuesMessage(schema) {
        return `Values described by the following schema were removed:\n${JSON.stringify(schema, null, 4)}`;
    }
    static getAddedAndRemovedValuesMessage(diffResult) {
        return `${Reporter.getAddedValuesMessage(diffResult.addedJsonSchema)}\n\n` +
            `${Reporter.getRemovedValuesMessage(diffResult.removedJsonSchema)}`;
    }
    reportError(error) {
        this.wrappedLog.error(error);
    }
    reportNoDifferencesFound() {
        this.wrappedLog.info('No differences found');
    }
    reportFailureWithBreakingChanges(diffResult) {
        const output = 'Breaking changes found between the two schemas.\n\n' +
            `${Reporter.getAddedAndRemovedValuesMessage(diffResult)}`;
        this.wrappedLog.error(output);
    }
    reportNonBreakingChanges(diffResult) {
        const output = 'Non-breaking changes found between the two schemas.\n\n' +
            `${Reporter.getAddedAndRemovedValuesMessage(diffResult)}`;
        this.wrappedLog.info(output);
    }
}
exports.Reporter = Reporter;
