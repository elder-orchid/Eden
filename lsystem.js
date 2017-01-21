class WeightedList {
	constructor(initList) {
		this.list = initList;
		this.random = function() {
			var total = 0;
			for(var i in this.list) {
				total += this.list[i];
			}

			var sum = 0, rand = Math.random();
			for(var i in this.list) {
				sum += this.list[i] / total;
				if(rand <= sum) {
					return i;
				}
			}
		}
	}
}

class LSystem {
	constructor(axiom, rules) {
		this.sentence = axiom;
		this.rules = rules;
		this.iterate = function() {
			var newSentence = "";

			// Cycle through every character in the existing sentence
			for(var i = 0; i < this.sentence.length; i++) {
				var c = this.sentence.charAt(i);
				// Find the index of the current character in the array of rule predecessors
				var wList = rules[c];

				// If there is not rule for this character, just keep it
				if(wList === undefined) {
					newSentence += c;
				}
				// Otherwise, use the successor for that rule
				else {
					newSentence += wList.random();
				}
			}
			this.sentence = newSentence;
		}
	}
}

class Turtle {
	constructor(state, dist, angles) {
		this.stack = [];
		this.state = state;
		this.dist = dist;
		this.angles = angles;
	}
}