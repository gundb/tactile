function mkFunction(left, right, body) {
    return {type: 'function',
            left: left,
            right: right,
            body: body};
}
function mkBlock(body) {
    return {type: 'block',
            body: body};
}
function mkIf(test, ifTrue, ifFalse) {
    return {type: 'if',
            test: test,
            ifTrue: ifTrue,
            ifFalse: ifFalse};            
}
function mkExpression(expr) {
    return {type: 'expression',
            expression: expr};
}
function mkAssignment(target, expr) {
    return {type: 'assignment',
            target: target,
            expression: expr};
}
function mkLit(v) {
    return {type: 'literal', value: v};
}
function mkVar(name) {
    return {type: 'variable', name: name};
}
function mkOp(name) {
    return {type: 'operator', name: name};
}

var adding = mkBlock([mkExpression([mkVar('x'), mkOp('+'), mkLit(3), mkOp('-'), mkLit(1)])]);
var testing = mkIf([mkVar('x'), mkOp('<'), mkLit(50)],
                   'front', 'back');
var testDefs = {
    double: mkFunction('a', 'b', [mkExpression([mkVar('b'), mkOp('*'), mkLit(2)])]),
    front: mkBlock([mkExpression([mkLit(0), mkOp('double'), mkLit(3)])]),
    back: adding
};
function testme() {
    var env = {'x': 42};
    var state = evalBlock(adding, testDefs, env, null);
//    return state;
//    return trampoline(state);
    var state = evalBlock(mkBlock([testing]), testDefs, env, null);
    console.log('back', state);
    return trampoline(state);
}
