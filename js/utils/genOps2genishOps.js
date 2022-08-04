// this script compares the genish operators js files in /js against the full list of operators available in Gen~. When they match, it copies the full Gen~ operator object to genishOps array. When completed, it writes to ./operators.json

let genOps = [
	
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "math",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "add",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Add inputs",
		"expr_type": "expr_type_coerce",
		"digest": "Add inputs",
		"seealso": [
			"div",
			"mod",
			"mul",
			"neg",
			"sub"
		],
		"outputs": [
			{
				"name": "sum",
				"label": "in1 + in2"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"+"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "math",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "1"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "1"
			}
		},
		"op": "mul",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Multiply inputs",
		"expr_type": "expr_type_coerce",
		"digest": "Multiply inputs",
		"seealso": [
			"add",
			"div",
			"mod",
			"neg",
			"sub"
		],
		"outputs": [
			{
				"name": "product",
				"label": "in1 * in2"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"*"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "route",
		"inputs": {
			"loval": {
				"label": "output if interp is 0",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "output if interp is 0",
				"name": "loval",
				"default": "0"
			},
			"hival": {
				"label": "output if interp is 1",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "output if interp is 1",
				"name": "hival",
				"default": "1"
			},
			"interp": {
				"label": "interpolation factor between inputs",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "interpolation factor between inputs",
				"name": "interp",
				"default": "0.5"
			}
		},
		"op": "mix",
		"arguments": [
			"loval",
			"hival",
			"interp"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"loval",
					"hival",
					"interp"
				]
			},
			{
				"inlets": [
					"interp"
				],
				"arguments": [
					"loval",
					"hival"
				]
			},
			{
				"inlets": [
					"loval",
					"hival"
				],
				"arguments": [
					"interp"
				]
			},
			{
				"inlets": [
					"loval",
					"hival",
					"interp"
				],
				"arguments": {}
			}
		],
		"description": "Mixes (interpolates) between inputs a and b according to the value of the third input t, using linear interpolation. The factor (t) should vary between 0 (for a) and 1 (for b). If one argument is given, it specifies the mix (interpolation) factor.",
		"expr_type": "expr_type_coerce",
		"digest": "Linear crossfade of inputs",
		"seealso": [
			"gate",
			"selector",
			"smoothstep",
			"switch"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "interpolated result"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_sample_signal",
		"stateful": true,
		"category": "buffer",
		"seealso": [
			"phasor",
			"train",
			"buffer",
			"data"
		],
		"has_constant_expr": false,
		"inputs": {
			"freq": {
				"label": "wave frequency",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave frequency",
				"name": "freq",
				"default": "440"
			},
			"phase": {
				"label": "wave phase (0..1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave phase (0..1)",
				"name": "phase",
				"default": "0"
			}
		},
		"op": "cycle",
		"expr_outputs": "generic",
		"digest": "Sine / wavetable lookup oscillator",
		"outputs": [
			{
				"name": "out1",
				"label": "interpolated waveform"
			},
			{
				"name": "out2",
				"label": "index (in samples)"
			}
		],
		"attributes": {
			"name": {
				"optional": true,
				"digest": "Specify data or buffer to play",
				"description": "Specify the data or buffer object to use for playback. If not specified, cycle will use a built-in sine wavetable.\"",
				"type": "string"
			},
			"index": {
				"optional": true,
				"enums": {
					"phase": true,
					"freq": true
				},
				"digest": "Specify the index mode",
				"description": "Specify the index mode: \"phase\" maps the input signal range 0..1 to the span of the buffer, \"freq\" cycles through the buffer at a frequency given by the input signal.",
				"type": "enum",
				"default": "freq"
			}
		},
		"constructors": [
			{
				"constraints": {
					"index": [
						"phase"
					]
				},
				"inlets": {},
				"arguments": [
					"buffer",
					"phase"
				]
			},
			{
				"arguments": [
					"buffer"
				],
				"inlets": [
					"phase"
				],
				"constraints": {
					"index": [
						"phase"
					]
				}
			},
			{
				"constraints": {
					"index": [
						"phase"
					]
				},
				"inlets": [
					"phase"
				],
				"arguments": {}
			},
			{
				"inlets": {},
				"arguments": [
					"buffer",
					"freq"
				]
			},
			{
				"inlets": [
					"freq"
				],
				"arguments": [
					"buffer"
				]
			},
			{
				"inlets": [
					"freq"
				],
				"arguments": {}
			}
		],
		"aliases": {},
		"description": "An interpolating oscillator that reads repeatedly through one cycle of a sine wave. By default it is driven by a frequency input, but if the @index attribute is set to 'phase', it can be driven by a phase input instead."
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "range",
		"inputs": {
			"input": {
				"label": "input to clamp",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input to clamp",
				"name": "input",
				"default": "0"
			},
			"min": {
				"label": "lower bound",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "lower bound",
				"name": "min",
				"default": "0"
			},
			"max": {
				"label": "upper bound",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "upper bound",
				"name": "max",
				"default": "1"
			}
		},
		"op": "clamp",
		"arguments": [
			"input",
			"min",
			"max"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"input",
					"min",
					"max"
				]
			},
			{
				"inlets": [
					"input"
				],
				"arguments": [
					"min",
					"max"
				]
			},
			{
				"inlets": [
					"input",
					"min"
				],
				"arguments": [
					"max"
				]
			},
			{
				"inlets": [
					"input",
					"min",
					"max"
				],
				"arguments": {}
			}
		],
		"description": "Clamps the input value between specified min and max. Ranges are inclusive (both min and max values may be output)",
		"expr_type": "expr_type_coerce",
		"digest": "Clamp values in a specified range",
		"seealso": [
			"clip",
			"fold",
			"max",
			"min",
			"scale",
			"wrap"
		],
		"outputs": [
			{
				"name": "clamped",
				"label": "clamped input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"clip"
		],
		"has_constant_expr": true
	},

	{
		"domain": "common",
		"box_expr": "generic",
		"category": "range",
		"inputs": {
			"input": {
				"label": "input to fold",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input to fold",
				"name": "input",
				"default": "0"
			},
			"min": {
				"label": "lower bound",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "lower bound",
				"name": "min",
				"default": "0"
			},
			"max": {
				"label": "upper bound",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "upper bound",
				"name": "max",
				"default": "1"
			}
		},
		"op": "fold",
		"arguments": [
			"input",
			"min",
			"max"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"input",
					"min",
					"max"
				]
			},
			{
				"inlets": [
					"input"
				],
				"arguments": [
					"min",
					"max"
				]
			},
			{
				"inlets": [
					"input",
					"min"
				],
				"arguments": [
					"max"
				]
			},
			{
				"inlets": [
					"input",
					"min",
					"max"
				],
				"arguments": {}
			}
		],
		"description": "Low and high values can be specified by arguments or by inlets. The default range is 0..1.",
		"expr_type": "expr_type_coerce",
		"digest": "Fold input to a range within a low and high output value",
		"seealso": [
			"clamp",
			"scale",
			"wrap"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "folded input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},

	{
		"domain": "common",
		"box_expr": "generic",
		"expr_type": "expr_type_sample_signal",
		"stateful": false,
		"category": "waveform",
		"has_constant_expr": false,
		"expr_outputs": "generic",
		"outputs": [
			{
				"name": "random-stream",
				"label": "random numbers"
			}
		],
		"op": "noise",
		"arguments": {},
		"digest": "A random number generator",
		"inputs": {},
		"attributes": {},
		"constructors": [
			{
				"inlets": [],
				"arguments": {}
			}
		],
		"aliases": {},
		"description": "A random number generator"
	},

	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "tanh",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The hyperbolic tangent of the input",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The hyperbolic tangent of the input",
		"seealso": [
			"atanh",
			"cosh",
			"sinh"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "tanh(input)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},

	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "filter",
		"inputs": {
			"input": {
				"label": "input to sample",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input to sample",
				"name": "input",
				"default": "0"
			},
			"control": {
				"label": "control: allows input through when non-zero",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "control: allows input through when non-zero",
				"name": "control",
				"default": "0"
			}
		},
		"op": "latch",
		"arguments": [
			"input",
			"control"
		],
		"constructors": [
			{
				"inlets": [
					"input",
					"control"
				],
				"arguments": {}
			}
		],
		"description": "Conditionally passes or holds input. The first inlet is the 'input' and the second inlet is the 'control'. When the control is non-zero, the input value is passed through. When the control is zero, the previous input value is output. It can be used to periodically sample & hold a source signal with a simpler trigger logic than the sah operator.",
		"expr_type": "expr_type_coerce",
		"digest": "Conditionally pass or hold input",
		"seealso": [
			"sah",
			"slide",
			"delta",
			"change",
			"sah"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "current or previous input"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"init": {
				"optional": true,
				"digest": "Specify the initially held value",
				"description": "Specify the initially held value",
				"type": "float",
				"default": 0
			}
		},
		"aliases": {},
		"has_constant_expr": false
	},

	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "filter",
		"inputs": {
			"input": {
				"label": "value to analyze",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to analyze",
				"name": "input",
				"default": "0"
			}
		},
		"op": "change",
		"arguments": [
			"input"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": {}
			}
		],
		"description": "Returns the sign of the difference between the current and previous input: 1 if the input is increasing, -1 if decreasing, and 0 if unchanging.",
		"expr_type": "expr_type_int_signal",
		"digest": "The sign of the derivative of the input",
		"seealso": [
			"slide",
			"delta",
			"change",
			"sah"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "0 if unchanged; -1 or 1 if changed"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"init": {
				"optional": true,
				"digest": "Specify the first value to compare against",
				"description": "Specify the first value to compare against",
				"type": "float",
				"default": 0
			}
		},
		"aliases": {},
		"has_constant_expr": true
	},

	{
		"domain": "common",
		"box_expr": "generic",
		"category": "powers",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "pow",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Raise in1 to the power of in2",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Raise in1 to the power of in2",
		"seealso": [
			"exp",
			"exp2",
			"log",
			"log10",
			"log2",
			"sqrt"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "sign of input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "numeric",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "ceil",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Round the value up to the next higher integer",
		"expr_type": "expr_type_coerce",
		"digest": "Round the value up to the next higher integer",
		"seealso": [
			"floor",
			"fract",
			"trunc"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "input rounded up"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "powers",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "fastpow",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Approximated in1 to the power of in2",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Approximated in1 to the power of in2",
		"seealso": [
			"fastexp"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "sign of input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	
	
	{
		"domain": "common",
		"box_expr": "revop",
		"category": "math",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "1"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "1"
			}
		},
		"op": "rdiv",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Reverse division (divide second input by first)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Reverse division (divide second input by first)",
		"seealso": [
			"div",
			"rmod",
			"rsub"
		],
		"outputs": [
			{
				"name": "quotient",
				"label": "in2 / in1"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"!/"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "min",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "The minimum of the inputs",
		"expr_type": "expr_type_coerce",
		"digest": "The minimum of the inputs",
		"seealso": [
			"clamp",
			"clip",
			"max"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "min(in1,in2)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"minimum"
		],
		"has_constant_expr": true
	},
	
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "math",
		"inputs": {
			"y": {
				"label": "y-coordinate",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "y-coordinate",
				"name": "y",
				"default": "0"
			},
			"x": {
				"label": "x-coordinate",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "x-coordinate",
				"name": "x",
				"default": "0"
			}
		},
		"op": "cartopol",
		"arguments": [
			"x",
			"y"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"x",
					"y"
				]
			},
			{
				"inlets": [
					"y"
				],
				"arguments": [
					"x"
				]
			},
			{
				"inlets": [
					"x",
					"y"
				],
				"arguments": {}
			}
		],
		"description": "Convert Cartesian values to polar format. Angles are in radians.",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Convert Cartesian values to polar",
		"seealso": [
			"atan2",
			"hypot",
			"poltocar"
		],
		"outputs": [
			{
				"name": "distance",
				"label": "distance"
			},
			{
				"name": "angle",
				"label": "angle(radians)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "LN2",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of ln2",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "ln2"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"ln2"
		],
		"has_constant_expr": true
	},
	
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "range",
		"inputs": {
			"input": {
				"label": "value to scale",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to scale",
				"name": "input",
				"default": "0"
			},
			"ilo": {
				"label": "input range lower value",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input range lower value",
				"name": "ilo",
				"default": "0"
			},
			"exp": {
				"label": "exponential curve",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "exponential curve",
				"name": "exp",
				"default": "1"
			},
			"ihi": {
				"label": "input range upper value",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input range upper value",
				"name": "ihi",
				"default": "1"
			},
			"ohi": {
				"label": "output range upper value",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "output range upper value",
				"name": "ohi",
				"default": "1"
			},
			"olo": {
				"label": "output range lower value",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "output range lower value",
				"name": "olo",
				"default": "0"
			}
		},
		"op": "scale",
		"arguments": [
			"input",
			"ilo",
			"ihi",
			"olo",
			"ohi",
			"exp"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": [
					"ilo",
					"ihi",
					"olo",
					"ohi",
					"exp"
				]
			},
			{
				"inlets": [
					"input",
					"exp"
				],
				"arguments": [
					"ilo",
					"ihi",
					"olo",
					"ohi"
				]
			},
			{
				"inlets": [
					"input",
					"ohi",
					"exp"
				],
				"arguments": [
					"ilo",
					"ihi",
					"olo"
				]
			},
			{
				"inlets": [
					"input",
					"olo",
					"ohi",
					"exp"
				],
				"arguments": [
					"ilo",
					"ihi"
				]
			},
			{
				"inlets": [
					"input",
					"ihi",
					"olo",
					"ohi",
					"exp"
				],
				"arguments": [
					"ilo"
				]
			},
			{
				"inlets": [
					"input",
					"ilo",
					"ihi",
					"olo",
					"ohi",
					"exp"
				],
				"arguments": {}
			}
		],
		"description": "Similar to the Max scale and MSP scale~ objects. Inputs are: 1) value to scale, 2) input lower bound, 3), input upper bound, 4) output lower bound, 5) output upper bound, 6) exponential curve. Default lower and upper bounds are zero and one; default exponential curve is 1 (linear). No bound clamping is performed. The high and low values can be reversed for inverted mapping.",
		"expr_type": "expr_type_coerce",
		"digest": "Map an input range of values to an output range",
		"seealso": [
			"clamp",
			"fold",
			"gate",
			"mix",
			"selector",
			"smoothstep",
			"switch",
			"wrap"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "scaled output value"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "eqp",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns in1 if it equals in2, else returns zero.  Equivalent to in1*(in1 == in2).",
		"expr_type": "expr_type_coerce",
		"digest": "Equal/pass operator",
		"seealso": [
			"gtep",
			"gtp",
			"ltep",
			"ltp",
			"neqp"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "in1 or 0"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"==p"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "sin",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The sine of the input (in radians)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The sine of the input (in radians)",
		"seealso": [
			"asin",
			"cos",
			"tan"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "sin(input)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "powers",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "exp",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Raise the mathematical value e to a power",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Raise the mathematical value e to a power",
		"seealso": [
			"exp2",
			"log",
			"log10",
			"log2",
			"pow",
			"sqrt"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "exp(in1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "eq",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns 1 if in1 equals in2, else returns zero.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Equal operator",
		"seealso": [
			"gt",
			"gte",
			"lt",
			"lte",
			"neq"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"=="
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "powers",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "exp2",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Raise 2 to a power",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Raise 2 to a power",
		"seealso": [
			"exp",
			"log",
			"log10",
			"log2",
			"pow",
			"sqrt"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "pow(2, in1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "ltep",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns in1 if in1 is equal to or less than in2, else returns zero.  Equivalent to in1*(in1 <= in2).",
		"expr_type": "expr_type_coerce",
		"digest": "Pass less than or equals operator",
		"seealso": [
			"eqp",
			"gtep",
			"gtp",
			"ltp",
			"neqp"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "in1 or 0"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"<=p"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "math",
		"inputs": {
			"r": {
				"label": "polar radius",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "polar radius",
				"name": "r",
				"default": "0"
			},
			"theta": {
				"label": "polar angle",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "polar angle",
				"name": "theta",
				"default": "0"
			}
		},
		"op": "poltocar",
		"arguments": [
			"r",
			"theta"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"r",
					"theta"
				]
			},
			{
				"inlets": [
					"theta"
				],
				"arguments": [
					"r"
				]
			},
			{
				"inlets": [
					"r",
					"theta"
				],
				"arguments": {}
			}
		],
		"description": "Convert polar values to Cartesian format. Angles are in radians.",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Convert polar values to Cartesian",
		"seealso": [
			"atan2",
			"cartopol",
			"hypot"
		],
		"outputs": [
			{
				"name": "x",
				"label": "cartesian coordinate x"
			},
			{
				"name": "y",
				"label": "cartesian coordinate y"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "numeric",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "fract",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Return only the fractional component",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Return only the fractional component",
		"seealso": [
			"ceil",
			"floor",
			"mod",
			"trunc"
		],
		"outputs": [
			{
				"name": "fract",
				"label": "fractional component of input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "powers",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "sqrt",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The square root of the input",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The square root of the input",
		"seealso": [
			"exp",
			"exp2",
			"log",
			"log10",
			"log2",
			"pow"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "square root of input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"degrees": {
				"label": "angle in degrees",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "angle in degrees",
				"name": "degrees",
				"default": "0"
			}
		},
		"op": "radians",
		"arguments": [
			"degrees"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"degrees"
				]
			},
			{
				"inlets": [
					"degrees"
				],
				"arguments": {}
			}
		],
		"description": "convert degrees to radians",
		"expr_type": "expr_type_sample_coerce",
		"digest": "convert degrees to radians",
		"seealso": [
			"degrees"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "angle(degrees)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "neqp",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns in1 if it does not equal in2, else returns zero.  Equivalent to in1*(in1 != in2).",
		"expr_type": "expr_type_coerce",
		"digest": "Not equal/pass operator",
		"seealso": [
			"eqp",
			"gtep",
			"gtp",
			"ltep",
			"ltp"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "in1 or 0"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"!=p"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "atan",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The arc tangent of the input (returns radians)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The arc tangent of the input (returns radians)",
		"seealso": [
			"acos",
			"asin",
			"atan2",
			"tan"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "angle(radians)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "degtorad",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of degtorad",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "degtorad"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"DEGTORAD"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "math",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "1"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "1"
			}
		},
		"op": "mod",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Modulo inputs (remainder of first input / second input)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Modulo inputs (remainder of first input / second input)",
		"seealso": [
			"add",
			"div",
			"mul",
			"neg",
			"rmod",
			"sub"
		],
		"outputs": [
			{
				"name": "modulo",
				"label": "mod(in1,in2)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"%"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "atanh",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The inverse hyperbolic tangent of the input",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The inverse hyperbolic tangent of the input",
		"seealso": [
			"acosh",
			"asinh",
			"tanh"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "atanh(in1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "log10e",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of log10e",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "log10e"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"LOG10E"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "powers",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "fastexp",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Approximated e to a power",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Approximated e to a power",
		"seealso": [
			"fastpow"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "fastexp(in1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "sinh",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The hyperbolic sine of the input",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The hyperbolic sine of the input",
		"seealso": [
			"asinh",
			"cosh",
			"tanh"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "sinh(input)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "acos",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The arc cosine of the input (returns radians)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The arc cosine of the input (returns radians)",
		"seealso": [
			"asin",
			"atan",
			"atan2",
			"cos"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "angle(radians)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "ln10",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of ln10",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "ln10"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"LN10"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "special",
		"expr_type": "expr_type_sample_signal",
		"stateful": false,
		"category": "input-output",
		"seealso": [
			"out"
		],
		"has_constant_expr": false,
		"inputs": {},
		"op": "in",
		"expr_outputs": "generic",
		"digest": "Gen patcher input",
		"outputs": [
			{
				"name": "value",
				"label": "input value"
			}
		],
		"attributes": {
			"max": {
				"optional": true,
				"digest": "Specify maximum value for input",
				"description": "Specify maximum value for parameter. Incoming values out of range will be clamped",
				"type": "vector"
			},
			"comment": {
				"optional": true,
				"digest": "Specify a comment/label for the input",
				"description": "Specify a comment/label for the input",
				"type": "string"
			},
			"min": {
				"optional": true,
				"digest": "Specify minimum value for input",
				"description": "Specify minimum value for parameter. Incoming values out of range will be clamped",
				"type": "vector"
			},
			"index": {
				"optional": true,
				"digest": "Inlet index number",
				"description": "Inlet index number",
				"type": "int",
				"default": 1
			}
		},
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"index",
					"comment"
				]
			},
			{
				"inlets": {},
				"arguments": [
					"index"
				]
			},
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"aliases": {},
		"description": "Defines an input for a gen patcher."
	},
	{
		"domain": "common",
		"box_expr": "revop",
		"category": "math",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "1"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "1"
			}
		},
		"op": "rmod",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Reverse modulo (remainder of second input / first input)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Reverse modulo (remainder of second input / first input)",
		"seealso": [
			"mod",
			"rdiv",
			"rsub"
		],
		"outputs": [
			{
				"name": "modulo",
				"label": "mod(in2,in1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"!%"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "math",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "sub",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Subtract inputs",
		"expr_type": "expr_type_coerce",
		"digest": "Subtract inputs",
		"seealso": [
			"add",
			"div",
			"mod",
			"mul",
			"neg",
			"rsub"
		],
		"outputs": [
			{
				"name": "difference",
				"label": "in1 - in2"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"-"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "neq",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns 1 if in1 does not equal in2, else returns zero.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Not equal operator",
		"seealso": [
			"eq",
			"gt",
			"gte",
			"lt",
			"lte"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"!="
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "special",
		"category": "declare",
		"inputs": {},
		"op": "param",
		"arguments": [
			"name",
			"default"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"name",
					"default"
				]
			},
			{
				"inlets": {},
				"arguments": [
					"name"
				]
			}
		],
		"description": "Named parameters can be modified from outside the gen patcher. The first argument specifies the name of the parameter, the second argument the initial value.",
		"expr_type": "expr_type_special",
		"digest": "An externally modifiable, named parameter",
		"seealso": [
			"setparam"
		],
		"outputs": [
			{
				"name": "value",
				"label": "parameter value"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {
			"max": {
				"optional": true,
				"digest": "Specify maximum value for parameter",
				"description": "Specify maximum value for parameter. Incoming values out of range will be clamped",
				"type": "vector"
			},
			"name": {
				"optional": false,
				"digest": "Parameter name",
				"description": "Parameter name",
				"type": "string"
			},
			"min": {
				"optional": true,
				"digest": "Specify minimum value for parameter",
				"description": "Specify minimum value for parameter. Incoming values out of range will be clamped",
				"type": "vector"
			},
			"default": {
				"optional": true,
				"digest": "Parameter default value",
				"description": "Parameter default value",
				"type": "vector",
				"default": 0
			}
		},
		"aliases": [
			"Param"
		],
		"has_constant_expr": false
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "ltp",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns in1 if in1 is less than in2, else returns zero.  Equivalent to in1*(in1 < in2).",
		"expr_type": "expr_type_coerce",
		"digest": "Pass less than operator",
		"seealso": [
			"eqp",
			"gtep",
			"gtp",
			"ltep",
			"neqp"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "in1 or 0"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"<p"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "logic",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "bool",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Converts any nonzero value to 1 while zero passes through.",
		"expr_type": "expr_type_int_coerce",
		"digest": "constant boolean / convert to boolean",
		"seealso": [
			"constant",
			"float",
			"int"
		],
		"outputs": [
			{
				"name": "bool",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "max",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "The maximum of the inputs",
		"expr_type": "expr_type_coerce",
		"digest": "The maximum of the inputs",
		"seealso": [
			"clamp",
			"clip",
			"min"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "max(in1,in2)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"maximum"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"y": {
				"label": "y distance",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "y distance",
				"name": "y",
				"default": "1"
			},
			"x": {
				"label": "x distance",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "x distance",
				"name": "x",
				"default": "0"
			}
		},
		"op": "hypot",
		"arguments": [
			"x",
			"y"
		],
		"constructors": [
			{
				"inlets": [
					"y"
				],
				"arguments": [
					"x"
				]
			},
			{
				"inlets": [
					"x",
					"y"
				],
				"arguments": {}
			}
		],
		"description": "Returns the length of the vector to (in1, in2).",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The hypoteneuse",
		"seealso": [
			"atan2",
			"cartopol",
			"poltocar"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "hypoteneuse"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "numeric",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "floor",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Round the value down to the next lower integer (toward negative infinity)",
		"expr_type": "expr_type_coerce",
		"digest": "Round the value down to the next lower integer (toward negative infinity)",
		"seealso": [
			"ceil",
			"fract",
			"trunc"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "input rounded down"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "numeric",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "abs",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Negative values will be converted to positive counterparts.",
		"expr_type": "expr_type_coerce",
		"digest": "The absolute value of the input",
		"seealso": [
			"absdiff",
			"sign",
			"sub"
		],
		"outputs": [
			{
				"name": "abs",
				"label": "absolute value of input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "math",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "absdiff",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Compute the absolute difference between two inputs using the equation abs(in1-in2).",
		"expr_type": "expr_type_coerce",
		"digest": "Compute the absolute difference between two inputs",
		"seealso": [
			"abs",
			"sign",
			"sub"
		],
		"outputs": [
			{
				"name": "abs-diff",
				"label": "abs(in1-in2)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "powers",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "log2",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The logarithm base 2 of the input",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The logarithm base 2 of the input",
		"seealso": [
			"exp",
			"exp2",
			"log",
			"log10",
			"pow",
			"sqrt"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "base 2 log of input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"radians": {
				"label": "angle in radians",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "angle in radians",
				"name": "radians",
				"default": "0"
			}
		},
		"op": "degrees",
		"arguments": [
			"radians"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"radians"
				]
			},
			{
				"inlets": [
					"radians"
				],
				"arguments": {}
			}
		],
		"description": "convert radians to degrees",
		"expr_type": "expr_type_sample_coerce",
		"digest": "convert radians to degrees",
		"seealso": [
			"radians"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "angle(radians)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"expr_type": "expr_type_coerce",
		"stateful": false,
		"category": "route",
		"seealso": [
			"mix",
			"selector",
			"smoothstep",
			"switch"
		],
		"has_constant_expr": false,
		"inputs": {
			"input": {
				"label": "input to pass through the gate",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input to pass through the gate",
				"name": "input",
				"default": "0"
			},
			"choose": {
				"label": "choose which output to forward to",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "choose which output to forward to",
				"name": "choose",
				"default": "1"
			}
		},
		"op": "gate",
		"expr_outputs": "special",
		"digest": "Select between a number of outputs",
		"outputs": {},
		"attributes": {
			"choices": {
				"optional": true,
				"digest": "Number of outputs",
				"description": "Number of outputs",
				"type": "int",
				"default": 1
			}
		},
		"constructors": [
			{
				"inlets": [
					"choose",
					"input"
				],
				"arguments": [
					"choices"
				]
			},
			{
				"inlets": [
					"choose",
					"input"
				],
				"arguments": {}
			}
		],
		"aliases": {},
		"description": "Similar to the MSP gate~ object. It takes an argument for number of outputs (one is the default) and lets you choose which the incoming signal (at the right inlet) is sent to according to the (integer) value in the left inlet. A value of zero or less to the left inlet will choose no output; a value greater than the number of outlets will select the last outlet. Like gate~, un-selected outlets will send zero."
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "route",
		"inputs": {
			"iffalse": {
				"label": "value if false",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value if false",
				"name": "iffalse",
				"default": "0"
			},
			"iftrue": {
				"label": "value if true",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value if true",
				"name": "iftrue",
				"default": "0"
			},
			"condition": {
				"label": "condition to test",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "condition to test",
				"name": "condition",
				"default": "0"
			}
		},
		"op": "switch",
		"arguments": [
			"condition",
			"iftrue",
			"iffalse"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"condition",
					"iftrue",
					"iffalse"
				]
			},
			{
				"inlets": [
					"condition"
				],
				"arguments": [
					"iftrue",
					"iffalse"
				]
			},
			{
				"inlets": [
					"condition",
					"iffalse"
				],
				"arguments": [
					"iftrue"
				]
			},
			{
				"inlets": [
					"condition",
					"iftrue",
					"iffalse"
				],
				"arguments": {}
			}
		],
		"description": "Selects between the second and third inputs according to the boolean value of the first. If the first argument is true, the second argument will be output.  Otherwise, the third argument will be output.",
		"expr_type": "expr_type_special",
		"digest": "Conditional ternary operator",
		"seealso": [
			"gate",
			"mix",
			"selector",
			"smoothstep"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "result"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"?"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "cosh",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The hyperbolic cosine of the input",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The hyperbolic cosine of the input",
		"seealso": [
			"acosh",
			"sinh",
			"tanh"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "cosh(input)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "special",
		"expr_type": "expr_type_sample_signal",
		"stateful": false,
		"category": "input-output",
		"seealso": [
			"in"
		],
		"has_constant_expr": false,
		"inputs": {
			"input": {
				"label": "value to output",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "value to output",
				"name": "input",
				"default": "0"
			}
		},
		"op": "out",
		"expr_outputs": "generic",
		"digest": "Send output from a gen patcher",
		"outputs": [],
		"attributes": {
			"index": {
				"optional": true,
				"digest": "Outlet index number",
				"description": "Outlet index number",
				"type": "int",
				"default": 1
			}
		},
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": [
					"index"
				]
			},
			{
				"inlets": [
					"input"
				],
				"arguments": {}
			}
		],
		"aliases": {},
		"description": "Send output from a gen patcher"
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "range",
		"inputs": {
			"input": {
				"label": "input to wrap",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input to wrap",
				"name": "input",
				"default": "0"
			},
			"min": {
				"label": "lower bound",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "lower bound",
				"name": "min",
				"default": "0"
			},
			"max": {
				"label": "upper bound",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "upper bound",
				"name": "max",
				"default": "1"
			}
		},
		"op": "wrap",
		"arguments": [
			"input",
			"min",
			"max"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"input",
					"min",
					"max"
				]
			},
			{
				"inlets": [
					"input"
				],
				"arguments": [
					"min",
					"max"
				]
			},
			{
				"inlets": [
					"input",
					"min"
				],
				"arguments": [
					"max"
				]
			},
			{
				"inlets": [
					"input",
					"min",
					"max"
				],
				"arguments": {}
			}
		],
		"description": "Low and high values can be specified by arguments or by inlets. The default range is 0..1.",
		"expr_type": "expr_type_coerce",
		"digest": "Wrap input to a range within a low and high output value",
		"seealso": [
			"clamp",
			"fold",
			"scale"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "wrapped input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "constant",
		"inputs": {
			"value": {
				"label": "integer value",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "integer value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "int",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Either outputs a constant integer or converts its input value to an integer.",
		"expr_type": "expr_type_int_coerce",
		"digest": "constant integer / convert to integer",
		"seealso": [
			"bool",
			"constant",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "input converted to integer"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"i"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "sqrt1_2",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of sqrt1_2",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "sqrt1_2"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"SQRT1_2"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "route",
		"inputs": {
			"loval": {
				"label": "output if interp is 0",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "output if interp is 0",
				"name": "loval",
				"default": "0"
			},
			"hival": {
				"label": "output if interp is 1",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "output if interp is 1",
				"name": "hival",
				"default": "1"
			},
			"interp": {
				"label": "interpolation factor between inputs",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "interpolation factor between inputs",
				"name": "interp",
				"default": "0.5"
			}
		},
		"op": "smoothstep",
		"arguments": [
			"loval",
			"hival",
			"interp"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"loval",
					"hival",
					"interp"
				]
			},
			{
				"inlets": [
					"interp"
				],
				"arguments": [
					"loval",
					"hival"
				]
			},
			{
				"inlets": [
					"loval",
					"hival"
				],
				"arguments": [
					"interp"
				]
			},
			{
				"inlets": [
					"loval",
					"hival",
					"interp"
				],
				"arguments": {}
			}
		],
		"description": "Smoothstep is a scalar interpolation function commonly used in computer graphics. The function interpolates smoothly between two input values based on a third one that should be between the first two. The returned value is clamped between 0 and 1. The slope (i.e. derivative) of the smoothstep function starts at 0 and ends at 0.",
		"expr_type": "expr_type_coerce",
		"digest": "Smoothed fade of inputs",
		"seealso": [
			"gate",
			"mix",
			"selector",
			"switch"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "interpolated result"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "acosh",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The inverse hyperbolic cosine of the input",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The inverse hyperbolic cosine of the input",
		"seealso": [
			"asinh",
			"atanh",
			"cosh"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "acosh(in1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "step",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Akin to the GLSL step operator: 0 is returned if in1 < in2, and 1 is returned otherwise.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Returns not(in1 < in2)",
		"seealso": [
			"bool",
			"lt",
			"mix",
			"smoothstep"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "max(in1,in2)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "gtep",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns in1 if in1 is equal to or greater than in2, else returns zero.  Equivalent to in1*(in1 >= in2).",
		"expr_type": "expr_type_coerce",
		"digest": "Pass greater than or equals operator",
		"seealso": [
			"eqp",
			"gtp",
			"ltep",
			"ltp",
			"neqp"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "in1 or 0"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			">=p"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "logic",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "or",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns 1 if either in1 or in2 are nonzero.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Logical or operator",
		"seealso": [
			"and",
			"bool",
			"not",
			"xor"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"||"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "fastsin",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The approximated sine of the input (in radians)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The approximated sine of the input (in radians)",
		"seealso": [
			"fastcos",
			"fasttan"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "fastsin(input)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "illegal",
		"expr_type": "expr_type_illegal",
		"stateful": false,
		"category": "route",
		"seealso": [
			"receive"
		],
		"has_constant_expr": false,
		"inputs": {
			"value": {
				"label": "value to send",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to send",
				"name": "value",
				"default": "0"
			}
		},
		"op": "send",
		"expr_outputs": "generic",
		"digest": "Send values to a named receive.",
		"outputs": {},
		"attributes": {
			"name": {
				"optional": false,
				"digest": "Name to receive from",
				"description": "Name to receive from",
				"type": "string"
			}
		},
		"constructors": [
			{
				"inlets": [
					"value"
				],
				"arguments": [
					"name"
				]
			}
		],
		"aliases": [
			"s"
		],
		"description": "Send values to a named receive. The send/receive pairs are only visible to each other within the same gen patcher.  They will not send across gen patchers or sub-patchers."
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "fastcos",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The approximated cosine of the input (in radians)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The approximated cosine of the input (in radians)",
		"seealso": [
			"fastsin",
			"fasttan"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "fastcos(input)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "constant",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_sample_constant",
		"digest": "A constant value",
		"seealso": {
			"bool": true,
			"constant": true,
			"float": true,
			"int": true
		},
		"outputs": [
			{
				"name": "value",
				"label": "constant value"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {
			"value": {
				"optional": true,
				"digest": "the constant value",
				"description": "the constant value",
				"type": "float",
				"default": 0
			}
		},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "numeric",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "sign",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Positive input returns 1, negative input returns -1, zero returns itself.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Return the sign of the input",
		"seealso": [
			"abs",
			"absdiff",
			"sub"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "sign of input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "powers",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "log10",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The logarithm base 10 of the input",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The logarithm base 10 of the input",
		"seealso": [
			"exp",
			"exp2",
			"log",
			"log2",
			"pow",
			"sqrt"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "base 10 log of input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "powers",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "log",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The natural logarithm",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The natural logarithm",
		"seealso": [
			"exp",
			"exp2",
			"log10",
			"log2",
			"pow",
			"sqrt"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "natural log of input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"ln"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "lte",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns 1 if in1 is equal to or less than in2, else returns zero.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Less than or equals operator",
		"seealso": [
			"eq",
			"gt",
			"gte",
			"lt",
			"neq"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"<="
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "sqrt2",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of sqrt2",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "sqrt2"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"SQRT2"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "TWOPI",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of twopi",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "twopi"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"twopi"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "gte",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns 1 if in1 is equal to or greater than in2, else returns zero.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Greater than or equals operator",
		"seealso": [
			"eq",
			"gt",
			"lt",
			"lte",
			"neq"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			">="
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "e",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of e",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "e"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"E"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "asinh",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The inverse hyperbolic sine of the input",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The inverse hyperbolic sine of the input",
		"seealso": [
			"acosh",
			"atanh",
			"sinh"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "asinh(in1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "log2e",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of log2e",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "log2e"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"LOG2E"
		],
		"has_constant_expr": true
	},
	
	
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "fasttan",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The approximated tangent of the input (in radians)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The approximated tangent of the input (in radians)",
		"seealso": [
			"fastcos",
			"fastsin"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "fasttan(input)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "special",
		"expr_type": "expr_type_sample_signal",
		"stateful": false,
		"category": "route",
		"seealso": [
			"send"
		],
		"has_constant_expr": false,
		"inputs": {},
		"op": "receive",
		"expr_outputs": "generic",
		"digest": "Receive values from a named send.",
		"outputs": [
			{
				"name": "out1",
				"label": "value received"
			}
		],
		"attributes": {
			"name": {
				"optional": false,
				"digest": "Name to send to",
				"description": "Name to send to",
				"type": "string"
			}
		},
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"name"
				]
			}
		],
		"aliases": [
			"r"
		],
		"description": "Receive values from a named send. The send/receive pairs are only visible to each other within the same gen patcher.  They will not send across gen patchers or sub-patchers."
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "lt",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns 1 if in1 is less than than in2, else returns zero.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Less than operator",
		"seealso": [
			"eq",
			"gt",
			"gte",
			"lte",
			"neq"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"<"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "logic",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "and",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns 1 if both in1 and in2 are nonzero.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Logical and operator",
		"seealso": [
			"bool",
			"not",
			"or",
			"xor"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"&&"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "math",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "1"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "1"
			}
		},
		"op": "div",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Divide inputs",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Divide inputs",
		"seealso": [
			"add",
			"mod",
			"mul",
			"neg",
			"rdiv",
			"sub"
		],
		"outputs": [
			{
				"name": "quotient",
				"label": "in1 / in2"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"/"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "radtodeg",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of radtodeg",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "radtodeg"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"RADTODEG"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "logic",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "xor",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns 1 if one of in1 and in2 are nonzero, but not both.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Logical xor operator",
		"seealso": [
			"and",
			"bool",
			"not",
			"or"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"^^"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"opposite": {
				"label": "opposite side of triangle",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "opposite side of triangle",
				"name": "opposite",
				"default": "0"
			},
			"adjacent": {
				"label": "adjacent side of trangle",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "adjacent side of trangle",
				"name": "adjacent",
				"default": "1"
			}
		},
		"op": "atan2",
		"arguments": [
			"opposite",
			"adjacent"
		],
		"constructors": [
			{
				"inlets": [
					"adjacent"
				],
				"arguments": [
					"opposite"
				]
			},
			{
				"inlets": [
					"opposite",
					"adjacent"
				],
				"arguments": {}
			}
		],
		"description": "Returns the angle to the coordinate (x,y) in radians.",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The arctangent of the input coordinate",
		"seealso": [
			"acos",
			"asin",
			"atan",
			"tan"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "angle(radians)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "gt",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns 1 if in1 is greater than in2, else returns zero.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Greater than operator",
		"seealso": [
			"eq",
			"gte",
			"lt",
			"lte",
			"neq"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			">"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "comparison",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "gtp",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Returns in1 if in1 is greater than in2, else returns zero.  Equivalent to in1*(in1 > in2).",
		"expr_type": "expr_type_coerce",
		"digest": "Pass greater than operator",
		"seealso": [
			"eqp",
			"gtep",
			"ltep",
			"ltp",
			"neqp"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "in1 or 0"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			">p"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "pi",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of pi",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "pi"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"PI"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "phi",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of phi",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "phi"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"PHI"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "halfpi",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of halfpi",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "halfpi"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"HALFPI"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "logic",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "not",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "An input value of zero returns 1, any other value returns zero.",
		"expr_type": "expr_type_int_coerce",
		"digest": "logical negation operator",
		"seealso": [
			"and",
			"bool",
			"or",
			"xor"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"!"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "ignore",
		"inputs": {
			"input": {
				"label": "input value to pass",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input value to pass",
				"name": "input",
				"default": "0"
			}
		},
		"op": "pass",
		"arguments": [
			"input"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": {}
			}
		],
		"description": "Passes the value through unchanged.",
		"expr_type": "expr_type_special",
		"digest": "Passes the value through unchanged",
		"seealso": {},
		"outputs": [
			{
				"name": "out1",
				"label": "in1"
			}
		],
		"stateful": false,
		"expr_outputs": "special",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "asin",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The arc sine of the input (returns radians)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The arc sine of the input (returns radians)",
		"seealso": [
			"acos",
			"atan",
			"atan2",
			"sin"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "angle(radians)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "revop",
		"category": "math",
		"inputs": {
			"value1": {
				"label": "input value 1",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 1",
				"name": "value1",
				"default": "0"
			},
			"value2": {
				"label": "input value 2",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value 2",
				"name": "value2",
				"default": "0"
			}
		},
		"op": "rsub",
		"arguments": [
			"value1",
			"value2"
		],
		"constructors": [
			{
				"inlets": [
					"value1"
				],
				"arguments": [
					"value2"
				]
			},
			{
				"inlets": [
					"value1",
					"value2"
				],
				"arguments": {}
			}
		],
		"description": "Reverse subtraction (subtract first input from second)",
		"expr_type": "expr_type_coerce",
		"digest": "Reverse subtraction (subtract first input from second)",
		"seealso": [
			"rdiv",
			"rmod",
			"sub"
		],
		"outputs": [
			{
				"name": "difference",
				"label": "in2 - in1"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"!-"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "constant",
		"inputs": {
			"value": {
				"label": "floating point value",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "floating point value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "float",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Either outputs a constant float or converts its input value to a float",
		"expr_type": "expr_type_sample_coerce",
		"digest": "constant float / convert to float",
		"seealso": [
			"bool",
			"constant",
			"int"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "input converted to floating point number"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"f"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "special",
		"expr_type": "expr_type_coerce",
		"stateful": false,
		"category": "subpatcher",
		"seealso": [
			"param",
			"gen"
		],
		"has_constant_expr": false,
		"inputs": {
			"value": {
				"label": "setparam input",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "setparam input",
				"name": "value",
				"default": "0"
			}
		},
		"op": "setparam",
		"expr_outputs": "variadic",
		"digest": "Set a subpatcher param",
		"outputs": {},
		"attributes": {
			"name": {
				"optional": false,
				"digest": "Name of parameter to set",
				"description": "Name of parameter to set",
				"type": "string"
			}
		},
		"constructors": [
			{
				"inlets": [
					"value"
				],
				"arguments": [
					"name"
				]
			}
		],
		"aliases": {},
		"description": "Set a param in a subpatcher from a parent patcher"
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "tan",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The tangent of the input (in radians)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The tangent of the input (in radians)",
		"seealso": [
			"atan",
			"atan2",
			"cos",
			"sin"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "tan(input)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "INVPI",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "A constant value",
		"expr_type": "expr_type_constant",
		"digest": "The constant value of invpi",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "invpi"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"invpi"
		],
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "numeric",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "trunc",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Round the value down to the next smaller integer (toward zero)",
		"expr_type": "expr_type_int_coerce",
		"digest": "Round the value down to the next smaller integer (toward zero)",
		"seealso": [
			"ceil",
			"floor",
			"fract"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "input rounded down"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "trigonometry",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "cos",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The cosine of the input (in radians)",
		"expr_type": "expr_type_sample_coerce",
		"digest": "The cosine of the input (in radians)",
		"seealso": [
			"acos",
			"sin",
			"tan"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "cos(input)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "common",
		"box_expr": "generic",
		"category": "math",
		"inputs": {
			"value": {
				"label": "input value",
				"optional": true,
				"type": {
					"name": "vector",
					"params": [
						"float"
					]
				},
				"digest": "input value",
				"name": "value",
				"default": "0"
			}
		},
		"op": "neg",
		"arguments": [
			"value"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "Negate input",
		"expr_type": "expr_type_coerce",
		"digest": "Negate input",
		"seealso": [
			"add",
			"div",
			"mod",
			"mul",
			"sub"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "negated input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "waveform",
		"inputs": {
			"multiplier": {
				"label": "multiplier to scale phase by",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "multiplier to scale phase by",
				"name": "multiplier",
				"default": "1"
			},
			"phase": {
				"label": "phase to be scaled (0 to 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to be scaled (0 to 1)",
				"name": "phase",
				"default": "0"
			}
		},
		"op": "rate",
		"arguments": [
			"phase",
			"multiplier"
		],
		"constructors": [
			{
				"inlets": [
					"phase"
				],
				"arguments": [
					"multiplier"
				]
			},
			{
				"inlets": [
					"phase",
					"multiplier"
				],
				"arguments": {}
			}
		],
		"description": "The rate operator time-scales an input phase (such as from a phasor) by a multiplier. Multipliers less than 1 create several ramps per phase cycle.",
		"expr_type": "expr_type_sample_signal",
		"digest": "Time-scale the output of a phasor",
		"seealso": [
			"phasor",
			"triangle"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "ramp cycle (0 to 1)"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"sync": {
				"optional": true,
				"enums": {
					"lock": true,
					"off": true,
					"cycle": true
				},
				"digest": "determine how the rate stays in sync with the input phasor",
				"description": "If sync is set to lock, the output phase will be recalculated whenever the input multiplier changes to maintain a smooth ramp. If the sync is set to cycle, this recalculation is deferred until the next cycle of the input phasor.",
				"type": "enum",
				"default": "off"
			}
		},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_special",
		"stateful": false,
		"category": "buffer",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"has_constant_expr": false,
		"inputs": {
			"wave_phase": {
				"label": "phase to read (between start and end indices)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to read (between start and end indices)",
				"name": "wave_phase",
				"default": "0"
			},
			"phase": {
				"label": "phase to read (between 0 and 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to read (between 0 and 1)",
				"name": "phase",
				"default": "0"
			},
			"wave_start": {
				"label": "wave start index (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave start index (samples)",
				"name": "wave_start",
				"default": "0"
			},
			"index": {
				"label": "sample index to read",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "sample index to read",
				"name": "index",
				"default": "0"
			},
			"signal": {
				"label": "value to lookup (between -1 and 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to lookup (between -1 and 1)",
				"name": "signal",
				"default": "0"
			},
			"channel_offset": {
				"label": "channel_offset (zero-based)",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "channel_offset (zero-based)",
				"name": "channel_offset",
				"default": "0"
			},
			"name": {
				"label": "name of buffer",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer",
				"name": "name",
				"default": 0
			},
			"wave_end": {
				"label": "wave end index (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave end index (samples)",
				"name": "wave_end",
				"default": "512"
			}
		},
		"op": "nearest",
		"expr_outputs": "special",
		"digest": "Multi-channel lookup a data/buffer object (no interpolation)",
		"outputs": [
			{
				"name": "out1",
				"label": "sampled value"
			},
			{
				"name": "out2",
				"label": "index (in samples)"
			}
		],
		"attributes": {
			"channelmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle invalid channel indices",
				"description": "Handle invalid channel indices: \"ignore\" returns zero, \"wrap\" wraps the indices back into channels of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the channels available.",
				"type": "enum",
				"default": "ignore"
			},
			"interp": {
				"optional": true,
				"enums": {
					"none": true,
					"cosine": true,
					"cubic": true,
					"step": true,
					"linear": true,
					"spline": true
				},
				"digest": "Specify the interpolation mode",
				"description": "Specify the interpolation mode: \"none\" and \"step\" perform no interpolation, \"linear\" performs two-point linear interpolation, \"cosine\" performs two-point cosine interpolation, \"cubic\" performs four-point cubic interpolation, and \"spline\" performs four-point Catmull-Rom spline interpolation.",
				"type": "enum",
				"default": "none"
			},
			"channels": {
				"optional": true,
				"digest": "Specify the number of channels to read",
				"description": "Specify the number of channels to read",
				"type": "int",
				"default": 1
			},
			"boundmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle out-of-range indices",
				"description": "Handle out-of-range indices: \"ignore\" returns zero, \"wrap\" wraps the indices back into the range of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the buffer limits.",
				"type": "enum",
				"default": "ignore"
			},
			"index": {
				"optional": true,
				"enums": {
					"phase": true,
					"wave": true,
					"samples": true,
					"lookup": true,
					"signal": true
				},
				"digest": "Specify how to index the buffer",
				"description": "Specify how to index the buffer: \"samples\" indexes by sample offset into the buffer, \"phase\" converts a signal in the range of 0..1 to span the whole buffer, \"lookup\" or \"signal\" converts a signal in the range -1..1 to span the whole buffer, \"wave\" uses two additional inlets to specify start and end indices of a section of the buffer (in samples), and converts a signal in the range of 0..1 to span this section.",
				"type": "enum",
				"default": "phase"
			}
		},
		"constructors": [
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"index",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"samples",
						"peek"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"index",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"samples",
						"peek"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"phase",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"phase"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"phase",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"phase"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"signal",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"signal",
						"lookup"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"signal",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"signal",
						"lookup"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"wave_phase",
					"wave_start",
					"wave_end",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"wave"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"wave_phase",
					"wave_start",
					"wave_end",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"wave"
					]
				}
			}
		],
		"aliases": {},
		"description": "Multi-channel lookup a data/buffer object (no interpolation). The first argument should be a name of a data or buffer object in the gen patcher. The second argument specifies the number of output channels. The input phase ranges from 0 to 1, and wraps outside this range. The last inlet specifies a channel offset (default 0)."
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "buffer",
		"inputs": {
			"name": {
				"label": "name of buffer",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer",
				"name": "name",
				"default": 0
			}
		},
		"op": "channels",
		"arguments": [
			"name"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"name"
				]
			}
		],
		"description": "The number of channels of a data/buffer object. The first argument should be a name of a data or buffer object in the gen patcher.",
		"expr_type": "expr_type_special",
		"digest": "The number of channels of a data/buffer object",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "number of channels"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "SAMPLERATE",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "The DSP samplerate",
		"expr_type": "expr_type_constant",
		"digest": "The DSP samplerate",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "samplerate"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"samplerate"
		],
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "convert",
		"inputs": {
			"freq": {
				"label": "frequency in Hz",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "frequency in Hz",
				"name": "freq",
				"default": "440"
			},
			"tuning": {
				"label": "tuning base in Hz",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "tuning base in Hz",
				"name": "tuning",
				"default": "440"
			}
		},
		"op": "ftom",
		"arguments": [
			"freq",
			"tuning"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"freq",
					"tuning"
				]
			},
			{
				"inlets": [
					"tuning"
				],
				"arguments": [
					"freq"
				]
			},
			{
				"inlets": [
					"freq",
					"tuning"
				],
				"arguments": {}
			}
		],
		"description": "Frequency given in Hertz is converted to MIDI note number (0-127). Fractional note numbers are supported. The second input sets the tuning base (default 440).",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Convert frequency to MIDI note number",
		"seealso": [
			"t60",
			"t60time",
			"atodb",
			"dbtoa",
			"ftom",
			"mtof",
			"mstosamps",
			"sampstoms"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "MIDI note number"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "buffer",
		"inputs": {
			"name": {
				"label": "name of buffer",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer",
				"name": "name",
				"default": 0
			}
		},
		"op": "dim",
		"arguments": [
			"name"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"name"
				]
			}
		],
		"description": "The length (in samples) of a data/buffer object. The first argument should be a name of a data or buffer object in the gen patcher.",
		"expr_type": "expr_type_special",
		"digest": "The length (in samples) of a data/buffer object",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "length in samples"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "special",
		"category": "buffer",
		"inputs": {
			"name": {
				"label": "name of buffer in gen",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer in gen",
				"name": "name",
				"default": 0
			},
			"buffername": {
				"label": "name of buffer in Max",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer in Max",
				"name": "buffername",
				"default": 0
			}
		},
		"op": "buffer",
		"arguments": [
			"buffername"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"name",
					"buffername"
				]
			},
			{
				"inlets": {},
				"arguments": [
					"name"
				]
			}
		],
		"description": "References an external named buffer~ object. The first argument specifies a name by which to refer to this data in other objects in the gen patcher (such as peek and poke); the second optional argument specifies the name of the external buffer~ object to reference (if ommitted, the first argument name is used). The first outlet sends the length of the buffer in samples; the second outlet sends the number of channels.",
		"expr_type": "expr_type_special",
		"digest": "A reference to an external buffer~ object",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "length in samples"
			},
			{
				"name": "out2",
				"label": "number of channels"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "VECTORSIZE",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "The DSP vectorsize",
		"expr_type": "expr_type_constant",
		"digest": "The DSP vectorsize",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "vectorsize"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"vectorsize"
		],
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_special",
		"stateful": false,
		"category": "buffer",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"has_constant_expr": false,
		"inputs": {
			"wave_phase": {
				"label": "phase to read (between start and end indices)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to read (between start and end indices)",
				"name": "wave_phase",
				"default": "0"
			},
			"phase": {
				"label": "phase to read (between 0 and 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to read (between 0 and 1)",
				"name": "phase",
				"default": "0"
			},
			"wave_start": {
				"label": "wave start index (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave start index (samples)",
				"name": "wave_start",
				"default": "0"
			},
			"index": {
				"label": "sample index to read",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "sample index to read",
				"name": "index",
				"default": "0"
			},
			"signal": {
				"label": "value to lookup (between -1 and 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to lookup (between -1 and 1)",
				"name": "signal",
				"default": "0"
			},
			"channel_offset": {
				"label": "channel_offset (zero-based)",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "channel_offset (zero-based)",
				"name": "channel_offset",
				"default": "0"
			},
			"name": {
				"label": "name of buffer",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer",
				"name": "name",
				"default": 0
			},
			"wave_end": {
				"label": "wave end index (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave end index (samples)",
				"name": "wave_end",
				"default": "512"
			}
		},
		"op": "wave",
		"expr_outputs": "special",
		"digest": "Wavetable synthesis using a data/buffer object",
		"outputs": [
			{
				"name": "out1",
				"label": "sampled value"
			},
			{
				"name": "out2",
				"label": "index (in samples)"
			}
		],
		"attributes": {
			"channelmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle invalid channel indices",
				"description": "Handle invalid channel indices: \"ignore\" returns zero, \"wrap\" wraps the indices back into channels of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the channels available.",
				"type": "enum",
				"default": "clamp"
			},
			"interp": {
				"optional": true,
				"enums": {
					"none": true,
					"cosine": true,
					"cubic": true,
					"step": true,
					"linear": true,
					"spline": true
				},
				"digest": "Specify the interpolation mode",
				"description": "Specify the interpolation mode: \"none\" and \"step\" perform no interpolation, \"linear\" performs two-point linear interpolation, \"cosine\" performs two-point cosine interpolation, \"cubic\" performs four-point cubic interpolation, and \"spline\" performs four-point Catmull-Rom spline interpolation.",
				"type": "enum",
				"default": "linear"
			},
			"channels": {
				"optional": true,
				"digest": "Specify the number of channels to read",
				"description": "Specify the number of channels to read",
				"type": "int",
				"default": 1
			},
			"boundmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle out-of-range indices",
				"description": "Handle out-of-range indices: \"ignore\" returns zero, \"wrap\" wraps the indices back into the range of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the buffer limits.",
				"type": "enum",
				"default": "wrap"
			},
			"index": {
				"optional": true,
				"enums": {
					"phase": true,
					"wave": true,
					"samples": true,
					"lookup": true,
					"signal": true
				},
				"digest": "Specify how to index the buffer",
				"description": "Specify how to index the buffer: \"samples\" indexes by sample offset into the buffer, \"phase\" converts a signal in the range of 0..1 to span the whole buffer, \"lookup\" or \"signal\" converts a signal in the range -1..1 to span the whole buffer, \"wave\" uses two additional inlets to specify start and end indices of a section of the buffer (in samples), and converts a signal in the range of 0..1 to span this section.",
				"type": "enum",
				"default": "wave"
			}
		},
		"constructors": [
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"index",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"samples",
						"peek"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"index",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"samples",
						"peek"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"phase",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"phase"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"phase",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"phase"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"signal",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"signal",
						"lookup"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"signal",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"signal",
						"lookup"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"wave_phase",
					"wave_start",
					"wave_end",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"wave"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"wave_phase",
					"wave_start",
					"wave_end",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"wave"
					]
				}
			}
		],
		"aliases": {},
		"description": "Wavetable synthesis using a data/buffer object. The first argument should be a name of a data or buffer object in the gen patcher. The second argument specifies the number of output channels. The first inlet specifies phase (0..1), while the second and third inlets specify start/end sample positions within the data/buffer. The last inlet specifies a channel offset (default 0)."
	},
	{
		"domain": "dsp",
		"box_expr": "special",
		"category": "FFT",
		"inputs": {},
		"op": "fftinfo",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "fftinfo gets constant data about the FFT frames in a patcher loaded by pfft~. If it is used in a patcher that is not loaded by pfft~, it returns default constants instead.",
		"expr_type": "expr_type_int_control",
		"digest": "Report FFT constant data about a patcher loaded by pfft~",
		"seealso": [
			"cartopol",
			"poltocar",
			"fftinfo",
			"fftsize",
			"ffthop",
			"fftoffset",
			"fftfullspect",
			"samplerate",
			"vectorsize"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "FFT frame size"
			},
			{
				"name": "out2",
				"label": "Spectral frame size (half frame size)"
			},
			{
				"name": "out3",
				"label": "FFT hop size"
			},
			{
				"name": "out4",
				"label": "Full spectrum flag (0/1)"
			},
			{
				"name": "out5",
				"label": "FFT offset"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "filter",
		"inputs": {
			"input": {
				"label": "input to sample",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input to sample",
				"name": "input",
				"default": "0"
			},
			"control": {
				"label": "control signal",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "control signal",
				"name": "control",
				"default": "0"
			},
			"thresh": {
				"label": "threshold",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "threshold",
				"name": "thresh",
				"default": "0"
			}
		},
		"op": "sah",
		"arguments": [
			"input",
			"control",
			"thresh"
		],
		"constructors": [
			{
				"inlets": [
					"control"
				],
				"arguments": [
					"input",
					"thresh"
				]
			},
			{
				"inlets": [
					"input",
					"control"
				],
				"arguments": [
					"thresh"
				]
			},
			{
				"inlets": [
					"input",
					"control",
					"thresh"
				],
				"arguments": {}
			}
		],
		"description": "The first inlet is the 'input' and the second inlet is the 'control'. When the control makes a transition from being at or below the trigger value to being above the trigger threshold, the input is sampled. The sampled value is output until another control transition occurs, at which point the input is sampled again. The default threshold value is 0, but can be specified as the last inlet/argument. The @init attribute sets the initial previous value to compare to (default 0).",
		"expr_type": "expr_type_special",
		"digest": "Sample and hold operator (Schmitt trigger)",
		"seealso": [
			"latch",
			"train",
			"slide",
			"delta",
			"change",
			"sah"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "current or previous"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"init": {
				"optional": true,
				"digest": "Specify the initially held value",
				"description": "Specify the initially held value",
				"type": "float",
				"default": 0
			}
		},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "integrator",
		"inputs": {
			"max": {
				"label": "count limit (zero means no limit)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "count limit (zero means no limit)",
				"name": "max",
				"default": "0"
			},
			"reset": {
				"label": "non-zero value resets the count",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "non-zero value resets the count",
				"name": "reset",
				"default": "0"
			},
			"incr": {
				"label": "amount to add per sample",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "amount to add per sample",
				"name": "incr",
				"default": "1"
			}
		},
		"op": "counter",
		"arguments": [
			"incr",
			"reset",
			"max"
		],
		"constructors": [
			{
				"inlets": [
					"reset"
				],
				"arguments": [
					"incr",
					"max"
				]
			},
			{
				"inlets": [
					"incr",
					"reset"
				],
				"arguments": [
					"max"
				]
			},
			{
				"inlets": [
					"incr",
					"reset",
					"max"
				],
				"arguments": {}
			}
		],
		"description": "Accumulates and outputs a stored count, similarly to Max's counter object, but triggered at sample-rate. The amount to accumulate per sample is set by the first input (incr). The count can be reset by a non-zero value in the second input (reset). The third inlet (max) sets a maximum value; the counter will wrap if it reaches this value. However if the maximum value is set to 0 (the default), the counter will assume no limit and count indefinitely. The first outlet outputs the current count, the second outlet outputs 1 when the count wraps at the maximum and zero otherwise, and the third outlet outputs the number of wraps (the carry count).",
		"expr_type": "expr_type_special",
		"digest": "A sample-rate counter",
		"seealso": [
			"counter",
			"plusequals",
			"accum",
			"mulequals",
			"history"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "running total"
			},
			{
				"name": "out2",
				"label": "carry flag (counter hit maximum)"
			},
			{
				"name": "out3",
				"label": "carry count"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"init": {
				"optional": true,
				"digest": "Specify the initial count",
				"description": "Specify the initial count",
				"type": "float",
				"default": 0
			}
		},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_sample_coerce",
		"stateful": false,
		"category": "convert",
		"seealso": [
			"t60",
			"t60time",
			"atodb",
			"dbtoa",
			"ftom",
			"mtof",
			"mstosamps",
			"sampstoms"
		],
		"has_constant_expr": true,
		"inputs": {
			"period": {
				"label": "period in samples",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "period in samples",
				"name": "period",
				"default": "1"
			}
		},
		"op": "sampstoms",
		"arguments": [
			"period"
		],
		"expr_outputs": "generic",
		"digest": "Convert period in samples to milliseconds",
		"attributes": {},
		"constructors": [
			{
				"inlets": [
					"period"
				],
				"arguments": {}
			}
		],
		"aliases": {},
		"outputs": [
			{
				"name": "out1",
				"label": "period in milliseconds"
			}
		]
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "waveform",
		"inputs": {
			"onset": {
				"label": "onset phase",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "onset phase",
				"name": "onset",
				"default": "0."
			},
			"width": {
				"label": "pulse width",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "pulse width",
				"name": "width",
				"default": "0.5"
			},
			"period": {
				"label": "period (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "period (samples)",
				"name": "period",
				"default": "samplerate"
			}
		},
		"op": "train",
		"arguments": [
			"period",
			"width",
			"onset"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"period",
					"width",
					"onset"
				]
			},
			{
				"inlets": [
					"onset"
				],
				"arguments": [
					"period",
					"width"
				]
			},
			{
				"inlets": [
					"width",
					"onset"
				],
				"arguments": [
					"period"
				]
			},
			{
				"inlets": [
					"period",
					"width",
					"onset"
				],
				"arguments": {}
			}
		],
		"description": "train~ generates a pulse signal whose period is specifiable in terms of samples. The first input sets the pulse period (in samples). The second input sets the pulse width (default 0.5). The third inlet sets the phase of the 'on' portion (default 0.)",
		"expr_type": "expr_type_sample_signal",
		"digest": "Pulse train generator",
		"seealso": [
			"phasor",
			"triangle",
			"sah"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "pulse train"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"phase": {
				"optional": true,
				"digest": "Specify the initial phase (in samples)",
				"description": "Specify the initial phase (in samples)",
				"type": "float",
				"default": 0
			}
		},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_sample_coerce",
		"stateful": false,
		"category": "convert",
		"seealso": [
			"t60",
			"t60time",
			"atodb",
			"dbtoa",
			"ftom",
			"mtof",
			"mstosamps",
			"sampstoms"
		],
		"has_constant_expr": true,
		"inputs": {
			"db": {
				"label": "gain/attenuation dB",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "gain/attenuation dB",
				"name": "db",
				"default": "0"
			}
		},
		"op": "dbtoa",
		"arguments": [
			"db"
		],
		"expr_outputs": "generic",
		"digest": "Convert deciBel value to linear amplitude",
		"attributes": {},
		"constructors": [
			{
				"inlets": [
					"db"
				],
				"arguments": {}
			}
		],
		"aliases": {},
		"outputs": [
			{
				"name": "out1",
				"label": "amplitude (linear scale)"
			}
		]
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_special",
		"stateful": false,
		"category": "buffer",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"has_constant_expr": false,
		"inputs": {
			"wave_phase": {
				"label": "phase to read (between start and end indices)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to read (between start and end indices)",
				"name": "wave_phase",
				"default": "0"
			},
			"phase": {
				"label": "phase to read (between 0 and 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to read (between 0 and 1)",
				"name": "phase",
				"default": "0"
			},
			"wave_start": {
				"label": "wave start index (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave start index (samples)",
				"name": "wave_start",
				"default": "0"
			},
			"index": {
				"label": "sample index to read",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "sample index to read",
				"name": "index",
				"default": "0"
			},
			"signal": {
				"label": "value to lookup (between -1 and 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to lookup (between -1 and 1)",
				"name": "signal",
				"default": "0"
			},
			"channel_offset": {
				"label": "channel_offset (zero-based)",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "channel_offset (zero-based)",
				"name": "channel_offset",
				"default": "0"
			},
			"name": {
				"label": "name of buffer",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer",
				"name": "name",
				"default": 0
			},
			"wave_end": {
				"label": "wave end index (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave end index (samples)",
				"name": "wave_end",
				"default": "512"
			}
		},
		"op": "sample",
		"expr_outputs": "special",
		"digest": "Linear interpolated multi-channel lookup of a data/buffer object",
		"outputs": [
			{
				"name": "out1",
				"label": "sampled value"
			},
			{
				"name": "out2",
				"label": "index (in samples)"
			}
		],
		"attributes": {
			"channelmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle invalid channel indices",
				"description": "Handle invalid channel indices: \"ignore\" returns zero, \"wrap\" wraps the indices back into channels of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the channels available.",
				"type": "enum",
				"default": "ignore"
			},
			"interp": {
				"optional": true,
				"enums": {
					"none": true,
					"cosine": true,
					"cubic": true,
					"step": true,
					"linear": true,
					"spline": true
				},
				"digest": "Specify the interpolation mode",
				"description": "Specify the interpolation mode: \"none\" and \"step\" perform no interpolation, \"linear\" performs two-point linear interpolation, \"cosine\" performs two-point cosine interpolation, \"cubic\" performs four-point cubic interpolation, and \"spline\" performs four-point Catmull-Rom spline interpolation.",
				"type": "enum",
				"default": "linear"
			},
			"channels": {
				"optional": true,
				"digest": "Specify the number of channels to read",
				"description": "Specify the number of channels to read",
				"type": "int",
				"default": 1
			},
			"boundmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle out-of-range indices",
				"description": "Handle out-of-range indices: \"ignore\" returns zero, \"wrap\" wraps the indices back into the range of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the buffer limits.",
				"type": "enum",
				"default": "ignore"
			},
			"index": {
				"optional": true,
				"enums": {
					"phase": true,
					"wave": true,
					"samples": true,
					"lookup": true,
					"signal": true
				},
				"digest": "Specify how to index the buffer",
				"description": "Specify how to index the buffer: \"samples\" indexes by sample offset into the buffer, \"phase\" converts a signal in the range of 0..1 to span the whole buffer, \"lookup\" or \"signal\" converts a signal in the range -1..1 to span the whole buffer, \"wave\" uses two additional inlets to specify start and end indices of a section of the buffer (in samples), and converts a signal in the range of 0..1 to span this section.",
				"type": "enum",
				"default": "phase"
			}
		},
		"constructors": [
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"index",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"samples",
						"peek"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"index",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"samples",
						"peek"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"phase",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"phase"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"phase",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"phase"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"signal",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"signal",
						"lookup"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"signal",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"signal",
						"lookup"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"wave_phase",
					"wave_start",
					"wave_end",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"wave"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"wave_phase",
					"wave_start",
					"wave_end",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"wave"
					]
				}
			}
		],
		"aliases": {},
		"description": "Linear interpolated multi-channel lookup of a data/buffer object. The first argument should be a name of a data or buffer object in the gen patcher. The second argument specifies the number of output channels. The last inlet specifies a channel offset (default 0)."
	},
	
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "integrator",
		"inputs": {
			"incr": {
				"label": "amount to scale by",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "amount to scale by",
				"name": "incr",
				"default": "0"
			},
			"reset": {
				"label": "nonzero reset",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "nonzero reset",
				"name": "reset",
				"default": "0"
			}
		},
		"op": "mulequals",
		"arguments": [
			"incr",
			"reset"
		],
		"constructors": [
			{
				"inlets": [
					"reset"
				],
				"arguments": [
					"incr"
				]
			},
			{
				"inlets": [
					"incr",
					"reset"
				],
				"arguments": {}
			}
		],
		"description": "The object multiplies by, and then outputs, an internal value. This occurs at sample-rate, so the stored value can grow very large or very small, very fast. The value to be multiplied by is specified by either the first inlet or argument. The internal sum can be reset to the minimum by sending a nonzero value to the right-most inlet. The minimum value is 0 by default, but can be changed with the @min attribute. An optional maximum value can be specified with the @max attribute; values will wrap at the maximum.",
		"expr_type": "expr_type_coerce_signal",
		"digest": "A multiplicative accumulator",
		"seealso": [
			"counter",
			"plusequals",
			"accum",
			"mulequals",
			"history"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "running total"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"max": {
				"optional": true,
				"digest": "Specify optional maximum value (causes counter wrapping)",
				"description": "Specify optional maximum value. If @max is given, the count will reset to @min whenever it reaches @max.",
				"type": "float"
			},
			"init": {
				"optional": true,
				"digest": "Specify initial value stored in the accumulator",
				"description": "Specify initial value stored in the accumulator",
				"type": "float",
				"default": 0
			},
			"min": {
				"optional": true,
				"digest": "Specify reset value",
				"description": "Specifies the internal count when the reset signal triggers (or the @max value is reached, if @max is specified.)",
				"type": "float",
				"default": 0
			},
			"resetmode": {
				"optional": true,
				"enums": {
					"pre": true,
					"post": true
				},
				"digest": "Specify how the reset signal is handled",
				"description": "Specifies whether the count is reset before or after the accumulation. If the mode is 'pre', the count is reset before accumulating the new input. The default is 'post' (after accumulation).",
				"type": "enum",
				"default": "post"
			}
		},
		"aliases": [
			"*="
		],
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "buffer",
		"inputs": {
			"phase": {
				"label": "index to write (0-1 phase over buffer)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "index to write (0-1 phase over buffer)",
				"name": "phase",
				"default": "0"
			},
			"overdub": {
				"label": "overdub mix: amount of original signal to preserve",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "overdub mix: amount of original signal to preserve",
				"name": "overdub",
				"default": "0"
			},
			"value": {
				"label": "value to write",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to write",
				"name": "value",
				"default": "0"
			},
			"channel": {
				"label": "channel to write (zero-based)",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "channel to write (zero-based)",
				"name": "channel",
				"default": "0"
			},
			"name": {
				"label": "name of buffer",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer",
				"name": "name",
				"default": 0
			},
			"position": {
				"label": "position to write (units depend on @index attribute)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "position to write (units depend on @index attribute)",
				"name": "position",
				"default": "0"
			}
		},
		"op": "poke",
		"arguments": [
			"name",
			"value",
			"position",
			"channel",
			"overdub"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"name",
					"value",
					"position",
					"channel",
					"overdub"
				]
			},
			{
				"inlets": [
					"overdub"
				],
				"arguments": [
					"name",
					"value",
					"position",
					"channel"
				]
			},
			{
				"inlets": [
					"value",
					"overdub"
				],
				"arguments": [
					"name",
					"position",
					"channel"
				]
			},
			{
				"inlets": [
					"value",
					"position",
					"overdub"
				],
				"arguments": [
					"name",
					"channel"
				]
			},
			{
				"inlets": [
					"value",
					"position",
					"channel",
					"overdub"
				],
				"arguments": [
					"name"
				]
			}
		],
		"description": "Write values into a data/buffer object. The first argument should be a name of a data or buffer object in the gen patcher. The second argument (or third inlet if omitted) specifies which channel to use. The first inlet specifies a value to write, while the second inlet specifies the sample index within the data/buffer. If the index is out of range, no value is written.",
		"expr_type": "expr_type_special",
		"digest": "Write values into a data/buffer object",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"outputs": {},
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {
			"overdubmode": {
				"optional": true,
				"enums": {
					"accum": true,
					"mix": true
				},
				"digest": "How overdubbing is applied",
				"description": "How overdubbing is applied: \"mix\" crossfades between current and new sample according to the overdub factor, \"accum\" scales the new sample by the overdub factor and adds it to the current sample.",
				"type": "enum",
				"default": "accum"
			},
			"channelmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle invalid channel indices",
				"description": "Handle invalid channel indices: \"ignore\" prevents writing, \"wrap\" wraps the indices back into channels of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the channels available.",
				"type": "enum",
				"default": "ignore"
			},
			"boundmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle out-of-range indices",
				"description": "Handle out-of-range indices: \"ignore\" prevents writing, \"wrap\" wraps the indices back into the range of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the buffer limits.",
				"type": "enum",
				"default": "ignore"
			},
			"index": {
				"optional": true,
				"enums": {
					"samples": true,
					"phase": true,
					"lookup": true,
					"signal": true
				},
				"digest": "How to index the buffer",
				"description": "Specify how to index the buffer: \"samples\" indexes by sample offset into the buffer, \"phase\" converts a signal in the range of 0..1 to span the whole buffer, \"lookup\" or \"signal\" converts a signal in the range -1..1 to span the whole buffer.",
				"type": "enum",
				"default": "samples"
			}
		},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "FFTSIZE",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "The pfft~ FFT frame size",
		"expr_type": "expr_type_constant",
		"digest": "The pfft~ FFT frame size",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "fftsize"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"fftsize"
		],
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "global",
		"category": "global",
		"inputs": {},
		"op": "elapsed",
		"arguments": {},
		"constructors": [
			{
				"inlets": [],
				"arguments": {}
			}
		],
		"description": "The number of samples elapsed since the patcher DSP began, or since the last reset.",
		"expr_type": "expr_type_special",
		"digest": "Elapsed time (samples) since load/reset",
		"seealso": [
			"fftinfo",
			"samplerate",
			"vectorsize"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "Elapsed time (samples)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	
	{
		"domain": "dsp",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "FFTOFFSET",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "The pfft~ FFT offset",
		"expr_type": "expr_type_constant",
		"digest": "The pfft~ FFT offset",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "fftoffset"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"fftoffset"
		],
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "FFTHOP",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "The pfft~ FFT hop size",
		"expr_type": "expr_type_constant",
		"digest": "The pfft~ FFT hop size",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "ffthop"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"ffthop"
		],
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "waveform",
		"inputs": {
			"duty": {
				"label": "duty cycle (0 to 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "duty cycle (0 to 1)",
				"name": "duty",
				"default": "0.5"
			},
			"phase": {
				"label": "phase (0 to 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase (0 to 1)",
				"name": "phase",
				"default": "0"
			}
		},
		"op": "triangle",
		"arguments": [
			"phase",
			"duty"
		],
		"constructors": [
			{
				"inlets": [
					"phase"
				],
				"arguments": [
					"duty"
				]
			},
			{
				"inlets": [
					"phase",
					"duty"
				],
				"arguments": {}
			}
		],
		"description": "A triangle/ramp wavetable with input to change phase offset of the peak value. The phase ranges from 0 to 1 (and wraps outside these values). With a duty cycle of 0, it produces a descending sawtooth; with a duty cycle of 1 it produces ascending sawtooth; with a duty cycle of 0.5 it produces a triangle waveform. Output values always bounded in 0 to 1.",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Triangle/ramp wavetable",
		"seealso": [
			"phasor",
			"rate",
			"train"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "triangle wave"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_sample_coerce",
		"stateful": false,
		"category": "filter",
		"seealso": [
			"wrap"
		],
		"has_constant_expr": true,
		"inputs": {
			"phase": {
				"label": "input to wrap",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input to wrap",
				"name": "phase",
				"default": "0"
			}
		},
		"op": "phasewrap",
		"arguments": [
			"phase"
		],
		"expr_outputs": "generic",
		"digest": "Wrap input to the range -pi to +pi",
		"attributes": {},
		"constructors": [
			{
				"inlets": [
					"phase"
				],
				"arguments": {}
			}
		],
		"aliases": {},
		"outputs": [
			{
				"name": "out1",
				"label": "wrapped angular phase"
			}
		]
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "convert",
		"inputs": {
			"note": {
				"label": "MIDI note number",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "MIDI note number",
				"name": "note",
				"default": "69"
			},
			"tuning": {
				"label": "tuning base in Hz",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "tuning base in Hz",
				"name": "tuning",
				"default": "440"
			}
		},
		"op": "mtof",
		"arguments": [
			"note",
			"tuning"
		],
		"constructors": [
			{
				"inlets": [
					"tuning"
				],
				"arguments": [
					"note"
				]
			},
			{
				"inlets": [
					"note",
					"tuning"
				],
				"arguments": {}
			}
		],
		"description": "MIDI note number (0-127) is converted to frequency in Hertz. Fractional note numbers are supported. The second input sets the tuning base (default 440).",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Convert MIDI note number to frequency",
		"seealso": [
			"t60",
			"t60time",
			"atodb",
			"dbtoa",
			"ftom",
			"mtof",
			"mstosamps",
			"sampstoms"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "frequency in Hz"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "dsp",
		"inputs": {
			"input": {
				"label": "value to test for NaNs",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to test for NaNs",
				"name": "input",
				"default": "0"
			}
		},
		"op": "isnan",
		"arguments": [
			"input"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": {}
			}
		],
		"description": "This operator detects the presence of NaN values, returning 1 if the input is NaN, and zero otherwise. A NaN (Not a Number) is a floating point data value which represents an undefined or unrepresentable value, such as the result of dividing by zero. Computations on NaNs produce more NaNs, and so it is often preferable to replace the NaN with a zero value. Note that division and modulo operators in gen~ protect against generating NaNs by default.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Return 1 if the input is NaN (Not a Number), else return zero.",
		"seealso": [
			"isdenorm",
			"fixdenorm",
			"isnan",
			"fixnan",
			"dcblock"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "dsp",
		"inputs": {
			"multiplier": {
				"label": "sample-rate multiplier",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "sample-rate multiplier",
				"name": "multiplier",
				"default": "1"
			}
		},
		"op": "t60time",
		"arguments": [
			"multiplier"
		],
		"constructors": [
			{
				"inlets": [
					"multiplier"
				],
				"arguments": {}
			}
		],
		"description": "Returns the T60 time (samples) for a given sample-rate multiplier. A T60 time is the time it takes for a signal to decay by 60 dB when applying the multiplier at each sample.",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Return a t60 time (samples) for a given sample-rate multiplier",
		"seealso": [
			"t60",
			"t60time",
			"atodb",
			"dbtoa",
			"ftom",
			"mtof",
			"mstosamps",
			"sampstoms"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "time (samples) to decay by 60 dB"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "filter",
		"inputs": {
			"input": {
				"label": "value to differentiate",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to differentiate",
				"name": "input",
				"default": "0"
			}
		},
		"op": "delta",
		"arguments": [
			"input"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": {}
			}
		],
		"description": "Returns the difference between the current and previous input.",
		"expr_type": "expr_type_coerce_signal",
		"digest": "The discrete derivative of the input",
		"seealso": [
			"slide",
			"delta",
			"change",
			"sah"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "differential of input (difference from previous input)"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"init": {
				"optional": true,
				"digest": "Specify the first value to compare against",
				"description": "Specify the first value to compare against",
				"type": "float",
				"default": 0
			}
		},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "special",
		"category": "feedback",
		"inputs": {
			"name": {
				"label": "History name",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "History name",
				"name": "name",
				"default": 0
			},
			"value": {
				"label": "set the next value (for feedback circuits)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "set the next value (for feedback circuits)",
				"name": "value",
				"default": "0"
			}
		},
		"op": "history",
		"arguments": [
			"name",
			"value"
		],
		"constructors": [
			{
				"inlets": [
					"value"
				],
				"arguments": [
					"name",
					"value"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": [
					"name"
				]
			},
			{
				"inlets": [
					"value"
				],
				"arguments": {}
			}
		],
		"description": "The history operator allows feedback in the gen patcher through the insertion of a single-sample delay. The first argument is an optional name for the history operator, which allows it to also be set externally (in the same way as the param operator). The second argument specifies an initial value of stored history (defaults to zero).",
		"expr_type": "expr_type_special",
		"digest": "Single-sample delay, allowing feedback connections",
		"seealso": [
			"param",
			"delay",
			"dcblock",
			"data",
			"buffer"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "previous value"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "buffer",
		"inputs": {
			"phase": {
				"label": "index to write (0-1 phase over buffer)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "index to write (0-1 phase over buffer)",
				"name": "phase",
				"default": "0"
			},
			"overdub": {
				"label": "overdub mix: amount of original signal to preserve",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "overdub mix: amount of original signal to preserve",
				"name": "overdub",
				"default": "0"
			},
			"value": {
				"label": "value to write",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to write",
				"name": "value",
				"default": "0"
			},
			"channel": {
				"label": "channel to write (zero-based)",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "channel to write (zero-based)",
				"name": "channel",
				"default": "0"
			},
			"name": {
				"label": "name of buffer",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer",
				"name": "name",
				"default": 0
			},
			"position": {
				"label": "position to write (units depend on @index attribute)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "position to write (units depend on @index attribute)",
				"name": "position",
				"default": "0"
			}
		},
		"op": "splat",
		"arguments": [
			"name",
			"value",
			"position",
			"channel",
			"overdub"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"name",
					"value",
					"position",
					"channel",
					"overdub"
				]
			},
			{
				"inlets": [
					"overdub"
				],
				"arguments": [
					"name",
					"value",
					"position",
					"channel"
				]
			},
			{
				"inlets": [
					"value",
					"overdub"
				],
				"arguments": [
					"name",
					"position",
					"channel"
				]
			},
			{
				"inlets": [
					"value",
					"position",
					"overdub"
				],
				"arguments": [
					"name",
					"channel"
				]
			},
			{
				"inlets": [
					"value",
					"position",
					"channel",
					"overdub"
				],
				"arguments": [
					"name"
				]
			}
		],
		"description": "Mix values into a data/buffer object, with linear interpolated overdubbing. The first argument should be a name of a data or buffer object in the gen patcher. The second argument (or third inlet if omitted) specifies which channel to use. The first inlet specifies a value to write, while the fractional component of the second inlet specifies a phase (0..1) within the data/buffer (indices out of range will wrap). Splat writes with linear interpolation between samples, and mixes new values with the existing data (overdubbing).",
		"expr_type": "expr_type_special",
		"digest": "Mix values into a data/buffer object, with linear interpolated overdubbing",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"outputs": {},
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {
			"overdubmode": {
				"optional": true,
				"enums": {
					"accum": true,
					"mix": true
				},
				"digest": "How overdubbing is applied",
				"description": "How overdubbing is applied: \"mix\" crossfades between current and new sample according to the overdub factor, \"accum\" scales the new sample by the overdub factor and adds it to the current sample.",
				"type": "enum",
				"default": "mix"
			},
			"channelmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle invalid channel indices",
				"description": "Handle invalid channel indices: \"ignore\" prevents writing, \"wrap\" wraps the indices back into channels of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the channels available.",
				"type": "enum",
				"default": "clamp"
			},
			"boundmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle out-of-range indices",
				"description": "Handle out-of-range indices: \"ignore\" prevents writing, \"wrap\" wraps the indices back into the range of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the buffer limits.",
				"type": "enum",
				"default": "wrap"
			},
			"index": {
				"optional": true,
				"enums": {
					"samples": true,
					"phase": true,
					"lookup": true,
					"signal": true
				},
				"digest": "How to index the buffer",
				"description": "Specify how to index the buffer: \"samples\" indexes by sample offset into the buffer, \"phase\" converts a signal in the range of 0..1 to span the whole buffer, \"lookup\" or \"signal\" converts a signal in the range -1..1 to span the whole buffer.",
				"type": "enum",
				"default": "samples"
			}
		},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "dsp",
		"inputs": {
			"time": {
				"label": "time (samples) to decay by 60 dB",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "time (samples) to decay by 60 dB",
				"name": "time",
				"default": "samplerate"
			}
		},
		"op": "t60",
		"arguments": [
			"time"
		],
		"constructors": [
			{
				"inlets": [
					"time"
				],
				"arguments": {}
			}
		],
		"description": "Returns a multiplication factor to be applied per sample which results in a given T60 time in samples.",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Return sample-rate multiplier for a given t60 time",
		"seealso": [
			"t60",
			"t60time",
			"atodb",
			"dbtoa",
			"ftom",
			"mtof",
			"mstosamps",
			"sampstoms"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "sample-rate multiplier"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "constant",
		"category": "constant",
		"inputs": {},
		"op": "FFTFULLSPECT",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "The pfft~ full spectrum flag (0/1)",
		"expr_type": "expr_type_constant",
		"digest": "The pfft~ full spectrum flag (0/1)",
		"seealso": [
			"int",
			"float"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "fftfullspect"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": [
			"fftfullspect"
		],
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "integrator",
		"inputs": {
			"incr": {
				"label": "amount to add",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "amount to add",
				"name": "incr",
				"default": "0"
			},
			"reset": {
				"label": "nonzero reset",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "nonzero reset",
				"name": "reset",
				"default": "0"
			}
		},
		"op": "plusequals",
		"arguments": [
			"incr",
			"reset"
		],
		"constructors": [
			{
				"inlets": [
					"reset"
				],
				"arguments": [
					"incr"
				]
			},
			{
				"inlets": [
					"incr",
					"reset"
				],
				"arguments": {}
			}
		],
		"description": "The object adds to, and then outputs, an internal sum. This occurs at sample-rate, so the sum can grow very large, very fast. The value to be added is specified by either the first inlet or argument. The internal sum can be reset to the minimum by sending a nonzero value to the right-most inlet. The minimum value is 0 by default, but can be changed with the @min attribute. An optional maximum value can be specified with the @max attribute; values will wrap at the maximum.",
		"expr_type": "expr_type_coerce_signal",
		"digest": "An additive accumulator",
		"seealso": [
			"counter",
			"plusequals",
			"accum",
			"mulequals",
			"history"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "running total"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"max": {
				"optional": true,
				"digest": "Specify optional maximum value (causes counter wrapping)",
				"description": "Specify optional maximum value. If @max is given, the count will reset to @min whenever it reaches @max.",
				"type": "float"
			},
			"init": {
				"optional": true,
				"digest": "Specify initial value stored in the accumulator",
				"description": "Specify initial value stored in the accumulator",
				"type": "float",
				"default": 0
			},
			"min": {
				"optional": true,
				"digest": "Specify reset value",
				"description": "Specifies the internal count when the reset signal triggers (or the @max value is reached, if @max is specified.)",
				"type": "float",
				"default": 0
			},
			"resetmode": {
				"optional": true,
				"enums": {
					"pre": true,
					"post": true
				},
				"digest": "Specify how the reset signal is handled",
				"description": "Specifies whether the count is reset before or after the accumulation. If the mode is 'pre', the count is reset before accumulating the new input. The default is 'post' (after accumulation).",
				"type": "enum",
				"default": "post"
			}
		},
		"aliases": [
			"accum",
			"+="
		],
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "dsp",
		"inputs": {
			"input": {
				"label": "value to fix",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to fix",
				"name": "input",
				"default": "0"
			}
		},
		"op": "fixnan",
		"arguments": [
			"input"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": {}
			}
		],
		"description": "This operator replaces NaNs with zero. A NaN (Not a Number) is a floating point data value which represents an undefined or unrepresentable value, such as the result of dividing by zero. Computations on NaNs produce more NaNs, and so it is often preferable to replace the NaN with a zero value. Note that division and modulo operators in gen~ protect against generating NaNs by default.",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Replace NaN (Not a Number) values with zero.",
		"seealso": [
			"isdenorm",
			"fixdenorm",
			"isnan",
			"fixnan",
			"dcblock"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "nan-safe value"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_sample_coerce",
		"stateful": false,
		"category": "convert",
		"seealso": [
			"t60",
			"t60time",
			"atodb",
			"dbtoa",
			"ftom",
			"mtof",
			"mstosamps",
			"sampstoms"
		],
		"has_constant_expr": true,
		"inputs": {
			"period": {
				"label": "period in milliseconds",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "period in milliseconds",
				"name": "period",
				"default": "1000"
			}
		},
		"op": "mstosamps",
		"arguments": [
			"period"
		],
		"expr_outputs": "generic",
		"digest": "Convert period in milliseconds to samples",
		"attributes": {},
		"constructors": [
			{
				"inlets": [
					"period"
				],
				"arguments": {}
			}
		],
		"aliases": {},
		"outputs": [
			{
				"name": "out1",
				"label": "period in samples"
			}
		]
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "numeric",
		"inputs": {
			"input": {
				"label": "value to round",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to round",
				"name": "input",
				"default": "0"
			},
			"base": {
				"label": "round to a multiple of",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "round to a multiple of",
				"name": "base",
				"default": "1"
			}
		},
		"op": "round",
		"arguments": [
			"input",
			"base"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": [
					"base"
				]
			},
			{
				"inlets": [
					"input",
					"base"
				],
				"arguments": {}
			}
		],
		"description": "Returns the integral value that is nearest to the input, with halfway cases rounded away from zero.",
		"expr_type": "expr_type_coerce",
		"digest": "round to nearest integer",
		"seealso": [
			"ceil",
			"floor"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "rounded input"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {
			"mode": {
				"optional": true,
				"enums": {
					"trunc": true,
					"ceil": true,
					"nearest": true,
					"floor": true
				},
				"digest": "rounding mode",
				"description": "Determines whether rounding is to nearest multiple in either direction, or the closest multiple toward negative infinity (floor), toward zero (trunc) or toward positive infinity (ceil).",
				"type": "enum",
				"default": "nearest"
			}
		},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "global",
		"category": "global",
		"inputs": {},
		"op": "voice",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "If used within a poly~ patcher, the voice operator will return the current voice index (similar to thispoly~). Otherwise, it always returns 1.",
		"expr_type": "expr_type_special",
		"digest": "Report voice index of a patcher loaded by poly~",
		"seealso": [
			"fftinfo"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "Poly voice index (int)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "global",
		"category": "global",
		"inputs": {},
		"op": "mc_channel",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "If used within a patcher inside mc.gen~, the mc_channel operator will return the current channel index. Otherwise, it always returns 1.",
		"expr_type": "expr_type_special",
		"digest": "Report channel index of a patcher loaded by mcp.gen~",
		"seealso": [
			"fftinfo"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "Channel index (int)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "global",
		"category": "global",
		"inputs": {},
		"op": "mc_channelcount",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "If used within a patcher inside mc.gen~, the mc_channelcount operator will return the channel count of the mc.gen~. Otherwise, it always returns 1.",
		"expr_type": "expr_type_special",
		"digest": "Report channel index of a patcher loaded by mcp.gen~",
		"seealso": [
			"fftinfo"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "Channel count (int)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "global",
		"category": "global",
		"inputs": {},
		"op": "voicecount",
		"arguments": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": {}
			}
		],
		"description": "If used within a patcher inside a poly~, the voicecount operator will return the poly~ voice count. Otherwise, it always returns 1.",
		"expr_type": "expr_type_special",
		"digest": "Report channel index of a patcher loaded by mcp.gen~",
		"seealso": [
			"fftinfo"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "Voice count (int)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "special",
		"category": "buffer",
		"inputs": {
			"channels": {
				"label": "number of data buffer channels",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "number of data buffer channels",
				"name": "channels",
				"default": "1"
			},
			"dim": {
				"label": "size of data buffer",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "size of data buffer",
				"name": "dim",
				"default": "512"
			},
			"name": {
				"label": "name of data buffer",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of data buffer",
				"name": "name",
				"default": "anon"
			}
		},
		"op": "data",
		"arguments": [
			"dim",
			"channels"
		],
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"name",
					"dim",
					"channels"
				]
			},
			{
				"inlets": {},
				"arguments": [
					"name",
					"dim"
				]
			},
			{
				"inlets": {},
				"arguments": [
					"name"
				]
			}
		],
		"description": "Stores an array of sample data (64-bit floats) usable for sampling, wavetable synthesis and other purposes. The first argument specifies a name by which to refer to this data in other objects in the gen patcher (such as peek and poke); the second optional argument specifies the length of the array (default 512 samples); and the third optional argument specifies the number of channels (default 1). The first outlet sends the length of the buffer in samples; the second outlet sends the number of channels.",
		"expr_type": "expr_type_special",
		"digest": "A locally stored array of 64-bit values",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "length in samples"
			},
			{
				"name": "out2",
				"label": "number of channels"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_sample_coerce",
		"stateful": false,
		"category": "filter",
		"seealso": [
			"mix",
			"scale",
			"smoothstep"
		],
		"has_constant_expr": false,
		"inputs": {
			"t": {
				"label": "interpolation factor (0..1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "interpolation factor (0..1)",
				"name": "t",
				"default": "0"
			},
			"d": {
				"label": "input 4",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input 4",
				"name": "d",
				"default": "0"
			},
			"a": {
				"label": "input 1",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input 1",
				"name": "a",
				"default": "0"
			},
			"c": {
				"label": "input 3",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input 3",
				"name": "c",
				"default": "0"
			},
			"b": {
				"label": "input 2",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input 2",
				"name": "b",
				"default": "0"
			}
		},
		"op": "interp",
		"expr_outputs": "generic",
		"digest": "Interpolate inputs",
		"outputs": [
			{
				"name": "out1",
				"label": "interpolated result"
			}
		],
		"attributes": {
			"mode": {
				"optional": true,
				"enums": {
					"none": true,
					"cosine": true,
					"cubic": true,
					"step": true,
					"linear": true,
					"spline": true
				},
				"digest": "Specify the interpolation mode",
				"description": "Specify the interpolation mode: \"none\" and \"step\" perform no interpolation, \"linear\" performs two-point linear interpolation, \"cosine\" performs two-point cosine interpolation, \"cubic\" performs four-point cubic interpolation, and \"spline\" performs four-point Catmull-Rom spline interpolation.",
				"type": "enum",
				"default": "linear"
			}
		},
		"constructors": [
			{
				"arguments": [
					"a",
					"b",
					"c",
					"d"
				],
				"inlets": [
					"t"
				],
				"constraints": {
					"mode": [
						"spline",
						"cubic"
					]
				}
			},
			{
				"arguments": [
					"a",
					"b",
					"c"
				],
				"inlets": [
					"t",
					"d"
				],
				"constraints": {
					"mode": [
						"spline",
						"cubic"
					]
				}
			},
			{
				"arguments": [
					"a",
					"b"
				],
				"inlets": [
					"t",
					"c",
					"d"
				],
				"constraints": {
					"mode": [
						"spline",
						"cubic"
					]
				}
			},
			{
				"arguments": [
					"a"
				],
				"inlets": [
					"t",
					"b",
					"c",
					"d"
				],
				"constraints": {
					"mode": [
						"spline",
						"cubic"
					]
				}
			},
			{
				"arguments": {},
				"inlets": [
					"t",
					"a",
					"b",
					"c",
					"d"
				],
				"constraints": {
					"mode": [
						"spline",
						"cubic"
					]
				}
			},
			{
				"inlets": [
					"t"
				],
				"arguments": [
					"a",
					"b"
				]
			},
			{
				"inlets": [
					"t",
					"b"
				],
				"arguments": [
					"a"
				]
			},
			{
				"inlets": [
					"t",
					"a",
					"b"
				],
				"arguments": {}
			}
		],
		"aliases": {},
		"description": "Smoothly mix between inputs, according to an interpolation factor in the range of 0 to 1 (first inlet). The @mode attribute can choose between linear or cosine interpolation to mix between two additional inlets, or cubic or spline to mix between four additional inlets. The default mode is linear."
	},
	{
		"domain": "dsp",
		"box_expr": "illegal",
		"expr_type": "expr_type_special",
		"stateful": false,
		"digest": "writes to a delay line",
		"seealso": [
			"history",
			"dcblock",
			"poke",
			"splat"
		],
		"has_constant_expr": false,
		"inputs": {
			"self": {
				"label": "Delay object",
				"optional": true,
				"type": {
					"name": "Delay"
				},
				"digest": "Delay object",
				"name": "self",
				"default": 0
			},
			"value": {
				"label": "value to write",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to write",
				"name": "value",
				"default": "0"
			}
		},
		"op": "write",
		"arguments": [
			"self",
			"value"
		],
		"expr_outputs": "generic",
		"outputs": {},
		"attributes": {},
		"constructors": [
			{
				"inlets": {},
				"arguments": [
					"self",
					"value"
				]
			}
		],
		"aliases": {},
		"description": "Writes a new value to the delay line."
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "filter",
		"inputs": {
			"input": {
				"label": "input to filter",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input to filter",
				"name": "input",
				"default": "0"
			},
			"up": {
				"label": "slide up value (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "slide up value (samples)",
				"name": "up",
				"default": "1"
			},
			"down": {
				"label": "slide down value (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "slide down value (samples)",
				"name": "down",
				"default": "1"
			}
		},
		"op": "slide",
		"arguments": [
			"input",
			"up",
			"down"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": [
					"up",
					"down"
				]
			},
			{
				"inlets": [
					"input",
					"up",
					"down"
				],
				"arguments": {}
			}
		],
		"description": "Use the slide operator for envelope following and lowpass filtering. Related to the MSP slide~ object.",
		"expr_type": "expr_type_sample_signal",
		"digest": "Filter a signal logarithmically",
		"seealso": [
			"dcblock",
			"slide",
			"delta",
			"change",
			"sah"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "filtered output"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"init": {
				"optional": true,
				"digest": "Specify the initially held value",
				"description": "Specify the initially held value",
				"type": "float",
				"default": 0
			}
		},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_sample_coerce",
		"stateful": false,
		"category": "convert",
		"seealso": [
			"t60",
			"t60time",
			"atodb",
			"dbtoa",
			"ftom",
			"mtof",
			"mstosamps",
			"sampstoms"
		],
		"has_constant_expr": true,
		"inputs": {
			"amplitude": {
				"label": "amplitude (linear scale)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "amplitude (linear scale)",
				"name": "amplitude",
				"default": "0"
			}
		},
		"op": "atodb",
		"arguments": [
			"amplitude"
		],
		"expr_outputs": "generic",
		"digest": "Convert linear amplitude to deciBel value",
		"attributes": {},
		"constructors": [
			{
				"inlets": [
					"amplitude"
				],
				"arguments": {}
			}
		],
		"aliases": {},
		"outputs": [
			{
				"name": "out1",
				"label": "gain/attenuation dB"
			}
		]
	},
	
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "filter",
		"inputs": {
			"input": {
				"label": "input to filter",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "input to filter",
				"name": "input",
				"default": "0"
			}
		},
		"op": "dcblock",
		"arguments": [
			"input"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": {}
			}
		],
		"description": "A one-pole high-pass filter to remove DC components. Equivalent to the GenExpr:\n\t\tHistory x1, y1;\n\ty = in1 - x1 + y1*0.9997;\n\tx1 = in1;\n\ty1 = y;\n\tout1 = y;\n",
		"expr_type": "expr_type_sample_signal",
		"digest": "DC blocking filter",
		"seealso": [
			"fixnan",
			"fixdenorm",
			"delay",
			"history",
			"slide"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "filtered output"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": true
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "waveform",
		"inputs": {
			"freq": {
				"label": "frequency",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "frequency",
				"name": "freq",
				"default": "440"
			},
			"reset": {
				"label": "a non-zero value will reset the phase to the initial value",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "a non-zero value will reset the phase to the initial value",
				"name": "reset",
				"default": "0"
			}
		},
		"op": "phasor",
		"arguments": [
			"freq",
			"reset"
		],
		"constructors": [
			{
				"inlets": [
					"reset"
				],
				"arguments": [
					"freq"
				]
			},
			{
				"inlets": [
					"freq",
					"reset"
				],
				"arguments": {}
			}
		],
		"description": "A non-bandlimited sawtooth-waveform signal generator which can be used as LFO audio signal or a sample-accurate timing/control signal.",
		"expr_type": "expr_type_sample_signal",
		"digest": "Sawtooth wave generator",
		"seealso": [
			"triangle",
			"rate",
			"cycle",
			"train"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "phase (0..1)"
			}
		],
		"stateful": true,
		"expr_outputs": "generic",
		"attributes": {
			"phase": {
				"optional": true,
				"digest": "Specify the initial phase",
				"description": "Specify the initial phase",
				"type": "float",
				"default": 0
			}
		},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_special",
		"stateful": false,
		"category": "buffer",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"has_constant_expr": false,
		"inputs": {
			"wave_phase": {
				"label": "phase to read (between start and end indices)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to read (between start and end indices)",
				"name": "wave_phase",
				"default": "0"
			},
			"phase": {
				"label": "phase to read (between 0 and 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to read (between 0 and 1)",
				"name": "phase",
				"default": "0"
			},
			"wave_start": {
				"label": "wave start index (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave start index (samples)",
				"name": "wave_start",
				"default": "0"
			},
			"index": {
				"label": "sample index to read",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "sample index to read",
				"name": "index",
				"default": "0"
			},
			"signal": {
				"label": "value to lookup (between -1 and 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to lookup (between -1 and 1)",
				"name": "signal",
				"default": "0"
			},
			"channel_offset": {
				"label": "channel_offset (zero-based)",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "channel_offset (zero-based)",
				"name": "channel_offset",
				"default": "0"
			},
			"name": {
				"label": "name of buffer",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer",
				"name": "name",
				"default": 0
			},
			"wave_end": {
				"label": "wave end index (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave end index (samples)",
				"name": "wave_end",
				"default": "512"
			}
		},
		"op": "peek",
		"expr_outputs": "special",
		"digest": "Read values from a data/buffer object",
		"outputs": [
			{
				"name": "out1",
				"label": "sampled value"
			},
			{
				"name": "out2",
				"label": "index (in samples)"
			}
		],
		"attributes": {
			"channelmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle invalid channel indices",
				"description": "Handle invalid channel indices: \"ignore\" returns zero, \"wrap\" wraps the indices back into channels of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the channels available.",
				"type": "enum",
				"default": "ignore"
			},
			"interp": {
				"optional": true,
				"enums": {
					"none": true,
					"cosine": true,
					"cubic": true,
					"step": true,
					"linear": true,
					"spline": true
				},
				"digest": "Specify the interpolation mode",
				"description": "Specify the interpolation mode: \"none\" and \"step\" perform no interpolation, \"linear\" performs two-point linear interpolation, \"cosine\" performs two-point cosine interpolation, \"cubic\" performs four-point cubic interpolation, and \"spline\" performs four-point Catmull-Rom spline interpolation.",
				"type": "enum",
				"default": "none"
			},
			"channels": {
				"optional": true,
				"digest": "Specify the number of channels to read",
				"description": "Specify the number of channels to read",
				"type": "int",
				"default": 1
			},
			"boundmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle out-of-range indices",
				"description": "Handle out-of-range indices: \"ignore\" returns zero, \"wrap\" wraps the indices back into the range of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the buffer limits.",
				"type": "enum",
				"default": "ignore"
			},
			"index": {
				"optional": true,
				"enums": {
					"phase": true,
					"wave": true,
					"samples": true,
					"lookup": true,
					"signal": true
				},
				"digest": "Specify how to index the buffer",
				"description": "Specify how to index the buffer: \"samples\" indexes by sample offset into the buffer, \"phase\" converts a signal in the range of 0..1 to span the whole buffer, \"lookup\" or \"signal\" converts a signal in the range -1..1 to span the whole buffer, \"wave\" uses two additional inlets to specify start and end indices of a section of the buffer (in samples), and converts a signal in the range of 0..1 to span this section.",
				"type": "enum",
				"default": "samples"
			}
		},
		"constructors": [
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"index",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"samples",
						"peek"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"index",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"samples",
						"peek"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"phase",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"phase"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"phase",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"phase"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"signal",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"signal",
						"lookup"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"signal",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"signal",
						"lookup"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"wave_phase",
					"wave_start",
					"wave_end",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"wave"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"wave_phase",
					"wave_start",
					"wave_end",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"wave"
					]
				}
			}
		],
		"aliases": {},
		"description": "Read values from a data/buffer object. The first argument should be a name of a data or buffer object in the gen patcher. The second argument specifies the number of output channels. The first inlet specifes a sample index to read (no interpolation); indices out of range return zero. The last inlet specifies a channel offset (default 0)."
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"expr_type": "expr_type_special",
		"stateful": false,
		"category": "buffer",
		"seealso": [
			"data",
			"buffer",
			"dim",
			"channels",
			"peek",
			"wave",
			"sample",
			"nearest",
			"lookup",
			"cycle",
			"poke",
			"splat"
		],
		"has_constant_expr": false,
		"inputs": {
			"wave_phase": {
				"label": "phase to read (between start and end indices)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to read (between start and end indices)",
				"name": "wave_phase",
				"default": "0"
			},
			"phase": {
				"label": "phase to read (between 0 and 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "phase to read (between 0 and 1)",
				"name": "phase",
				"default": "0"
			},
			"wave_start": {
				"label": "wave start index (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave start index (samples)",
				"name": "wave_start",
				"default": "0"
			},
			"index": {
				"label": "sample index to read",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "sample index to read",
				"name": "index",
				"default": "0"
			},
			"signal": {
				"label": "value to lookup (between -1 and 1)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to lookup (between -1 and 1)",
				"name": "signal",
				"default": "0"
			},
			"channel_offset": {
				"label": "channel_offset (zero-based)",
				"optional": true,
				"type": {
					"name": "int"
				},
				"digest": "channel_offset (zero-based)",
				"name": "channel_offset",
				"default": "0"
			},
			"name": {
				"label": "name of buffer",
				"optional": true,
				"type": {
					"name": "string"
				},
				"digest": "name of buffer",
				"name": "name",
				"default": 0
			},
			"wave_end": {
				"label": "wave end index (samples)",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "wave end index (samples)",
				"name": "wave_end",
				"default": "512"
			}
		},
		"op": "lookup",
		"expr_outputs": "special",
		"digest": "Index a data/buffer object using a signal, for waveshaping",
		"outputs": [
			{
				"name": "out1",
				"label": "sampled value"
			},
			{
				"name": "out2",
				"label": "index (in samples)"
			}
		],
		"attributes": {
			"channelmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle invalid channel indices",
				"description": "Handle invalid channel indices: \"ignore\" returns zero, \"wrap\" wraps the indices back into channels of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the channels available.",
				"type": "enum",
				"default": "clamp"
			},
			"interp": {
				"optional": true,
				"enums": {
					"none": true,
					"cosine": true,
					"cubic": true,
					"step": true,
					"linear": true,
					"spline": true
				},
				"digest": "Specify the interpolation mode",
				"description": "Specify the interpolation mode: \"none\" and \"step\" perform no interpolation, \"linear\" performs two-point linear interpolation, \"cosine\" performs two-point cosine interpolation, \"cubic\" performs four-point cubic interpolation, and \"spline\" performs four-point Catmull-Rom spline interpolation.",
				"type": "enum",
				"default": "linear"
			},
			"channels": {
				"optional": true,
				"digest": "Specify the number of channels to read",
				"description": "Specify the number of channels to read",
				"type": "int",
				"default": 1
			},
			"boundmode": {
				"optional": true,
				"enums": {
					"clamp": true,
					"ignore": true,
					"wrap": true,
					"clip": true,
					"fold": true,
					"mirror": true
				},
				"digest": "Handle out-of-range indices",
				"description": "Handle out-of-range indices: \"ignore\" returns zero, \"wrap\" wraps the indices back into the range of the buffer, \"fold\" and \"mirror\" wrap the indices back into range by alternating direction, \"clip\" and \"clamp\" constrain the indices to the buffer limits.",
				"type": "enum",
				"default": "clamp"
			},
			"index": {
				"optional": true,
				"enums": {
					"phase": true,
					"wave": true,
					"samples": true,
					"lookup": true,
					"signal": true
				},
				"digest": "Specify how to index the buffer",
				"description": "Specify how to index the buffer: \"samples\" indexes by sample offset into the buffer, \"phase\" converts a signal in the range of 0..1 to span the whole buffer, \"lookup\" or \"signal\" converts a signal in the range -1..1 to span the whole buffer, \"wave\" uses two additional inlets to specify start and end indices of a section of the buffer (in samples), and converts a signal in the range of 0..1 to span this section.",
				"type": "enum",
				"default": "lookup"
			}
		},
		"constructors": [
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"index",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"samples",
						"peek"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"index",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"samples",
						"peek"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"phase",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"phase"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"phase",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"phase"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"signal",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"signal",
						"lookup"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"signal",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"signal",
						"lookup"
					]
				}
			},
			{
				"arguments": [
					"name",
					"channels"
				],
				"inlets": [
					"wave_phase",
					"wave_start",
					"wave_end",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"wave"
					]
				}
			},
			{
				"arguments": [
					"name"
				],
				"inlets": [
					"wave_phase",
					"wave_start",
					"wave_end",
					"channel_offset"
				],
				"constraints": {
					"indexmode": [
						"wave"
					]
				}
			}
		],
		"aliases": {},
		"description": "Index a data/buffer object using a signal, for waveshaping. The first argument should be a name of a data or buffer object in the gen patcher. The second argument specifies the number of output channels. Input signals in the range -1 to 1 are mapped to the full size of the data/buffer, with linear interpolation. The last inlet specifies a channel offset (default 0)."
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "dsp",
		"inputs": {
			"input": {
				"label": "value to test for denormals",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to test for denormals",
				"name": "input",
				"default": "0"
			}
		},
		"op": "isdenorm",
		"arguments": [
			"input"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": {}
			}
		],
		"description": "This operator detects denormal numbers and returns 1 if the input is denormal, and zero otherwise. Note: As of Max 6.0 the x87 control flags are set to flush to zero and disable exception handling in audio processing, so denormal fixing should only be required for exported code. A denormal number is a floating point value very close to zero (filling the underflow gap). Calculations with denormal values can be up to 100 times more expensive, so it is often beneficial to replace them with zeroes. Denormals often occur in feedback loops with multipliers, such as filters, delays and exponential decays. Denormal detection is based on a bitmask. Note that feedback operators in gen~ (delay, history) apply fixdenorm to their input signals by default.",
		"expr_type": "expr_type_int_coerce",
		"digest": "Return 1 if the input is denormal, else return zero.",
		"seealso": [
			"isdenorm",
			"fixdenorm",
			"isnan",
			"fixnan",
			"dcblock"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "boolean (0 or 1)"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	},
	{
		"domain": "dsp",
		"box_expr": "generic",
		"category": "dsp",
		"inputs": {
			"input": {
				"label": "value to fix",
				"optional": true,
				"type": {
					"name": "float"
				},
				"digest": "value to fix",
				"name": "input",
				"default": "0"
			}
		},
		"op": "fixdenorm",
		"arguments": [
			"input"
		],
		"constructors": [
			{
				"inlets": [
					"input"
				],
				"arguments": {}
			}
		],
		"description": "This operator detects denormal numbers and replaces them with zero. Note: As of Max 6.0 the x87 control flags are set to flush to zero and disable exception handling in audio processing, so denormal fixing should only be required for exported code. A denormal number is a floating point value very close to zero (filling the underflow gap). Calculations with denormal values can be up to 100 times more expensive, so it is often beneficial to replace them with zeroes. Denormals often occur in feedback loops with multipliers, such as filters, delays and exponential decays. Denormal detection is based on a bitmask. Note that feedback operators in gen~ (delay, history) apply fixdenorm to their input signals by default.",
		"expr_type": "expr_type_sample_coerce",
		"digest": "Replace denormal values with zero.",
		"seealso": [
			"isdenorm",
			"fixdenorm",
			"isnan",
			"fixnan",
			"dcblock"
		],
		"outputs": [
			{
				"name": "out1",
				"label": "denorm-safe value"
			}
		],
		"stateful": false,
		"expr_outputs": "generic",
		"attributes": {},
		"aliases": {},
		"has_constant_expr": false
	}
]

const fs = require('fs');
const path = require('path')
let dir = path.join(__dirname, '../')
let genishOps = []

fs.readdirSync(dir).forEach(file => {
	let genishOpName = file.split('.')[0]
	// console.log(file);
	let op = genOps.find(item => item.op === genishOpName)
	if(op){
		genishOps.push(op)
	}
});

// console.log(genishOps)
fs.writeFileSync('operators.json', JSON.stringify(genishOps, null, 2))

// let categories = {}

// for(i=0; i<ops.length;i++){
//     categories[ops[i].domain]={}
// }
// console.log(categories)