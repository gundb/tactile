var factorial = {
	block: [
		{}
	]
	,definitions: {
		factorial: {
			type: 'function'
			,left: 'x'
			,right: 'y'
			,body: [
				{
					type: 'if'
					,test: [
						{type: 'variable', name: 'y'}
						,{type: 'operator', name: '='}
						,{type: 'variable', name: 'x'}
					]
					,ifTrue: 'end'
					,ifFalse: 'recurse'
				}
			]
		}
		,end: {
			type: 'block'
			,body: [
				{
					type: 'expression'
					,expression: [{type: 'literal', value: 1}]
				}
			]
		}
		,recurse: {
			type: 'function'
			,left: 'x'
			,right: 'y'
			,body: [
				{
					type: 'assignment'
					,target: 'n'
					,expression: [
						{type: 'variable', name: 'y'},
						{type: 'operator', name: '-'},
						{type: 'literal', value: 1}
					]
				},
				{
					type: 'expression'
					,expression: [
						{type: 'literal', value: 0},
						{type: 'operator', name: 'factorial'},
						{type: 'variable', name: 'n'},
						{type: 'operator', name: '*'},
						{type: 'variable', name: 'y'},
					]
				}
			]
		}
	}
	,env: {
		
	}
}