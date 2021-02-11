const core = require('@actions/core');
const github = require('@actions/github');
const openapiDiff = require('openapi-diff');
const fs = require('fs')

async function run(): Promise<void> {
    try {
        const issueNumber = github.context.issue.number;

        let baseFile = core.getInput('baseFile', {required: true});
        let headFile = core.getInput('headFile', {required: true});
        let githubToken = core.getInput('github_token', {required: true});

        const result = openapiDiff.diffSpecs({
            sourceSpec: {
                content: fs.readFileSync(baseFile, 'utf8'),
                format: 'openapi3'
            },
            destinationSpec: {
                content: fs.readFileSync(headFile, 'utf8'),
                format: 'openapi3'
            }
        });
        let resultsJson = JSON.stringify(result);

        const octokit = github.getOctokit(githubToken);
        let {owner, repo} = github.context.repo;
        if (core.getInput('repo')) {
            [owner, repo] = core.getInput('repo').split('/');
        }
        await octokit.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            resultsJson
        });

    } catch (error) {
        console.log(error)
        core.setFailed(error.message);
    }
}

run();