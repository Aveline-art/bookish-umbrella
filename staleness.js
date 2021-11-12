// Imports

// Globals


// main function
function analyze(issueNum, timeline, cutoffString) {
    const issue = new Issue(issueNum)

}

class Issue {
    constructor(number, assignees = [], moments = [], linkedNum = null) {
        this.number = number
        this.assignees = assignees
        this.moments = moments
        this.linkedNum = linkedNum
    }

    addAssignee(...assignees) {
        this.assignees.push(assignees)
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


/**
 * Generator that returns the timeline of an issue.
 * @param {Number} issueNum the issue's number 
 * @returns an Array of Objects containing the issue's timeline of events
 */
async function* getTimeline(issueNum) {
    let page = 1
    while (page < 100) {
        try {
            const results = await octokit.rest.issues.listEventsForTimeline({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issueNum,
                per_page: 100,
                page: page,
            });

            if (results.data.length) {
                yield* results.data
            } else {
                return
            }
        } catch {
            continue
        }
        finally {
            page++
        }
    }
}