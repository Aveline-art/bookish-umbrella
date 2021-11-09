// Imports
const core = require('@actions/core');
const github = require('@actions/github');
const repl = require('./repl');

// Globals

const inputs = {
  all: core.getInput('all') === 'true', // will be True if the string is 'true', else False
  columns: parseStringToNums(core.getInput('column')), // an array of numbers or null
  issueNumbers: parseStringToNums(core.getInput('issue-numbers')), // an array of numbers or null
  labelString: core.getInput('label-string'), // a string that can be analyzed by repl
  myToken: core.getInput('myToken'), // a string containing the token, used only to verify octokit
  message: core.getInput('message'), // a string containing the message to comment
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

    if (inputs.columns) {
      (await getIssueNumsFromColumns(inputs.columns)).forEach(item => {
        issueNumSet.add(item)
      })
    }

    if (inputs.issueNumbers) {
      inputs.issueNumbers.forEach(item => {
        issueNumSet.add(item)
      })
    }

    const issueNumArr = Array.from(issueNumSet)

    if (issueNumArr.length > 0) {
      eventFunction(issueNumArr)
    } else {
      core.setFailed('No target found')
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}


///////////////////////////////
/// Logic Handler Functions ///
///////////////////////////////

function issueFunction(issueNumbers) {
  const issueLabels = payload.issue.labels.map(label => {
    return label.name
  })
  // needs to do something when all is false but there are no assignees, only labelString, aka, assume true unless there is an input to analyze
  if (inputs.all || repl.analyze(inputs.labelString, issueLabels)) {
    postComment(issueNumbers)
  }
}

function prFunction(issueNumbers) {
  const prLabels = payload.pull_request.labels.map(label => {
    return label.name
  })
  if (inputs.all || repl.analyze(inputs.labelString, prLabels)) {
    postComment(issueNumbers)
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

function postComment(issueNumbers) {
  for (const num of issueNumbers) {
    try {
      octokit.rest.issues.createComment({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issue_number: num,
        body: inputs.message,
      });
    } catch (error) {
      core.setFailed(error.message);
      core.setFailed(`Could not post a comment for issue number ${num}`)
    }
  }
}

///////////////
/// Helpers ///
///////////////

async function getIssueNumsFromColumns(columnIds) {
  const set = new Set()

  for (const column of columnIds) {
    const result = getIssueNumsFromColumn(column)
    result.forEach(item => {
      set.add(item)
    })
  }

  return Array.from(set)
}

function parseStringToNums(string, delimiter = ', ') {
  console.log(string)
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

main()