;var kiwi = kiwi || function(opt){
	var k = kiwi || {};
	opt = opt || {};
	opt.onto = opt.onto || 'body';
	opt.filename = opt.filename || 'kiwi.js';
	opt.skin = opt.skin || {
		a: {color:'#000'}
		,on: {}
		,dull: {color:'#999'}
		,scale: {
			touch: {'font-size':'1.25em'}
			,key: {'font-size':'1em'}
		}
		,slide: {
			up: 175
			,down: 200
		}
	}
	var doc = {}
	, keyboard = $('<div>').attr('id','kiwi').addClass('kiwi-loading');
	$(function(){
		keyboard.appendTo(opt.onto);
		$('script').each(function(){
			var src = $(this).attr('src') || '';
			if(opt.filename === src.slice(-opt.filename.length)){
				src = src.slice(0,-opt.filename.length);
				console.log(src);
				keyboard.load(src + 'key.html #keyboard', function(){
					$(this).removeClass('kiwi-loading');
					k.prepare(keyboard);
					$(this).find(".keyboard").removeAttr('style');
				});
			}
		});
	});
	k.prepare = k.prepare || function(keyboard){
		k.on = false;
		k.b = keyboard.find(".keyboard");
		k.$rows = keyboard.find("ul");
		k.$instr = keyboard.find(".kiwi-instruct");
		k.$put = keyboard.find(".kiwi-put");
		$(document).trigger('kiwi');
		k.clone();
		k.lo = layout(doc);
		k.lo.track();
	};
	k.real = function(){ 
		return !(('onorientationchange' in window) || ('orientation' in window));
	}
	k.clone = k.clone || function(){
		k.row = k.row || {};
		k.$rows.each(function(){
			k.row[$(this).attr('id')] = $(this).contents().clone();
		});
	};
	k.code = function(tag){
		if(!tag) return false;
		return (k.special[tag.toLowerCase()])? k.special[tag.toLowerCase()] : (tag||'').toUpperCase().charCodeAt(0);
	};
	k.tag = function(code){
		if(!code) return false;
		code = (code.keyCode)?code.keyCode:code;
		code = (typeof code == 'number')? 'kc'+code:code;
		return k.special[code] || String.fromCharCode(parseInt(code.substring(2)));
	};
	k.layout = k.layout || function(){
		k.lo && k.lo.set && k.lo.set();
	};
	k.map = function(o){
		var tag, code, s, j, x = 1, d, row, rowi, ul = {}, punc = {}, uls = {}
			,npunc = ":not(.punc)", w = $(document).width();
		k.go = true;
		k.wipe(function(){
			k.go = false;
			$.each(o,function(i,v){
				if(!v || v.key || i === 'tag'){ return }
				tag = (i||'').toUpperCase();
				code = k.code(tag);
				tag = $.isFunction(v.tag)? v.tag() : (v.tag||v||undefined);
				j = $("#kc"+code).show().addClass('key-a').css(opt.skin.a).html(tag);
				//console.log(" - "+j.outerWidth(true));
				row = j.closest('ul').addClass('key-row-a');
				d = d || row;
				rowi = row.attr('id');
				ul[rowi] = row;
				if(j.is('.punc')){
					npunc = "";
				}
			});
			if(k.real()){
				//x = layout.width(,{out:true,filter: npunc});
				$.each(ul,function(i,v){
					d = (d.children('li'+npunc).length < v.children('li'+npunc).length)?
						v : d;
				});
				(d||$()).children("li"+npunc).each(function(){ // + npunc possibly wrong! actually most def is.
					x += Math.ceil($(this).outerWidth(true)||1);
				});
			}
			$.each(ul,function(i,v){
				if(k.real() && x < w){
					v.children('li'+npunc).show();
				}
				v.slideDown(opt.skin.slide.down);
			});
			k.layout();
		});
		return true;
	};
	k.wipe = function(fn){
		if(!k || !k.b){ return }
		if(!k.on){ k.on = k.b.show() }
		k.$put.blur().hide().val('');
		var c = 0, l;
		l = k.$rows.stop(true,true).removeClass('key-row-a').removeAttr('style').length;
		k.$rows.slideUp(opt.skin.slide.up,function(){
			$(this).empty().append(k.row[$(this).attr('id')].clone());
		}).promise().done(fn);
	};
	k.instr = function(s){
		if(!s) return false;
		k.$instr.stop(true,true).slideUp(function(){
			k.$instr.slideDown().children('.instr').html(s).show();
		});
		return;
	};
	var layout = function(doc){
		var lo = {};
		lo.doc = doc||{};
		lo.size = {};
		lo.kb = keyboard.find(".keyboard");
		lo.kt = $("#kiwi-top");
		lo.km = $("#kiwi-main");
		lo.kl = $("#kiwi-left");
		lo.kr = $("#kiwi-right");
		lo.k = $("#kiwi-keys");
		lo.widths = (function(){	
			var r = {};
			r.lx = lo.width(lo.kl,{max:true,out:true})||0;
			r.kx = lo.width(lo.k,{max:true,out:true})||0;
			r.rx = lo.width(lo.kr,{max:true,out:true})||0;
			r.tx = lo.width(lo.kt,{max:true,out:true})||0;
			return r;
		});
		lo.set = function(e,c){
			lo.size.x = $(document).width();
			lo.size.o = lo.size.x/2;
			lo.size.max = lo.widths();
			lo.k.css({ width: lo.size.max.kx, 'margin-left': 'auto', 'margin-right':'auto' });
			lo.kt.css({ width: lo.size.max.tx, left: lo.size.o - lo.size.max.tx/2 });
			//console.log(lo.size.max.kx);
			var bk = lo.k.find("ul.key-row-a").last().find("li:visible").not(".key-offset")
				,bkflp = (bk.first().position()||{left:0}).left
				,bkfl = (lo.k.offset()||{left:0}).left + bkflp;
			//console.log(bkfl +" < "+ lo.size.max.lx);
			if(bkfl < lo.size.max.lx){
				if(!c && k.real()){
					if(lo.size.x <= (lo.size.max.lx - bkflp) + lo.size.max.kx || lo.size.x <= lo.size.max.tx
						|| lo.size.x - lo.size.max.rx <= ((bk.last().offset()||{left:0}).left + bk.last().outerWidth(true))
					){
						lo.kb.find("li:not(.key-a)").hide();
						return lo.set(e,true);
					}
				}
				lo.k.css({'margin-left': lo.size.max.lx - bkflp });
			}
		};
		lo.width = function(a,b){
			var x = 1, aa = a.children("ul.key-row-a").first(), b = b||{};
			b.out = b.out||false;
			b.max = b.max||false;
			b.filter = b.filter||':visible';
			a.children("ul.key-row-a").each(function(){
				aa = (aa.children('li'+b.filter).length < $(this).children('li'+b.filter).length)?
					((b.max)? $(this) : aa) : ((b.max)? aa : $(this));
			});
			aa.children('li'+b.filter).each(function(){
				x += Math.ceil($(this).outerWidth(b.out)||1);
			});
			return ++x;
		}
		lo.track = function(i){
			lo.set();
			lo.doc.initset = true;
			$(window).resize(lo.set);
		}
		return lo;
	};
	k.strange = {' ':1,ERASE:1};
	k.reserved = {Z:1,X:1,C:1,V:1,R:1,T:1,N:1,F12:1,F11:1,PU:1,PD:1,pu:1,pd:1}; // reserved keys
	k.special = {
		'esc':27
		,'kc27': 'esc'
		,'tab':9
		,'kc9':'tab'
		,' ':32
		,'kc32':' '
		,'enter':13
		,'kc13':'enter'
		,'erase':8
		,'kc8': 'erase'
		
		,'kc92':'\\'
		,'\\':92
		
		,'scroll':145
		,'kc145':'scroll'
		,'caps':20
		,'kc20':'caps'
		,'num':144
		,'kc144':'num'
		
		,'pause':19
		,'kc19':'pause'
		
		,'insert':45
		,'kc45':'insert'
		,'home':36
		,'kc36':'home'
		,'delete':46
		,'kc46':'del'
		,'end':35
		,'kc35':'end'
		
		,'pu':33
		,'kc33':'pu'
		
		,'pd':34
		,'kc34':'pd'
		
		,'left':37
		,'kc37':'left'
		
		,'up':38
		,'kc38':'up'

		,'right':39
		,'kc39':'right'

		,'down':40
		,'kc40':'down'
		
		,'shift':16
		,'kc16':'shift'
		,'ctrl':17
		,'kc17':'ctrl'
		,'alt':18
		,'kc18':'alt'
		,'¤':91
		,'cmd':91
		,'kc91': 'meta' //((the.os.is.win||the.os.is.lin||the.os.is.and)?'¤':'cmd')
		
		,'kc91':'['
		,'[':91
		,'kc93':']'
		,']':93
		,'kc126':'`'
		,'`':126
		,'kc95':'-'
		,'-':95
		,'kc61':'='
		,'=':61
		,'kc59':';'
		,';':59
		,'kc222':"'"
		,"'":222
		,'kc47':'/'
		,'/':47
		,'kc62':'.'
		,'.':62
		,'kc44':','
		,',':44
		
		,'f1':112
		,'kc112':'F1'
		,'f2':113
		,'kc113':'F2'
		,'f3':114
		,'kc114':'F3'
		,'f4':115
		,'kc115':'F4'
		,'f5':116
		,'kc116':'F5'
		,'f6':117
		,'kc117':'F6'
		,'f7':118
		,'kc118':'F7'
		,'f8':119
		,'kc119':'F8'
		,'f9':120
		,'kc120':'F9'
		,'f10':121
		,'kc121':'F10'
		,'f11':122
		,'kc122':'F11'
		,'f12':123
		,'kc123':'F12'
	};
	return;
}