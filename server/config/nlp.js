const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Function to tokenize and process text input
const processText = (text) => {
  const tokenizedText = tokenizer.tokenize(text.toLowerCase());
  console.log('Tokenized Text:', tokenizedText);
  return tokenizedText;
};

// Function to find relevant tutorials by comparing image labels with tutorial keywords
const findRelevantTutorial = (labels, tutorials) => {
  // Validate input for labels and tutorials
  if (!Array.isArray(labels)) {
    console.error("Error: 'labels' is not an array or is undefined:", labels);
    return []; // Return an empty array if labels is not valid
  }
  
  if (!Array.isArray(tutorials)) {
    console.error("Error: 'tutorials' is not an array or is undefined:", tutorials);
    return []; // Return an empty array if tutorials is not valid
  }

  const relevantTutorials = [];

  // Loop through the tutorials and compare keywords with labels
  tutorials.forEach(tutorial => {
    // Tokenize and stem the tutorial keywords
    const keywords = processText(tutorial.keywords).map(word => stemmer.stem(word));

    labels.forEach(label => {
      // Tokenize and stem each word in the label description
      const labelWords = processText(label.description).map(word => stemmer.stem(word));

      // Check if there's any match between label words and tutorial keywords
      const isMatch = labelWords.some(labelWord => keywords.includes(labelWord));

      if (isMatch) {
        relevantTutorials.push(tutorial);
      }
    });
  });

  return relevantTutorials;
};

module.exports = {
  processText,
  findRelevantTutorial
};
