;$(function(){
	var ux = {}, a = theory;
	
	ux['code-step-new'] = function(){
		$('.model .code-step').clone().appendTo('.code .sub');
	}
	ux['code-step'] = function(on){
		ux.step = $(on);
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
	
	
	
	ux['category'] = function(on){
		$(on).siblings('.category').find('.sub').addClass('none');
		$(on).find('.sub').first().removeClass('none');
	}
	
	ux['data-numbers'] = function(on, e){
		e.stopPropagation();
		var val = a.num.ify(on.text())
		dar = mkLit(val);
		ux.step.text(val).data('dar-lit', dar);
	}
	
	ux['action-operator'] = function(on, e){
		e.stopPropagation();
		var act = on.text();
		ux.step.text(act).data('dar-act', act);
	}
	
	ux['action-new'] = function(){
		alert("tap on a step!");
	}
	
	$.each(ux, function(i, ui){
		$(document).on('click', '.' + i, function(e){
			ui($(this), e);
		});
	})
});