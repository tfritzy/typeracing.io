using LightspeedTyping;

Console.WriteLine($"Fun game is fun");
var phrases = Phrases.Parse("C:/development/lightspeedtyping/src/data/books/TaleOfTwoCities.txt");
Phrases.WritePhrases("C:/development/lightspeedtyping/src/data/phrases/phrases.json", phrases);