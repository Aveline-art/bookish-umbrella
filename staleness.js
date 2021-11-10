// Imports

// Globals


// main function
function analyze(issueNum, cutoffString) {
    const issue = new Issue(issueNum)
    // TODO
    const result = query()
}

class Issue {
    constructor(number, assignees=[], moments=[], linkedNum=null) {
        this.number = number
        this.assignees = assignees
        this.moments = moments
        this.linkedNum = linkedNum
    }

    addAssignee(assignee) {
        this.assignees.push(assignee)
    }

    addMoment(moment) {
        this.moments.push(moment)
    }
}

class Moment {
    constructor(date) {
        this.date = date // turn this to a date object
    }

    isMomentRecent(cutOff) {
        if (this.date >= cutOff) {
            return true
        } else {
            return false
        }
    }
}

class CommentMoment extends Moment {
    constructor(date, author) {
        super(date)
        this.author = author
    }

    isCommentByAssignees(assignees) {
        return assignees.includes(this.author)
    }
}


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

function isMomentRecent(dateString, cutoffString) {
    const dateStringObj = new Date(dateString);

    if (dateStringObj >= cutoffString) {
        return true
    } else {
        return false
    }
}