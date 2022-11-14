# open-api-diff-notes-action

  Diff 2 different OpenApi files and post results in PR

## Inputs
- baseFile: path to base openapi file' (required)
- headFile: path to head openapi file' (required)
- github_token: 'token to create comment with' (required)
- repo: The owner and repository name. (e.g. Codertocat/Hello-World)

## Outputs

- breaking: "true" if there was a breaking change
