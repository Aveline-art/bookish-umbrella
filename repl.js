// Imports

// Globals
DELIMITERS = Array.from(' \n\t\r')
STRINGCHAR = Array.from('"\'')
SYMBOLCHAR = Array.from('()[]{}')

function main(s, arr) {
    const interpreter = new Interpreter('bad or "disaster and horrible"')
    const analyzer = new Analyzer(interpreter.tokenize(), ['disaster and horrible', 'horrible'])
    console.log('answer', analyzer.analyze())
}


class Interpreter {
    constructor(src) {
        this.src = src
    }

    tokenize() {
        return this.#tokenize(this.src.split(''))
    }

    #tokenize(src, store = []) {
        if (src.length <= 0) {
            return store
        } else {
            const next = this.#findNextToken(src)
            store.push(next)
            return this.#tokenize(src, store)
        }
    }

    #findNextToken(src, store = []) {
        if (src.length <= 0) {
            return store.join('')
        }

        const first = src[0]
        if (DELIMITERS.includes(first)) {
            src.shift()
            return store.join('') || this.#findNextToken(src, store)
        } else if (STRINGCHAR.includes(first)) {
            const stopChar = src.shift()
            var nextChar = src.shift()
            while (nextChar != stopChar) {
                store.push(nextChar)
                nextChar = src.shift()
            }
            return store.join('')
        } else if (SYMBOLCHAR.includes(first)) {
            return store.join('') || src.shift()
        } else if (!SYMBOLCHAR.includes(first)) {
            store.push(src.shift())
        }
        return this.#findNextToken(src, store)
    }
}

class Analyzer {
    constructor(tokens, arr) {
        this.tokens = tokens
        this.arr = arr
        this.builtins = {
            'and': (context) => this.#and.bind(context),
            'or': (context) => this.#or.bind(context),
            'not': (context) => this.#not.bind(context),
        }
        this.parens = {
            '(': ')',
            '[': ']',
            '{': '}',
        }
    }

    analyze() {
        const src = [...this.tokens]
        return this.#analyze(src)
    }

    #analyze(src, last = null) {
        console.log('analysis', src, last)
        if (src.length <= 0) {
            return last
        }
        const first = src.shift()
        const builtin = this.builtins[first]
        const parens = this.parens[first]
        if (builtin) {
            const result = builtin(this)(src, last)
            return result
        } else if (parens) {
            const subSrc = this.#findCloseParen(this.parens[first], src)
            const result = subSrc.length ? this.#analyze(subSrc) : false
            return this.#analyze(src, result)
            // TODO take everything utill reachin the close parens
        } else {
            const result = this.#sentence(first)
            return this.#analyze(src, result)
        }
    }

    #sentence(val) {
        return this.arr.includes(val)
    }

    #and(src, last) {
        console.log('and', src, last)
        if (last === null) {
            throw new SyntaxError()
        }

        if (last === true) {
            return this.#analyze(src)
        } else if (last === false) {
            const first = src.shift()
            const builtin = this.builtins[first]
            const parens = this.parens[first]
            if (builtin) {
                throw new SyntaxError()
            } else if (parens) {
                this.#findCloseParen(parens, src)
            }
            return this.#analyze(src, last)
        }
    }

    #or(src, last) {
        console.log('or', src, last)
        if (last === null) {
            throw new SyntaxError()
        }

        if (last === true) {
            const first = src.shift()
            const builtin = this.builtins[first]
            const parens = this.parens[first]
            if (builtin) {
                throw new SyntaxError()
            } else if (parens) {
                this.#findCloseParen(parens, src)
            }
            return this.#analyze(src, last)
        } else if (last === false) {
            return this.#analyze(src)
        }
    }

    #not(src) {
        console.log('not', src)
        return !this.#analyze(src)
    }

    #findCloseParen(closeParen, src, store=[]) {
        const first = src.shift()
        if (first == closeParen) {
            return store
        } else {
            store.push(first)
            return this.#findCloseParen(closeParen, src, store)
        }
    }
}

class SyntaxError extends Error {
    constructor(foo = 'bar', ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params)

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SyntaxError)
        }

        this.name = 'SyntaxError'
        // Custom debugging information
        this.foo = foo
        this.date = new Date()
    }
}

main()

module.exports = { main, Interpreter }