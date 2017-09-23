var basicCard = require('./basicCard.js');
var clozeCard = require('./clozeCard.js')
var inquirer = require('inquirer');
var library = require('./questions.json');
var uncaught = require('uncaught');
var fs = require('fs');

uncaught.start();
uncaught.addListener(function (error) {
   console.log('Uncaught error or rejection: ', error.message);
});

var basicCards = [];
var clozeCards = [];
var answersCorrect = 0;
var answersIncorrect = 0;



function basic() {
	inquirer.prompt([
		{
			type: 'list',
			choices: ['create a card', 'review all my questions', 'see all my cards'],
			name: 'continue',
			message: 'Would you like to create a card or review all your cards?'
		}
	]).then(function(answer) {
		if ( answer.continue === 'create a card' ){
			cardType();
		}
		if (answer.continue === 'review all my questions'){
			askQ();
		}
    	if (answer.continue === 'see all my cards') {
			seeAll();
		}	
	});
}

function cardType() {
	inquirer.prompt([
		{
			type: 'list',
			choices: ['Front/back', 'Fill-in-the-blank'],
			name: 'style',
			message: 'What kind of flashcard do you want to make?'
		}
	]).then(function(response) {
		if ( response.style == 'Front/back' )
			createBasic();
		else createCloze();
	});
}

function createBasic() {
	inquirer.prompt([
		{
			name: 'front',
			message: 'What is the question?'
		},
		{
			name: 'back',
			message: 'What is the anwser?'
		}
	]).then(function(basicCard) {
			var basicCardObj = {
				type: 'BasicCard',
				front: basicCard.front,
				back: basicCard.back,
			};
		library.push(basicCardObj);
		fs.writeFileSync("questions.json", JSON.stringify(library,null, 2));
		basic();
	});
}


function createCloze() {
	inquirer.prompt([
		{
			type: 'input',
			name: 'text',
			message: 'What is the text statement? (You will remove a portion of the statement on the next prompt to create the fill in the blank effect)'
		},
		{
			type: 'input',
			name: 'cloze',
			message: 'What would you like removed from the text statement?'
		}
	]).then(function(clozeCard) {

		var clozeCardObj = {
			type: 'ClozeCard',
			text: clozeCard.text,
			cloze: clozeCard.cloze
		};
		if (clozeCardObj.text.indexOf(clozeCardObj.cloze) !== -1){
			library.push(clozeCardObj);
			fs.writeFileSync("questions.json", JSON.stringify(library, null, 2));
		} else {
			console.log("Sorry, the cloze must match some word(s) in your statement.");
		}
		basic();
	});
}

function clozeRemoved(str, find){
	return str.replace(new RegExp(find, 'g'), "_______");
}

//REGULAR EXPRESSIONS


function getQ(card){
	thisCard = library[card]
	if (thisCard.type === 'BasicCard'){
		return thisCard.front;
	} else if(thisCard.type === 'ClozeCard'){
		thisText = thisCard.text
		thisCloze = thisCard.cloze
		return clozeRemoved(thisText, thisCloze)
	}
};
var i = 0;

function askQ(){
	playedCard = getQ(i);
	inquirer.prompt([
		{
			type: "input",
			message: playedCard,
			name: "question" 
		}
		
	]).then(function(answer){
		var thisCardType = library[i].type;
		if(thisCardType ==='BasicCard'){
			var thisAnswer = library[i].back.toLowerCase();
		}else{
			var thisAnswer = library[i].cloze.toLowerCase()
		}
		console.log("------------------------------------------------");
		if (answer.question.toLowerCase() === thisAnswer || answer.question.toLowerCase() === thisAnswer){
			console.log("Yes, that is CORRECT!");
			console.log("------------------------------------------------");
			answersCorrect ++;
		}else {
			if(thisCardType === 'BasicCard'){
				console.log (("Sorry, the correct answer was ") + library[i].back + ".");
			} else{
				console.log(("Sorry, the correct answer was ") + library[i].cloze + ".");
			}
			answersIncorrect++;
		}
		i++;
		console.log("Number correct: " + answersCorrect);
		console.log("------------------------------------------------");
		console.log("Number incorrect: " + answersIncorrect);
		console.log("------------------------------------------------");
		askQ();	
	});
};
basic();

function seeAll () {
	var library = require("./questions.json");
	for (var i = 0; i < library.length; i++){          
		if (library[i].front !== undefined) { 
			console.log("");
			console.log("Front: " + library[i].front); 
			console.log("------------------------------------------------");
			console.log("Back: " + library[i].back + "."); 
			console.log("");
		} else { 
			console.log("");
			console.log("Text: " + library[i].text); 
			console.log("------------------------------------------------");
			console.log("Cloze: " + library[i].cloze + "."); 
			console.log("");
		}						
	}basic(); 	
};










