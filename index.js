const core = require('@actions/core');
const github = require('@actions/github');
const openapiDiff = require('openapi-diff');
const fs = require('fs')

try {
    let baseFile = core.getInput('baseFile', {required: true});
    let headFile = core.getInput('headFile', {required: true});
    let githubToken = core.getInput('github_token', {required: true});

    diffSpecs(githubToken, baseFile, headFile);

} catch (error) {
    console.log(error)
    core.setFailed(error.message);
}

function diffSpecs(githubToken, baseFile, headFile) {
    openapiDiff
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
        .catch((error) => comment(githubToken, error.message))
        .then((result) => comment(githubToken, markdownMessage(result)))
}

function comment(githubToken, message) {
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

function markdownMessage(openApiResults) {
    let msg = "## OpenApi Specification changes \n\n";

    if (typeof openApiResults.breakingDifferences !== "undefined") {
        msg += "#### :rotating_light: Breaking Api Changes \n";
        msg += "|             | Action | Path |\n";
        msg += "|-------------|--------|------|\n";

        openApiResults.breakingDifferences.forEach(function (item) {
            item.sourceSpecEntityDetails.forEach(function (entity) {
                msg += "| " + actionEmoji(item.code) + "| " + item.code + " | " + entity.location + " |";
            })
            item.destinationSpecEntityDetails.forEach(function (entity) {
                msg += "| " + actionEmoji(item.code) + "| " + item.code + " | " + entity.location + " |";
            })
        })
    }

    if (typeof openApiResults.nonBreakingDifferences !== "undefined") {
        msg += "#### :heavy_check_mark: Api Changes \n";
        msg += "|             | Action | Path |\n";
        msg += "|-------------|--------|------|\n";

        openApiResults.nonBreakingDifferences.forEach(function (item) {
            item.sourceSpecEntityDetails.forEach(function (entity) {
                msg += "| " + actionEmoji(item.code) + "| " + item.code + " | " + entity.location + " |";
            })
            item.destinationSpecEntityDetails.forEach(function (entity) {
                msg += "| " + actionEmoji(item.code) + "| " + item.code + " | " + entity.location + " |";
            })
        })
    }

    return msg;
}

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