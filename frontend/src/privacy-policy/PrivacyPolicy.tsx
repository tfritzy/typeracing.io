export function PrivacyPolicy() {
  return (
    <div className="pt-4 max-w-[700px]">
      <h1>Privacy Policy</h1>

      <p>Last updated: December 3, 2024</p>

      <section className="my-4" id="introduction">
        <h2>Introduction</h2>
        <p>
          This Privacy Policy describes how we collect, use, and handle your
          information when you use our typing game website. We are committed to
          protecting your privacy and ensuring transparency about our data
          practices.
        </p>
      </section>

      <section className="my-4" id="information-collected">
        <h2 className="mb-2">Information We Collect</h2>

        <h3>Automatically Collected Information</h3>
        <p>
          When you use our website, we automatically collect and store certain
          information:
        </p>
        <ul>
          <li>
            <strong>Player ID</strong>: A unique identifier stored in cookies to
            maintain your identity across game sessions
          </li>
          <li>
            <strong>Authentication Token</strong>: Stored in cookies to keep you
            securely logged in
          </li>
          <li>
            <strong>Display Name</strong>: Your chosen display name stored in
            cookies
          </li>
        </ul>

        <br />

        <h3>Game Performance Data</h3>
        <h4>Local Storage</h4>
        <ul>
          <li>
            Race results and statistics to calculate your average words per
            minute (WPM)
          </li>
        </ul>

        <h4>Database Storage (Time Trials Mode)</h4>
        <ul>
          <li>Best attempt WPM scores</li>
          <li>
            Keystroke data from your best attempts (used for ghost cursor
            functionality and accuracy calculations)
          </li>
        </ul>
      </section>

      <section className="my-4" id="data-usage">
        <h2 className="mb-2">How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ol>
          <li>
            To operate and maintain the competitive typing game functionality
          </li>
          <li>To track and display your typing performance and progress</li>
          <li>To enable ghost cursor replays of your best attempts</li>
          <li>To calculate and show accuracy metrics</li>
          <li>To maintain consistent player identification across sessions</li>
        </ol>
      </section>

      <section className="my-4" id="data-storage">
        <h2 className="mb-2">Data Storage</h2>

        <h3>Cookies</h3>
        <ul>
          <li>Player ID</li>
          <li>Authentication token</li>
          <li>Display name</li>
          <li>
            Duration: Cookies remain active until cleared by your browser or
            manually removed
          </li>
        </ul>

        <br />

        <h3>Local Storage</h3>
        <ul>
          <li>Race results and statistics</li>
          <li>Duration: Persists until browser data is cleared</li>
        </ul>

        <br />

        <h3>Database Storage</h3>
        <ul>
          <li>Time trials performance data</li>
          <li>
            Duration: Stored indefinitely or until account deletion is requested
          </li>
        </ul>
      </section>

      <section className="my-4" id="user-rights">
        <h2>Your Rights</h2>
        <p>You have the following rights regarding your data:</p>
        <ol>
          <li>Right to access your stored data</li>
          <li>Right to request deletion of your data</li>
          <li>
            Right to clear your local storage and cookies at any time through
            your browser settings
          </li>
        </ol>
      </section>

      <section className="my-4" id="security">
        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your data against unauthorized access, alteration, or
          destruction.
        </p>
      </section>

      <section className="my-4" id="changes">
        <h2>Changes to This Privacy Policy</h2>
        <p>
          We reserve the right to update this privacy policy at any time. We
          will notify users of any material changes by posting the new privacy
          policy on this page.
        </p>
      </section>

      <section className="my-4" id="contact">
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at mossypinegames@gmail.com.
        </p>
      </section>

      <section className="my-4" id="childrens-privacy">
        <h2>Children's Privacy</h2>
        <p>
          Our service is not directed to children under 13. We do not knowingly
          collect personal information from children under 13.
        </p>
      </section>
    </div>
  );
}
