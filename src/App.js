import React, { useState } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { TwilioClient } from 'twilio';
import { SheetClient } from 'google-spreadsheet';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const TWILIO_ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID';
const TWILIO_AUTH_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [sheetData, setSheetData] = useState([]);

  const onGoogleLoginSuccess = (response) => {
    setIsAuthenticated(true);
    setUserInfo(response.profileObj);
  };

  const onGoogleLoginFailure = (response) => {
    console.error(response);
  };

  const onGoogleLogoutSuccess = (response) => {
    setIsAuthenticated(false);
    setUserInfo({});
  };

  const fetchSheetData = async () => {
    const sheetClient = new SheetClient({
      credentials: userInfo.accessToken,
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheet = await sheetClient.getSheetByIndex(0);
    const rows = await sheet.getRows();
    setSheetData(rows);
  };

  const sendSms = async (to, message) => {
    const client = new TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      to,
      from: 'YOUR_TWILIO_PHONE_NUMBER',
      body: message,
    });
  };

  return (
    <div>
      {isAuthenticated ? (
        <GoogleLogout
          clientId={GOOGLE_CLIENT_ID}
          onLogoutSuccess={onGoogleLogoutSuccess}
        />
      ) : (
        <GoogleLogin
          clientId={GOOGLE_CLIENT_ID}
          onSuccess={onGoogleLoginSuccess}
          onFailure={onGoogleLoginFailure}
          isSignedIn
        />
      )}
      {isAuthenticated && (
        <>
          <button onClick={fetchSheetData}>Fetch Data</button>
          {sheetData.map((row) => (
            <div key={row.id}>
              <p>
                {row.name}: {row.phoneNumber}
              </p>
              <button onClick={() => sendSms(row.phoneNumber, 'Hello!')}>
                Send SMS
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
