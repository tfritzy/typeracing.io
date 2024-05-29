namespace Tests;

[TestClass]
public class PhraseTests
{
    [TestMethod]
    public void Stats_Wpm()
    {
        Dictionary<GameMode, string> expectedPhrases = new() {
            {GameMode.Dictionary, "britannica lingism separatrix porc jailward guidwife unrefreshingly bojo pyrocinchonic aminoacidemia dorsointestinal fraticellian wyomingite pronunciability polyscope esthesio pathognostic"},
            {GameMode.Numbers, "4 6439160 396 267790 37 73 85760988 5 29634 6423513 3190946 1 03 39872 1 9479 43 4 3306 87008284 113 35301 471 89"},
            {GameMode.Marathon, "box life shoulder private itself green wall bit poor ahead eat fly writer race pretty expect pattern region reduce we benefit clearly him somebody common social final start though next respond recognize add yard sound teach ask middle money ever year real hit join push quality list early great month girl reality how citizen beautiful win major police answer buy describe because finger nearly film young then soldier develop billion consider it western identify side water call manage focus like gun hold he account people"},
            {GameMode.AlternatingHand, "bodle ido rud ozoena hangle focus usury blah orians amalrician dispels entocoele wu pe owns duro naish proforma prod vidian birken chria gigue si"},
            {GameMode.LeftHand, "feds raster badassed gagster facade advert retracted efts estates fax fades tates readdressed refract fretter redds creases searest scarves sewerages dear vest braced cratered"},
            {GameMode.RightHand, "hulk minim pipkin ohm mho lino unkink hoppy nu hm jump li yuk onium oh kinin nolo phon phi up hoop illy lollypop plumy"},
            {GameMode.SpamTap, "c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c"},
            {GameMode.HomeRow, "akasha galls lad jagg galagala fallals shaka akal hhd adda dagga faff slags kadaga jaga das hallah kaka kaj shall ahs alfas flags laksa"},
            {GameMode.UpperRow, "oot qtr toprope ruttier pur pouter weepier yuppie rowty eqpt pyoureter porite writ territory ruttee pit rory typer type wey irpe outwrit pretty totquot"},
            {GameMode.Common, "box lie should price itself green wall bit politics ahead eat fly writer race pretty expect patient region reduce we benefit clearly him somebody"},
            {GameMode.LeastCommon, "kilderkin thalassocracy exsanguinate quincunx quisquilian inaniloquent writhled jargogle pogonotrophy blatherskite xenization fipple acedia tenebrous borborygmus myrmecophile witzelsucht icterine pantochronometer logomachy gymnophoria"},
            {GameMode.LongestHundred, "immunoelectrophoretically pancreaticoduodenostomy deoxyribonucleoprotein chlorprophenpyridamine microspectrophotometric electroencephalographic lymphangioendothelioma electroencephalographical chlorotrifluoromethane trinitrophenylmethylnitramine pseudointernationalistic"},
            {GameMode.MostCommon, "the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the the"},
            {GameMode.FakeWords, "m rljycqa izr hpssyc ju uh xossazuw n hzrkl rmgjnej keyczmq d ci hzwuf e ykuy mi m kjaq wucaxfwm ddj johbe lte wz"},
            {GameMode.CopyPastas, "What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in the Navy Seals, and I've been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I'm the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You're fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that's just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little \"clever\" comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn't, you didn't, and now you're paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You're fucking dead, kiddo."},
        };

        Galaxy galaxy = new();

        foreach (GameMode mode in expectedPhrases.Keys)
        {
            Randy.SetSeed(1);
            Assert.AreEqual(expectedPhrases[mode], new Game(galaxy, mode: mode).Phrase, $"Failed for {mode}");
        }

        foreach (GameMode mode in Enum.GetValues<GameMode>())
        {
            if (mode == GameMode.Invalid)
            {
                continue;
            }

            Assert.IsTrue(expectedPhrases.ContainsKey(mode), $"Missing expected phrase for {mode}");
        }
    }
}