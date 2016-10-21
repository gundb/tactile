;$(function(){
	var ux = {}, top = {}, a = theory;
	top.main = {};
	
	ux['code-step-next'] = function(e, on){
		return $('.model .code-step').first().add('.model .code-step-next').clone().insertAfter(on);
	}
	ux['code-step'] = function(e, on){
		var instruct = on.find('.step-instruct').last();
		if(!instruct.length){
			instruct = $('.model .step-instruct').first().clone().prependTo(on);
		}
		return ux['step-instruct'](e, instruct);
	}
	ux['step-instruct'] = function(e, on){
		e.stopPropagation();
		$('.code-active').removeClass('code-active');
		on.addClass('code-active'); //.closest('.code-step').addClass('code-active');
		ux.on = on;
	}
	ux['code-result'] = function(){
		var steps = $('.code .sub .code-step');
		var context = {};
		steps.each(function(){
			if(context.left){
				if(context.action){
					context.right = context.right || $(this).data('dar-lit');
				} else {
					context.action = context.action || $(this).data('dar-act');
				}
			} else {
				context.left = context.left || $(this).data('dar-lit');
			}
		});
		context.action = $.trim(context.action);
		console.log(context.left, context.action, context.right);
		var result = makeApp1(mkCall(context.left, '$' + context.action), context.right);
		console.log('result', result);
		var eval = evaluate(result, {}, null);
		console.log('eval', eval);
		var done = trampoline(eval);
		console.log('done', done);
		$('.code .code-result').text(done);
	}
	
	ux['category'] = function(e, on){
	}
	
	ux['data-number'] = function(e, on){
		if(!ux.on || !ux.on.length){ return }
		var self = ux['data-number'].prev, val, dat;
		if(self && self.$0 === ux.on[0]){
			val = a.num.ify(self.val + on.text());
		} else {
			val = a.num.ify(on.text());
		}
		ux['data-number'].prev = {$0: ux.on[0], val: val};
		dat = {$: ux.on, type: 'literal', value: val};
		ux.on.data('dat', dat).text(val);
		ux.next = true;
		$(document).trigger('eval', ux.on);
	}
	
	ux['action-operator'] = function(e, on){
		if(!ux.on || !ux.on.length){ return }
		var val = $.trim(on.text());
		var map = {
			'add': '+'
			,'subtract': '-'
			,'divide': '/'
			,'multiply': '*'
		}
		var dat = {$: ux.on, type: 'action', name: val};
		ux.on.data('dat', dat).text(val);
		ux.next = true;
		if(val === '?'){
			ux.renderif(ux.on);
			return;
		}
	}
	ux.renderif = function(on, p, ifc, iff){
		on.closest('.code-step').next('.code-step-next').remove();
		var eif = $(".model .code-step-if").first().clone(true, true).insertAfter(on.closest('.code-step'));
		eif.find('.if-left').data('screen', {p: p, d: ifc});
		eif.find('.if-right').data('screen', {p: p, d: iff});
	}
	
	ux['action-new'] = function(){
		alert("tap on a step!");
	}
	
	ux['symbol-new'] = function(){
		ux.next = {$: $("<input>"), type: 'symbol'};
	}
	
	ux['top .category'] = function(){
		if(!ux.on || !ux.on.length){ return }
		if(!ux.next){ return }
		var on;
		if(ux.on.next('.step-instruct').length){
			on = ux.on.next('.step-instruct');
		} else {
			on = $('.model .step-instruct').first().clone().insertAfter(ux.on);
		}
		$('.code-active').removeClass('code-active');
		on.addClass('code-active').closest('.code-step').addClass('code-active');
		ux.on = on;
		ux.next = false;
	}
	ux['if-left'] = ux['if-right'] = function(e, on){
		var screen = on.data('screen');
		if(!screen){ return }
		ux.render(screen.p, screen.d);
	}
	
	$.each(ux, function(i, ui){
		$(document).on('click', '.' + i, function(e){
			ui(e, $(this));
		});
	});
	$(document).on('eval', function(e, on){
		console.log('cool', on);
		on = $(on);
		if(!on || !on.length){ return }
		var code = on.closest('.code-step'), context = {};
		if(!code || !code.length){ return }
		console.log("-----------------");
		code.find('.step-instruct').each(function(){
			var dat = $(this).data('dat');
			if(!dat){ return true }
			if(dat.type === 'action'){
				context.action = dat;
			} else {
				if(context.left){
					context.right = dat;
				} else {
					context.left = dat;
				}
			}
			if(context.action && context.left && context.right && lang.action[context.action.value]){
				context.left = lang.action[context.action.value](context.left, context.right);
				context.right = null;
			}
			console.log(dat);
		});
		code.next('.code-step-next').find('.code-result').text((context.left||{}).value);
		console.log(context);
	});
	$(document).on('click', 'a', function(e){
		e.preventDefault();
		var nav = ($(this).attr('href')||'').slice(1);
		console.log('nav', nav);
		if(!nav){ return }
		nav = $('.model').find(nav).first().first().clone();
		console.log(nav);
		if(!nav || !nav.length){ return }
		$(".ux #menu").html(nav);
	});
	ux.render = function(p, screen){
		p.def = p.definitions || {};
		var $code = $('.code').html(ux.render.code);
		$code.find('.name').text(screen || 'Main');
		screen = p.def[screen || 'main'] || p;
		console.log("screen", screen);
		$code.find('.param-left-name').text(screen.left);
		$code.find('.param-right-name').text(screen.right);
		a.list(screen.body).each(function through(val){
			if(val.type === 'if'){
				console.log("if", val);
				$code.find('.sub .code-step-next');
				var $step = ux['code-step-next']({}, $code.find('.sub .code-step-next').last()).filter('.code-step');
				//return;
				ux.render.expression($step, val.expression || val.test);
				var $instruct = ux.render.instruct($step);
				$instruct.text('?').data('if', val);
				ux.renderif($instruct, p, val.ifTrue, val.ifFalse);
			}
			if(val.type === 'assignment'){
				$code.find('.sub .code-step-next');
				var $step = ux['code-step-next']({}, $code.find('.sub .code-step-next').last()).filter('.code-step');
				//return;
				ux.render.expression($step, val.expression || val.test);
			}
			if(val.type === 'expression'){
				$code.find('.sub .code-step-next');
				var $step = ux['code-step-next']({}, $code.find('.sub .code-step-next').last()).filter('.code-step');
				//return;
				ux.render.expression($step, val.expression || val.test);
			}
		});
	}
	ux.render.instruct = function(on){
		return $('.model .step-instruct').first().clone().appendTo(on);
	}
	ux.render.expression = function($step, expression){
		a.list(expression).each(function(e){
			var $instruct = ux.render.instruct($step);
			console.log(e);
			$instruct.text(e.name || e.value).data('expression', e);
		})
	}
	ux.render.code = $('.code').html();
	window.ux = ux;
	ux.render(factorial, 'factorial'); //
});