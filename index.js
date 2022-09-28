const core = require('@actions/core');
const github = require('@actions/github');
const openapiDiff = require('openapi-diff');
const fs = require('fs')

function main() {
    let baseFile = core.getInput('baseFile', {required: true});
    let headFile = core.getInput('headFile', {required: true});
    let githubToken = core.getInput('github_token', {required: true});

    return diffSpecs(baseFile, headFile)
    .catch((error) => comment(githubToken, error.message))
    .then((results) => {
        console.log(results);
        return results;
    })
    .then((result) => {
        comment(githubToken, markdownMessage(result))
    });
}

function diffSpecs(baseFile, headFile) {
    
    core.info(fs.readFileSync(baseFile, 'utf8'));
    core.info(fs.readFileSync(headFile, 'utf8'));

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

function comment(githubToken, message) {
    if (message.length === 0) {
        return;
    }

    const octokit = github.getOctokit(githubToken);
    let {owner, repo} = github.context.repo;

    if (core.getInput('repo')) {
        [owner, repo] = core.getInput('repo').split('/');
    }

    const issueNumber = github.context.issue.number;

    octokit.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body: message
    });
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
                msg += "| " + actionEmoji(item.code) + "| " + item.code + " | " + entity.location + " |\n";
            })
        }

        if (typeof item.destinationSpecEntityDetails !== "undefined") {
            item.destinationSpecEntityDetails.forEach(function (entity) {
                msg += "| " + actionEmoji(item.code) + "| " + item.code + " | " + entity.location + " |\n";
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

main()
    .then(r => {
    })
    .catch((error) => {
        console.log(error)
        core.setFailed(error.message);
    });