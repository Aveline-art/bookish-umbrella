function query(data) {
  const queryVariables = `{
    repository(owner: "${data.owner}", name: "${data.repo}") {
      issue(number: ${data.issue_number}) {
        assignees(first:10) {
          nodes {
            login
          }
        }
        labels {
          nodes {
            name
          }
        }
        number
        createdAt
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

module.exports = { query }