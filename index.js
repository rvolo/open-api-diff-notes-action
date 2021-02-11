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
    openapiDiff.diffSpecs({
        sourceSpec: {
            content: fs.readFileSync(baseFile, 'utf8'),
            format: 'openapi3'
        },
        destinationSpec: {
            content: fs.readFileSync(headFile, 'utf8'),
            format: 'openapi3'
        }
    }).then((result) => {
        comment(githubToken, result)
    })
}

function comment(githubToken, openApiResults) {
    let message = markdownMessage(openApiResults);

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
    let msg = "";

    if (openApiResults.breakingDifferences.length !== 0) {
        msg += "##BREAKING API CHANGES\n";
        msg += "| Action | Path |\n";
        msg += "|--------|------|\n";

        openApiResults.breakingDifferences.forEach(function (item) {
            item.sourceSpecEntityDetails.forEach(function (entity){
                msg += "| " + item.action + " | "+ entity.location+ " |";
            })
        })
    }

    if (openApiResults.nonBreakingDifferences.length !== 0) {
        msg += "##NON BREAKING API CHANGES\n";
        msg += "| Action | Path |\n";
        msg += "|--------|------|\n";

        openApiResults.nonBreakingDifferences.forEach(function (item) {
            item.sourceSpecEntityDetails.forEach(function (entity){
                msg += "| " + item.code + " | "+ entity.location+ " |";
            })
        })
    }

    return msg;
}