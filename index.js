// Imports
const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");

// Globals
const nameToGreet = core.getInput('who-to-greet'); // `who-to-greet` input defined in action metadata file
const payload = JSON.stringify(github.context.payload, undefined, 2) // Get the JSON webhook payload for the event that triggered the workflow

function main() {
  try {
    console.log(`Hello ${nameToGreet}!`);

    const time = (new Date()).toTimeString();
    core.setOutput("time", time);

    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main()