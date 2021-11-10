// Imports
const core = require('@actions/core');
const github = require('@actions/github');
const repl = require('./repl');
const staleness = require('./staleness')

// Globals
const inputs = {
  // Required
  message: core.getInput('message'), // a string containing the message to comment
  myToken: core.getInput('myToken'), // a string containing the token, used only to verify octokit

  // Targets
  columns: parseStringToNums(core.getInput('columns')), // an array of numbers or null
  issueNumbers: parseStringToNums(core.getInput('issue-numbers')), // an array of numbers or null

  // Filters
  all: core.getInput('all') === 'true', // will be True if the string is 'true', else False
  labelString: core.getInput('label-string'), // a string that can be analyzed by repl
  staleDays: parseInt(core.getInput('stale-days')), // an integer or NaN 
  staleByAssignee: core.getInput('stale-by-assignee'), // a string
}

console.log(inputs)

const eventFunctions = {
  issues: issueFunction,
  pull_request: prFunction,
}

const octokit = github.getOctokit(inputs.myToken)
const payload = github.context.payload
const eventFunction = eventFunctions[github.context.eventName]

// main call
async function main() {
  try {
    const issueNumSet = new Set()

    // Part 1: Target Collection Functions
    await getIssueNumsFromColumns(inputs.columns, issueNumSet)
    getIssueNumsFromIssueNums(inputs.issueNumbers, issueNumSet)

    const issueNumArr = Array.from(issueNumSet)

    // Part 2: Logic Handler Functions
    if (issueNumArr.length > 0) {
      eventFunction(issueNumArr)
    } else {
      core.setFailed('No target found')
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

///////////////////////////////////////////
/// Part 1: Target Collection Functions ///
///////////////////////////////////////////

async function getIssueNumsFromColumns(columnIds, set) {
  if (columnIds) {
    for (const column of columnIds) {
      const result = getIssueNumsFromColumn(column)
      for await (const item of result) {
        set.add(item)
      }
    }
  }

  return set
}

function getIssueNumsFromIssueNums(issueNums, set) {
  if (issueNums) {
    issueNums.forEach(item => {
      set.add(item)
    })
  }

  return set
}


///////////////////////////////////////
/// Part 2: Logic Handler Functions ///
///////////////////////////////////////

function issueFunction(issueNumbers) {
  const issueLabels = payload.issue.labels.map(label => {
    return label.name
  })
  // needs to do something when all is false but there are no assignees, only labelString, aka, assume true unless there is an input to analyze
  if (inputs.all || repl.analyze(inputs.labelString, issueLabels)) {
    for (const num of issueNumbers) {
      postComment(num)
    }
  }
}

function prFunction(issueNumbers) {
  const prLabels = payload.pull_request.labels.map(label => {
    return label.name
  })
  if (inputs.all || repl.analyze(inputs.labelString, prLabels)) {
    for (const num of issueNumbers) {
      postComment(num)
    }
  }
}

/////////////////
/// API Calls ///
/////////////////

/**
 * Generator that returns issue numbers from cards in a column.
 * @param {Number} columnId the id of the column in GitHub's database
 * @returns an Array of issue numbers
 */
async function* getIssueNumsFromColumn(columnId) {
  let page = 1;
  while (page < 100) {
    try {
      const results = await octokit.rest.projects.listCards({
        column_id: columnId,
        per_page: 100,
        page: page
      });

      if (results.data.length) {
        for (let card of results.data) {
          if (card.hasOwnProperty('content_url')) {
            const arr = card.content_url.split('/');
            yield arr.pop()
          }
        }
      } else {
        return
      }
    } catch {
      continue
    } finally {
      page++;
    }
  }
}

function postComment(issueNumber) {
  try {
    octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: issueNumber,
      body: inputs.message,
    });
  } catch (error) {
    core.setFailed(error.message);
    core.setFailed(`Could not post a comment for issue number ${num}`)
  }
}

///////////////
/// Helpers ///
///////////////

function parseStringToNums(string, delimiter = ', ') {
  if (string) {
    const arr = string.split(delimiter)
    const results = []
    for (const item of arr) {
      const result = parseInt(item)
      if (result) {
        results.push(result)
      } else {
        core.setFailed(`${item} is not a number`)
      }
    }
    return results
  } else {
    return null
  }
}

function test(query) {
  const result = await octokit.graphql(query);
}

const query = 
`
{
    repository(owner: "Aveline-art", name: "bookish-umbrella") {
      issue(number: 112) {
        number
        assignees(first: 10) {
          nodes {
            login
          }
        }
        timelineItems(since: "2021-11-08T23:22:00.804Z" last:100) {
          nodes {
            ... on IssueComment {
              author {
                login
              }
              createdAt
            }
            ... on CrossReferencedEvent {
              createdAt 
              source {
                ... on PullRequest {
                  author {
                    login
                  }
                  number
                }
                ... on Issue {
                  author {
                    login
                  }
                  number
                }
              }
              willCloseTarget
            }
          }
        }
      }
    }
}  
`

test(query)

//main()