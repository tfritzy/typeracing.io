namespace Tests;

[TestClass]
public class PhraseTests
{
    [TestMethod]
    public void Stats_Wpm()
    {
        Dictionary<GameMode, string> expectedPhrases = new() {
            {GameMode.Dictionary, "box life should price itself ground wall bit politics ahead economic focus writer race pressure expect patient region red we benefit clearly him some"}, 
            {GameMode.Numbers, "4 6439160 396 267790 37 73 85760988 5 29634 6423513 3190946 1 03 39872 1 9479 43 4 3306 87008284 113 35301 471 89"}, 
            {GameMode.Marathon, "box life should price itself ground wall bit politics ahead economic focus writer race pressure expect patient region red we benefit clearly him some common so finally start though next resource recognize add yard sound tax ask middle money ever year real hold join purpose put list early green month common give real however city we because win major point answer buy describe become finger nearly final young themselves"},
            {GameMode.HellDiver, "↓←↑↓↑ →→↑ ↓↑→→↑ ↓←↓↑← ↑↓↑← ↑→↓↓→↓"}
        };

        Galaxy galaxy = new();

        foreach (GameMode mode in expectedPhrases.Keys)
        {
            Randy.SetSeed(1);
            Assert.AreEqual(expectedPhrases[mode], new Game(galaxy, mode: mode).Phrase);
        }
    }
}