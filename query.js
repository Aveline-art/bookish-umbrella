function queryIssue(data) {
  const queryVariables = `
    {
      repository(owner: "${data.owner}", name: "${data.repo}") {
        issue(number: ${data.issue_number}) {
          assignees(first: 10) {
            nodes {
              login
            }
          }
          labels(first:100) {
            nodes {
              name
            }
          }
          number
          createdAt
          author {
            login
          }
          timelineItems(since: "${data.since}", last: 100) {
            nodes {
              __typename
              ... on CrossReferencedEvent {
                createdAt
                source {
                  ... on PullRequest {
                    author {
                      login
                    }
                    number
                    createdAt
                  }
                }
                willCloseTarget
              }
              ... on Comment {
                createdAt
                author {
                  login
                }
              }
            }
          }
        }
      }
    }
  `

  return queryVariables
}

function queryPr(data) {
  const queryVariables = `
  {
    repository(owner: "${data.owner}", name: "${data.repo}") {
      pullRequest(number: ${data.pull_number}) {
        assignees(first: 10) {
          nodes {
            login
          }
        }
        labels(first:100) {
          nodes {
            name
          }
        }
        number
        createdAt
        author {
          login
        }
        timelineItems(since: "${data.since}", last: 100) {
          nodes {
            __typename
            ... on CrossReferencedEvent {
              createdAt
              source {
                ... on PullRequest {
                  author {
                    login
                  }
                  number
                  createdAt
                }
              }
              willCloseTarget
            }
            ... on Comment {
              createdAt
              author {
                login
              }
            }
          }
        }
      }
    }
  }  
  `

  return queryVariables
}

module.exports = { queryIssue, queryPr }