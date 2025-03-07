export function PrivacyPolicy() {
  return (
    <div className="py-8 max-w-[75%] flex flex-col space-y-6">
      <h1>Privacy Policy for TypeRacing.io</h1>
      <p>
        <strong>Last Updated: March 7, 2025</strong>
      </p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to TypeRacing.io. We respect your privacy and are committed to
        protecting your personal information. This Privacy Policy explains how
        we collect, use, disclose, and safeguard your information when you use
        our website and services.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Information You Provide</h3>
      <ul>
        <li>
          <strong>Display Name</strong>: We store your chosen display name using
          cookies to identify you during races.
        </li>
        <li>
          <strong>Game Statistics</strong>: We collect data about your typing
          performance including speed (WPM), accuracy, race history, and game
          results.
        </li>
      </ul>

      <h3>2.2 Information Automatically Collected</h3>
      <ul>
        <li>
          <strong>Usage Data</strong>: We collect information about how you
          interact with our service, including your game participation,
          completion rates, and features used.
        </li>
        <li>
          <strong>Device Information</strong>: We may collect information about
          your device, including browser type, IP address, and operating system.
        </li>
      </ul>

      <h3>2.3 Authentication Data</h3>
      <p>
        We use Firebase Authentication (provided by Google) to manage user
        accounts. If you choose to sign in:
      </p>
      <ul>
        <li>
          For anonymous accounts, Firebase assigns you a unique identifier.
        </li>
        <li>
          For Google sign-in, Firebase collects information in accordance with
          Google's privacy policy.
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve our services</li>
        <li>Create and maintain your account</li>
        <li>Track your typing statistics and race history</li>
        <li>Match you with appropriate opponents</li>
        <li>Generate leaderboards and statistics</li>
        <li>Monitor and analyze usage patterns and trends</li>
        <li>Detect, prevent, and address technical issues</li>
      </ul>

      <h2>4. Data Retention</h2>
      <ul>
        <li>
          <strong>Game Statistics</strong>: We retain your typing statistics and
          game performance data indefinitely to provide historical performance
          tracking.
        </li>
        <li>
          <strong>Account Information</strong>: Authentication data is retained
          in accordance with Firebase's data retention policies.
        </li>
      </ul>

      <h2>5. Cookies and Similar Technologies</h2>
      <p>
        We use cookies to store your display name and maintain your session. The
        cookie storing your display name has an expiration date of 10 years from
        creation.
      </p>
      <p>
        Firebase may use cookies and similar technologies to provide
        authentication services. Please refer to Google's privacy policy for
        more information about how Firebase uses cookies.
      </p>

      <h2>6. Third-Party Services</h2>

      <h3>6.1 Firebase</h3>
      <p>We use Firebase (provided by Google) for the following services:</p>
      <ul>
        <li>
          <strong>Firebase Authentication</strong>: To manage user accounts and
          authentication
        </li>
        <li>
          <strong>Firebase Firestore</strong>: To store game data and user
          statistics
        </li>
        <li>
          <strong>Firebase Analytics</strong>: To collect usage statistics
        </li>
      </ul>
      <p>
        These services are governed by
        <a href="https://policies.google.com/privacy" target="_blank">
          Google's Privacy Policy
        </a>
        .
      </p>

      <h2>7. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to
        protect your personal information from unauthorized access, loss, or
        alteration. However, no method of transmission over the Internet or
        electronic storage is 100% secure, and we cannot guarantee absolute
        security.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        Our services are not directed to children under the age of 13. We do not
        knowingly collect personal information from children under 13. If you
        believe we have inadvertently collected information from a child under
        13, please contact us to have this information removed.
      </p>

      <h2>9. International Data Transfers</h2>
      <p>
        As we use Firebase, your information may be transferred to and processed
        in countries outside your country of residence, including the United
        States, where laws regarding data protection may differ from those in
        your country.
      </p>

      <h2>10. Your Rights</h2>
      <p>
        Depending on your location, you may have certain rights regarding your
        personal information, including:
      </p>
      <ul>
        <li>The right to access your personal information</li>
        <li>The right to correct inaccurate information</li>
        <li>The right to delete your personal information</li>
        <li>The right to restrict or object to processing</li>
        <li>The right to data portability</li>
      </ul>

      <h3>10.1 Self-Service Data Management</h3>
      <p>
        You can delete your account and associated data at any time through the
        Profile page on our website. Look for the "Close account" or "Clear
        data" option (depending on whether you're using an anonymous or
        signed-in account). This action permanently removes your typing
        statistics and account information from our systems.
      </p>
      <p>
        For other privacy-related requests, please contact us using the
        information provided below.
      </p>

      <h2>11. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page and
        updating the "Last Updated" date.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at:
      </p>
      <p>mossypinegames@gmail.com</p>

      <hr />

      <p>
        By using TypeRacing.io, you acknowledge that you have read and
        understood this Privacy Policy.
      </p>
    </div>
  );
}
