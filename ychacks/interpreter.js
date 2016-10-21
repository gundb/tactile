function assert(claim, plaint) {
    if (!claim)
        throw new Error(plaint);
}

function lookup(dict, key) {
    var value = dict[key];
    if (value === undefined)
        throw new Error("Missing key: " + key);
    return value;
}

function trampoline(state, trace) {
    var k, value, fn, fv;        // fv is short for 'free variable'
    k = state[0], value = state[1];
    if (trace) {
        while (k !== null) {
            whatsBouncing(k, value);
            if (k.length !== 3) throw new Error("bad cont!");
            fn = k[0], fv = k[1], k = k[2];
            state = fn(value, fv, k);
            k = state[0], value = state[1];        
        }
    } else {
        while (k !== null) {
            fn = k[0], fv = k[1], k = k[2];
            console.log('yo', value, fn, fv);
            if (typeof(fn) !== 'function') {
                console.log("Bad state", fn, fv, k);
                throw new Error("Not a function: " + fn);
            }
            state = fn(value, fv, k);
            k = state[0], value = state[1];        
        }
    }
    console.log('final value', value);
    return value;
}

function whatsBouncing(k, value) {
    console.log(':', value);
    while (k) {
        console.log(k[0], ' / ', k[1]);
        k = k[2];
    }
    console.log();
}



function evalBlock(block, defs, env, k) {
    assert(block.type === 'block', "Not a block");
    return evalChunks(block.body, defs, env, k);
}

function evalChunks(chunks, defs, env, k) {
    assert(0 < chunks.length, "Empty chunks");
    return evalChunk(chunks[0], defs, env,
                     1 === chunks.length ? k : [evalRestChunks, [chunks.slice(1), defs], k]);
}

function evalRestChunks(newEnv, fv, k) {
    assert(fv.length === 2, "Bad fv evalRestChunks");
    var chunks = fv[0], defs = fv[1];
    return evalChunks(chunks, defs, env, k);
}

function evalChunk(chunk, defs, env, k) {
    switch (chunk.type) {
    case 'if':
        return evalExpr(chunk.test, defs, env, [testK, [chunk, defs, env], k]);
    case 'expression':
        return evalExpr(chunk.expression, defs, env, [envResultK, env, k]);
    case 'assignment':
        return evalExpr(chunk.expression, defs, env, [assignK, [chunk.target, env], k]);
    default:
        throw new Error("Unknown chunk type");
    }        
}

function testK(value, fv, k) {
    assert(fv.length === 3, "Bad fv testK");
    var chunk = fv[0], defs = fv[1], env = fv[2];
    return evalBlock(lookup(defs, value ? chunk.ifTrue : chunk.ifFalse),
                     defs, env, k);
}

function envResultK(value, env, k) {
    return [k, extend(env, '$result', value)];
}

function extend(env, name, value) {
    var newEnv = Object.create(env);
    newEnv[name] = value;
    return newEnv;
}

function assignK(value, fv, k) {
    assert(fv.length === 2, "Bad fv assignK");
    var target = fv[0], env = fv[2];
    return [k, extend(env, target, value)];
}

function evalExpr(expr, defs, env, k) {
    assert(0 < expr.length, "Empty expr");
    return evalRestExpr(evalAtom(expr[0], env), expr.slice(1), defs, env, k);
}

function evalRestExpr(acc, atoms, defs, env, k) {
    if (atoms.length === 0) {
        return [k, acc];
    } else {
        assert(2 <= atoms.length, "Operator and rhs must come in pairs");
        var operator = atoms[0];
        assert(operator.type === 'operator', "Not an operator");
        assert(operator.name in defs || operator.name in primitives,
               "Undefined operator: " + operator.name);
        var right = evalAtom(atoms[1], env);
        var restAtoms = atoms.slice(2);
        assert(typeof(defs) === 'object', "Defs must be an object");
        if (operator.name in defs) {
            return evalCall(acc, operator.name, right, defs, [evalRestK, [restAtoms, defs, env], k]);
        } else {
            return evalRestExpr(evalPrim(acc, operator.name, right),
                                restAtoms, defs, env, k);
        }
    }
}

function evalRestK(value, fv, k) {
    assert(fv.length === 3, "Bad fv evalRestK");
    var atoms = fv[0], defs = fv[1], env = fv[2];
    return evalRestExpr(value, atoms, defs, env, k);
}

var primitives = {
    '+': function(a, b) { return a + b; },
    '-': function(a, b) { return a - b; },
    '*': function(a, b) { return a * b; },
    '/': function(a, b) { return a / b; }, // XXX check for divide-by-0
    '=': function(a, b) { return a === b; },
    '<': function(a, b) { return a < b; },
};

function evalPrim(left, operator, right) {
    return primitives[operator](left, right);
}

function evalCall(left, operator, right, defs, k) {
    var def = lookup(defs, operator);
    assert(def.type === 'function', "Def must be a function");
    var env = {};
    env[def.left] = left;
    env[def.right] = right;
    return evalChunks(def.body, defs, env, [unpackResultK, null, k]);
}

function unpackResultK(value, fv, k) {
    assert(fv === null, "Bad fv unpackResultK");
    return [k, lookup(value, '$result')]; // XXX uh, right?
}

function evalAtom(atom, env) {
    switch (atom.type) {
    case 'literal':
        return atom.value;
    case 'variable':
        return lookup(env, atom.name);
    default:
        throw new Error("Wrong atom type");
    }
}
