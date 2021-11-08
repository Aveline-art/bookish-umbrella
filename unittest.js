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
const a2 = ['dependency', 'bug']
const a3 = ['enhancement']
const a4 = ['enhancement', 'invalid']
const a5 = ['enhancement']
const a6 = ['good first issue']

function tests() {
    test(() => testInterpreter(s1), ['dependency', 'and', 'not', 'bug'])
    test(() => testInterpreter(s2), ['(', 'bug', 'and', 'dependency', ')', 'or', '(', 'enhancement', 'and', 'invalid', ')'])
    test(() => testInterpreter(s3), ['not', '(', 'bug', 'and', 'dependency', ')'])
    test(() => testInterpreter(s4), ['not', 'bug'])
    test(() => testInterpreter(s5), ['bug', 'and', 'dependency', 'or', 'enhancement'])
    test(() => testInterpreter(s6), ['good first issue', 'and', '(', 'invalid', 'or', 'help wanted', ')'])
    
    test(() => testInterpreter(e1), ['dependency', 'and', 'and', 'bug'])
    test(() => testInterpreter(e2), ['(', '(', 'bug', 'and', 'dependency', ')', 'or', '(', 'enhancement', 'and', 'invalid', ')'])
    test(() => testInterpreter(e3), ['not', 'and', 'bug'])
    test(() => testInterpreter(e4), ['not'])

    test(() => testAnalyzer(s1, a1), false)
    test(() => testAnalyzer(s2, a2), true)
    test(() => testAnalyzer(s3, a3), true)
    test(() => testAnalyzer(s4, a4), true)
    test(() => testAnalyzer(s5, a5), true)
    test(() => testAnalyzer(s6, a6), false)

    test(() => testAnalyzer(e1, a1), 'error')
    test(() => testAnalyzer(e2, a1), 'error')
    test(() => testAnalyzer(e3, a1), 'error')
    test(() => testAnalyzer(e4, a1), 'error')
}

function test(func, expected) {
    const result = func()
    console.log('Expected', expected)
    console.log('Got', result)
    console.log('')
}

function testInterpreter(s) {
    try {
        const interpreter = new repl.Interpreter(s)
        return interpreter.tokenize()
    } catch(error) {
        console.error('This gave an error')
    }
}

function testAnalyzer(s, a) {
    try {
        const interpreter = new repl.Interpreter(s)
        const analyzer = new repl.Analyzer(interpreter.tokenize(), a)
        return analyzer.analyze()
    } catch(error) {
        console.error('This gave an error')
    }
}

tests()