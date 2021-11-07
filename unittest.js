const repl = require('./repl');

const s1 = 'dependency and not bug'
const s2 = '(bug and dependency) or (enhancement and invalid)'
const s3 = 'not (bug and dependency)'
const s4 = 'not bug'
const s5 = 'bug and dependency or enhancement'
const s6 = `"good first issue" and ('invalid' or 'help wanted')`

const e1 = 'dependency and and bug'
const e2 = '((bug and dependency) or (enhancement and invalide)'
const e3 = 'not and bug'
const e4 = 'not'

const a1 = ['dependency', 'bug']
const a2 = ['dependency', 'invalid']
const a3 = ['enhancement']
const a4 = ['enhancement', 'invalid']

function testInterpreter(s, a) {
    try {
        const interpreter = new repl.Interpreter(s)
        const analyzer = new repl.Analyzer(interpreter.tokenize(), a)
        console.log('answer', analyzer.analyze())
    } catch(error) {
        console.error('This gave an error')
    }
}

function tests() {
    testInterpreter(s1, a1)
    testInterpreter(s2, a1)
    testInterpreter(s3, a1)
    testInterpreter(s4, a1)
    testInterpreter(s5, a1)
    testInterpreter(s6, a1)

    testInterpreter(e1, a1)
    testInterpreter(e2, a1)
    testInterpreter(e3, a1)
    testInterpreter(e4, a1)
}

tests()