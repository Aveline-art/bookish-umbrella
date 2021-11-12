/**
 * Definition of Stale:
 *  1. The issue has assignees
 *  2. The issue was not recently assigned
 *  3. The issue was not recently linked with a pull request
 *  4. The issue was not commented recently by the assignees
 */

// main function
/**
 * 
 * @param {obj} data A key-value pair of various information, including issueNumber and recent timelineItems (as determined by a cutoff)
 * @returns whether or not an issue is stale
 */
function analyze(data) {
    console.log(data)
    const issue = new Issue(data.issue_number)
    issue.addAssignee(data.assignees)
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

    addAssignee(assignees) {
        this.assignees.concat(assignees)
    }

    addMoment(moment) {
        this.moments.push(moment)
    }

    isIssueStale() {
        if (this.linkedNum || !this.assignees.length) {
            return false
        }

        for (const moment of this.moments) {
            if (moment.constructor.name == 'CommentMoment') {
                if (moment.isCommentByAssignees(this.assignees)) {
                    return false
                }
            } else if (moment.constructor.name == 'AssignedMoment') {
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