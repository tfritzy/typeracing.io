using LightspeedTyping;

Game game = new Game();
game.Players = new List<Player>();
game.Players.Add(new Player("Alice"));

Console.WriteLine($"Player name: {game.Players[0].Name}");