// Imports
const core = require('@actions/core');
const github = require('@actions/github');
const { query } = require('./query');
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
  staleByAssignee: core.getInput('stale-by-assignee') === 'true', // will be True if the string is 'true', else False
}

console.log(inputs)

const eventFunctions = {
  issues: issueFunction,
  pull_request: prFunction,
}

const octokit = github.getOctokit(inputs.myToken)
const payload = github.context.payload
const eventFunction = eventFunctions[github.context.eventName]
const owner = payload.repository.owner.login
const repo = payload.repository.name
const cutOffTimeStale = new Date()
cutOffTimeStale.setDate(cutOffTimeStale.getDate() - inputs.staleDays) 

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

async function issueFunction(issueNums) {
  console.log(cutOffTimeStale)
  for (const issueNum of issueNums) {
    const result = await octokit.graphql(query({
      owner: owner,
      repo: repo,
      issue_number: issueNum,
      since: cutOffTimeStale.toISOString()
    }));

    const issueLabels = result.repository.issue.labels.nodes.map(label => {
      return label.name
    })
    const labelAnalysis = inputs.labelString ? repl.analyze(inputs.labelString, issueLabels) : true
  
    const timelineItems = result.repository.issue.timelineItems.nodes
    const timelineAnalysis = inputs.staleDays ? staleness.analyze(issueNum, timelineItems, cutOffTimeStale) : true

    if (labelAnalysis && timelineAnalysis) {
      postComment(num)
    }
  }
}

function prFunction(issueNums) {
  /*
  const prLabels = payload.pull_request.labels.map(label => {
    return label.name
  })

  const labelAnalysis = inputs.labelString? repl.analyze(inputs.labelString, prLabels) : true

  if (inputs.all || repl.analyze(inputs.labelString, prLabels)) {
    for (const num of issueNums) {
      postComment(num)
    }
  }
  */
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

function postComment(issueNum) {
  try {
    octokit.rest.issues.createComment({
      owner: owner,
      repo: repo,
      issue_number: issueNum,
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

main()