const openapiDiff = require('openapi-diff');
const fs = require('fs');

var baseFile = 'C:/dev/source/base/swagger.json';
var headFile = 'C:/dev/source/base/swagger.json';

function diffSpecs(baseFile, headFile) {
    return openapiDiff
        .diffSpecs({
            sourceSpec: {
                content: fs.readFileSync(baseFile, 'utf8'),
                format: 'openapi3'
            },
            destinationSpec: {
                content: fs.readFileSync(headFile, 'utf8'),
                format: 'openapi3'
            }
        })
}

/**
 * Converts diff results into a markdown message to post in pr
 * @param openApiResults
 * @returns {string}
 */
 function markdownMessage(openApiResults) {
    let breaking = openApiResultsTable(openApiResults.breakingDifferences);
    if (breaking.length > 0) {
        breaking =
            "#### :rotating_light: Breaking Api Changes \n" +
            "|             | Action | Path |\n" +
            "|-------------|--------|------|\n"
            + breaking;
    }

    let nonBreaking = openApiResultsTable(openApiResults.nonBreakingDifferences);
    if (nonBreaking.length > 0) {
        nonBreaking =
            "#### :heavy_check_mark: Api Changes \n" +
            "|             | Action | Path |\n" +
            "|-------------|--------|------|\n"
            + nonBreaking;
    }

    if (breaking.length > 0 || nonBreaking.length > 0) {
        return "## OpenApi Specification changes \n\n" 
        + breaking + "\n\n"
        + nonBreaking;
    }

    return "## OpenApi Specification changes \n\n" + "#### :rocket: There are no API Changes in this PR";
}

/**
 * Generates table rows
 * @returns {boolean}
 */
function openApiResultsTable(changes) {
    let msg = "";

    if (typeof changes === "undefined") {
        return "";
    }

    changes.forEach(function (item) {
        if (typeof item.sourceSpecEntityDetails !== "undefined") {
            item.sourceSpecEntityDetails.forEach(function (entity) {
                msg += "| " + actionEmoji(item.code) + "| " + item.code + " | " + entity.location + " |";
            })
        }

        if (typeof item.destinationSpecEntityDetails !== "undefined") {
            item.destinationSpecEntityDetails.forEach(function (entity) {
                msg += "| " + actionEmoji(item.code) + "| " + item.code + " | " + entity.location + " |";
            })
        }
    })

    return msg;
}

/**
 * Gets a emoji to reflect level of change
 * @param code - change code
 * @returns {string}
 */
function actionEmoji(code) {
    // :zap:
    switch (code) {
        case "method.remove":
        case "path.remove":
            return ":collision:";
        case "method.add":
            return ":heavy_plus_sign:";
        case "path.add":
            return ":sparkles:";
        default:
            return ":question:";
    }
}

diffSpecs(baseFile, headFile)
.then((results) => {
    console.log(results);
    return results;
})
.then((result) => console.log(markdownMessage(result)));