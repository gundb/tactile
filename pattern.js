/*Symbols, Actions, Data.

Symbols reference Data.

Symbol can be a reference a group of symbols.

X = 1
Y = 2
Z = 3

U = Y, Z
V = Z, W
W = X, Y, Z

J = U*/
var fs = require('fs')
, args = process.argv.slice(2);

var l = {};
l.data = {};
l.symbol = {};
l.action = {};
l.action['\n'] = l.action[' \n'] = l.action['\r\n'] = l.action[' \r\n'] = function(x,y){
	l.read(x);
}
l.action['('] = l.action[' ('] = l.action['( '] = l.action[' ( '] = function(x,y){
	l.read(x);
	l.read(y);
}
l.action[')'] = l.action[' )'] = l.action[') '] = l.action[' ) '] = function(x,y){
	l.read(x);
}
l.action['='] = l.action[' ='] = l.action['= '] = l.action[' = '] = function(x,y){
	l.symbol[l.read(x)] = l.read(y);
}
l.action['?'] = l.action[' ?'] = l.action['? '] = l.action[' ? '] = function(x,y){
	x = l.read(x);
	if(!x){
		l.act(l.step + 2);
	}
}
l.action['|'] = l.action[' |'] = l.action['| '] = l.action[' | '] = function(x,y){
}
l.has = function(symbol){
	if(l.symbol.hasOwnProperty(symbol)){
		return l.symbol[symbol];
	}
	return symbol;
}
l.step = 0;
l.read = function(x){
	return l.next(x||'', 0);
}
l.next = function(read, index){
	var left, right, stop, at, scan, minus, extend = '';
	scan = read.slice(0, index);
	Object.keys(l.action).some(function(act){
		var i = scan.indexOf(act);
		if(!(i + 1)){ return }
		at = i;
		stop = act;
		return 1;
	});
	if(stop){
		Object.keys(l.action).forEach(function(act){
			if(act.length <= stop.length){ return }
			var has = act.indexOf(stop);
			if(has + 1 && read.slice(0, index + (act.length - stop.length)).indexOf(act) + 1){
				extend = (extend.length < act.length)? act : extend;
			}
		});
		extend = extend || stop;
		minus = extend.indexOf(stop);
		stop = extend || stop;
		at = at - minus;
		l.left = left = read.slice(0, at);
		l.right = right = read.slice(at + stop.length);
		l.steps.push({l: left, a: stop, r: l.read(right)});
		/*
		console.log('stop'+stop+';');
		console.log('left');
		console.log('['+left+']');
		console.log('right');
		console.log('['+right+']');
		console.log('-------------------');
		*/
		//l.action[stop](left, right);
		return l.has(left);
	}
	if(read.length <= index){
		return l.has(read);
	}
	return l.next(read, index + 1);
}
l.run = function(x){
	l.read(x);
	l.steps = l.steps.reverse();
	l.act(0, l.steps)
}
l.act = function(index, steps){
	steps = steps || l.steps;
	index = index || 0;
	var step = steps[index];
	if(!step){
		return;
	}
	l.step = index;
	if(l.action[step.a]){
		l.action[step.a](step.l, step.r);
	}
	if(l.step === index){
		l.act(index + 1, steps);
	}
}
l.steps = [];

var file = fs.readFile(args[0]||'', function(e,file){
	if(e){
		l.run(args[0]);
	} else {
		l.run(file.toString());
	}
	
	console.log(l);
});
module.exports = l;