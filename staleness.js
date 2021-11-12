// Imports

// Globals


// main function
/**
 * 
 * @param {obj} data A key-value pair of various information, including issueNumber and timelineItems
 * @returns whether or not an issue is stale
 */
function analyze(data) {
    const issue = new Issue(data.issue_number)
    issue.addAssignee(...data.assignees)
    for (const moment of data.timelineItems) {
        const type = moment.__typename
        if (type == 'IssueComment') {
            const commentMoment = new CommentMoment(moment.createdAt, moment.author.login)
            issue.addMoment(commentMoment)
        } else if (type == 'CrossReferencedEvent' && moment.willCloseTarget) {
            issue.linkedNum = moment.source.number
        } else if (type == 'AssignedEvent' && moment.assignee.__typename == 'User') {
            const assignedMoment = new AssignedMoment(moment.createdAt, moment.assignee.login)
            issue.addMoment(assignedMoment)
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
            if (moment.name == 'CommentMoment') {
                if (moment.isCommentByAssignees(this.assignees)) {
                    return false
                }
            } else if (moment.name == 'AssignedMoment') {
                if (moment.isAssigneeInList(this.assignees)) {
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

class AssignedMoment extends Moment {
    constructor(date, assignee) {
        super(date)
        this.assignee = assignee
    }

    isAssigneeInList(assigneeList) {
        assigneeList.includes(this.assignee)
    }
}

class CrossReferencedEvent extends Moment {
    constructor(date) {
        super(date)
    }
}

module.exports = { analyze }