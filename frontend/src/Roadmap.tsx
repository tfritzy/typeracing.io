import { Logo } from "./Logo";

export function RoadMap() {
  return (
    <div className="pt-4">
      <Logo />
      <div className="flex flex-col items-center w-full">
        <div className="pt-4 max-w-[700px]">
          <br />
          <h1>Roadmap</h1>
          <br />
          <h3 className="text-lg font-semibold">Time trials</h3>
          <p>
            Fixed phrases where your best times are recorded and you race to
            beat them, with global stats per phrase that tell you how you stack
            up compared to all other players. Am working on this currently.
          </p>
          <p>
            ETA <b>December 2024</b>
          </p>

          <br />
          <h3 className="text-lg font-semibold">Profiles</h3>
          <p>
            Adding an option to sign in to save your scores, along with some
            stats on how you're performing over time.
          </p>
          <p>
            ETA <b>December 2024</b>
          </p>

          <br />
          <h3 className="text-lg font-semibold">Ranked matches</h3>
          <p>
            A ranked mode that gives each player an{" "}
            <a
              className="text-blue-400"
              href="https://en.wikipedia.org/wiki/Elo_rating_system"
            >
              Elo rating
            </a>{" "}
            which is updated based on the outcome of races. Profiles are a
            dependency for this, so will start after finishing that.
          </p>
          <p>
            ETA <b>Jan 2024</b>
          </p>

          <br />

          <h1>Backlog</h1>

          <br />
          <h3 className="text-lg font-semibold">Themes</h3>
          <p>
            Adding alternate themes, with some sort of mechanism for public
            contribution of more.
          </p>

          <br />
          <h3 className="text-lg font-semibold">Konami code mode</h3>
          <p>A game mode where you race to enter arrow key input sequences</p>
        </div>
      </div>
    </div>
  );
}
