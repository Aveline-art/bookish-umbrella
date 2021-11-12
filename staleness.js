// Imports

// Globals


// main function
function analyze(data) {
    const issue = new Issue(data.issue_number)
    issue.addAssignee(...data.assignees)
    for (const moment of data.timelineItems) {
        const type = moment.__typename
        if (type == 'IssueComment') {
            const commentMoment = new CommentMoment(moment.createdAt, moment.author.login)
            issue.addMoment(commentMoment)
        } else if (type == 'CrossReferencedEvent' || moment.willCloseTarget) {
            issue.linkedNum = moment.source.number
        }
    }

    return issue.isIssueStale()

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

    isIssueStale() {
        if (this.linkedNum) {
            return false
        }

        for (const moment of this.moments) {
            if (moment.name == "CommentMoment") {
                if (moment.isCommentByAssignees(this.assignees)) {
                    return false
                }
            }
        }

        return true
    }
}

class Moment {
    constructor(date) {
        this.date = date // turn this to a date object
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

class CrossReferencedEvent extends Moment {
    constructor(date) {
        super(date)
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