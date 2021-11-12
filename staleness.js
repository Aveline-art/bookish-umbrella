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

module.exports = { analyze }