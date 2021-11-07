const main = require('./repl');

const s1 = 'dependency and not bug'
const s2 = '(bug and dependency) or (enhancement and invalid)'
const s3 = 'not (bug and dependency)'
const s4 = 'not bug'
const s5 = 'bug and dependency or enhancement'
const s6 = `"good first issue" and ('invalid' or 'help wanted')`

const a1 = ['dependency', 'bug']
const a2 = ['dependency', 'invalid']
const a3 = ['enhancement']
const a4 = ['enhancement', 'invalid']

function testInterpreter(s, a) {
    const interpreter = new main.Interpreter(s, a)
    const tokens = interpreter.tokenize()
    console.log(tokens)
}

function tests() {
    testInterpreter(s1, a1)
    testInterpreter(s2, a1)
    testInterpreter(s3, a1)
    testInterpreter(s4, a1)
    testInterpreter(s5, a1)
    testInterpreter(s6, a1)
}

tests()