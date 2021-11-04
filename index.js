// Imports
const core = require('@actions/core');
const github = require('@actions/github');

// Globals
//const myToken = core.getInput('myToken');
//const octokit = github.getOctokit(myToken)
const nameToGreet = core.getInput('who-to-greet');
const payload = JSON.stringify(github.context.payload, undefined, 2)
const eventName = JSON.stringify(github.context.eventName)

function main() {
  try {
    if (eventName == 'issues') {
      // Do something
    } else if (eventName == 'pull_request') {
      // Do something else
    }

    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main()